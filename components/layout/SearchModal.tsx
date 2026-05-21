"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResult } from "@/app/search/actions";

// ── Type display config ───────────────────────────────────────────────────────

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  cliente:      "Cliente",
  venta:        "Venta",
  recordatorio: "Recordatorio",
};

const TYPE_BADGE: Record<SearchResult["type"], string> = {
  cliente:      "bg-emerald-100 text-emerald-700",
  venta:        "bg-blue-100 text-blue-700",
  recordatorio: "bg-amber-100 text-amber-700",
};

const TYPE_ICON: Record<SearchResult["type"], React.ReactNode> = {
  cliente: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  venta: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  recordatorio: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query,      setQuery]      = useState("");
  const [results,    setResults]    = useState<SearchResult[]>([]);
  const [activeIdx,  setActiveIdx]  = useState(-1);
  const [isPending,  startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  // Reset + focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setActiveIdx(-1);
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      startTransition(async () => {
        const res = await globalSearch(query);
        setResults(res);
        setActiveIdx(-1);
      });
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  function navigate(result: SearchResult) {
    router.push(result.href);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (activeIdx >= 0 && results[activeIdx]) {
          e.preventDefault();
          navigate(results[activeIdx]);
        }
        break;
    }
  }

  if (!isOpen) return null;

  const showEmpty = query.trim().length >= 2 && !isPending && results.length === 0;
  const showHint  = query.trim().length < 2;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4" style={{ paddingTop: "10vh" }}>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        style={{ backdropFilter: "blur(3px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="search-modal relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/8">

        {/* ── Input row ── */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          {isPending ? (
            <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
          ) : (
            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar clientes, ventas, recordatorios…"
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
            aria-label="Búsqueda global"
            autoComplete="off"
          />

          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md transition-colors shrink-0"
              aria-label="Limpiar búsqueda"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center text-[11px] text-gray-400 border border-gray-200 rounded-md px-1.5 py-0.5 font-mono bg-gray-50 shrink-0">
            Esc
          </kbd>
        </div>

        {/* ── Results ── */}
        {results.length > 0 && (
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50" role="listbox">
            {results.map((r, i) => (
              <button
                key={`${r.type}-${r.id}`}
                role="option"
                aria-selected={i === activeIdx}
                onClick={() => navigate(r)}
                onMouseEnter={() => setActiveIdx(i)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                  i === activeIdx ? "bg-blue-50" : "hover:bg-gray-50",
                ].join(" ")}
              >
                {/* Icon + badge */}
                <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${TYPE_BADGE[r.type]}`}>
                  {TYPE_ICON[r.type]}
                  {TYPE_LABEL[r.type]}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                  {r.subtitle && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{r.subtitle}</p>
                  )}
                </div>

                {/* Chevron */}
                <svg className={`w-4 h-4 shrink-0 transition-colors ${i === activeIdx ? "text-blue-400" : "text-gray-200"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {showEmpty && (
          <div className="py-12 px-4 text-center">
            <svg className="w-9 h-9 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-600">
              Sin resultados para &ldquo;{query}&rdquo;
            </p>
            <p className="text-xs text-gray-400 mt-1">Prueba con otro término</p>
          </div>
        )}

        {/* ── Hint state ── */}
        {showHint && (
          <div className="px-4 py-4">
            <p className="text-xs font-medium text-gray-400 mb-2.5 uppercase tracking-wide">
              Busca en
            </p>
            <div className="flex flex-wrap gap-2">
              {(["cliente", "venta", "recordatorio"] as const).map((type) => (
                <span key={type} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_BADGE[type]}`}>
                  {TYPE_ICON[type]}
                  {TYPE_LABEL[type]}s
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Keyboard footer ── */}
        {results.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center gap-5">
            {[
              { key: "↑↓",  desc: "navegar" },
              { key: "↵",   desc: "abrir"   },
              { key: "Esc", desc: "cerrar"  },
            ].map(({ key, desc }) => (
              <span key={key} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <kbd className="font-mono border border-gray-300 rounded px-1 py-0.5 bg-white text-gray-500 text-[10px]">
                  {key}
                </kbd>
                {desc}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
