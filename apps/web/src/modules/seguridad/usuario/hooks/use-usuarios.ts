"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUsuario,
  deleteUsuario,
  getUsuarioById,
  getUsuarios,
  updateUsuario,
} from "../api/usuario.api";
import { usuarioKeys } from "../api/usuario.key";
import { opcionMenuKeys } from "@/modules/seguridad/opcion-menu/api/opcion-menu.key";
import type {
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  UsuarioQueryParams,
} from "../types/usuario.types";

export function useUsuarios(params?: UsuarioQueryParams) {
  return useQuery({
    queryKey: usuarioKeys.list(params as Record<string, unknown>),
    queryFn: () => getUsuarios(params),
  });
}

export function useUsuario(id: number, enabled = true) {
  return useQuery({
    queryKey: usuarioKeys.detail(id),
    queryFn: () => getUsuarioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUsuarioRequest) => createUsuario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuarioKeys.all });
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUsuarioRequest }) =>
      updateUsuario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usuarioKeys.all });
      queryClient.invalidateQueries({ queryKey: usuarioKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuarioKeys.all });
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}
