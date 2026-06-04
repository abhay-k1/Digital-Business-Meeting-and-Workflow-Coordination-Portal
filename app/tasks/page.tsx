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
      window.location.href = "/dashboard";
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
        window.location.href = "/dashboard";
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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#097C87] rounded-full animate-spin"></div>
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
            Workspace: 🏢 <strong className="text-slate-800 text-lg font-['Space_Grotesk']">{activeGroup.name}</strong> (Code: <span className="font-mono bg-[#23CED9]/10 border border-solid border-[#23CED9]/20 px-2.5 py-0.5 rounded text-[#097C87] font-bold">{activeGroup.code}</span>)
          </div>
          <a href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors no-underline">
            Switch Workspace Group
          </a>
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

        <div className="w-full flex items-start gap-12 mq1125:flex-col">
          {/* Allocator Form Section (Only for Manager) */}
          {isManager ? (
            <div className="w-[45%] shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 box-border p-8 flex flex-col gap-6 mq1125:w-full">
              <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight">
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

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design Dashboard Prototypes"
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#097C87] transition"
                  />
                </div>

                <div className="flex gap-4 mq450:flex-col">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-semibold text-slate-750">Assign Employee</label>
                    <select
                      required
                      value={assignedMemberId}
                      onChange={(e) => setAssignedMemberId(e.target.value)}
                      className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 focus:border-[#097C87] transition cursor-pointer"
                    >
                      {activeGroup.members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-semibold text-slate-750">Deadline</label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 focus:border-[#097C87] transition cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Priority Level</label>
                  <div className="flex gap-3">
                    {(["Low", "Medium", "High"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setPriority(lvl)}
                        className={`cursor-pointer flex-1 py-3 px-4 rounded-xl text-sm font-bold text-center border transition-all duration-200 ${
                          priority === lvl
                            ? "bg-[#097C87] text-white border-solid border-[#097C87] shadow-sm"
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
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide instructions and expectations for this task..."
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#097C87] transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="cursor-pointer border-none py-3.5 px-6 bg-[#097C87] hover:bg-[#23CED9] text-white font-bold rounded-xl text-base shadow-sm hover:shadow transition duration-200 mt-2"
                >
                  Confirm Allocation
                </button>
              </form>
            </div>
          ) : (
            /* Non-manager placeholder banner */
            <div className="w-[45%] shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 box-border p-8 flex flex-col gap-4 mq1125:w-full">
              <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight">Allocate New Task</h2>
              <div className="bg-slate-50 text-slate-700 p-6 rounded-xl border border-solid border-slate-200 flex flex-col gap-3">
                <span className="text-base font-bold">📋 View Only Access</span>
                <p className="m-0 text-sm font-['DM_Sans'] leading-relaxed text-slate-500">
                  Only the workspace group manager (<strong>{activeGroup.members.find(m => m.id === activeGroup.managerId)?.name}</strong>) can assign new tasks to team members.
                </p>
              </div>
            </div>
          )}

          {/* Allocated Tasks List Section */}
          <div className="w-[55%] flex flex-col gap-6 mq1125:w-full">
            <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight">
              {isManager ? `Allocated Tasks (${tasks.length})` : `Your Assigned Tasks (${tasks.length})`}
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
              <div className="w-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 font-['DM_Sans'] bg-white shadow-sm">
                {isManager ? "No tasks allocated yet. Begin assigning work to your team!" : "No tasks assigned to you in this group."}
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="w-full shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 box-border p-6 flex flex-col gap-4 relative"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="m-0 text-xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
                          {task.title}
                        </h3>
                        <div className="text-sm text-slate-500 font-['DM_Sans'] mt-1">
                          👤 Assigned: <span className="font-semibold text-slate-700">{task.assignedMember}</span>
                        </div>
                      </div>

                      {/* Priority Badges styled with palette colors */}
                      <span
                        className={`text-xs px-3 py-1 rounded-md font-bold border border-solid ${
                          task.priority === "High"
                            ? "bg-red-50 text-red-700 border-red-150"
                            : task.priority === "Medium"
                            ? "bg-orange-50 text-orange-650 border-orange-100"
                            : "bg-[#A1CCA6]/15 text-[#097C87] border-[#A1CCA6]/30"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className="m-0 text-sm text-slate-500 leading-relaxed font-['DM_Sans'] bg-slate-50/50 p-4 rounded-xl border border-solid border-slate-100">
                      {task.description}
                    </p>

                    <div className="flex justify-between items-center gap-4 pt-2 border-t border-solid border-slate-100 mq450:flex-col mq450:items-start">
                      <div className="text-sm text-slate-750 font-['DM_Sans']">
                        📅 Deadline: <span className="font-semibold">{task.deadline}</span>
                      </div>

                      {/* Interactive Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Status:</span>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`cursor-pointer rounded-lg px-3 py-1.5 font-bold text-xs outline-none border border-solid transition duration-200 ${
                            task.status === "Completed"
                              ? "bg-slate-800 text-white border-slate-800"
                              : task.status === "In Progress"
                              ? "bg-[#23CED9]/10 text-[#097C87] border-[#23CED9]/20"
                              : "bg-white text-slate-650 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <FrameComponent3 />
    </div>
  );
}
