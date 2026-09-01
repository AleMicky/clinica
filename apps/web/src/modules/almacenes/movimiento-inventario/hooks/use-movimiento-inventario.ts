"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularMovimientoInventario,
  confirmarMovimientoInventario,
  createMovimientoInventario,
  deleteMovimientoInventario,
  getMovimientoInventarioById,
  getMovimientosInventario,
  updateMovimientoInventario,
} from "../api/movimiento-inventario.api";
import { movimientoInventarioKeys } from "../api/movimiento-inventario.key";
import type {
  AnularMovimientoInventarioRequest,
  CreateMovimientoInventarioRequest,
  MovimientoInventarioQueryParams,
  UpdateMovimientoInventarioRequest,
} from "../types/movimiento-inventario.types";

export function useMovimientosInventario(
  params?: MovimientoInventarioQueryParams
) {
  return useQuery({
    queryKey: movimientoInventarioKeys.list(params),
    queryFn: () => getMovimientosInventario(params),
  });
}

export function useMovimientoInventario(id: number, enabled = true) {
  return useQuery({
    queryKey: movimientoInventarioKeys.detail(id),
    queryFn: () => getMovimientoInventarioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateMovimientoInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovimientoInventarioRequest) =>
      createMovimientoInventario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: movimientoInventarioKeys.all,
      });
    },
  });
}

export function useUpdateMovimientoInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMovimientoInventarioRequest;
    }) => updateMovimientoInventario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: movimientoInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: movimientoInventarioKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteMovimientoInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMovimientoInventario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: movimientoInventarioKeys.all,
      });
    },
  });
}

export function useConfirmarMovimientoInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confirmarMovimientoInventario(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: movimientoInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: movimientoInventarioKeys.detail(id),
      });
    },
  });
}

export function useAnularMovimientoInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AnularMovimientoInventarioRequest;
    }) => anularMovimientoInventario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: movimientoInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: movimientoInventarioKeys.detail(variables.id),
      });
    },
  });
}
