'use client'
import { useCurrentUser } from '@/libs/hooks';
import React from 'react'
import DoctorMainPage from './_components/doctor-main';
import PatientMainPage from './_components/patient.main';

const DashboardPage = () => {
    const user = useCurrentUser();

    console.log(user)
    if (user) {
        if (user.role === "DOCTOR")
            return (
                <DoctorMainPage user={user} />
            )
        else if (user.role === "PATIENT") {
            return (
                <PatientMainPage user={user} />
            )
        }
    }


    return (
        <div className="">No Roles found!</div>
    )
}

export default DashboardPage