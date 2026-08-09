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

import { Autocomplete } from "@/components/ui/autocomplete";
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
  const { data: allTarifariosData, isLoading: isLoadingAllTarifarios } = useTarifarios({ pageSize: 100 });
  const allTarifarios = React.useMemo(() => allTarifariosData?.items ?? [], [allTarifariosData]);

  const tarifarioOptions = React.useMemo(() => {
    return allTarifarios.map((t: TarifarioResponse) => ({
      value: String(t.id),
      label: `${t.nombre} (${t.codigo})`,
      description: `Código: ${t.codigo}`,
    }));
  }, [allTarifarios]);

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
      const todayStr = new Date().toISOString().split("T")[0];
      await createTarifarioMutation.mutateAsync({
        convenioId,
        data: {
          tarifarioId: values.tarifarioId,
          fechaInicio: convenio?.fechaInicio || todayStr,
          fechaFin: null,
        },
      });
      toast.success("Tarifario asociado correctamente al convenio.");
      reset({
        tarifarioId: 0,
        fechaInicio: todayStr,
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

  const handleDeleteTarifario = async (id: number) => {
    if (!convenioId) return;
    try {
      await deleteTarifarioMutation.mutateAsync({
        convenioId,
        id,
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
            className="p-3 bg-muted/30 border rounded-lg space-y-2.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border/40 pb-2">
              <Plus className="size-3.5 text-primary" />
              <span>Vincular Nuevo Tarifario</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
              <div className="flex-1 space-y-1">
                <Label className="text-[11px] font-medium text-muted-foreground">Tarifario</Label>
                <Autocomplete
                  value={selectedTarifarioId ? String(selectedTarifarioId) : ""}
                  onValueChange={(val) => setValue("tarifarioId", Number(val), { shouldValidate: true })}
                  options={tarifarioOptions}
                  isLoading={isLoadingAllTarifarios}
                  placeholder="Buscar o seleccionar tarifario por nombre o código..."
                  emptyText="No se encontraron tarifarios"
                  allowCustomValue={false}
                  error={Boolean(errors.tarifarioId)}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={createTarifarioMutation.isPending}
                className="h-8 px-4 text-xs gap-1.5 shrink-0 cursor-pointer shadow-2xs self-end"
              >
                {createTarifarioMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                <span>Vincular Tarifario</span>
              </Button>
            </div>

            {errors.tarifarioId && (
              <p className="text-[10px] text-destructive font-medium">{errors.tarifarioId.message}</p>
            )}
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
                  tarifariosAsignados.map((t: ConvenioTarifarioResponse) => {
                    const nombre = t.tarifario?.nombre || t.tarifarioNombre || `Tarifario #${t.tarifarioId || t.id}`;
                    const codigo = t.tarifario?.codigo || t.tarifarioCodigo;

                    return (
                      <TableRow key={t.id} className="hover:bg-muted/30 h-9">
                        <TableCell className="pl-3 py-1.5 font-medium text-xs text-foreground">
                          <div className="flex items-center gap-2">
                            <Tag className="size-3.5 text-primary/80" />
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs">{nombre}</span>
                              {codigo && (
                                <span className="text-[10px] font-mono text-muted-foreground">{codigo}</span>
                              )}
                            </div>
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
                            onClick={() => handleDeleteTarifario(t.id)}
                            disabled={deleteTarifarioMutation.isPending}
                            className="h-6 w-6 text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
