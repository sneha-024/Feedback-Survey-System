"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, FileText, Share } from "lucide-react"
import { Navbar } from "@/components/navbar"

interface Question {
  id: string
  text: string
  type: "text" | "rating" | "multiple-choice"
  options?: string[]
}

export default function CreateSurveyPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", text: "", type: "text" }])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  if (!user || user.role !== "admin") {
    router.push("/login")
    return null
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "text",
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, options: [...(q.options || []), ""] } : q)))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.map((opt, idx) => (idx === optionIndex ? value : opt)),
            }
          : q,
      ),
    )
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.filter((_, idx) => idx !== optionIndex),
            }
          : q,
      ),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and description.",
        variant: "destructive",
      })
      return
    }

    if (questions.some((q) => !q.text.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all question texts.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/surveys/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      })

      if (response.ok) {
        const survey = await response.json()
        toast({
          title: "Success!",
          description: "Survey created successfully.",
        })

        // Show share URL
        const shareUrl = `${window.location.origin}/survey/${survey._id}`
        navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Share URL Copied!",
          description: `Survey URL copied to clipboard: ${shareUrl}`,
        })

        router.push("/analytics")
      } else {
        throw new Error("Failed to create survey")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-primary" />
            Create New Survey
          </h1>
          <p className="text-muted-foreground">Design your survey and start collecting valuable feedback</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
              <CardDescription>Basic information about your survey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  placeholder="Enter survey title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this survey is about"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Add questions to collect the feedback you need</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Question {index + 1}</Label>
                    {questions.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeQuestion(question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Question Text</Label>
                    <Input
                      placeholder="Enter your question"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Question Type</Label>
                    <select
                      className="w-full p-2 border rounded-md bg-background"
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                    >
                      <option value="text">Text Response</option>
                      <option value="rating">Rating (1-5)</option>
                      <option value="multiple-choice">Multiple Choice</option>
                    </select>
                  </div>

                  {question.type === "multiple-choice" && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <Input
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(question.id, optionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addOption(question.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addQuestion} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="btn-hover flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Survey"}
              <Share className="ml-2 h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
