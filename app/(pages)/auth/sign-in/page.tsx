"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Mail, Lock, Eye, EyeOff, Heart, Shield, Stethoscope, CheckCircle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useLoading } from "@/components/providers/loading-provider"
import { FormInput } from "@/components/forms/input"
import { signIn } from "next-auth/react";
import { showToast } from "@/utils/helpers/show-toast"
import { WELCOME_PROMPT } from "@/utils/constants"
import { loginFormSchema } from "./schema"

export default function SignInPage() {
    const { isLoading, setIsLoading } = useLoading();
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof loginFormSchema>) {
        try {
            setIsLoading(true)
            console.log("VALUES:", values)
            await signIn("credentials", {
                email: values.email, password: values.password
            }).then(() => {
                showToast("success", WELCOME_PROMPT)
                form.reset()
            })
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex justify-center items-center py-8 px-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
                <div
                    className="absolute top-40 right-20 w-16 h-16 bg-green-100 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute bottom-20 left-20 w-24 h-24 bg-red-100 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>
                <div
                    className="absolute bottom-40 right-10 w-12 h-12 bg-purple-100 rounded-full opacity-20 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                ></div>
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="space-y-4 pb-6">
                    {/* Logo/Brand Section */}
                    <div className="flex justify-center mb-2">
                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                            Sign in to access your healthcare dashboard
                        </CardDescription>
                    </div>

                    {/* Benefits badges */}
                    <div className="flex justify-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Shield className="w-3 h-3 mr-1" />
                            Secure Login
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Stethoscope className="w-3 h-3 mr-1" />
                            24/7 Access
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormInput
                                name="email"
                                control={form.control}
                                label="Email Address"
                                placeholder="doctor.email@example.com"
                                disabled={isLoading}
                                icon={Mail}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    disabled={isLoading}
                                                    type={showPassword ? "text" : "password"}
                                                    className="pl-10 pr-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                                    placeholder="Enter your password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                disabled={isLoading}
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Sign In
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
                    <div className="text-sm text-center text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            href="/auth/sign-up"
                            className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4 transition-colors"
                        >
                            Create one here
                        </Link>
                    </div>

                    <div className="text-xs text-center text-gray-500 max-w-sm">
                        By signing in, you agree to our{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
