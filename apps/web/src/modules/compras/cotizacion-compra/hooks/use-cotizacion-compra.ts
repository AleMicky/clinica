"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelarCotizacionCompra,
  createCotizacionCompra,
  deleteCotizacionCompra,
  getCotizacionCompraById,
  getCotizacionesCompra,
  recibirCotizacionCompra,
  rechazarCotizacionCompra,
  seleccionarCotizacionCompra,
  updateCotizacionCompra,
} from "../api/cotizacion-compra.api";
import { cotizacionCompraKeys } from "../api/cotizacion-compra.key";
import type {
  CotizacionCompraQueryParams,
  CreateCotizacionCompraRequest,
  UpdateCotizacionCompraRequest,
  CancelarCotizacionCompraRequest,
} from "../types/cotizacion-compra.types";

export function useCotizacionesCompra(params?: CotizacionCompraQueryParams) {
  return useQuery({
    queryKey: cotizacionCompraKeys.list(params),
    queryFn: () => getCotizacionesCompra(params),
  });
}

export function useCotizacionCompra(id: number, enabled = true) {
  return useQuery({
    queryKey: cotizacionCompraKeys.detail(id),
    queryFn: () => getCotizacionCompraById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateCotizacionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCotizacionCompraRequest) =>
      createCotizacionCompra(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.all,
      });
    },
  });
}

export function useUpdateCotizacionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCotizacionCompraRequest;
    }) => updateCotizacionCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteCotizacionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCotizacionCompra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.all,
      });
    },
  });
}

export function useRecibirCotizacionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recibirCotizacionCompra(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.detail(id),
      });
    },
  });
}

export function useSeleccionarCotizacionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => seleccionarCotizacionCompra(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.detail(id),
      });
    },
  });
}

export function useRechazarCotizacionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rechazarCotizacionCompra(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.detail(id),
      });
    },
  });
}

export function useCancelarCotizacionCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CancelarCotizacionCompraRequest;
    }) => cancelarCotizacionCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: cotizacionCompraKeys.detail(variables.id),
      });
    },
  });
}
