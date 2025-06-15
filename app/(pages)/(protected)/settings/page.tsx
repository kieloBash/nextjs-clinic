"use client"
import { useCurrentUser } from '@/libs/hooks';
import React from 'react'
import DoctorMainPage from './_components/doctor-main';

const SettingsPage = () => {
    const user = useCurrentUser();

    if (user) {
        if (user.role === "DOCTOR")
            return (
                <DoctorMainPage user={user} />
            )
        else if (user.role === "PATIENT") {
            return;
        }
    }

    return (
        <div className="">No Roles found!</div>
    )
}

export default SettingsPage