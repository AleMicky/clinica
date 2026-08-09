"use client";

import * as React from "react";
import { TarifarioHeader } from "./tarifario-header";
import { TarifarioList } from "./tarifario-list";
import { TarifarioPreciosPanel } from "./tarifario-precios-panel";
import { TarifarioFormDialog } from "./tarifario-form-dialog";
import { TarifarioDeleteDialog } from "./tarifario-delete-dialog";
import { useTarifarios } from "../hooks/use-tarifario";
import { useMonedas, type MonedaResponse } from "@/modules/parametros/moneda";
import type { TarifarioItem, TarifarioResponse } from "../types/tarifario.types";

export function TarifarioModuleView() {
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [tarifarioToEdit, setTarifarioToEdit] = React.useState<TarifarioItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [tarifarioToDelete, setTarifarioToDelete] = React.useState<TarifarioItem | null>(null);

  const [selectedTarifarioId, setSelectedTarifarioId] = React.useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: monedasData } = useMonedas({ pageSize: 100 });
  const monedasMap = React.useMemo(() => {
    const map = new Map<number, { codigo: string; simbolo: string; nombre: string }>();
    (monedasData?.items || []).forEach((m: MonedaResponse) => {
      map.set(m.id, { codigo: m.codigo, simbolo: m.simbolo, nombre: m.nombre });
    });
    return map;
  }, [monedasData]);

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useTarifarios({
    page: 1,
    pageSize: 100,
    search: searchTerm.trim() || undefined,
  });

  const tarifarios: TarifarioItem[] = React.useMemo(() => {
    if (!apiData?.items) return [];
    return apiData.items.map((item: TarifarioResponse) => {
      const mon = monedasMap.get(item.monedaId);
      return {
        ...item,
        monedaNombre: mon ? `${mon.nombre} (${mon.simbolo})` : `ID ${item.monedaId}`,
        monedaSimbolo: mon?.simbolo || "$",
        monedaCodigo: mon?.codigo || "USD",
      };
    });
  }, [apiData, monedasMap]);

  // Derived selected tarifario item
  const selectedTarifario = React.useMemo(() => {
    if (!tarifarios.length) return null;
    if (!selectedTarifarioId) return tarifarios[0];
    return tarifarios.find((t) => t.id === selectedTarifarioId) ?? tarifarios[0];
  }, [tarifarios, selectedTarifarioId]);

  // Auto-select first item if current selection is invalid
  React.useEffect(() => {
    if (tarifarios.length > 0 && selectedTarifarioId === null) {
      setSelectedTarifarioId(tarifarios[0].id);
    }
  }, [tarifarios, selectedTarifarioId]);

  const handleSelectTarifario = (t: TarifarioItem) => {
    setSelectedTarifarioId(t.id);
  };

  const handleOpenAdd = () => {
    setTarifarioToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (t: TarifarioItem) => {
    setTarifarioToEdit(t);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (t: TarifarioItem) => {
    setTarifarioToDelete(t);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <TarifarioHeader />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)] items-start">
        {/* Left Panel (Master): Tarifarios List */}
        <div>
          <TarifarioList
            tarifarios={tarifarios}
            selectedTarifarioId={selectedTarifario?.id ?? null}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectTarifario={handleSelectTarifario}
            onEditTarifario={handleOpenEdit}
            onDeleteTarifario={handleOpenDelete}
            onAddTarifario={handleOpenAdd}
            onRefresh={() => refetch()}
          />
        </div>

        {/* Right Panel (Detail): Precios del Tarifario */}
        <div>
          <TarifarioPreciosPanel selectedTarifario={selectedTarifario} />
        </div>
      </div>

      {/* Dialogs */}
      <TarifarioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        tarifarioToEdit={tarifarioToEdit}
        onSuccessCallback={() => refetch()}
      />
      <TarifarioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tarifarioToDelete={tarifarioToDelete}
        onSuccessCallback={() => {
          if (selectedTarifarioId === tarifarioToDelete?.id) {
            setSelectedTarifarioId(null);
          }
          refetch();
        }}
      />
    </div>
  );
}
