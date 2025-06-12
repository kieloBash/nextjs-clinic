"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"

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
import { cn } from "@/lib/utils"
import type { FullAppointmentType } from "@/types/prisma.type"
import { showToast } from "@/utils/helpers/show-toast"
import { KEY_GET_DOCTOR_APPOINTMENTS, KEY_GET_DOCTOR_QUEUES, KEY_GET_DOCTOR_TIMESLOTS } from "../_hooks/keys"
import { useQueryClient } from "@tanstack/react-query"
import { FormInput } from "@/components/forms/input"

const rescheduleSchema = z
    .object({
        date: z.date({
            required_error: "Please select a date",
        }),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
    })
    .refine(
        (data) => {
            const start = new Date(`2000-01-01T${data.startTime}:00`)
            const end = new Date(`2000-01-01T${data.endTime}:00`)
            return start < end
        },
        {
            message: "End time must be after start time",
            path: ["endTime"],
        },
    )
    .refine(
        (data) => {
            const selectedDate = new Date(data.date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return selectedDate >= today
        },
        {
            message: "Cannot schedule appointments in the past",
            path: ["date"],
        },
    )

interface RescheduleAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: FullAppointmentType
}

export default function RescheduleAppointmentModal({
    isOpen,
    onClose,
    appointment,
}: RescheduleAppointmentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof rescheduleSchema>>({
        resolver: zodResolver(rescheduleSchema),
        defaultValues: {
            date: new Date(appointment.date),
            startTime: new Date(appointment.timeSlot.startTime).toTimeString().slice(0, 5),
            endTime: new Date(appointment.timeSlot.endTime).toTimeString().slice(0, 5),
        },
    })

    const onSubmit = async (values: z.infer<typeof rescheduleSchema>) => {
        setIsSubmitting(true)
        try {
            // Here you would typically send this data to your backend
            // Example API call:
            // const body = {
            //     appointmentId: selectedAppointment.id,
            //     date: data.date,
            //     startTime: data.startTime,
            //     endTime: data.endTime
            // };
            // const res = await axios.patch(RESCHEDULE_APPOINTMENT, body);

            showToast("success", "Appointment rescheduled", "The appointment has been successfully rescheduled.")

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_QUEUES], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_APPOINTMENTS], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_TIMESLOTS], exact: false }),
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
            date: new Date(appointment.date),
            startTime: new Date(appointment.timeSlot.startTime).toTimeString().slice(0, 5),
            endTime: new Date(appointment.timeSlot.endTime).toTimeString().slice(0, 5),
        })
        onClose()
    }
 
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Reschedule Appointment
                    </DialogTitle>
                    <DialogDescription>
                        Reschedule the appointment for {appointment.patient.name}. Select a new date and time.
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Current Appointment</h4>
                    <div className="space-y-1 text-sm">
                        <p>
                            <strong>Patient:</strong> {appointment.patient.name}
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>New Date</FormLabel>
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
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                control={form.control}
                                name="startTime"
                                label='Start Time'
                                type='time'
                                disabled={isSubmitting}
                            />
                            <FormInput
                                control={form.control}
                                name="endTime"
                                label='End Time'
                                type='time'
                                disabled={isSubmitting}
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Rescheduling..." : "Reschedule Appointment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
