"use client"
import { Users, Clock, CheckCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WaitingLineCardProps {
  totalInQueue: number
  patientPosition?: number // undefined if not in queue, number if in queue
  isLoading?: boolean
  onJoinQueue: () => void
  onLeaveQueue?: () => void
}

export function WaitingLineCard({
  totalInQueue,
  patientPosition,
  isLoading = false,
  onJoinQueue,
  onLeaveQueue,
}: WaitingLineCardProps) {
  const isInQueue = patientPosition !== undefined

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

  return (
    <Card className={`transition-all duration-200 ${isInQueue ? "border-blue-200 bg-blue-50/50" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Waiting Line
            </CardTitle>
            <CardDescription>
              {isInQueue
                ? "You're in the waiting line. We'll notify you when it's your turn."
                : "Join the waiting line when no time slots are available."}
            </CardDescription>
          </div>
          {totalInQueue > 0 && (
            <Badge variant="secondary" className="text-sm">
              {totalInQueue} {totalInQueue === 1 ? "person" : "people"} waiting
            </Badge>
          )}
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
          ) : isInQueue ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{patientPosition}</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">You're #{patientPosition} in line</p>
                    <p className="text-xs text-blue-600">Estimated wait: {getEstimatedWaitTime(patientPosition)}</p>
                  </div>
                </div>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>

              {patientPosition === 1 ? (
                <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                  <p className="text-xs text-green-700 font-medium">🎉 You're next! Please be ready.</p>
                </div>
              ) : patientPosition <= 3 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                  <p className="text-xs text-yellow-700">⏰ You're coming up soon!</p>
                </div>
              ) : null}
            </div>
          ) : (
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
          )}
        </div>

        {/* Action Button */}
        {isInQueue ? (
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={onLeaveQueue} disabled={isLoading}>
              {isLoading ? "Leaving queue..." : "Leave Queue"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We'll send you a notification when it's your turn
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button className="w-full" onClick={onJoinQueue} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? "Joining queue..." : "Join Waiting Line"}
            </Button>
            {totalInQueue > 0 && (
              <p className="text-xs text-center text-muted-foreground">You'll be #{totalInQueue + 1} in line</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
