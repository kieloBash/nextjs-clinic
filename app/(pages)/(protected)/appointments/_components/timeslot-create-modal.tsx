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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { FormInput } from '@/components/forms/input'

const timeSlotSchema = z.object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
})

const CreateTimeSlotModal = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [timeSlots, setTimeSlots] = useState<any[]>([])

    const form = useForm<z.infer<typeof timeSlotSchema>>({
        resolver: zodResolver(timeSlotSchema),
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            startTime: "",
            endTime: "",
        },
    })

    function onSubmitTimeSlot(values: z.infer<typeof timeSlotSchema>) {
        const newTimeSlot: any = {
            ...values,
        }
        setTimeSlots((prev) => [...prev, newTimeSlot])
        setIsDialogOpen(false)
        form.reset()
        console.log("New time slot created:", newTimeSlot)
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
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                control={form.control}
                                name="startTime"
                                label='Start Time'
                                type='time'
                            />
                            <FormInput
                                control={form.control}
                                name="endTime"
                                label='End Time'
                                type='time'
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create Time Slot</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTimeSlotModal