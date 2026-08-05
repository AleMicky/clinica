"use client";

import { DollarSign, Users, Calendar, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface KpiItem {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  description: string;
  icon: React.ElementType;
}

const defaultStats: KpiItem[] = [
  {
    title: "Ingresos Totales",
    value: "Bs. 45,231.89",
    change: "+20.1%",
    trend: "up",
    description: "respecto al mes anterior",
    icon: DollarSign,
  },
  {
    title: "Pacientes Atendidos",
    value: "1,248",
    change: "+180.1%",
    trend: "up",
    description: "respecto al mes anterior",
    icon: Users,
  },
  {
    title: "Citas Programadas",
    value: "354",
    change: "+19.0%",
    trend: "up",
    description: "respecto a la semana pasada",
    icon: Calendar,
  },
  {
    title: "En Sala de Espera",
    value: "12 Pacientes",
    change: "+4",
    trend: "up",
    description: "desde la última hora",
    icon: Activity,
  },
];

export function KpiCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {defaultStats.map((stat, i) => {
        const Icon = stat.icon;
        const isTrendUp = stat.trend === "up";
        return (
          <Card key={i} className="relative overflow-hidden transition-all hover:shadow-md border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span
                  className={`inline-flex items-center font-medium ${
                    isTrendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isTrendUp ? (
                    <TrendingUp className="mr-0.5 h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-3.5 w-3.5" />
                  )}
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
