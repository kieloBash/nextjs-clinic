import SimpleLoadingPage from '@/components/globals/loading-simple'
import React from 'react'

const Loading = () => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <SimpleLoadingPage />
        </div>
    )
}

export default Loading