"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Tag,
  Loader2,
  Plus,
  Trash2,
  Inbox,
  Calendar,
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
  convenioTarifarioSchema,
  type ConvenioTarifarioFormValues,
} from "../schemas/convenio.schema";
import {
  useCreateConvenioTarifario,
  useDeleteConvenioTarifario,
  useConvenioTarifarios,
} from "../hooks/use-convenio";
import { useTarifarios, type TarifarioResponse } from "../../tarifario";
import type { ConvenioItem, ConvenioTarifarioResponse } from "../types/convenio.types";

interface ConvenioTarifariosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convenio: ConvenioItem | null;
}

export function ConvenioTarifariosDialog({
  open,
  onOpenChange,
  convenio,
}: ConvenioTarifariosDialogProps) {
  const convenioId = convenio?.id ?? 0;

  const { data: tarifariosAsignadosData, isLoading: isLoadingTarifarios, refetch } =
    useConvenioTarifarios(convenioId, open && convenioId > 0);

  const createTarifarioMutation = useCreateConvenioTarifario();
  const deleteTarifarioMutation = useDeleteConvenioTarifario();

  // All available tarifarios list
  const { data: allTarifariosData } = useTarifarios({ pageSize: 100 });
  const allTarifarios = React.useMemo(() => allTarifariosData?.items ?? [], [allTarifariosData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConvenioTarifarioFormValues>({
    resolver: zodResolver(convenioTarifarioSchema),
    defaultValues: {
      tarifarioId: 0,
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "",
    },
  });

  const selectedTarifarioId = watch("tarifarioId");

  const onSubmitAddTarifario = async (values: ConvenioTarifarioFormValues) => {
    if (!convenioId) return;
    try {
      await createTarifarioMutation.mutateAsync({
        convenioId,
        data: {
          tarifarioId: values.tarifarioId,
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin || null,
        },
      });
      toast.success("Tarifario asociado correctamente al convenio.");
      reset({
        tarifarioId: 0,
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaFin: "",
      });
      refetch();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "No se pudo vincular el tarifario.";
      toast.error(errorMsg);
    }
  };

  const handleDeleteTarifario = async (tarifarioId: number) => {
    if (!convenioId) return;
    try {
      await deleteTarifarioMutation.mutateAsync({
        convenioId,
        tarifarioId,
      });
      toast.success("Tarifario desvinculado del convenio.");
      refetch();
    } catch {
      toast.error("No se pudo desvincular el tarifario.");
    }
  };

  const tarifariosAsignados = React.useMemo(
    () => tarifariosAsignadosData?.items ?? [],
    [tarifariosAsignadosData]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tag className="size-5" />
            </div>
            <span>Tarifarios del Convenio: {convenio?.codigo}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Asigne y gestione los tarifarios aplicables para &quot;{convenio?.nombre}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Add Tarifario Form */}
          <form
            onSubmit={handleSubmit(onSubmitAddTarifario)}
            className="p-3 bg-muted/30 border rounded-lg space-y-3"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Plus className="size-3.5 text-primary" />
              <span>Vincular Nuevo Tarifario</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              {/* Select Tarifario */}
              <div className="sm:col-span-5 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Tarifario</Label>
                <Select
                  value={selectedTarifarioId ? String(selectedTarifarioId) : ""}
                  onValueChange={(val) => setValue("tarifarioId", Number(val), { shouldValidate: true })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Seleccionar Tarifario" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTarifarios.map((t: TarifarioResponse) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nombre} ({t.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tarifarioId && (
                  <p className="text-[10px] text-destructive font-medium">{errors.tarifarioId.message}</p>
                )}
              </div>

              {/* Fecha Inicio */}
              <div className="sm:col-span-3 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Fecha Inicio</Label>
                <Input
                  type="date"
                  className="h-8 text-xs font-mono"
                  {...register("fechaInicio")}
                />
              </div>

              {/* Fecha Fin */}
              <div className="sm:col-span-4 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Fecha Fin (Opcional)</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    className="h-8 text-xs font-mono flex-1"
                    {...register("fechaFin")}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createTarifarioMutation.isPending}
                    className="h-8 px-2.5 text-xs gap-1 shrink-0"
                  >
                    {createTarifarioMutation.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Plus className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Tarifarios Table */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent h-8 border-b">
                  <TableHead className="pl-3 text-xs font-semibold text-muted-foreground">Tarifario</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Vigencia</TableHead>
                  <TableHead className="text-right pr-3 text-xs font-semibold text-muted-foreground">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTarifarios ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={idx} className="h-9">
                      <TableCell className="pl-3 py-1.5">
                        <Skeleton className="h-4 w-36 rounded" />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Skeleton className="h-4 w-28 rounded" />
                      </TableCell>
                      <TableCell className="text-right pr-3 py-1.5">
                        <Skeleton className="h-6 w-6 rounded ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : tarifariosAsignados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-xs py-6">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Inbox className="size-6 text-muted-foreground/50 stroke-1" />
                        <p className="font-medium text-foreground text-xs">Sin tarifarios vinculados</p>
                        <p className="text-[11px] text-muted-foreground">
                          Utilice el formulario para asociar tarifarios a este convenio.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tarifariosAsignados.map((t: ConvenioTarifarioResponse) => (
                    <TableRow key={t.id} className="hover:bg-muted/30 h-9">
                      <TableCell className="pl-3 py-1.5 font-medium text-xs text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Tag className="size-3 text-primary/80" />
                          <span>{t.tarifarioNombre || `Tarifario #${t.tarifarioId}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          <span>{t.fechaInicio}</span>
                          <span>-</span>
                          <span>{t.fechaFin || "Indefinido"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-3 py-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTarifario(t.tarifarioId)}
                          disabled={deleteTarifarioMutation.isPending}
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
