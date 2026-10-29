"""Convierte un cuadro del video (o una foto) en capas por profundidad para el efecto parallax 3D.
Uso: python profundidad.py video_o_imagen segundo carpeta_salida [capas]
Guarda capa0.png (fondo, opaca) … capaN.png (lo más cercano, con transparencia) y capas.json con la profundidad de cada una.
Profundidad: Depth Anything V2 Small (Apache 2.0). Lo que queda detrás de cada capa se rellena (inpainting) para que
al mover la cámara no aparezcan huecos.
"""
import json, os, subprocess, sys
import cv2
import numpy as np

fuente, seg, salida = sys.argv[1], float(sys.argv[2]), sys.argv[3]
N = max(2, min(5, int(sys.argv[4]) if len(sys.argv) > 4 else 3))
os.makedirs(salida, exist_ok=True)
W, H = (int(x) for x in os.environ.get("SALIDA", "1080x1920").split("x"))
MODELOS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models")

# 1. el cuadro, ya en el encuadre final
crudo = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{seg:.3f}", "-i", fuente, "-frames:v", "1",
                        "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       capture_output=True, check=True).stdout
img = np.frombuffer(crudo[:W * H * 3], np.uint8).reshape(H, W, 3).copy()

# 2. profundidad (más alto = más cerca)
import torch
from transformers import AutoImageProcessor, AutoModelForDepthEstimation
from transformers.utils import logging as tlog
tlog.set_verbosity_error()
REPO = os.environ.get("PROFUNDIDAD_MODELO", "depth-anything/Depth-Anything-V2-Small-hf")
disp = "cuda" if torch.cuda.is_available() else "mps" if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available() else "cpu"
if os.environ.get("EFECTOS_CPU") == "1":
    disp = "cpu"
proc = AutoImageProcessor.from_pretrained(REPO, cache_dir=os.path.join(MODELOS, "hf"))
modelo = AutoModelForDepthEstimation.from_pretrained(REPO, cache_dir=os.path.join(MODELOS, "hf")).to(disp).eval()
with torch.inference_mode():
    out = modelo(**{k: v.to(disp) for k, v in proc(images=img, return_tensors="pt").items()}).predicted_depth
prof = torch.nn.functional.interpolate(out[None], size=(H, W), mode="bicubic", align_corners=False)[0, 0].cpu().numpy()
prof = (prof - np.percentile(prof, 1)) / (np.percentile(prof, 99) - np.percentile(prof, 1) + 1e-6)
prof = np.clip(prof, 0, 1).astype(np.float32)
prof = cv2.bilateralFilter(prof, 9, 0.1, 9)              # bordes de profundidad pegados a los de la imagen

# 3. cortes entre capas donde la profundidad salta (Otsu de varios niveles): así una persona u objeto no queda partido en dos
hist, bordes = np.histogram(prof, bins=64, range=(0, 1))
p_ = hist / hist.sum(); centros = (bordes[:-1] + bordes[1:]) / 2


def mejor_corte(k, desde_i):
    """Mejores k cortes (índices de bin) desde desde_i: maximiza la varianza entre clases (búsqueda recursiva sencilla)."""
    if k == 0:
        return 0.0, []
    mejor = (-1.0, [])
    for i in range(desde_i + 2, 64 - 2 * k + 1, 1 if k == 1 else 2):
        w = p_[desde_i:i].sum()
        mu = (p_[desde_i:i] * centros[desde_i:i]).sum() / max(w, 1e-9)
        resto, cs = mejor_corte(k - 1, i)
        if k == 1:
            w2 = p_[i:].sum(); mu2 = (p_[i:] * centros[i:]).sum() / max(w2, 1e-9)
            resto = w2 * mu2 * mu2
        v = w * mu * mu + resto
        if v > mejor[0]:
            mejor = (v, [i] + cs)
    return mejor


cortes = [float(bordes[i]) for i in mejor_corte(N - 1, 0)[1]]
e = 0.03
CH = 512 / max(W, H)
cw, ch = int(W * CH), int(H * CH)


def rellenar(base, tapar):
    """Rellena (inpainting) lo que hay en 'tapar' a baja resolución y lo mezcla suave con la imagen."""
    if not tapar.any():
        return base
    m = cv2.resize(tapar.astype(np.uint8) * 255, (cw, ch), interpolation=cv2.INTER_NEAREST)
    m = cv2.dilate(m, np.ones((7, 7), np.uint8))
    chico = cv2.inpaint(cv2.resize(base, (cw, ch), interpolation=cv2.INTER_AREA), m, 9, cv2.INPAINT_TELEA)
    chico = cv2.GaussianBlur(chico, (0, 0), 1.2)
    grande = cv2.resize(chico, (W, H), interpolation=cv2.INTER_CUBIC)
    a = cv2.GaussianBlur(cv2.resize(m, (W, H)).astype(np.float32) / 255, (0, 0), 3)[..., None]
    return (base * (1 - a) + grande * a).astype(np.uint8)


capas = []
for i in range(N):
    desde = cortes[i - 1] if i > 0 else -1.0
    cerca = prof >= (cortes[i] if i < N - 1 else 2.0)     # lo que va delante de esta capa: se rellena por detrás
    rgb = rellenar(img, cerca)
    alfa = np.ones((H, W), np.float32) if i == 0 else np.clip((prof - (desde - e)) / (2 * e), 0, 1)
    alfa = cv2.GaussianBlur(alfa, (0, 0), 1.5)
    cv2.imwrite(os.path.join(salida, f"capa{i}.png"), cv2.cvtColor(np.dstack([rgb, (alfa * 255).astype(np.uint8)]), cv2.COLOR_RGBA2BGRA))
    lo, hi = (0.0 if i == 0 else cortes[i - 1]), (1.0 if i == N - 1 else cortes[i])
    capas.append(round((lo + hi) / 2, 3))
json.dump({"capas": capas}, open(os.path.join(salida, "capas.json"), "w"))
print(f"profundidad: {N} capas ({disp})")
