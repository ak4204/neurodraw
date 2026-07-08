from backend.inference.svc_to_image import render_svc_bytes_to_image

with open(r'C:\Users\akank\Downloads\00001__1_1.svc', 'rb') as f:
    img = render_svc_bytes_to_image(f.read())
    img.save('test_spiral.png')
