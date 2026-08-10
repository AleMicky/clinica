import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMedico,
  createMedicoEspecialidad,
  createMedicoServicioAcuerdo,
  deleteMedico,
  deleteMedicoEspecialidad,
  deleteMedicoServicioAcuerdo,
  getMedicoById,
  getMedicoEspecialidades,
  getMedicoServicioAcuerdos,
  getMedicos,
  updateMedico,
  updateMedicoEspecialidad,
  updateMedicoServicioAcuerdo,
} from "../api/medico.api";
import { medicoKeys } from "../api/medico.key";
import type {
  CreateMedicoEspecialidadRequest,
  CreateMedicoRequest,
  CreateMedicoServicioAcuerdoRequest,
  MedicoQueryParams,
  UpdateMedicoEspecialidadRequest,
  UpdateMedicoRequest,
  UpdateMedicoServicioAcuerdoRequest,
} from "../types/medico.types";

// === Medico Hooks ===

export function useMedicos(params?: MedicoQueryParams) {
  return useQuery({
    queryKey: medicoKeys.list(params as Record<string, unknown>),
    queryFn: () => getMedicos(params),
  });
}

export function useMedico(id: number, enabled = true) {
  return useQuery({
    queryKey: medicoKeys.detail(id),
    queryFn: () => getMedicoById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateMedico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateMedicoRequest) => createMedico(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicoKeys.lists() });
      toast.success("Médico registrado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al registrar el médico";
      toast.error(message);
    },
  });
}

export function useUpdateMedico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateMedicoRequest }) =>
      updateMedico(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: medicoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicoKeys.detail(id) });
      toast.success("Médico actualizado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar el médico";
      toast.error(message);
    },
  });
}

export function useDeleteMedico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMedico(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicoKeys.lists() });
      toast.success("Médico inhabilitado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al inhabilitar el médico";
      toast.error(message);
    },
  });
}

// === Medico Especialidades Hooks ===

export function useMedicoEspecialidades(
  empleadoId: number,
  medicoId: number,
  enabled = true
) {
  return useQuery({
    queryKey: medicoKeys.especialidades(medicoId),
    queryFn: () => getMedicoEspecialidades(empleadoId, medicoId),
    enabled: enabled && empleadoId > 0 && medicoId > 0,
  });
}

export function useCreateMedicoEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      empleadoId,
      medicoId,
      request,
    }: {
      empleadoId: number;
      medicoId: number;
      request: CreateMedicoEspecialidadRequest;
    }) => createMedicoEspecialidad(empleadoId, medicoId, request),
    onSuccess: (_, { medicoId }) => {
      queryClient.invalidateQueries({
        queryKey: medicoKeys.especialidades(medicoId),
      });
      queryClient.invalidateQueries({ queryKey: medicoKeys.lists() });
      toast.success("Especialidad asignada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al asignar especialidad";
      toast.error(message);
    },
  });
}

export function useUpdateMedicoEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      empleadoId,
      medicoId,
      id,
      request,
    }: {
      empleadoId: number;
      medicoId: number;
      id: number;
      request: UpdateMedicoEspecialidadRequest;
    }) => updateMedicoEspecialidad(empleadoId, medicoId, id, request),
    onSuccess: (_, { medicoId }) => {
      queryClient.invalidateQueries({
        queryKey: medicoKeys.especialidades(medicoId),
      });
      queryClient.invalidateQueries({ queryKey: medicoKeys.lists() });
      toast.success("Especialidad actualizada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar especialidad";
      toast.error(message);
    },
  });
}

export function useDeleteMedicoEspecialidad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      empleadoId,
      medicoId,
      id,
    }: {
      empleadoId: number;
      medicoId: number;
      id: number;
    }) => deleteMedicoEspecialidad(empleadoId, medicoId, id),
    onSuccess: (_, { medicoId }) => {
      queryClient.invalidateQueries({
        queryKey: medicoKeys.especialidades(medicoId),
      });
      queryClient.invalidateQueries({ queryKey: medicoKeys.lists() });
      toast.success("Especialidad desasignada exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al desasignar especialidad";
      toast.error(message);
    },
  });
}

// === Medico Servicio Acuerdos Hooks ===

export function useMedicoServicioAcuerdos(
  empleadoId: number,
  medicoId: number,
  enabled = true
) {
  return useQuery({
    queryKey: medicoKeys.acuerdos(medicoId),
    queryFn: () => getMedicoServicioAcuerdos(empleadoId, medicoId),
    enabled: enabled && empleadoId > 0 && medicoId > 0,
  });
}

export function useCreateMedicoServicioAcuerdo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      empleadoId,
      medicoId,
      request,
    }: {
      empleadoId: number;
      medicoId: number;
      request: CreateMedicoServicioAcuerdoRequest;
    }) => createMedicoServicioAcuerdo(empleadoId, medicoId, request),
    onSuccess: (_, { medicoId }) => {
      queryClient.invalidateQueries({
        queryKey: medicoKeys.acuerdos(medicoId),
      });
      toast.success("Acuerdo de servicio registrado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al registrar acuerdo de servicio";
      toast.error(message);
    },
  });
}

export function useUpdateMedicoServicioAcuerdo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      empleadoId,
      medicoId,
      id,
      request,
    }: {
      empleadoId: number;
      medicoId: number;
      id: number;
      request: UpdateMedicoServicioAcuerdoRequest;
    }) => updateMedicoServicioAcuerdo(empleadoId, medicoId, id, request),
    onSuccess: (_, { medicoId }) => {
      queryClient.invalidateQueries({
        queryKey: medicoKeys.acuerdos(medicoId),
      });
      toast.success("Acuerdo de servicio actualizado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar acuerdo de servicio";
      toast.error(message);
    },
  });
}

export function useDeleteMedicoServicioAcuerdo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      empleadoId,
      medicoId,
      id,
    }: {
      empleadoId: number;
      medicoId: number;
      id: number;
    }) => deleteMedicoServicioAcuerdo(empleadoId, medicoId, id),
    onSuccess: (_, { medicoId }) => {
      queryClient.invalidateQueries({
        queryKey: medicoKeys.acuerdos(medicoId),
      });
      toast.success("Acuerdo de servicio inhabilitado exitosamente");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error al inhabilitar acuerdo de servicio";
      toast.error(message);
    },
  });
}
