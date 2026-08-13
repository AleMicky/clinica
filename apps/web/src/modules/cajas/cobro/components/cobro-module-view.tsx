"use client";

import * as React from "react";
import { useCobros } from "../hooks/use-cobros";
import { CobroHeader } from "./cobro-header";
import { CobroMetrics } from "./cobro-metrics";
import { CobroTable } from "./cobro-table";
import { CobroAnularDialog } from "./cobro-anular-dialog";
import { EstadoCobro, type CobroResponse } from "../types/cobro.types";

export function CobroModuleView() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [anularDialogOpen, setAnularDialogOpen] = React.useState(false);
  const [cobroToAnular, setCobroToAnular] = React.useState<CobroResponse | null>(null);

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
  } = useCobros({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const cobros = Array.isArray(apiData?.items)
    ? apiData.items
    : Array.isArray(apiData)
    ? (apiData as unknown as CobroResponse[])
    : [];
  const totalItems = apiData?.totalItems ?? cobros.length;

  const metrics = React.useMemo(() => {
    let montoTotal = 0;
    let anuladosCount = 0;

    cobros.forEach((c) => {
      if (c.estado === EstadoCobro.Anulado) {
        anuladosCount++;
      } else {
        montoTotal += Number(c.total);
      }
    });

    return {
      totalCobros: totalItems,
      totalMontoCobrado: montoTotal,
      totalAnulados: anuladosCount,
    };
  }, [cobros, totalItems]);

  const handlePromptAnular = (cobro: CobroResponse) => {
    setCobroToAnular(cobro);
    setAnularDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <CobroHeader />

      <CobroMetrics metrics={metrics} isLoading={isLoading} />

      <CobroTable
        cobros={cobros}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onAnular={handlePromptAnular}
        onRefresh={() => refetch()}
      />

      <CobroAnularDialog
        open={anularDialogOpen}
        onOpenChange={setAnularDialogOpen}
        cobro={cobroToAnular}
        onSuccessCallback={() => refetch()}
      />
    </div>
  );
}
