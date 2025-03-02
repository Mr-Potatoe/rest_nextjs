import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users, { status: 200 });
}

export async function POST(req: Request) {
    try {
      const { name, email, age } = await req.json();
      if (!name || !email || !age) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
  
      const user = await prisma.user.create({
        data: { name, email, age },
      });
  
      return NextResponse.json(user, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
  
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
    await prisma.user.delete({ where: { id: Number(id) } });
  
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  }