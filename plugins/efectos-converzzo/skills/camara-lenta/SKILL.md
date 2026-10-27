---
name: camara-lenta
description: Pone en cámara lenta un tramo del video, con movimiento fluido y el audio estirado o en silencio. Úsala con /camara-lenta y el video, o cuando pidan slow motion, cámara lenta o ralentizar.
---

# /camara-lenta

Cámara lenta fluida en un tramo: crea los cuadros intermedios para que no se vea a saltos. Ideal para un gesto, un producto en movimiento o un momento dramático.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsala en un gesto o acción (mostrar un producto, un movimiento de manos, una reacción), de 1 a 3 s del original.
- Mientras habla queda raro: si hay voz en ese tramo, sugiere `"audio": "silencio"` o elige un momento sin voz.
- La cámara lenta fluida tarda en procesar (más o menos 30 s por cada segundo); avísale a la persona.

Los tiempos (`desde`, `hasta`) van siempre en el tiempo del video original, como salen en la transcripción: el motor los ajusta solo cuando el video cambia de duración.

## Capa
```json
{"efecto": "camara-lenta", "desde": 2.3, "hasta": 3.6, "velocidad": 0.5, "etiqueta": "0.5x"}
```
Opciones: `velocidad` (0.5; de 0.2 a 0.9), `audio`: `"lento"` (por defecto) o `"silencio"`, `fluido` (true; false = más rápido de procesar pero menos suave), `etiqueta` (texto opcional como "0.5x").

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
