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

    const db = readDB();
    const tasks = db.tasks.filter((t) => t.userId === userId);
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

    const { title, description, assignedMember, deadline, priority } = await request.json();

    if (!title || !description || !assignedMember || !deadline || !priority) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const db = readDB();
    const newTask: Task = {
      id: "t_" + Date.now().toString(),
      userId,
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
    const taskIndex = db.tasks.findIndex((t) => t.id === id && t.userId === userId);

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
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
