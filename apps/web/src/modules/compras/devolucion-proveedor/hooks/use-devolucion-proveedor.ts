"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularDevolucionProveedor,
  aprobarDevolucionProveedor,
  confirmarDevolucionProveedor,
  createDevolucionProveedor,
  deleteDevolucionProveedor,
  enviarAprobacionDevolucionProveedor,
  getDevolucionProveedorById,
  getDevolucionesProveedor,
  rechazarDevolucionProveedor,
  updateDevolucionProveedor,
} from "../api/devolucion-proveedor.api";
import { devolucionProveedorKeys } from "../api/devolucion-proveedor.key";
import type {
  DevolucionProveedorQueryParams,
  CreateDevolucionProveedorRequest,
  UpdateDevolucionProveedorRequest,
  AnularDevolucionProveedorRequest,
} from "../types/devolucion-proveedor.types";

export function useDevolucionesProveedor(
  params?: DevolucionProveedorQueryParams
) {
  return useQuery({
    queryKey: devolucionProveedorKeys.list(params),
    queryFn: () => getDevolucionesProveedor(params),
  });
}

export function useDevolucionProveedor(id: number, enabled = true) {
  return useQuery({
    queryKey: devolucionProveedorKeys.detail(id),
    queryFn: () => getDevolucionProveedorById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateDevolucionProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDevolucionProveedorRequest) =>
      createDevolucionProveedor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.all,
      });
    },
  });
}

export function useUpdateDevolucionProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateDevolucionProveedorRequest;
    }) => updateDevolucionProveedor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteDevolucionProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDevolucionProveedor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.all,
      });
    },
  });
}

export function useEnviarAprobacionDevolucionProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => enviarAprobacionDevolucionProveedor(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.detail(id),
      });
    },
  });
}

export function useAprobarDevolucionProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => aprobarDevolucionProveedor(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.detail(id),
      });
    },
  });
}

export function useRechazarDevolucionProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rechazarDevolucionProveedor(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.detail(id),
      });
    },
  });
}

export function useConfirmarDevolucionProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confirmarDevolucionProveedor(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.detail(id),
      });
    },
  });
}

export function useAnularDevolucionProveedor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AnularDevolucionProveedorRequest;
    }) => anularDevolucionProveedor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: devolucionProveedorKeys.detail(variables.id),
      });
    },
  });
}
