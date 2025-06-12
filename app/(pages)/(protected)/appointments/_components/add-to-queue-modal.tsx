"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Search, User, Mail, Phone, Clock, SendIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FormInput } from "@/components/forms/input"
import { useCurrentUser } from "@/libs/hooks"
import { showToast } from "@/utils/helpers/show-toast"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"
import { KEY_GET_DOCTOR_QUEUES } from "../_hooks/keys"
import { ADD_QUEUE } from "@/utils/api-endpoints"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { FullQueueType } from "@/types/prisma.type"
import { QueueStatus } from "@prisma/client"

// Form schema
const addToQueueSchema = z.object({
    patientEmail: z.string().email({ message: "Please enter a valid email address" }),
})

interface AddToQueueModalProps {
    onAddToQueue?: (patient: FullQueueType) => void
}

export default function AddToQueueModal({ onAddToQueue }: AddToQueueModalProps) {
    const [open, setOpen] = useState(false)
    const user = useCurrentUser();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof addToQueueSchema>>({
        resolver: zodResolver(addToQueueSchema),
        defaultValues: {
            patientEmail: "",
        },
    })

    const handleAddToQueue = async (values: z.infer<typeof addToQueueSchema>) => {
        if (!user || !user?.id) return null;

        const tempId = `temp-${Date.now()}`;

        const optimisticQueue: FullQueueType = {
            id: tempId,
            patientId: "temp-patient-id",
            appointmentId: "temp-apppointment-id",
            doctorId: user.id,
            position: 1,
            status: QueueStatus.WAITING,
            date: new Date(),
            updatedAt: new Date(),
            patient: { email: values.patientEmail } as any,
            doctor: { id: user.id } as any,
        };

        // Optimistically add to UI
        // onAddToQueue?.(optimisticQueue);
        // setOpen(false);

        try {
            const res = await axios.post(ADD_QUEUE, {
                patientEmail: values.patientEmail,
                doctorId: user.id
            });

            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);

            // Refresh queue list (or update the optimistic item with real data if needed)
            await queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_QUEUES], exact: false });
            form.reset();
            setOpen(false);

        } catch (error: any) {
            // Rollback optimistic update
            onAddToQueue?.({ ...optimisticQueue, rollback: true } as any); // Let the parent decide how to remove it
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
            setOpen(true);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Queue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Patient to Queue</DialogTitle>
                    <DialogDescription>Search for a patient by their email address to add them to the queue.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddToQueue)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="patientEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Patient Email</FormLabel>
                                    <FormControl>
                                        <div className="flex space-x-2">
                                            <Input placeholder="patient@example.com" {...field} />
                                            <Button type="submit" variant="outline">
                                                <SendIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}
