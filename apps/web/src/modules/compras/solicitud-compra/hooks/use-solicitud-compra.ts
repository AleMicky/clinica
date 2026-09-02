"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  aprobarSolicitudCompra,
  cancelarSolicitudCompra,
  createSolicitudCompra,
  deleteSolicitudCompra,
  enviarAprobacionSolicitudCompra,
  getSolicitudCompraById,
  getSolicitudesCompra,
  rechazarSolicitudCompra,
  updateSolicitudCompra,
} from "../api/solicitud-compra.api";
import { solicitudCompraKeys } from "../api/solicitud-compra.key";
import type {
  SolicitudCompraQueryParams,
  CreateSolicitudCompraRequest,
  UpdateSolicitudCompraRequest,
  AprobarSolicitudCompraRequest,
  RechazarSolicitudCompraRequest,
  CancelarSolicitudCompraRequest,
} from "../types/solicitud-compra.types";

export function useSolicitudesCompra(params?: SolicitudCompraQueryParams) {
  return useQuery({
    queryKey: solicitudCompraKeys.list(params),
    queryFn: () => getSolicitudesCompra(params),
  });
}

export function useSolicitudCompra(id: number, enabled = true) {
  return useQuery({
    queryKey: solicitudCompraKeys.detail(id),
    queryFn: () => getSolicitudCompraById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateSolicitudCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSolicitudCompraRequest) =>
      createSolicitudCompra(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.all,
      });
    },
  });
}

export function useUpdateSolicitudCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSolicitudCompraRequest;
    }) => updateSolicitudCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteSolicitudCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSolicitudCompra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.all,
      });
    },
  });
}

export function useEnviarAprobacionSolicitudCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => enviarAprobacionSolicitudCompra(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.detail(id),
      });
    },
  });
}

export function useAprobarSolicitudCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AprobarSolicitudCompraRequest;
    }) => aprobarSolicitudCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.detail(variables.id),
      });
    },
  });
}

export function useRechazarSolicitudCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RechazarSolicitudCompraRequest;
    }) => rechazarSolicitudCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.detail(variables.id),
      });
    },
  });
}

export function useCancelarSolicitudCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CancelarSolicitudCompraRequest;
    }) => cancelarSolicitudCompra(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: solicitudCompraKeys.detail(variables.id),
      });
    },
  });
}
