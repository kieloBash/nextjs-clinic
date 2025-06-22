import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface IProps {
    appointments: any[]
}
const UpcomingAppointmentCard = ({ appointments }: IProps) => {
    return (
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
                        {appointments.length} upcoming
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="space-y-3">
                    {appointments.slice(0, 2).map((appointment) => (
                        <div
                            key={appointment.id}
                            className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50"
                        >
                            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                                <AvatarImage src={appointment.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                    {appointment.doctorName
                                        .split(" ")
                                        .map((n: any) => n[1])
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
                <Link href={"/appointments"}>
                    <Button
                        variant="outline"
                        className="w-full mt-4 bg-white/50 hover:bg-white border-slate-300"
                    >
                        View All Appointments
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

export default UpcomingAppointmentCard