"use client";

import * as React from "react";
import { Briefcase, CheckCircle2, XCircle, Layers } from "lucide-react";
import { MetricCard } from "@/components/shared";

export interface CargoMetrics {
    total: number;
    activos: number;
    inactivos: number;
}

interface CargoMetricsProps {
    metrics: CargoMetrics;
}

export function CargoMetricsCards({ metrics }: CargoMetricsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Total de Cargos"
                value={metrics.total}
                description="Cargos registrados"
                icon={Briefcase}
                iconClassName="text-primary"
                isMono={false}
            />

            <MetricCard
                title="Cargos Activos"
                value={metrics.activos}
                description="Disponibles para asignación"
                icon={CheckCircle2}
                iconClassName="text-green-500"
                isMono={false}
            />

            <MetricCard
                title="Cargos Inactivos"
                value={metrics.inactivos}
                description="Deshabilitados del sistema"
                icon={XCircle}
                iconClassName="text-destructive"
                isMono={false}
            />

            <MetricCard
                title="Estado del Catálogo"
                value={metrics.total > 0 ? "Configurado" : "Vacío"}
                description="Catálogo de cargos"
                icon={Layers}
                iconClassName="text-muted-foreground"
                isMono={false}
            />
        </div>
    );
}