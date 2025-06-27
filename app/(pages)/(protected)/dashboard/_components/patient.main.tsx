import { User } from 'next-auth'
import React from 'react'

const PatientMainPage = ({ user }: { user: User }) => {
    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
                    <p className="text-gray-500">Book an appointment today!</p>
                </div>

            </div>
        </main>
    )
}

export default PatientMainPage