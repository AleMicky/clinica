"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useArqueosCaja } from "../hooks/use-arqueos-caja";
import { ArqueoCajaHeader } from "./arqueo-caja-header";
import { ArqueoCajaMetrics } from "./arqueo-caja-metrics";
import { ArqueoCajaList } from "./arqueo-caja-list";
import { ArqueoCajaDetailDialog } from "./arqueo-caja-detail-dialog";
import type { ArqueoCajaResponse } from "../types/arqueo-caja.types";

export function ArqueoCajaModuleView() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<
    "TODOS" | "CUADRADOS" | "DIFERENCIA"
  >("TODOS");

  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedArqueo, setSelectedArqueo] =
    React.useState<ArqueoCajaResponse | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useArqueosCaja({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const allArqueos = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as ArqueoCajaResponse[])
    : [];
  const totalItems = apiData?.totalItems ?? allArqueos.length;

  // Filtrado local por pestañas
  const filteredArqueos = React.useMemo(() => {
    if (selectedFilter === "CUADRADOS") {
      return allArqueos.filter((a) => Math.abs(Number(a.diferencia)) < 0.001);
    }
    if (selectedFilter === "DIFERENCIA") {
      return allArqueos.filter((a) => Math.abs(Number(a.diferencia)) >= 0.001);
    }
    return allArqueos;
  }, [allArqueos, selectedFilter]);

  const metrics = React.useMemo(() => {
    let exactos = 0;
    let diferencias = 0;

    allArqueos.forEach((a) => {
      if (Math.abs(Number(a.diferencia)) < 0.001) {
        exactos++;
      } else {
        diferencias++;
      }
    });

    return {
      totalArqueos: totalItems,
      totalConCuadreExacto: exactos,
      totalConDiferencia: diferencias,
    };
  }, [allArqueos, totalItems]);

  const handleOpenCreateModal = () => {
    router.push("/cajas/arqueos/nuevo");
  };

  const handleSelectArqueo = (arq: ArqueoCajaResponse) => {
    setSelectedArqueo(arq);
    setDetailDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      <ArqueoCajaHeader
        onNewArqueoClick={handleOpenCreateModal}
        onRefresh={() => refetch()}
      />

      <ArqueoCajaMetrics
        metrics={metrics}
        selectedFilter={selectedFilter}
        onFilterChange={(f) => {
          setSelectedFilter(f);
          setCurrentPage(1);
        }}
      />

      <ArqueoCajaList
        arqueos={filteredArqueos}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedFilter={selectedFilter}
        onFilterChange={(f) => {
          setSelectedFilter(f);
          setCurrentPage(1);
        }}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSelectArqueo={handleSelectArqueo}
      />

      <ArqueoCajaDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        arqueo={selectedArqueo}
      />
    </div>
  );
}
