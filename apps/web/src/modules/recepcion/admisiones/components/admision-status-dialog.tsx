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
  EstadoAdmision,
  EstadoAdmisionLabels,
  type AdmisionResponse,
} from "../types/admision.types";
import { AdmisionStatusBadge } from "./admision-status-badge";
import { ArrowRight, RefreshCw } from "lucide-react";

interface AdmisionStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admision: AdmisionResponse | null;
  onConfirm: (targetEstado: EstadoAdmision, observacion?: string) => Promise<void>;
  isLoading?: boolean;
}

export function AdmisionStatusDialog({
  open,
  onOpenChange,
  admision,
  onConfirm,
  isLoading = false,
}: AdmisionStatusDialogProps) {
  const [selectedEstado, setSelectedEstado] = React.useState<EstadoAdmision | null>(null);
  const [observacion, setObservacion] = React.useState("");

  React.useEffect(() => {
    if (admision) {
      setSelectedEstado(admision.estado);
      setObservacion(admision.observacion || "");
    }
  }, [admision, open]);

  if (!admision) return null;

  const handleSave = async () => {
    if (!selectedEstado) return;
    await onConfirm(selectedEstado, observacion.trim() || undefined);
    onOpenChange(false);
  };

  const estadosDisponibles = [
    EstadoAdmision.Registrada,
    EstadoAdmision.PendientePago,
    EstadoAdmision.Pagada,
    EstadoAdmision.EnAtencion,
    EstadoAdmision.Finalizada,
    EstadoAdmision.Cancelada,
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <RefreshCw className="size-4 text-primary" />
            Cambiar Estado de Admisión #{admision.numero}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Actualiza la fase del paciente en el flujo de atención clínica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Paciente Resumen */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border/60 flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-foreground">
                {admision.pacienteNombre || `Paciente #${admision.pacienteId}`}
              </p>
              <p className="text-muted-foreground text-[11px]">
                Convenio: {admision.convenioNombre || "Particular"}
              </p>
            </div>
            <AdmisionStatusBadge estado={admision.estado} />
          </div>

          {/* Selector de Nuevo Estado */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nuevo Estado</Label>
            <div className="flex items-center gap-2">
              <div className="shrink-0 text-muted-foreground text-xs font-medium">
                Actual: <AdmisionStatusBadge estado={admision.estado} />
              </div>
              <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              <Select
                value={selectedEstado?.toString()}
                onValueChange={(val) => setSelectedEstado(Number(val) as EstadoAdmision)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  {estadosDisponibles.map((est) => (
                    <SelectItem key={est} value={est.toString()} className="text-xs">
                      {EstadoAdmisionLabels[est]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observación adicional */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nota u Observación de Recepción</Label>
            <Textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Escriba algún detalle relevante sobre el cambio de estado..."
              rows={3}
              className="text-xs bg-background border-border/70 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-8 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isLoading || selectedEstado === admision.estado}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            {isLoading && <RefreshCw className="size-3 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
