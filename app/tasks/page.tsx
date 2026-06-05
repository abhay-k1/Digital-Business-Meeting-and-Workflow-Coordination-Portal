"use client";

import { useState, useEffect } from "react";
import { getSession } from "../lib/auth";
import FrameComponent from "../../components/frame-component";
import FrameComponent3 from "../../components/frame-component3";
import Heading from "../../components/heading";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedMember: string;
  assignedMemberId?: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
}

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

export default function TasksPage() {
  const [session, setSession] = useState<any>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedMemberId, setAssignedMemberId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const user = getSession();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setSession(user);

    const groupId = localStorage.getItem("active_group_id");
    if (!groupId) {
      window.location.href = "/groups";
      return;
    }

    initPage(user.id, groupId);
  }, []);

  const initPage = async (userId: string, groupId: string) => {
    try {
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to load group details");

      const matchedGroup = data.groups?.find((g: any) => g.id === groupId);
      if (!matchedGroup) {
        window.location.href = "/groups";
        return;
      }
      setActiveGroup(matchedGroup);

      // Pre-select first member in dropdown if available (and user is manager)
      if (matchedGroup.managerId === userId && matchedGroup.members.length > 0) {
        setAssignedMemberId(matchedGroup.members[0].id);
      }

      await fetchTasks(userId, groupId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initialize page");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (userId: string, groupId: string) => {
    try {
      const res = await fetch(`/api/tasks?userId=${userId}&groupId=${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!session || !activeGroup) return;

    // Find member details
    const selectedMember = activeGroup.members.find((m) => m.id === assignedMemberId);
    if (!selectedMember) {
      setError("Please select a valid member to assign the task.");
      return;
    }

    const payload = {
      title,
      description,
      assignedMember: selectedMember.name,
      assignedMemberId: selectedMember.id,
      deadline,
      priority,
      groupId: activeGroup.id,
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");

      setSuccessMsg("Task allocated successfully!");
      setTitle("");
      setDescription("");
      setDeadline("");
      setPriority("Medium");
      
      // Keep dropdown preselected to first member
      if (activeGroup.members.length > 0) {
        setAssignedMemberId(activeGroup.members[0].id);
      }

      fetchTasks(session.id, activeGroup.id);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!session || !activeGroup) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update task status");
      }

      setSuccessMsg("Task status updated!");
      fetchTasks(session.id, activeGroup.id);
    } catch (err: any) {
      setError(err.message || "Failed to update task");
    }
  };

  if (loading || !session || !activeGroup) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 font-['Space_Grotesk'] text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#355C7D] rounded-full animate-spin"></div>
          <span className="text-xl font-medium tracking-wide">Loading tasks workspace...</span>
        </div>
      </div>
    );
  }

  const isManager = activeGroup.managerId === session.id;

  return (
    <div className="w-full min-h-screen relative bg-slate-50/50 overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      <main className="self-stretch flex flex-col gap-16 px-16 box-border max-w-full mq800:px-6">
        {/* Active Group Sub-header Banner */}
        <div className="w-full flex justify-between items-center bg-white border border-solid border-slate-200 p-5 rounded-2xl shadow-[0_4px_15px_-3px_rgba(15,23,42,0.04)]">
          <div className="text-base text-slate-500 font-['DM_Sans']">
            Workspace: 🏢 <strong className="text-slate-800 text-lg font-['Space_Grotesk']">{activeGroup.name}</strong> (Code: <span className="font-mono bg-[#355C7D]/10 border border-solid border-[#355C7D]/20 px-2.5 py-0.5 rounded text-[#355C7D] font-bold">{activeGroup.code}</span>)
          </div>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-10 max-w-full mq800:flex-wrap">
          <Heading
            label="Task"
            label1="Allocation"
            showLabel={true}
          />
          <b className="w-[450px] relative inline-block text-lg font-['DM_Sans'] text-slate-500 font-normal leading-relaxed mq450:text-base">
            Assign work, specify priority, monitor deadlines, and track real-time completion states.
          </b>
        </div>

        <div className="w-full flex items-start gap-8 mq1125:flex-col">
          {/* Allocator Form Section (Only for Manager) */}
          {isManager ? (
            <div className="w-[30%] shrink-0 shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 box-border p-6 flex flex-col gap-6 mq1125:w-full">
              <h2 className="m-0 text-xl font-bold text-slate-900 tracking-tight">
                Allocate New Task
              </h2>

              {error && (
                <div className="bg-red-50 text-red-700 px-5 py-3 rounded-xl border border-solid border-red-150 text-sm font-medium">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="bg-slate-50 text-slate-700 px-5 py-3 rounded-xl border border-solid border-slate-200 text-sm font-medium">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design Dashboard Prototypes"
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#355C7D] transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Assign Employee</label>
                  <select
                    required
                    value={assignedMemberId}
                    onChange={(e) => setAssignedMemberId(e.target.value)}
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 focus:border-[#355C7D] transition cursor-pointer"
                  >
                    {activeGroup.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 focus:border-[#355C7D] transition cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Priority Level</label>
                  <div className="flex gap-2">
                    {(["Low", "Medium", "High"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setPriority(lvl)}
                        className={`cursor-pointer flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center border transition-all duration-200 ${
                          priority === lvl
                            ? "bg-[#355C7D] text-white border-solid border-[#355C7D] shadow-sm"
                            : "bg-white text-slate-700 border-solid border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Task Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide instructions..."
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-2.5 px-4 text-sm font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#355C7D] transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="cursor-pointer border-none py-3 px-6 bg-[#355C7D] hover:bg-[#5C829E] text-white font-bold rounded-xl text-sm shadow-sm hover:shadow transition duration-200 mt-1"
                >
                  Confirm Allocation
                </button>
              </form>
            </div>
          ) : (
            /* Non-manager placeholder banner */
            <div className="w-[30%] shrink-0 shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 box-border p-6 flex flex-col gap-4 mq1125:w-full">
              <h2 className="m-0 text-xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">Allocate New Task</h2>
              <div className="bg-slate-50 text-slate-700 p-4 rounded-xl border border-solid border-slate-200 flex flex-col gap-2">
                <span className="text-sm font-bold">📋 View Only Access</span>
                <p className="m-0 text-xs font-['DM_Sans'] leading-relaxed text-slate-500">
                  Only the group manager (<strong>{activeGroup.members.find(m => m.id === activeGroup.managerId)?.name}</strong>) can assign new tasks.
                </p>
              </div>
            </div>
          )}

          {/* Kanban Board Container */}
          <div className="w-[70%] flex flex-col gap-6 mq1125:w-full">
            <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              {isManager ? "Workspace Kanban Board" : "Your Tasks Board"}
            </h2>

            {error && !isManager && (
              <div className="bg-red-50 text-red-700 px-5 py-3 rounded-xl border border-solid border-red-150 text-sm font-medium">
                {error}
              </div>
            )}
            {successMsg && !isManager && (
              <div className="bg-slate-50 text-slate-700 px-5 py-3 rounded-xl border border-solid border-slate-200 text-sm font-medium">
                {successMsg}
              </div>
            )}

            {tasks.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-slate-350 p-12 text-center text-slate-500 font-['DM_Sans'] bg-white shadow-sm">
                No tasks available in this workspace.
              </div>
            ) : (
              (() => {
                const pendingColTasks = tasks.filter((t) => t.status === "Pending" || !t.status);
                const inProgressColTasks = tasks.filter((t) => t.status === "In Progress");
                const completedColTasks = tasks.filter((t) => t.status === "Completed");

                const renderCard = (task: Task) => (
                  <div
                    key={task.id}
                    className="shadow-sm hover:shadow-md rounded-xl bg-white border border-solid border-slate-200/80 p-4 flex flex-col gap-3 transition-all duration-200 relative group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="m-0 text-sm font-bold text-slate-900 leading-tight font-['Space_Grotesk'] tracking-tight group-hover:text-[#355C7D] transition-colors">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold border border-solid shrink-0 ${
                          task.priority === "High"
                            ? "bg-red-50 text-red-700 border-red-150"
                            : task.priority === "Medium"
                            ? "bg-orange-50 text-orange-650 border-orange-100"
                            : "bg-[#355C7D]/10 text-[#355C7D] border-[#355C7D]/20"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p className="m-0 text-xs text-slate-500 font-['DM_Sans'] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-solid border-slate-100/60 line-clamp-3">
                      {task.description}
                    </p>

                    <div className="flex flex-col gap-1 text-[11px] text-slate-400 font-['DM_Sans'] pt-1">
                      <div>👤 Assigned: <strong className="text-slate-600">{task.assignedMember}</strong></div>
                      <div>📅 Deadline: <strong className="text-slate-600">{task.deadline}</strong></div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-solid border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400">Move Task:</span>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`cursor-pointer rounded px-2.5 py-1.5 font-bold text-[10px] outline-none border border-solid transition duration-200 ${
                          task.status === "Completed"
                            ? "bg-slate-800 text-white border-slate-800"
                            : task.status === "In Progress"
                            ? "bg-[#355C7D]/15 text-[#355C7D] border-[#355C7D]/35"
                            : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                );

                return (
                  <div className="grid grid-cols-3 gap-4 w-full items-start mq800:grid-cols-1">
                    {/* Pending Column */}
                    <div className="bg-slate-100/50 rounded-xl p-3.5 border border-solid border-slate-200/60 min-h-[480px] flex flex-col gap-4">
                      <div className="flex justify-between items-center pb-2 border-b border-solid border-slate-200/80">
                        <span className="font-bold text-slate-800 text-sm font-['Space_Grotesk'] flex items-center gap-1.5">⏳ Pending</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          {pendingColTasks.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                        {pendingColTasks.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400 font-['DM_Sans'] bg-white/40 border border-dashed border-slate-200 rounded-lg">No pending tasks</div>
                        ) : (
                          pendingColTasks.map(renderCard)
                        )}
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="bg-slate-100/50 rounded-xl p-3.5 border border-solid border-slate-200/60 min-h-[480px] flex flex-col gap-4">
                      <div className="flex justify-between items-center pb-2 border-b border-solid border-slate-200/80">
                        <span className="font-bold text-[#355C7D] text-sm font-['Space_Grotesk'] flex items-center gap-1.5">⚙️ In Progress</span>
                        <span className="text-[10px] bg-[#355C7D]/20 text-[#355C7D] px-2 py-0.5 rounded-full font-bold">
                          {inProgressColTasks.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                        {inProgressColTasks.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400 font-['DM_Sans'] bg-white/40 border border-dashed border-slate-200 rounded-lg">No tasks in progress</div>
                        ) : (
                          inProgressColTasks.map(renderCard)
                        )}
                      </div>
                    </div>

                    {/* Completed Column */}
                    <div className="bg-slate-100/50 rounded-xl p-3.5 border border-solid border-slate-200/60 min-h-[480px] flex flex-col gap-4">
                      <div className="flex justify-between items-center pb-2 border-b border-solid border-slate-200/80">
                        <span className="font-bold text-slate-800 text-sm font-['Space_Grotesk'] flex items-center gap-1.5">✅ Completed</span>
                        <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded-full font-bold">
                          {completedColTasks.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                        {completedColTasks.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-400 font-['DM_Sans'] bg-white/40 border border-dashed border-slate-200 rounded-lg">No completed tasks</div>
                        ) : (
                          completedColTasks.map(renderCard)
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </main>

      <FrameComponent3 />
    </div>
  );
}
