/** Formatea un número como moneda MXN sin decimales. */
export const formatMonto = (monto: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(monto);

/** Calcula la comisión de una venta según su tipo y valor. */
export const calcComision = (
  monto: number,
  tipo: "porcentaje" | "monto" | null,
  valor: number | null
): number => {
  if (!tipo || valor == null) return 0;
  return tipo === "porcentaje" ? (monto * valor) / 100 : valor;
};
