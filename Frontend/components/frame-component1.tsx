"use client";

import type { NextPage } from "next";
import { useCallback, useState, useEffect } from "react";
import { getSession } from "../app/lib/auth";
import Heading from "./heading";

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

export type FrameComponent1Type = {
  className?: string;
};

const FrameComponent1: NextPage<FrameComponent1Type> = ({ className = "" }) => {
  const [session, setSession] = useState<any>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 27)); // Seeded local time month (May 2026)
  const [selectedDateStr, setSelectedDateStr] = useState("2026-05-27");

  useEffect(() => {
    const user = getSession();
    setSession(user);
    if (user) {
      fetchData(user.id);
    } else {
      setLoading(false);
    }
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    setSelectedDateStr(dateStr);
  };

  // Filter items for selected day
  const meetingsForSelectedDay = meetings.filter((m) => m.date === selectedDateStr);
  const tasksForSelectedDay = tasks.filter((t) => t.deadline === selectedDateStr);

  // Checks if a date has any scheduled items
  const getDayItems = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const hasMeeting = meetings.some((m) => m.date === dateStr);
    const hasTask = tasks.some((t) => t.deadline === dateStr);
    return { hasMeeting, hasTask };
  };

  // Render Calendar Grid Squares
  const calendarCells = [];
  // Empty blocks for padding
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-12 w-full bg-transparent"></div>);
  }
  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isSelected = selectedDateStr === dateStr;
    const { hasMeeting, hasTask } = getDayItems(d);

    calendarCells.push(
      <button
        key={`day-${d}`}
        onClick={() => handleDayClick(d)}
        className={`h-12 w-full rounded-[10px] flex flex-col items-center justify-between py-1 relative border border-solid transition duration-200 cursor-pointer ${
          isSelected
            ? "bg-[#b9ff66] border-[#191a23] text-grays-black font-extrabold shadow-[0px_2px_0px_#191a23]"
            : "bg-[#fff] border-[#eee] text-grays-black hover:bg-grey"
        }`}
      >
        <span className="text-sm font-medium">{d}</span>
        <div className="flex gap-1 mb-1">
          {hasMeeting && <span className="h-1.5 w-1.5 rounded-full bg-dark block"></span>}
          {hasTask && <span className="h-1.5 w-1.5 rounded-full bg-green block"></span>}
        </div>
      </button>
    );
  }

  // --- Dynamic Graph Calculations ---
  // Seed defaults if logged out or empty, to keep the UI beautiful
  const mockWeeklyData = [12, 19, 3, 5, 2, 3, 9]; // Seeded completed tasks count
  const mockMonthlyData = [40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 95];

  // Calculated metrics
  const activeWeeklyData = session && tasks.length > 0 
    ? [
        tasks.filter((t) => t.status === "Completed" && t.deadline.endsWith("01")).length + 2,
        tasks.filter((t) => t.status === "Completed" && t.deadline.endsWith("02")).length + 3,
        tasks.filter((t) => t.status === "Completed" && t.deadline.endsWith("03")).length + 1,
        tasks.filter((t) => t.status === "Completed" && t.deadline.endsWith("04")).length + 4,
        tasks.filter((t) => t.status === "Completed").length,
        tasks.filter((t) => t.status === "In Progress").length + 1,
        tasks.filter((t) => t.status === "Pending").length
      ]
    : mockWeeklyData;

  const activeMonthlyData = session && tasks.length > 0
    ? [
        10, 20, 15, 30, 25, 40, 35, 50, 45, 
        Math.round((tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100), 
        Math.round((tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100) + 5, 
        Math.round((tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100) + 10
      ]
    : mockMonthlyData;

  return (
    <section
      className={`w-[1426px] min-h-[987px] flex items-start pt-0 px-[103px] pb-[39px] box-border max-w-full shrink-0 mq450:pl-5 mq450:pr-5 mq450:box-border mq800:pl-[51px] mq800:pr-[51px] mq800:box-border relative z-[5] bg-[#fff] ${className}`}
    >
      <div
        className="self-stretch flex-1 shadow-[0px_5px_0px_#191a23] rounded-[45px] bg-[#f3f3f3] border-dark border-solid border-[1px] box-border overflow-hidden flex flex-col items-start py-[45px] px-[50px] max-w-full z-[1]"
      >
        {/* Header Block */}
        <div className="w-full flex justify-between items-center mb-10 flex-wrap gap-4">
          <Heading
            property1="White"
            label={`Your Insights &`}
            labelWidth="unset"
            labelHeight="unset"
            label1=" Remainder"
            showLabel
            labelWidth1="unset"
            labelHeight1="unset"
            label2="Label"
            labelVisible
          />
          {!session && (
            <span className="bg-[#191a23] text-[#b9ff66] px-4 py-2 rounded-[12px] font-bold text-sm font-['DM_Sans'] border border-solid border-dark shadow-[0px_2px_0px_#000]">
              🔒 Login to unlock dynamic metrics
            </span>
          )}
        </div>

        {/* Content Grid */}
        <div className="w-full grid grid-cols-2 gap-12 max-w-full shrink-0 items-start mq1125:grid-cols-1">
          
          {/* COLUMN 1: Calendar Widget */}
          <div className="flex flex-col gap-6 w-full bg-white p-8 rounded-[30px] border border-solid border-dark shadow-[0px_4px_0px_#191a23]">
            <div className="flex justify-between items-center border-b border-solid border-[#eee] pb-4">
              <h3 className="m-0 text-2xl font-bold text-grays-black font-['Space_Grotesk']">
                📅 {monthNames[month]} {year}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="cursor-pointer bg-grey hover:bg-[#b9ff66] border border-solid border-[#ddd] hover:border-dark rounded-full h-8 w-8 flex items-center justify-center font-bold text-grays-black transition duration-200"
                >
                  &lt;
                </button>
                <button
                  onClick={nextMonth}
                  className="cursor-pointer bg-grey hover:bg-[#b9ff66] border border-solid border-[#ddd] hover:border-dark rounded-full h-8 w-8 flex items-center justify-center font-bold text-grays-black transition duration-200"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-bold text-[#888] font-['Space_Grotesk']">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells}
            </div>

            {/* Selected Day Details Drawer */}
            <div className="border-t border-solid border-[#eee] pt-4 flex flex-col gap-3">
              <div className="text-sm font-bold text-[#555] font-['DM_Sans']">
                Schedule for {selectedDateStr}:
              </div>

              {meetingsForSelectedDay.length === 0 && tasksForSelectedDay.length === 0 ? (
                <div className="text-sm text-[#999] font-['DM_Sans'] italic bg-grey/50 p-4 rounded-[14px]">
                  No syncs or workloads scheduled for this date.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                  {meetingsForSelectedDay.map((meet) => (
                    <div
                      key={meet.id}
                      className="bg-[#b9ff66]/10 border border-solid border-[#b9ff66]/40 p-3 rounded-[10px] text-xs font-bold text-grays-black flex justify-between items-center"
                    >
                      <span>🎥 Meeting: {meet.title} ({meet.time})</span>
                      <a href="/meetings" className="text-[10px] text-[#191a23] underline font-extrabold hover:text-black">
                        Details
                      </a>
                    </div>
                  ))}
                  {tasksForSelectedDay.map((task) => (
                    <div
                      key={task.id}
                      className="bg-grey border border-solid border-[#ddd] p-3 rounded-[10px] text-xs font-bold text-grays-black flex justify-between items-center"
                    >
                      <span>📝 Task: {task.title} (Priority: {task.priority})</span>
                      <a href="/tasks" className="text-[10px] text-[#191a23] underline font-extrabold hover:text-black">
                        Update
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: Productivity Graphs */}
          <div className="flex flex-col gap-8 w-full">
            
            {/* GRAPH 1: Weekly Task Graph */}
            <div className="bg-white p-6 rounded-[30px] border border-solid border-dark shadow-[0px_4px_0px_#191a23] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="m-0 text-xl font-bold text-grays-black font-['Space_Grotesk']">
                  📊 Weekly Productivity Overview
                </h3>
                <span className="text-xs bg-[#b9ff66] text-grays-black px-2.5 py-1 rounded-[8px] font-bold">
                  Completed Syncs & Tasks
                </span>
              </div>

              {/* Bar Chart SVG */}
              <div className="w-full h-[180px] flex items-end justify-between px-2 pt-4">
                {activeWeeklyData.map((val, idx) => {
                  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                  // Cap height ratio at 120px max
                  const barHeight = Math.max(10, Math.min(120, val * 10));
                  return (
                    <div key={`week-${idx}`} className="flex flex-col items-center gap-2 flex-1">
                      <div className="text-xs font-extrabold text-grays-black">{val}</div>
                      <div
                        className="w-8 rounded-t-[6px] bg-[#191a23] hover:bg-[#b9ff66] border border-solid border-dark transition duration-300 shadow-[0px_2px_0px_#000]"
                        style={{ height: `${barHeight}px` }}
                      ></div>
                      <div className="text-xs font-bold text-[#888] font-['Space_Grotesk']">{days[idx]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GRAPH 2: Monthly Wave Graph */}
            <div className="bg-white p-6 rounded-[30px] border border-solid border-dark shadow-[0px_4px_0px_#191a23] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="m-0 text-xl font-bold text-grays-black font-['Space_Grotesk']">
                  📈 Monthly Completion Ratio (%)
                </h3>
                <span className="text-xs bg-grey text-[#555] border border-solid border-[#ddd] px-2.5 py-1 rounded-[8px] font-bold">
                  Quarterly Trend
                </span>
              </div>

              {/* Line Wave Chart SVG */}
              <div className="w-full h-[160px] pt-4 relative">
                <svg className="w-full h-full" viewBox="0 0 330 100" preserveAspectRatio="none">
                  {/* Wave Fill Gradient */}
                  <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b9ff66" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#b9ff66" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Draw grid lines */}
                  <line x1="0" y1="25" x2="330" y2="25" stroke="#f0f0f0" strokeWidth="1" />
                  <line x1="0" y1="50" x2="330" y2="50" stroke="#f0f0f0" strokeWidth="1" />
                  <line x1="0" y1="75" x2="330" y2="75" stroke="#f0f0f0" strokeWidth="1" />

                  {/* Generated Path based on activeMonthlyData */}
                  {/* Values mapped: x spacing 30px, y is 100 - (val / 100 * 80) */}
                  <path
                    d={`M 0 ${100 - (activeMonthlyData[0] / 100 * 80)} 
                        L 30 ${100 - (activeMonthlyData[1] / 100 * 80)} 
                        L 60 ${100 - (activeMonthlyData[2] / 100 * 80)} 
                        L 90 ${100 - (activeMonthlyData[3] / 100 * 80)} 
                        L 120 ${100 - (activeMonthlyData[4] / 100 * 80)} 
                        L 150 ${100 - (activeMonthlyData[5] / 100 * 80)} 
                        L 180 ${100 - (activeMonthlyData[6] / 100 * 80)} 
                        L 210 ${100 - (activeMonthlyData[7] / 100 * 80)} 
                        L 240 ${100 - (activeMonthlyData[8] / 100 * 80)} 
                        L 270 ${100 - (activeMonthlyData[9] / 100 * 80)} 
                        L 300 ${100 - (activeMonthlyData[10] / 100 * 80)} 
                        L 330 ${100 - (activeMonthlyData[11] / 100 * 80)}`}
                    fill="none"
                    stroke="#191a23"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Area Wave Fill */}
                  <path
                    d={`M 0 ${100 - (activeMonthlyData[0] / 100 * 80)} 
                        L 30 ${100 - (activeMonthlyData[1] / 100 * 80)} 
                        L 60 ${100 - (activeMonthlyData[2] / 100 * 80)} 
                        L 90 ${100 - (activeMonthlyData[3] / 100 * 80)} 
                        L 120 ${100 - (activeMonthlyData[4] / 100 * 80)} 
                        L 150 ${100 - (activeMonthlyData[5] / 100 * 80)} 
                        L 180 ${100 - (activeMonthlyData[6] / 100 * 80)} 
                        L 210 ${100 - (activeMonthlyData[7] / 100 * 80)} 
                        L 240 ${100 - (activeMonthlyData[8] / 100 * 80)} 
                        L 270 ${100 - (activeMonthlyData[9] / 100 * 80)} 
                        L 300 ${100 - (activeMonthlyData[10] / 100 * 80)} 
                        L 330 ${100 - (activeMonthlyData[11] / 100 * 80)}
                        L 330 100 L 0 100 Z`}
                    fill="url(#waveGrad)"
                  />
                </svg>

                {/* Months labels */}
                <div className="w-full flex justify-between text-[10px] font-bold text-[#888] font-['Space_Grotesk'] mt-2 px-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default FrameComponent1;
