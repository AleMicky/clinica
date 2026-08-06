"use client";

import * as React from "react";
import { toast } from "sonner";
import { AreaHeader } from "./area-header";
import { AreaMetricsCards, type AreaMetrics } from "./area-metrics";
import { AreaTable, type AreaItem } from "./area-table";
import { AreaTreeView } from "./area-tree-view";
import { AreaFormDialog } from "./area-form-dialog";
import { AreaDeleteDialog } from "./area-delete-dialog";
import {
    useArbolAreas,
    useAreas,
    useDeleteArea,
} from "../hooks/use-areas";
import { useTiposArea } from "@/modules/recursos-humanos/tipo-area";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { AreaArbolResponse, AreaResponse } from "../types/area.types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AreaEditable = AreaResponse | AreaItem;

function buscarNodoEnArbol(
    arbol: AreaArbolResponse | null,
    id: number,
): AreaArbolResponse | null {
    if (!arbol) return null;
    const rec = (lista: AreaArbolResponse[]): AreaArbolResponse | null => {
        for (const nodo of lista) {
            if (nodo.id === id) return nodo;
            const encontrado = rec(nodo.subareas);
            if (encontrado) return encontrado;
        }
        return null;
    };
    return rec(arbol.subareas);
}

export function AreaModuleView() {
    const [vista, setVista] = React.useState<"lista" | "arbol">("arbol");

    const [formDialogOpen, setFormDialogOpen] = React.useState(false);
    const [areaToEdit, setAreaToEdit] = React.useState<AreaEditable | null>(null);
    const [defaultTipoAreaId, setDefaultTipoAreaId] = React.useState<number | null>(null);
    const [defaultAreaPadreId, setDefaultAreaPadreId] = React.useState<number | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [areaToDeleteId, setAreaToDeleteId] = React.useState<number | null>(null);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [searchTerm, setSearchTerm] = React.useState("");

    const {
        data: apiData,
        isLoading,
        isError,
        error,
        refetch,
    } = useAreas({
        page: currentPage,
        pageSize: pageSize,
        search: searchTerm.trim() || undefined,
    });

    const arbolQuery = useArbolAreas();
    const tiposAreaQuery = useTiposArea({ page: 1, pageSize: 100 });
    const deleteAreaMutation = useDeleteArea();

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const areas: AreaItem[] = React.useMemo(() => {
        if (!apiData?.items) return [];
        return apiData.items.map((item) => ({
            id: item.id,
            codigo: item.codigo,
            nombre: item.nombre,
            descripcion: item.descripcion,
            tipoAreaId: item.tipoAreaId,
            tipoAreaNombre: item.tipoAreaNombre,
            areaPadreId: item.areaPadreId,
            activo: item.activo,
        }));
    }, [apiData]);

    const metrics: AreaMetrics = {
        total: apiData?.totalItems ?? 0,
        activos: areas.filter((a) => a.activo).length,
        inactivos: areas.filter((a) => !a.activo).length,
        tiposArea: tiposAreaQuery.data?.totalItems ?? 0,
    };

    const handleOpenAdd = () => {
        setAreaToEdit(null);
        setDefaultTipoAreaId(null);
        setDefaultAreaPadreId(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (area: AreaEditable) => {
        setAreaToEdit(area);
        setDefaultTipoAreaId(null);
        setDefaultAreaPadreId(null);
        setFormDialogOpen(true);
    };

    const handleOpenAddSubarea = (parentId: number) => {
        const nodo = buscarNodoEnArbol(arbolQuery.data ?? null, parentId);
        const tipoAreaId = nodo?.tipoAreaId ?? null;
        setAreaToEdit(null);
        setDefaultTipoAreaId(tipoAreaId);
        setDefaultAreaPadreId(parentId);
        setFormDialogOpen(true);
    };

    const handleOpenDelete = (id: number | string) => {
        setAreaToDeleteId(Number(id));
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (areaToDeleteId === null) return;

        try {
            await deleteAreaMutation.mutateAsync(areaToDeleteId);
            toast.success(`Área eliminada correctamente.`);
            refetch();
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setAreaToDeleteId(null);
        }
    };

    const handleRefreshAll = () => {
        refetch();
        arbolQuery.refetch();
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <AreaHeader onAddClick={handleOpenAdd} />
            <AreaMetricsCards metrics={metrics} />

            <Tabs
                value={vista}
                onValueChange={(v) => setVista(v as "lista" | "arbol")}
                className="w-full"
            >
                <TabsList className="bg-muted/60 p-1 w-fit">
                    <TabsTrigger value="arbol">Vista Árbol</TabsTrigger>
                    <TabsTrigger value="lista">Lista</TabsTrigger>
                </TabsList>

                {vista === "arbol" && (
                    <AreaTreeView
                        arbol={arbolQuery.data ?? null}
                        isLoading={arbolQuery.isLoading}
                        isError={arbolQuery.isError}
                        errorMessage={getApiErrorMessage(arbolQuery.error)}
                        onRefresh={() => arbolQuery.refetch()}
                        onEdit={handleOpenEdit}
                        onAddSubarea={handleOpenAddSubarea}
                        onDelete={(id) => handleOpenDelete(id)}
                        onAdd={handleOpenAdd}
                    />
                )}

                {vista === "lista" && (
                    <AreaTable
                        areas={areas}
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
                )}
            </Tabs>

            <AreaFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                areaToEdit={areaToEdit}
                defaultTipoAreaId={defaultTipoAreaId}
                defaultAreaPadreId={defaultAreaPadreId}
                onSuccessCallback={handleRefreshAll}
            />
            <AreaDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                area={
                    areaToDeleteId !== null
                        ? {
                              id: areaToDeleteId,
                              codigo: "",
                              nombre: "",
                              descripcion: null,
                              tipoAreaId: 0,
                              tipoAreaNombre: null,
                              areaPadreId: null,
                              activo: true,
                          }
                        : null
                }
                onConfirm={handleConfirmDelete}
                isLoading={deleteAreaMutation.isPending}
            />
        </div>
    );
}