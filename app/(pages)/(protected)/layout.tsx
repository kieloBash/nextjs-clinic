import DoctorLayout from '@/components/globals/doctor-layout';
import PatientLayout from '@/components/globals/patient-layout';
import { currentUser } from '@/libs/auth';
import { ILayout } from '@/types/global.type'

import React from 'react'

const Layout = async ({ children }: ILayout) => {

    const user = await currentUser();

    console.log(user)

    if (user) {
        if (user.role === "DOCTOR")
            return (
                <DoctorLayout user={user}>
                    {children}
                </DoctorLayout>)
        else if (user.role === "PATIENT") {
            return (
                <PatientLayout user={user}>
                    {children}
                </PatientLayout>
            )
        }
    }

    return <>{children}</>

}

export default Layout