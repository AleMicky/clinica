"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  RefreshCw,
  FolderTree,
  Tag,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useTiposMovimientoCaja,
  useConceptosMovimientoCaja,
} from "../hooks/use-tipo-movimiento";
import type {
  TipoMovimientoCajaInfo,
  ConceptoMovimientoCajaInfo,
} from "../types/tipo-movimiento.types";
import { TipoMovimientoCajaFormDialog } from "./tipo-movimiento-caja-form-dialog";
import { TipoMovimientoCajaDeleteDialog } from "./tipo-movimiento-caja-delete-dialog";
import { ConceptoMovimientoCajaFormDialog } from "./concepto-movimiento-caja-form-dialog";
import { ConceptoMovimientoCajaDeleteDialog } from "./concepto-movimiento-caja-delete-dialog";

export function TipoMovimientoCajaModuleView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filtroNaturaleza, setFiltroNaturaleza] = React.useState<string>("TODOS");

  // State for Tipo Movimiento Dialogs
  const [tipoFormOpen, setTipoFormOpen] = React.useState(false);
  const [tipoToEdit, setTipoToEdit] = React.useState<TipoMovimientoCajaInfo | null>(null);
  const [tipoDeleteOpen, setTipoDeleteOpen] = React.useState(false);
  const [tipoToDelete, setTipoToDelete] = React.useState<TipoMovimientoCajaInfo | null>(null);

  // State for Concepto Movimiento Dialogs
  const [conceptoFormOpen, setConceptoFormOpen] = React.useState(false);
  const [tipoPadreForConcepto, setTipoPadreForConcepto] = React.useState<TipoMovimientoCajaInfo | null>(null);
  const [conceptoToEdit, setConceptoToEdit] = React.useState<ConceptoMovimientoCajaInfo | null>(null);
  const [conceptoDeleteOpen, setConceptoDeleteOpen] = React.useState(false);
  const [conceptoToDelete, setConceptoToDelete] = React.useState<ConceptoMovimientoCajaInfo | null>(null);

  const { data: tiposData, isLoading, refetch } = useTiposMovimientoCaja();
  const { data: allConceptosData } = useConceptosMovimientoCaja();

  const handleCreateTipo = () => {
    setTipoToEdit(null);
    setTipoFormOpen(true);
  };

  const handleEditTipo = (tipo: TipoMovimientoCajaInfo) => {
    setTipoToEdit(tipo);
    setTipoFormOpen(true);
  };

  const handleDeleteTipo = (tipo: TipoMovimientoCajaInfo) => {
    setTipoToDelete(tipo);
    setTipoDeleteOpen(true);
  };

  const handleCreateConcepto = (tipo: TipoMovimientoCajaInfo) => {
    setTipoPadreForConcepto(tipo);
    setConceptoToEdit(null);
    setConceptoFormOpen(true);
  };

  const handleEditConcepto = (
    tipo: TipoMovimientoCajaInfo,
    concepto: ConceptoMovimientoCajaInfo
  ) => {
    setTipoPadreForConcepto(tipo);
    setConceptoToEdit(concepto);
    setConceptoFormOpen(true);
  };

  const handleDeleteConcepto = (concepto: ConceptoMovimientoCajaInfo) => {
    setConceptoToDelete(concepto);
    setConceptoDeleteOpen(true);
  };

  const filteredTipos = React.useMemo(() => {
    if (!tiposData) return [];

    return tiposData.filter((t) => {
      const matchesSearch =
        !searchTerm ||
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.descripcion && t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesNaturaleza =
        filtroNaturaleza === "TODOS" ||
        t.naturaleza.toUpperCase() === filtroNaturaleza.toUpperCase();

      return matchesSearch && matchesNaturaleza;
    });
  }, [tiposData, searchTerm, filtroNaturaleza]);

  const totalTipos = tiposData?.length || 0;
  const totalEntradas =
    tiposData?.filter((t) => t.naturaleza.toUpperCase() === "ENTRADA").length || 0;
  const totalSalidas =
    tiposData?.filter((t) => t.naturaleza.toUpperCase() === "SALIDA").length || 0;
  const totalConceptos = allConceptosData?.length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Tipos y Conceptos de Movimiento
              </h1>
              <p className="text-xs text-muted-foreground">
                Configuración del catálogo de tipos y conceptos para ingresos y egresos de caja
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={handleCreateTipo}
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo Tipo</span>
          </Button>
        </div>
      </div>

      {/* Métricas / Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-xs py-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total de Tipos</span>
            <FolderTree className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{totalTipos}</div>
        </Card>

        <Card className="shadow-xs py-3 px-4 border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Ingresos (Entrada)
            </span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {totalEntradas}
          </div>
        </Card>

        <Card className="shadow-xs py-3 px-4 border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">
              Egresos (Salida)
            </span>
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
            {totalSalidas}
          </div>
        </Card>

        <Card className="shadow-xs py-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total de Conceptos</span>
            <Tag className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{totalConceptos}</div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs bg-card"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Button
            variant={filtroNaturaleza === "TODOS" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroNaturaleza("TODOS")}
            className="h-8 text-xs px-3 flex-1 sm:flex-initial"
          >
            Todos ({totalTipos})
          </Button>
          <Button
            variant={filtroNaturaleza === "ENTRADA" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroNaturaleza("ENTRADA")}
            className="h-8 text-xs px-3 flex-1 sm:flex-initial gap-1"
          >
            <ArrowDownLeft className="h-3 w-3 text-emerald-500" />
            Entradas ({totalEntradas})
          </Button>
          <Button
            variant={filtroNaturaleza === "SALIDA" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroNaturaleza("SALIDA")}
            className="h-8 text-xs px-3 flex-1 sm:flex-initial gap-1"
          >
            <ArrowUpRight className="h-3 w-3 text-rose-500" />
            Salidas ({totalSalidas})
          </Button>
        </div>
      </div>

      {/* Lista de Tipos con sus Conceptos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredTipos.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground border-dashed">
          <SlidersHorizontal className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-foreground">No se encontraron tipos de movimiento</p>
          <p className="text-xs text-muted-foreground mt-1">
            {searchTerm
              ? "Pruebe con otros términos de búsqueda."
              : "Comience creando el primer tipo de movimiento en el sistema."}
          </p>
          {!searchTerm && (
            <Button
              size="sm"
              onClick={handleCreateTipo}
              className="mt-4 h-8 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Crear Primer Tipo</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTipos.map((tipo) => (
            <TipoMovimientoCard
              key={tipo.id}
              tipo={tipo}
              onEditTipo={() => handleEditTipo(tipo)}
              onDeleteTipo={() => handleDeleteTipo(tipo)}
              onCreateConcepto={() => handleCreateConcepto(tipo)}
              onEditConcepto={(conc) => handleEditConcepto(tipo, conc)}
              onDeleteConcepto={(conc) => handleDeleteConcepto(conc)}
            />
          ))}
        </div>
      )}

      {/* Modals / Dialogs */}
      <TipoMovimientoCajaFormDialog
        open={tipoFormOpen}
        onOpenChange={setTipoFormOpen}
        tipoToEdit={tipoToEdit}
      />

      <TipoMovimientoCajaDeleteDialog
        open={tipoDeleteOpen}
        onOpenChange={setTipoDeleteOpen}
        tipo={tipoToDelete}
      />

      <ConceptoMovimientoCajaFormDialog
        open={conceptoFormOpen}
        onOpenChange={setConceptoFormOpen}
        tipoPadre={tipoPadreForConcepto}
        conceptoToEdit={conceptoToEdit}
      />

      <ConceptoMovimientoCajaDeleteDialog
        open={conceptoDeleteOpen}
        onOpenChange={setConceptoDeleteOpen}
        concepto={conceptoToDelete}
      />
    </div>
  );
}

