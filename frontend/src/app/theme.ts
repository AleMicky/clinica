import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

const sharedTokens = {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
}

export function getThemeConfig(isDark: boolean): ThemeConfig {
    return {
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            ...sharedTokens,
            colorBgLayout: isDark ? '#0f1419' : '#f5f7fa',
            colorBgContainer: isDark ? '#1a1f2e' : '#ffffff',
        },
    }
}
