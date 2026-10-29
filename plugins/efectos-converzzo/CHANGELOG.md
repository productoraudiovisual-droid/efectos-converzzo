# Cambios

## 1.9.0
**Movimiento y ritmo**
- `/estabilizar`: quita el temblor de cámara en mano (flujo óptico + RANSAC, zoom mínimo sin bordes).
- `/rampa-velocidad`: la velocidad baja suave a cámara lenta (o sube) y vuelve, con cuadros intermedios.
- `/zoom-al-ritmo`: detecta los golpes de la música (o del audio) y da un pulso de zoom en cada uno.
- `/parallax-3d`: separa un cuadro o una foto en capas por profundidad (Depth Anything V2) y le da movimiento 3D.
- Los efectos de tiempo ahora leen cada tramo por separado: menos memoria con muchas piezas.

## 1.8.0
**Recorte creativo**
- `/contorno-neon`, `/sticker`, `/eco` sobre la persona o un objeto.
- `/quitar-fondo`: entrega el video con transparencia (.mov ProRes 4444 o .webm) o sobre un color plano.
- `/pantalla-verde`: clave de color automática (verde o azul), sin reflejo verde en la piel.

## 1.7.0
**Tracking de objetos**
- `/pixelar` (documentos, placas, pantallas, caras), `/lupa`, `/foco`, `/etiqueta-sigue`, `/reencuadre-objeto`.
- `/ingredientes` con `objeto`: los puntos se siguen solo sobre el plato o producto.

## 1.6.0
**Todos los formatos**
- Nuevos formatos: `"cuadrado"` (1080×1080) y `"retrato"` (1080×1350, 4:5).
- Las tarjetas se ubican solas sin tapar la cara en vertical, horizontal, cuadrado y 4:5 (al lado libre, debajo o más pequeñas).
- `motor/probar.mjs`: prueba automática de todos los efectos gráficos en los cuatro formatos, con hoja de contacto.

## 1.5.0
**SAM 2.1**
- Recorte y seguimiento de objetos con SAM 2.1 a partir de un punto o una caja, con memoria constante (videos largos).
- Bordes pegados a la imagen (filtro guiado) y flujo óptico entre cuadros clave cuando no hay tarjeta gráfica.

## 1.4.0
**Velocidad**
- Caché de transcripción, caras, recortes y máscaras: repetir un render con cambios es mucho más rápido.
- Las fotos de control solo calculan los cuadros que necesitan.
- Tarjeta gráfica cuando hay: CoreML (Mac), DirectML (Windows), CUDA (NVIDIA); Chrome con aceleración en Mac y Windows.
- `--borrador`: render a 720p para revisar rápido.
