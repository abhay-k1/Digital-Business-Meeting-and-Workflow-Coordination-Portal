import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseKey);

// Define basic interface schemas.
export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  password?: string;
}

export interface Meeting {
  id: string;
  userId: string;
  groupId?: string;
  title: string;
  date: string;
  time: string;
  agenda: string;
  participants: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  meetLink?: string;
}

export interface Task {
  id: string;
  userId: string;
  groupId?: string;
  assignedMemberId?: string;
  title: string;
  description: string;
  assignedMember: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  managerId: string;
  members: GroupMember[];
}

export interface Message {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    type: string;
    dataUrl: string;
  };
}

export interface DatabaseSchema {
  users: User[];
  meetings: Meeting[];
  tasks: Task[];
  groups: Group[];
  messages: Message[];
}

/**
 * Reads the database content from Supabase.
 */
export async function readDB(): Promise<DatabaseSchema> {
  try {
    const [
      { data: users, error: errUsers },
      { data: groups, error: errGroups },
      { data: meetings, error: errMeetings },
      { data: tasks, error: errTasks },
      { data: messages, error: errMessages }
    ] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("groups").select("*"),
      supabase.from("meetings").select("*"),
      supabase.from("tasks").select("*"),
      supabase.from("messages").select("*")
    ]);

    if (errUsers || errGroups || errMeetings || errTasks || errMessages) {
      console.error("Supabase select error:", { errUsers, errGroups, errMeetings, errTasks, errMessages });
    }

    return {
      users: users || [],
      groups: groups || [],
      meetings: meetings || [],
      tasks: tasks || [],
      messages: messages || []
    };
  } catch (error) {
    console.error("Error reading database:", error);
    return { users: [], meetings: [], tasks: [], groups: [], messages: [] };
  }
}

/**
 * Writes/upserts the database content to Supabase.
 */
export async function writeDB(data: DatabaseSchema): Promise<boolean> {
  try {
    const promises = [];
    if (data.users && data.users.length > 0) {
      promises.push(supabase.from("users").upsert(data.users));
    }
    if (data.groups && data.groups.length > 0) {
      promises.push(supabase.from("groups").upsert(data.groups));
    }
    if (data.meetings && data.meetings.length > 0) {
      promises.push(supabase.from("meetings").upsert(data.meetings));
    }
    if (data.tasks && data.tasks.length > 0) {
      promises.push(supabase.from("tasks").upsert(data.tasks));
    }
    if (data.messages && data.messages.length > 0) {
      promises.push(supabase.from("messages").upsert(data.messages));
    }
    const results = await Promise.all(promises);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      const errors = results.filter((r) => r.error).map((r) => r.error);
      console.error("Error writing to Supabase:", errors);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

