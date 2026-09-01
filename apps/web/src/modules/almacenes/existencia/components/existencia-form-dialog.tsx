"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Boxes,
  Loader2,
  Warehouse,
  Package,
  Tag,
  Calculator,
  Search,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  existenciaSchema,
  type ExistenciaFormValues,
} from "../schemas/existencia.schema";
import {
  useCreateExistencia,
  useUpdateExistencia,
} from "../hooks/use-existencia";
import type { ExistenciaResponse } from "../types/existencia.types";
import type { AlmacenResponse } from "../../almacen/types/almacen.types";
import type { ProductoResponse } from "../../producto/types/producto.types";
import type { LoteResponse } from "../../lote/types/lote.types";

interface ExistenciaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existenciaToEdit?: ExistenciaResponse | null;
  almacenes?: AlmacenResponse[];
  productos?: ProductoResponse[];
  lotes?: LoteResponse[];
  onSuccessCallback?: () => void;
}

export function ExistenciaFormDialog({
  open,
  onOpenChange,
  existenciaToEdit,
  almacenes = [],
  productos = [],
  lotes = [],
  onSuccessCallback,
}: ExistenciaFormDialogProps) {
  const isEditing = Boolean(existenciaToEdit);

  const createMutation = useCreateExistencia();
  const updateMutation = useUpdateExistencia();

  // Autocomplete search states and popover open states
  const [openAlmacenCombobox, setOpenAlmacenCombobox] = React.useState(false);
  const [searchAlmacen, setSearchAlmacen] = React.useState("");

  const [openProductoCombobox, setOpenProductoCombobox] = React.useState(false);
  const [searchProducto, setSearchProducto] = React.useState("");

  const [openLoteCombobox, setOpenLoteCombobox] = React.useState(false);
  const [searchLote, setSearchLote] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExistenciaFormValues>({
    resolver: zodResolver(existenciaSchema),
    defaultValues: {
      almacenId: 0,
      productoId: 0,
      loteId: null,
      cantidad: 0,
      cantidadReservada: 0,
    },
  });

  const selectedAlmacenId = watch("almacenId");
  const selectedProductoId = watch("productoId");
  const selectedLoteId = watch("loteId");

  const selectedAlmacen = React.useMemo(
    () => almacenes.find((a) => a.id === selectedAlmacenId),
    [almacenes, selectedAlmacenId]
  );

  const selectedProducto = React.useMemo(
    () => productos.find((p) => p.id === selectedProductoId),
    [productos, selectedProductoId]
  );

  // Filter lotes by the selected product if applicable
  const availableLotes = React.useMemo(() => {
    if (!selectedProductoId) return lotes;
    const filtered = lotes.filter((l) => l.productoId === selectedProductoId);
    return filtered.length > 0 ? filtered : lotes;
  }, [lotes, selectedProductoId]);

  const selectedLote = React.useMemo(
    () => lotes.find((l) => l.id === selectedLoteId),
    [lotes, selectedLoteId]
  );

  // Filtered lists based on search query
  const filteredAlmacenes = React.useMemo(() => {
    if (!searchAlmacen.trim()) return almacenes;
    const q = searchAlmacen.toLowerCase().trim();
    return almacenes.filter(
      (a) =>
        a.nombre.toLowerCase().includes(q) ||
        (a.codigo && a.codigo.toLowerCase().includes(q))
    );
  }, [almacenes, searchAlmacen]);

  const filteredProductos = React.useMemo(() => {
    if (!searchProducto.trim()) return productos;
    const q = searchProducto.toLowerCase().trim();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.codigo && p.codigo.toLowerCase().includes(q))
    );
  }, [productos, searchProducto]);

  const filteredLotes = React.useMemo(() => {
    if (!searchLote.trim()) return availableLotes;
    const q = searchLote.toLowerCase().trim();
    return availableLotes.filter(
      (l) =>
        (l.numeroLote && l.numeroLote.toLowerCase().includes(q)) ||
        l.id.toString().includes(q)
    );
  }, [availableLotes, searchLote]);

  const watchedCantidad = watch("cantidad") || 0;
  const watchedReservada = watch("cantidadReservada") || 0;
  const calculatedDisponible = Math.max(0, watchedCantidad - watchedReservada);

  React.useEffect(() => {
    if (open) {
      setSearchAlmacen("");
      setSearchProducto("");
      setSearchLote("");
      if (existenciaToEdit) {
        reset({
          almacenId: existenciaToEdit.almacenId,
          productoId: existenciaToEdit.productoId,
          loteId: existenciaToEdit.loteId || null,
          cantidad: existenciaToEdit.cantidad,
          cantidadReservada: existenciaToEdit.cantidadReservada,
        });
      } else {
        reset({
          almacenId: almacenes[0]?.id || 0,
          productoId: productos[0]?.id || 0,
          loteId: null,
          cantidad: 0,
          cantidadReservada: 0,
        });
      }
    }
  }, [open, existenciaToEdit, reset, almacenes, productos]);

  const onSubmit = async (values: ExistenciaFormValues) => {
    try {
      if (isEditing && existenciaToEdit) {
        await updateMutation.mutateAsync({
          id: existenciaToEdit.id,
          data: {
            almacenId: Number(values.almacenId),
            productoId: Number(values.productoId),
            loteId: values.loteId ? Number(values.loteId) : null,
            cantidad: Number(values.cantidad),
            cantidadReservada: Number(values.cantidadReservada),
          },
        });
        toast.success("Existencia actualizada correctamente.");
      } else {
        await createMutation.mutateAsync({
          almacenId: Number(values.almacenId),
          productoId: Number(values.productoId),
          loteId: values.loteId ? Number(values.loteId) : null,
          cantidad: Number(values.cantidad),
          cantidadReservada: Number(values.cantidadReservada),
        });
        toast.success("Existencia registrada exitosamente.");
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar la existencia.";
      toast.error(errorMsg);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Boxes className="size-5" />
            </div>
            <span>
              {isEditing ? "Modificar Existencia" : "Registrar Nueva Existencia"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Ajuste las cantidades de stock físico y reservado para este registro."
              : "Asocie un producto a un almacén e inicialice sus existencias."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Warehouse & Product Selection */}
          <div className="space-y-3">
            {/* Almacén Autocomplete */}
            <div className="space-y-1.5">
              <Label
                htmlFor="almacenId"
                className="text-xs font-medium text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Warehouse className="size-3.5 text-primary" />
                  <span>Almacén de Destino</span>
                </span>
                <span className="text-destructive">*</span>
              </Label>

              <Popover
                open={openAlmacenCombobox}
                onOpenChange={setOpenAlmacenCombobox}
              >
                <PopoverTrigger
                  type="button"
                  role="combobox"
                  aria-expanded={openAlmacenCombobox}
                  disabled={isLoading || isEditing}
                  className={cn(
                    "w-full h-8 px-2.5 flex items-center justify-between text-xs rounded-md border border-border/60 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-left transition-colors",
                    !selectedAlmacen && "text-muted-foreground",
                    errors.almacenId &&
                      "border-destructive focus:ring-destructive",
                    isEditing && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {selectedAlmacen ? (
                      <>
                        <span className="font-medium text-foreground truncate">
                          {selectedAlmacen.nombre}
                        </span>
                        {selectedAlmacen.codigo && (
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                            {selectedAlmacen.codigo}
                          </span>
                        )}
                      </>
                    ) : (
                      <span>Seleccionar almacén...</span>
                    )}
                  </div>
                  <ChevronsUpDown className="size-3.5 opacity-50 shrink-0 ml-1" />
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-80 p-1.5 flex flex-col rounded-xl shadow-lg border-border/80"
                >
                  <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50 mb-1">
                    <Search className="size-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={searchAlmacen}
                      onChange={(e) => setSearchAlmacen(e.target.value)}
                      placeholder="Buscar por nombre o código..."
                      className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
                      autoFocus
                    />
                    {searchAlmacen && (
                      <button
                        type="button"
                        onClick={() => setSearchAlmacen("")}
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-52 space-y-0.5 pr-0.5 scrollbar-thin">
                    {filteredAlmacenes.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No se encontraron almacenes
                      </div>
                    ) : (
                      filteredAlmacenes.map((alm) => {
                        const isSelected = selectedAlmacenId === alm.id;
                        return (
                          <button
                            key={alm.id}
                            type="button"
                            onClick={() => {
                              setValue("almacenId", alm.id, {
                                shouldValidate: true,
                              });
                              setOpenAlmacenCombobox(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer",
                              isSelected
                                ? "bg-primary text-primary-foreground font-medium"
                                : "hover:bg-accent text-foreground"
                            )}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="truncate">{alm.nombre}</span>
                              {alm.ubicacion && (
                                <span
                                  className={cn(
                                    "text-[10px] truncate",
                                    isSelected
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {alm.ubicacion}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {alm.codigo && (
                                <span
                                  className={cn(
                                    "font-mono text-[10px] px-1.5 py-0.5 rounded",
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {alm.codigo}
                                </span>
                              )}
                              {isSelected && <Check className="size-3.5" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {errors.almacenId && (
                <p className="text-destructive text-[11px]">
                  {errors.almacenId.message}
                </p>
              )}
            </div>

            {/* Producto Autocomplete */}
            <div className="space-y-1.5">
              <Label
                htmlFor="productoId"
                className="text-xs font-medium text-foreground flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Package className="size-3.5 text-primary" />
                  <span>Producto</span>
                </span>
                <span className="text-destructive">*</span>
              </Label>

              <Popover
                open={openProductoCombobox}
                onOpenChange={setOpenProductoCombobox}
              >
                <PopoverTrigger
                  type="button"
                  role="combobox"
                  aria-expanded={openProductoCombobox}
                  disabled={isLoading || isEditing}
                  className={cn(
                    "w-full h-8 px-2.5 flex items-center justify-between text-xs rounded-md border border-border/60 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-left transition-colors",
                    !selectedProducto && "text-muted-foreground",
                    errors.productoId &&
                      "border-destructive focus:ring-destructive",
                    isEditing && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {selectedProducto ? (
                      <>
                        <span className="font-medium text-foreground truncate">
                          {selectedProducto.nombre}
                        </span>
                        {selectedProducto.codigo && (
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                            {selectedProducto.codigo}
                          </span>
                        )}
                      </>
                    ) : (
                      <span>Seleccionar producto...</span>
                    )}
                  </div>
                  <ChevronsUpDown className="size-3.5 opacity-50 shrink-0 ml-1" />
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-80 sm:w-96 p-1.5 flex flex-col rounded-xl shadow-lg border-border/80"
                >
                  <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50 mb-1">
                    <Search className="size-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={searchProducto}
                      onChange={(e) => setSearchProducto(e.target.value)}
                      placeholder="Buscar por nombre o código..."
                      className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
                      autoFocus
                    />
                    {searchProducto && (
                      <button
                        type="button"
                        onClick={() => setSearchProducto("")}
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-52 space-y-0.5 pr-0.5 scrollbar-thin">
                    {filteredProductos.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No se encontraron productos
                      </div>
                    ) : (
                      filteredProductos.map((prod) => {
                        const isSelected = selectedProductoId === prod.id;
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              setValue("productoId", prod.id, {
                                shouldValidate: true,
                              });
                              setOpenProductoCombobox(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer",
                              isSelected
                                ? "bg-primary text-primary-foreground font-medium"
                                : "hover:bg-accent text-foreground"
                            )}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="truncate">{prod.nombre}</span>
                              {prod.categoriaProductoNombre && (
                                <span
                                  className={cn(
                                    "text-[10px] truncate",
                                    isSelected
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {prod.categoriaProductoNombre}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {prod.codigo && (
                                <span
                                  className={cn(
                                    "font-mono text-[10px] px-1.5 py-0.5 rounded",
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {prod.codigo}
                                </span>
                              )}
                              {isSelected && <Check className="size-3.5" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {errors.productoId && (
                <p className="text-destructive text-[11px]">
                  {errors.productoId.message}
                </p>
              )}
            </div>

            {/* Lote (Opcional) Autocomplete */}
            <div className="space-y-1.5">
              <Label
                htmlFor="loteId"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <Tag className="size-3.5 text-muted-foreground" />
                <span>Lote (Opcional)</span>
              </Label>

              <Popover open={openLoteCombobox} onOpenChange={setOpenLoteCombobox}>
                <PopoverTrigger
                  type="button"
                  role="combobox"
                  aria-expanded={openLoteCombobox}
                  disabled={isLoading}
                  className={cn(
                    "w-full h-8 px-2.5 flex items-center justify-between text-xs rounded-md border border-border/60 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-left transition-colors",
                    !selectedLote && "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {selectedLote ? (
                      <>
                        <span className="font-medium text-foreground truncate">
                          Lote: {selectedLote.numeroLote || selectedLote.id}
                        </span>
                        {selectedLote.fechaVencimiento && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            (Vence: {selectedLote.fechaVencimiento.slice(0, 10)})
                          </span>
                        )}
                      </>
                    ) : (
                      <span>Sin lote específico</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedLote && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue("loteId", null, { shouldValidate: true });
                        }}
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                      >
                        <X className="size-3" />
                      </span>
                    )}
                    <ChevronsUpDown className="size-3.5 opacity-50 shrink-0" />
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-80 p-1.5 flex flex-col rounded-xl shadow-lg border-border/80"
                >
                  <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50 mb-1">
                    <Search className="size-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={searchLote}
                      onChange={(e) => setSearchLote(e.target.value)}
                      placeholder="Buscar lote..."
                      className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
                      autoFocus
                    />
                    {searchLote && (
                      <button
                        type="button"
                        onClick={() => setSearchLote("")}
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-52 space-y-0.5 pr-0.5 scrollbar-thin">
                    <button
                      type="button"
                      onClick={() => {
                        setValue("loteId", null, { shouldValidate: true });
                        setOpenLoteCombobox(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer",
                        selectedLoteId === null || selectedLoteId === undefined
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <span>Sin lote específico</span>
                      {(selectedLoteId === null ||
                        selectedLoteId === undefined) && (
                        <Check className="size-3.5" />
                      )}
                    </button>

                    {filteredLotes.map((lote) => {
                      const isSelected = selectedLoteId === lote.id;
                      return (
                        <button
                          key={lote.id}
                          type="button"
                          onClick={() => {
                            setValue("loteId", lote.id, {
                              shouldValidate: true,
                            });
                            setOpenLoteCombobox(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-accent text-foreground"
                          )}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="truncate">
                              Lote: {lote.numeroLote || lote.id}
                            </span>
                            {lote.fechaVencimiento && (
                              <span
                                className={cn(
                                  "text-[10px] truncate",
                                  isSelected
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                                )}
                              >
                                Vencimiento:{" "}
                                {lote.fechaVencimiento.slice(0, 10)}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="size-3.5 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Quantities Section */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calculator className="size-3.5 text-primary" />
                <span>Control de Cantidades</span>
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-muted-foreground">Disponible Calculado:</span>
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 px-1.5 py-0"
                >
                  {calculatedDisponible.toLocaleString()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Cantidad Total */}
              <div className="space-y-1">
                <Label
                  htmlFor="cantidad"
                  className="text-xs font-medium text-foreground flex items-center justify-between"
                >
                  <span>Cantidad Físico</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0.00"
                  {...register("cantidad", { valueAsNumber: true })}
                  disabled={isLoading}
                  className={cn(
                    "font-mono text-xs h-8 bg-background border-border/60",
                    errors.cantidad && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.cantidad && (
                  <p className="text-destructive text-[10px]">
                    {errors.cantidad.message}
                  </p>
                )}
              </div>

              {/* Cantidad Reservada */}
              <div className="space-y-1">
                <Label
                  htmlFor="cantidadReservada"
                  className="text-xs font-medium text-foreground flex items-center justify-between"
                >
                  <span>Cantidad Reservada</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cantidadReservada"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0.00"
                  {...register("cantidadReservada", { valueAsNumber: true })}
                  disabled={isLoading}
                  className={cn(
                    "font-mono text-xs h-8 bg-background border-border/60",
                    errors.cantidadReservada && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.cantidadReservada && (
                  <p className="text-destructive text-[10px]">
                    {errors.cantidadReservada.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Actualizar Stock" : "Registrar Stock"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
