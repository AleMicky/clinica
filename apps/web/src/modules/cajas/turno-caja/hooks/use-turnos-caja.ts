"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  abrirTurnoCaja,
  cerrarTurnoCaja,
  createTurnoCaja,
  deleteTurnoCaja,
  getTurnoCajaAbiertoCaja,
  getTurnoCajaAbiertoEmpleado,
  getTurnoCajaById,
  getTurnosCaja,
  updateTurnoCaja,
} from "../api/turno-caja.api";
import { turnoCajaKeys } from "../api/turno-caja.key";
import type {
  AbrirTurnoCajaRequest,
  CerrarTurnoCajaRequest,
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

export function useTurnoCajaAbiertoEmpleado(empleadoId: number, enabled = true) {
  return useQuery({
    queryKey: [...turnoCajaKeys.all, "abierto-empleado", empleadoId],
    queryFn: () => getTurnoCajaAbiertoEmpleado(empleadoId),
    enabled: enabled && empleadoId > 0,
  });
}

export function useTurnoCajaAbiertoCaja(cajaId: number, enabled = true) {
  return useQuery({
    queryKey: [...turnoCajaKeys.all, "abierto-caja", cajaId],
    queryFn: () => getTurnoCajaAbiertoCaja(cajaId),
    enabled: enabled && cajaId > 0,
  });
}

export function useAbrirTurnoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AbrirTurnoCajaRequest) => abrirTurnoCaja(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turnoCajaKeys.all });
    },
  });
}

export function useCerrarTurnoCaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CerrarTurnoCajaRequest }) =>
      cerrarTurnoCaja(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: turnoCajaKeys.all });
      queryClient.invalidateQueries({
        queryKey: turnoCajaKeys.detail(variables.id),
      });
    },
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
