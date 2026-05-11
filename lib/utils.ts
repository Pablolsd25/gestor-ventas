/** Formatea un número como moneda MXN sin decimales. */
export const formatMonto = (monto: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(monto);
