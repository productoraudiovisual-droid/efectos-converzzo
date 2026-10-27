---
name: tallas-colores
description: Muestra las tallas y colores disponibles de una prenda o producto en una tarjeta animada, marcando las agotadas. Úsala con /tallas-colores y el video, o cuando pidan mostrar tallas, colores disponibles o variantes.
---

# /tallas-colores

Tarjeta con las tallas (con las agotadas tachadas) y los colores disponibles con sus muestras. Para tiendas de ropa, calzado y accesorios.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsala cuando la persona dice las tallas o colores ("viene en S, M y L", "en negro y beige"). Solo los que diga o escriba.
- Colores por nombre (negro, blanco, beige, café, rojo, azul, verde oliva, rosado…) o con su hex. Dura de 3 a 5 s.

## Capa
```json
{"efecto": "tallas-colores", "desde": 7.8, "hasta": 11.0, "titulo": "Camiseta básica", "tallas": ["S", "M", "L", "XL"], "agotadas": ["XL"], "colores": ["negro", "blanco", "beige"]}
```
Opciones: `titulo`, `tallas`, `agotadas`, `colores` (nombres o `{nombre, hex}`), `y`.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
