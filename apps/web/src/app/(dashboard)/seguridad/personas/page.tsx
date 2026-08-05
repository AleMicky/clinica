"use client"

import * as React from "react"
import {
  User,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  Building,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Datos ficticios demostrativos de Personas
const mockPersonas = [
  {
    id: "PER-001",
    nombre: "Dra. María Elena Gómez",
    documento: "1723456789",
    tipoDocumento: "DNI",
    email: "maria.gomez@clinica.com",
    telefono: "+593 99 123 4567",
    tipo: "Médico",
    especialidad: "Cardiología",
    estado: "Activo",
  },
  {
    id: "PER-002",
    nombre: "Carlos Andrés Rodríguez",
    documento: "1712987654",
    tipoDocumento: "DNI",
    email: "carlos.rodriguez@clinica.com",
    telefono: "+593 98 765 4321",
    tipo: "Empleado",
    especialidad: "Recepcionista",
    estado: "Activo",
  },
  {
    id: "PER-003",
    nombre: "Ana Lucía Martínez",
    documento: "1756473829",
    tipoDocumento: "DNI",
    email: "ana.martinez@email.com",
    telefono: "+593 97 111 2222",
    tipo: "Paciente",
    especialidad: "N/A",
    estado: "Activo",
  },
  {
    id: "PER-004",
    nombre: "Dr. Roberto Silva",
    documento: "1709876543",
    tipoDocumento: "DNI",
    email: "roberto.silva@clinica.com",
    telefono: "+593 96 333 4444",
    tipo: "Médico",
    especialidad: "Pediatría",
    estado: "Inactivo",
  },
  {
    id: "PER-005",
    nombre: "Sofía Isabel Mendoza",
    documento: "1789012345",
    tipoDocumento: "Pasaporte",
    email: "sofia.mendoza@clinica.com",
    telefono: "+593 95 555 6666",
    tipo: "Empleado",
    especialidad: "Enfermera Jefe",
    estado: "Activo",
  },
]

export default function PersonasPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [tipoFilter, setTipoFilter] = React.useState<string>("Todos")

  const filteredPersonas = mockPersonas.filter((persona) => {
    const matchesSearch =
      persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.documento.includes(searchTerm) ||
      persona.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = tipoFilter === "Todos" || persona.tipo === tipoFilter
    return matchesSearch && matchesTipo
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="size-6 text-primary" />
            Directorio de Personas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión centralizada de expedientes de médicos, empleados y pacientes.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="size-4" />
          <span>Nueva Persona</span>
        </Button>
      </div>

      {/* Tarjetas de Métricas / Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Personas</CardTitle>
            <User className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground mt-1">+12 registradas este mes</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Personal Médico</CardTitle>
            <UserCheck className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">Doctores y especialistas</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Empleados Administrativos</CardTitle>
            <Building className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-muted-foreground mt-1">Enfermería y recepción</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pacientes Registrados</CardTitle>
            <User className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,138</div>
            <p className="text-xs text-muted-foreground mt-1">Con expediente activo</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla y Filtros */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Listado de Personas</CardTitle>
              <CardDescription>
                Búsqueda y administración de datos filiatorios y roles de persona.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/20">
                <Filter className="size-3.5 text-muted-foreground ml-1" />
                {["Todos", "Médico", "Empleado", "Paciente"].map((tipo) => (
                  <Button
                    key={tipo}
                    variant={tipoFilter === tipo ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTipoFilter(tipo)}
                    className="h-7 text-xs px-2.5"
                  >
                    {tipo}
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
                <TableHead className="pl-6">Persona</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo / Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonas.map((persona) => {
                const initials = persona.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")

                return (
                  <TableRow key={persona.id}>
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{persona.nombre}</span>
                          <span className="text-xs text-muted-foreground">ID: {persona.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{persona.documento}</span>
                        <span className="text-xs text-muted-foreground">{persona.tipoDocumento}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs gap-1">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="size-3" />
                          {persona.email}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="size-3" />
                          {persona.telefono}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={
                            persona.tipo === "Médico"
                              ? "default"
                              : persona.tipo === "Empleado"
                              ? "secondary"
                              : "outline"
                          }
                          className="w-fit text-xs"
                        >
                          {persona.tipo}
                        </Badge>
                        {persona.especialidad !== "N/A" && (
                          <span className="text-xs text-muted-foreground">{persona.especialidad}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={persona.estado === "Activo" ? "outline" : "destructive"}
                        className={`w-fit gap-1 text-xs ${
                          persona.estado === "Activo"
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : ""
                        }`}
                      >
                        {persona.estado === "Activo" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <XCircle className="size-3" />
                        )}
                        {persona.estado}
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
                            <Eye className="size-4" /> Ver Expediente
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Edit className="size-4" /> Editar Datos
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive cursor-pointer">
                            <Trash2 className="size-4" /> Inactivar Persona
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
