import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Survey } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const surveys = await Survey.find({ isActive: true })
      .select("title description createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json(surveys)
  } catch (error) {
    console.error("Error fetching public surveys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
