"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  User,
  Calendar,
  Printer,
  Stethoscope,
  Clock,
  Building2,
  CheckCircle2,
  Download,
  Loader2,
  ShieldCheck,
  Phone,
  Pencil,
} from "lucide-react";
import {
  EstadoAdmision,
  formatConvenioNombre,
  formatMedicoNombre,
  formatPacienteDocumento,
  formatPacienteNombre,
  formatServicioNombre,
  type AdmisionResponse,
} from "../types/admision.types";
import { downloadAdmisionPdf, openAdmisionPdfInNewTab } from "../api/admision.api";
import { toast } from "sonner";
import { AdmisionStatusBadge } from "./admision-status-badge";

interface AdmisionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admision: AdmisionResponse | null;
  onChangeStatusClick?: (admision: AdmisionResponse) => void;
  onEditClick?: (admision: AdmisionResponse) => void;
}

export function AdmisionDetailSheet({
  open,
  onOpenChange,
  admision,
  onChangeStatusClick,
  onEditClick,
}: AdmisionDetailSheetProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);
  const [isOpeningPdf, setIsOpeningPdf] = React.useState(false);

  if (!admision) return null;

  const totalSubtotal = admision.detalles.reduce(
    (acc, d) => acc + (d.cantidad || 1) * (d.precioUnitario || 0),
    0
  );
  const totalDescuentos = admision.detalles.reduce(
    (acc, d) => acc + (d.descuento || 0),
    0
  );
  const totalCalculado =
    admision.totalAdmision ?? Math.max(0, totalSubtotal - totalDescuentos);

  const nombreCompleto = formatPacienteNombre(
    admision.paciente,
    admision.pacienteNombre
  );
  const documento = formatPacienteDocumento(
    admision.paciente,
    admision.pacienteDocumento
  );
  const hcNumero =
    (admision.paciente && "numeroHistoriaClinica" in admision.paciente
      ? admision.paciente.numeroHistoriaClinica
      : undefined) ||
    (admision.pacienteId
      ? admision.pacienteId.toString().padStart(5, "0")
      : "---");

  const convenio =
    admision.convenio?.nombre ||
    formatConvenioNombre(admision.convenio, admision.convenioNombre);

  const telefonoPaciente =
    admision.paciente &&
    "persona" in admision.paciente &&
    admision.paciente.persona?.telefono
      ? admision.paciente.persona.telefono
      : null;

  const handleOpenPdf = async () => {
    if (!admision) return;
    try {
      setIsOpeningPdf(true);
      await openAdmisionPdfInNewTab(admision.id);
    } catch {
      toast.error("Error al generar vista previa del PDF.");
    } finally {
      setIsOpeningPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!admision) return;
    try {
      setIsDownloadingPdf(true);
      await downloadAdmisionPdf(admision.id, admision.numero);
      toast.success("PDF descargado correctamente.");
    } catch {
      toast.error("Error al descargar el PDF de admisión.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="data-[side=right]:!max-w-3xl data-[side=right]:w-[820px] w-full overflow-y-auto p-0 border-l border-border/80 flex flex-col"
      >
        {/* Cabecera Principal */}
        <SheetHeader className="p-5 border-b border-border/70 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold bg-primary/10 text-primary border-primary/30 px-2 py-0.5"
              >
                #{admision.numero}
              </Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                HC #{hcNumero}
              </Badge>
            </div>
            <AdmisionStatusBadge estado={admision.estado} />
          </div>

          <div className="mt-2">
            <SheetTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary shrink-0" />
              <span>{nombreCompleto}</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-0.5">
              Ficha integral de atención médica, detalle de prestaciones y trazabilidad de cobro.
            </SheetDescription>
          </div>
        </SheetHeader>

        {/* Contenido Principal con Espaciado y Grid */}
        <div className="p-5 space-y-5 flex-1">
          {/* LÍNEA DE TIEMPO / ESTADO EN PROCESO */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-blue-500/5 border border-primary/20 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                Flujo y Estado de la Admisión
              </span>
              <span className="text-[11px] text-muted-foreground font-medium font-mono">
                {new Date(admision.fechaHora).toLocaleString("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 py-1">
              <div className="flex flex-col items-center gap-1 text-[10px]">
                <div
                  className={`size-6 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                    admision.estado >= EstadoAdmision.Registrada &&
                    admision.estado !== EstadoAdmision.Cancelada
                      ? "bg-blue-600 shadow-xs"
                      : admision.estado === EstadoAdmision.Cancelada
                      ? "bg-rose-600 shadow-xs"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  1
                </div>
                <span className="text-[10.5px] font-medium text-foreground">Registro</span>
              </div>
              <div
                className={`h-0.5 flex-1 ${
                  admision.estado >= EstadoAdmision.Confirmada &&
                  admision.estado !== EstadoAdmision.Cancelada
                    ? "bg-emerald-600"
                    : "bg-border/80"
                }`}
              />
              <div className="flex flex-col items-center gap-1 text-[10px]">
                <div
                  className={`size-6 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                    admision.estado >= EstadoAdmision.Confirmada &&
                    admision.estado !== EstadoAdmision.Cancelada
                      ? "bg-emerald-600 shadow-xs"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <span className="text-[10.5px] font-medium text-foreground">Confirmada</span>
              </div>
              <div
                className={`h-0.5 flex-1 ${
                  admision.estado === EstadoAdmision.EnviadaVenta
                    ? "bg-purple-600"
                    : "bg-border/80"
                }`}
              />
              <div className="flex flex-col items-center gap-1 text-[10px]">
                <div
                  className={`size-6 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                    admision.estado === EstadoAdmision.EnviadaVenta
                      ? "bg-purple-600 shadow-xs"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  3
                </div>
                <span className="text-[10.5px] font-medium text-foreground">Enviada a Venta</span>
              </div>
            </div>
          </div>

          {/* TARJETAS SUPERIORES EN GRID: PACIENTE, COBERTURA, RECEPCIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tarjeta 1: Paciente */}
            <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <User className="size-3.5 text-primary" />
                <span>Paciente</span>
              </div>
              <p className="font-bold text-xs text-foreground truncate">{nombreCompleto}</p>
              <p className="text-[11px] text-muted-foreground font-mono">Doc: {documento}</p>
              {telefonoPaciente && (
                <p className="text-[10.5px] text-muted-foreground flex items-center gap-1">
                  <Phone className="size-3 text-muted-foreground/70" />
                  <span>{telefonoPaciente}</span>
                </p>
              )}
            </div>

            {/* Tarjeta 2: Convenio y Cobertura */}
            <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Building2 className="size-3.5 text-primary" />
                <span>Cobertura & Convenio</span>
              </div>
              <p className="font-bold text-xs text-foreground truncate">{convenio}</p>
              {admision.convenio?.codigo && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  Código: {admision.convenio.codigo}
                </p>
              )}
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Cobertura activa
              </span>
            </div>

            {/* Tarjeta 3: Atención y Recepcionista */}
            <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Calendar className="size-3.5 text-primary" />
                <span>Recepción & Fecha</span>
              </div>
              <p className="font-bold text-xs text-foreground font-mono">
                {new Date(admision.fechaHora).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Resp: <strong className="text-foreground">{admision.recepcionista?.nombreCompleto || "Recepción General"}</strong>
              </p>
              {admision.recepcionista?.codigoEmpleado && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({admision.recepcionista.codigoEmpleado})
                </span>
              )}
            </div>
          </div>

          {/* TABLA DE PRESTACIONES MÉDICAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary" />
                Prestaciones y Servicios Médicos ({admision.detalles.length})
              </h4>
            </div>

            <div className="rounded-xl border border-border/70 overflow-hidden bg-card text-xs shadow-2xs">
              {/* Cabecera de la tabla */}
              <div className="bg-muted/40 px-3 py-2 font-bold text-muted-foreground grid grid-cols-12 gap-2 text-[10.5px] uppercase tracking-wider border-b border-border/60">
                <span className="col-span-5 sm:col-span-5">Prestación Médica</span>
                <span className="col-span-4 sm:col-span-3">Médico Responsable</span>
                <span className="col-span-1 text-center">Cant.</span>
                <span className="hidden sm:block sm:col-span-1 text-right">P. Unit.</span>
                <span className="col-span-2 text-right">Subtotal</span>
              </div>

              {/* Filas */}
              <div className="divide-y divide-border/50 max-h-64 overflow-y-auto scrollbar-thin">
                {admision.detalles.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-xs">
                    No hay servicios asociados a esta admisión.
                  </div>
                ) : (
                  admision.detalles.map((item, idx) => (
                    <div
                      key={item.id}
                      className="px-3 py-2 grid grid-cols-12 gap-2 items-center hover:bg-muted/20 transition-colors"
                    >
                      {/* Servicio */}
                      <div className="col-span-5 sm:col-span-5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-primary font-bold">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-foreground text-[11.5px] truncate" title={formatServicioNombre(item)}>
                            {formatServicioNombre(item)}
                          </span>
                        </div>
                        {item.descuento > 0 && (
                          <span className="text-[10px] font-mono text-emerald-600 block pl-4">
                            Desc: -Bs. {item.descuento.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Médico */}
                      <div className="col-span-4 sm:col-span-3 text-[11px] text-muted-foreground truncate" title={formatMedicoNombre(item)}>
                        {formatMedicoNombre(item)}
                      </div>

                      {/* Cantidad */}
                      <div className="col-span-1 text-center font-mono font-bold text-foreground">
                        {item.cantidad}
                      </div>

                      {/* Precio Unitario */}
                      <div className="hidden sm:block sm:col-span-1 text-right font-mono text-[11px] text-muted-foreground">
                        {item.precioUnitario?.toFixed(2)}
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-2 text-right font-mono font-bold text-foreground text-xs">
                        Bs. {item.total?.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Resumen de Totales */}
              <div className="p-3 bg-muted/30 border-t border-border/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Subtotal: <strong className="text-foreground font-mono">Bs. {totalSubtotal.toFixed(2)}</strong></span>
                  {totalDescuentos > 0 && (
                    <span>Descuentos: <strong className="text-emerald-600 font-mono">-Bs. {totalDescuentos.toFixed(2)}</strong></span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total a Pagar:
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 font-mono">
                    Bs. {totalCalculado.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GRID INFERIOR: OBSERVACIONES Y AUDITORÍA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* OBSERVACIONES */}
            <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-2xs">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                Observaciones de Recepción
              </h4>
              <p className="text-xs text-muted-foreground italic min-h-[40px] p-2 bg-muted/20 rounded-lg border border-border/40">
                {admision.observacion ? `"${admision.observacion}"` : "Sin observaciones registradas."}
              </p>
            </div>

            {/* AUDITORÍA DEL REGISTRO */}
            <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-2xs">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Auditoría del Registro
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs p-2 bg-muted/20 rounded-lg border border-border/40">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Creado por:</span>
                  <span className="font-bold text-foreground text-[11px] block truncate">
                    {admision.creadoPor || "Sistema"}
                  </span>
                  {admision.fechaCreacion && (
                    <span className="text-[10px] text-muted-foreground/80 block font-mono">
                      {new Date(admision.fechaCreacion).toLocaleString("es-ES", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground block">Última Modif:</span>
                  <span className="font-bold text-foreground text-[11px] block truncate">
                    {admision.modificadoPor || "Sin cambios"}
                  </span>
                  {admision.fechaModificacion && (
                    <span className="text-[10px] text-muted-foreground/80 block font-mono">
                      {new Date(admision.fechaModificacion).toLocaleString("es-ES", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR DE ACCIONES (STICKY FOOTER) */}
        <div className="p-4 border-t border-border/70 bg-card shrink-0 flex items-center justify-between gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-xs font-medium cursor-pointer"
          >
            Cerrar
          </Button>

          <div className="flex items-center gap-2">
            {admision.estado === EstadoAdmision.Registrada && onEditClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEditClick(admision);
                }}
                className="h-9 px-3 text-xs font-semibold gap-1.5 cursor-pointer border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <Pencil className="size-3.5" />
                Editar
              </Button>
            )}

            {onChangeStatusClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onChangeStatusClick(admision);
                }}
                className="h-9 px-3 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="size-3.5 text-primary" />
                Cambiar Estado
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={isOpeningPdf}
              onClick={handleOpenPdf}
              className="h-9 px-3 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              {isOpeningPdf ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Printer className="size-3.5 text-primary" />
              )}
              Ver Ticket PDF
            </Button>

            <Button
              variant="default"
              size="sm"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              className="h-9 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
            >
              {isDownloadingPdf ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              Descargar PDF
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
