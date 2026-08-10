"use client";

import * as React from "react";
import { toast } from "sonner";
import { EmpleadoHeader } from "./empleado-header";
import {
  EmpleadoMetricsCards,
  type EmpleadoMetrics,
} from "./empleado-metrics";
import { EmpleadoTable, type EmpleadoItem } from "./empleado-table";
import { EmpleadoFormDialog } from "./empleado-form-dialog";
import { EmpleadoDeleteDialog } from "./empleado-delete-dialog";
import { EmpleadoAsignacionesDrawer } from "./empleado-asignaciones-drawer";
import {
  useDeleteEmpleado,
  useEmpleados,
} from "../hooks/use-empleados";
import type { EmpleadoResponse } from "../types/empleado.types";

type EmpleadoEditable = EmpleadoResponse | EmpleadoItem;

export function EmpleadoModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [empleadoToEdit, setEmpleadoToEdit] =
    React.useState<EmpleadoEditable | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] =
    React.useState<EmpleadoItem | null>(null);

  const [asignacionesDrawerOpen, setAsignacionesDrawerOpen] =
    React.useState(false);
  const [selectedEmpleadoForAsignaciones, setSelectedEmpleadoForAsignaciones] =
    React.useState<EmpleadoItem | null>(null);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [estadoFilter, setEstadoFilter] = React.useState("Todos");

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

  const handleEstadoFilterChange = (estado: string) => {
    setEstadoFilter(estado);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const empleados: EmpleadoItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];

    const mapped = apiData.items.map((item) => ({
      id: item.id,
      personaId: item.personaId,
      nombreCompleto: item.persona
        ? `${[
            [item.persona.apellidoPaterno, item.persona.apellidoMaterno]
              .filter(Boolean)
              .join(" "),
            item.persona.nombres,
          ]
            .filter(Boolean)
            .join(", ")}`
        : "—",
      documento: item.persona
        ? `${item.persona.tipoDocumento} ${item.persona.numeroDocumento}${
            item.persona.extensionDocumento
              ? ` ${item.persona.extensionDocumento}`
              : ""
          }`.trim()
        : "—",
      codigoEmpleado: item.codigoEmpleado,
      fechaIngreso: item.fechaIngreso,
      fechaRetiro: item.fechaRetiro ?? null,
      activo: item.activo ?? true,
      telefono: item.persona?.telefono ?? null,
      fechaNacimiento: item.persona?.fechaNacimiento,
      genero: item.persona?.genero ?? null,
      estadoCivil: item.persona?.estadoCivil ?? null,
      complementoDocumento: item.persona?.complementoDocumento ?? null,
      extensionDocumento: item.persona?.extensionDocumento ?? null,
      tipoDocumento: item.persona?.tipoDocumento,
      numeroDocumento: item.persona?.numeroDocumento,
      fechaCreacion: item.fechaCreacion,
      fechaModificacion: item.fechaModificacion ?? null,
      creadoPor: item.creadoPor ?? null,
      modificadoPor: item.modificadoPor ?? null,
    }));

    if (estadoFilter === "Activos") {
      return mapped.filter((e) => e.activo && !e.fechaRetiro);
    }
    if (estadoFilter === "Inactivos") {
      return mapped.filter((e) => !e.activo);
    }
    if (estadoFilter === "Retirados") {
      return mapped.filter((e) => Boolean(e.fechaRetiro));
    }

    return mapped;
  }, [apiData, estadoFilter]);

  const metrics: EmpleadoMetrics = React.useMemo(() => {
    const rawItems = apiData?.items ?? [];
    return {
      total: apiData?.totalItems ?? rawItems.length,
      activos: rawItems.filter((e) => (e.activo ?? true) && !e.fechaRetiro).length,
      inactivos: rawItems.filter((e) => !e.activo).length,
      retirados: rawItems.filter((e) => Boolean(e.fechaRetiro)).length,
    };
  }, [apiData]);

  const handleOpenAdd = () => {
    setEmpleadoToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (emp: EmpleadoItem) => {
    setEmpleadoToEdit(emp);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (id: number | string) => {
    const target = empleados.find(
      (e) => e.id === id || e.id === Number(id)
    );
    if (target) {
      setEmpleadoToDelete(target);
      setDeleteDialogOpen(true);
    }
  };

  const handleOpenAsignaciones = (emp: EmpleadoItem) => {
    setSelectedEmpleadoForAsignaciones(emp);
    setAsignacionesDrawerOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!empleadoToDelete) return;
    const numId = Number(empleadoToDelete.id);

    try {
      await deleteMutation.mutateAsync(numId);
      toast.success(
        `Empleado ${empleadoToDelete.codigoEmpleado} eliminado correctamente.`
      );
      refetch();
    } catch {
    } finally {
      setEmpleadoToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <EmpleadoHeader onAddClick={handleOpenAdd} />
      <EmpleadoMetricsCards metrics={metrics} />
      <EmpleadoTable
        empleados={empleados}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        estadoFilter={estadoFilter}
        onSearchChange={handleSearchChange}
        onEstadoFilterChange={handleEstadoFilterChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onManageAsignaciones={handleOpenAsignaciones}
        onRefresh={() => refetch()}
      />
      <EmpleadoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        empleadoToEdit={empleadoToEdit}
        onSuccessCallback={() => refetch()}
      />
      <EmpleadoDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        empleado={empleadoToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
      <EmpleadoAsignacionesDrawer
        open={asignacionesDrawerOpen}
        onOpenChange={setAsignacionesDrawerOpen}
        empleado={selectedEmpleadoForAsignaciones}
      />
    </div>
  );
}