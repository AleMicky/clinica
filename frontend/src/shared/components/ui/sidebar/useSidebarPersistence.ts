import { useCallback, useState } from 'react'

const COLLAPSED_KEY = 'clinica-sidebar-collapsed'

export const SIDEBAR_WIDTH = 248
export const SIDEBAR_COLLAPSED_WIDTH = 68

function readCollapsedPreference(): boolean {
    try {
        return localStorage.getItem(COLLAPSED_KEY) === 'true'
    } catch {
        return false
    }
}

function persistCollapsedPreference(collapsed: boolean) {
    try {
        localStorage.setItem(COLLAPSED_KEY, String(collapsed))
    } catch {
        /* ignore storage errors */
    }
}

export function useSidebarPersistence(isMobile: boolean) {
    const [desktopCollapsed, setDesktopCollapsed] = useState(() =>
        readCollapsedPreference(),
    )
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

    const collapsed = isMobile ? !mobileDrawerOpen : desktopCollapsed

    const setCollapsed = useCallback(
        (value: boolean | ((prev: boolean) => boolean)) => {
            if (isMobile) {
                setMobileDrawerOpen((prevOpen) => {
                    const prevCollapsed = !prevOpen
                    const nextCollapsed =
                        typeof value === 'function' ? value(prevCollapsed) : value
                    return !nextCollapsed
                })
                return
            }

            setDesktopCollapsed((prev) => {
                const next = typeof value === 'function' ? value(prev) : value
                persistCollapsedPreference(next)
                return next
            })
        },
        [isMobile],
    )

    const toggleSidebar = useCallback(() => {
        setCollapsed((prev) => !prev)
    }, [setCollapsed])

    return { collapsed, setCollapsed, toggleSidebar }
}
