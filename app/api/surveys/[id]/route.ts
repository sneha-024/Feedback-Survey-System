import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Survey } from "@/lib/models"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const survey = await Survey.findById(params.id).select("-createdBy")

    if (!survey || !survey.isActive) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error("Error fetching survey:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
