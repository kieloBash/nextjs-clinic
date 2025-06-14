"use client"

import { useState } from "react"
import type { User } from "next-auth"

import DoctorSummaryCards from "./doctor-summary-cards"
import DoctorPaymentHistoryTable from "./doctor-payment-history-table"
import { FullInvoiceType } from "@/types/prisma.type"
import useDoctorInvoices from "../_hooks/doctor/use-invoices"
import SimpleLoadingPage from "@/components/globals/loading-simple"
import MainLoadingPage from "@/components/globals/main-loading"

const DoctorBillingPage = ({ user }: { user: User }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const [selectedInvoice, setSelectedInvoice] = useState<FullInvoiceType | null>(null)
    const [isSelectedInvoiceOpen, setIsSelectedInvoiceOpen] = useState(false)

    const data = useDoctorInvoices({ doctorId: user.id });

    if (data.isLoading) {
        return <MainLoadingPage/>
    }

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
            <DoctorSummaryCards data={data?.payload ?? []} />

            {/* Filters and Search */}
            <DoctorPaymentHistoryTable
                data={data?.payload ?? []}
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
