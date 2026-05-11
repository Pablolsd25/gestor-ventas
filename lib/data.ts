import { Cliente, Venta, Recordatorio, VentaMensual } from "@/types";

// ─── Clientes (datos reales) ──────────────────────────────────────────────────
export const clientes: Cliente[] = [
  {
    id: "c1",
    sae: "934",
    razonSocial: "Aceros y Perfiles González",
    contactos: [
      {
        nombre: "Eduardo González",
        telefonos: ["713 105 5470"],
        correo: "acerosyperfilez-gonzalez@hotmail.com",
      },
    ],
    ciudad: "Santiago Tianguistengo",
    materiales: ["9. SEMIFLECHA"],
    status: "Venta",
    comentarios:
      "Se tramitará línea de crédito. Consumen de 10 a 30 ton x mes.",
  },
  {
    id: "c2",
    sae: "904",
    razonSocial: "CEDIS R1",
    contactos: [
      {
        nombre: "Paola Neri",
        telefonos: ["414 140 7704"],
        correo: "dtulpetlac@gmail.com",
      },
      {
        nombre: "Maria Elena",
        telefonos: ["414 140 7704"],
        correo: "dtulpetlac@gmail.com",
      },
    ],
    ciudad: "ECATEPEC",
    materiales: ["1. ALAMBRE RECOCIDO"],
    status: "Venta",
  },
  {
    id: "c3",
    sae: "055",
    razonSocial: "Rejimex",
    contactos: [
      {
        nombre: "Vanesa Alvarado",
        telefonos: ["55 5852 0434", "55 7613 1750"],
        correo: "auxadmon.rin@rejimexinternacional.net",
      },
    ],
    ciudad: "San Vicente Chicoloapan",
    materiales: ["4. PULIDO EN ROLLO"],
    status: "Credito",
  },
  {
    id: "c4",
    sae: "924",
    razonSocial: "Cassamar",
    contactos: [
      {
        nombre: "Marco Antonio Gonzalez",
        telefonos: ["55 6792 6607"],
        correo: "facturas@acassamar.com",
      },
    ],
    ciudad: "TEXCOCO",
    materiales: ["1. ALAMBRE RECOCIDO"],
    status: "Venta",
  },
  {
    id: "c5",
    sae: "610",
    razonSocial: "Resortes ind. Tollan",
    contactos: [
      {
        nombre: "Ing. Pedro y Federico Hdz",
        telefonos: ["772 128 6799", "55 2909 7133"],
        correo: "contabilidad@resortestollan.com.mx",
      },
    ],
    ciudad: "HIDALGO",
    materiales: ["4. PULIDO EN ROLLO"],
    comentarios: "Lic. Cesvi Hernandez",
  },
  {
    id: "c6",
    sae: "905",
    razonSocial: "Barachiel",
    contactos: [
      {
        nombre: "Victor Morales",
        telefonos: ["55 5451 4010"],
        correo: "gamepaty@yahoo.com.mx",
      },
    ],
    ciudad: "TEXCOCO",
    materiales: ["1. ALAMBRE RECOCIDO"],
  },
  {
    id: "c7",
    sae: "918",
    razonSocial: "Materiales Silva",
    contactos: [
      {
        nombre: "Diego Silva",
        telefonos: ["55 2584 7930"],
      },
    ],
    ciudad: "ECATEPEC",
    materiales: ["1. ALAMBRE RECOCIDO"],
  },
  {
    id: "c8",
    sae: "927",
    razonSocial: "EP Metal Stamper",
    contactos: [
      {
        nombre: "Carlos Gonzalez",
        telefonos: ["625 103 7076"],
      },
    ],
    ciudad: "CHIHUAHUA",
    materiales: ["5. PULIDO EN BOBINA"],
  },
  {
    id: "c9",
    sae: "921",
    razonSocial: "Aceros Baztan",
    contactos: [
      {
        nombre: "Lic. Carlos Mario Reyes",
        telefonos: ["55 9194 0470"],
      },
    ],
    ciudad: "TLALNEPANTLA",
    materiales: ["9. SEMIFLECHA"],
  },
  {
    id: "c10",
    razonSocial: "Cementos y Fierros Mexedo",
    contactos: [
      {
        nombre: "Victor Morales",
        telefonos: ["55 5451 4338"],
        correo: "cfmexedo@grupogalmedhnos.com",
      },
    ],
    ciudad: "TECAMAC",
    materiales: ["1. ALAMBRE RECOCIDO"],
  },
  {
    id: "c11",
    sae: "57",
    razonSocial: "Distribuciones Industriales Melo",
    contactos: [
      {
        nombre: "",
        telefonos: ["55 9220 0277"],
        correo: "atn_clientes@melo.mx",
      },
    ],
    ciudad: "ECATEPEC",
    materiales: ["2. RECOCIDO INDUSTRIAL"],
  },
  {
    id: "c12",
    sae: "147",
    razonSocial: "Grupo comercial Ramaj",
    contactos: [
      {
        nombre: "",
        telefonos: ["55 5996 7149"],
        correo: "gruporamaj@gmail.com",
      },
    ],
    ciudad: "NICOLAS ROMERO",
    materiales: ["1. ALAMBRE RECOCIDO"],
    status: "Prospecto",
  },
  {
    id: "c13",
    sae: "200",
    razonSocial: "Aceros calibrados de México",
    contactos: [
      {
        nombre: "",
        telefonos: ["55 5617 4515"],
        correo: "acerosjaosa01@prodigy.net",
      },
    ],
    ciudad: "COYOACAN",
    materiales: ["2. RECOCIDO INDUSTRIAL"],
    status: "Prospecto",
  },
  {
    id: "c14",
    razonSocial: "Promare MC",
    contactos: [
      {
        nombre: "Ramiro E Rodriguez M.",
        telefonos: ["477 167 6130"],
        correo: "analuisaabad@yahoo.com.mx",
      },
    ],
    ciudad: "LEON",
    materiales: [],
    status: "Prospecto",
  },
  {
    id: "c15",
    sae: "457",
    razonSocial: "Bodegas Beloso",
    contactos: [
      {
        nombre: "",
        telefonos: ["55 5694 5092"],
        correo: "ipelizondo@bodegasbeloso.com",
      },
    ],
    ciudad: "IZTAPALAPA",
    materiales: ["2. RECOCIDO INDUSTRIAL"],
    status: "Prospecto",
  },
  {
    id: "c16",
    razonSocial: "Grupo cementero La Uno 3.0",
    contactos: [
      {
        nombre: "Edwin",
        telefonos: ["771 106 0368"],
        correo: "materialeslauno@hotmail.com",
      },
    ],
    ciudad: "Pachuca Hgo.",
    materiales: ["1. ALAMBRE RECOCIDO"],
    status: "Venta",
    comentarios: "Le entregamos 15 ton finales de enero.",
  },
];

