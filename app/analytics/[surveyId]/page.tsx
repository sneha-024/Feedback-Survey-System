"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, BarChart3, Users, FileText, Calendar, PieChart, BarChart, ListChecks } from "lucide-react"
import Link from "next/link"

interface SurveyResponse {
  _id: string
  surveyId: string
  answers: Record<string, string | string[]>
  createdAt: string
}

interface Question {
  id: string
  text: string // Changed from 'question' to match the backend model
  type: 'text' | 'multiple_choice' | 'rating' | 'single_choice'
  options?: string[]
  required?: boolean
}

interface SurveyDetails {
  _id: string
  title: string
  description: string
  questions: Question[]
  createdAt: string
  responseCount: number
  responses: SurveyResponse[]
  isActive?: boolean
  createdBy?: string
}

export default function SurveyAnalyticsPage() {
  const [survey, setSurvey] = useState<SurveyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('summary')

  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const surveyId = params.surveyId as string

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "admin") {
      router.push("/")
      return
    }



    fetchSurveyDetails()
  }, [user, router, surveyId])

  const fetchSurveyDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("token")
      
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      const [surveyResponse, responsesResponse] = await Promise.all([
        fetch(`/api/surveys/${surveyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/feedback/${surveyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])

      if (!surveyResponse.ok) {
        throw new Error(`Failed to fetch survey: ${await surveyResponse.text()}`)
      }
      if (!responsesResponse.ok) {
        throw new Error(`Failed to fetch responses: ${await responsesResponse.text()}`)
      }

      const surveyData = await surveyResponse.json()
      const responsesData = await responsesResponse.json()
      
      if (!surveyData || !Array.isArray(responsesData)) {
        throw new Error('Invalid response format from server')
      }

      const transformedResponses = responsesData.map((response: any) => {
        const answersObject = (response.responses || []).reduce((acc: any, res: any) => {
          if (res.questionId) {
            acc[res.questionId] = res.answer
          }
          return acc
        }, {})

        return {
          _id: response._id,
          surveyId: response.surveyId,
          answers: answersObject,
          createdAt: response.submittedAt,
        }
      })

      setSurvey({
        ...surveyData,
        responseCount: responsesData.length,
        responses: transformedResponses,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      console.error("Error in fetchSurveyDetails:", error)
      setError(`Error loading survey data: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const getAnswerStats = (questionId: string) => {
    if (!survey) return { total: 0, answers: {} }

    const answers: Record<string, number> = {}
    let total = 0

    survey.responses.forEach(response => {
      const answer = response.answers[questionId]
      if (answer !== undefined && answer !== null) {
        if (Array.isArray(answer)) {
          answer.forEach(a => {
            if (a) {
              answers[a] = (answers[a] || 0) + 1
              total++
            }
          })
        } else if (answer !== '') {
          answers[String(answer)] = (answers[String(answer)] || 0) + 1
          total++
        }
      }
    })
    return { total, answers }
  }



  const renderSummaryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Survey Overview</CardTitle>
          <CardDescription>Key metrics for your survey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Total Responses</span>
              </div>
              <div className="text-2xl font-bold">{survey?.responseCount || 0}</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Created On</span>
              </div>
              <div className="text-lg">
                {survey ? new Date(survey.createdAt).toLocaleDateString() : '-'}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Questions</span>
              </div>
              <div className="text-2xl font-bold">{survey?.questions.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question Analytics</CardTitle>
          <CardDescription>Response statistics for each question</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {survey?.questions.map((question, index) => {
            const { total, answers } = getAnswerStats(question.id)
            const answerEntries = Object.entries(answers)
            
            return (
              <div key={question.id} className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">
                  {index + 1}. {question.text}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({total} {total === 1 ? 'response' : 'responses'})
                  </span>
                </h3>
                
                {total > 0 ? (
                  <div className="space-y-3">
                    {question.type === 'multiple_choice' || question.type === 'rating' ? (
                      <div className="space-y-2">
                        {answerEntries.map(([answer, count]) => (
                          <div key={answer} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{answer}</span>
                              <span className="font-medium">
                                {Math.round((count / total) * 100)}% ({count})
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${(count / total) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <ListChecks className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                        <p className="text-center text-sm text-muted-foreground">
                          {total} text response{total !== 1 ? 's' : ''} received
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No responses yet for this question
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )

  const renderResponsesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Individual Responses</CardTitle>
        <CardDescription>View each response in detail</CardDescription>
      </CardHeader>
      <CardContent>
        {survey?.responses.length ? (
          <div className="space-y-6">
            {survey.responses.map((response, index) => (
              <div key={response._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Response #{index + 1}</h3>
                  <span className="text-sm text-muted-foreground">
                    {new Date(response.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-4">
                  {survey.questions.map(question => (
                    <div key={question.id}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        {question.text}
                      </h4>
                      <p className="text-sm">
                        {response.answers[question.id] || <span className="text-muted-foreground">No response</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No responses received yet for this survey
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading survey details...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Fetching data from the server...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium mb-2">Error Loading Survey</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-x-4">
              <Button onClick={() => fetchSurveyDetails()} variant="outline">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </Button>
              <Button onClick={() => router.push('/analytics')} variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-2">Survey not found</h2>
            <p className="text-muted-foreground mb-6">The requested survey could not be found or you don't have permission to view it.</p>
            <Button onClick={() => router.push('/analytics')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/analytics')}
            className="mb-4 px-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{survey.title}</h1>
              <p className="text-muted-foreground">{survey.description}</p>
            </div>
            <div className="flex items-center space-x-2">


            </div>
          </div>


        </div>

        <div className="border-b mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2 inline" />
              Summary
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'responses'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              <ListChecks className="h-4 w-4 mr-2 inline" />
              Responses ({survey.responseCount})
            </button>
          </nav>
        </div>

        {activeTab === 'summary' ? renderSummaryTab() : renderResponsesTab()}
      </div>
    </div>
  )
}
