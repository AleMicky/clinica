"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTipoMovimientoInventario,
  deleteTipoMovimientoInventario,
  getTipoMovimientoInventarioById,
  getTiposMovimientoInventario,
  updateTipoMovimientoInventario,
} from "../api/tipo-movimiento-inventario.api";
import { tipoMovimientoInventarioKeys } from "../api/tipo-movimiento-inventario.key";
import type {
  CreateTipoMovimientoInventarioRequest,
  TipoMovimientoInventarioQueryParams,
  UpdateTipoMovimientoInventarioRequest,
} from "../types/tipo-movimiento-inventario.types";

export function useTiposMovimientoInventario(
  params?: TipoMovimientoInventarioQueryParams
) {
  return useQuery({
    queryKey: tipoMovimientoInventarioKeys.list(params as Record<string, unknown>),
    queryFn: () => getTiposMovimientoInventario(params),
  });
}

export function useTipoMovimientoInventario(id: number, enabled = true) {
  return useQuery({
    queryKey: tipoMovimientoInventarioKeys.detail(id),
    queryFn: () => getTipoMovimientoInventarioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateTipoMovimientoInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTipoMovimientoInventarioRequest) =>
      createTipoMovimientoInventario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tipoMovimientoInventarioKeys.all,
      });
    },
  });
}

export function useUpdateTipoMovimientoInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateTipoMovimientoInventarioRequest;
    }) => updateTipoMovimientoInventario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tipoMovimientoInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: tipoMovimientoInventarioKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteTipoMovimientoInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTipoMovimientoInventario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tipoMovimientoInventarioKeys.all,
      });
    },
  });
}
