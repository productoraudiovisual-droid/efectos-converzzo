// Dónde va una tarjeta sin tapar la cara, en cualquier formato (vertical, horizontal, cuadrado, 4:5).
// Devuelve la posición, el ancho de diseño (las tarjetas se dibujan con ese ancho) y una escala por si hay que achicarla.
//  - Vertical: debajo de la cara; si no cabe, arriba; si tampoco, más pequeña debajo.
//  - Horizontal (y cuadrado con espacio a un lado): al lado libre de la cara, centrada en altura.
//  - Cuadrado y 4:5: debajo de la cara, achicada si hace falta.
import { Capa, Ctx, caraEntre, clamp } from "./base";

export type Lugar = { left: number; top: number; width: number; escala: number };
type Opciones = { ancho?: number; arribaMin?: number; preferir?: "abajo" | "lado" };

export const colocar = (capa: Capa, ctx: Ctx, CH: number, W: number, H: number, op: Opciones = {}): Lugar => {
  const vertical = H >= W * 1.3;
  const pad = vertical ? 60 : 50;
  const ancho = Math.min(op.ancho ?? 920, W - 2 * pad);
  const limAbajo = H * (vertical ? 0.86 : 0.95), limArriba = H * (vertical ? 0.07 : 0.04);
  const centrado = (width: number, top: number, escala = 1): Lugar => ({ left: (W - width * escala) / 2, top, width, escala });
  if (typeof capa.y === "number") return centrado(ancho, capa.y * H);
  const c = caraEntre(ctx.caras, capa.desde, capa.hasta);
  const m = 0.035 * Math.min(W, H);
  const fx0 = c.x * W, fx1 = (c.x + c.w) * W, fy0 = (c.y - c.h * 0.3) * H, fy1 = (c.y + c.h * 1.12) * H;
  const cy = (c.y + c.h / 2) * H;

  // al lado de la cara (horizontal o cuadrado con espacio)
  const izq = fx0 - m - pad, der = W - fx1 - m - pad, lado = Math.max(izq, der);
  const alLado = (width: number, escala: number): Lugar => {
    const top = clamp(cy - (CH * escala) / 2, limArriba, Math.max(limArriba, limAbajo - CH * escala));
    return { left: der >= izq ? W - pad - width * escala : pad, top, width, escala };
  };
  const anchoLado = Math.min(ancho, 860);
  if (!vertical && W >= H * 0.9 && lado >= anchoLado * 0.75) {
    const width = Math.min(anchoLado, lado);
    return alLado(width, Math.min(1, (limAbajo - limArriba) / CH));
  }
  // debajo de la cara
  const minTop = op.arribaMin ?? (vertical ? H * 0.45 : 0);
  const topB = Math.max(fy1 + m, minTop);
  if (topB + CH <= limAbajo) return centrado(ancho, vertical ? clamp(topB, minTop, limAbajo - CH) : topB);
  // arriba de la cara
  if (fy0 - m - CH >= limArriba && op.preferir !== "abajo") return centrado(ancho, vertical ? H * 0.08 : limArriba);
  // más pequeña: donde quepa más grande
  const eAbajo = (limAbajo - topB) / CH, eArriba = (fy0 - m - limArriba) / CH;
  const eLado = !vertical && lado > 280 ? Math.min(lado / anchoLado, (limAbajo - limArriba) / CH) : 0;
  const mejor = Math.max(eAbajo, op.preferir === "abajo" ? 0 : eArriba, eLado);
  if (mejor >= 0.5) {
    if (mejor === eLado) return alLado(anchoLado, eLado);
    if (mejor === eAbajo) return centrado(ancho, topB, Math.min(1, eAbajo));
    return centrado(ancho, limArriba, Math.min(1, eArriba));
  }
  // no hay sitio limpio: abajo, a media escala
  return centrado(ancho, Math.max(limArriba, limAbajo - CH * 0.5), 0.5);
};
