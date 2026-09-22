"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Stethoscope,
  Loader2,
  Save,
  User,
  Award,
  Plus,
  Star,
  Trash2,
  AlertCircle,
  FileBadge,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { cn } from "@/lib/utils";

import {
  medicoSchema,
  type MedicoFormValues,
} from "../schemas/medico.schema";
import {
  useCreateMedico,
  useUpdateMedico,
  useMedicos,
} from "../hooks/use-medicos";
import { useEspecialidades } from "@/modules/recursos-humanos/especialidad/hooks/use-especialidades";
import { useEmpleados } from "@/modules/recursos-humanos/empleado";
import { getMedicoFullName } from "./medico-list";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicoToEdit?: MedicoResponse | null;
  onSuccessCallback?: () => void;
}

interface EspecialidadItemState {
  especialidadId: number;
  nombre: string;
  codigo?: string;
  esPrincipal: boolean;
}

export function MedicoFormDialog({
  open,
  onOpenChange,
  medicoToEdit,
  onSuccessCallback,
}: MedicoFormDialogProps) {
  const isEditing = Boolean(medicoToEdit && medicoToEdit.id > 0);

  // Mutations for Medico
  const createMutation = useCreateMedico();
  const updateMutation = useUpdateMedico();

  // Queries for Empleados
  const empleadosQuery = useEmpleados({ pageSize: 100 });
  const empleados = React.useMemo(
    () => empleadosQuery.data?.items ?? [],
    [empleadosQuery.data]
  );

  const medicosExistentesQuery = useMedicos({ pageSize: 500 });
  const empleadosOcupados = React.useMemo(() => {
    const ids = new Set<number>();
    const editingId = medicoToEdit?.id;
    medicosExistentesQuery.data?.items?.forEach((m) => {
      if (m.id !== editingId) ids.add(m.empleadoId);
    });
    return ids;
  }, [medicosExistentesQuery.data, medicoToEdit?.id]);

  // Options for Empleado Selector
  const empleadoOptions: AutocompleteOption[] = React.useMemo(() => {
    return empleados
      .filter((emp) => !empleadosOcupados.has(emp.id))
      .map((emp) => {
        const nombreCompleto = emp.persona
          ? `${emp.persona.nombres} ${emp.persona.apellidoPaterno} ${
              emp.persona.apellidoMaterno || ""
            }`.trim()
          : `Empleado #${emp.id}`;
        return {
          value: String(emp.id),
          label: `${nombreCompleto} (${emp.codigoEmpleado})`,
          description: emp.persona?.nombres
            ? `Código: ${emp.codigoEmpleado}`
            : undefined,
        };
      });
  }, [empleados, empleadosOcupados]);

  // Main Medico Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MedicoFormValues>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      empleadoId: 0,
      matriculaProfesional: "",
      registroMinisterioSalud: "",
    },
  });

  const empleadoIdWatch = watch("empleadoId");

  // =============================
  // ESPECIALIDADES (Maestro - Detalle en memoria)
  // =============================
  const [especialidadesList, setEspecialidadesList] = React.useState<
    EspecialidadItemState[]
  >([]);
  const [selectedEspId, setSelectedEspId] = React.useState<number>(0);
  const [isPrincipalSelected, setIsPrincipalSelected] =
    React.useState<boolean>(false);
  const [espError, setEspError] = React.useState<string | null>(null);

  const { data: catalogoEspData, isLoading: isLoadingCatalogoEsp } =
    useEspecialidades({ pageSize: 200 });

  const catalogoEspecialidades = React.useMemo(
    () => catalogoEspData?.items ?? [],
    [catalogoEspData]
  );

  const assignedEspIds = React.useMemo(
    () => new Set(especialidadesList.map((e) => e.especialidadId)),
    [especialidadesList]
  );

  const especialidadOptions: AutocompleteOption[] = React.useMemo(() => {
    return catalogoEspecialidades
      .filter((esp) => !assignedEspIds.has(esp.id))
      .map((esp) => ({
        value: String(esp.id),
        label: `${esp.nombre} (${esp.codigo})`,
        description: esp.descripcion || undefined,
      }));
  }, [catalogoEspecialidades, assignedEspIds]);

  // Reset form when modal opens or editing target changes
  React.useEffect(() => {
    if (open) {
      if (medicoToEdit) {
        reset({
          empleadoId: medicoToEdit.empleadoId,
          matriculaProfesional: medicoToEdit.matriculaProfesional ?? "",
          registroMinisterioSalud: medicoToEdit.registroMinisterioSalud ?? "",
        });

        const initialEsp: EspecialidadItemState[] = (
          medicoToEdit.especialidades ?? []
        )
          .filter((e) => e.activo)
          .map((e) => ({
            especialidadId: e.especialidadId,
            nombre:
              e.especialidad?.nombre || `Especialidad #${e.especialidadId}`,
            codigo: e.especialidad?.codigo,
            esPrincipal: e.esPrincipal,
          }));

        setEspecialidadesList(initialEsp);
      } else {
        reset({
          empleadoId: 0,
          matriculaProfesional: "",
          registroMinisterioSalud: "",
        });
        setEspecialidadesList([]);
      }
      setSelectedEspId(0);
      setIsPrincipalSelected(false);
      setEspError(null);
    }
  }, [open, medicoToEdit, reset]);

  // Add Specialty handler
  const handleAddEspecialidad = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedEspId || selectedEspId <= 0) {
      setEspError("Debe seleccionar una especialidad.");
      return;
    }

    const espCatalog = catalogoEspecialidades.find(
      (item) => item.id === selectedEspId
    );
    if (!espCatalog) return;

    const shouldBePrincipal =
      isPrincipalSelected || especialidadesList.length === 0;

    setEspecialidadesList((prev) => {
      const updated = prev.map((item) =>
        shouldBePrincipal ? { ...item, esPrincipal: false } : item
      );
      updated.push({
        especialidadId: espCatalog.id,
        nombre: espCatalog.nombre,
        codigo: espCatalog.codigo,
        esPrincipal: shouldBePrincipal,
      });
      return updated;
    });

    setSelectedEspId(0);
    setIsPrincipalSelected(false);
    setEspError(null);
  };

  // Toggle Principal Specialty handler
  const handleSetPrincipal = (espId: number) => {
    setEspecialidadesList((prev) =>
      prev.map((item) => ({
        ...item,
        esPrincipal: item.especialidadId === espId,
      }))
    );
  };

  // Delete Specialty handler
  const handleRemoveEspecialidad = (espId: number) => {
    setEspecialidadesList((prev) => {
      const updated = prev.filter((item) => item.especialidadId !== espId);
      if (updated.length > 0 && !updated.some((item) => item.esPrincipal)) {
        updated[0] = { ...updated[0], esPrincipal: true };
      }
      return updated;
    });
  };

  const onSubmit = async (values: MedicoFormValues) => {
    try {
      const payload = {
        empleadoId: values.empleadoId,
        matriculaProfesional: values.matriculaProfesional.trim().toUpperCase(),
        registroMinisterioSalud: values.registroMinisterioSalud?.trim() || null,
        especialidades: especialidadesList.map((e) => ({
          especialidadId: e.especialidadId,
          esPrincipal: e.esPrincipal,
        })),
      };

      if (isEditing && medicoToEdit) {
        await updateMutation.mutateAsync({
          id: medicoToEdit.id,
          request: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSuccessCallback?.();
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  const doctorNombre = medicoToEdit ? getMedicoFullName(medicoToEdit) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-5 sm:p-6 max-h-[90vh] flex flex-col gap-4 overflow-hidden">
        {/* CABECERA MODAL */}
        <DialogHeader className="space-y-1 pb-2 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 shadow-2xs">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                {isEditing ? "Expediente del Médico" : "Registrar Nuevo Médico"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Actualice datos generales y gestione las especialidades médicas asignadas."
                  : "Vincule un empleado registrado y asigne sus especialidades médicas en un solo paso."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* CONTENIDO SCROLLABLE */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {/* FORMULARIO PRINCIPAL */}
          <form id="medico-main-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* SECCIÓN 1: EMPLEADO VINCULADO */}
            <div className="space-y-1.5">
              <Label
                htmlFor="empleadoId"
                className="text-xs font-semibold text-foreground flex items-center gap-1"
              >
                <User className="size-3.5 text-primary/70" />
                <span>Empleado de la Clínica</span>
                <span className="text-destructive">*</span>
              </Label>

              {isEditing ? (
                <div className="p-2.5 rounded-xl border border-border/70 bg-muted/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {medicoToEdit?.empleado?.persona?.nombres?.[0] || "DR"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        Dr(a). {doctorNombre}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        Código Empleado: {medicoToEdit?.empleado?.codigoEmpleado || "—"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-muted/60 shrink-0">
                    No modificable
                  </Badge>
                </div>
              ) : (
                <div className="space-y-1">
                  <Autocomplete
                    id="empleadoId"
                    value={
                      empleadoIdWatch && empleadoIdWatch > 0
                        ? String(empleadoIdWatch)
                        : ""
                    }
                    onValueChange={(val) =>
                      setValue("empleadoId", Number(val) || 0, {
                        shouldValidate: true,
                      })
                    }
                    options={empleadoOptions}
                    placeholder="Buscar empleado por nombre o código..."
                    emptyText="No se encontraron empleados disponibles"
                    isLoading={empleadosQuery.isLoading}
                    disabled={isLoading || empleadosQuery.isLoading}
                    error={Boolean(errors.empleadoId)}
                    allowCustomValue={false}
                    className="w-full text-xs h-9"
                  />

                  {errors.empleadoId && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.empleadoId.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: REGISTROS PROFESIONALES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              {/* Matrícula Profesional */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="matriculaProfesional"
                  className="text-xs font-semibold text-foreground flex items-center gap-1"
                >
                  <Award className="size-3.5 text-primary/70" />
                  <span>Matrícula Profesional</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="matriculaProfesional"
                  placeholder="Ej: MP-12345"
                  {...register("matriculaProfesional")}
                  disabled={isLoading}
                  className={cn(
                    "font-mono uppercase h-9 text-xs",
                    errors.matriculaProfesional &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  autoFocus={isEditing}
                />
                {errors.matriculaProfesional && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.matriculaProfesional.message}
                  </p>
                )}
              </div>

              {/* Registro Ministerio de Salud */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="registroMinisterioSalud"
                  className="text-xs font-semibold text-foreground flex items-center gap-1"
                >
                  <FileBadge className="size-3.5 text-primary/70" />
                  <span>Reg. Ministerio Salud</span>
                  <span className="text-muted-foreground font-normal">(Opcional)</span>
                </Label>
                <Input
                  id="registroMinisterioSalud"
                  placeholder="Ej: RMS-8899"
                  {...register("registroMinisterioSalud")}
                  disabled={isLoading}
                  className={cn(
                    "font-mono uppercase h-9 text-xs",
                    errors.registroMinisterioSalud &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.registroMinisterioSalud && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.registroMinisterioSalud.message}
                  </p>
                )}
              </div>
            </div>
          </form>

          {/* SECCIÓN 3: ESPECIALIDADES MÉDICAS (TABLA MAESTRO-DETALLE EN EL MODAL) */}
          <div className="pt-2 border-t border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <Stethoscope className="size-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    Especialidades Acreditadas
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Añada las especialidades médicas correspondientes y defina cuál es la principal.
                  </p>
                </div>
              </div>

              {especialidadesList.length > 0 && (
                <Badge variant="secondary" className="text-[10px] font-semibold h-5">
                  {especialidadesList.length} asignadas
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {/* Formulario rápido para añadir especialidad al detalle */}
              <div className="p-3 rounded-xl border border-border/70 bg-muted/25 space-y-2.5">
                <span className="text-[11.5px] font-bold text-foreground flex items-center gap-1">
                  <Plus className="size-3 text-primary" />
                  Añadir Especialidad
                </span>

                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    {/* Autocomplete Especialidad */}
                    <div className="sm:col-span-7 space-y-1">
                      <Autocomplete
                        id="inlineEspecialidadId"
                        value={
                          selectedEspId && selectedEspId > 0
                            ? String(selectedEspId)
                            : ""
                        }
                        onValueChange={(val) => {
                          setSelectedEspId(Number(val) || 0);
                          setEspError(null);
                        }}
                        options={especialidadOptions}
                        placeholder="Buscar especialidad..."
                        emptyText="No hay más especialidades disponibles"
                        allowCustomValue={false}
                        isLoading={isLoadingCatalogoEsp}
                        error={Boolean(espError)}
                        className="w-full text-xs h-8.5"
                      />
                      {espError && (
                        <p className="text-[10.5px] text-destructive font-medium">
                          {espError}
                        </p>
                      )}
                    </div>

                    {/* Checkbox Principal */}
                    <div className="sm:col-span-3 flex items-center gap-2 pb-1.5">
                      <Checkbox
                        id="inlineEsPrincipal"
                        checked={isPrincipalSelected}
                        onCheckedChange={(checked) =>
                          setIsPrincipalSelected(Boolean(checked))
                        }
                      />
                      <Label
                        htmlFor="inlineEsPrincipal"
                        className="text-xs cursor-pointer font-medium select-none flex items-center gap-1"
                      >
                        <Star
                          className={`size-3.5 ${
                            isPrincipalSelected
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span>Principal</span>
                      </Label>
                    </div>

                    {/* Botón Añadir */}
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddEspecialidad()}
                        disabled={isLoadingCatalogoEsp || !selectedEspId}
                        className="w-full h-8.5 text-xs font-semibold gap-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Añadir</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Especialidades en Memoria */}
              {especialidadesList.length === 0 ? (
                <div className="py-6 text-center border border-dashed rounded-xl bg-muted/10 space-y-1">
                  <AlertCircle className="size-5 text-muted-foreground/50 mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    Sin especialidades añadidas
                  </p>
                  <p className="text-[10.5px] text-muted-foreground">
                    Use el selector superior para añadir al menos una especialidad al médico.
                  </p>
                </div>
              ) : (
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-bold h-8">Especialidad</TableHead>
                        <TableHead className="text-xs font-bold h-8 text-center w-32">
                          Tipo
                        </TableHead>
                        <TableHead className="text-xs font-bold h-8 text-right w-16">
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {especialidadesList.map((item) => (
                        <TableRow key={item.especialidadId} className="hover:bg-muted/30">
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                                <Stethoscope className="size-3" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {item.nombre}
                                </p>
                                {item.codigo && (
                                  <span className="font-mono text-[9.5px] text-muted-foreground">
                                    #{item.codigo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-2 text-center">
                            {item.esPrincipal ? (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 gap-1 text-[10px] px-1.5 py-0.2">
                                <Star className="size-2.5 fill-amber-500 text-amber-500" />
                                Principal
                              </Badge>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetPrincipal(item.especialidadId)}
                                className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 cursor-pointer rounded-full"
                                title="Marcar como especialidad principal"
                              >
                                <Star className="size-2.5 mr-1 text-muted-foreground/60" />
                                Hacer Principal
                              </Button>
                            )}
                          </TableCell>

                          <TableCell className="py-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEspecialidad(item.especialidadId)}
                              className="size-6.5 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                              title="Quitar especialidad"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs h-8.5 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="medico-main-form"
            size="sm"
            disabled={isLoading}
            className="text-xs h-8.5 font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>{isEditing ? "Guardar Cambios" : "Crear Médico"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
