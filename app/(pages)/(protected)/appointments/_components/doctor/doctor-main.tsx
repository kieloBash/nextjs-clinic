"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, Users2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import GoogleCalendar from "./google.calendar"
import CreateTimeSlotModal from "./timeslot-create-modal"
import useDoctorTimeSlots from "../../_hooks/use-timeslots"
import useDoctorAppointments from "../../_hooks/use-appointments"
import { User } from "next-auth"
import DoctorQueue from "./doctor-queue"
import MainLoadingPage from "@/components/globals/main-loading"
import useDoctorQueues from "../../_hooks/use-queues"

export default function DoctorAppointmentsPage({ user }: { user: User }) {
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Get current week dates
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })

    const timeslots = useDoctorTimeSlots({ doctorId: user?.id, statusFilter: "OPEN", startDate: weekStart, endDate: weekEnd });
    const appointments = useDoctorAppointments({ doctorId: user?.id, startDate: weekStart, endDate: weekEnd });
    const queues = useDoctorQueues({ doctorId: user?.id });

    if (timeslots.isLoading || appointments.isLoading || queues.isLoading) {
        return <MainLoadingPage />
    }

    return (
        <div className="container mx-auto px-6 py-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold">Calendar</h1>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                            Today
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-medium ml-4">
                            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                        </span>
                    </div>
                </div>
                <CreateTimeSlotModal />
            </div>

            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calendar">
                        <Calendar className="w-4 h-4 mr-2" />
                        Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="queue">
                        <Users2Icon className="w-4 h-4 mr-2" />
                        Queue View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                    <GoogleCalendar currentDate={selectedDate}
                        timeSlots={timeslots?.payload ?? []}
                        appointments={appointments?.payload ?? []} />
                </TabsContent>
                <TabsContent value="queue" className="space-y-4">
                    <DoctorQueue user={user} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
