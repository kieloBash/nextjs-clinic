'use client'
import { useCurrentUser } from '@/libs/hooks';
import React from 'react'
import DoctorMainPage from './_components/doctor-main';
import PatientMainPage from './_components/patient-main';
import AdminMainPage from './_components/admin-main';

const DashboardPage = () => {
    const user = useCurrentUser();

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
        else if (user.role === "HEAD_ADMIN" || user.role === "IT_ADMIN") {
            return (
                <AdminMainPage user={user} />
            )
        }
    }


    return (
        <div className="">Invalid User</div>
    )
}

export default DashboardPage