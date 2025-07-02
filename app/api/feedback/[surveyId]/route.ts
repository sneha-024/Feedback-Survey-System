import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Feedback, Survey } from "@/lib/models"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest, { params }: { params: { surveyId: string } }) {
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

    // Verify survey exists and belongs to the user
    const survey = await Survey.findOne({ _id: params.surveyId, createdBy: decoded.userId })
    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const feedback = await Feedback.find({ surveyId: params.surveyId })
      .sort({ submittedAt: -1 })
      .lean()

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { surveyId: string } }) {
  try {
    await connectDB()

    // Verify survey exists and is active
    const survey = await Survey.findById(params.surveyId)
    if (!survey || !survey.isActive) {
      return NextResponse.json({ error: "Survey not found or inactive" }, { status: 404 })
    }

    const { responses } = await request.json()

    // Get client info
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const feedback = await Feedback.create({
      surveyId: params.surveyId,
      responses,
      ipAddress,
      userAgent,
      submittedAt: new Date(),
    })

    return NextResponse.json({ success: true, feedbackId: feedback._id })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
