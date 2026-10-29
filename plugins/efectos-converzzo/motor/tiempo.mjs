// Efectos de tiempo: camara-lenta, acelerar, rampa-velocidad, congelar, rebobinar y cortar-silencios.
// Cambian la duración del video, así que se hacen antes del render con ffmpeg:
//  1. se arma un video nuevo con los tramos cambiados de velocidad (con su audio),
//  2. los tiempos de las demás capas (que vienen en el tiempo del video original) se pasan al tiempo nuevo,
//  3. congelar y rebobinar dejan una capa gráfica (_congelar, _vhs) para el texto y el look.
export const EFECTOS_TIEMPO = ["camara-lenta", "acelerar", "congelar", "rebobinar", "rampa-velocidad"];

const n = (v, d) => (typeof v === "number" && isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && isFinite(+v) ? +v : d);

// Arma las piezas del video nuevo a partir del plan (tiempos del original).
// `cortes`: tramos [a, b] del original que se quitan (silencios detectados).
export function piezas(capas, dur, cortes = []) {
  const tiempo = capas.filter((c) => EFECTOS_TIEMPO.includes(c.efecto)).sort((a, b) => a.desde - b.desde);
  const fin = (c) => (c.efecto === "congelar" ? c.desde : c.hasta);   // congelar ocurre en un instante; su "hasta" es cuánto dura la pausa
  for (let i = 1; i < tiempo.length; i++)
    if (tiempo[i].desde < fin(tiempo[i - 1]) - 0.01) throw new Error(`Los efectos de tiempo no se pueden encimar: ${tiempo[i - 1].efecto} y ${tiempo[i].efecto}.`);
  const out = [];
  let t = 0;
  const normal = (a, b) => { if (b - a > 0.02) out.push({ tipo: "normal", a, b }); };
  for (const c of tiempo) {
    const a = Math.max(0, Math.min(dur, c.desde)), b = Math.max(a, Math.min(dur, c.hasta));
    if (c.efecto === "congelar") {
      normal(t, a);
      out.push({ tipo: "congelar", a, dur: Math.max(0.3, b - a), capa: c });
      t = a;                               // el video sigue desde donde se congeló
      continue;
    }
    normal(t, a);
    if (c.efecto === "camara-lenta") out.push({ tipo: "velocidad", a, b, v: Math.min(0.9, Math.max(0.2, n(c.velocidad, 0.5))), capa: c });
    if (c.efecto === "acelerar") out.push({ tipo: "velocidad", a, b, v: Math.min(8, Math.max(1.25, n(c.velocidad, 2))), capa: c });
    if (c.efecto === "rampa-velocidad") {
      // rampa: la velocidad pasa suave de 1 a "velocidad", se mantiene y vuelve a 1 (curva coseno en escalones cortos)
      const v = Math.min(6, Math.max(0.15, n(c.velocidad, 0.3)));
      const r = Math.min((b - a) * 0.4, Math.max(0.1, n(c.rampa, 0.5))), K = 6;
      // una sola pieza con escalones de velocidad (así se interpola una vez y no se llena la memoria)
      const pasos = [];
      const tramo = (x0, x1, vel) => { if (x1 - x0 >= 0.005) pasos.push({ a: x0, b: x1, v: vel }); };
      const curva = (k) => 1 + (v - 1) * (1 - Math.cos(Math.PI * (k + 0.5) / K)) / 2;
      for (let k = 0; k < K; k++) tramo(a + (r * k) / K, a + (r * (k + 1)) / K, curva(k));
      tramo(a + r, b - r, v);
      for (let k = K - 1; k >= 0; k--) tramo(b - (r * (k + 1)) / K, b - (r * k) / K, curva(k));
      out.push({ tipo: "rampa", a, b, pasos, capa: c });
    }
    if (c.efecto === "rebobinar") {
      out.push({ tipo: "normal", a, b });
      out.push({ tipo: "reversa", a, b, v: Math.min(6, Math.max(1.5, n(c.velocidad, 3))), capa: c });
      if (c.repetir !== false) { t = a; continue; }   // vuelve a reproducir el tramo después de rebobinar
    }
    t = b;
  }
  normal(t, dur);
  // quitar los silencios de las piezas normales (los tramos con efectos de velocidad no se tocan)
  const final = [];
  for (const p of out) {
    if (p.tipo !== "normal" || !cortes.length) { final.push(p); continue; }
    let a = p.a;
    for (const [ca, cb] of cortes) {
      if (cb <= a || ca >= p.b) continue;
      if (ca - a > 0.02) final.push({ tipo: "normal", a, b: ca, corte: true });
      a = Math.max(a, cb);
    }
    if (p.b - a > 0.02) final.push({ tipo: "normal", a, b: p.b });
  }
  out.length = 0; out.push(...final);
  // duración de cada pieza en el video nuevo
  let acc = 0;
  for (const p of out) {
    p.d = p.tipo === "normal" ? p.b - p.a : p.tipo === "congelar" ? p.dur : p.tipo === "rampa" ? p.pasos.reduce((n, x) => n + (x.b - x.a) / x.v, 0) : (p.b - p.a) / p.v;
    p.inicio = acc; acc += p.d;
  }
  return { piezas: out, duracionNueva: acc, hayTiempo: tiempo.length > 0 || cortes.length > 0 };
}

