"use client";

import * as React from "react";
import { Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetodoPagoHeaderProps {
  onAddClick: () => void;
}

export function MetodoPagoHeader({ onAddClick }: MetodoPagoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <CreditCard className="size-4.5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Métodos de Pago
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Administre las formas de pago aceptadas en caja (Efectivo, QR, Transferencias, Tarjetas).
        </p>
      </div>

      <Button
        onClick={onAddClick}
        className="h-8.5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
      >
        <Plus className="size-3.5" />
        Nuevo Método de Pago
      </Button>
    </div>
  );
}
