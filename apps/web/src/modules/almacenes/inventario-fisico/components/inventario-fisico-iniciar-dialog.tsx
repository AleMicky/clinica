"use client";

import * as React from "react";
import { toast } from "sonner";
import { PlayCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIniciarConteoInventarioFisico } from "../hooks/use-inventario-fisico";
import type { InventarioFisicoResponse } from "../types/inventario-fisico.types";

interface InventarioFisicoIniciarConteoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventarioToIniciar?: InventarioFisicoResponse | null;
  onSuccessCallback?: () => void;
}

export function InventarioFisicoIniciarConteoDialog({
  open,
  onOpenChange,
  inventarioToIniciar,
  onSuccessCallback,
}: InventarioFisicoIniciarConteoDialogProps) {
  const iniciarMutation = useIniciarConteoInventarioFisico();

  const handleIniciar = async () => {
    if (!inventarioToIniciar) return;

    try {
      await iniciarMutation.mutateAsync(inventarioToIniciar.id);
      toast.success(
        `Inventario "${inventarioToIniciar.numero}" puesto en estado "En Conteo".`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "Error al iniciar el conteo físico.";
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <PlayCircle className="size-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Iniciar Conteo Físico
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            ¿Deseas dar inicio al conteo físico para el inventario{" "}
            <span className="font-mono font-semibold text-foreground">
              {inventarioToIniciar?.numero}
            </span>{" "}
            en el almacén{" "}
            <span className="font-semibold text-foreground">
              {inventarioToIniciar?.almacenNombre}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 border-t border-border/40 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={iniciarMutation.isPending}
            className="h-7 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleIniciar}
            disabled={iniciarMutation.isPending}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 font-medium"
          >
            {iniciarMutation.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Iniciando...</span>
              </>
            ) : (
              <span>Confirmar e Iniciar</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
