"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { usePacientes, usePacienteConvenios } from "../../pacientes/hooks/use-pacientes";
import type { PacienteResponse } from "../../pacientes/types/paciente.types";
import { useMedicos } from "@/modules/recursos-humanos/medico/hooks/use-medicos";
import { useEmpleadosPermitidos } from "@/modules/recursos-humanos/empleado/hooks/use-empleados";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio/hooks/use-categoria-servicio";
import type { ConvenioResponse } from "@/modules/servicios/convenio/types/convenio.types";
import type { EmpleadoBaseInfo } from "@/modules/recursos-humanos/empleado/types/empleado.types";
import { useAdmision, useCreateAdmision, useUpdateAdmision } from "../hooks/use-admisiones";
import { useAdmisionStore } from "../store/use-admision-store";
import { MultiServicePickerModal } from "./multi-service-picker-modal";
import { AdmisionPacienteSection } from "./admision-paciente-section";
import { AdmisionCoberturaSection } from "./admision-cobertura-section";
import { AdmisionCarritoSection } from "./admision-carrito-section";
import { toast } from "sonner";

interface AdmisionPageFormProps {
  admisionId?: number;
}

export function AdmisionPageForm({ admisionId }: AdmisionPageFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(admisionId && admisionId > 0);

  // Zustand Store
  const { detalles, setDetalles, removeDetalle, updateDetalle, clearDetalles } = useAdmisionStore();

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

  // Si estamos en modo edición, consultar la admisión actual
  const { data: existingAdmision, isLoading: isLoadingExistingAdmision } = useAdmision(
    admisionId ?? 0,
    isEditMode
  );

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

  // Mutations
  const createAdmisionMutation = useCreateAdmision();
  const updateAdmisionMutation = useUpdateAdmision();

  // Estado del Paciente Seleccionado
  const [patientSearch, setPatientSearch] = React.useState("");
  const [selectedPacienteId, setSelectedPacienteId] = React.useState<string>("");

  // Estado del Recepcionista Responsable (inicia vacío o se auto-asigna si solo hay 1 permitido)
  const [recepcionistaId, setRecepcionistaId] = React.useState<string>("");

  React.useEffect(() => {
    if (!isEditMode && empleadosList.length === 1 && !recepcionistaId) {
      setRecepcionistaId(String(empleadosList[0].id));
    }
  }, [empleadosList, recepcionistaId, isEditMode]);

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
  const [hasInitializedEdit, setHasInitializedEdit] = React.useState(false);

  // Pre-selección automática del convenio principal del paciente (solo en modo creación)
  React.useEffect(() => {
    if (!isEditMode && numericPacienteId && pacienteConveniosList.length > 0) {
      const principal = pacienteConveniosList.find((pc) => pc.esPrincipal && pc.activo) || pacienteConveniosList[0];
      if (principal && principal.convenioId) {
        setConvenioId(principal.convenioId.toString());
        return;
      }
    }
    if (!isEditMode && !numericPacienteId) {
      setConvenioId("particular");
    }
  }, [numericPacienteId, pacienteConveniosList, isEditMode]);

  // Limpiar el carrito al cargar la página si es modo creación
  React.useEffect(() => {
    if (!isEditMode) {
      clearDetalles();
    }
  }, [clearDetalles, isEditMode]);

  // Cargar datos de la admisión existente si estamos en modo edición
  React.useEffect(() => {
    if (isEditMode && existingAdmision && !hasInitializedEdit) {
      const pId = existingAdmision.paciente?.id || existingAdmision.pacienteId;
      if (pId) {
        setSelectedPacienteId(String(pId));
      }

      const rId = existingAdmision.recepcionista?.id || existingAdmision.recepcionistaId;
      if (rId) {
        setRecepcionistaId(String(rId));
      }

      const cId = existingAdmision.convenio?.id || existingAdmision.convenioId;
      setConvenioId(cId ? String(cId) : "particular");

      if (existingAdmision.fechaHora) {
        setFechaHora(
          new Date(existingAdmision.fechaHora).toISOString().slice(0, 16)
        );
      }
      setObservacion(existingAdmision.observacion || "");

      // Mapear los detalles existentes al store del carrito
      if (existingAdmision.detalles && existingAdmision.detalles.length > 0) {
        const loadedDetalles = existingAdmision.detalles.map((d) => ({
          id: String(d.id || Math.random()),
          servicioId: d.servicioId || d.servicio?.id || 0,
          servicioCodigo: d.servicio?.codigo || undefined,
          servicioNombre: d.servicioNombre || d.servicio?.nombre || "Servicio",
          medicoId: d.medicoId ?? d.medico?.id ?? undefined,
          cantidad: d.cantidad || 1,
          precioUnitario: d.precioUnitario || 0,
          descuento: d.descuento || 0,
        }));
        setDetalles(loadedDetalles);
      }

      setHasInitializedEdit(true);
    }
  }, [isEditMode, existingAdmision, hasInitializedEdit, setDetalles]);

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

  const selectedPaciente = React.useMemo(() => {
    if (!selectedPacienteId) return undefined;
    const foundInList = pacientesList.find((p) => p.id.toString() === selectedPacienteId);
    if (foundInList) return foundInList;
    if (existingAdmision?.paciente && String(existingAdmision.paciente.id) === selectedPacienteId) {
      return existingAdmision.paciente as unknown as PacienteResponse;
    }
    return undefined;
  }, [pacientesList, selectedPacienteId, existingAdmision?.paciente]);

  // Carrito habilitado si existe paciente o está en modo edición
  const isPatientValid = Boolean(selectedPacienteId && (selectedPaciente || isEditMode));

  // Totales
  const totalSubtotal = detalles.reduce(
    (acc, d) => acc + d.cantidad * d.precioUnitario,
    0
  );
  const totalDescuentos = detalles.reduce((acc, d) => acc + Number(d.descuento || 0), 0);
  const grandTotal = Math.max(0, totalSubtotal - totalDescuentos);

  const isSubmitting = createAdmisionMutation.isPending || updateAdmisionMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPatientValid || !selectedPacienteId) {
      toast.error("Debe seleccionar un paciente antes de guardar la admisión.");
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
      if (isEditMode && admisionId) {
        await updateAdmisionMutation.mutateAsync({ id: admisionId, data: payload });
        toast.success(`¡Admisión #${existingAdmision?.numero || admisionId} actualizada exitosamente!`);
      } else {
        const res = await createAdmisionMutation.mutateAsync(payload);
        toast.success(`¡Admisión #${res.numero || res.id} registrada exitosamente!`);
      }
      clearDetalles();
      router.push("/recepcion/admisiones");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Error al procesar la admisión en el servidor.";
      toast.error(msg);
    }
  };

  if (isEditMode && isLoadingExistingAdmision) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Cargando datos de la admisión...</p>
      </div>
    );
  }

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
                {isEditMode
                  ? `Editar Admisión #${existingAdmision?.numero || admisionId}`
                  : "Nueva Admisión Médica"}
              </h1>
              <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary border-primary/20 font-semibold px-1.5 py-0 h-4.5 shrink-0">
                {isEditMode ? "Modo Edición" : "Paso a Paso"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {isEditMode
                ? "Modifique prestaciones, coberturas, agregue servicios o actualice el profesional asignado."
                : "Búsqueda de paciente, asignación de cobertura, recepcionista y prestaciones."}
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
                <span>{isEditMode ? "Actualizar Admisión" : "Guardar Admisión"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CUERPO DEL FORMULARIO: DISEÑO RESPONSIVO UNIFICADO */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Panel Izquierdo: Paso 1 (Paciente) + Paso 2 (Cobertura y Recepción) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-3.5">
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
            />
          </div>

          {/* Panel Derecho: Paso 3 (Prestaciones, Carrito y Totales) */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-3.5">
            <AdmisionCarritoSection
              isPatientValid={isPatientValid}
              detalles={detalles}
              medicosList={medicosList}
              totalSubtotal={totalSubtotal}
              totalDescuentos={totalDescuentos}
              grandTotal={grandTotal}
              onOpenMultiPicker={() => setMultiPickerOpen(true)}
              removeDetalle={removeDetalle}
              updateDetalle={updateDetalle}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

