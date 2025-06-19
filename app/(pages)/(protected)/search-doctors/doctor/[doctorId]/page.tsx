"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import type { User } from "next-auth"
import { format, addDays, isSameDay, startOfDay, isBefore } from "date-fns"
import {
    ArrowLeft,
    Star,
    Phone,
    Mail,
    Calendar,
    Clock,
    MapPin,
    Award,
    Users,
    ChevronLeft,
    ChevronRight,
    Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Mock doctor data (in real app, this would come from your database)
const mockDoctor = {
    id: "doc-001",
    email: "dr.sarah.johnson@clinic.com",
    name: "Dr. Sarah Johnson",
    image: "/placeholder.svg?height=150&width=150",
    phone: "(555) 123-4567",
    roleId: "doctor-role",
    hashedPassword: "hashed",
    isActive: true,
    createdAt: new Date("2022-01-15"),
    updatedAt: new Date("2024-01-15"),
    // Additional info (would be stored in related tables)
    completedAppointments: 245,
    specialization: "Cardiology",
    experience: "8 years",
    rating: 4.8,
    bio: "Dr. Sarah Johnson is a board-certified cardiologist with over 8 years of experience in treating heart conditions. She specializes in preventive cardiology and has helped hundreds of patients maintain healthy hearts.",
    education: "MD from Harvard Medical School",
    location: "Main Clinic, Floor 3, Room 301",
}

// Mock time slots (would come from TimeSlot model)
const mockTimeSlots = [
    // Today
    { id: "slot-1", doctorId: "doc-001", date: new Date(), startTime: "09:00", endTime: "09:30", isAvailable: true },
    { id: "slot-2", doctorId: "doc-001", date: new Date(), startTime: "09:30", endTime: "10:00", isAvailable: false },
    { id: "slot-3", doctorId: "doc-001", date: new Date(), startTime: "10:00", endTime: "10:30", isAvailable: true },
    { id: "slot-4", doctorId: "doc-001", date: new Date(), startTime: "14:00", endTime: "14:30", isAvailable: true },
    { id: "slot-5", doctorId: "doc-001", date: new Date(), startTime: "14:30", endTime: "15:00", isAvailable: true },
    { id: "slot-6", doctorId: "doc-001", date: new Date(), startTime: "15:00", endTime: "15:30", isAvailable: false },

    // Tomorrow
    {
        id: "slot-7",
        doctorId: "doc-001",
        date: addDays(new Date(), 1),
        startTime: "09:00",
        endTime: "09:30",
        isAvailable: true,
    },
    {
        id: "slot-8",
        doctorId: "doc-001",
        date: addDays(new Date(), 1),
        startTime: "09:30",
        endTime: "10:00",
        isAvailable: true,
    },
    {
        id: "slot-9",
        doctorId: "doc-001",
        date: addDays(new Date(), 1),
        startTime: "10:00",
        endTime: "10:30",
        isAvailable: true,
    },
    {
        id: "slot-10",
        doctorId: "doc-001",
        date: addDays(new Date(), 1),
        startTime: "11:00",
        endTime: "11:30",
        isAvailable: true,
    },
    {
        id: "slot-11",
        doctorId: "doc-001",
        date: addDays(new Date(), 1),
        startTime: "14:00",
        endTime: "14:30",
        isAvailable: false,
    },
    {
        id: "slot-12",
        doctorId: "doc-001",
        date: addDays(new Date(), 1),
        startTime: "15:00",
        endTime: "15:30",
        isAvailable: true,
    },

    // Day after tomorrow
    {
        id: "slot-13",
        doctorId: "doc-001",
        date: addDays(new Date(), 2),
        startTime: "08:00",
        endTime: "08:30",
        isAvailable: true,
    },
    {
        id: "slot-14",
        doctorId: "doc-001",
        date: addDays(new Date(), 2),
        startTime: "08:30",
        endTime: "09:00",
        isAvailable: true,
    },
    {
        id: "slot-15",
        doctorId: "doc-001",
        date: addDays(new Date(), 2),
        startTime: "10:00",
        endTime: "10:30",
        isAvailable: true,
    },
    {
        id: "slot-16",
        doctorId: "doc-001",
        date: addDays(new Date(), 2),
        startTime: "16:00",
        endTime: "16:30",
        isAvailable: true,
    },
]

const DoctorDetailsPage = () => {
    const params = useParams()
    const router = useRouter()
    const doctorId = params.doctorId as string

    console.log(doctorId)

    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfDay(new Date()))

    // Generate next 7 days for date selection
    const availableDates = useMemo(() => {
        const dates = []
        for (let i = 0; i < 7; i++) {
            dates.push(addDays(currentWeekStart, i))
        }
        return dates
    }, [currentWeekStart])

    // Filter time slots for selected date
    const timeSlotsForSelectedDate = useMemo(() => {
        return mockTimeSlots.filter((slot) => isSameDay(slot.date, selectedDate))
    }, [selectedDate])

    // Group time slots by time period
    const groupedTimeSlots = useMemo(() => {
        const morning = timeSlotsForSelectedDate.filter((slot) => {
            const hour = Number.parseInt(slot.startTime.split(":")[0])
            return hour < 12
        })

        const afternoon = timeSlotsForSelectedDate.filter((slot) => {
            const hour = Number.parseInt(slot.startTime.split(":")[0])
            return hour >= 12 && hour < 17
        })

        const evening = timeSlotsForSelectedDate.filter((slot) => {
            const hour = Number.parseInt(slot.startTime.split(":")[0])
            return hour >= 17
        })

        return { morning, afternoon, evening }
    }, [timeSlotsForSelectedDate])

    const handlePreviousWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -7))
    }

    const handleNextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7))
    }

    const handleTimeSlotSelect = (slotId: string) => {
        setSelectedTimeSlot(slotId)
    }

    const handleBookAppointment = () => {
        if (!selectedTimeSlot) return

        const selectedSlot = mockTimeSlots.find((slot) => slot.id === selectedTimeSlot)
        console.log("Booking appointment:", {
            doctorId,
            slotId: selectedTimeSlot,
            date: selectedDate,
            time: selectedSlot?.startTime,
        })

        // In a real app, you would make an API call to book the appointment
        alert(
            `Appointment booked with ${mockDoctor.name} on ${format(selectedDate, "MMM dd, yyyy")} at ${selectedSlot?.startTime}`,
        )
    }

    const getExperienceBadge = (appointments: number) => {
        if (appointments >= 300) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Highly Experienced</Badge>
        } else if (appointments >= 150) {
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Experienced</Badge>
        } else if (appointments >= 50) {
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Developing</Badge>
        } else {
            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">New</Badge>
        }
    }

    const renderTimeSlotGroup = (title: string, slots: typeof mockTimeSlots, icon: React.ReactNode) => {
        if (slots.length === 0) return null

        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    {icon}
                    <h4 className="font-medium text-sm">{title}</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {slots.map((slot) => (
                        <Button
                            key={slot.id}
                            variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                            size="sm"
                            disabled={!slot.isAvailable}
                            onClick={() => handleTimeSlotSelect(slot.id)}
                            className={`h-10 ${selectedTimeSlot === slot.id
                                ? "bg-primary text-primary-foreground"
                                : slot.isAvailable
                                    ? "hover:bg-primary/10"
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                        >
                            {slot.isAvailable ? (
                                <div className="flex items-center gap-1">
                                    {selectedTimeSlot === slot.id && <Check className="w-3 h-3" />}
                                    <span className="text-xs">{slot.startTime}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground">Booked</span>
                            )}
                        </Button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Doctors
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Doctor Information */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <Avatar className="w-24 h-24 mx-auto mb-4">
                                <AvatarImage src={mockDoctor.image || "/placeholder.svg"} alt={mockDoctor.name} />
                                <AvatarFallback className="text-xl">
                                    {mockDoctor.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl">{mockDoctor.name}</CardTitle>
                            {/* <CardDescription className="text-primary font-medium">{mockDoctor.specialization}</CardDescription> */}
                            <div className="flex justify-center">{getExperienceBadge(mockDoctor.completedAppointments)}</div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Rating and Stats */}
                            <div className="grid grid-cols-1 gap-4 text-center">
                                {/* <div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-bold">{mockDoctor.rating}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Rating</p>
                                </div> */}
                                <div>
                                    <p className="font-bold text-primary">{mockDoctor.completedAppointments}</p>
                                    <p className="text-xs text-muted-foreground">Appointments</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Information */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{mockDoctor.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{mockDoctor.phone}</span>
                                </div>
                                {/* <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{mockDoctor.location}</span>
                                </div> */}
                            </div>

                            {/* <Separator /> */}

                            {/* Experience */}
                            {/* <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Experience</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{mockDoctor.experience}</p>
                            </div> */}

                            {/* Education */}
                            {/* <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Education</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{mockDoctor.education}</p>
                            </div> */}
                        </CardContent>
                    </Card>

                    {/* About */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">About</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">{mockDoctor.bio}</p>
                        </CardContent>
                    </Card> */}
                </div>

                {/* Appointment Booking */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Schedule Appointment
                            </CardTitle>
                            <CardDescription>Select a date and time that works for you</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Date Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Select Date</h3>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleNextWeek}>
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {availableDates.map((date) => {
                                        const isSelected = isSameDay(date, selectedDate)
                                        const isPast = isBefore(date, startOfDay(new Date()))
                                        const hasSlots = mockTimeSlots.some((slot) => isSameDay(slot.date, date) && slot.isAvailable)

                                        return (
                                            <Button
                                                key={date.toISOString()}
                                                variant={isSelected ? "default" : "outline"}
                                                size="sm"
                                                disabled={isPast || !hasSlots}
                                                onClick={() => setSelectedDate(date)}
                                                className={`h-24 flex flex-col ${isSelected ? "bg-primary text-primary-foreground" : ""
                                                    } ${!hasSlots && !isPast ? "opacity-50" : ""}`}
                                            >
                                                <span className="text-xs">{format(date, "EEE")}</span>
                                                <span className="text-lg font-bold">{format(date, "dd")}</span>
                                                <span className="text-xs">{format(date, "MMM")}</span>
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>

                            <Separator />

                            {/* Time Slot Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <h3 className="font-medium">Available Times for {format(selectedDate, "MMMM dd, yyyy")}</h3>
                                </div>

                                {timeSlotsForSelectedDate.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No available time slots for this date</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {renderTimeSlotGroup(
                                            "Morning",
                                            groupedTimeSlots.morning,
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full" />,
                                        )}
                                        {renderTimeSlotGroup(
                                            "Afternoon",
                                            groupedTimeSlots.afternoon,
                                            <div className="w-2 h-2 bg-blue-400 rounded-full" />,
                                        )}
                                        {renderTimeSlotGroup(
                                            "Evening",
                                            groupedTimeSlots.evening,
                                            <div className="w-2 h-2 bg-purple-400 rounded-full" />,
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Booking Summary */}
                            {selectedTimeSlot && (
                                <>
                                    <Separator />
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Appointment Summary</h4>
                                        <div className="space-y-1 text-sm">
                                            <p>
                                                <span className="text-muted-foreground">Doctor:</span> {mockDoctor.name}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Date:</span> {format(selectedDate, "MMMM dd, yyyy")}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Time:</span>{" "}
                                                {mockTimeSlots.find((slot) => slot.id === selectedTimeSlot)?.startTime}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Duration:</span> 30 minutes
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Book Button */}
                            <Button onClick={handleBookAppointment} disabled={!selectedTimeSlot} className="w-full h-12 text-base">
                                {selectedTimeSlot ? "Confirm Appointment" : "Select a time slot"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default DoctorDetailsPage
