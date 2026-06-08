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

  // File Upload states
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Voice to Text & AI states
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [voiceNote, setVoiceNote] = useState<{ name: string; type: string; dataUrl: string } | null>(null);

  // Catch Me Up AI states
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const handleCatchMeUp = async () => {
    if (!session || !activeGroupId) return;
    setLoadingSummary(true);
    setShowSummaryModal(true);
    try {
      const res = await fetch(`/api/messages/summarize?userId=${session.id}&groupId=${activeGroupId}`);
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
      } else {
        setSummary("Failed to generate summary: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      setSummary("Error connecting to summarization service.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          setNewMessageText((prev) => {
            const separator = prev.trim() ? " " : "";
            return prev + separator + transcript;
          });
        };

        setRecognition(rec);
      }
    }
  }, []);

  const startVoiceRecording = async () => {
    // 1. Start Speech Recognition for voice-to-text transcription
    if (recognition) {
      try {
        recognition.start();
      } catch (err) {
        console.error("SpeechRecognition start error:", err);
      }
    }

    // 2. Start Audio Recording (MediaRecorder) for audio voice note
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceNote({
            name: `Voice Message (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            type: "audio/webm",
            dataUrl: reader.result as string,
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks on the stream to release the mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("MediaRecorder start error:", err);
    }
  };

  const stopVoiceRecording = () => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (err) {
        console.error("SpeechRecognition stop error:", err);
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("MediaRecorder stop error:", err);
      }
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening || (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording")) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const makeTextProfessional = async () => {
    if (!newMessageText.trim()) return;
    setIsRewriting(true);

    // Simulate AI polishing delay for premium UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    const text = newMessageText.trim();
    const lowText = text.toLowerCase();
    let professionalText = "";

    if (lowText === "hi" || lowText === "hello" || lowText === "hey") {
      professionalText = "Hello team, I hope you are all doing well.";
    } else if (lowText.includes("did the task") || lowText.includes("done with the task") || lowText.includes("completed the task")) {
      professionalText = "I have successfully completed the assigned task. It is now ready for your review and feedback.";
    } else if (lowText.includes("help") || lowText.includes("need help") || lowText.includes("stuck")) {
      professionalText = "I am currently facing a blocker on my current workload. Could anyone assist me with resolving this issue?";
    } else if (lowText.includes("meet tomorrow") || lowText.includes("can we meet")) {
      professionalText = "Could we schedule a brief sync-up meeting tomorrow to discuss our project milestones and coordinate next steps?";
    } else if (lowText.includes("verify") || lowText.includes("check")) {
      professionalText = "Kindly proceed with verifying the structural consistency and alignment of the current implementations.";
    } else if (lowText.includes("sorry") || lowText.includes("my bad")) {
      professionalText = "I apologize for the oversight. I will update the implementation immediately to ensure compliance.";
    } else {
      professionalText = `Regarding our current coordination, ${text[0].toLowerCase() + text.slice(1)}. Please review at your earliest convenience.`;
    }

    setNewMessageText(professionalText);
    setIsRewriting(false);
  };

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

    // If user already has an active workspace group selected AND has a pending redirect URL, send them straight there.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const red = params.get("redirect");
      if (red) {
        window.location.href = red;
        return;
      }
    }

    const savedGroupId = localStorage.getItem("active_group_id");
    if (savedGroupId) {
      setActiveGroupId(savedGroupId);
      fetchGroupDetails(user.id, savedGroupId);
    } else {
      // Instead of redirecting immediately, let's see if the user belongs to any groups.
      // If they do, auto-select the first group. Otherwise, send them to choose a group.
      const autoSelectGroup = async () => {
        try {
          const res = await fetch(`/api/groups?userId=${user.id}`);
          const data = await res.json();
          if (res.ok && data.groups && data.groups.length > 0) {
            const firstGroupId = data.groups[0].id;
            localStorage.setItem("active_group_id", firstGroupId);
            setActiveGroupId(firstGroupId);
            fetchGroupDetails(user.id, firstGroupId);
          } else {
            const currentQuery = typeof window !== "undefined" ? window.location.search : "";
            window.location.href = `/groups${currentQuery}`;
          }
        } catch (err) {
          console.error("Error auto-selecting group:", err);
          window.location.href = "/groups";
        }
      };
      autoSelectGroup();
    }
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
    if ((!newMessageText.trim() && !attachedFile && !voiceNote) || !session || !activeGroupId) return;

    const messageText = newMessageText.trim();
    const fileToSend = attachedFile || voiceNote;

    setNewMessageText("");
    setAttachedFile(null);
    setVoiceNote(null);
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
          fileAttachment: fileToSend,
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
          <div className="shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04)] rounded-2xl bg-white border-l-4 border-l-sky-500 border-y border-r border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Upcoming Meetings</span>
            <span className="text-5xl font-bold text-sky-600 tracking-tight">{upcomingMeetings.length}</span>
            <span className="text-xs font-['DM_Sans'] text-slate-400">Total scheduled: {meetings.length}</span>
          </div>

          <div className="shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04)] rounded-2xl bg-white border-l-4 border-l-purple-500 border-y border-r border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Pending Tasks</span>
            <span className="text-5xl font-bold text-purple-650 tracking-tight">{pendingTasks.length}</span>
            <span className="text-xs font-['DM_Sans'] text-slate-400">Completed tasks: {completedTasksCount}</span>
          </div>

          <div className="shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04)] rounded-2xl bg-white border-l-4 border-l-rose-500 border-y border-r border-solid border-slate-200 p-8 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <span className="text-sm font-semibold text-slate-500 font-['DM_Sans']">Critical Hotspots</span>
            <span className="text-5xl font-bold text-rose-600 tracking-tight">{highPriorityTasksCount}</span>
            <span className="text-xs font-['DM_Sans'] text-slate-400">High priority pending tasks</span>
          </div>

          {/* Glowing Gradient Completion card */}
          <div className="shadow-[0_8px_30px_rgba(9,124,135,0.12)] rounded-2xl bg-gradient-to-br from-[#097C87] to-[#23CED9] p-8 flex flex-col gap-2 text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
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
            <div className="flex items-center gap-3">
              <span className="text-xs bg-[#5F8D9E]/15 border border-solid border-[#5F8D9E]/35 text-[#5F8D9E] px-2.5 py-1 rounded-full font-bold font-mono">
                {messages.length} messages
              </span>
              <button
                type="button"
                onClick={handleCatchMeUp}
                className="cursor-pointer border-none py-1.5 px-3 bg-[#097C87] hover:bg-[#23CED9] text-white rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 shadow-sm hover:shadow"
                title="Summarize recent chat messages using AI"
              >
                ⚡ Catch Me Up (AI)
              </button>
            </div>
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
                        {msg.content && <div className="break-words">{msg.content}</div>}
                        {msg.fileAttachment && (
                          <div className={`mt-2 p-2.5 rounded-xl border border-solid flex items-center gap-3 ${
                            isMe ? "bg-white/15 border-white/20 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}>
                            {msg.fileAttachment.type.startsWith("image/") ? (
                              <div className="flex flex-col gap-1.5 w-full">
                                <img
                                  src={msg.fileAttachment.dataUrl}
                                  alt={msg.fileAttachment.name}
                                  className="max-w-xs max-h-48 rounded-lg object-cover border border-solid border-slate-200/50"
                                />
                                <span className="text-xs opacity-75 truncate max-w-[200px]">{msg.fileAttachment.name}</span>
                              </div>
                            ) : msg.fileAttachment.type.startsWith("audio/") ? (
                              <div className="flex flex-col gap-1.5 w-full min-w-[260px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">🎙️</span>
                                  <span className="text-xs font-bold truncate">{msg.fileAttachment.name}</span>
                                </div>
                                <audio
                                  src={msg.fileAttachment.dataUrl}
                                  controls
                                  className={`w-full h-8 scale-95 origin-left ${
                                    isMe ? "filter invert brightness-200 opacity-90" : ""
                                  }`}
                                />
                              </div>
                            ) : (
                              <>
                                <span className="text-2xl shrink-0">
                                  {msg.fileAttachment.name.endsWith(".pdf") ? "📕" : msg.fileAttachment.name.endsWith(".ppt") || msg.fileAttachment.name.endsWith(".pptx") ? "📙" : "📄"}
                                </span>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-xs font-bold truncate">{msg.fileAttachment.name}</span>
                                  <span className="text-[10px] opacity-75">
                                    {msg.fileAttachment.name.endsWith(".pdf") ? "PDF Document" : "PowerPoint Presentation"}
                                  </span>
                                </div>
                                <a
                                  href={msg.fileAttachment.dataUrl}
                                  download={msg.fileAttachment.name}
                                  className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${
                                    isMe ? "text-white" : "text-[#5F8D9E]"
                                  }`}
                                  title="Download File"
                                >
                                  📥
                                </a>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Message Form */}
          <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {/* Attached File Preview Pill */}
              {attachedFile && (
                <div className="self-start flex items-center gap-2 bg-slate-100 border border-solid border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 animate-fade-in-up">
                  <span>📁 {attachedFile.name} ({attachedFile.type.startsWith("image/") ? "Photo" : attachedFile.name.endsWith(".pdf") ? "PDF" : "PPT"})</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="cursor-pointer border-none bg-none hover:text-red-500 font-bold ml-1 text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Voice Note Preview Pill */}
              {voiceNote && (
                <div className="self-start flex items-center gap-2 bg-emerald-50 border border-solid border-emerald-150 rounded-lg px-3 py-1.5 text-xs text-emerald-800 animate-fade-in-up">
                  <span>🎙️ Voice Note Ready</span>
                  <audio src={voiceNote.dataUrl} controls className="h-6 w-32 scale-90" />
                  <button
                    type="button"
                    onClick={() => setVoiceNote(null)}
                    className="cursor-pointer border-none bg-none hover:text-red-500 font-bold ml-1 text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 items-center w-full relative">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={isListening ? "Listening... Speak now..." : "Type a message to the group..."}
                  disabled={sendingMessage}
                  className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3.5 pl-4 pr-28 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#5F8D9E] transition"
                />

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,image/*"
                  className="hidden"
                />

                {/* AI Professional Polisher (Sparkles Button) */}
                <button
                  type="button"
                  onClick={makeTextProfessional}
                  disabled={isRewriting || !newMessageText.trim()}
                  className={`absolute right-20 p-1 cursor-pointer border-none bg-transparent transition ${
                    isRewriting ? "text-amber-500 animate-spin" : "text-slate-400 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                  title="Make Professional (AI ✨)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12.27l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9zm10-7l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9zm-4 7.5l-.9-2.5-2.5-.9 2.5-.9.9-2.5.9 2.5 2.5.9-2.5.9z" />
                  </svg>
                </button>

                {/* Voice to Text / Audio Record Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-12 p-1 cursor-pointer border-none bg-transparent transition ${
                    isListening ? "text-red-500 animate-pulse scale-110" : "text-slate-400 hover:text-red-500"
                  }`}
                  title={isListening ? "Recording Voice & Transcribing... Click to stop" : "Record Voice Message & Transcribe"}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>

                {/* Upload Trigger Button */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute right-4 p-1 cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-600 transition"
                  title="Upload File (PDF, PPT, Photo)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>

              <button
                type="submit"
                disabled={sendingMessage || (!newMessageText.trim() && !attachedFile && !voiceNote)}
                className="cursor-pointer border-none py-3.5 px-6 bg-[#5F8D9E] hover:bg-[#7CA7B8] text-white font-bold rounded-xl text-base shadow-sm hover:shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2"
              >
                {sendingMessage ? "Sending..." : "Send"}
                <svg className="w-4 h-4 fill-current rotate-90" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </section>
      </main>

      <FrameComponent3 />

      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/90 border border-solid border-slate-200/80 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-[0_20px_50px_rgba(15,23,42,0.15)] flex flex-col gap-6 animate-scale-up">
            <div className="flex justify-between items-center border-b border-solid border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h3 className="m-0 text-xl font-extrabold text-slate-800 tracking-tight font-['Space_Grotesk']">
                  AI Work Group Summary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-650 text-xl font-bold font-mono"
              >
                ✕
              </button>
            </div>

            {loadingSummary ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#097C87] rounded-full animate-spin"></div>
                <span className="text-sm text-slate-500 font-medium font-['DM_Sans'] animate-pulse">Analyzing recent group discussion...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-slate-700 font-['DM_Sans'] leading-relaxed whitespace-pre-line text-sm max-h-[350px] overflow-y-auto pr-2">
                {summary}
              </div>
            )}

            <div className="flex justify-end border-t border-solid border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="cursor-pointer border-none py-2.5 px-5 bg-[#097C87] hover:bg-[#23CED9] text-white rounded-xl text-sm font-bold shadow-sm transition duration-200"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
