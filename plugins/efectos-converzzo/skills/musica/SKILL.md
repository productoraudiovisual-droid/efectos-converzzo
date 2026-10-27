---
name: musica
description: Pone música de fondo al video que baja sola cuando la persona habla y sube en las pausas (ducking), con entrada y salida suaves. Úsala con /musica y el video, o cuando pidan música de fondo o una canción que no tape la voz.
---

# /musica

Música de fondo que baja sola cuando hay voz y sube en las pausas, con entrada y salida suaves. La persona pone su música (un archivo de audio); el pack no genera música.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Pide el archivo de música (mp3, wav, m4a). Recuerda que use música con permiso de uso (biblioteca libre de derechos o la de la red social al publicar).
- Normalmente va en todo el video. `volumen` 0,15 a 0,3 según qué tan presente la quiera.

## Capa
```json
{"efecto": "musica", "desde": 0, "hasta": 45.2, "musica_archivo": "cancion.mp3", "volumen": 0.22}
```
Opciones: `musica_archivo` (ruta relativa al plan o absoluta), `volumen` (0.22), `bajar_con_voz` (true).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
