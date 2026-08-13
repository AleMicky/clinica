import { z } from "zod";

export const bancoSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es obligatorio.")
    .max(20, "El código no puede superar los 20 caracteres."),
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio.")
    .max(150, "El nombre no puede superar los 150 caracteres."),
  nombreCorto: z
    .string()
    .max(50, "El nombre corto no puede superar los 50 caracteres.")
    .optional()
    .nullable(),
});

export type BancoFormValues = z.infer<typeof bancoSchema>;

export const cuentaBancariaSchema = z.object({
  monedaId: z
    .number()
    .min(1, "Debe seleccionar una moneda válida."),
  numeroCuenta: z
    .string()
    .min(1, "El número de cuenta es obligatorio.")
    .max(40, "El número de cuenta no puede superar los 40 caracteres."),
  nombreCuenta: z
    .string()
    .max(150, "El nombre de la cuenta no puede superar los 150 caracteres.")
    .optional()
    .nullable(),
  tipoCuenta: z
    .string()
    .max(30, "El tipo de cuenta no puede superar los 30 caracteres.")
    .optional()
    .nullable(),
});

export type CuentaBancariaFormValues = z.infer<typeof cuentaBancariaSchema>;