// ─── Ventas (pedidos / oportunidades) ────────────────────────────────────────
export const ventas: Venta[] = [
  {
    id: "e1",
    clienteId: "c1",
    clienteNombre: "Aceros y Perfiles González",
    descripcion: "Semiflecha mensual – tramitar línea de crédito",
    material: "9. SEMIFLECHA",
    cantidad: 20,
    monto: 280000,
    estado: "en_proceso",
    fechaCreacion: "2024-01-15",
    fechaCierre: "2024-02-28",
    notas: "Consumen entre 10 y 30 ton/mes",
  },
  {
    id: "e2",
    clienteId: "c2",
    clienteNombre: "CEDIS R1",
    descripcion: "Alambre recocido mensual",
    material: "1. ALAMBRE RECOCIDO",
    cantidad: 15,
    monto: 180000,
    estado: "ganada",
    fechaCreacion: "2024-01-10",
    fechaCierre: "2024-01-31",
  },
  {
    id: "e3",
    clienteId: "c3",
    clienteNombre: "Rejimex",
    descripcion: "Pulido en rollo Q1",
    material: "4. PULIDO EN ROLLO",
    cantidad: 8,
    monto: 120000,
    estado: "ganada",
    fechaCreacion: "2024-01-20",
    fechaCierre: "2024-02-15",
  },
  {
    id: "e4",
    clienteId: "c16",
    clienteNombre: "Grupo cementero La Uno 3.0",
    descripcion: "Entrega 15 ton alambre recocido",
    material: "1. ALAMBRE RECOCIDO",
    cantidad: 15,
    monto: 195000,
    estado: "ganada",
    fechaCreacion: "2024-01-25",
    fechaCierre: "2024-01-31",
    notas: "Entregadas finales de enero",
  },
  {
    id: "e5",
    clienteId: "c4",
    clienteNombre: "Cassamar",
    descripcion: "Alambre recocido – pedido mensual",
    material: "1. ALAMBRE RECOCIDO",
    cantidad: 10,
    monto: 130000,
    estado: "en_proceso",
    fechaCreacion: "2024-02-01",
    fechaCierre: "2024-03-15",
  },
  {
    id: "e6",
    clienteId: "c12",
    clienteNombre: "Grupo comercial Ramaj",
    descripcion: "Propuesta inicial alambre recocido",
    material: "1. ALAMBRE RECOCIDO",
    cantidad: 5,
    monto: 65000,
    estado: "propuesta",
    fechaCreacion: "2024-02-10",
    fechaCierre: "2024-04-01",
  },
  {
    id: "e7",
    clienteId: "c9",
    clienteNombre: "Aceros Baztan",
    descripcion: "Semiflecha – cotización inicial",
    material: "9. SEMIFLECHA",
    cantidad: 12,
    monto: 168000,
    estado: "propuesta",
    fechaCreacion: "2024-02-15",
    fechaCierre: "2024-04-30",
  },
];

