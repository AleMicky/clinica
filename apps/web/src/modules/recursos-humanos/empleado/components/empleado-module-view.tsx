"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { EmpleadoHeader } from "./empleado-header";
import { EmpleadoMetricsCards, type EmpleadoMetrics } from "./empleado-metrics";
import { EmpleadoList } from "./empleado-list";
import { EmpleadoDeleteDialog } from "./empleado-delete-dialog";
import { EmpleadoAsignacionesDrawer } from "./empleado-asignaciones-drawer";
import { EmpleadoImportDialog } from "./empleado-import-dialog";
import { useDeleteEmpleado, useEmpleados, useExportarEmpleadosExcel } from "../hooks/use-empleados";
import {
  nombreCompleto,
  documentoCompleto,
  type EmpleadoResponse,
  type EmpleadoItem,
} from "../types/empleado.types";

/**
 * Función auxiliar pura para convertir EmpleadoResponse a EmpleadoItem
 */
function toEmpleadoItem(emp: EmpleadoResponse | null): EmpleadoItem | null {
  if (!emp) return null;
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
}

export function EmpleadoModuleView() {
  const router = useRouter();

  // Estados de Modales / Drawers
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] =
    React.useState<EmpleadoResponse | null>(null);

  const [asignacionesDrawerOpen, setAsignacionesDrawerOpen] =
    React.useState(false);
  const [selectedEmpleadoForAsignaciones, setSelectedEmpleadoForAsignaciones] =
    React.useState<EmpleadoResponse | null>(null);

  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  // Paginación y Búsqueda
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");
  const [sortOrder, setSortOrder] = React.useState<"DESC" | "ASC">("DESC");

  // Debounce para optimizar llamadas a la API
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useEmpleados({
    page: currentPage,
    pageSize: pageSize,
    search: debouncedSearch.trim() || undefined,
  });

  const deleteMutation = useDeleteEmpleado();
  const exportMutation = useExportarEmpleadosExcel();

  const handleExportExcel = React.useCallback(async () => {
    try {
      const blob = await exportMutation.mutateAsync(debouncedSearch.trim() || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_empleados_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Reporte de empleados generado exitosamente");
    } catch {
      toast.error("Ocurrió un error al generar el reporte de empleados");
    }
  }, [debouncedSearch, exportMutation]);

  // Handlers con useCallback
  const handleSearchChange = React.useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleStatusTabChange = React.useCallback(
    (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => {
      setSelectedStatusTab(tab);
      setCurrentPage(1);
    },
    []
  );

  const handleToggleSortOrder = React.useCallback(() => {
    setSortOrder((prev) => (prev === "DESC" ? "ASC" : "DESC"));
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const allEmpleados: EmpleadoResponse[] = React.useMemo(() => {
    return (apiData?.items ?? []).slice().sort((a, b) => {
      return sortOrder === "DESC" ? b.id - a.id : a.id - b.id;
    });
  }, [apiData?.items, sortOrder]);

  // Filtrado por tab
  const filteredEmpleados = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allEmpleados.filter((e) => e.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allEmpleados.filter((e) => !e.activo);
    }
    return allEmpleados;
  }, [allEmpleados, selectedStatusTab]);

  // Métricas
  const metrics: EmpleadoMetrics = React.useMemo(() => {
    const total = apiData?.totalItems ?? allEmpleados.length;
    const activos = allEmpleados.filter((e) => e.activo).length;
    const inactivos = allEmpleados.filter((e) => !e.activo).length;

    return { total, activos, inactivos };
  }, [apiData?.totalItems, allEmpleados]);

  // Handlers de navegación a páginas dedicadas
  const handleOpenAdd = React.useCallback(() => {
    router.push("/recursos-humanos/empleados/nuevo");
  }, [router]);

  const handleOpenEdit = React.useCallback(
    (empleado: EmpleadoResponse) => {
      router.push(`/recursos-humanos/empleados/${empleado.id}/editar`);
    },
    [router]
  );

  const handleOpenAsignaciones = React.useCallback(
    (empleado: EmpleadoResponse) => {
      setSelectedEmpleadoForAsignaciones(empleado);
      setAsignacionesDrawerOpen(true);
    },
    []
  );

  const handleOpenDelete = React.useCallback((empleado: EmpleadoResponse) => {
    setEmpleadoToDelete(empleado);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!empleadoToDelete) return;

    try {
      await deleteMutation.mutateAsync(empleadoToDelete.id);
      const nombre = empleadoToDelete.persona
        ? nombreCompleto(empleadoToDelete.persona)
        : `#${empleadoToDelete.id}`;
      toast.success(`Empleado "${nombre}" eliminado correctamente.`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Ocurrió un error al eliminar el empleado.");
    } finally {
      setEmpleadoToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const drawerEmpleadoItem = React.useMemo(
    () => toEmpleadoItem(selectedEmpleadoForAsignaciones),
    [selectedEmpleadoForAsignaciones]
  );

  const deleteEmpleadoItem = React.useMemo(
    () => toEmpleadoItem(empleadoToDelete),
    [empleadoToDelete]
  );

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <EmpleadoHeader
        onAddClick={handleOpenAdd}
        onRefresh={refetch}
        onImportClick={() => setImportDialogOpen(true)}
        onExportClick={handleExportExcel}
        isExporting={exportMutation.isPending}
      />

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
        sortOrder={sortOrder}
        onStatusTabChange={handleStatusTabChange}
        onToggleSortOrder={handleToggleSortOrder}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onManageAsignaciones={handleOpenAsignaciones}
        onRefresh={refetch}
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

      {/* Modal: Importación Masiva desde Excel */}
      <EmpleadoImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}