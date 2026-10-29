"""Segmenta y sigue objetos del video con SAM 2.1 (Meta, Apache 2.0) a partir de un punto o una caja.
Uso: python sam.py video.mp4 desde hasta fps referencia objetos.json carpeta_salida
 - objetos.json: [{"punto": [x, y]} o {"caja": [x0, y0, x1, y1]}, con "negativos": [[x, y], ...] opcional], normalizados 0..1
   sobre el encuadre final, en el segundo "referencia" (donde se ve bien el objeto).
 - Guarda en la carpeta:
     000123.webp  el cuadro con transparencia (solo el objeto, o la unión de los objetos), igual que recorte.py
     pista.json   {"desde": cuadro, "pista": [por objeto: [x, y, ancho, alto, area] por cuadro, 0..1]}
 - SAM_CUADROS="120,245": solo esos cuadros (fotos de control rápidas).
 - SAM_PASO=n: SAM cada n cuadros y flujo óptico entre medias. Por defecto 1 con tarjeta gráfica y 2 sin ella.
 - SAM_CACHE=archivo.npz: guarda/reutiliza las máscaras de SAM (varios efectos sobre el mismo objeto no repiten el cálculo).
 - SAM_MODELO: modelo de Hugging Face (por defecto facebook/sam2.1-hiera-small).
 - SAM_SALIDA: "recorte" (por defecto, el objeto con su color), "pixelar:N" (el objeto pixelado en bloques de N px)
   o "desenfocar:N" (el objeto desenfocado). SAM_FORMA: "mascara" (la silueta, por defecto) o "caja" (rectángulo redondeado).
Va hacia adelante y hacia atrás desde la referencia con memoria constante, así que sirve para videos largos.
"""
import json, os, subprocess, sys, time
import cv2
import numpy as np

video, desde, hasta, fps, ref = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
objetos = json.load(open(sys.argv[6]))
salida = sys.argv[7]
os.makedirs(salida, exist_ok=True)
W, H = (int(x) for x in os.environ.get("SALIDA", "1080x1920").split("x"))
MODELOS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models")

import torch
from transformers import Sam2VideoModel, Sam2VideoProcessor
from transformers.utils import logging as tlog
tlog.set_verbosity_error()

if os.environ.get("EFECTOS_CPU") == "1":
    disp = "cpu"
elif torch.cuda.is_available():
    disp = "cuda"
elif getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
    disp = "mps"
else:
    disp = "cpu"
TIPO = torch.bfloat16 if disp == "cuda" else torch.float32
PASO = max(1, int(os.environ.get("SAM_PASO") or (1 if disp != "cpu" else 2)))
REPO = os.environ.get("SAM_MODELO", "facebook/sam2.1-hiera-small")
print(f"acelerador: {disp} (SAM 2.1, cada {PASO} cuadro{'s' if PASO > 1 else ''})", file=sys.stderr, flush=True)
try:
    modelo = Sam2VideoModel.from_pretrained(REPO, cache_dir=os.path.join(MODELOS, "hf")).to(disp, dtype=TIPO).eval()
except Exception:
    if disp == "cpu":
        raise
    disp, TIPO = "cpu", torch.float32           # si la tarjeta gráfica no puede, sigue en el procesador
    modelo = Sam2VideoModel.from_pretrained(REPO, cache_dir=os.path.join(MODELOS, "hf")).eval()
proc = Sam2VideoProcessor.from_pretrained(REPO, cache_dir=os.path.join(MODELOS, "hf"))

f0, f1 = round(desde * fps), round(hasta * fps) + 1
fr = max(0, round(ref * fps))                          # la referencia puede estar fuera del tramo: SAM arranca ahí y llega hasta él
SOLO = sorted(f for f in (int(x) for x in os.environ.get("SAM_CUADROS", "").split(",") if x.strip().isdigit()) if f0 <= f <= f1)
ESC = min(1.0, 1024 / max(W, H))                       # lo que ve SAM (trabaja a 1024)
w, h = int(W * ESC) // 2 * 2, int(H * ESC) // 2 * 2
EM = 512 / max(W, H)                                   # tamaño al que se guardan las máscaras entre pasos
mw, mh = int(W * EM) // 2 * 2, int(H * EM) // 2 * 2


