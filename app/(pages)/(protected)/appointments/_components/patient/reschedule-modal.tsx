"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface RescheduleModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: any
    onConfirm: (appointmentId: string, newDate: Date, newTimeSlot: string) => void
    isLoading: boolean
}

export function RescheduleModal({ isOpen, onClose, appointment, onConfirm, isLoading }: RescheduleModalProps) {
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("")

    // Mock available dates and time slots
    const availableDates = [
        { value: "2024-01-17", label: "Tomorrow - Jan 17" },
        { value: "2024-01-18", label: "Thursday - Jan 18" },
        { value: "2024-01-19", label: "Friday - Jan 19" },
        { value: "2024-01-22", label: "Monday - Jan 22" },
        { value: "2024-01-23", label: "Tuesday - Jan 23" },
    ]

    const availableTimeSlots = [
        { value: "09:00-09:30", label: "9:00 AM - 9:30 AM" },
        { value: "10:00-10:30", label: "10:00 AM - 10:30 AM" },
        { value: "11:00-11:30", label: "11:00 AM - 11:30 AM" },
        { value: "14:00-14:30", label: "2:00 PM - 2:30 PM" },
        { value: "15:00-15:30", label: "3:00 PM - 3:30 PM" },
        { value: "16:00-16:30", label: "4:00 PM - 4:30 PM" },
    ]

    const handleConfirm = () => {
        if (selectedDate && selectedTimeSlot) {
            onConfirm(appointment.id, new Date(selectedDate), selectedTimeSlot)
        }
    }

    const handleClose = () => {
        setSelectedDate("")
        setSelectedTimeSlot("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Appointment Info */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Current Appointment</h3>
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

                    <Separator />

                    {/* New Date Selection */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Select New Date & Time</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Available Dates</label>
                                <Select value={selectedDate} onValueChange={setSelectedDate} disabled={isLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDates.map((date) => (
                                            <SelectItem key={date.value} value={date.value}>
                                                {date.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Available Time Slots</label>
                                <Select
                                    value={selectedTimeSlot}
                                    onValueChange={setSelectedTimeSlot}
                                    disabled={!selectedDate || isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTimeSlots.map((slot) => (
                                            <SelectItem key={slot.value} value={slot.value}>
                                                {slot.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedDate || !selectedTimeSlot || isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? "Rescheduling..." : "Confirm Reschedule"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
