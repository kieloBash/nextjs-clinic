"use client"

import { useState, useMemo } from "react"
import type { User } from "next-auth"
import { format, formatDistanceToNow, isToday, isYesterday, startOfDay } from "date-fns"
import { Bell, BellRing, Search, Trash2, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

// Mock notification data based on your Prisma schema
const mockNotifications = [
    {
        id: "notif-001",
        userId: "doctor-123",
        message: "New appointment scheduled with Sarah Johnson for tomorrow at 2:00 PM",
        sentAt: new Date("2024-01-15T10:30:00"),
    },
    {
        id: "notif-002",
        userId: "doctor-123",
        message: "Payment of $150.00 received from Michael Chen",
        sentAt: new Date("2024-01-15T09:15:00"),
    },
    {
        id: "notif-003",
        userId: "doctor-123",
        message: "Appointment with Emily Rodriguez has been cancelled",
        sentAt: new Date("2024-01-14T16:45:00"),
    },
    {
        id: "notif-004",
        userId: "doctor-123",
        message: "Reminder: Complete patient notes for David Wilson's consultation",
        sentAt: new Date("2024-01-14T14:20:00"),
    },
    {
        id: "notif-005",
        userId: "doctor-123",
        message: "New patient registration: Lisa Thompson has joined your practice",
        sentAt: new Date("2024-01-14T11:30:00"),
    },
    {
        id: "notif-006",
        userId: "doctor-123",
        message: "Invoice #INV-2024-003 is overdue - Emily Rodriguez ($250.00)",
        sentAt: new Date("2024-01-13T08:00:00"),
    },
    {
        id: "notif-007",
        userId: "doctor-123",
        message: "System maintenance scheduled for tonight at 11:00 PM",
        sentAt: new Date("2024-01-12T15:00:00"),
    },
    {
        id: "notif-008",
        userId: "doctor-123",
        message: "Follow-up appointment requested by Robert Brown",
        sentAt: new Date("2024-01-12T13:45:00"),
    },
    {
        id: "notif-009",
        userId: "doctor-123",
        message: "Your schedule for tomorrow has been updated",
        sentAt: new Date("2024-01-11T17:30:00"),
    },
    {
        id: "notif-010",
        userId: "doctor-123",
        message: "Monthly report is ready for review",
        sentAt: new Date("2024-01-10T09:00:00"),
    },
]

const DoctorMainPage = ({ user }: { user: User }) => {
    const [searchTerm, setSearchTerm] = useState("")

    // Filter notifications based on search
    const filteredNotifications = useMemo(() => {
        return mockNotifications.filter((notification) =>
            notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    }, [searchTerm])

    // Group notifications by date
    const groupedNotifications = useMemo(() => {
        const groups: { [key: string]: typeof filteredNotifications } = {}

        filteredNotifications.forEach((notification) => {
            const date = startOfDay(notification.sentAt)
            let groupKey: string

            if (isToday(date)) {
                groupKey = "Today"
            } else if (isYesterday(date)) {
                groupKey = "Yesterday"
            } else {
                groupKey = format(date, "MMMM dd, yyyy")
            }

            if (!groups[groupKey]) {
                groups[groupKey] = []
            }
            groups[groupKey].push(notification)
        })

        // Sort groups by date (most recent first)
        const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
            if (a === "Today") return -1
            if (b === "Today") return 1
            if (a === "Yesterday") return -1
            if (b === "Yesterday") return 1
            return new Date(b).getTime() - new Date(a).getTime()
        })

        return sortedGroups
    }, [filteredNotifications])

    const handleDelete = (notificationId: string) => {
        console.log("Deleting notification:", notificationId)
        // In a real app, you would delete from the database here
    }

    const handleClearAll = () => {
        console.log("Clearing all notifications")
        // In a real app, you would delete all notifications from the database
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BellRing className="w-8 h-8" />
                        Notifications
                    </h1>
                    <p className="text-muted-foreground">Stay updated with your practice activities</p>
                </div>
                {mockNotifications.length > 0 && (
                    <Button variant="outline" onClick={handleClearAll}>
                        Clear All
                    </Button>
                )}
            </div>

            {/* Stats Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mockNotifications.length}</div>
                    <p className="text-xs text-muted-foreground">All notifications</p>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>View your recent notifications</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Notifications */}
                    <div className="space-y-6">
                        {groupedNotifications.map(([dateGroup, notifications]) => (
                            <div key={dateGroup}>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3">{dateGroup}</h3>
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start space-x-3 flex-1">
                                                <div className="flex-shrink-0 mt-1">
                                                    <Bell className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium leading-relaxed">{notification.message}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(notification.sentAt, "h:mm a")} •{" "}
                                                        {formatDistanceToNow(notification.sentAt, { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleDelete(notification.id)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}
                                </div>
                                {dateGroup !== groupedNotifications[groupedNotifications.length - 1][0] && (
                                    <Separator className="mt-6" />
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredNotifications.length === 0 && (
                        <div className="text-center py-12">
                            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm
                                    ? "Try adjusting your search to see more notifications."
                                    : "You're all caught up! No new notifications."}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default DoctorMainPage
