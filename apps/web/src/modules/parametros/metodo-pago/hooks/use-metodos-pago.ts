"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMetodoPago,
  deleteMetodoPago,
  getMetodoPagoById,
  getMetodosPago,
  updateMetodoPago,
} from "../api/metodo-pago.api";
import { metodoPagoKeys } from "../api/metodo-pago.key";
import type {
  CreateMetodoPagoRequest,
  MetodoPagoQueryParams,
  UpdateMetodoPagoRequest,
} from "../types/metodo-pago.types";

export function useMetodosPago(
  params?: MetodoPagoQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: metodoPagoKeys.list(params as Record<string, unknown>),
    queryFn: () => getMetodosPago(params),
    enabled,
  });
}

export function useMetodoPago(id: number, enabled = true) {
  return useQuery({
    queryKey: metodoPagoKeys.detail(id),
    queryFn: () => getMetodoPagoById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateMetodoPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMetodoPagoRequest) => createMetodoPago(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: metodoPagoKeys.all });
    },
  });
}

export function useUpdateMetodoPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMetodoPagoRequest;
    }) => updateMetodoPago(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: metodoPagoKeys.all });
      queryClient.invalidateQueries({
        queryKey: metodoPagoKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteMetodoPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMetodoPago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: metodoPagoKeys.all });
    },
  });
}
