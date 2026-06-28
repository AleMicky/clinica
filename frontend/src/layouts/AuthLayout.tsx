import { Outlet } from '@tanstack/react-router'

import { ThemeToggle } from '../shared/components/ui/theme-toggle/ThemeToggle'

export function AuthLayout() {
    return (
        <div className="auth-layout">
            <div className="auth-layout__theme-toggle">
                <ThemeToggle />
            </div>
            <Outlet />
        </div>
    )
}
