"use client"
import { useCurrentUser } from '@/libs/hooks';
import React from 'react'
import DoctorMainPage from './_components/doctor-main';
import DoctorLayout from '@/components/globals/doctor-layout';

const AppointmentsPage = () => {
    const user = useCurrentUser();
    console.log(user)

    if (user) {
        if (user.role === "DOCTOR")
            return (
                <DoctorLayout user={user}>
                    <DoctorMainPage user={user} />
                </DoctorLayout>)
        else if (user.role === "PATIENT") {
            return;
        }
    }

    return (
        <div className="">No Roles found!</div>
    )
}

export default AppointmentsPage