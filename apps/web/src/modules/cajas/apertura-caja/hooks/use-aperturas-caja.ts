"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAperturaCaja,
  deleteAperturaCaja,
  getAperturaCajaById,
  getAperturasCaja,
  updateAperturaCaja,
} from "../api/apertura-caja.api";
import { aperturaCajaKeys } from "../api/apertura-caja.key";
import type {
  AperturaCajaQueryParams,
  CreateAperturaCajaRequest,
  UpdateAperturaCajaRequest,
} from "../types/apertura-caja.types";

export function useAperturasCaja(
  params?: AperturaCajaQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: aperturaCajaKeys.list(params as Record<string, unknown>),
    queryFn: () => getAperturasCaja(params),
    enabled,
  });
}

export function useAperturaCaja(id: number, enabled = true) {
  return useQuery({
    queryKey: aperturaCajaKeys.detail(id),
    queryFn: () => getAperturaCajaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateAperturaCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAperturaCajaRequest) => createAperturaCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aperturaCajaKeys.all });
    },
  });
}

export function useUpdateAperturaCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAperturaCajaRequest;
    }) => updateAperturaCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aperturaCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: aperturaCajaKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteAperturaCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAperturaCaja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aperturaCajaKeys.all });
    },
  });
}
