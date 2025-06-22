import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from 'lucide-react'

interface IProps {
    totalSpent: number
    totalAppointments: number
    appointments: any[]
}
const FinancialOverviewCard = ({ appointments, ...analytics }: IProps) => {
    return (
        <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full -translate-y-20 translate-x-20"></div>
            <CardHeader className="relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900">Financial Overview</CardTitle>
                        <CardDescription>Summary of your healthcare expenses</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="grid grid-cols-1 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            $
                            {(
                                analytics.totalSpent -
                                appointments
                                    .filter((apt) => !apt.invoicePaid)
                                    .reduce((sum, apt) => sum + apt.amount, 0)
                            ).toFixed(2)}
                        </div>
                        <p className="text-sm font-medium text-green-800">Amount Paid</p>
                        <p className="text-xs text-green-600 mt-1">Successfully processed</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200/50">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            $
                            {appointments
                                .filter((apt) => !apt.invoicePaid)
                                .reduce((sum, apt) => sum + apt.amount, 0)
                                .toFixed(2)}
                        </div>
                        <p className="text-sm font-medium text-red-800">Outstanding Balance</p>
                        <p className="text-xs text-red-600 mt-1">Requires payment</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            ${(analytics.totalSpent / analytics.totalAppointments).toFixed(2)}
                        </div>
                        <p className="text-sm font-medium text-blue-800">Average per Visit</p>
                        <p className="text-xs text-blue-600 mt-1">Cost efficiency</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default FinancialOverviewCard