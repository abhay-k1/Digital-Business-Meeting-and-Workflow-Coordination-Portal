import fs from "fs";
import path from "path";

// Define the absolute path to the local database file.
const DB_PATH = path.join(process.cwd(), "db.json");

// Define basic interface schemas.
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export interface Meeting {
  id: string;
  userId: string;
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
  title: string;
  description: string;
  assignedMember: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
}

export interface DatabaseSchema {
  users: User[];
  meetings: Meeting[];
  tasks: Task[];
}

/**
 * Reads the database content from the file synchronously to ensure absolute consistency.
 */
export function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultDB: DatabaseSchema = { users: [], meetings: [], tasks: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), "utf-8");
      return defaultDB;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database:", error);
    return { users: [], meetings: [], tasks: [] };
  }
}

/**
 * Writes the database content to the file synchronously to prevent overlapping file locks.
 */
export function writeDB(data: DatabaseSchema): boolean {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}
