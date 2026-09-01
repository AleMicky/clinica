"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExistencia,
  deleteExistencia,
  getExistenciaById,
  getExistencias,
  updateExistencia,
} from "../api/existencia.api";
import { existenciaKeys } from "../api/existencia.key";
import type {
  CreateExistenciaRequest,
  ExistenciaQueryParams,
  UpdateExistenciaRequest,
} from "../types/existencia.types";

export function useExistencias(params?: ExistenciaQueryParams) {
  return useQuery({
    queryKey: existenciaKeys.list(params as Record<string, unknown>),
    queryFn: () => getExistencias(params),
  });
}

export function useExistencia(id: number, enabled = true) {
  return useQuery({
    queryKey: existenciaKeys.detail(id),
    queryFn: () => getExistenciaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateExistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExistenciaRequest) => createExistencia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: existenciaKeys.all });
    },
  });
}

export function useUpdateExistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExistenciaRequest }) =>
      updateExistencia(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: existenciaKeys.all });
      queryClient.invalidateQueries({
        queryKey: existenciaKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteExistencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteExistencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: existenciaKeys.all });
    },
  });
}
