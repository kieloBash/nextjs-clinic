"use client"

import { useState, useMemo } from "react"
import type { User } from "next-auth"
import { format, isToday, isTomorrow, isFuture } from "date-fns"
import {
    Calendar,
    Clock,
    MoreHorizontal,
    Edit,
    X,
    CheckCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RescheduleModal } from "./reschedule-modal"
import { CancelModal } from "./cancel-modal"
import StatsCards from "./stats-cards"

// Mock appointment data based on your Prisma schema
const mockAppointments = [
    {
        id: "apt-001",
        patientId: "patient-123",
        doctorId: "doctor-456",
        date: new Date("2024-01-16T14:00:00"),
        status: "CONFIRMED",
        timeSlotId: "slot-001",
        createdAt: new Date("2024-01-10T10:00:00"),
        updatedAt: new Date("2024-01-10T10:00:00"),
        doctor: {
            id: "doctor-456",
            name: "Dr. Sarah Johnson",
            specialization: "Cardiologist",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        timeSlot: {
            id: "slot-001",
            startTime: "14:00",
            endTime: "14:30",
        },
    },
    {
        id: "apt-002",
        patientId: "patient-123",
        doctorId: "doctor-789",
        date: new Date("2024-01-18T10:30:00"),
        status: "PENDING",
        timeSlotId: "slot-002",
        createdAt: new Date("2024-01-12T15:30:00"),
        updatedAt: new Date("2024-01-12T15:30:00"),
        doctor: {
            id: "doctor-789",
            name: "Dr. Michael Chen",
            specialization: "Dermatologist",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        timeSlot: {
            id: "slot-002",
            startTime: "10:30",
            endTime: "11:00",
        },
    },
    {
        id: "apt-003",
        patientId: "patient-123",
        doctorId: "doctor-321",
        date: new Date("2024-01-12T16:00:00"),
        status: "COMPLETED",
        timeSlotId: "slot-003",
        createdAt: new Date("2024-01-08T09:00:00"),
        updatedAt: new Date("2024-01-12T16:30:00"),
        doctor: {
            id: "doctor-321",
            name: "Dr. Emily Rodriguez",
            specialization: "General Practitioner",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        timeSlot: {
            id: "slot-003",
            startTime: "16:00",
            endTime: "16:30",
        },
    },
    {
        id: "apt-004",
        patientId: "patient-123",
        doctorId: "doctor-654",
        date: new Date("2024-01-20T09:00:00"),
        status: "CANCELLED",
        timeSlotId: "slot-004",
        createdAt: new Date("2024-01-13T11:00:00"),
        updatedAt: new Date("2024-01-14T14:00:00"),
        doctor: {
            id: "doctor-654",
            name: "Dr. David Wilson",
            specialization: "Orthopedic Surgeon",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        timeSlot: {
            id: "slot-004",
            startTime: "09:00",
            endTime: "09:30",
        },
    },
    {
        id: "apt-005",
        patientId: "patient-123",
        doctorId: "doctor-987",
        date: new Date("2024-01-25T11:15:00"),
        status: "CONFIRMED",
        timeSlotId: "slot-005",
        createdAt: new Date("2024-01-14T16:00:00"),
        updatedAt: new Date("2024-01-14T16:00:00"),
        doctor: {
            id: "doctor-987",
            name: "Dr. Lisa Thompson",
            specialization: "Pediatrician",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        timeSlot: {
            id: "slot-005",
            startTime: "11:15",
            endTime: "11:45",
        },
    },
    {
        id: "apt-006",
        patientId: "patient-123",
        doctorId: "doctor-111",
        date: new Date("2024-01-28T15:00:00"),
        status: "CONFIRMED",
        timeSlotId: "slot-006",
        createdAt: new Date("2024-01-15T10:00:00"),
        updatedAt: new Date("2024-01-15T10:00:00"),
        doctor: {
            id: "doctor-111",
            name: "Dr. Robert Brown",
            specialization: "Neurologist",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        timeSlot: {
            id: "slot-006",
            startTime: "15:00",
            endTime: "15:30",
        },
    },
    {
        id: "apt-007",
        patientId: "patient-123",
        doctorId: "doctor-222",
        date: new Date("2024-01-30T08:30:00"),
        status: "PENDING",
        timeSlotId: "slot-007",
        createdAt: new Date("2024-01-16T14:00:00"),
        updatedAt: new Date("2024-01-16T14:00:00"),
        doctor: {
            id: "doctor-222",
            name: "Dr. Amanda White",
            specialization: "Psychiatrist",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        timeSlot: {
            id: "slot-007",
            startTime: "08:30",
            endTime: "09:00",
        },
    },
    {
        id: "apt-008",
        patientId: "patient-123",
        doctorId: "doctor-333",
        date: new Date("2024-01-05T13:45:00"),
        status: "COMPLETED",
        timeSlotId: "slot-008",
        createdAt: new Date("2024-01-01T12:00:00"),
        updatedAt: new Date("2024-01-05T14:15:00"),
        doctor: {
            id: "doctor-333",
            name: "Dr. James Miller",
            specialization: "Ophthalmologist",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        timeSlot: {
            id: "slot-008",
            startTime: "13:45",
            endTime: "14:15",
        },
    },
]

const PatientAppointmentsPage = ({ user }: { user: User }) => {
    const [statusFilter, setStatusFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(5)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Filter appointments based on status
    const filteredAppointments = useMemo(() => {
        return mockAppointments.filter((appointment) => {
            if (statusFilter === "all") return true
            return appointment.status.toLowerCase() === statusFilter.toLowerCase()
        })
    }, [statusFilter])

    // Pagination logic
    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredAppointments.slice(startIndex, endIndex)
    }, [filteredAppointments, currentPage, itemsPerPage])

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)

    // Reset to first page when filter changes
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmed
                    </Badge>
                )
            case "PENDING":
                return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "COMPLETED":
                return (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                    </Badge>
                )
            case "CANCELLED":
                return (
                    <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
                        <X className="w-3 h-3 mr-1" />
                        Cancelled
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getDateLabel = (date: Date) => {
        if (isToday(date)) return "Today"
        if (isTomorrow(date)) return "Tomorrow"
        return format(date, "EEEE, MMM dd")
    }

    const canReschedule = (appointment: any) => {
        return (appointment.status === "CONFIRMED" || appointment.status === "PENDING") && isFuture(appointment.date)
    }

    const canCancel = (appointment: any) => {
        return (appointment.status === "CONFIRMED" || appointment.status === "PENDING") && isFuture(appointment.date)
    }

    const handleReschedule = (appointment: any) => {
        setSelectedAppointment(appointment)
        setIsRescheduleModalOpen(true)
    }

    const handleCancel = (appointment: any) => {
        setSelectedAppointment(appointment)
        setIsCancelModalOpen(true)
    }

    const handleRescheduleConfirm = async (appointmentId: string, newDate: Date, newTimeSlot: string) => {
        setIsLoading(true)
        try {
            console.log("Rescheduling appointment:", { appointmentId, newDate, newTimeSlot })
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setIsRescheduleModalOpen(false)
            setSelectedAppointment(null)
        } catch (error) {
            console.error("Failed to reschedule appointment:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelConfirm = async (appointmentId: string, reason: string) => {
        setIsLoading(true)
        try {
            console.log("Cancelling appointment:", { appointmentId, reason })
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setIsCancelModalOpen(false)
            setSelectedAppointment(null)
        } catch (error) {
            console.error("Failed to cancel appointment:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        My Appointments
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Manage your upcoming and past appointments with ease
                    </p>
                </div>

                {/* Stats Cards */}
                <StatsCards data={[]} />

                {/* Filter and Results */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold text-gray-900">All Appointments</CardTitle>
                                <CardDescription className="text-gray-600">
                                    Showing {paginatedAppointments.length} of {filteredAppointments.length} appointments
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger className="w-[180px] border-gray-200">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Appointments List */}
                        {paginatedAppointments.map((appointment) => (
                            <Card
                                key={appointment.id}
                                className="border border-gray-100 hover:shadow-lg transition-all duration-200 bg-white"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className="relative">
                                                <Avatar className="h-14 w-14 ring-2 ring-gray-100">
                                                    <AvatarImage src={appointment.doctor.avatar || "/placeholder.svg"} />
                                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                                                        {appointment.doctor.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-lg text-gray-900">{appointment.doctor.name}</h3>
                                                    {getStatusBadge(appointment.status)}
                                                </div>
                                                <p className="text-gray-600 font-medium mb-3">{appointment.doctor.specialization}</p>

                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Calendar className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium">{getDateLabel(appointment.date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                            <Clock className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <span className="font-medium">
                                                            {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {(canReschedule(appointment) || canCancel(appointment)) && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        {canReschedule(appointment) && (
                                                            <DropdownMenuItem onClick={() => handleReschedule(appointment)} className="text-blue-600">
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Reschedule
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canCancel(appointment) && (
                                                            <DropdownMenuItem onClick={() => handleCancel(appointment)} className="text-red-600">
                                                                <X className="mr-2 h-4 w-4" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Empty State */}
                        {paginatedAppointments.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    {statusFilter === "all"
                                        ? "You haven't booked any appointments yet. Start by finding a doctor and booking your first appointment."
                                        : `No ${statusFilter} appointments found. Try changing the filter to see more appointments.`}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                    {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length}{" "}
                                    appointments
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="border-gray-200"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className={`min-w-[40px] ${page === currentPage
                                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                                                    : "border-gray-200"
                                                    }`}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="border-gray-200"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Modals */}
                {selectedAppointment && (
                    <>
                        <RescheduleModal
                            isOpen={isRescheduleModalOpen}
                            onClose={() => setIsRescheduleModalOpen(false)}
                            appointment={selectedAppointment}
                            onConfirm={handleRescheduleConfirm}
                            isLoading={isLoading}
                        />
                        <CancelModal
                            isOpen={isCancelModalOpen}
                            onClose={() => setIsCancelModalOpen(false)}
                            appointment={selectedAppointment}
                            onConfirm={handleCancelConfirm}
                            isLoading={isLoading}
                        />
                    </>
                )}

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Card className="border-0 shadow-2xl">
                            <CardContent className="flex items-center gap-4 p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <p className="text-lg font-medium">Processing...</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PatientAppointmentsPage
