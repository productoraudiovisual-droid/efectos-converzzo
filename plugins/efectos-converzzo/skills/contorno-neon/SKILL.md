---
name: contorno-neon
description: Dibuja una línea de luz neón alrededor de la persona o de un objeto que la sigue cuadro a cuadro. Úsala con /contorno-neon y el video, o cuando pidan contorno neón, borde de luz, outline o glow alrededor de la persona.
---

# /contorno-neon

Una línea brillante de color neón rodea la silueta de la persona (o de un objeto) y late suavemente. Llama mucho la atención en un gancho o un momento clave.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- En el gancho o en una frase fuerte, de 1,5 a 4 s. Funciona mejor sobre fondos oscuros o medios.
- Color: uno que contraste con el fondo y con la ropa (cian, magenta, verde lima, amarillo).

## Capa
```json
{"efecto": "contorno-neon", "desde": 0.4, "hasta": 3.2, "color": "#00E5FF"}
```
Opciones: `color` (hex, #00E5FF), `grosor` (1; de 0.5 a 3), `pulso` (latidos por segundo, 1.2), `sujeto` (`"objeto"` con `punto` o `caja`; por defecto la persona).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
