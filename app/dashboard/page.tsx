"use client";

import { useState, useEffect } from "react";
import { getSession } from "../lib/auth";
import FrameComponent from "../../components/frame-component";
import FrameComponent3 from "../../components/frame-component3";
import Heading from "../../components/heading";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  agenda: string;
  participants: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedMember: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
}

interface Group {
  id: string;
  name: string;
  code: string;
  managerId: string;
  members: Array<{ id: string; name: string; email: string }>;
}

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Group states
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);

  // Form states
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [groupError, setGroupError] = useState("");
  const [groupSuccess, setGroupSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const user = getSession();
    if (!user) {
      const currentQuery = typeof window !== "undefined" ? window.location.search : "";
      window.location.href = `/login?redirect=${encodeURIComponent("/dashboard" + currentQuery)}`;
      return;
    }
    setSession(user);

    const savedGroupId = localStorage.getItem("active_group_id");
    
    // If user already has an active workspace group selected AND has a pending redirect URL, send them straight there.
    if (savedGroupId) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const red = params.get("redirect");
        if (red) {
          window.location.href = red;
          return;
        }
      }
    }

    setActiveGroupId(savedGroupId);

    fetchGroups(user.id, savedGroupId);
  }, []);

  const fetchGroups = async (userId: string, currentGroupId: string | null) => {
    try {
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        const userGroups: Group[] = data.groups || [];
        setGroups(userGroups);

        if (currentGroupId) {
          const matched = userGroups.find((g) => g.id === currentGroupId);
          if (matched) {
            setActiveGroup(matched);
            await fetchWorkspaceData(userId, currentGroupId);
            return;
          }
        }
      }
      // If group doesn't exist anymore or no active group is selected
      localStorage.removeItem("active_group_id");
      setActiveGroupId(null);
      setActiveGroup(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setLoading(false);
    }
  };

  const fetchWorkspaceData = async (userId: string, groupId: string) => {
    try {
      setLoading(true);
      const [meetingsRes, tasksRes] = await Promise.all([
        fetch(`/api/meetings?userId=${userId}&groupId=${groupId}`),
        fetch(`/api/tasks?userId=${userId}&groupId=${groupId}`),
      ]);

      const meetingsData = await meetingsRes.json();
      const tasksData = await tasksRes.json();

      if (meetingsRes.ok) setMeetings(meetingsData.meetings || []);
      if (tasksRes.ok) setTasks(tasksData.tasks || []);
    } catch (err) {
      console.error("Error fetching workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (group: Group) => {
    localStorage.setItem("active_group_id", group.id);
    setActiveGroupId(group.id);
    setActiveGroup(group);
    
    // Forward user if a redirect target is queued in the query parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const red = params.get("redirect");
      if (red) {
        window.location.href = red;
        return;
      }
    }

    setLoading(true);
    if (session) {
      fetchWorkspaceData(session.id, group.id);
    }
  };

  const handleSwitchGroup = () => {
    localStorage.removeItem("active_group_id");
    setActiveGroupId(null);
    setActiveGroup(null);
    setMeetings([]);
    setTasks([]);
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
      
      // Select the newly created group
      handleSelectGroup(data.group);
      
      // Refresh groups list
      fetchGroups(session.id, data.group.id);
    } catch (err: any) {
      setGroupError(err.message || "Something went wrong");
    } finally {
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
      
      // Select the joined group
      handleSelectGroup(data.group);
      
      // Refresh groups list
      fetchGroups(session.id, data.group.id);
    } catch (err: any) {
      setGroupError(err.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 font-['Space_Grotesk'] text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#097C87] rounded-full animate-spin"></div>
          <span className="text-xl font-medium tracking-wide">Accessing Workspace Dashboard...</span>
        </div>
      </div>
    );
  }

  // Active group selected view calculations
  const upcomingMeetings = meetings.filter((m) => m.status === "Upcoming");
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const highPriorityTasksCount = tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length;
  const isManager = activeGroup ? activeGroup.managerId === session.id : false;

  return (
    <div className="w-full min-h-screen relative bg-slate-50/50 overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      {!activeGroupId || !activeGroup ? (
        /* GROUPS SELECTOR DASHBOARD SCREEN */
        <main className="self-stretch flex flex-col gap-12 px-16 box-border max-w-full mq800:px-6">
          <div className="flex flex-col gap-2">
            <Heading
              label="Choose Team"
              label1="Workspace"
              showLabel={true}
            />
            <p className="m-0 text-lg text-slate-600 font-['DM_Sans'] max-w-3xl mt-1">
              Select an existing group to view allocated tasks and meetings, or create a new team workspace.
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
                <div className="w-full rounded-2xl border border-dashed border-slate-350 p-12 text-center text-slate-500 font-['DM_Sans'] bg-white shadow-sm">
                  You haven&apos;t created or joined any collaboration groups yet. Get started on the right!
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {groups.map((group) => {
                    const isGroupManager = group.managerId === session.id;
                    return (
                      <div
                        key={group.id}
                        className="shadow-[0_4px_20px_-4px_rgba(9,124,135,0.06)] rounded-2xl bg-white border-l-4 border-l-[#097C87] border-y border-r border-solid border-slate-200/80 p-6 flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer"
                        onClick={() => handleSelectGroup(group)}
                      >
                        <div className="flex flex-col gap-2.5 min-w-0">
                          <h3 className="m-0 text-xl font-bold text-slate-900 truncate font-['Space_Grotesk']">
                            {group.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-['DM_Sans']">
                            <span>👑 Manager: <strong className="text-slate-700 font-medium">{isGroupManager ? "You" : group.members.find(m => m.id === group.managerId)?.name || "Unknown"}</strong></span>
                            <span>👥 Members: <strong className="text-slate-700 font-medium">{group.members.length}</strong></span>
                          </div>
                          <span className="inline-block text-xs bg-[#23CED9]/10 border border-solid border-[#23CED9]/20 text-[#097C87] px-2.5 py-1 rounded-md w-fit font-bold font-mono tracking-wider">
                            CODE: {group.code}
                          </span>
                        </div>
                        <button
                          className="cursor-pointer border-none bg-[#097C87] hover:bg-[#23CED9] text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:shadow transition-all duration-200 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectGroup(group);
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
                      className="bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#097C87] transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="cursor-pointer border-none py-3.5 px-6 bg-[#097C87] hover:bg-[#23CED9] text-white font-bold rounded-xl hover:shadow transition-all duration-200 disabled:opacity-50"
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
                      className="bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#097C87] transition"
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
      ) : (
        /* ACTIVE GROUP WORKSPACE DASHBOARD SCREEN */
        <main className="self-stretch flex flex-col gap-12 px-16 box-border max-w-full mq800:px-6">
          {/* Active Group Header */}
          <div className="w-full flex justify-between items-center bg-white border-l-4 border-l-[#097C87] border-y border-r border-solid border-slate-200 p-6 rounded-2xl shadow-[0_4px_25px_-5px_rgba(9,124,135,0.05)] flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Active Workspace</span>
              <h2 className="m-0 text-2xl font-bold text-slate-900 flex items-center gap-3 font-['Space_Grotesk']">
                🏢 {activeGroup.name}
              </h2>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-['DM_Sans'] mt-1">
                <span>Invite Code: <strong className="font-mono bg-[#23CED9]/10 border border-solid border-[#23CED9]/20 px-2.5 py-0.5 rounded text-[#097C87] font-bold">{activeGroup.code}</strong></span>
                <span>Role: <strong className="text-slate-700 font-medium">{isManager ? "Manager (Creator)" : "Employee / Member"}</strong></span>
              </div>
            </div>
            <button
              onClick={handleSwitchGroup}
              className="cursor-pointer border border-solid border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl px-5 py-3 text-sm hover:shadow transition-all duration-200"
            >
              Switch Group
            </button>
          </div>

          {/* Welcome and Nav header */}
          <div className="flex items-center justify-between gap-10 max-w-full flex-wrap">
            <div className="flex items-center gap-10 max-w-full mq800:flex-wrap">
              <Heading
                label="Team"
                label1="Dashboard"
                showLabel={true}
              />
              <h2 className="m-0 text-2xl font-medium text-slate-900 font-['Space_Grotesk']">
                Welcome back, <span className="font-bold text-slate-800 bg-[#23CED9]/10 border border-solid border-[#23CED9]/20 px-3.5 py-1 rounded-lg">{session.name}</span>
              </h2>
            </div>

            <div className="flex gap-4">
              {isManager && (
                <>
                  <a
                    href="/meetings"
                    className="cursor-pointer border-none bg-[#097C87] hover:bg-[#23CED9] text-white rounded-xl px-6 py-3.5 font-bold text-base transition duration-200 shadow-sm hover:shadow"
                  >
                    Schedule Meeting
                  </a>
                  <a
                    href="/tasks"
                    className="cursor-pointer border border-solid border-[#097C87]/30 bg-white text-[#097C87] hover:bg-[#097C87]/5 rounded-xl px-6 py-3.5 font-bold text-base transition duration-200 shadow-sm hover:shadow"
                  >
                    Allocate Task
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Analytics Summary Cards (Integrates Custom Colors) */}
          <section className="grid grid-cols-4 gap-6 w-full mq1125:grid-cols-2 mq800:grid-cols-1">
            <div className="shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-350 transition-all duration-300">
              <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Upcoming Meetings</span>
              <span className="text-5xl font-bold text-[#097C87] tracking-tight">{upcomingMeetings.length}</span>
              <span className="text-xs font-['DM_Sans'] text-slate-400">Total scheduled: {meetings.length}</span>
            </div>

            <div className="shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-350 transition-all duration-300">
              <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Pending Tasks</span>
              <span className="text-5xl font-bold text-slate-700 tracking-tight">{pendingTasks.length}</span>
              <span className="text-xs font-['DM_Sans'] text-slate-400">Completed tasks: {completedTasksCount}</span>
            </div>

            <div className="shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-350 transition-all duration-300">
              <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Critical Hotspots</span>
              <span className="text-5xl font-bold text-red-650 tracking-tight">{highPriorityTasksCount}</span>
              <span className="text-xs font-['DM_Sans'] text-slate-400">High priority pending tasks</span>
            </div>

            {/* Glowing Gradient Completion card */}
            <div className="shadow-[0_8px_30px_rgba(9,124,135,0.08)] rounded-2xl bg-gradient-to-br from-[#097C87] to-[#23CED9] p-8 flex flex-col gap-2 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              <span className="text-sm font-semibold text-white/90 font-['DM_Sans']">Completion Rate</span>
              <span className="text-5xl font-bold text-white tracking-tight">
                {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%
              </span>
              <span className="text-xs font-['DM_Sans'] text-white/80">Based on allocated workloads</span>
            </div>
          </section>

          {/* Dynamic Split Listings (Meetings on Left, Tasks on Right) */}
          <section className="w-full flex gap-10 items-start mq1125:flex-col">
            {/* Upcoming Meetings Panel */}
            <div className="w-[50%] flex flex-col gap-6 mq1125:w-full">
              <div className="flex justify-between items-center">
                <h3 className="m-0 text-xl font-bold text-slate-900 tracking-tight">Upcoming Team Syncs</h3>
                {isManager && (
                  <a href="/meetings" className="text-sm text-[#097C87] font-bold hover:text-[#23CED9] transition-colors no-underline">
                    Manage Meetings &rarr;
                  </a>
                )}
              </div>

              {upcomingMeetings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 font-['DM_Sans'] bg-white shadow-sm">
                  No upcoming meetings scheduled for this group.
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="shadow-[0_4px_15px_-3px_rgba(15,23,42,0.04)] rounded-xl bg-white border border-solid border-slate-200/80 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="m-0 text-lg font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">{meeting.title}</h4>
                        <span className="text-xs bg-[#23CED9]/10 border border-solid border-[#23CED9]/20 text-[#097C87] px-2.5 py-1 rounded-md font-bold font-mono">
                          {meeting.time}
                        </span>
                      </div>
                      <p className="m-0 text-sm text-slate-500 font-['DM_Sans'] line-clamp-2 leading-relaxed">
                        {meeting.agenda}
                      </p>
                      <div className="text-xs text-slate-400 font-['DM_Sans'] border-t border-solid border-slate-100 pt-2 flex justify-between">
                        <span>👤 {meeting.participants.split(",")[0]} {meeting.participants.split(",").length > 1 ? `+${meeting.participants.split(",").length - 1} more` : ""}</span>
                        <span className="font-semibold text-slate-700">📅 {meeting.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Tasks Panel */}
            <div className="w-[50%] flex flex-col gap-6 mq1125:w-full">
              <div className="flex justify-between items-center">
                <h3 className="m-0 text-xl font-bold text-slate-900 tracking-tight">
                  {isManager ? "Active Group Workloads" : "Your Assigned Workloads"}
                </h3>
                <a href="/tasks" className="text-sm text-[#097C87] font-bold hover:text-[#23CED9] transition-colors no-underline">
                  {isManager ? "Manage Tasks &rarr;" : "View Task List &rarr;"}
                </a>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 font-['DM_Sans'] bg-white shadow-sm">
                  No pending workloads. All syncs completed!
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="shadow-[0_4px_15px_-3px_rgba(15,23,42,0.04)] rounded-xl bg-white border border-solid border-slate-200/80 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="m-0 text-lg font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">{task.title}</h4>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold border border-solid ${
                            task.priority === "High"
                              ? "bg-red-50 text-red-650 border-red-100"
                              : task.priority === "Medium"
                              ? "bg-orange-50 text-orange-600 border-orange-100"
                              : "bg-[#A1CCA6]/15 text-[#097C87] border-[#A1CCA6]/30"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="m-0 text-sm text-slate-500 font-['DM_Sans'] line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                      <div className="text-xs text-slate-400 font-['DM_Sans'] border-t border-solid border-slate-100 pt-2 flex justify-between items-center">
                        <span>👤 {task.assignedMember}</span>
                        <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                          task.status === "In Progress" ? "bg-[#23CED9]/10 text-[#097C87] border border-solid border-[#23CED9]/20" : "bg-slate-50 text-slate-500 border border-solid border-slate-150"
                        }`}>{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      <FrameComponent3 />
    </div>
  );
}
