"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getArqueoCajaById,
  getArqueosCaja,
  getResumenArqueoCaja,
  registrarArqueoCaja,
} from "../api/arqueo-caja.api";
import { arqueoCajaKeys } from "../api/arqueo-caja.key";
import type {
  ArqueoCajaQueryParams,
  RegistrarArqueoCajaRequest,
} from "../types/arqueo-caja.types";

export function useArqueosCaja(params?: ArqueoCajaQueryParams, enabled = true) {
  return useQuery({
    queryKey: arqueoCajaKeys.list(params as Record<string, unknown>),
    queryFn: () => getArqueosCaja(params),
    enabled,
  });
}

export function useArqueoCaja(id: number, enabled = true) {
  return useQuery({
    queryKey: arqueoCajaKeys.detail(id),
    queryFn: () => getArqueoCajaById(id),
    enabled: enabled && id > 0,
  });
}

export function useResumenArqueoCaja(turnoCajaId: number, enabled = true) {
  return useQuery({
    queryKey: [...arqueoCajaKeys.all, "resumen", turnoCajaId],
    queryFn: () => getResumenArqueoCaja(turnoCajaId),
    enabled: enabled && turnoCajaId > 0,
  });
}

export function useRegistrarArqueoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegistrarArqueoCajaRequest) => registrarArqueoCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arqueoCajaKeys.all });
      queryClient.invalidateQueries({ queryKey: ["turnos-caja"] });
      queryClient.invalidateQueries({ queryKey: ["cajas"] });
    },
  });
}

export const useCreateArqueoCaja = useRegistrarArqueoCaja;
