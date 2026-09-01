"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularInventarioFisico,
  cerrarInventarioFisico,
  createInventarioFisico,
  deleteInventarioFisico,
  getInventarioFisicoById,
  getInventariosFisicos,
  iniciarConteoInventarioFisico,
  registrarConteoInventarioFisico,
  updateInventarioFisico,
} from "../api/inventario-fisico.api";
import { inventarioFisicoKeys } from "../api/inventario-fisico.key";
import type {
  AnularInventarioFisicoRequest,
  CreateInventarioFisicoRequest,
  InventarioFisicoQueryParams,
  RegistrarConteoInventarioFisicoRequest,
  UpdateInventarioFisicoRequest,
} from "../types/inventario-fisico.types";

export function useInventariosFisicos(params?: InventarioFisicoQueryParams) {
  return useQuery({
    queryKey: inventarioFisicoKeys.list(params),
    queryFn: () => getInventariosFisicos(params),
  });
}

export function useInventarioFisico(id: number, enabled = true) {
  return useQuery({
    queryKey: inventarioFisicoKeys.detail(id),
    queryFn: () => getInventarioFisicoById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateInventarioFisico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventarioFisicoRequest) =>
      createInventarioFisico(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.all,
      });
    },
  });
}

export function useUpdateInventarioFisico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInventarioFisicoRequest;
    }) => updateInventarioFisico(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteInventarioFisico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteInventarioFisico(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.all,
      });
    },
  });
}

export function useIniciarConteoInventarioFisico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => iniciarConteoInventarioFisico(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.detail(id),
      });
    },
  });
}

export function useRegistrarConteoInventarioFisico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RegistrarConteoInventarioFisicoRequest;
    }) => registrarConteoInventarioFisico(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.detail(variables.id),
      });
    },
  });
}

export function useCerrarInventarioFisico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cerrarInventarioFisico(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.detail(id),
      });
    },
  });
}

export function useAnularInventarioFisico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AnularInventarioFisicoRequest;
    }) => anularInventarioFisico(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: inventarioFisicoKeys.detail(variables.id),
      });
    },
  });
}
