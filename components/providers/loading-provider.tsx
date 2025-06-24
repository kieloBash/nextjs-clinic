'use client';

import { createContext, useContext, useState } from 'react';
import SimpleLoadingPage from '../globals/loading-simple';
import { Toaster } from '../ui/sonner';

const LoadingContext = createContext<{
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
}>({ isLoading: false, setIsLoading: () => { } });

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>

            {children}
            {isLoading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <SimpleLoadingPage />
                </div>
            )}
            <Toaster />

        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
