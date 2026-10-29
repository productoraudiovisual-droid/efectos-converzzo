"""Recorta a la persona del fondo en un tramo del video y guarda WebP con transparencia (1080x1920).
Uso: python recorte.py video.mp4 desde hasta fps carpeta_salida [collage]
Con "collage" la persona sale ya convertida en papel impreso (trama de puntos, borde blanco y sombra) para collage-halftone.
Cada imagen se llama con su número de frame (000123.webp). Lo usan dolly-zoom y los efectos de fondo.
Modelo principal: Robust Video Matting (ResNet50, GPL-3.0, se descarga al instalar): recorte preciso y estable entre cuadros.
Si no está, usa MediaPipe Selfie Segmenter (Apache 2.0).
"""
import os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.core.base_options import BaseOptions

video, desde, hasta, fps, salida = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
COLLAGE = len(sys.argv) > 6 and sys.argv[6] == "collage"
OBJETO = len(sys.argv) > 6 and sys.argv[6] == "objeto"      # recorta el objeto principal (un plato, un producto) en vez de la persona
VERDE = len(sys.argv) > 6 and sys.argv[6] == "verde"        # pantalla verde (o azul): clave de color, sin modelos
os.makedirs(salida, exist_ok=True)
W, H = (int(x) for x in os.environ.get("SALIDA", "1080x1920").split("x"))   # tamaño del video final
MODELOS = os.path.join(os.path.dirname(__file__), "..", "models")
RVM = os.path.join(MODELOS, "rvm_resnet50_fp32.onnx")
USAR_RVM = os.path.exists(RVM) and os.path.getsize(RVM) > 50_000_000 and not OBJETO and not VERDE
if USAR_RVM:
    from gpu import Sesion
    rvm = Sesion(RVM)
    estado = [np.zeros([1, 1, 1, 1], np.float32)] * 4
    DSR = np.array([0.25 if max(W, H) >= 1600 else 0.4], np.float32)
elif not VERDE:
    seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
        base_options=BaseOptions(model_asset_path=os.path.join(MODELOS, "selfie_segmenter.tflite")), running_mode=vision.RunningMode.VIDEO,
        output_confidence_masks=True, output_category_mask=False))
if OBJETO:
    # objeto principal: U2-Net (objeto + lo que lo sostiene) e IS-Net (solo el objeto); se descargan la primera vez
    import urllib.request
    from gpu import Sesion
    def modelo(nombre):
        ruta = os.path.join(MODELOS, nombre)
        if not os.path.exists(ruta) or os.path.getsize(ruta) < 50_000_000:
            print(f"Descargando {nombre} (solo la primera vez)...", flush=True)
            urllib.request.urlretrieve(f"https://github.com/danielgatis/rembg/releases/download/v0.0.0/{nombre}", ruta + ".tmp")
            os.replace(ruta + ".tmp", ruta)
        return Sesion(ruta)
    u2 = modelo("u2net.onnx")
    isn = modelo("isnet-general-use.onnx")

    def mapa(sesion, rgb, lado, media, desv):
        x = (cv2.resize(rgb, (lado, lado)).astype(np.float32) / 255 - media) / desv
        o = sesion.run(None, {sesion.get_inputs()[0].name: x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0, 0]
        o = (o - o.min()) / (o.max() - o.min() + 1e-6)
        return cv2.resize(o, (W, H))
    BORDE_OBJ = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(min(W, H) * 0.07) | 1,) * 2)

    def mascara_objeto(rgb, casco_previo):
        u = mapa(u2, rgb, 320, (0.485, 0.456, 0.406), (0.229, 0.224, 0.225))
        casco = casco_previo
        if casco is None or mascara_objeto.k % 2 == 0:          # IS-Net cada 2 cuadros (el objeto se mueve despacio)
            i = mapa(isn, rgb, 1024, (0.5, 0.5, 0.5), (1, 1, 1))
            n_, et, st, _ = cv2.connectedComponentsWithStats((i > 0.5).astype(np.uint8), 8)
            if n_ > 1:
                grande = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
                pts = cv2.findNonZero((et == grande).astype(np.uint8))
                casco = np.zeros((H, W), np.uint8)
                cv2.fillConvexPoly(casco, cv2.convexHull(pts), 1)
        mascara_objeto.k += 1
        if casco is None:
            return u, None
        zona = cv2.GaussianBlur(cv2.dilate(casco, BORDE_OBJ).astype(np.float32), (0, 0), 4)
        m = np.maximum(cv2.GaussianBlur(casco.astype(np.float32), (0, 0), 2), u * zona)   # dentro del objeto + su borde real (sin las manos)
        return np.clip(m, 0, 1), casco
    mascara_objeto.k = 0
    casco = None
