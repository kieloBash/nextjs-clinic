import AdminLayout from '@/components/globals/admin/admin-layout';
import DoctorLayout from '@/components/globals/doctor/doctor-layout';
import PatientLayout from '@/components/globals/patient/patient-layout';
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
        } else if (user.role === "HEAD_ADMIN" || user.role === "IT_ADMIN") {
            return (
                <AdminLayout user={user}>
                    {children}
                </AdminLayout>
            )
        }
    }

    return <>{children}</>

}

export default Layout