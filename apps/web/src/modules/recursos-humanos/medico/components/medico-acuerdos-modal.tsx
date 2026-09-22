"use client";

import * as React from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Handshake,
  Edit2,
  Calendar,
  DollarSign,
  Building2,
  User,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared";
import { formatCurrency } from "@/lib/utils";

import {
  useDeleteMedicoServicioAcuerdo,
  useMedicoServicioAcuerdos,
} from "../hooks/use-medicos";
import { MedicoAcuerdoDialog } from "./medico-acuerdo-dialog";
import { getMedicoFullName } from "./medico-list";
import type {
  MedicoResponse,
  MedicoServicioAcuerdoResponse,
} from "../types/medico.types";

interface MedicoAcuerdosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medico: MedicoResponse | null;
}

export function MedicoAcuerdosModal({
  open,
  onOpenChange,
  medico,
}: MedicoAcuerdosModalProps) {
  const empleadoId = medico?.empleadoId ?? 0;
  const medicoId = medico?.id ?? 0;

  // Dialog to create or edit a specific agreement
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [acuerdoToEdit, setAcuerdoToEdit] =
    React.useState<MedicoServicioAcuerdoResponse | null>(null);

  // Search & Filters inside modal
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterVigencia, setFilterVigencia] = React.useState<
    "ALL" | "ACTIVOS" | "FINALIZADOS"
  >("ALL");

  const {
    data: acuerdosData,
    isLoading: isLoadingAcuerdos,
    refetch,
  } = useMedicoServicioAcuerdos(empleadoId, medicoId, open && medicoId > 0);

  const deleteAcuerdoMutation = useDeleteMedicoServicioAcuerdo();

  const acuerdos = React.useMemo(
    () => acuerdosData?.items ?? [],
    [acuerdosData]
  );

  // Filtered agreements
  const filteredAcuerdos = React.useMemo(() => {
    return acuerdos.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.servicio?.nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.servicio?.codigo
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const today = new Date().toISOString().slice(0, 10);
      const isActivo =
        item.activo &&
        (!item.fechaFin || item.fechaFin >= today) &&
        item.fechaInicio <= today;

      if (filterVigencia === "ACTIVOS") {
        return matchSearch && isActivo;
      }
      if (filterVigencia === "FINALIZADOS") {
        return matchSearch && !isActivo;
      }
      return matchSearch;
    });
  }, [acuerdos, searchTerm, filterVigencia]);

  const handleOpenAdd = () => {
    setAcuerdoToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEdit = (acuerdo: MedicoServicioAcuerdoResponse) => {
    setAcuerdoToEdit(acuerdo);
    setIsFormDialogOpen(true);
  };

  const handleDeleteAcuerdo = async (id: number) => {
    if (!medico) return;
    try {
      await deleteAcuerdoMutation.mutateAsync({
        empleadoId: medico.empleadoId,
        medicoId: medico.id,
        id,
      });
      refetch();
    } catch {
      // Handled by toast
    }
  };

  const medicoNombre = medico ? getMedicoFullName(medico) : "Médico";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl p-5 sm:p-6 max-h-[90vh] flex flex-col gap-4 overflow-hidden">
          {/* CABECERA */}
          <DialogHeader className="space-y-1 pb-2 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
                  <Handshake className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                    Acuerdos de Honorarios y Tarifas
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Dr(a).{" "}
                    <span className="font-semibold text-foreground">
                      {medicoNombre}
                    </span>{" "}
                    · Matrícula:{" "}
                    <span className="font-mono font-bold text-primary">
                      #{medico?.matriculaProfesional}
                    </span>
                  </DialogDescription>
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="h-8.5 text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="size-3.5" />
                <span>Nuevo Acuerdo</span>
              </Button>
            </div>
          </DialogHeader>

          {/* CONTENIDO SCROLLABLE */}
          <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {/* BUSCADOR Y FILTROS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por servicio o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8.5 pl-8 pr-7 text-xs bg-background"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFilterVigencia("ALL")}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filterVigencia === "ALL"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Todos ({acuerdos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterVigencia("ACTIVOS")}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filterVigencia === "ACTIVOS"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Vigentes
                </button>
                <button
                  type="button"
                  onClick={() => setFilterVigencia("FINALIZADOS")}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filterVigencia === "FINALIZADOS"
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Finalizados
                </button>
              </div>
            </div>

            {/* TABLA DE ACUERDOS */}
            {isLoadingAcuerdos ? (
              <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2 border rounded-xl bg-card">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Cargando acuerdos de honorarios...</span>
              </div>
            ) : filteredAcuerdos.length === 0 ? (
              <div className="py-10 text-center border border-dashed rounded-xl bg-muted/10 space-y-2">
                <AlertCircle className="size-7 text-muted-foreground/50 mx-auto" />
                <p className="text-xs font-semibold text-foreground">
                  No se encontraron acuerdos comerciales
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  {searchTerm || filterVigencia !== "ALL"
                    ? "Intente ajustando los filtros de búsqueda."
                    : "Haga clic en 'Nuevo Acuerdo' para definir la distribución de honorarios por servicio."}
                </p>
              </div>
            ) : (
              <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-2xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-bold h-9">
                        Servicio Clínico
                      </TableHead>
                      <TableHead className="text-xs font-bold h-9 text-right">
                        Tarifa Total
                      </TableHead>
                      <TableHead className="text-xs font-bold h-9 text-right">
                        Pago Médico
                      </TableHead>
                      <TableHead className="text-xs font-bold h-9 text-right">
                        Retención Clínica
                      </TableHead>
                      <TableHead className="text-xs font-bold h-9 text-center">
                        Vigencia
                      </TableHead>
                      <TableHead className="text-xs font-bold h-9 text-center w-20">
                        Estado
                      </TableHead>
                      <TableHead className="text-xs font-bold h-9 text-right w-20">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAcuerdos.map((item) => {
                      const totalServicio = item.importeServicio || 0;
                      const pagoMedico = item.importeMedico || 0;
                      const clinica = item.importeClinica || 0;
                      const medicoPct =
                        totalServicio > 0
                          ? Math.round((pagoMedico / totalServicio) * 100)
                          : 0;
                      const clinicaPct =
                        totalServicio > 0
                          ? Math.round((clinica / totalServicio) * 100)
                          : 0;

                      return (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="py-2.5">
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-xs font-bold text-foreground truncate">
                                {item.servicio?.nombre ||
                                  `Servicio #${item.servicioId}`}
                              </p>
                              {item.servicio?.codigo && (
                                <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded border border-border/40">
                                  #{item.servicio.codigo}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="py-2.5 text-right font-mono font-bold text-xs">
                            {formatCurrency(totalServicio)}
                          </TableCell>

                          <TableCell className="py-2.5 text-right">
                            <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(pagoMedico)}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ({medicoPct}%)
                            </span>
                          </TableCell>

                          <TableCell className="py-2.5 text-right">
                            <div className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                              {formatCurrency(clinica)}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ({clinicaPct}%)
                            </span>
                          </TableCell>

                          <TableCell className="py-2.5 text-center text-[10.5px] font-mono text-muted-foreground">
                            <div>
                              Desde: {item.fechaInicio?.slice(0, 10) || "—"}
                            </div>
                            {item.fechaFin && (
                              <div className="text-[10px] text-muted-foreground/70">
                                Hasta: {item.fechaFin.slice(0, 10)}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="py-2.5 text-center">
                            <StatusBadge active={item.activo} />
                          </TableCell>

                          <TableCell className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(item)}
                                className="size-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer rounded-lg"
                                title="Editar acuerdo"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAcuerdo(item.id)}
                                disabled={deleteAcuerdoMutation.isPending}
                                className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                                title="Eliminar acuerdo"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DIALOG PARA CREAR / EDITAR ACUERDO INDIVIDUAL */}
      <MedicoAcuerdoDialog
        open={isFormDialogOpen}
        onOpenChange={(openVal) => {
          setIsFormDialogOpen(openVal);
          if (!openVal) {
            setAcuerdoToEdit(null);
            refetch();
          }
        }}
        empleadoId={empleadoId}
        medicoId={medicoId}
        acuerdoToEdit={acuerdoToEdit}
      />
    </>
  );
}
