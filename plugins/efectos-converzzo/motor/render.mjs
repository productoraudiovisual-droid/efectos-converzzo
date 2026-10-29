// Aplica un plan de efectos (uno o varios a la vez) sobre un video, en un solo render.
// Uso: node render.mjs <video> <plan.json> <salida.mp4> [--still 1.5,3] [--borrador]
//  - plan.json: { "capas": [ { "efecto": "zoom-in", "desde": 2.1, "hasta": 3.0 }, ... ], "estilo": {...}, "sonido": true }
//  - Detecta la cara y recorta a la persona automáticamente cuando un efecto lo necesita.
//  - Con --still solo saca fotos de control (rápido) en esos segundos; solo calcula el recorte de esos cuadros.
//  - Con --borrador (o "calidad": "borrador" en el plan) sale a 720p para revisar rápido; el final, en calidad completa.
//  - Guarda en caché (motor/.cache) la transcripción, las caras y los recortes: repetir un render con cambios es mucho más rápido.
//  - El video sale en el formato del original (o vertical/horizontal si el plan lo pide) con el audio a -14 LUFS.
import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EFECTOS_TIEMPO, filtro, mapear, piezas, remapearPlan } from "./tiempo.mjs";

const MOTOR = path.dirname(fileURLToPath(import.meta.url));
const [video, planFile, salida, ...resto] = process.argv.slice(2);
if (!video || !planFile || !salida) {
  console.log("Uso: node render.mjs <video> <plan.json> <salida.mp4> [--still 1.5,3]");
  process.exit(1);
}
const iStill = resto.indexOf("--still");
let still = iStill >= 0 ? resto[iStill + 1].split(",").map(Number) : null;
const PY = fs.existsSync(path.join(MOTOR, ".venv/bin/python")) ? path.join(MOTOR, ".venv/bin/python") : path.join(MOTOR, ".venv/Scripts/python.exe");
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
// ¿están PyTorch y Transformers? (SAM 2.1 y profundidad); si no, se usan los métodos sin IA pesada
let haySam = null;
const tieneSam = () => (haySam ??= spawnSync(PY, ["-c", "import torch, transformers"], { stdio: "ignore" }).status === 0);
const run = (cmd, args, env) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"], cwd: MOTOR, shell: process.platform === "win32", maxBuffer: 1 << 26, env: env ? { ...process.env, ...env } : process.env }).toString();

// caché: lo que ya se calculó para el mismo video (transcripción, caras, recortes) se reutiliza
const CACHE = path.join(MOTOR, ".cache");
const VERSION_CACHE = "1";                       // subir si cambia cómo se calcula algo
const huella = (archivo) => {                    // rápida: tamaño + tres trozos del archivo
  const st = fs.statSync(archivo), h = crypto.createHash("md5"), B = 4 << 20, buf = Buffer.alloc(B), fd = fs.openSync(archivo, "r");
  h.update(String(st.size));
  for (const pos of [0, Math.max(0, Math.floor(st.size / 2 - B / 2)), Math.max(0, st.size - B)]) h.update(buf.subarray(0, fs.readSync(fd, buf, 0, B, pos)));
  fs.closeSync(fd);
  return h.digest("hex");
};
const clave = (...partes) => crypto.createHash("md5").update([VERSION_CACHE, ...partes].join("|")).digest("hex").slice(0, 24);
const usar = (dir) => { fs.mkdirSync(dir, { recursive: true }); const t = new Date(); fs.utimesSync(dir, t, t); return dir; };
const enlazar = (de, a) => { try { fs.linkSync(de, a); } catch { fs.copyFileSync(de, a); } };
const limpiarCache = () => {                     // deja como máximo ~4 GB y nada de más de 14 días
  if (!fs.existsSync(CACHE)) return;
  const tam = (d) => fs.readdirSync(d).reduce((n, x) => n + fs.statSync(path.join(d, x)).size, 0);
  const items = fs.readdirSync(CACHE).map((x) => ({ d: path.join(CACHE, x), t: fs.statSync(path.join(CACHE, x)).mtimeMs }))
    .map((x) => ({ ...x, n: fs.statSync(x.d).isDirectory() ? tam(x.d) : fs.statSync(x.d).size })).sort((a, b) => b.t - a.t);
  let total = 0;
  for (const x of items) {
    total += x.n;
    if (total > 4e9 || Date.now() - x.t > 14 * 864e5) fs.rmSync(x.d, { recursive: true, force: true });
  }
};
const NECESITAN_RECORTE = ["dolly-zoom", "color-pop", "fondo-borroso", "cambiar-fondo", "collage-halftone", "pixelar", "foco", "contorno-neon", "sticker", "eco", "quitar-fondo"];
const NECESITAN_PISTA = ["lupa", "etiqueta-sigue", "reencuadre"];     // reencuadre solo cuando sigue a un objeto
const CONOCIDOS = [...EFECTOS_TIEMPO, "cortar-silencios", "subtitulos", "limpiar-voz", "musica", "zoom-in", "zoom-suave", "zoom-out", "sacudida", "dolly-zoom", "reencuadre", "barrido", "zoom-transicion", "look", "color-auto", "cambiar-fondo", "color-pop", "fondo-borroso", "grano", "flash", "glitch", "precio-pop", "antes-despues", "cta-whatsapp", "paso-a-paso", "comparativo", "ficha", "ubicacion", "gancho", "cartel-nombre", "dato", "ingredientes", "tallas-colores", "grafica-datos", "logo-sting", "tier-list", "mockup-interfaz", "widgets-vidrio", "collage-halftone", "carrusel-video", "color-referencia", "look-pelicula", "efectos-sonido", "pixelar", "foco", "contorno-neon", "sticker", "eco", "lupa", "etiqueta-sigue", "reencuadre-objeto", "pantalla-verde", "quitar-fondo", "estabilizar", "zoom-al-ritmo", "parallax-3d"];

