# Guía para Claude: cómo aplicar los efectos de Converzzo

Todos los comandos del pack siguen este flujo. La persona normalmente no es técnica: háblale en español sencillo, con tuteo y en frases cortas. Haz tú todo el trabajo y nunca le pidas que corra comandos.

## 0. Rutas
- `PACK` = `~/.claude/efectos-converzzo` (lo deja listo `preparar.sh` del plugin). `MOTOR` = `PACK/motor`.
- `PY` = `MOTOR/.venv/bin/python` (en Windows `MOTOR/.venv/Scripts/python.exe`).
- Los avisos que salen al cerrar los scripts de Python (`Exception ignored…`, `distutils…`) son inofensivos.

## 1. El video
- Usa el video que la persona adjuntó o nombró. Si tiene una carpeta "Material crudo", búscalo ahí. Si no hay video, pídelo.
- Nunca modifiques el original: todo sale como un archivo nuevo.
- Sirve vertical u horizontal. La salida respeta el formato del original (ver "Formato de salida").

## 2. Encuentra los momentos
- Si la persona dice el momento ("en la palabra dinero", "en el segundo 5"), úsalo.
- Si no, transcribe: `PY MOTOR/scripts/transcribir.py <video> <carpeta>/transcripcion.json es` (imprime el texto con tiempos). Elige el momento según lo que diga cada efecto en su comando.
- Cada palabra trae `start` y `end` en segundos. Para que un efecto caiga justo en una palabra, usa `desde` = `start` de esa palabra menos 0,05 s.

## 3. Arma el plan (uno o varios efectos)
Escribe `plan.json` junto al video. Cada efecto es una "capa" con `efecto`, `desde` y `hasta` en segundos, más sus opciones:
```json
{
  "capas": [
    {"efecto": "zoom-in", "desde": 2.76, "hasta": 4.2},
    {"efecto": "precio-pop", "desde": 8.1, "hasta": 11.6, "producto": "Sérum vitamina C", "antes": "$89.900", "ahora": "$59.900"}
  ],
  "estilo": {},
  "sonido": true
}
```
**Antes de renderizar, muestra el plan en una tabla corta** (Segundo · Efecto · Detalle) y espera el visto bueno. Si la persona ya lo dejó todo claro en su mensaje, puedes renderizar directo.

## 4. Fotos de control
`cd MOTOR && node render.mjs <video> <plan.json> <carpeta>/control.png --still 3.1,9.5`
Usa el punto medio de cada efecto. Mira las fotos tú mismo: la cara no puede quedar tapada ni cortada, los textos deben leerse completos y nada puede salirse del borde. Ajusta el plan y repite si hace falta.

## 5. Render final
`cd MOTOR && node render.mjs <video> <plan.json> <salida>.mp4`
- Sale en el formato del original (ver abajo) con el audio original a -14 LUFS y sonidos sutiles en cada efecto. Para quitarlos: `"sonido": false`.
- Guárdalo como `<nombre>_efectos.mp4` en la carpeta "Resultados" si existe, o junto al original. Entrega el archivo y recuerda en una línea que lo revise antes de publicar.
- Para hacer cambios después ("más zoom", "cambia el precio"), edita el plan y vuelve a renderizar.

## Formato de salida
- Por defecto el video sale **con la misma proporción del original**: un video horizontal sale horizontal (1920×1080) y uno vertical sale vertical (1080×1920).
- Para forzarlo, pon en el plan `"formato": "vertical"` (1080×1920, para Reels/TikTok) o `"formato": "horizontal"` (1920×1080, para YouTube).
- Si el video es horizontal y la persona habla de Reels, TikTok o Shorts, pregúntale en una línea si lo quiere vertical. `/reencuadre` siempre sale vertical.
- En horizontal, las tarjetas (prompt, chat, notificaciones, gráficas, widgets) se ubican al lado libre de la cara.

## Efectos disponibles
**Edición base** (normalmente en todo el video): `cortar-silencios`, `limpiar-voz`, `musica`.

