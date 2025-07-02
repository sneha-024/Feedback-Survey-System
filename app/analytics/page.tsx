"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { BarChart3, Users, FileText, TrendingUp, Eye, Share, Calendar } from "lucide-react"
import Link from "next/link"

interface Survey {
  _id: string
  title: string
  description: string
  createdAt: string
  responseCount: number
}

export default function AnalyticsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "admin") {
      router.push("/")
      return
    }

    fetchSurveys()
  }, [user, router])

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/surveys/my-surveys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSurveys(data)
      }
    } catch (error) {
      console.error("Error fetching surveys:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyShareUrl = (surveyId: string) => {
    const shareUrl = `${window.location.origin}/survey/${surveyId}`
    navigator.clipboard.writeText(shareUrl)
    // You could add a toast notification here
  }

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
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  const totalResponses = surveys.reduce((sum, survey) => sum + survey.responseCount, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor your surveys and analyze feedback data</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{surveys.length}</div>
              <p className="text-xs text-muted-foreground">Active surveys created</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses}</div>
              <p className="text-xs text-muted-foreground">Feedback submissions received</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {surveys.length > 0 ? Math.round(totalResponses / surveys.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Responses per survey</p>
            </CardContent>
          </Card>
        </div>

        {/* Surveys List */}
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Surveys</CardTitle>
                <CardDescription>Manage and analyze your survey performance</CardDescription>
              </div>
              <Link href="/create-survey">
                <Button className="btn-hover">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Survey
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {surveys.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No surveys yet</h3>
                <p className="text-muted-foreground mb-6">Create your first survey to start collecting feedback</p>
                <Link href="/create-survey">
                  <Button className="btn-hover">Create Survey</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.map((survey) => (
                  <div
                    key={survey._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{survey.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{survey.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {survey.responseCount} responses
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/analytics/${survey._id}`}>
                        <Button variant="outline" size="sm" className="btn-hover bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShareUrl(survey._id)}
                        className="btn-hover"
                      >
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
