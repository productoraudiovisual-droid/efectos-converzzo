---
name: limpiar-voz
description: Limpia la voz del video: reduce el ruido de fondo, quita el retumbe y las eses fuertes y da presencia a la voz, con volumen estándar de redes (−14 LUFS). Úsala con /limpiar-voz y el video, o cuando pidan mejorar el audio, quitar ruido o que la voz suene mejor.
---

# /limpiar-voz

Mejora el audio de la voz: reduce el ruido de fondo constante (aire, nevera, calle suave), quita el retumbe grave, suaviza las eses y da presencia. Todo el video sale a −14 LUFS, el volumen estándar de Reels y TikTok.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Va en todo el video. Úsalo cuando la persona diga que se oye ruido o grabó sin micrófono.
- `intensidad`: `suave` si el audio ya es bueno, `media` (por defecto), `fuerte` si hay mucho ruido (puede sonar un poco metálico).
- No hace milagros con ruidos fuertes que cambian (música, gente hablando, viento fuerte); díselo con honestidad.

## Capa
```json
{"efecto": "limpiar-voz", "desde": 0, "hasta": 45.2, "intensidad": "media"}
```
Opciones: `intensidad` (`suave`, `media`, `fuerte`).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
