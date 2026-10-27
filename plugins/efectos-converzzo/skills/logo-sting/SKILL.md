---
name: logo-sting
description: Anima la entrada del logo de la marca: a pantalla completa con fondo de color y destello, o pequeño en una esquina. Úsala con /logo-sting y el video, o cuando pidan poner el logo, intro con logo, cierre con marca o firma del video.
---

# /logo-sting

Animación del logo: **pantalla completa** (fondo de color que entra en círculo, logo con rebote o revelado, anillo y destello, y salida que deja ver el video) o **esquina** (el logo aparece pequeño arriba a la derecha).

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Pide el logo (PNG con fondo transparente o SVG). Si no tiene, usa el nombre de la marca como texto.
- Pantalla completa: al inicio (0 a 2 s) o al cierre (los últimos 2 a 2,5 s). Esquina: en cualquier momento, 2 a 4 s.
- `fondo`: el color de la marca. Si el logo es claro, un fondo oscuro, y al revés.

## Capa
```json
{"efecto": "logo-sting", "desde": 0, "hasta": 2.0, "logo_archivo": "logo.png", "texto": "Academia de marketing", "fondo": "#000E43"}
```
Opciones: `logo_archivo` (ruta relativa al plan o absoluta), `texto` (frase debajo del logo), `fondo` (color), `estilo` (`pop` o `revelado`), `posicion` (`pantalla` o `esquina`).
Colores y fuentes salen del `estilo` del plan (ver GUIA.md).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
