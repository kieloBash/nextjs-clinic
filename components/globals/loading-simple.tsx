"use client"

import { Loader2, Heart } from "lucide-react"

export default function SimpleLoadingPage({ message }: { message?: string }) {
    return (
        <div className="w-full h-full bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
            <div className="text-center">
                {/* Animated Logo */}
                <div className="relative mb-8">
                    <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-emerald-200 border-t-primary rounded-full animate-spin"></div>
                </div>

                {/* Loading Text */}
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading HealthCare</h2>
                <p className="text-gray-600 mb-6">{message ? message : "Please wait while we prepare your experience"}</p>
            </div>
        </div>
    )
}
