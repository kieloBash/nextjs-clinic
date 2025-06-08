'use client'
import { useCurrentUser } from '@/libs/hooks';
import React from 'react'
import DoctorMainPage from './_components/doctor-main';
import PatientMainPage from './_components/patient.main';
import DoctorLayout from '@/components/globals/doctor-layout';
import PatientLayout from '@/components/globals/patient-layout';

const DashboardPage = () => {
    const user = useCurrentUser();

    console.log(user)
    if (user) {
        if (user.role === "DOCTOR")
            return (
                <DoctorLayout user={user}>
                    <DoctorMainPage user={user} />
                </DoctorLayout>)
        else if (user.role === "PATIENT") {
            return (
                <PatientLayout user={user}>
                    <PatientMainPage user={user} />
                </PatientLayout>
            )
        }
    }


    return (
        <div className="">No Roles found!</div>
    )
}

export default DashboardPage