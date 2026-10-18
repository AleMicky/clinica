"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTipoMovimientoCaja,
  deleteTipoMovimientoCaja,
  getTipoMovimientoCajaById,
  getTiposMovimientoCaja,
  updateTipoMovimientoCaja,
} from "../api/tipo-movimiento.api";
import { tipoMovimientoCajaKeys } from "../api/tipo-movimiento.key";
import { movimientoCajaKeys } from "../../movimiento-caja/api/movimiento-caja.key";
import type {
  CreateTipoMovimientoCajaRequest,
  UpdateTipoMovimientoCajaRequest,
} from "../types/tipo-movimiento.types";

export function useTiposMovimientoCaja(naturaleza?: string, enabled = true) {
  return useQuery({
    queryKey: tipoMovimientoCajaKeys.tipos(naturaleza),
    queryFn: () => getTiposMovimientoCaja(naturaleza),
    enabled,
  });
}

export function useTipoMovimientoCaja(id: number, enabled = true) {
  return useQuery({
    queryKey: tipoMovimientoCajaKeys.tipoDetail(id),
    queryFn: () => getTipoMovimientoCajaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateTipoMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTipoMovimientoCajaRequest) =>
      createTipoMovimientoCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoMovimientoCajaKeys.all });
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}

export function useUpdateTipoMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateTipoMovimientoCajaRequest;
    }) => updateTipoMovimientoCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tipoMovimientoCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: tipoMovimientoCajaKeys.tipoDetail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}

export function useDeleteTipoMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTipoMovimientoCaja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoMovimientoCajaKeys.all });
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}

// Re-export conceptos hooks for backwards compatibility
export {
  useConceptosMovimientoCaja,
  useConceptoMovimientoCaja,
  useCreateConceptoMovimientoCaja,
  useUpdateConceptoMovimientoCaja,
  useDeleteConceptoMovimientoCaja,
} from "./use-concepto-movimiento";
