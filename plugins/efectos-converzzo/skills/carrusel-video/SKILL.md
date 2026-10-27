---
name: carrusel-video
description: Convierte las imágenes de un carrusel de Instagram en video: pasan deslizándose como en la app, con puntos de página y un zoom lento. Úsala con /carrusel-video y el video, o cuando pidan pasar un carrusel a video, mostrar las láminas de un post o reutilizar un carrusel en un reel.
---

# /carrusel-video

Las imágenes de un carrusel pasan como en Instagram: deslizamiento, contador 1/4, puntos de página y un zoom lento en cada una. A pantalla completa (con fondo desenfocado) o como tarjeta encima del video.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Pide las imágenes del carrusel en orden (las exporta la persona; no se descargan de Instagram).
- Funciona sobre el video de la persona hablando: su voz sigue sonando mientras pasan las láminas.
- Calcula 1,5 a 3 s por imagen.

## Capa
```json
{"efecto": "carrusel-video", "desde": 5.0, "hasta": 12.0, "imagenes_archivos": ["lamina1.jpg", "lamina2.jpg", "lamina3.jpg"]}
```
Opciones: `imagenes_archivos` (lista en orden; rutas relativas al plan o absolutas), `modo` (`pantalla` o `tarjeta`), `dedo` (true = muestra el gesto de deslizar).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