def leer(a, b):
    """Cuadros a..b (inclusive) al tamaño final, recortados igual que el video de salida."""
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{a / fps:.4f}", "-i", video, "-frames:v", str(b - a + 1),
           "-vf", f"fps={fps},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    f = a
    while f <= b:
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        yield f, np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        f += 1
    p.stdout.close(); p.wait()


def hacia_atras(a, b, bloque=48):
    """Cuadros de b hacia a (b >= a), leyendo por bloques para no guardar todo el video en memoria."""
    fin = b
    while fin >= a:
        ini = max(a, fin - bloque + 1)
        yield from reversed(list(leer(ini, fin)))
        fin = ini - 1


def entradas(k):
    o = objetos[k]
    kw = {}
    pts = ([[float(o["punto"][0]) * w, float(o["punto"][1]) * h]] if "punto" in o else []) + [[float(x) * w, float(y) * h] for x, y in o.get("negativos", [])]
    if pts:
        kw.update(input_points=[[pts]], input_labels=[[[1] * (1 if "punto" in o else 0) + [0] * len(o.get("negativos", []))]])
    if "caja" in o:
        x0, y0, x1, y1 = o["caja"]
        kw.update(input_boxes=[[[x0 * w, y0 * h, x1 * w, y1 * h]]])
    return kw


def podar(ses, idx):
    """Memoria constante: borra cuadros y salidas viejas que SAM ya no usa."""
    if ses.processed_frames:
        for k in [k for k in ses.processed_frames if k < idx - 1]:
            del ses.processed_frames[k]
    for d in ses.output_dict_per_obj.values():
        nc = d["non_cond_frame_outputs"]
        for k in [k for k in nc if k < idx - 20]:
            del nc[k]


claves = {}                                            # máscaras de SAM por cuadro (uint8, n x mh x mw)
CACHE = os.environ.get("SAM_CACHE")
completo = None                                        # (paso, desde, hasta) si la caché tiene una pasada completa
if CACHE and os.path.exists(CACHE):
    try:
        z = np.load(CACHE)
        claves = {int(k[2:]): z[k] for k in z.files if k.startswith("m_")}
        completo = tuple(int(x) for x in z["completo"]) if "completo" in z.files else None
        if claves and next(iter(claves.values())).shape[1:] != (mh, mw):
            claves, completo = {}, None
    except Exception:
        claves, completo = {}, None


def recorrer(cuadros, quiero):
    """SAM en streaming. 'cuadros' empieza en la referencia; corre solo en los que cumplen 'quiero'."""
    ses = proc.init_video_session(inference_device=disp, dtype=TIPO)
    i = 0
    with torch.inference_mode():
        for f, img in cuadros:
            if not quiero(f):
                continue
            chico = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)
            inp = proc(images=chico, device=disp, return_tensors="pt")
            if i == 0:
                for k in range(len(objetos)):
                    proc.add_inputs_to_inference_session(ses, frame_idx=0, obj_ids=k + 1, original_size=inp.original_sizes[0], **entradas(k))
            out = modelo(inference_session=ses, frame=inp.pixel_values[0].to(TIPO), frame_idx=i)
            m = proc.post_process_masks([out.pred_masks.float()], original_sizes=[[mh, mw]], binarize=False)[0]
            claves[f] = (torch.sigmoid(m[:, 0]).cpu().numpy() * 255).astype(np.uint8)
            podar(ses, i)
            i += 1


