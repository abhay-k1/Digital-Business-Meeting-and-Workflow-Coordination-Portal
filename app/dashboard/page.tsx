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
      window.location.href = "/login";
      return;
    }
    setSession(user);

    const savedGroupId = localStorage.getItem("active_group_id");
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
      <div className="w-full min-h-screen flex items-center justify-center bg-white font-['Space_Grotesk'] text-2xl font-bold">
        Accessing Workspace Dashboard...
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
    <div className="w-full min-h-screen relative bg-[#fff] overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      {!activeGroupId || !activeGroup ? (
        /* GROUPS SELECTOR DASHBOARD SCREEN */
        <main className="self-stretch flex flex-col gap-12 px-16 box-border max-w-full mq800:px-6">
          <div className="flex flex-col gap-2">
            <Heading
              property1="Green"
              label="Choose Team"
              labelWidth="unset"
              labelHeight="unset"
              label1="Workspace"
              showLabel={true}
              labelWidth1="unset"
              labelHeight1="unset"
              label2="Label"
              labelVisible={false}
            />
            <p className="m-0 text-xl text-[#555] font-['DM_Sans']">
              Select an existing group to view allocated tasks and meetings, or create a new team workspace.
            </p>
          </div>

          {(groupError || groupSuccess) && (
            <div className="w-full flex flex-col gap-3">
              {groupError && (
                <div className="bg-red-50 text-red-600 px-5 py-3.5 rounded-[14px] border border-solid border-red-200 text-sm font-medium">
                  ⚠️ {groupError}
                </div>
              )}
              {groupSuccess && (
                <div className="bg-blue-50 text-blue-700 px-5 py-3.5 rounded-[14px] border border-solid border-blue-200 text-sm font-medium">
                  ✅ {groupSuccess}
                </div>
              )}
            </div>
          )}

          <div className="w-full flex items-start gap-12 mq1125:flex-col">
            {/* Left Side: Groups List */}
            <div className="w-[50%] flex flex-col gap-6 mq1125:w-full">
              <h2 className="m-0 text-3xl font-medium text-grays-black">
                Your Active Groups ({groups.length})
              </h2>

              {groups.length === 0 ? (
                <div className="w-full rounded-[30px] border border-dashed border-[#ccc] p-12 text-center text-[#888] font-['DM_Sans'] bg-[#fafafa]">
                  You haven&apos;t created or joined any collaboration groups yet. Get started on the right!
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {groups.map((group) => {
                    const isGroupManager = group.managerId === session.id;
                    return (
                      <div
                        key={group.id}
                        className="shadow-[0px_5px_0px_#0f172a] rounded-[30px] bg-white hover:bg-grey border-dark border-solid border-[1px] p-6 flex items-center justify-between gap-4 transition duration-200 cursor-pointer"
                        onClick={() => handleSelectGroup(group)}
                      >
                        <div className="flex flex-col gap-2 min-w-0">
                          <h3 className="m-0 text-2xl font-bold text-grays-black truncate">
                            {group.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#555] font-['DM_Sans']">
                            <span>👑 Manager: <strong>{isGroupManager ? "You" : group.members.find(m => m.id === group.managerId)?.name || "Unknown"}</strong></span>
                            <span>👥 Members: <strong>{group.members.length}</strong></span>
                          </div>
                          <span className="inline-block text-xs bg-slate-100 border border-solid border-slate-200 text-slate-700 px-2.5 py-1 rounded-[6px] w-fit font-bold font-mono">
                            CODE: {group.code}
                          </span>
                        </div>
                        <button
                          className="cursor-pointer border-none bg-green hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-bold shadow-[0px_2px_0px_#0f172a] transition duration-200 shrink-0"
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
              <div className="shadow-[0px_5px_0px_#0f172a] rounded-[45px] bg-[#f8fafc] border-dark border-solid border-[1px] p-8 flex flex-col gap-4">
                <h3 className="m-0 text-2xl font-bold text-grays-black">Create a Group (Manager)</h3>
                <p className="m-0 text-sm text-[#555] font-['DM_Sans'] leading-5">
                  Set up a private group. As the manager, you will be able to schedule meetings, generate invite codes, and allocate tasks to employee members.
                </p>
                <form onSubmit={handleCreateGroup} className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-grays-black">Group Workspace Name</label>
                    <input
                      type="text"
                      required
                      disabled={actionLoading}
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Quality Assurance, Engineering"
                      className="bg-white border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-[#aaa] focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="cursor-pointer border-none py-3.5 px-6 bg-dark hover:bg-green text-white font-bold rounded-[14px] shadow-[0px_2.5px_0px_#000] transition duration-200 disabled:opacity-50"
                  >
                    {actionLoading ? "Creating..." : "Create Group & Enter"}
                  </button>
                </form>
              </div>

              {/* Join Group Form */}
              <div className="shadow-[0px_5px_0px_#0f172a] rounded-[45px] bg-[#f8fafc] border-dark border-solid border-[1px] p-8 flex flex-col gap-4">
                <h3 className="m-0 text-2xl font-bold text-grays-black">Join a Group (Employee)</h3>
                <p className="m-0 text-sm text-[#555] font-['DM_Sans'] leading-5">
                  Enter the unique 8-character invite code provided by your manager to join the team, view meetings, and perform assigned tasks.
                </p>
                <form onSubmit={handleJoinGroup} className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-grays-black">Invite Code</label>
                    <input
                      type="text"
                      required
                      disabled={actionLoading}
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="e.g. GRP-4819"
                      className="bg-white border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black placeholder:text-[#aaa] focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="cursor-pointer border-dark border-solid border-[1px] py-3.5 px-6 bg-white hover:bg-grey text-grays-black font-bold rounded-[14px] shadow-[0px_2.5px_0px_#0f172a] transition duration-200 disabled:opacity-50"
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
          <div className="w-full flex justify-between items-center bg-[#f8fafc] border border-solid border-slate-200 p-6 rounded-[24px] shadow-[0px_3px_0px_#0f172a] flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-[#777] font-bold">Active Workspace</span>
              <h2 className="m-0 text-3xl font-extrabold text-grays-black flex items-center gap-3">
                🏢 {activeGroup.name}
              </h2>
              <div className="flex items-center gap-4 text-sm text-[#555] font-['DM_Sans'] mt-1">
                <span>Invite Code: <strong className="font-mono bg-slate-200 px-2 py-0.5 rounded text-grays-black font-bold">{activeGroup.code}</strong></span>
                <span>Role: <strong>{isManager ? "Manager (Creator)" : "Employee / Member"}</strong></span>
              </div>
            </div>
            <button
              onClick={handleSwitchGroup}
              className="cursor-pointer border-dark border-solid border-[1px] bg-white hover:bg-slate-100 text-grays-black font-bold rounded-[14px] px-6 py-3.5 text-base shadow-[0px_2.5px_0px_#0f172a] transition duration-200"
            >
              Switch Group
            </button>
          </div>

          {/* Welcome and Nav header */}
          <div className="flex items-center justify-between gap-10 max-w-full flex-wrap">
            <div className="flex items-center gap-10 max-w-full mq800:flex-wrap">
              <Heading
                property1="Green"
                label="Team"
                labelWidth="unset"
                labelHeight="unset"
                label1="Dashboard"
                showLabel={true}
                labelWidth1="unset"
                labelHeight1="unset"
                label2="Label"
                labelVisible={false}
              />
              <h2 className="m-0 text-3xl font-medium text-grays-black font-['Space_Grotesk']">
                Welcome back, <span className="font-extrabold text-white bg-dark px-3.5 py-1 rounded-[10px]">{session.name}</span>
              </h2>
            </div>

            <div className="flex gap-4">
              {isManager && (
                <>
                  <a
                    href="/meetings"
                    className="cursor-pointer border-none bg-dark text-white rounded-[14px] px-6 py-4 font-bold text-base hover:bg-green hover:text-white transition duration-200 shadow-[0px_3px_0px_#000]"
                  >
                    Schedule Meeting
                  </a>
                  <a
                    href="/tasks"
                    className="cursor-pointer border-dark border-solid border-[1px] bg-green text-white rounded-[14px] px-6 py-4 font-bold text-base hover:bg-[#fff] hover:text-grays-black transition duration-200 shadow-[0px_3px_0px_#0f172a]"
                  >
                    Allocate Task
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Analytics Summary Cards */}
          <section className="grid grid-cols-4 gap-6 w-full mq1125:grid-cols-2 mq800:grid-cols-1">
            <div className="shadow-[0px_5px_0px_#0f172a] rounded-[30px] bg-[#f8fafc] border-dark border-solid border-[1px] p-8 flex flex-col gap-2">
              <span className="text-lg font-medium text-[#555] font-['DM_Sans']">Upcoming Meetings</span>
              <span className="text-6xl font-extrabold text-grays-black">{upcomingMeetings.length}</span>
              <span className="text-sm font-['DM_Sans'] text-[#777]">Total scheduled: {meetings.length}</span>
            </div>

            <div className="shadow-[0px_5px_0px_#0f172a] rounded-[30px] bg-green text-white border-dark border-solid border-[1px] p-8 flex flex-col gap-2">
              <span className="text-lg font-medium text-white/90 font-['DM_Sans']">Pending Tasks</span>
              <span className="text-6xl font-extrabold text-white">{pendingTasks.length}</span>
              <span className="text-sm font-['DM_Sans'] text-white/80">Completed tasks: {completedTasksCount}</span>
            </div>

            <div className="shadow-[0px_5px_0px_#0f172a] rounded-[30px] bg-[#f8fafc] border-dark border-solid border-[1px] p-8 flex flex-col gap-2">
              <span className="text-lg font-medium text-[#555] font-['DM_Sans']">Critical Hotspots</span>
              <span className="text-6xl font-extrabold text-red-600">{highPriorityTasksCount}</span>
              <span className="text-sm font-['DM_Sans'] text-[#777]">High priority pending tasks</span>
            </div>

            <div className="shadow-[0px_5px_0px_#0f172a] rounded-[30px] bg-dark border-dark border-solid border-[1px] p-8 flex flex-col gap-2 text-white">
              <span className="text-lg font-medium text-[#ccc] font-['DM_Sans']">Completion Rate</span>
              <span className="text-6xl font-extrabold text-green">
                {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%
              </span>
              <span className="text-sm font-['DM_Sans'] text-[#aaa]">Based on allocated workloads</span>
            </div>
          </section>

          {/* Dynamic Split Listings (Meetings on Left, Tasks on Right) */}
          <section className="w-full flex gap-10 items-start mq1125:flex-col">
            {/* Upcoming Meetings Panel */}
            <div className="w-[50%] flex flex-col gap-6 mq1125:w-full">
              <div className="flex justify-between items-center">
                <h3 className="m-0 text-3xl font-medium text-grays-black">Upcoming Team Syncs</h3>
                {isManager && (
                  <a href="/meetings" className="text-base text-grays-black font-bold underline hover:text-green">
                    Manage Meetings &rarr;
                  </a>
                )}
              </div>

              {upcomingMeetings.length === 0 ? (
                <div className="rounded-[30px] border border-dashed border-[#ccc] p-12 text-center text-[#888] font-['DM_Sans'] bg-[#fafafa]">
                  No upcoming meetings scheduled for this group.
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="shadow-[0px_3px_0px_#0f172a] rounded-[24px] bg-[#fff] border-dark border-solid border-[1px] p-6 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="m-0 text-xl font-bold text-grays-black">{meeting.title}</h4>
                        <span className="text-xs bg-green text-white px-2.5 py-1 rounded-[8px] font-bold border border-solid border-green">
                          {meeting.time}
                        </span>
                      </div>
                      <p className="m-0 text-base text-[#555] font-['DM_Sans'] line-clamp-2">
                        {meeting.agenda}
                      </p>
                      <div className="text-sm text-[#777] font-['DM_Sans'] border-t border-solid border-[#eee] pt-2 flex justify-between">
                        <span>👤 {meeting.participants.split(",")[0]} {meeting.participants.split(",").length > 1 ? `+${meeting.participants.split(",").length - 1} more` : ""}</span>
                        <span className="font-bold text-grays-black">📅 {meeting.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Tasks Panel */}
            <div className="w-[50%] flex flex-col gap-6 mq1125:w-full">
              <div className="flex justify-between items-center">
                <h3 className="m-0 text-3xl font-medium text-grays-black">
                  {isManager ? "Active Group Workloads" : "Your Assigned Workloads"}
                </h3>
                <a href="/tasks" className="text-base text-grays-black font-bold underline hover:text-green">
                  {isManager ? "Manage Tasks &rarr;" : "View Task List &rarr;"}
                </a>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="rounded-[30px] border border-dashed border-[#ccc] p-12 text-center text-[#888] font-['DM_Sans'] bg-[#fafafa]">
                  No pending workloads. All syncs completed!
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="shadow-[0px_3px_0px_#0f172a] rounded-[24px] bg-[#fff] border-dark border-solid border-[1px] p-6 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="m-0 text-xl font-bold text-grays-black">{task.title}</h4>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-[8px] font-bold border border-solid ${
                            task.priority === "High"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : task.priority === "Medium"
                              ? "bg-orange-50 text-orange-600 border-orange-200"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="m-0 text-base text-[#555] font-['DM_Sans'] line-clamp-2">
                        {task.description}
                      </p>
                      <div className="text-sm text-[#777] font-['DM_Sans'] border-t border-solid border-[#eee] pt-2 flex justify-between items-center">
                        <span>👤 {task.assignedMember}</span>
                        <span className={`font-bold px-2 py-0.5 rounded-[6px] text-xs ${
                          task.status === "In Progress" ? "bg-blue-50 text-[#2563eb]" : "bg-grey text-grays-black"
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
