"""
Quick script to inspect the routing classifier output shape and suggest label order.
Run from: backend/
  python check_router.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

try:
    import tensorflow as tf
    model = tf.keras.models.load_model("models/drawing_type_3class.keras")
    print("=== Router model summary ===")
    print(f"Input shape:  {model.input_shape}")
    print(f"Output shape: {model.output_shape}")
    print(f"Output units: {model.output_shape[-1]}")
    last_layer = model.layers[-1]
    print(f"Last layer:   {last_layer.name}  activation={getattr(last_layer, 'activation', '?')}")
    print()
    print("Layers:")
    for i, layer in enumerate(model.layers[-5:]):
        print(f"  [{i}] {layer.name}  output={layer.output_shape}")
    print()
    print("Current ROUTER_LABELS order in config.py: [\"Spiral\", \"Wave\", \"Garbage\"]")
    print("If your model was trained with a different class order, update ROUTER_LABELS in backend/inference/config.py")
except Exception as e:
    print(f"Error: {e}")
