'use client'
import { signOut } from 'next-auth/react'
import React from 'react'

const DashboardPage = () => {
    return (
        <div>
            <button type='button' onClick={() => signOut()}>Log out!</button>
        </div>

    )
}

export default DashboardPage