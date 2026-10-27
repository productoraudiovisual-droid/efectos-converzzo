---
name: color-referencia
description: Copia el color y el ambiente de una imagen de referencia (una foto, un fotograma de una película o un post que le guste a la persona) y lo aplica a todo el video. Úsala con /color-referencia y el video, o cuando pidan que el video se vea con los colores de una foto o de otro video.
---

# /color-referencia

Copia los colores y el ambiente de una imagen de referencia: mide la luz y el color de la referencia y del video y los iguala con una corrección suave (con límites para que la piel no se vea rara).

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Pide la referencia: una foto, un pantallazo de un video o un post que le guste. Mejor si tiene luz y tonos parecidos a lo que quiere, no un logo ni un color plano.
- Va en todo el video. `intensidad` 0,5 si solo quiere un toque, 0,9 para que se parezca mucho.
- Revisa la foto de control: si la piel se ve muy rara, baja la intensidad.

## Capa
```json
{"efecto": "color-referencia", "desde": 0, "hasta": 45.2, "referencia_archivo": "referencia.jpg", "intensidad": 0.75}
```
Opciones: `referencia_archivo` (ruta relativa al plan o absoluta), `intensidad` (0.75; de 0.3 a 1).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
