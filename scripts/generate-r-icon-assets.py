"""Generate tightly cropped R icon assets for header and favicon."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "icons" / "rps icon.png"
BRAND = ROOT / "apps" / "web" / "public" / "brand"

# Content bounds from alpha analysis of icons/rps icon.png (1536x1024 source).
CONTENT_BBOX = (489, 211, 1060, 748)
LIME = (215, 255, 67, 255)
CANVAS_BG = (9, 9, 9, 255)


def crop_content(source: Image.Image) -> Image.Image:
    return source.crop(CONTENT_BBOX)


def square_canvas(
    content: Image.Image,
    *,
    fill_ratio: float,
    canvas_size: int,
    background: tuple[int, int, int, int] | None = None,
    recolor_lime: bool = False,
) -> Image.Image:
    target = int(canvas_size * fill_ratio)
    scale = target / max(content.size)
    resized = content.resize(
        (max(1, int(content.width * scale)), max(1, int(content.height * scale))),
        Image.Resampling.LANCZOS,
    )

    if recolor_lime:
        alpha = resized.split()[3]
        tinted = Image.new("RGBA", resized.size, LIME)
        tinted.putalpha(alpha)
        resized = tinted

    if background is None:
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    else:
        canvas = Image.new("RGBA", (canvas_size, canvas_size), background)

    offset = (
        (canvas_size - resized.width) // 2,
        (canvas_size - resized.height) // 2,
    )
    canvas.paste(resized, offset, resized)
    return canvas


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    content = crop_content(source)

    header = square_canvas(content, fill_ratio=0.86, canvas_size=512)
    header.save(BRAND / "rps-icon-header.png", optimize=True)

    favicon = square_canvas(
        content,
        fill_ratio=0.9,
        canvas_size=512,
        background=CANVAS_BG,
        recolor_lime=True,
    )

    for size in (16, 32, 48, 180):
        favicon.resize((size, size), Image.Resampling.LANCZOS).save(
            BRAND / f"rps-icon-{size}.png",
            optimize=True,
        )

    print(f"Source: {SOURCE}")
    print(f"Header: {BRAND / 'rps-icon-header.png'}")
    print("Favicons: 16, 32, 48, 180")


if __name__ == "__main__":
    main()
