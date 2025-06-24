"use client"
import { useCurrentUser } from '@/libs/hooks';
import React from 'react'
import PatientMainPage from './_components/patient-main';

const SearchDoctorsPage = () => {
    const user = useCurrentUser();

    if (user) {
        if (user.role === "DOCTOR")
            return;
        else if (user.role === "PATIENT") {
            return <PatientMainPage user={user} />
        }
    }

    return (
        <div className="">No Roles found!</div>
    )
}

export default SearchDoctorsPage