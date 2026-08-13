"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTurnoCaja,
  deleteTurnoCaja,
  getTurnoCajaById,
  getTurnosCaja,
  updateTurnoCaja,
} from "../api/turno-caja.api";
import { turnoCajaKeys } from "../api/turno-caja.key";
import type {
  CreateTurnoCajaRequest,
  TurnoCajaQueryParams,
  UpdateTurnoCajaRequest,
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

export function useCreateTurnoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTurnoCajaRequest) => createTurnoCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turnoCajaKeys.all });
    },
  });
}

export function useUpdateTurnoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTurnoCajaRequest }) =>
      updateTurnoCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: turnoCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: turnoCajaKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteTurnoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTurnoCaja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turnoCajaKeys.all });
    },
  });
}
