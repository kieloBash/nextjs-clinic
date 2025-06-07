import DoctorLayout from '@/components/globals/doctor-layout';
import PatientLayout from '@/components/globals/patient-layout';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/libs/auth'
import { ILayout } from '@/types/global.type'
import { CheckCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

const Layout = async ({ children }: ILayout) => {
    return <>{children}</>

}

export default Layout