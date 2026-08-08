"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategoriaServicio,
  deleteCategoriaServicio,
  getCategoriaServicioById,
  getCategoriasServicio,
  updateCategoriaServicio,
} from "../api/categoria-servicio.api";
import { categoriaServicioKeys } from "../api/categoria-servicio.key";
import type {
  CategoriaServicioQueryParams,
  CreateCategoriaServicioRequest,
  UpdateCategoriaServicioRequest,
} from "../types/categoria-servicio.types";

export function useCategoriasServicio(params?: CategoriaServicioQueryParams) {
  return useQuery({
    queryKey: categoriaServicioKeys.list(params as Record<string, unknown>),
    queryFn: () => getCategoriasServicio(params),
  });
}

export function useCategoriaServicio(id: number, enabled = true) {
  return useQuery({
    queryKey: categoriaServicioKeys.detail(id),
    queryFn: () => getCategoriaServicioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateCategoriaServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoriaServicioRequest) => createCategoriaServicio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriaServicioKeys.all });
    },
  });
}

export function useUpdateCategoriaServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoriaServicioRequest }) =>
      updateCategoriaServicio(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoriaServicioKeys.all });
      queryClient.invalidateQueries({ queryKey: categoriaServicioKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCategoriaServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategoriaServicio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriaServicioKeys.all });
    },
  });
}
