"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, AlertTriangle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDateBaseOnTimeZone_Date } from "@/utils/helpers/date"
import axios from "axios"
import { showToast } from "@/utils/helpers/show-toast"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { CANCEL_PAYMENT_APPOINTMENT } from "@/utils/api-endpoints"
import { useQueryClient } from "@tanstack/react-query"
import { useLoading } from "@/components/providers/loading-provider"
import { KEY_GET_DOCTOR } from "../../../search-doctors/_hooks/keys"
import { KEY_GET_PATIENT_APPOINTMENTS } from "../../_hooks/keys"
import { KEY_GET_NOTIFICATIONS } from "../../../notifications/_hooks/keys"

interface CancelModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: any
    onConfirm: (appointmentId: string, reason: string) => void
}

export function CancelModal({ isOpen, onClose, appointment }: CancelModalProps) {
    const [reason, setReason] = useState("")
    const [customReason, setCustomReason] = useState("")
    const queryClient = useQueryClient()
    const { isLoading, setIsLoading } = useLoading();

    const handleConfirm = async () => {
        try {
            setIsLoading(true)
            const body = { appointmentId: appointment.id }
            const res = await axios.post(CANCEL_PAYMENT_APPOINTMENT, body);
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR + "-" + appointment.doctorId], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_PATIENT_APPOINTMENTS], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_NOTIFICATIONS], exact: false }),
            ]);

            onClose()
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = async () => {
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
                                <p className="text-sm text-muted-foreground">{appointment.doctor.phone}</p>
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
                                    {formatDateBaseOnTimeZone_Date(appointment.timeSlot.startTime).displayTime} - {formatDateBaseOnTimeZone_Date(appointment.timeSlot.endTime).displayTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Reason */}
                    <div className="space-y-4">
                        {/* <div>
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
                        </div> */}

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
                            disabled={isLoading}
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
