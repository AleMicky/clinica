"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Star,
  Trash2,
  Stethoscope,
  UserCheck,
  FileBadge,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { StatusBadge } from "@/components/shared";
import { useEspecialidades } from "@/modules/recursos-humanos/especialidad/hooks/use-especialidades";
import {
  useCreateMedicoEspecialidad,
  useDeleteMedicoEspecialidad,
  useMedico,
  useMedicoEspecialidades,
  useUpdateMedicoEspecialidad,
} from "../hooks/use-medicos";
import {
  medicoEspecialidadSchema,
  type MedicoEspecialidadFormValues,
} from "../schemas/medico.schema";

interface MedicoEspecialidadesViewProps {
  medicoId: number;
}

export function MedicoEspecialidadesView({ medicoId }: MedicoEspecialidadesViewProps) {
  const router = useRouter();

  const { data: medico, isLoading: isLoadingMedico } = useMedico(medicoId);
  const empleadoId = medico?.empleadoId ?? 0;

  const { data: especialidadesMedicoData, isLoading: isLoadingMedicoEspecialidades } =
    useMedicoEspecialidades(empleadoId, medicoId, Boolean(medico));

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
      // Error handled by mutation toast
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
      // Error handled by mutation toast
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
      // Error handled by mutation toast
    }
  };

  if (isLoadingMedico) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Cargando expediente médico...</span>
      </div>
    );
  }

  if (!medico) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => router.push("/recursos-humanos/medicos")} className="text-xs gap-1.5">
          <ArrowLeft className="size-4" /> Volver a Médicos
        </Button>
        <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground text-sm">
          No se encontró información para el médico solicitado.
        </div>
      </div>
    );
  }

  const nombreCompleto =
    medico.empleado?.nombreCompleto ||
    [
      medico.empleado?.persona?.nombres,
      medico.empleado?.persona?.apellidoPaterno,
      medico.empleado?.persona?.apellidoMaterno,
    ]
      .filter(Boolean)
      .join(" ") ||
    `Empleado #${medico.empleadoId}`;

  const codigoEmpleado = medico.empleado?.codigoEmpleado || `EMP-${medico.empleadoId}`;

  const initials = nombreCompleto
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "MD";

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/recursos-humanos/medicos")}
          className="text-xs gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Volver a Médicos</span>
        </Button>
      </div>

      {/* Header Info Card */}
      <Card className="shadow-xs border-border/70 overflow-hidden bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <Avatar className="size-12 border-2 border-primary/20 bg-primary/10 text-primary shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground truncate">{nombreCompleto}</h1>
                  <StatusBadge active={medico.activo} activeLabel="Activo" inactiveLabel="Inactivo" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="font-mono flex items-center gap-1">
                    <UserCheck className="size-3 text-muted-foreground" />
                    {codigoEmpleado}
                  </span>
                  <span>•</span>
                  <span className="font-mono flex items-center gap-1 font-semibold text-foreground">
                    <CreditCard className="size-3 text-muted-foreground" />
                    Matrícula: {medico.matriculaProfesional}
                  </span>
                  {medico.registroMinisterioSalud && (
                    <>
                      <span>•</span>
                      <span className="font-mono flex items-center gap-1 text-muted-foreground">
                        <FileBadge className="size-3 text-sky-500" />
                        Minsal: {medico.registroMinisterioSalud}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Badge variant="outline" className="self-start sm:self-center gap-1.5 px-3 py-1 bg-primary/5 text-primary border-primary/20 text-xs font-semibold">
              <Stethoscope className="size-4" />
              Gestión de Especialidades
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Form Column */}
        <Card className="lg:col-span-5 shadow-xs border-border/70">
          <CardHeader className="p-4 pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              <span>Asignar Especialidad</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Seleccione la especialidad médica que acredita el profesional.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="especialidadId" className="text-xs">
                  Especialidad Médica <span className="text-destructive">*</span>
                </Label>
                <Autocomplete
                  id="especialidadId"
                  value={selectedEspecialidadId ? String(selectedEspecialidadId) : ""}
                  onValueChange={(val) =>
                    setValue("especialidadId", Number(val), { shouldValidate: true })
                  }
                  options={especialidadOptions}
                  placeholder="Buscar especialidad por nombre..."
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

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="esPrincipal"
                  checked={esPrincipalVal}
                  onCheckedChange={(checked) => setValue("esPrincipal", Boolean(checked))}
                />
                <Label htmlFor="esPrincipal" className="text-xs cursor-pointer font-medium">
                  Marcar como Especialidad Principal
                </Label>
              </div>

              <Button
                type="submit"
                size="sm"
                className="w-full text-xs gap-1.5 cursor-pointer mt-2"
                disabled={createMutation.isPending || isSubmitting}
              >
                {createMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="size-4" /> Asignar a Expediente
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List Column */}
        <Card className="lg:col-span-7 shadow-xs border-border/70">
          <CardHeader className="p-4 pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                <span>Especialidades Asignadas</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Listado de especialidades vigentes en la ficha del médico.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-bold text-xs">
              {especialidadesMedico.length}
            </Badge>
          </CardHeader>

          <CardContent className="p-4">
            {isLoadingMedicoEspecialidades ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
                <Loader2 className="size-5 animate-spin text-primary" /> Cargando especialidades...
              </div>
            ) : especialidadesMedico.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl text-sm text-muted-foreground">
                El médico aún no tiene especialidades asignadas en su expediente.
              </div>
            ) : (
              <div className="divide-y border rounded-xl overflow-hidden bg-card">
                {especialidadesMedico.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Stethoscope className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground">
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
                              className="h-6 text-[11px] text-muted-foreground hover:text-amber-600 px-2 cursor-pointer"
                              onClick={() => handleTogglePrincipal(item.id, item.especialidadId, item.esPrincipal)}
                              disabled={updateMutation.isPending}
                            >
                              Marcar principal
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          Código: {item.especialidad?.codigo || "N/A"}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive cursor-pointer rounded-md"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      title="Desasignar especialidad"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
