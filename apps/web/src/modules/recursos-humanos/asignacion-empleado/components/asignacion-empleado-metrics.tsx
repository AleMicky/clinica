"use client";

import { UserCheck, CheckCircle2, Clock } from "lucide-react";
import type { AsignacionEmpleadoMetrics } from "../types/asignacion-empleado.types";

interface AsignacionEmpleadoMetricsCardsProps {
    metrics: AsignacionEmpleadoMetrics;
}

export function AsignacionEmpleadoMetricsCards({
    metrics,
}: AsignacionEmpleadoMetricsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-card border border-border/60 p-3.5 rounded-xl shadow-2xs">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <UserCheck className="size-4" />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Total Asignaciones
                    </p>
                    <p className="text-xl font-bold text-foreground">
                        {metrics.total}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-card border border-border/60 p-3.5 rounded-xl shadow-2xs">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="size-4" />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Asignaciones Activas
                    </p>
                    <p className="text-xl font-bold text-foreground">
                        {metrics.activas}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-card border border-border/60 p-3.5 rounded-xl shadow-2xs">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Clock className="size-4" />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Finalizadas / Anteriores
                    </p>
                    <p className="text-xl font-bold text-foreground">
                        {metrics.finalizadas}
                    </p>
                </div>
            </div>
        </div>
    );
}
