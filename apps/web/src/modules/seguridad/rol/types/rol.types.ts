export interface RolResponse {
  id: number;
  name: string;
  descripcion?: string | null;
}

export interface CreateRolRequest {
  name: string;
  descripcion?: string;
}

export interface UpdateRolRequest {
  name: string;
  descripcion?: string;
}

export interface RolQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface RolMetrics {
  totalRoles: number;
  rolesProtegidos: number;
  rolesPersonalizados: number;
}
