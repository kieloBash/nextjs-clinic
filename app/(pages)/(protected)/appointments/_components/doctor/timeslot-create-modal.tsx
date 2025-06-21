import React, { useState } from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Form } from "@/components/ui/form"
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { FormInput } from '@/components/forms/input'
import { useCurrentUser } from '@/libs/hooks'
import axios from 'axios'
import { CREATED_PROMPT_SUCCESS } from '@/utils/constants'
import { showToast } from '@/utils/helpers/show-toast'
import { CREATE_TIMESLOT } from '@/utils/api-endpoints'
import { getTodayDateTimezone, mergeTimeWithDate } from '@/utils/helpers/date'
import { useQueryClient } from '@tanstack/react-query'
import { KEY_GET_DOCTOR_APPOINTMENTS, KEY_GET_DOCTOR_QUEUES, KEY_GET_DOCTOR_TIMESLOTS } from '../../_hooks/keys'
import { KEY_GET_NOTIFICATIONS } from '../../../notifications/_hooks/keys'

const timeSlotSchema = z.object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
})

const CreateTimeSlotModal = () => {
    const user = useCurrentUser();
    const queryClient = useQueryClient();

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof timeSlotSchema>>({
        resolver: zodResolver(timeSlotSchema),
        defaultValues: {
            date: format(getTodayDateTimezone(), "yyyy-MM-dd"),
            startTime: "",
            endTime: "",
        },
    })

    async function onSubmitTimeSlot(values: z.infer<typeof timeSlotSchema>) {
        if (!user || !user?.id) return null;
        const startTime = mergeTimeWithDate(values.startTime, getTodayDateTimezone(new Date(values.date)));
        const endTime = mergeTimeWithDate(values.endTime, getTodayDateTimezone(new Date(values.date)));

        const formData = new FormData();
        formData.append("date", values.date);
        formData.append("startTime", startTime as string);
        formData.append("endTime", endTime as string);
        formData.append("status", "OPEN");
        formData.append("doctorId", user.id);

        try {
            setIsLoading(true)
            const res = await axios.post(CREATE_TIMESLOT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(res.data.payload)
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message)
            setIsDialogOpen(false)
            form.reset()
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_TIMESLOTS], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_NOTIFICATIONS], exact: false }),
            ]);
        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time Slot
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Available Time Slot</DialogTitle>
                    <DialogDescription>Set up time slots for patients to book appointments.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitTimeSlot)} className="space-y-4">
                        <FormInput
                            control={form.control}
                            name="date"
                            label='Date'
                            type='date'
                            className='w-full'
                            disabled={isLoading}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                control={form.control}
                                name="startTime"
                                label='Start Time'
                                type='time'
                                disabled={isLoading}
                            />
                            <FormInput
                                control={form.control}
                                name="endTime"
                                label='End Time'
                                type='time'
                                disabled={isLoading}
                            />
                        </div>
                        <DialogFooter>
                            <Button disabled={isLoading} type="submit">Create Time Slot</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTimeSlotModal