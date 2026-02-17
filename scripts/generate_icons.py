from PIL import Image, ImageDraw, ImageFont
import os

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
output_dir = "/Users/teddy/dev/whoisspy/public/icons"


def create_icon(size):
    img = Image.new("RGB", (size, size), "#667eea")
    draw = ImageDraw.Draw(img)

    # Draw gradient manually
    for y in range(size):
        ratio = y / size
        r = int(102 * (1 - ratio) + 118 * ratio)
        g = int(126 * (1 - ratio) + 75 * ratio)
        b = int(234 * (1 - ratio) + 162 * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b))

    # Try to load a font, fall back to default
    try:
        font_large = ImageFont.truetype(
            "/System/Library/Fonts/Helvetica.ttc", int(size * 0.4)
        )
        font_small = ImageFont.truetype(
            "/System/Library/Fonts/Helvetica.ttc", int(size * 0.18)
        )
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw rounded rectangle border
    corner_radius = int(size * 0.2)
    draw.rounded_rectangle(
        [0, 0, size - 1, size - 1],
        radius=corner_radius,
        outline="white",
        width=max(2, size // 50),
    )

    # Draw text
    text = "卧底"
    bbox = draw.textbbox((0, 0), text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) / 2
    y = (size - text_height) / 2 - size * 0.05
    draw.text((x, y), text, fill="white", font=font_large)

    # Draw subtitle
    subtext = "新加坡"
    bbox = draw.textbbox((0, 0), subtext, font=font_small)
    text_width = bbox[2] - bbox[0]
    x = (size - text_width) / 2
    y = size * 0.65
    draw.text((x, y), subtext, fill="white", font=font_small)

    return img


for size in sizes:
    img = create_icon(size)
    filepath = os.path.join(output_dir, f"icon-{size}x{size}.png")
    img.save(filepath, "PNG")
    print(f"Created {filepath}")
