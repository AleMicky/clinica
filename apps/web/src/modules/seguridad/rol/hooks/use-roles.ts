"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRol,
  deleteRol,
  getRolById,
  getRoles,
  updateRol,
} from "../api/rol.api";
import { rolKeys } from "../api/rol.key";
import type {
  CreateRolRequest,
  RolQueryParams,
  UpdateRolRequest,
} from "../types/rol.types";

export function useRoles(params?: RolQueryParams) {
  return useQuery({
    queryKey: rolKeys.list(params as Record<string, unknown>),
    queryFn: () => getRoles(params),
  });
}

export function useRol(id: number, enabled = true) {
  return useQuery({
    queryKey: rolKeys.detail(id),
    queryFn: () => getRolById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRolRequest) => createRol(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolKeys.all });
    },
  });
}

export function useUpdateRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRolRequest }) =>
      updateRol(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolKeys.all });
      queryClient.invalidateQueries({ queryKey: rolKeys.detail(variables.id) });
    },
  });
}

export function useDeleteRol() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRol(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolKeys.all });
    },
  });
}
