from rembg import remove
from PIL import Image
import io
import os

input_path = r"C:/Users/mueez/.gemini/antigravity/brain/0ec12f3f-43b8-444f-8836-0ac82cd2c347/uploaded_image_0_1764416552935.jpg"
output_path = r"c:/Users/mueez/OneDrive/Desktop/web-meta/public/login_girl_transparent.png"

print(f"Processing {input_path}...")

try:
    with open(input_path, 'rb') as i:
        input_data = i.read()
        output_data = remove(input_data)
        
        with open(output_path, 'wb') as o:
            o.write(output_data)
            
    print(f"Saved transparent image to {output_path}")
except Exception as e:
    print(f"Error: {e}")
