---
name: estabilizar
description: Estabiliza un video grabado con el celular en la mano: quita el temblor y deja un movimiento de cámara suave, con un zoom mínimo para que no se vean bordes. Úsala con /estabilizar y el video, o cuando pidan estabilizar, quitar el temblor o que no se mueva tanto.
---

# /estabilizar

Quita el temblor de un video grabado a mano y deja la cámara suave, como con estabilizador. Hace un zoom mínimo (máximo 15 %) para que no se vean bordes.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- Normalmente en todo el video (`desde` 0, `hasta` = duración). Va antes que todo lo demás.
- Funciona mejor con temblor de mano que con caminatas muy rápidas o giros bruscos: en esos casos usa `"fuerza": "suave"`.

## Capa
```json
{"efecto": "estabilizar", "desde": 0, "hasta": 15.0, "fuerza": "media"}
```
Opciones: `fuerza` (`"suave"`, `"media"` por defecto o `"fuerte"` para una cámara casi quieta; también un número de 0.5 a 3).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
