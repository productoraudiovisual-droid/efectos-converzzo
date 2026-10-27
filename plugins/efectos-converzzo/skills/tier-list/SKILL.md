---
name: tier-list
description: Muestra una tier list animada (S, A, B, C…) donde cada elemento cae en su nivel justo cuando la persona lo nombra en el video. Úsala con /tier-list y el video, o cuando pidan una tier list, ranking por niveles o clasificar herramientas, productos o ideas.
---

# /tier-list

Tablero de tier list (S, A, B, C) en la mitad de abajo: cada elemento cae en su nivel justo cuando se nombra, con un rebote y un sonido.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Transcribe y encuentra qué se rankea y en qué nivel va cada cosa ("esta va en S", "para mí es top", "la peor").
- Cada ítem con `en` = el segundo en que se dice. Si se mencionan otros niveles (D, F, "Dios"), úsalos en `tiers`.
- Muéstrale a la persona la tabla ítem · nivel · segundo para aprobar antes de renderizar. Máximo 6 ítems por nivel.

## Capa
```json
{"efecto": "tier-list", "desde": 10.6, "hasta": 16.0, "titulo": "TIER LIST · IA", "items": [{"texto": "ChatGPT", "tier": "S", "en": 11.6}, {"texto": "Canva", "tier": "A", "en": 13.4}]}
```
Opciones: `titulo`, `items` (`texto`, `tier`, `en`), `tiers` (por defecto ["S","A","B","C"], o con colores `{label, color}`), `fondo` (`opaco` = el tablero ocupa toda la mitad de abajo, como pantalla dividida).
Colores y fuentes salen del `estilo` del plan (ver GUIA.md).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
