"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteConceptoMovimientoCaja } from "../hooks/use-tipo-movimiento";
import type { ConceptoMovimientoCajaInfo } from "../types/tipo-movimiento.types";

interface ConceptoMovimientoCajaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concepto?: ConceptoMovimientoCajaInfo | null;
  onSuccessCallback?: () => void;
}

export function ConceptoMovimientoCajaDeleteDialog({
  open,
  onOpenChange,
  concepto,
  onSuccessCallback,
}: Readonly<ConceptoMovimientoCajaDeleteDialogProps>) {
  const deleteMutation = useDeleteConceptoMovimientoCaja();

  if (!concepto) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(concepto.id);
      toast.success(`Concepto "${concepto.nombre}" eliminado correctamente.`);
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { detail?: string; message?: string } };
        message?: string;
      };
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo eliminar el concepto de movimiento.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-base font-semibold">
              Eliminar Concepto de Movimiento
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-xs text-muted-foreground leading-relaxed">
            ¿Está seguro de que desea eliminar el concepto{" "}
            <strong className="text-foreground font-mono">[{concepto.codigo}]</strong>{" "}
            <strong className="text-foreground">&quot;{concepto.nombre}&quot;</strong>?
            <br />
            Esta acción no se puede deshacer si no tiene registros dependientes.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="text-xs h-8"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-xs h-8 gap-1.5"
          >
            {deleteMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            <span>Eliminar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
