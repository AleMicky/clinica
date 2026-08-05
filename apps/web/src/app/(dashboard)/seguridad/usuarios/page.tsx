"use client"

import * as React from "react"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Edit,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Mail,
  User,
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

const mockUsuarios = [
  {
    id: "USR-001",
    username: "admin",
    email: "admin@clinica.com",
    personaNombre: "Dra. María Elena Gómez",
    personaId: "PER-001",
    rol: "Administrador del Sistema",
    mfaHabilitado: true,
    estado: "Activo",
    ultimoAcceso: "Hace 5 minutos",
  },
  {
    id: "USR-002",
    username: "crodriguez",
    email: "carlos.rodriguez@clinica.com",
    personaNombre: "Carlos Andrés Rodríguez",
    personaId: "PER-002",
    rol: "Recepción / Admisión",
    mfaHabilitado: false,
    estado: "Activo",
    ultimoAcceso: "Hoy, 09:14 AM",
  },
  {
    id: "USR-003",
    username: "rsilva",
    email: "roberto.silva@clinica.com",
    personaNombre: "Dr. Roberto Silva",
    personaId: "PER-004",
    rol: "Médico General / Especialista",
    mfaHabilitado: true,
    estado: "Bloqueado",
    ultimoAcceso: "Ayer, 16:45 PM",
  },
  {
    id: "USR-004",
    username: "smendoza",
    email: "sofia.mendoza@clinica.com",
    personaNombre: "Sofía Isabel Mendoza",
    personaId: "PER-005",
    rol: "Enfermería",
    mfaHabilitado: false,
    estado: "Activo",
    ultimoAcceso: "Hace 2 horas",
  },
]

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [estadoFilter, setEstadoFilter] = React.useState<string>("Todos")

  const filteredUsuarios = mockUsuarios.filter((usr) => {
    const matchesSearch =
      usr.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usr.personaNombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = estadoFilter === "Todos" || usr.estado === estadoFilter
    return matchesSearch && matchesEstado
  })

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administración de credenciales de acceso, asignación de roles y estados de cuenta.
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="size-4" />
          <span>Nuevo Usuario</span>
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Usuarios Totales</CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60</div>
            <p className="text-xs text-muted-foreground mt-1">Cuentas registradas</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Cuentas Activas</CardTitle>
            <ShieldCheck className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57</div>
            <p className="text-xs text-muted-foreground mt-1">Acceso habilitado</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Cuentas Bloqueadas</CardTitle>
            <ShieldAlert className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Por intentos fallidos o inactividad</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Con Autenticación MFA</CardTitle>
            <KeyRound className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground mt-1">56% de cobertura de seguridad</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla y Filtros */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Cuentas de Usuarios</CardTitle>
              <CardDescription>
                Listado y estado de acceso de los usuarios del sistema.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/20">
                <Filter className="size-3.5 text-muted-foreground ml-1" />
                {["Todos", "Activo", "Bloqueado"].map((st) => (
                  <Button
                    key={st}
                    variant={estadoFilter === st ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setEstadoFilter(st)}
                    className="h-7 text-xs px-2.5"
                  >
                    {st}
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
                <TableHead className="pl-6">Usuario</TableHead>
                <TableHead>Persona Vinculada</TableHead>
                <TableHead>Rol Asignado</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usr) => {
                const initials = usr.username.substring(0, 2).toUpperCase()

                return (
                  <TableRow key={usr.id}>
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">@{usr.username}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3" /> {usr.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <User className="size-3.5 text-muted-foreground" />
                          {usr.personaNombre}
                        </span>
                        <span className="text-xs text-muted-foreground">{usr.personaId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {usr.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={usr.mfaHabilitado ? "outline" : "secondary"}
                        className={`text-[11px] ${
                          usr.mfaHabilitado ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : ""
                        }`}
                      >
                        {usr.mfaHabilitado ? "Activado" : "No Habilitado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={usr.estado === "Activo" ? "outline" : "destructive"}
                        className={`w-fit gap-1 text-xs ${
                          usr.estado === "Activo"
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : ""
                        }`}
                      >
                        {usr.estado === "Activo" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <XCircle className="size-3" />
                        )}
                        {usr.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {usr.ultimoAcceso}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Acciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Gestión de Cuenta</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Edit className="size-4" /> Editar Usuario
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <KeyRound className="size-4" /> Restablecer Contraseña
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {usr.estado === "Activo" ? (
                            <DropdownMenuItem className="gap-2 text-destructive cursor-pointer">
                              <Lock className="size-4" /> Bloquear Cuenta
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="gap-2 text-green-600 cursor-pointer">
                              <Unlock className="size-4" /> Desbloquear Cuenta
                            </DropdownMenuItem>
                          )}
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
