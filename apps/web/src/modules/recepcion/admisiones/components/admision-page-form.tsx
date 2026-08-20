"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { usePacientes, usePacienteConvenios } from "../../pacientes/hooks/use-pacientes";
import { getPacienteFullName } from "../../pacientes/components/paciente-list";
import type { PacienteResponse } from "../../pacientes/types/paciente.types";
import { useMedicos } from "@/modules/recursos-humanos/medico/hooks/use-medicos";
import { useEmpleadosPermitidos } from "@/modules/recursos-humanos/empleado/hooks/use-empleados";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio/hooks/use-categoria-servicio";
import type { ConvenioResponse } from "@/modules/servicios/convenio/types/convenio.types";
import type { EmpleadoBaseInfo } from "@/modules/recursos-humanos/empleado/types/empleado.types";
import { useCreateAdmision } from "../hooks/use-admisiones";
import { useAdmisionStore } from "../store/use-admision-store";
import { MultiServicePickerModal } from "./multi-service-picker-modal";
import { AdmisionPacienteSection } from "./admision-paciente-section";
import { AdmisionCoberturaSection } from "./admision-cobertura-section";
import { AdmisionCarritoSection } from "./admision-carrito-section";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";

export function AdmisionPageForm() {
  const router = useRouter();

  // Zustand Store
  const { detalles, removeDetalle, updateDetalle, clearDetalles } = useAdmisionStore();

  // API Queries & Mutations
  const { data: pacientesData, isLoading: isLoadingPacientes } = usePacientes({
    pageSize: 100,
  });
  const { data: conveniosData } = useConvenios({
    pageSize: 100,
  });
  const { data: medicosData } = useMedicos({
    pageSize: 100,
  });
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleadosPermitidos();
  const { data: categoriasData } = useCategoriasServicio({ pageSize: 100 });

  const categoriasList = categoriasData?.items ?? [];
  const medicosList = medicosData?.items ?? [];
  const conveniosList: ConvenioResponse[] = Array.isArray(conveniosData?.items)
    ? conveniosData.items
    : Array.isArray(conveniosData)
    ? (conveniosData as unknown as ConvenioResponse[])
    : [];
  const empleadosList: EmpleadoBaseInfo[] = Array.isArray(empleadosData)
    ? empleadosData
    : [];

  // Modales
  const [multiPickerOpen, setMultiPickerOpen] = React.useState<boolean>(false);

  // Mutation estándar de Admisión (POST /admisiones)
  const createAdmisionMutation = useCreateAdmision();

  // Estado del Paciente Seleccionado
  const [patientSearch, setPatientSearch] = React.useState("");
  const [selectedPacienteId, setSelectedPacienteId] = React.useState<string>("");

  // Estado del Recepcionista Responsable (inicia vacío o se auto-asigna si solo hay 1 permitido)
  const [recepcionistaId, setRecepcionistaId] = React.useState<string>("");

  React.useEffect(() => {
    if (empleadosList.length === 1 && !recepcionistaId) {
      setRecepcionistaId(String(empleadosList[0].id));
    }
  }, [empleadosList, recepcionistaId]);

  // Consulta de Convenios específicos del Paciente Seleccionado (GET /api/v1/pacientes/{pacienteId}/convenios)
  const numericPacienteId = selectedPacienteId ? Number(selectedPacienteId) : 0;
  const { data: pacienteConveniosData, isLoading: isLoadingPacienteConvenios } = usePacienteConvenios(
    numericPacienteId,
    Boolean(numericPacienteId)
  );
  const pacienteConveniosList = pacienteConveniosData?.items ?? [];

  // Datos Generales de Admisión
  const [convenioId, setConvenioId] = React.useState<string>("particular");
  const [fechaHora, setFechaHora] = React.useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [observacion, setObservacion] = React.useState<string>("");

  // Pre-selección automática del convenio principal del paciente
  React.useEffect(() => {
    if (numericPacienteId && pacienteConveniosList.length > 0) {
      const principal = pacienteConveniosList.find((pc) => pc.esPrincipal && pc.activo) || pacienteConveniosList[0];
      if (principal && principal.convenioId) {
        setConvenioId(principal.convenioId.toString());
        return;
      }
    }
    setConvenioId("particular");
  }, [numericPacienteId, pacienteConveniosList]);

  // Nombre formateado del convenio seleccionado para visualización (sin mostrar el ID)
  const selectedConvenioNombre = React.useMemo(() => {
    if (convenioId === "particular") return "Particular (Sin Convenio)";
    const pc = pacienteConveniosList.find((p) => p.convenioId.toString() === convenioId);
    if (pc?.convenio?.nombre) {
      return `${pc.convenio.nombre}${pc.convenio.codigo ? ` (${pc.convenio.codigo})` : ""}`;
    }
    const c = conveniosList.find((item) => item.id.toString() === convenioId);
    if (c?.nombre) {
      return `${c.nombre}${c.codigo ? ` (${c.codigo})` : ""}`;
    }
    return `Convenio #${convenioId}`;
  }, [convenioId, pacienteConveniosList, conveniosList]);

  // Limpiar el carrito al cargar la página
  React.useEffect(() => {
    clearDetalles();
  }, [clearDetalles]);

  // Filtrado de Pacientes por DNI, Nombre o N° Historia Clínica
  const pacientesList = pacientesData?.items ?? [];
  const filteredPacientes = React.useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return pacientesList;
    return pacientesList.filter((p) => {
      const nom = p.persona ? `${p.persona.nombres} ${p.persona.apellidoPaterno} ${p.persona.apellidoMaterno || ""}`.toLowerCase() : "";
      const doc = p.persona?.numeroDocumento || "";
      const hc = p.numeroHistoriaClinica || "";
      return nom.includes(q) || doc.includes(q) || hc.toLowerCase().includes(q);
    });
  }, [pacientesList, patientSearch]);

  const selectedPaciente = pacientesList.find((p) => p.id.toString() === selectedPacienteId);

  // Paso 3 (Carrito) HABILITADO SOLO SI EXISTE UN PACIENTE SELECCIONADO
  const isPatientValid = Boolean(selectedPacienteId && selectedPaciente);

  // Totales
  const totalSubtotal = detalles.reduce(
    (acc, d) => acc + d.cantidad * d.precioUnitario,
    0
  );
  const totalDescuentos = detalles.reduce((acc, d) => acc + Number(d.descuento || 0), 0);
  const grandTotal = Math.max(0, totalSubtotal - totalDescuentos);

  const isSubmitting = createAdmisionMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPatientValid || !selectedPacienteId) {
      toast.error("Debe buscar y seleccionar un paciente antes de guardar la admisión.");
      return;
    }

    if (!recepcionistaId) {
      toast.error("Debe seleccionar un recepcionista responsable.");
      return;
    }

    if (detalles.length === 0) {
      toast.error("Debe agregar al menos una prestación médica a la admisión.");
      return;
    }

    const detallesFormatted = detalles.map((d) => ({
      servicioId: Number(d.servicioId),
      medicoId: d.medicoId ? Number(d.medicoId) : null,
      cantidad: Number(d.cantidad) || 1,
      precioUnitario: Number(d.precioUnitario) || 0,
      descuento: Number(d.descuento) || 0,
    }));

    const payload = {
      pacienteId: Number(selectedPacienteId),
      recepcionistaId: Number(recepcionistaId),
      convenioId: convenioId === "particular" ? null : Number(convenioId),
      fechaHora: new Date(fechaHora).toISOString(),
      observacion: observacion.trim() || undefined,
      detalles: detallesFormatted,
    };

    try {
      const res = await createAdmisionMutation.mutateAsync(payload);
      toast.success(`¡Admisión #${res.numero || res.id} registrada exitosamente!`);
      clearDetalles();
      router.push("/recepcion/admisiones");
    } catch {
      toast.error("Error al registrar la admisión en el servidor.");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full px-3 sm:px-5 pb-8 animate-in fade-in-50 duration-300">
      {/* MODAL MULTI-SELECCIÓN DE SERVICIOS */}
      <MultiServicePickerModal
        isOpen={multiPickerOpen}
        onClose={() => setMultiPickerOpen(false)}
        categorias={categoriasList}
        convenioId={convenioId}
      />

      {/* CABECERA PRINCIPAL COMPACTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.push("/recepcion/admisiones")}
            className="size-8 rounded-lg border-border/80 hover:bg-muted shrink-0 cursor-pointer"
            title="Volver a admisiones"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                Nueva Admisión Médica
              </h1>
              <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary border-primary/20 font-semibold px-1.5 py-0 h-4.5 shrink-0">
                Paso a Paso
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Búsqueda de paciente, asignación de cobertura, recepcionista y prestaciones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/recepcion/admisiones")}
            disabled={isSubmitting}
            className="h-8 text-xs px-3 cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isPatientValid || detalles.length === 0}
            className="h-8 text-xs font-semibold gap-1.5 px-3.5 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                <span>Guardar Admisión</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CUERPO DEL FORMULARIO: PANELES REDIMENSIONABLES (RESIZABLE) */}
      <form onSubmit={handleSubmit}>
        {/* Vista Desktop con Paneles Redimensionables */}
        <div className="hidden lg:block">
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[580px] w-full rounded-xl gap-2 items-start"
          >
            {/* Panel Izquierdo: Paciente + Cobertura */}
            <ResizablePanel defaultSize={42} minSize={30} maxSize={55}>
              <div className="flex flex-col gap-3 pr-1">
                <AdmisionPacienteSection
                  patientSearch={patientSearch}
                  setPatientSearch={setPatientSearch}
                  setSelectedPacienteId={setSelectedPacienteId}
                  filteredPacientes={filteredPacientes}
                  selectedPaciente={selectedPaciente}
                  isPatientValid={isPatientValid}
                  isLoadingPacientes={isLoadingPacientes}
                  onOpenRegisterModal={(paciente) => {
                    if (paciente) {
                      router.push(`/recepcion/pacientes/${paciente.id}/editar`);
                    } else {
                      router.push("/recepcion/pacientes/nuevo");
                    }
                  }}
                />

                <AdmisionCoberturaSection
                  convenioId={convenioId}
                  setConvenioId={setConvenioId}
                  recepcionistaId={recepcionistaId}
                  setRecepcionistaId={setRecepcionistaId}
                  fechaHora={fechaHora}
                  setFechaHora={setFechaHora}
                  observacion={observacion}
                  setObservacion={setObservacion}
                  pacienteConveniosList={pacienteConveniosList}
                  conveniosList={conveniosList}
                  empleadosList={empleadosList}
                  isLoadingPacienteConvenios={isLoadingPacienteConvenios}
                  isLoadingEmpleados={isLoadingEmpleados}
                  selectedConvenioNombre={selectedConvenioNombre}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="bg-border/60 hover:bg-primary/50 transition-colors mx-1"
            />

            {/* Panel Derecho: Carrito & Prestaciones */}
            <ResizablePanel defaultSize={58} minSize={45}>
              <div className="pl-1">
                <AdmisionCarritoSection
                  isPatientValid={isPatientValid}
                  detalles={detalles}
                  medicosList={medicosList}
                  totalSubtotal={totalSubtotal}
                  totalDescuentos={totalDescuentos}
                  grandTotal={grandTotal}
                  isSubmitting={isSubmitting}
                  onOpenMultiPicker={() => setMultiPickerOpen(true)}
                  removeDetalle={removeDetalle}
                  updateDetalle={updateDetalle}
                  onCancel={() => router.push("/recepcion/admisiones")}
                  onSubmit={handleSubmit}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Vista Móvil / Tablet en Formato Apilado */}
        <div className="grid grid-cols-1 gap-3 lg:hidden items-start">
          <div className="flex flex-col gap-3">
            <AdmisionPacienteSection
              patientSearch={patientSearch}
              setPatientSearch={setPatientSearch}
              setSelectedPacienteId={setSelectedPacienteId}
              filteredPacientes={filteredPacientes}
              selectedPaciente={selectedPaciente}
              isPatientValid={isPatientValid}
              isLoadingPacientes={isLoadingPacientes}
              onOpenRegisterModal={(paciente) => {
                if (paciente) {
                  router.push(`/recepcion/pacientes/${paciente.id}/editar`);
                } else {
                  router.push("/recepcion/pacientes/nuevo");
                }
              }}
            />

            <AdmisionCoberturaSection
              convenioId={convenioId}
              setConvenioId={setConvenioId}
              recepcionistaId={recepcionistaId}
              setRecepcionistaId={setRecepcionistaId}
              fechaHora={fechaHora}
              setFechaHora={setFechaHora}
              observacion={observacion}
              setObservacion={setObservacion}
              pacienteConveniosList={pacienteConveniosList}
              conveniosList={conveniosList}
              empleadosList={empleadosList}
              isLoadingPacienteConvenios={isLoadingPacienteConvenios}
              isLoadingEmpleados={isLoadingEmpleados}
              selectedConvenioNombre={selectedConvenioNombre}
            />
          </div>

          <div>
            <AdmisionCarritoSection
              isPatientValid={isPatientValid}
              detalles={detalles}
              medicosList={medicosList}
              totalSubtotal={totalSubtotal}
              totalDescuentos={totalDescuentos}
              grandTotal={grandTotal}
              isSubmitting={isSubmitting}
              onOpenMultiPicker={() => setMultiPickerOpen(true)}
              removeDetalle={removeDetalle}
              updateDetalle={updateDetalle}
              onCancel={() => router.push("/recepcion/admisiones")}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

