"use client"

import * as React from "react"
import {
  Coins,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Globe,
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

const mockMonedas = [
  {
    id: "MON-01",
    codigo: "USD",
    simbolo: "$",
    nombre: "Dólar Estadounidense",
    decimales: 2,
    esMonedaBase: true,
    estado: "Activo",
  },
  {
    id: "MON-02",
    codigo: "EUR",
    simbolo: "€",
    nombre: "Euro",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-03",
    codigo: "COP",
    simbolo: "$",
    nombre: "Peso Colombiano",
    decimales: 0,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-04",
    codigo: "PEN",
    simbolo: "S/",
    nombre: "Sol Peruano",
    decimales: 2,
    esMonedaBase: false,
    estado: "Activo",
  },
  {
    id: "MON-05",
    codigo: "CLP",
    simbolo: "$",
    nombre: "Peso Chileno",
    decimales: 0,
    esMonedaBase: false,
    estado: "Inactivo",
  },
]

export default function MonedasPage() {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredMonedas = mockMonedas.filter(
    (m) =>
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="size-6 text-primary" />
            Monedas y Divisas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configuración de monedas operativas, de facturación y moneda principal de contabilidad.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="size-4" />
          <span>Agregar Moneda</span>
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Moneda Principal</CardTitle>
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">USD ($)</div>
            <p className="text-xs text-muted-foreground mt-1">Moneda base del sistema</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Monedas Habilitadas</CardTitle>
            <Coins className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">Disponibles en cobros</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Facturación Multimoneda</CardTitle>
            <Globe className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Activa</div>
            <p className="text-xs text-muted-foreground mt-1">Conversión en tiempo real</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Monedas Inactivas</CardTitle>
            <Coins className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Fuera de circulación local</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Monedas */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Listado de Divisas</CardTitle>
              <CardDescription>
                Monedas configuradas para emisión de presupuestos, cobros y cajas.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Código ISO</TableHead>
                <TableHead>Símbolo</TableHead>
                <TableHead>Nombre de la Moneda</TableHead>
                <TableHead>Decimales</TableHead>
                <TableHead>Tipo de Moneda</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMonedas.map((moneda) => (
                <TableRow key={moneda.id}>
                  <TableCell className="pl-6 font-mono font-bold text-sm">
                    {moneda.codigo}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {moneda.simbolo}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {moneda.nombre}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {moneda.decimales} decimales
                  </TableCell>
                  <TableCell>
                    {moneda.esMonedaBase ? (
                      <Badge variant="default" className="gap-1 text-xs">
                        <Star className="size-3 fill-current" /> Moneda Base
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Secundaria
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={moneda.estado === "Activo" ? "outline" : "destructive"}
                      className={`w-fit gap-1 text-xs ${
                        moneda.estado === "Activo"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : ""
                      }`}
                    >
                      {moneda.estado === "Activo" ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {moneda.estado}
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
                          <Edit className="size-4" /> Editar Moneda
                        </DropdownMenuItem>
                        {!moneda.esMonedaBase && (
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Star className="size-4 text-amber-500" /> Establecer como Moneda Base
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {!moneda.esMonedaBase && (
                          <DropdownMenuItem className="gap-2 text-destructive cursor-pointer">
                            <Trash2 className="size-4" /> Inactivar
                          </DropdownMenuItem>
                        )}
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
