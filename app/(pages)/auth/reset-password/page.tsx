"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, Lock, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
import { RESET_EMAIL } from "@/utils/api-endpoints"
import { showToast } from "@/utils/helpers/show-toast"

type ResetPasswordStep = "request" | "email-sent" | "reset-form" | "success"

interface ResetPasswordForm {
    email: string
    newPassword: string
    confirmPassword: string
    token: string
}

export default function ResetPasswordPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState<ResetPasswordStep>("request")
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState<ResetPasswordForm>({
        email: "",
        newPassword: "",
        confirmPassword: "",
        token: "",
    })

    const updateFormData = (field: keyof ResetPasswordForm, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        // Clear error when user starts typing
        if (error) setError("")
    }

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleRequestReset = async () => {
        if (!formData.email.trim()) {
            setError("Please enter your email address")
            return
        }

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            console.log("Password reset requested for:", formData.email)
            const res = await axios.post(RESET_EMAIL, { email: formData.email })

            if (res.status === 200) {
                // Move to email sent step
                setCurrentStep("email-sent")
                startCountdown()
            }

        } catch (error: any) {
            setError("Failed to send reset email. Please try again.")
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false)
        }
    }


    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleResendEmail = async () => {
        setIsLoading(true)
        try {
            // Simulate API call to resend email
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log("Reset email resent to:", formData.email)
            startCountdown()
        } catch (error) {
            setError("Failed to resend email. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToLogin = () => {
        router.push("/auth/sign-in")
    }

    const renderRequestStep = () => (
        <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                    <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription>Enter your email address and we'll send you a link to reset your password.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="Enter your email address"
                        className={error && !validateEmail(formData.email) ? "border-red-500" : ""}
                        disabled={isLoading}
                    />
                </div>

                <Button onClick={handleRequestReset} disabled={isLoading} className="w-full">
                    {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                    <Button variant="ghost" onClick={handleBackToLogin} className="text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const renderEmailSentStep = () => (
        <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                    <Mail className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                <CardDescription>
                    We've sent a password reset link to <strong>{formData.email}</strong>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        Click the link in your email to reset your password. The link will expire in 15 minutes.
                    </AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">Didn't receive the email? Check your spam folder.</p>

                    <Button
                        variant="outline"
                        onClick={handleResendEmail}
                        disabled={isLoading || countdown > 0}
                        className="w-full"
                    >
                        {countdown > 0 ? `Resend in ${countdown}s` : isLoading ? "Sending..." : "Resend Email"}
                    </Button>

                    {/* Demo button to simulate clicking email link */}
                    {/* <div className="pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-2">Demo: Simulate clicking email link</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTokenReceived("demo-reset-token-123")}
                            className="text-xs"
                        >
                            Simulate Email Link Click
                        </Button>
                    </div> */}
                </div>

                <div className="text-center">
                    <Button variant="ghost" onClick={handleBackToLogin} className="text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {currentStep === "request" && renderRequestStep()}
                {currentStep === "email-sent" && renderEmailSentStep()}
            </div>
        </div>
    )
}
