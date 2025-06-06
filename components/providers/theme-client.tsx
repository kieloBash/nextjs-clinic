'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeClientWrapper({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Optional: return null or a skeleton if you want
        return null
    }

    return <>{children}</>
}
