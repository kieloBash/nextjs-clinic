import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users } from 'lucide-react'

interface IProps {
    totalSpent: number
    totalAppointments: number
}
const SummaryCards = (analytics: IProps) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-blue-100">Total Spent</CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <DollarSign className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">${analytics.totalSpent.toFixed(2)}</div>
                    <p className="text-xs text-blue-100">All time medical expenses</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-emerald-100">Total Appointments</CardTitle>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Users className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">{analytics.totalAppointments}</div>
                    <p className="text-xs text-emerald-100">Completed visits</p>
                </CardContent>
            </Card>

        </div>)
}

export default SummaryCards