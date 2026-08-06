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
import {
    useDeleteEmpleado,
    useEmpleados,
} from "../hooks/use-empleados";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { EmpleadoResponse } from "../types/empleado.types";

type EmpleadoEditable = EmpleadoResponse | EmpleadoItem;

export function EmpleadoModuleView() {
    const [formDialogOpen, setFormDialogOpen] = React.useState(false);
    const [empleadoToEdit, setEmpleadoToEdit] =
        React.useState<EmpleadoEditable | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [empleadoToDelete, setEmpleadoToDelete] =
        React.useState<EmpleadoItem | null>(null);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState("");

    const {
        data: apiData,
        isLoading,
        isError,
        error,
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

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const empleados: EmpleadoItem[] = React.useMemo(() => {
        if (!apiData?.items) return [];
        return apiData.items.map((item) => ({
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
            activo: item.activo,
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
    }, [apiData]);

    const metrics: EmpleadoMetrics = {
        total: apiData?.totalItems ?? 0,
        activos: empleados.filter((e) => e.activo && !e.fechaRetiro).length,
        inactivos: empleados.filter((e) => !e.activo).length,
        retirados: empleados.filter((e) => Boolean(e.fechaRetiro)).length,
    };

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
            (e) => e.id === id || e.id === Number(id),
        );
        if (target) {
            setEmpleadoToDelete(target);
            setDeleteDialogOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!empleadoToDelete) return;
        const numId = Number(empleadoToDelete.id);

        try {
            await deleteMutation.mutateAsync(numId);
            toast.success(
                `Empleado ${empleadoToDelete.codigoEmpleado} eliminado correctamente.`,
            );
            refetch();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setEmpleadoToDelete(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <EmpleadoHeader onAddClick={handleOpenAdd} />
            <EmpleadoMetricsCards metrics={metrics} />
            <EmpleadoTable
                empleados={empleados}
                isLoading={isLoading}
                isError={isError}
                errorMessage={getApiErrorMessage(error)}
                totalItems={apiData?.totalItems ?? 0}
                currentPage={currentPage}
                pageSize={pageSize}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
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
        </div>
    );
}