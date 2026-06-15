export type SemaforoColor = "verde" | "amarillo" | "rojo";

const STYLES: Record<SemaforoColor, { box: string; label: string; letter: string }> = {
  verde:    { box: "bg-emerald-500", label: "Verde",    letter: "V" },
  amarillo: { box: "bg-amber-400",   label: "Amarillo", letter: "A" },
  rojo:     { box: "bg-red-500",     label: "Rojo",     letter: "R" },
};

interface Props {
  semaforo: SemaforoColor | null | undefined;
  showLetter?: boolean;
  size?: "sm" | "md";
}

export default function SemaforoBadge({ semaforo, showLetter = true, size = "sm" }: Props) {
  if (!semaforo) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded border border-dashed border-gray-300 dark:border-slate-600 text-gray-300 dark:text-slate-600 ${
          size === "sm" ? "w-5 h-5 text-[10px]" : "w-7 h-7 text-xs"
        }`}
        title="Sin semáforo"
      >
        —
      </span>
    );
  }

  const style = STYLES[semaforo];
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-bold text-white shadow-sm ${style.box} ${
        size === "sm" ? "w-5 h-5 text-[10px]" : "w-7 h-7 text-xs"
      }`}
      title={style.label}
    >
      {showLetter ? style.letter : ""}
    </span>
  );
}

export function tonBarColor(ton: number): string {
  if (ton >= 80) return "bg-emerald-500";
  if (ton >= 40) return "bg-amber-400";
  return "bg-red-500";
}
