import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { NotaRow } from "@/types/database";
import NotasBoard from "@/components/notas/NotasBoard";
import CajaFuerteGate from "@/components/notas/CajaFuerteGate";

export const dynamic = "force-dynamic";

export default async function NotasPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notas")
    .select("*")
    .order("created_at", { ascending: false });

  const notas = (data ?? []) as NotaRow[];

  return (
    <CajaFuerteGate>
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-950 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Caja Fuerte</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Notas privadas y confidenciales del vendedor.
              </p>
            </div>
          </div>
        </div>
        <NotasBoard notas={notas} />
      </div>
    </CajaFuerteGate>
  );
}
