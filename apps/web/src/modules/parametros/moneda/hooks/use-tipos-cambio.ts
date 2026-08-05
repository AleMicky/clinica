"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTipoCambio,
  deleteTipoCambio,
  getTipoCambioById,
  getTiposCambio,
  updateTipoCambio,
} from "../api/moneda.api";
import { tipoCambioKeys } from "../api/moneda.key";
import type {
  CreateTipoCambioRequest,
  TipoCambioQueryParams,
  UpdateTipoCambioRequest,
} from "../types/moneda.types";

export function useTiposCambio(params?: TipoCambioQueryParams) {
  return useQuery({
    queryKey: tipoCambioKeys.list(params as Record<string, unknown>),
    queryFn: () => getTiposCambio(params),
  });
}

export function useTipoCambio(id: number, enabled = true) {
  return useQuery({
    queryKey: tipoCambioKeys.detail(id),
    queryFn: () => getTipoCambioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateTipoCambio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTipoCambioRequest) => createTipoCambio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoCambioKeys.all });
    },
  });
}

export function useUpdateTipoCambio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTipoCambioRequest }) =>
      updateTipoCambio(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tipoCambioKeys.all });
      queryClient.invalidateQueries({ queryKey: tipoCambioKeys.detail(variables.id) });
    },
  });
}

export function useDeleteTipoCambio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTipoCambio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tipoCambioKeys.all });
    },
  });
}
