"use client"
import { useCurrentUser } from '@/libs/hooks';
import React from 'react'
import DoctorMainPage from './_components/doctor/doctor-main';
import DoctorLayout from '@/components/globals/doctor/doctor-layout';
import PatientMainPage from './_components/patient/patient-main';

const AppointmentsPage = () => {
    const user = useCurrentUser();

    if (user) {
        if (user.role === "DOCTOR")
            return (
                <DoctorMainPage user={user} />
            )
        else if (user.role === "PATIENT") {
            return <PatientMainPage user={user} />;
        }
    }

    return (
        <div className="">No Roles found!</div>
    )
}

export default AppointmentsPage