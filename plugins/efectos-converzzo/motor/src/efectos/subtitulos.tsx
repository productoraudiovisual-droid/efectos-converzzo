// Subtítulos dinámicos palabra por palabra.
// Estilos: "clasico" (blanco con borde, la palabra que se dice en color), "caja" (la palabra que se dice dentro de una caja),
//          "pop" (cada palabra aparece con un salto), "karaoke" (las palabras se van pintando a medida que se dicen).
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Capa, Ctx, caraEntre, clamp, eBack, estiloFinal, familia, num } from "../lib/base";

type Palabra = { text: string; start: number; end: number };
type Bloque = { palabras: Palabra[]; desde: number; hasta: number };

// Agrupa las palabras en bloques cortos que se leen de un vistazo.
export const bloques = (palabras: Palabra[], maxPal: number, maxCar: number): Bloque[] => {
  const out: Bloque[] = [];
  let act: Palabra[] = [];
  const cerrar = () => { if (act.length) out.push({ palabras: act, desde: act[0].start, hasta: act[act.length - 1].end }); act = []; };
  for (const p of palabras) {
    const prev = act[act.length - 1];
    const car = act.reduce((n, x) => n + x.text.length + 1, 0) + p.text.length;
    if (act.length && (act.length >= maxPal || car > maxCar || p.start - prev.end > 0.35 || /[.?!…]$/.test(prev.text))) cerrar();
    act.push(p);
  }
  cerrar();
  // cada bloque se queda en pantalla hasta que empieza el siguiente (si la pausa es corta)
  for (let i = 0; i < out.length; i++) {
    const sig = out[i + 1];
    out[i].hasta = sig && sig.desde - out[i].hasta < 0.6 ? sig.desde : out[i].hasta + 0.25;
  }
  return out;
};

export const Subtitulos: React.FC<{ capa: Capa; ctx: Ctx }> = ({ capa, ctx }) => {
  const f = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const t = f / fps;
  if (t < capa.desde || t > capa.hasta) return null;
  const E = estiloFinal(ctx.estilo);
  const corr = (capa.correcciones ?? {}) as Record<string, string>;
  const mayus = capa.mayusculas !== false;
  const palabras = ((Array.isArray(capa.palabras) ? capa.palabras : []) as Palabra[])
    .filter((p) => p.end >= capa.desde && p.start <= capa.hasta)
    .map((p) => {
      const k = p.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      const fijo = Object.entries(corr).find(([a]) => a.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") === k);
      return { ...p, text: fijo ? p.text.replace(/[\p{L}\p{N}]+/u, fijo[1]) : p.text };
    });
  const estilo = String(capa.estilo ?? "clasico");
  const bs = bloques(palabras, Math.round(num(capa.palabras_por_bloque, 3)), 18);
  const b = bs.find((x) => t >= x.desde && t < x.hasta);
  if (!b) return null;
  const fs = num(capa.tamano, 78);
  // posición: debajo de la cara, en la zona segura de Reels
  const cara = caraEntre(ctx.caras, b.desde, b.hasta);
  const yAuto = Math.min(H * 0.76, Math.max(H * 0.6, (cara.y + cara.h) * H + 140));
  const y = capa.posicion === "centro" ? H * 0.5 : capa.posicion === "arriba" ? H * 0.2 : typeof capa.y === "number" ? capa.y * H : yAuto;
  const resalte = String(capa.color ?? E.sticker);
  const entra = eBack(clamp((t - b.desde) / 0.18), 2);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y - fs * 0.6, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${fs * 0.08}px ${fs * 0.34}px`,
      transform: estilo === "pop" ? undefined : `scale(${0.92 + 0.08 * entra})` }}>
      {b.palabras.map((p, i) => {
        const dicha = t >= p.start - 0.03;
        const ahora = dicha && (i === b.palabras.length - 1 || t < b.palabras[i + 1].start - 0.03);
        const texto = mayus ? p.text.toUpperCase() : p.text;
        const salto = eBack(clamp((t - p.start + 0.03) / 0.16), 2.4);
        const base: React.CSSProperties = {
          fontFamily: familia(E.fuenteTitulo), fontSize: fs, lineHeight: 1.05, letterSpacing: "-0.02em", position: "relative", display: "inline-block",
          WebkitTextStroke: `${fs * 0.11}px #000`, paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(0,0,0,.45)",
        };
        if (estilo === "caja") {
          return (
            <span key={i} style={{ ...base, color: "#fff", padding: "2px 14px", WebkitTextStroke: ahora ? "0px" : base.WebkitTextStroke,
              background: ahora ? E.acento : "transparent", borderRadius: 14, textShadow: ahora ? "none" : base.textShadow,
              transform: ahora ? `scale(${1 + 0.06 * clamp(salto)})` : undefined }}>{texto}</span>
          );
        }
        if (estilo === "pop") {
          return <span key={i} style={{ ...base, color: ahora ? resalte : "#fff", opacity: dicha ? 1 : 0, transform: `scale(${dicha ? Math.max(0, salto) : 0})` }}>{texto}</span>;
        }
        if (estilo === "karaoke") {
          return <span key={i} style={{ ...base, color: dicha ? resalte : "#fff" }}>{texto}</span>;
        }
        return <span key={i} style={{ ...base, color: ahora ? resalte : "#fff", transform: ahora ? `scale(${1 + 0.04 * clamp(salto)})` : undefined }}>{texto}</span>;
      })}
    </div>
  );
};
