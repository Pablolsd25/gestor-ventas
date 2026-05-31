/**
 * Avatar del vendedor: muestra la foto si existe, si no las iniciales del nombre.
 * Componente presentacional puro (sirve en server y client).
 */
export default function Avatar({
  nombre,
  fotoUrl,
  className = "w-8 h-8",
  textClass = "text-xs",
}: {
  nombre: string;
  fotoUrl?: string | null;
  className?: string;
  textClass?: string;
}) {
  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "V";

  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt={nombre}
        className={`${className} rounded-full object-cover shadow-sm shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} ${textClass} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-sm shrink-0`}
    >
      {iniciales}
    </div>
  );
}
