"use client"

import { format } from "date-fns"
import {
    Calendar,
    User,
    DollarSign,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Download,
    Printer,
} from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FullAppointmentType } from "@/types/prisma.type"
import { useMemo } from "react"
import { getDifferenceTimeSlot } from "@/utils/helpers/date"

interface ViewInvoiceModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: FullAppointmentType
}

export function ViewInvoiceModal({ isOpen, onClose, appointment }: ViewInvoiceModalProps) {
    const getStatusBadge = (status?: string) => {
        switch (status?.toLowerCase()) {
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
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        // In a real app, this would generate and download a PDF
        console.log("Downloading invoice PDF...")
        alert("PDF download would be implemented here")
    }

    const { doctor, invoice, patient } = useMemo(() => {
        return {
            doctor: appointment.doctor,
            invoice: appointment?.invoice,
            patient: appointment.patient
        }
    }, [appointment])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto min-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Invoice Details</span>
                        <div className="flex items-center gap-2">{getStatusBadge(invoice?.status)}</div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Invoice Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{doctor?.name}</h2>
                                <p className="text-gray-600">Phone: {doctor?.phone}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
                                <p className="text-gray-600">#{invoice?.id}</p>
                                {invoice?.createdAt && (
                                    <p className="text-sm text-gray-500">Date: {format(invoice?.createdAt, "MMM dd, yyyy")}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bill To */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Bill To
                            </h3>
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <div className="flex items-start space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={patient?.image ?? ""} />
                                        <AvatarFallback>
                                            {patient.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                                        <p className="text-sm text-gray-600">{patient.email}</p>
                                        {patient?.phone && <p className="text-sm text-gray-600">{patient.phone}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Provider
                            </h3>
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                                <p className="text-sm text-gray-600">{doctor.email}</p>
                                {doctor.phone && <p className="text-sm text-gray-600">{doctor.phone}</p>}
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* <div>
                                    <p className="text-sm text-gray-500">Service</p>
                                    <p className="font-medium">{appointment.service}</p>
                                </div> */}
                                <div>
                                    <p className="text-sm text-gray-500">Date & Time</p>
                                    <p className="font-medium">{format(appointment.date, "MMM dd, yyyy 'at' h:mm a")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium">{getDifferenceTimeSlot(appointment.timeSlot)} minutes</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Appointment ID</p>
                                <p className="text-xs font-mono text-gray-600">{appointment.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Items */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Invoice Items
                        </h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Duration</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Consultation on {format(appointment.date, "MMM dd, yyyy")}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{getDifferenceTimeSlot(appointment.timeSlot)} min</td>
                                        <td className="px-4 py-3 text-right font-medium">${invoice?.amount?.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">${invoice?.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Tax:</span>
                                <span className="font-medium">$0.00</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-blue-600">${invoice?.amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                        <div className="p-4 border rounded-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <div className="mt-1">{getStatusBadge(invoice?.status)}</div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Invoice Date</p>
                                {invoice?.createdAt && (
                                    <p className="font-medium">{format(invoice?.createdAt, "MMM dd, yyyy 'at' h:mm a")}</p>
                                )}
                            </div>

                            {invoice?.status.toLowerCase() === "paid" && (
                                <div className="bg-green-50 border border-green-200 p-3 rounded">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                        <span className="text-sm text-green-800 font-medium">Payment completed successfully</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-500">Invoice ID: {invoice?.id}</div>
                        <div className="flex space-x-3">
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                            <Button onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
