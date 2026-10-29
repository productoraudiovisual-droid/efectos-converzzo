// Prueba automática de los efectos gráficos en varios formatos (vertical, horizontal, cuadrado, retrato).
// Uso: node probar.mjs <video_persona> <carpeta_salida> [--formatos vertical,horizontal,cuadrado,retrato] [--efectos precio-pop,ficha]
// Por cada formato saca una foto de cada efecto y otra del video sin efectos, compara las dos para saber qué pixeles
// pintó el efecto y revisa: que no tape la cara, que no quede cortado contra el borde y que se vea (no esté vacío).
// Deja una hoja de contacto por formato (hoja_<formato>.jpg) y un reporte (reporte.json); imprime los problemas.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MOTOR = path.dirname(fileURLToPath(import.meta.url));
const [video, carpeta, ...resto] = process.argv.slice(2);
if (!video || !carpeta) { console.log("Uso: node probar.mjs <video_persona> <carpeta_salida> [--formatos ...] [--efectos ...]"); process.exit(1); }
const opcion = (k, d) => { const i = resto.indexOf(k); return i >= 0 ? resto[i + 1].split(",") : d; };
const FORMATOS = opcion("--formatos", ["vertical", "horizontal", "cuadrado", "retrato"]);
const PY = fs.existsSync(path.join(MOTOR, ".venv/bin/python")) ? path.join(MOTOR, ".venv/bin/python") : path.join(MOTOR, ".venv/Scripts/python.exe");
fs.mkdirSync(carpeta, { recursive: true });
const abs = path.resolve(carpeta);

// efectos gráficos con datos de ejemplo; "en" es relativo al inicio de la ventana de cada efecto
const DEMOS = {
  "precio-pop": { producto: "Sérum vitamina C", antes: "$89.900", ahora: "$59.900", nota: "Solo hoy" },
  "ficha": { titulo: "Chaqueta denim", detalles: ["Tallas S a XL", "100% algodón", "Azul clásico"], precio: "$149.900", punto: { x: 0.55, y: 0.75 } },
  "tallas-colores": { titulo: "Camiseta básica", tallas: ["S", "M", "L", "XL"], agotadas: ["XL"], colores: ["negro", "blanco", "beige"] },
  "grafica-datos": { tipo: "barras", titulo: "Seguidores por mes", sufijo: "K", datos: [{ etiqueta: "Ene", valor: 120 }, { etiqueta: "Feb", valor: 210 }, { etiqueta: "Mar", valor: 300 }, { etiqueta: "Abr", valor: 410 }] },
  "paso-a-paso": { titulo: "Cómo pedir", pasos: [{ texto: "Escríbenos", en: 0.3 }, { texto: "Elige tu talla", en: 0.8 }, { texto: "Recibe en casa", en: 1.3 }] },
  "comparativo": { izquierda: { titulo: "Otros", puntos: ["Envío en 8 días", "Sin garantía"] }, derecha: { titulo: "Nosotros", puntos: ["Envío en 24 h", "Garantía de 1 año"] }, ganador: "derecha" },
  "cta-whatsapp": { texto: "Pídelo por WhatsApp", numero: "300 123 4567" },
  "ubicacion": { nombre: "Café La Esquina", direccion: "Cra. 7 #23-45, Pereira", horario: "Abierto hoy · 7 a.m. – 8 p.m." },
  "tier-list": { titulo: "TIER LIST · IA", items: [{ texto: "Editor", tier: "S", en: 0.3 }, { texto: "Diseño", tier: "A", en: 0.7 }, { texto: "Notas", tier: "B", en: 1.1 }] },
  "mockup-interfaz": { tipo: "chat", nombre: "Laura", mensajes: [{ de: "otro", texto: "Hola, ¿tienen envíos?", en: 0.3 }, { de: "yo", texto: "¡Sí! A todo el país", en: 0.9 }] },
  "mockup-interfaz#notificacion": { tipo: "notificacion", notificaciones: [{ app: "Tienda", titulo: "Nueva venta", texto: "$59.900 · Sérum", en: 0.3 }, { app: "Tienda", titulo: "Nueva venta", texto: "$89.900 · Kit", en: 0.8 }] },
  "mockup-interfaz#prompt": { tipo: "prompt", prompt: "Crea un guion para un reel de 30 segundos" },
  "widgets-vidrio": { widgets: [{ titulo: "Ventas hoy", valor: "$2,4M", detalle: "+18% vs ayer" }, { titulo: "Meta mensual", progreso: 72 }, { titulo: "Esta semana", datos: [3, 5, 4, 7, 6, 9] }] },
  "ingredientes": { titulo: "Bowl", puntos: [{ texto: "Granola", x: 0.4, y: 0.75, en: 0.2 }, { texto: "Fresas", x: 0.6, y: 0.7, en: 0.5 }] },
  "antes-despues": { antes_en: 0.5, despues_en: 1.5 },
};
const lista = opcion("--efectos", Object.keys(DEMOS)).filter((e) => DEMOS[e]);
const VENTANA = 3, FOTO = 2.2;   // cada efecto en su ventana de 3 s; la foto, ya entrado

