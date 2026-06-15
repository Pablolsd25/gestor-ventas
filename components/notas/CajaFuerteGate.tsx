"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "caja-fuerte-unlocked";

const inputCls =
  "w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-center tracking-widest bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500";

interface Props {
  children: React.ReactNode;
}

export default function CajaFuerteGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newConfirm, setNewConfirm] = useState("");
  const [changeMsg, setChangeMsg] = useState("");

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/caja-fuerte/status");
      const data = (await res.json()) as { configured: boolean };
      setConfigured(data.configured);
      setUnlocked(sessionStorage.getItem(STORAGE_KEY) === "1" && data.configured);
      setChecking(false);
    }
    init();
  }, []);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/caja-fuerte/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setSubmitting(false);
    if (res.ok) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setPin("");
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "PIN incorrecto");
    }
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/caja-fuerte/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, confirm }),
    });
    setSubmitting(false);
    const data = (await res.json()) as { error?: string };
    if (res.ok) {
      setConfigured(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setPin("");
      setConfirm("");
    } else {
      setError(data.error ?? "No se pudo guardar el PIN");
    }
  }

  async function handleChangePin(e: React.FormEvent) {
    e.preventDefault();
    setChangeMsg("");
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/caja-fuerte/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPin, newPin, confirm: newConfirm }),
    });
    setSubmitting(false);
    const data = (await res.json()) as { error?: string };
    if (res.ok) {
      setChangeMsg("PIN actualizado correctamente.");
      setShowChangePin(false);
      setCurrentPin("");
      setNewPin("");
      setNewConfirm("");
    } else {
      setError(data.error ?? "No se pudo cambiar el PIN");
    }
  }

  function lock() {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setPin("");
    setShowChangePin(false);
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 dark:text-slate-500 text-sm">
        Verificando acceso…
      </div>
    );
  }

  if (!unlocked) {
    const isSetup = configured === false;
    return (
      <div className="max-w-sm mx-auto mt-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg p-8 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 dark:bg-slate-950 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Caja Fuerte</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {isSetup
                ? "Crea tu PIN personal (4–8 dígitos). Solo tú lo conocerás."
                : "Ingresa tu PIN para acceder a las notas privadas."}
            </p>
          </div>
          <form onSubmit={isSetup ? handleSetup : handleUnlock} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={isSetup ? "Nuevo PIN" : "PIN de acceso"}
              autoFocus
              className={inputCls}
            />
            {isSetup && (
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirmar PIN"
                className={inputCls}
              />
            )}
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {submitting ? "Guardando…" : isSetup ? "Crear mi PIN" : "Desbloquear"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Caja fuerte desbloqueada
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowChangePin((v) => !v); setError(""); setChangeMsg(""); }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
          >
            {showChangePin ? "Cancelar" : "Cambiar PIN"}
          </button>
          <button
            onClick={lock}
            className="text-xs text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1"
          >
            Bloquear
          </button>
        </div>
      </div>

      {changeMsg && (
        <p className="text-xs text-green-600 dark:text-green-400 print:hidden">{changeMsg}</p>
      )}

      {showChangePin && (
        <form
          onSubmit={handleChangePin}
          className="print:hidden max-w-md bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-3"
        >
          <p className="text-sm font-medium text-gray-800 dark:text-slate-100">Cambiar PIN</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            placeholder="PIN actual"
            className={inputCls}
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Nuevo PIN"
            className={inputCls}
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={newConfirm}
            onChange={(e) => setNewConfirm(e.target.value)}
            placeholder="Confirmar nuevo PIN"
            className={inputCls}
          />
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg"
          >
            {submitting ? "Guardando…" : "Guardar nuevo PIN"}
          </button>
        </form>
      )}

      {children}
    </div>
  );
}
