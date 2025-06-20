import { Card, CardContent } from '@/components/ui/card'
import { isFuture } from 'date-fns'
import { Calendar, CheckCircle, Clock, X } from 'lucide-react'
import React, { useMemo } from 'react'

const StatsCards = ({ data }: { data: any[] }) => {

    const appointmentStats = useMemo(() => {
        const stats = {
            total: data.length,
            upcoming: 0,
            completed: 0,
            cancelled: 0,
        }

        data.forEach((appointment) => {
            if (appointment.status === "COMPLETED") {
                stats.completed++
            } else if (appointment.status === "CANCELLED") {
                stats.cancelled++
            } else if (isFuture(appointment.date)) {
                stats.upcoming++
            }
        })

        return stats
    }, [data])

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{appointmentStats.total}</div>
                            <p className="text-blue-100">Total Appointments</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-200" />
                    </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{appointmentStats.upcoming}</div>
                            <p className="text-emerald-100">Upcoming</p>
                        </div>
                        <Clock className="h-8 w-8 text-emerald-200" />
                    </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{appointmentStats.completed}</div>
                            <p className="text-purple-100">Completed</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-purple-200" />
                    </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{appointmentStats.cancelled}</div>
                            <p className="text-red-100">Cancelled</p>
                        </div>
                        <X className="h-8 w-8 text-red-200" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default StatsCards