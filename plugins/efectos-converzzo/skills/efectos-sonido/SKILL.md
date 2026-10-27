---
name: efectos-sonido
description: Agrega efectos de sonido sincronizados al video (whoosh, pop, click, impacto, notificación, caja registradora, obturador, teclas…) en los momentos que se elijan y en los cortes, y ajusta el volumen de todos los sonidos. Úsala con /efectos-sonido y el video, o cuando pidan efectos de sonido, SFX o sonidos en los cortes.
---

# /efectos-sonido

Sonidos sincronizados: los pone en los momentos exactos que se elijan (una venta, un clic, un impacto) y, si se cortaron silencios, un swoosh suave en cada corte. También sube o baja el volumen de todos los sonidos del resto de efectos.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Transcribe y busca momentos que pidan sonido: una cifra o venta (`caja_registradora`), un mensaje (`notificacion`), una foto (`obturador`), escribir (`tecla`), un golpe (`impacto`), algo que aparece (`pop`, `burbuja`), algo que pasa (`whoosh`, `swoosh_sube`, `swoosh_baja`).
- Menos es más: 4 a 8 sonidos en un video de 30 s.
- `nivel`: `sutil` si el video es tranquilo, `fuerte` si es muy dinámico.

## Capa
```json
{"efecto": "efectos-sonido", "desde": 0, "hasta": 45.2, "nivel": "medio", "sonidos": [{"tipo": "caja_registradora", "en": 15.6}, {"tipo": "notificacion", "en": 12.0}]}
```
Opciones: `sonidos` (`tipo` + `en`, y `vol` opcional de 0 a 1), `nivel` (`sutil`, `medio`, `fuerte`: volumen de todos los sonidos), `en_cortes` (true). Tipos: `whoosh`, `swoosh_sube`, `swoosh_baja`, `pop`, `burbuja`, `click`, `tick`, `tecla`, `ding`, `notificacion`, `caja_registradora`, `obturador`, `impacto`, `boom`, `stamp`, `riser`, `glitch`, `rewind`.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
