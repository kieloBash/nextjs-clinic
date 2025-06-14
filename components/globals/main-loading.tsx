import React from 'react'
import SimpleLoadingPage from './loading-simple'

const MainLoadingPage = ({ message }: { message?: string }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <SimpleLoadingPage />
        </div>
    )
}

export default MainLoadingPage