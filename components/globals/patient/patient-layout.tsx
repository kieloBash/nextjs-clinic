'use client'
import { ILayout } from '@/types/global.type'
import React, { useMemo } from 'react'
import { User } from 'next-auth'
import { usePathname } from 'next/navigation'
import { Calendar, Home, MessageSquare, Settings, Users } from 'lucide-react'
import { PatientSidebar } from './patient-sidebar'
import { PatientHeader } from './patient-header'
import AIChatbot from '../chatbot'


const PatientLayout = ({ children, user }: ILayout & { user: User }) => {

    const pathname = usePathname();

    const routes = useMemo(() => {
        return [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: Home,
                isActive: pathname.includes("/dashboard"),
            },
            {
                title: "Search Doctors",
                url: "/search-doctors",
                icon: Users,
                isActive: pathname.includes("/search-doctors"),
            },
            {
                title: "My Appointments",
                url: "/appointments",
                icon: Calendar,
                isActive: pathname.includes("/appointments"),
            },
            {
                title: "Notifications",
                url: "/notifications",
                icon: MessageSquare,
                isActive: pathname.includes("/notifications"),
            },
            {
                title: "Settings",
                url: "/settings",
                icon: Settings,
                isActive: pathname.includes("/settings"),
            },
        ]
    }, [pathname])

    const activeRoute = routes.find((r) => r.isActive);

    return (
        <div className='relative w-full min-h-screen bg-gray-50 flex'>
            <PatientSidebar routes={routes} />
            <div className="flex-1 flex flex-col relative">
                <PatientHeader user={user} title={activeRoute?.title} />
                {children}
            </div>
            <AIChatbot />
        </div>
    )
}

export default PatientLayout