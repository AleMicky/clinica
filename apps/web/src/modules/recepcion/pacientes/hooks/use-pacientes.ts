"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaciente,
  createPacienteConvenio,
  deletePaciente,
  deletePacienteConvenio,
  getPacienteById,
  getPacienteConvenios,
  getPacientes,
  updatePaciente,
  updatePacienteConvenio,
} from "../api/paciente.api";
import { pacienteKeys } from "../api/paciente.key";
import type {
  CreatePacienteConvenioRequest,
  CreatePacienteRequest,
  PacienteQueryParams,
  UpdatePacienteConvenioRequest,
  UpdatePacienteRequest,
} from "../types/paciente.types";

export function usePacientes(params?: PacienteQueryParams) {
  return useQuery({
    queryKey: pacienteKeys.list(params as Record<string, unknown>),
    queryFn: () => getPacientes(params),
  });
}

export function usePaciente(id: number, enabled = true) {
  return useQuery({
    queryKey: pacienteKeys.detail(id),
    queryFn: () => getPacienteById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreatePaciente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePacienteRequest) => createPaciente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
    },
  });
}

export function useUpdatePaciente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePacienteRequest }) =>
      updatePaciente(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: pacienteKeys.detail(variables.id), refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
    },
  });
}

export function useDeletePaciente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePaciente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all, refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
    },
  });
}

// Hooks para Convenios del Paciente
export function usePacienteConvenios(pacienteId: number, enabled = true) {
  return useQuery({
    queryKey: pacienteKeys.convenios(pacienteId),
    queryFn: () => getPacienteConvenios(pacienteId),
    enabled: enabled && pacienteId > 0,
  });
}

export function useCreatePacienteConvenio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pacienteId,
      data,
    }: {
      pacienteId: number;
      data: CreatePacienteConvenioRequest;
    }) => createPacienteConvenio(pacienteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pacienteKeys.convenios(variables.pacienteId),
      });
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all });
    },
  });
}

export function useUpdatePacienteConvenio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pacienteId,
      id,
      data,
    }: {
      pacienteId: number;
      id: number;
      data: UpdatePacienteConvenioRequest;
    }) => updatePacienteConvenio(pacienteId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pacienteKeys.convenios(variables.pacienteId),
      });
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all });
    },
  });
}

export function useDeletePacienteConvenio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pacienteId, id }: { pacienteId: number; id: number }) =>
      deletePacienteConvenio(pacienteId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pacienteKeys.convenios(variables.pacienteId),
      });
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all });
    },
  });
}
