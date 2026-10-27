---
name: dolly-zoom
description: Efecto vértigo o dolly zoom: la persona queda del mismo tamaño mientras el fondo se estira o se encoge. Úsala con /dolly-zoom y el video, o cuando pidan efecto vértigo o dolly zoom.
---

# /dolly-zoom

Efecto vértigo de cine: la persona se queda igual y el fondo se estira detrás de ella. Recorta a la persona sola, sin pantalla verde.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Úsalo en un momento de sorpresa o revelación ("y ahí me di cuenta…"), de 1,5 a 3 s.
- Termina en corte: ponlo justo antes de un cambio de frase o de plano.
- Funciona mejor con fondo con profundidad (una habitación) y la persona quieta.

## Capa
```json
{"efecto": "dolly-zoom", "desde": 8.2, "hasta": 9.95, "direccion": "abre"}
```
Opciones: `zoom` (1.35; de 1.2 a 1.5), `direccion`: `"abre"` (el fondo se aleja, por defecto) o `"cierra"` (el fondo se acerca).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
