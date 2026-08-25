export interface RolOpcionMenuResponse {
  rolId: number;
  opcionMenuId: number;
  padreId?: number | null;
  codigo: string;
  nombre: string;
  ruta?: string | null;
  icono?: string | null;
  orden: number;
}

export interface RolOpcionesMenuResponse {
  rolId: number;
  rolNombre: string;
  opcionesMenu: RolOpcionMenuResponse[];
}

export interface RolOpcionMenuTreeResponse {
  id: number;
  codigo: string;
  nombre: string;
  ruta?: string | null;
  icono?: string | null;
  orden: number;
  hijos: RolOpcionMenuTreeResponse[];
}

export interface CreateRolOpcionMenuRequest {
  opcionMenuId: number;
}

export interface AsignarRolOpcionMenuRequest {
  opcionMenuIds: number[];
}
