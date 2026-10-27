---
name: collage-halftone
description: Convierte a la persona en un recorte de papel impreso con trama de puntos sobre papel kraft, con borde blanco, papeles rasgados y movimiento stop motion. Úsala con /collage-halftone y el video, o cuando pidan estilo collage, halftone, recorte de papel, kraft o zine.
---

# /collage-halftone

Estilo collage: la persona recortada como papel impreso en blanco y negro con trama de puntos, borde blanco de tijera y sombra, sobre papel kraft con papeles rasgados de color. Se mueve a saltos, como stop motion. Opcional: un título con letras recortadas.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsalo en un momento de impacto o en la intro (2 a 5 s). No es para todo el video: tapa el fondo original.
- Funciona mejor con la persona sola y bien iluminada. Lo que sostiene puede verse cortado.
- `titulo`: 2 a 4 palabras.

## Capa
```json
{"efecto": "collage-halftone", "desde": 1.0, "hasta": 4.0, "titulo": "WhatsApp cobra"}
```
Opciones: `titulo`, `papel` (color del kraft), `tinta` (color oscuro), `acento` (color del papel rasgado).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
