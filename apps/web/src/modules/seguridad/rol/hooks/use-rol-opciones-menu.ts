"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  asignarRolOpcionesMenu,
  createRolOpcionMenu,
  getRolOpcionesMenu,
  getRolOpcionesMenuTree,
  quitarRolOpcionMenu,
} from "../api/rol-opcion-menu.api";
import { rolOpcionMenuKeys } from "../api/rol-opcion-menu.key";
import { opcionMenuKeys } from "@/modules/seguridad/opcion-menu/api/opcion-menu.key";
import type {
  AsignarRolOpcionMenuRequest,
  CreateRolOpcionMenuRequest,
} from "../types/rol-opcion-menu.types";

export function useRolOpcionesMenu(rolId: number, enabled = true) {
  return useQuery({
    queryKey: rolOpcionMenuKeys.byRol(rolId),
    queryFn: () => getRolOpcionesMenu(rolId),
    enabled: enabled && rolId > 0,
  });
}

export function useRolOpcionesMenuTree(rolId: number, enabled = true) {
  return useQuery({
    queryKey: rolOpcionMenuKeys.tree(rolId),
    queryFn: () => getRolOpcionesMenuTree(rolId),
    enabled: enabled && rolId > 0,
  });
}

export function useAsignarRolOpcionesMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rolId,
      request,
    }: {
      rolId: number;
      request: AsignarRolOpcionMenuRequest;
    }) => asignarRolOpcionesMenu(rolId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolOpcionMenuKeys.all });
      queryClient.invalidateQueries({
        queryKey: rolOpcionMenuKeys.byRol(variables.rolId),
      });
      queryClient.invalidateQueries({
        queryKey: rolOpcionMenuKeys.tree(variables.rolId),
      });
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}

export function useCrearRolOpcionMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rolId,
      request,
    }: {
      rolId: number;
      request: CreateRolOpcionMenuRequest;
    }) => createRolOpcionMenu(rolId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolOpcionMenuKeys.all });
      queryClient.invalidateQueries({
        queryKey: rolOpcionMenuKeys.byRol(variables.rolId),
      });
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}

export function useQuitarRolOpcionMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rolId,
      opcionMenuId,
    }: {
      rolId: number;
      opcionMenuId: number;
    }) => quitarRolOpcionMenu(rolId, opcionMenuId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolOpcionMenuKeys.all });
      queryClient.invalidateQueries({
        queryKey: rolOpcionMenuKeys.byRol(variables.rolId),
      });
      queryClient.invalidateQueries({ queryKey: opcionMenuKeys.all });
    },
  });
}
