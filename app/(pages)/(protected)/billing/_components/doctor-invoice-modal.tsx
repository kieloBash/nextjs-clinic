"use client"

import { format } from "date-fns"
import { X, Calendar, User, DollarSign, FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FullInvoiceType } from "@/types/prisma.type"
import { getInvoiceDisplayId } from "../helper"
import { InvoiceStatus } from "@prisma/client"
import { useLoading } from "@/components/providers/loading-provider"
import { showToast } from "@/utils/helpers/show-toast"
import { CREATED_PROMPT_SUCCESS } from "@/utils/constants"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { CONFIRM_PAYMENT_APPOINTMENT } from "@/utils/api-endpoints"
import { KEY_GET_DOCTOR_APPOINTMENTS, KEY_GET_DOCTOR_QUEUES, KEY_GET_DOCTOR_TIMESLOTS } from "../../appointments/_hooks/keys"
import { KEY_GET_INVOICES } from "../_hooks/keys"

interface InvoiceDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    invoice: FullInvoiceType
    onMarkAsPaid?: (invoiceId: string) => void
}

export function InvoiceDetailsModal({ isOpen, onClose, invoice }: InvoiceDetailsModalProps) {
    const { isLoading, setIsLoading } = useLoading()
    const queryClient = useQueryClient();

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Paid
                    </Badge>
                )
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                )
            case "overdue":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Overdue
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <X className="w-3 h-3 mr-1" />
                        Cancelled
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const handleConfirmPayment = async () => {
        try {
            setIsLoading(true)
            const body = { appointmentId: invoice.appointment.id }
            const res = await axios.post(CONFIRM_PAYMENT_APPOINTMENT, body);
            showToast("success", CREATED_PROMPT_SUCCESS, res.data.message);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_QUEUES], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_APPOINTMENTS], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_DOCTOR_TIMESLOTS], exact: false }),
                queryClient.invalidateQueries({ queryKey: [KEY_GET_INVOICES], exact: false }),
            ]);

            onClose()

        } catch (error: any) {
            showToast("error", "Something went wrong!", error?.response?.data?.message || error.message);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Invoice Details</span>
                        {getStatusBadge(invoice.status)}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Invoice Header */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Invoice Number</p>
                                <p className="font-mono font-medium text-xs">
                                    <code>{getInvoiceDisplayId(invoice.id)}</code>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="text-2xl font-bold text-primary">₱{invoice.amount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created Date</p>
                                <p className="font-medium">{format(invoice.createdAt, "MMM dd, yyyy 'at' h:mm a")}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="font-medium">{format(invoice.updatedAt, "MMM dd, yyyy 'at' h:mm a")}</p>
                            </div>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Patient Information
                        </h3>
                        <div className="flex items-start space-x-4 p-4 border rounded-lg">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={invoice.patient.image || "/placeholder.svg"} />
                                <AvatarFallback>
                                    {invoice.patient.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="font-semibold">{invoice.patient.name}</h4>
                                <p className="text-sm text-muted-foreground">{invoice.patient.email}</p>
                                {invoice.patient.phone && <p className="text-sm text-muted-foreground">{invoice.patient.phone}</p>}
                                <p className="text-xs text-muted-foreground mt-1">Patient ID: {invoice.patient.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Appointment Details
                        </h3>
                        <div className="p-4 border rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <p className="text-sm text-muted-foreground">Date & Time</p>
                                    <p className="font-medium">{format(invoice.appointment.date, "MMM dd, yyyy 'at' h:mm a")}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium"> minutes</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Appointment ID</p>
                                <p className="text-xs font-mono">{invoice.appointment.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Payment Information
                        </h3>
                        <div className="p-4 border rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center text-lg font-semibold">
                                <span>Total Amount:</span>
                                <span className="text-primary">₱{invoice.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Created By */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Invoice Created By
                        </h3>
                        <div className="p-4 border rounded-lg">
                            <p className="font-medium">{invoice.creator.name}</p>
                            <p className="text-sm text-muted-foreground">{invoice.creator.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">Doctor ID: {invoice.creator.id}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button disabled={isLoading} variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {invoice.status === InvoiceStatus.PENDING && (
                            <Button disabled={isLoading} onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Paid
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
