"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategoriaProducto,
  deleteCategoriaProducto,
  getCategoriaProductoById,
  getCategoriasProducto,
  updateCategoriaProducto,
} from "../api/categoria-producto.api";
import { categoriaProductoKeys } from "../api/categoria-producto.key";
import type {
  CategoriaProductoQueryParams,
  CreateCategoriaProductoRequest,
  UpdateCategoriaProductoRequest,
} from "../types/categoria-producto.types";

export function useCategoriasProducto(params?: CategoriaProductoQueryParams) {
  return useQuery({
    queryKey: categoriaProductoKeys.list(params as Record<string, unknown>),
    queryFn: () => getCategoriasProducto(params),
  });
}

export function useCategoriaProducto(id: number, enabled = true) {
  return useQuery({
    queryKey: categoriaProductoKeys.detail(id),
    queryFn: () => getCategoriaProductoById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateCategoriaProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoriaProductoRequest) => createCategoriaProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriaProductoKeys.all });
    },
  });
}

export function useUpdateCategoriaProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoriaProductoRequest }) =>
      updateCategoriaProducto(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoriaProductoKeys.all });
      queryClient.invalidateQueries({ queryKey: categoriaProductoKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCategoriaProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategoriaProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriaProductoKeys.all });
    },
  });
}
