"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createAsignacionEmpleado,
    deleteAsignacionEmpleado,
    getAsignacionEmpleadoById,
    getAsignacionesEmpleado,
    updateAsignacionEmpleado,
} from "../api/asignacion-empleado.api";
import { asignacionEmpleadoKeys } from "../api/asignacion-empleado.key";
import type {
    AsignacionEmpleadoQueryParams,
    CreateAsignacionEmpleadoRequest,
    UpdateAsignacionEmpleadoRequest,
} from "../types/asignacion-empleado.types";

export function useAsignacionesEmpleado(params?: AsignacionEmpleadoQueryParams) {
    return useQuery({
        queryKey: asignacionEmpleadoKeys.list(params as Record<string, unknown>),
        queryFn: () => getAsignacionesEmpleado(params),
    });
}

export function useAsignacionEmpleado(id: number, enabled = true) {
    return useQuery({
        queryKey: asignacionEmpleadoKeys.detail(id),
        queryFn: () => getAsignacionEmpleadoById(id),
        enabled: enabled && id > 0,
    });
}

export function useCreateAsignacionEmpleado() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAsignacionEmpleadoRequest) =>
            createAsignacionEmpleado(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: asignacionEmpleadoKeys.all,
            });
        },
    });
}

export function useUpdateAsignacionEmpleado() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdateAsignacionEmpleadoRequest;
        }) => updateAsignacionEmpleado(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: asignacionEmpleadoKeys.all,
            });
            queryClient.invalidateQueries({
                queryKey: asignacionEmpleadoKeys.detail(variables.id),
            });
        },
    });
}

export function useDeleteAsignacionEmpleado() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteAsignacionEmpleado(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: asignacionEmpleadoKeys.all,
            });
        },
    });
}
