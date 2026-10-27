---
name: cambiar-fondo
description: Recorta a la persona y le pone otro fondo (una foto, un video o un color) sin pantalla verde. Úsala con /cambiar-fondo y el video, o cuando pidan cambiar el fondo, quitar el fondo o poner otro fondo.
---

# /cambiar-fondo

Recorta a la persona y cambia el fondo por una foto, un video o un color plano, sin pantalla verde. Entra y sale suave.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Pide a la persona el fondo (foto o video) o un color. Si no tiene, sugiere un color de su marca.
- Funciona mejor con la persona sola, quieta y bien iluminada. Lo que sostiene en las manos puede verse cortado.
- Puede ir en todo el video o en un tramo.

## Capa
```json
{"efecto": "cambiar-fondo", "desde": 10.4, "hasta": 14.2, "fondo_archivo": "fondo.jpg"}
```
Opciones: `fondo_archivo` (foto o video; ruta relativa al plan o absoluta) o `color` (hex), `desenfoque` (px para desenfocar el fondo nuevo), `transicion` (0.35 s).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
