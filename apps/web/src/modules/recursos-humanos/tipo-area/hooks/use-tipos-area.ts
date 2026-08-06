"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createTipoArea,
    deleteTipoArea,
    getTipoAreaById,
    getTiposArea,
    updateTipoArea,
} from "../api/tipo-area.api";
import { tipoAreaKeys } from "../api/tipo-area.key";
import type {
    CreateTipoAreaRequest,
    TipoAreaQueryParams,
    UpdateTipoAreaRequest,
} from "../types/tipo-area.types";

export function useTiposArea(params?: TipoAreaQueryParams) {
    return useQuery({
        queryKey: tipoAreaKeys.list(params as Record<string, unknown>),
        queryFn: () => getTiposArea(params),
    });
}

export function useTipoArea(id: number, enabled = true) {
    return useQuery({
        queryKey: tipoAreaKeys.detail(id),
        queryFn: () => getTipoAreaById(id),
        enabled: enabled && id > 0,
    });
}

export function useCreateTipoArea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTipoAreaRequest) => createTipoArea(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tipoAreaKeys.all });
        },
    });
}

export function useUpdateTipoArea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTipoAreaRequest }) =>
            updateTipoArea(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tipoAreaKeys.all });
            queryClient.invalidateQueries({ queryKey: tipoAreaKeys.detail(variables.id) });
        },
    });
}

export function useDeleteTipoArea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteTipoArea(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tipoAreaKeys.all });
        },
    });
}