"use client";

import * as React from "react";
import { TrendingUp, Calendar, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface TipoCambioMetricsProps {
  ultimaTasa?: string;
  parOriginal?: string;
  tasaCompraPromedio?: string;
  totalRegistros?: number;
  ultimaFecha?: string;
  isLoading?: boolean;
}

export function TipoCambioMetricsCards({
  ultimaTasa = "-",
  parOriginal = "Sin cotización",
  tasaCompraPromedio = "-",
  totalRegistros = 0,
  ultimaFecha = "-",
  isLoading = false,
}: TipoCambioMetricsProps) {
  const [calcAmount, setCalcAmount] = React.useState<number>(100);
  const [calcRate, setCalcRate] = React.useState<number>(1.0);

  React.useEffect(() => {
    const num = parseFloat(ultimaTasa);
    if (!isNaN(num) && num > 0) {
      setCalcRate(num);
    }
  }, [ultimaTasa]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calculadora de Conversión Rápida */}
      <Card className="shadow-xs lg:col-span-1 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-primary" />
            Calculadora de Conversión
          </CardTitle>
          <CardDescription className="text-xs">
            Simulación de cambio en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Monto Origen
            </label>
            <Input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
              className="bg-background text-base font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Tasa de Conversión Aplicada
            </label>
            <Input
              type="number"
              step="0.0001"
              value={calcRate}
              onChange={(e) => setCalcRate(Number(e.target.value) || 0)}
              className="bg-background text-sm font-mono"
            />
          </div>
          <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Resultado estimado:
            </span>
            <span className="text-xl font-bold text-primary">
              {(calcAmount * calcRate).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Diarias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-2 gap-4">
        {/* Última Tasa */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Última Tasa Registrada
            </CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <div className="text-2xl font-bold font-mono">{ultimaTasa}</div>
            )}
            <p className="text-xs text-green-600 font-medium mt-1">{parOriginal}</p>
          </CardContent>
        </Card>

        {/* Tasa Compra Promedio */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Tasa Compra Promedio
            </CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <div className="text-2xl font-bold font-mono">{tasaCompraPromedio}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Cotización de compra
            </p>
          </CardContent>
        </Card>

        {/* Total Registros */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Registros
            </CardTitle>
            <TrendingUp className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{totalRegistros}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Tasas de cambio guardadas
            </p>
          </CardContent>
        </Card>

        {/* Última Fecha */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Última Fecha
            </CardTitle>
            <Calendar className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28 mb-1" />
            ) : (
              <div className="text-2xl font-bold font-mono">{ultimaFecha}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Fecha del último registro
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
