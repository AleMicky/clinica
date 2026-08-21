"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, CheckCircle2, XCircle, FileText } from "lucide-react";
import type { MetodoPagoMetrics as MetodoPagoMetricsType } from "../types/metodo-pago.types";

interface MetodoPagoMetricsProps {
  metrics: MetodoPagoMetricsType;
  isLoading?: boolean;
}

export function MetodoPagoMetricsCards({
  metrics,
  isLoading = false,
}: MetodoPagoMetricsProps) {
  const cards = [
    {
      title: "Total Métodos",
      value: isLoading ? "-" : metrics.totalMetodos.toString(),
      icon: CreditCard,
      description: "Formas de pago registradas",
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
    {
      title: "Activos en Caja",
      value: isLoading ? "-" : metrics.activos.toString(),
      icon: CheckCircle2,
      description: "Disponibles para cobro",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Requieren Referencia",
      value: isLoading ? "-" : metrics.requierenReferencia.toString(),
      icon: FileText,
      description: "Exigen N° de comprobante / voucher",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Inactivos",
      value: isLoading ? "-" : metrics.inactivos.toString(),
      icon: XCircle,
      description: "Deshabilitados temporalmente",
      color: "text-muted-foreground",
      bgColor: "bg-muted/40 border-border/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="border border-border/70 shadow-2xs bg-card/60 rounded-xl"
          >
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {card.title}
                </span>
                <p className="text-lg font-bold text-foreground font-mono">
                  {card.value}
                </p>
                <span className="text-[10px] text-muted-foreground block">
                  {card.description}
                </span>
              </div>
              <div
                className={`size-9 rounded-xl flex items-center justify-center border ${card.bgColor} ${card.color}`}
              >
                <Icon className="size-4.5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
