"use client";

import * as React from "react";
import { DispensacionHeader } from "./dispensacion-header";
import { DispensacionMetrics } from "./dispensacion-metrics";
import { DispensacionList } from "./dispensacion-list";
import { DispensacionFormDialog } from "./dispensacion-form-dialog";
import { DispensacionDetailDialog } from "./dispensacion-detail-dialog";
import { DispensacionCobrarDialog } from "./dispensacion-cobrar-dialog";
import { DispensacionEntregarDialog } from "./dispensacion-entregar-dialog";
import { DispensacionAnularDialog } from "./dispensacion-anular-dialog";
import { AuditDialog, type AuditInfo } from "@/components/shared";
import {
  useDispensaciones,
  useDispensacionMetrics,
} from "../hooks/use-dispensacion";
import { useAlmacenes } from "@/modules/almacenes/almacen/hooks/use-almacen";
import type {
  DispensacionResponse,
  EstadoDispensacion,
} from "../types/dispensacion.types";

export function DispensacionModuleView() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedAlmacenId, setSelectedAlmacenId] = React.useState<number | null>(
    null
  );
  const [selectedEstado, setSelectedEstado] =
    React.useState<EstadoDispensacion | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Aux queries
  const { data: almacenesData } = useAlmacenes({ pageSize: 50 });
  const almacenes = almacenesData?.items ?? [];

  // Main query
  const {
    data: dispensacionesData,
    isLoading,
    refetch,
    isFetching,
  } = useDispensaciones({
    page,
    pageSize,
    search: searchTerm.trim() || undefined,
    almacenId: selectedAlmacenId ?? undefined,
    estado: selectedEstado ?? undefined,
  });

  const dispensaciones = dispensacionesData?.items ?? [];

  // Metrics query
  const { data: metricsData } = useDispensacionMetrics({
    almacenId: selectedAlmacenId ?? undefined,
  });

  // Dialog states
  const [formOpen, setFormOpen] = React.useState(false);

  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedForDetail, setSelectedForDetail] =
    React.useState<DispensacionResponse | null>(null);

  const [cobrarOpen, setCobrarOpen] = React.useState(false);
  const [selectedForCobro, setSelectedForCobro] =
    React.useState<DispensacionResponse | null>(null);

  const [entregarOpen, setEntregarOpen] = React.useState(false);
  const [selectedForEntrega, setSelectedForEntrega] =
    React.useState<DispensacionResponse | null>(null);

  const [anularOpen, setAnularOpen] = React.useState(false);
  const [selectedForAnulacion, setSelectedForAnulacion] =
    React.useState<DispensacionResponse | null>(null);

  const [auditOpen, setAuditOpen] = React.useState(false);
  const [auditInfo, setAuditInfo] = React.useState<AuditInfo | null>(null);

  const handleOpenDetail = (item: DispensacionResponse) => {
    setSelectedForDetail(item);
    setDetailOpen(true);
  };

  const handleOpenCobro = (item: DispensacionResponse) => {
    setSelectedForCobro(item);
    setCobrarOpen(true);
  };

  const handleOpenEntrega = (item: DispensacionResponse) => {
    setSelectedForEntrega(item);
    setEntregarOpen(true);
  };

  const handleOpenAnulacion = (item: DispensacionResponse) => {
    setSelectedForAnulacion(item);
    setAnularOpen(true);
  };

  const handleOpenAudit = (item: DispensacionResponse) => {
    setAuditInfo({
      title: "Auditoría de Dispensación / Venta de Farmacia",
      entityName: `Ticket ${item.numero}`,
      entityCode: item.numero,
      id: item.id,
      createdAt: item.fechaCreacion,
      createdBy: item.creadoPor,
      updatedAt: item.fechaModificacion,
      updatedBy: item.modificadoPor,
      extraDetails: [
        { label: "Almacén", value: item.almacenNombre },
        { label: "Tipo", value: item.tipo },
        { label: "Estado", value: item.estado },
        { label: "Total", value: `$${item.total.toFixed(2)}` },
        { label: "Método de Pago", value: item.metodoPago || "-" },
      ],
    });
    setAuditOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header */}
      <DispensacionHeader
        totalItems={dispensacionesData?.totalItems ?? 0}
        isLoading={isLoading || isFetching}
        onRefresh={() => refetch()}
        onAddDispensacion={() => setFormOpen(true)}
      />

      {/* Metrics Bar */}
      <DispensacionMetrics metrics={metricsData} isLoading={isLoading} />

      {/* List */}
      <DispensacionList
        dispensaciones={dispensaciones}
        almacenes={almacenes}
        isLoading={isLoading}
        totalItems={dispensacionesData?.totalItems ?? 0}
        currentPage={page}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedAlmacenId={selectedAlmacenId}
        selectedEstado={selectedEstado}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        onAlmacenChange={(id) => {
          setSelectedAlmacenId(id);
          setPage(1);
        }}
        onEstadoChange={(estado) => {
          setSelectedEstado(estado);
          setPage(1);
        }}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onViewDetail={handleOpenDetail}
        onCobrar={handleOpenCobro}
        onEntregar={handleOpenEntrega}
        onAnular={handleOpenAnulacion}
        onViewAudit={handleOpenAudit}
        onRefresh={() => refetch()}
      />

      {/* Form Dialog */}
      {formOpen && (
        <DispensacionFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccessCallback={() => refetch()}
        />
      )}

      {/* Detail Dialog */}
      <DispensacionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        dispensacion={selectedForDetail}
        onCobrar={handleOpenCobro}
        onEntregar={handleOpenEntrega}
      />

      {/* Cobrar en Caja Dialog */}
      <DispensacionCobrarDialog
        open={cobrarOpen}
        onOpenChange={setCobrarOpen}
        dispensacion={selectedForCobro}
        onSuccessCallback={() => refetch()}
      />

      {/* Entregar Medicamentos Dialog */}
      <DispensacionEntregarDialog
        open={entregarOpen}
        onOpenChange={setEntregarOpen}
        dispensacion={selectedForEntrega}
        onSuccessCallback={() => refetch()}
      />

      {/* Anular Dialog */}
      <DispensacionAnularDialog
        open={anularOpen}
        onOpenChange={setAnularOpen}
        dispensacion={selectedForAnulacion}
        onSuccessCallback={() => refetch()}
      />

      {/* Shared Audit Dialog */}
      <AuditDialog
        open={auditOpen}
        onOpenChange={setAuditOpen}
        auditInfo={auditInfo}
      />
    </div>
  );
}
