"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Handshake,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePacienteConvenios,
  useCreatePacienteConvenio,
  useDeletePacienteConvenio,
} from "../hooks/use-pacientes";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import {
  pacienteConvenioSchema,
  type PacienteConvenioFormValues,
} from "../schemas/paciente.schema";
import type { PacienteResponse } from "../types/paciente.types";
import { getPacienteFullName } from "./paciente-card";
import { cn } from "@/lib/utils";

interface PacienteConveniosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: PacienteResponse | null;
}

export function PacienteConveniosDialog({
  open,
  onOpenChange,
  paciente,
}: PacienteConveniosDialogProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);

  const pacienteId = paciente?.id ?? 0;
  const { data: conveniosData, isLoading: isLoadingPacienteConvenios } =
    usePacienteConvenios(pacienteId, open && pacienteId > 0);

  const { data: catConveniosData } = useConvenios({ pageSize: 100 });

  const createMutation = useCreatePacienteConvenio();
  const deleteMutation = useDeletePacienteConvenio();

  const pacienteConvenios = conveniosData?.items ?? [];
  const disponibleConvenios = catConveniosData?.items ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PacienteConvenioFormValues>({
    resolver: zodResolver(pacienteConvenioSchema),
    defaultValues: {
      convenioId: 0,
      numeroAfiliado: "",
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "",
      esPrincipal: false,
    },
  });

  const convenioIdVal = watch("convenioId");
  const esPrincipalVal = watch("esPrincipal");

  React.useEffect(() => {
    if (open) {
      setShowAddForm(false);
      reset({
        convenioId: 0,
        numeroAfiliado: "",
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaFin: "",
        esPrincipal: false,
      });
    }
  }, [open, reset]);

  if (!paciente) return null;

  const nombrePaciente = getPacienteFullName(paciente);

  const onAddConvenio = async (values: PacienteConvenioFormValues) => {
    try {
      await createMutation.mutateAsync({
        pacienteId,
        data: {
          convenioId: values.convenioId,
          numeroAfiliado: values.numeroAfiliado || undefined,
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin || undefined,
          esPrincipal: values.esPrincipal,
        },
      });

      toast.success("Convenio asignado al paciente exitosamente.");
      setShowAddForm(false);
      reset();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "No se pudo asignar el convenio.";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id: number, convenioNombre?: string) => {
    try {
      await deleteMutation.mutateAsync({ pacienteId, id });
      toast.success(
        `Convenio ${convenioNombre || ""} removido del expediente.`
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al desvincular convenio.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-border/60 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Handshake className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Convenios y Coberturas Médicas
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Expediente de {nombrePaciente} ({paciente.numeroHistoriaClinica})
                </DialogDescription>
              </div>
            </div>

            {!showAddForm && (
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="h-8 text-xs font-semibold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="size-3.5" />
                Asignar Convenio
              </Button>
            )}
          </div>

          <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
            {/* Form to Assign New Convenio */}
            {showAddForm && (
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Shield className="size-3.5" />
                    Asignar Nuevo Convenio
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                </div>

                <form
                  onSubmit={handleSubmit(onAddConvenio)}
                  className="space-y-3 text-xs"
                >
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      Convenio / Seguro <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={convenioIdVal ? String(convenioIdVal) : ""}
                      onValueChange={(val) =>
                        setValue("convenioId", Number(val), {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-9 text-xs bg-background",
                          errors.convenioId && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Seleccionar convenio institucional..." />
                      </SelectTrigger>
                      <SelectContent>
                        {disponibleConvenios.map((conv) => (
                          <SelectItem key={conv.id} value={String(conv.id)}>
                            <span className="font-mono font-bold text-primary mr-1.5">
                              [{conv.codigo}]
                            </span>
                            {conv.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.convenioId && (
                      <p className="text-[11px] text-destructive">
                        {errors.convenioId.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="numeroAfiliado" className="text-xs font-semibold">
                        N° Afiliado / Poliza
                      </Label>
                      <Input
                        id="numeroAfiliado"
                        placeholder="Ej. POL-98421"
                        {...register("numeroAfiliado")}
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="fechaInicio" className="text-xs font-semibold">
                        Fecha Inicio <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        {...register("fechaInicio")}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="esPrincipal"
                      checked={esPrincipalVal}
                      onCheckedChange={(checked) =>
                        setValue("esPrincipal", Boolean(checked))
                      }
                    />
                    <Label
                      htmlFor="esPrincipal"
                      className="text-xs font-medium leading-none cursor-pointer"
                    >
                      Marcar como Cobertura Principal
                    </Label>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || isSubmitting}
                      size="sm"
                      className="h-8 text-xs font-semibold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {createMutation.isPending && (
                        <Loader2 className="size-3.5 animate-spin" />
                      )}
                      Guardar Asignación
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Assigned Convenios */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Convenios Registrados
              </h4>

              {isLoadingPacienteConvenios ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>
              ) : pacienteConvenios.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs space-y-1">
                  <p className="font-semibold text-foreground">
                    Sin convenios o coberturas asignadas
                  </p>
                  <p>
                    El paciente no posee seguros institucionales asociados.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pacienteConvenios.map((pc) => (
                    <div
                      key={pc.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all gap-3",
                        pc.esPrincipal
                          ? "border-purple-500/40 bg-purple-500/5"
                          : "border-border/60 bg-card"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "size-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                            pc.esPrincipal
                              ? "bg-purple-600 text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {pc.convenio?.codigo || "CON"}
                        </div>

                        <div className="flex flex-col leading-tight min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {pc.convenio?.nombre || "Convenio General"}
                            </span>
                            {pc.esPrincipal && (
                              <Badge
                                variant="outline"
                                className="bg-purple-600 text-white text-[9px] px-1.5 py-0 h-4 font-bold border-none"
                              >
                                <CheckCircle2 className="size-2.5 mr-1" />
                                Principal
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            Afiliado: {pc.numeroAfiliado || "N/A"} | Desde:{" "}
                            {pc.fechaInicio}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDelete(pc.id, pc.convenio?.nombre)
                        }
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        title="Desvincular convenio"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
