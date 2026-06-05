"use client";

import { useState, useEffect, useRef } from "react";
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

  // Chat / Discussion Board states
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Active Group states
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);

  useEffect(() => {
    const user = getSession();
    if (!user) {
      const currentQuery = typeof window !== "undefined" ? window.location.search : "";
      window.location.href = `/login?redirect=${encodeURIComponent("/dashboard" + currentQuery)}`;
      return;
    }
    setSession(user);

    const savedGroupId = localStorage.getItem("active_group_id");
    if (!savedGroupId) {
      const currentQuery = typeof window !== "undefined" ? window.location.search : "";
      window.location.href = `/groups${currentQuery}`;
      return;
    }

    // If user already has an active workspace group selected AND has a pending redirect URL, send them straight there.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const red = params.get("redirect");
      if (red) {
        window.location.href = red;
        return;
      }
    }

    setActiveGroupId(savedGroupId);
    fetchGroupDetails(user.id, savedGroupId);
  }, []);

  const fetchGroupDetails = async (userId: string, groupId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        const userGroups: Group[] = data.groups || [];
        const matched = userGroups.find((g) => g.id === groupId);
        if (matched) {
          setActiveGroup(matched);
          await fetchWorkspaceData(userId, groupId);
          return;
        }
      }
      // If group doesn't exist anymore or user is not a member, clear selection and redirect to groups page
      localStorage.removeItem("active_group_id");
      window.location.href = "/groups";
    } catch (err) {
      console.error("Error fetching group details:", err);
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string, groupId: string) => {
    try {
      const res = await fetch(`/api/messages?userId=${userId}&groupId=${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchWorkspaceData = async (userId: string, groupId: string) => {
    try {
      const [meetingsRes, tasksRes, messagesRes] = await Promise.all([
        fetch(`/api/meetings?userId=${userId}&groupId=${groupId}`),
        fetch(`/api/tasks?userId=${userId}&groupId=${groupId}`),
        fetch(`/api/messages?userId=${userId}&groupId=${groupId}`),
      ]);

      const meetingsData = await meetingsRes.json();
      const tasksData = await tasksRes.json();
      const messagesData = await messagesRes.json();

      if (meetingsRes.ok) setMeetings(meetingsData.meetings || []);
      if (tasksRes.ok) setTasks(tasksData.tasks || []);
      if (messagesRes.ok) setMessages(messagesData.messages || []);
    } catch (err) {
      console.error("Error fetching workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || !activeGroupId) return;

    const interval = setInterval(() => {
      fetchMessages(session.id, activeGroupId);
    }, 3000);

    return () => clearInterval(interval);
  }, [session, activeGroupId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !session || !activeGroupId) return;

    const messageText = newMessageText.trim();
    setNewMessageText("");
    setSendingMessage(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify({
          groupId: activeGroupId,
          userName: session.name,
          content: messageText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        console.error("Failed to send message:", data.error);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading || !session || !activeGroup) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 font-['Space_Grotesk'] text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#5F8D9E] rounded-full animate-spin"></div>
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
  const isManager = activeGroup.managerId === session.id;

  return (
    <div className="w-full min-h-screen relative bg-slate-50/50 overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      {/* ACTIVE GROUP WORKSPACE DASHBOARD SCREEN */}
      <main className="self-stretch flex flex-col gap-12 px-16 box-border max-w-full mq800:px-6">
        {/* Active Group Header */}
        <div className="w-full flex justify-between items-center bg-white border-l-4 border-l-[#5F8D9E] border-y border-r border-solid border-slate-200 p-6 rounded-2xl shadow-[0_4px_25px_-5px_rgba(95,141,158,0.05)] flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Active Workspace</span>
            <h2 className="m-0 text-2xl font-bold text-slate-900 flex items-center gap-3 font-['Space_Grotesk']">
              🏢 {activeGroup.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-500 font-['DM_Sans'] mt-1">
              <span>Invite Code: <strong className="font-mono bg-[#5F8D9E]/10 border border-solid border-[#5F8D9E]/20 px-2.5 py-0.5 rounded text-[#5F8D9E] font-bold">{activeGroup.code}</strong></span>
              <span>Role: <strong className="text-slate-700 font-medium">{isManager ? "Manager (Creator)" : "Employee / Member"}</strong></span>
            </div>
          </div>
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
                  className="cursor-pointer border-none bg-[#5F8D9E] hover:bg-[#7CA7B8] text-white rounded-xl px-6 py-3.5 font-bold text-base transition duration-200 shadow-sm hover:shadow"
                >
                  Schedule Meeting
                </a>
                <a
                  href="/tasks"
                  className="cursor-pointer border border-solid border-[#5F8D9E]/30 bg-white text-[#5F8D9E] hover:bg-[#5F8D9E]/5 rounded-xl px-6 py-3.5 font-bold text-base transition duration-200 shadow-sm hover:shadow"
                >
                  Allocate Task
                </a>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Analytics Summary Cards (Integrates Custom Colors) */}
        <section className="grid grid-cols-4 gap-6 w-full mq1125:grid-cols-2 mq800:grid-cols-1">
          <div className="shadow-[0_4px_25px_-5px_rgba(95,141,158,0.04)] rounded-2xl bg-white border border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-350 transition-all duration-300">
            <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Upcoming Meetings</span>
            <span className="text-5xl font-bold text-[#5F8D9E] tracking-tight">{upcomingMeetings.length}</span>
            <span className="text-xs font-['DM_Sans'] text-slate-400">Total scheduled: {meetings.length}</span>
          </div>

          <div className="shadow-[0_4px_25px_-5px_rgba(95,141,158,0.04)] rounded-2xl bg-white border border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-350 transition-all duration-300">
            <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Pending Tasks</span>
            <span className="text-5xl font-bold text-slate-700 tracking-tight">{pendingTasks.length}</span>
            <span className="text-xs font-['DM_Sans'] text-slate-400">Completed tasks: {completedTasksCount}</span>
          </div>

          <div className="shadow-[0_4px_25px_-5px_rgba(95,141,158,0.04)] rounded-2xl bg-white border border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-350 transition-all duration-300">
            <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Critical Hotspots</span>
            <span className="text-5xl font-bold text-red-650 tracking-tight">{highPriorityTasksCount}</span>
            <span className="text-xs font-['DM_Sans'] text-slate-400">High priority pending tasks</span>
          </div>

          {/* Glowing Gradient Completion card */}
          <div className="shadow-[0_8px_30px_rgba(95,141,158,0.08)] rounded-2xl bg-gradient-to-br from-[#5F8D9E] to-[#8FB1BD] p-8 flex flex-col gap-2 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
            <span className="text-sm font-semibold text-white/90 font-['DM_Sans']">Main Completion</span>
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
                <a href="/meetings" className="text-sm text-[#5F8D9E] font-bold hover:text-[#7CA7B8] transition-colors no-underline">
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
                      <span className="text-xs bg-[#5F8D9E]/10 border border-solid border-[#5F8D9E]/20 text-[#5F8D9E] px-2.5 py-1 rounded-md font-bold font-mono">
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
              <a href="/tasks" className="text-sm text-[#5F8D9E] font-bold hover:text-[#7CA7B8] transition-colors no-underline">
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
                        task.status === "In Progress" ? "bg-[#5F8D9E]/10 text-[#5F8D9E] border border-solid border-[#5F8D9E]/20" : "bg-slate-50 text-slate-500 border border-solid border-slate-150"
                      }`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Group Discussion Board Section */}
        <section className="w-full flex flex-col gap-6 bg-white border border-solid border-slate-200/80 rounded-2xl p-8 shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] mb-12">
          <div className="flex justify-between items-center border-b border-solid border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="m-0 text-xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
                  Group Discussion Board
                </h3>
                <p className="m-0 text-xs text-slate-500 font-['DM_Sans'] mt-0.5">
                  Real-time collaborative chat for members of <strong>{activeGroup.name}</strong>
                </p>
              </div>
            </div>
            <span className="text-xs bg-[#5F8D9E]/15 border border-solid border-[#5F8D9E]/35 text-[#5F8D9E] px-2.5 py-1 rounded-full font-bold font-mono">
              {messages.length} messages
            </span>
          </div>

          {/* Chat message list area */}
          <div ref={chatContainerRef} className="bg-slate-50/50 rounded-xl p-4 border border-solid border-slate-100 h-[380px] overflow-y-auto flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 font-['DM_Sans'] gap-2">
                <span className="text-3xl">💤</span>
                <span className="text-sm">No messages yet. Send a note to start the discussion!</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.userId === session.id;
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = new Date(msg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                
                const initials = msg.userName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-[80%] ${
                      isMe ? "self-end flex-row-reverse" : "self-start"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isMe ? "bg-[#5F8D9E] text-white" : "bg-[#5F8D9E]/20 text-[#5F8D9E] border border-solid border-[#5F8D9E]/45"
                    }`}>
                      {initials}
                    </div>

                    {/* Message Bubble Container */}
                    <div className="flex flex-col gap-1">
                      {/* Message Header */}
                      <div className={`flex items-center gap-2 text-xs text-slate-400 font-['DM_Sans'] ${
                        isMe ? "justify-end" : "justify-start"
                      }`}>
                        {!isMe && <span className="font-bold text-slate-700">{msg.userName}</span>}
                        <span>{dateStr}, {timeStr}</span>
                      </div>

                      {/* Bubble */}
                      <div className={`rounded-2xl px-4 py-2.5 text-sm font-['DM_Sans'] shadow-sm leading-relaxed ${
                        isMe
                          ? "bg-[#5F8D9E] text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-solid border-slate-200/60 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Message Form */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Type a message to the group..."
              disabled={sendingMessage}
              className="flex-1 bg-white border border-solid border-slate-200 rounded-xl py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#5F8D9E] transition"
            />
            <button
              type="submit"
              disabled={sendingMessage || !newMessageText.trim()}
              className="cursor-pointer border-none py-3.5 px-6 bg-[#5F8D9E] hover:bg-[#7CA7B8] text-white font-bold rounded-xl text-base shadow-sm hover:shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2"
            >
              {sendingMessage ? "Sending..." : "Send"}
              <svg className="w-4 h-4 fill-current rotate-90" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </section>
      </main>

      <FrameComponent3 />
    </div>
  );
}
