"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CreditCard,
  Building2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import {
  useCuentasBancarias,
  useDeleteCuentaBancaria,
} from "../hooks/use-bancos";
import { CuentaBancariaFormDialog } from "./cuenta-bancaria-form-dialog";
import type { BancoResponse, CuentaBancariaResponse } from "../types/banco.types";

interface BancoCuentasSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banco: BancoResponse | null;
}

export function BancoCuentasSheet({
  open,
  onOpenChange,
  banco,
}: BancoCuentasSheetProps) {
  const bancoId = banco?.id ?? 0;

  const [searchTerm, setSearchTerm] = React.useState("");
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [cuentaToEdit, setCuentaToEdit] =
    React.useState<CuentaBancariaResponse | null>(null);

  // Fetch accounts from API
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useCuentasBancarias(
    bancoId,
    { page: 1, pageSize: 50, search: searchTerm.trim() || undefined },
    open && bancoId > 0
  );

  // Fetch currencies to map monedaId -> moneda symbol/codigo
  const { data: monedasData } = useMonedas({ page: 1, pageSize: 100 });

  const deleteMutation = useDeleteCuentaBancaria();

  const getMonedaBadge = (monedaId: number) => {
    const moneda = monedasData?.items?.find((m) => m.id === monedaId);
    if (!moneda) return "-";
    return `${moneda.codigo} (${moneda.simbolo})`;
  };

  const handleOpenAdd = () => {
    setCuentaToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (cuenta: CuentaBancariaResponse) => {
    setCuentaToEdit(cuenta);
    setFormDialogOpen(true);
  };

  const handleDelete = async (cuenta: CuentaBancariaResponse) => {
    try {
      await deleteMutation.mutateAsync({ bancoId, cuentaId: cuenta.id });
      toast.success(`Cuenta bancaria ${cuenta.numeroCuenta} desactivada.`);
      refetch();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "No se pudo eliminar la cuenta bancaria."
      );
    }
  };

  if (!banco) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full data-[side=right]:sm:max-w-[750px] lg:data-[side=right]:sm:max-w-[900px] p-6 flex flex-col h-full bg-card overflow-y-auto border-l shadow-2xl gap-6"
      >
        <SheetHeader className="space-y-1 text-left border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard className="h-5 w-5" />
            <SheetTitle className="text-xl font-bold">
              Cuentas Bancarias - {banco.nombre}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Administración de cuentas corrientes, de ahorros e interbancarias para{" "}
            <strong className="font-mono text-foreground">{banco.codigo}</strong>.
          </SheetDescription>
        </SheetHeader>

        {/* Toolbar: Search + Add */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de cuenta, tipo o titular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-card"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-9 w-9 p-0"
              title="Refrescar cuentas"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={handleOpenAdd} size="sm" className="h-9 gap-1.5 text-xs shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Nueva Cuenta</span>
            </Button>
          </div>
        </div>

        {/* Table of Cuentas Bancarias */}
        <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden flex-1">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px]">Número de Cuenta</TableHead>
                <TableHead className="w-[140px]">Moneda</TableHead>
                <TableHead className="w-[140px]">Tipo de Cuenta</TableHead>
                <TableHead>Titular / Nombre de Cuenta</TableHead>
                <TableHead className="w-[90px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-14 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : !apiData?.items || apiData.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Building2 className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">
                        No hay cuentas bancarias registradas para este banco.
                      </p>
                      <p className="text-xs">
                        Haga clic en &quot;Nueva Cuenta&quot; para agregar una cuenta bancaria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                apiData.items.map((cuenta) => (
                  <TableRow key={cuenta.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                      {cuenta.numeroCuenta}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className="font-mono text-[11px] bg-primary/5 text-primary border-primary/20">
                        {getMonedaBadge(cuenta.monedaId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {cuenta.tipoCuenta || "Corriente"}
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium">
                      {cuenta.nombreCuenta || <span className="text-muted-foreground/60 italic">Sin nombre</span>}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          onClick={() => handleOpenEdit(cuenta)}
                          title="Editar cuenta"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(cuenta)}
                          title="Inactivar cuenta"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Form Modal for Cuenta Bancaria */}
        <CuentaBancariaFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          bancoId={bancoId}
          cuentaToEdit={cuentaToEdit}
          onSuccessCallback={() => refetch()}
        />
      </SheetContent>
    </Sheet>
  );
}
