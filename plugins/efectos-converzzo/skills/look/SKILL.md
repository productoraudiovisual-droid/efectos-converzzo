---
name: look
description: Aplica un look de color a un video: cálido, frío, cine, blanco y negro, vintage o vivo, en todo el video o en un tramo. Úsala con /look y el video, o cuando pidan un filtro, gradación de color, color de cine o blanco y negro.
---

# /look

Le da un look de color al video, como un filtro profesional: **cálido**, **frío**, **cine** (contraste y viñeta), **bn** (blanco y negro), **vintage** o **vivo**.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Si la persona no dice el tramo, va en todo el video (`desde` 0, `hasta` = duración) con `"transicion": 0`.
- Para un momento puntual (un recuerdo en blanco y negro, por ejemplo) ponlo solo en esa frase: entra y sale suave.
- Si dice un estilo con otras palabras ("más cálido", "tipo película", "retro"), elige el más cercano.

## Capa
```json
{"efecto": "look", "desde": 0, "hasta": 30.5, "estilo": "cine", "transicion": 0}
```
Opciones: `estilo`: `calido`, `frio`, `cine`, `bn`, `vintage` o `vivo` (por defecto `cine`); `intensidad` (1; de 0.3 a 1); `transicion` (0.3 s de entrada y salida; 0 = sin transición).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
