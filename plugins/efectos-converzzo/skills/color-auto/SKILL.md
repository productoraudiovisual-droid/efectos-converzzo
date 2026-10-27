---
name: color-auto
description: Corrige automáticamente la exposición y el balance de blancos de un video oscuro, amarillo o azulado. Úsala con /color-auto y el video, o cuando pidan corregir el color, arreglar la luz, que se vea más claro o quitar lo amarillo.
---

# /color-auto

Corrige solo la exposición y el balance de blancos: mide el color del video y lo ajusta con suavidad (solo corrige si de verdad hace falta). Se combina bien con `look`.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Normalmente va en todo el video: `desde` 0, `hasta` = duración, `"transicion": 0`.
- Si el video ya se ve bien, el efecto casi no cambia nada (es a propósito). Si la persona quiere más, sube `intensidad` o combina con un `look`.

## Capa
```json
{"efecto": "color-auto", "desde": 0, "hasta": 30.5, "transicion": 0}
```
Opciones: `intensidad` (1; de 0.3 a 1), `transicion` (0.3 s).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
