"use client"

import { useState, useMemo } from "react"
import type { User } from "next-auth"
import {
    Calendar,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CancelModal } from "./cancel-modal"
import StatsCards from "./stats-cards"
import AppointmentCard from "./appointment-card"
import usePatientAppointments from "../../_hooks/use-appointments-patient"
import { AppointmentStatus } from "@prisma/client"
import { getStatusLabel } from "@/libs/appointment"
import MainLoadingPage from "@/components/globals/main-loading"
import { InvoiceDetailsModal } from "./invoice-details"
import { ViewInvoiceModal } from "./view-invoice-modal"
import RescheduleAppointmentModal from "./reschedule-modal"

const PatientAppointmentsPage = ({ user }: { user: User }) => {
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(5)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const appointments = usePatientAppointments({
        patientId: user?.id, statusFilter, page: currentPage, limit: itemsPerPage
    });

    // Filter appointments based on status
    const { data: filteredAppointments, pagination, summary } = useMemo(() => {
        return {
            summary: appointments?.payload?.data?.statusSummary,
            data: appointments?.payload?.data?.appointments ?? [],
            pagination: appointments?.payload?.pagination
        }
    }, [appointments])

    const totalPages = pagination?.totalPages ?? 0

    // Reset to first page when filter changes
    const handleStatusFilterChange = (value: any) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    const handleReschedule = (appointment: any) => {
        setSelectedAppointment(appointment)
        setIsRescheduleModalOpen(true)
    }

    const handleCancel = (appointment: any) => {
        setSelectedAppointment(appointment)
        setIsCancelModalOpen(true)
    }

    const handleViewInvoice = (appointment: any) => {
        setSelectedAppointment(appointment)
        setIsViewInvoiceModalOpen(true)
    }

    const handleCancelConfirm = async (appointmentId: string, reason: string) => {
        // setIsLoading(true)
        // try {
        //     console.log("Cancelling appointment:", { appointmentId, reason })
        //     await new Promise((resolve) => setTimeout(resolve, 1000))
        //     setIsCancelModalOpen(false)
        //     setSelectedAppointment(null)
        // } catch (error) {
        //     console.error("Failed to cancel appointment:", error)
        // } finally {
        //     setIsLoading(false)
        // }
        
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    if (appointments.isLoading || appointments.isFetching) {
        return <MainLoadingPage />
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
                <StatsCards
                    total={summary?.total ?? 0}
                    upcoming={summary?.pending_or_confirmed ?? 0}
                    completed={summary?.completed ?? 0}
                    cancelled={summary?.cancelled ?? 0}
                />

                {/* Filter and Results */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold text-gray-900">All Appointments</CardTitle>
                                <CardDescription className="text-gray-600">
                                    Showing {filteredAppointments.length} of {pagination?.totalItems ?? 0} appointments
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger className="w-[180px] border-gray-200">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Status</SelectItem>
                                        {Object.keys(AppointmentStatus).map((status) => (
                                            <SelectItem key={status} value={status}>{getStatusLabel(status as any)}</SelectItem>
                                        ))}
                                        {/* <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem> */}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Appointments List */}
                        {filteredAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                handleCancel={handleCancel}
                                handleReschedule={handleReschedule}
                                handleViewInvoice={handleViewInvoice}
                            />
                        ))}

                        {/* Empty State */}
                        {filteredAppointments.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    {statusFilter === "ALL"
                                        ? "You haven't booked any appointments yet. Start by finding a doctor and booking your first appointment."
                                        : `No ${getStatusLabel(statusFilter as any)} appointments found. Try changing the filter to see more appointments.`}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="">
                            <div className="flex items-center justify-end">
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
                        <RescheduleAppointmentModal
                            isOpen={isRescheduleModalOpen}
                            onClose={() => setIsRescheduleModalOpen(false)}
                            appointment={selectedAppointment}
                        />
                        {/* <RescheduleModal
                            isOpen={isRescheduleModalOpen}
                            onClose={() => setIsRescheduleModalOpen(false)}
                            appointment={selectedAppointment}
                            onConfirm={handleRescheduleConfirm}
                            isLoading={isLoading}
                        /> */}
                        <CancelModal
                            isOpen={isCancelModalOpen}
                            onClose={() => setIsCancelModalOpen(false)}
                            appointment={selectedAppointment}
                            onConfirm={handleCancelConfirm}
                        />
                        <ViewInvoiceModal
                            isOpen={isViewInvoiceModalOpen}
                            onClose={() => setIsViewInvoiceModalOpen(false)}
                            appointment={selectedAppointment}
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
