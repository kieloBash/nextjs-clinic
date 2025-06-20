"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, AlertTriangle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CancelModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: any
    onConfirm: (appointmentId: string, reason: string) => void
    isLoading: boolean
}

export function CancelModal({ isOpen, onClose, appointment, onConfirm, isLoading }: CancelModalProps) {
    const [reason, setReason] = useState("")
    const [customReason, setCustomReason] = useState("")

    const predefinedReasons = [
        "Schedule conflict",
        "Feeling better",
        "Emergency came up",
        "Doctor unavailable",
        "Personal reasons",
        "Other",
    ]

    const handleConfirm = () => {
        const finalReason = reason === "Other" ? customReason : reason
        if (finalReason.trim()) {
            onConfirm(appointment.id, finalReason)
        }
    }

    const handleClose = () => {
        setReason("")
        setCustomReason("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Cancel Appointment
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Appointment Info */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={appointment.doctor.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                    {appointment.doctor.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{appointment.doctor.name}</p>
                                <p className="text-sm text-muted-foreground">{appointment.doctor.specialization}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{format(appointment.date, "EEEE, MMMM dd")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Reason */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Reason for cancellation</label>
                            <Select value={reason} onValueChange={setReason} disabled={isLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {predefinedReasons.map((reasonOption) => (
                                        <SelectItem key={reasonOption} value={reasonOption}>
                                            {reasonOption}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {reason === "Other" && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Please specify</label>
                                <Textarea
                                    placeholder="Please provide more details..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    disabled={isLoading}
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Cancelling this appointment may affect your booking history. Please reschedule if
                            you still need medical attention.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                            Keep Appointment
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!reason || (reason === "Other" && !customReason.trim()) || isLoading}
                            variant="destructive"
                        >
                            {isLoading ? "Cancelling..." : "Cancel Appointment"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
