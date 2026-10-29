// Efectos sobre una persona u objeto recortado y seguido (RVM para personas, SAM 2.1 para objetos).
//  - Dentro de la escena (se mueven con la cámara): pixelar, foco, contorno-neon, sticker, eco.
//  - Gráficos que siguen al objeto: lupa, etiqueta-sigue.
// render.mjs deja en cada capa: _recorte (carpeta con 000123.webp con transparencia) y _pista (caja del objeto por cuadro).
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, Plan, SfxPlan, clamp, eBack, eIn, eInOut, eOut, estiloFinal, familia, num } from "../lib/base";

export const EFECTOS_OBJETO = ["pixelar", "foco", "contorno-neon", "sticker", "eco"];
export const EFECTOS_SIGUEN = ["lupa", "etiqueta-sigue"];
const txt = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const cuadro = (capa: Capa, f: number) => staticFile(`${capa._recorte}/${String(f).padStart(6, "0")}.webp`);
const presencia = (c: Capa, t: number, fade = 0.3) => {
  const s = t - c.desde, L = c.hasta - c.desde;
  if (s < 0 || s > L) return 0;
  const k = Math.min(num(c.transicion, fade), L / 2);
  return k <= 0 ? 1 : eInOut(Math.min(s / k, (L - s) / k, 1));
};

// Caja del objeto en el cuadro f (0..1), suavizada ±2 cuadros. null si no se sabe.
type Pista = { desde: number; pista: (number[] | null)[][] };
export const posObjeto = (capa: Capa, f: number) => {
  const p = capa._pista as Pista | undefined;
  const filas = p?.pista?.[0];
  if (!filas) return null;
  const sel: number[][] = [];
  for (let k = -2; k <= 2; k++) { const x = filas[f - p!.desde + k]; if (x) sel.push(x); }
  if (!sel.length) return null;
  const m = (i: number) => sel.reduce((s, x) => s + x[i], 0) / sel.length;
  return { x: m(0), y: m(1), w: m(2), h: m(3) };
};
// ¿hay cuadro recortado para f? (solo dentro del tramo de la capa)
const tieneCuadro = (capa: Capa, f: number, fps: number) => typeof capa._recorte === "string" && f >= Math.round(capa.desde * fps) && f <= Math.round(capa.hasta * fps) + 1;

