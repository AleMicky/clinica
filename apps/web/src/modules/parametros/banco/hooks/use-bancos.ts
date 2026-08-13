"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBanco,
  createCuentaBancaria,
  deleteBanco,
  deleteCuentaBancaria,
  getBancoById,
  getBancos,
  getCuentaBancariaById,
  getCuentasBancarias,
  updateBanco,
  updateCuentaBancaria,
} from "../api/banco.api";
import { bancoKeys } from "../api/banco.key";
import type {
  BancoQueryParams,
  CreateBancoRequest,
  CreateCuentaBancariaRequest,
  CuentaBancariaQueryParams,
  UpdateBancoRequest,
  UpdateCuentaBancariaRequest,
} from "../types/banco.types";

// ===================================
// Hooks para Bancos
// ===================================

export function useBancos(params?: BancoQueryParams) {
  return useQuery({
    queryKey: bancoKeys.list(params as Record<string, unknown>),
    queryFn: () => getBancos(params),
  });
}

export function useBanco(id: number, enabled = true) {
  return useQuery({
    queryKey: bancoKeys.detail(id),
    queryFn: () => getBancoById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateBanco() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBancoRequest) => createBanco(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bancoKeys.all });
    },
  });
}

export function useUpdateBanco() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBancoRequest }) =>
      updateBanco(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bancoKeys.all });
      queryClient.invalidateQueries({ queryKey: bancoKeys.detail(variables.id) });
    },
  });
}

export function useDeleteBanco() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBanco(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bancoKeys.all });
    },
  });
}

// ===================================
// Hooks para Cuentas Bancarias
// ===================================

export function useCuentasBancarias(
  bancoId: number,
  params?: CuentaBancariaQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: bancoKeys.cuentasList(bancoId, params as Record<string, unknown>),
    queryFn: () => getCuentasBancarias(bancoId, params),
    enabled: enabled && bancoId > 0,
  });
}

export function useCuentaBancaria(
  bancoId: number,
  cuentaId: number,
  enabled = true
) {
  return useQuery({
    queryKey: bancoKeys.cuentaDetail(bancoId, cuentaId),
    queryFn: () => getCuentaBancariaById(bancoId, cuentaId),
    enabled: enabled && bancoId > 0 && cuentaId > 0,
  });
}

export function useCreateCuentaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bancoId,
      data,
    }: {
      bancoId: number;
      data: CreateCuentaBancariaRequest;
    }) => createCuentaBancaria(bancoId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: bancoKeys.cuentasAll(variables.bancoId),
      });
      queryClient.invalidateQueries({ queryKey: bancoKeys.all });
    },
  });
}

export function useUpdateCuentaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bancoId,
      cuentaId,
      data,
    }: {
      bancoId: number;
      cuentaId: number;
      data: UpdateCuentaBancariaRequest;
    }) => updateCuentaBancaria(bancoId, cuentaId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: bancoKeys.cuentasAll(variables.bancoId),
      });
      queryClient.invalidateQueries({
        queryKey: bancoKeys.cuentaDetail(variables.bancoId, variables.cuentaId),
      });
      queryClient.invalidateQueries({ queryKey: bancoKeys.all });
    },
  });
}

export function useDeleteCuentaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bancoId,
      cuentaId,
    }: {
      bancoId: number;
      cuentaId: number;
    }) => deleteCuentaBancaria(bancoId, cuentaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: bancoKeys.cuentasAll(variables.bancoId),
      });
      queryClient.invalidateQueries({ queryKey: bancoKeys.all });
    },
  });
}
