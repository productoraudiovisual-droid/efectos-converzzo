---
name: zoom-out
description: Efecto de zoom out: el video arranca cerca de la cara y se abre el plano para revelar. Úsala con /zoom-out y el video, o cuando pidan alejar, abrir el plano o revelar.
---

# /zoom-out

El plano arranca cerca y se va abriendo. Sirve para revelar algo (un producto, el lugar, un resultado) o para empezar un video con intriga.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Úsalo al inicio del video o cuando la persona dice "mira", "esto es", "así quedó".
- Dura de 1,5 a 3 s.

## Capa
```json
{"efecto": "zoom-out", "desde": 0, "hasta": 2.4, "zoom": 1.45}
```
Opciones: `zoom` (1.45; de 1.2 a 1.8).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
