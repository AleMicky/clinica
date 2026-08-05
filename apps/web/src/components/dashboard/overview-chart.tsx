"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const chartData = [
  { name: "Ene", total: 1840, citas: 140 },
  { name: "Feb", total: 2400, citas: 190 },
  { name: "Mar", total: 3200, citas: 250 },
  { name: "Abr", total: 2900, citas: 210 },
  { name: "May", total: 4100, citas: 320 },
  { name: "Jun", total: 3800, citas: 290 },
  { name: "Jul", total: 4800, citas: 370 },
  { name: "Ago", total: 5200, citas: 410 },
  { name: "Sep", total: 4900, citas: 380 },
  { name: "Oct", total: 5600, citas: 450 },
  { name: "Nov", total: 6100, citas: 490 },
  { name: "Dic", total: 6800, citas: 530 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary font-medium">
          Consultas: <span className="font-bold">{payload[0]?.value}</span>
        </p>
        {payload[1] && (
          <p className="text-muted-foreground">
            Citas Programadas: <span className="font-bold">{payload[1]?.value}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function OverviewChart() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="col-span-4 border-border/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Resumen de Atenciones Médicas</CardTitle>
        <CardDescription>
          Comparativa mensual de consultas realizadas y citas completadas este año.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {mounted ? (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  name="Consultas"
                  fill="var(--primary, #0ea5e9)"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground text-sm">
            Cargando analítica...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
