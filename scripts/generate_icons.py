import os
from PIL import Image

def generate_icons(source_path, output_dir):
    if not os.path.exists(source_path):
        print(f"Error: Source file {source_path} not found.")
        return

    # Ensure output directories exist
    icons_dir = os.path.join(output_dir, 'img', 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    img = Image.open(source_path)

    # Sizes and paths
    # (width, height), output_path
    targets = [
        ((180, 180), os.path.join(output_dir, 'apple-touch-icon.png')),
        ((16, 16), os.path.join(output_dir, 'favicon-16x16.png')),
        ((32, 32), os.path.join(output_dir, 'favicon-32x32.png')),
        ((192, 192), os.path.join(icons_dir, 'android-chrome-192x192.png')),
        ((512, 512), os.path.join(icons_dir, 'android-chrome-512x512.png')),
        ((512, 512), os.path.join(output_dir, 'logo.png')), # Also keep a PNG version of the logo
    ]

    for size, path in targets:
        print(f"Generating {path} ({size[0]}x{size[1]})...")
        resized = img.resize(size, Image.Resampling.LANCZOS)
        resized.save(path)

    # Generate favicon.ico (multi-resolution)
    ico_path = os.path.join(output_dir, 'favicon.ico')
    print(f"Generating {ico_path}...")
    img.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    print("Icon generation complete!")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, 'public')
    source_logo = os.path.join(public_dir, 'logo.jpg')
    
    generate_icons(source_logo, public_dir)
