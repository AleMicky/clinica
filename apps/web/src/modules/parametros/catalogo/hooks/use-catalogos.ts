"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCatalogoGrupo,
  createCatalogoItem,
  deleteCatalogoGrupo,
  deleteCatalogoItem,
  getCatalogoGrupoById,
  getCatalogoGrupos,
  getCatalogoItemById,
  getCatalogoItems,
  getCatalogoItemsByCodigo,
  updateCatalogoGrupo,
  updateCatalogoItem,
} from "../api/catalogo.api";
import { catalogoKeys } from "../api/catalogo.key";
import type {
  CatalogoQueryParams,
  CreateCatalogoGrupoRequest,
  CreateCatalogoItemRequest,
  UpdateCatalogoGrupoRequest,
  UpdateCatalogoItemRequest,
} from "../types/catalogo.types";

// ===================================
// Catálogo Grupos Hooks
// ===================================

export function useCatalogoGrupos(params?: CatalogoQueryParams) {
  return useQuery({
    queryKey: catalogoKeys.grupoList(params as Record<string, unknown>),
    queryFn: () => getCatalogoGrupos(params),
  });
}

export function useCatalogoGrupo(id: number, enabled = true) {
  return useQuery({
    queryKey: catalogoKeys.grupoDetail(id),
    queryFn: () => getCatalogoGrupoById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateCatalogoGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCatalogoGrupoRequest) => createCatalogoGrupo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogoKeys.all });
    },
  });
}

export function useUpdateCatalogoGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCatalogoGrupoRequest }) =>
      updateCatalogoGrupo(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogoKeys.all });
      queryClient.invalidateQueries({
        queryKey: catalogoKeys.grupoDetail(variables.id),
      });
    },
  });
}

export function useDeleteCatalogoGrupo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCatalogoGrupo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogoKeys.all });
    },
  });
}

// ===================================
// Catálogo Items Hooks
// ===================================

export function useCatalogoItems(grupoId: number, params?: CatalogoQueryParams) {
  return useQuery({
    queryKey: catalogoKeys.itemList(grupoId, params as Record<string, unknown>),
    queryFn: () => getCatalogoItems(grupoId, params),
    enabled: grupoId > 0,
  });
}

export function useCatalogoItemsByCodigo(
  codigo: string,
  params?: CatalogoQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: catalogoKeys.itemsPorCodigo(codigo, params as Record<string, unknown>),
    queryFn: () => getCatalogoItemsByCodigo(codigo, params),
    enabled: (options?.enabled ?? true) && Boolean(codigo),
  });
}

export function useCatalogoItem(grupoId: number, itemId: number, enabled = true) {
  return useQuery({
    queryKey: catalogoKeys.itemDetail(grupoId, itemId),
    queryFn: () => getCatalogoItemById(grupoId, itemId),
    enabled: enabled && grupoId > 0 && itemId > 0,
  });
}

export function useCreateCatalogoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      grupoId,
      data,
    }: {
      grupoId: number;
      data: CreateCatalogoItemRequest;
    }) => createCatalogoItem(grupoId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: catalogoKeys.items(variables.grupoId),
      });
      queryClient.invalidateQueries({ queryKey: catalogoKeys.grupos() });
    },
  });
}

export function useUpdateCatalogoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      grupoId,
      itemId,
      data,
    }: {
      grupoId: number;
      itemId: number;
      data: UpdateCatalogoItemRequest;
    }) => updateCatalogoItem(grupoId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: catalogoKeys.items(variables.grupoId),
      });
      queryClient.invalidateQueries({
        queryKey: catalogoKeys.itemDetail(variables.grupoId, variables.itemId),
      });
    },
  });
}

export function useDeleteCatalogoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ grupoId, itemId }: { grupoId: number; itemId: number }) =>
      deleteCatalogoItem(grupoId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: catalogoKeys.items(variables.grupoId),
      });
      queryClient.invalidateQueries({ queryKey: catalogoKeys.grupos() });
    },
  });
}
