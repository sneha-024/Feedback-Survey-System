"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Users, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-bg"></div>

      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Collect Feedback
            <br />
            <span className="text-yellow-300">Drive Growth</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Create beautiful surveys, collect valuable feedback, and gain actionable insights to improve your products
            and services continuously.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="btn-hover bg-white text-black hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/feedback">
              <Button
                size="lg"
                variant="outline"
                className="btn-hover border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                Give Feedback
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 card-hover">
              <BarChart3 className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Smart Analytics</h3>
              <p className="text-white/80">Get detailed insights with beautiful charts and reports</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 card-hover">
              <Users className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Easy Sharing</h3>
              <p className="text-white/80">Share surveys with unique links, no login required</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 card-hover">
              <Zap className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Results</h3>
              <p className="text-white/80">See responses as they come in with live updates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
