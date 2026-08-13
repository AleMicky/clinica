"use client";

import * as React from "react";
import { Plus, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BancoHeaderProps {
  onAddClick: () => void;
}

export function BancoHeader({ onAddClick }: BancoHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bancos y Cuentas Bancarias
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Gestión del catálogo de entidades bancarias e instituciones financieras con sus respectivas cuentas de recaudo y depósitos.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onAddClick} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Nuevo Banco</span>
        </Button>
      </div>
    </div>
  );
}
