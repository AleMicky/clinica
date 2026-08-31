import { create } from "zustand";
import type { CreateAdmisionDetalleRequest } from "../types/admision.types";
import type {
  ServicioResponse,
  ServicioTarifarioResponse,
  MedicoServicioResponse,
} from "@/modules/servicios/servicio/types/servicio.types";

export interface ServiceItemState extends CreateAdmisionDetalleRequest {
  id: string;
  categoriaId?: number;
  categoriaNombre?: string;
  servicioCodigo?: string;
  servicioNombre?: string;
  medicosDisponibles?: MedicoServicioResponse[];
}

export interface SelectedServiceCartItem {
  servicio: ServicioTarifarioResponse | ServicioResponse;
  catId: number;
  catNombre: string;
  cantidad: number;
  medicosDisponibles?: MedicoServicioResponse[];
  medicoId?: number;
}

interface AdmisionStoreState {
  detalles: ServiceItemState[];
  setDetalles: (detalles: ServiceItemState[]) => void;
  setServicesFromPicker: (items: SelectedServiceCartItem[]) => void;
  addServicesFromPicker: (items: SelectedServiceCartItem[]) => void;
  removeDetalle: (id: string) => void;
  updateDetalle: (id: string, field: keyof ServiceItemState, value: unknown) => void;
  clearDetalles: () => void;
  isServiceInCart: (servicioId: number) => boolean;
}

export const useAdmisionStore = create<AdmisionStoreState>((set, get) => ({
  detalles: [],

  setDetalles: (detalles) => {
    set({ detalles });
  },

  setServicesFromPicker: (items) => {
    set((state) => {
      const newDetalles: ServiceItemState[] = items.map((item) => {
        const existing = state.detalles.find((d) => Number(d.servicioId) === item.servicio.id);
        const raw = item.servicio as unknown as { precio?: number; Precio?: number; precioBase?: number };
        const price = raw.precio ?? raw.Precio ?? raw.precioBase ?? 0;
        const medicos =
          item.medicosDisponibles ||
          (item.servicio as ServicioTarifarioResponse).medicos ||
          ((item.servicio as unknown as Record<string, unknown>).Medicos as MedicoServicioResponse[] | undefined) ||
          [];
        const defaultMedicoId = item.medicoId ?? existing?.medicoId ?? (medicos.length === 1 ? medicos[0].medicoId : undefined);

        return {
          id: existing?.id || Math.random().toString(),
          categoriaId: item.catId || existing?.categoriaId,
          categoriaNombre: item.catNombre || existing?.categoriaNombre,
          servicioId: item.servicio.id,
          servicioCodigo: item.servicio.codigo || existing?.servicioCodigo,
          servicioNombre: item.servicio.nombre || existing?.servicioNombre,
          medicosDisponibles: medicos.length > 0 ? medicos : existing?.medicosDisponibles,
          medicoId: defaultMedicoId,
          cantidad: item.cantidad,
          precioUnitario: existing?.precioUnitario !== undefined ? existing.precioUnitario : price,
          descuento: existing?.descuento ?? 0,
        };
      });

      return { detalles: newDetalles };
    });
  },

  addServicesFromPicker: (items) => {
    set((state) => {
      const current = [...state.detalles];
      const newItems: ServiceItemState[] = [];

      for (const item of items) {
        const existingIdx = current.findIndex((d) => Number(d.servicioId) === item.servicio.id);
        const raw = item.servicio as unknown as { precio?: number; Precio?: number; precioBase?: number };
        const price = raw.precio ?? raw.Precio ?? raw.precioBase ?? 0;
        const medicos =
          item.medicosDisponibles ||
          (item.servicio as ServicioTarifarioResponse).medicos ||
          ((item.servicio as unknown as Record<string, unknown>).Medicos as MedicoServicioResponse[] | undefined) ||
          [];
        const defaultMedicoId = item.medicoId ?? (medicos.length === 1 ? medicos[0].medicoId : undefined);

        if (existingIdx >= 0) {
          // Si ya está en el carrito, actualizar la cantidad sin duplicar la fila
          current[existingIdx] = {
            ...current[existingIdx],
            cantidad: current[existingIdx].cantidad + item.cantidad,
            medicosDisponibles: medicos.length > 0 ? medicos : current[existingIdx].medicosDisponibles,
          };
        } else {
          // Si no está, agregar nueva fila
          newItems.push({
            id: Math.random().toString(),
            categoriaId: item.catId,
            categoriaNombre: item.catNombre,
            servicioId: item.servicio.id,
            servicioCodigo: item.servicio.codigo,
            servicioNombre: item.servicio.nombre,
            medicosDisponibles: medicos,
            medicoId: defaultMedicoId,
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
