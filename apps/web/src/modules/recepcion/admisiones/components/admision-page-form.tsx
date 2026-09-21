"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { usePacientes, usePaciente, usePacienteConvenios } from "../../pacientes/hooks/use-pacientes";
import type { PacienteResponse } from "../../pacientes/types/paciente.types";
import { useMedicos } from "@/modules/recursos-humanos/medico/hooks/use-medicos";
import { useEmpleadosPermitidos } from "@/modules/recursos-humanos/empleado/hooks/use-empleados";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio/hooks/use-categoria-servicio";
import type { ConvenioResponse } from "@/modules/servicios/convenio/types/convenio.types";
import type { EmpleadoBaseInfo } from "@/modules/recursos-humanos/empleado/types/empleado.types";
import type { AdmisionResponse, AdmisionDetalleResponse } from "../types/admision.types";
import { useAdmision, useCreateAdmision, useUpdateAdmision } from "../hooks/use-admisiones";
import { useAdmisionStore } from "../store/use-admision-store";
import { useDebounce } from "@/hooks/use-debounce";
import { MultiServicePickerModal } from "./multi-service-picker-modal";
import { PacienteFormDialog } from "../../pacientes/components/paciente-form-dialog";
import { AdmisionPacienteSection } from "./admision-paciente-section";
import { AdmisionCoberturaSection } from "./admision-cobertura-section";
import { AdmisionCarritoSection } from "./admision-carrito-section";
import { toast } from "sonner";

interface AdmisionPageFormProps {
  admisionId?: number;
}

