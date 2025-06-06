import DoctorLayout from '@/components/globals/doctor-layout';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/libs/auth'
import { ILayout } from '@/types/global.type'
import { CheckCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

const Layout = async ({ children }: ILayout) => {
    const user = await currentUser();

    if (!user) redirect(`/auth/error?message=Unauthenticated User`);

    if (user.role === "DOCTOR") {
        return (
            <DoctorLayout user={user}>{children}</DoctorLayout>
        )
    } else if (user.role === "PATIENT") {
        return (
            <>{children}</>
        )
    } else {
        return (
            <div className="w-screen min-h-screen relative bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-100 rounded-full opacity-20 animate-pulse"></div>
                    <div
                        className="absolute top-40 right-20 w-16 h-16 bg-green-100 rounded-full opacity-20 animate-pulse"
                        style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                        className="absolute bottom-20 left-20 w-24 h-24 bg-red-100 rounded-full opacity-20 animate-pulse"
                        style={{ animationDelay: "2s" }}
                    ></div>
                    <div
                        className="absolute bottom-40 right-10 w-12 h-12 bg-purple-100 rounded-full opacity-20 animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                    ></div>
                </div>

                <div className="container flex justify-center items-center flex-col gap-4">
                    <div className="flex justify-center mb-2">
                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-center text-2xl font-bold text-primary">Uh oh, please sign in first!</h1>
                    <Link href={"/auth/sign-in"}>
                        <Button type='button' size={"lg"}>Sign In!</Button>
                    </Link>
                </div>
            </div>
        )
    }

}

export default Layout