"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Clock, Edit, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { TimeSlot, TimeSlotStatus } from "@prisma/client"
import { formatTimeToStringPeriod } from "@/utils/helpers/date"
import axios from "axios"
import { DELETE_TIMESLOT } from "@/utils/api-endpoints"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { showToast } from "@/utils/helpers/show-toast"
import { useQueryClient } from "@tanstack/react-query"
import { KEY_GET_DOCTOR_APPOINTMENTS, KEY_GET_DOCTOR_TIMESLOTS } from "../_hooks/keys"

const editTimeSlotSchema = z
    .object({
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

interface SelectedTimeSlotModalProps {
    selectedTimeSlot: TimeSlot | null
    onClose: () => void
    clear: () => void
}

export default function SelectedTimeSlotModal({
    selectedTimeSlot,
    onClose,
    clear
}: SelectedTimeSlotModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)

    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof editTimeSlotSchema>>({
        resolver: zodResolver(editTimeSlotSchema),
        defaultValues: {
            startTime: "",
            endTime: "",
        },
    })

    // Update form when selectedTimeSlot changes
    useState(() => {
        if (selectedTimeSlot) {
            const startTime =
                selectedTimeSlot.startTime instanceof Date
                    ? selectedTimeSlot.startTime.toTimeString().slice(0, 5)
                    : new Date(selectedTimeSlot.startTime).toTimeString().slice(0, 5)

            const endTime =
                selectedTimeSlot.endTime instanceof Date
                    ? selectedTimeSlot.endTime.toTimeString().slice(0, 5)
                    : new Date(selectedTimeSlot.endTime).toTimeString().slice(0, 5)

            form.reset({
                startTime,
                endTime,
            })
        }
    })

    const onEdit = async (timeSlotId: string, data: z.infer<typeof editTimeSlotSchema>) => {
        console.log("Editing time slot:", timeSlotId, data)
        // Here you would typically send this data to your backend
        // Example API call:
        // await axios.patch(`/api/timeslots/${timeSlotId}`, data)

        // For now, just show success message
        alert(`Time slot updated successfully!`)
        clear()
    }

    const onSubmit = async (values: z.infer<typeof editTimeSlotSchema>) => {
        if (!selectedTimeSlot) return

        setIsSubmitting(true)
        try {
            await onEdit(selectedTimeSlot.id, values)
            setIsEditing(false)
            onClose()
        } catch (error) {
            console.error("Error updating time slot:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedTimeSlot) return

        setIsDeleting(true)
        try {
            const res = await axios.delete(DELETE_TIMESLOT + `/${selectedTimeSlot.id}`)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_APPOINTMENTS], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_TIMESLOTS], exact: false }),
            ]);

            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);
            onClose()

        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsDeleting(false);
            setOpenDelete(false);
        }
    }

    const handleClose = () => {
        setIsEditing(false)
        form.reset()
        onClose()
    }

    if (!selectedTimeSlot) return null

    const formatTime = (time: string) => {
        return formatTimeToStringPeriod(time);
    }

    return (
        <Dialog open={!!selectedTimeSlot} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Time Slot Details
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Edit the time slot details" : "View and manage this time slot"}
                    </DialogDescription>
                </DialogHeader>

                {!isEditing ? (
                    <div className="space-y-4">
                        {/* Time Slot Information */}
                        <div className="p-4 bg-muted rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Time Slot Information</h4>
                                <Badge>{selectedTimeSlot.status}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Date:</span>
                                    <p className="font-medium">{format(new Date(selectedTimeSlot.date), "EEEE, MMMM d, yyyy")}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Duration:</span>
                                    <p className="font-medium">
                                        {Math.round(
                                            (new Date(selectedTimeSlot.endTime).getTime() - new Date(selectedTimeSlot.startTime).getTime()) /
                                            (1000 * 60),
                                        )}{" "}
                                        minutes
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Start Time:</span>
                                    <p className="font-medium">{formatTime(selectedTimeSlot.startTime as any)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">End Time:</span>
                                    <p className="font-medium">{formatTime(selectedTimeSlot.endTime as any)}</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            {/* <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button> */}
                            <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this time slot? This action cannot be undone and will affect any
                                            associated appointments.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <Button type="button" onClick={handleDelete} disabled={isDeleting}>
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="outline" onClick={handleClose}>
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="font-medium">{format(new Date(selectedTimeSlot.date), "EEEE, MMMM d, yyyy")}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Editing time slot for this date</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Time</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Time</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
