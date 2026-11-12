import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  cancelarCirugia,
  createCirugia,
  finalizarCirugia,
  getCirugiaById,
  getCirugiaMetrics,
  getCirugias,
  getMaterialesQuirofanoStock,
  iniciarCirugia,
  registrarGastosMaterialesCirugia,
  updateCirugia,
} from "../api/quirofano.api";
import { quirofanoKeys } from "../api/quirofano.key";
import type {
  CancelarCirugiaRequest,
  CirugiaMetricsResponse,
  CirugiaQueryParams,
  CirugiaResponse,
  CreateCirugiaRequest,
  FinalizarCirugiaRequest,
  IniciarCirugiaRequest,
  MaterialQuirofanoStockResponse,
  PagedResult,
  RegistrarGastoMaterialCirugiaRequest,
  UpdateCirugiaRequest,
} from "../types/quirofano.types";
import { existenciaKeys } from "@/modules/almacenes/existencia/api/existencia.key";

export function useCirugias(
  params?: CirugiaQueryParams,
  options?: Omit<
    UseQueryOptions<PagedResult<CirugiaResponse>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: quirofanoKeys.list(params),
    queryFn: () => getCirugias(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useCirugia(
  id: number,
  options?: Omit<
    UseQueryOptions<CirugiaResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: quirofanoKeys.detail(id),
    queryFn: () => getCirugiaById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useCirugiaMetrics(
  fechaDesde?: string,
  fechaHasta?: string,
  options?: Omit<
    UseQueryOptions<CirugiaMetricsResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: quirofanoKeys.metrics(fechaDesde, fechaHasta),
    queryFn: () => getCirugiaMetrics(fechaDesde, fechaHasta),
    ...options,
  });
}

export function useMaterialesQuirofanoStock(
  almacenId?: number,
  search?: string,
  options?: Omit<
    UseQueryOptions<MaterialQuirofanoStockResponse[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: quirofanoKeys.materialesStock(almacenId, search),
    queryFn: () => getMaterialesQuirofanoStock(almacenId, search),
    ...options,
  });
}

export function useCreateCirugia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCirugiaRequest) => createCirugia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.all });
      queryClient.invalidateQueries({ queryKey: existenciaKeys.all });
    },
  });
}

export function useUpdateCirugia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCirugiaRequest }) =>
      updateCirugia(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.lists() });
    },
  });
}

export function useIniciarCirugia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IniciarCirugiaRequest }) =>
      iniciarCirugia(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.all });
    },
  });
}

export function useRegistrarGastosMaterialesCirugia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RegistrarGastoMaterialCirugiaRequest;
    }) => registrarGastosMaterialesCirugia(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.all });
    },
  });
}

export function useFinalizarCirugia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FinalizarCirugiaRequest }) =>
      finalizarCirugia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.all });
      queryClient.invalidateQueries({ queryKey: existenciaKeys.all });
    },
  });
}

export function useCancelarCirugia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelarCirugiaRequest }) =>
      cancelarCirugia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quirofanoKeys.all });
    },
  });
}
