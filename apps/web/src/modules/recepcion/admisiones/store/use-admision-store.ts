import { create } from "zustand";
import type { CreateAdmisionDetalleRequest } from "../types/admision.types";
import type { ServicioResponse } from "@/modules/servicios/servicio/types/servicio.types";

export interface ServiceItemState extends CreateAdmisionDetalleRequest {
  id: string;
  categoriaId?: number;
  categoriaNombre?: string;
  servicioNombre?: string;
}

export interface SelectedServiceCartItem {
  servicio: ServicioResponse;
  catId: number;
  catNombre: string;
  cantidad: number;
}

interface AdmisionStoreState {
  detalles: ServiceItemState[];
  addServicesFromPicker: (items: SelectedServiceCartItem[]) => void;
  removeDetalle: (id: string) => void;
  updateDetalle: (id: string, field: keyof ServiceItemState, value: unknown) => void;
  clearDetalles: () => void;
  isServiceInCart: (servicioId: number) => boolean;
}

export const useAdmisionStore = create<AdmisionStoreState>((set, get) => ({
  detalles: [],

  addServicesFromPicker: (items) => {
    set((state) => {
      const current = [...state.detalles];
      const newItems: ServiceItemState[] = [];

      for (const item of items) {
        const existingIdx = current.findIndex((d) => Number(d.servicioId) === item.servicio.id);
        const price = (item.servicio as unknown as { precioBase?: number }).precioBase || 120;

        if (existingIdx >= 0) {
          // Si ya está en el carrito, actualizar la cantidad sin duplicar la fila
          current[existingIdx] = {
            ...current[existingIdx],
            cantidad: current[existingIdx].cantidad + item.cantidad,
          };
        } else {
          // Si no está, agregar nueva fila
          newItems.push({
            id: Math.random().toString(),
            categoriaId: item.catId,
            categoriaNombre: item.catNombre,
            servicioId: item.servicio.id,
            servicioNombre: item.servicio.nombre,
            medicoId: undefined,
            cantidad: item.cantidad,
            precioUnitario: price,
            descuento: 0,
          });
        }
      }

      return { detalles: [...current, ...newItems] };
    });
  },

  removeDetalle: (id) => {
    set((state) => ({
      detalles: state.detalles.filter((item) => item.id !== id),
    }));
  },

  updateDetalle: (id, field, value) => {
    set((state) => ({
      detalles: state.detalles.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      }),
    }));
  },

  clearDetalles: () => {
    set({ detalles: [] });
  },

  isServiceInCart: (servicioId) => {
    return get().detalles.some((d) => Number(d.servicioId) === servicioId);
  },
}));
