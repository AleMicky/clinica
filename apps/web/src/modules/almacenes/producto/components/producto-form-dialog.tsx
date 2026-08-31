"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Boxes,
  Check,
  ChevronsUpDown,
  FolderTree,
  Loader2,
  Scale,
  Search,
  Tag,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { productoSchema, type ProductoFormValues } from "../schemas/producto.schema";
import { useCreateProducto, useUpdateProducto } from "../hooks/use-producto";
import { useCategoriasProducto } from "../../categoria-producto/hooks/use-categoria-producto";
import { useUnidadesMedida } from "@/modules/parametros/unidad-medida/hooks/use-unidades-medida";
import type { ProductoResponse } from "../types/producto.types";

interface ProductoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productoToEdit?: ProductoResponse | null;
  onSuccessCallback?: () => void;
}

export function ProductoFormDialog({
  open,
  onOpenChange,
  productoToEdit,
  onSuccessCallback,
}: ProductoFormDialogProps) {
  const isEditing = Boolean(productoToEdit);

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();

  // Categorías de producto
  const { data: categoriasData } = useCategoriasProducto({ pageSize: 500 });
  const categorias = categoriasData?.items ?? [];

  // Unidades de medida
  const { data: unidadesData } = useUnidadesMedida({ pageSize: 500 });
  const unidades = unidadesData?.items ?? [];

  // Combobox Popover states & search queries
  const [openCatCombobox, setOpenCatCombobox] = React.useState(false);
  const [searchCategoria, setSearchCategoria] = React.useState("");

  const [openUnidadCombobox, setOpenUnidadCombobox] = React.useState(false);
  const [searchUnidad, setSearchUnidad] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      categoriaProductoId: 0,
      unidadMedidaId: 0,
      controlaLote: false,
      controlaVencimiento: false,
      stockMinimo: 0,
      stockMaximo: null,
    },
  });

  const selectedCategoriaId = watch("categoriaProductoId");
  const selectedUnidadId = watch("unidadMedidaId");
  const controlaLote = watch("controlaLote");
  const controlaVencimiento = watch("controlaVencimiento");

  // Selected entities for label display
  const selectedCategoria = React.useMemo(() => {
    return categorias.find((c) => c.id === selectedCategoriaId) || null;
  }, [categorias, selectedCategoriaId]);

  const selectedUnidad = React.useMemo(() => {
    return unidades.find((u) => u.id === selectedUnidadId) || null;
  }, [unidades, selectedUnidadId]);

  // Filtered lists for Autocomplete
  const filteredCategorias = React.useMemo(() => {
    const query = searchCategoria.trim().toLowerCase();
    if (!query) return categorias;
    return categorias.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.codigo.toLowerCase().includes(query) ||
        (c.categoriaPadreNombre?.toLowerCase().includes(query) ?? false)
    );
  }, [categorias, searchCategoria]);

  const filteredUnidades = React.useMemo(() => {
    const query = searchUnidad.trim().toLowerCase();
    if (!query) return unidades;
    return unidades.filter(
      (u) =>
        u.nombre.toLowerCase().includes(query) ||
        (u.simbolo?.toLowerCase().includes(query) ?? false) ||
        (u.codigo?.toLowerCase().includes(query) ?? false)
    );
  }, [unidades, searchUnidad]);

  React.useEffect(() => {
    if (open) {
      setSearchCategoria("");
      setSearchUnidad("");
      setOpenCatCombobox(false);
      setOpenUnidadCombobox(false);

      if (productoToEdit) {
        reset({
          codigo: productoToEdit.codigo,
          nombre: productoToEdit.nombre,
          descripcion: productoToEdit.descripcion || "",
          categoriaProductoId: productoToEdit.categoriaProductoId,
          unidadMedidaId: productoToEdit.unidadMedidaId,
          controlaLote: productoToEdit.controlaLote,
          controlaVencimiento: productoToEdit.controlaVencimiento,
          stockMinimo: Number(productoToEdit.stockMinimo),
          stockMaximo:
            productoToEdit.stockMaximo !== null && productoToEdit.stockMaximo !== undefined
              ? Number(productoToEdit.stockMaximo)
              : null,
        });
      } else {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          categoriaProductoId: 0,
          unidadMedidaId: 0,
          controlaLote: false,
          controlaVencimiento: false,
          stockMinimo: 0,
          stockMaximo: null,
        });
      }
    }
  }, [open, productoToEdit, reset]);

  const onSubmit = async (values: ProductoFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || null,
        categoriaProductoId: values.categoriaProductoId,
        unidadMedidaId: values.unidadMedidaId,
        controlaLote: values.controlaLote,
        controlaVencimiento: values.controlaVencimiento,
        stockMinimo: values.stockMinimo,
        stockMaximo: values.stockMaximo ?? null,
      };

      if (isEditing && productoToEdit) {
        await updateMutation.mutateAsync({
          id: productoToEdit.id,
          data: payload,
        });
        toast.success(`Producto ${values.codigo} actualizado correctamente.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Producto ${values.codigo} creado correctamente.`);
      }
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Ocurrió un error al guardar el producto.";
      toast.error(errorMsg);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Boxes className="size-5" />
            </div>
            <span>{isEditing ? "Editar Producto" : "Nuevo Producto"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los datos y parámetros del producto seleccionado."
              : "Ingrese la información requerida para dar de alta un nuevo producto o insumo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <span>Información general</span>
            <span className="text-destructive font-medium">* Requeridos</span>
          </div>

          <div className="space-y-3.5">
            {/* Código y Nombre */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="codigo" className="text-xs flex items-center gap-1">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="ej: MED-001"
                  className={cn(
                    "uppercase font-mono text-xs h-9",
                    errors.codigo && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={Boolean(errors.codigo)}
                  {...register("codigo")}
                />
                {errors.codigo && (
                  <p className="text-[11px] text-destructive font-medium">{errors.codigo.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="nombre" className="text-xs flex items-center gap-1">
                  Nombre del Producto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="ej: Paracetamol 500mg Comprimidos"
                  className={cn(
                    "text-xs h-9",
                    errors.nombre && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={Boolean(errors.nombre)}
                  {...register("nombre")}
                />
                {errors.nombre && (
                  <p className="text-[11px] text-destructive font-medium">{errors.nombre.message}</p>
                )}
              </div>
            </div>

            {/* Categoría y Unidad de Medida con Autocomplete */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Categoría Autocomplete Combobox */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Tag className="size-3 text-primary" /> Categoría <span className="text-destructive">*</span>
                </Label>

                <Popover open={openCatCombobox} onOpenChange={setOpenCatCombobox}>
                  <PopoverTrigger
                    type="button"
                    role="combobox"
                    aria-expanded={openCatCombobox}
                    className={cn(
                      "w-full h-9 px-3 flex items-center justify-between text-xs bg-background border border-border/80 hover:border-primary/60 rounded-md shadow-2xs transition-colors cursor-pointer text-left",
                      !selectedCategoria && "text-muted-foreground",
                      errors.categoriaProductoId && "border-destructive ring-1 ring-destructive/40"
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {selectedCategoria ? (
                        <>
                          <span className="font-semibold text-foreground truncate">
                            {selectedCategoria.nombre}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded shrink-0">
                            {selectedCategoria.codigo}
                          </span>
                        </>
                      ) : (
                        <span>Buscar o seleccionar categoría...</span>
                      )}
                    </div>
                    <ChevronsUpDown className="size-3.5 opacity-50 shrink-0 ml-1" />
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    className="w-72 sm:w-80 p-1.5 flex flex-col rounded-xl shadow-lg border-border/80"
                  >
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50 mb-1">
                      <Search className="size-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={searchCategoria}
                        onChange={(e) => setSearchCategoria(e.target.value)}
                        placeholder="Buscar por nombre o código..."
                        className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
                        autoFocus
                      />
                      {searchCategoria && (
                        <button
                          type="button"
                          onClick={() => setSearchCategoria("")}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-52 space-y-0.5 pr-0.5 scrollbar-thin">
                      {filteredCategorias.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground space-y-1">
                          <FolderTree className="size-5 mx-auto opacity-40" />
                          <p className="font-medium text-foreground">No se encontraron categorías</p>
                          <p className="text-[10px]">Pruebe con otro término.</p>
                        </div>
                      ) : (
                        filteredCategorias.map((cat) => {
                          const isSelected = selectedCategoriaId === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setValue("categoriaProductoId", cat.id, { shouldValidate: true });
                                setOpenCatCombobox(false);
                              }}
                              className={cn(
                                "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer",
                                isSelected
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "hover:bg-accent/60 text-foreground"
                              )}
                            >
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.2 rounded shrink-0">
                                    {cat.codigo}
                                  </span>
                                  <span className="truncate font-medium">{cat.nombre}</span>
                                </div>
                                {cat.categoriaPadreNombre && (
                                  <span className="text-[10px] text-muted-foreground truncate pl-0.5 mt-0.5">
                                    En: {cat.categoriaPadreNombre}
                                  </span>
                                )}
                              </div>
                              {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {errors.categoriaProductoId && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.categoriaProductoId.message}
                  </p>
                )}
              </div>

              {/* Unidad de Medida Autocomplete Combobox */}
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Scale className="size-3 text-primary" /> Unidad de Medida <span className="text-destructive">*</span>
                </Label>

                <Popover open={openUnidadCombobox} onOpenChange={setOpenUnidadCombobox}>
                  <PopoverTrigger
                    type="button"
                    role="combobox"
                    aria-expanded={openUnidadCombobox}
                    className={cn(
                      "w-full h-9 px-3 flex items-center justify-between text-xs bg-background border border-border/80 hover:border-primary/60 rounded-md shadow-2xs transition-colors cursor-pointer text-left",
                      !selectedUnidad && "text-muted-foreground",
                      errors.unidadMedidaId && "border-destructive ring-1 ring-destructive/40"
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {selectedUnidad ? (
                        <>
                          <span className="font-semibold text-foreground truncate">
                            {selectedUnidad.nombre}
                          </span>
                          {selectedUnidad.simbolo && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono shrink-0">
                              {selectedUnidad.simbolo}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span>Buscar o seleccionar unidad...</span>
                      )}
                    </div>
                    <ChevronsUpDown className="size-3.5 opacity-50 shrink-0 ml-1" />
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    className="w-72 sm:w-80 p-1.5 flex flex-col rounded-xl shadow-lg border-border/80"
                  >
                    <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/50 mb-1">
                      <Search className="size-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={searchUnidad}
                        onChange={(e) => setSearchUnidad(e.target.value)}
                        placeholder="Buscar por nombre o símbolo..."
                        className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
                        autoFocus
                      />
                      {searchUnidad && (
                        <button
                          type="button"
                          onClick={() => setSearchUnidad("")}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-52 space-y-0.5 pr-0.5 scrollbar-thin">
                      {filteredUnidades.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground space-y-1">
                          <Scale className="size-5 mx-auto opacity-40" />
                          <p className="font-medium text-foreground">No se encontraron unidades</p>
                          <p className="text-[10px]">Pruebe con otro término.</p>
                        </div>
                      ) : (
                        filteredUnidades.map((u) => {
                          const isSelected = selectedUnidadId === u.id;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setValue("unidadMedidaId", u.id, { shouldValidate: true });
                                setOpenUnidadCombobox(false);
                              }}
                              className={cn(
                                "w-full text-left p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer",
                                isSelected
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "hover:bg-accent/60 text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-medium truncate">{u.nombre}</span>
                                {u.simbolo && (
                                  <Badge variant="outline" className="text-[10px] font-mono px-1 py-0 shrink-0">
                                    {u.simbolo}
                                  </Badge>
                                )}
                              </div>
                              {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {errors.unidadMedidaId && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.unidadMedidaId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Stocks Mínimo y Máximo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stockMinimo" className="text-xs flex items-center gap-1">
                  Stock Mínimo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  step="any"
                  placeholder="0"
                  className={cn(
                    "text-xs h-9 font-mono",
                    errors.stockMinimo && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("stockMinimo", { valueAsNumber: true })}
                />
                {errors.stockMinimo && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.stockMinimo.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stockMaximo" className="text-xs">
                  Stock Máximo (Opcional)
                </Label>
                <Input
                  id="stockMaximo"
                  type="number"
                  step="any"
                  placeholder="Sin límite"
                  className={cn(
                    "text-xs h-9 font-mono",
                    errors.stockMaximo && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("stockMaximo", {
                    setValueAs: (v) => (v === "" || isNaN(v) ? null : Number(v)),
                  })}
                />
                {errors.stockMaximo && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.stockMaximo.message}
                  </p>
                )}
              </div>
            </div>

            {/* Controles de Lote y Vencimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="controlaLote"
                  checked={controlaLote}
                  onCheckedChange={(val) => setValue("controlaLote", Boolean(val))}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="controlaLote" className="text-xs font-medium cursor-pointer">
                    Controla Lote
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Exige lote en compras y despachos</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:border-l sm:pl-3 border-border/40">
                <Checkbox
                  id="controlaVencimiento"
                  checked={controlaVencimiento}
                  onCheckedChange={(val) => setValue("controlaVencimiento", Boolean(val))}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="controlaVencimiento" className="text-xs font-medium cursor-pointer">
                    Controla Vencimiento
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Registra fecha de caducidad</p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-xs">
                Descripción / Observaciones
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Detalles adicionales, especificaciones técnicas o recomendaciones..."
                rows={3}
                className="text-xs resize-none"
                {...register("descripcion")}
              />
              {errors.descripcion && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.descripcion.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="text-xs gap-1.5">
              {isLoading && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
