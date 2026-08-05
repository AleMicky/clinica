"use client";

import * as React from "react";
import { ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CurrencyConverterCardProps {
  title?: string;
  description?: string;
  initialAmount?: number;
  initialRate?: number;
  originLabel?: string;
  rateLabel?: string;
  className?: string;
}

export function CurrencyConverterCard({
  title = "Calculadora de Conversión",
  description = "Simulación de cambio en tiempo real",
  initialAmount = 100,
  initialRate = 1.0,
  originLabel = "Monto Origen",
  rateLabel = "Tasa de Conversión Aplicada",
  className,
}: CurrencyConverterCardProps) {
  const [calcAmount, setCalcAmount] = React.useState<number>(initialAmount);
  const [calcRate, setCalcRate] = React.useState<number>(initialRate);

  React.useEffect(() => {
    if (initialRate > 0) {
      setCalcRate(initialRate);
    }
  }, [initialRate]);

  return (
    <Card className={cn("shadow-xs border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowRightLeft className="size-4 text-primary shrink-0" />
          <span>{title}</span>
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">
            {originLabel}
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
            {rateLabel}
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
  );
}
