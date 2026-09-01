"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularBajaInventario,
  confirmarBajaInventario,
  createBajaInventario,
  deleteBajaInventario,
  getBajaInventarioById,
  getBajasInventario,
  updateBajaInventario,
} from "../api/baja-inventario.api";
import { bajaInventarioKeys } from "../api/baja-inventario.key";
import type {
  BajaInventarioQueryParams,
  AnularBajaInventarioRequest,
  CreateBajaInventarioRequest,
  UpdateBajaInventarioRequest,
} from "../types/baja-inventario.types";

export function useBajasInventario(params?: BajaInventarioQueryParams) {
  return useQuery({
    queryKey: bajaInventarioKeys.list(params),
    queryFn: () => getBajasInventario(params),
  });
}

export function useBajaInventario(id: number, enabled = true) {
  return useQuery({
    queryKey: bajaInventarioKeys.detail(id),
    queryFn: () => getBajaInventarioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateBajaInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBajaInventarioRequest) =>
      createBajaInventario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bajaInventarioKeys.all,
      });
    },
  });
}

export function useUpdateBajaInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateBajaInventarioRequest;
    }) => updateBajaInventario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: bajaInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: bajaInventarioKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteBajaInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBajaInventario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bajaInventarioKeys.all,
      });
    },
  });
}

export function useConfirmarBajaInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confirmarBajaInventario(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: bajaInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: bajaInventarioKeys.detail(id),
      });
    },
  });
}

export function useAnularBajaInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AnularBajaInventarioRequest;
    }) => anularBajaInventario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: bajaInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: bajaInventarioKeys.detail(variables.id),
      });
    },
  });
}
