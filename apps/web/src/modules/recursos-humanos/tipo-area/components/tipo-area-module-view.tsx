"use client";

import * as React from "react";
import { toast } from "sonner";
import { TipoAreaHeader } from "./tipo-area-header";
import {
    TipoAreaMetricsCards,
    type TipoAreaMetrics,
} from "./tipo-area-metrics";
import { TipoAreaTable, type TipoAreaItem } from "./tipo-area-table";
import { TipoAreaFormDialog } from "./tipo-area-form-dialog";
import { TipoAreaDeleteDialog } from "./tipo-area-delete-dialog";
import {
    useDeleteTipoArea,
    useTiposArea,
} from "../hooks/use-tipos-area";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { TipoAreaResponse } from "../types/tipo-area.types";

export function TipoAreaModuleView() {
    const [formDialogOpen, setFormDialogOpen] = React.useState(false);
    const [tipoAreaToEdit, setTipoAreaToEdit] = React.useState<
        TipoAreaResponse | TipoAreaItem | null
    >(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [tipoAreaToDelete, setTipoAreaToDelete] = React.useState<TipoAreaItem | null>(null);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState("");

    const {
        data: apiData,
        isLoading,
        isError,
        error,
        refetch,
    } = useTiposArea({
        page: currentPage,
        pageSize: pageSize,
        search: searchTerm.trim() || undefined,
    });

    const deleteTipoAreaMutation = useDeleteTipoArea();

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const tiposArea: TipoAreaItem[] = React.useMemo(() => {
        if (!apiData?.items) return [];
        return apiData.items.map((item) => ({
            id: item.id,
            codigo: item.codigo,
            nombre: item.nombre,
            descripcion: item.descripcion,
            orden: item.orden,
            activo: item.activo,
        }));
    }, [apiData]);

    const ordenMax = React.useMemo(
        () => tiposArea.reduce((max, t) => (t.orden > max ? t.orden : max), 0),
        [tiposArea],
    );

    const metrics: TipoAreaMetrics = {
        total: apiData?.totalItems ?? 0,
        activos: tiposArea.filter((t) => t.activo).length,
        inactivos: tiposArea.filter((t) => !t.activo).length,
        ordenMax,
    };

    const handleOpenAdd = () => {
        setTipoAreaToEdit(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (tipoArea: TipoAreaItem) => {
        setTipoAreaToEdit(tipoArea);
        setFormDialogOpen(true);
    };

    const handleOpenDelete = (id: number | string) => {
        const target = tiposArea.find((t) => t.id === id || t.id === Number(id));
        if (target) {
            setTipoAreaToDelete(target);
            setDeleteDialogOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!tipoAreaToDelete) return;
        const numId = Number(tipoAreaToDelete.id);

        try {
            await deleteTipoAreaMutation.mutateAsync(numId);
            toast.success(
                `Tipo de área ${tipoAreaToDelete.codigo} eliminado correctamente.`,
            );
            refetch();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setTipoAreaToDelete(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <TipoAreaHeader onAddClick={handleOpenAdd} />
            <TipoAreaMetricsCards metrics={metrics} />
            <TipoAreaTable
                tiposArea={tiposArea}
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
            <TipoAreaFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                tipoAreaToEdit={tipoAreaToEdit}
                onSuccessCallback={() => refetch()}
            />
            <TipoAreaDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                tipoArea={tipoAreaToDelete}
                onConfirm={handleConfirmDelete}
                isLoading={deleteTipoAreaMutation.isPending}
            />
        </div>
    );
}