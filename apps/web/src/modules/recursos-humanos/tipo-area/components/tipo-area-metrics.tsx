"use client";

import * as React from "react";
import { Building2, CheckCircle2, XCircle, Hash } from "lucide-react";
import { MetricCard } from "@/components/shared";

export interface TipoAreaMetrics {
    total: number;
    activos: number;
    inactivos: number;
    ordenMax: number;
}

interface TipoAreaMetricsProps {
    metrics: TipoAreaMetrics;
}

export function TipoAreaMetricsCards({ metrics }: TipoAreaMetricsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Total de Tipos"
                value={metrics.total}
                description="Tipos de área registrados"
                icon={Building2}
                iconClassName="text-primary"
                isMono={false}
            />

            <MetricCard
                title="Tipos Activos"
                value={metrics.activos}
                description="Disponibles para clasificación"
                icon={CheckCircle2}
                iconClassName="text-green-500"
                isMono={false}
            />

            <MetricCard
                title="Tipos Inactivos"
                value={metrics.inactivos}
                description="Deshabilitados del sistema"
                icon={XCircle}
                iconClassName="text-destructive"
                isMono={false}
            />

            <MetricCard
                title="Orden Máximo"
                value={metrics.ordenMax}
                description="Mayor índice de orden configurado"
                icon={Hash}
                iconClassName="text-muted-foreground"
                isMono
            />
        </div>
    );
}