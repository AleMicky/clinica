"use client"

import * as React from "react"
import {
  Key,
  Plus,
  ShieldCheck,
  Users,
  Lock,
  Edit,
  Copy,
  Trash2,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockRoles = [
  {
    id: "ROL-001",
    nombre: "Administrador del Sistema",
    codigo: "ROLE_ADMIN",
    descripcion: "Acceso total e ilimitado a todos los módulos y configuraciones globales.",
    usuariosCount: 3,
    permisosCount: 48,
    esSistema: true,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  {
    id: "ROL-002",
    nombre: "Médico General / Especialista",
    codigo: "ROLE_DOCTOR",
    descripcion: "Acceso a historias clínicas, agenda de citas, recetas y evoluciones médicas.",
    usuariosCount: 28,
    permisosCount: 24,
    esSistema: false,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    id: "ROL-003",
    nombre: "Recepción / Admisión",
    codigo: "ROLE_RECEPTION",
    descripcion: "Gestión de agendamiento de citas, registro de pacientes y recepción.",
    usuariosCount: 12,
    permisosCount: 14,
    esSistema: false,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  {
    id: "ROL-004",
    nombre: "Enfermería",
    codigo: "ROLE_NURSE",
    descripcion: "Triaje, registro de signos vitales, administración de medicamentos.",
    usuariosCount: 15,
    permisosCount: 16,
    esSistema: false,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  {
    id: "ROL-005",
    nombre: "Auditor de Seguridad",
    codigo: "ROLE_AUDITOR",
    descripcion: "Acceso en modo lectura a logs de sistema, firmas y reportes financieros.",
    usuariosCount: 2,
    permisosCount: 10,
    esSistema: false,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
]

const mockPermisos = [
  { modulo: "Pacientes", ver: true, crear: true, editar: true, eliminar: false },
  { modulo: "Historias Clínicas", ver: true, crear: true, editar: true, eliminar: false },
  { modulo: "Citas Médicas", ver: true, crear: true, editar: true, eliminar: true },
  { modulo: "Seguridad y Usuarios", ver: true, crear: false, editar: false, eliminar: false },
  { modulo: "Recursos Humanos", ver: false, crear: false, editar: false, eliminar: false },
  { modulo: "Parámetros del Sistema", ver: false, crear: false, editar: false, eliminar: false },
]

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = React.useState(mockRoles[0])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Key className="size-6 text-primary" />
            Roles y Matriz de Permisos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Definición de perfiles de acceso y control de seguridad basado en roles (RBAC).
          </p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="size-4" />
          <span>Crear Nuevo Rol</span>
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Roles Definidos</CardTitle>
            <Key className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">Perfiles activos</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Usuarios Asignados</CardTitle>
            <Users className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60</div>
            <p className="text-xs text-muted-foreground mt-1">Con rol asignado</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Permisos del Sistema</CardTitle>
            <ShieldCheck className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground mt-1">Acciones granulares</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Roles de Sistema</CardTitle>
            <Lock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Protegido por el núcleo</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Roles y Detalle de Matriz */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Tarjetas de Roles */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Roles Disponibles
          </h2>
          {mockRoles.map((role) => {
            const isSelected = selectedRole.id === role.id
            return (
              <Card
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`cursor-pointer transition-all duration-200 shadow-xs hover:border-primary/50 ${
                  isSelected ? "border-primary ring-1 ring-primary bg-primary/5" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-xs ${role.color}`}>
                      {role.codigo}
                    </Badge>
                    {role.esSistema && (
                      <Badge variant="secondary" className="text-[10px]">
                        Sistema
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">{role.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">{role.descripcion}</p>
                </CardContent>
                <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 mt-2 py-2">
                  <span className="flex items-center gap-1">
                    <Users className="size-3" /> {role.usuariosCount} usuarios
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3 text-green-500" /> {role.permisosCount} permisos
                  </span>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Columna Derecha: Matriz de Permisos del Rol Seleccionado */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <Card className="shadow-xs h-full">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{selectedRole.nombre}</CardTitle>
                    <Badge variant="outline" className={`text-xs ${selectedRole.color}`}>
                      {selectedRole.codigo}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {selectedRole.descripcion}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Copy className="size-3.5" /> Clonar
                  </Button>
                  {!selectedRole.esSistema && (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Edit className="size-3.5" /> Editar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="matrix">
                <TabsList className="mb-4">
                  <TabsTrigger value="matrix">Matriz de Permisos</TabsTrigger>
                  <TabsTrigger value="users">Usuarios Asignados ({selectedRole.usuariosCount})</TabsTrigger>
                </TabsList>

                <TabsContent value="matrix" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Módulo / Recurso</TableHead>
                        <TableHead className="text-center">Ver</TableHead>
                        <TableHead className="text-center">Crear</TableHead>
                        <TableHead className="text-center">Editar</TableHead>
                        <TableHead className="text-center">Eliminar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPermisos.map((perm, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-sm">{perm.modulo}</TableCell>
                          <TableCell className="text-center">
                            {perm.ver ? (
                              <Check className="size-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {perm.crear ? (
                              <Check className="size-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {perm.editar ? (
                              <Check className="size-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {perm.eliminar ? (
                              <Check className="size-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="users" className="m-0">
                  <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-lg">
                    Muestra los usuarios activos vinculados a este rol ({selectedRole.nombre}).
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
