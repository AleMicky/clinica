"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Stethoscope,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { usePacientes } from "../../pacientes/hooks/use-pacientes";
import { useMedicos } from "@/modules/recursos-humanos/medico/hooks/use-medicos";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio/hooks/use-categoria-servicio";
import { useServicios } from "@/modules/servicios/servicio/hooks/use-servicio";
import { useCreateAdmision } from "../hooks/use-admisiones";
import type { CreateAdmisionDetalleRequest } from "../types/admision.types";
import { toast } from "sonner";

interface ServiceItemState extends CreateAdmisionDetalleRequest {
  id: string;
  servicioNombre?: string;
}

export function AdmisionPageForm() {
  const router = useRouter();

  // Consumo 100% de la API mediante React Query
  const { data: pacientesData, isLoading: isLoadingPacientes } = usePacientes({
    pageSize: 100,
  });
  const { data: conveniosData, isLoading: isLoadingConvenios } = useConvenios({
    pageSize: 100,
  });
  const { data: medicosData, isLoading: isLoadingMedicos } = useMedicos({
    pageSize: 100,
  });
  const { data: categoriasData } = useCategoriasServicio({ pageSize: 100 });

  const firstCategoryId = categoriasData?.items?.[0]?.id ?? 1;
  const { data: serviciosData } = useServicios(firstCategoryId, { pageSize: 100 });

  const createMutation = useCreateAdmision();

  // Estados del Formulario
  const [pacienteId, setPacienteId] = React.useState<string>("");
  const [convenioId, setConvenioId] = React.useState<string>("particular");
  const [fechaHora, setFechaHora] = React.useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [observacion, setObservacion] = React.useState<string>("");

  // Lista dinámica de servicios añadidos en la admisión
  const [detalles, setDetalles] = React.useState<ServiceItemState[]>([]);

  // Inicialización
  React.useEffect(() => {
    const firstService = serviciosData?.items?.[0];
    if (detalles.length === 0) {
      setDetalles([
        {
          id: Math.random().toString(),
          servicioId: firstService?.id ?? 1,
          servicioNombre: firstService?.nombre ?? "Servicio Médico",
          medicoId: undefined,
          cantidad: 1,
          precioUnitario: 100,
          descuento: 0,
        },
      ]);
    }
  }, [serviciosData, detalles.length]);

  const handleAddDetalle = () => {
    const firstService = serviciosData?.items?.[0];
    setDetalles((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        servicioId: firstService?.id ?? 1,
        servicioNombre: firstService?.nombre ?? "Servicio Médico",
        medicoId: undefined,
        cantidad: 1,
        precioUnitario: 100,
        descuento: 0,
      },
    ]);
  };

  const handleRemoveDetalle = (id: string) => {
    if (detalles.length <= 1) {
      toast.warning("La admisión debe tener al menos una prestación médica.");
      return;
    }
    setDetalles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateDetalle = (
    id: string,
    field: keyof ServiceItemState,
    value: unknown
  ) => {
    setDetalles((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        if (field === "servicioId" && serviciosData?.items) {
          const selectedServ = serviciosData.items.find((s) => s.id === Number(value));
          if (selectedServ) {
            updated.servicioNombre = selectedServ.nombre;
          }
        }

        return updated;
      })
    );
  };

  // Totales
  const totalSubtotal = detalles.reduce(
    (acc, d) => acc + d.cantidad * d.precioUnitario,
    0
  );
  const totalDescuentos = detalles.reduce((acc, d) => acc + Number(d.descuento || 0), 0);
  const grandTotal = Math.max(0, totalSubtotal - totalDescuentos);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteId) {
      toast.error("Por favor seleccione un paciente para registrar la admisión.");
      return;
    }

    if (detalles.length === 0) {
      toast.error("Debe agregar al menos un servicio o procedimiento médico.");
      return;
    }

    const payload = {
      pacienteId: Number(pacienteId),
      convenioId: convenioId === "particular" ? null : Number(convenioId),
      fechaHora: new Date(fechaHora).toISOString(),
      observacion: observacion.trim() || undefined,
      detalles: detalles.map((d) => ({
        servicioId: Number(d.servicioId),
        medicoId: d.medicoId ? Number(d.medicoId) : null,
        cantidad: Number(d.cantidad) || 1,
        precioUnitario: Number(d.precioUnitario) || 0,
        descuento: Number(d.descuento) || 0,
      })),
    };

    try {
      const res = await createMutation.mutateAsync(payload);
      toast.success(`Admisión #${res.numero || res.id} registrada correctamente.`);
      router.push("/recepcion/admisiones");
    } catch {
      toast.error("Error al guardar la admisión en el servidor.");
    }
  };

  const pacientesList = pacientesData?.items ?? [];
  const conveniosList = conveniosData?.items ?? [];
  const medicosList = medicosData?.items ?? [];
  const serviciosList = serviciosData?.items ?? [];

  return (
    <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto pb-12 animate-in fade-in-50 duration-300">
      {/* CABECERA CON BOTÓN REGRESAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-primary/5 p-5 rounded-xl border border-border/70 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/recepcion/admisiones")}
            className="size-9 rounded-lg border-border/80 hover:bg-accent"
            title="Volver a la lista de admisiones"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Nueva Admisión de Paciente
              </h1>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                Página Completa
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registra los datos del paciente, convenio y prestaciones médicas para recepción.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/recepcion/admisiones")}
            disabled={createMutation.isPending}
            className="h-9 px-4 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="h-9 px-5 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-md shadow-primary/20"
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Guardar Admisión
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* BLOQUE 1: DATOS DEL PACIENTE E INGRESO */}
        <Card className="border border-border/70 shadow-xs bg-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <User className="size-3.5" />
              </div>
              1. Datos del Ingreso y Paciente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Paciente */}
              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-xs font-semibold">
                  Paciente <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={pacienteId}
                  onValueChange={(val) => setPacienteId(val || "")}
                >
                  <SelectTrigger className="h-10 text-xs bg-background">
                    <SelectValue placeholder={isLoadingPacientes ? "Cargando pacientes..." : "Buscar o seleccionar paciente..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientesList.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        No hay pacientes registrados en el sistema.
                      </div>
                    ) : (
                      pacientesList.map((p) => {
                        const nombreCompleto = p.persona
                          ? `${p.persona.nombres} ${p.persona.apellidoPaterno} ${p.persona.apellidoMaterno || ""}`.trim()
                          : `Paciente #${p.id}`;
                        const doc = p.persona?.numeroDocumento
                          ? `(DNI: ${p.persona.numeroDocumento})`
                          : "";
                        return (
                          <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                            {nombreCompleto} {doc}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Convenio / Cobertura */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Building2 className="size-3 text-muted-foreground" />
                  Convenio / Cobertura
                </Label>
                <Select
                  value={convenioId}
                  onValueChange={(val) => setConvenioId(val || "particular")}
                >
                  <SelectTrigger className="h-10 text-xs bg-background">
                    <SelectValue placeholder={isLoadingConvenios ? "Cargando convenios..." : "Particular / Convenio..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular" className="text-xs">
                      Particular (Sin Convenio)
                    </SelectItem>
                    {conveniosList.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()} className="text-xs">
                        {c.nombre} ({c.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha y Hora */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  Fecha y Hora de Ingreso
                </Label>
                <Input
                  type="datetime-local"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  className="h-10 text-xs bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOQUE 2: PRESTACIONES Y SERVICIOS MÉDICOS */}
        <Card className="border border-border/70 shadow-xs bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Stethoscope className="size-3.5" />
                </div>
                2. Servicios y Prestaciones Médicas ({detalles.length})
              </h3>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDetalle}
                className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Plus className="size-3.5" />
                Agregar Servicio
              </Button>
            </div>

            {/* TABLA DE PRESTACIONES DE PÁGINA COMPLETA */}
            <div className="rounded-xl border border-border/70 overflow-hidden bg-background">
              <div className="bg-muted/60 p-3 text-xs font-semibold text-muted-foreground grid grid-cols-12 gap-3">
                <span className="col-span-4">Servicio Clínico</span>
                <span className="col-span-3">Médico Tratante</span>
                <span className="col-span-1 text-center">Cant.</span>
                <span className="col-span-2 text-right">Precio Unit. (S/.)</span>
                <span className="col-span-1 text-right">Desc. (S/.)</span>
                <span className="col-span-1 text-center">Acción</span>
              </div>

              <div className="divide-y divide-border/60">
                {detalles.map((row) => (
                  <div key={row.id} className="p-3 grid grid-cols-12 gap-3 items-center hover:bg-muted/20 transition-colors">
                    {/* Servicio */}
                    <div className="col-span-4">
                      <Select
                        value={row.servicioId.toString()}
                        onValueChange={(val) =>
                          handleUpdateDetalle(row.id, "servicioId", Number(val))
                        }
                      >
                        <SelectTrigger className="h-9 text-xs bg-background">
                          <SelectValue placeholder="Seleccionar servicio..." />
                        </SelectTrigger>
                        <SelectContent>
                          {serviciosList.length === 0 ? (
                            <SelectItem value={row.servicioId.toString()} className="text-xs">
                              {row.servicioNombre || `Servicio #${row.servicioId}`}
                            </SelectItem>
                          ) : (
                            serviciosList.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()} className="text-xs">
                                {s.nombre} ({s.codigo})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Médico Tratante */}
                    <div className="col-span-3">
                      <Select
                        value={row.medicoId ? row.medicoId.toString() : "sin-medico"}
                        onValueChange={(val) =>
                          handleUpdateDetalle(
                            row.id,
                            "medicoId",
                            val === "sin-medico" || !val ? undefined : Number(val)
                          )
                        }
                      >
                        <SelectTrigger className="h-9 text-xs bg-background">
                          <SelectValue placeholder={isLoadingMedicos ? "Cargando médicos..." : "Sin Asignar / Guardia"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sin-medico" className="text-xs italic text-muted-foreground">
                            Sin Médico Específico / Guardia
                          </SelectItem>
                          {medicosList.map((m) => {
                            const nombre = m.empleado?.nombreCompleto || `Médico #${m.id}`;
                            return (
                              <SelectItem key={m.id} value={m.id.toString()} className="text-xs">
                                {nombre} (Mat: {m.matriculaProfesional})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="1"
                        value={row.cantidad}
                        onChange={(e) =>
                          handleUpdateDetalle(row.id, "cantidad", Number(e.target.value))
                        }
                        className="h-9 text-xs text-center px-1 bg-background"
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">S/.</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={row.precioUnitario}
                          onChange={(e) =>
                            handleUpdateDetalle(row.id, "precioUnitario", Number(e.target.value))
                          }
                          className="h-9 text-xs text-right pl-7 bg-background"
                        />
                      </div>
                    </div>

                    {/* Descuento */}
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={row.descuento}
                        onChange={(e) =>
                          handleUpdateDetalle(row.id, "descuento", Number(e.target.value))
                        }
                        className="h-9 text-xs text-right px-2 bg-background"
                      />
                    </div>

                    {/* Eliminar */}
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDetalle(row.id)}
                        className="size-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                        title="Quitar prestación"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RESUMEN DE TOTALES Y SUBDETALLES */}
            <div className="p-4 bg-muted/40 rounded-xl border border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-6 text-muted-foreground">
                <span>Subtotal Neto: <strong className="text-foreground">S/. {totalSubtotal.toFixed(2)}</strong></span>
                <span>Descuento Aplicado: <strong className="text-emerald-600">-S/. {totalDescuentos.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  Total Admisión:
                </span>
                <span className="text-lg font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 shadow-xs">
                  S/. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOQUE 3: OBSERVACIONES CLINICAS Y BOTONES */}
        <Card className="border border-border/70 shadow-xs bg-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="size-3.5" />
              </div>
              3. Observaciones e Indicaciones Clínicas
            </h3>

            <Textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Escriba sintomatología de ingreso, observaciones para recepción o instrucciones del médico..."
              rows={3}
              className="text-xs bg-background border-border/70 resize-none"
            />
          </CardContent>
        </Card>

        {/* BARRA FLOTANTE DE ACCIONES EN INFERIOR */}
        <div className="flex items-center justify-between p-4 bg-card border border-border/70 rounded-xl shadow-md">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DollarSign className="size-4 text-emerald-600" />
            <span>Estado inicial de registro: <strong className="text-blue-600">Registrada</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/recepcion/admisiones")}
              disabled={createMutation.isPending}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="h-9 px-5 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-md shadow-primary/20"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Registrar Admisión
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
