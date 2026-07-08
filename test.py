import sys
sys.path.append('backend')
from inference.pahaw_pipeline import _parse_svc, _extract_features
with open('scratch_test.svc', 'rb') as f:
    b = f.read()
strokes = _parse_svc(b)
print('strokes:', len(strokes))
features = _extract_features(strokes)
print(features)
