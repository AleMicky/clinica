"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  aprobarTransferenciaAlmacen,
  cancelarTransferenciaAlmacen,
  createTransferenciaAlmacen,
  deleteTransferenciaAlmacen,
  despacharTransferenciaAlmacen,
  getTransferenciaAlmacenById,
  getTransferenciasAlmacen,
  recibirTransferenciaAlmacen,
  solicitarTransferenciaAlmacen,
  updateTransferenciaAlmacen,
} from "../api/transferencia-almacen.api";
import { transferenciaAlmacenKeys } from "../api/transferencia-almacen.key";
import type {
  AprobarTransferenciaAlmacenRequest,
  CancelarTransferenciaAlmacenRequest,
  CreateTransferenciaAlmacenRequest,
  DespacharTransferenciaAlmacenRequest,
  RecibirTransferenciaAlmacenRequest,
  TransferenciaAlmacenQueryParams,
  UpdateTransferenciaAlmacenRequest,
} from "../types/transferencia-almacen.types";

export function useTransferenciasAlmacen(
  params?: TransferenciaAlmacenQueryParams
) {
  return useQuery({
    queryKey: transferenciaAlmacenKeys.list(params),
    queryFn: () => getTransferenciasAlmacen(params),
  });
}

export function useTransferenciaAlmacen(id: number, enabled = true) {
  return useQuery({
    queryKey: transferenciaAlmacenKeys.detail(id),
    queryFn: () => getTransferenciaAlmacenById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateTransferenciaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransferenciaAlmacenRequest) =>
      createTransferenciaAlmacen(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.all,
      });
    },
  });
}

export function useUpdateTransferenciaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateTransferenciaAlmacenRequest;
    }) => updateTransferenciaAlmacen(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteTransferenciaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTransferenciaAlmacen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.all,
      });
    },
  });
}

export function useSolicitarTransferenciaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => solicitarTransferenciaAlmacen(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.detail(id),
      });
    },
  });
}

export function useAprobarTransferenciaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AprobarTransferenciaAlmacenRequest;
    }) => aprobarTransferenciaAlmacen(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.detail(variables.id),
      });
    },
  });
}

export function useDespacharTransferenciaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: DespacharTransferenciaAlmacenRequest;
    }) => despacharTransferenciaAlmacen(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.detail(variables.id),
      });
    },
  });
}

export function useRecibirTransferenciaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RecibirTransferenciaAlmacenRequest;
    }) => recibirTransferenciaAlmacen(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.detail(variables.id),
      });
    },
  });
}

export function useCancelarTransferenciaAlmacen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CancelarTransferenciaAlmacenRequest;
    }) => cancelarTransferenciaAlmacen(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: transferenciaAlmacenKeys.detail(variables.id),
      });
    },
  });
}
