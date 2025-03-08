import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ message: "Users loaded Successfully",
    users},
    { status: 200 });
  } catch (error) {
    console.error("Error loading users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

export async function PUT(req: Request) {
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



// Delete a user
export async function DELETE(req: Request) {
  try {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.user.delete({ where: { id: Number(id) } });
  }
  catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  return NextResponse.json({ message: "User deleted" }, { status: 200 });
}