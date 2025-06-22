"use client"

import { useMemo } from "react"
import type { User } from "next-auth"
import { Calendar, DollarSign, FileText, Stethoscope, Users, TrendingUp, BarChart3 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

// Mock data for patient analytics
const mockPatientData = {
    appointments: [
        {
            id: "apt-001",
            doctorName: "Dr. Sarah Wilson",
            specialty: "Cardiology",
            date: new Date("2024-01-15"),
            amount: 200.0,
            status: "completed",
            invoicePaid: true,
        },
        {
            id: "apt-002",
            doctorName: "Dr. Michael Chen",
            specialty: "General Practice",
            date: new Date("2024-01-10"),
            amount: 150.0,
            status: "completed",
            invoicePaid: true,
        },
        {
            id: "apt-003",
            doctorName: "Dr. Sarah Wilson",
            specialty: "Cardiology",
            date: new Date("2024-01-05"),
            amount: 180.0,
            status: "completed",
            invoicePaid: false,
        },
        {
            id: "apt-004",
            doctorName: "Dr. Emily Rodriguez",
            specialty: "Dermatology",
            date: new Date("2023-12-20"),
            amount: 120.0,
            status: "completed",
            invoicePaid: true,
        },
        {
            id: "apt-005",
            doctorName: "Dr. Michael Chen",
            specialty: "General Practice",
            date: new Date("2023-12-15"),
            amount: 150.0,
            status: "completed",
            invoicePaid: true,
        },
        {
            id: "apt-006",
            doctorName: "Dr. Sarah Wilson",
            specialty: "Cardiology",
            date: new Date("2023-12-01"),
            amount: 200.0,
            status: "completed",
            invoicePaid: true,
        },
        {
            id: "apt-007",
            doctorName: "Dr. David Kim",
            specialty: "Orthopedics",
            date: new Date("2023-11-25"),
            amount: 250.0,
            status: "completed",
            invoicePaid: false,
        },
        {
            id: "apt-008",
            doctorName: "Dr. Michael Chen",
            specialty: "General Practice",
            date: new Date("2023-11-10"),
            amount: 150.0,
            status: "completed",
            invoicePaid: true,
        },
    ],
}

const PatientMainPage = ({ user }: { user: User }) => {
    // Calculate analytics
    const analytics = useMemo(() => {
        const appointments = mockPatientData.appointments

        // Total amount spent
        const totalSpent = appointments.reduce((sum, apt) => sum + apt.amount, 0)

        // Paid vs unpaid invoices
        const paidInvoices = appointments.filter((apt) => apt.invoicePaid).length
        const unpaidInvoices = appointments.filter((apt) => !apt.invoicePaid).length

        // Doctor visit frequency
        const doctorVisits: { [key: string]: number } = {}
        appointments.forEach((apt) => {
            doctorVisits[apt.doctorName] = (doctorVisits[apt.doctorName] || 0) + 1
        })

        // Number of different doctors
        const uniqueDoctors = Object.keys(doctorVisits).length

        // Total appointments
        const totalAppointments = appointments.length

        // Most frequently visited doctors (top 5)
        const topDoctors = Object.entries(doctorVisits)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, visits]) => ({
                name: name.replace("Dr. ", ""),
                visits,
            }))

        return {
            totalSpent,
            paidInvoices,
            unpaidInvoices,
            uniqueDoctors,
            totalAppointments,
            topDoctors,
        }
    }, [])

    // Chart data
    const invoiceStatusData = [
        {
            name: "Paid",
            value: analytics.paidInvoices,
            color: "#22c55e",
        },
        {
            name: "Unpaid",
            value: analytics.unpaidInvoices,
            color: "#ef4444",
        },
    ]

    const chartConfig = {
        paid: {
            label: "Paid",
            color: "#22c55e",
        },
        unpaid: {
            label: "Unpaid",
            color: "#ef4444",
        },
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        My Health Dashboard
                    </h1>
                    <p className="text-slate-600 text-lg">Overview of your medical appointments and expenses</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Spent</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">${analytics.totalSpent.toFixed(2)}</div>
                        <p className="text-xs">All time medical expenses</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Appointments</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">{analytics.totalAppointments}</div>
                        <p className="text-xs">Completed visits</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Consulted</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Stethoscope className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">{analytics.uniqueDoctors}</div>
                        <p className="text-xs">Different specialists</p>
                    </CardContent>
                </Card>

                 <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-blue-100">Unpaid Invoices</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                     <div className="text-2xl font-bold">{analytics.unpaidInvoices}</div>
                        <p className="text-xs">Pending payments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Status Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice Status
                        </CardTitle>
                        <CardDescription>Breakdown of paid vs unpaid invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={invoiceStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {invoiceStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm">Paid ({analytics.paidInvoices})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm">Unpaid ({analytics.unpaidInvoices})</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Most Visited Doctors Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Most Visited Doctors
                        </CardTitle>
                        <CardDescription>Your most frequently consulted doctors</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.topDoctors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <ChartTooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-background border rounded-lg shadow-lg p-3">
                                                        <p className="font-medium">Dr. {label}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {payload[0].value} visit{payload[0].value !== 1 ? "s" : ""}
                                                        </p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Quick Overview
                    </CardTitle>
                    <CardDescription>Summary of your healthcare journey</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                $
                                {(
                                    analytics.totalSpent -
                                    mockPatientData.appointments
                                        .filter((apt) => !apt.invoicePaid)
                                        .reduce((sum, apt) => sum + apt.amount, 0)
                                ).toFixed(2)}
                            </div>
                            <p className="text-sm text-muted-foreground">Amount Paid</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                $
                                {mockPatientData.appointments
                                    .filter((apt) => !apt.invoicePaid)
                                    .reduce((sum, apt) => sum + apt.amount, 0)
                                    .toFixed(2)}
                            </div>
                            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                ${(analytics.totalSpent / analytics.totalAppointments).toFixed(2)}
                            </div>
                            <p className="text-sm text-muted-foreground">Average per Visit</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PatientMainPage
