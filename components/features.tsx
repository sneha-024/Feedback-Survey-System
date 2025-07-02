import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Globe, Shield, Smartphone, TrendingUp, Users } from "lucide-react"

const features = [
  {
    icon: CheckCircle,
    title: "Easy Survey Creation",
    description: "Create professional surveys in minutes with our intuitive drag-and-drop builder.",
  },
  {
    icon: Globe,
    title: "Public Distribution",
    description: "Share surveys with unique URLs that work without requiring user registration.",
  },
  {
    icon: Shield,
    title: "Role-based Access",
    description: "Secure admin and user roles with proper authentication and authorization.",
  },
  {
    icon: Smartphone,
    title: "Mobile Responsive",
    description: "Beautiful, responsive design that works perfectly on all devices and screen sizes.",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Comprehensive analytics dashboard with charts, graphs, and detailed insights.",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Manage users, track responses, and organize feedback efficiently.",
  },
]

export function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to collect feedback</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you create, distribute, and analyze surveys effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
