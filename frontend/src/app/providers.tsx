import { useEffect, type ReactNode } from 'react'
import { ConfigProvider, App as AntdApp } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import esES from 'antd/locale/es_ES'

import { router } from './router'
import { queryClient } from './query-client'
import { getThemeConfig } from './theme'
import { useThemeStore } from '../stores/theme.store'
import { NotificationBridge } from '../shared/components/NotificationBridge'

type AppProvidersProps = {
    children?: ReactNode
}

function ThemeProvider({ children }: { children: ReactNode }) {
    const isDark = useThemeStore((state) => state.isDark)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    }, [isDark])

    return (
        <ConfigProvider locale={esES} theme={getThemeConfig(isDark)}>
            <AntdApp>
                <NotificationBridge />
                {children}
            </AntdApp>
        </ConfigProvider>
    )
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                {children ?? <RouterProvider router={router} />}
            </QueryClientProvider>
        </ThemeProvider>
    )
}