// Tiempo del original → tiempo del video nuevo (la primera vez que aparece ese instante).
export function mapear(t, ps) {
  for (const p of ps) {
    if (p.tipo === "normal" && t >= p.a - 1e-6 && t <= p.b + 1e-6) return p.inicio + (t - p.a);
    if (p.tipo === "velocidad" && t >= p.a && t <= p.b) return p.inicio + (t - p.a) / p.v;
    if (p.tipo === "congelar" && Math.abs(t - p.a) < 1e-6) return p.inicio;
    if (p.tipo === "rampa" && t >= p.a && t <= p.b) {
      let acc = p.inicio;
      for (const x of p.pasos) { if (t <= x.b) return acc + (t - x.a) / x.v; acc += (x.b - x.a) / x.v; }
      return acc;
    }
  }
  // si cae en un tramo quitado (silencio), va al inicio de lo que sigue
  const sig = ps.find((p) => (p.tipo === "normal" || p.tipo === "velocidad" || p.tipo === "rampa") && p.a >= t);
  if (sig) return sig.inicio;
  const ult = ps[ps.length - 1];
  return ult ? ult.inicio + ult.d : t;
}

// Filtro de ffmpeg que construye el video nuevo. Cada pieza lee su propio tramo del archivo (-ss/-t por entrada):
// así ffmpeg no guarda en memoria el video entero para cada pieza (importante con muchas piezas, como en la rampa).
// Devuelve { entradas, grafo }: entradas = argumentos -ss/-t/-i para ffmpeg.
export function filtro(ps, fps, conAudio, archivo) {
  const N = ps.length;
  const esc = "scale='if(gt(a,9/16),-2,1080)':'if(gt(a,9/16),1920,-2)':flags=lanczos";
  const entradas = [], v = [], a = [];
  const atempo = (x) => { const f = []; while (x < 0.5) { f.push("atempo=0.5"); x /= 0.5; } while (x > 2) { f.push("atempo=2"); x /= 2; } f.push(`atempo=${x.toFixed(4)}`); return f.join(","); };
  ps.forEach((p, i) => {
    const ini = p.a, dur = p.tipo === "congelar" ? 0.2 : Math.max(0.04, p.b - p.a);
    entradas.push("-ss", ini.toFixed(4), "-t", (dur + 0.05).toFixed(4), "-i", archivo);
    const vin = `[${i}:v]${esc},fps=${fps},format=yuv420p,trim=duration=${dur.toFixed(4)},setpts=PTS-STARTPTS`, ain = `[${i}:a:0]aformat=sample_rates=48000:channel_layouts=stereo,atrim=duration=${dur.toFixed(4)},asetpts=PTS-STARTPTS`;
    const vo = `[v${i}]`, ao = `[a${i}]`;
    const silencio = `anullsrc=r=48000:cl=stereo,atrim=duration=${p.d.toFixed(4)}${ao}`;
    if (p.tipo === "normal") {
      v.push(`${vin}${vo}`);
      a.push(conAudio ? `${ain}${ao}` : silencio);
    } else if (p.tipo === "velocidad") {
      const fluido = p.v < 1 && p.capa.fluido !== false;
      const interp = p.v < 1 ? (fluido ? `,minterpolate=fps=${fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1` : `,minterpolate=fps=${fps}:mi_mode=blend`) : `,fps=${fps}`;
      v.push(`${vin},setpts=PTS/${p.v}${interp}${vo}`);
      const mudo = p.capa.audio === "silencio";
      a.push(conAudio && !mudo ? `${ain},${atempo(p.v)}${ao}` : silencio);
    } else if (p.tipo === "rampa") {
      // tiempo nuevo = suma de cada escalón estirado (expresión por tramos para setpts); se interpola antes a más cuadros
      const vmin = Math.min(...p.pasos.map((x) => x.v));
      const mult = vmin < 1 ? Math.min(4, Math.ceil(1 / vmin)) : 1;
      let acc = 0, expr = "";
      const partes = p.pasos.map((x) => { const r = { t0: x.a - p.a, t1: x.b - p.a, v: x.v, acc }; acc += (x.b - x.a) / x.v; return r; });
      for (let k = partes.length - 1; k >= 0; k--) {
        const q = partes[k], tramo = `((T-${q.t0.toFixed(4)})/${q.v.toFixed(4)}+${q.acc.toFixed(4)})`;
        expr = k === partes.length - 1 ? tramo : `if(lt(T,${q.t1.toFixed(4)}),${tramo},${expr})`;   // entre comillas: las comas no se escapan
      }
      const interp = mult > 1 && p.capa.fluido !== false ? `,minterpolate=fps=${fps * mult}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1` : mult > 1 ? `,fps=${fps * mult}` : "";
      v.push(`${vin}${interp},setpts='(${expr})/TB',fps=${fps}${vo}`);
      if (conAudio && p.capa.audio === "lento") {
        const K = p.pasos.length;
        a.push(`${ain},asplit=${K}${p.pasos.map((_, k) => `[r${i}_${k}]`).join("")}`);
        p.pasos.forEach((x, k) => a.push(`[r${i}_${k}]atrim=start=${(x.a - p.a).toFixed(4)}:end=${(x.b - p.a).toFixed(4)},asetpts=PTS-STARTPTS,${atempo(x.v)}[q${i}_${k}]`));
        a.push(`${p.pasos.map((_, k) => `[q${i}_${k}]`).join("")}concat=n=${K}:v=0:a=1${ao}`);
      } else a.push(silencio);
    } else if (p.tipo === "reversa") {
      v.push(`${vin},reverse,setpts=PTS/${p.v},fps=${fps}${vo}`);
      a.push(conAudio ? `${ain},areverse,${atempo(p.v)},volume=0.45${ao}` : silencio);
    } else if (p.tipo === "congelar") {
      const cuadros = Math.max(1, Math.round(p.d * fps));
      v.push(`${vin},trim=end_frame=1,loop=loop=${cuadros - 1}:size=1:start=0,setpts=N/(${fps}*TB)${vo}`);
      a.push(silencio);
    }
  });
  const concat = `${ps.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${N}:v=1:a=1[vout][aout]`;
  return { entradas, grafo: [...v, ...a, concat].join(";") };
}

