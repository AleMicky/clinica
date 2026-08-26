"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  abrirTurnoCaja,
  cerrarTurnoCaja,
  getResumenCierreTurnoCaja,
  getTurnoCajaAbiertoCaja,
  getTurnoCajaAbiertoEmpleado,
  getTurnoCajaById,
  getTurnosCaja,
} from "../api/turno-caja.api";
import { turnoCajaKeys } from "../api/turno-caja.key";
import type {
  AbrirTurnoCajaRequest,
  CerrarTurnoCajaRequest,
  TurnoCajaQueryParams,
} from "../types/turno-caja.types";

export function useTurnosCaja(params?: TurnoCajaQueryParams, enabled = true) {
  return useQuery({
    queryKey: turnoCajaKeys.list(params as Record<string, unknown>),
    queryFn: () => getTurnosCaja(params),
    enabled,
  });
}

export function useTurnoCaja(id: number, enabled = true) {
  return useQuery({
    queryKey: turnoCajaKeys.detail(id),
    queryFn: () => getTurnoCajaById(id),
    enabled: enabled && id > 0,
  });
}

export function useResumenCierreTurnoCaja(id?: number | null, enabled = true) {
  return useQuery({
    queryKey: [...turnoCajaKeys.all, "resumen-cierre", id],
    queryFn: () => getResumenCierreTurnoCaja(id!),
    enabled: enabled && Boolean(id && id > 0),
    retry: false,
  });
}

export function useTurnoCajaAbiertoEmpleado(empleadoId: number, enabled = true) {
  return useQuery({
    queryKey: [...turnoCajaKeys.all, "abierto-empleado", empleadoId],
    queryFn: () => getTurnoCajaAbiertoEmpleado(empleadoId),
    enabled: enabled && empleadoId > 0,
  });
}

export function useTurnoCajaAbiertoCaja(cajaId: number, enabled = true) {
  return useQuery({
    queryKey: [...turnoCajaKeys.all, "abierto-caja", cajaId],
    queryFn: () => getTurnoCajaAbiertoCaja(cajaId),
    enabled: enabled && cajaId > 0,
  });
}

export function useAbrirTurnoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AbrirTurnoCajaRequest) => abrirTurnoCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turnoCajaKeys.all });
    },
  });
}

export function useCerrarTurnoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CerrarTurnoCajaRequest }) =>
      cerrarTurnoCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: turnoCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: turnoCajaKeys.detail(variables.id),
      });
    },
  });
}
