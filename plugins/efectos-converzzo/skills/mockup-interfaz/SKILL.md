---
name: mockup-interfaz
description: Muestra una interfaz animada genérica en el video: un chat con mensajes, notificaciones que caen o un prompt de IA que se escribe y responde. Úsala con /mockup-interfaz y el video, o cuando pidan mostrar un chat, una conversación, notificaciones, ventas que llegan o un prompt.
---

# /mockup-interfaz

Interfaces animadas genéricas (sin imitar apps reales): **chat** con burbujas que aparecen y "escribiendo…", **notificaciones** que caen desde arriba (ventas, pedidos, pagos) o **prompt** de IA que se escribe, se envía y responde.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Chat: para mostrar cómo se conversa con un cliente. Notificaciones: para "así me llegan los pedidos". Prompt: para mostrar qué pedirle a una IA.
- Los textos los da la persona o salen de lo que dice; nunca inventes cifras ni nombres de clientes reales.
- Cada mensaje o notificación puede tener `en` (segundo en que aparece). Dura de 3 a 7 s.

## Capa
```json
{"efecto": "mockup-interfaz", "desde": 6.4, "hasta": 10.4, "tipo": "chat", "nombre": "Laura", "mensajes": [{"de": "otro", "texto": "Hola, ¿tienen envíos?", "en": 6.9}, {"de": "yo", "texto": "¡Sí! A todo el país", "en": 7.9}]}
```
Opciones: `tipo` (`chat`, `notificacion`, `prompt`). Chat: `nombre`, `mensajes` (`de`: "yo" u "otro", `texto`, `en`). Notificación: `notificaciones` (`app`, `titulo`, `texto`, `en`). Prompt: `prompt` (`texto`, `respuesta`). `y` para fijar la altura.
Colores y fuentes salen del `estilo` del plan (ver GUIA.md).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
