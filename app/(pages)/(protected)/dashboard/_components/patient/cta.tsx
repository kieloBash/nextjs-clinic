import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CalendarPlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const PatientCTA = () => {
    return (
        <Link href={"/search-doctors"}>
            <Card
                className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
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
        </Link>
    )
}

export default PatientCTA