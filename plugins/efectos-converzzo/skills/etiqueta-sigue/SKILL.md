---
name: etiqueta-sigue
description: Pone una etiqueta con nombre (y un dato corto) unida a un objeto del video con una línea, y la etiqueta lo sigue cuando se mueve. Úsala con /etiqueta-sigue y el video, o cuando pidan una etiqueta que siga al producto o señalar algo que se mueve.
---

# /etiqueta-sigue

Una etiqueta con el nombre del objeto y un dato corto, unida con una línea y un punto, que se mueve pegada al objeto (tracking).

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Cuando se muestra o se mueve un producto y se nombra ("este es el sérum…"), de 2 a 5 s.
- El texto lo dice la persona en el video o lo escribe ella: nunca inventes precios ni características.

## Marcar el objeto
Sigue la sección "Objetos" de GUIA.md: elige un segundo `referencia` donde se vea bien, saca ese cuadro en el formato final, míralo y marca el objeto con `"punto": [x, y]` (centro) o `"caja": [x0, y0, x1, y1]`, de 0 a 1. Si en las fotos de control se cuela algo (una mano), agrega `"negativos": [[x, y]]`. El motor lo sigue solo con SAM 2.1.

## Capa
```json
{"efecto": "etiqueta-sigue", "desde": 1.2, "hasta": 4.6, "texto": "Sérum vitamina C", "subtexto": "30 ml", "caja": [0.42, 0.30, 0.62, 0.70], "referencia": 2.0}
```
Opciones: `texto`, `subtexto` (opcional), `punto` o `caja` del objeto, `referencia`, `arriba` (false = la etiqueta va debajo del objeto).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
