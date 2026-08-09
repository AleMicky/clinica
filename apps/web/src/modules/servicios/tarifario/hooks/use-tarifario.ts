"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTarifario,
  createTarifarioDetalle,
  createTarifarioDetalleCatalogo,
  deleteTarifario,
  deleteTarifarioDetalle,
  getTarifarioById,
  getTarifarioDetalles,
  getTarifarios,
  updateTarifario,
  updateTarifarioDetalle,
} from "../api/tarifario.api";
import { tarifarioKeys } from "../api/tarifario.key";
import type {
  CreateTarifarioDetalleCatalogoRequest,
  CreateTarifarioDetalleRequest,
  CreateTarifarioRequest,
  TarifarioQueryParams,
  UpdateTarifarioDetalleRequest,
  UpdateTarifarioRequest,
} from "../types/tarifario.types";

export function useTarifarios(params?: TarifarioQueryParams) {
  return useQuery({
    queryKey: tarifarioKeys.list(params as Record<string, unknown>),
    queryFn: () => getTarifarios(params),
  });
}

export function useTarifario(id: number, enabled = true) {
  return useQuery({
    queryKey: tarifarioKeys.detail(id),
    queryFn: () => getTarifarioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateTarifario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTarifarioRequest) => createTarifario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tarifarioKeys.all });
    },
  });
}

export function useUpdateTarifario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTarifarioRequest }) =>
      updateTarifario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tarifarioKeys.all });
      queryClient.invalidateQueries({ queryKey: tarifarioKeys.detail(variables.id) });
    },
  });
}

export function useDeleteTarifario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTarifario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tarifarioKeys.all });
    },
  });
}

// Detalles
export function useTarifarioDetalles(
  tarifarioId: number,
  paramsOrEnabled?: TarifarioQueryParams | boolean,
  enabledParam: boolean = true
) {
  const params = typeof paramsOrEnabled === "object" ? paramsOrEnabled : undefined;
  const enabled = typeof paramsOrEnabled === "boolean" ? paramsOrEnabled : enabledParam;

  return useQuery({
    queryKey: tarifarioKeys.detalles(tarifarioId, params as Record<string, unknown>),
    queryFn: () => getTarifarioDetalles(tarifarioId, params),
    enabled: enabled && tarifarioId > 0,
  });
}

export function useCreateTarifarioDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tarifarioId,
      data,
    }: {
      tarifarioId: number;
      data: CreateTarifarioDetalleRequest;
    }) => createTarifarioDetalle(tarifarioId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tarifarioKeys.detalles(variables.tarifarioId) });
    },
  });
}

export function useCreateTarifarioDetalleCatalogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tarifarioId,
      data,
    }: {
      tarifarioId: number;
      data: CreateTarifarioDetalleCatalogoRequest;
    }) => createTarifarioDetalleCatalogo(tarifarioId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tarifarioKeys.detalles(variables.tarifarioId) });
    },
  });
}

export function useUpdateTarifarioDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tarifarioId,
      detalleId,
      data,
    }: {
      tarifarioId: number;
      detalleId: number;
      data: UpdateTarifarioDetalleRequest;
    }) => updateTarifarioDetalle(tarifarioId, detalleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tarifarioKeys.detalles(variables.tarifarioId) });
    },
  });
}

export function useDeleteTarifarioDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tarifarioId,
      detalleId,
    }: {
      tarifarioId: number;
      detalleId: number;
    }) => deleteTarifarioDetalle(tarifarioId, detalleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tarifarioKeys.detalles(variables.tarifarioId) });
    },
  });
}
