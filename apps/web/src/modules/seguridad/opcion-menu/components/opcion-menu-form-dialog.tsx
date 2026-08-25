"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FolderTree,
  Link as LinkIcon,
  Search,
  Sparkles,
  Layers,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateOpcionMenu,
  useUpdateOpcionMenu,
} from "../hooks/use-opcion-menu";
import {
  opcionMenuSchema,
  type OpcionMenuFormValues,
} from "../schemas/opcion-menu.schema";
import {
  MenuIcon,
  POPULAR_MENU_ICONS,
} from "./opcion-menu-icon-helper";
import type {
  OpcionMenuResponse,
  OpcionMenuTreeResponse,
} from "../types/opcion-menu.types";

interface OpcionMenuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opcionToEdit?: OpcionMenuResponse | OpcionMenuTreeResponse | null;
  defaultParentId?: number | null;
  allOptions?: OpcionMenuResponse[];
}

export function OpcionMenuFormDialog({
  open,
  onOpenChange,
  opcionToEdit,
  defaultParentId,
  allOptions = [],
}: OpcionMenuFormDialogProps) {
  const isEditing = Boolean(opcionToEdit);
  const [iconSearch, setIconSearch] = React.useState("");

  const createMutation = useCreateOpcionMenu();
  const updateMutation = useUpdateOpcionMenu();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OpcionMenuFormValues>({
    resolver: zodResolver(opcionMenuSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      ruta: "",
      icono: "Shield",
      padreId: null,
      orden: 0,
    },
  });

  const selectedIcon = watch("icono");
  const currentNombre = watch("nombre");
  const currentRuta = watch("ruta");
  const currentCodigo = watch("codigo");
  const currentPadreId = watch("padreId");

  // Filter out self when editing
  const availableParents = React.useMemo(() => {
    return allOptions.filter((opt) => {
      if (isEditing && opcionToEdit && opt.id === opcionToEdit.id) {
        return false;
      }
      return true;
    });
  }, [allOptions, isEditing, opcionToEdit]);

  // Filter popular icons by search term
  const filteredIcons = React.useMemo(() => {
    if (!iconSearch.trim()) return POPULAR_MENU_ICONS;
    const term = iconSearch.toLowerCase();
    return POPULAR_MENU_ICONS.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.label.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
  }, [iconSearch]);

  // Reset form on open/change
  React.useEffect(() => {
    if (open) {
      if (opcionToEdit) {
        setValue("codigo", opcionToEdit.codigo || "");
        setValue("nombre", opcionToEdit.nombre || "");
        setValue("ruta", opcionToEdit.ruta || "");
        setValue("icono", opcionToEdit.icono || "Shield");
        setValue(
          "padreId",
          "padreId" in opcionToEdit ? opcionToEdit.padreId ?? null : null
        );
        setValue("orden", opcionToEdit.orden ?? 0);
      } else {
        reset({
          codigo: "",
          nombre: "",
          ruta: "",
          icono: "Folder",
          padreId: defaultParentId ?? null,
          orden: 0,
        });
      }
      setIconSearch("");
    }
  }, [open, opcionToEdit, defaultParentId, setValue, reset]);

  const onSubmit = async (values: OpcionMenuFormValues) => {
    try {
      const payload = {
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        ruta: values.ruta?.trim() || null,
        icono: values.icono?.trim() || null,
        padreId: values.padreId ? Number(values.padreId) : null,
        orden: Number(values.orden) || 0,
      };

      if (isEditing && opcionToEdit) {
        await updateMutation.mutateAsync({
          id: opcionToEdit.id,
          data: payload,
        });
        toast.success("Opción de menú actualizada con éxito");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Opción de menú creada con éxito");
      }

      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Ocurrió un error al guardar la opción de menú.";
      toast.error(errorMessage);
    }
  };

  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border border-border/80 shadow-2xl bg-card">
        {/* Header */}
        <DialogHeader className="p-5 bg-gradient-to-r from-card via-card to-primary/5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <FolderTree className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditing ? "Editar Opción de Menú" : "Nueva Opción de Menú"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Actualiza la configuración, jerarquía o icono del elemento."
                  : "Configura un nuevo módulo principal o submenú de navegación."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Código del Menú *</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  MAYÚSCULAS
                </span>
              </Label>
              <Input
                {...register("codigo")}
                placeholder="EJ: SEG_OPCIONES"
                className="h-8.5 text-xs font-mono uppercase bg-background"
              />
              {errors.codigo && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.codigo.message}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Nombre de la Opción *
              </Label>
              <Input
                {...register("nombre")}
                placeholder="EJ: Opciones de Menú"
                className="h-8.5 text-xs bg-background"
              />
              {errors.nombre && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.nombre.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Padre ID */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Menú Padre (Jerarquía)
              </Label>
              <Select
                value={currentPadreId ? String(currentPadreId) : "root"}
                onValueChange={(val) => {
                  setValue(
                    "padreId",
                    val === "root" || !val ? null : Number(val)
                  );
                }}
              >
                <SelectTrigger className="h-8.5 text-xs bg-background cursor-pointer">
                  <SelectValue placeholder="Seleccionar menú padre..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <SelectItem
                    value="root"
                    className="font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    -- Módulo Principal / Raíz (Sin Padre) --
                  </SelectItem>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={String(parent.id)}>
                      {parent.padreId
                        ? `└─ ${parent.nombre}`
                        : `📁 ${parent.nombre}`}{" "}
                      ({parent.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.padreId && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.padreId.message}
                </p>
              )}
            </div>

            {/* Orden */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Orden de Despliegue
              </Label>
              <Input
                type="number"
                min={0}
                {...register("orden", { valueAsNumber: true })}
                className="h-8.5 text-xs font-mono bg-background"
              />
              {errors.orden && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.orden.message}
                </p>
              )}
            </div>
          </div>

          {/* Ruta */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>Ruta en la Aplicación (Opcional)</span>
              <span className="text-[10px] text-muted-foreground">
                Dejar vacío si es solo contenedor
              </span>
            </Label>
            <div className="relative">
              <LinkIcon className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...register("ruta")}
                placeholder="EJ: /seguridad/opciones-menu"
                className="h-8.5 pl-8 text-xs font-mono bg-background"
              />
            </div>
            {errors.ruta && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.ruta.message}
              </p>
            )}
          </div>

          {/* Icon Picker */}
          <div className="space-y-2 pt-1 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>Selector de Icono</span>
              </Label>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[10px] text-muted-foreground">
                  Seleccionado:
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono gap-1 px-1.5 py-0 bg-background"
                >
                  <MenuIcon
                    name={selectedIcon}
                    className="size-3 text-primary"
                  />
                  <span>{selectedIcon || "Ninguno"}</span>
                </Badge>
              </div>
            </div>

            {/* Search filter for icons */}
            <div className="relative">
              <Search className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar icono por nombre o categoría..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="h-7.5 pl-7 text-[11px] bg-background"
              />
            </div>

            {/* Grid of icons */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-muted/20 border border-border/50 rounded-lg">
              {filteredIcons.map((item) => {
                const isSelected = selectedIcon === item.name;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setValue("icono", item.name)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/30"
                        : "bg-background border-border/60 hover:bg-accent hover:text-accent-foreground"
                    }`}
                    title={`${item.label} (${item.name})`}
                  >
                    <IconComponent className="size-4" />
                    <span className="text-[8px] truncate max-w-full mt-1">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-muted/30 border border-border/60 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Layers className="size-3 text-primary" />
                Previsualización en Barra Lateral
              </span>
              <span className="text-[9px] text-muted-foreground font-mono">
                Simulación UI
              </span>
            </div>

            <div className="bg-card border border-border/80 rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                  <MenuIcon name={selectedIcon} className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {currentNombre || "Nombre del menú"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {currentRuta || "Sin enlace directo"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {currentCodigo && (
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono px-1 py-0"
                  >
                    {currentCodigo.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <DialogFooter className="pt-3 border-t border-border/50 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer font-semibold"
            >
              {isSaving
                ? "Guardando..."
                : isEditing
                ? "Guardar Cambios"
                : "Crear Menú"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
