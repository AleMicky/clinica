import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

const sharedTokens = {
    colorPrimary: '#1e4976',
    colorSuccess: '#2e7d32',
    colorWarning: '#ed6c02',
    colorError: '#c62828',
    borderRadius: 6,
    borderRadiusLG: 8,
    fontSize: 14,
    fontSizeSM: 13,
    fontSizeLG: 16,
    controlHeight: 36,
    controlHeightSM: 28,
    fontFamily:
        "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif",
}

export function getThemeConfig(isDark: boolean): ThemeConfig {
    return {
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            ...sharedTokens,
            colorBgLayout: isDark ? '#0d1117' : '#e8ecf1',
            colorBgContainer: isDark ? '#161b22' : '#ffffff',
            colorBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
            colorBorderSecondary: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
        },
        components: {
            Layout: {
                siderBg: isDark ? '#0f1419' : '#152032',
                headerBg: isDark ? '#161b22' : '#ffffff',
                bodyBg: isDark ? '#0d1117' : '#e8ecf1',
            },
            Menu: {
                darkItemBg: 'transparent',
                darkSubMenuItemBg: 'transparent',
                darkItemSelectedBg: 'rgba(30, 73, 118, 0.45)',
                darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
                itemBorderRadius: 4,
                itemHeight: 40,
                iconSize: 16,
            },
            Table: {
                headerBg: isDark ? '#1c2128' : '#f4f6f8',
                headerColor: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.75)',
                rowHoverBg: isDark ? 'rgba(30, 73, 118, 0.12)' : 'rgba(30, 73, 118, 0.04)',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                cellPaddingBlock: 10,
                cellPaddingInline: 14,
            },
            Card: {
                borderRadiusLG: 8,
                paddingLG: 20,
            },
            Button: {
                borderRadius: 4,
                controlHeight: 36,
                controlHeightSM: 28,
            },
            Input: {
                borderRadius: 4,
                controlHeight: 36,
            },
            Breadcrumb: {
                fontSize: 13,
            },
        },
    }
}
