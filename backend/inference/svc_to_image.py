import io
import numpy as np
from PIL import Image, ImageDraw

from .pahaw_pipeline import _parse_svc

def render_svc_bytes_to_image(file_bytes: bytes, img_size: int = 512) -> Image.Image:
    """
    Renders an .svc file byte stream into a CNN-ready PIL Image.
    Only draws the pen-down segments (button == 1).
    Applies bounding-box normalization to center the drawing with 10% padding.
    """
    df = _parse_svc(file_bytes)
    
    x = df['x'].values
    y = df['y'].values
    btn = df['button'].values
    
    on_mask = btn == 1
    if not np.any(on_mask):
        return Image.new("RGB", (img_size, img_size), "white")
        
    x_min, x_max = x[on_mask].min(), x[on_mask].max()
    y_min, y_max = y[on_mask].min(), y[on_mask].max()
    
    w = max(x_max - x_min, 1)
    h = max(y_max - y_min, 1)
    
    pad_x = w * 0.1
    pad_y = h * 0.1
    
    x_min -= pad_x
    x_max += pad_x
    y_min -= pad_y
    y_max += pad_y
    
    scale_x = img_size / (x_max - x_min)
    scale_y = img_size / (y_max - y_min)
    scale = min(scale_x, scale_y)
    
    off_x = (img_size - (x_max - x_min) * scale) / 2
    off_y = (img_size - (y_max - y_min) * scale) / 2
    
    img = Image.new("RGB", (img_size, img_size), "white")
    draw = ImageDraw.Draw(img)
    
    # We want to draw continuous paths
    for i in range(1, len(df)):
        if btn[i] == 1 and btn[i-1] == 1:
            px1 = (x[i-1] - x_min) * scale + off_x
            py1 = (y[i-1] - y_min) * scale + off_y
            px2 = (x[i] - x_min) * scale + off_x
            py2 = (y[i] - y_min) * scale + off_y
            
            draw.line([(px1, py1), (px2, py2)], fill="black", width=3)
            
    return img
