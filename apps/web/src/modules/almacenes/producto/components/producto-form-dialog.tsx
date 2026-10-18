"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Boxes,
  Building2,
  Check,
  ChevronsUpDown,
  FolderTree,
  Loader2,
  Scale,
  Search,
  Tag,
  X,
  Plus,
  Trash2,
  FileSpreadsheet,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { productoSchema, type ProductoFormValues } from "../schemas/producto.schema";
import { useCreateProducto, useUpdateProducto } from "../hooks/use-producto";
import { useCategoriasProducto } from "../../categoria-producto/hooks/use-categoria-producto";
import { useUnidadesMedida } from "@/modules/parametros/unidad-medida/hooks/use-unidades-medida";
import type { CategoriaProductoResponse } from "../../categoria-producto/types/categoria-producto.types";
import type { UnidadMedidaResponse } from "@/modules/parametros/unidad-medida/types/unidad-medida.types";
import { MarcaAutocomplete } from "@/modules/almacenes/marca";
import { ProveedorAutocomplete } from "@/modules/compras/proveedor";
import type { ProductoResponse } from "../types/producto.types";

interface ProductoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productoToEdit?: ProductoResponse | null;
  onSuccessCallback?: () => void;
}

interface MultiProductoRow {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoriaProductoId: number;
  unidadMedidaId: number;
  stockMinimo: number;
  stockMaximo: number | null;
  controlaVencimiento: boolean;
  error?: string;
}

// ============================================================================
// Helper Subcomponents: Categoria and Unidad Medida Comboboxes
// ============================================================================

interface CategoriaSelectComboboxProps {
  value: number;
  onValueChange: (val: number) => void;
  categorias: CategoriaProductoResponse[];
  error?: boolean;
}

function CategoriaSelectCombobox({
  value,
  onValueChange,
  categorias,
  error,
}: Readonly<CategoriaSelectComboboxProps>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedCategoria = React.useMemo(() => {
    return categorias.find((c) => c.id === value) || null;
  }, [categorias, value]);

  const filteredCategorias = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categorias;
    return categorias.filter((c) => {
      const matchName = c.nombre.toLowerCase().includes(query);
      const matchCode = c.codigo.toLowerCase().includes(query);
      const matchParent = c.categoriaPadreNombre?.toLowerCase().includes(query) ?? false;
      return matchName || matchCode || matchParent;
    });
  }, [categorias, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full h-9 px-3 flex items-center justify-between text-xs bg-background border border-border/80 hover:border-primary/60 rounded-md shadow-2xs transition-colors cursor-pointer text-left",
          !selectedCategoria && "text-muted-foreground",
          error && "border-destructive ring-1 ring-destructive/40"
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
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
              const isSelected = value === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onValueChange(cat.id);
                    setOpen(false);
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
  );
}

interface UnidadMedidaSelectComboboxProps {
  value: number;
  onValueChange: (val: number) => void;
  unidades: UnidadMedidaResponse[];
  error?: boolean;
}

function UnidadMedidaSelectCombobox({
  value,
  onValueChange,
  unidades,
  error,
}: Readonly<UnidadMedidaSelectComboboxProps>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedUnidad = React.useMemo(() => {
    return unidades.find((u) => u.id === value) || null;
  }, [unidades, value]);

  const filteredUnidades = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return unidades;
    return unidades.filter((u) => {
      const matchName = u.nombre.toLowerCase().includes(query);
      const matchSimbolo = u.simbolo?.toLowerCase().includes(query) ?? false;
      const matchCodigo = u.codigo?.toLowerCase().includes(query) ?? false;
      return matchName || matchSimbolo || matchCodigo;
    });
  }, [unidades, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full h-9 px-3 flex items-center justify-between text-xs bg-background border border-border/80 hover:border-primary/60 rounded-md shadow-2xs transition-colors cursor-pointer text-left",
          !selectedUnidad && "text-muted-foreground",
          error && "border-destructive ring-1 ring-destructive/40"
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o símbolo..."
            className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
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
              const isSelected = value === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onValueChange(u.id);
                    setOpen(false);
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
  );
}

