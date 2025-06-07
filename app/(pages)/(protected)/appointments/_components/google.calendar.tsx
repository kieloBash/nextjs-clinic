import React, { useMemo, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { differenceInMinutes, eachDayOfInterval, endOfWeek, format, isSameDay, parseISO, startOfWeek } from 'date-fns'
import { AppointmentStatus, TimeSlot, TimeSlotStatus } from '@/app/generated/prisma'
import { FullAppointmentType } from '@/types/prisma.type'
import { formatTimeToString, getDifferenceTimeSlot } from '@/utils/helpers/date'
import SelectedAppointmentModal from './selected-appointment-modal'

const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 24; hour++) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`)
        slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    return slots
}

interface IGoogleCalendarProps {
    currentDate?: Date
    appointments?: FullAppointmentType[]
    timeSlots?: TimeSlot[]
}

const GoogleCalendar = ({ currentDate: selectedDate = new Date(), appointments = [], timeSlots = [] }: IGoogleCalendarProps) => {
    console.log(appointments)

    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const timeSlotsList = generateTimeSlots();

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [selectedDate])

    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter((apt) => isSameDay(apt.date, day))
    }

    const getTimeSlotsForDay = (day: Date) => {
        return timeSlots.filter((slot) => isSameDay(new Date(slot.date), day) && slot.status !== TimeSlotStatus.CLOSED)
    }

    const getAppointmentPosition = (time: string, duration: number) => {
        const [hours, minutes] = time.split(":").map(Number)
        const startMinutes = (hours - 8) * 60 + minutes
        const top = (startMinutes / 30) * 40 // 40px per 30-minute slot
        const height = (duration / 30) * 40
        return { top, height }
    }

    const generateTimeSlotBlocks = (timeSlot: TimeSlot) => {
        const blocks = []
        const [startHours, startMinutes] = formatTimeToString(timeSlot.startTime).split(":").map(Number)
        const [endHours, endMinutes] = formatTimeToString(timeSlot.endTime).split(":").map(Number)

        const startTotalMinutes = startHours * 60 + startMinutes
        const endTotalMinutes = endHours * 60 + endMinutes
        const duration = getDifferenceTimeSlot(timeSlot)

        for (let time = startTotalMinutes; time < endTotalMinutes; time += duration) {
            const hours = Math.floor(time / 60)
            const minutes = time % 60
            const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

            // Check if this time slot is already booked
            const isBooked = appointments.some(
                (apt) => isSameDay(apt.date, timeSlot.date) && apt?.timeSlot && formatTimeToString(apt.timeSlot.startTime) === timeString,
            )

            if (!isBooked) {
                blocks.push({
                    id: `${timeSlot.id}-${timeString}`,
                    time: timeString,
                    duration: duration,
                    available: true,
                })
            }
        }

        return blocks
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case AppointmentStatus.COMPLETED:
                return "bg-blue-500 hover:bg-blue-600 text-white border-blue-600"
            case AppointmentStatus.PENDING:
                return "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
            case AppointmentStatus.CANCELLED:
                return "bg-red-500 hover:bg-red-600 text-white border-red-600"
            default:
                return "bg-gray-500 hover:bg-gray-600 text-white border-gray-600"
        }
    }

    return (
        <>
            {selectedAppointment && <SelectedAppointmentModal
                selectedAppointment={selectedAppointment}
                clear={() => setSelectedAppointment(null)}
                getStatusColor={getStatusColor} />
            }
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex">
                        {/* Time Column */}
                        <div className="w-20 bg-gray-50 border-r">
                            <div className="h-12 border-b"></div> {/* Header spacer */}
                            {timeSlotsList.map((time, index) => (
                                <div
                                    key={time}
                                    className={`h-10 border-b border-gray-200 flex items-center justify-end pr-2 text-xs text-gray-600 ${index % 2 === 0 ? "font-medium" : "text-gray-400"
                                        }`}
                                >
                                    {index % 2 === 0 ? time : ""}
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        <div className="flex-1 overflow-x-auto">
                            <div className="flex min-w-full">
                                {weekDays.map((day) => {
                                    const dayAppointments = getAppointmentsForDay(day)
                                    const isToday = isSameDay(day, new Date())

                                    console.log(day, dayAppointments.length)

                                    return (
                                        <div key={day.toISOString()} className="flex-1 min-w-32 border-r border-gray-200">
                                            {/* Day Header */}
                                            <div
                                                className={`h-12 border-b border-gray-200 flex flex-col items-center justify-center ${isToday ? "bg-blue-50" : "bg-white"
                                                    }`}
                                            >
                                                <div className="text-xs text-gray-600 font-medium">{format(day, "EEE")}</div>
                                                <div
                                                    className={`text-lg font-bold ${isToday
                                                        ? "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                                        : ""
                                                        }`}
                                                >
                                                    {format(day, "d")}
                                                </div>
                                            </div>

                                            {/* Time Slots */}
                                            <div className="relative">
                                                {timeSlotsList.map((time, index) => (
                                                    <div
                                                        key={time}
                                                        className={`h-10 border-b border-gray-100 ${index % 2 === 0 ? "border-gray-200" : ""}`}
                                                    />
                                                ))}

                                                {/* Time Slots and Appointments */}
                                                {dayAppointments.map((appointment) => {
                                                    if (!appointment?.timeSlot) return null;

                                                    const { top, height } = getAppointmentPosition(formatTimeToString(appointment.timeSlot.startTime), differenceInMinutes(appointment.timeSlot.endTime, appointment.timeSlot.startTime))

                                                    return (
                                                        <div
                                                            key={appointment.id}
                                                            className={`absolute left-1 right-1 rounded-md p-1 cursor-pointer transition-colors ${getStatusColor(appointment.status)}`}
                                                            style={{ top: `${top}px`, height: `${height}px` }}
                                                            onClick={() => setSelectedAppointment(appointment)}
                                                        >
                                                            <div className="text-xs font-medium truncate">{appointment.patient.name}</div>
                                                            <div className="text-xs opacity-90 truncate">
                                                                {formatTimeToString(appointment.timeSlot.startTime)} - {appointment.status}
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                                {/* Available Time Slots */}
                                                {getTimeSlotsForDay(day).map((timeSlot: TimeSlot) => {
                                                    const availableBlocks = generateTimeSlotBlocks(timeSlot)

                                                    return availableBlocks.map((block) => {
                                                        const { top, height } = getAppointmentPosition(block.time, block.duration)
                                                        return (
                                                            <div
                                                                key={block.id}
                                                                className="absolute left-1 right-1 rounded-md p-1 cursor-pointer transition-colors bg-green-100 hover:bg-green-200 border border-green-300 border-dashed"
                                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                                onClick={() => console.log("Available slot clicked:", block)}
                                                            >
                                                                <div className="text-xs font-medium text-green-700">Available</div>
                                                                <div className="text-xs text-green-600">
                                                                    {block.time} ({block.duration}min)
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Confirmed Appointments</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Pending Appointments</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 border-dashed rounded"></div>
                    <span className="text-sm">Available Time Slots</span>
                </div>
            </div>
        </>
    )
}

export default GoogleCalendar