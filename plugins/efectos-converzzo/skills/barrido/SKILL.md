---
name: barrido
description: Transición de barrido o whip pan: la imagen sale disparada hacia un lado con desenfoque de movimiento y vuelve a entrar, ideal en un corte o cambio de idea. Úsala con /barrido y el video, o cuando pidan whip pan, barrido o transición rápida.
---

# /barrido

Transición de barrido (whip pan): la imagen sale disparada hacia un lado con desenfoque de movimiento y entra de nuevo. Funciona en un corte o cuando la persona cambia de idea.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Busca cortes y cambios de idea: el inicio de una frase nueva después de una pausa, "pero", "ahora", "lo segundo".
- `desde` = 0,2 s antes del cambio; `hasta` = `desde` + 0,35 a 0,5 s. No más de 3 o 4 por video.

## Capa
```json
{"efecto": "barrido", "desde": 4.15, "hasta": 4.55, "direccion": "izquierda"}
```
Opciones: `direccion`: `"izquierda"` (por defecto) o `"derecha"`.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
