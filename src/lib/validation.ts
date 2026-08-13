import { z } from "zod";

// Estos enums se mantienen alineados manualmente con prisma/schema.prisma.
// No se importan desde @prisma/client aquí porque este archivo se usa también
// en componentes de cliente (formulario público) y el cliente de Prisma no es
// seguro de incluir en el bundle del navegador.
export const reportStatusEnum = z.enum([
  "NUEVO",
  "EN_REVISION",
  "EN_PROCESO",
  "ATENDIDO",
  "CERRADO",
]);

export const needItemStatusEnum = z.enum(["PENDIENTE", "EN_PROCESO", "CUBIERTO"]);

export const needCategoryEnum = z.enum([
  "MATERIALES_CONSTRUCCION",
  "ALIMENTOS_AGUA",
  "MEDICAMENTOS_INSUMOS_MEDICOS",
  "HERRAMIENTAS",
  "REFUGIO_TEMPORAL",
  "SERVICIOS",
  "OTRO",
]);

export const locationSourceEnum = z.enum(["GPS", "MANUAL"]);

export const needItemInputSchema = z.object({
  category: needCategoryEnum,
  itemKey: z.string().min(1),
  itemLabel: z.string().min(1, "Describe qué necesitas"),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  unit: z.string().min(1, "Indica la unidad"),
  note: z.string().optional(),
});

const addressRequiredWhenManual = (data: { locationSource: string; address?: string }) =>
  data.locationSource === "GPS"
    ? true
    : data.address !== undefined && data.address.trim().length > 0;

const addressRefineOptions = {
  message: "Escribe la dirección o indicaciones del sitio",
  path: ["address"],
};

// Campos compartidos entre el formulario (cliente) y el payload enviado al servidor.
export const reportFieldsSchema = z.object({
  contactName: z.string().min(2, "Ingresa el nombre de contacto"),
  phonePrimary: z.string().min(7, "Ingresa un teléfono válido"),
  phoneAlternate: z.string().optional().or(z.literal("")),

  locationSource: locationSourceEnum,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional().or(z.literal("")),
  municipality: z.string().min(2, "Indica el municipio"),
  neighborhood: z.string().optional().or(z.literal("")),

  needItems: z.array(needItemInputSchema).min(1, "Agrega al menos una necesidad"),
});

// Usado por el formulario en el navegador (react-hook-form), sin clientId/fotos.
export const reportFormSchema = reportFieldsSchema.refine(
  addressRequiredWhenManual,
  addressRefineOptions
);

// Payload completo enviado a POST /api/reports (incluye clientId y URLs de fotos ya subidas).
export const reportInputSchema = reportFieldsSchema
  .extend({
    clientId: z.string().min(1),
    photoUrls: z.array(z.string().url()).optional().default([]),
  })
  .refine(addressRequiredWhenManual, addressRefineOptions);

export type ReportFormValues = z.infer<typeof reportFormSchema>;
export type ReportInput = z.infer<typeof reportInputSchema>;
export type NeedItemInput = z.infer<typeof needItemInputSchema>;

export const updateReportStatusSchema = z.object({
  status: reportStatusEnum,
});

export const updateInternalNotesSchema = z.object({
  internalNotes: z.string().max(5000),
});

export const updateNeedItemStatusSchema = z.object({
  status: needItemStatusEnum,
});