interface TipoMovimientoCardProps {
  tipo: TipoMovimientoCajaInfo;
  onEditTipo: () => void;
  onDeleteTipo: () => void;
  onCreateConcepto: () => void;
  onEditConcepto: (concepto: ConceptoMovimientoCajaInfo) => void;
  onDeleteConcepto: (concepto: ConceptoMovimientoCajaInfo) => void;
}

function TipoMovimientoCard({
  tipo,
  onEditTipo,
  onDeleteTipo,
  onCreateConcepto,
  onEditConcepto,
  onDeleteConcepto,
}: Readonly<TipoMovimientoCardProps>) {
  const isEntrada = tipo.naturaleza.toUpperCase() === "ENTRADA";
  const { data: conceptos, isLoading } = useConceptosMovimientoCaja(tipo.id);

  return (
    <Card className="shadow-xs overflow-hidden border border-border flex flex-col justify-between">
      <div>
        <CardHeader className="p-4 pb-3 bg-muted/20 border-b border-border/60">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted font-bold text-foreground border border-border/60">
                  {tipo.codigo}
                </span>
                <CardTitle className="text-sm font-semibold text-foreground">
                  {tipo.nombre}
                </CardTitle>
              </div>

              {tipo.descripcion && (
                <CardDescription className="text-xs text-muted-foreground/90 line-clamp-2">
                  {tipo.descripcion}
                </CardDescription>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                variant={isEntrada ? "default" : "secondary"}
                className={`text-[10px] px-2 py-0.5 font-medium ${
                  isEntrada
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20"
                }`}
              >
                {isEntrada ? "Entrada (+)" : "Salida (-)"}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">Opciones</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem
                    onClick={onEditTipo}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Editar Tipo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onCreateConcepto}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Agregar Concepto</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDeleteTipo}
                    className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar Tipo</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <Tag className="h-3 w-3 text-muted-foreground" />
                Conceptos asociados
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {conceptos ? `${conceptos.length} concepto(s)` : "Cargando..."}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateConcepto}
                  className="h-6 px-2 text-[11px] text-primary hover:text-primary/90 hover:bg-primary/10 gap-1 font-medium"
                >
                  <Plus className="h-3 w-3" />
                  <span>Nuevo</span>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-3/4" />
              </div>
            ) : !conceptos || conceptos.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/80 p-3.5 text-center text-xs text-muted-foreground">
                <p>No tiene conceptos asociados</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateConcepto}
                  className="mt-2 h-7 text-[11px] gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Agregar primer concepto</span>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/60 rounded-md border border-border/80 overflow-hidden bg-background">
                {conceptos.map((conc: ConceptoMovimientoCajaInfo) => (
                  <div
                    key={conc.id}
                    className="group flex items-center justify-between px-3 py-1.5 text-xs hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {conc.codigo}
                      </span>
                      <div className="truncate">
                        <span className="font-medium text-foreground">{conc.nombre}</span>
                        {conc.descripcion && (
                          <span className="text-[11px] text-muted-foreground ml-2 hidden sm:inline">
                            - {conc.descripcion}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditConcepto(conc)}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Editar concepto"
                      >
                        <Pencil className="h-3 w-3" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteConcepto(conc)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Eliminar concepto"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
