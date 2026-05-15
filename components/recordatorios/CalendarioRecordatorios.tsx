"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { completeRecordatorioAction } from "@/app/recordatorios/actions";
import type { RecordatorioConUniones } from "@/types/database";

interface Props {
  recordatorios: RecordatorioConUniones[];
}

const DIAS_CORTOS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const TIPO_ICONO: Record<string, string> = {
  llamada:     "📞",
  reunion:     "🤝",
  email:       "✉️",
  seguimiento: "🔍",
  otro:        "📌",
};

export default function CalendarioRecordatorios({ recordatorios }: Props) {
  const hoy = new Date();
  const todayStr = hoy.toISOString().split("T")[0];

  const [year, setYear]           = useState(hoy.getFullYear());
  const [month, setMonth]         = useState(hoy.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  // Group by date
  const byDay: Record<string, RecordatorioConUniones[]> = {};
  for (const r of recordatorios) {
    if (!byDay[r.fecha]) byDay[r.fecha] = [];
    byDay[r.fecha].push(r);
  }

  // Build grid cells (week starts Monday)
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  let startOffset       = firstDayOfMonth.getDay() - 1; // 0=Mon
  if (startOffset < 0) startOffset = 6;                 // Sunday → 6

  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(totalCells - startOffset - daysInMonth).fill(null),
  ];

  const selectedRecs = selectedDay ? (byDay[selectedDay] ?? []) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* ── Calendar ── */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <h3 className="font-semibold text-gray-800">
            {MESES[month]} {year}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DIAS_CORTOS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;

            const mm      = String(month + 1).padStart(2, "0");
            const dd      = String(day).padStart(2, "0");
            const dateStr = `${year}-${mm}-${dd}`;
            const recs    = byDay[dateStr] ?? [];
            const pending = recs.filter((r) => !r.completado);

            const isToday    = dateStr === todayStr;
            const isSelected = dateStr === selectedDay;
            const hasAlta    = pending.some((r) => r.prioridad === "alta");
            const hasMedia   = pending.some((r) => r.prioridad === "media");
            const hasBaja    = pending.some((r) => r.prioridad === "baja");

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={[
                  "relative flex flex-col items-center py-1.5 rounded-lg text-sm transition-colors",
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isToday
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-gray-50 text-gray-700",
                ].join(" ")}
              >
                <span>{day}</span>
                {pending.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasAlta  && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-red-500"}`} />}
                    {hasMedia && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-amber-400"}`} />}
                    {hasBaja  && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-green-500"}`} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
          {([ ["bg-red-500", "Alta"], ["bg-amber-400", "Media"], ["bg-green-500", "Baja"] ] as const).map(
            ([color, label]) => (
              <div key={label} className="flex items-center gap-1 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Day panel ── */}
      {selectedDay ? (
        <div className="lg:w-72 bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 text-sm capitalize">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("es-MX", {
                weekday: "long",
                day:     "numeric",
                month:   "long",
              })}
            </h4>
            <Link
              href={`/recordatorios/nuevo?fecha=${selectedDay}`}
              className="text-xs text-blue-600 hover:underline whitespace-nowrap"
            >
              + Agregar
            </Link>
          </div>

          {selectedRecs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Sin recordatorios este d&iacute;a
            </p>
          ) : (
            <div className="space-y-2">
              {selectedRecs.map((r) => (
                <RecItem key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex lg:w-72 bg-gray-50 rounded-xl border border-dashed border-gray-200 items-center justify-center">
          <p className="text-sm text-gray-400 text-center px-4">
            Selecciona un d&iacute;a para ver sus recordatorios
          </p>
        </div>
      )}
    </div>
  );
}

// ── Individual recordatorio inside the day panel ──────────────────────────────

const PRIORIDAD_CARD: Record<string, string> = {
  alta:  "border-red-200 bg-red-50",
  media: "border-amber-200 bg-amber-50",
  baja:  "border-green-200 bg-green-50",
};

function RecItem({ r }: { r: RecordatorioConUniones }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone]              = useState(r.completado);

  function handleComplete() {
    startTransition(async () => {
      await completeRecordatorioAction(r.id, undefined, new FormData());
      setDone(true);
    });
  }

  const cardClass = done
    ? "border-gray-100 bg-gray-50 opacity-50"
    : PRIORIDAD_CARD[r.prioridad];

  return (
    <div className={`rounded-lg border p-2.5 transition-opacity ${cardClass}`}>
      <div className="flex items-start gap-2">
        <span className="text-base leading-none mt-0.5 shrink-0">
          {TIPO_ICONO[r.tipo]}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
            {r.titulo}
          </p>
          <p className="text-xs text-gray-500">
            {r.hora.slice(0, 5)}
            {r.clientes?.razon_social ? ` · ${r.clientes.razon_social}` : ""}
          </p>
        </div>
        {!done && (
          <button
            onClick={handleComplete}
            disabled={isPending}
            title="Marcar como completado"
            className="shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 disabled:opacity-50 transition-colors"
          />
        )}
        {done && (
          <span className="shrink-0 text-green-600 text-xs font-medium">&#10003;</span>
        )}
      </div>
    </div>
  );
}
