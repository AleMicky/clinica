"use client";

import {
    Users,
    CheckCircle2,
    XCircle,
    CalendarX,
} from "lucide-react";
import { MetricCard } from "@/components/shared";

export interface EmpleadoMetrics {
    total: number;
    activos: number;
    inactivos: number;
    retirados: number;
}

interface EmpleadoMetricsProps {
    metrics: EmpleadoMetrics;
}

export function EmpleadoMetricsCards({ metrics }: EmpleadoMetricsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Total de Empleados"
                value={metrics.total}
                description="Empleados registrados"
                icon={Users}
                iconClassName="text-primary"
                isMono={false}
            />

            <MetricCard
                title="Empleados Activos"
                value={metrics.activos}
                description="Sin fecha de retiro"
                icon={CheckCircle2}
                iconClassName="text-green-500"
                isMono={false}
            />

            <MetricCard
                title="Empleados Inactivos"
                value={metrics.inactivos}
                description="Deshabilitados del sistema"
                icon={XCircle}
                iconClassName="text-destructive"
                isMono={false}
            />

            <MetricCard
                title="Empleados Retirados"
                value={metrics.retirados}
                description="Con fecha de retiro registrada"
                icon={CalendarX}
                iconClassName="text-amber-500"
                isMono={false}
            />
        </div>
    );
}