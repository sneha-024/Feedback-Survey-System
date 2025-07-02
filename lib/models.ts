import mongoose from "mongoose"

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Survey Schema
const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: [
    {
      id: String,
      text: String,
      type: {
        type: String,
        enum: ["text", "rating", "multiple-choice"],
      },
      options: [String],
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow anonymous feedback
  },
  responses: [
    {
      questionId: String,
      answer: mongoose.Schema.Types.Mixed, // Can be string, number, or array
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: String,
  userAgent: String,
})

export const User = mongoose.models.User || mongoose.model("User", userSchema)
export const Survey = mongoose.models.Survey || mongoose.model("Survey", surveySchema)
export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema)
