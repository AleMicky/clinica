"use client";

import * as React from "react";
import { toast } from "sonner";
import { AsignacionEmpleadoHeader } from "./asignacion-empleado-header";
import { AsignacionEmpleadoMetricsCards } from "./asignacion-empleado-metrics";
import {
    AsignacionEmpleadoTable,
    type AsignacionEmpleadoItem,
} from "./asignacion-empleado-table";
import { AsignacionEmpleadoFormDialog } from "./asignacion-empleado-form-dialog";
import { AsignacionEmpleadoDeleteDialog } from "./asignacion-empleado-delete-dialog";
import {
    useAsignacionesEmpleado,
    useDeleteAsignacionEmpleado,
} from "../hooks/use-asignaciones-empleado";
import type {
    AsignacionEmpleadoMetrics,
    AsignacionEmpleadoResponse,
} from "../types/asignacion-empleado.types";

export function AsignacionEmpleadoModuleView() {
    const [formDialogOpen, setFormDialogOpen] = React.useState(false);
    const [asignacionToEdit, setAsignacionToEdit] =
        React.useState<AsignacionEmpleadoResponse | null>(null);

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [asignacionToDelete, setAsignacionToDelete] =
        React.useState<AsignacionEmpleadoResponse | null>(null);

    // Pagination & Filter parameters
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [estadoFilter, setEstadoFilter] = React.useState("Todas");

    // Query Hook
    const {
        data: apiData,
        isLoading,
        refetch,
    } = useAsignacionesEmpleado({
        page: currentPage,
        pageSize: pageSize,
        search: searchTerm.trim() || undefined,
    });

    const deleteMutation = useDeleteAsignacionEmpleado();

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

    // Filter items client side for status tab if needed
    const asignaciones: AsignacionEmpleadoItem[] = React.useMemo(() => {
        if (!apiData?.items) return [];

        if (estadoFilter === "Activas") {
            return apiData.items.filter((a) => !a.fechaFin);
        }
        if (estadoFilter === "Finalizadas") {
            return apiData.items.filter((a) => Boolean(a.fechaFin));
        }

        return apiData.items;
    }, [apiData, estadoFilter]);

    // Compute metrics
    const metrics: AsignacionEmpleadoMetrics = React.useMemo(() => {
        const raw = apiData?.items ?? [];
        return {
            total: apiData?.totalItems ?? raw.length,
            activas: raw.filter((a) => !a.fechaFin).length,
            finalizadas: raw.filter((a) => Boolean(a.fechaFin)).length,
        };
    }, [apiData]);

    const handleOpenAdd = () => {
        setAsignacionToEdit(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (item: AsignacionEmpleadoItem) => {
        setAsignacionToEdit(item);
        setFormDialogOpen(true);
    };

    const handleOpenDelete = (id: number) => {
        const target = asignaciones.find((a) => a.id === id);
        if (target) {
            setAsignacionToDelete(target);
            setDeleteDialogOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!asignacionToDelete) return;

        try {
            await deleteMutation.mutateAsync(asignacionToDelete.id);
            toast.success("Asignación eliminada correctamente.");
            refetch();
        } catch {
        } finally {
            setAsignacionToDelete(null);
            setDeleteDialogOpen(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <AsignacionEmpleadoHeader onAddClick={handleOpenAdd} />
            <AsignacionEmpleadoMetricsCards metrics={metrics} />
            <AsignacionEmpleadoTable
                asignaciones={asignaciones}
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
                onRefresh={() => refetch()}
            />
            <AsignacionEmpleadoFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                asignacionToEdit={asignacionToEdit}
                onSuccessCallback={() => refetch()}
            />
            <AsignacionEmpleadoDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                asignacion={asignacionToDelete}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
