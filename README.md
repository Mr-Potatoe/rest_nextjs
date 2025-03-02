### **Full Setup for API Testing in VS Code with Next.js, Prisma, and MySQL**
This guide will help you set up **Next.js (App Router)** with **Prisma (MySQL)** and **REST Client in VS Code** to test your API endpoints.

---

## **1️⃣ Install Dependencies**
First, create a Next.js app and install required dependencies.

### **Step 1: Create a Next.js App**
```sh
npx create-next-app@latest my-app
cd my-app
```

### **Step 2: Install Prisma and MySQL**
```sh
npm install @prisma/client
npm install --save-dev prisma
npm install mysql2
```

---

## **2️⃣ Configure Prisma with MySQL**
### **Step 1: Initialize Prisma**
```sh
npx prisma init
```
This will create a `.env` file and a `prisma/schema.prisma` file.

### **Step 2: Configure MySQL Database**
Open `.env` and set up your MySQL connection:
```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/mydatabase"
```

### **Step 3: Define Prisma Schema**
Edit `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  age   Int
}
```

### **Step 4: Migrate Database**
```sh
npx prisma migrate dev --name init
```

---

## **3️⃣ Create Next.js API Routes**
Inside `app/api/users/route.ts`, implement CRUD operations.

### **✅ GET: Fetch Users**
```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users, { status: 200 });
}
```

### **✅ POST: Create a User**
```typescript
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
```

### **✅ DELETE: Remove a User**
```typescript
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.user.delete({ where: { id: Number(id) } });

  return NextResponse.json({ message: "User deleted" }, { status: 200 });
}
```

---

## **4️⃣ Set Up REST Client for Testing**
### **Step 1: Install REST Client in VS Code**
- Open **VS Code** → Extensions (`Ctrl + Shift + X` or `Cmd + Shift + X`).
- Search for **"REST Client"** (by Huachao Mao) and install it.

### **Step 2: Create API Test File**
Inside your project, create **`api-test.http`**.

### **Step 3: Add Sample Requests**
```http
### Get all users
GET http://localhost:3000/api/users

### Create a new user
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "age": 30
}

### Delete a user
DELETE http://localhost:3000/api/users?id=1
```

---

## **5️⃣ Set Up Environment Variables for REST Client**
To switch between local and production environments easily:

1. Create a folder `.vscode`.
2. Inside `.vscode`, create a file **`rest-client.env.json`**.
3. Add:
```json
{
  "local": {
    "base_url": "http://localhost:3000"
  },
  "production": {
    "base_url": "https://my-api.com"
  }
}
```
Now, in **`api-test.http`**, use:
```http
### Get users
GET {{base_url}}/api/users
```
It will use **local** or **production** URLs automatically.

---

## **6️⃣ Running the API**
### **Start MySQL Server**
Make sure your MySQL server is running.

### **Run Prisma Studio (Optional)**
```sh
npx prisma studio
```
This lets you **view and edit the database** in a UI.

### **Start Next.js Server**
```sh
npm run dev
```
Now, test the API with **REST Client in VS Code**.

---

## **Why Use This Setup?**
✅ **Fast & Lightweight** – No need for Postman.  
✅ **Version Control** – Store API tests in the repo.  
✅ **Automated Testing** – Run API tests directly in VS Code.  
✅ **Easy Environment Switching** – Local vs. production testing.  

Do you need authentication (JWT) and middleware setup next? 🚀