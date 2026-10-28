import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  anularDispensacion,
  createDispensacion,
  entregarMedicamentosDispensacion,
  getDispensacionById,
  getDispensacionMetrics,
  getDispensaciones,
  getMedicamentosStock,
  registrarCobroDispensacion,
} from "../api/dispensacion.api";
import { dispensacionKeys } from "../api/dispensacion.key";
import type {
  AnularDispensacionRequest,
  CreateDispensacionRequest,
  DispensacionMetricsResponse,
  DispensacionQueryParams,
  DispensacionResponse,
  MedicamentoStockResponse,
  PagedResult,
  RegistrarCobroDispensacionRequest,
} from "../types/dispensacion.types";
import { existenciaKeys } from "@/modules/almacenes/existencia/api/existencia.key";
import { movimientoInventarioKeys } from "@/modules/almacenes/movimiento-inventario/api/movimiento-inventario.key";
import { kardexKeys } from "@/modules/almacenes/kardex/api/kardex.key";
import { cobroKeys } from "@/modules/cajas/cobro/api/cobro.key";
import { movimientoCajaKeys } from "@/modules/cajas/movimiento-caja/api/movimiento-caja.key";
import { admisionKeys } from "@/modules/recepcion/admisiones/api/admision.key";

export function useDispensaciones(
  params?: DispensacionQueryParams,
  options?: Omit<
    UseQueryOptions<PagedResult<DispensacionResponse>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: dispensacionKeys.list(params),
    queryFn: () => getDispensaciones(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useDispensacion(
  id: number,
  options?: Omit<
    UseQueryOptions<DispensacionResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: dispensacionKeys.detail(id),
    queryFn: () => getDispensacionById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useDispensacionMetrics(
  params?: { almacenId?: number; fechaDesde?: string; fechaHasta?: string },
  options?: Omit<
    UseQueryOptions<DispensacionMetricsResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: dispensacionKeys.metrics(params),
    queryFn: () => getDispensacionMetrics(params),
    ...options,
  });
}

export function useMedicamentosStock(
  almacenId: number,
  search?: string,
  options?: Omit<
    UseQueryOptions<MedicamentoStockResponse[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: dispensacionKeys.medicamentosStock(almacenId, search),
    queryFn: () => getMedicamentosStock(almacenId, search),
    enabled: almacenId > 0,
    ...options,
  });
}

export function useCreateDispensacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDispensacionRequest) => createDispensacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispensacionKeys.all });
      queryClient.invalidateQueries({ queryKey: existenciaKeys.all });
      queryClient.invalidateQueries({ queryKey: cobroKeys.all });
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
    },
  });
}

export function useRegistrarCobroDispensacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RegistrarCobroDispensacionRequest;
    }) => registrarCobroDispensacion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dispensacionKeys.all });
      queryClient.invalidateQueries({
        queryKey: dispensacionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: cobroKeys.all });
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
    },
  });
}

export function useEntregarMedicamentosDispensacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => entregarMedicamentosDispensacion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: dispensacionKeys.all });
      queryClient.invalidateQueries({ queryKey: dispensacionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: existenciaKeys.all });
      queryClient.invalidateQueries({ queryKey: movimientoInventarioKeys.all });
      queryClient.invalidateQueries({ queryKey: kardexKeys.all });
    },
  });
}

export function useAnularDispensacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AnularDispensacionRequest;
    }) => anularDispensacion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dispensacionKeys.all });
      queryClient.invalidateQueries({
        queryKey: dispensacionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: existenciaKeys.all });
      queryClient.invalidateQueries({ queryKey: movimientoInventarioKeys.all });
      queryClient.invalidateQueries({ queryKey: kardexKeys.all });
      queryClient.invalidateQueries({ queryKey: cobroKeys.all });
      queryClient.invalidateQueries({ queryKey: movimientoCajaKeys.all });
      queryClient.invalidateQueries({ queryKey: admisionKeys.all });
    },
  });
}