function formatToLocalInputDate(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AdmisionPageForm({ admisionId }: AdmisionPageFormProps) {
  const isEditMode = Boolean(admisionId && admisionId > 0);
  const { data: existingAdmision, isLoading: isLoadingExistingAdmision } = useAdmision(
    admisionId ?? 0,
    isEditMode
  );

  if (isEditMode && isLoadingExistingAdmision) {
    return (
      <div className="flex flex-col items-center justify-center min-h-87.5 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Cargando datos de la admisión...</p>
      </div>
    );
  }

  return (
    <AdmisionFormContent
      key={existingAdmision?.id ?? "create"}
      admisionId={admisionId}
      existingAdmision={existingAdmision}
    />
  );
}

interface AdmisionFormContentProps {
  admisionId?: number;
  existingAdmision?: AdmisionResponse;
}

function AdmisionFormContent({ admisionId, existingAdmision }: AdmisionFormContentProps) {
  const router = useRouter();
  const isEditMode = Boolean(admisionId && admisionId > 0);

  // Zustand Store
  const { detalles, setDetalles, removeDetalle, updateDetalle, clearDetalles } = useAdmisionStore();

  // Cargar detalles de admisión o limpiar al montar/desmontar
  React.useEffect(() => {
    if (existingAdmision?.detalles && existingAdmision.detalles.length > 0) {
      const loadedDetalles = existingAdmision.detalles.map((d: AdmisionDetalleResponse) => ({
        id: String(d.id || crypto.randomUUID()),
        servicioId: d.servicioId || d.servicio?.id || 0,
        servicioCodigo: d.servicio?.codigo || undefined,
        servicioNombre: d.servicioNombre || d.servicio?.nombre || "Servicio",
        medicoId: d.medicoId ?? d.medico?.id ?? undefined,
        cantidad: d.cantidad || 1,
        precioUnitario: d.precioUnitario || 0,
        descuento: d.descuento || 0,
      }));
      setDetalles(loadedDetalles);
    } else {
      clearDetalles();
    }
    return () => {
      clearDetalles();
    };
  }, [existingAdmision, setDetalles, clearDetalles]);

  // Estado del Paciente Seleccionado y Búsqueda
  const [patientSearch, setPatientSearch] = React.useState("");
  const debouncedPatientSearch = useDebounce(patientSearch, 300);

  const initialPacienteId = React.useMemo(() => {
    if (!existingAdmision) return "";
    const pId = existingAdmision.paciente?.id || existingAdmision.pacienteId;
    return pId ? String(pId) : "";
  }, [existingAdmision]);

  const [selectedPacienteId, setSelectedPacienteId] = React.useState<string>(initialPacienteId);

  // API Queries & Mutations
  const { data: pacientesData, isLoading: isLoadingPacientes } = usePacientes({
    search: debouncedPatientSearch.trim() || undefined,
    pageSize: 50,
  });
  const { data: directSelectedPaciente } = usePaciente(
    Number(selectedPacienteId),
    Boolean(selectedPacienteId)
  );

  const { data: conveniosData } = useConvenios({
    pageSize: 100,
  });
  const { data: medicosData } = useMedicos({
    pageSize: 100,
  });
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useEmpleadosPermitidos();
  const { data: categoriasData } = useCategoriasServicio({ pageSize: 100 });

  const categoriasList = React.useMemo(() => categoriasData?.items ?? [], [categoriasData]);
  const medicosList = React.useMemo(() => medicosData?.items ?? [], [medicosData]);
  const conveniosList: ConvenioResponse[] = React.useMemo(() => {
    if (Array.isArray(conveniosData?.items)) return conveniosData.items;
    if (Array.isArray(conveniosData)) return conveniosData as unknown as ConvenioResponse[];
    return [];
  }, [conveniosData]);
  const empleadosList: EmpleadoBaseInfo[] = React.useMemo(() => {
    return Array.isArray(empleadosData) ? empleadosData : [];
  }, [empleadosData]);

  // Modales
  const [multiPickerOpen, setMultiPickerOpen] = React.useState<boolean>(false);
  const [pacienteModalOpen, setPacienteModalOpen] = React.useState<boolean>(false);
  const [pacienteToEdit, setPacienteToEdit] = React.useState<PacienteResponse | null>(null);

  const handleOpenRegisterModal = (paciente?: PacienteResponse | null) => {
    setPacienteToEdit(paciente || null);
    setPacienteModalOpen(true);
  };

  const handlePacienteModalSuccess = (savedPaciente: PacienteResponse) => {
    handleSelectPaciente(String(savedPaciente.id));
    setPatientSearch("");
  };

  // Mutations
  const createAdmisionMutation = useCreateAdmision();
  const updateAdmisionMutation = useUpdateAdmision();

  // Estado del Recepcionista Responsable (Derivado declarativamente)
  const initialRecepcionistaId = React.useMemo(() => {
    if (existingAdmision) {
      const rId = existingAdmision.recepcionista?.id || existingAdmision.recepcionistaId;
      if (rId) return String(rId);
    }
    return "";
  }, [existingAdmision]);

  const [selectedRecepcionistaId, setSelectedRecepcionistaId] = React.useState<string>(initialRecepcionistaId);
  const effectiveRecepcionistaId =
    selectedRecepcionistaId ||
    (!isEditMode && empleadosList.length === 1 ? String(empleadosList[0].id) : "");

  // Consulta de Convenios específicos del Paciente Seleccionado
  const numericPacienteId = selectedPacienteId ? Number(selectedPacienteId) : 0;
  const { data: pacienteConveniosData, isLoading: isLoadingPacienteConvenios } = usePacienteConvenios(
    numericPacienteId,
    Boolean(numericPacienteId)
  );
  const pacienteConveniosList = React.useMemo(
    () => pacienteConveniosData?.items ?? [],
    [pacienteConveniosData]
  );

  // Datos Generales de Admisión (Convenio derivado declarativamente)
  const initialConvenioId = React.useMemo(() => {
    if (existingAdmision) {
      const cId = existingAdmision.convenio?.id || existingAdmision.convenioId;
      return cId ? String(cId) : "particular";
    }
    return null;
  }, [existingAdmision]);

  const [customConvenioId, setCustomConvenioId] = React.useState<string | null>(initialConvenioId);

  const defaultConvenioId = React.useMemo(() => {
    if (!isEditMode && numericPacienteId && pacienteConveniosList.length > 0) {
      const principal = pacienteConveniosList.find((pc) => pc.esPrincipal && pc.activo) || pacienteConveniosList[0];
      if (principal?.convenioId) {
        return principal.convenioId.toString();
      }
    }
    return "particular";
  }, [isEditMode, numericPacienteId, pacienteConveniosList]);

  const effectiveConvenioId = customConvenioId ?? defaultConvenioId;

  const [fechaHora, setFechaHora] = React.useState<string>(() =>
    existingAdmision?.fechaHora
      ? formatToLocalInputDate(existingAdmision.fechaHora)
      : formatToLocalInputDate()
  );
  const [observacion, setObservacion] = React.useState<string>(existingAdmision?.observacion || "");

  const handleSelectPaciente = (id: string) => {
    setSelectedPacienteId(id);
    setCustomConvenioId(null); // Reiniciar al convenio principal del nuevo paciente
  };

  // Filtrado de Pacientes por DNI, Nombre o N° Historia Clínica
  const pacientesList = React.useMemo(() => pacientesData?.items ?? [], [pacientesData]);
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
    if (directSelectedPaciente && String(directSelectedPaciente.id) === selectedPacienteId) {
      return directSelectedPaciente;
    }
    return undefined;
  }, [pacientesList, selectedPacienteId, existingAdmision, directSelectedPaciente]);

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

    if (!effectiveRecepcionistaId) {
      toast.error("Debe seleccionar un recepcionista responsable.");
      return;
    }

    if (detalles.length === 0) {
      toast.error("Debe agregar al menos una prestación médica a la admisión.");
      return;
    }

    const invalidDetalle = detalles.find((d) => Number(d.cantidad) <= 0 || Number(d.precioUnitario) < 0);
    if (invalidDetalle) {
      toast.error(`El servicio "${invalidDetalle.servicioNombre}" tiene una cantidad o precio inválido.`);
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
      recepcionistaId: Number(effectiveRecepcionistaId),
      convenioId: effectiveConvenioId === "particular" ? null : Number(effectiveConvenioId),
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
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (err instanceof Error ? err.message : "Error al procesar la admisión en el servidor.");
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full px-3 sm:px-5 pb-8 animate-in fade-in-50 duration-300">
      {/* MODAL MULTI-SELECCIÓN DE SERVICIOS */}
      <MultiServicePickerModal
        isOpen={multiPickerOpen}
        onClose={() => setMultiPickerOpen(false)}
        categorias={categoriasList}
        convenioId={effectiveConvenioId}
      />

      {/* MODAL DE REGISTRO / EDICIÓN DE PACIENTE */}
      <PacienteFormDialog
        open={pacienteModalOpen}
        onOpenChange={setPacienteModalOpen}
        paciente={pacienteToEdit}
        initialSearch={patientSearch}
        onSuccess={handlePacienteModalSuccess}
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
            form="admision-form"
            type="submit"
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
      <form id="admision-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Panel Izquierdo: Paso 1 (Paciente) + Paso 2 (Cobertura y Recepción) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-3.5">
            <AdmisionPacienteSection
              patientSearch={patientSearch}
              setPatientSearch={setPatientSearch}
              setSelectedPacienteId={handleSelectPaciente}
              filteredPacientes={filteredPacientes}
              selectedPaciente={selectedPaciente}
              isPatientValid={isPatientValid}
              isLoadingPacientes={isLoadingPacientes}
              onOpenRegisterModal={handleOpenRegisterModal}
            />

            <AdmisionCoberturaSection
              convenioId={effectiveConvenioId}
              setConvenioId={setCustomConvenioId}
              recepcionistaId={effectiveRecepcionistaId}
              setRecepcionistaId={setSelectedRecepcionistaId}
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


