from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/images/cat-band.jpg"
OUTPUT = ROOT / "public/images/cat-band-dithered.png"

BAYER = np.array(
    [
        [0, 32, 8, 40, 2, 34, 10, 42],
        [48, 16, 56, 24, 50, 18, 58, 26],
        [12, 44, 4, 36, 14, 46, 6, 38],
        [60, 28, 52, 20, 62, 30, 54, 22],
        [3, 35, 11, 43, 1, 33, 9, 41],
        [51, 19, 59, 27, 49, 17, 57, 25],
        [15, 47, 7, 39, 13, 45, 5, 37],
        [63, 31, 55, 23, 61, 29, 53, 21],
    ],
    dtype=np.float32,
)


def main() -> None:
    cell = 3
    max_width = 1600
    contrast = 1.35
    brightness = 0.88

    with Image.open(SOURCE) as source:
        source = source.convert("RGB")
        scale = min(1.0, max_width / source.width)
        size = (round(source.width * scale), round(source.height * scale))
        source = source.resize(size, Image.Resampling.BILINEAR)

    pixels = np.asarray(source, dtype=np.float32)
    luminance = (
        0.2126 * pixels[:, :, 0]
        + 0.7152 * pixels[:, :, 1]
        + 0.0722 * pixels[:, :, 2]
    )
    luminance = (luminance / 255.0 - 0.5) * contrast + 0.5
    luminance = np.clip(luminance * brightness, 0.0, 1.0)

    y = np.arange(size[1])[:, None] % 8
    x = (np.arange(size[0])[None, :] // cell) % 8
    threshold = BAYER[y, x] / 63.0
    output = np.where(luminance > threshold, 255, 0).astype(np.uint8)
    Image.fromarray(output, mode="L").convert("RGB").save(OUTPUT, optimize=True)


if __name__ == "__main__":
    main()
