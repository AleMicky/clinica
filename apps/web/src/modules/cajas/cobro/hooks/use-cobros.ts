"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularCobro,
  createCobro,
  deleteCobro,
  getCobroById,
  getCobros,
  updateCobro,
} from "../api/cobro.api";
import { cobroKeys } from "../api/cobro.key";
import type {
  AnularCobroRequest,
  CobroQueryParams,
  CreateCobroRequest,
  UpdateCobroRequest,
} from "../types/cobro.types";

export function useCobros(params?: CobroQueryParams, enabled = true) {
  return useQuery({
    queryKey: cobroKeys.list(params as Record<string, unknown>),
    queryFn: () => getCobros(params),
    enabled,
  });
}

export function useCobro(id: number, enabled = true) {
  return useQuery({
    queryKey: cobroKeys.detail(id),
    queryFn: () => getCobroById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateCobro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCobroRequest) => createCobro(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cobroKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["cajas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["movimientos-caja"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
    },
  });
}

export function useUpdateCobro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCobroRequest }) =>
      updateCobro(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cobroKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: cobroKeys.detail(variables.id), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["cajas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["movimientos-caja"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
    },
  });
}

export function useAnularCobro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AnularCobroRequest }) =>
      anularCobro(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cobroKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: cobroKeys.detail(variables.id), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["cajas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["movimientos-caja"], refetchType: "all" });
    },
  });
}

export function useDeleteCobro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCobro(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cobroKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["cajas"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["movimientos-caja"], refetchType: "all" });
    },
  });
}
