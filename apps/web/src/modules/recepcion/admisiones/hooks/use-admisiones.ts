"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstadoAdmision,
  createAdmision,
  createAdmisionConPaciente,
  createAdmisionDetalle,
  deleteAdmision,
  deleteAdmisionDetalle,
  getAdmisionById,
  getAdmisionDetalles,
  getAdmisiones,
  updateAdmision,
} from "../api/admision.api";
import { admisionKeys } from "../api/admision.key";
import type {
  AdmisionQueryParams,
  CambiarEstadoRequest,
  CreateAdmisionDetalleRequest,
  CreateAdmisionRequest,
  CreateAdmisionConPacienteRequest,
  UpdateAdmisionRequest,
} from "../types/admision.types";

export function useAdmisiones(params?: AdmisionQueryParams) {
  return useQuery({
    queryKey: admisionKeys.list(params as Record<string, unknown>),
    queryFn: () => getAdmisiones(params),
  });
}

export function useAdmision(id: number, enabled = true) {
  return useQuery({
    queryKey: admisionKeys.detail(id),
    queryFn: () => getAdmisionById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateAdmision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdmisionRequest) => createAdmision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
    },
  });
}

export function useCreateAdmisionConPaciente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdmisionConPacienteRequest) => createAdmisionConPaciente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
    },
  });
}


export function useUpdateAdmision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAdmisionRequest }) =>
      updateAdmision(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
      queryClient.invalidateQueries({ queryKey: admisionKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAdmision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAdmision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
    },
  });
}

export function useCambiarEstadoAdmision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CambiarEstadoRequest }) =>
      cambiarEstadoAdmision(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
      queryClient.invalidateQueries({ queryKey: admisionKeys.detail(variables.id) });
    },
  });
}

// Hooks para detalles de admisión
export function useAdmisionDetalles(admisionId: number, enabled = true) {
  return useQuery({
    queryKey: admisionKeys.detalles(admisionId),
    queryFn: () => getAdmisionDetalles(admisionId),
    enabled: enabled && admisionId > 0,
  });
}

export function useCreateAdmisionDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      admisionId,
      data,
    }: {
      admisionId: number;
      data: CreateAdmisionDetalleRequest;
    }) => createAdmisionDetalle(admisionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: admisionKeys.detalles(variables.admisionId),
      });
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
    },
  });
}

export function useDeleteAdmisionDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      admisionId,
      detalleId,
    }: {
      admisionId: number;
      detalleId: number;
    }) => deleteAdmisionDetalle(admisionId, detalleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: admisionKeys.detalles(variables.admisionId),
      });
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
    },
  });
}
