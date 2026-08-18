"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  medicoNombre?: string;
}

interface AdmisionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessCallback?: () => void;
}

export function AdmisionFormDialog({
  open,
  onOpenChange,
  onSuccessCallback,
}: AdmisionFormDialogProps) {
  // Consumo 100% directo de la API mediante React Query
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

  // Obtener primera categoría activa para listar servicios de API
  const firstCategoryId = categoriasData?.items?.[0]?.id;
  const { data: serviciosData } = useServicios(
    firstCategoryId ?? 0,
    { pageSize: 100 },
    Boolean(open && firstCategoryId)
  );

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

  // Inicializar estado al abrir el modal
  React.useEffect(() => {
    if (open) {
      setPacienteId("");
      setConvenioId("particular");
      setFechaHora(new Date().toISOString().slice(0, 16));
      setObservacion("");

      const firstService = serviciosData?.items?.[0];
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
  }, [open, serviciosData]);

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

  // Cálculo de totales
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
      toast.success(`Admisión #${res.numero || res.id} creada correctamente en el sistema.`);
      onOpenChange(false);
      onSuccessCallback?.();
    } catch {
      toast.error("Error al registrar admisión en la API.");
    }
  };

  const pacientesList = pacientesData?.items ?? [];
  const conveniosList = conveniosData?.items ?? [];
  const medicosList = medicosData?.items ?? [];
  const serviciosList = serviciosData?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[92vh] flex flex-col p-0 border-border/80 shadow-xl overflow-hidden">
        <DialogHeader className="p-5 border-b border-border/70 bg-gradient-to-r from-muted/50 via-background to-primary/5">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Nueva Admisión de Paciente
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Registro de admisiones conectado directamente al backend de Recepción.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="p-4 rounded-xl border border-border/70 bg-card space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="size-3.5 text-primary" />
              1. Datos del Ingreso y Paciente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Seleccionar Paciente desde API */}
              <div className="space-y-1 md:col-span-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Paciente <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={pacienteId}
                  onValueChange={(val) => setPacienteId(val || "")}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder={isLoadingPacientes ? "Cargando pacientes..." : "Seleccionar paciente..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientesList.length === 0 ? (
                      <div className="p-2 text-center text-xs text-muted-foreground">
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

              {/* Seleccionar Convenio desde API */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Building2 className="size-3 text-muted-foreground" />
                  Convenio / Cobertura
                </Label>
                <Select
                  value={convenioId}
                  onValueChange={(val) => setConvenioId(val || "particular")}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder={isLoadingConvenios ? "Cargando..." : "Particular / Convenio..."} />
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

              {/* Fecha y Hora de Ingreso */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  Fecha y Hora
                </Label>
                <Input
                  type="datetime-local"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: SERVICIOS Y PRESTACIONES MÉDICAS */}
          <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary" />
                2. Servicios y Prestaciones Médicas ({detalles.length})
              </h3>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDetalle}
                className="h-8 text-xs font-semibold gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Plus className="size-3.5" />
                Agregar Servicio
              </Button>
            </div>

            {/* TABLA DINÁMICA DE SERVICIOS */}
            <div className="rounded-lg border border-border/70 overflow-hidden bg-background">
              <div className="bg-muted/60 p-2 text-[11px] font-semibold text-muted-foreground grid grid-cols-12 gap-2">
                <span className="col-span-4">Servicio Clínico</span>
                <span className="col-span-3">Médico Tratante</span>
                <span className="col-span-1 text-center">Cant.</span>
                <span className="col-span-2 text-right">Precio Unit.</span>
                <span className="col-span-1 text-right">Desc.</span>
                <span className="col-span-1 text-center">Acción</span>
              </div>

              <div className="divide-y divide-border/60">
                {detalles.map((row) => (
                  <div key={row.id} className="p-2.5 grid grid-cols-12 gap-2 items-center">
                    {/* Servicio desde API */}
                    <div className="col-span-4">
                      <Select
                        value={row.servicioId.toString()}
                        onValueChange={(val) =>
                          handleUpdateDetalle(row.id, "servicioId", Number(val))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Servicio..." />
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

                    {/* Médico desde API */}
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
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder={isLoadingMedicos ? "Cargando médicos..." : "Sin Asignar / Guardia"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sin-medico" className="text-xs italic text-muted-foreground">
                            Sin Médico Específico
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
                        className="h-8 text-xs text-center px-1 bg-background"
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-[10px] text-muted-foreground">S/.</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={row.precioUnitario}
                          onChange={(e) =>
                            handleUpdateDetalle(row.id, "precioUnitario", Number(e.target.value))
                          }
                          className="h-8 text-xs text-right pl-6 bg-background"
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
                        className="h-8 text-xs text-right px-1 bg-background"
                      />
                    </div>

                    {/* Quitar */}
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDetalle(row.id)}
                        className="size-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
                        title="Quitar servicio"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RESUMEN DE TOTALES EN VIVO */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>Subtotal: <strong>Bs. {totalSubtotal.toFixed(2)}</strong></span>
                <span>Descuento Total: <strong className="text-emerald-600">-Bs. {totalDescuentos.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">Importe Total:</span>
                <span className="text-base font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                  Bs. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: OBSERVACIÓN DE RECEPCIÓN */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <FileText className="size-3 text-muted-foreground" />
              Observaciones Clínicas o Indicaciones Adicionales
            </Label>
            <Textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Indique sintomatología inicial, prioridades de atención, o requerimientos especiales del paciente..."
              rows={2}
              className="text-xs bg-background border-border/70 resize-none"
            />
          </div>
        </form>

        <DialogFooter className="p-4 border-t border-border/70 bg-muted/30 flex justify-between items-center">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="size-3.5 text-emerald-600" />
            <span>Estado inicial: <strong className="text-blue-600">Registrada</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="h-8 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-sm"
            >
              {createMutation.isPending && <Loader2 className="size-3 animate-spin" />}
              Guardar Admisión
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
