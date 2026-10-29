---
name: quitar-fondo
description: Quita el fondo del video y lo entrega con transparencia (.mov ProRes 4444 o .webm) para usar a la persona o al producto en cualquier editor, sin pantalla verde. Úsala con /quitar-fondo y el video, o cuando pidan quitar el fondo, video sin fondo, transparente, alfa o recortar a la persona para editar.
---

# /quitar-fondo

Entrega el video con la persona (o un objeto) sola y el fondo transparente, listo para ponerla encima de cualquier cosa en Premiere, Final Cut, DaVinci, CapCut o After Effects.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- En todo el tramo que la persona quiera usar (normalmente todo el video: `desde` 0, `hasta` = duración).
- Si su editor no lee transparencias, ofrécele un fondo de color plano: `"fondo": "#00FF00"` (verde para hacer clave) o el color de su marca.

## Capa
```json
{"efecto": "quitar-fondo", "desde": 0, "hasta": 15.0}
```
Opciones: `sujeto` (`"persona"` por defecto, `"objeto"` con `punto` o `caja`, o `"verde"` si el video ya tiene pantalla verde), `fondo` (color hex en vez de transparencia).
Salida: con transparencia el archivo sale como **.mov (ProRes 4444)**, pesado pero compatible con todos los editores. Si la persona lo quiere para web, pon la salida con extensión `.webm`. Avísale que el archivo es grande.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
