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
  Handshake,
  RefreshCw,
  Info,
  History,
  Clock,
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

interface ConvenioTarifarioListProps {
  selectedConvenio: ConvenioItem | null;
  onRefreshConvenio?: () => void;
  onViewAudit?: (convenio: ConvenioItem) => void;
}

export function ConvenioTarifarioList({
  selectedConvenio,
  onRefreshConvenio,
  onViewAudit,
}: ConvenioTarifarioListProps) {
  const convenioId = selectedConvenio?.id ?? 0;

  const {
    data: tarifariosAsignadosData,
    isLoading: isLoadingTarifarios,
    refetch,
  } = useConvenioTarifarios(convenioId, convenioId > 0);

  const createTarifarioMutation = useCreateConvenioTarifario();
  const deleteTarifarioMutation = useDeleteConvenioTarifario();

  // Available tarifarios list for select dropdown
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
          fechaInicio: selectedConvenio?.fechaInicio || todayStr,
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

  // If no convenio selected
  if (!selectedConvenio) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-border/60 rounded-xl min-h-[420px] text-center shadow-2xs">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Handshake className="size-6 text-primary stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Ningún convenio seleccionado
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Seleccione un convenio de la lista izquierda para visualizar y administrar sus tarifarios asociados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs">
      {/* Header for selected convenio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-start gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <Tag className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {selectedConvenio.codigo}
              </span>
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                {selectedConvenio.nombre}
              </h3>
              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                {tarifariosAsignados.length} {tarifariosAsignados.length === 1 ? "tarifario" : "tarifarios"}
              </Badge>
            </div>
            {selectedConvenio.descripcion && (
              <p className="text-xs text-muted-foreground">
                {selectedConvenio.descripcion}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mt-0.5">
              <Calendar className="size-3 text-muted-foreground/70" />
              <span>Vigencia: {selectedConvenio.fechaInicio}</span>
              <span>-</span>
              <span>{selectedConvenio.fechaFin || "Indefinido"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {onViewAudit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewAudit(selectedConvenio)}
              className="h-8 text-xs gap-1.5 cursor-pointer border-border/60"
              title="Ver Auditoría del Convenio"
            >
              <History className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Auditoría</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoadingTarifarios}
            className="h-8 text-xs gap-1.5 cursor-pointer border-border/60"
            title="Recargar tarifarios"
          >
            <RefreshCw className={cn("size-3.5", isLoadingTarifarios && "animate-spin")} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Add Tarifario Form */}
      <form
        onSubmit={handleSubmit(onSubmitAddTarifario)}
        className="p-3 bg-muted/20 border border-border/60 rounded-lg space-y-2.5"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground border-b border-border/40 pb-2">
          <Plus className="size-3.5 text-primary" />
          <span>Vincular Tarifario al Convenio</span>
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
      <div className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-2xs">
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
                  <TableCell className="pl-3 py-2">
                    <Skeleton className="h-4 w-40 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-32 rounded" />
                  </TableCell>
                  <TableCell className="text-right pr-3 py-2">
                    <Skeleton className="h-6 w-6 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : tarifariosAsignados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-28 text-center text-muted-foreground text-xs py-6">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-7 text-muted-foreground/50 stroke-1" />
                    <p className="font-medium text-foreground text-xs">Sin tarifarios vinculados</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      Utilice el formulario de arriba para asociar tarifarios a este convenio.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tarifariosAsignados.map((t: ConvenioTarifarioResponse) => {
                const nombre = t.tarifario?.nombre || t.tarifarioNombre || `Tarifario #${t.tarifarioId || t.id}`;
                const codigo = t.tarifario?.codigo || t.tarifarioCodigo;

                return (
                  <TableRow key={t.id} className="hover:bg-muted/30 transition-colors h-10">
                    <TableCell className="pl-3 py-2 font-medium text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <Tag className="size-3.5 text-primary" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">{nombre}</span>
                          {codigo && (
                            <span className="text-[10px] font-mono text-muted-foreground">{codigo}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span>{t.fechaInicio}</span>
                        <span>-</span>
                        <span>{t.fechaFin || "Indefinido"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTarifario(t.id)}
                        disabled={deleteTarifarioMutation.isPending}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Desvincular tarifario"
                        aria-label="Desvincular tarifario"
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
  );
}
