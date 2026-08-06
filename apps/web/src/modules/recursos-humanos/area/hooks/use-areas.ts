"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createArea,
    deleteArea,
    getAreaById,
    getAreas,
    getArbolAreas,
    updateArea,
} from "../api/area.api";
import { areaKeys } from "../api/area.key";
import type {
    AreaQueryParams,
    CreateAreaRequest,
    UpdateAreaRequest,
} from "../types/area.types";

export function useAreas(params?: AreaQueryParams) {
    return useQuery({
        queryKey: areaKeys.list(params as Record<string, unknown>),
        queryFn: () => getAreas(params),
    });
}

export function useArbolAreas() {
    return useQuery({
        queryKey: areaKeys.arbol(),
        queryFn: getArbolAreas,
        staleTime: 30 * 1000,
    });
}

export function useArea(id: number, enabled = true) {
    return useQuery({
        queryKey: areaKeys.detail(id),
        queryFn: () => getAreaById(id),
        enabled: enabled && id > 0,
    });
}

export function useCreateArea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAreaRequest) => createArea(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: areaKeys.all });
        },
    });
}

export function useUpdateArea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateAreaRequest }) =>
            updateArea(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: areaKeys.all });
            queryClient.invalidateQueries({ queryKey: areaKeys.detail(variables.id) });
        },
    });
}

export function useDeleteArea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteArea(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: areaKeys.all });
        },
    });
}