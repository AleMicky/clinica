"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CajaModuleView } from "@/modules/cajas/caja/components/caja-module-view";
import { TurnoCajaModuleView } from "@/modules/cajas/turno-caja/components/turno-caja-module-view";
import { MovimientoCajaModuleView } from "@/modules/cajas/movimiento-caja/components/movimiento-caja-module-view";
import { ArqueoCajaModuleView } from "@/modules/cajas/arqueo-caja/components/arqueo-caja-module-view";
import { CobroModuleView } from "@/modules/cajas/cobro/components/cobro-module-view";
import { Vault, Clock, ArrowLeftRight, Calculator, CreditCard } from "lucide-react";

export default function CajasPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="cajas" className="w-full">
        <div className="flex items-center justify-between border-b border-border pb-3 overflow-x-auto">
          <TabsList className="h-10 bg-muted/60 p-1 min-w-max">
            <TabsTrigger value="cajas" className="gap-2 text-xs sm:text-sm font-medium">
              <Vault className="h-4 w-4" />
              <span>Catálogo de Cajas</span>
            </TabsTrigger>
            <TabsTrigger value="turnos" className="gap-2 text-xs sm:text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Turnos de Caja</span>
            </TabsTrigger>
            <TabsTrigger value="movimientos" className="gap-2 text-xs sm:text-sm font-medium">
              <ArrowLeftRight className="h-4 w-4" />
              <span>Movimientos</span>
            </TabsTrigger>
            <TabsTrigger value="arqueos" className="gap-2 text-xs sm:text-sm font-medium">
              <Calculator className="h-4 w-4" />
              <span>Arqueos y Cierres</span>
            </TabsTrigger>
            <TabsTrigger value="cobros" className="gap-2 text-xs sm:text-sm font-medium">
              <CreditCard className="h-4 w-4" />
              <span>Cobros</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cajas" className="pt-4 focus-visible:outline-none">
          <CajaModuleView />
        </TabsContent>

        <TabsContent value="turnos" className="pt-4 focus-visible:outline-none">
          <TurnoCajaModuleView />
        </TabsContent>

        <TabsContent value="movimientos" className="pt-4 focus-visible:outline-none">
          <MovimientoCajaModuleView />
        </TabsContent>

        <TabsContent value="arqueos" className="pt-4 focus-visible:outline-none">
          <ArqueoCajaModuleView />
        </TabsContent>

        <TabsContent value="cobros" className="pt-4 focus-visible:outline-none">
          <CobroModuleView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