NUCLEO_LIMPIEZA = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))

# ---- pantalla verde: el color de fondo se mide solo (o viene en CLAVE="#00b140") ----
clave_cbcr = None


def color_clave(rgb):
    """Color del fondo: el promedio de los pixeles más saturados del borde del cuadro (donde casi siempre está la tela)."""
    if os.environ.get("CLAVE"):
        h = os.environ["CLAVE"].lstrip("#")
        c = np.array([[[int(h[i:i + 2], 16) for i in (0, 2, 4)]]], np.uint8)
    else:
        b = max(8, min(W, H) // 12)
        borde = np.concatenate([rgb[:b].reshape(-1, 3), rgb[-b:].reshape(-1, 3), rgb[:, :b].reshape(-1, 3), rgb[:, -b:].reshape(-1, 3)])
        ycc = cv2.cvtColor(borde[None], cv2.COLOR_RGB2YCrCb)[0].astype(np.float32)
        sat = np.hypot(ycc[:, 1] - 128, ycc[:, 2] - 128)
        c = borde[sat >= np.percentile(sat, 60)].mean(axis=0).astype(np.uint8)[None, None]
    return cv2.cvtColor(c, cv2.COLOR_RGB2YCrCb)[0, 0, 1:].astype(np.float32)


def mascara_verde(rgb):
    global clave_cbcr
    if clave_cbcr is None:
        clave_cbcr = color_clave(rgb)
    ycc = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb).astype(np.float32)
    d = np.hypot(ycc[..., 1] - clave_cbcr[0], ycc[..., 2] - clave_cbcr[1])     # distancia al color de la tela
    t1, t2 = 18.0, 42.0                                                        # tolerancia y suavidad del borde
    a = np.clip((d - t1) / (t2 - t1), 0, 1)
    a = cv2.morphologyEx(a, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))           # quita puntitos sueltos
    a = suavizar_bordes(ycc[..., 0] / 255, a, r=4, eps=1e-3)
    # quitar el reflejo verde (despill): el canal dominante del fondo no puede pasar del promedio de los otros dos
    f = rgb.astype(np.float32)
    dom = int(np.argmax(cv2.cvtColor(np.array([[[128, *clave_cbcr]]], np.uint8).astype(np.uint8), cv2.COLOR_YCrCb2RGB)[0, 0]))
    otros = [i for i in range(3) if i != dom]
    tope = f[..., otros].mean(axis=2)
    f[..., dom] = np.minimum(f[..., dom], tope + 6)
    return a, f.astype(np.uint8)


def solo_personas(m):
    """Quita manchas sueltas del fondo: deja la figura principal (y otras personas grandes)."""
    n, etiquetas, stats, _ = cv2.connectedComponentsWithStats((m > 0.5).astype(np.uint8), 8)
    if n <= 2:
        return m
    areas = stats[1:, cv2.CC_STAT_AREA]
    grande = areas.max()
    quedan = np.isin(etiquetas, [k + 1 for k, a in enumerate(areas) if a >= grande * 0.25]).astype(np.uint8)
    zona = cv2.GaussianBlur(cv2.dilate(quedan, NUCLEO_LIMPIEZA).astype(np.float32), (0, 0), 6)
    return m * np.clip(zona, 0, 1)


def suavizar_bordes(guia, m, r=8, eps=2e-3):
    """Filtro guiado: pega el borde de la máscara a los bordes reales de la imagen (pelo, hombros)."""
    caja = lambda x: cv2.boxFilter(x, -1, (2 * r + 1, 2 * r + 1))
    mi, mm = caja(guia), caja(m)
    a = (caja(guia * m) - mi * mm) / (caja(guia * guia) - mi * mi + eps)
    b = mm - a * mi
    return np.clip(caja(a) * guia + caja(b), 0, 1)


# ---- estilo collage: trama de puntos real (el tamaño del punto depende de la luz), borde blanco de tijera y sombra ----
CELDA = 9 if H > W else 7     # puntos un poco más finos en horizontal (la cara sale más grande)
yy, xx = np.mgrid[0:H, 0:W]
dx = (xx % CELDA) - CELDA / 2 + 0.5
dy = (yy % CELDA) - CELDA / 2 + 0.5
DIST = np.sqrt(dx * dx + dy * dy)
NUCLEO = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19))


