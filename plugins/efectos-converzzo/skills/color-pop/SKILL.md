---
name: color-pop
description: Deja a la persona a color y el fondo en blanco y negro durante un tramo del video, sin pantalla verde. Úsala con /color-pop y el video, o cuando pidan resaltar a la persona, color selectivo o fondo en blanco y negro.
---

# /color-pop

La persona queda a color y el fondo pasa a blanco y negro. Sirve para remarcar un momento importante o un antes y después emocional. Recorta a la persona sola, sin pantalla verde.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsalo en una frase clave o en un momento de giro, de 2 a 6 s. Entra y sale suave.
- Funciona mejor si la persona no tiene cosas grandes en las manos (lo que sostiene puede quedar en gris o a medias).

## Capa
```json
{"efecto": "color-pop", "desde": 4.8, "hasta": 8.1}
```
Opciones: `transicion` (0.35 s de entrada y salida).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
