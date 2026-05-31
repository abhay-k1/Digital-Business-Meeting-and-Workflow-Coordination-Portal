import { NextResponse } from "next/server";
import { readDB, writeDB, Meeting } from "../../lib/db";

// Helper to get userId from request headers
function getUserId(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("userId") || request.headers.get("x-user-id");
}

function generateGoogleMeetLink(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
}

export async function GET(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Missing User ID." }, { status: 401 });
    }

    const db = readDB();
    const meetings = db.meetings.filter((m) => m.userId === userId);
    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error("Meetings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, date, time, agenda, participants, generateMeet } = await request.json();

    if (!title || !date || !time || !agenda || !participants) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const db = readDB();
    const newMeeting: Meeting = {
      id: "m_" + Date.now().toString(),
      userId,
      title,
      date,
      time,
      agenda,
      participants,
      status: "Upcoming",
      meetLink: generateMeet ? generateGoogleMeetLink() : undefined,
    };

    db.meetings.push(newMeeting);
    const success = writeDB(db);

    if (!success) {
      return NextResponse.json({ error: "Failed to save meeting" }, { status: 500 });
    }

    return NextResponse.json({ success: true, meeting: newMeeting });
  } catch (error) {
    console.error("Meetings POST error:", error);
    return NextResponse.json({ error: "Failed to schedule meeting" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, date, time, agenda, participants, status, meetLink } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    const db = readDB();
    const meetingIndex = db.meetings.findIndex((m) => m.id === id && m.userId === userId);

    if (meetingIndex === -1) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const currentMeeting = db.meetings[meetingIndex];
    db.meetings[meetingIndex] = {
      ...currentMeeting,
      title: title ?? currentMeeting.title,
      date: date ?? currentMeeting.date,
      time: time ?? currentMeeting.time,
      agenda: agenda ?? currentMeeting.agenda,
      participants: participants ?? currentMeeting.participants,
      status: status ?? currentMeeting.status,
      meetLink: meetLink !== undefined ? meetLink : currentMeeting.meetLink,
    };

    const success = writeDB(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
    }

    return NextResponse.json({ success: true, meeting: db.meetings[meetingIndex] });
  } catch (error) {
    console.error("Meetings PUT error:", error);
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
  }
}
