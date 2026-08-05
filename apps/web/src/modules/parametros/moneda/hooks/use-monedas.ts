"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMoneda,
  deleteMoneda,
  getMonedaById,
  getMonedas,
  updateMoneda,
} from "../api/moneda.api";
import { monedaKeys } from "../api/moneda.key";
import type {
  CreateMonedaRequest,
  MonedaQueryParams,
  UpdateMonedaRequest,
} from "../types/moneda.types";

export function useMonedas(params?: MonedaQueryParams) {
  return useQuery({
    queryKey: monedaKeys.list(params as Record<string, unknown>),
    queryFn: () => getMonedas(params),
  });
}

export function useMoneda(id: number, enabled = true) {
  return useQuery({
    queryKey: monedaKeys.detail(id),
    queryFn: () => getMonedaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateMoneda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMonedaRequest) => createMoneda(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monedaKeys.all });
    },
  });
}

export function useUpdateMoneda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMonedaRequest }) =>
      updateMoneda(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: monedaKeys.all });
      queryClient.invalidateQueries({ queryKey: monedaKeys.detail(variables.id) });
    },
  });
}

export function useDeleteMoneda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMoneda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monedaKeys.all });
    },
  });
}
