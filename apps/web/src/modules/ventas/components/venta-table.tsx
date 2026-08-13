"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTablePagination,
  SearchInput,
} from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  MoreHorizontal,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { EstadoVenta, type VentaResponse } from "../types/ventas.types";
import { VentaStatusBadge } from "./venta-status-badge";

import { usePacientes } from "@/modules/recepcion/pacientes/hooks/use-pacientes";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";

interface VentaTableProps {
  ventas: VentaResponse[];
  isLoading?: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab: EstadoVenta | "TODOS";
  onEstadoTabChange: (tab: EstadoVenta | "TODOS") => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (venta: VentaResponse) => void;
  onChangeStatus: (venta: VentaResponse) => void;
  onAnular: (id: number) => void;
  onRefresh: () => void;
}

export function VentaTable({
  ventas,
  isLoading = false,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab,
  onEstadoTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  onChangeStatus,
  onAnular,
  onRefresh,
}: VentaTableProps) {
  // Auxiliary queries to render names in rows
  const { data: pacientesData } = usePacientes({ pageSize: 100 });
  const { data: monedasData } = useMonedas({ pageSize: 100 });

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="space-y-3.5 w-full">
      {/* TABS DE ESTADO Y FILTRO DE BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-xs">
        <Tabs
          value={selectedEstadoTab.toString()}
          onValueChange={(val) =>
            onEstadoTabChange(val === "TODOS" ? "TODOS" : (Number(val) as EstadoVenta))
          }
          className="w-full sm:w-auto"
        >
          <TabsList className="h-9 bg-muted/60 p-1 flex-wrap">
            <TabsTrigger value="TODOS" className="text-xs font-semibold px-3">
              Todos
            </TabsTrigger>
            <TabsTrigger
              value={EstadoVenta.Pendiente.toString()}
              className="text-xs font-semibold px-3 text-amber-700 dark:text-amber-400"
            >
              Pendientes
            </TabsTrigger>
            <TabsTrigger
              value={EstadoVenta.ParcialmentePagada.toString()}
              className="text-xs font-semibold px-3 text-blue-700 dark:text-blue-400"
            >
              Parciales
            </TabsTrigger>
            <TabsTrigger
              value={EstadoVenta.Pagada.toString()}
              className="text-xs font-semibold px-3 text-emerald-700 dark:text-emerald-400"
            >
              Pagadas
            </TabsTrigger>
            <TabsTrigger
              value={EstadoVenta.Anulada.toString()}
              className="text-xs font-semibold px-3 text-rose-700 dark:text-rose-400"
            >
              Anuladas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por N° comprobante..."
          />
        </div>
      </div>

      {/* TABLA PRINCIPAL DE VENTAS */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[130px] text-xs font-bold">N° Venta</TableHead>
              <TableHead className="w-[140px] text-xs font-bold">Fecha / Hora</TableHead>
              <TableHead className="text-xs font-bold">Paciente</TableHead>
              <TableHead className="w-[100px] text-xs font-bold text-center">Admisión</TableHead>
              <TableHead className="w-[100px] text-xs font-bold text-center">Moneda</TableHead>
              <TableHead className="w-[110px] text-xs font-bold text-right">Subtotal</TableHead>
              <TableHead className="w-[100px] text-xs font-bold text-right">Descuento</TableHead>
              <TableHead className="w-[120px] text-xs font-bold text-right">Total</TableHead>
              <TableHead className="w-[140px] text-xs font-bold text-center">Estado</TableHead>
              <TableHead className="w-[70px] text-xs font-bold text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-14 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-6 mx-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : ventas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                  No se encontraron comprobantes de venta registrados.
                </TableCell>
              </TableRow>
            ) : (
              ventas.map((venta) => {
                const pacienteObj = pacientesData?.items?.find((p) => p.id === venta.pacienteId);
                const pacienteNombre = pacienteObj?.persona
                  ? `${pacienteObj.persona.nombres} ${pacienteObj.persona.apellidoPaterno}`
                  : `Paciente #${venta.pacienteId}`;

                const monedaObj = monedasData?.items?.find((m) => m.id === venta.monedaId);
                const monedaSimbolo = monedaObj?.simbolo || "S/.";

                return (
                  <TableRow key={venta.id} className="hover:bg-muted/30 transition-colors text-xs">
                    <TableCell className="font-bold text-primary">
                      {venta.numero}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(venta.fecha).toLocaleDateString()}{" "}
                      <span className="text-[10px]">
                        {new Date(venta.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </TableCell>

                    <TableCell className="font-medium text-foreground">
                      {pacienteNombre}
                    </TableCell>

                    <TableCell className="text-center font-mono text-xs">
                      #{venta.admisionId}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-semibold text-muted-foreground">
                        {monedaSimbolo}
                      </span>
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground">
                      {monedaSimbolo} {venta.subtotal.toFixed(2)}
                    </TableCell>

                    <TableCell className="text-right text-emerald-600 font-medium">
                      {venta.descuento > 0 ? `-${monedaSimbolo} ${venta.descuento.toFixed(2)}` : "-"}
                    </TableCell>

                    <TableCell className="text-right font-bold text-foreground">
                      {monedaSimbolo} {venta.total.toFixed(2)}
                    </TableCell>

                    <TableCell className="text-center">
                      <VentaStatusBadge estado={venta.estado} />
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors inline-flex items-center justify-center size-7">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Acciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                            Acciones
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onViewDetail(venta)}
                            className="gap-2 cursor-pointer"
                          >
                            <Eye className="size-3.5 text-primary" />
                            Ver Ficha Detalle
                          </DropdownMenuItem>

                          {venta.estado !== EstadoVenta.Anulada && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onChangeStatus(venta)}
                                className="gap-2 cursor-pointer"
                              >
                                <RefreshCw className="size-3.5 text-blue-600" />
                                Cambiar Estado
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onAnular(venta.id)}
                                className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                              >
                                <XCircle className="size-3.5" />
                                Anular Comprobante
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* PAGINACIÓN */}
        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
}
