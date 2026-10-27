---
name: rebobinar
description: Efecto de rebobinar: el video retrocede rápido con look de cinta VHS y vuelve a reproducir el tramo. Úsala con /rebobinar y el video, o cuando pidan rewind, rebobinar, devolver o repetir una parte.
---

# /rebobinar

Rebobina un tramo con look de cinta VHS (líneas, ruido y "◀◀ REBOBINANDO") y lo vuelve a reproducir. Sirve para repetir un momento clave o para un "espera, ¿qué?".

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- `desde` y `hasta` marcan el tramo que se rebobina (en el video original): primero se ve normal, luego se rebobina hasta `desde` y se repite.
- Elige un tramo de 1,5 a 4 s con algo que valga la pena ver dos veces.

Los tiempos (`desde`, `hasta`) van siempre en el tiempo del video original, como salen en la transcripción: el motor los ajusta solo cuando el video cambia de duración.

## Capa
```json
{"efecto": "rebobinar", "desde": 6.6, "hasta": 8.6, "velocidad": 3, "repetir": true}
```
Opciones: `velocidad` del rebobinado (3; de 1.5 a 6), `repetir` (true = vuelve a reproducir el tramo; false = sigue después del rebobinado), `texto` (por defecto "REBOBINANDO").

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
