"use client"
import { Users, Clock, CheckCircle, Plus, AlertTriangle, Phone, PlayCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type QueueStatus = "WAITING" | "APPROVED" | "SKIPPED" | "COMPLETED" | "CANCELLED"

interface WaitingLineCardProps {
    totalInQueue: number
    patientPosition?: number
    patientStatus?: QueueStatus
    isLoading?: boolean
    onJoinQueue: () => void
    onLeaveQueue?: () => void
    onJoinBackQueue?: () => void
    onRespondToCall?: () => void // For when patient is called/approved
}

export function WaitingLineCard({
    totalInQueue,
    patientPosition,
    patientStatus,
    isLoading = false,
    onJoinQueue,
    onLeaveQueue,
    onRespondToCall,
    onJoinBackQueue
}: WaitingLineCardProps) {
    const isInQueue = patientPosition !== undefined && patientStatus !== undefined

    const getEstimatedWaitTime = (position: number) => {
        // Assuming 30 minutes per patient on average
        const estimatedMinutes = position * 30
        if (estimatedMinutes < 60) {
            return `${estimatedMinutes} minutes`
        }
        const hours = Math.floor(estimatedMinutes / 60)
        const minutes = estimatedMinutes % 60
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? "s" : ""}`
    }

    const getStatusInfo = (status: QueueStatus) => {
        switch (status) {
            case "WAITING":
                return {
                    icon: <Clock className="w-5 h-5 text-blue-500" />,
                    color: "blue",
                    bgColor: "bg-blue-50 border-blue-200",
                    textColor: "text-blue-900",
                    badgeColor: "bg-blue-100 text-blue-800",
                }
            case "APPROVED":
                return {
                    icon: <Phone className="w-5 h-5 text-green-500" />,
                    color: "green",
                    bgColor: "bg-green-50 border-green-200",
                    textColor: "text-green-900",
                    badgeColor: "bg-green-100 text-green-800",
                }
            case "SKIPPED":
                return {
                    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
                    color: "orange",
                    bgColor: "bg-orange-50 border-orange-200",
                    textColor: "text-orange-900",
                    badgeColor: "bg-orange-100 text-orange-800",
                }
            case "COMPLETED":
                return {
                    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
                    color: "green",
                    bgColor: "bg-green-50 border-green-200",
                    textColor: "text-green-900",
                    badgeColor: "bg-green-100 text-green-800",
                }
            case "CANCELLED":
                return {
                    icon: <X className="w-5 h-5 text-red-500" />,
                    color: "red",
                    bgColor: "bg-red-50 border-red-200",
                    textColor: "text-red-900",
                    badgeColor: "bg-red-100 text-red-800",
                }
            default:
                return {
                    icon: <Clock className="w-5 h-5 text-gray-500" />,
                    color: "gray",
                    bgColor: "bg-gray-50 border-gray-200",
                    textColor: "text-gray-900",
                    badgeColor: "bg-gray-100 text-gray-800",
                }
        }
    }

    const renderStatusContent = () => {
        if (!isInQueue || !patientStatus) return null

        const statusInfo = getStatusInfo(patientStatus)

        switch (patientStatus) {
            case "WAITING":
                return (
                    <div className={`${statusInfo.bgColor} border rounded-lg p-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-600">#{patientPosition}</span>
                                </div>
                                <div>
                                    <p className={`font-medium ${statusInfo.textColor}`}>You're #{patientPosition} in line</p>
                                    <p className="text-xs text-blue-600">Estimated wait: {getEstimatedWaitTime(patientPosition!)}</p>
                                </div>
                            </div>
                            {statusInfo.icon}
                        </div>

                        {patientPosition === 1 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                                <p className="text-xs text-yellow-700 font-medium">🔔 You're next! Please be ready.</p>
                            </div>
                        ) : patientPosition! <= 3 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                                <p className="text-xs text-yellow-700">⏰ You're coming up soon!</p>
                            </div>
                        ) : null}
                    </div>
                )

            case "APPROVED":
                return (
                    <div className={`${statusInfo.bgColor} border rounded-lg p-4`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <PlayCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className={`font-medium ${statusInfo.textColor}`}>You're being called!</p>
                                    <p className="text-xs text-green-600">Please proceed to the consultation room</p>
                                </div>
                            </div>
                            {statusInfo.icon}
                        </div>

                        <div className="bg-green-100 border border-green-300 rounded p-3 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-sm text-green-800 font-medium">🎉 It's your turn now!</p>
                            </div>
                            <p className="text-xs text-green-700 mt-1">The doctor is ready to see you.</p>
                        </div>
                    </div>
                )

            case "SKIPPED":
                return (
                    <div className={`${statusInfo.bgColor} border rounded-lg p-4`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className={`font-medium ${statusInfo.textColor}`}>You were skipped</p>
                                    <p className="text-xs text-orange-600">You didn't respond when called</p>
                                </div>
                            </div>
                            {statusInfo.icon}
                        </div>

                        <div className="bg-orange-100 border border-orange-300 rounded p-3 mb-3">
                            <p className="text-sm text-orange-800 font-medium">⚠️ You missed your turn</p>
                            <p className="text-xs text-orange-700 mt-1">
                                You can rejoin the queue or contact the clinic for assistance.
                            </p>
                        </div>
                    </div>
                )

            case "COMPLETED":
                return (
                    <div className={`${statusInfo.bgColor} border rounded-lg p-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className={`font-medium ${statusInfo.textColor}`}>Consultation completed</p>
                                    <p className="text-xs text-green-600">Thank you for your visit</p>
                                </div>
                            </div>
                            {statusInfo.icon}
                        </div>
                    </div>
                )

            case "CANCELLED":
                return (
                    <div className={`${statusInfo.bgColor} border rounded-lg p-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <X className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <p className={`font-medium ${statusInfo.textColor}`}>Queue cancelled</p>
                                    <p className="text-xs text-red-600">Your queue entry was cancelled</p>
                                </div>
                            </div>
                            {statusInfo.icon}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const renderActionButtons = () => {
        if (!isInQueue || !patientStatus) {
            return (
                <div className="space-y-2">
                    <Button className="w-full" onClick={onJoinQueue} disabled={isLoading}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isLoading ? "Joining queue..." : "Join Waiting Line"}
                    </Button>
                    {totalInQueue > 0 && (
                        <p className="text-xs text-center text-muted-foreground">You'll be #{totalInQueue + 1} in line</p>
                    )}
                </div>
            )
        }

        switch (patientStatus) {
            case "WAITING":
                return (
                    <div className="space-y-2">
                        <Button variant="outline" className="w-full" onClick={onLeaveQueue} disabled={isLoading}>
                            {isLoading ? "Leaving queue..." : "Leave Queue"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">We'll notify you when it's your turn</p>
                    </div>
                )

            case "APPROVED":
                return (
                    <div className="space-y-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onRespondToCall} disabled={isLoading}>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {isLoading ? "Responding..." : "I'm Here!"}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={onLeaveQueue} disabled={isLoading}>
                            Can't Make It
                        </Button>
                    </div>
                )

            case "SKIPPED":
                return (
                    <div className="space-y-2">
                        <Button className="w-full" onClick={() => {
                            if (onJoinBackQueue) {
                                onJoinBackQueue()
                            }
                        }} disabled={isLoading}>
                            <Plus className="w-4 h-4 mr-2" />
                            {isLoading ? "Rejoining..." : "Rejoin Queue"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">You'll be added to the end of the queue</p>
                    </div>
                )

            case "COMPLETED":
            case "CANCELLED":
                return (
                    <div className="space-y-2">
                        <Button className="w-full" onClick={onJoinQueue} disabled={isLoading}>
                            <Plus className="w-4 h-4 mr-2" />
                            {isLoading ? "Joining..." : "Join Queue Again"}
                        </Button>
                    </div>
                )

            default:
                return null
        }
    }

    const getStatusBadge = () => {
        if (!patientStatus) {
            return totalInQueue > 0 ? (
                <Badge variant="secondary" className="text-sm">
                    {totalInQueue} {totalInQueue === 1 ? "person" : "people"} waiting
                </Badge>
            ) : null
        }

        const statusInfo = getStatusInfo(patientStatus)
        const statusLabels = {
            WAITING: "Waiting",
            APPROVED: "Called",
            SKIPPED: "Skipped",
            COMPLETED: "Completed",
            CANCELLED: "Cancelled",
        }

        return <Badge className={statusInfo.badgeColor}>{statusLabels[patientStatus]}</Badge>
    }

    return (
        <Card className={`transition-all duration-200 ${isInQueue ? "border-blue-200" : ""}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Waiting Line
                        </CardTitle>
                        <CardDescription>
                            {patientStatus === "APPROVED"
                                ? "You're being called! Please proceed to the consultation room."
                                : patientStatus === "SKIPPED"
                                    ? "You were skipped. You can rejoin the queue if needed."
                                    : patientStatus === "COMPLETED"
                                        ? "Your consultation has been completed."
                                        : patientStatus === "CANCELLED"
                                            ? "Your queue entry was cancelled."
                                            : isInQueue
                                                ? "You're in the waiting line. We'll notify you when it's your turn."
                                                : "Join the waiting line when no time slots are available."}
                        </CardDescription>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Queue Status */}
                <div className="space-y-3">
                    {totalInQueue === 0 && !isInQueue ? (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm text-muted-foreground">No one is currently waiting</p>
                            <p className="text-xs text-muted-foreground">Be the first to join the queue!</p>
                        </div>
                    ) : !isInQueue ? (
                        <div className="text-center py-2">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">
                                    {totalInQueue} {totalInQueue === 1 ? "person is" : "people are"} currently waiting
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Estimated wait if you join: {getEstimatedWaitTime(totalInQueue + 1)}
                            </p>
                        </div>
                    ) : (
                        renderStatusContent()
                    )}
                </div>

                {/* Action Buttons */}
                {renderActionButtons()}
            </CardContent>
        </Card>
    )
}
