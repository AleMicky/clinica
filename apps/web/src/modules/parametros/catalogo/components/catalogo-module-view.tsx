"use client";

import * as React from "react";
import { toast } from "sonner";

import { CatalogoHeader } from "./catalogo-header";
import { CatalogoMetricsCards } from "./catalogo-metrics";
import { CatalogoGrupoList } from "./catalogo-grupo-list";
import { CatalogoItemTable } from "./catalogo-item-table";
import { CatalogoGrupoFormDialog } from "./catalogo-grupo-form-dialog";
import { CatalogoGrupoDeleteDialog } from "./catalogo-grupo-delete-dialog";
import { CatalogoItemFormDialog } from "./catalogo-item-form-dialog";
import { CatalogoItemDeleteDialog } from "./catalogo-item-delete-dialog";

import {
  useCatalogoGrupos,
  useDeleteCatalogoGrupo,
  useCatalogoItems,
  useDeleteCatalogoItem,
} from "../hooks/use-catalogos";
import type {
  CatalogoGrupoResponse,
  CatalogoItemResponse,
  CatalogoMetrics,
} from "../types/catalogo.types";

export function CatalogoModuleView() {
  // Catalogo Grupos state & query
  const [grupoSearchTerm, setGrupoSearchTerm] = React.useState("");
  const [selectedGrupo, setSelectedGrupo] = React.useState<CatalogoGrupoResponse | null>(null);

  const {
    data: gruposData,
    isLoading: isLoadingGrupos,
    refetch: refetchGrupos,
  } = useCatalogoGrupos({
    search: grupoSearchTerm.trim() || undefined,
  });

  const grupos = React.useMemo(() => gruposData?.items ?? [], [gruposData]);

  // Auto-select first catalog when available if none selected
  React.useEffect(() => {
    if (grupos.length > 0 && !selectedGrupo) {
      setSelectedGrupo(grupos[0]);
    } else if (selectedGrupo && grupos.length > 0) {
      // Keep selected catalog updated if present in new list
      const updated = grupos.find((g) => g.id === selectedGrupo.id);
      if (updated) setSelectedGrupo(updated);
    }
  }, [grupos, selectedGrupo]);

  // Catalogo Items state & pagination
  const [itemSearchTerm, setItemSearchTerm] = React.useState("");
  const [itemPage, setItemPage] = React.useState(1);
  const [itemPageSize, setItemPageSize] = React.useState(10);

  const {
    data: itemsData,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    error: itemsError,
    refetch: refetchItems,
  } = useCatalogoItems(selectedGrupo?.id ?? 0, {
    page: itemPage,
    pageSize: itemPageSize,
    search: itemSearchTerm.trim() || undefined,
  });

  const items = React.useMemo(() => itemsData?.items ?? [], [itemsData]);

  // Reset item pagination when searching or changing selected group
  const handleItemSearchChange = (term: string) => {
    setItemSearchTerm(term);
    setItemPage(1);
  };

  const handleGrupoSelect = (grupo: CatalogoGrupoResponse) => {
    setSelectedGrupo(grupo);
    setItemSearchTerm("");
    setItemPage(1);
  };

  // Grupo Dialogs state
  const [grupoFormOpen, setGrupoFormOpen] = React.useState(false);
  const [grupoToEdit, setGrupoToEdit] = React.useState<CatalogoGrupoResponse | null>(null);

  const [grupoDeleteOpen, setGrupoDeleteOpen] = React.useState(false);
  const [grupoToDelete, setGrupoToDelete] = React.useState<CatalogoGrupoResponse | null>(null);
  const deleteGrupoMutation = useDeleteCatalogoGrupo();

  const handleOpenAddGrupo = () => {
    setGrupoToEdit(null);
    setGrupoFormOpen(true);
  };

  const handleOpenEditGrupo = (grupo: CatalogoGrupoResponse) => {
    setGrupoToEdit(grupo);
    setGrupoFormOpen(true);
  };

  const handleOpenDeleteGrupo = (grupo: CatalogoGrupoResponse) => {
    setGrupoToDelete(grupo);
    setGrupoDeleteOpen(true);
  };

  const handleConfirmDeleteGrupo = async () => {
    if (!grupoToDelete) return;
    try {
      await deleteGrupoMutation.mutateAsync(grupoToDelete.id);
      toast.success(`Catálogo ${grupoToDelete.nombre} eliminado correctamente.`);
      if (selectedGrupo?.id === grupoToDelete.id) {
        setSelectedGrupo(null);
      }
      refetchGrupos();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Error al eliminar el catálogo."
      );
    } finally {
      setGrupoToDelete(null);
      setGrupoDeleteOpen(false);
    }
  };

  // Item Dialogs state
  const [itemFormOpen, setItemFormOpen] = React.useState(false);
  const [itemToEdit, setItemToEdit] = React.useState<CatalogoItemResponse | null>(null);

  const [itemDeleteOpen, setItemDeleteOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<CatalogoItemResponse | null>(null);
  const deleteItemMutation = useDeleteCatalogoItem();

  const handleOpenAddItem = () => {
    if (!selectedGrupo) {
      toast.error("Seleccione un catálogo antes de agregar un ítem.");
      return;
    }
    setItemToEdit(null);
    setItemFormOpen(true);
  };

  const handleOpenEditItem = (item: CatalogoItemResponse) => {
    setItemToEdit(item);
    setItemFormOpen(true);
  };

  const handleOpenDeleteItem = (item: CatalogoItemResponse) => {
    setItemToDelete(item);
    setItemDeleteOpen(true);
  };

  const handleConfirmDeleteItem = async () => {
    if (!selectedGrupo || !itemToDelete) return;
    try {
      await deleteItemMutation.mutateAsync({
        grupoId: selectedGrupo.id,
        itemId: itemToDelete.id,
      });
      toast.success(`Elemento ${itemToDelete.nombre} eliminado correctamente.`);
      refetchItems();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Error al eliminar el elemento."
      );
    } finally {
      setItemToDelete(null);
      setItemDeleteOpen(false);
    }
  };

  // Calculate Metrics
  const metrics: CatalogoMetrics = React.useMemo(() => {
    const totalCatalogos = grupos.length;
    const catalogosActivos = grupos.filter((g) => g.activo).length;
    const catalogosInactivos = totalCatalogos - catalogosActivos;
    const elementosRegistrados = itemsData?.totalItems ?? items.length;

    return {
      totalCatalogos,
      elementosRegistrados,
      catalogosActivos,
      catalogosInactivos,
    };
  }, [grupos, itemsData, items]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <CatalogoHeader onAddGrupoClick={handleOpenAddGrupo} />
      <CatalogoMetricsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Catalogo Grupos List */}
        <div className="lg:col-span-4 xl:col-span-3 h-full">
          <CatalogoGrupoList
            grupos={grupos}
            selectedGrupoId={selectedGrupo?.id ?? null}
            isLoading={isLoadingGrupos}
            searchTerm={grupoSearchTerm}
            onSearchChange={setGrupoSearchTerm}
            onSelectGrupo={handleGrupoSelect}
            onEditGrupo={handleOpenEditGrupo}
            onDeleteGrupo={handleOpenDeleteGrupo}
          />
        </div>

        {/* Right Column: Items Table */}
        <div className="lg:col-span-8 xl:col-span-9 h-full">
          <CatalogoItemTable
            selectedGrupo={selectedGrupo}
            items={items}
            isLoading={isLoadingItems}
            isError={isErrorItems}
            errorMessage={(itemsError as any)?.message}
            totalItems={itemsData?.totalItems ?? 0}
            currentPage={itemPage}
            pageSize={itemPageSize}
            searchTerm={itemSearchTerm}
            onSearchChange={handleItemSearchChange}
            onPageChange={setItemPage}
            onPageSizeChange={(size) => {
              setItemPageSize(size);
              setItemPage(1);
            }}
            onAddItem={handleOpenAddItem}
            onEditItem={handleOpenEditItem}
            onDeleteItem={handleOpenDeleteItem}
            onRefresh={() => refetchItems()}
          />
        </div>
      </div>

      {/* Dialogs */}
      <CatalogoGrupoFormDialog
        open={grupoFormOpen}
        onOpenChange={setGrupoFormOpen}
        grupoToEdit={grupoToEdit}
        onSuccessCallback={(createdOrUpdated) => {
          refetchGrupos();
          if (createdOrUpdated) {
            setSelectedGrupo(createdOrUpdated);
          }
        }}
      />

      <CatalogoGrupoDeleteDialog
        open={grupoDeleteOpen}
        onOpenChange={setGrupoDeleteOpen}
        grupo={grupoToDelete}
        onConfirm={handleConfirmDeleteGrupo}
        isLoading={deleteGrupoMutation.isPending}
      />

      <CatalogoItemFormDialog
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        grupo={selectedGrupo}
        itemToEdit={itemToEdit}
        nextOrden={
          items.length > 0
            ? Math.max(...items.map((i) => i.orden || 0)) + 1
            : (itemsData?.totalItems ?? 0) + 1
        }
        onSuccessCallback={() => refetchItems()}
      />

      <CatalogoItemDeleteDialog
        open={itemDeleteOpen}
        onOpenChange={setItemDeleteOpen}
        item={itemToDelete}
        onConfirm={handleConfirmDeleteItem}
        isLoading={deleteItemMutation.isPending}
      />
    </div>
  );
}
