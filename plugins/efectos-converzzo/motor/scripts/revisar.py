"""Revisa las fotos de prueba de probar.mjs: qué pintó cada efecto (diferencia con la foto sin efectos),
si tapa la cara, si toca el borde y si se ve. Imprime un JSON con los problemas y guarda una hoja de contacto.
Uso: python revisar.py casos.json hoja.jpg
"""
import json, sys
import cv2
import numpy as np

datos = json.load(open(sys.argv[1]))
casos, caras = datos["casos"], datos["caras"]
PANTALLA = {"congelar", "antes-despues", "logo-sting", "carrusel-video", "collage-halftone"}   # cambian toda la imagen a propósito


def cara_en(t):
    sel = [c for c in caras if abs(c["t"] - t) <= 0.4 and c["w"] > 0]
    if not sel:
        return None
    return {k: sum(c[k] for c in sel) / len(sel) for k in ("x", "y", "w", "h")}


filas, fotos = [], []
for c in casos:
    fx, base = cv2.imread(c["fx"]), cv2.imread(c["base"])
    if fx is None or base is None:
        filas.append({"efecto": c["efecto"], "problemas": ["no salió la foto"]})
        continue
    H, W = fx.shape[:2]
    dif = cv2.absdiff(fx, base).max(axis=2)
    m = (dif > 28).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    area = m.mean()
    problemas = []
    if area < 0.003:
        problemas.append("no se ve")
    base_efecto = c["efecto"].split("#")[0]
    cara = cara_en(c["t"])
    caja = None
    if cara and base_efecto not in PANTALLA:
        # la cara con margen para el pelo y la barbilla
        x0, x1 = (cara["x"] - cara["w"] * 0.12) * W, (cara["x"] + cara["w"] * 1.12) * W
        y0, y1 = (cara["y"] - cara["h"] * 0.25) * H, (cara["y"] + cara["h"] * 1.08) * H
        x0, y0, x1, y1 = (int(max(0, v)) for v in (x0, y0, x1, y1))
        x1, y1 = min(W, x1), min(H, y1)
        caja = (x0, y0, x1, y1)
        if x1 > x0 and y1 > y0:
            tapa = m[y0:y1, x0:x1].mean()
            if tapa > 0.06:
                problemas.append(f"tapa la cara ({tapa * 100:.0f}%)")
    if base_efecto not in PANTALLA:
        for lado, franja, largo in (("arriba", m[:3], W), ("abajo", m[-3:], W), ("izquierda", m[:, :3], H), ("derecha", m[:, -3:], H)):
            toca = franja.max(axis=0 if lado in ("arriba", "abajo") else 1).sum() / largo
            if toca > 0.12:
                problemas.append(f"toca el borde {lado} ({toca * 100:.0f}%)")
    filas.append({"efecto": c["efecto"], "area": round(float(area), 4), "problemas": problemas})
    # miniatura: contorno de lo que pintó el efecto (rojo) y la cara (verde)
    vis = fx.copy()
    cont, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(vis, cont, -1, (0, 0, 255), max(2, W // 400))
    if caja:
        cv2.rectangle(vis, caja[:2], caja[2:], (0, 220, 0), max(2, W // 400))
    esc = 420 / max(W, H)
    vis = cv2.resize(vis, (int(W * esc), int(H * esc)), interpolation=cv2.INTER_AREA)
    color = (0, 0, 230) if problemas else (40, 160, 40)
    cv2.rectangle(vis, (0, 0), (vis.shape[1], 26), color, -1)
    cv2.putText(vis, c["efecto"][:34], (6, 19), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)
    fotos.append(vis)

if fotos:
    h = max(f.shape[0] for f in fotos); w = max(f.shape[1] for f in fotos)
    fotos = [cv2.copyMakeBorder(f, 4, h - f.shape[0] + 4, 4, w - f.shape[1] + 4, cv2.BORDER_CONSTANT, value=(30, 30, 30)) for f in fotos]
    cols = 4 if w < h else 3
    while len(fotos) % cols:
        fotos.append(np.full_like(fotos[0], 30))
    hoja = np.vstack([np.hstack(fotos[i:i + cols]) for i in range(0, len(fotos), cols)])
    cv2.imwrite(sys.argv[2], hoja, [cv2.IMWRITE_JPEG_QUALITY, 85])
print(json.dumps(filas, ensure_ascii=False))
