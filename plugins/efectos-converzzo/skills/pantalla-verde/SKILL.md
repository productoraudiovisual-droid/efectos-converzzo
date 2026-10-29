---
name: pantalla-verde
description: Quita una pantalla verde (o azul) del video con clave de color y pone otro fondo: una foto, un video o un color, o lo deja transparente. Úsala con /pantalla-verde y el video, o cuando pidan chroma key, quitar el verde, croma o fondo verde.
---

# /pantalla-verde

Detecta solo el color de la tela (verde o azul), la quita con bordes suaves, limpia el reflejo verde de la piel y la ropa y pone el fondo que se elija.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Solo si el video se grabó con tela o pared verde (o azul). Si no hay pantalla verde, usa `/cambiar-fondo` (recorta a la persona sin tela).
- En todo el video o en el tramo con la tela.

## Capa
```json
{"efecto": "pantalla-verde", "desde": 0, "hasta": 12.0, "fondo_archivo": "oficina.jpg"}
```
Opciones: `fondo_archivo` (foto o video) o `color` (hex); sin ninguno, el video sale con transparencia como `/quitar-fondo`. `color_clave` (hex del verde de la tela, si la detección automática falla), `desenfoque` (px para el fondo nuevo), `transicion`.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
