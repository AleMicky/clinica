"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  X,
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

  const { setServicesFromPicker, detalles, isServiceInCart } = useAdmisionStore();

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

  // Cargar prestaciones existentes del carrito para conservar selecciones y totales
  React.useEffect(() => {
    if (isOpen) {
      const initialMap = new Map<number, SelectedServiceCartItem>();
      for (const d of detalles) {
        initialMap.set(Number(d.servicioId), {
          servicio: {
            id: Number(d.servicioId),
            codigo: d.servicioCodigo || "",
            nombre: d.servicioNombre || "",
            precio: Number(d.precioUnitario) || 0,
            medicos: d.medicosDisponibles || [],
          } as unknown as ServicioTarifarioResponse,
          catId: d.categoriaId || 0,
          catNombre: d.categoriaNombre || "Catálogo",
          cantidad: d.cantidad || 1,
          medicosDisponibles: d.medicosDisponibles || [],
          medicoId: d.medicoId ?? undefined,
        });
      }
      setSelectedMap(initialMap);
      setSearchQuery("");
      if (categorias.length > 0) {
        setActiveCatId(categorias[0].id);
      }
    }
  }, [isOpen, categorias, detalles]);

  // Si se recibe un convenioId, consultar sus tarifarios para obtener el tarifarioId correspondiente
  const numericConvenioId = convenioId && convenioId !== "particular" ? Number(convenioId) : 0;
  const { data: convenioTarifariosData } = useConvenioTarifarios(
    numericConvenioId,
    Boolean(isOpen && numericConvenioId)
  );

  const activeTarifarioId: number | undefined =
    tarifarioId ||
    (convenioTarifariosData?.items?.[0]?.tarifarioId != null
      ? Number(convenioTarifariosData.items[0].tarifarioId)
      : undefined) ||
    (convenioTarifariosData?.items?.[0]?.tarifario?.id != null
      ? Number(convenioTarifariosData.items[0].tarifario.id)
      : undefined) ||
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

  // Cantidad de seleccionados por categoría
  const selectedCountsByCat = React.useMemo(() => {
    const counts = new Map<number, number>();
    for (const item of selectedItemsArray) {
      counts.set(item.catId, (counts.get(item.catId) || 0) + item.cantidad);
    }
    return counts;
  }, [selectedItemsArray]);

  const handleConfirm = () => {
    if (selectedItemsArray.length === 0) {
      toast.warning("Seleccione al menos una prestación médica para agregar.");
      return;
    }
    setServicesFromPicker(selectedItemsArray);
    toast.success(`¡${selectedItemsArray.length} prestación(es) guardada(s) en la admisión!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-5xl md:max-w-6xl w-[94vw] h-[82vh] max-h-[82vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border/80 shadow-2xl rounded-xl"
      >
        {/* HEADER COMPACTO */}
        <DialogHeader className="shrink-0 px-4 py-2.5 bg-muted/40 border-b border-border/70 flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-foreground truncate">
              <ShoppingCart className="size-4 text-primary shrink-0" />
              Catálogo Clínico - Selección de Prestaciones
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground truncate">
              Seleccione una o más prestaciones médicas para añadirlas al carrito de la admisión.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-56 sm:w-72">
              <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar servicio o código..."
                className="h-7.5 text-xs pl-8 pr-7 bg-background shadow-2xs font-medium"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        {/* CONTENIDO PRINCIPAL: SIDEBAR + GRILLA */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          {/* SIDEBAR DE CATEGORÍAS */}
          <div className="md:col-span-4 lg:col-span-3 border-r border-border/60 bg-muted/15 p-2 space-y-1 overflow-y-auto h-full min-h-0">
            <div className="px-2 py-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Catálogos ({categorias.length})
              </span>
            </div>

            {categorias.map((cat) => {
              const isActive = cat.id === activeCatId;
              const inCatCount = selectedCountsByCat.get(cat.id) || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCatId(cat.id)}
                  className={`w-full px-2.5 py-2 rounded-lg text-left transition-all flex items-center justify-between text-xs cursor-pointer ${isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-background hover:bg-muted text-foreground border border-border/50 font-medium"
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderTree
                      className={`size-3.5 shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"
                        }`}
                    />
                    <span className="truncate leading-tight text-[11.5px]">{cat.nombre}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {inCatCount > 0 && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${isActive
                            ? "bg-primary-foreground text-primary"
                            : "bg-primary/15 text-primary"
                          }`}
                      >
                        {inCatCount}
                      </span>
                    )}
                    <ChevronRight
                      className={`size-3.5 ${isActive ? "opacity-100" : "opacity-40"}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* GRILLA DE SERVICIOS */}
          <div className="md:col-span-8 lg:col-span-9 p-3 sm:p-3.5 space-y-2.5 overflow-y-auto h-full min-h-0 bg-background">
            {/* BARRA SUPERIOR DE LA CATEGORÍA ACTIVA */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary" />
                Catálogo:{" "}
                <strong className="text-primary font-bold">
                  {activeCategory?.nombre || "General"}
                </strong>
              </span>
              <Badge
                variant="outline"
                className="text-[10px] bg-primary/10 text-primary border-primary/20 px-2 py-0 font-semibold"
              >
                {filteredServicios.length} Servicios
              </Badge>
            </div>

            {/* ESTADOS: CARGANDO / VACÍO / GRILLA */}
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                <Loader2 className="size-6 animate-spin mx-auto text-primary" />
                <p className="font-medium text-[11px]">Cargando prestaciones médicas...</p>
              </div>
            ) : filteredServicios.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                No se encontraron prestaciones en esta categoría{searchQuery ? ` para "${searchQuery}"` : ""}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-2">
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
                      className={`p-2.5 rounded-lg border transition-all text-left flex flex-col justify-between cursor-pointer space-y-2 shadow-2xs select-none ${isSelectedInModal
                          ? "border-primary bg-primary/8 ring-1.5 ring-primary/40 shadow-xs"
                          : isAlreadyInCart
                            ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/70"
                            : "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/30"
                        }`}
                    >
                      <div className="space-y-1.5">
                        {/* CÓDIGO, TÍTULO Y BADGE */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="space-y-0.5 min-w-0 flex-1">
                            {s.codigo && (
                              <span className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase block leading-none">
                                {s.codigo}
                              </span>
                            )}
                            <p
                              className="font-bold text-[11.5px] text-foreground leading-tight line-clamp-2"
                              title={s.nombre}
                            >
                              {s.nombre}
                            </p>
                          </div>
                          {isSelectedInModal ? (
                            <Badge className="bg-primary text-primary-foreground border-0 text-[9px] shrink-0 font-bold px-1.5 py-0">
                              <Check className="size-2.5 mr-0.5" /> ELEGIDO
                            </Badge>
                          ) : isAlreadyInCart ? (
                            <Badge className="bg-emerald-600 text-white border-0 text-[9px] shrink-0 font-bold px-1.5 py-0">
                              ✓ En Carrito
                            </Badge>
                          ) : null}
                        </div>

                        {/* DESCRIPCIÓN OPCIONAL */}
                        {s.descripcion && (
                          <p className="text-[10px] text-muted-foreground line-clamp-1 leading-tight">
                            {s.descripcion}
                          </p>
                        )}

                        {/* ASIGNACIÓN DE MÉDICO */}
                        {isSelectedInModal && medicos.length > 0 ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-0.5 space-y-0.5"
                          >
                            <label className="text-[9.5px] font-bold text-primary flex items-center gap-1">
                              🩺 Médico Responsable:
                            </label>
                            <select
                              value={selectedData?.medicoId ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleSelectMedico(s.id, val ? Number(val) : undefined);
                              }}
                              className="w-full h-6 text-[10.5px] font-medium rounded-md bg-background border border-primary/40 px-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
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
                          <div className="flex items-center gap-1 text-[9.5px] text-muted-foreground font-medium bg-muted/40 px-1.5 py-0.5 rounded border border-border/50">
                            <span className="shrink-0 text-primary">🩺</span>
                            <span
                              className="truncate"
                              title={medicos.map((m) => m.nombreMedico).join(", ")}
                            >
                              {medicos.length === 1
                                ? medicos[0].nombreMedico
                                : `${medicos.length} médicos disponibles`}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* FOOTER DE LA TARJETA: PRECIO Y CONTROLES */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-border/40 w-full">
                        <span className="text-xs font-bold text-primary">
                          Bs. {price.toFixed(2)}
                        </span>

                        {isSelectedInModal ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-0.5 bg-background border border-primary/40 rounded-md p-0.5"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleUpdateQuantity(s.id, -1, e)}
                              className="size-5 rounded hover:bg-muted flex items-center justify-center text-foreground font-bold"
                            >
                              <Minus className="size-2.5" />
                            </button>
                            <span className="text-[11px] font-bold text-primary px-1">
                              {selectedData?.cantidad || 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleUpdateQuantity(s.id, 1, e)}
                              className="size-5 rounded hover:bg-muted flex items-center justify-center text-foreground font-bold"
                            >
                              <Plus className="size-2.5" />
                            </button>
                          </div>
                        ) : isAlreadyInCart ? (
                          <span className="text-[9.5px] font-bold text-emerald-600">
                            + Sumar Fila
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-primary">
                            + Elegir
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

        {/* FOOTER COMPACTO */}
        <div className="shrink-0 px-4 py-2 bg-muted/40 border-t border-border/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground text-[11px]">
              Seleccionadas:{" "}
              <strong className="text-foreground text-xs font-bold">
                {totalSelectedCount}
              </strong>
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground text-[11px]">
              Total:{" "}
              <strong className="text-primary text-sm font-extrabold">
                Bs. {totalSelectedPrice.toFixed(2)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-7.5 px-3 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={selectedItemsArray.length === 0}
              className="h-7.5 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-xs"
            >
              <Plus className="size-3.5" />
              Añadir ({totalSelectedCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
