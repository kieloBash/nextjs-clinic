"use client"

import { useMemo } from "react"
import type { User } from "next-auth"
import {
    DollarSign,
    FileText,
    Stethoscope,
    Users,
    TrendingUp,
    BarChart3,
    Search,
    Clock,
    ArrowRight,
    CalendarPlus,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import PatientCTA from "./patient/cta"
import SummaryCards from "./patient/summary-cards"
import UpcomingAppointmentCard from "./patient/upcoming-appointments-card"
import FinancialOverviewCard from "./patient/financial-overview"

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

// Mock upcoming appointments
const mockUpcomingAppointments = [
    {
        id: "upcoming-001",
        doctorName: "Dr. Sarah Wilson",
        specialty: "Cardiology",
        date: new Date("2024-01-20T14:30:00"),
        type: "Follow-up",
        location: "Room 205",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: "upcoming-002",
        doctorName: "Dr. Michael Chen",
        specialty: "General Practice",
        date: new Date("2024-01-25T10:00:00"),
        type: "Consultation",
        location: "Room 101",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        id: "upcoming-003",
        doctorName: "Dr. Emily Rodriguez",
        specialty: "Dermatology",
        date: new Date("2024-02-02T16:15:00"),
        type: "Check-up",
        location: "Room 303",
        avatar: "/placeholder.svg?height=40&width=40",
    },
]

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
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


                {/* Call to Action */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <PatientCTA />
                    </div>
                    <SummaryCards
                        totalSpent={0}
                        totalAppointments={0}
                    />
                </div>

                <div className="flex justify-between items-start gap-6">
                    {/* Charts Section */}
                    <div className="flex flex-2/3 flex-col gap-6">
                        <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardHeader className="relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-slate-900">Invoice Status</CardTitle>
                                        <CardDescription>Breakdown of paid vs unpaid invoices</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={invoiceStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={90}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    strokeWidth={0}
                                                >
                                                    {invoiceStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                                                    <p className="font-medium text-gray-900">{payload[0].name}</p>
                                                                    <p className="text-sm text-gray-600">{payload[0].value} invoices</p>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                                <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">Paid ({analytics.paidInvoices})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">Unpaid ({analytics.unpaidInvoices})</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <CardHeader className="relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-slate-900">Most Visited Doctors</CardTitle>
                                        <CardDescription>Your most frequently consulted doctors</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={{}} className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.topDoctors} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: "#6b7280" }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval={0}
                                                angle={-35}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} width={30} />
                                            <Bar dataKey="visits" fill="#8b5cf6" radius={[4, 4, 0, 0]} strokeWidth={0} />
                                            <ChartTooltip
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                                                <p className="font-medium text-gray-900">Dr. {label}</p>
                                                                <p className="text-sm text-gray-600">
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

                    {/* Overviews */}
                    <div className="flex flex-col gap-6 flex-1/3">
                        <UpcomingAppointmentCard
                            appointments={[]}
                        />
                        <FinancialOverviewCard
                            totalSpent={0}
                            totalAppointments={0}
                            appointments={[]}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PatientMainPage


