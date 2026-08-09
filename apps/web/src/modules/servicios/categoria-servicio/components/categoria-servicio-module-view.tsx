"use client";

import * as React from "react";
import { toast } from "sonner";
import { CategoriaServicioHeader } from "./categoria-servicio-header";
import { CategoriaServicioList } from "./categoria-servicio-list";
import { CategoriaServicioFormDialog } from "./categoria-servicio-form-dialog";
import { CategoriaServicioDeleteDialog } from "./categoria-servicio-delete-dialog";
import { useCategoriasServicio } from "../hooks/use-categoria-servicio";
import type { CategoriaServicioResponse } from "../types/categoria-servicio.types";

import {
  ServicioList,
  ServicioFormDialog,
  ServicioDeleteDialog,
  useServicios,
  type ServicioItem,
  type ServicioResponse,
} from "../../servicio";

export function CategoriaServicioModuleView() {
  // Category state & query
  const [categoriaSearchTerm, setCategoriaSearchTerm] = React.useState("");
  const [selectedCategoriaId, setSelectedCategoriaId] = React.useState<number | null>(null);

  const {
    data: categoriasData,
    isLoading: isLoadingCategorias,
    refetch: refetchCategorias,
  } = useCategoriasServicio({
    search: categoriaSearchTerm.trim() || undefined,
    pageSize: 100,
  });

  const categorias = categoriasData?.items ?? [];

  // Derived selected category from ID state (no useEffect sync needed)
  const selectedCategoria =
    categorias.find((c) => c.id === selectedCategoriaId) ?? null;

  // Services state & query for selected category
  const [servicioSearchTerm, setServicioSearchTerm] = React.useState("");
  const [servicioPage, setServicioPage] = React.useState(1);
  const [servicioPageSize, setServicioPageSize] = React.useState(10);

  const {
    data: serviciosData,
    isLoading: isLoadingServicios,
    refetch: refetchServicios,
  } = useServicios(
    selectedCategoria?.id ?? 0,
    {
      page: servicioPage,
      pageSize: servicioPageSize,
      search: servicioSearchTerm.trim() || undefined,
    },
    Boolean(selectedCategoria?.id)
  );

  const handleCategoriaSelect = (cat: CategoriaServicioResponse) => {
    setSelectedCategoriaId(cat.id);
    setServicioSearchTerm("");
    setServicioPage(1);
  };

  const handleServicioSearchChange = (term: string) => {
    setServicioSearchTerm(term);
    setServicioPage(1);
  };

  // Category Dialogs
  const [catFormOpen, setCatFormOpen] = React.useState(false);
  const [catToEdit, setCatToEdit] = React.useState<CategoriaServicioResponse | null>(null);

  const [catDeleteOpen, setCatDeleteOpen] = React.useState(false);
  const [catToDelete, setCatToDelete] = React.useState<CategoriaServicioResponse | null>(null);

  const handleOpenAddCat = () => {
    setCatToEdit(null);
    setCatFormOpen(true);
  };

  const handleOpenEditCat = (cat: CategoriaServicioResponse) => {
    setCatToEdit(cat);
    setCatFormOpen(true);
  };

  const handleOpenDeleteCat = (cat: CategoriaServicioResponse) => {
    setCatToDelete(cat);
    setCatDeleteOpen(true);
  };

  // Service Dialogs
  const [srvFormOpen, setSrvFormOpen] = React.useState(false);
  const [srvToEdit, setSrvToEdit] = React.useState<ServicioItem | null>(null);

  const [srvDeleteOpen, setSrvDeleteOpen] = React.useState(false);
  const [srvToDelete, setSrvToDelete] = React.useState<ServicioItem | null>(null);

  const handleOpenAddSrv = () => {
    if (!selectedCategoria) {
      toast.error("Seleccione una categoría antes de agregar un servicio.");
      return;
    }
    setSrvToEdit(null);
    setSrvFormOpen(true);
  };

  const handleOpenEditSrv = (srv: ServicioItem) => {
    setSrvToEdit(srv);
    setSrvFormOpen(true);
  };

  const handleOpenDeleteSrv = (srv: ServicioItem) => {
    setSrvToDelete(srv);
    setSrvDeleteOpen(true);
  };

  // Map servicios response to ServicioItem
  const servicios: ServicioItem[] = React.useMemo(() => {
    if (!serviciosData?.items) return [];
    return serviciosData.items.map((item: ServicioResponse) => ({
      ...item,
      categoriaNombre: selectedCategoria?.nombre ?? "Categoría",
    }));
  }, [serviciosData, selectedCategoria]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <CategoriaServicioHeader />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)] items-start">
        {/* Left Panel (Master): Categorías List */}
        <div>
          <CategoriaServicioList
            categorias={categorias}
            selectedCategoriaId={selectedCategoriaId}
            isLoading={isLoadingCategorias}
            searchTerm={categoriaSearchTerm}
            onSearchChange={setCategoriaSearchTerm}
            onSelectCategoria={handleCategoriaSelect}
            onEditCategoria={handleOpenEditCat}
            onDeleteCategoria={handleOpenDeleteCat}
            onAddCategoria={handleOpenAddCat}
            onRefresh={() => refetchCategorias()}
          />
        </div>

        {/* Right Panel (Detail): Servicios List */}
        <div>
          <ServicioList
            selectedCategoriaNombre={selectedCategoria?.nombre}
            servicios={servicios}
            isLoading={isLoadingServicios}
            totalItems={serviciosData?.totalItems ?? 0}
            currentPage={servicioPage}
            pageSize={servicioPageSize}
            searchTerm={servicioSearchTerm}
            onSearchChange={handleServicioSearchChange}
            onPageChange={setServicioPage}
            onPageSizeChange={(size) => {
              setServicioPageSize(size);
              setServicioPage(1);
            }}
            onAddServicio={selectedCategoria ? handleOpenAddSrv : undefined}
            onEdit={handleOpenEditSrv}
            onDelete={handleOpenDeleteSrv}
            onRefresh={selectedCategoria ? () => refetchServicios() : undefined}
          />
        </div>
      </div>

      {/* Category Dialogs */}
      <CategoriaServicioFormDialog
        open={catFormOpen}
        onOpenChange={setCatFormOpen}
        categoriaToEdit={catToEdit}
        onSuccessCallback={() => {
          refetchCategorias();
        }}
      />

      <CategoriaServicioDeleteDialog
        open={catDeleteOpen}
        onOpenChange={setCatDeleteOpen}
        categoriaToDelete={catToDelete}
        onSuccessCallback={() => {
          if (selectedCategoriaId === catToDelete?.id) {
            setSelectedCategoriaId(null);
          }
          refetchCategorias();
        }}
      />

      {/* Service Dialogs */}
      <ServicioFormDialog
        open={srvFormOpen}
        onOpenChange={setSrvFormOpen}
        servicioToEdit={srvToEdit}
        categorias={categorias}
        defaultCategoriaId={selectedCategoria?.id}
        onSuccessCallback={() => refetchServicios()}
      />

      <ServicioDeleteDialog
        open={srvDeleteOpen}
        onOpenChange={setSrvDeleteOpen}
        servicioToDelete={srvToDelete}
        onSuccessCallback={() => refetchServicios()}
      />
    </div>
  );
}
