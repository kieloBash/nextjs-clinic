import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, DollarSign } from 'lucide-react'
import { InvoiceStatus } from '@prisma/client'
import { FullInvoiceType } from '@/types/prisma.type'

const DoctorSummaryCards = ({ data }: { data: FullInvoiceType[] }) => {

    const summaryStats = useMemo(() => {
        const totalRevenue = data
            .filter((p) => p.status === InvoiceStatus.PAID)
            .reduce((sum, payment) => sum + payment.amount, 0)

        const pendingAmount = data
            .filter((p) => p.status === InvoiceStatus.PENDING)
            .reduce((sum, payment) => sum + payment.amount, 0)

        return { totalRevenue, pendingAmount }
    }, [data])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₱{summaryStats.totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">From paid invoices</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₱{summaryStats.pendingAmount.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Awaiting payment</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default DoctorSummaryCards