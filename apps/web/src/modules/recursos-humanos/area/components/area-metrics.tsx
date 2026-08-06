"use client";

import * as React from "react";
import { Network, CheckCircle2, XCircle, Layers } from "lucide-react";
import { MetricCard } from "@/components/shared";

export interface AreaMetrics {
    total: number;
    activos: number;
    inactivos: number;
    tiposArea: number;
}

interface AreaMetricsProps {
    metrics: AreaMetrics;
}

export function AreaMetricsCards({ metrics }: AreaMetricsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Total de Áreas"
                value={metrics.total}
                description="Áreas registradas"
                icon={Network}
                iconClassName="text-primary"
                isMono={false}
            />

            <MetricCard
                title="Áreas Activas"
                value={metrics.activos}
                description="Disponibles para asignación"
                icon={CheckCircle2}
                iconClassName="text-green-500"
                isMono={false}
            />

            <MetricCard
                title="Áreas Inactivas"
                value={metrics.inactivos}
                description="Deshabilitadas del sistema"
                icon={XCircle}
                iconClassName="text-destructive"
                isMono={false}
            />

            <MetricCard
                title="Tipos de Área"
                value={metrics.tiposArea}
                description="Tipos configurados en sistema"
                icon={Layers}
                iconClassName="text-muted-foreground"
                isMono={false}
            />
        </div>
    );
}