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
  meetLink?: string;
}

interface Group {
  id: string;
  name: string;
  code: string;
  managerId: string;
  members: Array<{ id: string; name: string; email: string }>;
}

export default function MeetingsPage() {
  const [session, setSession] = useState<any>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [agenda, setAgenda] = useState("");
  const [participants, setParticipants] = useState("");
  const [generateMeet, setGenerateMeet] = useState(false);
  const [customMeetLink, setCustomMeetLink] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
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
      // Fetch user groups to match details
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to load group details");

      const matchedGroup = data.groups?.find((g: any) => g.id === groupId);
      if (!matchedGroup) {
        window.location.href = "/dashboard";
        return;
      }
      setActiveGroup(matchedGroup);

      // Pre-fill participants with group members names
      const otherMembers = matchedGroup.members
        .filter((m: any) => m.id !== userId)
        .map((m: any) => m.name)
        .join(", ");
      setParticipants(otherMembers);

      await fetchMeetings(userId, groupId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong loading page");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async (userId: string, groupId: string) => {
    try {
      const res = await fetch(`/api/meetings?userId=${userId}&groupId=${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getFormattedDateString = (year: number, monthIndex: number, day: number) => {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const getMeetingsForDate = (dateStr: string) => {
    return meetings.filter((m) => m.date === dateStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!session || !activeGroup) return;

    const finalMeetLink = customMeetLink.trim()
      ? customMeetLink.trim()
      : (generateMeet ? "https://meet.google.com/new" : undefined);

    const payload = {
      id: editingId || undefined,
      title,
      date,
      time,
      agenda,
      participants,
      meetLink: finalMeetLink,
      status: editingId ? undefined : "Upcoming",
      groupId: activeGroup.id,
    };

    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch("/api/meetings", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      setSuccessMsg(editingId ? "Meeting updated successfully!" : "Meeting scheduled successfully!");

      // Reset form
      setTitle("");
      setDate("");
      setTime("");
      setAgenda("");
      
      const otherMembers = activeGroup.members
        .filter((m: any) => m.id !== session.id)
        .map((m: any) => m.name)
        .join(", ");
      setParticipants(otherMembers);
      
      setGenerateMeet(false);
      setCustomMeetLink("");
      setEditingId(null);

      fetchMeetings(session.id, activeGroup.id);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingId(meeting.id);
    setTitle(meeting.title);
    setDate(meeting.date);
    setTime(meeting.time);
    setAgenda(meeting.agenda);
    setParticipants(meeting.participants);
    setCustomMeetLink(meeting.meetLink || "");
    setGenerateMeet(!!meeting.meetLink);
    setError("");
    setSuccessMsg("");
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const handleCancel = async (meetingId: string) => {
    if (!session || !activeGroup) return;
    if (!confirm("Are you sure you want to cancel this meeting?")) return;

    try {
      const res = await fetch("/api/meetings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify({ id: meetingId, status: "Cancelled" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel meeting");
      }

      setSuccessMsg("Meeting cancelled successfully!");
      fetchMeetings(session.id, activeGroup.id);
    } catch (err: any) {
      setError(err.message || "Failed to cancel meeting");
    }
  };

  const handleComplete = async (meetingId: string) => {
    if (!session || !activeGroup) return;

    try {
      const res = await fetch("/api/meetings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify({ id: meetingId, status: "Completed" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark completed");
      }

      setSuccessMsg("Meeting completed!");
      fetchMeetings(session.id, activeGroup.id);
    } catch (err: any) {
      setError(err.message || "Failed to update meeting");
    }
  };

  const handleAddMeetLink = async (meetingId: string) => {
    if (!session || !activeGroup) return;

    try {
      const generatedLink = "https://meet.google.com/new";

      const updateRes = await fetch("/api/meetings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.id,
        },
        body: JSON.stringify({ id: meetingId, meetLink: generatedLink }),
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        throw new Error(data.error || "Failed to create Meet link");
      }

      setSuccessMsg("Google Meet link successfully added!");
      fetchMeetings(session.id, activeGroup.id);
    } catch (err: any) {
      setError(err.message || "Failed to create Meet link");
    }
  };

  if (loading || !session || !activeGroup) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 font-['Space_Grotesk'] text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#A25244] rounded-full animate-spin"></div>
          <span className="text-xl font-medium tracking-wide">Loading workspace meetings...</span>
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
            Workspace: 🏢 <strong className="text-slate-800 text-lg font-['Space_Grotesk']">{activeGroup.name}</strong> (Code: <span className="font-mono bg-[#A25244]/10 border border-solid border-[#A25244]/20 px-2.5 py-0.5 rounded text-[#A25244] font-bold">{activeGroup.code}</span>)
          </div>
          <a href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors no-underline">
            Switch Workspace Group
          </a>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-10 max-w-full mq800:flex-wrap">
          <Heading
            label="Meeting"
            label1="Scheduling"
            showLabel={true}
          />
          <b className="w-[450px] relative inline-block text-lg font-['DM_Sans'] text-slate-500 font-normal leading-relaxed mq450:text-base">
            Create, manage, and coordinate all team syncs for the {activeGroup.name} workspace.
          </b>
        </div>

        {/* Interactive Monthly Grid Calendar Component */}
        {(() => {
          const MONTH_NAMES = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];

          const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
          const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();

          const daysArray = [];
          const prevMonthNumDays = new Date(currentYear, currentMonth, 0).getDate();
          for (let i = firstDayIndex - 1; i >= 0; i--) {
            daysArray.push({
              dayNum: prevMonthNumDays - i,
              isPadding: true,
              dateStr: getFormattedDateString(
                currentMonth === 0 ? currentYear - 1 : currentYear,
                currentMonth === 0 ? 11 : currentMonth - 1,
                prevMonthNumDays - i
              )
            });
          }
          for (let i = 1; i <= numDays; i++) {
            daysArray.push({
              dayNum: i,
              isPadding: false,
              dateStr: getFormattedDateString(currentYear, currentMonth, i)
            });
          }
          const totalCells = Math.ceil(daysArray.length / 7) * 7;
          const nextMonthPadding = totalCells - daysArray.length;
          for (let i = 1; i <= nextMonthPadding; i++) {
            daysArray.push({
              dayNum: i,
              isPadding: true,
              dateStr: getFormattedDateString(
                currentMonth === 11 ? currentYear + 1 : currentYear,
                currentMonth === 11 ? 0 : currentMonth + 1,
                i
              )
            });
          }

          return (
            <section className="w-full bg-white border border-solid border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] flex flex-col gap-6">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-solid border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h3 className="m-0 text-xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
                      Workspace Calendar View
                    </h3>
                    <p className="m-0 text-xs text-slate-500 font-['DM_Sans'] mt-0.5">
                      Select dates to view scheduled team syncs, descriptions, agendas, and join call links
                    </p>
                  </div>
                </div>
                
                {/* Month Selector Navigation */}
                <div className="flex items-center gap-4 bg-slate-50 border border-solid border-slate-200/80 px-4 py-2 rounded-xl">
                  <button
                    onClick={handlePrevMonth}
                    type="button"
                    className="cursor-pointer border-none bg-transparent hover:bg-slate-200 text-slate-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold transition duration-150"
                  >
                    &larr;
                  </button>
                  <span className="text-base font-bold text-slate-800 font-['Space_Grotesk'] min-w-[140px] text-center select-none">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    type="button"
                    className="cursor-pointer border-none bg-transparent hover:bg-slate-200 text-slate-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold transition duration-150"
                  >
                    &rarr;
                  </button>
                </div>
              </div>

              {/* Calendar grid */}
              <div className="w-full flex flex-col gap-2">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 font-['Space_Grotesk'] uppercase tracking-wider pb-1">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Day Squares Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {daysArray.map((day, idx) => {
                    const dateMeetings = getMeetingsForDate(day.dateStr);
                    const hasMeetings = dateMeetings.length > 0;
                    const isToday = day.dateStr === new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`cursor-pointer min-h-[90px] rounded-xl border border-solid p-2 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                          day.isPadding
                            ? "bg-slate-50/40 text-slate-350 border-slate-100"
                            : "bg-white text-slate-800 border-slate-200 hover:border-[#A25244]"
                        } ${
                          isToday ? "border-2 border-solid border-[#A25244]/80 bg-[#A25244]/5" : ""
                        }`}
                      >
                        {/* Date Number */}
                        <span className={`text-xs font-bold font-['Space_Grotesk'] self-start ${
                          isToday ? "text-[#A25244]" : ""
                        }`}>
                          {day.dayNum}
                        </span>

                        {/* Meetings count/indicator */}
                        {hasMeetings && (
                          <div className="flex flex-col gap-1 w-full mt-1">
                            <div className="flex items-center gap-1.5 bg-[#A25244]/10 border border-solid border-[#A25244]/20 rounded-md px-1.5 py-0.5 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A25244] animate-pulse"></span>
                              <span className="text-[10px] text-[#A25244] font-bold font-mono">
                                {dateMeetings.length} {dateMeetings.length === 1 ? "Meet" : "Meets"}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 truncate block font-['DM_Sans'] font-medium">
                              {dateMeetings[0].title}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })()}

        {/* Overlays / Modal for date details */}
        {selectedDate && (
          (() => {
            const dateMeetings = getMeetingsForDate(selectedDate);
            const dateFormattedReadable = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-solid border-slate-200 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto flex flex-col p-6">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center border-b border-solid border-slate-100 pb-4 mb-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#A25244] font-bold">Scheduled Events</span>
                      <h3 className="m-0 text-lg font-bold text-slate-900 font-['Space_Grotesk'] mt-0.5">
                        {dateFormattedReadable}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedDate(null)}
                      type="button"
                      className="cursor-pointer border-none bg-slate-100 hover:bg-slate-250 text-slate-650 w-8 h-8 rounded-full flex items-center justify-center text-sm transition font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex flex-col gap-4">
                    {dateMeetings.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 font-['DM_Sans'] flex flex-col items-center gap-3">
                        <span className="text-3xl">☕</span>
                        <p className="m-0 text-sm">No meetings scheduled for this date.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {dateMeetings.map((meeting) => (
                          <div
                            key={meeting.id}
                            className="border border-solid border-slate-150 p-5 rounded-xl bg-slate-50/50 flex flex-col gap-3 relative"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="m-0 text-base font-bold text-slate-900 font-['Space_Grotesk']">
                                {meeting.title}
                              </h4>
                              <span className="text-xs bg-[#A25244]/15 border border-solid border-[#A25244]/35 text-[#A25244] px-2 py-0.5 rounded font-mono font-bold shrink-0">
                                ⏰ {meeting.time}
                              </span>
                            </div>

                            <div className="text-xs text-slate-500 font-['DM_Sans'] border-t border-solid border-slate-100 pt-2">
                              <b className="text-slate-700 block mb-0.5">Agenda:</b>
                              <p className="m-0 leading-relaxed">{meeting.agenda}</p>
                            </div>

                            <div className="text-xs text-slate-500 font-['DM_Sans']">
                              <b className="text-slate-700">Participants:</b> 👥 {meeting.participants}
                            </div>

                            <div className="flex justify-between items-center gap-3 pt-2 border-t border-solid border-slate-100">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border border-solid ${
                                meeting.status === "Upcoming"
                                  ? "bg-[#A25244]/10 text-[#A25244] border-[#A25244]/20"
                                  : meeting.status === "Completed"
                                  ? "bg-slate-800 text-white border-slate-800"
                                  : "bg-red-50 text-red-700 border-red-150"
                              }`}>
                                {meeting.status}
                              </span>
                              
                              {meeting.meetLink && meeting.status === "Upcoming" && (
                                <a
                                  href={meeting.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="cursor-pointer bg-[#A25244] hover:bg-[#B36052] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg no-underline hover:shadow transition duration-200 shrink-0"
                                >
                                  Join Call
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <button
                    onClick={() => setSelectedDate(null)}
                    type="button"
                    className="cursor-pointer border border-solid border-slate-200 bg-white hover:bg-slate-50 text-slate-750 font-bold rounded-xl py-3 px-6 text-sm text-center transition duration-200 mt-6"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            );
          })()
        )}

        <div className="w-full flex items-start gap-12 mq1125:flex-col">
          {/* Scheduling Form Section (Only for Manager) */}
          {isManager ? (
            <div className="w-[45%] shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 box-border p-8 flex flex-col gap-6 mq1125:w-full">
              <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight">
                {editingId ? "Update Scheduled Sync" : "Schedule Team Sync"}
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
                  <label className="text-sm font-semibold text-slate-750">Meeting Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly Status Update"
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#A25244] transition"
                  />
                </div>

                <div className="flex gap-4 mq450:flex-col">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-semibold text-slate-750">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 focus:border-[#A25244] transition cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-semibold text-slate-750">Time</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 focus:border-[#A25244] transition cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Participants</label>
                  <input
                    type="text"
                    required
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="comma separated names"
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#A25244] transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-750">Meeting Agenda</label>
                  <textarea
                    required
                    rows={4}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Describe target achievements for this sync..."
                    className="w-full bg-white border border-solid border-slate-200 rounded-xl py-3 px-4 text-base font-['Space_Grotesk'] outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#A25244] transition resize-none"
                  />
                </div>

                {/* Google Meet Option Section */}
                <div className="flex flex-col gap-3 bg-slate-50/50 p-4 rounded-xl border border-solid border-slate-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="generateMeet"
                      checked={generateMeet}
                      onChange={(e) => {
                        setGenerateMeet(e.target.checked);
                        if (!e.target.checked) setCustomMeetLink("");
                      }}
                      className="w-5 h-5 accent-[#A25244] cursor-pointer"
                    />
                    <label htmlFor="generateMeet" className="text-sm font-bold text-slate-800 cursor-pointer select-none">
                      🎥 Google Meet Integration
                    </label>
                  </div>

                  {generateMeet && (
                    <div className="flex flex-col gap-2 pl-8 pt-1">
                      <label className="text-xs font-semibold text-slate-500">
                        Enter custom Meet URL (or leave blank to auto-host a new call)
                      </label>
                      <input
                        type="url"
                        value={customMeetLink}
                        onChange={(e) => setCustomMeetLink(e.target.value)}
                        placeholder="https://meet.google.com/xxx-yyyy-zzz"
                        className="w-full bg-white border border-solid border-slate-200 rounded-xl py-2 px-3 text-sm font-['Space_Grotesk'] outline-none text-slate-900 focus:border-[#A25244] transition"
                      />
                    </div>
                  )}

                  <p className="m-0 text-xs text-slate-400 font-['DM_Sans'] pl-8 leading-relaxed">
                    Clicking &quot;Join Call&quot; opens the meet page instantly to launch a real, active Google video session.
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    className="cursor-pointer border-none py-3.5 px-6 bg-[#A25244] hover:bg-[#B36052] text-white font-bold rounded-xl flex-1 text-base shadow-sm hover:shadow transition-all duration-200"
                  >
                    {editingId ? "Update Sync" : "Confirm Schedule"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setTitle("");
                        setDate("");
                        setTime("");
                        setAgenda("");
                        const otherMembers = activeGroup.members
                          .filter((m: any) => m.id !== session.id)
                          .map((m: any) => m.name)
                          .join(", ");
                        setParticipants(otherMembers);
                        setGenerateMeet(false);
                        setCustomMeetLink("");
                      }}
                      className="cursor-pointer border border-solid border-slate-200 py-3.5 px-6 bg-white rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition duration-200"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            /* Non-manager placeholder */
            <div className="w-[45%] shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 box-border p-8 flex flex-col gap-4 mq1125:w-full">
              <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight">Schedule Team Sync</h2>
              <div className="bg-slate-50 text-slate-700 p-6 rounded-xl border border-solid border-slate-200 flex flex-col gap-3">
                <span className="text-base font-bold">📋 View Only Access</span>
                <p className="m-0 text-sm font-['DM_Sans'] leading-relaxed text-slate-500">
                  Only the workspace group manager (<strong>{activeGroup.members.find(m => m.id === activeGroup.managerId)?.name}</strong>) can schedule new syncs or edit existing ones.
                </p>
              </div>
            </div>
          )}

          {/* Scheduled Meetings List Section */}
          <div className="w-[55%] flex flex-col gap-6 mq1125:w-full">
            <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight">
              Scheduled Meetings ({meetings.length})
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

            {meetings.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 font-['DM_Sans'] bg-white shadow-sm">
                No syncs planned for this workspace yet.
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-h-[900px] overflow-y-auto pr-2">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="w-full shadow-[0_4px_25px_-5px_rgba(9,124,135,0.04)] rounded-2xl bg-white border border-solid border-slate-200/80 box-border p-6 flex flex-col gap-4 relative"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="m-0 text-xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
                          {meeting.title}
                        </h3>
                        <div className="text-sm text-slate-500 font-['DM_Sans'] mt-1">
                          📅 {meeting.date} at ⏰ {meeting.time}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <span
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold border border-solid ${
                          meeting.status === "Upcoming"
                            ? "bg-[#A25244] text-white border-[#A25244]"
                            : meeting.status === "Completed"
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-red-50 text-red-700 border-red-150"
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>

                    <div className="border-t border-solid border-slate-100 pt-3">
                      <b className="text-sm text-slate-800 block mb-1">Agenda</b>
                      <p className="m-0 text-sm text-slate-500 leading-relaxed font-['DM_Sans']">
                        {meeting.agenda}
                      </p>
                    </div>

                    <div className="border-t border-solid border-slate-100 pt-3">
                      <b className="text-sm text-slate-800 block mb-1">Participants</b>
                      <div className="text-sm text-slate-500 font-['DM_Sans']">
                        👥 {meeting.participants}
                      </div>
                    </div>

                    {/* Google Meet Connection Segment */}
                    {meeting.status === "Upcoming" && (
                      <div className="border-t border-solid border-slate-100 pt-3 flex flex-col gap-2">
                        <b className="text-sm text-slate-800 block">Virtual Call Access</b>
                        {meeting.meetLink ? (
                          <div className="flex items-center justify-between gap-4 bg-slate-50/50 p-3.5 rounded-xl border border-solid border-slate-200">
                            <span className="text-xs font-bold text-slate-700 truncate font-['DM_Sans'] max-w-[250px]">
                              🔗 {meeting.meetLink}
                            </span>
                            <a
                              href={meeting.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer bg-[#A25244] text-white hover:bg-[#B36052] font-bold text-xs px-4 py-2 rounded-lg no-underline hover:shadow transition-all duration-200 shrink-0"
                            >
                              Join Call
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4 bg-slate-50/30 p-3 rounded-xl border border-solid border-slate-100">
                            <span className="text-xs text-slate-400 font-['DM_Sans']">
                              No virtual meet link set up yet.
                            </span>
                            {isManager && (
                              <button
                                onClick={() => handleAddMeetLink(meeting.id)}
                                className="cursor-pointer bg-[#A25244]/10 border border-solid border-[#A25244]/20 text-[#A25244] px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#A25244] hover:text-white transition duration-200"
                              >
                                Host a Meet
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Panel */}
                    <div className="flex justify-end gap-3 mt-2 pt-3 border-t border-solid border-slate-100">
                      {isManager && meeting.status === "Upcoming" && (
                        <>
                          <button
                            onClick={() => handleComplete(meeting.id)}
                            className="cursor-pointer bg-slate-800 border-none px-4 py-2 rounded-lg text-xs font-bold text-white hover:bg-slate-900 transition duration-200"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleEdit(meeting)}
                            className="cursor-pointer bg-white border border-solid border-slate-200 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition duration-200"
                          >
                            Edit Details
                          </button>
                          <button
                            onClick={() => handleCancel(meeting.id)}
                            className="cursor-pointer bg-red-50 border border-solid border-red-150 px-4 py-2 rounded-lg text-xs font-bold text-red-700 hover:bg-red-100 transition duration-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {!isManager && meeting.status === "Upcoming" && (
                        <span className="text-xs font-medium text-slate-400 font-['DM_Sans']">
                          Waiting for meeting to start...
                        </span>
                      )}
                      {meeting.status !== "Upcoming" && (
                        <span className="text-xs font-medium text-slate-400 font-['DM_Sans']">
                          No actions available for {meeting.status.toLowerCase()} meetings
                        </span>
                      )}
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
