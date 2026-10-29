---
name: lupa
description: Pone una lupa que amplía un objeto del video (un detalle de un producto, una etiqueta, un ingrediente) y lo sigue aunque se mueva. Úsala con /lupa y el video, o cuando pidan ampliar, hacer zoom a un detalle o mostrar de cerca.
---

# /lupa

Un círculo con el detalle ampliado aparece al lado del objeto, unido con una línea, y lo sigue mientras se mueve. Ideal para mostrar texturas, etiquetas, costuras o detalles pequeños.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Cuando la persona habla de un detalle pequeño ("mira la costura", "fíjate en la etiqueta"), de 2 a 5 s.
- Marca el detalle exacto (no todo el producto) para que la lupa amplíe lo importante.

## Marcar el objeto
Sigue la sección "Objetos" de GUIA.md: elige un segundo `referencia` donde se vea bien, saca ese cuadro en el formato final, míralo y marca el objeto con `"punto": [x, y]` (centro) o `"caja": [x0, y0, x1, y1]`, de 0 a 1. Si en las fotos de control se cuela algo (una mano), agrega `"negativos": [[x, y]]`. El motor lo sigue solo con SAM 2.1.

## Capa
```json
{"efecto": "lupa", "desde": 2.0, "hasta": 5.5, "punto": [0.58, 0.46], "referencia": 3.0, "texto": "Costura reforzada"}
```
Opciones: `punto` o `caja` (el detalle), `referencia`, `zoom` (2.4), `tamano` (0.2 = radio del círculo respecto al lado corto), `lado` (`izquierda`/`derecha`), `arriba` (false = abajo), `texto` (opcional, debajo de la lupa), `color` (del punto). No la combines con zooms de cámara en el mismo tramo.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
