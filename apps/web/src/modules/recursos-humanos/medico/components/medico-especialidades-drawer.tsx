"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Star, Trash2, Stethoscope } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { useEspecialidades } from "@/modules/recursos-humanos/especialidad/hooks/use-especialidades";
import {
  useCreateMedicoEspecialidad,
  useDeleteMedicoEspecialidad,
  useMedicoEspecialidades,
  useUpdateMedicoEspecialidad,
} from "../hooks/use-medicos";
import {
  medicoEspecialidadSchema,
  type MedicoEspecialidadFormValues,
} from "../schemas/medico.schema";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoEspecialidadesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medico: MedicoResponse | null;
}

export function MedicoEspecialidadesDrawer({
  open,
  onOpenChange,
  medico,
}: MedicoEspecialidadesDrawerProps) {
  const empleadoId = medico?.empleadoId ?? 0;
  const medicoId = medico?.id ?? 0;

  const { data: especialidadesMedicoData, isLoading: isLoadingMedicoEspecialidades } =
    useMedicoEspecialidades(empleadoId, medicoId, open);

  const { data: especialidadesCatalogoData, isLoading: isLoadingCatalogo } =
    useEspecialidades({ pageSize: 200 });

  const createMutation = useCreateMedicoEspecialidad();
  const updateMutation = useUpdateMedicoEspecialidad();
  const deleteMutation = useDeleteMedicoEspecialidad();

  const especialidadesMedico = React.useMemo(
    () => especialidadesMedicoData?.items ?? [],
    [especialidadesMedicoData]
  );

  const especialidadesCatalogo = React.useMemo(
    () => especialidadesCatalogoData?.items ?? [],
    [especialidadesCatalogoData]
  );

  const especialidadOptions: AutocompleteOption[] = React.useMemo(() => {
    return especialidadesCatalogo.map((esp) => ({
      value: String(esp.id),
      label: esp.nombre,
      description: esp.codigo ? `Cód: ${esp.codigo}` : undefined,
    }));
  }, [especialidadesCatalogo]);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MedicoEspecialidadFormValues>({
    resolver: zodResolver(medicoEspecialidadSchema),
    defaultValues: {
      especialidadId: 0,
      esPrincipal: false,
    },
  });

  const selectedEspecialidadId = watch("especialidadId");
  const esPrincipalVal = watch("esPrincipal");

  React.useEffect(() => {
    if (open) {
      reset({
        especialidadId: 0,
        esPrincipal: false,
      });
    }
  }, [open, reset]);

  const onSubmitAdd = async (values: MedicoEspecialidadFormValues) => {
    if (!medico) return;
    try {
      await createMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        request: {
          especialidadId: values.especialidadId,
          esPrincipal: values.esPrincipal,
        },
      });
      reset({
        especialidadId: 0,
        esPrincipal: false,
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleTogglePrincipal = async (espRelId: number, currentEspId: number, currentEsPrincipal: boolean) => {
    if (!medico || currentEsPrincipal) return;
    try {
      await updateMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id: espRelId,
        request: {
          especialidadId: currentEspId,
          esPrincipal: true,
        },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: number) => {
    if (!medico) return;
    try {
      await deleteMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id,
      });
    } catch {
      // Error handled by mutation
    }
  };

  const medicoNombre = medico?.empleado?.nombreCompleto || `Médico #${medico?.id}`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-2xl overflow-y-auto p-6 space-y-6">
          <DrawerHeader className="p-0">
            <div className="flex items-center gap-2 text-primary">
              <Stethoscope className="size-5" />
              <DrawerTitle className="text-lg">Especialidades Médicas</DrawerTitle>
            </div>
            <DrawerDescription>
              Gestión de especialidades acreditadas para <span className="font-semibold text-foreground">{medicoNombre}</span> (Matrícula: {medico?.matriculaProfesional}).
            </DrawerDescription>
          </DrawerHeader>

          {/* Formulario Agregar Especialidad */}
          <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Asignar Nueva Especialidad
            </h4>
            <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-7 space-y-1.5">
                  <Label htmlFor="especialidadId" className="text-xs">
                    Especialidad Médica
                  </Label>
                  <Autocomplete
                    id="especialidadId"
                    value={selectedEspecialidadId ? String(selectedEspecialidadId) : ""}
                    onValueChange={(val) =>
                      setValue("especialidadId", Number(val), { shouldValidate: true })
                    }
                    options={especialidadOptions}
                    placeholder="Buscar especialidad..."
                    emptyText="No se encontraron especialidades"
                    allowCustomValue={false}
                    isLoading={isLoadingCatalogo}
                    error={Boolean(errors.especialidadId)}
                  />
                  {errors.especialidadId && (
                    <p className="text-xs text-destructive">
                      {errors.especialidadId.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3 flex items-center gap-2 pb-2">
                  <Checkbox
                    id="esPrincipal"
                    checked={esPrincipalVal}
                    onCheckedChange={(checked) => setValue("esPrincipal", Boolean(checked))}
                  />
                  <Label htmlFor="esPrincipal" className="text-xs cursor-pointer font-medium">
                    Es Principal
                  </Label>
                </div>

                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full h-9"
                    disabled={createMutation.isPending || isSubmitting}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="size-3.5 mr-1" /> Asignar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Listado de Especialidades Asignadas */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Especialidades Asignadas ({especialidadesMedico.length})
            </h4>

            {isLoadingMedicoEspecialidades ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" /> Cargando especialidades del médico...
              </div>
            ) : especialidadesMedico.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg text-sm text-muted-foreground">
                El médico aún no tiene especialidades asignadas.
              </div>
            ) : (
              <div className="divide-y border rounded-lg">
                {especialidadesMedico.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Stethoscope className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {item.especialidad?.nombre || `Especialidad #${item.especialidadId}`}
                          </p>
                          {item.esPrincipal ? (
                            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 gap-1 text-[11px]">
                              <Star className="size-3 fill-amber-100" /> Principal
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[11px] text-muted-foreground hover:text-amber-600 px-2"
                              onClick={() => handleTogglePrincipal(item.id, item.especialidadId, item.esPrincipal)}
                              disabled={updateMutation.isPending}
                            >
                              Marcar como principal
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          Código: {item.especialidad?.codigo || "N/A"}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
