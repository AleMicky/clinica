"use client";

import * as React from "react";
import { ConvenioHeader } from "./convenio-header";
import { ConvenioList } from "./convenio-list";
import { ConvenioTarifarioList } from "./convenio-tarifario-list";
import { ConvenioFormDialog } from "./convenio-form-dialog";
import { ConvenioDeleteDialog } from "./convenio-delete-dialog";
import { useConvenios } from "../hooks/use-convenio";
import type { ConvenioItem } from "../types/convenio.types";
import { AuditDialog, type AuditInfo } from "@/components/shared";

export function ConvenioModuleView() {
  // Convenios state & query
  const [convenioSearchTerm, setConvenioSearchTerm] = React.useState("");
  const [selectedConvenioId, setSelectedConvenioId] = React.useState<number | null>(null);

  const {
    data: conveniosData,
    isLoading: isLoadingConvenios,
    refetch: refetchConvenios,
  } = useConvenios({
    search: convenioSearchTerm.trim() || undefined,
    pageSize: 100,
  });

  const convenios = conveniosData?.items ?? [];

  // Derived selected convenio from ID state
  const selectedConvenio =
    convenios.find((c) => c.id === selectedConvenioId) ?? null;

  const handleConvenioSelect = (c: ConvenioItem) => {
    setSelectedConvenioId(c.id);
  };

  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [convenioToEdit, setConvenioToEdit] = React.useState<ConvenioItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [convenioToDelete, setConvenioToDelete] = React.useState<ConvenioItem | null>(null);

  // Audit State
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleViewConvenioAudit = (c: ConvenioItem) => {
    const rawCreated = c.createdAt || (c as any).fechaCreacion || (c as any).created_at;
    const rawUpdated = c.updatedAt || (c as any).fechaModificacion || (c as any).updated_at;
    const createdUser = c.createdBy || (c as any).creadoPor || (c as any).created_by;
    const updatedUser = c.updatedBy || (c as any).modificadoPor || (c as any).updated_by;

    setAuditInfo({
      title: "Auditoría de Convenio",
      entityName: c.nombre,
      entityCode: c.codigo,
      id: c.id,
      createdAt: rawCreated,
      createdBy: createdUser,
      updatedAt: rawUpdated,
      updatedBy: updatedUser,
      extraDetails: [
        { label: "Vigencia Inicio", value: c.fechaInicio },
        { label: "Vigencia Fin", value: c.fechaFin || "Indefinido" },
      ],
    });
    setAuditDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setConvenioToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (c: ConvenioItem) => {
    setConvenioToEdit(c);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (c: ConvenioItem) => {
    setConvenioToDelete(c);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <ConvenioHeader onAddClick={handleOpenAdd} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)] items-start">
        {/* Left Panel (Master): Convenios List */}
        <div>
          <ConvenioList
            convenios={convenios}
            selectedConvenioId={selectedConvenioId}
            isLoading={isLoadingConvenios}
            searchTerm={convenioSearchTerm}
            onSearchChange={setConvenioSearchTerm}
            onSelectConvenio={handleConvenioSelect}
            onEditConvenio={handleOpenEdit}
            onDeleteConvenio={handleOpenDelete}
            onAddConvenio={handleOpenAdd}
            onRefresh={() => refetchConvenios()}
            onViewAudit={handleViewConvenioAudit}
          />
        </div>

        {/* Right Panel (Detail): Tarifarios vinculados del convenio seleccionado */}
        <div>
          <ConvenioTarifarioList
            selectedConvenio={selectedConvenio}
            onRefreshConvenio={() => refetchConvenios()}
            onViewAudit={handleViewConvenioAudit}
          />
        </div>
      </div>

      {/* Dialogs */}
      <ConvenioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        convenioToEdit={convenioToEdit}
        onSuccessCallback={() => refetchConvenios()}
      />

      <ConvenioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        convenioToDelete={convenioToDelete}
        onSuccessCallback={() => {
          if (selectedConvenioId === convenioToDelete?.id) {
            setSelectedConvenioId(null);
          }
          refetchConvenios();
        }}
      />

      {/* Shared Audit Dialog */}
      <AuditDialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
        auditInfo={auditInfo}
      />
    </div>
  );
}
