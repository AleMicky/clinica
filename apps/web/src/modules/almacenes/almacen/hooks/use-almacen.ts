"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAlmacen,
  deleteAlmacen,
  getAlmacenById,
  getAlmacenes,
  updateAlmacen,
} from "../api/almacen.api";
import { almacenKeys } from "../api/almacen.key";
import type {
  AlmacenQueryParams,
  CreateAlmacenRequest,
  UpdateAlmacenRequest,
} from "../types/almacen.types";

export function useAlmacenes(params?: AlmacenQueryParams) {
  return useQuery({
    queryKey: almacenKeys.list(params as Record<string, unknown>),
    queryFn: () => getAlmacenes(params),
  });
}

export function useAlmacen(id: number, enabled = true) {
  return useQuery({
    queryKey: almacenKeys.detail(id),
    queryFn: () => getAlmacenById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAlmacenRequest) => createAlmacen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: almacenKeys.all });
    },
  });
}

export function useUpdateAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAlmacenRequest }) =>
      updateAlmacen(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: almacenKeys.all });
      queryClient.invalidateQueries({ queryKey: almacenKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAlmacen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: almacenKeys.all });
    },
  });
}
