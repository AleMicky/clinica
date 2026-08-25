"use client";

import { Key, Lock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RolMetrics } from "../types/rol.types";

interface RolMetricsProps {
  metrics: RolMetrics;
}

export function RolMetricsCards({ metrics }: RolMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            Roles Definidos
          </CardTitle>
          <Key className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalRoles}</div>
          <p className="mt-1 text-xs text-muted-foreground">Perfiles de usuario activos</p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            Roles del Sistema
          </CardTitle>
          <Lock className="size-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{metrics.rolesProtegidos}</div>
          <p className="mt-1 text-xs text-muted-foreground">Protegidos contra eliminación</p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
            Roles Personalizados
          </CardTitle>
          <ShieldCheck className="size-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{metrics.rolesPersonalizados}</div>
          <p className="mt-1 text-xs text-muted-foreground">Creados por la institución</p>
        </CardContent>
      </Card>
    </div>
  );
}