// ─── Recordatorios ────────────────────────────────────────────────────────────
export const recordatorios: Recordatorio[] = [
  {
    id: "r1",
    titulo: "Tramitar línea de crédito – Aceros González",
    clienteId: "c1",
    clienteNombre: "Aceros y Perfiles González",
    ventaId: "e1",
    fecha: "2024-05-10",
    hora: "10:00",
    prioridad: "alta",
    tipo: "seguimiento",
    completado: false,
  },
  {
    id: "r2",
    titulo: "Enviar propuesta a Grupo Ramaj",
    clienteId: "c12",
    clienteNombre: "Grupo comercial Ramaj",
    ventaId: "e6",
    fecha: "2024-05-11",
    hora: "09:00",
    prioridad: "alta",
    tipo: "email",
    completado: false,
  },
  {
    id: "r3",
    titulo: "Reunión cierre pedido – Cassamar",
    clienteId: "c4",
    clienteNombre: "Cassamar",
    ventaId: "e5",
    fecha: "2024-05-14",
    hora: "15:00",
    prioridad: "media",
    tipo: "reunion",
    completado: false,
  },
  {
    id: "r4",
    titulo: "Llamar a CEDIS R1 – seguimiento",
    clienteId: "c2",
    clienteNombre: "CEDIS R1",
    fecha: "2024-05-16",
    hora: "11:00",
    prioridad: "media",
    tipo: "llamada",
    completado: false,
  },
  {
    id: "r5",
    titulo: "Contactar Promare MC",
    clienteId: "c14",
    clienteNombre: "Promare MC",
    fecha: "2024-05-20",
    hora: "10:00",
    prioridad: "media",
    tipo: "llamada",
    completado: false,
  },
  {
    id: "r6",
    titulo: "Revisar pipeline mensual",
    fecha: "2024-04-30",
    hora: "08:00",
    prioridad: "baja",
    tipo: "otro",
    completado: true,
  },
];

// ─── Datos de resultados ──────────────────────────────────────────────────────
export const ventasMensuales: VentaMensual[] = [
  { mes: "Ene", monto: 375000, cantidad: 38 },
  { mes: "Feb", monto: 195000, cantidad: 15 },
  { mes: "Mar", monto: 280000, cantidad: 27 },
  { mes: "Abr", monto: 130000, cantidad: 10 },
  { mes: "May", monto: 363000, cantidad: 32 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatMonto = (monto: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(monto);

/** Devuelve el primer contacto con nombre, o el primero si ninguno tiene nombre */
export const contactoPrincipal = (cliente: Cliente) =>
  cliente.contactos.find((c) => c.nombre) ?? cliente.contactos[0];
