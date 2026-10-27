---
name: fondo-borroso
description: Desenfoca el fondo del video y deja a la persona nítida, como el modo retrato del celular, sin pantalla verde. Úsala con /fondo-borroso y el video, o cuando pidan desenfocar el fondo, efecto retrato o bokeh.
---

# /fondo-borroso

Desenfoca el fondo y deja a la persona nítida, como el modo retrato del celular. Sirve para que el fondo no distraiga o para dar un look más profesional.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Puede ir en todo el video o en un tramo (entra y sale suave).
- Funciona mejor con la persona quieta: las manos que se mueven muy rápido pueden verse un poco borrosas.

## Capa
```json
{"efecto": "fondo-borroso", "desde": 0, "hasta": 30.5, "desenfoque": 12}
```
Opciones: `desenfoque` (12 px; de 6 a 24), `transicion` (0.4 s).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
