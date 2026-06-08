import { NextResponse } from "next/server";
import { readDB, writeDB, Message } from "../../lib/db";

// Helper to get userId from request headers/search params
function getUserId(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("userId") || request.headers.get("x-user-id");
}

export async function GET(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Missing User ID." }, { status: 401 });
    }

    const url = new URL(request.url);
    const groupId = url.searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "Missing Group ID." }, { status: 400 });
    }

    const db = await readDB();
    
    // Verify user is member of the group
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const isMember = group.managerId === userId || group.members.some((m) => m.id === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied. Not a member of this group." }, { status: 403 });
    }

    // Filter messages for this group
    const messages = db.messages.filter((m) => m.groupId === groupId);

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, userName, content, fileAttachment } = await request.json();

    if (!groupId || !userName || (!content?.trim() && !fileAttachment)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await readDB();
    
    // Verify group exists and user is member
    const group = db.groups.find((g) => g.id === groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const isMember = group.managerId === userId || group.members.some((m) => m.id === userId);
    if (!isMember) {
      return NextResponse.json({ error: "Access denied. Not a member of this group." }, { status: 403 });
    }

    const newMessage: Message = {
      id: "msg_" + Date.now().toString() + "_" + Math.random().toString(36).substr(2, 5),
      groupId,
      userId,
      userName: userName.trim(),
      content: (content || "").trim(),
      timestamp: new Date().toISOString(),
      fileAttachment: fileAttachment || undefined,
    };

    db.messages.push(newMessage);
    const success = await writeDB(db);

    if (!success) {
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Messages POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
