import { NextResponse } from "next/server";
import { readDB, writeDB } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const db = readDB();
    const existing = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
    };

    db.users.push(newUser);
    const success = writeDB(db);

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
