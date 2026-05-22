import { createSupabaseServerClient } from "@/lib/supabase-server";
import MaterialList from "./MaterialList";

export default async function MaterialesPage() {
  const supabase = await createSupabaseServerClient() as any;

  const { data } = await supabase.from("materiales").select("*").order("id");

  const materiales = (data ?? []) as Array<{ id: number; nombre: string }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Materiales</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Gestiona los materiales del catálogo.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="p-5">
          <MaterialList materiales={materiales} />
        </div>
      </div>
    </div>
  );
}
