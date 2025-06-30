"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, Lock, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
import { RESET_PASSWORD } from "@/utils/api-endpoints"
import { showToast } from "@/utils/helpers/show-toast"

type ResetPasswordStep = "request" | "email-sent" | "reset-form" | "success"

interface ResetPasswordForm {
    email: string
    newPassword: string
    confirmPassword: string
    token: string
}

export default function NewPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const token = searchParams.get("token");
    console.log({ token });

    const [currentStep, setCurrentStep] = useState<ResetPasswordStep>("reset-form")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    const validatePassword = (password: string): boolean => {
        // At least 8 characters, one uppercase, one lowercase, one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        return passwordRegex.test(password)
    }

    const handlePasswordReset = async () => {
        if (!formData.newPassword) {
            setError("Please enter a new password")
            return
        }

        if (!validatePassword(formData.newPassword)) {
            setError("Password must be at least 8 characters with uppercase, lowercase, and number")
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (!token) {
            setError("Invalid reset token")
            return
        }

        setIsLoading(true)
        setError("")

        try {

            await axios.post(RESET_PASSWORD, { token, newPassword: formData.newPassword });

            // Move to success step
            setCurrentStep("success")
            startRedirectCountdown()
        } catch (error: any) {
            setError("Failed to reset password. Please try again.")
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false)
        }
    }

    const startRedirectCountdown = () => {
        setCountdown(5)
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    router.push("/login")
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleBackToLogin = () => {
        router.push("/auth/sign-in")
    }

    const renderResetFormStep = () => (
        <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                    <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
                <CardDescription>Enter your new password below.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                        <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => updateFormData("newPassword", e.target.value)}
                            placeholder="Enter new password"
                            className="pr-10"
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500">Must be at least 8 characters with uppercase, lowercase, and number</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                            placeholder="Confirm new password"
                            className="pr-10"
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <Button onClick={handlePasswordReset} disabled={isLoading} className="w-full">
                    {isLoading ? "Resetting..." : "Reset Password"}
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

    const renderSuccessStep = () => (
        <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-800">Password Reset Successful!</CardTitle>
                <CardDescription>Your password has been successfully updated.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">You can now log in with your new password.</AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Redirecting to login in {countdown} seconds...</span>
                    </div>

                    <Button onClick={handleBackToLogin} className="w-full">
                        Go to Login Now
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {currentStep === "reset-form" && renderResetFormStep()}
                {currentStep === "success" && renderSuccessStep()}
            </div>
        </div>
    )
}
