---
name: widgets-vidrio
description: Pone tarjetas de vidrio esmerilado con datos (números, progreso, minigráficas) flotando alrededor de la persona. Úsala con /widgets-vidrio y el video, o cuando pidan widgets, tarjetas de vidrio, glassmorphism o mostrar métricas alrededor.
---

# /widgets-vidrio

Hasta 4 tarjetas de vidrio esmerilado que flotan alrededor de la persona, cada una con un dato: **número** grande, **progreso** con barra o **minigráfica** de barras. Nunca tapan la cara.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsalas cuando la persona habla de varias métricas a la vez (ventas, meta, seguidores, semana).
- Datos solo si la persona los dice o los escribe. Títulos cortos (2 o 3 palabras). Dura de 3 a 5 s.

## Capa
```json
{"efecto": "widgets-vidrio", "desde": 16.2, "hasta": 20.0, "widgets": [{"titulo": "Ventas hoy", "valor": "$2,4M", "detalle": "+18% vs ayer"}, {"titulo": "Meta mensual", "progreso": 72}, {"titulo": "Esta semana", "datos": [3, 5, 4, 7, 6, 9]}]}
```
Opciones: `widgets` (hasta 4): `titulo` + uno de `valor` (con `detalle` opcional), `progreso` (0 a 100) o `datos` (lista de números).
Colores y fuentes salen del `estilo` del plan (ver GUIA.md).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
