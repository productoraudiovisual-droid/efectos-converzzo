---
name: congelar
description: Congela la imagen del video en un instante durante unos segundos y pone un texto con una flecha dibujada hacia la persona. Úsala con /congelar y el video, o cuando pidan freeze frame, pausar la imagen o señalar algo.
---

# /congelar

Congela la imagen en un instante, con un destello, la imagen un poco más oscura en los bordes y un texto con flecha dibujada a mano que señala a la persona. El video continúa justo donde se pausó.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsalo para señalar algo o presentar a alguien ("Este soy yo hace 3 años", "Error #1"), o para una pausa cómica.
- `desde` = el instante a congelar (en el video original). `hasta` = `desde` + la duración de la pausa (de 1,5 a 3 s).
- `texto`: máximo unas 4 palabras. Si no hay texto, solo congela con el destello.

Los tiempos (`desde`, `hasta`) van siempre en el tiempo del video original, como salen en la transcripción: el motor los ajusta solo cuando el video cambia de duración.

## Capa
```json
{"efecto": "congelar", "desde": 5.0, "hasta": 7.0, "texto": "Llevan años así"}
```
Opciones: `texto`, `color` (fondo del texto; por defecto el acento del estilo).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
