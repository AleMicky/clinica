"use client";

import * as React from "react";
import { ConvenioHeader } from "./convenio-header";
import { ConvenioMetricsCards } from "./convenio-metrics";
import { ConvenioTable } from "./convenio-table";
import { ConvenioFormDialog } from "./convenio-form-dialog";
import { ConvenioTarifariosDialog } from "./convenio-tarifarios-dialog";
import { ConvenioDeleteDialog } from "./convenio-delete-dialog";
import { useConvenios } from "../hooks/use-convenio";
import type { ConvenioItem, ConvenioMetrics, ConvenioResponse } from "../types/convenio.types";

export function ConvenioModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [convenioToEdit, setConvenioToEdit] = React.useState<ConvenioItem | null>(null);

  const [tarifariosDialogOpen, setTarifariosDialogOpen] = React.useState(false);
  const [convenioForTarifarios, setConvenioForTarifarios] = React.useState<ConvenioItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [convenioToDelete, setConvenioToDelete] = React.useState<ConvenioItem | null>(null);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useConvenios({
    page: currentPage,
    pageSize: pageSize,
    search: searchTerm.trim() || undefined,
  });

  const convenios: ConvenioItem[] = React.useMemo(() => {
    return apiData?.items ?? [];
  }, [apiData]);

  const metrics: ConvenioMetrics = React.useMemo(() => {
    const rawItems = apiData?.items ?? [];
    const conDesc = rawItems.filter((c: ConvenioResponse) => Boolean(c.descripcion?.trim())).length;
    const vigentes = rawItems.filter((c: ConvenioResponse) => {
      if (!c.fechaFin) return true;
      return new Date(c.fechaFin) >= new Date();
    }).length;

    return {
      totalConvenios: apiData?.totalItems ?? rawItems.length,
      vigentesCount: vigentes,
      conDescripcionCount: conDesc,
    };
  }, [apiData]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setConvenioToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (c: ConvenioItem) => {
    setConvenioToEdit(c);
    setFormDialogOpen(true);
  };

  const handleOpenManageTarifarios = (c: ConvenioItem) => {
    setConvenioForTarifarios(c);
    setTarifariosDialogOpen(true);
  };

  const handleOpenDelete = (c: ConvenioItem) => {
    setConvenioToDelete(c);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <ConvenioHeader onAddClick={handleOpenAdd} />
      <ConvenioMetricsCards metrics={metrics} />
      <ConvenioTable
        convenios={convenios}
        isLoading={isLoading}
        totalItems={apiData?.totalItems ?? 0}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onManageTarifarios={handleOpenManageTarifarios}
        onDelete={handleOpenDelete}
        onRefresh={() => refetch()}
      />
      <ConvenioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        convenioToEdit={convenioToEdit}
        onSuccessCallback={() => refetch()}
      />
      <ConvenioTarifariosDialog
        open={tarifariosDialogOpen}
        onOpenChange={setTarifariosDialogOpen}
        convenio={convenioForTarifarios}
      />
      <ConvenioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        convenioToDelete={convenioToDelete}
        onSuccessCallback={() => refetch()}
      />
    </div>
  );
}
