"""Sigue puntos del video (tracking) para que las etiquetas se muevan con el objeto.
Uso: python seguir.py video.mp4 desde hasta fps referencia puntos.json salida.json [carpeta_mascara]
 - puntos.json: [[x, y], ...] normalizados 0..1 sobre el encuadre final, en el segundo "referencia".
 - salida.json: por cada punto, una lista de [x, y] por cuadro desde "desde" hasta "hasta".
Método: flujo óptico Lucas-Kanade sobre varios detalles alrededor de cada punto (se usa la mediana del movimiento,
así un detalle que se pierde no arrastra la etiqueta). Hacia adelante y hacia atrás desde la referencia.
Con carpeta_mascara (cuadros del objeto recortado por sam.py), los detalles se buscan solo dentro del objeto y, si hay
pocos cerca del punto, el punto se mueve con el movimiento de todo el objeto (rotación, escala y desplazamiento).
"""
import functools, json, os, subprocess, sys
import cv2
import numpy as np

video, desde, hasta, fps, ref = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
puntos = json.load(open(sys.argv[6]))
W, H = (int(x) for x in os.environ.get("SALIDA", "1080x1920").split("x"))
ESC = 0.5                                   # se sigue a media resolución (más rápido, igual de preciso para esto)
w, h = int(W * ESC), int(H * ESC)
f0, f1 = round(desde * fps), round(hasta * fps)
fr = max(0, round(ref * fps))
salida_desde, salida_hasta = f0, f1
f0, f1 = min(f0, fr), max(f1, fr)        # se lee también hasta la referencia si queda fuera del tramo
n = max(1, f1 - f0 + 1)
cmd = ["ffmpeg", "-v", "error", "-ss", f"{f0 / fps:.4f}", "-i", video, "-frames:v", str(n),
       "-vf", f"fps={fps},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},scale={w}:{h}",
       "-f", "rawvideo", "-pix_fmt", "gray", "-"]
datos = subprocess.run(cmd, capture_output=True, check=True).stdout
cuadros = [np.frombuffer(datos[i * w * h:(i + 1) * w * h], np.uint8).reshape(h, w) for i in range(len(datos) // (w * h))]
if not cuadros:
    sys.exit("No pude leer cuadros del video.")
n = len(cuadros)
iref = min(n - 1, max(0, round(ref * fps) - f0))
RADIO = int(min(w, h) * 0.06)
CARPETA = sys.argv[8] if len(sys.argv) > 8 else None
NUCLEO = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))


def objeto(i):
    """Máscara del objeto en el cuadro i (o None si no hay)."""
    if not CARPETA:
        return None
    ruta = os.path.join(CARPETA, f"{f0 + i:06d}.webp")
    if not os.path.exists(ruta):
        return None
    a = cv2.imread(ruta, cv2.IMREAD_UNCHANGED)
    if a is None or a.ndim < 3 or a.shape[2] < 4:
        return None
    m = cv2.resize(a[..., 3], (w, h), interpolation=cv2.INTER_AREA)
    return cv2.dilate((m > 127).astype(np.uint8) * 255, NUCLEO)


MASCARAS = [objeto(i) for i in range(n)] if CARPETA else [None] * n
LK = dict(winSize=(21, 21), maxLevel=3, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))


def detalles(img, p, i):
    m = np.zeros_like(img)
    cv2.circle(m, (int(p[0]), int(p[1])), RADIO, 255, -1)
    if MASCARAS[i] is not None and cv2.countNonZero(cv2.bitwise_and(m, MASCARAS[i])) > 30:
        m = cv2.bitwise_and(m, MASCARAS[i])
    d = cv2.goodFeaturesToTrack(img, 25, 0.01, 4, mask=m)
    return d if d is not None else np.array([[p]], np.float32)


@functools.lru_cache(maxsize=None)
def mov_objeto(a, b):
    """Movimiento de todo el objeto entre los cuadros a y b (rotación + escala + desplazamiento), o None."""
    if MASCARAS[a] is None:
        return None
    d = cv2.goodFeaturesToTrack(cuadros[a], 200, 0.01, 6, mask=MASCARAS[a])
    if d is None or len(d) < 8:
        return None
    nuevos, ok, _ = cv2.calcOpticalFlowPyrLK(cuadros[a], cuadros[b], d, None, **LK)
    ok = ok.reshape(-1) == 1
    if ok.sum() < 8:
        return None
    M, _ = cv2.estimateAffinePartial2D(d[ok], nuevos[ok], method=cv2.RANSAC, ransacReprojThreshold=2.0)
    return M


def recorrer(orden):
    pos = {}
    for k, (x, y) in enumerate(puntos):
        p = np.array([x * w, y * h], np.float32)
        feats = detalles(cuadros[orden[0]], p, orden[0])
        pos[(k, orden[0])] = p.copy()
        for a, b in zip(orden[:-1], orden[1:]):
            nuevos, ok, _ = cv2.calcOpticalFlowPyrLK(cuadros[a], cuadros[b], feats, None, **LK)
            ok = ok.reshape(-1) == 1
            M = mov_objeto(a, b) if ok.sum() < 6 else None
            if M is not None:                                   # pocos detalles junto al punto: se mueve con el objeto
                p = M[:, :2] @ p + M[:, 2]
                feats = detalles(cuadros[b], p, b)
            elif ok.sum() >= 3:
                mov = np.median((nuevos[ok] - feats[ok]).reshape(-1, 2), axis=0)
                p = p + mov
                feats = nuevos[ok].reshape(-1, 1, 2)
            if len(feats) < 8 or (b - orden[0]) % 10 == 0:     # se renuevan los detalles cada 10 cuadros
                feats = detalles(cuadros[b], p, b)
            p = np.clip(p, [0, 0], [w - 1, h - 1])
            pos[(k, b)] = p.copy()
    return pos


adelante = recorrer(list(range(iref, n)))
atras = recorrer(list(range(iref, -1, -1)))
salida = []
for k in range(len(puntos)):
    pista = np.array([(adelante.get((k, i)) if i >= iref else atras.get((k, i))) for i in range(n)], np.float32)
    # suavizado leve para que la etiqueta no tiemble
    suave = np.copy(pista)
    for i in range(n):
        a, b = max(0, i - 2), min(n, i + 3)
        suave[i] = pista[a:b].mean(axis=0)
    suave = suave[salida_desde - f0: salida_hasta - f0 + 1]    # solo el tramo del efecto
    salida.append([[round(float(x / w), 4), round(float(y / h), 4)] for x, y in suave])
json.dump(salida, open(sys.argv[7], "w"))
print(f"seguir: {len(puntos)} puntos, {n} cuadros")
