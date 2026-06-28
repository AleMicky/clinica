import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

type ThemeState = {
    mode: ThemeMode
    isDark: boolean
    toggle: () => void
    setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            mode: 'light',
            isDark: false,
            toggle: () => {
                const nextMode: ThemeMode = get().mode === 'light' ? 'dark' : 'light'
                set({ mode: nextMode, isDark: nextMode === 'dark' })
            },
            setMode: (mode) => set({ mode, isDark: mode === 'dark' }),
        }),
        { name: 'hospital-admin-theme' },
    ),
)