// ---------- dentro de la escena ----------
export const CapasObjeto: React.FC<{ plan: Plan; filtro?: string }> = ({ plan, filtro }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps;
  const E = estiloFinal(plan.estilo);
  const activas = plan.capas.filter((c) => EFECTOS_OBJETO.includes(c.efecto) && t >= c.desde && t <= c.hasta);
  if (!activas.length) return null;
  const base: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: W, height: H };
  return (
    <>
      {activas.map((c, i) => {
        // pixelar tapa desde el primer cuadro (nada privado se asoma en una transición), salvo que se pida una
        const k = c.efecto === "pixelar" && c.transicion === undefined ? 1 : presencia(c, t, 0.3);
        const id = `obj-${i}-${Math.round(c.desde * 100)}`;
        const ok = tieneCuadro(c, f, fps);
        switch (c.efecto) {
          case "pixelar": {
            if (ok) return <Img key={i} src={cuadro(c, f)} style={{ ...base, opacity: k }} />;
            // sin seguimiento: tapa una caja fija con desenfoque
            const cj = Array.isArray(c.caja) ? (c.caja as number[]) : null;
            if (!cj) return null;
            return <div key={i} style={{ position: "absolute", left: cj[0] * W, top: cj[1] * H, width: (cj[2] - cj[0]) * W, height: (cj[3] - cj[1]) * H,
              borderRadius: 18, backdropFilter: `blur(${num(c.intensidad, 1) * 26}px)`, opacity: k }} />;
          }
          case "foco": {              // todo se oscurece menos el objeto, que queda con un leve halo
            const osc = clamp(num(c.oscuridad, 0.65), 0.2, 0.95);
            return (
              <React.Fragment key={i}>
                <AbsoluteFill style={{ background: `rgba(0,0,0,${(osc * k).toFixed(3)})`, backdropFilter: num(c.desenfoque, 0) > 0 ? `blur(${num(c.desenfoque, 0) * k}px)` : undefined }} />
                {ok ? <Img src={cuadro(c, f)} style={{ ...base, filter: `${filtro ?? ""} drop-shadow(0 0 ${Math.round(W / 60)}px rgba(255,255,255,${(0.35 * k).toFixed(2)}))` }} /> : null}
              </React.Fragment>
            );
          }
          case "contorno-neon": {     // línea de luz alrededor de la silueta
            if (!ok) return null;
            const color = txt(c.color, "#00E5FF");
            const g = Math.max(2, num(c.grosor, 1) * W / 360);
            const pulso = 1 + 0.18 * Math.sin(t * Math.PI * 2 * num(c.pulso, 1.2));
            return (
              <React.Fragment key={i}>
                <svg width={0} height={0} style={{ position: "absolute" }}>
                  <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                    <feMorphology in="SourceAlpha" operator="dilate" radius={g} result="d" />
                    <feComposite in="d" in2="SourceAlpha" operator="out" result="anillo" />
                    <feFlood floodColor={color} result="c" />
                    <feComposite in="c" in2="anillo" operator="in" result="linea" />
                    <feGaussianBlur in="linea" stdDeviation={g * 2.2 * pulso} result="brillo" />
                    <feGaussianBlur in="linea" stdDeviation={g * 6 * pulso} result="halo" />
                    <feMerge><feMergeNode in="halo" /><feMergeNode in="brillo" /><feMergeNode in="brillo" /><feMergeNode in="linea" /></feMerge>
                  </filter>
                </svg>
                <Img src={cuadro(c, f)} style={{ ...base, filter: `url(#${id})`, opacity: k }} />
              </React.Fragment>
            );
          }
          case "sticker": {           // el objeto sale como sticker: borde blanco, sombra y un pequeño salto hacia adelante
            if (!ok) return null;
            const s = t - c.desde, L = c.hasta - c.desde;
            const entra = eBack(clamp(s / 0.45), 2.2), sale = eIn(clamp((s - (L - 0.3)) / 0.3));
            const p = posObjeto(c, f) ?? { x: 0.5, y: 0.5, w: 0.3, h: 0.3 };
            const esc = 1 + (num(c.escala, 1.08) - 1) * entra * (1 - sale);
            const rot = num(c.giro, -4) * entra * (1 - sale);
            const b = Math.max(3, num(c.borde, 1) * W / 120);
            return (
              <React.Fragment key={i}>
                <svg width={0} height={0} style={{ position: "absolute" }}>
                  <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
                    <feMorphology in="SourceAlpha" operator="dilate" radius={b} result="d" />
                    <feGaussianBlur in="d" stdDeviation={0.8} result="ds" />
                    <feFlood floodColor={txt(c.color, "#FFFFFF")} result="blanco" />
                    <feComposite in="blanco" in2="ds" operator="in" result="borde" />
                    <feMerge><feMergeNode in="borde" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </svg>
                <div style={{ ...base, transformOrigin: `${p.x * W}px ${p.y * H}px`, transform: `scale(${esc}) rotate(${rot}deg)`, opacity: 1 - sale * 0.999,
                  filter: `drop-shadow(0 ${W / 90}px ${W / 70}px rgba(0,0,0,.35))` }}>
                  <Img src={cuadro(c, f)} style={{ ...base, filter: `url(#${id}) ${filtro ?? ""}` }} />
                </div>
              </React.Fragment>
            );
          }
          case "eco": {               // estela: copias de cuadros anteriores que se desvanecen
            if (!ok) return null;
            const n = clamp(Math.round(num(c.copias, 4)), 1, 8), sep = Math.max(1, Math.round(num(c.separacion, 3)));
            const f0 = Math.round(c.desde * fps);
            const color = txt(c.color, "");
            return (
              <React.Fragment key={i}>
                {Array.from({ length: n }, (_, j) => n - j).map((j) => {
                  const fj = Math.max(f0, f - j * sep);
                  if (fj === f) return null;
                  const op = (0.55 * (1 - j / (n + 1))) * k;
                  const tinte = color ? `drop-shadow(0 0 ${Math.round(W / 80)}px ${color}) brightness(1.1)` : "";
                  return <Img key={j} src={cuadro(c, fj)} style={{ ...base, opacity: op, filter: tinte || undefined }} />;
                })}
                <Img src={cuadro(c, f)} style={{ ...base, filter: filtro || undefined }} />
              </React.Fragment>
            );
          }
          default: return null;
        }
      })}
    </>
  );
};

