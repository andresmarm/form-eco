"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { NEED_CATEGORIES, getCategory, getCatalogItem, OTHER_ITEM_KEY } from "@/lib/needs-catalog";
import type { ReportFormValues } from "@/lib/validation";

function NeedItemRow({ index, remove }: { index: number; remove: (index: number) => void }) {
  const { register, control, setValue, formState: { errors } } = useFormContext<ReportFormValues>();

  const category = useWatch({ control, name: `needItems.${index}.category` });
  const itemKey = useWatch({ control, name: `needItems.${index}.itemKey` });
  const categoryDef = getCategory(category);
  const isOther = itemKey === OTHER_ITEM_KEY || !categoryDef || categoryDef.items.length === 0;
  const itemErrors = errors.needItems?.[index];

  function handleCategoryChange(newCategory: string) {
    setValue(`needItems.${index}.category`, newCategory as ReportFormValues["needItems"][number]["category"]);
    const def = getCategory(newCategory);
    if (def && def.items.length > 0) {
      const first = def.items[0];
      setValue(`needItems.${index}.itemKey`, first.key);
      setValue(`needItems.${index}.itemLabel`, first.label);
      setValue(`needItems.${index}.unit`, first.unit);
    } else {
      setValue(`needItems.${index}.itemKey`, OTHER_ITEM_KEY);
      setValue(`needItems.${index}.itemLabel`, "");
      setValue(`needItems.${index}.unit`, "");
    }
  }

  function handleItemChange(newItemKey: string) {
    setValue(`needItems.${index}.itemKey`, newItemKey);
    if (newItemKey === OTHER_ITEM_KEY) {
      setValue(`needItems.${index}.itemLabel`, "");
      setValue(`needItems.${index}.unit`, "");
    } else {
      const item = getCatalogItem(category, newItemKey);
      if (item) {
        setValue(`needItems.${index}.itemLabel`, item.label);
        setValue(`needItems.${index}.unit`, item.unit);
      }
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Categoría</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {NEED_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Necesidad</label>
            {categoryDef && categoryDef.items.length > 0 ? (
              <select
                value={itemKey}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {categoryDef.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
                <option value={OTHER_ITEM_KEY}>Otro</option>
              </select>
            ) : (
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">Otro</div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => remove(index)}
          aria-label="Quitar necesidad"
          className="mt-6 rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
        >
          ✕
        </button>
      </div>

      {isOther && (
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Describe qué necesitas
          </label>
          <input
            type="text"
            {...register(`needItems.${index}.itemLabel`)}
            placeholder="Ej. Puntillas de 3 pulgadas"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {itemErrors?.itemLabel && (
            <p className="mt-1 text-sm text-red-600">{itemErrors.itemLabel.message}</p>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Cantidad</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            {...register(`needItems.${index}.quantity`, { valueAsNumber: true })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {itemErrors?.quantity && (
            <p className="mt-1 text-sm text-red-600">{itemErrors.quantity.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Unidad</label>
          <input
            type="text"
            {...register(`needItems.${index}.unit`)}
            placeholder="Ej. bulto, unidad, kg"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-sm font-medium text-slate-700">Nota (opcional)</label>
          <input
            type="text"
            {...register(`needItems.${index}.note`)}
            placeholder="Detalle adicional"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export function NeedItemsEditor() {
  const { control, formState: { errors } } = useFormContext<ReportFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "needItems" });

  function addItem() {
    const firstCategory = NEED_CATEGORIES[0];
    const firstItem = firstCategory.items[0];
    append({
      category: firstCategory.key,
      itemKey: firstItem.key,
      itemLabel: firstItem.label,
      quantity: 1,
      unit: firstItem.unit,
      note: "",
    });
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <NeedItemRow key={field.id} index={index} remove={remove} />
      ))}

      {fields.length === 0 && (
        <p className="text-sm text-slate-500">Aún no has agregado ninguna necesidad.</p>
      )}
      {errors.needItems?.root && (
        <p className="text-sm text-red-600">{errors.needItems.root.message}</p>
      )}
      {typeof errors.needItems?.message === "string" && (
        <p className="text-sm text-red-600">{errors.needItems.message}</p>
      )}

      <button
        type="button"
        onClick={addItem}
        className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
      >
        + Agregar necesidad
      </button>
    </div>
  );
}
