"use client";

import { useState, useTransition } from "react";
import type { NeedItem } from "@prisma/client";
import { getCategory, NEED_ITEM_STATUS_LABELS } from "@/lib/needs-catalog";
import { updateNeedItemStatus } from "@/actions/reports";

const STATUS_OPTIONS = ["PENDIENTE", "EN_PROCESO", "CUBIERTO"] as const;

export function NeedItemRow({ reportId, item }: { reportId: string; item: NeedItem }) {
  const [status, setStatus] = useState(item.status);
  const [isPending, startTransition] = useTransition();
  const categoryLabel = getCategory(item.category)?.label ?? item.category;

  function handleChange(newStatus: string) {
    setStatus(newStatus as NeedItem["status"]);
    startTransition(async () => {
      await updateNeedItemStatus(reportId, item.id, newStatus);
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
      <div>
        <div className="font-medium text-slate-900">
          {item.quantity} {item.unit} · {item.itemLabel}
        </div>
        <div className="text-xs text-slate-500">
          {categoryLabel}
          {item.note ? ` · ${item.note}` : ""}
        </div>
      </div>
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {NEED_ITEM_STATUS_LABELS[opt]}
          </option>
        ))}
      </select>
    </div>
  );
}
