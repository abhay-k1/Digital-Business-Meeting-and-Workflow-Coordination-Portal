import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const { name, username, email, password } = await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Name, username, email, and password are required" },
        { status: 400 }
      );
    }

    const db = await readDB();
    const existing = db.users.find(
      (u) => 
        u.email.toLowerCase() === email.toLowerCase() || 
        (u.username || "").toLowerCase() === username.toLowerCase()
    );

    if (existing) {
      const errorMsg = existing.email.toLowerCase() === email.toLowerCase() 
        ? "Email is already registered" 
        : "Username is already taken";
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      username,
      email,
      password,
    };

    db.users.push(newUser);
    const success = await writeDB(db);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to write user to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
