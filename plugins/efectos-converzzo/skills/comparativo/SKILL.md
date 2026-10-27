---
name: comparativo
description: Muestra una comparación en dos columnas (A vs B, ellos vs nosotros, antes vs ahora) con chulos y equis que aparecen punto por punto. Úsala con /comparativo y el video, o cuando pidan comparar, versus, vs, diferencias o por qué elegir un producto.
---

# /comparativo

Comparación en dos columnas con un sello "VS": los puntos aparecen uno a uno, con chulos verdes del lado que gana y equis rojas del otro.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsalo cuando la persona compara dos opciones ("la mayoría hace X, nosotros Y", "barato vs original", "Messenger vs Business").
- Máximo 4 puntos por lado, de 2 a 4 palabras cada uno. Pon en la misma fila los puntos que se enfrentan.
- Dura de 4 a 7 s para que dé tiempo de leer.

## Capa
```json
{"efecto": "comparativo", "desde": 8.2, "hasta": 12.6, "izquierda": {"titulo": "Otros", "puntos": ["Envío en 8 días", "Sin garantía"]}, "derecha": {"titulo": "Nosotros", "puntos": ["Envío en 24 h", "Garantía de 1 año"]}, "ganador": "derecha"}
```
Opciones: `izquierda` y `derecha` (`titulo` + `puntos`), `ganador`: `"derecha"` (por defecto), `"izquierda"` o `"ninguno"`, `y`.
Colores y fuentes salen del `estilo` del plan (ver GUIA.md).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
