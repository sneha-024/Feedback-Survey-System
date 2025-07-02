import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { Survey } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()

    const { title, description, questions } = await request.json()

    const survey = await Survey.create({
      title,
      description,
      questions,
      createdBy: decoded.userId,
      createdAt: new Date(),
    })

    return NextResponse.json(survey)
  } catch (error) {
    console.error("Survey creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