// video de prueba largo: el clip en bucle
const largo = path.join(abs, "_largo.mp4");
const seg = lista.length * VENTANA + 1;
execFileSync("ffmpeg", ["-y", "-v", "error", "-stream_loop", "-1", "-i", path.resolve(video), "-t", String(seg), "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-an", largo]);

const plan = (formato, conEfectos) => ({
  formato, sonido: false,
  capas: conEfectos ? lista.map((e, k) => {
    const d = k * VENTANA, base = e.split("#")[0];
    const op = JSON.parse(JSON.stringify(DEMOS[e]), (key, v) => (key === "en" || key === "antes_en" || key === "despues_en") && typeof v === "number" ? v + d : v);
    return { efecto: base, desde: d + 0.1, hasta: d + VENTANA - 0.1, ...op };
  }) : [],
});
const tiempos = lista.map((_, k) => +(k * VENTANA + FOTO).toFixed(2));
const reporte = {};
for (const formato of FORMATOS) {
  const dir = path.join(abs, formato);
  fs.mkdirSync(dir, { recursive: true });
  for (const [nombre, con] of [["base", false], ["fx", true]]) {
    const pj = path.join(dir, `${nombre}.json`);
    fs.writeFileSync(pj, JSON.stringify(plan(formato, con)));
    console.log(`${formato}: fotos ${nombre === "base" ? "sin efectos" : "con efectos"}...`);
    execFileSync("node", [path.join(MOTOR, "render.mjs"), largo, pj, path.join(dir, `${nombre}.png`), "--still", tiempos.join(",")],
      { cwd: MOTOR, stdio: ["ignore", "ignore", "inherit"], env: { ...process.env, EFECTOS_PLAN_FINAL: path.join(dir, `plan_${nombre}.json`) } });
  }
  // análisis en Python: diferencia con la base, cara y bordes
  const caras = JSON.parse(fs.readFileSync(path.join(dir, "plan_fx.json"), "utf8")).caras ?? [];
  const casos = lista.map((e, k) => ({ efecto: e, t: tiempos[k], fx: path.join(dir, `fx_${tiempos[k]}.png`), base: path.join(dir, `base_${tiempos[k]}.png`) }));
  fs.writeFileSync(path.join(dir, "casos.json"), JSON.stringify({ casos, caras }));
  const salida = execFileSync(PY, [path.join(MOTOR, "scripts/revisar.py"), path.join(dir, "casos.json"), path.join(abs, `hoja_${formato}.jpg`)], { encoding: "utf8" });
  reporte[formato] = JSON.parse(salida);
}
fs.writeFileSync(path.join(abs, "reporte.json"), JSON.stringify(reporte, null, 2));
let problemas = 0;
for (const [formato, filas] of Object.entries(reporte)) for (const r of filas) if (r.problemas.length) { problemas++; console.log(`✗ ${formato.padEnd(10)} ${r.efecto.padEnd(30)} ${r.problemas.join("; ")}`); }
console.log(problemas ? `${problemas} problemas. Hojas de contacto en ${abs}` : `Todo bien. Hojas de contacto en ${abs}`);
fs.rmSync(largo, { force: true });
