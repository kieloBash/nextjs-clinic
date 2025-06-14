'use client'
import { ILayout } from '@/types/global.type'
import React, { useMemo } from 'react'
import { DoctorSidebar } from './doctor-sidebar'
import { DoctorHeader } from './doctor-header'
import { User } from 'next-auth'
import { usePathname } from 'next/navigation'
import { Calendar, HandCoinsIcon, Home, MessageSquare, Settings } from 'lucide-react'


const DoctorLayout = ({ children, user }: ILayout & { user: User }) => {

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
                title: "Appointments",
                url: "appointments",
                icon: Calendar,
                isActive: pathname.includes("/appointments"),
            },
            {
                title: "Billing",
                url: "/billing",
                icon: HandCoinsIcon,
                isActive: pathname.includes("/billing"),
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
            <DoctorSidebar routes={routes} />
            <div className="flex-1 flex flex-col relative">
                <DoctorHeader user={user} title={activeRoute?.title} />
                {children}
            </div>
        </div>
    )
}

export default DoctorLayout