"use client"

import * as React from "react"
import {
  Database,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderTree,
  Tag,
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

const mockCatalogos = [
  { id: "CAT-01", nombre: "Especialidades Médicas", codigo: "ESP_MED", elementosCount: 24, estado: "Activo" },
  { id: "CAT-02", nombre: "Diagnósticos (CIE-10)", codigo: "CIE_10", elementosCount: 1420, estado: "Activo" },
  { id: "CAT-03", nombre: "Tipos de Documentos de Identidad", codigo: "TIPO_DOC", elementosCount: 5, estado: "Activo" },
  { id: "CAT-04", nombre: "Vías de Administración de Fármacos", codigo: "VIA_ADMIN", elementosCount: 12, estado: "Activo" },
  { id: "CAT-05", nombre: "Tipos de Seguro / Coberturas", codigo: "TIPO_SEGURO", elementosCount: 8, estado: "Activo" },
]

const mockElementos = [
  { id: "ELE-001", codigo: "CAR", nombre: "Cardiología", descripcion: "Especialidad en sistema cardiovascular", estado: "Activo", orden: 1 },
  { id: "ELE-002", codigo: "PED", nombre: "Pediatría", descripcion: "Atención médica infantil", estado: "Activo", orden: 2 },
  { id: "ELE-003", codigo: "DER", nombre: "Dermatología", descripcion: "Cuidado de la piel y mucosas", estado: "Activo", orden: 3 },
  { id: "ELE-004", codigo: "NEU", nombre: "Neurología", descripcion: "Trastornos del sistema nervioso", estado: "Activo", orden: 4 },
  { id: "ELE-005", codigo: "TRA", nombre: "Traumatología", descripcion: "Lesiones osteoarticulares", estado: "Inactivo", orden: 5 },
]

export default function CatalogosPage() {
  const [selectedCatalog, setSelectedCatalog] = React.useState(mockCatalogos[0])
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredElementos = mockElementos.filter(
    (item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="size-6 text-primary" />
            Catálogos y Tablas Maestras
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de catálogos generales, clasificaciones y listas desplegables del sistema.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="size-4" />
          <span>Nuevo Catálogo</span>
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Catálogos</CardTitle>
            <FolderTree className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">Tablas maestras activas</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Elementos Registrados</CardTitle>
            <Tag className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,469</div>
            <p className="text-xs text-muted-foreground mt-1">Registros en catálogo</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Catálogos del Sistema</CardTitle>
            <Database className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Estructura protegida</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Última Modificación</CardTitle>
            <ClockIcon className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hoy</div>
            <p className="text-xs text-muted-foreground mt-1">10:45 AM</p>
          </CardContent>
        </Card>
      </div>

      {/* Selector de Catálogo y Tabla de Elementos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Lista de Catálogos */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Seleccionar Catálogo
          </h2>
          <div className="flex flex-col gap-2">
            {mockCatalogos.map((cat) => {
              const isSelected = selectedCatalog.id === cat.id
              return (
                <Card
                  key={cat.id}
                  onClick={() => setSelectedCatalog(cat)}
                  className={`cursor-pointer transition-all duration-200 shadow-xs hover:border-primary/50 ${
                    isSelected ? "border-primary ring-1 ring-primary bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">{cat.nombre}</span>
                      <span className="text-xs text-muted-foreground font-mono">{cat.codigo}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {cat.elementosCount} ítems
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Columna Derecha: Elementos del Catálogo Seleccionado */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <Card className="shadow-xs h-full">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{selectedCatalog.nombre}</CardTitle>
                    <Badge variant="outline" className="text-xs font-mono">
                      {selectedCatalog.codigo}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    Gestión de ítems pertenecientes al catálogo seleccionado.
                  </CardDescription>
                </div>
                <Button size="sm" className="gap-2 shrink-0">
                  <Plus className="size-4" /> Nuevo Ítem
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ítem por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Código</TableHead>
                    <TableHead>Nombre del Ítem</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredElementos.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-6 font-mono text-xs font-semibold">
                        {item.codigo}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {item.nombre}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.descripcion}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.estado === "Activo" ? "outline" : "destructive"}
                          className={`w-fit gap-1 text-xs ${
                            item.estado === "Activo"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : ""
                          }`}
                        >
                          {item.estado === "Activo" ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <XCircle className="size-3" />
                          )}
                          {item.estado}
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
                              <Edit className="size-4" /> Editar Ítem
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
      </div>
    </div>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
