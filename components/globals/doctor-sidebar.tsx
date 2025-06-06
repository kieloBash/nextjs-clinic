"use client"

import type React from "react"
import Link from "next/link"
import {
    LogOut,
    Heart,
    LucideProps,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { APP_NAME } from "@/utils/constants"

interface INavLink {
    title: string;
    url: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    isActive: boolean;
}

export function DoctorSidebar({ routes }: { routes: INavLink[] }) {

    return (
        <>
            <div
                className={cn(
                    "fixed h-screen left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:z-0")}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-4 border-b border-primary/20">
                        <div className="flex items-center gap-2">
                            <div className="bg-white rounded-full p-1">
                                <Heart className="h-6 w-6 text-primary" />
                            </div>
                            <span className="font-bold text-lg">{APP_NAME}</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3">
                        <div className="space-y-1">
                            <p className="px-3 text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider mb-2">
                                Main
                            </p>

                            {routes.map((route) => {
                                if (route.title === "Notifications") {
                                    return (<NavItem key={route.url} href={route.url} icon={route.icon} active={route.isActive}>
                                        Notifications
                                        <span className="ml-2 bg-white text-primary text-xs font-medium px-2 py-0.5 rounded-full">3</span>
                                    </NavItem>);
                                }


                                return (
                                    <NavItem key={route.url} href={route.url} icon={route.icon} active={route.isActive}>
                                        {route.title}
                                    </NavItem>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-primary/20">
                        <Button
                            onClick={() => signOut()}
                            variant="outline"
                            className="w-full justify-start text-primary-foreground bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

interface NavItemProps {
    href: string
    icon: React.ElementType
    children: React.ReactNode
    active?: boolean
}

function NavItem({ href, icon: Icon, children, active }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
            )}
        >
            <Icon className="h-4 w-4" />
            <span>{children}</span>
        </Link>
    )
}
