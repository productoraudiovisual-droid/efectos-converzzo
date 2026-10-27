---
name: paso-a-paso
description: Muestra una lista numerada de pasos que van apareciendo y marcándose justo cuando se dice cada uno en el video. Úsala con /paso-a-paso y el video, o cuando pidan un paso a paso, pasos, instrucciones, receta o rutina en pantalla.
---

# /paso-a-paso

Lista numerada de pasos que aparecen uno a uno al ritmo del audio: el paso actual se resalta y los anteriores se tachan. Para tutoriales, recetas, rutinas de belleza o "cómo comprar".

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Transcribe y encuentra los pasos: "primero", "segundo", "luego", "después", "por último", números ("paso 1").
- Cada paso con su `en` = segundo en que lo empieza a decir. Textos de máximo 4 o 5 palabras (resume lo que dice).
- `desde` = 0,3 s antes del primer paso; `hasta` = 1,5 s después del último. Máximo 6 pasos.

## Capa
```json
{"efecto": "paso-a-paso", "desde": 0.3, "hasta": 4.6, "titulo": "Cómo pedir", "pasos": [{"texto": "Escríbenos", "en": 0.7}, {"texto": "Elige tu talla", "en": 1.8}, {"texto": "Recibe en casa", "en": 2.9}]}
```
Opciones: `titulo` (opcional), `pasos` (texto + `en`), `y` (0 a 1 para fijar la altura).
Colores y fuentes salen del `estilo` del plan (ver GUIA.md).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
