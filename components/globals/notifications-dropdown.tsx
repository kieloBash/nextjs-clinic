"use client"

import { useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User } from "next-auth"
import useNotifications from "@/app/(pages)/(protected)/notifications/_hooks/use-notifications"
import { Badge } from "../ui/badge"
import { useRouter } from "next/navigation"

export function NotificationsDropdown({ user }: { user: User }) {
    const router = useRouter();
    const data = useNotifications({ userId: user.id });
    const notifications = useMemo(() => {
        return data?.payload ?? []
    }, [data])
    // const [notifications, setNotifications] = useState(mockNotifications)
    const [isOpen, setIsOpen] = useState(false)

    const unreadCount = notifications.length // In a real app, you'd track read status
    const notifsCount = notifications.length

    // const handleDelete = (notificationId: string) => {
    //     setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    // }

    const handleViewAll = () => {
        setIsOpen(false)
        // Navigate to notifications page

        console.log("Navigate to notifications page")
        router.push("/notifications")
    }

    const handleViewNotification = (id: string) => {
        router.push(`/notifications/${id}`)
    }

    const truncateMessage = (message: string, maxLength = 60) => {
        return message.length > maxLength ? message.substring(0, maxLength) + "..." : message
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {/* {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />} */}
                    {notifsCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {notifsCount > 99 ? "99+" : notifsCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {/* {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {unreadCount} new
                        </Badge>
                    )} */}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length > 0 ? (
                    <>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-1">
                                {notifications.slice(0, 5).map((notification) => (
                                    <div
                                        onClick={() => handleViewNotification(notification.id)}
                                        key={notification.id}
                                        className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-sm transition-colors"
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-relaxed">{truncateMessage(notification.message)}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(notification.sentAt, { addSuffix: true })}
                                            </p>
                                        </div>
                                        {/* <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(notification.id)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button> */}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleViewAll} className="text-center justify-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View All Notifications
                        </DropdownMenuItem>
                    </>
                ) : (
                    <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No new notifications</p>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
