#!/usr/bin/env python3
"""Create high-quality web display copies of the Jidu gallery artwork."""

from pathlib import Path

from PIL import Image


SOURCE_DIR = Path(__file__).resolve().parents[1] / "public" / "work" / "jidu" / "images"
TARGET_WIDTH = 1600
WEBP_QUALITY = 92


def optimize(source: Path) -> None:
    target = source.with_suffix(".webp")

    with Image.open(source) as image:
        width, height = image.size
        target_height = round(height * TARGET_WIDTH / width)
        resized = image.resize(
            (TARGET_WIDTH, target_height),
            Image.Resampling.LANCZOS,
            reducing_gap=3,
        )
        resized.save(
            target,
            "WEBP",
            quality=WEBP_QUALITY,
            method=6,
            alpha_quality=100,
            exact=True,
        )

    print(f"{source.name} -> {target.name} ({TARGET_WIDTH}x{target_height})")


def main() -> None:
    sources = sorted(SOURCE_DIR.glob("*.png"))
    if not sources:
        raise SystemExit(f"No PNG files found in {SOURCE_DIR}")

    for source in sources:
        optimize(source)


if __name__ == "__main__":
    main()
