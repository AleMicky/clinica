"use client";

import * as React from "react";
import { toast } from "sonner";
import { CategoriaServicioHeader } from "./categoria-servicio-header";
import { CategoriaServicioMetricsCards } from "./categoria-servicio-metrics";
import { CategoriaServicioList } from "./categoria-servicio-list";
import { CategoriaServicioFormDialog } from "./categoria-servicio-form-dialog";
import { CategoriaServicioDeleteDialog } from "./categoria-servicio-delete-dialog";
import { useCategoriasServicio } from "../hooks/use-categoria-servicio";
import type {
  CategoriaServicioMetrics,
  CategoriaServicioResponse,
} from "../types/categoria-servicio.types";

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
  const [selectedCategoria, setSelectedCategoria] =
    React.useState<CategoriaServicioResponse | null>(null);

  const {
    data: categoriasData,
    isLoading: isLoadingCategorias,
    refetch: refetchCategorias,
  } = useCategoriasServicio({
    search: categoriaSearchTerm.trim() || undefined,
    pageSize: 100,
  });

  const categorias = React.useMemo(() => {
    return categoriasData?.items ?? [];
  }, [categoriasData]);

  // Auto-select first category when list loads if none selected
  React.useEffect(() => {
    if (categorias.length > 0 && !selectedCategoria) {
      setSelectedCategoria(categorias[0]);
    } else if (selectedCategoria && categorias.length > 0) {
      const updated = categorias.find((c) => c.id === selectedCategoria.id);
      if (updated) setSelectedCategoria(updated);
    }
  }, [categorias, selectedCategoria]);

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
    setSelectedCategoria(cat);
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

  // Calculate Metrics
  const metrics: CategoriaServicioMetrics = React.useMemo(() => {
    const conDesc = categorias.filter((c) => Boolean(c.descripcion?.trim())).length;
    return {
      totalCategorias: categorias.length,
      conServiciosCount: serviciosData?.totalItems ?? servicios.length,
      conDescripcionCount: conDesc,
    };
  }, [categorias, serviciosData, servicios]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <CategoriaServicioHeader />

      <CategoriaServicioMetricsCards
        metrics={metrics}
        selectedCategoriaNombre={selectedCategoria?.nombre}
        totalServiciosEnCategoria={serviciosData?.totalItems ?? 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column (Master): Categorías List */}
        <div className="lg:col-span-4 xl:col-span-3 h-full">
          <CategoriaServicioList
            categorias={categorias}
            selectedCategoriaId={selectedCategoria?.id ?? null}
            isLoading={isLoadingCategorias}
            searchTerm={categoriaSearchTerm}
            onSearchChange={setCategoriaSearchTerm}
            onSelectCategoria={handleCategoriaSelect}
            onEditCategoria={handleOpenEditCat}
            onDeleteCategoria={handleOpenDeleteCat}
            onAddCategoria={handleOpenAddCat}
          />
        </div>

        {/* Right Column (Detail): Servicios List */}
        <div className="lg:col-span-8 xl:col-span-9 h-full">
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
            onAddServicio={handleOpenAddSrv}
            onEdit={handleOpenEditSrv}
            onDelete={handleOpenDeleteSrv}
            onRefresh={() => refetchServicios()}
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
          if (selectedCategoria?.id === catToDelete?.id) {
            setSelectedCategoria(null);
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
