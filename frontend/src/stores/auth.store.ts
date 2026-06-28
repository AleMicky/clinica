import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthSession, User } from '../features/auth/types/auth.types'

type AuthState = {
    accessToken: string | null
    refreshToken: string | null
    expiresAt: string | null
    refreshTokenExpiresAt: string | null
    user: User | null

    setAuth: (auth: AuthSession) => void
    logout: () => void
}

export const authStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            refreshTokenExpiresAt: null,
            user: null,

            setAuth: (auth) =>
                set({
                    accessToken: auth.accessToken,
                    refreshToken: auth.refreshToken,
                    expiresAt: auth.expiresAt,
                    refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
                    user: auth.user,
                }),

            logout: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    expiresAt: null,
                    refreshTokenExpiresAt: null,
                    user: null,
                }),
        }),
        {
            name: 'hospital-auth',
        },
    ),
)
