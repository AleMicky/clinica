"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCaja,
  deleteCaja,
  getCajaById,
  getCajas,
  updateCaja,
} from "../api/caja.api";
import { cajaKeys } from "../api/caja.key";
import type {
  CajaQueryParams,
  CreateCajaRequest,
  UpdateCajaRequest,
} from "../types/caja.types";

export function useCajas(params?: CajaQueryParams, enabled = true) {
  return useQuery({
    queryKey: cajaKeys.list(params as Record<string, unknown>),
    queryFn: () => getCajas(params),
    enabled,
  });
}

export function useCaja(id: number, enabled = true) {
  return useQuery({
    queryKey: cajaKeys.detail(id),
    queryFn: () => getCajaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCajaRequest) => createCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cajaKeys.all });
    },
  });
}

export function useUpdateCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCajaRequest }) =>
      updateCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cajaKeys.all });
      queryClient.invalidateQueries({ queryKey: cajaKeys.detail(variables.id) });
    },
  });
}

export function useDeleteCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCaja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cajaKeys.all });
    },
  });
}