| `efecto` | Qué hace | Opciones |
|---|---|---|
| `cortar-silencios` | Quita pausas largas con zoom alterno en cada corte | `umbral` (0.45 s), `margen`, `zoom_alterno`, `zoom` |
| `limpiar-voz` | Reduce ruido, quita retumbe y da presencia; −14 LUFS | `intensidad` (suave/media/fuerte) |
| `musica` | Música de fondo que baja sola con la voz | `musica_archivo`, `volumen` (0.22), `bajar_con_voz` |
| `zoom-in` | Zoom marcado y suave hacia la cara en una palabra clave | `zoom` (1.25; de 1.1 a 1.5), `rapidez` (0.45 s), `volver`: `"corte"` (por defecto) o `"suave"` |
| `zoom-suave` | Acercamiento lento y cinematográfico durante una frase | `zoom` (1.18), `volver`: `"corte"` o `"suave"` |
| `zoom-out` | Arranca cerca y se abre el plano para revelar | `zoom` (1.45) |
| `sacudida` | Temblor de cámara en un golpe (0,4 a 0,8 s). Solo si la persona lo pide | `intensidad` (1; de 0.5 a 2) |
| `dolly-zoom` | Efecto vértigo: la persona queda igual y el fondo se estira (1,5 a 3 s) | `zoom` (1.35), `direccion`: `"abre"` (por defecto) o `"cierra"` |
| `reencuadre` | Pasa un video horizontal a vertical siguiendo la cara | `posicion` (0.5 = cara al centro), `suavidad` (0.6 s) |
| `barrido` | Transición whip pan con desenfoque de movimiento (0,35 a 0,5 s) | `direccion` (`izquierda`/`derecha`) |
| `zoom-transicion` | Zoom de paso hacia adentro y hacia afuera en un cambio (0,5 a 0,8 s) | `zoom` (2.2) |
| `color-auto` | Corrige exposición y balance de blancos | `intensidad` (1), `transicion` |
| `cambiar-fondo` | Recorta a la persona y pone otro fondo | `fondo_archivo` o `color`, `desenfoque`, `transicion` |
| `look` | Look de color: cálido, frío, cine, blanco y negro, vintage o vivo | `estilo`, `intensidad` (1), `transicion` (0.3 s; 0 = sin transición) |
| `color-pop` | La persona a color y el fondo en blanco y negro | `transicion` (0.35 s) |
| `fondo-borroso` | Fondo desenfocado y persona nítida (modo retrato) | `desenfoque` (12 px), `transicion` (0.4 s) |
| `grano` | Grano de película | `intensidad` (1; de 0.5 a 2) |
| `flash` | Destello en un corte o cambio de idea (0,3 a 0,5 s) | `color` (blanco), `intensidad` (1) |
| `glitch` | Falla digital a ráfagas (0,3 a 0,8 s) | `intensidad` (1; de 0.5 a 2) |
| `camara-lenta` | Cámara lenta fluida en un tramo | `velocidad` (0.5), `audio` (`lento`/`silencio`), `fluido` (true), `etiqueta` |
| `acelerar` | Acelera un tramo (x2, x4…) | `velocidad` (2), `audio` (`rapido`/`silencio`), `etiqueta` |
| `congelar` | Congela la imagen con texto y flecha; el video sigue donde se pausó | `texto`, `color`; `hasta` − `desde` = duración de la pausa |
| `rebobinar` | Rebobina con look VHS y repite el tramo | `velocidad` (3), `repetir` (true), `texto` |
| `precio-pop` | Etiqueta de precio con descuento | `producto`, `antes`, `ahora`, `descuento`, `nota`, `lado` (`izq`/`der`), `y` (0 a 1) |
| `ingredientes` | Etiquetas que señalan partes o ingredientes | `titulo`, `puntos` (texto, x, y, en) |
| `tallas-colores` | Tallas (agotadas tachadas) y colores disponibles | `titulo`, `tallas`, `agotadas`, `colores`, `y` |
| `grafica-datos` | Gráfica animada: barras, línea o dona | `tipo`, `titulo`, `datos`, `prefijo`, `sufijo`, `decimales`, `destacar`, `fuente`, `y` |
| `logo-sting` | Logo animado a pantalla completa o en la esquina | `logo_archivo`, `texto`, `fondo`, `estilo` (pop/revelado), `posicion` (pantalla/esquina) |
| `tier-list` | Tablero S/A/B/C donde cada ítem cae al nombrarlo | `titulo`, `items` (texto, tier, en), `tiers`, `fondo` (`opaco`) |
| `mockup-interfaz` | Chat, notificaciones o prompt de IA genéricos | `tipo` (chat/notificacion/prompt), `mensajes`, `notificaciones`, `prompt`, `nombre` |
| `widgets-vidrio` | Tarjetas de vidrio con datos alrededor de la persona | `widgets` (titulo + valor/progreso/datos) |
| `collage-halftone` | Persona en papel impreso con trama sobre kraft, stop motion | `titulo`, `papel`, `tinta`, `acento` |
| `carrusel-video` | Láminas de un carrusel pasando como en Instagram | `imagenes_archivos`, `modo` (pantalla/tarjeta), `dedo` |
| `color-referencia` | Copia el color de una imagen de referencia (todo el video) | `referencia_archivo`, `intensidad` (0.75) |
| `look-pelicula` | Look de cine completo: color, halo, vaivén, grano, viñeta, bandas | `intensidad`, `bandas`, `transicion` |
| `efectos-sonido` | Sonidos sincronizados y volumen general de los sonidos | `sonidos` (tipo + en), `nivel`, `en_cortes` |
| `paso-a-paso` | Lista numerada que avanza al ritmo del audio | `titulo`, `pasos` (texto + `en`), `y` |
| `comparativo` | Dos columnas con VS, chulos y equis | `izquierda`/`derecha` (titulo + puntos), `ganador`, `y` |
| `ficha` | Ficha de producto u outfit con línea al producto | `titulo`, `detalles`, `precio`, `punto` (x, y) |
| `cta-whatsapp` | Botón de WhatsApp con número y toque | `texto`, `numero`, `subtexto`, `color`, `y` |
| `ubicacion` | Mini mapa con pin, nombre, dirección y horario | `nombre`, `direccion`, `horario`, `y` |
| `antes-despues` | Pantalla dividida con barra deslizante | `antes_en`/`despues_en` o `antes_archivo`/`despues_archivo`, `division`, `quieto`, `etiquetas` |

