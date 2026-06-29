import { get, post } from '../../../shared/api/http'
import { authEndpoints } from '../../../shared/api/endpoints'
import type { LoginFormValues } from '../schemas/login.schema'
import type {
    AuthSession,
    ChangePasswordPayload,
    LoginApiResponse,
    RefreshTokenRequest,
    User,
} from '../types/auth.types'

function mapLoginResponse(raw: LoginApiResponse): AuthSession {
    return {
        accessToken: raw.token,
        refreshToken: raw.refreshToken,
        expiresAt: raw.expiresAt,
        refreshTokenExpiresAt: raw.refreshTokenExpiresAt,
        user: {
            id: raw.userId,
            userName: raw.userName,
            nombreCompleto: raw.nombreCompleto,
            roles: raw.roles,
        },
    }
}

export class AuthService {
    async login(credentials: LoginFormValues) {
        const raw = await post<LoginApiResponse, LoginFormValues>(
            authEndpoints.login,
            credentials,
        )

        return mapLoginResponse(raw)
    }

    async refresh(data: RefreshTokenRequest) {
        const raw = await post<LoginApiResponse, RefreshTokenRequest>(
            authEndpoints.refresh,
            data,
        )

        return mapLoginResponse(raw)
    }

    logout() {
        return post<void, undefined>(authEndpoints.logout, undefined)
    }

    me() {
        return get<User>(authEndpoints.me)
    }

    changePassword(data: ChangePasswordPayload) {
        return post<void, ChangePasswordPayload>(
            authEndpoints.changePassword,
            data,
        )
    }
}

export const authService = new AuthService()
