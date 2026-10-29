---
name: reencuadre-objeto
description: Convierte un video horizontal en vertical 9:16 siguiendo un objeto (un producto, un plato, una mascota) en vez de la cara. Úsala con /reencuadre-objeto y el video, o cuando pidan pasar a vertical siguiendo el producto o un objeto.
---

# /reencuadre-objeto

Pasa un video horizontal a vertical y la cámara sigue al objeto que se marque, con un movimiento suave.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cuándo ponerlo
- En todo el video (`desde` 0, `hasta` = duración) cuando lo importante es un objeto y no una cara.
- Si en una parte importa la cara, usa `reencuadre` en ese tramo y `reencuadre-objeto` en el otro.

## Marcar el objeto
Sigue la sección "Objetos" de GUIA.md: elige un segundo `referencia` donde se vea bien, saca ese cuadro en el formato final, míralo y marca el objeto con `"punto": [x, y]` (centro) o `"caja": [x0, y0, x1, y1]`, de 0 a 1. Si en las fotos de control se cuela algo (una mano), agrega `"negativos": [[x, y]]`. El motor lo sigue solo con SAM 2.1.

## Capa
```json
{"efecto": "reencuadre-objeto", "desde": 0, "hasta": 12.0, "caja": [0.38, 0.30, 0.66, 0.85], "referencia": 2.0}
```
Opciones: `punto` o `caja` del objeto, `referencia`, `posicion` (0.5 = objeto al centro), `suavidad` (0.6 s; más alto = cámara más tranquila). Sale vertical 1080×1920.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
