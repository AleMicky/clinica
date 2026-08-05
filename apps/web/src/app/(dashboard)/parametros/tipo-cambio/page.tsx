"use client"

import * as React from "react"
import {
  TrendingUp,
  Plus,
  ArrowRightLeft,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockTiposCambio = [
  {
    id: "TC-01",
    fecha: "2026-08-05",
    monedaOrigen: "USD",
    monedaDestino: "EUR",
    tasaCompra: 0.915,
    tasaVenta: 0.925,
    fuente: "Banco Central",
    estado: "Vigente",
  },
  {
    id: "TC-02",
    fecha: "2026-08-05",
    monedaOrigen: "USD",
    monedaDestino: "COP",
    tasaCompra: 4020.0,
    tasaVenta: 4080.0,
    fuente: "Oficial",
    estado: "Vigente",
  },
  {
    id: "TC-03",
    fecha: "2026-08-05",
    monedaOrigen: "USD",
    monedaDestino: "PEN",
    tasaCompra: 3.72,
    tasaVenta: 3.76,
    fuente: "Oficial",
    estado: "Vigente",
  },
  {
    id: "TC-04",
    fecha: "2026-08-04",
    monedaOrigen: "USD",
    monedaDestino: "EUR",
    tasaCompra: 0.912,
    tasaVenta: 0.922,
    fuente: "Banco Central",
    estado: "Histórico",
  },
]

export default function TipoCambioPage() {
  const [calcAmount, setCalcAmount] = React.useState<number>(100)
  const [calcRate, setCalcRate] = React.useState<number>(0.92)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="size-6 text-primary" />
            Tipo de Cambio y Cotizaciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro diario de tasas de conversión para transacciones financieras y cobranzas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="size-4" /> Actualizar Cotizaciones
          </Button>
          <Button className="gap-2">
            <Plus className="size-4" /> Nuevo Tipo de Cambio
          </Button>
        </div>
      </div>

      {/* Convertidor de Divisas Interactivo + Métricas */}
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
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Monto (USD)</label>
              <Input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                className="bg-background text-base font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tasa Conversión (USD / EUR)</label>
              <Input
                type="number"
                step="0.001"
                value={calcRate}
                onChange={(e) => setCalcRate(Number(e.target.value) || 0)}
                className="bg-background text-sm"
              />
            </div>
            <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Resultado estimado:</span>
              <span className="text-xl font-bold text-primary">
                {(calcAmount * calcRate).toFixed(2)} EUR
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Diarias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-2 gap-4">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Tasa USD / EUR</CardTitle>
              <TrendingUp className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ 0.920</div>
              <p className="text-xs text-green-600 font-medium mt-1">+0.22% hoy</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Tasa USD / COP</CardTitle>
              <TrendingUp className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$ 4,050.00</div>
              <p className="text-xs text-muted-foreground mt-1">Tasa oficial del día</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Tasa USD / PEN</CardTitle>
              <TrendingUp className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ 3.740</div>
              <p className="text-xs text-muted-foreground mt-1">Cotización SUNAT</p>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Último Cierre</CardTitle>
              <Calendar className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">05/08/2026</div>
              <p className="text-xs text-muted-foreground mt-1">Cierre oficial de mercado</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Histórico y Cotizaciones Vigentes */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Histórico de Tasas de Cambio</CardTitle>
          <CardDescription>
            Registro detallado de valores de compra y venta de divisas por fecha.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Fecha</TableHead>
                <TableHead>Par de Monedas</TableHead>
                <TableHead className="text-right">Tasa Compra</TableHead>
                <TableHead className="text-right">Tasa Venta</TableHead>
                <TableHead>Fuente / Origen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTiposCambio.map((tc) => (
                <TableRow key={tc.id}>
                  <TableCell className="pl-6 font-mono text-xs font-semibold">
                    {tc.fecha}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    <Badge variant="outline" className="font-mono">
                      {tc.monedaOrigen} → {tc.monedaDestino}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {tc.tasaCompra.toFixed(tc.monedaDestino === "COP" ? 2 : 4)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-primary">
                    {tc.tasaVenta.toFixed(tc.monedaDestino === "COP" ? 2 : 4)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {tc.fuente}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tc.estado === "Vigente" ? "outline" : "secondary"}
                      className={`w-fit gap-1 text-xs ${
                        tc.estado === "Vigente"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : ""
                      }`}
                    >
                      {tc.estado === "Vigente" && <CheckCircle2 className="size-3" />}
                      {tc.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <Edit className="size-4" /> Editar Registro
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive cursor-pointer">
                          <Trash2 className="size-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
