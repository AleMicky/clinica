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
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface TarifarioDetallesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarifario: TarifarioItem | null;
}

export function TarifarioDetallesDialog({
  open,
  onOpenChange,
  tarifario,
}: TarifarioDetallesDialogProps) {
  const tarifarioId = tarifario?.id ?? 0;

  const { data: detallesData, isLoading: isLoadingDetalles, refetch } =
    useTarifarioDetalles(tarifarioId, { pageSize: 1000 }, open && tarifarioId > 0);

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

  const detalles = React.useMemo(() => detallesData?.items ?? [], [detallesData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListPlus className="size-5" />
            </div>
            <span>Precios del Tarifario: {tarifario?.codigo}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Asigne y gestione los precios por servicio para el tarifario &quot;{tarifario?.nombre}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Add Price Inline Form */}
          <form
            onSubmit={handleSubmit(onSubmitAddPrice)}
            className="p-3 bg-muted/30 border rounded-lg space-y-3"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Plus className="size-3.5 text-primary" />
              <span>Agregar / Asignar Precio a Servicio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              {/* Category Select */}
              <div className="sm:col-span-4 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Categoría</Label>
                <Select
                  value={selectedCatId ? String(selectedCatId) : ""}
                  onValueChange={(val) => setSelectedCatId(Number(val))}
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat: CategoriaServicioResponse) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Select */}
              <div className="sm:col-span-5 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Servicio</Label>
                <Select
                  value={selectedServicioId ? String(selectedServicioId) : ""}
                  onValueChange={(val) => setValue("servicioId", Number(val), { shouldValidate: true })}
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Seleccionar Servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((s: ServicioResponse) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nombre} ({s.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.servicioId && (
                  <p className="text-[10px] text-destructive font-medium">{errors.servicioId.message}</p>
                )}
              </div>

              {/* Precio Input */}
              <div className="sm:col-span-3 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Precio</Label>
                <div className="flex items-center gap-1">
                  <div className="relative flex-1">
                    <DollarSign className="size-3.5 absolute left-2 top-2 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-8 pl-7 text-xs font-mono"
                      {...register("precio", { valueAsNumber: true })}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createDetalleMutation.isPending}
                    className="h-8 px-2.5 text-xs gap-1 shrink-0"
                  >
                    {createDetalleMutation.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Plus className="size-3.5" />
                    )}
                  </Button>
                </div>
                {errors.precio && (
                  <p className="text-[10px] text-destructive font-medium">{errors.precio.message}</p>
                )}
              </div>
            </div>
          </form>

          {/* Details Table */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent h-8 border-b">
                  <TableHead className="pl-3 text-xs font-semibold text-muted-foreground">Servicio ID</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Servicio</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted-foreground">Precio</TableHead>
                  <TableHead className="text-right pr-3 text-xs font-semibold text-muted-foreground">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDetalles ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={idx} className="h-9">
                      <TableCell className="pl-3 py-1.5">
                        <Skeleton className="h-4 w-10 rounded" />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Skeleton className="h-4 w-36 rounded" />
                      </TableCell>
                      <TableCell className="text-right py-1.5">
                        <Skeleton className="h-4 w-16 ml-auto rounded" />
                      </TableCell>
                      <TableCell className="text-right pr-3 py-1.5">
                        <Skeleton className="h-6 w-6 rounded ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : detalles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-xs py-6">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Inbox className="size-6 text-muted-foreground/50 stroke-1" />
                        <p className="font-medium text-foreground text-xs">Sin precios registrados</p>
                        <p className="text-[11px] text-muted-foreground">
                          Utilice el formulario superior para asignar precios a los servicios.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  detalles.map((d: TarifarioDetalleResponse) => (
                    <TableRow key={d.id} className="hover:bg-muted/30 h-9">
                      <TableCell className="pl-3 py-1.5 font-mono text-xs text-muted-foreground">
                        #{d.servicioId}
                      </TableCell>
                      <TableCell className="py-1.5 font-medium text-xs text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Activity className="size-3 text-primary/80" />
                          <span>{d.servicioNombre || `Servicio ID #${d.servicioId}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-1.5 font-mono font-semibold text-xs text-foreground">
                        ${d.precio.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-3 py-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDetalle(d.id)}
                          disabled={deleteDetalleMutation.isPending}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10 cursor-pointer"
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
      </DialogContent>
    </Dialog>
  );
}
