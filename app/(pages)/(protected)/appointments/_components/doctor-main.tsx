"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns"
import { Calendar, Clock, Plus, Settings, User as UserIcon, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User } from "next-auth"
import CreateTimeSlotModal from "./timeslot-create-modal"

// Mock data for appointments
const mockAppointments = [
    {
        id: 1,
        patientName: "John Smith",
        patientEmail: "john.smith@email.com",
        patientPhone: "(555) 123-4567",
        date: "2024-12-07",
        time: "09:00",
        duration: 30,
        type: "Consultation",
        status: "confirmed",
    },
    {
        id: 2,
        patientName: "Sarah Johnson",
        patientEmail: "sarah.j@email.com",
        patientPhone: "(555) 987-6543",
        date: "2024-12-07",
        time: "10:30",
        duration: 45,
        type: "Follow-up",
        status: "confirmed",
    },
    {
        id: 3,
        patientName: "Mike Davis",
        patientEmail: "mike.davis@email.com",
        patientPhone: "(555) 456-7890",
        date: "2024-12-08",
        time: "14:00",
        duration: 30,
        type: "Check-up",
        status: "pending",
    },
    {
        id: 4,
        patientName: "Emily Wilson",
        patientEmail: "emily.w@email.com",
        patientPhone: "(555) 321-0987",
        date: "2024-12-09",
        time: "11:00",
        duration: 60,
        type: "Consultation",
        status: "confirmed",
    },
]

// Mock data for available time slots
const mockTimeSlots = [
    {
        id: 1,
        date: "2024-12-10",
        startTime: "09:00",
        endTime: "12:00",
        duration: 30,
    },
    {
        id: 2,
        date: "2024-12-10",
        startTime: "14:00",
        endTime: "17:00",
        duration: 45,
    },
    {
        id: 3,
        date: "2024-12-11",
        startTime: "10:00",
        endTime: "15:00",
        duration: 30,
    },
]

// Form schema for creating time slots
const timeSlotSchema = z.object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    duration: z.string().min(1, "Duration is required"),
    notes: z.string().optional(),
})

export default function DoctorMainPage({ }: { user: User }) {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [appointments, setAppointments] = useState(mockAppointments)
    const [timeSlots, setTimeSlots] = useState(mockTimeSlots)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const form = useForm<z.infer<typeof timeSlotSchema>>({
        resolver: zodResolver(timeSlotSchema),
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            startTime: "",
            endTime: "",
            duration: "30",
            notes: "",
        },
    })

    // Get current week dates
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // Get appointments for selected date
    const selectedDateAppointments = appointments.filter((apt) => isSameDay(parseISO(apt.date), selectedDate))

    function onSubmitTimeSlot(values: z.infer<typeof timeSlotSchema>) {
        const newTimeSlot = {
            id: timeSlots.length + 1,
            ...values,
            duration: Number.parseInt(values.duration),
        }
        setTimeSlots([...timeSlots, newTimeSlot])
        setIsDialogOpen(false)
        form.reset()
        console.log("New time slot created:", newTimeSlot)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "cancelled":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="container mx-auto px-6 py-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground">Manage your schedule and availability</p>
                </div>
                <CreateTimeSlotModal />
            </div>

            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calendar">
                        <Calendar className="w-4 h-4 mr-2" />
                        Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="timeslots">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Time Slots
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                    {/* Week Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>
                                Week of {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {weekDays.map((day) => {
                                    const dayAppointments = appointments.filter((apt) => isSameDay(parseISO(apt.date), day))
                                    const isSelected = isSameDay(day, selectedDate)

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                                }`}
                                            onClick={() => setSelectedDate(day)}
                                        >
                                            <div className="text-sm font-medium">{format(day, "EEE")}</div>
                                            <div className="text-lg font-bold">{format(day, "d")}</div>
                                            {dayAppointments.length > 0 && (
                                                <div className="text-xs mt-1">
                                                    {dayAppointments.length} apt{dayAppointments.length !== 1 ? "s" : ""}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between items-center">
                                <Button variant="outline" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
                                    Previous Week
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                                    Today
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
                                    Next Week
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Day Appointments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments for {format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedDateAppointments.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No appointments scheduled for this day.</p>
                            ) : (
                                <div className="space-y-4">
                                    {selectedDateAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                                                    <UserIcon className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{appointment.patientName}</h3>
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            {appointment.time} ({appointment.duration} min)
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Phone className="w-4 h-4 mr-1" />
                                                            {appointment.patientPhone}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 mr-1" />
                                                            {appointment.patientEmail}
                                                        </div>
                                                    </div>
                                                    <div className="mt-1">
                                                        <Badge variant="secondary">{appointment.type}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeslots" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Time Slots</CardTitle>
                            <CardDescription>Manage your availability for patient bookings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {timeSlots.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No time slots configured. Create your first time slot to allow patient bookings.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {timeSlots.map((slot) => (
                                        <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <div className="font-semibold">{format(parseISO(slot.date), "EEEE, MMMM d, yyyy")}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {slot.startTime} - {slot.endTime} ({slot.duration} min appointments)
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    Edit
                                                </Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
