import { z } from "zod";

export const asignacionEmpleadoSchema = z
    .object({
        empleadoId: z
            .number({ message: "Seleccione un empleado." })
            .int()
            .gt(0, "Seleccione un empleado."),

        areaId: z
            .number({ message: "Seleccione un área." })
            .int()
            .gt(0, "Seleccione un área."),

        cargoId: z
            .number({ message: "Seleccione un cargo." })
            .int()
            .gt(0, "Seleccione un cargo."),

        fechaInicio: z
            .string()
            .trim()
            .min(1, "La fecha de inicio es obligatoria.")
            .refine((v) => !isNaN(Date.parse(v)), "Fecha inválida."),

        fechaFin: z
            .string()
            .trim()
            .optional()
            .or(z.literal(""))
            .refine((v) => !v || !isNaN(Date.parse(v)), "Fecha inválida."),

        observacion: z
            .string()
            .trim()
            .max(500, "La observación no puede superar los 500 caracteres.")
            .optional()
            .or(z.literal("")),
    })
    .refine(
        (data) => {
            if (data.fechaInicio && data.fechaFin) {
                const inicio = new Date(data.fechaInicio).getTime();
                const fin = new Date(data.fechaFin).getTime();
                return fin >= inicio;
            }
            return true;
        },
        {
            message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
            path: ["fechaFin"],
        },
    );

export type AsignacionEmpleadoFormValues = z.infer<
    typeof asignacionEmpleadoSchema
>;
