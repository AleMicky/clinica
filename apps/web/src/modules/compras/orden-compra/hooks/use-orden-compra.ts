"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  aprobarOrdenCompra,
  cancelarOrdenCompra,
  createOrdenCompra,
  deleteOrdenCompra,
  enviarAprobacionOrdenCompra,
  enviarProveedorOrdenCompra,
  getOrdenCompraById,
  getOrdenesCompra,
  recibirOrdenCompra,
  updateOrdenCompra,
} from "../api/orden-compra.api";
import { ordenCompraKeys } from "../api/orden-compra.key";
import type {
  OrdenCompraQueryParams,
  CreateOrdenCompraRequest,
  UpdateOrdenCompraRequest,
  RecibirOrdenCompraRequest,
  CancelarOrdenCompraRequest,
} from "../types/orden-compra.types";

export function useOrdenesCompra(params?: OrdenCompraQueryParams) {
  return useQuery({
    queryKey: ordenCompraKeys.list(params),
    queryFn: () => getOrdenesCompra(params),
  });
}

export function useOrdenCompra(id: number, enabled = true) {
  return useQuery({
    queryKey: ordenCompraKeys.detail(id),
    queryFn: () => getOrdenCompraById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrdenCompraRequest) => createOrdenCompra(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.all,
      });
    },
  });
}

export function useUpdateOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateOrdenCompraRequest;
    }) => updateOrdenCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteOrdenCompra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.all,
      });
    },
  });
}

export function useEnviarAprobacionOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => enviarAprobacionOrdenCompra(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.detail(id),
      });
    },
  });
}

export function useAprobarOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => aprobarOrdenCompra(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.detail(id),
      });
    },
  });
}

export function useEnviarProveedorOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => enviarProveedorOrdenCompra(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.detail(id),
      });
    },
  });
}

export function useRecibirOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RecibirOrdenCompraRequest;
    }) => recibirOrdenCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.detail(variables.id),
      });
    },
  });
}

export function useCancelarOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CancelarOrdenCompraRequest;
    }) => cancelarOrdenCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ordenCompraKeys.detail(variables.id),
      });
    },
  });
}
