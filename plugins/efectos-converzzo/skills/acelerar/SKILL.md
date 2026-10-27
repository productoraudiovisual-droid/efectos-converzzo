---
name: acelerar
description: Acelera un tramo del video (x2, x4…) para pasar rápido por una parte larga, como un time-lapse. Úsala con /acelerar y el video, o cuando pidan acelerar, adelantar, fast forward o timelapse.
---

# /acelerar

Acelera un tramo para pasar rápido por algo largo: un proceso, un antes y después, una preparación. Opcionalmente muestra una etiqueta "x2".

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsala en partes sin voz importante (procesos, armado, preparación).
- Si hay voz, la voz también se acelera; sugiere `"audio": "silencio"` si no se necesita.

Los tiempos (`desde`, `hasta`) van siempre en el tiempo del video original, como salen en la transcripción: el motor los ajusta solo cuando el video cambia de duración.

## Capa
```json
{"efecto": "acelerar", "desde": 10.1, "hasta": 13.0, "velocidad": 2, "etiqueta": "x2"}
```
Opciones: `velocidad` (2; de 1.25 a 8), `audio`: `"rapido"` (por defecto) o `"silencio"`, `etiqueta` (texto opcional como "x4").

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
