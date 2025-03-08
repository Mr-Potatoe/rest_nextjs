import { NextResponse } from "next/server";
import { prisma, incrementRequestCount, getRequestCount } from "@/lib/prisma";

const MAX_REQUESTS_PER_DAY = 50;

// Get all users
export async function GET() {
  if (getRequestCount() >= MAX_REQUESTS_PER_DAY) {
    return NextResponse.json({ error: "Daily request limit reached." }, { status: 429 });
  }

  incrementRequestCount(); // Increment request count

  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ message: "Users loaded successfully", users }, { status: 200 });
  } catch (error) {
    console.error("Error loading users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new user
export async function POST(req: Request) {
  if (getRequestCount() >= MAX_REQUESTS_PER_DAY) {
    return NextResponse.json({ error: "Daily request limit reached." }, { status: 429 });
  }

  incrementRequestCount();

  try {
    const { name, email, age } = await req.json();

    if (!name || !email || !age) {
      return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { name, email, age },
    });

    return NextResponse.json({ message: "User added successfully!", user }, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update user
export async function PUT(req: Request) {
  if (getRequestCount() >= MAX_REQUESTS_PER_DAY) {
    return NextResponse.json({ error: "Daily request limit reached." }, { status: 429 });
  }

  incrementRequestCount();

  try {
    const { id, name, email, age } = await req.json();

    if (!id || !name || !email || !age) {
      return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email, age },
    });

    return NextResponse.json({ message: "User updated successfully!", updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete user
export async function DELETE(req: Request) {
  if (getRequestCount() >= MAX_REQUESTS_PER_DAY) {
    return NextResponse.json({ error: "Daily request limit reached." }, { status: 429 });
  }

  incrementRequestCount();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.user.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
