#!/usr/bin/env bash
# Instalador del pack de efectos de Converzzo. Se puede correr varias veces sin problema.
# Lo llama preparar.sh con --solo-motor (los comandos ya vienen en el plugin).
# Imprime LISTO cuando todo quedó instalado, o FALTA_<cosa> si hay que instalar algo antes.
set -e
cd "$(dirname "$0")"
RAIZ="$(pwd)"

command -v ffmpeg  >/dev/null 2>&1 || { echo "FALTA_FFMPEG (Mac: brew install ffmpeg · Windows: winget install ffmpeg)"; exit 1; }
command -v node    >/dev/null 2>&1 || { echo "FALTA_NODE (instala Node.js 18 o superior desde nodejs.org)"; exit 1; }
node -e 'process.exit(+process.versions.node.split(".")[0] >= 18 ? 0 : 1)' || { echo "FALTA_NODE (se necesita Node.js 18 o superior)"; exit 1; }
PY=""
for v in python3.12 python3.11 python3.13 python3.10 python3 python; do
  if command -v "$v" >/dev/null 2>&1 && "$v" -c 'import sys; sys.exit(0 if sys.version_info[:2] >= (3, 10) else 1)' 2>/dev/null; then PY="$v"; break; fi
done
[ -n "$PY" ] || { echo "FALTA_PYTHON (instala Python 3.10 o superior desde python.org)"; exit 1; }

echo "1/3 Motor de animación..."
( cd motor && npm install --no-audit --no-fund --loglevel=error )

echo "2/3 Detector de cara y transcriptor..."
if [ ! -d motor/.venv ]; then "$PY" -m venv motor/.venv; fi
VPY=motor/.venv/bin/python; [ -x "$VPY" ] || VPY=motor/.venv/Scripts/python.exe
"$VPY" -m pip install -q --upgrade pip
"$VPY" -m pip install -q -r motor/requirements.txt
# aceleración con la tarjeta gráfica (si falla, todo sigue funcionando con el procesador)
#  - Mac: CoreML ya viene incluido.  - Windows: DirectML (sirve con NVIDIA, AMD e Intel).  - Linux con NVIDIA: CUDA.
#  Se instala encima del onnxruntime normal (lo pide el transcriptor), sin desinstalar nada.
tiene() { "$VPY" -c "import onnxruntime as o, sys; sys.exit(0 if '$1' in o.get_available_providers() else 1)" 2>/dev/null; }
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*|Windows_NT)
    if ! tiene DmlExecutionProvider; then
      echo "   Activando la tarjeta gráfica (DirectML)..."
      "$VPY" -m pip install -q --force-reinstall --no-deps onnxruntime-directml || echo "   (Sin aceleración gráfica; se usará el procesador)"
    fi ;;
  Linux)
    if command -v nvidia-smi >/dev/null 2>&1 && ! tiene CUDAExecutionProvider; then
      echo "   Activando la tarjeta gráfica (CUDA)..."
      { "$VPY" -m pip install -q "onnxruntime-gpu[cuda,cudnn]" && "$VPY" -m pip install -q --force-reinstall --no-deps onnxruntime-gpu; } || echo "   (Sin aceleración gráfica; se usará el procesador)"
    fi ;;
esac
# recorte y seguimiento de objetos con SAM 2.1 (PyTorch + Transformers, ~1 GB): si falla, se usa el recorte automático
if ! "$VPY" -c 'import torch, transformers' 2>/dev/null; then
  echo "   Instalando el seguimiento de objetos (SAM 2.1, solo la primera vez, puede tardar)..."
  IDX=""
  case "$(uname -s)" in
    Linux) command -v nvidia-smi >/dev/null 2>&1 || IDX="--index-url https://download.pytorch.org/whl/cpu" ;;
    MINGW*|MSYS*|CYGWIN*|Windows_NT) command -v nvidia-smi >/dev/null 2>&1 && IDX="--index-url https://download.pytorch.org/whl/cu126" ;;
  esac
  { "$VPY" -m pip install -q $IDX torch torchvision && "$VPY" -m pip install -q "transformers>=4.56"; } || echo "   (No se pudo instalar SAM 2.1; se usará el recorte automático de objetos)"
fi
if "$VPY" -c 'import torch, transformers' 2>/dev/null && [ ! -d motor/models/hf ]; then
  echo "   Descargando los modelos SAM 2.1 y de profundidad (solo la primera vez)..."
  "$VPY" -c 'from transformers import Sam2VideoModel, Sam2VideoProcessor as P, AutoModelForDepthEstimation as D, AutoImageProcessor as I; r="facebook/sam2.1-hiera-small"; Sam2VideoModel.from_pretrained(r, cache_dir="motor/models/hf"); P.from_pretrained(r, cache_dir="motor/models/hf"); d="depth-anything/Depth-Anything-V2-Small-hf"; D.from_pretrained(d, cache_dir="motor/models/hf"); I.from_pretrained(d, cache_dir="motor/models/hf")' >/dev/null 2>&1 \
    || { rm -rf motor/models/hf; echo "   (Se descargará la primera vez que se use)"; }
fi
# recorte preciso de la persona (Robust Video Matting, ~107 MB): se descarga una sola vez; si falla, se usa el recorte básico
RVM=motor/models/rvm_resnet50_fp32.onnx
if [ ! -s "$RVM" ] || [ "$(wc -c < "$RVM")" -lt 50000000 ]; then
  echo "   Descargando el modelo de recorte preciso (solo la primera vez)..."
  curl -fsSL --retry 2 -o "$RVM.tmp" https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_resnet50_fp32.onnx && mv "$RVM.tmp" "$RVM" || { rm -f "$RVM.tmp"; echo "   (No se pudo descargar; se usará el recorte básico)"; }
fi

echo "3/3 Comandos de Claude..."
if [ "$1" != "--solo-motor" ] && [ -d skills ]; then
  mkdir -p "$HOME/.claude/skills"
  for s in skills/*/; do
    n="$(basename "$s")"
    rm -rf "$HOME/.claude/skills/$n"
    cp -R "$s" "$HOME/.claude/skills/$n"
  done
fi

echo "$RAIZ" > "$HOME/.claude/efectos-converzzo.ruta"
echo "LISTO"
