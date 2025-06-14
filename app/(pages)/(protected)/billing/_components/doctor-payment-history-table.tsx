import React, { useMemo } from 'react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, CheckCircle, Clock, Download, Eye, MoreHorizontal, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { FullInvoiceType } from '@/types/prisma.type'
import { InvoiceDetailsModal } from './doctor-invoice-modal'

interface IProps {
    data: any[]
    searchTerm: string
    statusFilter: string
    selectedInvoice: FullInvoiceType | null
    isInvoiceOpen: boolean;
    onSearchChange: (e: string) => void
    onStatusChange: (e: string) => void
    onSelectedInvoiceChange: (e: FullInvoiceType | null) => void
    onInvoiceOpen: (e: boolean) => void
}
const DoctorPaymentHistoryTable = (
    { data, searchTerm, statusFilter, onStatusChange, onSearchChange, onSelectedInvoiceChange, onInvoiceOpen, isInvoiceOpen, selectedInvoice }: IProps) => {

    const filteredPayments = useMemo(() => {
        return data.filter((payment) => {
            const matchesSearch =
                payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = statusFilter === "all" || payment.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [searchTerm, statusFilter])

    const getStatusBadge = (status: string) => {
        switch (status) {
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

    const handleViewDetails = (payment: any) => {
        const invoiceData = {
            id: payment.id,
            patientId: payment.patientId || "patient-id",
            appointmentId: payment.appointmentId || "appointment-id",
            createdBy: "doctor-id",
            amount: payment.amount,
            status: payment.status.toUpperCase(),
            createdAt: payment.date,
            updatedAt: payment.date,
            invoiceNumber: payment.invoiceNumber,
            paymentMethod: payment.paymentMethod,
            patient: {
                id: payment.patientId || "patient-id",
                name: payment.patientName,
                email: payment.patientEmail,
                avatar: payment.patientAvatar,
            },
            creator: {
                id: "doctor-id",
                name: "Dr. Smith",
                email: "doctor@clinic.com",
            },
            appointment: {
                id: payment.appointmentId || "appointment-id",
                date: payment.date,
                service: payment.service,
                duration: 30,
                notes: "Regular consultation",
            },
        }
        onSelectedInvoiceChange(invoiceData as any)
        onInvoiceOpen(true)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View and manage all patient payments</CardDescription>
            </CardHeader>
            <CardContent>
                {isInvoiceOpen && selectedInvoice && (
                    <InvoiceDetailsModal
                        isOpen={isInvoiceOpen}
                        onClose={() => onInvoiceOpen(false)}
                        onMarkAsPaid={() => { }}
                        invoice={selectedInvoice}
                    />
                )}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search patients, services, or invoice numbers..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Payments Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={payment.patientAvatar || "/placeholder.svg"} />
                                                <AvatarFallback>
                                                    {payment.patientName
                                                        .split(" ")
                                                        .map((n: any) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{payment.patientName}</div>
                                                <div className="text-sm text-muted-foreground">{payment.patientEmail}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{payment.service}</TableCell>
                                    <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                    <TableCell>{payment.paymentMethod}</TableCell>
                                    <TableCell>{format(payment.date, "MMM dd, yyyy")}</TableCell>
                                    <TableCell>
                                        <code className="text-sm bg-muted px-2 py-1 rounded">{payment.invoiceNumber}</code>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {payment.status === "pending" && (
                                                    <DropdownMenuItem>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Mark as Paid
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {filteredPayments.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No payments found matching your criteria.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default DoctorPaymentHistoryTable