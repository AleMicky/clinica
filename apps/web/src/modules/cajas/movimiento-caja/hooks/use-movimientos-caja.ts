"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMovimientoCaja,
  deleteMovimientoCaja,
  getMovimientoCajaById,
  getMovimientosCaja,
  updateMovimientoCaja,
} from "../api/movimiento-caja.api";
import { movimientoCajaKeys } from "../api/movimiento-caja.key";
import type {
  CreateMovimientoCajaRequest,
  MovimientoCajaQueryParams,
  UpdateMovimientoCajaRequest,
} from "../types/movimiento-caja.types";

export function useMovimientosCaja(
  params?: MovimientoCajaQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: movimientoCajaKeys.list(params as Record<string, unknown>),
    queryFn: () => getMovimientosCaja(params),
    enabled,
  });
}

export function useMovimientoCaja(id: number, enabled = true) {
  return useQuery({
    queryKey: movimientoCajaKeys.detail(id),
    queryFn: () => getMovimientoCajaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovimientoCajaRequest) =>
      createMovimientoCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}

export function useUpdateMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMovimientoCajaRequest;
    }) => updateMovimientoCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: movimientoCajaKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMovimientoCaja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}
