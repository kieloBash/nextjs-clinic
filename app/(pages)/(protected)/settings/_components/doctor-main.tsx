"use client"

import { useState } from "react"
import type { User } from "next-auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff, Save, Trash2, UserIcon, Lock, Phone, Mail, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ExtendedUser } from "@/auth"
import { useLoading } from "@/components/providers/loading-provider"
import axios from "axios"
import { showToast } from "@/utils/helpers/show-toast"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { useQueryClient } from "@tanstack/react-query"
import { UPDATE_DISABLED_USER, UPDATE_PASSWORD, UPDATE_PROFILE } from "@/utils/api-endpoints"
import { signOut } from "next-auth/react"

// Mock user data based on your User model
const mockUser = {
    id: "doctor-123",
    email: "doctor@clinic.com",
    name: "Dr. John Smith",
    image: "/placeholder.svg?height=100&width=100",
    phone: "+1 (555) 123-4567",
    roleId: "doctor-role",
    hashedPassword: "hashed_password_here",
}

// Form schemas
const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().optional(),
    image: z.string().optional(),
})

const passwordFormSchema = z
    .object({
        currentPassword: z.string().min(1, { message: "Current password is required" }),
        newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

const DoctorMainPage = ({ user }: { user: ExtendedUser }) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { isLoading, setIsLoading } = useLoading()

    // Profile form
    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.name ?? "",
            email: user?.email ?? "",
            phone: user?.phone ?? "",
            image: user?.image || "",
        },
    })

    // Password form
    const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
        console.log("Profile update:", values)
        try {
            // backend
            setIsLoading(true)

            const res = await axios.patch(UPDATE_PROFILE, { userId: user?.id, ...values });
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);

            setTimeout(() => {
                window.location.reload();
            }, 2000)

        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false)
        }
    }

    const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
        console.log("Password update:", values)
        try {
            // backend
            setIsLoading(true)

            const res = await axios.patch(UPDATE_PASSWORD, { userId: user?.id, ...values });
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);

            setTimeout(() => {
                window.location.reload();
            }, 2000)

        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false)
        }
    }

    const handleDisableAccount = async () => {
        console.log("Disabling account for user:", mockUser.id)
        try {
            setIsLoading(true);

            const res = await axios.patch(UPDATE_DISABLED_USER, {
                userId: user?.id, // Replace with actual user data from context/session
            });

            showToast("success", "Account Disabled", res.data.message);

            setTimeout(() => {
                signOut(); // Triggers logout, e.g., via NextAuth
            }, 1500);
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>Update your personal information and profile details</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            {/* Profile Image */}
                            {/* <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={mockUser.image || "/placeholder.svg"} />
                                    <AvatarFallback className="text-lg">
                                        {mockUser.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <FormField
                                        control={profileForm.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Profile Image URL</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center space-x-2">
                                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                        <Input placeholder="https://example.com/image.jpg" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div> */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={profileForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center space-x-2">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    <Input {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={profileForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <Input type="email" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={profileForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <Input placeholder="(555) 123-4567" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">User ID:</span>
                                    <code className="text-sm bg-muted px-2 py-1 rounded">{user?.id}</code>
                                </div>
                            </div>

                            <Button type="submit" className="w-full sm:w-auto">
                                <Save className="w-4 h-4 mr-2" />
                                Save Profile Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>Update your account password for security</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    placeholder="Enter your current password"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showNewPassword ? "text" : "password"}
                                                        placeholder="Enter new password"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm new password"
                                                        {...field}
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
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full sm:w-auto">
                                <Lock className="w-4 h-4 mr-2" />
                                Update Password
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Account Management */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        Account Management
                    </CardTitle>
                    <CardDescription>Manage your account status and data</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-2">Disable Account</h4>
                            <p className="text-sm text-red-700 mb-4">
                                Disabling your account will prevent you from logging in and accessing the system. This action can be
                                reversed by contacting support.
                            </p>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Disable My Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to disable your account?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will prevent you from logging in to your account. You can contact support to re-enable
                                            your account later. Your data will be preserved.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDisableAccount} className="bg-red-600 hover:bg-red-700">
                                            Yes, Disable Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default DoctorMainPage
