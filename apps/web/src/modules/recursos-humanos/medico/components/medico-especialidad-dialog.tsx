"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Stethoscope, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { useEspecialidades } from "@/modules/recursos-humanos/especialidad/hooks/use-especialidades";
import { useCreateMedicoEspecialidad } from "../hooks/use-medicos";
import {
  medicoEspecialidadSchema,
  type MedicoEspecialidadFormValues,
} from "../schemas/medico.schema";

interface MedicoEspecialidadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleadoId: number;
  medicoId: number;
  existingEspecialidadIds?: number[];
}

export function MedicoEspecialidadDialog({
  open,
  onOpenChange,
  empleadoId,
  medicoId,
  existingEspecialidadIds = [],
}: MedicoEspecialidadDialogProps) {
  const { data: especialidadesCatalogoData, isLoading: isLoadingCatalogo } =
    useEspecialidades({ pageSize: 200 });

  const createMutation = useCreateMedicoEspecialidad();

  const especialidadesCatalogo = React.useMemo(
    () => especialidadesCatalogoData?.items ?? [],
    [especialidadesCatalogoData]
  );

  // Filter out already assigned specialties
  const availableEspecialidades = React.useMemo(() => {
    return especialidadesCatalogo.filter(
      (esp) => !existingEspecialidadIds.includes(esp.id)
    );
  }, [especialidadesCatalogo, existingEspecialidadIds]);

  const especialidadOptions: AutocompleteOption[] = React.useMemo(() => {
    return availableEspecialidades.map((esp) => ({
      value: String(esp.id),
      label: esp.nombre,
      description: esp.codigo ? `Cód: ${esp.codigo}` : undefined,
    }));
  }, [availableEspecialidades]);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MedicoEspecialidadFormValues>({
    resolver: zodResolver(medicoEspecialidadSchema),
    defaultValues: {
      especialidadId: 0,
      esPrincipal: false,
    },
  });

  const selectedEspecialidadId = watch("especialidadId");
  const esPrincipalVal = watch("esPrincipal");

  React.useEffect(() => {
    if (open) {
      reset({
        especialidadId: 0,
        esPrincipal: false,
      });
    }
  }, [open, reset]);

  const onSubmit = async (values: MedicoEspecialidadFormValues) => {
    try {
      await createMutation.mutateAsync({
        empleadoId,
        medicoId,
        request: {
          especialidadId: values.especialidadId,
          esPrincipal: values.esPrincipal,
        },
      });
      onOpenChange(false);
    } catch {
      // Handled by toast in mutation
    }
  };

  const isPending = createMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/80 shadow-2xl">
        <DialogHeader className="p-5 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Asignar Especialidad Médica
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Seleccione del catálogo la especialidad a acreditar en el expediente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dlgEspecialidadId" className="text-xs font-semibold">
              Especialidad Médica <span className="text-destructive">*</span>
            </Label>
            <Autocomplete
              id="dlgEspecialidadId"
              value={selectedEspecialidadId ? String(selectedEspecialidadId) : ""}
              onValueChange={(val) =>
                setValue("especialidadId", Number(val), { shouldValidate: true })
              }
              options={especialidadOptions}
              placeholder="Buscar especialidad en catálogo..."
              emptyText="No hay especialidades disponibles"
              allowCustomValue={false}
              isLoading={isLoadingCatalogo}
              error={Boolean(errors.especialidadId)}
            />
            {errors.especialidadId && (
              <p className="text-xs text-destructive">{errors.especialidadId.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg border bg-muted/30">
            <Checkbox
              id="dlgEsPrincipal"
              checked={esPrincipalVal}
              onCheckedChange={(checked) => setValue("esPrincipal", Boolean(checked))}
            />
            <div className="space-y-0.5">
              <Label
                htmlFor="dlgEsPrincipal"
                className="text-xs font-semibold cursor-pointer flex items-center gap-1 text-foreground"
              >
                <Star className="size-3.5 text-amber-500 fill-amber-500/20" />
                Marcar como Especialidad Principal
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Se mostrará como la especialidad primaria en recetas y citas médicas.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs gap-1.5 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Asignar Especialidad</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
