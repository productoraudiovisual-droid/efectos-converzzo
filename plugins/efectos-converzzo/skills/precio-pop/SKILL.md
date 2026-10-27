---
name: precio-pop
description: Pone en un video una etiqueta de precio animada con descuento (precio anterior tachado, precio nuevo que rueda, sello de porcentaje) cuando se menciona el producto, sin tapar la cara. Para tiendas de belleza, ropa, restaurantes y cualquier negocio que venda productos. Úsala con /precio-pop y el video.
---

# /precio-pop

Etiqueta de precio con descuento: el precio de antes se tacha, el nuevo baja rodando y cae un sello con el porcentaje. Se ubica sola donde no tape la cara.

Parte del pack gratuito de efectos de Converzzo (@converzzo).

## Primero
1. Corre `bash "<carpeta de esta skill>/../../preparar.sh"` (la carpeta de esta skill es la que aparece como "Base directory"). La primera vez instala el motor (1 a 3 minutos): avísale a la persona en una línea que es solo esta vez. Después responde `LISTO` al instante.
   Si imprime `FALTA_FFMPEG`, `FALTA_NODE` o `FALTA_PYTHON`, instala eso tú mismo (Mac: `brew`, Windows: `winget`, Linux: `apt`) y vuelve a correrlo. En Windows usa Git Bash.
2. Lee `~/.claude/efectos-converzzo/GUIA.md` y sigue su flujo: video, momentos, plan, fotos de control, render.

## Encuentra los precios
- Si la persona te dio los datos en el mensaje, úsalos tal cual.
- Si no, transcribe y busca cada producto con precio: "cuesta", "vale", "antes", "ahora", "precio", "mil", "$", "descuento", "promo".
- Por cada producto, una capa:
  - `producto`: nombre corto (máximo unos 28 caracteres).
  - `antes` y `ahora`: tal como se escriben en su país (`$89.900`, `$29.99`, `S/ 120`). Si solo hay un precio, va en `ahora` y no pongas `antes`.
  - `descuento`: si lo dice ("30% off"); si no, se calcula solo.
  - `nota` (opcional, máximo 3 palabras): "Solo hoy", "Envío gratis", "Últimas unidades".
  - `desde` = 0,2 s antes de que diga el producto o el precio. `hasta` = `desde` + 3 a 4 s (mínimo 2,5 s).
- Nunca inventes precios. Si uno no se entiende en el audio, pregúntalo.

## Capa
```json
{"efecto": "precio-pop", "desde": 3.1, "hasta": 6.8, "producto": "Sérum vitamina C", "antes": "$89.900", "ahora": "$59.900", "nota": "Solo hoy"}
```
Opciones: `lado`: `"izq"` o `"der"` (por defecto elige el lado con más espacio), `y` de 0 a 1 para fijar la altura.
En las fotos de control revisa también que la etiqueta no tape el producto; si lo tapa, cambia `lado` o `y`.

Se puede combinar con cualquier otro efecto del pack en el mismo plan (ver GUIA.md).
