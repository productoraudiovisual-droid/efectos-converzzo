---
name: zoom-suave
description: Acercamiento lento y cinematográfico hacia la cara durante una frase. Úsala con /zoom-suave y el video, o cuando pidan un zoom lento, push-in o acercamiento suave.
---

# /zoom-suave

Acercamiento lento y cinematográfico durante una frase. Da tensión o intimidad sin que se note el efecto.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Úsalo en frases emotivas, historias o momentos de reflexión, de 2 a 6 s.
- `desde` = inicio de la frase. `hasta` = final de la frase.

## Capa
```json
{"efecto": "zoom-suave", "desde": 4.8, "hasta": 8.1, "zoom": 1.18}
```
Opciones: `zoom` (1.18; de 1.08 a 1.35), `volver`: `"corte"` (por defecto) o `"suave"`.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
