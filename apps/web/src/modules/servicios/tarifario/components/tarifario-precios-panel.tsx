"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ListPlus,
  Loader2,
  Plus,
  Trash2,
  DollarSign,
  Inbox,
  Activity,
  Coins,
  Star,
  Search,
  Tag,
  RefreshCw,
} from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  tarifarioDetalleSchema,
  type TarifarioDetalleFormValues,
} from "../schemas/tarifario.schema";
import {
  useCreateTarifarioDetalle,
  useDeleteTarifarioDetalle,
  useTarifarioDetalles,
} from "../hooks/use-tarifario";
import { useCategoriasServicio, type CategoriaServicioResponse } from "../../categoria-servicio";
import { useServicios, type ServicioResponse } from "../../servicio";
import type { TarifarioDetalleResponse, TarifarioItem } from "../types/tarifario.types";

interface TarifarioPreciosPanelProps {
  selectedTarifario: TarifarioItem | null;
}

export function TarifarioPreciosPanel({
  selectedTarifario,
}: TarifarioPreciosPanelProps) {
  const tarifarioId = selectedTarifario?.id ?? 0;

  const { data: detallesData, isLoading: isLoadingDetalles, refetch } =
    useTarifarioDetalles(tarifarioId, Boolean(selectedTarifario && tarifarioId > 0));

  const createDetalleMutation = useCreateTarifarioDetalle();
  const deleteDetalleMutation = useDeleteTarifarioDetalle();

  // Categories & Services selection
  const { data: categoriesData } = useCategoriasServicio({ pageSize: 100 });
  const categorias = React.useMemo(() => categoriesData?.items ?? [], [categoriesData]);

  const [selectedCatId, setSelectedCatId] = React.useState<number>(0);

  React.useEffect(() => {
    if (categorias.length > 0 && selectedCatId === 0) {
      setSelectedCatId(categorias[0].id);
    }
  }, [categorias, selectedCatId]);

  const { data: serviciosData } = useServicios(selectedCatId, { pageSize: 100 }, selectedCatId > 0);
  const servicios = React.useMemo(() => serviciosData?.items ?? [], [serviciosData]);

  const [searchTerm, setSearchTerm] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TarifarioDetalleFormValues>({
    resolver: zodResolver(tarifarioDetalleSchema),
    defaultValues: {
      servicioId: 0,
      precio: 0,
    },
  });

  const selectedServicioId = watch("servicioId");

  const selectedCat = React.useMemo(
    () => categorias.find((c) => Number(c.id) === Number(selectedCatId)),
    [categorias, selectedCatId]
  );

  const selectedServicio = React.useMemo(
    () => servicios.find((s) => Number(s.id) === Number(selectedServicioId)),
    [servicios, selectedServicioId]
  );

  const onSubmitAddPrice = async (values: TarifarioDetalleFormValues) => {
    if (!tarifarioId) return;
    try {
      await createDetalleMutation.mutateAsync({
        tarifarioId,
        data: {
          servicioId: values.servicioId,
          precio: values.precio,
        },
      });
      toast.success("Precio asignado correctamente al servicio.");
      reset({ servicioId: 0, precio: 0 });
      refetch();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo guardar el precio.";
      toast.error(errorMsg);
    }
  };

  const handleDeleteDetalle = async (detalleId: number) => {
    if (!tarifarioId) return;
    try {
      await deleteDetalleMutation.mutateAsync({
        tarifarioId,
        detalleId,
      });
      toast.success("Precio eliminado del tarifario.");
      refetch();
    } catch {
      toast.error("No se pudo eliminar el precio.");
    }
  };

  const currencySymbol = selectedTarifario?.monedaSimbolo || selectedTarifario?.monedaCodigo || "$";

  const detalles = React.useMemo(() => {
    const items = detallesData?.items ?? [];
    if (!searchTerm.trim()) return items;
    const lower = searchTerm.toLowerCase().trim();
    return items.filter(
      (d: TarifarioDetalleResponse) =>
        d.servicioNombre?.toLowerCase().includes(lower) ||
        String(d.servicioId).includes(lower) ||
        String(d.precio).includes(lower)
    );
  }, [detallesData, searchTerm]);

  if (!selectedTarifario) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card border border-border/60 rounded-xl min-h-[420px] text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <Tag className="size-7 stroke-1.5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Seleccione un Tarifario</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Elija una lista de precios del panel izquierdo para ver, agregar o editar los precios de sus prestaciones clínicas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 bg-card border border-border/60 rounded-xl p-4 shadow-2xs">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/40">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ListPlus className="size-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Precios del Tarifario: <span className="font-mono text-primary">{selectedTarifario.codigo}</span>
            </h2>
            {selectedTarifario.esPrincipal && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 bg-amber-500/10 gap-1">
                <Star className="size-3 fill-amber-500 text-amber-500" />
                <span>Principal</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedTarifario.nombre}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-muted/30 px-2.5 py-1 rounded-md border border-border/40 font-medium">
            <Coins className="size-3.5 text-muted-foreground" />
            <span>{selectedTarifario.monedaNombre}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoadingDetalles}
            className="size-7 border-border/60 cursor-pointer"
            title="Recargar precios"
            aria-label="Recargar precios"
          >
            <RefreshCw className={cn("size-3.5", isLoadingDetalles && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Inline Form to Add Price */}
      <form
        onSubmit={handleSubmit(onSubmitAddPrice)}
        className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-3"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Plus className="size-3.5 text-primary" />
          <span>Agregar / Asignar Precio a Servicio</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Category Select */}
          <div className="sm:col-span-5 space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Categoría</Label>
            <Select
              value={selectedCatId ? String(selectedCatId) : ""}
              onValueChange={(val) => {
                setSelectedCatId(Number(val));
                setValue("servicioId", 0);
              }}
            >
              <SelectTrigger
                className="h-9 w-full text-xs"
                title={selectedCat?.nombre}
              >
                <SelectValue placeholder="Categoría">
                  <span className="truncate">{selectedCat?.nombre}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[260px] max-w-[420px]">
                {categorias.map((cat: CategoriaServicioResponse) => (
                  <SelectItem key={cat.id} value={String(cat.id)} title={cat.nombre}>
                    <span className="truncate">{cat.nombre}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Select */}
          <div className="sm:col-span-7 space-y-1">
            <Label className="text-[11px] text-muted-foreground font-medium">Servicio</Label>
            <Select
              value={selectedServicioId ? String(selectedServicioId) : ""}
              onValueChange={(val) => setValue("servicioId", Number(val), { shouldValidate: true })}
            >
              <SelectTrigger
                className="h-9 w-full text-xs"
                title={selectedServicio ? `${selectedServicio.nombre} (${selectedServicio.codigo})` : undefined}
              >
                <SelectValue placeholder="Seleccionar Servicio">
                  <span className="truncate">
                    {selectedServicio ? `${selectedServicio.nombre} (${selectedServicio.codigo})` : undefined}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[340px] max-w-[500px]">
                {servicios.map((s: ServicioResponse) => (
                  <SelectItem key={s.id} value={String(s.id)} title={`${s.nombre} (${s.codigo})`}>
                    <span className="truncate font-medium">{s.nombre}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-1">({s.codigo})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.servicioId && (
              <p className="text-[10px] text-destructive font-medium">{errors.servicioId.message}</p>
            )}
          </div>

          {/* Price Input & Add Button Row */}
          <div className="sm:col-span-12 flex items-end justify-between gap-3 pt-1 border-t border-border/30">
            <div className="space-y-1 max-w-[220px] w-full">
              <Label className="text-[11px] text-muted-foreground font-medium">Precio</Label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs font-mono font-bold text-muted-foreground/80 select-none pointer-events-none">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-8.5 pl-9 text-xs font-mono w-full"
                  {...register("precio", { valueAsNumber: true })}
                />
              </div>
              {errors.precio && (
                <p className="text-[10px] text-destructive font-medium">{errors.precio.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={createDetalleMutation.isPending}
              className="h-8.5 px-4 text-xs gap-1.5 cursor-pointer font-medium"
            >
              {createDetalleMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>Asignar Precio</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Filter / Search within details table */}
      <div className="flex items-center justify-between pt-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Filtrar precios en tabla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/20 border-border/60"
          />
        </div>
        <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-mono">
          {detalles.length} precio{detalles.length !== 1 && "s"}
        </Badge>
      </div>

      {/* Details Table */}
      <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent h-8 border-b border-border/50">
              <TableHead className="pl-3 text-[11px] font-semibold text-muted-foreground w-24">ID Servicio</TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground">Prestación / Servicio</TableHead>
              <TableHead className="text-right text-[11px] font-semibold text-muted-foreground w-28">Precio</TableHead>
              <TableHead className="text-right pr-3 text-[11px] font-semibold text-muted-foreground w-16">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingDetalles ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx} className="h-9">
                  <TableCell className="pl-3 py-2">
                    <Skeleton className="h-4 w-10 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-44 rounded" />
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <Skeleton className="h-4 w-16 ml-auto rounded" />
                  </TableCell>
                  <TableCell className="text-right pr-3 py-2">
                    <Skeleton className="h-6 w-6 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : detalles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-xs py-8">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-6 text-muted-foreground/40 stroke-1" />
                    <p className="font-medium text-foreground text-xs">Sin precios registrados</p>
                    <p className="text-[11px] text-muted-foreground">
                      Use el formulario superior para asignar precios a los servicios.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              detalles.map((d: TarifarioDetalleResponse) => (
                <TableRow key={d.id} className="hover:bg-muted/30 h-9.5">
                  <TableCell className="pl-3 py-2 font-mono text-xs text-muted-foreground">
                    #{d.servicioId}
                  </TableCell>
                  <TableCell className="py-2 font-medium text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Activity className="size-3.5 text-primary/80 shrink-0" />
                      <span>{d.servicioNombre || `Servicio ID #${d.servicioId}`}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 font-mono font-bold text-xs text-foreground">
                    <span className="text-muted-foreground font-normal text-[11px] mr-1">{currencySymbol}</span>
                    {d.precio.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right pr-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDetalle(d.id)}
                      disabled={deleteDetalleMutation.isPending}
                      className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Eliminar precio"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
