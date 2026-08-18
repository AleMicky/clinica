"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createEmpleado,
    deleteEmpleado,
    getEmpleadoById,
    getEmpleados,
    getEmpleadosPermitidos,
    updateEmpleado,
} from "../api/empleado.api";
import { empleadoKeys } from "../api/empleado.key";
import type {
    CreateEmpleadoRequest,
    EmpleadoQueryParams,
    UpdateEmpleadoRequest,
} from "../types/empleado.types";

export function useEmpleadosPermitidos() {
    return useQuery({
        queryKey: empleadoKeys.permitidos(),
        queryFn: () => getEmpleadosPermitidos(),
    });
}

export function useEmpleados(params?: EmpleadoQueryParams) {
    return useQuery({
        queryKey: empleadoKeys.list(params as Record<string, unknown>),
        queryFn: () => getEmpleados(params),
    });
}

export function useEmpleado(id: number, enabled = true) {
    return useQuery({
        queryKey: empleadoKeys.detail(id),
        queryFn: () => getEmpleadoById(id),
        enabled: enabled && id > 0,
    });
}

export function useCreateEmpleado() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEmpleadoRequest) => createEmpleado(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: empleadoKeys.all, refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: ["cajas"], refetchType: "all" });
        },
    });
}

export function useUpdateEmpleado() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdateEmpleadoRequest;
        }) => updateEmpleado(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: empleadoKeys.all,
                refetchType: "all",
            });
            queryClient.invalidateQueries({
                queryKey: empleadoKeys.detail(variables.id),
                refetchType: "all",
            });
            queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: ["cajas"], refetchType: "all" });
        },
    });
}

export function useDeleteEmpleado() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteEmpleado(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: empleadoKeys.all,
                refetchType: "all",
            });
            queryClient.invalidateQueries({ queryKey: ["admisiones"], refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: ["ventas"], refetchType: "all" });
            queryClient.invalidateQueries({ queryKey: ["cajas"], refetchType: "all" });
        },
    });
}