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

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getSession();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setSession(user);
    fetchData(user.id);
  }, []);

  const fetchData = async (userId: string) => {
    try {
      const [meetingsRes, tasksRes] = await Promise.all([
        fetch(`/api/meetings?userId=${userId}`),
        fetch(`/api/tasks?userId=${userId}`),
      ]);

      const meetingsData = await meetingsRes.json();
      const tasksData = await tasksRes.json();

      if (meetingsRes.ok) setMeetings(meetingsData.meetings || []);
      if (tasksRes.ok) setTasks(tasksData.tasks || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white font-['Space_Grotesk'] text-2xl font-bold">
        Accessing Workspace Dashboard...
      </div>
    );
  }

  // Analytics Calculations
  const upcomingMeetings = meetings.filter((m) => m.status === "Upcoming");
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  
  const highPriorityTasksCount = tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length;

  return (
    <div className="w-full min-h-screen relative bg-[#fff] overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      <main className="self-stretch flex flex-col gap-16 px-16 box-border max-w-full mq800:px-6">
        {/* Title / Welcome Header */}
        <div className="flex items-center justify-between gap-10 max-w-full flex-wrap">
          <div className="flex items-center gap-10 max-w-full mq800:flex-wrap">
            <Heading
              property1="Green"
              label="Workspace"
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
              Welcome back, <span className="font-extrabold text-[#b9ff66] bg-[#191a23] px-3.5 py-1 rounded-[10px]">{session.name}</span>
            </h2>
          </div>

          <div className="flex gap-4">
            <a
              href="/meetings"
              className="cursor-pointer border-none bg-dark text-white rounded-[14px] px-6 py-4 font-bold text-base hover:bg-[#b9ff66] hover:text-grays-black transition duration-200 shadow-[0px_3px_0px_#000]"
            >
              Schedule Meeting
            </a>
            <a
              href="/tasks"
              className="cursor-pointer border-dark border-solid border-[1px] bg-[#b9ff66] text-grays-black rounded-[14px] px-6 py-4 font-bold text-base hover:bg-[#fff] transition duration-200 shadow-[0px_3px_0px_#191a23]"
            >
              Allocate Task
            </a>
          </div>
        </div>

        {/* Dynamic Analytics Summary Cards */}
        <section className="grid grid-cols-4 gap-6 w-full mq1125:grid-cols-2 mq800:grid-cols-1">
          <div className="shadow-[0px_5px_0px_#191a23] rounded-[30px] bg-[#f3f3f3] border-dark border-solid border-[1px] p-8 flex flex-col gap-2">
            <span className="text-lg font-medium text-[#555] font-['DM_Sans']">Upcoming Meetings</span>
            <span className="text-6xl font-extrabold text-grays-black">{upcomingMeetings.length}</span>
            <span className="text-sm font-['DM_Sans'] text-[#777]">Total scheduled: {meetings.length}</span>
          </div>

          <div className="shadow-[0px_5px_0px_#191a23] rounded-[30px] bg-[#b9ff66] border-dark border-solid border-[1px] p-8 flex flex-col gap-2">
            <span className="text-lg font-medium text-grays-black font-['DM_Sans']">Pending Tasks</span>
            <span className="text-6xl font-extrabold text-grays-black">{pendingTasks.length}</span>
            <span className="text-sm font-['DM_Sans'] text-grays-black/70">Completed tasks: {completedTasksCount}</span>
          </div>

          <div className="shadow-[0px_5px_0px_#191a23] rounded-[30px] bg-[#f3f3f3] border-dark border-solid border-[1px] p-8 flex flex-col gap-2">
            <span className="text-lg font-medium text-[#555] font-['DM_Sans']">Critical Hotspots</span>
            <span className="text-6xl font-extrabold text-red-600">{highPriorityTasksCount}</span>
            <span className="text-sm font-['DM_Sans'] text-[#777]">High priority pending tasks</span>
          </div>

          <div className="shadow-[0px_5px_0px_#191a23] rounded-[30px] bg-[#191a23] border-dark border-solid border-[1px] p-8 flex flex-col gap-2 text-white">
            <span className="text-lg font-medium text-[#ccc] font-['DM_Sans']">Completion Rate</span>
            <span className="text-6xl font-extrabold text-[#b9ff66]">
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
              <a href="/meetings" className="text-base text-grays-black font-bold underline hover:text-[#b9ff66]">
                Manage Meetings &rarr;
              </a>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-[#ccc] p-12 text-center text-[#888] font-['DM_Sans'] bg-[#fafafa]">
                No upcoming meetings scheduled.
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="shadow-[0px_3px_0px_#191a23] rounded-[24px] bg-[#fff] border-dark border-solid border-[1px] p-6 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="m-0 text-xl font-bold text-grays-black">{meeting.title}</h4>
                      <span className="text-xs bg-[#b9ff66] text-grays-black px-2.5 py-1 rounded-[8px] font-bold border border-solid border-[#b9ff66]">
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
              <h3 className="m-0 text-3xl font-medium text-grays-black">Active Workloads</h3>
              <a href="/tasks" className="text-base text-grays-black font-bold underline hover:text-[#b9ff66]">
                Manage Tasks &rarr;
              </a>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-[#ccc] p-12 text-center text-[#888] font-['DM_Sans'] bg-[#fafafa]">
                All tasks completed! Great job.
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="shadow-[0px_3px_0px_#191a23] rounded-[24px] bg-[#fff] border-dark border-solid border-[1px] p-6 flex flex-col gap-3"
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
                        task.status === "In Progress" ? "bg-[#b9ff66]/20 text-[#2f551c]" : "bg-grey text-grays-black"
                      }`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <FrameComponent3 />
    </div>
  );
}
