import React from 'react'
import { DoctorStatsCards } from './doctor-stats'
import { User } from 'next-auth'

const DoctorMainPage = ({ user }: { user: User }) => {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, Dr. {user.name}</h1>
                    <p className="text-gray-500">Here's what's happening with your patients today.</p>
                </div>

                <DoctorStatsCards />
            </div>
        </main>
    )
}

export default DoctorMainPage