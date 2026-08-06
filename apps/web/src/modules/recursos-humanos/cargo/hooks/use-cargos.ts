"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createCargo,
    deleteCargo,
    getCargoById,
    getCargos,
    updateCargo,
} from "../api/cargo.api";
import { cargoKeys } from "../api/cargo.key";
import type {
    CargoQueryParams,
    CreateCargoRequest,
    UpdateCargoRequest,
} from "../types/cargo.types";

export function useCargos(params?: CargoQueryParams) {
    return useQuery({
        queryKey: cargoKeys.list(params as Record<string, unknown>),
        queryFn: () => getCargos(params),
    });
}

export function useCargo(id: number, enabled = true) {
    return useQuery({
        queryKey: cargoKeys.detail(id),
        queryFn: () => getCargoById(id),
        enabled: enabled && id > 0,
    });
}

export function useCreateCargo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCargoRequest) => createCargo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cargoKeys.all });
        },
    });
}

export function useUpdateCargo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCargoRequest }) =>
            updateCargo(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: cargoKeys.all });
            queryClient.invalidateQueries({ queryKey: cargoKeys.detail(variables.id) });
        },
    });
}

export function useDeleteCargo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteCargo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cargoKeys.all });
        },
    });
}