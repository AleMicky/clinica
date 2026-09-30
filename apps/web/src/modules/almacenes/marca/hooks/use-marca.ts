"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMarca,
  deleteMarca,
  getMarcaById,
  getMarcas,
  updateMarca,
} from "../api/marca.api";
import { marcaKeys } from "../api/marca.key";
import type {
  MarcaQueryParams,
  CreateMarcaRequest,
  UpdateMarcaRequest,
} from "../types/marca.types";

export function useMarcas(params?: MarcaQueryParams) {
  return useQuery({
    queryKey: marcaKeys.list(params as Record<string, unknown>),
    queryFn: () => getMarcas(params),
  });
}

export function useMarca(id: number, enabled = true) {
  return useQuery({
    queryKey: marcaKeys.detail(id),
    queryFn: () => getMarcaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateMarca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMarcaRequest) => createMarca(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marcaKeys.all });
    },
  });
}

export function useUpdateMarca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMarcaRequest }) =>
      updateMarca(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: marcaKeys.all });
      queryClient.invalidateQueries({ queryKey: marcaKeys.detail(variables.id) });
    },
  });
}

export function useDeleteMarca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMarca(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marcaKeys.all });
    },
  });
}
