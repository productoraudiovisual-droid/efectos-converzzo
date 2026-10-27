---
name: sacudida
description: Temblor o sacudida de cámara en un golpe o momento fuerte de un video. Úsala con /sacudida y el video, o cuando pidan camera shake, temblor o impacto.
---

# /sacudida

Temblor de cámara corto que remarca un golpe: una palabra fuerte, un aplauso, un corte de música.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Si la persona dice la palabra, úsala. Si no, transcribe y busca la palabra más fuerte o el remate ("problema", "nunca", "boom").
- `desde` = inicio de la palabra − 0,03 s. `hasta` = `desde` + 0,4 a 0,8 s.
- Úsalo solo si la persona lo pide: no lo agregues por tu cuenta.

## Capa
```json
{"efecto": "sacudida", "desde": 13.52, "hasta": 14.1, "intensidad": 1}
```
Opciones: `intensidad` (1; de 0.5 suave a 2 fuerte).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
