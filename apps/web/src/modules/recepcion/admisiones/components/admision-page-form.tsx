"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  User,
  UserPlus,
  Building2,
  Stethoscope,
  Sparkles,
  Loader2,
  CheckCircle2,
  Search,
  AlertCircle,
  Check,
  FolderTree,
  Receipt,
  ShoppingCart,
  ChevronRight,
  Lock,
  Edit,
} from "lucide-react";
import { usePacientes, usePacienteConvenios } from "../../pacientes/hooks/use-pacientes";
import { PacienteFormDialog } from "../../pacientes/components/paciente-form-dialog";
import { getPacienteFullName, getPacienteDocument } from "../../pacientes/components/paciente-card";
import type { PacienteResponse } from "../../pacientes/types/paciente.types";
import { useMedicos } from "@/modules/recursos-humanos/medico/hooks/use-medicos";
import { useConvenios } from "@/modules/servicios/convenio/hooks/use-convenio";
import { useCategoriasServicio } from "@/modules/servicios/categoria-servicio/hooks/use-categoria-servicio";
import { useServicios } from "@/modules/servicios/servicio/hooks/use-servicio";
import { useCreateAdmision } from "../hooks/use-admisiones";
import {
  useAdmisionStore,
  type ServiceItemState,
  type SelectedServiceCartItem,
} from "../store/use-admision-store";
import type { CategoriaServicioResponse } from "@/modules/servicios/categoria-servicio/types/categoria-servicio.types";
import type { MedicoResponse } from "@/modules/recursos-humanos/medico/types/medico.types";
import type { ServicioResponse } from "@/modules/servicios/servicio/types/servicio.types";
import { toast } from "sonner";

