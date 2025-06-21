import React from 'react'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, Clock, DollarSign, Edit, MoreHorizontal, X } from 'lucide-react'
import { format, isFuture, isToday, isTomorrow } from 'date-fns'
import { formatDateBaseOnTimeZone_Date } from '@/utils/helpers/date'

interface IProps {
    appointment: any
    handleReschedule: (e: any) => void
    handleCancel: (e: any) => void
    handleViewInvoice: (e: any) => void
}
const AppointmentCard = ({ appointment, handleReschedule, handleCancel, handleViewInvoice }: IProps) => {

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
            case "RESCHEDULED":
                return (
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
                        <Calendar className="w-3 h-3 mr-1" />
                        Rescheduled
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
        return (appointment.status === "CONFIRMED" || appointment.status === "PENDING")
    }

    const canCancel = (appointment: any) => {
        return (appointment.status === "CONFIRMED" || appointment.status === "PENDING")
    }

    const canViewInvoice = (appointment: any) => {
        return (appointment.status === "COMPLETED" || appointment.status === "PENDING_PAYMENT")
    }

    const onHandleReschedule = (appointment: any) => {
        handleReschedule(appointment)
        // setSelectedAppointment(appointment)
        // setIsRescheduleModalOpen(true)
    }

    const onHandleCancel = (appointment: any) => {
        handleCancel(appointment)
    }

    const onHandleViewInvoice = (appointment: any) => {
        handleViewInvoice(appointment)
    }

    return (
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
                                        .map((n: any) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{appointment.doctor.name}</h3>
                                {getStatusBadge(appointment.status)}
                            </div>
                            {/* <p className="text-gray-600 font-medium mb-3">{appointment.doctor.specialization}</p> */}

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
                                        {formatDateBaseOnTimeZone_Date(appointment.timeSlot.startTime).displayTime} - {formatDateBaseOnTimeZone_Date(appointment.timeSlot.endTime).displayTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {(canReschedule(appointment) || canCancel(appointment) || canViewInvoice(appointment)) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {canReschedule(appointment) && (
                                        <DropdownMenuItem onClick={() => onHandleReschedule(appointment)} className="text-blue-600">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Reschedule
                                        </DropdownMenuItem>
                                    )}
                                    {canCancel(appointment) && (
                                        <DropdownMenuItem onClick={() => onHandleCancel(appointment)} className="text-red-600">
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </DropdownMenuItem>
                                    )}
                                    {canViewInvoice(appointment) && (
                                        <DropdownMenuItem onClick={() => onHandleViewInvoice(appointment)} className="">
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            View Invoice
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>)
}

export default AppointmentCard