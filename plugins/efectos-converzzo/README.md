# Efectos y animaciones de video · Converzzo

Efectos de video, motion graphics y edición para tus videos verticales (Reels, TikTok, Shorts) que Claude aplica por ti con un solo comando. ¿Buscas subtítulos y textos animados? Están en el plugin hermano **tipografia-converzzo**. Gratis, por [@converzzo](https://instagram.com/converzzo).

## Cómo instalarlo
**En la app de Claude (Cowork o chat):**
1. Ve a Personalizar → **Plugins** → Agregar → **Agregar marketplace**.
2. Escribe `productoraudiovisual-droid/efectos-converzzo`.
3. En la pestaña **Descubrir**, abre *efectos-converzzo* y dale **Agregar**.

**En Claude Code:**
```
/plugin marketplace add productoraudiovisual-droid/efectos-converzzo
/plugin install efectos-converzzo@efectos-converzzo
```

Listo: escribe `/` y verás todos los comandos. La primera vez que uses uno, Claude prepara el motor solo (1 a 3 minutos). Después va directo.

## Cómo usarlo
Adjunta tu video y escribe el comando, por ejemplo:

> /zoom-in en la palabra "gratis"

Claude escucha el video, te muestra el plan para que lo apruebes y te entrega el video listo, en el mismo formato de tu video (vertical 1080×1920 u horizontal 1920×1080).

## Efectos
**Edición base**
| Comando | Qué hace |
|---|---|
| `/cortar-silencios` | Quita las pausas largas y oculta los cortes con un leve zoom |
| `/limpiar-voz` | Menos ruido, voz más clara y volumen estándar de redes |
| `/musica` | Tu música de fondo, que baja sola cuando hablas |

**Cámara**
| Comando | Qué hace |
|---|---|
| `/zoom-in` | Zoom marcado y suave hacia la cara en una palabra clave |
| `/zoom-suave` | Acercamiento lento y cinematográfico durante una frase |
| `/zoom-out` | Arranca cerca y se abre el plano para revelar |
| `/sacudida` | Temblor de cámara en un golpe o momento fuerte |
| `/dolly-zoom` | Efecto vértigo: tú quedas igual y el fondo se estira (sin pantalla verde) |
| `/reencuadre` | Pasa un video horizontal a vertical siguiendo tu cara |

**Color y fondo**
| Comando | Qué hace |
|---|---|
| `/color-auto` | Corrige solo la luz y el balance de blancos |
| `/look` | Look de color: cálido, frío, cine, blanco y negro, vintage o vivo |
| `/color-pop` | Tú a color y el fondo en blanco y negro |
| `/fondo-borroso` | Fondo desenfocado y tú nítido, como el modo retrato |
| `/cambiar-fondo` | Te recorta y pone otro fondo (foto, video o color) |
| `/grano` | Grano de película |
| `/color-referencia` | Copia el color de una foto o video que te guste |
| `/look-pelicula` | Look de cine completo: color, halo, grano y bandas negras |

**Transiciones**
| Comando | Qué hace |
|---|---|
| `/flash` | Destello en un corte o cambio de idea |
| `/glitch` | Falla digital a ráfagas |
| `/barrido` | Paneo rápido (whip pan) en un corte |
| `/zoom-transicion` | Zoom de paso hacia adentro y afuera |

**Motion graphics**
| Comando | Qué hace |
|---|---|
| `/grafica-datos` | Gráfica animada de barras, línea o dona con tus datos |
| `/logo-sting` | Tu logo animado a pantalla completa o en la esquina |
| `/tier-list` | Tier list donde cada cosa cae en su nivel cuando la nombras |
| `/mockup-interfaz` | Chat, notificaciones de ventas o prompt de IA animados |
| `/widgets-vidrio` | Tarjetas de vidrio con tus métricas alrededor tuyo |
| `/collage-halftone` | Tú como recorte de papel impreso sobre kraft, estilo stop motion |
| `/carrusel-video` | Tu carrusel de Instagram convertido en video |

**Sonido**
| Comando | Qué hace |
|---|---|
| `/efectos-sonido` | Sonidos sincronizados (whoosh, pop, notificación, caja registradora…) |

**Tiempo**
| Comando | Qué hace |
|---|---|
| `/camara-lenta` | Cámara lenta fluida en un tramo |
| `/acelerar` | Acelera un tramo (x2, x4…) |
| `/congelar` | Congela la imagen con un texto y una flecha dibujada |
| `/rebobinar` | Rebobina con look VHS y repite el momento |

**Para negocios**
| Comando | Qué hace |
|---|---|
| `/precio-pop` | Etiqueta de precio con el anterior tachado, el nuevo rodando y el sello de descuento |
| `/paso-a-paso` | Lista numerada que avanza mientras explicas cada paso |
| `/comparativo` | Tú vs la competencia (o A vs B) en dos columnas con chulos y equis |
| `/ficha` | Ficha de producto u outfit con una línea que lo señala |
| `/cta-whatsapp` | Botón de WhatsApp con tu número para cerrar el video |
| `/ubicacion` | Mini mapa con tu local, dirección y horario |
| `/antes-despues` | Antes y después con barra deslizante |
| `/ingredientes` | Etiquetas que señalan ingredientes o partes de un producto |
| `/tallas-colores` | Tallas y colores disponibles de una prenda |

**Varios a la vez:** `/efectos-converzzo` y dile qué quieres ("zoom en la palabra dinero, flash al cambiar de tema y el precio cuando hablo del sérum"). Todo sale en un solo render.

Se actualiza desde la sección Plugins.

## Qué necesitas
- Un plan de pago de Claude (Pro, Max, Team o Enterprise).
- Recomendado: Cowork o Claude Code, porque el video se procesa en tu computador.
- Claude instala solo lo que haga falta (ffmpeg, Node.js, Python). No hay costos extra ni cuentas nuevas.

## Para desarrolladores
- `.claude-plugin/marketplace.json`: el marketplace (este repo).
- `plugins/efectos-converzzo/`: el plugin.
  - `skills/<efecto>/SKILL.md`: los comandos.
  - `preparar.sh`: copia el motor a `~/.claude/efectos-converzzo` e instala dependencias la primera vez o cuando cambia `VERSION`.
  - `motor/`: proyecto Remotion con una sola composición (`Editar`) que aplica capas. Cámara en `motor/src/efectos/camara.tsx`; gráficos en `motor/src/efectos/`, registrados en `motor/src/Editar.tsx`.
  - `motor/render.mjs <video> <plan.json> <salida.mp4> [--still 1.5,3]`: render en un paso (cara, recorte, -14 LUFS).
  - `GUIA.md`: el flujo que siguen todos los comandos.
- Para publicar una versión nueva: sube `VERSION` y `version` en `plugin.json` y `marketplace.json`.

Licencia MIT. Ver `plugins/efectos-converzzo/NOTICE.md` para fuentes y modelos de terceros.