// ---------- lupa: un círculo que amplía el objeto y lo sigue ----------
export const Lupa: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  if (s < 0 || s > L) return null;
  const p = posObjeto(capa, f) ?? (Array.isArray(capa.punto) ? { x: num((capa.punto as number[])[0], 0.5), y: num((capa.punto as number[])[1], 0.5), w: 0.15, h: 0.15 } : null);
  if (!p || !ctx.video) return null;
  const E = estiloFinal(ctx.estilo);
  const z = num(capa.zoom, 2.4);
  const R = Math.min(W, H) * num(capa.tamano, 0.2);
  const entra = eBack(clamp(s / 0.45), 1.6), sale = eIn(clamp((s - (L - 0.3)) / 0.3));
  const k = entra * (1 - sale);
  // el círculo va al lado con más espacio y nunca encima del objeto
  const ox = p.x * W, oy = p.y * H;
  const derecha = capa.lado ? capa.lado === "derecha" : p.x < 0.5;
  const dist = R + Math.max(p.w * W, p.h * H) * 0.55 + W * 0.04;
  const lx = clamp(ox + (derecha ? dist : -dist), R + 20, W - R - 20);
  const ly = clamp(oy - (capa.arriba === false ? -R * 0.4 : R * 0.4), R + 20, H - R - 20);
  // video dentro del círculo: el punto del objeto queda en el centro
  const asp = (ctx.ancho || W) / (ctx.alto || H);
  const vw = asp > W / H ? H * asp : W, vh = asp > W / H ? H : W / asp;
  const vx = (W - vw) / 2, vy = (H - vh) / 2;
  const borde = Math.max(4, W / 220);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", opacity: k }}>
        <line x1={ox} y1={oy} x2={lx} y2={ly} stroke="#fff" strokeWidth={borde * 0.7} strokeLinecap="round" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.4))" }} />
        <circle cx={ox} cy={oy} r={borde * 2.2} fill={txt(capa.color, E.acento)} stroke="#fff" strokeWidth={borde * 0.7} />
      </svg>
      <div style={{ position: "absolute", left: lx - R, top: ly - R, width: 2 * R, height: 2 * R, borderRadius: "50%", overflow: "hidden",
        border: `${borde}px solid #fff`, boxShadow: "0 18px 50px rgba(0,0,0,.45)", transform: `scale(${k})`, background: "#000" }}>
        <div style={{ position: "absolute", left: R - ox * z, top: R - oy * z, width: W * z, height: H * z }}>
          <OffthreadVideo src={staticFile(ctx.video)} muted style={{ position: "absolute", left: vx * z, top: vy * z, width: vw * z, height: vh * z }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,.28), transparent 45%)" }} />
      </div>
      {capa.texto ? (
        <div style={{ position: "absolute", left: lx - R * 1.3, width: R * 2.6, top: ly + R + 16, textAlign: "center", opacity: k,
          fontFamily: familia(E.fuenteTitulo), fontSize: Math.round(Math.min(W, H) / 22), color: "#fff", textShadow: "0 3px 14px rgba(0,0,0,.6)" }}>{txt(capa.texto)}</div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- etiqueta que sigue al objeto ----------
export const EtiquetaSigue: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  if (s < 0 || s > L) return null;
  const p = posObjeto(capa, f) ?? (Array.isArray(capa.punto) ? { x: num((capa.punto as number[])[0], 0.5), y: num((capa.punto as number[])[1], 0.5), w: 0.1, h: 0.1 } : null);
  if (!p) return null;
  const E = estiloFinal(ctx.estilo);
  const titulo = txt(capa.texto ?? capa.titulo), sub = txt(capa.subtexto);
  const U = Math.min(W, H) / 1080;
  const fsT = Math.round(46 * U), fsS = Math.round(30 * U);
  const entra = eOut(clamp(s / 0.4)), sale = eIn(clamp((s - (L - 0.3)) / 0.3));
  const ancho = Math.max(titulo.length * fsT * 0.66, sub.length * fsS * 0.6) + 72 * U;
  const alto = (sub ? 118 : 80) * U, gap = 130 * U;
  const arribaObj = (p.y - p.h * 0.5) * H, abajoObj = (p.y + p.h * 0.5) * H;
  // dónde cabe la etiqueta: arriba del objeto, abajo, o al lado si el objeto ocupa casi todo el alto
  const cabeArriba = arribaObj - gap - alto > 24 * U, cabeAbajo = abajoObj + gap + alto < H - 24 * U;
  const modo = capa.arriba === false ? (cabeAbajo ? "abajo" : cabeArriba ? "arriba" : "lado") : cabeArriba ? "arriba" : cabeAbajo ? "abajo" : "lado";
  let ax = p.x * W, ay = arribaObj, lx = 0, ly = 0;          // ancla en el objeto y centro de la etiqueta
  if (modo === "arriba") { lx = ax; ly = arribaObj - gap - alto / 2; }
  else if (modo === "abajo") { ay = abajoObj; lx = ax; ly = abajoObj + gap + alto / 2; }
  else {
    const der = p.x < 0.5;
    ax = (p.x + (der ? 1 : -1) * p.w * 0.5) * W; ay = p.y * H;
    lx = ax + (der ? 1 : -1) * (gap + ancho / 2); ly = ay;
  }
  lx = clamp(lx, ancho / 2 + 30 * U, W - ancho / 2 - 30 * U);
  ly = clamp(ly, alto / 2 + 24 * U, H - alto / 2 - 24 * U);
  // la línea va del objeto al borde más cercano de la etiqueta
  const bx = modo === "lado" ? lx + (ax < lx ? -ancho / 2 : ancho / 2) : lx;
  const by = modo === "arriba" ? ly + alto / 2 : modo === "abajo" ? ly - alto / 2 : ly;
  return (
    <AbsoluteFill style={{ opacity: 1 - sale }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <line x1={ax} y1={ay} x2={ax + (bx - ax) * entra} y2={ay + (by - ay) * entra}
          stroke="#fff" strokeWidth={4 * U} strokeLinecap="round" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.4))" }} />
        <circle cx={ax} cy={ay} r={10 * U} fill={E.acento} stroke="#fff" strokeWidth={4 * U} />
      </svg>
      <div style={{ position: "absolute", left: lx - ancho / 2, top: ly - alto / 2, width: ancho, height: alto, boxSizing: "border-box", padding: `${14 * U}px ${32 * U}px`, borderRadius: 22 * U,
        background: E.fondo, boxShadow: "0 18px 40px rgba(0,0,0,.3)", textAlign: "center", transform: `scale(${eBack(clamp((s - 0.15) / 0.4), 1.6)})`,
        display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: familia(E.fuenteTitulo), fontSize: fsT, color: E.texto, lineHeight: 1.1, whiteSpace: "nowrap" }}>{titulo}</div>
        {sub ? <div style={{ fontFamily: familia(E.fuente), fontSize: fsS, color: E.suave, marginTop: 4 * U, whiteSpace: "nowrap" }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

export const sonidosObjeto = (c: Capa): SfxPlan[] => {
  switch (c.efecto) {
    case "sticker": return [{ archivo: "pop.wav", en: c.desde, vol: 0.45 }];
    case "lupa": return [{ archivo: "whoosh.wav", en: c.desde, vol: 0.3 }];
    case "etiqueta-sigue": return [{ archivo: "pop.wav", en: c.desde + 0.15, vol: 0.4 }];
    case "contorno-neon": return [{ archivo: "riser.wav", en: c.desde, vol: 0.2 }];
    case "parallax-3d": return [{ archivo: "whoosh.wav", en: c.desde, vol: 0.3 }];
    default: return [];
  }
};

// ---------- parallax 3D: una foto del video (o una imagen) separada en capas por profundidad, con movimiento de cámara ----------
export const Parallax3D: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps, s = t - capa.desde, L = capa.hasta - capa.desde;
  const info = capa._capas as { ruta: string; capas: number[] } | undefined;
  if (s < 0 || s > L || !info) return null;
  const p = eInOut(clamp(s / L));
  const entra = clamp(s / 0.2), sale = clamp((L - s) / 0.2);
  const empuje = num(capa.empuje, 1), lateral = num(capa.lateral, 1), vertical = num(capa.vertical, 0);
  const dir = capa.direccion === "izquierda" ? -1 : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.min(entra, sale), background: "#000", overflow: "hidden" }}>
      {info.capas.map((d, i) => {
        const esc = 1.06 + 0.14 * empuje * d * p + 0.03 * d;
        const tx = dir * lateral * (d - 0.35) * W * 0.07 * (p - 0.5) * 2;
        const ty = vertical * (d - 0.35) * H * 0.04 * (p - 0.5) * 2;
        return <Img key={i} src={staticFile(`${info.ruta}/capa${i}.png`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H,
          transformOrigin: "50% 50%", transform: `translate(${tx}px, ${ty}px) scale(${esc})` }} />;
      })}
    </AbsoluteFill>
  );
};
