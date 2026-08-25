"use client";

import * as React from "react";
import { toast } from "sonner";
import { EmpleadoHeader } from "./empleado-header";
import { EmpleadoMetricsCards, type EmpleadoMetrics } from "./empleado-metrics";
import { EmpleadoList } from "./empleado-list";
import { EmpleadoFormDialog } from "./empleado-form-dialog";
import { EmpleadoDeleteDialog } from "./empleado-delete-dialog";
import { EmpleadoAsignacionesDrawer } from "./empleado-asignaciones-drawer";
import { useDeleteEmpleado, useEmpleados } from "../hooks/use-empleados";
import {
  nombreCompleto,
  documentoCompleto,
  type EmpleadoResponse,
} from "../types/empleado.types";

export function EmpleadoModuleView() {
  // Form Dialog state (Create / Edit modal)
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [empleadoToEdit, setEmpleadoToEdit] =
    React.useState<EmpleadoResponse | null>(null);

  // Delete dialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] =
    React.useState<EmpleadoResponse | null>(null);

  // Asignaciones Drawer state
  const [asignacionesDrawerOpen, setAsignacionesDrawerOpen] =
    React.useState(false);
  const [selectedEmpleadoForAsignaciones, setSelectedEmpleadoForAsignaciones] =
    React.useState<EmpleadoResponse | null>(null);

  // Pagination & search parameters
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useEmpleados({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const deleteMutation = useDeleteEmpleado();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusTabChange = (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => {
    setSelectedStatusTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const allEmpleados: EmpleadoResponse[] = apiData?.items ?? [];

  // Filter by status tab
  const filteredEmpleados = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allEmpleados.filter((e) => e.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allEmpleados.filter((e) => !e.activo);
    }
    return allEmpleados;
  }, [allEmpleados, selectedStatusTab]);

  // Compute Metrics
  const total = apiData?.totalItems ?? allEmpleados.length;
  const activos = allEmpleados.filter((e) => e.activo).length;
  const inactivos = allEmpleados.filter((e) => !e.activo).length;

  const metrics: EmpleadoMetrics = {
    total,
    activos,
    inactivos,
  };

  const handleOpenAdd = () => {
    setEmpleadoToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (empleado: EmpleadoResponse) => {
    setEmpleadoToEdit(empleado);
    setFormDialogOpen(true);
  };

  const handleOpenAsignaciones = (empleado: EmpleadoResponse) => {
    setSelectedEmpleadoForAsignaciones(empleado);
    setAsignacionesDrawerOpen(true);
  };

  const handleOpenDelete = (empleado: EmpleadoResponse) => {
    setEmpleadoToDelete(empleado);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!empleadoToDelete) return;

    try {
      await deleteMutation.mutateAsync(empleadoToDelete.id);
      const nombre = empleadoToDelete.persona
        ? nombreCompleto(empleadoToDelete.persona)
        : `#${empleadoToDelete.id}`;
      toast.success(`Empleado "${nombre}" eliminado correctamente.`);
      refetch();
    } catch {
      toast.error("Ocurrió un error al eliminar el empleado.");
    } finally {
      setEmpleadoToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Convert for drawer compatibility
  const drawerEmpleadoItem = React.useMemo(() => {
    if (!selectedEmpleadoForAsignaciones) return null;
    const emp = selectedEmpleadoForAsignaciones;
    const persona = emp.persona;
    return {
      id: emp.id,
      personaId: emp.personaId,
      codigoEmpleado: emp.codigoEmpleado,
      nombreCompleto: persona ? nombreCompleto(persona) : "—",
      documentoCompleto: persona ? documentoCompleto(persona) : "—",
      fechaIngreso: emp.fechaIngreso,
      fechaRetiro: emp.fechaRetiro,
      activo: emp.activo,
      fechaCreacion: emp.fechaCreacion,
      creadoPor: emp.creadoPor,
      modificadoPor: emp.modificadoPor,
      persona,
    };
  }, [selectedEmpleadoForAsignaciones]);

  const deleteEmpleadoItem = React.useMemo(() => {
    if (!empleadoToDelete) return null;
    const emp = empleadoToDelete;
    const persona = emp.persona;
    return {
      id: emp.id,
      personaId: emp.personaId,
      codigoEmpleado: emp.codigoEmpleado,
      nombreCompleto: persona ? nombreCompleto(persona) : "—",
      documentoCompleto: persona ? documentoCompleto(persona) : "—",
      fechaIngreso: emp.fechaIngreso,
      fechaRetiro: emp.fechaRetiro,
      activo: emp.activo,
      fechaCreacion: emp.fechaCreacion,
      creadoPor: emp.creadoPor,
      modificadoPor: emp.modificadoPor,
      persona,
    };
  }, [empleadoToDelete]);

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <EmpleadoHeader onAddClick={handleOpenAdd} onRefresh={() => refetch()} />

      {/* Tarjetas de Métricas en Vivo */}
      <EmpleadoMetricsCards metrics={metrics} />

      {/* Listado Principal de Empleados */}
      <EmpleadoList
        empleados={filteredEmpleados}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? allEmpleados.length}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedStatusTab={selectedStatusTab}
        onStatusTabChange={handleStatusTabChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onManageAsignaciones={handleOpenAsignaciones}
        onRefresh={() => refetch()}
      />

      {/* Modal: Crear / Editar Empleado */}
      <EmpleadoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        empleadoToEdit={empleadoToEdit}
        onSuccessCallback={() => refetch()}
      />

      {/* Drawer: Gestión de Asignaciones (Áreas y Cargos) */}
      <EmpleadoAsignacionesDrawer
        open={asignacionesDrawerOpen}
        onOpenChange={setAsignacionesDrawerOpen}
        empleado={drawerEmpleadoItem}
      />

      {/* Modal: Confirmación de Eliminación */}
      <EmpleadoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        empleado={deleteEmpleadoItem}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}