def collage(rgb, m):
    gris = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    gris = np.clip((gris - 0.5) * 1.5 + 0.55, 0, 1)
    celdas = cv2.resize(gris, (W // CELDA + 1, H // CELDA + 1), interpolation=cv2.INTER_AREA)
    lum = cv2.resize(celdas, (W // CELDA + 1, H // CELDA + 1))[yy // CELDA, xx // CELDA]
    radio = (1 - lum) * CELDA * 0.72
    tinta = np.clip(radio - DIST + 0.5, 0, 1)                   # punto con borde suave
    papel = np.array([242, 236, 226], np.float32)
    color = papel[None, None, :] * (1 - tinta[..., None]) + np.array([27, 27, 27], np.float32) * tinta[..., None]
    dentro = (m > 0.5).astype(np.uint8)
    borde = cv2.dilate(dentro, NUCLEO)
    corrida = np.zeros_like(borde, np.float32)
    corrida[16:] = borde[:-16]                                    # sombra 16 px más abajo (sin dar la vuelta)
    sombra = cv2.GaussianBlur(corrida, (0, 0), 9) * 0.38
    a_persona = m
    a_borde = borde.astype(np.float32)
    salida = np.zeros((H, W, 4), np.float32)
    # sombra (negra) -> borde (blanco) -> persona (trama)
    salida[..., 3] = np.maximum(sombra, a_borde)
    blanco = np.full((H, W, 3), 255, np.float32)
    base = blanco * a_borde[..., None]
    salida[..., :3] = color * a_persona[..., None] + base * (1 - a_persona[..., None])
    salida[..., :3] = np.where(a_borde[..., None] > 0, salida[..., :3], 0)
    return np.dstack([salida[..., :3], salida[..., 3] * 255]).clip(0, 255).astype(np.uint8)


f0 = round(desde * fps)
n = max(1, round((hasta - desde) * fps)) + 2
CALENTAR = 12 if USAR_RVM else 0            # RVM usa los cuadros anteriores: arranca un poco antes para que el primero salga limpio
# RECORTE_CUADROS="120,245": solo esos cuadros (fotos de control rápidas); si no, todo el tramo
SOLO = sorted(int(x) for x in os.environ.get("RECORTE_CUADROS", "").split(",") if x.strip().isdigit())


def tramo(a, b, guardar):
    """Procesa los cuadros a..b (inclusive) y guarda los que van desde 'guardar'."""
    global estado, casco
    if USAR_RVM:
        estado = [np.zeros([1, 1, 1, 1], np.float32)] * 4
    if OBJETO:
        casco = None
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{a / fps:.4f}", "-i", video, "-frames:v", str(b - a + 1),
           "-vf", f"fps={fps},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    prev, hechos = None, 0
    for f in range(a, b + 1):
        buf = p.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        if VERDE:
            m, rgb = mascara_verde(rgb)
        elif OBJETO:
            m, casco = mascara_objeto(rgb, casco)
            if prev is not None:
                m = 0.6 * m + 0.4 * prev
            prev = m
        elif USAR_RVM:
            src = (rgb.astype(np.float32) / 255).transpose(2, 0, 1)[None]
            _, pha, *estado = rvm.run(None, {"src": src, "r1i": estado[0], "r2i": estado[1], "r3i": estado[2], "r4i": estado[3], "downsample_ratio": DSR})
            if f < guardar:
                continue
            m = solo_personas(pha[0, 0].astype(np.float32))
        else:
            peq = cv2.resize(rgb, (W // 2, H // 2))
            img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(peq))
            m = seg.segment_for_video(img, int(f * 1000 / fps)).confidence_masks[-1].numpy_view().astype(np.float32)
            m = cv2.resize(m.reshape(m.shape[0], m.shape[1]), (W, H))
            m = suavizar_bordes(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255, m)
            m = np.clip((m - 0.5) * 1.6 + 0.5, 0, 1)
            if prev is not None:
                m = 0.65 * m + 0.35 * prev          # menos parpadeo entre frames
            prev = m
        if f < guardar:
            continue
        rgba = np.dstack([rgb, (m * 255).astype(np.uint8)])
        if COLLAGE:
            rgba = collage(rgb, m)
        cv2.imwrite(os.path.join(salida, f"{f:06d}.webp"), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_WEBP_QUALITY, 92])
        hechos += 1
    p.stdout.close(); p.wait()
    return hechos


casco = None
if SOLO:
    total = sum(tramo(max(0, f - CALENTAR), f, f) for f in SOLO if f0 <= f <= f0 + n)
else:
    total = tramo(max(0, f0 - CALENTAR), f0 + n - 1, f0)
print(f"recorte ({'pantalla verde' if VERDE else 'objeto' if OBJETO else 'RVM' if USAR_RVM else 'MediaPipe'}): {total} cuadros")
