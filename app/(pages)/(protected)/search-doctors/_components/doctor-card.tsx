import React from 'react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge'
import { Calendar, Mail, Phone, Star } from 'lucide-react'
import Link from 'next/link'

const DoctorCard = ({ doctor }: { doctor: any }) => {

    const getExperienceBadge = (appointments: number) => {
        if (appointments >= 300) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Highly Experienced</Badge>
        } else if (appointments >= 150) {
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Experienced</Badge>
        } else if (appointments >= 50) {
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Developing</Badge>
        } else {
            return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">New</Badge>
        }
    }

    return (
        <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} />
                    <AvatarFallback className="text-lg">
                        {doctor.name
                            .split(" ")
                            .map((n: any) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                {/* <CardDescription className="font-medium text-primary">{doctor.specialization}</CardDescription> */}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Experience Badge */}
                <div className="flex justify-center">{getExperienceBadge(doctor.completedAppointments)}</div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-primary">{doctor.completedAppointments}</p>
                        <p className="text-xs text-muted-foreground">Completed Appointments</p>
                    </div>
                    {/* <div>
                        <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-2xl font-bold">{doctor.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Patient Rating</p>
                    </div> */}
                </div>

                {/* Experience */}
                {/* <div className="text-center">
                    <p className="text-sm text-muted-foreground">{doctor.experience} of experience</p>
                </div> */}

                {/* Contact Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{doctor.email}</span>
                    </div>
                    {/* {doctor.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{doctor.phone}</span>
                        </div>
                    )} */}
                </div>

                {/* Action Button */}
                <Link href={`/search-doctors/doctor/${doctor.id}`}>
                    <Button type='button' className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

export default DoctorCard