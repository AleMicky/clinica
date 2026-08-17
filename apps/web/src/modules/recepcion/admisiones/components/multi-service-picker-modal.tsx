"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Stethoscope,
  Loader2,
  Check,
  FolderTree,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { useServiciosTarifario } from "@/modules/servicios/servicio/hooks/use-servicio";
import { useConvenioTarifarios } from "@/modules/servicios/convenio/hooks/use-convenio";
import {
  useAdmisionStore,
  type SelectedServiceCartItem,
} from "../store/use-admision-store";
import type { CategoriaServicioResponse } from "@/modules/servicios/categoria-servicio/types/categoria-servicio.types";
import type {
  ServicioResponse,
  ServicioTarifarioResponse,
  MedicoServicioResponse,
  PagedResult,
} from "@/modules/servicios/servicio/types/servicio.types";
import { toast } from "sonner";

export interface MultiServicePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: CategoriaServicioResponse[];
  convenioId?: string;
  tarifarioId?: number;
}

export function MultiServicePickerModal({
  isOpen,
  onClose,
  categorias,
  convenioId,
  tarifarioId,
}: MultiServicePickerModalProps) {
  const [activeCatId, setActiveCatId] = React.useState<number | undefined>(categorias[0]?.id);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const { addServicesFromPicker, isServiceInCart } = useAdmisionStore();

  const [selectedMap, setSelectedMap] = React.useState<Map<number, SelectedServiceCartItem>>(
    new Map()
  );

  // Actualizar la categoría activa al cargar categorías o al abrir el modal
  React.useEffect(() => {
    if (categorias.length > 0) {
      if (!activeCatId || !categorias.some((c) => c.id === activeCatId)) {
        setActiveCatId(categorias[0].id);
      }
    }
  }, [categorias, activeCatId]);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedMap(new Map());
      setSearchQuery("");
      if (categorias.length > 0) {
        setActiveCatId(categorias[0].id);
      }
    }
  }, [isOpen, categorias]);

  // Si se recibe un convenioId, consultar sus tarifarios para obtener el tarifarioId correspondiente
  const numericConvenioId = convenioId && convenioId !== "particular" ? Number(convenioId) : 0;
  const { data: convenioTarifariosData } = useConvenioTarifarios(
    numericConvenioId,
    Boolean(isOpen && numericConvenioId)
  );

  const activeTarifarioId =
    tarifarioId ||
    convenioTarifariosData?.items?.[0]?.tarifarioId ||
    convenioTarifariosData?.items?.[0]?.tarifario?.id ||
    undefined;

  const currentCatId = activeCatId ?? categorias[0]?.id ?? 0;

  // Consulta a /api/v1/categorias-servicios/{categoriaId}/servicios/tarifario?tarifarioId={int?}
  const { data: serviciosData, isLoading } = useServiciosTarifario(
    currentCatId,
    activeTarifarioId,
    undefined,
    Boolean(isOpen && currentCatId > 0)
  );

  const serviciosList: ServicioTarifarioResponse[] = React.useMemo(() => {
    if (!serviciosData) return [];
    if (Array.isArray(serviciosData)) return serviciosData as ServicioTarifarioResponse[];
    if (Array.isArray((serviciosData as PagedResult<ServicioTarifarioResponse>).items)) {
      return (serviciosData as PagedResult<ServicioTarifarioResponse>).items;
    }
    return [];
  }, [serviciosData]);

  const activeCategory = categorias.find((c) => c.id === activeCatId) || categorias[0];

  const getServicePrice = (s: ServicioTarifarioResponse | ServicioResponse): number => {
    if (typeof s.precio === "number" && !isNaN(s.precio)) return s.precio;
    const raw = s as unknown as Record<string, unknown>;
    const keys = ["precio", "Precio", "precioBase", "PrecioBase", "monto", "Monto", "price", "Price"];
    for (const key of keys) {
      const val = raw[key];
      if (typeof val === "number" && !isNaN(val)) return val;
      if (typeof val === "string" && val.trim() !== "") {
        const num = Number(val);
        if (!isNaN(num)) return num;
      }
    }
    return 0;
  };

  const getServiceMedicos = (s: ServicioTarifarioResponse | ServicioResponse): MedicoServicioResponse[] => {
    return (
      (s as ServicioTarifarioResponse).medicos ||
      ((s as unknown as Record<string, unknown>).Medicos as MedicoServicioResponse[] | undefined) ||
      []
    );
  };

  const filteredServicios = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return serviciosList;
    return serviciosList.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        (s.codigo && s.codigo.toLowerCase().includes(q)) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(q))
    );
  }, [serviciosList, searchQuery]);

  const handleToggleSelect = (s: ServicioTarifarioResponse) => {
    const price = getServicePrice(s);
    const medicos = getServiceMedicos(s);
    const defaultMedicoId = medicos.length === 1 ? medicos[0].medicoId : undefined;
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(s.id)) {
        next.delete(s.id);
      } else {
        next.set(s.id, {
          servicio: {
            ...s,
            precio: price,
            medicos: medicos,
          },
          catId: currentCatId,
          catNombre: activeCategory?.nombre || "Catálogo",
          cantidad: 1,
          medicosDisponibles: medicos,
          medicoId: defaultMedicoId,
        });
      }
      return next;
    });
  };

  const handleSelectMedico = (sId: number, medicoId: number | undefined) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const item = next.get(sId);
      if (item) {
        next.set(sId, { ...item, medicoId });
      }
      return next;
    });
  };

  const handleUpdateQuantity = (sId: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const item = next.get(sId);
      if (item) {
        const newQty = item.cantidad + delta;
        if (newQty <= 0) {
          next.delete(sId);
        } else {
          next.set(sId, { ...item, cantidad: newQty });
        }
      }
      return next;
    });
  };

  const selectedItemsArray = Array.from(selectedMap.values());
  const totalSelectedCount = selectedItemsArray.reduce((acc, item) => acc + item.cantidad, 0);
  const totalSelectedPrice = selectedItemsArray.reduce((acc, item) => {
    const price = getServicePrice(item.servicio);
    return acc + price * item.cantidad;
  }, 0);

  const handleConfirm = () => {
    if (selectedItemsArray.length === 0) {
      toast.warning("Seleccione al menos una prestación médica para agregar.");
      return;
    }
    addServicesFromPicker(selectedItemsArray);
    toast.success(`¡${selectedItemsArray.length} prestación(es) añadida(s) al carrito de la admisión!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-5xl md:max-w-6xl w-[94vw] h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border/80 shadow-2xl">
        <DialogHeader className="shrink-0 p-4 bg-muted/40 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
          <div>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <ShoppingCart className="size-5 text-primary" />
              Catálogo Clínico - Multi-Selección de Prestaciones
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Seleccione varias prestaciones. Los servicios ya añadidos se detectan automáticamente para evitar duplicados.
            </DialogDescription>
          </div>

          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar servicio por nombre..."
              className="h-9.5 text-xs pl-9 pr-3 bg-background shadow-2xs font-medium [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          <div className="md:col-span-4 lg:col-span-3 border-r border-border/60 bg-muted/20 p-3.5 space-y-2 overflow-y-auto h-full min-h-0">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1 block">
              Catálogos Disponibles ({categorias.length})
            </Label>

            {categorias.map((cat) => {
              const isActive = cat.id === activeCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCatId(cat.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between text-xs font-semibold ${isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "bg-background hover:bg-muted text-foreground border border-border/50"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderTree className={`size-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                    <span className="leading-snug">{cat.nombre}</span>
                  </div>
                  <ChevronRight className={`size-4 shrink-0 ${isActive ? "opacity-100" : "opacity-40"}`} />
                </button>
              );
            })}
          </div>

          <div className="md:col-span-8 lg:col-span-9 p-5 space-y-4 overflow-y-auto h-full min-h-0 bg-background">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                Catálogo: <strong className="text-primary text-sm">{activeCategory?.nombre || "General"}</strong>
              </span>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 px-3 py-0.5 font-bold">
                {filteredServicios.length} Servicios
              </Badge>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-muted-foreground space-y-3">
                <Loader2 className="size-8 animate-spin mx-auto text-primary" />
                <p className="font-medium">Cargando prestaciones desde el servidor...</p>
              </div>
            ) : filteredServicios.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                No se encontraron prestaciones en esta categoría.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-4">
                {filteredServicios.map((s) => {
                  const isSelectedInModal = selectedMap.has(s.id);
                  const isAlreadyInCart = isServiceInCart(s.id);
                  const selectedData = selectedMap.get(s.id);
                  const price = getServicePrice(s);
                  const medicos = getServiceMedicos(s);

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSelect(s)}
                      className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer space-y-2.5 shadow-2xs ${
                        isSelectedInModal
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md"
                          : isAlreadyInCart
                            ? "border-emerald-500/50 bg-emerald-500/10 shadow-xs"
                            : "border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="space-y-0.5 min-w-0">
                            {s.codigo && (
                              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                                {s.codigo}
                              </span>
                            )}
                            <p className="font-bold text-xs text-foreground leading-snug">
                              {s.nombre}
                            </p>
                          </div>
                          {isSelectedInModal ? (
                            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] shrink-0 font-bold px-1.5 py-0">
                              <Check className="size-3 mr-0.5" /> ELEGIDO
                            </Badge>
                          ) : isAlreadyInCart ? (
                            <Badge className="bg-emerald-600 text-white border-0 text-[10px] shrink-0 font-bold px-1.5 py-0">
                              ✓ En Carrito
                            </Badge>
                          ) : null}
                        </div>

                        {s.descripcion && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                            {s.descripcion}
                          </p>
                        )}

                        {isSelectedInModal && medicos.length > 0 ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1 space-y-1"
                          >
                            <label className="text-[10px] font-bold text-primary flex items-center gap-1">
                              👨‍⚕️ Médico Asignado:
                            </label>
                            <select
                              value={selectedData?.medicoId ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleSelectMedico(s.id, val ? Number(val) : undefined);
                              }}
                              className="w-full h-7 text-[11px] font-semibold rounded-lg bg-background border border-primary/40 px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
                            >
                              <option value="">-- Sin Médico / Guardia --</option>
                              {medicos.map((m) => (
                                <option key={m.medicoId} value={m.medicoId}>
                                  {m.nombreMedico}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : medicos.length > 0 ? (
                          <div className="flex items-center gap-1 text-[10px] text-primary/90 font-medium bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15">
                            <span className="shrink-0">👨‍⚕️</span>
                            <span className="truncate" title={medicos.map((m) => m.nombreMedico).join(", ")}>
                              {medicos.length === 1
                                ? medicos[0].nombreMedico
                                : `${medicos.length} médicos disponibles`}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 w-full">
                        <span className="text-xs font-extrabold text-primary">
                          Bs. {price.toFixed(2)}
                        </span>

                        {isSelectedInModal ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 bg-background border border-primary/40 rounded-lg p-0.5"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleUpdateQuantity(s.id, -1, e)}
                              className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-foreground font-bold"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="text-xs font-extrabold text-primary px-1.5">
                              {selectedData?.cantidad || 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleUpdateQuantity(s.id, 1, e)}
                              className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-foreground font-bold"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        ) : isAlreadyInCart ? (
                          <span className="text-[10px] font-bold text-emerald-700">
                            + Sumar Fila
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            + Marcar
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-4 bg-muted/40 border-t border-border/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-muted-foreground">
              Prestaciones Elegidas: <strong className="text-foreground text-sm font-bold">{totalSelectedCount}</strong>
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="font-semibold text-muted-foreground">
              Subtotal: <strong className="text-primary text-base font-extrabold">Bs. {totalSelectedPrice.toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={selectedItemsArray.length === 0}
              className="h-9 px-5 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-md shadow-primary/20"
            >
              <Sparkles className="size-4" />
              Añadir a la Admisión ({totalSelectedCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
