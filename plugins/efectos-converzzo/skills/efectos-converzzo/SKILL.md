---
name: efectos-converzzo
description: Aplica varios efectos de video de Converzzo a la vez en un solo render (zooms, color, transiciones, tiempo, motion graphics, sonido y gráficos para negocios). Úsala con /efectos-converzzo o cuando pidan varios efectos en un video, "ponle efectos", o ver la lista de efectos de Converzzo.
---

# /efectos-converzzo

Comando general del pack: aplica uno o varios efectos en el mismo video, en un solo render.

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Cómo armar el plan
- Si la persona nombra los efectos ("zoom en dinero y precio al final"), arma esas capas.
- Si pide "edítalo" o "edición completa", la base es `limpiar-voz` + `cortar-silencios` en todo el video, y encima 3 a 6 efectos puntuales. Si quiere subtítulos, dile que vienen en el plugin gratuito **tipografia-converzzo**.
- Si solo dice "ponle efectos" o "edítalo con efectos", transcribe y propón un plan equilibrado: entre 3 y 6 efectos para un video de 30 s, en los momentos fuertes. Explica en una línea por qué cada uno. No incluyas `sacudida` a menos que la pida.
- Siempre muestra la tabla del plan (Segundo · Efecto · Detalle) antes de renderizar.

## Lista de efectos
Si la pide, muéstrale la tabla de efectos de GUIA.md en palabras simples, con su comando (`/zoom-in`, `/precio-pop`…).

## Actualizar
Los efectos nuevos llegan al actualizar el plugin en Personalizar → Plugins. El motor se actualiza solo la próxima vez que se use un comando.
