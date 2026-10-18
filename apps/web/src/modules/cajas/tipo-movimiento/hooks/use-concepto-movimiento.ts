"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConceptoMovimientoCaja,
  deleteConceptoMovimientoCaja,
  getConceptoMovimientoCajaById,
  getConceptosMovimientoCaja,
  updateConceptoMovimientoCaja,
} from "../api/concepto-movimiento.api";
import { tipoMovimientoCajaKeys } from "../api/tipo-movimiento.key";
import { movimientoCajaKeys } from "../../movimiento-caja/api/movimiento-caja.key";
import type {
  CreateConceptoMovimientoCajaRequest,
  UpdateConceptoMovimientoCajaRequest,
} from "../types/concepto-movimiento.types";

export function useConceptosMovimientoCaja(
  tipoMovimientoCajaId?: number,
  enabled = true
) {
  return useQuery({
    queryKey: tipoMovimientoCajaKeys.conceptos(tipoMovimientoCajaId),
    queryFn: () => getConceptosMovimientoCaja(tipoMovimientoCajaId),
    enabled:
      enabled &&
      (tipoMovimientoCajaId === undefined || tipoMovimientoCajaId > 0),
  });
}

export function useConceptoMovimientoCaja(id: number, enabled = true) {
  return useQuery({
    queryKey: tipoMovimientoCajaKeys.conceptoDetail(id),
    queryFn: () => getConceptoMovimientoCajaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateConceptoMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConceptoMovimientoCajaRequest) =>
      createConceptoMovimientoCaja(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tipoMovimientoCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: tipoMovimientoCajaKeys.conceptos(variables.tipoMovimientoCajaId),
      });
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}

export function useUpdateConceptoMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateConceptoMovimientoCajaRequest;
    }) => updateConceptoMovimientoCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tipoMovimientoCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: tipoMovimientoCajaKeys.conceptoDetail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: tipoMovimientoCajaKeys.conceptos(variables.data.tipoMovimientoCajaId),
      });
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}

export function useDeleteConceptoMovimientoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteConceptoMovimientoCaja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoMovimientoCajaKeys.all });
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}
