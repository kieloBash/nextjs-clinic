"use client"

import { useState } from "react"
import type { User } from "next-auth"

import DoctorSummaryCards from "./doctor-summary-cards"
import DoctorPaymentHistoryTable from "./doctor-payment-history-table"
import { FullInvoiceType } from "@/types/prisma.type"

// Mock payment data
const mockPayments = [
    {
        id: "PAY-001",
        patientName: "Sarah Johnson",
        patientEmail: "sarah.johnson@email.com",
        patientAvatar: "/placeholder.svg?height=32&width=32",
        service: "General Consultation",
        amount: 150.0,
        status: "paid",
        paymentMethod: "Credit Card",
        date: new Date("2024-01-15"),
        invoiceNumber: "INV-2024-001",
    },
    {
        id: "PAY-002",
        patientName: "Michael Chen",
        patientEmail: "michael.chen@email.com",
        patientAvatar: "/placeholder.svg?height=32&width=32",
        service: "Follow-up Appointment",
        amount: 100.0,
        status: "pending",
        paymentMethod: "Insurance",
        date: new Date("2024-01-14"),
        invoiceNumber: "INV-2024-002",
    },
    {
        id: "PAY-003",
        patientName: "Emily Rodriguez",
        patientEmail: "emily.rodriguez@email.com",
        patientAvatar: "/placeholder.svg?height=32&width=32",
        service: "Specialist Consultation",
        amount: 250.0,
        status: "overdue",
        paymentMethod: "Cash",
        date: new Date("2024-01-10"),
        invoiceNumber: "INV-2024-003",
    },
    {
        id: "PAY-004",
        patientName: "David Wilson",
        patientEmail: "david.wilson@email.com",
        patientAvatar: "/placeholder.svg?height=32&width=32",
        service: "Routine Checkup",
        amount: 120.0,
        status: "paid",
        paymentMethod: "Debit Card",
        date: new Date("2024-01-12"),
        invoiceNumber: "INV-2024-004",
    },
    {
        id: "PAY-005",
        patientName: "Lisa Thompson",
        patientEmail: "lisa.thompson@email.com",
        patientAvatar: "/placeholder.svg?height=32&width=32",
        service: "Emergency Visit",
        amount: 300.0,
        status: "paid",
        paymentMethod: "Insurance",
        date: new Date("2024-01-13"),
        invoiceNumber: "INV-2024-005",
    },
    {
        id: "PAY-006",
        patientName: "Robert Brown",
        patientEmail: "robert.brown@email.com",
        patientAvatar: "/placeholder.svg?height=32&width=32",
        service: "Physical Therapy",
        amount: 80.0,
        status: "pending",
        paymentMethod: "Cash",
        date: new Date("2024-01-11"),
        invoiceNumber: "INV-2024-006",
    },
]

const DoctorBillingPage = ({ user }: { user: User }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const [selectedInvoice, setSelectedInvoice] = useState<FullInvoiceType | null>(null)
    const [isSelectedInvoiceOpen, setIsSelectedInvoiceOpen] = useState(false)

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Billing Dashboard</h1>
                    <p className="text-muted-foreground">Manage patient payments and billing</p>
                </div>
            </div>

            {/* Summary Cards */}
            <DoctorSummaryCards data={mockPayments} />

            {/* Filters and Search */}
            <DoctorPaymentHistoryTable
                data={mockPayments}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                selectedInvoice={selectedInvoice}
                isInvoiceOpen={isSelectedInvoiceOpen}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onSelectedInvoiceChange={setSelectedInvoice}
                onInvoiceOpen={setIsSelectedInvoiceOpen}
            />
        </div>
    )
}

export default DoctorBillingPage
