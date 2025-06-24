'use client'
import { ILayout } from '@/types/global.type'
import React, { useMemo } from 'react'

import { User } from 'next-auth'
import { usePathname } from 'next/navigation'
import { Calendar, HandCoinsIcon, Home, MessageSquare, NotebookPenIcon, Settings, Users } from 'lucide-react'
import { AdminHeader } from './admin-header'
import { AdminSidebar } from './admin-sidebar'


const AdminLayout = ({ children, user }: ILayout & { user: User }) => {

    const pathname = usePathname();

    const routes = useMemo(() => {
        return [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: Home,
                isActive: pathname.includes("/dashboard"),
            },
            // {
            //     title: "User Managemnt",
            //     url: "/users",
            //     icon: Users,
            //     isActive: pathname.includes("/users"),
            // },
            // {
            //     title: "Reports",
            //     url: "/reports",
            //     icon: NotebookPenIcon,
            //     isActive: pathname.includes("/reports"),
            // },
            // {
            //     title: "Audit Logs",
            //     url: "/logs",
            //     icon: MessageSquare,
            //     isActive: pathname.includes("/logs"),
            // },
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
            <AdminSidebar routes={routes} />
            <div className="flex-1 flex flex-col relative">
                <AdminHeader user={user} title={activeRoute?.title} />
                {children}
            </div>
        </div>
    )
}

export default AdminLayout