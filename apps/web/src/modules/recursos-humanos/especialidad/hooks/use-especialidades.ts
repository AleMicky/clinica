"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEspecialidad,
  deleteEspecialidad,
  getEspecialidadById,
  getEspecialidades,
  updateEspecialidad,
} from "../api/especialidad.api";
import { especialidadKeys } from "../api/especialidad.key";
import type {
  CreateEspecialidadRequest,
  EspecialidadQueryParams,
  UpdateEspecialidadRequest,
} from "../types/especialidad.types";

export function useEspecialidades(params?: EspecialidadQueryParams) {
  return useQuery({
    queryKey: especialidadKeys.list(params as Record<string, unknown>),
    queryFn: () => getEspecialidades(params),
  });
}

export function useEspecialidad(id: number, enabled = true) {
  return useQuery({
    queryKey: especialidadKeys.detail(id),
    queryFn: () => getEspecialidadById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEspecialidadRequest) => createEspecialidad(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: especialidadKeys.all });
    },
  });
}

export function useUpdateEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEspecialidadRequest }) =>
      updateEspecialidad(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: especialidadKeys.all });
      queryClient.invalidateQueries({
        queryKey: especialidadKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteEspecialidad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: especialidadKeys.all });
    },
  });
}
