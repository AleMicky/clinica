"use client"

import * as React from "react"
import {
  Scale,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Pill,
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

const mockUnidades = [
  {
    id: "UM-01",
    nombre: "Miligramo",
    abreviatura: "mg",
    categoria: "Dosificación",
    factorBase: "0.001 g",
    estado: "Activo",
  },
  {
    id: "UM-02",
    nombre: "Gramo",
    abreviatura: "g",
    categoria: "Peso",
    factorBase: "1 g",
    estado: "Activo",
  },
  {
    id: "UM-03",
    nombre: "Mililitro",
    abreviatura: "ml",
    categoria: "Volumen",
    factorBase: "0.001 L",
    estado: "Activo",
  },
  {
    id: "UM-04",
    nombre: "Unidades Internacionales",
    abreviatura: "UI",
    categoria: "Dosificación",
    factorBase: "1 UI",
    estado: "Activo",
  },
  {
    id: "UM-05",
    nombre: "Cápsula",
    abreviatura: "cap",
    categoria: "Presentación",
    factorBase: "1 unidad",
    estado: "Activo",
  },
  {
    id: "UM-06",
    nombre: "Gotas",
    abreviatura: "gts",
    categoria: "Volumen",
    factorBase: "0.05 ml",
    estado: "Inactivo",
  },
]

export default function UnidadesMedidaPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoriaFilter, setCategoriaFilter] = React.useState<string>("Todos")

  const filteredUnidades = mockUnidades.filter((um) => {
    const matchesSearch =
      um.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      um.abreviatura.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria =
      categoriaFilter === "Todos" || um.categoria === categoriaFilter
    return matchesSearch && matchesCategoria
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Scale className="size-6 text-primary" />
            Unidades de Medida
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catálogo de magnitudes, magnitudes de peso, volumen y dosificación farmacológica.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="size-4" />
          <span>Nueva Unidad</span>
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Unidades</CardTitle>
            <Scale className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground mt-1">Magnitudes estándar</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Dosificación / Farmacia</CardTitle>
            <Pill className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground mt-1">mg, UI, cápsulas, etc.</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Volumen y Peso</CardTitle>
            <FlaskConical className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground mt-1">ml, L, kg, g</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Categorías</CardTitle>
            <Scale className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">Grupos de medición</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla y Filtros */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Listado de Unidades</CardTitle>
              <CardDescription>
                Unidades registradas para prescripción de recetas y fichas clínicas.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por abreviatura o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/20">
                <Filter className="size-3.5 text-muted-foreground ml-1" />
                {["Todos", "Dosificación", "Peso", "Volumen", "Presentación"].map((cat) => (
                  <Button
                    key={cat}
                    variant={categoriaFilter === cat ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCategoriaFilter(cat)}
                    className="h-7 text-xs px-2.5"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Abreviatura</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Equivalencia / Factor Base</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnidades.map((um) => (
                <TableRow key={um.id}>
                  <TableCell className="pl-6 font-mono font-bold text-sm text-primary">
                    {um.abreviatura}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {um.nombre}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {um.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {um.factorBase}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={um.estado === "Activo" ? "outline" : "destructive"}
                      className={`w-fit gap-1 text-xs ${
                        um.estado === "Activo"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : ""
                      }`}
                    >
                      {um.estado === "Activo" ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {um.estado}
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
                          <Edit className="size-4" /> Editar Unidad
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive cursor-pointer">
                          <Trash2 className="size-4" /> Inactivar
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
