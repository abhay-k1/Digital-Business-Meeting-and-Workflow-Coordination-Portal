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
      <div className="w-full min-h-screen flex items-center justify-center bg-white font-['Space_Grotesk'] text-2xl font-bold">
        Loading workspace meetings...
      </div>
    );
  }

  const isManager = activeGroup.managerId === session.id;

  return (
    <div className="w-full min-h-screen relative bg-[#fff] overflow-hidden flex flex-col items-start pt-[61px] px-0 pb-0 box-border gap-20 leading-[normal] tracking-[normal] text-left font-['Space_Grotesk']">
      <FrameComponent />

      <main className="self-stretch flex flex-col gap-16 px-16 box-border max-w-full mq800:px-6">
        {/* Active Group Sub-header Banner */}
        <div className="w-full flex justify-between items-center bg-[#f8fafc] border border-solid border-slate-200 p-5 rounded-[20px] shadow-[0px_2px_0px_#0f172a]">
          <div className="text-base text-[#555] font-['DM_Sans']">
            Workspace: 🏢 <strong className="text-grays-black text-lg">{activeGroup.name}</strong> (Code: <span className="font-mono bg-slate-200 px-2 py-0.5 rounded font-bold">{activeGroup.code}</span>)
          </div>
          <a href="/dashboard" className="text-sm font-bold text-[#2563eb] underline hover:text-blue-700">
            Switch Workspace Group
          </a>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-10 max-w-full mq800:flex-wrap">
          <Heading
            property1="Green"
            label="Meeting"
            labelWidth="unset"
            labelHeight="unset"
            label1="Scheduling"
            showLabel={true}
            labelWidth1="unset"
            labelHeight1="unset"
            label2="Label"
            labelVisible={false}
          />
          <b className="w-[450px] relative inline-block text-xl font-['DM_Sans'] text-[#555] font-normal mq450:text-base">
            Create, manage, and coordinate all team syncs for the {activeGroup.name} workspace.
          </b>
        </div>

        <div className="w-full flex items-start gap-12 mq1125:flex-col">
          {/* Scheduling Form Section (Only for Manager) */}
          {isManager ? (
            <div className="w-[45%] shadow-[0px_5px_0px_#0f172a] rounded-[45px] bg-[#f8fafc] border-dark border-solid border-[1px] box-border p-10 flex flex-col gap-6 mq1125:w-full">
              <h2 className="m-0 text-3xl font-medium text-grays-black">
                {editingId ? "Update Scheduled Sync" : "Schedule Team Sync"}
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 px-5 py-3 rounded-[10px] border border-solid border-red-200 text-sm font-medium">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-[10px] border border-solid border-blue-200 text-sm font-medium">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium text-grays-black">Meeting Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly Status Update"
                    className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>

                <div className="flex gap-4 mq450:flex-col">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-base font-medium text-grays-black">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-base font-medium text-grays-black">Time</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium text-grays-black">Participants</label>
                  <input
                    type="text"
                    required
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="comma separated names"
                    className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium text-grays-black">Meeting Agenda</label>
                  <textarea
                    required
                    rows={4}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    placeholder="Describe target achievements for this sync..."
                    className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[14px] py-3.5 px-4 text-base font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#2563eb] resize-none"
                  />
                </div>

                {/* Google Meet Option Section */}
                <div className="flex flex-col gap-3 bg-white/70 p-4 rounded-[14px] border border-solid border-[#ddd] shadow-[0px_2px_0px_#ddd]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="generateMeet"
                      checked={generateMeet}
                      onChange={(e) => {
                        setGenerateMeet(e.target.checked);
                        if (!e.target.checked) setCustomMeetLink("");
                      }}
                      className="w-5 h-5 accent-[#2563eb] cursor-pointer"
                    />
                    <label htmlFor="generateMeet" className="text-base font-bold text-grays-black cursor-pointer select-none">
                      🎥 Google Meet Integration
                    </label>
                  </div>

                  {generateMeet && (
                    <div className="flex flex-col gap-2 pl-8 pt-1">
                      <label className="text-xs font-bold text-[#555]">
                        Enter custom Meet URL (or leave blank to auto-host a new call)
                      </label>
                      <input
                        type="url"
                        value={customMeetLink}
                        onChange={(e) => setCustomMeetLink(e.target.value)}
                        placeholder="https://meet.google.com/xxx-yyyy-zzz"
                        className="w-full bg-[#fff] border-dark border-solid border-[1px] rounded-[10px] py-2 px-3 text-sm font-['Space_Grotesk'] outline-none text-grays-black focus:ring-2 focus:ring-[#2563eb]"
                      />
                    </div>
                  )}

                  <p className="m-0 text-sm text-[#555] font-['DM_Sans'] pl-8 leading-5">
                    Clicking &quot;Join Call&quot; opens the meet page instantly to launch a real, active Google video session.
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    className="cursor-pointer border-none py-4 px-6 bg-dark hover:bg-green text-white font-bold rounded-[14px] flex-1 text-base shadow-[0px_3px_0px_#000] transition duration-200"
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
                      className="cursor-pointer border-dark border-solid border-[1px] py-4 px-6 bg-transparent rounded-[14px] text-base font-bold text-grays-black hover:bg-white transition duration-200"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            /* Non-manager placeholder */
            <div className="w-[45%] shadow-[0px_5px_0px_#0f172a] rounded-[45px] bg-[#f8fafc] border-dark border-solid border-[1px] box-border p-10 flex flex-col gap-4 mq1125:w-full">
              <h2 className="m-0 text-3xl font-medium text-grays-black">Schedule Team Sync</h2>
              <div className="bg-blue-50 text-blue-800 p-6 rounded-[20px] border border-solid border-blue-200 flex flex-col gap-3">
                <span className="text-base font-bold">📋 View Only Access</span>
                <p className="m-0 text-sm font-['DM_Sans'] leading-6">
                  Only the workspace group manager (<strong>{activeGroup.members.find(m => m.id === activeGroup.managerId)?.name}</strong>) can schedule new syncs or edit existing ones.
                </p>
              </div>
            </div>
          )}

          {/* Scheduled Meetings List Section */}
          <div className="w-[55%] flex flex-col gap-6 mq1125:w-full">
            <h2 className="m-0 text-3xl font-medium text-grays-black">
              Scheduled Meetings ({meetings.length})
            </h2>

            {error && !isManager && (
              <div className="bg-red-50 text-red-600 px-5 py-3 rounded-[10px] border border-solid border-red-200 text-sm font-medium">
                {error}
              </div>
            )}
            {successMsg && !isManager && (
              <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-[10px] border border-solid border-blue-200 text-sm font-medium">
                {successMsg}
              </div>
            )}

            {meetings.length === 0 ? (
              <div className="w-full rounded-[30px] border border-dashed border-[#ccc] p-12 text-center text-lg text-[#888] font-['DM_Sans'] bg-[#fafafa]">
                No syncs planned for this workspace yet.
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-h-[900px] overflow-y-auto pr-2">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="w-full shadow-[0px_5px_0px_#0f172a] rounded-[30px] bg-[#fff] border-dark border-solid border-[1px] box-border p-6 flex flex-col gap-4 relative"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="m-0 text-2xl font-medium text-grays-black">
                          {meeting.title}
                        </h3>
                        <div className="text-base text-[#555] font-['DM_Sans']">
                          📅 {meeting.date} at ⏰ {meeting.time}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <span
                        className={`text-sm px-3.5 py-1.5 rounded-[12px] font-bold border border-solid ${
                          meeting.status === "Upcoming"
                            ? "bg-green text-white border-green"
                            : meeting.status === "Completed"
                            ? "bg-dark text-white border-dark"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>

                    <div className="border-t border-solid border-[#eee] pt-3">
                      <b className="text-base text-grays-black block mb-1">Agenda</b>
                      <p className="m-0 text-base text-[#555] leading-6 font-['DM_Sans']">
                        {meeting.agenda}
                      </p>
                    </div>

                    <div className="border-t border-solid border-[#eee] pt-3">
                      <b className="text-base text-grays-black block mb-1">Participants</b>
                      <div className="text-base text-[#555] font-['DM_Sans']">
                        👥 {meeting.participants}
                      </div>
                    </div>

                    {/* Google Meet Connection Segment */}
                    {meeting.status === "Upcoming" && (
                      <div className="border-t border-solid border-[#eee] pt-3 flex flex-col gap-2">
                        <b className="text-base text-grays-black block">Virtual Call Access</b>
                        {meeting.meetLink ? (
                          <div className="flex items-center justify-between gap-4 bg-blue-50/50 p-3.5 rounded-[14px] border border-solid border-[#2563eb]/20">
                            <span className="text-sm font-bold text-grays-black truncate font-['DM_Sans'] max-w-[250px]">
                              🔗 {meeting.meetLink}
                            </span>
                            <a
                              href={meeting.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer bg-dark text-white hover:bg-green hover:text-white font-bold text-sm px-4.5 py-2.5 rounded-[10px] no-underline shadow-[0px_2.5px_0px_#000] transition duration-200 shrink-0"
                            >
                              Join Call
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4 bg-grey p-3.5 rounded-[14px] border border-solid border-[#eee]">
                            <span className="text-sm text-[#777] font-['DM_Sans']">
                              No virtual meet link set up yet.
                            </span>
                            {isManager && (
                              <button
                                onClick={() => handleAddMeetLink(meeting.id)}
                                className="cursor-pointer bg-green border border-solid border-green px-4 py-2.5 rounded-[10px] text-sm font-bold text-white hover:bg-white hover:text-grays-black transition duration-200 shadow-[0px_2px_0px_#0f172a]"
                              >
                                Host a Meet
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Panel */}
                    <div className="flex justify-end gap-3 mt-2 pt-3 border-t border-solid border-[#eee]">
                      {isManager && meeting.status === "Upcoming" && (
                        <>
                          <button
                            onClick={() => handleComplete(meeting.id)}
                            className="cursor-pointer bg-green border border-solid border-green px-4 py-2 rounded-[10px] text-sm font-bold text-white hover:bg-[#fff] hover:text-grays-black transition duration-200"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleEdit(meeting)}
                            className="cursor-pointer bg-grey border border-solid border-[#ddd] px-4 py-2 rounded-[10px] text-sm font-bold text-grays-black hover:bg-white transition duration-200"
                          >
                            Edit Details
                          </button>
                          <button
                            onClick={() => handleCancel(meeting.id)}
                            className="cursor-pointer bg-red-50 border border-solid border-red-200 px-4 py-2 rounded-[10px] text-sm font-bold text-red-600 hover:bg-red-100 transition duration-200"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {!isManager && meeting.status === "Upcoming" && (
                        <span className="text-sm font-medium text-[#777] font-['DM_Sans']">
                          Waiting for meeting to start...
                        </span>
                      )}
                      {meeting.status !== "Upcoming" && (
                        <span className="text-sm font-medium text-[#aaa] font-['DM_Sans']">
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
