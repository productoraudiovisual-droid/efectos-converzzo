"""Estabiliza un video grabado a mano: quita el temblor y deja un movimiento de cámara suave.
Uso: python estabilizar.py video.mp4 salida.mp4 [fuerza 0.5..3] [desde] [hasta]
Método: sigue detalles del fondo cuadro a cuadro (flujo óptico + RANSAC), arma el recorrido de la cámara, lo suaviza
y corrige cada cuadro con un pequeño zoom para que no se vean bordes negros. Fuera de [desde, hasta] el video queda igual
(con entrada y salida suave de la corrección). El audio se copia sin tocar.
"""
import json, subprocess, sys
import cv2
import numpy as np

video, salida = sys.argv[1], sys.argv[2]
fuerza = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:stream_side_data=rotation",
                                "-of", "json", video], capture_output=True, text=True).stdout)["streams"][0]
a, b = (int(x) for x in pr["r_frame_rate"].split("/"))
fps = a / (b or 1)
W, H = pr["width"], pr["height"]
if abs(int((pr.get("side_data_list") or [{}])[0].get("rotation", 0) or 0)) == 90:
    W, H = H, W
desde = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
hasta = float(sys.argv[5]) if len(sys.argv) > 5 else 1e9


def cuadros(ancho, alto, gris=False):
    cmd = ["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={ancho}:{alto}", "-f", "rawvideo", "-pix_fmt", "gray" if gris else "rgb24", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    tam = ancho * alto * (1 if gris else 3)
    while True:
        buf = p.stdout.read(tam)
        if len(buf) < tam:
            break
        yield np.frombuffer(buf, np.uint8).reshape((alto, ancho) if gris else (alto, ancho, 3))
    p.stdout.close(); p.wait()


# 1. movimiento entre cuadros (a 640 px, más rápido y suficiente)
esc = 640 / max(W, H)
w, h = int(W * esc) // 2 * 2, int(H * esc) // 2 * 2
movs, prev = [], None
for g in cuadros(w, h, gris=True):
    if prev is not None:
        p0 = cv2.goodFeaturesToTrack(prev, 300, 0.01, 12)
        m = None
        if p0 is not None and len(p0) >= 10:
            p1, ok, _ = cv2.calcOpticalFlowPyrLK(prev, g, p0, None, winSize=(21, 21), maxLevel=3)
            ok = ok.reshape(-1) == 1
            if ok.sum() >= 10:
                c = np.array([w / 2, h / 2], np.float32)          # medido desde el centro: así giro y desplazamiento no se mezclan
                m, _ = cv2.estimateAffinePartial2D(p0[ok] - c, p1[ok] - c, method=cv2.RANSAC, ransacReprojThreshold=3)
        if m is None:
            movs.append((0.0, 0.0, 0.0, 0.0))
        else:
            movs.append((m[0, 2] / esc, m[1, 2] / esc, float(np.arctan2(m[1, 0], m[0, 0])), float(np.log(np.hypot(m[0, 0], m[1, 0])))))
    prev = g
n = len(movs) + 1
mv = np.array([(0, 0, 0, 0)] + movs, np.float64)
camino = np.cumsum(mv, axis=0)                       # recorrido de la cámara (x, y, giro, escala)

# 2. recorrido suave: promedio gaussiano (más fuerza = cámara más quieta)
sigma = max(1.0, fuerza * fps * 0.6)
r = int(sigma * 3)
k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
pad = np.pad(camino, ((r, r), (0, 0)), mode="edge")
suave = np.stack([np.convolve(pad[:, j], k, mode="valid") for j in range(4)], axis=1)
corr = suave - camino
# solo dentro del tramo (con medio segundo de entrada y salida)
t = np.arange(n) / fps
peso = np.clip(np.minimum((t - desde) / 0.5 + 1, (hasta - t) / 0.5 + 1), 0, 1)
corr *= peso[:, None]

# 3. zoom justo para tapar los bordes (máximo 15 %)
mx = np.percentile(np.abs(corr[:, 0]), 98) * 2 / W, np.percentile(np.abs(corr[:, 1]), 98) * 2 / H
zoom = float(min(1.15, 1 + max(mx) + np.percentile(np.abs(corr[:, 2]), 98) * 0.6 + 0.01))
# nunca más corrección de la que tapa el zoom (así no aparecen bordes)
corr[:, 0] = np.clip(corr[:, 0], -(zoom - 1) * W / 2 * 0.95, (zoom - 1) * W / 2 * 0.95)
corr[:, 1] = np.clip(corr[:, 1], -(zoom - 1) * H / 2 * 0.95, (zoom - 1) * H / 2 * 0.95)
corr[:, 2] = np.clip(corr[:, 2], -0.05, 0.05)
print(f"estabilizar: {n} cuadros, zoom {zoom:.3f}", flush=True)

out = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", f"{fps}", "-i", "-",
                        "-i", video, "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-crf", "15", "-preset", "fast", "-pix_fmt", "yuv420p",
                        "-c:a", "copy", "-shortest", salida], stdin=subprocess.PIPE)
for i, img in enumerate(cuadros(W, H)):
    dx, dy, da, ds = corr[min(i, n - 1)]
    s = zoom * np.exp(ds)
    M = cv2.getRotationMatrix2D((W / 2, H / 2), -np.degrees(da), s)   # OpenCV gira al revés que la matriz medida
    M[:, 2] += (dx * s, dy * s)
    out.stdin.write(cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT).tobytes())
out.stdin.close(); out.wait()
