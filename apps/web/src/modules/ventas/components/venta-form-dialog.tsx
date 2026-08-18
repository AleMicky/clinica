"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Coins,
  CreditCard,
  DollarSign,
  HeartPulse,
  Loader2,
  Plus,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { TipoPagador, type CreateVentaDetalleRequest, type CreateVentaPagadorRequest } from "../types/ventas.types";
import { useCreateVenta } from "../hooks/use-ventas";

import { useAdmisiones } from "@/modules/recepcion/admisiones/hooks/use-admisiones";
import { usePacientes } from "@/modules/recepcion/pacientes/hooks/use-pacientes";
import { useMonedas } from "@/modules/parametros/moneda/hooks/use-monedas";
import { useEmpleados } from "@/modules/recursos-humanos/empleado/hooks/use-empleados";
import { useMedicos } from "@/modules/recursos-humanos/medico/hooks/use-medicos";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import { useServicios } from "@/modules/servicios/servicio/hooks/use-servicio";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio/hooks/use-categoria-servicio";

interface ServiceItemFormState extends CreateVentaDetalleRequest {
  id: string;
}

interface PagadorItemFormState extends CreateVentaPagadorRequest {
  id: string;
}

interface VentaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessCallback?: () => void;
}

export function VentaFormDialog({
  open,
  onOpenChange,
  onSuccessCallback,
}: VentaFormDialogProps) {
  // Direct APIs via React Query
  const { data: admisionesData, isLoading: isLoadingAdmisiones } = useAdmisiones({ pageSize: 100 });
  const { data: pacientesData } = usePacientes({ pageSize: 100 });
  const { data: monedasData, isLoading: isLoadingMonedas } = useMonedas({ pageSize: 100 });
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleados({ pageSize: 100 });
  const { data: medicosData } = useMedicos({ pageSize: 100 });
  const { data: conveniosData } = useConvenios({ pageSize: 100 });
  const { data: categoriasData } = useCategoriasServicio({ pageSize: 100 });

  const firstCatId = categoriasData?.items?.[0]?.id;
  const { data: serviciosData } = useServicios(
    firstCatId ?? 0,
    { pageSize: 100 },
    Boolean(open && firstCatId)
  );

  const createMutation = useCreateVenta();

  // Form State
  const [admisionId, setAdmisionId] = React.useState<string>("");
  const [pacienteId, setPacienteId] = React.useState<string>("");
  const [vendedorId, setVendedorId] = React.useState<string>("");
  const [monedaId, setMonedaId] = React.useState<string>("");
  const [fecha, setFecha] = React.useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  const [detalles, setDetalles] = React.useState<ServiceItemFormState[]>([]);
  const [pagadores, setPagadores] = React.useState<PagadorItemFormState[]>([]);

  // Initialize or reset form state when dialog opens
  React.useEffect(() => {
    if (open) {
      setAdmisionId("");
      setPacienteId("");

      const defaultMoneda = monedasData?.items?.[0];
      setMonedaId(defaultMoneda ? defaultMoneda.id.toString() : "");

      const defaultEmpleado = empleadosData?.items?.[0];
      setVendedorId(defaultEmpleado ? defaultEmpleado.id.toString() : "");

      setFecha(new Date().toISOString().slice(0, 16));

      const firstServ = serviciosData?.items?.[0];
      setDetalles([
        {
          id: Math.random().toString(),
          servicioId: firstServ?.id ?? 1,
          medicoId: undefined,
          cantidad: 1,
          precioUnitario: 100,
          descuento: 0,
        },
      ]);

      setPagadores([
        {
          id: Math.random().toString(),
          tipo: TipoPagador.Paciente,
          convenioId: undefined,
          monto: 100,
        },
      ]);
    }
  }, [open, monedasData, empleadosData, serviciosData]);

  // Handle Admission selection: auto pick patient & prefill services if available
  const handleSelectAdmision = (admIdStr: string | null) => {
    if (!admIdStr) return;
    setAdmisionId(admIdStr);
    const selectedAdm = admisionesData?.items?.find((a) => a.id === Number(admIdStr));
    if (selectedAdm) {
      if (selectedAdm.pacienteId) {
        setPacienteId(selectedAdm.pacienteId.toString());
      }

      if (selectedAdm.detalles && selectedAdm.detalles.length > 0) {
        const loadedDetalles: ServiceItemFormState[] = selectedAdm.detalles.map((d) => ({
          id: Math.random().toString(),
          servicioId: d.servicioId ?? 1,
          medicoId: d.medicoId ?? undefined,
          cantidad: d.cantidad || 1,
          precioUnitario: d.precioUnitario || 0,
          descuento: d.descuento || 0,
          porcentajeMedico: 0,
        }));
        setDetalles(loadedDetalles);

        const sub = loadedDetalles.reduce((acc, x) => acc + x.cantidad * x.precioUnitario - x.descuento, 0);
        setPagadores([
          {
            id: Math.random().toString(),
            tipo: TipoPagador.Paciente,
            convenioId: undefined,
            monto: Math.max(0, sub),
          },
        ]);
      }
    }
  };

  // Handlers for Detalles
  const handleAddDetalle = () => {
    const firstServ = serviciosData?.items?.[0];
    setDetalles((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        servicioId: firstServ?.id ?? 1,
        medicoId: undefined,
        cantidad: 1,
        precioUnitario: 100,
        descuento: 0,
        porcentajeMedico: 0,
      },
    ]);
  };

  const handleRemoveDetalle = (id: string) => {
    if (detalles.length <= 1) {
      toast.warning("La venta debe tener al menos un ítem o servicio.");
      return;
    }
    setDetalles((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDetalle = (
    id: string,
    field: keyof ServiceItemFormState,
    value: unknown
  ) => {
    setDetalles((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // Handlers for Pagadores
  const handleAddPagador = () => {
    setPagadores((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        tipo: TipoPagador.Paciente,
        convenioId: undefined,
        monto: 0,
      },
    ]);
  };

  const handleRemovePagador = (id: string) => {
    if (pagadores.length <= 1) {
      toast.warning("La venta debe tener al menos un pagador asignado.");
      return;
    }
    setPagadores((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePagador = (
    id: string,
    field: keyof PagadorItemFormState,
    value: unknown
  ) => {
    setPagadores((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: value };
        if (field === "tipo" && value === TipoPagador.Paciente) {
          updated.convenioId = undefined;
        }
        return updated;
      })
    );
  };

  // Calculations
  const totalSubtotal = detalles.reduce(
    (acc, d) => acc + Number(d.cantidad || 0) * Number(d.precioUnitario || 0),
    0
  );
  const totalDescuentos = detalles.reduce((acc, d) => acc + Number(d.descuento || 0), 0);
  const grandTotal = Math.max(0, totalSubtotal - totalDescuentos);
  const totalPagado = pagadores.reduce((acc, p) => acc + Number(p.monto || 0), 0);
  const diferenciaMonto = grandTotal - totalPagado;

  // Auto distribute remaining amount to single pagador if user clicks button
  const handleAutoAdjustPagador = () => {
    if (pagadores.length === 1) {
      setPagadores((prev) => [
        {
          ...prev[0],
          monto: grandTotal,
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!admisionId) {
      toast.error("Por favor seleccione una admisión válida.");
      return;
    }

    if (!pacienteId) {
      toast.error("El paciente de la admisión no pudo ser verificado.");
      return;
    }

    if (!vendedorId) {
      toast.error("Por favor seleccione el cajero/vendedor responsable.");
      return;
    }

    if (!monedaId) {
      toast.error("Por favor seleccione el tipo de moneda.");
      return;
    }

    if (detalles.length === 0) {
      toast.error("Debe agregar al menos un servicio a la venta.");
      return;
    }

    if (pagadores.length === 0) {
      toast.error("Debe especificar al menos una distribución de pagador.");
      return;
    }

    const payload = {
      admisionId: Number(admisionId),
      pacienteId: Number(pacienteId),
      vendedorId: Number(vendedorId),
      monedaId: Number(monedaId),
      fecha: new Date(fecha).toISOString(),
      detalles: detalles.map((d) => ({
        servicioId: Number(d.servicioId),
        medicoId: d.medicoId ? Number(d.medicoId) : null,
        cantidad: Number(d.cantidad) || 1,
        precioUnitario: Number(d.precioUnitario) || 0,
        descuento: Number(d.descuento) || 0,
      })),
      pagadores: pagadores.map((p) => ({
        tipo: Number(p.tipo) as TipoPagador,
        convenioId: p.tipo === TipoPagador.Convenio && p.convenioId ? Number(p.convenioId) : null,
        monto: Number(p.monto) || 0,
      })),
    };

    try {
      const res = await createMutation.mutateAsync(payload);
      toast.success(`Venta #${res.numero || res.id} registrada exitosamente.`);
      onOpenChange(false);
      onSuccessCallback?.();
    } catch {
      toast.error("No se pudo registrar la venta en el backend.");
    }
  };

  const admisionesList = admisionesData?.items ?? [];
  const pacientesList = pacientesData?.items ?? [];
  const empleadosList = empleadosData?.items ?? [];
  const monedasList = monedasData?.items ?? [];
  const medicosList = medicosData?.items ?? [];
  const conveniosList = conveniosData?.items ?? [];
  const serviciosList = serviciosData?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[92vh] flex flex-col p-0 border-border/80 shadow-2xl overflow-hidden">
        <DialogHeader className="p-5 border-b border-border/70 bg-gradient-to-r from-muted/50 via-background to-primary/5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Nueva Venta / Comprobante
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Registra ventas y asigna coberturas con integración directa a Recepción.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* SECCIÓN 1: CABECERA DE LA VENTA */}
          <div className="p-4 rounded-xl border border-border/70 bg-card space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="size-3.5 text-primary" />
              1. Admisión, Paciente y Venta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Seleccionar Admisión */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Admisión Relacionada <span className="text-rose-500">*</span>
                </Label>
                <Select value={admisionId} onValueChange={handleSelectAdmision}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder={isLoadingAdmisiones ? "Cargando admisiones..." : "Seleccionar admisión..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {admisionesList.length === 0 ? (
                      <div className="p-2 text-center text-xs text-muted-foreground">
                        No hay admisiones registradas.
                      </div>
                    ) : (
                      admisionesList.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()} className="text-xs">
                          Admisión #{a.numero || a.id} (Pac: #{a.pacienteId})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Paciente (auto-seleccionado o verificado) */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <User className="size-3 text-muted-foreground" />
                  Paciente <span className="text-rose-500">*</span>
                </Label>
                <Select value={pacienteId} onValueChange={(val) => setPacienteId(val || "")}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Seleccionar paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientesList.map((p) => {
                      const nombre = p.persona
                        ? `${p.persona.nombres} ${p.persona.apellidoPaterno}`
                        : `Paciente #${p.id}`;
                      return (
                        <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                          {nombre}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Cajero / Vendedor */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <User className="size-3 text-muted-foreground" />
                  Cajero / Vendedor <span className="text-rose-500">*</span>
                </Label>
                <Select value={vendedorId} onValueChange={(val) => setVendedorId(val || "")}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder={isLoadingEmpleados ? "Cargando..." : "Seleccionar cajero..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {empleadosList.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()} className="text-xs">
                        {emp.persona
                          ? `${emp.persona.nombres} ${emp.persona.apellidoPaterno}`
                          : `Empleado #${emp.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Moneda */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Coins className="size-3 text-muted-foreground" />
                  Moneda <span className="text-rose-500">*</span>
                </Label>
                <Select value={monedaId} onValueChange={(val) => setMonedaId(val || "")}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder={isLoadingMonedas ? "Cargando..." : "Moneda..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {monedasList.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()} className="text-xs">
                        {m.nombre} ({m.simbolo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="space-y-1 sm:col-span-2 lg:col-span-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  Fecha de Comprobante
                </Label>
                <Input
                  type="datetime-local"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-9 text-xs bg-background"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DETALLE DE PRESTACIONES / SERVICIOS */}
          <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary" />
                2. Detalle de Prestaciones Médicas ({detalles.length})
              </h3>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDetalle}
                className="h-8 text-xs font-semibold gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Plus className="size-3.5" />
                Agregar Ítem
              </Button>
            </div>

            {/* TABLA DE DETALLES */}
            <div className="rounded-lg border border-border/70 overflow-hidden bg-background">
              <div className="bg-muted/60 p-2 text-[11px] font-semibold text-muted-foreground grid grid-cols-12 gap-2">
                <span className="col-span-4">Servicio</span>
                <span className="col-span-3">Médico Tratante</span>
                <span className="col-span-1 text-center">Cant.</span>
                <span className="col-span-2 text-right">Precio U.</span>
                <span className="col-span-1 text-right">Desc.</span>
                <span className="col-span-1 text-center">Acción</span>
              </div>

              <div className="divide-y divide-border/60">
                {detalles.map((row) => (
                  <div key={row.id} className="p-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                    {/* Servicio */}
                    <div className="col-span-4">
                      <Select
                        value={row.servicioId.toString()}
                        onValueChange={(val) =>
                          handleUpdateDetalle(row.id, "servicioId", Number(val))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Servicio..." />
                        </SelectTrigger>
                        <SelectContent>
                          {serviciosList.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()} className="text-xs">
                              {s.nombre} ({s.codigo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Médico */}
                    <div className="col-span-3">
                      <Select
                        value={row.medicoId ? row.medicoId.toString() : "sin-medico"}
                        onValueChange={(val) =>
                          handleUpdateDetalle(
                            row.id,
                            "medicoId",
                            val === "sin-medico" || !val ? undefined : Number(val)
                          )
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Sin Asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sin-medico" className="text-xs italic text-muted-foreground">
                            Sin Médico Asignado
                          </SelectItem>
                          {medicosList.map((m) => (
                            <SelectItem key={m.id} value={m.id.toString()} className="text-xs">
                              {m.empleado?.nombreCompleto || `Médico #${m.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="1"
                        value={row.cantidad}
                        onChange={(e) =>
                          handleUpdateDetalle(row.id, "cantidad", Number(e.target.value))
                        }
                        className="h-8 text-xs text-center px-1 bg-background"
                      />
                    </div>

                    {/* Precio Unitario */}
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={row.precioUnitario}
                        onChange={(e) =>
                          handleUpdateDetalle(row.id, "precioUnitario", Number(e.target.value))
                        }
                        className="h-8 text-xs text-right bg-background"
                      />
                    </div>

                    {/* Descuento */}
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={row.descuento}
                        onChange={(e) =>
                          handleUpdateDetalle(row.id, "descuento", Number(e.target.value))
                        }
                        className="h-8 text-xs text-right px-1 bg-background"
                      />
                    </div>

                    {/* Eliminar */}
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDetalle(row.id)}
                        className="size-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DISTRIBUCIÓN DE PAGADORES */}
          <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-primary" />
                3. Distribución de Coberturas y Pagadores ({pagadores.length})
              </h3>

              <div className="flex items-center gap-2">
                {pagadores.length === 1 && Math.abs(diferenciaMonto) > 0.01 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAutoAdjustPagador}
                    className="h-7 text-[11px] font-medium text-primary hover:bg-primary/10"
                  >
                    Igualar al Total ({grandTotal.toFixed(2)})
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPagador}
                  className="h-8 text-xs font-semibold gap-1 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="size-3.5" />
                  Agregar Pagador
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 overflow-hidden bg-background">
              <div className="bg-muted/60 p-2 text-[11px] font-semibold text-muted-foreground grid grid-cols-12 gap-2">
                <span className="col-span-4">Tipo de Pagador</span>
                <span className="col-span-4">Convenio (si aplica)</span>
                <span className="col-span-3 text-right">Monto Cobertura</span>
                <span className="col-span-1 text-center">Acción</span>
              </div>

              <div className="divide-y divide-border/60">
                {pagadores.map((row) => (
                  <div key={row.id} className="p-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                    {/* Tipo */}
                    <div className="col-span-4">
                      <Select
                        value={row.tipo.toString()}
                        onValueChange={(val) =>
                          handleUpdatePagador(row.id, "tipo", Number(val) as TipoPagador)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Tipo Pagador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TipoPagador.Paciente.toString()} className="text-xs">
                            Paciente (Directo)
                          </SelectItem>
                          <SelectItem value={TipoPagador.Convenio.toString()} className="text-xs">
                            Convenio / Aseguradora
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Convenio */}
                    <div className="col-span-4">
                      {row.tipo === TipoPagador.Convenio ? (
                        <Select
                          value={row.convenioId ? row.convenioId.toString() : ""}
                          onValueChange={(val) =>
                            handleUpdatePagador(row.id, "convenioId", Number(val))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs bg-background">
                            <SelectValue placeholder="Seleccionar convenio..." />
                          </SelectTrigger>
                          <SelectContent>
                            {conveniosList.map((c) => (
                              <SelectItem key={c.id} value={c.id.toString()} className="text-xs">
                                {c.nombre} ({c.codigo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground italic px-2">No Aplica</span>
                      )}
                    </div>

                    {/* Monto */}
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={row.monto}
                        onChange={(e) =>
                          handleUpdatePagador(row.id, "monto", Number(e.target.value))
                        }
                        className="h-8 text-xs text-right bg-background"
                      />
                    </div>

                    {/* Eliminar */}
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePagador(row.id)}
                        className="size-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BALANCE COMPARATIVO */}
            <div className="p-3 bg-muted/40 rounded-lg border border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>Total Comprobante: <strong>Bs. {grandTotal.toFixed(2)}</strong></span>
                <span>Asignado Pagadores: <strong className="text-blue-600">Bs. {totalPagado.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Diferencia:</span>
                <span
                  className={`font-extrabold px-2 py-0.5 rounded-md text-xs border ${
                    Math.abs(diferenciaMonto) < 0.01
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  }`}
                >
                  Bs. {diferenciaMonto.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="p-4 border-t border-border/70 bg-muted/30 flex justify-between items-center">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="size-3.5 text-emerald-600" />
            <span>Estado Inicial Venta: <strong className="text-amber-600">Pendiente</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="h-8 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-sm"
            >
              {createMutation.isPending && <Loader2 className="size-3 animate-spin" />}
              Guardar Venta
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
