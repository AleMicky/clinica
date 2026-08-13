"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArqueoCaja,
  deleteArqueoCaja,
  getArqueoCajaById,
  getArqueosCaja,
  updateArqueoCaja,
} from "../api/arqueo-caja.api";
import { arqueoCajaKeys } from "../api/arqueo-caja.key";
import type {
  ArqueoCajaQueryParams,
  CreateArqueoCajaRequest,
  UpdateArqueoCajaRequest,
} from "../types/arqueo-caja.types";

export function useArqueosCaja(
  params?: ArqueoCajaQueryParams,
  enabled = true
) {
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

export function useCreateArqueoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArqueoCajaRequest) => createArqueoCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arqueoCajaKeys.all });
    },
  });
}

export function useUpdateArqueoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateArqueoCajaRequest;
    }) => updateArqueoCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: arqueoCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: arqueoCajaKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteArqueoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteArqueoCaja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arqueoCajaKeys.all });
    },
  });
}
