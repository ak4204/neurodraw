import io
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter1d

from .pahaw_pipeline import _parse_svc

def render_svc_bytes_to_image(file_bytes: bytes, img_size: int = 512) -> Image.Image:
    """
    Renders an .svc file byte stream into a CNN-ready PIL Image.
    Only draws the pen-down segments (button == 1).
    Applies bounding-box normalization to center the drawing with 10% padding.
    Smooths coordinates and uses super-sampling for anti-aliasing to prevent 
    'digital tremor' from confusing the CNN.
    """
    df = _parse_svc(file_bytes)
    
    x_raw = df['x'].values.astype(float)
    y_raw = df['y'].values.astype(float)
    btn = df['button'].values
    
    # 1. Smooth coordinates to remove digital hardware jaggedness
    x = gaussian_filter1d(x_raw, sigma=2)
    y = gaussian_filter1d(y_raw, sigma=2)
    
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
    
    # 2. Render at 4x resolution (super-sampling) for anti-aliasing
    render_size = img_size * 4
    
    scale_x = render_size / (x_max - x_min)
    scale_y = render_size / (y_max - y_min)
    scale = min(scale_x, scale_y)
    
    off_x = (render_size - (x_max - x_min) * scale) / 2
    off_y = (render_size - (y_max - y_min) * scale) / 2
    
    img = Image.new("RGB", (render_size, render_size), "white")
    draw = ImageDraw.Draw(img)
    
    # We want to draw continuous paths
    for i in range(1, len(df)):
        if btn[i] == 1 and btn[i-1] == 1:
            px1 = (x[i-1] - x_min) * scale + off_x
            py1 = (y[i-1] - y_min) * scale + off_y
            px2 = (x[i] - x_min) * scale + off_x
            py2 = (y[i] - y_min) * scale + off_y
            
            # Draw thicker line relative to 4x resolution
            draw.line([(px1, py1), (px2, py2)], fill="black", width=12, joint="curve")
            
    # 3. Resize down with high-quality Lanczos resampling
    img = img.resize((img_size, img_size), Image.Resampling.LANCZOS)
    
    return img
