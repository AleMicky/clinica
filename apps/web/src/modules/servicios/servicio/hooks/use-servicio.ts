"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createServicio,
  deleteServicio,
  getServicioById,
  getServiciosByCategoria,
  getServiciosByCategoriaTarifario,
  updateServicio,
} from "../api/servicio.api";
import { servicioKeys } from "../api/servicio.key";
import type {
  CreateServicioRequest,
  ServicioQueryParams,
  UpdateServicioRequest,
} from "../types/servicio.types";

export function useServicios(categoriaId: number, params?: ServicioQueryParams, enabled = true) {
  return useQuery({
    queryKey: servicioKeys.list(categoriaId, params as Record<string, unknown>),
    queryFn: () => getServiciosByCategoria(categoriaId, params),
    enabled: enabled && categoriaId > 0,
  });
}

export function useServiciosTarifario(
  categoriaId: number,
  tarifarioId?: number,
  params?: ServicioQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: servicioKeys.tarifario(categoriaId, tarifarioId, params as Record<string, unknown>),
    queryFn: () => getServiciosByCategoriaTarifario(categoriaId, tarifarioId, params),
    enabled: enabled && categoriaId > 0,
  });
}

export function useServicio(categoriaId: number, servicioId: number, enabled = true) {
  return useQuery({
    queryKey: servicioKeys.detail(categoriaId, servicioId),
    queryFn: () => getServicioById(categoriaId, servicioId),
    enabled: enabled && categoriaId > 0 && servicioId > 0,
  });
}

export function useCreateServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoriaId, data }: { categoriaId: number; data: CreateServicioRequest }) =>
      createServicio(categoriaId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: servicioKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: servicioKeys.byCategory(variables.categoriaId), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
    },
  });
}

export function useUpdateServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoriaId,
      servicioId,
      data,
    }: {
      categoriaId: number;
      servicioId: number;
      data: UpdateServicioRequest;
    }) => updateServicio(categoriaId, servicioId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: servicioKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: servicioKeys.byCategory(variables.categoriaId), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
    },
  });
}

export function useDeleteServicio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoriaId, servicioId }: { categoriaId: number; servicioId: number }) =>
      deleteServicio(categoriaId, servicioId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: servicioKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: servicioKeys.byCategory(variables.categoriaId), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
    },
  });
}
