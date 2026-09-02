"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularRecepcionCompra,
  confirmarRecepcionCompra,
  createRecepcionCompra,
  deleteRecepcionCompra,
  getRecepcionCompraById,
  getRecepcionesCompra,
  updateRecepcionCompra,
} from "../api/recepcion-compra.api";
import { recepcionCompraKeys } from "../api/recepcion-compra.key";
import type {
  RecepcionCompraQueryParams,
  CreateRecepcionCompraRequest,
  UpdateRecepcionCompraRequest,
  AnularRecepcionCompraRequest,
} from "../types/recepcion-compra.types";

export function useRecepcionesCompra(params?: RecepcionCompraQueryParams) {
  return useQuery({
    queryKey: recepcionCompraKeys.list(params),
    queryFn: () => getRecepcionesCompra(params),
  });
}

export function useRecepcionCompra(id: number, enabled = true) {
  return useQuery({
    queryKey: recepcionCompraKeys.detail(id),
    queryFn: () => getRecepcionCompraById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateRecepcionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecepcionCompraRequest) =>
      createRecepcionCompra(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recepcionCompraKeys.all,
      });
    },
  });
}

export function useUpdateRecepcionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateRecepcionCompraRequest;
    }) => updateRecepcionCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: recepcionCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: recepcionCompraKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteRecepcionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRecepcionCompra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recepcionCompraKeys.all,
      });
    },
  });
}

export function useConfirmarRecepcionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confirmarRecepcionCompra(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: recepcionCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: recepcionCompraKeys.detail(id),
      });
    },
  });
}

export function useAnularRecepcionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AnularRecepcionCompraRequest;
    }) => anularRecepcionCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: recepcionCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: recepcionCompraKeys.detail(variables.id),
      });
    },
  });
}
