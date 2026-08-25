"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activarOpcionMenu,
  createOpcionMenu,
  deleteOpcionMenu,
  getOpcionMenuById,
  getOpcionesMenu,
  getOpcionesMenuTree,
  inactivarOpcionMenu,
  updateOpcionMenu,
} from "../api/opcion-menu.api";
import { opcionMenuKeys } from "../api/opcion-menu.key";
import type {
  CreateOpcionMenuRequest,
  OpcionMenuQueryParams,
  UpdateOpcionMenuRequest,
} from "../types/opcion-menu.types";

export function useOpcionesMenu(params?: OpcionMenuQueryParams) {
  return useQuery({
    queryKey: opcionMenuKeys.list(params as Record<string, unknown>),
    queryFn: () => getOpcionesMenu(params),
  });
}

export function useOpcionesMenuTree() {
  return useQuery({
    queryKey: opcionMenuKeys.tree(),
    queryFn: () => getOpcionesMenuTree(),
  });
}

export function useOpcionMenu(id: number, enabled = true) {
  return useQuery({
    queryKey: opcionMenuKeys.detail(id),
    queryFn: () => getOpcionMenuById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateOpcionMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpcionMenuRequest) => createOpcionMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}

export function useUpdateOpcionMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateOpcionMenuRequest;
    }) => updateOpcionMenu(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
      queryClient.invalidateQueries({
        queryKey: opcionMenuKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteOpcionMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteOpcionMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}

export function useActivarOpcionMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => activarOpcionMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}

export function useInactivarOpcionMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => inactivarOpcionMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}
