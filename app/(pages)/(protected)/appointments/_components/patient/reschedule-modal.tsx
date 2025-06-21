"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Clock, CheckCircle } from "lucide-react"
import { format, isSameDay } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { FullAppointmentType } from "@/types/prisma.type"
import { showToast } from "@/utils/helpers/show-toast"
import { KEY_GET_DOCTOR_APPOINTMENTS, KEY_GET_DOCTOR_QUEUES, KEY_GET_DOCTOR_TIMESLOTS, KEY_GET_PATIENT_APPOINTMENTS } from "../../_hooks/keys"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { RESCHEDULE_APPOINTMENT, RESCHEDULE_APPOINTMENT_PATIENT } from "@/utils/api-endpoints"
import { KEY_GET_NOTIFICATIONS } from "../../../notifications/_hooks/keys"
import useDoctor from "../../../search-doctors/_hooks/use-doctor"
import MainLoadingPage from "@/components/globals/main-loading"
import { KEY_GET_DOCTOR } from "../../../search-doctors/_hooks/keys"

const rescheduleSchema = z.object({
    date: z.date({
        required_error: "Please select a date",
    }),
    timeslotId: z.string().min(1, "Please select a time slot"),
})

interface RescheduleAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: FullAppointmentType
}

export default function RescheduleAppointmentModal({ isOpen, onClose, appointment }: RescheduleAppointmentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient()

    const doctor = useDoctor({ id: appointment.doctorId })

    const timeslots = useMemo(() => doctor?.payload?.doctorTimeSlots ?? [], [doctor])

    // Get available timeslots for the selected date
    const getAvailableTimeslots = (selectedDate: Date) => {
        return timeslots.filter((slot) => slot.status === "OPEN" && isSameDay(new Date(slot.date), selectedDate))
    }

    // Get unique dates that have available timeslots
    const availableDates = useMemo(() => {
        const dates = timeslots
            .filter((slot) => slot.status === "OPEN")
            .map((slot) => new Date(slot.date))
            .filter((date) => date >= new Date()) // Only future dates

        // Remove duplicates
        const uniqueDates = dates.filter((date, index, self) => index === self.findIndex((d) => isSameDay(d, date)))

        return uniqueDates.sort((a, b) => a.getTime() - b.getTime())
    }, [timeslots])

    const form = useForm<z.infer<typeof rescheduleSchema>>({
        resolver: zodResolver(rescheduleSchema),
        defaultValues: {
            date: undefined,
            timeslotId: "",
        },
    })

    const selectedDate = form.watch("date")
    const availableTimeslotsForDate = selectedDate ? getAvailableTimeslots(selectedDate) : []

    // Reset timeslot selection when date changes
    const handleDateChange = (date: Date | undefined) => {
        form.setValue("date", date ?? new Date())
        form.setValue("timeslotId", "") // Reset timeslot when date changes
    }

    const onSubmit = async (values: z.infer<typeof rescheduleSchema>) => {
        setIsSubmitting(true)
        try {
            const selectedTimeslot = timeslots.find((slot) => slot.id === values.timeslotId)

            if (!selectedTimeslot) {
                throw new Error("Selected timeslot not found")
            }

            const body = {
                appointmentId: appointment.id,
                timeSlotId: values.timeslotId,
            }

            console.log({ body })

            const res = await axios.post(RESCHEDULE_APPOINTMENT_PATIENT, body)

            showToast("success", "Appointment rescheduled", res.data.message)

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR + "-" + appointment.doctorId], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_PATIENT_APPOINTMENTS], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_NOTIFICATIONS], exact: false }),
            ])

            form.reset()
            onClose()
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        form.reset({
            date: undefined,
            timeslotId: "",
        })
        onClose()
    }

    if (doctor.isLoading) return <MainLoadingPage />

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Reschedule Appointment
                    </DialogTitle>
                    <DialogDescription>
                        Reschedule the appointment for {appointment.patient.name}. Select a new date and available time slot.
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Current Appointment</h4>
                    <div className="space-y-1 text-sm">
                        <p>
                            <strong>Doctor:</strong> {appointment.doctor.name}
                        </p>
                        <p>
                            <strong>Current Date:</strong> {format(new Date(appointment.date), "EEEE, MMMM d, yyyy")}
                        </p>
                        <p>
                            <strong>Current Time:</strong>{" "}
                            {new Date(appointment.timeSlot.startTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}{" "}
                            -{" "}
                            {new Date(appointment.timeSlot.endTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Select New Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={handleDateChange}
                                                disabled={(date) => {
                                                    // Disable past dates and dates without available timeslots
                                                    const today = new Date()
                                                    today.setHours(0, 0, 0, 0)
                                                    if (date < today) return true

                                                    return !availableDates.some((availableDate) => isSameDay(availableDate, date))
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    {availableDates.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No available dates found. Please contact the clinic.
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        {selectedDate && (
                            <FormField
                                control={form.control}
                                name="timeslotId"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Available Time Slots for {format(selectedDate, "EEEE, MMMM d, yyyy")}</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-3">
                                                {availableTimeslotsForDate.length > 0 ? (
                                                    availableTimeslotsForDate.map((timeslot) => (
                                                        <div key={timeslot.id} className="flex items-center space-x-2">
                                                            <RadioGroupItem value={timeslot.id} id={timeslot.id} disabled={isSubmitting} />
                                                            <Label
                                                                htmlFor={timeslot.id}
                                                                className="flex items-center justify-between w-full p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                                    <span className="font-medium">
                                                                        {new Date(timeslot.startTime).toLocaleTimeString("en-US", {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            hour12: true,
                                                                        })}
                                                                        {" - "}
                                                                        {new Date(timeslot.endTime).toLocaleTimeString("en-US", {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            hour12: true,
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                    <span className="text-sm text-green-600 font-medium">Available</span>
                                                                </div>
                                                            </Label>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                                                        No available time slots for this date.
                                                    </p>
                                                )}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !selectedDate || !form.watch("timeslotId")}>
                                {isSubmitting ? "Rescheduling..." : "Reschedule Appointment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
