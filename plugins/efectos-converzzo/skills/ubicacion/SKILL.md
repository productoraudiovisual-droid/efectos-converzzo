---
name: ubicacion
description: Muestra la ubicación de un negocio: mini mapa ilustrado con la ruta y un pin, nombre, dirección y horario. Úsala con /ubicacion y el video, o cuando pidan mostrar dónde queda el local, la dirección, cómo llegar o el horario.
---

# /ubicacion

Tarjeta de ubicación: un mini mapa ilustrado donde se dibuja la ruta y cae un pin, con el nombre del negocio, la dirección y el horario. Para restaurantes, tiendas físicas y servicios locales.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.


## Cuándo ponerlo
- Úsala cuando la persona dice dónde queda o invita a ir ("estamos en…", "ven a visitarnos").
- La dirección y el horario solo si la persona los dice o te los escribe; nunca los inventes. El mapa es ilustrativo, no un mapa real.
- Dura de 3 a 5 s.

## Capa
```json
{"efecto": "ubicacion", "desde": 16.3, "hasta": 19.5, "nombre": "Café La Esquina", "direccion": "Cra. 7 #23-45, Pereira", "horario": "Abierto hoy · 7 a.m. – 8 p.m."}
```
Opciones: `nombre`, `direccion`, `horario` (todos opcionales), `y`.
Colores y fuentes salen del `estilo` del plan (ver GUIA.md).

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
