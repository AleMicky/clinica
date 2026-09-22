"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { UsuarioHeader } from "./usuario-header";
import { UsuarioMetricsCards } from "./usuario-metrics";
import { UsuarioList } from "./usuario-list";
import { UsuarioDeleteDialog } from "./usuario-delete-dialog";
import { useUsuarios, useDeleteUsuario } from "../hooks/use-usuarios";
import type { UsuarioMetrics, UsuarioResponse } from "../types/usuario.types";

export function UsuarioModuleView() {
  const router = useRouter();

  // Delete AlertDialog confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [usuarioToDelete, setUsuarioToDelete] =
    React.useState<UsuarioResponse | null>(null);

  // Filtros & Paginación
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

  // Debounce para optimizar llamadas a la API
  const debouncedSearch = useDebounce(searchTerm, 300);

  // React Query Hook: Requests real API endpoint `/usuarios`
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useUsuarios({
    page: currentPage,
    pageSize: pageSize,
    search: debouncedSearch.trim() || undefined,
  });

  const deleteMutation = useDeleteUsuario();

  // Handlers con useCallback
  const handleSearchChange = React.useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleStatusTabChange = React.useCallback(
    (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => {
      setSelectedStatusTab(tab);
      setCurrentPage(1);
    },
    []
  );

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const allUsuarios = React.useMemo(
    () => apiData?.items ?? [],
    [apiData?.items]
  );

  // Filter by status tab locally on items
  const filteredUsuarios = React.useMemo(() => {
    if (selectedStatusTab === "ACTIVOS") {
      return allUsuarios.filter((u) => u.activo);
    }
    if (selectedStatusTab === "INACTIVOS") {
      return allUsuarios.filter((u) => !u.activo);
    }
    return allUsuarios;
  }, [allUsuarios, selectedStatusTab]);

  // Compute Metrics from API data
  const metrics: UsuarioMetrics = React.useMemo(() => {
    const total = apiData?.totalItems ?? allUsuarios.length;
    const activas = allUsuarios.filter((u) => u.activo).length;
    const bloqueadas = allUsuarios.filter((u) => !u.activo).length;
    const totalPagina = allUsuarios.length;
    const cobertura =
      totalPagina > 0 ? Math.round((activas / totalPagina) * 100) : 100;

    return {
      totalUsuarios: total,
      cuentasActivas: activas,
      cuentasBloqueadas: bloqueadas,
      coberturaSeguridad: cobertura,
    };
  }, [apiData?.totalItems, allUsuarios]);

  const handleOpenAdd = React.useCallback(() => {
    router.push("/seguridad/usuarios/nuevo");
  }, [router]);

  const handleOpenEdit = React.useCallback(
    (usuario: UsuarioResponse) => {
      router.push(`/seguridad/usuarios/${usuario.id}/editar`);
    },
    [router]
  );

  const handleOpenDelete = React.useCallback(
    (id: number) => {
      const target = allUsuarios.find((u) => u.id === id);
      if (target) {
        setUsuarioToDelete(target);
        setDeleteDialogOpen(true);
      }
    },
    [allUsuarios]
  );

  const handleConfirmDelete = async () => {
    if (!usuarioToDelete) return;

    try {
      await deleteMutation.mutateAsync(usuarioToDelete.id);
      toast.success(
        `Usuario @${usuarioToDelete.userName} eliminado correctamente.`
      );
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const serverMsg = err?.response?.data?.message || err?.message;
      toast.error(serverMsg || "Ocurrió un error al eliminar el usuario.");
    } finally {
      setUsuarioToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const totalItemsCount =
    selectedStatusTab !== "TODOS"
      ? filteredUsuarios.length
      : apiData?.totalItems ?? allUsuarios.length;

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in-50 duration-300">
      {/* Cabecera del Módulo */}
      <UsuarioHeader onAddClick={handleOpenAdd} onRefresh={refetch} />

      {/* Tarjetas de Métricas en Vivo */}
      <UsuarioMetricsCards metrics={metrics} />

      {/* Listado Principal de Usuarios */}
      <UsuarioList
        usuarios={filteredUsuarios}
        isLoading={isLoading}
        totalItems={totalItemsCount}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        selectedStatusTab={selectedStatusTab}
        onStatusTabChange={handleStatusTabChange}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onRefresh={refetch}
      />

      {/* Modal: Confirmación de Eliminación */}
      <UsuarioDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        usuario={usuarioToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
