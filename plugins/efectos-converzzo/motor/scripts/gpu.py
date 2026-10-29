"""Aceleración: usa la tarjeta gráfica cuando hay (CUDA en NVIDIA, DirectML en Windows, CoreML en Mac) y si algo falla vuelve al procesador.
Para forzar el procesador: variable de entorno EFECTOS_CPU=1.
"""
import os, sys
import onnxruntime as ort

ort.set_default_logger_severity(3)
_ORDEN = ["CUDAExecutionProvider", "DmlExecutionProvider", "CoreMLExecutionProvider"]
_avisado = set()


def proveedores():
    if os.environ.get("EFECTOS_CPU") == "1":
        return ["CPUExecutionProvider"]
    disp = ort.get_available_providers()
    return [p for p in _ORDEN if p in disp] + ["CPUExecutionProvider"]


class Sesion:
    """Envoltura de onnxruntime: arranca con la GPU y, si un cuadro falla, sigue en el procesador sin perder el trabajo."""

    def __init__(self, ruta):
        self.ruta = ruta
        self.s = None
        for prov in proveedores():
            try:
                opciones = {"MLComputeUnits": "ALL"} if prov == "CoreMLExecutionProvider" else {}
                lista = ["CPUExecutionProvider"] if prov == "CPUExecutionProvider" else [(prov, opciones), "CPUExecutionProvider"]
                self.s = ort.InferenceSession(ruta, providers=lista)
                self.prov = prov
                break
            except Exception:
                continue
        if self.s is None:
            self.s = ort.InferenceSession(ruta, providers=["CPUExecutionProvider"])
            self.prov = "CPUExecutionProvider"
        clave = (os.path.basename(ruta), self.prov)
        if clave not in _avisado:
            _avisado.add(clave)
            print(f"acelerador: {self.prov.replace('ExecutionProvider', '')} ({os.path.basename(ruta)})", file=sys.stderr, flush=True)

    def get_inputs(self):
        return self.s.get_inputs()

    def run(self, salidas, entradas):
        try:
            return self.s.run(salidas, entradas)
        except Exception:
            if self.prov == "CPUExecutionProvider":
                raise
            print("acelerador: la GPU falló en este modelo; sigo con el procesador", file=sys.stderr, flush=True)
            self.s = ort.InferenceSession(self.ruta, providers=["CPUExecutionProvider"])
            self.prov = "CPUExecutionProvider"
            return self.s.run(salidas, entradas)
