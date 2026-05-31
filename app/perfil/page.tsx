import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { PerfilRow } from "@/types/database";
import PerfilForm from "@/components/perfil/PerfilForm";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("perfil").select("*").eq("id", 1).maybeSingle();
  const perfil = (data ?? null) as PerfilRow | null;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tu nombre y foto aparecen en la barra lateral y el encabezado.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
        <PerfilForm
          nombre={perfil?.nombre ?? ""}
          puesto={perfil?.puesto ?? ""}
          fotoUrl={perfil?.foto_url ?? ""}
        />
      </div>
    </div>
  );
}
