import { z } from "zod";

export const medicoSchema = z.object({
  empleadoId: z
    .number({ message: "Debe seleccionar un empleado." })
    .int()
    .gt(0, "Debe seleccionar un empleado."),
  matriculaProfesional: z
    .string()
    .trim()
    .min(1, "La matrícula profesional es requerida")
    .max(50, "Máximo 50 caracteres"),
  registroMinisterioSalud: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type MedicoFormValues = z.infer<typeof medicoSchema>;

export const medicoEspecialidadSchema = z.object({
  especialidadId: z
    .number({ message: "Debe seleccionar una especialidad." })
    .int()
    .gt(0, "Debe seleccionar una especialidad."),
  esPrincipal: z.boolean(),
});

export type MedicoEspecialidadFormValues = z.infer<typeof medicoEspecialidadSchema>;

export const medicoServicioAcuerdoSchema = z
  .object({
    servicioId: z
      .number({ message: "Debe seleccionar un servicio." })
      .int()
      .gt(0, "Debe seleccionar un servicio."),
    importeServicio: z
      .number({ message: "Debe ingresar el importe del servicio." })
      .min(0, "El importe del servicio debe ser mayor o igual a 0."),
    importeMedico: z
      .number({ message: "Debe ingresar el importe del médico." })
      .min(0, "El importe del médico debe ser mayor o igual a 0."),
    fechaInicio: z
      .string()
      .trim()
      .min(1, "La fecha de inicio es requerida."),
    fechaFin: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.importeMedico <= data.importeServicio, {
    message: "El importe del médico no puede superar el importe total del servicio.",
    path: ["importeMedico"],
  });

export type MedicoServicioAcuerdoFormValues = z.infer<typeof medicoServicioAcuerdoSchema>;
