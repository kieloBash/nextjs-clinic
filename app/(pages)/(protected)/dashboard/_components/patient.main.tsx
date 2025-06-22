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

  const handleSearchDoctors = () => {
    console.log("Navigate to doctor search page")
    // In a real app, you would navigate to the doctor search page
  }

  const handleViewAllAppointments = () => {
    console.log("Navigate to appointments page")
    // In a real app, you would navigate to the appointments page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
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

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Doctors Card */}
          <Card
            className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
            onClick={handleSearchDoctors}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Find a Doctor</CardTitle>
                    <CardDescription className="text-cyan-100">Search and book appointments</CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-cyan-100 mb-4 leading-relaxed">
                Browse through our network of specialists and book your next appointment with ease.
              </p>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled visits</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
                  {mockUpcomingAppointments.length} upcoming
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {mockUpcomingAppointments.slice(0, 2).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                      <AvatarImage src={appointment.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {appointment.doctorName
                          .split(" ")
                          .map((n) => n[1])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{appointment.doctorName}</p>
                      <p className="text-sm text-slate-600">{appointment.specialty}</p>
                      <p className="text-xs text-slate-500">
                        {appointment.date.toLocaleDateString()} at{" "}
                        {appointment.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white/50 border-slate-300">
                      {appointment.type}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 bg-white/50 hover:bg-white border-slate-300"
                onClick={handleViewAllAppointments}
              >
                View All Appointments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
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

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-100">Doctors Consulted</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Stethoscope className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{analytics.uniqueDoctors}</div>
              <p className="text-xs text-purple-100">Different specialists</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-orange-100">Unpaid Invoices</CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold">{analytics.unpaidInvoices}</div>
              <p className="text-xs text-orange-100">Pending payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Status Chart */}
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
            <CardContent className="relative z-10">
              <ChartContainer config={chartConfig} className="h-[280px]">
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
                      strokeWidth={2}
                      stroke="#ffffff"
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
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Paid ({analytics.paidInvoices})</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-800">Unpaid ({analytics.unpaidInvoices})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Most Visited Doctors Chart */}
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
            <CardContent className="relative z-10">
              <ChartContainer config={{}} className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topDoctors} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} />
                    <Bar
                      dataKey="visits"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-slate-900">Dr. {label}</p>
                              <p className="text-sm text-slate-600">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  $
                  {(
                    analytics.totalSpent -
                    mockPatientData.appointments
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
                  {mockPatientData.appointments
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
      </div>
    </div>
  )
}

export default PatientMainPage
