"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Receipt } from "lucide-react";
import { type CobroResponse } from "../types/cobro.types";
import { CobroDetailCard } from "./cobro-detail-card";

interface CobroDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cobro: CobroResponse | null;
  onSuccessCobro?: () => void;
  onAnular?: (cobro: CobroResponse) => void;
}

export function CobroDetailSheet({
  open,
  onOpenChange,
  cobro,
  onSuccessCobro,
  onAnular,
}: CobroDetailSheetProps) {
  if (!cobro) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 border-l border-border/80 shadow-2xl bg-card">
        <SheetHeader className="p-4 border-b border-border/70 bg-gradient-to-r from-muted/60 via-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
              <Receipt className="size-4.5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Terminal de Cobro #{cobro.numero}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {cobro.ventaPagador?.pacienteNombreCompleto
                  ? `Paciente: ${cobro.ventaPagador.pacienteNombreCompleto} • Venta #${cobro.ventaPagador?.ventaNumero || ""}`
                  : cobro.ventaPagador?.ventaNumero
                  ? `Vinculado a Venta #${cobro.ventaPagador.ventaNumero}`
                  : "Registro de pagos de caja"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <CobroDetailCard
            cobro={cobro}
            onSuccessCobro={() => {
              onSuccessCobro?.();
              onOpenChange(false);
            }}
            onAnular={(c) => {
              onAnular?.(c);
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
