---
name: zoom-al-ritmo
description: Golpes de zoom sincronizados con el ritmo de la música: en cada beat (o cada 2 o 4) la imagen da un pequeño salto hacia adelante. Úsala con /zoom-al-ritmo y el video, o cuando pidan zoom al beat, zoom al ritmo, que la imagen salte con la música o edit a ritmo.
---

# /zoom-al-ritmo

Detecta los golpes (beats) de la música y da un pulso de zoom en cada uno. Si el plan tiene `/musica`, sigue esa canción; si no, el audio del video.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- En videos con música marcada (montajes, productos, antes y después, reels de baile o de viaje). En un video hablado sin música no tiene sentido.
- Mejor en tramos (el gancho, el clímax) que en todo el video. Si es muy seguido, usa `"cada": 2`.

## Capa
```json
{"efecto": "zoom-al-ritmo", "desde": 0, "hasta": 8.0, "zoom": 0.07, "cada": 1}
```
Opciones: `zoom` (fuerza del golpe, 0.07; de 0.03 a 0.15), `cada` (1 = cada beat, 2, 4…), `caida` (segundos que tarda en volver, 0.2), `fuerza_variable` (false = todos los golpes iguales). En la consola sale el BPM detectado.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
