import { Activity, Calendar, Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DoctorStatsCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">Total Patients</CardTitle>
                        <CardDescription>Active patient count</CardDescription>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,248</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 font-medium">+8%</span> from last month
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">Today's Appointments</CardTitle>
                        <CardDescription>Scheduled for today</CardDescription>
                    </div>
                    <div className="bg-blue-500/10 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 font-medium">+2</span> from yesterday
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
