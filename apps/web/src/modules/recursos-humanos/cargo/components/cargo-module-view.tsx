"use client";

import * as React from "react";
import { toast } from "sonner";
import { CargoHeader } from "./cargo-header";
import { CargoMetricsCards, type CargoMetrics } from "./cargo-metrics";
import { CargoTable, type CargoItem } from "./cargo-table";
import { CargoFormDialog } from "./cargo-form-dialog";
import { CargoDeleteDialog } from "./cargo-delete-dialog";
import {
    useCargos,
    useDeleteCargo,
} from "../hooks/use-cargos";
import type { CargoResponse } from "../types/cargo.types";

export function CargoModuleView() {
    const [formDialogOpen, setFormDialogOpen] = React.useState(false);
    const [cargoToEdit, setCargoToEdit] = React.useState<
        CargoResponse | CargoItem | null
    >(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [cargoToDelete, setCargoToDelete] = React.useState<CargoItem | null>(null);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState("");

    const {
        data: apiData,
        isLoading,
        refetch,
    } = useCargos({
        page: currentPage,
        pageSize: pageSize,
        search: searchTerm.trim() || undefined,
    });

    const deleteCargoMutation = useDeleteCargo();

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const cargos: CargoItem[] = React.useMemo(() => {
        if (!apiData?.items) return [];
        return apiData.items.map((item) => ({
            id: item.id,
            codigo: item.codigo,
            nombre: item.nombre,
            descripcion: item.descripcion,
            activo: item.activo,
        }));
    }, [apiData]);

    const metrics: CargoMetrics = {
        total: apiData?.totalItems ?? 0,
        activos: cargos.filter((c) => c.activo).length,
        inactivos: cargos.filter((c) => !c.activo).length,
    };

    const handleOpenAdd = () => {
        setCargoToEdit(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (cargo: CargoItem) => {
        setCargoToEdit(cargo);
        setFormDialogOpen(true);
    };

    const handleOpenDelete = (id: number | string) => {
        const target = cargos.find((c) => c.id === id || c.id === Number(id));
        if (target) {
            setCargoToDelete(target);
            setDeleteDialogOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!cargoToDelete) return;
        const numId = Number(cargoToDelete.id);

        try {
            await deleteCargoMutation.mutateAsync(numId);
            toast.success(`Cargo ${cargoToDelete.codigo} eliminado correctamente.`);
            refetch();
        } catch {
        } finally {
            setCargoToDelete(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <CargoHeader onAddClick={handleOpenAdd} />
            <CargoMetricsCards metrics={metrics} />
            <CargoTable
                cargos={cargos}
                isLoading={isLoading}
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
            <CargoFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                cargoToEdit={cargoToEdit}
                onSuccessCallback={() => refetch()}
            />
            <CargoDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                cargo={cargoToDelete}
                onConfirm={handleConfirmDelete}
                isLoading={deleteCargoMutation.isPending}
            />
        </div>
    );
}