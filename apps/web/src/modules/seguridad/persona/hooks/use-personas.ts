"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPersona,
  deletePersona,
  getPersonaById,
  getPersonas,
  updatePersona,
} from "../api/persona.api";
import { personaKeys } from "../api/persona.key";
import type {
  CreatePersonaRequest,
  PersonaQueryParams,
  UpdatePersonaRequest,
} from "../types/persona.types";

export function usePersonas(params?: PersonaQueryParams) {
  return useQuery({
    queryKey: personaKeys.list(params as Record<string, unknown>),
    queryFn: () => getPersonas(params),
  });
}

export function usePersona(id: number, enabled = true) {
  return useQuery({
    queryKey: personaKeys.detail(id),
    queryFn: () => getPersonaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonaRequest) => createPersona(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personaKeys.all });
    },
  });
}

export function useUpdatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePersonaRequest }) =>
      updatePersona(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personaKeys.all });
      queryClient.invalidateQueries({ queryKey: personaKeys.detail(variables.id) });
    },
  });
}

export function useDeletePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePersona(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personaKeys.all });
    },
  });
}
