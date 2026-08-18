"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularVenta,
  cambiarEstadoVenta,
  createVenta,
  createVentaDetalle,
  createVentaPagador,
  deleteVentaDetalle,
  deleteVentaPagador,
  getVentaById,
  getVentaDetalles,
  getVentaPagadores,
  getVentas,
  updateVentaDetalle,
  updateVentaPagador,
} from "../api/ventas.api";
import { ventaKeys } from "../api/ventas.key";
import type {
  CambiarEstadoVentaRequest,
  CreateVentaDetalleRequest,
  CreateVentaPagadorRequest,
  CreateVentaRequest,
  UpdateVentaDetalleRequest,
  UpdateVentaPagadorRequest,
  VentaQueryParams,
} from "../types/ventas.types";

export function useVentas(params?: VentaQueryParams) {
  return useQuery({
    queryKey: ventaKeys.list(params as Record<string, unknown>),
    queryFn: () => getVentas(params),
  });
}

export function useVenta(id: number, enabled = true) {
  return useQuery({
    queryKey: ventaKeys.detail(id),
    queryFn: () => getVentaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVentaRequest) => createVenta(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventaKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
    },
  });
}

export function useCambiarEstadoVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CambiarEstadoVentaRequest }) =>
      cambiarEstadoVenta(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ventaKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ventaKeys.detail(variables.id), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
    },
  });
}

export function useAnularVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => anularVenta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventaKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
    },
  });
}

// Hooks para Detalles
export function useVentaDetalles(ventaId: number, enabled = true) {
  return useQuery({
    queryKey: ventaKeys.detalles(ventaId),
    queryFn: () => getVentaDetalles(ventaId),
    enabled: enabled && ventaId > 0,
  });
}

export function useCreateVentaDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ventaId,
      data,
    }: {
      ventaId: number;
      data: CreateVentaDetalleRequest;
    }) => createVentaDetalle(ventaId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ventaKeys.detalles(variables.ventaId),
      });
      queryClient.invalidateQueries({ queryKey: ventaKeys.all });
    },
  });
}

export function useUpdateVentaDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ventaId,
      detalleId,
      data,
    }: {
      ventaId: number;
      detalleId: number;
      data: UpdateVentaDetalleRequest;
    }) => updateVentaDetalle(ventaId, detalleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ventaKeys.detalles(variables.ventaId),
      });
      queryClient.invalidateQueries({ queryKey: ventaKeys.all });
    },
  });
}

export function useDeleteVentaDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ventaId,
      detalleId,
    }: {
      ventaId: number;
      detalleId: number;
    }) => deleteVentaDetalle(ventaId, detalleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ventaKeys.detalles(variables.ventaId),
      });
      queryClient.invalidateQueries({ queryKey: ventaKeys.all });
    },
  });
}

// Hooks para Pagadores
export function useVentaPagadores(ventaId: number, enabled = true) {
  return useQuery({
    queryKey: ventaKeys.pagadores(ventaId),
    queryFn: () => getVentaPagadores(ventaId),
    enabled: enabled && ventaId > 0,
  });
}

export function useCreateVentaPagador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ventaId,
      data,
    }: {
      ventaId: number;
      data: CreateVentaPagadorRequest;
    }) => createVentaPagador(ventaId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ventaKeys.pagadores(variables.ventaId),
      });
      queryClient.invalidateQueries({ queryKey: ventaKeys.all });
    },
  });
}

export function useUpdateVentaPagador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ventaId,
      pagadorId,
      data,
    }: {
      ventaId: number;
      pagadorId: number;
      data: UpdateVentaPagadorRequest;
    }) => updateVentaPagador(ventaId, pagadorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ventaKeys.pagadores(variables.ventaId),
      });
      queryClient.invalidateQueries({ queryKey: ventaKeys.all });
    },
  });
}

export function useDeleteVentaPagador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ventaId,
      pagadorId,
    }: {
      ventaId: number;
      pagadorId: number;
    }) => deleteVentaPagador(ventaId, pagadorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ventaKeys.pagadores(variables.ventaId),
      });
      queryClient.invalidateQueries({ queryKey: ventaKeys.all });
    },
  });
}
