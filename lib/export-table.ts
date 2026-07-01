import * as XLSX from "xlsx";

export type TableColumn = { key: string; label: string; width?: string };

export function downloadExcel(
  filename: string,
  columns: TableColumn[],
  rows: Record<string, string>[],
  sheetName = "Datos"
) {
  const header = columns.map((c) => c.label);
  const data = rows.map((row) => columns.map((c) => row[c.key] ?? ""));
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

  ws["!cols"] = columns.map((c) => ({
    wch: c.width ? Math.max(8, Math.round(parseInt(c.width, 10) * 0.25)) : 18,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function printControlTable(opts: {
  title: string;
  subtitle: string;
  columns: TableColumn[];
  rows: Record<string, string>[];
  footer?: string;
}) {
  const { title, subtitle, columns, rows, footer } = opts;
  const date = new Date().toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const colgroup = columns
    .map((c) => `<col${c.width ? ` style="width:${c.width}"` : ""}>`)
    .join("");
  const thead = columns.map((c) => `<th>${c.label}</th>`).join("");
  const tbody = rows
    .map(
      (row, i) =>
        `<tr class="${i % 2 === 1 ? "alt" : ""}">${columns
          .map((c) => `<td>${(row[c.key] ?? "—").replace(/\n/g, "<br>")}</td>`)
          .join("")}</tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      color: #111;
      padding: 18mm 14mm;
      line-height: 1.35;
    }
    .header { margin-bottom: 14px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
    h1 { font-size: 16pt; color: #1e3a5f; margin-bottom: 4px; }
    .subtitle { font-size: 9pt; color: #555; }
    .meta { font-size: 8.5pt; color: #666; margin-top: 6px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 8.5pt;
    }
    th {
      background: #1e3a5f;
      color: #fff;
      text-align: left;
      padding: 6px 5px;
      border: 1px solid #1e3a5f;
      font-weight: 600;
      vertical-align: bottom;
    }
    td {
      padding: 5px;
      border: 1px solid #ccc;
      vertical-align: top;
      word-break: break-word;
    }
    tr.alt td { background: #f5f7fa; }
    .sem-verde { color: #047857; font-weight: 700; }
    .sem-amarillo { color: #b45309; font-weight: 700; }
    .sem-rojo { color: #b91c1c; font-weight: 700; }
    .footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #888;
    }
    @media print {
      body { padding: 10mm; }
      @page { margin: 12mm; size: landscape; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p class="subtitle">${subtitle}</p>
    <p class="meta">Generado: ${date} · ${rows.length} registro${rows.length !== 1 ? "s" : ""}</p>
  </div>
  <table>
    <colgroup>${colgroup}</colgroup>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody || `<tr><td colspan="${columns.length}" style="text-align:center;color:#888;padding:20px">Sin registros</td></tr>`}</tbody>
  </table>
  ${footer ? `<p class="footer">${footer}</p>` : ""}
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Permite ventanas emergentes para generar el PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