t0 = time.time()
cubre = completo and completo[0] <= PASO and completo[1] <= f0 and completo[2] >= f1
if SOLO:
    if not (cubre or all(f in claves for f in SOLO)):
        # fotos de control: SAM salta de a 3 cuadros desde la referencia hasta cada cuadro pedido
        paso = max(PASO, 3)
        ade = set(range(fr, max(SOLO + [fr]) + 1, paso)) | {f for f in SOLO if f >= fr}
        atr = set(range(fr, min(SOLO + [fr]) - 1, -paso)) | {f for f in SOLO if f <= fr}
        recorrer(((f, img) for a in sorted(ade) for f, img in leer(a, a)), lambda f: True)
        if len(atr) > 1:
            recorrer(((f, img) for a in sorted(atr, reverse=True) for f, img in leer(a, a)), lambda f: True)
    else:
        print("sam: máscaras en caché", file=sys.stderr, flush=True)
elif not cubre:
    claves = {}
    extremos = (f0, f1)
    if f1 > fr or fr == f0:
        recorrer(leer(fr, f1), lambda f: (f - fr) % PASO == 0 or f in extremos)
    if f0 < fr:
        recorrer(hacia_atras(f0, fr), lambda f: (fr - f) % PASO == 0 or f in extremos)
    completo = (PASO, f0, f1)
else:
    print("sam: máscaras en caché", file=sys.stderr, flush=True)
print(f"sam: {len(claves)} cuadros clave en {time.time() - t0:.0f} s", file=sys.stderr, flush=True)
if CACHE:
    try:
        extra = {"completo": np.array(completo)} if completo else {}
        np.savez_compressed(CACHE + ".tmp.npz", **{f"m_{k}": v for k, v in claves.items()}, **extra)
        os.replace(CACHE + ".tmp.npz", CACHE)
    except Exception as e:
        print(f"sam: no pude guardar la caché ({e})", file=sys.stderr)
if not SOLO:
    claves = {k: v for k, v in claves.items() if f0 <= k <= f1}
orden = sorted(claves)
if not orden:
    sys.exit("SAM no pudo leer cuadros del video.")


def guiado(guia, m, r=6, eps=1e-3):
    """Filtro guiado: pega el borde de la máscara a los bordes reales de la imagen."""
    caja = lambda x: cv2.boxFilter(x, -1, (2 * r + 1, 2 * r + 1))
    mi, mm = caja(guia), caja(m)
    a = (caja(guia * m) - mi * mm) / (caja(guia * guia) - mi * mi + eps)
    b = mm - a * mi
    return np.clip(caja(a) * guia + caja(b), 0, 1)


dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
malla = np.dstack(np.meshgrid(np.arange(mw, dtype=np.float32), np.arange(mh, dtype=np.float32)))


