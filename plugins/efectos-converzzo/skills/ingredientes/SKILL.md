---
name: ingredientes
description: Pone etiquetas que señalan partes o ingredientes de un producto o plato en el video, una por una, con un punto y una línea. Úsala con /ingredientes y el video, o cuando pidan señalar ingredientes, partes de un producto, componentes o detalles.
---

# /ingredientes

Etiquetas con punto y línea que señalan partes de un producto o ingredientes de un plato, apareciendo una por una. Para comida, cosmética, tecnología o un setup.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Mira una foto de control para ubicar cada parte: `x` e `y` de 0 a 1 (0,0 arriba a la izquierda).
- Cada punto puede tener `en` (segundo en que se nombra); si no, aparecen seguidos.
- Máximo 5 puntos, textos de 1 a 3 palabras. Nunca inventes ingredientes: solo los que la persona dice o escribe.

## Capa
```json
{"efecto": "ingredientes", "desde": 17.5, "hasta": 21.0, "titulo": "Bowl de açaí", "puntos": [{"texto": "Granola", "x": 0.4, "y": 0.6, "en": 17.8}, {"texto": "Fresas", "x": 0.6, "y": 0.55, "en": 18.6}]}
```
Opciones: `titulo` (opcional), `puntos` (`texto`, `x`, `y`, `en` opcional).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
