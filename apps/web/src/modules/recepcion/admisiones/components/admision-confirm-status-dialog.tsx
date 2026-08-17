"use client";

import * as React from "react";
import { Loader2, CheckCircle2, Send, XCircle, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  EstadoAdmision,
  EstadoAdmisionLabels,
  formatPacienteNombre,
  type AdmisionResponse,
} from "../types/admision.types";

export interface AdmisionConfirmStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admision: AdmisionResponse | null;
  targetEstado: EstadoAdmision | null;
  motivo?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function AdmisionConfirmStatusDialog({
  open,
  onOpenChange,
  admision,
  targetEstado,
  onConfirm,
  isLoading = false,
}: AdmisionConfirmStatusDialogProps) {
  if (!admision || targetEstado === null) return null;

  const pacienteNombre = formatPacienteNombre(admision.paciente, admision.pacienteNombre);
  const targetLabel = EstadoAdmisionLabels[targetEstado];

  let icon = <CheckCircle2 className="size-5 text-emerald-600" />;
  let mediaClass = "bg-emerald-500/10 text-emerald-600";
  let buttonClass = "bg-emerald-600 hover:bg-emerald-700 text-white";
  let confirmText = `Sí, Confirmar`;

  if (targetEstado === EstadoAdmision.EnviadaVenta) {
    icon = <Send className="size-5 text-purple-600" />;
    mediaClass = "bg-purple-500/10 text-purple-600";
    buttonClass = "bg-purple-600 hover:bg-purple-700 text-white";
    confirmText = `Sí, Enviar a Venta`;
  } else if (targetEstado === EstadoAdmision.Cancelada) {
    icon = <XCircle className="size-5 text-rose-600" />;
    mediaClass = "bg-rose-500/10 text-rose-600";
    buttonClass = "bg-rose-600 hover:bg-rose-700 text-white";
    confirmText = `Sí, Cancelar Admisión`;
  } else if (targetEstado === EstadoAdmision.Registrada) {
    icon = <Clock className="size-5 text-blue-600" />;
    mediaClass = "bg-blue-500/10 text-blue-600";
    buttonClass = "bg-blue-600 hover:bg-blue-700 text-white";
    confirmText = `Sí, Mover a Registrada`;
  }

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className={mediaClass}>
            {icon}
          </AlertDialogMedia>
          <AlertDialogTitle className="text-base font-bold">
            {targetEstado === EstadoAdmision.Confirmada
              ? "¿Confirmar Admisión?"
              : targetEstado === EstadoAdmision.EnviadaVenta
              ? "¿Enviar Admisión a Venta?"
              : targetEstado === EstadoAdmision.Cancelada
              ? "¿Cancelar Admisión?"
              : "¿Cambiar Estado de la Admisión?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground space-y-1.5">
            <p>
              ¿Está seguro de cambiar el estado de la admisión{" "}
              <strong className="font-mono font-bold text-foreground">#{admision.numero}</strong> a{" "}
              <strong className="font-bold text-foreground">"{targetLabel}"</strong>?
            </p>
            <p className="text-[11px] text-muted-foreground">
              Paciente: <span className="font-medium text-foreground">{pacienteNombre}</span>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Volver
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`text-xs font-semibold gap-2 ${buttonClass}`}
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