// Pasa el plan al tiempo nuevo y agrega las capas gráficas de congelar y rebobinar.
export function remapearPlan(plan, ps) {
  const capas = [];
  for (const c of plan.capas) {
    if (EFECTOS_TIEMPO.includes(c.efecto) || c.efecto === "cortar-silencios") continue;
    const desde = mapear(c.desde, ps), hasta = Math.max(desde + 0.05, mapear(c.hasta, ps));
    // también se ajustan los instantes internos: "en" (pasos) y los que terminan en "_en" (antes_en, despues_en)
    const ajustar = (o) => Array.isArray(o) ? o.map(ajustar) : o && typeof o === "object"
      ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "number" && (k === "en" || k === "start" || k === "end" || k.endsWith("_en")) ? mapear(v, ps) : ajustar(v)])) : o;
    capas.push({ ...ajustar(c), desde, hasta });
  }
  for (const p of ps) {
    if (p.tipo === "congelar") capas.push({ efecto: "_congelar", desde: p.inicio, hasta: p.inicio + p.d, texto: p.capa.texto, flecha: p.capa.flecha, color: p.capa.color });
    if (p.tipo === "reversa") capas.push({ efecto: "_vhs", desde: p.inicio, hasta: p.inicio + p.d, texto: p.capa.texto ?? "REBOBINANDO" });
    if (p.tipo === "velocidad" && p.capa.etiqueta) capas.push({ efecto: "_etiqueta", desde: p.inicio, hasta: p.inicio + p.d, texto: p.capa.etiqueta });
  }
  // cortes de silencio: zoom alterno en cada corte para que el salto no se note (salvo que se pida sin zoom)
  const cs = plan.capas.find((c) => c.efecto === "cortar-silencios");
  if (cs && cs.zoom_alterno !== false) {
    const marcas = ps.filter((p) => p.corte).map((p) => p.inicio + p.d);
    const total = ps.length ? ps[ps.length - 1].inicio + ps[ps.length - 1].d : 0;
    if (marcas.length) capas.unshift({ efecto: "_alterno", desde: 0, hasta: total, cortes: marcas, zoom: cs.zoom ?? 1.08 });
  }
  return { ...plan, capas };
}
