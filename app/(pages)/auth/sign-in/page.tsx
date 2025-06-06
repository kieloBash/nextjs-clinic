"use client"

import axios from "axios"
import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Phone, User, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doctorFormSchema, patientFormSchema } from "./schema"
import { REGISTER_ACCOUNT } from "@/utils/api-endpoints"
import { toast } from "sonner"
import { useLoading } from "@/components/providers/loading-provider"
import { showToast } from "@/utils/helpers/show-toast"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"

export default function SignupPage() {
    const [activeTab, setActiveTab] = useState("patient")
    const { isLoading, setIsLoading } = useLoading();
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
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
            patientForm.reset();
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
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
            doctorForm.reset();
        }
    }


    return (
        <div className="min-h-screen flex justify-center items-center py-6">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">Sign up for our clinic services</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="patient" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="patient">
                                <User className="w-4 h-4 mr-2" />
                                Patient
                            </TabsTrigger>
                            <TabsTrigger value="doctor">
                                <UserCog className="w-4 h-4 mr-2" />
                                Doctor
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="patient">
                            <Form {...patientForm}>
                                <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
                                    <FormField
                                        control={patientForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} placeholder="your name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={patientForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} placeholder="your.email@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={patientForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} type="password" {...field} />
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
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={patientForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center">
                                                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                                        <Input disabled={isLoading} placeholder="(123) 456-7890" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button disabled={isLoading} type="submit" className="w-full">
                                        Sign Up as Patient
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="doctor">
                            <Form {...doctorForm}>
                                <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-4">
                                    <FormField
                                        control={doctorForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} placeholder="your name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={doctorForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} placeholder="doctor.email@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={doctorForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} type="password" {...field} />
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
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={doctorForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center">
                                                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                                        <Input disabled={isLoading} placeholder="(123) 456-7890" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={doctorForm.control}
                                        name="specialization"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Specialization</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isLoading} placeholder="e.g., Cardiology, Pediatrics" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button disabled={isLoading} type="submit" className="w-full">
                                        Sign Up as Doctor
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
                            Log in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
