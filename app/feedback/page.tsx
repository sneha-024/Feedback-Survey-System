"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Search, MessageSquare, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PublicSurvey {
  _id: string
  title: string
  description: string
  createdAt: string
}

export default function FeedbackPage() {
  const [surveys, setSurveys] = useState<PublicSurvey[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [surveyUrl, setSurveyUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPublicSurveys()
  }, [])

  const fetchPublicSurveys = async () => {
    try {
      const response = await fetch("/api/surveys/public")
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

  const handleDirectAccess = () => {
    if (!surveyUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a survey URL.",
        variant: "destructive",
      })
      return
    }

    // Extract survey ID from URL or use as direct ID
    let surveyId = surveyUrl.trim()
    if (surveyUrl.includes("/survey/")) {
      surveyId = surveyUrl.split("/survey/")[1]
    }

    window.open(`/survey/${surveyId}`, "_blank")
  }

  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-primary" />
            Give Feedback
          </h1>
          <p className="text-muted-foreground">Share your thoughts and help improve products and services</p>
        </div>

        {/* Direct Survey Access */}
        <Card className="card-hover mb-8">
          <CardHeader>
            <CardTitle>Access Survey Directly</CardTitle>
            <CardDescription>Have a survey link? Enter it below to access it directly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter survey URL or ID..."
                value={surveyUrl}
                onChange={(e) => setSurveyUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleDirectAccess} className="btn-hover">
                <ExternalLink className="h-4 w-4 mr-2" />
                Access Survey
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Surveys */}
        <Card className="card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Surveys</CardTitle>
                <CardDescription>Browse and participate in public surveys</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading surveys...</p>
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{searchTerm ? "No surveys found" : "No surveys available"}</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Check back later for new surveys to participate in"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSurveys.map((survey) => (
                  <Card key={survey._id} className="card-hover">
                    <CardHeader>
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{survey.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(survey.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          className="btn-hover"
                          onClick={() => window.open(`/survey/${survey._id}`, "_blank")}
                        >
                          Take Survey
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
