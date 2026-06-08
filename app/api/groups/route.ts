import { NextResponse } from "next/server";
import { readDB, writeDB, Group, GroupMember } from "../../lib/db";

// Helper to get userId
function getUserId(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("userId") || request.headers.get("x-user-id");
}

// Generate unique invite code like GRP-1234
function generateInviteCode(existingGroups: Group[]): string {
  while (true) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const code = `GRP-${num}`;
    if (!existingGroups.some((g) => g.code === code)) {
      return code;
    }
  }
}

export async function GET(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Missing User ID." }, { status: 401 });
    }

    const db = await readDB();
    // Filter groups where user is either the manager or a member
    const groups = db.groups.filter(
      (g) => g.managerId === userId || g.members.some((m) => m.id === userId)
    );

    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error("Groups GET error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const db = await readDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newGroup: Group = {
      id: "g_" + Date.now().toString(),
      name: name.trim(),
      code: generateInviteCode(db.groups),
      managerId: userId,
      members: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      ],
    };

    db.groups.push(newGroup);
    const success = await writeDB(db);

    if (!success) {
      return NextResponse.json({ error: "Failed to save group" }, { status: 500 });
    }

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error) {
    console.error("Groups POST error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}

// PUT is used to join a group using an invite code
export async function PUT(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || !code.trim()) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const db = await readDB();

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groupIndex = db.groups.findIndex((g) => g.code === cleanCode);
    if (groupIndex === -1) {
      return NextResponse.json({ error: "Invalid invite code. Group not found." }, { status: 404 });
    }

    const group = db.groups[groupIndex];

    // Check if already a member
    const alreadyMember = group.members.some((m) => m.id === userId);
    if (alreadyMember) {
      return NextResponse.json({ success: true, message: "Already a member of this group", group });
    }

    // Add member
    const newMember: GroupMember = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    group.members.push(newMember);
    db.groups[groupIndex] = group;

    const success = await writeDB(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
    }

    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error("Groups PUT error:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}
