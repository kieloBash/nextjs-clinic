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
import useNotifications from "../_hooks/use-notifications"
import { useLoading } from "@/components/providers/loading-provider"
import { showToast } from "@/utils/helpers/show-toast"
import axios from "axios"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { useQueryClient } from "@tanstack/react-query"
import { CLEAR_NOTIFICATIONS } from "@/utils/api-endpoints"
import { KEY_GET_NOTIFICATIONS } from "../_hooks/keys"
import MainLoadingPage from "@/components/globals/main-loading"


const DoctorMainPage = ({ user }: { user: User }) => {
    const [searchTerm, setSearchTerm] = useState("")

    const data = useNotifications({ userId: user.id });
    const { setIsLoading } = useLoading();
    const queryClient = useQueryClient();

    // Filter notifications based on search
    const filteredNotifications = useMemo(() => {
        return data?.payload?.filter((notification) =>
            notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ?? []
    }, [searchTerm, data])

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

    const handleClearAll = async () => {
        try {
            // backend
            setIsLoading(true)

            const res = await axios.delete(CLEAR_NOTIFICATIONS + `/${user.id}`);
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_NOTIFICATIONS], exact: false }),
            ]);

        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false)
        }
    }

    if (data.isLoading) {
        return <MainLoadingPage />
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
                {data?.payload && data?.payload?.length > 0 && (
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
                    <div className="text-2xl font-bold">{data?.payload?.length}</div>
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

                                            {/* <DropdownMenu>
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
                                            </DropdownMenu> */}
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
