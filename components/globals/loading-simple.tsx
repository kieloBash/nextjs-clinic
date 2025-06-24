"use client"

import { useEffect, useState } from "react"
import { Heart, Stethoscope, Activity, Calendar, Users } from "lucide-react"

export default function ModernClinicLoading({ message }: { message?: string }) {
  const [currentIcon, setCurrentIcon] = useState(0)
  const [progress, setProgress] = useState(0)

  const icons = [
    { icon: Heart, label: "Connecting to your health" },
    { icon: Stethoscope, label: "Preparing medical records" },
    { icon: Activity, label: "Syncing vital data" },
    { icon: Calendar, label: "Loading appointments" },
    { icon: Users, label: "Setting up your profile" },
  ]

  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length)
    }, 1200)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + Math.random() * 15
      })
    }, 300)

    return () => {
      clearInterval(iconInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const CurrentIcon = icons[currentIcon].icon

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-emerald-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-pink-500 rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 opacity-10 animate-float">
          <Heart className="w-8 h-8 text-red-400" />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-10 animate-float-delayed">
          <Stethoscope className="w-10 h-10 text-blue-400" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 opacity-10 animate-float">
          <Activity className="w-6 h-6 text-green-400" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 opacity-10 animate-float-delayed">
          <Calendar className="w-7 h-7 text-purple-400" />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Main Loading Animation */}
        <div className="relative mb-8">
          {/* Outer Ring */}
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-emerald-500 animate-spin"
              style={{ animationDuration: "2s" }}
            ></div>

            {/* Inner Ring */}
            <div className="absolute inset-3 rounded-full border-2 border-gray-100"></div>
            <div
              className="absolute inset-3 rounded-full border-2 border-transparent border-b-purple-500 border-l-pink-500 animate-spin"
              style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
            ></div>

            {/* Center Icon Container */}
            <div className="absolute inset-6 bg-gradient-to-br from-blue-500 via-emerald-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="bg-white rounded-full p-4 shadow-inner">
                <CurrentIcon className="w-8 h-8 text-gray-700 transition-all duration-500" />
              </div>
            </div>

            {/* Pulse Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-emerald-500/20 to-purple-600/20 animate-ping"></div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 bg-clip-text text-transparent mb-2">
            HealthCare Pro
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Advanced Medical Platform</span>
          </div>
        </div>

        {/* Dynamic Status */}
        <div className="mb-8">
          <p className="text-lg font-medium text-gray-700 mb-2 transition-all duration-500">
            {message || icons[currentIcon].label}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 opacity-60">
          <div className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full text-xs text-gray-600 border border-gray-200">
            Secure & HIPAA Compliant
          </div>
          <div className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full text-xs text-gray-600 border border-gray-200">
            Real-time Updates
          </div>
          <div className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full text-xs text-gray-600 border border-gray-200">
            AI-Powered Insights
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-100/30 to-transparent"></div>
    </div>
  )
}
