"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProveedor,
  deleteProveedor,
  deleteProveedoresMultiple,
  getProveedorById,
  getProveedores,
  importarProveedoresExcel,
  updateProveedor,
} from "../api/proveedor.api";
import { proveedorKeys } from "../api/proveedor.key";
import type {
  CreateProveedorRequest,
  ProveedorQueryParams,
  UpdateProveedorRequest,
} from "../types/proveedor.types";

export function useProveedores(params?: ProveedorQueryParams) {
  return useQuery({
    queryKey: proveedorKeys.list(params as Record<string, unknown>),
    queryFn: () => getProveedores(params),
  });
}

export function useProveedor(id: number, enabled = true) {
  return useQuery({
    queryKey: proveedorKeys.detail(id),
    queryFn: () => getProveedorById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProveedorRequest) => createProveedor(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proveedorKeys.all });
    },
  });
}

export function useUpdateProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProveedorRequest }) =>
      updateProveedor(id, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: proveedorKeys.all });
      void queryClient.invalidateQueries({ queryKey: proveedorKeys.detail(variables.id) });
    },
  });
}

export function useDeleteProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProveedor(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proveedorKeys.all });
    },
  });
}

export function useDeleteProveedoresMultiple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => deleteProveedoresMultiple(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proveedorKeys.all });
    },
  });
}

export function useImportarProveedoresExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archivo: File) => importarProveedoresExcel(archivo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proveedorKeys.all });
    },
  });
}
