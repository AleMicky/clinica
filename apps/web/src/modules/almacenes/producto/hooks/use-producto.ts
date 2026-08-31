import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createProducto,
  deleteProducto,
  getProductoById,
  getProductos,
  updateProducto,
} from "../api/producto.api";
import { productoKeys } from "../api/producto.key";
import type {
  CreateProductoRequest,
  PagedResult,
  ProductoQueryParams,
  ProductoResponse,
  UpdateProductoRequest,
} from "../types/producto.types";

export function useProductos(
  params?: ProductoQueryParams,
  options?: Omit<
    UseQueryOptions<PagedResult<ProductoResponse>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: productoKeys.list(params),
    queryFn: () => getProductos(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useProducto(
  id: number,
  options?: Omit<
    UseQueryOptions<ProductoResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: productoKeys.detail(id),
    queryFn: () => getProductoById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductoRequest) => createProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoKeys.lists() });
    },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateProductoRequest;
    }) => updateProducto(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productoKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productoKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productoKeys.lists() });
    },
  });
}