// MODAL PICKER MULTI-SELECCIÓN DE PRESTACIONES
function MultiServicePickerModal({
  isOpen,
  onClose,
  categorias,
}: {
  isOpen: boolean;
  onClose: () => void;
  categorias: CategoriaServicioResponse[];
}) {
  const [activeCatId, setActiveCatId] = React.useState<number>(categorias[0]?.id ?? 1);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const { addServicesFromPicker, isServiceInCart } = useAdmisionStore();

  const [selectedMap, setSelectedMap] = React.useState<Map<number, SelectedServiceCartItem>>(
    new Map()
  );

  React.useEffect(() => {
    if (isOpen) {
      setSelectedMap(new Map());
      setSearchQuery("");
    }
  }, [isOpen]);

  const { data: serviciosData, isLoading } = useServicios(activeCatId, undefined, Boolean(activeCatId));
  const serviciosList = serviciosData?.items ?? [];

  const activeCategory = categorias.find((c) => c.id === activeCatId) || categorias[0];

  const filteredServicios = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return serviciosList;
    return serviciosList.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(q))
    );
  }, [serviciosList, searchQuery]);

  const handleToggleSelect = (s: ServicioResponse) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(s.id)) {
        next.delete(s.id);
      } else {
        next.set(s.id, {
          servicio: s,
          catId: activeCatId,
          catNombre: activeCategory?.nombre || "Catálogo",
          cantidad: 1,
        });
      }
      return next;
    });
  };

  const handleUpdateQuantity = (sId: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const item = next.get(sId);
      if (item) {
        const newQty = item.cantidad + delta;
        if (newQty <= 0) {
          next.delete(sId);
        } else {
          next.set(sId, { ...item, cantidad: newQty });
        }
      }
      return next;
    });
  };

  const selectedItemsArray = Array.from(selectedMap.values());
  const totalSelectedCount = selectedItemsArray.reduce((acc, item) => acc + item.cantidad, 0);
  const totalSelectedPrice = selectedItemsArray.reduce((acc, item) => {
    const price = (item.servicio as unknown as { precioBase?: number }).precioBase || 120;
    return acc + price * item.cantidad;
  }, 0);

  const handleConfirm = () => {
    if (selectedItemsArray.length === 0) {
      toast.warning("Seleccione al menos una prestación médica para agregar.");
      return;
    }
    addServicesFromPicker(selectedItemsArray);
    toast.success(`¡${selectedItemsArray.length} prestación(es) añadida(s) al carrito de la admisión!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-5xl md:max-w-6xl w-[94vw] h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border/80 shadow-2xl">
        <DialogHeader className="shrink-0 p-4 bg-muted/40 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
          <div>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <ShoppingCart className="size-5 text-primary" />
              Catálogo Clínico - Multi-Selección de Prestaciones
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Seleccione varias prestaciones. Los servicios ya añadidos se detectan automáticamente para evitar duplicados.
            </DialogDescription>
          </div>

          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar servicio por nombre..."
              className="h-9.5 text-xs pl-9 pr-3 bg-background shadow-2xs font-medium [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          <div className="md:col-span-4 lg:col-span-3 border-r border-border/60 bg-muted/20 p-3.5 space-y-2 overflow-y-auto h-full min-h-0">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1 block">
              Catálogos Disponibles ({categorias.length})
            </Label>

            {categorias.map((cat) => {
              const isActive = cat.id === activeCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCatId(cat.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between text-xs font-semibold ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "bg-background hover:bg-muted text-foreground border border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderTree className={`size-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                    <span className="leading-snug">{cat.nombre}</span>
                  </div>
                  <ChevronRight className={`size-4 shrink-0 ${isActive ? "opacity-100" : "opacity-40"}`} />
                </button>
              );
            })}
          </div>

          <div className="md:col-span-8 lg:col-span-9 p-5 space-y-4 overflow-y-auto h-full min-h-0 bg-background">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                Catálogo: <strong className="text-primary text-sm">{activeCategory?.nombre || "General"}</strong>
              </span>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 px-3 py-0.5 font-bold">
                {filteredServicios.length} Servicios
              </Badge>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-muted-foreground space-y-3">
                <Loader2 className="size-8 animate-spin mx-auto text-primary" />
                <p className="font-medium">Cargando prestaciones desde el servidor...</p>
              </div>
            ) : filteredServicios.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                No se encontraron prestaciones en esta categoría.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-4">
                {filteredServicios.map((s) => {
                  const isSelectedInModal = selectedMap.has(s.id);
                  const isAlreadyInCart = isServiceInCart(s.id);
                  const selectedData = selectedMap.get(s.id);
                  const price = (s as unknown as { precioBase?: number }).precioBase || 120;

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSelect(s)}
                      className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer space-y-3 shadow-2xs ${
                        isSelectedInModal
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md"
                          : isAlreadyInCart
                          ? "border-emerald-500/50 bg-emerald-500/10 shadow-xs"
                          : "border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-bold text-xs text-foreground leading-snug">
                            {s.nombre}
                          </p>
                          {isSelectedInModal ? (
                            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] shrink-0 font-bold px-1.5 py-0">
                              <Check className="size-3 mr-0.5" /> ELEGIDO
                            </Badge>
                          ) : isAlreadyInCart ? (
                            <Badge className="bg-emerald-600 text-white border-0 text-[10px] shrink-0 font-bold px-1.5 py-0">
                              ✓ En Carrito
                            </Badge>
                          ) : null}
                        </div>

                        {s.descripcion && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                            {s.descripcion}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-border/40 w-full">
                        <span className="text-xs font-extrabold text-primary">
                          S/. {price.toFixed(2)}
                        </span>

                        {isSelectedInModal ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 bg-background border border-primary/40 rounded-lg p-0.5"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleUpdateQuantity(s.id, -1, e)}
                              className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-foreground font-bold"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="text-xs font-extrabold text-primary px-1.5">
                              {selectedData?.cantidad || 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleUpdateQuantity(s.id, 1, e)}
                              className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-foreground font-bold"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        ) : isAlreadyInCart ? (
                          <span className="text-[10px] font-bold text-emerald-700">
                            + Sumar Fila
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            + Marcar
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-4 bg-muted/40 border-t border-border/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-muted-foreground">
              Prestaciones Elegidas: <strong className="text-foreground text-sm font-bold">{totalSelectedCount}</strong>
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="font-semibold text-muted-foreground">
              Subtotal: <strong className="text-primary text-base font-extrabold">S/. {totalSelectedPrice.toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={selectedItemsArray.length === 0}
              className="h-9 px-5 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-md shadow-primary/20"
            >
              <Sparkles className="size-4" />
              Añadir a la Admisión ({totalSelectedCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// COMPONENTE ITEM DE PRESTACIÓN CLÍNICA EN EL CARRITO
function ServicioRowItem({
  row,
  index,
  medicos,
  onUpdate,
  onRemove,
}: {
  row: ServiceItemState;
  index: number;
  medicos: MedicoResponse[];
  onUpdate: (id: string, field: keyof ServiceItemState, value: unknown) => void;
  onRemove: (id: string) => void;
  isOnlyRow?: boolean;
}) {
  const subtotalFila = (row.cantidad || 1) * (row.precioUnitario || 0) - (row.descuento || 0);

  return (
    <div className="p-4 bg-card rounded-xl border border-border/80 shadow-2xs space-y-3 hover:border-primary/40 transition-colors w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 font-bold px-2 py-0.5">
            Prestación #{index + 1}
          </Badge>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-muted-foreground">📁 {row.categoriaNombre || "Catálogo General"}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-extrabold text-foreground text-xs">🩺 {row.servicioNombre || "Consulta Médica General"}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemove(row.id)}
          className="h-7 px-2.5 text-xs font-semibold gap-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 self-end sm:self-auto"
          title="Quitar esta prestación"
        >
          <Trash2 className="size-3.5" />
          <span className="hidden sm:inline">Quitar</span>
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-3 items-end pt-1">
        <div className="col-span-12 sm:col-span-5 space-y-1">
          <Label className="text-[11px] text-muted-foreground font-semibold">Médico Tratante</Label>
          <Select
            value={row.medicoId ? row.medicoId.toString() : "sin-medico"}
            onValueChange={(val: string | null) =>
              onUpdate(
                row.id,
                "medicoId",
                !val || val === "sin-medico" ? undefined : Number(val)
              )
            }
          >
            <SelectTrigger className="h-9 w-full bg-background text-xs font-medium border-border/80">
              <SelectValue placeholder="Seleccionar médico..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin-medico">Sin Médico / Guardia</SelectItem>
              {medicos.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>
                  {m.empleado?.nombreCompleto || `Médico #${m.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-4 sm:col-span-2 space-y-1">
          <Label className="text-[11px] text-muted-foreground font-semibold text-center block">Cantidad</Label>
          <Input
            type="number"
            min="1"
            value={row.cantidad}
            onChange={(e) => onUpdate(row.id, "cantidad", Number(e.target.value))}
            className="h-9 text-xs text-center font-bold bg-background"
          />
        </div>

        <div className="col-span-4 sm:col-span-2 space-y-1">
          <Label className="text-[11px] text-muted-foreground font-semibold text-right block">Precio (S/.)</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={row.precioUnitario}
            onChange={(e) => onUpdate(row.id, "precioUnitario", Number(e.target.value))}
            className="h-9 text-xs text-right font-mono font-bold bg-background"
          />
        </div>

        <div className="col-span-4 sm:col-span-3 text-right">
          <span className="text-[10px] text-muted-foreground uppercase block font-bold">Subtotal</span>
          <span className="text-base font-extrabold text-primary">
            S/. {Math.max(0, subtotalFila).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

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
            <Card className="border border-border/70 shadow-2xs bg-card">
              <CardHeader className="p-4 pb-2.5 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <User className="size-4 text-primary" />
                  1. Selección de Paciente
                </CardTitle>

                {isPatientValid && (
                  <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-bold px-2 py-0.5">
                    ✓ Paciente Confirmado
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {selectedPaciente ? (
                  <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <Check className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground">
                          {getPacienteFullName(selectedPaciente)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {getPacienteDocument(selectedPaciente)} | N° HC: <strong>{selectedPaciente.numeroHistoriaClinica || selectedPaciente.id}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPacienteToEdit(selectedPaciente);
                          setRegisterPacienteOpen(true);
                        }}
                        className="h-7 text-xs text-primary hover:bg-primary/10 border-primary/30 px-2.5 font-semibold gap-1"
                        title="Editar expediente de este paciente"
                      >
                        <Edit className="size-3.5" />
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPacienteId("");
                          setPatientSearch("");
                          setPacienteToEdit(null);
                        }}
                        className="h-7 text-xs text-rose-600 hover:bg-rose-50 px-2.5 font-semibold"
                      >
                        Cambiar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Buscar por Documento, Nombre o N° Historia Clínica..."
                        className="h-9.5 text-xs pl-9 pr-3 bg-background shadow-2xs font-medium"
                        autoFocus
                      />
                    </div>

                    {/* SUGERENCIA PARA REGISTRAR SI NO EXISTE */}
                    {patientSearch.trim().length > 0 && filteredPacientes.length === 0 && (
                      <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-amber-600 shrink-0" />
                          <span className="text-[11px] text-foreground font-medium">
                            No existe ningún paciente para <strong>"{patientSearch}"</strong>.
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setPacienteToEdit(null);
                            setRegisterPacienteOpen(true);
                          }}
                          className="h-7.5 px-3 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1 shadow-2xs"
                        >
                          <UserPlus className="size-3.5" />
                          + Registrar Paciente
                        </Button>
                      </div>
                    )}

                    {/* LISTA DE RESULTADOS DE BÚSQUEDA */}
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
                      {isLoadingPacientes ? (
                        <p className="text-xs text-center text-muted-foreground py-4">Buscando pacientes en la BD...</p>
                      ) : filteredPacientes.length === 0 && !patientSearch ? (
                        <p className="text-xs text-center text-muted-foreground py-4 border border-dashed rounded-xl">
                          Escriba Documento, Nombre o N° Historia Clínica para seleccionar.
                        </p>
                      ) : (
                        filteredPacientes.map((p) => {
                          const nom = getPacienteFullName(p);
                          const docInfo = getPacienteDocument(p);
                          const hc = p.numeroHistoriaClinica || p.id;

                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPacienteId(p.id.toString());
                                toast.success(`Paciente "${nom}" seleccionado.`);
                              }}
                              className="w-full p-2.5 rounded-xl border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/40 transition-all text-left flex items-center justify-between text-xs group"
                            >
                              <div>
                                <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">{nom}</p>
                                <p className="text-[11px] text-muted-foreground">{docInfo} | N° HC: <strong>{hc}</strong></p>
                              </div>
                              <span className="text-[11px] font-bold text-primary opacity-80 group-hover:opacity-100">Elegir →</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECCIÓN 2: INGRESO & COBERTURA */}
            <Card className="border border-border/70 shadow-2xs bg-card">
              <CardHeader className="p-4 pb-2.5 border-b border-border/60">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Building2 className="size-4 text-primary" />
                  2. Cobertura & Datos de Ingreso
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Convenio / Cobertura</Label>
                      {isLoadingPacienteConvenios && (
                        <span className="text-[10px] text-muted-foreground animate-pulse">Cargando...</span>
                      )}
                    </div>
                    <Select
                      value={convenioId}
                      onValueChange={(val: string | null) => setConvenioId(val || "particular")}
                    >
                      <SelectTrigger className="h-9 w-full bg-background text-xs font-medium border-border/80">
                        <SelectValue placeholder="Seleccionar convenio..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="particular">Particular (Sin Convenio / Cobertura Directa)</SelectItem>

                        {pacienteConveniosList.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Convenios Afiliados al Paciente
                            </SelectLabel>
                            {pacienteConveniosList.map((pc) => {
                              const cNombre = pc.convenio?.nombre || `Convenio #${pc.convenioId}`;
                              const cCodigo = pc.convenio?.codigo || "";
                              const afil = pc.numeroAfiliado ? ` - Afil: ${pc.numeroAfiliado}` : "";
                              const star = pc.esPrincipal ? " ★ [Principal]" : "";
                              return (
                                <SelectItem key={`pc-${pc.id}`} value={pc.convenioId.toString()}>
                                  {cNombre} ({cCodigo}){afil}{star}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        )}

                        <SelectSeparator />

                        <SelectGroup>
                          <SelectLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Todos los Convenios del Sistema
                          </SelectLabel>
                          {conveniosList.map((c) => (
                            <SelectItem key={`c-${c.id}`} value={c.id.toString()}>
                              {c.nombre} ({c.codigo})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {convenioId !== "particular" ? (
                      <div className="flex items-center justify-between text-[11px] text-emerald-600 font-medium pt-0.5 px-0.5">
                        <span>✓ Cobertura por Convenio</span>
                        <span className="font-mono font-bold text-[10px]">convenioId: {convenioId}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-0.5 px-0.5">
                        <span>Atención Particular</span>
                        <span className="font-mono text-[10px]">convenioId: null</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Fecha & Hora de Atención</Label>
                    <Input
                      type="datetime-local"
                      value={fechaHora}
                      onChange={(e) => setFechaHora(e.target.value)}
                      className="h-9 text-xs bg-background font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Observaciones Clínicas / Indicaciones de Recepción</Label>
                  <Textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Escriba sintomatología de ingreso o notas médicas..."
                    rows={2.5}
                    className="text-xs bg-background resize-none border-border/70"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA: CARRITO DE PRESTACIONES (BLOQUEADO HASTA ELEGIR PACIENTE) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className={`border shadow-2xs bg-card transition-all ${!isPatientValid ? "border-amber-500/30 opacity-90" : "border-border/70"}`}>
              <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Stethoscope className="size-4 text-primary" />
                  <div>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      3. Carrito de Prestaciones Médicas ({detalles.length})
                      {!isPatientValid && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] gap-1 py-0 h-5">
                          <Lock className="size-3" /> Bloqueado (Falta Paciente)
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (!isPatientValid) {
                      toast.warning("Debe seleccionar o registrar un paciente en el Paso 1 antes de agregar prestaciones.");
                      return;
                    }
                    setMultiPickerOpen(true);
                  }}
                  disabled={!isPatientValid}
                  className={`h-8.5 text-xs font-bold gap-2 shadow-xs px-3.5 transition-all ${
                    !isPatientValid
                      ? "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground"
                  }`}
                  title={!isPatientValid ? "Seleccione un paciente primero" : "Abrir catálogo de prestaciones"}
                >
                  {!isPatientValid ? <Lock className="size-3.5" /> : <ShoppingCart className="size-3.5" />}
                  Abrir Catálogo & Seleccionar Prestaciones
                </Button>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5">
                {!isPatientValid ? (
                  <div className="p-8 text-center border-2 border-dashed border-amber-500/30 rounded-xl bg-amber-500/5 space-y-3">
                    <div className="size-11 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto font-bold">
                      <Lock className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground uppercase tracking-wider">
                        Paso 3 Bloqueado: Falta Seleccionar Paciente
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                        Por favor busque por <strong>Documento, Nombre o N° Historia Clínica</strong> en el Paso 1 (o regístrelo si no existe) para desbloquear el catálogo de prestaciones.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 w-full">
                    {detalles.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
                        <ShoppingCart className="size-8 text-muted-foreground/40 mx-auto" />
                        <p className="font-semibold text-foreground">El carrito está vacío</p>
                        <p className="text-[11px]">Haga clic en <strong>"Abrir Catálogo"</strong> para elegir varias prestaciones a la vez.</p>
                      </div>
                    ) : (
                      detalles.map((row, idx) => (
                        <ServicioRowItem
                          key={row.id}
                          row={row}
                          index={idx}
                          medicos={medicosList}
                          onUpdate={updateDetalle}
                          onRemove={removeDetalle}
                        />
                      ))
                    )}
                  </div>
                )}

                <div className="sticky bottom-4 z-10 backdrop-blur-md bg-card/95 p-4 border border-border/80 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-6 text-muted-foreground text-xs">
                    <span>Subtotal Neto: <strong className="text-foreground">S/.{totalSubtotal.toFixed(2)}</strong></span>
                    <span>Descuento Aplicado: <strong className="text-emerald-600">-S/.{totalDescuentos.toFixed(2)}</strong></span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-foreground text-xs uppercase tracking-wider">
                      Total Admisión:
                    </span>
                    <span className="text-lg font-extrabold text-primary bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20 shadow-xs">
                      S/. {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-card border border-border/70 rounded-xl shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Receipt className="size-4 text-blue-600" />
                <span>Endpoint de admisión: <strong className="text-blue-600 font-bold">POST /admisiones</strong></span>
              </div>

              <div className="flex items-center gap-3">
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
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !isPatientValid || detalles.length === 0}
                  className="h-9 px-5 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Guardar Admisión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
