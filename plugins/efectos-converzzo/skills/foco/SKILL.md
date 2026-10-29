---
name: foco
description: Oscurece todo menos un objeto o una persona, como un reflector que la sigue, para dirigir la mirada. Úsala con /foco y el video, o cuando pidan resaltar algo, spotlight, reflector u oscurecer el resto.
---

# /foco

Todo el cuadro se oscurece menos el objeto (o la persona), que queda iluminado con un halo suave y lo sigue mientras se mueve.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Cuando se presenta un producto o un detalle y se quiere que todos miren ahí, de 2 a 5 s.
- Para la persona no hace falta marcar nada: sin `punto` ni `caja` resalta a la persona.

## Capa
```json
{"efecto": "foco", "desde": 1.0, "hasta": 4.5, "sujeto": "objeto", "caja": [0.40, 0.30, 0.75, 0.78], "referencia": 2.0}
```
Opciones: `sujeto` (`"objeto"` con `punto` o `caja`; por defecto la persona), `referencia`, `oscuridad` (0.65; de 0.3 a 0.9), `desenfoque` (px, opcional, también desenfoca el resto), `transicion` (0.3 s).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