## Estilo
Lo usan los efectos gráficos (como `precio-pop`). Campos de `estilo`: `fondo`, `texto`, `suave`, `acento`, `sticker`, `stickerTexto`, `fuente`, `fuenteTitulo`.
- Si la persona describe un estilo ("rosado y elegante") o pasa referencias (su logo, su feed, una guía de estilo en "Referentes"), saca de ahí los colores en hex.
- Para usar otra fuente, copia el `.ttf`/`.otf` a `MOTOR/public/fonts/` y pon el nombre del archivo en `fuente` y `fuenteTitulo`.

## Tiempos de render
- Lo más rápido: zooms, transiciones, gráficos y textos.
- Tardan más: los que recortan a la persona (`dolly-zoom`, `color-pop`, `fondo-borroso`, `cambiar-fondo`, `collage-halftone`), la `camara-lenta` fluida y los que cubren todo el video. Avísale a la persona que tendrá que esperar un poco más.

## Reglas para combinar
- Edición completa típica: `limpiar-voz` + `cortar-silencios` en todo el video, y encima los efectos puntuales (zooms, gráficos). Todos los tiempos en el video original.
- Subtítulos y textos animados están en el plugin hermano **tipografia-converzzo** (otro GitHub). Si la persona los quiere, primero se aplican estos efectos y luego se pasa el video resultante por ese plugin.
- Efectos de tiempo (`camara-lenta`, `acelerar`, `congelar`, `rebobinar`): todos los tiempos del plan van en el tiempo del video ORIGINAL (el de la transcripción); el motor los ajusta solo. No se pueden encimar entre ellos. Las fotos de control (`--still`) también se piden en tiempo del original. Para ver un `congelar`, pide la foto en su `desde`; para ver el rebobinado o la cámara lenta, en medio de su tramo.
- Los efectos de cámara se combinan: sus zooms se multiplican. No agregues `sacudida` a menos que la persona la pida.
- `look`, `grano` y `fondo-borroso` pueden ir en todo el video y combinarse con todo lo demás.
- No pongas `color-pop`, `fondo-borroso`, `cambiar-fondo`, `collage-halftone` y `dolly-zoom` en el mismo tramo: todos usan el recorte de la persona.
- `look-pelicula` ya incluye color, grano y viñeta: no lo encimes con `look` ni `grano`.
- `color-auto` va primero en el plan y en todo el video; luego, si se quiere, un `look` encima.
- No pongas dos zooms del mismo tipo encimados en el mismo tramo.
- `dolly-zoom` termina en corte: ubícalo justo antes de un cambio de frase. No lo combines con `reencuadre` en el mismo tramo.
- `reencuadre` va normalmente en todo el video (`desde` 0, `hasta` = duración).
- Nunca inventes datos de negocio (precios, números de WhatsApp, direcciones, horarios, características): solo lo que la persona dice o escribe.
- Los gráficos nunca tapan la cara. Si dos gráficos coinciden, deja al menos 0,5 s entre uno y otro o ponlos en lados distintos.
- Menos es más: en un video de 30 s, entre 3 y 6 efectos bien puestos funcionan mejor que 15.