// ============================================================================
// Individual Product Form Component
// ============================================================================

interface ProductoIndividualFormProps {
  productoToEdit?: ProductoResponse | null;
  categorias: CategoriaProductoResponse[];
  unidades: UnidadMedidaResponse[];
  onSuccessCallback?: () => void;
  onClose: () => void;
}

function ProductoIndividualForm({
  productoToEdit,
  categorias,
  unidades,
  onSuccessCallback,
  onClose,
}: Readonly<ProductoIndividualFormProps>) {
  const isEditing = Boolean(productoToEdit);
  const [keepOpen, setKeepOpen] = React.useState(false);

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();

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
      marcaId: null,
      proveedorId: null,
      unidadMedidaId: 0,
      controlaVencimiento: false,
      stockMinimo: 0,
      stockMaximo: null,
    },
  });

  const selectedCategoriaId = watch("categoriaProductoId");
  const selectedMarcaId = watch("marcaId");
  const selectedProveedorId = watch("proveedorId");
  const selectedUnidadId = watch("unidadMedidaId");
  const controlaVencimiento = watch("controlaVencimiento");

  React.useEffect(() => {
    if (productoToEdit) {
      reset({
        codigo: productoToEdit.codigo,
        nombre: productoToEdit.nombre,
        descripcion: productoToEdit.descripcion || "",
        categoriaProductoId: productoToEdit.categoriaProductoId,
        marcaId: productoToEdit.marcaId ?? null,
        proveedorId: productoToEdit.proveedorId ?? null,
        unidadMedidaId: productoToEdit.unidadMedidaId,
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
        marcaId: null,
        proveedorId: null,
        unidadMedidaId: 0,
        controlaVencimiento: false,
        stockMinimo: 0,
        stockMaximo: null,
      });
    }
  }, [productoToEdit, reset]);

  const onSubmit = async (values: ProductoFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || null,
        categoriaProductoId: values.categoriaProductoId,
        marcaId: values.marcaId ? Number(values.marcaId) : null,
        proveedorId: values.proveedorId ? Number(values.proveedorId) : null,
        unidadMedidaId: values.unidadMedidaId,
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
        onSuccessCallback?.();
        onClose();
        return;
      }

      await createMutation.mutateAsync(payload);
      toast.success(`Producto ${values.codigo} creado correctamente.`);
      onSuccessCallback?.();

      if (keepOpen) {
        reset({
          codigo: "",
          nombre: "",
          descripcion: "",
          categoriaProductoId: values.categoriaProductoId,
          marcaId: values.marcaId ? Number(values.marcaId) : null,
          proveedorId: values.proveedorId ? Number(values.proveedorId) : null,
          unidadMedidaId: values.unidadMedidaId,
          controlaVencimiento: values.controlaVencimiento,
          stockMinimo: 0,
          stockMaximo: null,
        });
      } else {
        onClose();
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
        <span>Información del producto</span>
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

        {/* Categoría y Marca */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Tag className="size-3 text-primary" /> Categoría <span className="text-destructive">*</span>
            </Label>
            <CategoriaSelectCombobox
              value={selectedCategoriaId}
              onValueChange={(val) => setValue("categoriaProductoId", val, { shouldValidate: true })}
              categorias={categorias}
              error={Boolean(errors.categoriaProductoId)}
            />
            {errors.categoriaProductoId && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.categoriaProductoId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Tag className="size-3 text-primary" /> Marca <span className="text-[10px] text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <MarcaAutocomplete
              value={selectedMarcaId}
              onValueChange={(val) => setValue("marcaId", val, { shouldValidate: true })}
              error={Boolean(errors.marcaId)}
              className="h-9"
            />
            {errors.marcaId && (
              <p className="text-[11px] text-destructive font-medium">{errors.marcaId.message}</p>
            )}
          </div>
        </div>

        {/* Unidad de Medida y Proveedor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Scale className="size-3 text-primary" /> Unidad de Medida <span className="text-destructive">*</span>
            </Label>
            <UnidadMedidaSelectCombobox
              value={selectedUnidadId}
              onValueChange={(val) => setValue("unidadMedidaId", val, { shouldValidate: true })}
              unidades={unidades}
              error={Boolean(errors.unidadMedidaId)}
            />
            {errors.unidadMedidaId && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.unidadMedidaId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              <Building2 className="size-3 text-primary" /> Proveedor <span className="text-[10px] text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <ProveedorAutocomplete
              value={selectedProveedorId}
              onValueChange={(val) => setValue("proveedorId", val, { shouldValidate: true })}
              error={Boolean(errors.proveedorId)}
              className="h-9"
            />
            {errors.proveedorId && (
              <p className="text-[11px] text-destructive font-medium">{errors.proveedorId.message}</p>
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

        {/* Control de Vencimiento */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2.5">
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

      <DialogFooter className="pt-3 border-t flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="text-xs w-full sm:w-auto"
        >
          Cancelar
        </Button>

        {isEditing ? (
          <Button
            type="submit"
            disabled={isLoading}
            className="text-xs gap-1.5 w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            Guardar Cambios
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Button
              type="submit"
              variant="secondary"
              disabled={isLoading}
              onClick={() => setKeepOpen(true)}
              className="text-xs w-full sm:w-auto"
            >
              {isLoading && keepOpen && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
              Guardar y agregar otro
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => setKeepOpen(false)}
              className="text-xs gap-1.5 w-full sm:w-auto"
            >
              {isLoading && !keepOpen && <Loader2 className="size-3.5 animate-spin" />}
              Guardar y Cerrar
            </Button>
          </div>
        )}
      </DialogFooter>
    </form>
  );
}

// ============================================================================
// Bulk Multi-Product Form Helpers and Component
// ============================================================================

function createInitialBulkRows(
  defaults?: { categoriaId?: number; unidadId?: number; controlaVence?: boolean }
): MultiProductoRow[] {
  return [0, 1, 2].map(() => ({
    id: Math.random().toString(36).substring(2, 9),
    codigo: "",
    nombre: "",
    descripcion: "",
    categoriaProductoId: defaults?.categoriaId ?? 0,
    unidadMedidaId: defaults?.unidadId ?? 0,
    stockMinimo: 0,
    stockMaximo: null,
    controlaVencimiento: defaults?.controlaVence ?? false,
  }));
}

function validateBulkRow(row: MultiProductoRow): string | undefined {
  if (!row.codigo.trim() && !row.nombre.trim()) return undefined;
  if (!row.codigo.trim()) return "El código es obligatorio";
  if (!row.nombre.trim()) return "El nombre es obligatorio";
  if (!row.categoriaProductoId || row.categoriaProductoId <= 0) return "Seleccione una categoría";
  if (!row.unidadMedidaId || row.unidadMedidaId <= 0) return "Seleccione una unidad de medida";
  return undefined;
}

interface ProductoBulkFormProps {
  categorias: CategoriaProductoResponse[];
  unidades: UnidadMedidaResponse[];
  onSuccessCallback?: () => void;
  onClose: () => void;
}

function ProductoBulkForm({
  categorias,
  unidades,
  onSuccessCallback,
  onClose,
}: Readonly<ProductoBulkFormProps>) {
  const createMutation = useCreateProducto();
  const [defaultBulkCategoriaId, setDefaultBulkCategoriaId] = React.useState<number>(0);
  const [defaultBulkUnidadId, setDefaultBulkUnidadId] = React.useState<number>(0);
  const [defaultBulkControlaVence, setDefaultBulkControlaVence] = React.useState<boolean>(false);
  const [multiRows, setMultiRows] = React.useState<MultiProductoRow[]>(() => createInitialBulkRows());
  const [isSubmittingBulk, setIsSubmittingBulk] = React.useState(false);

  const applyDefaultsToAllRows = () => {
    setMultiRows((prev) =>
      prev.map((row) => ({
        ...row,
        categoriaProductoId: defaultBulkCategoriaId || row.categoriaProductoId,
        unidadMedidaId: defaultBulkUnidadId || row.unidadMedidaId,
        controlaVencimiento: defaultBulkControlaVence,
      }))
    );
    toast.info("Valores por defecto aplicados a todas las filas.");
  };

  const handleAddMultiRow = () => {
    setMultiRows((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        codigo: "",
        nombre: "",
        descripcion: "",
        categoriaProductoId: defaultBulkCategoriaId || 0,
        unidadMedidaId: defaultBulkUnidadId || 0,
        stockMinimo: 0,
        stockMaximo: null,
        controlaVencimiento: defaultBulkControlaVence,
      },
    ]);
  };

  const handleRemoveMultiRow = (id: string) => {
    if (multiRows.length <= 1) {
      toast.error("Debe existir al menos una fila.");
      return;
    }
    setMultiRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateMultiRow = <K extends keyof MultiProductoRow>(
    id: string,
    field: K,
    value: MultiProductoRow[K]
  ) => {
    setMultiRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value, error: undefined } : row))
    );
  };

  const onSubmitBulk = async () => {
    const validRows = multiRows.filter((r) => r.codigo.trim() !== "" || r.nombre.trim() !== "");
    if (validRows.length === 0) {
      toast.error("Ingrese los datos de al menos un producto.");
      return;
    }

    let hasErrors = false;
    const updatedRows = multiRows.map((r) => {
      const error = validateBulkRow(r);
      if (error) {
        hasErrors = true;
      }
      return { ...r, error };
    });

    if (hasErrors) {
      setMultiRows(updatedRows);
      toast.error("Por favor complete los campos obligatorios marcados en rojo.");
      return;
    }

    setIsSubmittingBulk(true);
    let successCount = 0;
    let failCount = 0;
    const errorsList: string[] = [];

    for (const row of validRows) {
      try {
        await createMutation.mutateAsync({
          codigo: row.codigo.trim(),
          nombre: row.nombre.trim(),
          descripcion: row.descripcion?.trim() || null,
          categoriaProductoId: row.categoriaProductoId,
          unidadMedidaId: row.unidadMedidaId,
          controlaVencimiento: row.controlaVencimiento,
          stockMinimo: row.stockMinimo || 0,
          stockMaximo: row.stockMaximo ?? null,
        });
        successCount++;
      } catch (err: unknown) {
        failCount++;
        const msg = getApiErrorMessage(err);
        errorsList.push(`${row.codigo}: ${msg}`);
      }
    }

    setIsSubmittingBulk(false);

    if (successCount > 0) {
      const label = successCount === 1 ? "producto registrado" : "productos registrados";
      toast.success(`${successCount} ${label} con éxito.`);
      onSuccessCallback?.();
    }

    if (failCount > 0) {
      toast.error(`${failCount} productos no pudieron registrarse: ${errorsList.slice(0, 2).join(", ")}`);
    } else {
      onClose();
    }
  };

  const isLoading = createMutation.isPending || isSubmittingBulk;
  const validProductsCount = multiRows.filter((r) => r.codigo.trim() || r.nombre.trim()).length;

  return (
    <div className="space-y-4">
      {/* Presets Toolbar for fast entry */}
      <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Tag className="size-3.5 text-primary" />
            <span>Valores por defecto rápidos (Opcional):</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={applyDefaultsToAllRows}
            className="h-7 text-[11px] px-2.5 cursor-pointer shadow-2xs hover:bg-primary/10 hover:text-primary"
          >
            Aplicar a todas las filas
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Default Categoria */}
          <div>
            <select
              value={defaultBulkCategoriaId}
              onChange={(e) => setDefaultBulkCategoriaId(Number(e.target.value))}
              className="w-full h-8 px-2 text-xs bg-background rounded-md border border-border/70 text-foreground"
            >
              <option value={0}>Seleccionar Categoría por defecto...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} — {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Default Unidad */}
          <div>
            <select
              value={defaultBulkUnidadId}
              onChange={(e) => setDefaultBulkUnidadId(Number(e.target.value))}
              className="w-full h-8 px-2 text-xs bg-background rounded-md border border-border/70 text-foreground"
            >
              <option value={0}>Seleccionar Unidad por defecto...</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.simbolo ? `(${u.simbolo})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Default Vence */}
          <div className="flex items-center gap-2 bg-background px-2.5 rounded-md border border-border/70 h-8">
            <Checkbox
              id="bulkVence"
              checked={defaultBulkControlaVence}
              onCheckedChange={(v) => setDefaultBulkControlaVence(Boolean(v))}
            />
            <label htmlFor="bulkVence" className="text-xs text-muted-foreground cursor-pointer select-none">
              Controla Vencimiento
            </label>
          </div>
        </div>
      </div>

      {/* Dynamic Table of Products */}
      <div className="border border-border/60 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[420px] scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs min-w-[920px]">
            <thead>
              <tr className="bg-muted/60 border-b border-border/60 text-muted-foreground font-semibold">
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5 w-32">Código *</th>
                <th className="p-2.5 min-w-[260px]">Nombre del Producto *</th>
                <th className="p-2.5 w-52">Categoría *</th>
                <th className="p-2.5 w-44">Unidad *</th>
                <th className="p-2.5 w-24 text-center">Stk Mín.</th>
                <th className="p-2.5 w-20 text-center">Vence</th>
                <th className="p-2.5 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {multiRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-muted/20 transition-colors",
                    row.error && "bg-destructive/5"
                  )}
                >
                  <td className="p-2 text-center text-muted-foreground font-mono text-[11px]">
                    {index + 1}
                  </td>

                  {/* Código */}
                  <td className="p-1.5">
                    <Input
                      value={row.codigo}
                      onChange={(e) => handleUpdateMultiRow(row.id, "codigo", e.target.value)}
                      placeholder="ej: MED-001"
                      className={cn(
                        "h-8.5 uppercase font-mono text-xs w-full",
                        row.error && !row.codigo.trim() && "border-destructive ring-1 ring-destructive/40"
                      )}
                    />
                  </td>

                  {/* Nombre */}
                  <td className="p-1.5">
                    <Input
                      value={row.nombre}
                      onChange={(e) => handleUpdateMultiRow(row.id, "nombre", e.target.value)}
                      placeholder="Nombre descriptivo del producto..."
                      className={cn(
                        "h-8.5 text-xs w-full",
                        row.error && !row.nombre.trim() && "border-destructive ring-1 ring-destructive/40"
                      )}
                    />
                    {row.error && (
                      <span className="text-[10px] text-destructive font-medium block mt-0.5">
                        {row.error}
                      </span>
                    )}
                  </td>

                  {/* Categoría */}
                  <td className="p-1.5">
                    <select
                      value={row.categoriaProductoId}
                      onChange={(e) =>
                        handleUpdateMultiRow(row.id, "categoriaProductoId", Number(e.target.value))
                      }
                      className={cn(
                        "w-full h-8.5 px-2 text-xs bg-background rounded-md border border-border/70 text-foreground cursor-pointer truncate",
                        row.error && !row.categoriaProductoId && "border-destructive ring-1 ring-destructive/40"
                      )}
                    >
                      <option value={0}>Seleccionar Categoría...</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.codigo} — {c.nombre}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Unidad */}
                  <td className="p-1.5">
                    <select
                      value={row.unidadMedidaId}
                      onChange={(e) =>
                        handleUpdateMultiRow(row.id, "unidadMedidaId", Number(e.target.value))
                      }
                      className={cn(
                        "w-full h-8.5 px-2 text-xs bg-background rounded-md border border-border/70 text-foreground cursor-pointer truncate",
                        row.error && !row.unidadMedidaId && "border-destructive ring-1 ring-destructive/40"
                      )}
                    >
                      <option value={0}>Seleccionar Unidad...</option>
                      {unidades.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre} {u.simbolo ? `(${u.simbolo})` : ""}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Stock Mínimo */}
                  <td className="p-1.5">
                    <Input
                      type="number"
                      min={0}
                      value={row.stockMinimo}
                      onChange={(e) =>
                        handleUpdateMultiRow(row.id, "stockMinimo", Number(e.target.value))
                      }
                      className="h-8.5 text-xs font-mono text-center w-full"
                    />
                  </td>

                  {/* Controla Vence */}
                  <td className="p-1.5 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={row.controlaVencimiento}
                        onCheckedChange={(v) =>
                          handleUpdateMultiRow(row.id, "controlaVencimiento", Boolean(v))
                        }
                      />
                    </div>
                  </td>

                  {/* Eliminar Fila */}
                  <td className="p-1.5 text-center">
                    <div className="flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMultiRow(row.id)}
                        className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Eliminar fila"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-2.5 bg-muted/20 border-t border-border/40 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMultiRow}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="size-3.5 text-primary" />
            <span>Añadir otra fila</span>
          </Button>

          <span className="text-xs text-muted-foreground">
            Total: <strong className="text-foreground">{multiRows.length}</strong> {multiRows.length === 1 ? "fila" : "filas"}
          </span>
        </div>
      </div>

      {/* Bulk Footer Actions */}
      <DialogFooter className="pt-3 border-t flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="text-xs w-full sm:w-auto"
        >
          Cancelar
        </Button>

        <Button
          type="button"
          onClick={onSubmitBulk}
          disabled={isLoading}
          className="text-xs gap-1.5 w-full sm:w-auto font-medium"
        >
          {isSubmittingBulk && <Loader2 className="size-3.5 animate-spin" />}
          <span>Guardar todos ({validProductsCount} productos)</span>
        </Button>
      </DialogFooter>
    </div>
  );
}

// ============================================================================
// Main Export: ProductoFormDialog
// ============================================================================

export function ProductoFormDialog({
  open,
  onOpenChange,
  productoToEdit,
  onSuccessCallback,
}: Readonly<ProductoFormDialogProps>) {
  const isEditing = Boolean(productoToEdit);
  const [activeTab, setActiveTab] = React.useState<string>("individual");

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setActiveTab("individual");
    }
    onOpenChange(newOpen);
  };

  const { data: categoriasData } = useCategoriasProducto({ pageSize: 500 });
  const categorias = categoriasData?.items ?? [];

  const { data: unidadesData } = useUnidadesMedida({ pageSize: 500 });
  const unidades = unidadesData?.items ?? [];

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "p-6 transition-all duration-200 overflow-y-auto max-h-[92vh]",
          activeTab === "bulk" && !isEditing
            ? "sm:max-w-[95vw] lg:max-w-6xl w-full"
            : "sm:max-w-xl"
        )}
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Boxes className="size-5" />
            </div>
            <span>{isEditing ? "Editar Producto" : "Catálogo de Productos"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modifique los datos y parámetros del producto seleccionado."
              : "Seleccione el modo individual o múltiple para dar de alta productos en el inventario."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <ProductoIndividualForm
            productoToEdit={productoToEdit}
            categorias={categorias}
            unidades={unidades}
            onSuccessCallback={onSuccessCallback}
            onClose={handleClose}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-1">
            <TabsList className="grid grid-cols-2 w-full max-w-xs h-8 p-0.5 bg-muted/60 border border-border/50">
              <TabsTrigger value="individual" className="text-xs py-1 cursor-pointer">
                Registro Individual
              </TabsTrigger>
              <TabsTrigger value="bulk" className="text-xs py-1 cursor-pointer gap-1.5">
                <FileSpreadsheet className="size-3.5 text-primary" />
                <span>Carga Múltiple</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-4">
              <ProductoIndividualForm
                categorias={categorias}
                unidades={unidades}
                onSuccessCallback={onSuccessCallback}
                onClose={handleClose}
              />
            </TabsContent>

            <TabsContent value="bulk" className="mt-4 space-y-4">
              <ProductoBulkForm
                categorias={categorias}
                unidades={unidades}
                onSuccessCallback={onSuccessCallback}
                onClose={handleClose}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
