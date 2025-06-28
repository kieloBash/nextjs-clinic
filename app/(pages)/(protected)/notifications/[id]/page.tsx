"use client"

import { useMemo, useState } from "react"
import {
    ArrowLeft,
    Bell,
    Calendar,
    Clock,
    User,
    Trash2,
    BookMarkedIcon as MarkAsUnread,
    CheckCheck,
    AlertCircle,
    Info,
    CheckCircle,
    XCircle,
    Archive,
    Reply,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useParams, useRouter } from "next/navigation"
import useNotification from "../_hooks/use-notification"
import MainLoadingPage from "@/components/globals/main-loading"

interface NotificationData {
    id: string
    userId: string
    message: string
    sentAt: Date
    isRead?: boolean
    type?: "info" | "success" | "warning" | "error"
    priority?: "low" | "medium" | "high"
    user: {
        id: string
        name: string
        email: string
        image?: string
        role: string
    }
}

// Mock notification data - replace with actual data fetching
const mockNotification: NotificationData = {
    id: "notif-001",
    userId: "user-002",
    message:
        "Your appointment with Dr. Sarah Wilson has been confirmed for tomorrow at 2:00 PM. Please arrive 15 minutes early for check-in. If you need to reschedule, please contact us at least 24 hours in advance.",
    sentAt: new Date("2024-01-15T14:30:00"),
    isRead: false,
    type: "success",
    priority: "high",
    user: {
        id: "user-002",
        name: "John Smith",
        email: "john.smith@email.com",
        image: "/placeholder.svg?height=40&width=40",
        role: "patient",
    },
}

export default function SingleNotificationPage() {

    const params = useParams()
    const router = useRouter()
    const notificationId = params.id as string

    const data = useNotification({ id: notificationId });

    console.log({ data })

    const notification = useMemo(() => {
        return data?.payload;
    }, [data])

    // const [notification, setNotification] = useState<NotificationData>(mockNotification)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    const getTimeAgo = (date: Date) => {
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) {
            return "Just now"
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60)
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600)
            return `${hours} hour${hours > 1 ? "s" : ""} ago`
        } else {
            const days = Math.floor(diffInSeconds / 86400)
            return `${days} day${days > 1 ? "s" : ""} ago`
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case "warning":
                return <AlertCircle className="w-5 h-5 text-yellow-600" />
            case "error":
                return <XCircle className="w-5 h-5 text-red-600" />
            default:
                return <Info className="w-5 h-5 text-blue-600" />
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Priority</Badge>
            case "medium":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Priority</Badge>
            case "low":
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Low Priority</Badge>
            default:
                return null
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "doctor":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Doctor</Badge>
            case "patient":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Patient</Badge>
            case "admin":
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>
            default:
                return <Badge variant="secondary">{role}</Badge>
        }
    }

    const handleGoBack = () => {
        router.back();
    }

    const handleGoToAllNotifications = () => {
        router.push("/notifications")
    }

    if (data.isLoading || data.isFetching)
        return <MainLoadingPage />

    if (!notification)
        return <div className="">No notification found with that id</div>


    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={handleGoBack} className="p-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notification Details</h1>
                            <p className="text-gray-600">View and manage notification</p>
                        </div>
                    </div>

                    {/* <div className="flex items-center space-x-2">
                        {!notification.isRead ? (
                            <Button variant="outline" onClick={handleMarkAsRead} disabled={isLoading}>
                                <CheckCheck className="w-4 h-4 mr-2" />
                                Mark as Read
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={handleMarkAsUnread} disabled={isLoading}>
                                <MarkAsUnread className="w-4 h-4 mr-2" />
                                Mark as Unread
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleArchive} disabled={isLoading}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                        </Button>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isLoading}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div> */}
                </div>

                {/* Notification Card */}
                <Card className="shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Bell className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="flex items-center space-x-2">
                                        <span>Notification</span>
                                        {/* {!notification.isRead && (
                                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Unread</Badge>
                                        )} */}
                                    </CardTitle>
                                    <CardDescription className="flex items-center space-x-4 mt-1">
                                        <span className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(new Date(notification.sentAt))}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatTime(new Date(notification.sentAt))}</span>
                                        </span>
                                        <span className="text-gray-500">({getTimeAgo(new Date(notification.sentAt))})</span>
                                    </CardDescription>
                                </div>
                            </div>

                            {/* <div className="flex items-center space-x-2">
                                {notification.type && getNotificationIcon(notification.type)}
                                {notification.priority && getPriorityBadge(notification.priority)}
                            </div> */}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Notification Message */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">Message</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{notification.message}</p>
                            </div>
                        </div>
                        
                        <Separator />

                        {/* Notification Metadata */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Notification ID</label>
                                    <p className="text-sm text-gray-800 font-mono bg-gray-100 p-2 rounded">{notification.id}</p>
                                </div>
                                {/* <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <p className="text-sm">
                                        {notification.isRead ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Read</Badge>
                                        ) : (
                                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Unread</Badge>
                                        )}
                                    </p>
                                </div> */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Sent Date</label>
                                    <p className="text-sm text-gray-800">{formatDate(new Date(notification.sentAt))}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Sent Time</label>
                                    <p className="text-sm text-gray-800">{formatTime(new Date(notification.sentAt))}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            {/* <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                    <Reply className="w-4 h-4 mr-2" />
                                    Reply
                                </Button>
                            </div> */}
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={handleGoToAllNotifications}>
                                    Back to Notifications
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
