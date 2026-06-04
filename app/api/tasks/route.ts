import { NextResponse } from "next/server";
import { readDB, writeDB, Task } from "../../lib/db";

// Helper to get userId from request headers
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

    const db = readDB();
    let tasks;

    if (groupId) {
      const group = db.groups.find((g) => g.id === groupId);
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      const isManager = group.managerId === userId;
      if (isManager) {
        // Manager sees all tasks assigned within this group
        tasks = db.tasks.filter((t) => t.groupId === groupId);
      } else {
        // Employees see only tasks assigned to them within this group
        tasks = db.tasks.filter((t) => t.groupId === groupId && t.assignedMemberId === userId);
      }
    } else {
      // Fallback: show tasks created by user OR assigned to user
      tasks = db.tasks.filter((t) => t.userId === userId || t.assignedMemberId === userId);
    }

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, assignedMember, deadline, priority, groupId, assignedMemberId } = await request.json();

    if (!title || !description || !assignedMember || !deadline || !priority) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const db = readDB();
    const newTask: Task = {
      id: "t_" + Date.now().toString(),
      userId,
      groupId,
      assignedMemberId,
      title,
      description,
      assignedMember,
      deadline,
      priority,
      status: "Pending",
    };

    db.tasks.push(newTask);
    const success = writeDB(db);

    if (!success) {
      return NextResponse.json({ error: "Failed to save task" }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ error: "Failed to allocate task" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, assignedMember, deadline, priority, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const db = readDB();
    // Allow modification if user is the creator (manager) OR the assigned member
    const taskIndex = db.tasks.findIndex(
      (t) => t.id === id && (t.userId === userId || t.assignedMemberId === userId)
    );

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    const currentTask = db.tasks[taskIndex];
    db.tasks[taskIndex] = {
      ...currentTask,
      title: title ?? currentTask.title,
      description: description ?? currentTask.description,
      assignedMember: assignedMember ?? currentTask.assignedMember,
      deadline: deadline ?? currentTask.deadline,
      priority: priority ?? currentTask.priority,
      status: status ?? currentTask.status,
    };

    const success = writeDB(db);
    if (!success) {
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: db.tasks[taskIndex] });
  } catch (error) {
    console.error("Tasks PUT error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
