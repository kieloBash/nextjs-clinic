"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { DollarSign, Calendar, PenToolIcon, HandCoinsIcon } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { FullQueueType } from "@/types/prisma.type"

const completeAppointmentSchema = z.object({
    paymentAmount: z
        .string()
        .min(1, "Payment amount is required")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Payment amount must be a valid positive number"),
    // notes: z.string().optional(),
    // diagnosis: z.string().min(1, "Diagnosis is required"),
    // prescription: z.string().optional(),
})

interface CompleteAppointmentModalProps {
    onClose: () => void
    queue: FullQueueType | null
}

export default function CompleteAppointmentModal({
    onClose,
    queue,
}: CompleteAppointmentModalProps) {
    const [isOpen, setisOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const patient = useMemo(() => queue?.patient, [queue?.id])

    const form = useForm<z.infer<typeof completeAppointmentSchema>>({
        resolver: zodResolver(completeAppointmentSchema),
        defaultValues: {
            paymentAmount: "",
            // notes: "",
            // diagnosis: "",
            // prescription: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof completeAppointmentSchema>) => {
        setIsSubmitting(true)
        try {
            // backend
            console.log(values)
            form.reset()
            onClose()
        } catch (error) {
            console.error("Error completing appointment:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        form.reset()
        onClose()
        setisOpen(false)
    }

    if (!patient) return null

    return (
        <Dialog open={isOpen} onOpenChange={setisOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    Complete Appointment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Complete Appointment
                    </DialogTitle>
                    <DialogDescription>Complete the appointment for {patient.name} and record payment details.</DialogDescription>
                </DialogHeader>

                <div className="mb-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Patient Information</h4>
                    <div className="space-y-1 text-sm">
                        <p>
                            <strong>Name:</strong> {patient.name}
                        </p>
                        <p>
                            <strong>Email:</strong> {patient.email}
                        </p>
                        <p>
                            <strong>Phone:</strong> {patient.phone}
                        </p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* <FormField
                            control={form.control}
                            name="diagnosis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diagnosis *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter diagnosis" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="prescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prescription</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter prescription details (optional)" className="min-h-[80px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}

                        <FormField
                            control={form.control}
                            name="paymentAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Amount *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <HandCoinsIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input placeholder="0.00" className="pl-10" type="number" step="0.01" min="0" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any additional notes about the appointment (optional)"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> */}

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Making invoices..." : "Proceed to billing"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
