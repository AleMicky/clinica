import { useCallback, useMemo, useState } from 'react'

import type { MenuGroup } from './menu-items'
import { getSelectedMenuKey } from './menu-items'

const SECTIONS_KEY = 'clinica-sidebar-sections'

function readStoredSections(): string[] | null {
    try {
        const raw = localStorage.getItem(SECTIONS_KEY)
        if (raw === null) return null

        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed)) return null

        return parsed.filter((value): value is string => typeof value === 'string')
    } catch {
        return null
    }
}

function persistSections(sectionKeys: string[]) {
    try {
        localStorage.setItem(SECTIONS_KEY, JSON.stringify(sectionKeys))
    } catch {
        /* ignore storage errors */
    }
}

function getDefaultOpenSections(
    groups: MenuGroup[],
    pathname: string,
    userRoles: string[],
): string[] {
    const activeKey = getSelectedMenuKey(pathname, userRoles)

    for (const group of groups) {
        if (group.items.some((item) => item.key === activeKey)) {
            return [group.key]
        }
    }

    return groups.length > 0 ? [groups[0].key] : []
}

export function useSidebarSections(
    groups: MenuGroup[],
    pathname: string,
    userRoles: string[],
    isSearching: boolean,
) {
    const groupKeys = useMemo(() => groups.map((group) => group.key), [groups])

    const [storedSections, setStoredSections] = useState<string[] | null>(() =>
        readStoredSections(),
    )

    const openSections = useMemo(() => {
        if (isSearching) return groupKeys

        if (storedSections !== null) {
            return storedSections.filter((key) => groupKeys.includes(key))
        }

        return getDefaultOpenSections(groups, pathname, userRoles)
    }, [groupKeys, groups, isSearching, pathname, storedSections, userRoles])

    const setOpenSections = useCallback(
        (keys: string[]) => {
            const next = keys.filter((key) => groupKeys.includes(key))
            setStoredSections(next)

            if (!isSearching) {
                persistSections(next)
            }
        },
        [groupKeys, isSearching],
    )

    const toggleSection = useCallback(
        (sectionKey: string) => {
            const isOpen = openSections.includes(sectionKey)
            const next = isOpen
                ? openSections.filter((key) => key !== sectionKey)
                : [...openSections, sectionKey]

            setOpenSections(next)
        },
        [openSections, setOpenSections],
    )

    const ensureSectionOpen = useCallback(
        (sectionKey: string) => {
            if (openSections.includes(sectionKey)) return

            setOpenSections([...openSections, sectionKey])
        },
        [openSections, setOpenSections],
    )

    return { openSections, toggleSection, ensureSectionOpen }
}
