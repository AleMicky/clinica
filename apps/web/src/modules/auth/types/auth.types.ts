export type Role = {
    id: string;
    name: string;
};

export type PersonaPerfil = {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno?: string | null;
    tipoDocumento: string;
    numeroDocumento: string;
    extensionDocumento?: string | null;
    complementoDocumento?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    fechaNacimiento?: string | null;
    genero?: string | null;
    estadoCivil?: string | null;
};

export type AuthUser = {
    id: number | string;
    userName: string;
    email?: string | null;
    nombres?: string | null;
    apellidoPaterno?: string | null;
    apellidoMaterno?: string | null;
    nombreCompleto?: string | null;
    activo?: boolean;
    debeCambiarPassword?: boolean;
    roles: string[];
    persona?: PersonaPerfil | null;
};

export type LoginRequest = {
    userName: string;
    password: string;
    rememberMe?: boolean;
};

export type LoginResponse = {
    accessToken: string;
    expiresAt: string;
    debeCambiarPassword?: boolean;
};

export type MeResponse = AuthUser;

export type LogoutResponse = {
    message: string;
};

export type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string;
};

export type ChangePasswordResponse = {
    message: string;
};