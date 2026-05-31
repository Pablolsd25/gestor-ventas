import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { NotaRow } from "@/types/database";
import NotasBoard from "@/components/notas/NotasBoard";

export const dynamic = "force-dynamic";

export default async function NotasPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notas")
    .select("*")
    .order("created_at", { ascending: false });

  const notas = (data ?? []) as NotaRow[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Notas rápidas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Apunta ideas, pendientes y recordatorios sueltos.
        </p>
      </div>
      <NotasBoard notas={notas} />
    </div>
  );
}
