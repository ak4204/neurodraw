import sys
import os

sys.path.append(os.path.abspath('backend'))
from inference.pahaw_pipeline import process_svc_file, load_pahaw

print("Loading model...")
success = load_pahaw()
print("Model loaded successfully:", success)

svc_path = r"C:\Users\akank\Downloads\00001__1_1.svc"
print("Reading SVC file:", svc_path)

with open(svc_path, 'rb') as f:
    b = f.read()

print("Running pipeline...")
try:
    result = process_svc_file(b)
    print("SUCCESS! Result:")
    for k, v in result.items():
        if k == 'features':
            print("  features: <16 items>")
        else:
            print(f"  {k}: {v}")
except Exception as e:
    import traceback
    traceback.print_exc()
