export type NeedCategoryKey =
  | "MATERIALES_CONSTRUCCION"
  | "ALIMENTOS_AGUA"
  | "MEDICAMENTOS_INSUMOS_MEDICOS"
  | "HERRAMIENTAS"
  | "REFUGIO_TEMPORAL"
  | "SERVICIOS"
  | "OTRO";

export interface NeedCatalogItem {
  key: string;
  label: string;
  unit: string;
}

export interface NeedCatalogCategory {
  key: NeedCategoryKey;
  label: string;
  items: NeedCatalogItem[];
}

export const NEED_CATEGORIES: NeedCatalogCategory[] = [
  {
    key: "MATERIALES_CONSTRUCCION",
    label: "Materiales de construcción",
    items: [
      { key: "teja_zinc", label: "Láminas de zinc", unit: "unidad" },
      { key: "teja_barro", label: "Tejas de barro", unit: "unidad" },
      { key: "cemento", label: "Cemento", unit: "bulto" },
      { key: "ladrillo", label: "Ladrillo / bloque", unit: "unidad" },
      { key: "arena", label: "Arena", unit: "m3" },
      { key: "madera", label: "Madera / tabla", unit: "unidad" },
      { key: "clavos", label: "Clavos / tornillos", unit: "kg" },
      { key: "plastico_lona", label: "Plástico / lona", unit: "m2" },
    ],
  },
  {
    key: "ALIMENTOS_AGUA",
    label: "Alimentos y agua",
    items: [
      { key: "agua_potable", label: "Agua potable", unit: "litro" },
      { key: "alimentos_no_perecederos", label: "Alimentos no perecederos", unit: "kg" },
      { key: "leche_formula", label: "Leche / fórmula infantil", unit: "unidad" },
      { key: "kit_alimentario", label: "Kit alimentario familiar", unit: "kit" },
    ],
  },
  {
    key: "MEDICAMENTOS_INSUMOS_MEDICOS",
    label: "Medicamentos e insumos médicos",
    items: [
      { key: "analgesicos", label: "Analgésicos / antiinflamatorios", unit: "unidad" },
      { key: "antibioticos", label: "Antibióticos", unit: "unidad" },
      { key: "suero_hidratacion", label: "Suero / hidratación oral", unit: "unidad" },
      { key: "curaciones", label: "Material de curación (gasas, vendas)", unit: "kit" },
      { key: "medicamento_cronico", label: "Medicamento crónico específico", unit: "unidad" },
      { key: "atencion_medica", label: "Atención médica presencial", unit: "persona" },
    ],
  },
  {
    key: "HERRAMIENTAS",
    label: "Herramientas",
    items: [
      { key: "pala", label: "Palas", unit: "unidad" },
      { key: "picota", label: "Picotas / piquetas", unit: "unidad" },
      { key: "carretilla", label: "Carretillas", unit: "unidad" },
      { key: "martillo", label: "Martillos", unit: "unidad" },
      { key: "sierra", label: "Sierras / motosierras", unit: "unidad" },
    ],
  },
  {
    key: "REFUGIO_TEMPORAL",
    label: "Refugio temporal",
    items: [
      { key: "carpa", label: "Carpas / toldillos", unit: "unidad" },
      { key: "colchon", label: "Colchones", unit: "unidad" },
      { key: "cobija", label: "Cobijas / frazadas", unit: "unidad" },
      { key: "kit_aseo", label: "Kit de aseo personal", unit: "kit" },
      { key: "linterna_vela", label: "Linterna / velas / pilas", unit: "unidad" },
    ],
  },
  {
    key: "SERVICIOS",
    label: "Servicios",
    items: [
      { key: "demolicion", label: "Demolición de estructura", unit: "servicio" },
      { key: "remocion_escombros", label: "Remoción de escombros", unit: "servicio" },
      { key: "transporte", label: "Transporte de personas / carga", unit: "servicio" },
      { key: "mano_obra", label: "Mano de obra general", unit: "persona-dia" },
      { key: "atencion_psicologica", label: "Atención psicológica", unit: "persona" },
      { key: "electricista_plomero", label: "Electricista / plomero", unit: "servicio" },
    ],
  },
  {
    key: "OTRO",
    label: "Otro",
    items: [],
  },
];

export const OTHER_ITEM_KEY = "otro";

export function getCategory(key: string): NeedCatalogCategory | undefined {
  return NEED_CATEGORIES.find((c) => c.key === key);
}

export function getCatalogItem(
  categoryKey: string,
  itemKey: string
): NeedCatalogItem | undefined {
  return getCategory(categoryKey)?.items.find((i) => i.key === itemKey);
}

export const NEED_ITEM_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  CUBIERTO: "Cubierto",
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  NUEVO: "Nuevo",
  EN_REVISION: "En revisión",
  EN_PROCESO: "En proceso",
  ATENDIDO: "Atendido",
  CERRADO: "Cerrado",
};
