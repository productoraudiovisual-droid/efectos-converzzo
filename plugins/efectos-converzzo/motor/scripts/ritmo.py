"""Encuentra los golpes (beats) de la música o del audio del video.
Uso: python ritmo.py audio_o_video desde hasta [desfase]
Imprime JSON: {"bpm": 118.2, "golpes": [[t, fuerza], ...]} con t en segundos del video (se suma 'desfase').
Método: energía espectral que sube (onsets, con más peso en graves), tempo por autocorrelación y seguimiento
de golpes por programación dinámica (Ellis, 2007). Solo numpy.
"""
import json, subprocess, sys
import numpy as np

archivo, desde, hasta = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
desfase = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
SR, HOP, NFFT = 22050, 256, 1024
crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", archivo, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
y = np.frombuffer(crudo, np.int16).astype(np.float32) / 32768
if len(y) < SR:
    print(json.dumps({"bpm": 0, "golpes": []})); sys.exit()

# 1. curva de ataques
ven = np.hanning(NFFT).astype(np.float32)
n = 1 + (len(y) - NFFT) // HOP
marcos = np.lib.stride_tricks.as_strided(y, (n, NFFT), (y.strides[0] * HOP, y.strides[0]))
S = np.log1p(1000 * np.abs(np.fft.rfft(marcos * ven, axis=1)))
frec = np.fft.rfftfreq(NFFT, 1 / SR)
# por bandas (promedio de cada una, para que los agudos no ganen solo por tener más frecuencias): el bombo y el bajo pesan más
d = np.maximum(0, np.diff(S, axis=0))
bandas = [(0, 180, 2.5), (180, 2000, 1.0), (2000, SR / 2, 0.5)]
flujo = sum(p * d[:, (frec >= a) & (frec < b)].mean(axis=1) for a, b, p in bandas)
flujo = np.concatenate([[0], flujo])
flujo -= np.convolve(flujo, np.ones(32) / 32, mode="same")                 # quita la tendencia lenta
flujo = np.maximum(flujo, 0)
flujo /= flujo.std() + 1e-9
fps_o = SR / HOP
RETRASO = 0.8 * NFFT / SR          # el ataque se detecta cuando entra a la ventana: se corre al instante real

# 2. tempo: autocorrelación con preferencia por ~120 BPM
ac = np.correlate(flujo, flujo, mode="full")[len(flujo) - 1:]
lags = np.arange(len(ac))
bpm_l = 60 * fps_o / np.maximum(lags, 1)
valido = (bpm_l >= 60) & (bpm_l <= 190)
pref = np.exp(-0.5 * (np.log2(np.maximum(bpm_l, 1) / 120) / 0.9) ** 2)
lag = int(lags[valido][np.argmax((ac * pref)[valido])])
bpm = 60 * fps_o / lag

# 3. golpes: programación dinámica
alfa = 100.0
puntaje = flujo.copy()
atras = np.full(len(flujo), -1)
for t in range(len(flujo)):
    a, b = max(0, t - 2 * lag), t - lag // 2
    if b <= a:
        continue
    prev = np.arange(a, b)
    costo = -alfa * np.log((t - prev) / lag) ** 2
    j = int(np.argmax(puntaje[prev] + costo))
    puntaje[t] = flujo[t] + puntaje[prev[j]] + costo[j]
    atras[t] = prev[j]
t = int(np.argmax(puntaje[-2 * lag:]) + len(puntaje) - 2 * lag) if len(puntaje) > 2 * lag else int(np.argmax(puntaje))
golpes = []
while t >= 0:
    golpes.append(t)
    t = atras[t]
golpes = golpes[::-1]
fuerza = np.array([flujo[max(0, g - 2):g + 3].max() for g in golpes]) if golpes else np.array([])
if len(fuerza):
    fuerza = np.clip(fuerza / (np.percentile(fuerza, 90) + 1e-9), 0, 1)
salida = [[round(g / fps_o + RETRASO + desfase, 3), round(float(f), 2)] for g, f in zip(golpes, fuerza)
          if desde <= g / fps_o + RETRASO + desfase <= hasta and f >= 0.15]
print(json.dumps({"bpm": round(bpm, 1), "golpes": salida}))