// 1. datos del video
const datos = (archivo) => {
  const pr = JSON.parse(run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,r_frame_rate,width,height:stream_side_data=rotation:format=duration", "-of", "json", archivo]));
  const st = pr.streams.find((x) => x.codec_type === "video");
  const [a, b] = st.r_frame_rate.split("/").map(Number);
  const fps = Math.min(60, Math.round((a / (b || 1)) * 1000) / 1000);
  const seg = parseFloat(pr.format.duration);
  const girado = Math.abs(st.side_data_list?.[0]?.rotation ?? 0) === 90;
  const [ancho, alto] = girado ? [st.height, st.width] : [st.width, st.height];
  return { fps, seg, ancho, alto, audio: pr.streams.some((x) => x.codec_type === "audio") };
};
let info = datos(path.resolve(video));

let plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
// reencuadre-objeto = reencuadre que sigue a un objeto en vez de la cara
for (const c of plan.capas ?? []) if (c.efecto === "reencuadre-objeto") { c.efecto = "reencuadre"; c._objeto = true; }
// pantalla-verde = cambiar-fondo con clave de color (sin fondo nuevo: queda transparente, como quitar-fondo)
for (const c of plan.capas ?? []) if (c.efecto === "pantalla-verde") { c.efecto = c.fondo_archivo || c.color ? "cambiar-fondo" : "quitar-fondo"; c.sujeto = "verde"; }
// quitar-fondo sin color de fondo: el video sale con transparencia (.mov ProRes 4444 o .webm)
const ALFA = (plan.capas ?? []).some((c) => c.efecto === "quitar-fondo" && typeof c.fondo !== "string");
// formato de salida: "original" (respeta la proporción del video; por defecto), "vertical" (1080x1920), "horizontal" (1920x1080),
// "cuadrado" (1080x1080) o "retrato" (1080x1350, el 4:5 del feed de Instagram)
const formato = String(plan.formato ?? ((plan.capas ?? []).some((c) => c.efecto === "reencuadre") ? "vertical" : "original"));
const par = (n) => Math.round(n / 2) * 2;
const FIJOS = { vertical: { w: 1080, h: 1920 }, horizontal: { w: 1920, h: 1080 }, cuadrado: { w: 1080, h: 1080 }, retrato: { w: 1080, h: 1350 } };
const salidaDe = (a, b) => FIJOS[formato] ? FIJOS[formato]
  : a >= b ? { w: 1920, h: par((1920 * b) / a) } : { w: 1080, h: par((1080 * b) / a) };
const salidaTam = salidaDe(info.ancho, info.alto);
process.env.SALIDA = `${salidaTam.w}x${salidaTam.h}`;
// borrador: se renderiza a 720p (misma composición, escalada) y el recorte se calcula a ese tamaño
const BORRADOR = resto.includes("--borrador") || plan.calidad === "borrador";
const ESCALA = BORRADOR ? Math.min(1, 720 / Math.min(salidaTam.w, salidaTam.h)) : 1;
const tamRecorte = `${par(salidaTam.w * ESCALA)}x${par(salidaTam.h * ESCALA)}`;
console.log(`Formato de salida: ${salidaTam.w}x${salidaTam.h}${BORRADOR ? ` (borrador a ${tamRecorte})` : ""}`);
for (const c of plan.capas ?? []) {
  if (!CONOCIDOS.includes(c.efecto)) { console.error(`Efecto desconocido: ${c.efecto}. Disponibles: ${CONOCIDOS.join(", ")}`); process.exit(1); }
  if (!(c.hasta > c.desde)) { console.error(`La capa ${c.efecto} necesita "desde" menor que "hasta".`); process.exit(1); }
}
if ((plan.capas ?? []).some((c) => c.efecto === "reencuadre") && (plan.capas ?? []).some((c) => c.efecto === "dolly-zoom"))
  console.warn("Aviso: dolly-zoom no se combina con reencuadre en el mismo tramo; úsalos en momentos distintos.");

// 2. copia temporal dentro de public/
const id = "_in_" + Date.now();
const dirIn = path.join(MOTOR, "public", id);
fs.mkdirSync(dirIn, { recursive: true });

try {
  let origen = path.resolve(video);
  const capa = (e) => (plan.capas ?? []).find((c) => c.efecto === e);

  // limpiar-voz: reduce ruido de fondo, quita retumbe y da presencia a la voz (todo el video)
  const lv = capa("limpiar-voz");
  if (lv && info.audio) {
    const nr = { suave: 8, media: 14, fuerte: 22 }[lv.intensidad] ?? 14;
    console.log("Limpiando la voz...");
    const limpio = path.join(dirIn, "limpio.mp4");
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", origen, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy",
      "-af", `highpass=f=80,afftdn=nr=${nr}:nf=-42:tn=1,deesser=i=0.35,acompressor=threshold=-20dB:ratio=3:attack=10:release=160:makeup=2,equalizer=f=3500:t=q:w=1.2:g=2`,
      "-c:a", "aac", "-b:a", "256k", limpio]);
    origen = limpio;
  }

  // estabilizar: quita el temblor de cámara en mano (antes de todo lo demás)
  const es = capa("estabilizar");
  if (es) {
    const fz = { suave: 0.6, media: 1, fuerte: 2 }[es.fuerza] ?? Number(es.fuerza ?? 1);
    console.log("Estabilizando...");
    const est = path.join(dirIn, "estable.mp4");
    console.log(run(PY, [path.join(MOTOR, "scripts/estabilizar.py"), origen, est, String(fz), String(es.desde), String(es.hasta)]).trim());
    origen = est;
  }

  // color-referencia: copia el color de una imagen de referencia al video (LUT 3D aplicada antes de todo)
  const cr = capa("color-referencia");
  if (cr && typeof cr.referencia_archivo === "string") {
    const ref = path.resolve(path.dirname(path.resolve(planFile)), cr.referencia_archivo);
    if (!fs.existsSync(ref)) { console.error(`No encuentro la referencia ${cr.referencia_archivo}.`); process.exit(1); }
    const lut = path.join(dirIn, "referencia.cube");
    console.log(run(PY, [path.join(MOTOR, "scripts/lut_referencia.py"), origen, ref, lut, String(cr.intensidad ?? 0.75)]).trim());
    const conColor = path.join(dirIn, "color.mp4");
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", origen, "-vf", `lut3d=${lut.replace(/\\/g, "/").replace(/:/g, "\\:")}`, "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-c:a", "copy", conColor]);
    origen = conColor;
  }

  // look-pelicula: color de cine, halo en las luces, grano y viñeta con ffmpeg (mucho más rápido que en el navegador)
  const lp = capa("look-pelicula");
  if (lp) {
    const k = Math.max(0, Math.min(1, Number(lp.intensidad ?? 1)));
    const en = `enable='between(t,${lp.desde},${lp.hasta})'`;
    const q = (x) => x.toFixed(3);
    const vf = [
      `format=yuv420p,split=2[a0][b]`,
      `[a0]format=gbrp[a]`,
      `[b]lutyuv=y='if(gt(val,205),val,16)':u=128:v=128,format=gbrp,gblur=sigma=22,colorchannelmixer=rr=1:gg=0.4:bb=0.18[h]`,
      `[a][h]blend=all_mode=screen:all_opacity=${q(0.38 * k)}:${en}[m]`,
      `[m]curves=r='0/${q(0.025 * k)} 0.5/${q(0.5 - 0.02 * k)} 1/${q(1 - 0.02 * k)}':g='0/${q(0.035 * k)} 0.5/0.5 1/${q(1 - 0.03 * k)}':b='0/${q(0.055 * k)} 0.5/${q(0.5 - 0.03 * k)} 1/${q(1 - 0.09 * k)}':${en}`,
      `eq=contrast=${q(1 + 0.1 * k)}:saturation=${q(1 - 0.12 * k)}:${en}`,
      `noise=alls=${Math.round(9 * k)}:allf=t:${en}`,
      `vignette=angle=${q(0.55 * k + 0.05)}:${en}`,
      `format=yuv420p`,
    ].join(";").replace(/;(?=curves|eq|noise|vignette|format)/g, ",");
    const peli = path.join(dirIn, "pelicula.mp4");
    console.log("Aplicando look de película...");
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", origen, "-filter_complex", vf, "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-c:a", "copy", peli]);
    origen = peli;
  }

  // transcripción del original (una sola vez): la usan cortar-silencios y los subtítulos
  const cs = capa("cortar-silencios");
  const subsSin = (plan.capas ?? []).filter((c) => c.efecto === "subtitulos" && !Array.isArray(c.palabras));
  let palabras = null;
  if ((cs || subsSin.length) && info.audio) {
    console.log("Transcribiendo...");
    const idioma = String((subsSin[0] ?? cs).idioma ?? "es");
    const tj = path.join(usar(CACHE), `palabras_${clave(huella(origen), idioma)}.json`);
    if (!fs.existsSync(tj)) run(PY, [path.join(MOTOR, "scripts/transcribir.py"), origen, tj + ".tmp", idioma]), fs.renameSync(tj + ".tmp", tj);
    else console.log("transcripción: en caché");
    palabras = JSON.parse(fs.readFileSync(tj, "utf8"));
    subsSin.forEach((c) => { c.palabras = palabras; });   // en tiempo del original: se ajustan solas si cambia la duración
  }

  // cortar-silencios: quita las pausas largas entre palabras (y el silencio del inicio y del final)
  let cortes = [];
  if (cs && palabras && palabras.length) {
    const umbral = Math.max(0.2, Number(cs.umbral ?? 0.45)), margen = Number(cs.margen ?? 0.12);
    const huecos = [[0, palabras[0].start], ...palabras.slice(1).map((w, i) => [palabras[i].end, w.start]), [palabras[palabras.length - 1].end, info.seg]];
    huecos.forEach(([a, b], i) => {
      if (b - a < umbral) return;
      const ca = i === 0 ? 0 : a + margen, cb = i === huecos.length - 1 ? info.seg : b - margen;
      if (cb - ca >= 0.15) cortes.push([ca, cb]);
    });
    console.log(`cortar-silencios: ${cortes.length} pausas (${cortes.reduce((n, [a, b]) => n + b - a, 0).toFixed(1)} s menos)`);
  } else if (cs && info.audio) {
    // sin palabras (video sin voz clara): por nivel de audio
    const umbral = Math.max(0.2, Number(cs.umbral ?? 0.45)), margen = Number(cs.margen ?? 0.12), ruido = Number(cs.ruido_db ?? -38);
    const r = spawnSync("ffmpeg", ["-hide_banner", "-i", origen, "-map", "0:a:0", "-af", `silencedetect=noise=${ruido}dB:d=${umbral}`, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
    const ini = [...r.stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
    const fin = [...r.stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
    ini.forEach((a, i) => {
      const b = fin[i] ?? info.seg;
      const ca = a <= 0.05 ? 0 : a + margen, cb = b >= info.seg - 0.05 ? info.seg : b - margen;
      if (cb - ca >= 0.15) cortes.push([ca, cb]);
    });
    console.log(`cortar-silencios: ${cortes.length} pausas (${cortes.reduce((n, [a, b]) => n + b - a, 0).toFixed(1)} s menos)`);
  }

  // efectos de tiempo: se arma primero un video nuevo con las velocidades cambiadas
  const pz = piezas(plan.capas ?? [], info.seg, cortes);
  if (pz.hayTiempo) {
    console.log("Ajustando tiempos (silencios, cámara lenta, congelar, rebobinar)...");
    const ft = filtro(pz.piezas, Math.round(info.fps), info.audio, origen);
    run("ffmpeg", ["-y", "-loglevel", "error", ...ft.entradas, "-filter_complex", ft.grafo, "-map", "[vout]", "-map", "[aout]",
      "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-c:a", "aac", "-b:a", "256k", path.join(dirIn, "video.mp4")]);
    plan = remapearPlan(plan, pz.piezas);
    // las fotos de control también se piden en tiempo del video original
    if (still) for (let i = 0; i < still.length; i++) {
      const pausa = pz.piezas.find((p) => p.tipo === "congelar" && Math.abs(p.a - still[i]) < 0.05);
      still[i] = Math.round((pausa ? pausa.inicio + Math.min(0.9, pausa.d / 2) : mapear(still[i], pz.piezas)) * 100) / 100;
    }
    info = datos(path.join(dirIn, "video.mp4"));
  } else {
    fs.copyFileSync(origen, path.join(dirIn, "video.mp4"));
  }
  const fuente = path.join(dirIn, "video.mp4");
  // archivos que traen algunas capas (por ejemplo antes_archivo / despues_archivo): se copian junto al video
  (plan.capas ?? []).forEach((c, i) => {
    for (const k of Object.keys(c)) {
      if (k.endsWith("_archivos") && Array.isArray(c[k])) {   // listas de archivos (por ejemplo imagenes_archivos del carrusel)
        c[k] = c[k].map((rel, j) => {
          const o = path.resolve(path.dirname(path.resolve(planFile)), String(rel));
          if (!fs.existsSync(o)) { console.error(`No encuentro el archivo ${rel} (${k} de ${c.efecto}).`); process.exit(1); }
          const nom = `capa${i}_${k}_${j}${path.extname(o).toLowerCase()}`;
          fs.copyFileSync(o, path.join(dirIn, nom));
          return `${id}/${nom}`;
        });
        continue;
      }
      if (!k.endsWith("_archivo") || typeof c[k] !== "string" || k === "referencia_archivo") continue;
      const origen = path.resolve(path.dirname(path.resolve(planFile)), c[k]);
      if (!fs.existsSync(origen)) { console.error(`No encuentro el archivo ${c[k]} (${k} de ${c.efecto}).`); process.exit(1); }
      const nombre = `capa${i}_${k}${path.extname(origen).toLowerCase()}`;
      fs.copyFileSync(origen, path.join(dirIn, nombre));
      c[k] = `${id}/${nombre}`;
    }
  });
  const hFuente = huella(fuente);
  if (!plan.caras) {
    const carasJson = path.join(usar(CACHE), `caras_${clave(hFuente, process.env.SALIDA)}.json`);
    if (!fs.existsSync(carasJson)) run(PY, [path.join(MOTOR, "scripts/caras.py"), fuente, carasJson + ".tmp"]), fs.renameSync(carasJson + ".tmp", carasJson);
    else console.log("caras: en caché");
    plan.caras = JSON.parse(fs.readFileSync(carasJson, "utf8"));
  }
  // parallax-3d: capas por profundidad de un cuadro del video (en "en", por defecto "desde") o de una imagen
  (plan.capas ?? []).forEach((c, i) => {
    if (c.efecto !== "parallax-3d") return;
    if (!tieneSam()) { console.error("parallax-3d necesita PyTorch y Transformers (se instalan con el motor)."); process.exit(1); }
    const img = typeof c.imagen_archivo === "string" ? path.join(dirIn, c.imagen_archivo.replace(`${id}/`, "")) : fuente;
    const seg = typeof c.imagen_archivo === "string" ? 0 : Number(c.en ?? c.desde);
    const cache = usar(path.join(CACHE, "parallax_" + clave(typeof c.imagen_archivo === "string" ? huella(img) : hFuente, seg, process.env.SALIDA, c.capas ?? 3)));
    if (!fs.existsSync(path.join(cache, "capas.json")))
      console.log(run(PY, [path.join(MOTOR, "scripts/profundidad.py"), img, String(seg), cache, String(c.capas ?? 3)]).trim());
    else console.log("parallax: en caché");
    const dir = path.join(dirIn, `parallax_${i}`);
    fs.mkdirSync(dir, { recursive: true });
    for (const x of fs.readdirSync(cache)) enlazar(path.join(cache, x), path.join(dir, x));
    c._capas = { ruta: `${id}/parallax_${i}`, capas: JSON.parse(fs.readFileSync(path.join(cache, "capas.json"), "utf8")).capas };
  });
  // zoom-al-ritmo: golpes de la música (si hay /musica) o del audio del video
  (plan.capas ?? []).forEach((c) => {
    if (c.efecto !== "zoom-al-ritmo") return;
    const mu = (plan.capas ?? []).find((x) => x.efecto === "musica" && typeof x.musica_archivo === "string");
    const src = mu ? path.join(MOTOR, "public", mu.musica_archivo) : fuente;
    const r = JSON.parse(run(PY, [path.join(MOTOR, "scripts/ritmo.py"), src, String(c.desde), String(c.hasta), String(mu ? mu.desde : 0)]).trim());
    c._golpes = r.golpes;
    console.log(`zoom-al-ritmo: ${r.bpm} BPM, ${r.golpes.length} golpes`);
  });
  // color-auto: mide el color del tramo y guarda la corrección
  (plan.capas ?? []).forEach((c) => {
    if (c.efecto !== "color-auto" || c._ajuste) return;
    c._ajuste = JSON.parse(run(PY, [path.join(MOTOR, "scripts/color.py"), fuente, String(c.desde), String(c.hasta)]).trim().split("\n").pop());
    console.log("color-auto:", JSON.stringify(c._ajuste));
  });
  // recortes: persona (RVM), papel (collage) u objeto (SAM 2.1 con un punto o una caja; si no hay, U2-Net/IS-Net)
  const objetosDe = (c) => {
    const lista = Array.isArray(c.objetos) ? c.objetos : c.punto || c.caja ? [{ punto: c.punto, caja: c.caja, negativos: c.negativos }] : [];
    return lista.map((o) => Object.fromEntries(Object.entries(o).filter(([, v]) => Array.isArray(v)))).filter((o) => o.punto || o.caja);
  };
  const nom = (f) => `${String(f).padStart(6, "0")}.webp`;
  // calcula (o toma de la caché) la carpeta de cuadros recortados y la enlaza en public/; devuelve la ruta para el plan
  const recortar = (c, i, tipo, objetos, soloFotos, extra = {}) => {
    const usaSam = tipo === "objeto" && objetos.length && tieneSam();
    const ref = Number(c.referencia ?? (c.desde + c.hasta) / 2);
    const cache = usar(path.join(CACHE, "recorte_" + clave(hFuente, c.desde, c.hasta, info.fps, tipo, tamRecorte, usaSam ? JSON.stringify(objetos) + ref + JSON.stringify(extra) : JSON.stringify(extra))));
    const completo = path.join(cache, "completo");
    const f0 = Math.round(c.desde * info.fps), f1 = f0 + Math.max(1, Math.round((c.hasta - c.desde) * info.fps)) + 1;
    if (!fs.existsSync(completo)) {
      // en fotos de control solo hacen falta los cuadros de esas fotos
      // eco también necesita los cuadros anteriores de cada foto
      const pedidos = soloFotos ? still.map((s) => Math.round(s * info.fps)).flatMap((f) => c.efecto !== "eco" ? [f]
        : Array.from({ length: Math.round(Number(c.copias ?? 4)) + 1 }, (_, j) => f - j * Math.max(1, Math.round(Number(c.separacion ?? 3))))) : [];
      const faltan = soloFotos ? [...new Set(pedidos)].filter((f) => f >= f0 && f <= f1 && !fs.existsSync(path.join(cache, nom(f)))) : null;
      if (!faltan || faltan.length) {
        if (usaSam) {
          const oj = path.join(dirIn, `objetos_${i}.json`);
          fs.writeFileSync(oj, JSON.stringify(objetos));
          console.log(run(PY, [path.join(MOTOR, "scripts/sam.py"), fuente, String(c.desde), String(c.hasta), String(info.fps), String(ref), oj, cache],
            { SALIDA: tamRecorte, SAM_CUADROS: faltan ? faltan.join(",") : "", SAM_CACHE: path.join(CACHE, `sam_${clave(hFuente, JSON.stringify(objetos), ref, tamRecorte)}.npz`), ...extra }).trim());
        } else {
          if (tipo === "objeto" && objetos.length) console.log("Aviso: SAM 2.1 no está instalado; uso el recorte automático de objeto.");
          run(PY, [path.join(MOTOR, "scripts/recorte.py"), fuente, String(c.desde), String(c.hasta), String(info.fps), cache, ...(tipo === "persona" ? [] : [tipo])],
            { SALIDA: tamRecorte, RECORTE_CUADROS: faltan ? faltan.join(",") : "", ...extra });
        }
        if (!faltan) fs.writeFileSync(completo, "");
      } else console.log("recorte: en caché");
    } else console.log("recorte: en caché");
    const dir = path.join(dirIn, `recorte_${i}`);
    fs.mkdirSync(dir, { recursive: true });
    for (const x of fs.readdirSync(cache)) if (x.endsWith(".webp")) enlazar(path.join(cache, x), path.join(dir, x));
    const pj = path.join(cache, "pista.json");
    return { ruta: `${id}/recorte_${i}`, pista: fs.existsSync(pj) ? JSON.parse(fs.readFileSync(pj, "utf8")) : null, cache };
  };
  (plan.capas ?? []).forEach((c, i) => {
    if (!NECESITAN_RECORTE.includes(c.efecto)) return;
    const objs = objetosDe(c);
    const tipo = c.efecto === "collage-halftone" ? "collage" : c.sujeto === "verde" ? "verde" : c.sujeto === "objeto" || c.efecto === "pixelar" || (objs.length && c.sujeto !== "persona") ? "objeto" : "persona";
    if (c.efecto === "pixelar" && !(objs.length && tieneSam())) {
      // sin SAM (o sin punto/caja) no hay seguimiento: se tapa la caja fija
      if (!Array.isArray(c.caja)) { console.error("pixelar necesita \"punto\" o \"caja\" sobre lo que se quiere tapar."); process.exit(1); }
      console.log("Aviso: pixelar sin SAM 2.1: tapo una caja fija (no sigue el movimiento).");
      return;
    }
    const extra = c.efecto === "pixelar" ? { SAM_SALIDA: `${c.estilo === "desenfoque" ? "desenfocar" : "pixelar"}:${Number(c.tamano ?? (c.estilo === "desenfoque" ? 30 : 24))}`, SAM_FORMA: c.forma === "caja" ? "caja" : "mascara" } : {};
    if (tipo === "verde" && typeof c.color_clave === "string") extra.CLAVE = c.color_clave;
    const r = recortar(c, i, tipo, tipo === "objeto" ? objs : [], !!still, extra);
    c._recorte = r.ruta;
    if (r.pista) c._pista = r.pista;
  });
  // efectos que siguen a un objeto (lupa, etiqueta-sigue, reencuadre-objeto): caja del objeto en cada cuadro
  (plan.capas ?? []).forEach((c, i) => {
    if (!NECESITAN_PISTA.includes(c.efecto) || (c.efecto === "reencuadre" && !c._objeto)) return;
    const objs = objetosDe(c);
    if (!objs.length) { console.error(`${c.efecto === "reencuadre" ? "reencuadre-objeto" : c.efecto} necesita "punto" o "caja" del objeto (en el segundo "referencia").`); process.exit(1); }
    const ref = Number(c.referencia ?? (c.desde + c.hasta) / 2);
    if (tieneSam() && !(still && c.efecto === "reencuadre")) {
      const r = recortar({ ...c, referencia: ref }, `p${i}`, "objeto", objs, !!still);
      c._pista = r.pista;
      return;
    }
    // sin SAM: flujo óptico sobre el centro del objeto (la caja conserva su tamaño)
    const o = objs[0];
    const cx = o.punto ? o.punto[0] : (o.caja[0] + o.caja[2]) / 2, cy = o.punto ? o.punto[1] : (o.caja[1] + o.caja[3]) / 2;
    const cw = o.caja ? o.caja[2] - o.caja[0] : 0.15, ch = o.caja ? o.caja[3] - o.caja[1] : 0.15;
    const pj = path.join(dirIn, `centro_${i}.json`), sj = path.join(dirIn, `pista_${i}.json`);
    fs.writeFileSync(pj, JSON.stringify([[cx, cy]]));
    console.log(run(PY, [path.join(MOTOR, "scripts/seguir.py"), fuente, String(c.desde), String(c.hasta), String(info.fps), String(ref), pj, sj], { SALIDA: tamRecorte }).trim());
    const pista = JSON.parse(fs.readFileSync(sj, "utf8"))[0];
    c._pista = { desde: Math.round(c.desde * info.fps), pista: [pista.map(([x, y]) => [x, y, cw, ch, 0])] };
  });
  // tracking: etiquetas que siguen al objeto (ingredientes con "seguir": true).
  // Con "objeto" (punto o caja del plato o producto) y SAM 2.1, los detalles se buscan solo sobre el objeto: no se pegan a manos ni al fondo.
  (plan.capas ?? []).forEach((c, i) => {
    if (c.efecto !== "ingredientes" || !c.seguir || !Array.isArray(c.puntos) || !c.puntos.length) return;
    const pj = path.join(dirIn, `puntos_${i}.json`), sj = path.join(dirIn, `pistas_${i}.json`);
    fs.writeFileSync(pj, JSON.stringify(c.puntos.map((p) => [Number(p.x ?? 0.5), Number(p.y ?? 0.5)])));
    const obj = c.objeto ? objetosDe(c.objeto) : [];
    const ref = Number(c.referencia ?? c.desde);
    const mascara = obj.length && !still && tieneSam() ? recortar({ ...c, referencia: ref }, `obj${i}`, "objeto", obj, false).cache : null;
    console.log(run(PY, [path.join(MOTOR, "scripts/seguir.py"), fuente, String(c.desde), String(c.hasta), String(info.fps), String(ref), pj, sj, ...(mascara ? [mascara] : [])],
      { SALIDA: tamRecorte }).trim());
    const pistas = JSON.parse(fs.readFileSync(sj, "utf8"));
    c.puntos.forEach((p, k) => { p.pista = pistas[k]; });
  });
  const fps = info.fps, duracion = Math.ceil(info.seg * fps);
  Object.assign(plan, { video: `${id}/video.mp4`, fps, duracion, ancho: info.ancho, alto: info.alto, salida: salidaTam, _alfa: ALFA });
  if (process.env.EFECTOS_PLAN_FINAL) fs.writeFileSync(process.env.EFECTOS_PLAN_FINAL, JSON.stringify(plan));   // para las pruebas automáticas
  // un solo empaquetado y un solo navegador para todas las fotos y el video
  const { bundle } = await import("@remotion/bundler");
  const { openBrowser, renderMedia, renderStill, selectComposition } = await import("@remotion/renderer");
  console.log("Preparando el render...");
  const serveUrl = await bundle({ entryPoint: path.join(MOTOR, "src/index.ts"), publicDir: path.join(MOTOR, "public"), enableCaching: true });
  // GPU del navegador: en Mac y Windows usa la tarjeta gráfica (si no hay, Chrome cae solo al modo por software)
  const gl = process.env.EFECTOS_GL || (process.platform === "linux" ? null : "angle");
  const chromiumOptions = gl ? { gl } : {};
  const navegador = await openBrowser("chrome", { chromiumOptions });
  const comun = { serveUrl, inputProps: plan, puppeteerInstance: navegador, chromiumOptions, logLevel: "error" };
  const composition = await selectComposition({ ...comun, id: "Editar" });

  if (still) {
    for (const s of still) {
      const out = salida.replace(/\.(png|mp4)$/i, "") + `_${s}.png`;
      await renderStill({ ...comun, composition, output: path.resolve(out), frame: Math.min(duracion - 1, Math.round(s * fps)), scale: ESCALA });
      console.log("foto:", out);
    }
    await navegador.close({ silent: true });
  } else {
    // con transparencia: ProRes 4444 (.mov, lo abren Premiere, Final Cut, DaVinci y CapCut) o VP9 (.webm, para la web)
    const webm = ALFA && /\.webm$/i.test(salida);
    const final = ALFA ? path.resolve(salida.replace(/\.(mp4|mov|webm)$/i, "") + (webm ? ".webm" : ".mov")) : path.resolve(salida);
    const crudo = path.join(os.tmpdir(), id + "_render" + (ALFA ? (webm ? ".webm" : ".mov") : ".mp4"));
    const hilos = Number(process.env.EFECTOS_HILOS) || Math.max(1, Math.min(8, Math.floor(os.cpus().length / 2)));
    const codigo = !ALFA ? { codec: "h264", crf: BORRADOR ? 23 : 17 }
      : webm ? { codec: "vp9", imageFormat: "png", pixelFormat: "yuva420p", crf: 20 }
      : { codec: "prores", proResProfile: "4444", imageFormat: "png", pixelFormat: "yuva444p10le" };
    let ultimo = -1;
    await renderMedia({ ...comun, composition, ...codigo, outputLocation: crudo, concurrency: hilos, scale: ESCALA,
      onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p > ultimo) { ultimo = p; console.log(`render: ${p * 10}%`); } } });
    await navegador.close({ silent: true });
    const mu = capa("musica");
    if (mu && typeof mu.musica_archivo === "string") {
      // música de fondo que baja sola cuando hay voz (ducking) + audio final a -14 LUFS
      const a = Math.max(0, mu.desde), b = Math.min(info.seg, mu.hasta), vol = Number(mu.volumen ?? 0.22);
      const fi = Math.min(1.5, (b - a) / 4), fo = Math.min(2.5, (b - a) / 3);
      const duck = mu.bajar_con_voz === false ? "[m]anull[md]" : "[m][key]sidechaincompress=threshold=0.025:ratio=10:attack=15:release=380:makeup=1[md]";
      run("ffmpeg", ["-y", "-loglevel", "error", "-i", crudo, "-stream_loop", "-1", "-i", path.join(MOTOR, "public", mu.musica_archivo),
        "-filter_complex", `[0:a]asplit=2[voz][key];[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${(b - a).toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=${fi.toFixed(2)},afade=t=out:st=${(b - a - fo).toFixed(2)}:d=${fo.toFixed(2)},volume=${vol},adelay=${Math.round(a * 1000)}|${Math.round(a * 1000)}[m];${duck};[voz][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[out]`,
        "-map", "0:v", "-map", "[out]", "-c:v", "copy", ...(webm ? ["-c:a", "libopus"] : ["-c:a", "aac"]), "-b:a", "192k", "-ar", "48000", final]);
    } else {
      // audio a -14 LUFS (estándar de Reels/TikTok)
      run("ffmpeg", ["-y", "-loglevel", "error", "-i", crudo, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1:LRA=11", ...(webm ? ["-c:a", "libopus"] : ["-c:a", "aac"]), "-b:a", "192k", "-ar", "48000", final]);
    }
    fs.rmSync(crudo, { force: true });
    console.log("listo:", final);
  }
} finally {
  fs.rmSync(dirIn, { recursive: true, force: true });
  try { limpiarCache(); } catch {}
  // Remotion guarda copias del proyecto en la carpeta temporal en cada render: se borran para no llenar el disco.
  for (const d of fs.readdirSync(os.tmpdir())) if (d.startsWith("remotion-webpack-bundle-")) fs.rmSync(path.join(os.tmpdir(), d), { recursive: true, force: true });
}
