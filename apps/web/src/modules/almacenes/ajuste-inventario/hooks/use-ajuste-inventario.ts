"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularAjusteInventario,
  confirmarAjusteInventario,
  createAjusteInventario,
  deleteAjusteInventario,
  getAjusteInventarioById,
  getAjustesInventario,
  updateAjusteInventario,
} from "../api/ajuste-inventario.api";
import { ajusteInventarioKeys } from "../api/ajuste-inventario.key";
import type {
  AjusteInventarioQueryParams,
  AnularAjusteInventarioRequest,
  CreateAjusteInventarioRequest,
  UpdateAjusteInventarioRequest,
} from "../types/ajuste-inventario.types";

export function useAjustesInventario(params?: AjusteInventarioQueryParams) {
  return useQuery({
    queryKey: ajusteInventarioKeys.list(params),
    queryFn: () => getAjustesInventario(params),
  });
}

export function useAjusteInventario(id: number, enabled = true) {
  return useQuery({
    queryKey: ajusteInventarioKeys.detail(id),
    queryFn: () => getAjusteInventarioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateAjusteInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAjusteInventarioRequest) =>
      createAjusteInventario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ajusteInventarioKeys.all,
      });
    },
  });
}

export function useUpdateAjusteInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAjusteInventarioRequest;
    }) => updateAjusteInventario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ajusteInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ajusteInventarioKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteAjusteInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAjusteInventario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ajusteInventarioKeys.all,
      });
    },
  });
}

export function useConfirmarAjusteInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confirmarAjusteInventario(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ajusteInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ajusteInventarioKeys.detail(id),
      });
    },
  });
}

export function useAnularAjusteInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AnularAjusteInventarioRequest;
    }) => anularAjusteInventario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ajusteInventarioKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ajusteInventarioKeys.detail(variables.id),
      });
    },
  });
}
