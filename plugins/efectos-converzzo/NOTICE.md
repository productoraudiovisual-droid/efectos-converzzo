# Componentes de terceros

- `motor/models/yunet.onnx`: YuNet face detector (face_detection_yunet_2023mar), OpenCV Zoo, licencia MIT. https://github.com/opencv/opencv_zoo
- `motor/models/rvm_resnet50_fp32.onnx` (se descarga al instalar, no viene en el repositorio): Robust Video Matting, Shanchuan Lin y colaboradores, licencia GPL-3.0. https://github.com/PeterL1n/RobustVideoMatting
- `motor/models/u2net.onnx` y `isnet-general-use.onnx` (se descargan solo si se recorta un objeto): U2-Net (Xuebin Qin y otros, Apache 2.0) e IS-Net / DIS (Xuebin Qin y otros, Apache 2.0), versiones publicadas por el proyecto rembg (MIT). https://github.com/danielgatis/rembg
- `motor/models/hf/` (se descarga al instalar): SAM 2.1 Hiera Small, Meta AI, licencia Apache 2.0, usado con PyTorch (BSD) y Hugging Face Transformers (Apache 2.0). https://github.com/facebookresearch/sam2
- `motor/models/hf/` (se descarga al instalar): Depth Anything V2 Small (Lihe Yang y otros), licencia Apache 2.0, para `/parallax-3d`. https://github.com/DepthAnything/Depth-Anything-V2
- `motor/models/selfie_segmenter.tflite`: MediaPipe Selfie Segmenter, Google, Apache License 2.0. https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter
- `motor/public/fonts/Montserrat-*.ttf`: Montserrat, de Julieta Ulanovsky y colaboradores, SIL Open Font License 1.1.
- Transcripción: faster-whisper (MIT) con modelos Whisper de OpenAI (MIT), descargados en el primer uso.
- Animación: Remotion. Uso gratuito para personas y empresas pequeñas; empresas más grandes necesitan licencia: https://www.remotion.dev/license
- Sonidos en `motor/public/sfx/` y texturas en `motor/public/texturas/`: generados por Converzzo, libres de uso.
