---
name: grano
description: Agrega grano de película al video para darle textura analógica o de cine. Úsala con /grano y el video, o cuando pidan grano, textura de película, look analógico o fílmico.
---

# /grano

Grano de película: una textura fina que se mueve cada cuadro y le da un look analógico o de cine. Queda muy bien con `look` cine o vintage.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Normalmente va en todo el video. Si la persona quiere solo una parte, ponlo en ese tramo.

## Capa
```json
{"efecto": "grano", "desde": 0, "hasta": 30.5, "intensidad": 1}
```
Opciones: `intensidad` (1; de 0.5 sutil a 2 fuerte).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
