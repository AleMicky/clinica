"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConvenio,
  createConvenioTarifario,
  deleteConvenio,
  deleteConvenioTarifario,
  getConvenioById,
  getConvenios,
  getConvenioTarifarios,
  updateConvenio,
  updateConvenioTarifario,
} from "../api/convenio.api";
import { convenioKeys } from "../api/convenio.key";
import type {
  ConvenioQueryParams,
  CreateConvenioRequest,
  CreateConvenioTarifarioRequest,
  UpdateConvenioRequest,
  UpdateConvenioTarifarioRequest,
} from "../types/convenio.types";

export function useConvenios(params?: ConvenioQueryParams) {
  return useQuery({
    queryKey: convenioKeys.list(params as Record<string, unknown>),
    queryFn: () => getConvenios(params),
  });
}

export function useConvenio(id: number, enabled = true) {
  return useQuery({
    queryKey: convenioKeys.detail(id),
    queryFn: () => getConvenioById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateConvenio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConvenioRequest) => createConvenio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: convenioKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["pacientes"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
    },
  });
}

export function useUpdateConvenio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConvenioRequest }) =>
      updateConvenio(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: convenioKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: convenioKeys.detail(variables.id), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["pacientes"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
    },
  });
}

export function useDeleteConvenio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteConvenio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: convenioKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["pacientes"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
    },
  });
}

// Tarifarios de Convenio
export function useConvenioTarifarios(convenioId: number, enabled = true) {
  return useQuery({
    queryKey: convenioKeys.tarifarios(convenioId),
    queryFn: () => getConvenioTarifarios(convenioId),
    enabled: enabled && convenioId > 0,
  });
}

export function useCreateConvenioTarifario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      convenioId,
      data,
    }: {
      convenioId: number;
      data: CreateConvenioTarifarioRequest;
    }) => createConvenioTarifario(convenioId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: convenioKeys.tarifarios(variables.convenioId) });
    },
  });
}

export function useUpdateConvenioTarifario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      convenioId,
      id,
      data,
    }: {
      convenioId: number;
      id: number;
      data: UpdateConvenioTarifarioRequest;
    }) => updateConvenioTarifario(convenioId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: convenioKeys.tarifarios(variables.convenioId) });
    },
  });
}

export function useDeleteConvenioTarifario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      convenioId,
      id,
    }: {
      convenioId: number;
      id: number;
    }) => deleteConvenioTarifario(convenioId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: convenioKeys.tarifarios(variables.convenioId) });
    },
  });
}
