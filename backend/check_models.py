"""
Quick startup check — loads all models and prints status.
Run from: backend/
  python check_models.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

print("Checking model files...")
print()

files = {
    "Routing classifier": "models/drawing_type_3class.keras",
    "Spiral VGG16":       "models/final_model_Spiral.keras",
    "Wave VGG16":         "models/final_model_Wave.keras",
    "Unified VGG16":      "models/final_model_Unified.keras",
    "PaHaW pipeline":     "models/pahaw_pipeline_v3.joblib",
}

for name, path in files.items():
    exists = os.path.exists(path)
    size_mb = os.path.getsize(path) / 1024 / 1024 if exists else 0
    status = f"[OK] Found ({size_mb:.0f} MB)" if exists else "[MISSING]"
    print(f"  {name:<22} {path:<40} {status}")

print()
print("Loading router (MobileNetV2)...")
try:
    import tensorflow as tf
    m = tf.keras.models.load_model("models/drawing_type_3class.keras")
    print(f"  [OK] Router loaded -- input {m.input_shape}, output {m.output_shape}")
    
    # Quick test inference with a blank image
    import numpy as np
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    dummy = np.zeros((1, 224, 224, 3), dtype="float32")
    dummy = preprocess_input(dummy)
    out = m.predict(dummy, verbose=0)
    labels = ["Garbage", "Spiral", "Wave"]
    result = {l: f"{p:.3f}" for l, p in zip(labels, out[0])}
    print(f"  Test output (blank image): {result}")
    print(f"  Predicted class: {labels[out[0].argmax()]} — (expected: varies, but confirms model runs)")
except Exception as e:
    print(f"  [ERROR]: {e}")
