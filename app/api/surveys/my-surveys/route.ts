import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { Survey, Feedback } from "@/lib/models"

export async function GET(request: NextRequest) {
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

    const surveys = await Survey.find({ createdBy: decoded.userId }).sort({ createdAt: -1 }).lean()

    // Get response counts for each survey
    const surveysWithCounts = await Promise.all(
      surveys.map(async (survey) => {
        const responseCount = await Feedback.countDocuments({ surveyId: survey._id })
        return {
          ...survey,
          responseCount,
        }
      }),
    )

    return NextResponse.json(surveysWithCounts)
  } catch (error) {
    console.error("Error fetching surveys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
