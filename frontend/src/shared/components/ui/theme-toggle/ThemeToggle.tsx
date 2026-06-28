import { Button, Tooltip } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'

import { useThemeStore } from '../../../../stores/theme.store'

export function ThemeToggle() {
    const isDark = useThemeStore((state) => state.isDark)
    const toggle = useThemeStore((state) => state.toggle)

    return (
        <Tooltip title={isDark ? 'Modo claro' : 'Modo oscuro'}>
            <Button
                type="text"
                className="theme-toggle"
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggle}
                aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            />
        </Tooltip>
    )
}
