"use client";

import * as React from "react";
import { AlertTriangle, Ban, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCancelarCirugia } from "../hooks/use-quirofano";
import type { CirugiaResponse } from "../types/quirofano.types";
import { toast } from "sonner";

interface QuirofanoCancelarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cirugia: CirugiaResponse | null;
}

export function QuirofanoCancelarDialog({
  open,
  onOpenChange,
  cirugia,
}: QuirofanoCancelarDialogProps) {
  const [motivo, setMotivo] = React.useState("");
  const cancelarMutation = useCancelarCirugia();

  React.useEffect(() => {
    if (open) {
      setMotivo("");
    }
  }, [open]);

  if (!cirugia) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      toast.error("Debe ingresar el motivo de la cancelación de la intervención quirúrgica");
      return;
    }

    try {
      await cancelarMutation.mutateAsync({
        id: cirugia.id,
        data: {
          motivoCancelacion: motivo.trim(),
        },
      });
      toast.success(`Cirugía ${cirugia.numero} cancelada correctamente`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error al cancelar la intervención quirúrgica"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-red-500/20 bg-background shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Cancelar Cirugía
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
                <span className="text-muted-foreground">Sala:</span>
                <span className="font-medium">{cirugia.salaOperaciones || "Sin asignar"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivoCancelacion" className="text-xs font-semibold">
                Motivo de la Cancelación <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="motivoCancelacion"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describa el motivo médico, logístico o del paciente..."
                rows={4}
                className="resize-none text-xs"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Esta acción liberará la sala de operaciones y cambiará el estado de la cirugía a Cancelada.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/20 border-t border-border/40 px-6 py-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={cancelarMutation.isPending}
              className="h-8 text-xs"
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={cancelarMutation.isPending || !motivo.trim()}
              className="h-8 text-xs gap-1.5 font-semibold"
            >
              {cancelarMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Cancelando...</span>
                </>
              ) : (
                <>
                  <Ban className="size-3.5" />
                  <span>Confirmar Cancelación</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
