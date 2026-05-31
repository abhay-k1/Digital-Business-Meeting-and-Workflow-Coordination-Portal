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
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
}

export default function TasksPage() {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedMember, setAssignedMember] = useState("");
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
    fetchTasks(user.id);
  }, []);

  const fetchTasks = async (userId: string) => {
    try {
      const res = await fetch(`/api/tasks?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!session) return;

    const payload = {
      title,
      description,
      assignedMember,
      deadline,
      priority,
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
      setAssignedMember("");
      setDeadline("");
      setPriority("Medium");

      fetchTasks(session.id);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!session) return;

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
      fetchTasks(session.id);
    } catch (err: any) {
      setError(err.message || "Failed to update task");
    }
  };

  if (loading || !session) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white font-['Space_Grotesk'] text-2xl font-bold">
        Loading tasks workspace...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative bg-[#fff] overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      <main className="self-stretch flex flex-col gap-16 px-16 box-border max-w-full mq800:px-6">
        {/* Title Section */}
        <div className="flex items-center gap-10 max-w-full mq800:flex-wrap">
          <Heading
            property1="Green"
            label="Task"
            labelWidth="unset"
            labelHeight="unset"
            label1="Allocation"
            showLabel={true}
            labelWidth1="unset"
            labelHeight1="unset"
            label2="Label"
            labelVisible={false}
          />
          <b className="w-[450px] relative inline-block text-xl font-['DM_Sans'] text-[#555] font-normal mq450:text-base">
            Assign work, specify priority, monitor deadlines, and track real-time completion states.
          </b>
        </div>

        <div className="w-full flex items-start gap-12 mq1125:flex-col">
          {/* Allocator Form Section */}
          <div className="w-[45%] shadow-[0px_5px_0px_#191a23] rounded-[45px] bg-[#f3f3f3] border-dark border-solid border-[1px] box-border p-10 flex flex-col gap-6 mq1125:w-full">
            <h2 className="m-0 text-3xl font-medium text-grays-black">
              Allocate New Task
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 px-5 py-3 rounded-[10px] border border-solid border-red-200 text-sm font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-[#b9ff66]/20 text-[#2f551c] px-5 py-3 rounded-[10px] border border-solid border-[#b9ff66] text-sm font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-base font-medium text-grays-black">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design Dashboard Prototypes"
                  className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#b9ff66]"
                />
              </div>

              <div className="flex gap-4 mq450:flex-col">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-base font-medium text-grays-black">Assign Member</label>
                  <input
                    type="text"
                    required
                    value={assignedMember}
                    onChange={(e) => setAssignedMember(e.target.value)}
                    placeholder="e.g. Rohit Patil"
                    className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#b9ff66]"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-base font-medium text-grays-black">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#b9ff66]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-base font-medium text-grays-black">Priority Level</label>
                <div className="flex gap-3">
                  {(["Low", "Medium", "High"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPriority(lvl)}
                      className={`cursor-pointer flex-1 py-3 px-4 rounded-[14px] text-base font-bold text-center border transition-all duration-200 ${
                        priority === lvl
                          ? "bg-[#b9ff66] text-grays-black border-none font-extrabold shadow-[0px_3px_0px_#191a23]"
                          : "bg-white text-grays-black border-dark border-solid border-[1px]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-base font-medium text-grays-black">Task Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide instructions and expectations for this task..."
                  className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#b9ff66] resize-none"
                />
              </div>

              <button
                type="submit"
                className="cursor-pointer border-none py-4 px-6 bg-dark rounded-[14px] text-base font-bold text-[#fff] hover:bg-[#b9ff66] hover:text-grays-black transition duration-200 shadow-[0px_3px_0px_#000] mt-2"
              >
                Confirm Allocation
              </button>
            </form>
          </div>

          {/* Allocated Tasks List Section */}
          <div className="w-[55%] flex flex-col gap-6 mq1125:w-full">
            <h2 className="m-0 text-3xl font-medium text-grays-black">
              Allocated Tasks ({tasks.length})
            </h2>

            {tasks.length === 0 ? (
              <div className="w-full rounded-[30px] border border-dashed border-[#ccc] p-12 text-center text-lg text-[#888] font-['DM_Sans'] bg-[#fafafa]">
                No tasks allocated yet. Begin assigning work to your team!
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="w-full shadow-[0px_5px_0px_#191a23] rounded-[30px] bg-[#fff] border-dark border-solid border-[1px] box-border p-6 flex flex-col gap-4 relative"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="m-0 text-2xl font-medium text-grays-black">
                          {task.title}
                        </h3>
                        <div className="text-base text-[#555] font-['DM_Sans']">
                          👤 Assigned: <span className="font-bold text-grays-black">{task.assignedMember}</span>
                        </div>
                      </div>

                      {/* Priority Badges */}
                      <span
                        className={`text-xs px-3 py-1 rounded-[10px] font-bold border border-solid ${
                          task.priority === "High"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : task.priority === "Medium"
                            ? "bg-orange-50 text-orange-600 border-orange-200"
                            : "bg-blue-50 text-blue-600 border-blue-200"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className="m-0 text-base text-[#555] leading-6 font-['DM_Sans'] bg-[#f9f9f9] p-4 rounded-[14px] border border-solid border-[#eee]">
                      {task.description}
                    </p>

                    <div className="flex justify-between items-center gap-4 pt-2 border-t border-solid border-[#eee] mq450:flex-col mq450:items-start">
                      <div className="text-base text-grays-black font-['DM_Sans']">
                        📅 Deadline: <span className="font-bold">{task.deadline}</span>
                      </div>

                      {/* Interactive Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#555]">Status:</span>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`cursor-pointer rounded-[10px] px-3 py-1.5 font-bold text-sm outline-none border border-solid transition duration-200 ${
                            task.status === "Completed"
                              ? "bg-[#191a23] text-white border-dark"
                              : task.status === "In Progress"
                              ? "bg-[#b9ff66]/20 text-[#2f551c] border-[#b9ff66]"
                              : "bg-grey text-grays-black border-[#ddd]"
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
