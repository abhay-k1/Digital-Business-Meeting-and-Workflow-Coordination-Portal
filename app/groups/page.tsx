"use client";

import { useState, useEffect } from "react";
import { getSession } from "../lib/auth";
import FrameComponent from "../../components/frame-component";
import FrameComponent3 from "../../components/frame-component3";
import Heading from "../../components/heading";

interface GroupMember {
  id: string;
  name: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  code: string;
  managerId: string;
  members: GroupMember[];
}

export default function GroupsPage() {
  const [session, setSession] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [groupError, setGroupError] = useState("");
  const [groupSuccess, setGroupSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");

  useEffect(() => {
    const user = getSession();
    if (!user) {
      const currentQuery = typeof window !== "undefined" ? window.location.search : "";
      window.location.href = `/login?redirect=${encodeURIComponent("/groups" + currentQuery)}`;
      return;
    }
    setSession(user);

    // Retrieve potential redirection path
    let targetRedirect = "/dashboard";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const red = params.get("redirect");
      if (red) {
        targetRedirect = red;
      }
    }
    setRedirectUrl(targetRedirect);

    fetchGroups(user.id);
  }, []);

  const fetchGroups = async (userId: string) => {
    try {
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (groupId: string) => {
    localStorage.setItem("active_group_id", groupId);
    window.location.href = redirectUrl;
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !session) return;

    setGroupError("");
    setGroupSuccess("");
    setActionLoading(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify({ name: newGroupName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create group");

      setGroupSuccess(`Group "${data.group.name}" created successfully! Invite Code: ${data.group.code}`);
      setNewGroupName("");
      
      // Select the newly created group and redirect
      localStorage.setItem("active_group_id", data.group.id);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setGroupError(err.message || "Something went wrong");
      setActionLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !session) return;

    setGroupError("");
    setGroupSuccess("");
    setActionLoading(true);

    try {
      const res = await fetch("/api/groups", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join group");

      setGroupSuccess(`Successfully joined group "${data.group.name}"!`);
      setInviteCode("");
      
      // Select the joined group and redirect
      localStorage.setItem("active_group_id", data.group.id);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setGroupError(err.message || "Something went wrong");
      setActionLoading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 font-['Space_Grotesk'] text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#5F8D9E] rounded-full animate-spin"></div>
          <span className="text-xl font-medium tracking-wide">Loading groups...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative bg-slate-50/50 overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      <main className="self-stretch flex flex-col gap-12 px-16 box-border max-w-full mq800:px-6">
        {session && (
          <div className="text-[34px] font-extrabold tracking-tight text-slate-800 font-['Space_Grotesk'] mb-[-16px] mt-2 animate-fade-in flex flex-wrap gap-x-2 items-center">
            <span>Hello</span>
            <span className="text-[#097C87] relative z-10 px-1">
              {session.name.split(" ")[0]}
              <span className="absolute inset-x-0 bottom-1 h-3 bg-[#23CED9]/25 -z-10 rounded"></span>
            </span>
            <span className="text-slate-500 font-medium">, How u doing? 👋</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Heading
            label="Choose Team"
            label1="Workspace"
            showLabel={true}
          />
          <p className="m-0 text-lg text-slate-600 font-['DM_Sans'] max-w-3xl mt-1">
            Select an existing group to enter your dashboard, or create/join a new team workspace.
          </p>
        </div>

        {(groupError || groupSuccess) && (
          <div className="w-full flex flex-col gap-3">
            {groupError && (
              <div className="bg-red-50 text-red-700 px-5 py-3.5 rounded-xl border border-solid border-red-100 text-sm font-medium">
                ⚠️ {groupError}
              </div>
            )}
            {groupSuccess && (
              <div className="bg-emerald-50 text-emerald-800 px-5 py-3.5 rounded-xl border border-solid border-emerald-200 text-sm font-medium">
                ✅ {groupSuccess}
              </div>
            )}
          </div>
        )}

        <div className="w-full flex items-start gap-12 mq1125:flex-col">
          {/* Left Side: Groups List */}
          <div className="w-[50%] flex flex-col gap-6 mq1125:w-full">
            <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight">
              Your Active Groups ({groups.length})
            </h2>

            {groups.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 font-['DM_Sans'] bg-white shadow-sm">
                You haven&apos;t created or joined any collaboration groups yet. Get started on the right!
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                {groups.map((group) => {
                  const isGroupManager = group.managerId === session.id;
                  return (
                    <div
                      key={group.id}
                      className="shadow-[0_4px_20px_-4px_rgba(95,141,158,0.06)] rounded-2xl bg-white border-l-4 border-l-[#5F8D9E] border-y border-r border-solid border-slate-200/80 p-6 flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer"
                      onClick={() => handleSelectGroup(group.id)}
                    >
                      <div className="flex flex-col gap-2.5 min-w-0">
                        <h3 className="m-0 text-xl font-bold text-slate-900 truncate font-['Space_Grotesk']">
                          {group.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-['DM_Sans']">
                          <span>👑 Manager: <strong className="text-slate-700 font-medium">{isGroupManager ? "You" : group.members.find(m => m.id === group.managerId)?.name || "Unknown"}</strong></span>
                          <span>👥 Members: <strong className="text-slate-700 font-medium">{group.members.length}</strong></span>
                        </div>
                        <span className="inline-block text-xs bg-[#5F8D9E]/10 border border-solid border-[#5F8D9E]/20 text-[#5F8D9E] px-2.5 py-1 rounded-md w-fit font-bold font-mono tracking-wider">
                          CODE: {group.code}
                        </span>
                      </div>
                      <button
                        className="cursor-pointer border-none bg-[#5F8D9E] hover:bg-[#7CA7B8] text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:shadow transition-all duration-200 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectGroup(group.id);
                        }}
                      >
                        Enter &rarr;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Create or Join Actions */}
          <div className="w-[50%] flex flex-col gap-8 mq1125:w-full">
            {/* Create Group Form */}
            <div className="shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 p-8 flex flex-col gap-4">
              <h3 className="m-0 text-xl font-bold text-slate-900 tracking-tight">Create a Group (Manager)</h3>
              <p className="m-0 text-sm text-slate-500 font-['DM_Sans'] leading-relaxed">
                Set up a private group. As the manager, you will be able to schedule meetings, generate invite codes, and allocate tasks to employee members.
              </p>
              <form onSubmit={handleCreateGroup} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Group Workspace Name</label>
                  <input
                    type="text"
                    required
                    disabled={actionLoading}
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Quality Assurance, Engineering"
                    className="bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#5F8D9E] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="cursor-pointer border-none py-3.5 px-6 bg-[#5F8D9E] hover:bg-[#7CA7B8] text-white font-bold rounded-xl hover:shadow transition-all duration-200 disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create Group & Enter"}
                </button>
              </form>
            </div>

            {/* Join Group Form */}
            <div className="shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 p-8 flex flex-col gap-4">
              <h3 className="m-0 text-xl font-bold text-slate-900 tracking-tight">Join a Group (Employee)</h3>
              <p className="m-0 text-sm text-slate-500 font-['DM_Sans'] leading-relaxed">
                Enter the unique 8-character invite code provided by your manager to join the team, view meetings, and perform assigned tasks.
              </p>
              <form onSubmit={handleJoinGroup} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Invite Code</label>
                  <input
                    type="text"
                    required
                    disabled={actionLoading}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="e.g. GRP-4819"
                    className="bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#5F8D9E] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="cursor-pointer border border-solid border-slate-200 py-3.5 px-6 bg-white hover:bg-slate-50 text-slate-750 font-bold rounded-xl hover:shadow transition-all duration-200 disabled:opacity-50"
                >
                  {actionLoading ? "Joining..." : "Join Group & Enter"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <FrameComponent3 />
    </div>
  );
}
