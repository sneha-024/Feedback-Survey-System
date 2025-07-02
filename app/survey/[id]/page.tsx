"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Star, Send, CheckCircle } from "lucide-react"

interface Question {
  id: string
  text: string
  type: "text" | "rating" | "multiple-choice"
  options?: string[]
}

interface Survey {
  _id: string
  title: string
  description: string
  questions: Question[]
}

export default function PublicSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchSurvey()
  }, [params.id])

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${params.id}`)
      if (response.ok) {
        const surveyData = await response.json()
        setSurvey(surveyData)
      } else {
        toast({
          title: "Error",
          description: "Survey not found or no longer available.",
          variant: "destructive",
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching survey:", error)
      toast({
        title: "Error",
        description: "Failed to load survey.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!survey) return

    // Validate all questions are answered
    const unansweredQuestions = survey.questions.filter(
      (q) => !responses[q.id] || (Array.isArray(responses[q.id]) && responses[q.id].length === 0),
    )

    if (unansweredQuestions.length > 0) {
      toast({
        title: "Please answer all questions",
        description: "All questions are required to submit feedback.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/feedback/${survey._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses: Object.entries(responses).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted successfully.",
        })
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case "text":
        return (
          <Textarea
            placeholder="Enter your response..."
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            required
          />
        )

      case "rating":
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, rating)}
                className={`p-1 transition-colors ${
                  responses[question.id] >= rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                }`}
              >
                <Star className="h-8 w-8 fill-current" />
              </button>
            ))}
            <span className="ml-4 text-sm text-muted-foreground">
              {responses[question.id] ? `${responses[question.id]}/5` : "Click to rate"}
            </span>
          </div>
        )

      case "multiple-choice":
        return (
          <RadioGroup
            value={responses[question.id] || ""}
            onValueChange={(value) => handleResponseChange(question.id, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading survey...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your feedback has been submitted successfully. We appreciate your time and input.
            </p>
            <Button onClick={() => router.push("/")} className="btn-hover">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-2">Survey Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The survey you're looking for doesn't exist or is no longer available.
            </p>
            <Button onClick={() => router.push("/")} className="btn-hover">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="card-hover">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{survey.title}</CardTitle>
            <CardDescription className="text-lg">{survey.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <Label className="text-base font-medium mb-3 block">{question.text}</Label>
                      {renderQuestion(question)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t">
                <Button type="submit" className="w-full btn-hover" disabled={submitting} size="lg">
                  {submitting ? "Submitting..." : "Submit Feedback"}
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
