export type Role = {
    id: string;
    name: string;
};

export type AuthUser = {
    id: string;
    userName: string;
    email?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
    roles: string[];
};

export type LoginRequest = {
    userName: string;
    password: string;
    rememberMe: boolean;
};

export type LoginResponse = {
    accessToken: string;
    expiresAt: string;
};

export type MeResponse = AuthUser;

export type LogoutResponse = {
    message: string;
};

export type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export type ChangePasswordResponse = {
    message: string;
};