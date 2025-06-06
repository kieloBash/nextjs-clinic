"use client"
import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Phone, User, UserCog, Eye, EyeOff, Mail, Lock, Stethoscope, Heart, Shield, CheckCircle } from "lucide-react"
import axios from "axios";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FormInput } from "@/components/forms/input"
import { REGISTER_ACCOUNT } from "@/utils/api-endpoints"
import { showToast } from "@/utils/helpers/show-toast"
import { APP_NAME, CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { useLoading } from "@/components/providers/loading-provider"
import { doctorFormSchema, patientFormSchema } from "./schema"

export default function SignUpPage() {
    const [activeTab, setActiveTab] = useState("patient")
    const { isLoading, setIsLoading } = useLoading();
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Patient form
    const patientForm = useForm<z.infer<typeof patientFormSchema>>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
        },
    })

    // Doctor form
    const doctorForm = useForm<z.infer<typeof doctorFormSchema>>({
        resolver: zodResolver(doctorFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            specialization: "",
        },
    })

    async function onPatientSubmit(values: z.infer<typeof patientFormSchema>) {

        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("role", "PATIENT");
        formData.append("password", values.password);

        try {
            setIsLoading(true)
            const res = await axios.post(REGISTER_ACCOUNT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message)
            patientForm.reset();
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }


    async function onDoctorSubmit(values: z.infer<typeof doctorFormSchema>) {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("specialization", values.specialization);
        formData.append("role", "DOCTOR");
        formData.append("password", values.password);

        console.log(values)

        try {
            setIsLoading(true)
            const res = await axios.post(REGISTER_ACCOUNT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message)
            doctorForm.reset();
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex justify-center items-center py-8 px-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-100 rounded-full opacity-20 animate-pulse"></div>
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

            <Card className="w-full max-w-lg relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
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
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                            Join {APP_NAME}+
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                            Your trusted medical partner for better health
                        </CardDescription>
                    </div>

                    {/* Benefits badges */}
                    <div className="flex justify-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Shield className="w-3 h-3 mr-1" />
                            Secure
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Stethoscope className="w-3 h-3 mr-1" />
                            Professional
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Heart className="w-3 h-3 mr-1" />
                            Caring
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Tabs defaultValue="patient" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100 p-1 rounded-xl">
                            <TabsTrigger
                                value="patient"
                                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                            >
                                <User className="w-4 h-4" />
                                <span className="font-medium">Patient</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="doctor"
                                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                            >
                                <UserCog className="w-4 h-4" />
                                <span className="font-medium">Doctor</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="patient" className="space-y-0">
                            <Form {...patientForm}>
                                <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-5">
                                    <FormInput
                                        control={patientForm.control}
                                        name="name"
                                        label="Name"
                                        placeholder="Enter your full name"
                                        icon={User}
                                    />
                                    <FormInput
                                        control={patientForm.control}
                                        name="email"
                                        label="Email Address"
                                        placeholder="your.email@example.com"
                                        icon={Mail}
                                    />
                                    <FormInput
                                        control={patientForm.control}
                                        name="phone"
                                        label="Phone Number"
                                        placeholder="(123) 456-7890"
                                        icon={Phone}
                                        disabled={isLoading}
                                    />
                                    <FormField
                                        control={patientForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            disabled={isLoading}
                                                            type={showPassword ? "text" : "password"}
                                                            className="pl-10 pr-10 h-10 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                                                            placeholder="Create a strong password"
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

                                    <FormField
                                        control={patientForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            disabled={isLoading}
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            className="pl-10 pr-10 h-10 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                                                            placeholder="Confirm your password"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                        className="w-full h-12 bg-gradient-to-r from-primary to-emerald-700 hover:from-primary hover:to-emerald-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Creating Account...
                                            </div>
                                        ) : (
                                            "Create Patient Account"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="doctor" className="space-y-0">
                            <Form {...doctorForm}>
                                <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-5">
                                    <FormInput
                                        name="name"
                                        control={doctorForm.control}
                                        label="Full Name"
                                        placeholder="Dr. Your Name"
                                        disabled={isLoading}
                                        icon={User}
                                    />

                                    <FormInput
                                        name="email"
                                        control={doctorForm.control}
                                        label="Email Address"
                                        placeholder="doctor.email@example.com"
                                        disabled={isLoading}
                                        icon={Mail}
                                    />

                                    <FormInput
                                        name="phone"
                                        control={doctorForm.control}
                                        label="Phone Number"
                                        placeholder="(123) 456-7890"
                                        disabled={isLoading}
                                        icon={Phone}
                                    />

                                    <FormInput
                                        name="specialization"
                                        control={doctorForm.control}
                                        label="Medical Specialization"
                                        placeholder="e.g., Cardiology, Pediatrics, Internal Medicine"
                                        disabled={isLoading}
                                        icon={Stethoscope}
                                    />

                                    <FormField
                                        control={doctorForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            disabled={isLoading}
                                                            type={showPassword ? "text" : "password"}
                                                            className="pl-10 pr-10 h-10 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                                                            placeholder="Create a strong password"
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

                                    <FormField
                                        control={doctorForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            disabled={isLoading}
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            className="pl-10 pr-10 h-10 border-gray-200 focus:border-primary focus:ring-primary transition-colors"
                                                            placeholder="Confirm your password"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                        className="w-full h-12 bg-gradient-to-r from-primary to-emerald-700 hover:from-primary hover:to-emerald-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Creating Account...
                                            </div>
                                        ) : (
                                            "Create Doctor Account"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
                    <div className="text-sm text-center text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/auth/sign-in"
                            className="text-primary hover:text-emerald-700 font-medium underline underline-offset-4 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </div>

                    <div className="text-xs text-center text-gray-500 max-w-sm">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
