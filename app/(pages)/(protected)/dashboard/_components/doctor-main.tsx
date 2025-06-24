"use client"

import { useMemo, useState } from "react"
import type { User } from "next-auth"
import { TrendingUp, Users, DollarSign, Calendar, BarChart3, ArrowUpRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Area,
    AreaChart,
    Line,
    LineChart,
    Pie,
    PieChart,
    Cell,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts"
import useAnalytics from "../_hooks/use-analytics"
import MainLoadingPage from "@/components/globals/main-loading"
import { AppointmentStatus } from "@prisma/client"

// Mock data for patients seen per week/month
const patientsData = [
    { period: "Week 1", patients: 24 },
    { period: "Week 2", patients: 31 },
    { period: "Week 3", patients: 28 },
    { period: "Week 4", patients: 35 },
    { period: "Week 5", patients: 42 },
    { period: "Week 6", patients: 38 },
    { period: "Week 7", patients: 45 },
    { period: "Week 8", patients: 52 },
]

const monthlyPatientsData = [
    { period: "Jan", patients: 120 },
    { period: "Feb", patients: 135 },
    { period: "Mar", patients: 148 },
    { period: "Apr", patients: 162 },
    { period: "May", patients: 178 },
    { period: "Jun", patients: 195 },
]

// Mock data for revenue over time
const revenueData = [
    { period: "Week 1", revenue: 3600 },
    { period: "Week 2", revenue: 4650 },
    { period: "Week 3", revenue: 4200 },
    { period: "Week 4", revenue: 5250 },
    { period: "Week 5", revenue: 6300 },
    { period: "Week 6", revenue: 5700 },
    { period: "Week 7", revenue: 6750 },
    { period: "Week 8", revenue: 7800 },
]

const monthlyRevenueData = [
    { period: "Jan", revenue: 18000 },
    { period: "Feb", revenue: 20250 },
    { period: "Mar", revenue: 22200 },
    { period: "Apr", revenue: 24300 },
    { period: "May", revenue: 26700 },
    { period: "Jun", revenue: 29250 },
]

// Mock data for appointment status breakdown
const appointmentStatusData = [
    { status: "Completed", count: 156, fill: "#10b981", percentage: 69.6 },
    { status: "Scheduled", count: 42, fill: "#3b82f6", percentage: 18.8 },
    { status: "Cancelled", count: 18, fill: "#f59e0b", percentage: 8.0 },
    { status: "No Show", count: 8, fill: "#ef4444", percentage: 3.6 },
]

const DoctorMainPage = ({ user }: { user: User }) => {
    const [patientsTimeframe, setPatientsTimeframe] = useState("weekly")
    const [revenueTimeframe, setRevenueTimeframe] = useState("weekly")

    const currentPatientsData = patientsTimeframe === "weekly" ? patientsData : monthlyPatientsData
    const currentRevenueData = revenueTimeframe === "weekly" ? revenueData : monthlyRevenueData

    // Calculate summary stats


    // Calculate growth percentages (mock data)
    const patientsGrowth = 12.5
    const revenueGrowth = 8.3
    const appointmentsGrowth = 15.2
    const completionGrowth = 2.1

    const analytics = useAnalytics({ userId: user.id })

    const formatStatusData = (data: { status: string; count: number }[]) => {
        const total = data.reduce((sum, item) => sum + item.count, 0);

        const statusMap: Record<string, { label: string; fill: string }> = {
            PENDING: { label: AppointmentStatus.PENDING, fill: "#3b82f6" },
            CONFIRMED: { label: AppointmentStatus.CONFIRMED, fill: "#3b82f6" },
            PENDING_PAYMENT: { label: AppointmentStatus.PENDING_PAYMENT, fill: "#3b82f6" },

            COMPLETED: { label: AppointmentStatus.COMPLETED, fill: "#10b981" },
            CANCELLED: { label: AppointmentStatus.CANCELLED, fill: "#f59e0b" },
            RESCHEDULED: { label: AppointmentStatus.RESCHEDULED, fill: "#ef4444" }, // or a different label if needed
        };

        const aggregatedMap = new Map<string, { count: number; fill: string }>();

        for (const { status, count } of data) {
            const mapped = statusMap[status];
            if (!mapped) continue;

            const key = mapped.label;

            if (!aggregatedMap.has(key)) {
                aggregatedMap.set(key, { count, fill: mapped.fill });
            } else {
                const prev = aggregatedMap.get(key)!;
                aggregatedMap.set(key, { count: prev.count + count, fill: mapped.fill });
            }
        }

        const formatted = Array.from(aggregatedMap.entries()).map(([status, { count, fill }]) => ({
            status,
            count,
            fill,
            percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0
        }));

        return formatted;
    };

    const { totalPatients, totalAppointments, totalRevenue, completionRate, appointmentStatusData } = useMemo(() => {
        if (!analytics.payload)
            return {
                totalPatients: 0, totalRevenue: 0, totalAppointments: 0, completionRate: 0,
                appointmentStatusData: []
            }

        return { ...analytics.payload, appointmentStatusData: formatStatusData(analytics.payload.appointmentStatusBreakdown) }
    }, [analytics])

    if (analytics.isLoading) {
        return <MainLoadingPage />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            Analytics Dashboard
                        </h1>
                        <p className="text-slate-600 text-lg">Track your practice performance and insights</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-blue-100">Total Patients</CardTitle>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Users className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold">{totalPatients}</div>
                            {/* <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="h-4 w-4 text-green-300" />
                                <span className="text-sm text-blue-100">+{patientsGrowth}% from last period</span>
                            </div> */}
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-emerald-100">Total Revenue</CardTitle>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold">₱{totalRevenue.toLocaleString()}</div>
                            {/* <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="h-4 w-4 text-green-300" />
                                <span className="text-sm text-emerald-100">+{revenueGrowth}% from last period</span>
                            </div> */}
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-purple-100">Total Appointments</CardTitle>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Calendar className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold">{totalAppointments}</div>
                            {/* <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="h-4 w-4 text-green-300" />
                                <span className="text-sm text-purple-100">+{appointmentsGrowth}% from last period</span>
                            </div> */}
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-orange-100">Completion Rate</CardTitle>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold">{completionRate}%</div>
                            {/* <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="h-4 w-4 text-green-300" />
                                <span className="text-sm text-orange-100">+{completionGrowth}% from last period</span>
                            </div> */}
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-8">

                    {/* Revenue Chart */}
                    {/* <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-semibold text-slate-800">Revenue Over Time</CardTitle>
                                    <CardDescription className="text-slate-600">Revenue generated over time</CardDescription>
                                </div>
                                <Select value={revenueTimeframe} onValueChange={setRevenueTimeframe}>
                                    <SelectTrigger className="w-[130px] border-slate-200 bg-white/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={currentRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="period"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#64748b", fontSize: 12 }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                backdropFilter: "blur(10px)",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                            }}
                                            formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#06b6d4"
                                            strokeWidth={3}
                                            fill="url(#revenueGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card> */}
                </div>

                {/* Appointment Status Breakdown */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-semibold text-slate-800">Appointment Status Breakdown</CardTitle>
                            <CardDescription className="text-slate-600">Distribution of appointment statuses</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Pie Chart */}
                            <div className="flex justify-center">
                                <div className="h-[320px] w-[320px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <defs>
                                                {appointmentStatusData?.map((entry, index) => (
                                                    <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                                        <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                                                        <stop offset="100%" stopColor={entry.fill} stopOpacity={0.8} />
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <Pie
                                                data={appointmentStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={130}
                                                paddingAngle={3}
                                                dataKey="count"
                                            >
                                                {appointmentStatusData?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} stroke="#fff" strokeWidth={2} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                    backdropFilter: "blur(10px)",
                                                    border: "1px solid #e2e8f0",
                                                    borderRadius: "8px",
                                                }}
                                                formatter={(value, name) => [`${value} appointments`, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Legend and Stats */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-slate-800">Status Summary</h3>
                                <div className="space-y-4">
                                    {appointmentStatusData?.map((item, index) => (
                                        <div key={item.status} className="group">
                                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50/50 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.fill }}></div>
                                                    <span className="font-medium text-slate-700">{item.status}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg text-slate-800">{item.count}</div>
                                                    <div className="text-sm text-slate-500">{item.percentage.toFixed(1)}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-slate-200">
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl">
                                        <span className="font-semibold text-slate-800">Total Appointments</span>
                                        <span className="font-bold text-xl text-slate-800">{totalAppointments}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DoctorMainPage
