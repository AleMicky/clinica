"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CajaModuleView } from "@/modules/cajas/caja/components/caja-module-view";
import { TurnoCajaModuleView } from "@/modules/cajas/turno-caja/components/turno-caja-module-view";
import { Vault, Clock } from "lucide-react";

export default function CajasPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="cajas" className="w-full">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <TabsList className="h-10 bg-muted/60 p-1">
            <TabsTrigger value="cajas" className="gap-2 text-xs sm:text-sm font-medium">
              <Vault className="h-4 w-4" />
              <span>Catálogo de Cajas</span>
            </TabsTrigger>
            <TabsTrigger value="turnos" className="gap-2 text-xs sm:text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Turnos de Caja</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cajas" className="pt-4 focus-visible:outline-none">
          <CajaModuleView />
        </TabsContent>

        <TabsContent value="turnos" className="pt-4 focus-visible:outline-none">
          <TurnoCajaModuleView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
