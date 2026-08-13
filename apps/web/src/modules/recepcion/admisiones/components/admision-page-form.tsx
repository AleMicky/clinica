"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { usePacientes, usePacienteConvenios } from "../../pacientes/hooks/use-pacientes";
import { PacienteFormDialog } from "../../pacientes/components/paciente-form-dialog";
import { getPacienteFullName } from "../../pacientes/components/paciente-card";
import type { PacienteResponse } from "../../pacientes/types/paciente.types";
import { useMedicos } from "@/modules/recursos-humanos/medico/hooks/use-medicos";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio/hooks/use-categoria-servicio";
import { useCreateAdmision } from "../hooks/use-admisiones";
import { useAdmisionStore } from "../store/use-admision-store";
import { MultiServicePickerModal } from "./multi-service-picker-modal";
import { AdmisionPacienteSection } from "./admision-paciente-section";
import { AdmisionCoberturaSection } from "./admision-cobertura-section";
import { AdmisionCarritoSection } from "./admision-carrito-section";
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
  const { data: categoriasData } = useCategoriasServicio({ pageSize: 100 });

  const categoriasList = categoriasData?.items ?? [];
  const medicosList = medicosData?.items ?? [];
  const conveniosList = conveniosData?.items ?? [];

  // Modales
  const [multiPickerOpen, setMultiPickerOpen] = React.useState<boolean>(false);
  const [registerPacienteOpen, setRegisterPacienteOpen] = React.useState<boolean>(false);
  const [pacienteToEdit, setPacienteToEdit] = React.useState<PacienteResponse | null>(null);

  // Mutation estándar de Admisión (POST /admisiones)
  const createAdmisionMutation = useCreateAdmision();

  // Estado del Paciente Seleccionado
  const [patientSearch, setPatientSearch] = React.useState("");
  const [selectedPacienteId, setSelectedPacienteId] = React.useState<string>("");

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
      convenioId: convenioId === "particular" ? null : Number(convenioId),
      fechaHora: new Date(fechaHora).toISOString(),
      observacion: observacion.trim() || undefined,
      detalles: detallesFormatted,
    };

    try {
      const res = await createAdmisionMutation.mutateAsync(payload);
      toast.success(`¡Admisión #${res.numero || res.id} registrada exitosamente! (POST /admisiones)`);
      clearDetalles();
      router.push("/recepcion/admisiones");
    } catch {
      toast.error("Error al registrar la admisión en el servidor.");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full px-4 sm:px-6 pb-12 animate-in fade-in-50 duration-300">
      {/* MODAL MULTI-SELECCIÓN DE SERVICIOS */}
      <MultiServicePickerModal
        isOpen={multiPickerOpen}
        onClose={() => setMultiPickerOpen(false)}
        categorias={categoriasList}
      />

      {/* DIÁLOGO OFICIAL COMPLETO DE REGISTRO / EDICIÓN DE PACIENTE */}
      <PacienteFormDialog
        open={registerPacienteOpen}
        onOpenChange={(open) => {
          setRegisterPacienteOpen(open);
          if (!open) setPacienteToEdit(null);
        }}
        pacienteToEdit={pacienteToEdit}
        initialSearchQuery={patientSearch}
        onSuccessCallback={(savedPaciente) => {
          if (savedPaciente) {
            setSelectedPacienteId(savedPaciente.id.toString());
            const nom = getPacienteFullName(savedPaciente);
            setPatientSearch(nom);
            toast.success(`¡Expediente de "${nom}" actualizado y seleccionado en la admisión!`);
          }
        }}
      />

      {/* CABECERA PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-card via-card to-primary/5 p-4 rounded-xl border border-border/70 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/recepcion/admisiones")}
            className="size-9 rounded-lg border-border/80 hover:bg-accent"
            title="Volver a admisiones"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Nueva Admisión de Paciente
              </h1>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 h-5 px-2 font-semibold">
                Expediente Paciente 100% Oficial
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Filiación completa con PacienteFormDialog oficial. Desbloqueo del Paso 3 al seleccionar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/recepcion/admisiones")}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !isPatientValid || detalles.length === 0}
            className="h-9 px-5 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Guardar Admisión
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* COLUMNA IZQUIERDA: PACIENTE Y DATOS DE INGRESO (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            {/* SECCIÓN 1: PACIENTE */}
            <AdmisionPacienteSection
              selectedPaciente={selectedPaciente}
              isPatientValid={isPatientValid}
              patientSearch={patientSearch}
              setPatientSearch={setPatientSearch}
              setSelectedPacienteId={setSelectedPacienteId}
              filteredPacientes={filteredPacientes}
              isLoadingPacientes={isLoadingPacientes}
              onOpenRegisterModal={(pToEdit) => {
                setPacienteToEdit(pToEdit ?? null);
                setRegisterPacienteOpen(true);
              }}
            />

            {/* SECCIÓN 2: INGRESO & COBERTURA */}
            <AdmisionCoberturaSection
              convenioId={convenioId}
              setConvenioId={setConvenioId}
              fechaHora={fechaHora}
              setFechaHora={setFechaHora}
              observacion={observacion}
              setObservacion={setObservacion}
              pacienteConveniosList={pacienteConveniosList}
              conveniosList={conveniosList}
              isLoadingPacienteConvenios={isLoadingPacienteConvenios}
              selectedConvenioNombre={selectedConvenioNombre}
            />
          </div>

          {/* COLUMNA DERECHA: CARRITO DE PRESTACIONES (7 COLS) */}
          <div className="lg:col-span-7">
            {/* SECCIÓN 3: CARRITO */}
            <AdmisionCarritoSection
              isPatientValid={isPatientValid}
              detalles={detalles}
              medicosList={medicosList}
              updateDetalle={updateDetalle}
              removeDetalle={removeDetalle}
              onOpenMultiPicker={() => setMultiPickerOpen(true)}
              totalSubtotal={totalSubtotal}
              totalDescuentos={totalDescuentos}
              grandTotal={grandTotal}
              isSubmitting={isSubmitting}
              onCancel={() => router.push("/recepcion/admisiones")}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
