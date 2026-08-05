"use client"

import * as React from "react"
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Moneda } from "../types/moneda.types"

interface MonedaTableProps {
  monedas: Moneda[]
  onSetMonedaBase?: (id: string) => void
  onEdit?: (moneda: Moneda) => void
  onInactivate?: (id: string) => void
}

export function MonedaTable({
  monedas,
  onSetMonedaBase,
  onEdit,
  onInactivate,
}: MonedaTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(5)

  // Reset pagination when filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, pageSize])

  const filteredMonedas = React.useMemo(() => {
    return monedas.filter(
      (m) =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [monedas, searchTerm])

  const totalItems = filteredMonedas.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const paginatedMonedas = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredMonedas.slice(startIndex, startIndex + pageSize)
  }, [filteredMonedas, currentPage, pageSize])

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const toItem = Math.min(totalItems, currentPage * pageSize)

  return (
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
            {paginatedMonedas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
                  No se encontraron monedas que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              paginatedMonedas.map((moneda) => (
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
                      className={`w-fit gap-1 text-xs ${moneda.estado === "Activo"
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
                        <DropdownMenuItem
                          onClick={() => onEdit?.(moneda)}
                          className="gap-2 cursor-pointer"
                        >
                          <Edit className="size-4" /> Editar Moneda
                        </DropdownMenuItem>
                        {!moneda.esMonedaBase && (
                          <DropdownMenuItem
                            onClick={() => onSetMonedaBase?.(moneda.id)}
                            className="gap-2 cursor-pointer"
                          >
                            <Star className="size-4 text-amber-500" /> Establecer como Moneda Base
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {!moneda.esMonedaBase && (
                          <DropdownMenuItem
                            onClick={() => onInactivate?.(moneda.id)}
                            className="gap-2 text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-4" /> Inactivar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pie de Tabla con Controles de Paginación */}
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50 text-sm">
        {/* Información de Registros */}
        <div className="text-xs text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{fromItem}</span> a{" "}
          <span className="font-semibold text-foreground">{toItem}</span> de{" "}
          <span className="font-semibold text-foreground">{totalItems}</span> divisas
        </div>

        {/* Selector de Filas por Página y Botones de Navegación */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filas por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => setPageSize(Number(val))}
            >
              <SelectTrigger className="h-8 w-16 text-xs">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2 font-medium">
              Página {currentPage} de {totalPages}
            </span>

            {/* Primera Página */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="size-4" />
              <span className="sr-only">Primera página</span>
            </Button>

            {/* Página Anterior */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Página anterior</span>
            </Button>

            {/* Página Siguiente */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Página siguiente</span>
            </Button>

            {/* Última Página */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="size-4" />
              <span className="sr-only">Última página</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
