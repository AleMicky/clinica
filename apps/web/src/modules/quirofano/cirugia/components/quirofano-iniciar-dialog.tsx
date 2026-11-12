"use client";

import * as React from "react";
import { Play, Activity, Clock, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIniciarCirugia } from "../hooks/use-quirofano";
import type { CirugiaResponse } from "../types/quirofano.types";
import { toast } from "sonner";

interface QuirofanoIniciarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cirugia: CirugiaResponse | null;
}

export function QuirofanoIniciarDialog({
  open,
  onOpenChange,
  cirugia,
}: QuirofanoIniciarDialogProps) {
  const [fechaInicio, setFechaInicio] = React.useState("");
  const [observaciones, setObservaciones] = React.useState("");
  const iniciarMutation = useIniciarCirugia();

  React.useEffect(() => {
    if (open) {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFechaInicio(localIso);
      setObservaciones("");
    }
  }, [open]);

  if (!cirugia) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await iniciarMutation.mutateAsync({
        id: cirugia.id,
        data: {
          fechaInicio: fechaInicio ? new Date(fechaInicio).toISOString() : undefined,
          observaciones: observaciones.trim() || undefined,
        },
      });
      toast.success(`Cirugía ${cirugia.numero} iniciada. Estado: En Curso`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error al iniciar la intervención quirúrgica"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-emerald-500/20 bg-background shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Activity className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Iniciar Acto Quirúrgico
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  N° de Cirugía: <span className="font-semibold text-foreground">{cirugia.numero}</span>
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="rounded-lg bg-muted/40 p-3 border border-border/40 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paciente:</span>
                <span className="font-semibold">{cirugia.pacienteNombreCompleto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Procedimiento:</span>
                <span className="font-medium text-foreground">{cirugia.procedimientoQuirurgico}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sala Quirúrgica:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {cirugia.salaOperaciones || "Sin asignar"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cirujano Principal:</span>
                <span className="font-medium">{cirugia.cirujanoNombreCompleto}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaInicio" className="text-xs font-semibold flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                <span>Fecha y Hora de Ingreso a Quirófano</span>
              </Label>
              <Input
                id="fechaInicio"
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observacionesInicio" className="text-xs font-semibold">
                Observaciones al Ingreso (Opcional)
              </Label>
              <Textarea
                id="observacionesInicio"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Verificaciones de seguridad quirúrgica (pausa quirúrgica, asepsia, monitoreo)..."
                rows={3}
                className="resize-none text-xs"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/20 border-t border-border/40 px-6 py-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={iniciarMutation.isPending}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={iniciarMutation.isPending}
              className="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {iniciarMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Iniciando...</span>
                </>
              ) : (
                <>
                  <Play className="size-3.5 fill-current" />
                  <span>Iniciar Cirugía</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
