"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMovimientoCaja,
  deleteMovimientoCaja,
  exportarMovimientosCajaExcel,
  getMovimientoCajaById,
  getMovimientoCajaMetrics,
  getMovimientosCaja,
  updateMovimientoCaja,
} from "../api/movimiento-caja.api";
import { movimientoCajaKeys } from "../api/movimiento-caja.key";
import {
  useTiposMovimientoCaja,
  useConceptosMovimientoCaja,
} from "../../tipo-movimiento";
import type {
  CreateMovimientoCajaRequest,
  ExportarMovimientosQueryParams,
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

export function useMovimientoCajaMetrics(
  params?: {
    search?: string;
    turnoCajaId?: number;
    naturaleza?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  },
  enabled = true
) {
  return useQuery({
    queryKey: movimientoCajaKeys.metric(params as Record<string, unknown>),
    queryFn: () => getMovimientoCajaMetrics(params),
    enabled,
  });
}

export function useExportarMovimientosCajaExcel() {
  return useMutation({
    mutationFn: (params?: ExportarMovimientosQueryParams) =>
      exportarMovimientosCajaExcel(params),
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

// Re-exportar hooks de tipos y conceptos desde tipo-movimiento para conveniencia
export { useTiposMovimientoCaja, useConceptosMovimientoCaja };