def llevar(m, gris_de, gris_a):
    """Mueve la máscara de un cuadro clave al cuadro actual con flujo óptico."""
    mapa = malla + dis.calc(gris_a, gris_de, None)
    return np.stack([cv2.remap(c, mapa[..., 0], mapa[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE) for c in m])


# máscara final de cada cuadro: la de SAM o, entre cuadros clave, la de los dos vecinos llevada con flujo óptico
MODO, _, VALOR = os.environ.get("SAM_SALIDA", "recorte").partition(":")
VALOR = float(VALOR or (24 if MODO == "pixelar" else 30))
CAJA = os.environ.get("SAM_FORMA") == "caja"


def tapar(img, union):
    """Para pixelar o desenfocar: imagen tratada y máscara un poco más grande que el objeto (que no se asome nada)."""
    if MODO == "pixelar":
        b = max(4, int(VALOR * W / 1080))
        chico = cv2.resize(img, (max(1, W // b), max(1, H // b)), interpolation=cv2.INTER_AREA)
        out = cv2.resize(chico, (W, H), interpolation=cv2.INTER_NEAREST)
    else:
        out = cv2.GaussianBlur(img, (0, 0), VALOR * W / 1080)
    duro = (union > 0.4).astype(np.uint8)
    if CAJA and duro.any():
        ys, xs = np.nonzero(duro)
        pad = int(0.04 * max(W, H))
        x0, y0, x1, y1 = max(0, xs.min() - pad), max(0, ys.min() - pad), min(W - 1, xs.max() + pad), min(H - 1, ys.max() + pad)
        duro = np.zeros_like(duro)
        r = int(min(x1 - x0, y1 - y0) * 0.12)
        cv2.rectangle(duro, (x0 + r, y0), (x1 - r, y1), 1, -1); cv2.rectangle(duro, (x0, y0 + r), (x1, y1 - r), 1, -1)
        for cx, cy in ((x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)):
            cv2.circle(duro, (cx, cy), r, 1, -1)
    else:
        k = int(0.012 * max(W, H)) | 1
        duro = cv2.dilate(duro, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    alfa = cv2.GaussianBlur(duro.astype(np.float32), (0, 0), max(1.5, 0.002 * max(W, H)))
    return out, alfa


pista = [[None] * (f1 - f0 + 1) for _ in objetos]
previo, hechos = None, 0
gris = lambda img: cv2.cvtColor(cv2.resize(img, (mw, mh), interpolation=cv2.INTER_AREA), cv2.COLOR_RGB2GRAY)


def emitir(f, img, m):
    global previo, hechos
    for k in range(len(objetos)):               # caja de cada objeto (para lupa, foco, etiquetas que lo siguen…)
        ys, xs = np.nonzero(m[k] > 0.5)
        if len(xs) > 8:
            x0, x1, y0, y1 = xs.min() / mw, xs.max() / mw, ys.min() / mh, ys.max() / mh
            pista[k][f - f0] = [round((x0 + x1) / 2, 4), round((y0 + y1) / 2, 4), round(x1 - x0, 4), round(y1 - y0, 4), round(len(xs) / (mw * mh), 5)]
    union = cv2.resize(m.max(axis=0), (W, H), interpolation=cv2.INTER_CUBIC)
    union = guiado(cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255, np.clip(union, 0, 1))
    union = np.clip((union - 0.5) * 1.8 + 0.5, 0, 1)
    if previo is not None and not SOLO:
        union = 0.75 * union + 0.25 * previo     # menos parpadeo en el borde
    previo = union
    if MODO != "recorte":
        img, union = tapar(img, union)
    rgba = np.dstack([img, (union * 255).astype(np.uint8)])
    cv2.imwrite(os.path.join(salida, f"{f:06d}.webp"), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_WEBP_QUALITY, 92])
    hechos += 1


# máscara de cada cuadro: la de SAM o, entre cuadros clave, la de los dos vecinos llevada con flujo óptico.
# Los cuadros entre dos claves esperan en 'pendientes' hasta leer la clave siguiente.
mascara = lambda f: claves[f].astype(np.float32) / 255
if SOLO:
    for f in SOLO:
        for _, img in leer(f, f):
            if f in claves:
                emitir(f, img, mascara(f))
            else:                                # cuadro entre claves de una pasada completa: se lleva desde la clave más cercana
                k = min(claves, key=lambda x: abs(x - f))
                _, ik = next(leer(k, k))
                emitir(f, img, llevar(mascara(k), gris(ik), gris(img)))
else:
    ant, g_ant, pendientes = None, None, []
    for f, img in leer(f0, f1):
        if f not in claves:
            pendientes.append((f, img, gris(img)))
            continue
        g = gris(img)
        for fp, ip, gp in pendientes:
            mb = llevar(mascara(f), g, gp)
            if ant is None:
                emitir(fp, ip, mb)
            else:
                p = (fp - ant) / (f - ant)
                emitir(fp, ip, (1 - p) * llevar(mascara(ant), g_ant, gp) + p * mb)
        pendientes = []
        emitir(f, img, mascara(f))
        ant, g_ant = f, g
    for fp, ip, gp in pendientes:              # después de la última clave (video más corto de lo esperado)
        emitir(fp, ip, llevar(mascara(ant), g_ant, gp))

# objeto tapado un momento: se mantiene la última posición conocida
for k in range(len(objetos)):
    ult = next((p for p in pista[k] if p), None)
    for i, p in enumerate(pista[k]):
        if p:
            ult = p
        elif not SOLO:
            pista[k][i] = ult
json.dump({"desde": f0, "pista": pista}, open(os.path.join(salida, "pista.json"), "w"))
print(f"sam: {len(objetos)} objeto(s), {hechos} cuadros, {time.time() - t0:.0f} s")
