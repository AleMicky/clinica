"use client";

import { Plus, Vault } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CajaHeaderProps {
  onNewCajaClick: () => void;
}

export function CajaHeader({ onNewCajaClick }: CajaHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <Vault className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl leading-none">
            Puntos de Caja
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Catálogo y administración de terminales de cobro
          </p>
        </div>
      </div>

      <Button onClick={onNewCajaClick} className="h-8.5 gap-1.5 text-xs font-medium px-3 shrink-0">
        <Plus className="h-3.5 w-3.5" />
        <span>Nueva Caja</span>
      </Button>
    </div>
  );
}
