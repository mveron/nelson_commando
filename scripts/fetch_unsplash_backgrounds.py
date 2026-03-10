from __future__ import annotations

import io
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


MISSION_SPECS = [
    {
        "slug": "mission_01",
        "photo_id": "soEvHwmj5zQ",
        "query": "airport tarmac dusk",
    },
    {
        "slug": "mission_02",
        "photo_id": "xTi__UtunmA",
        "query": "hospital corridor emergency",
    },
    {
        "slug": "mission_03",
        "photo_id": "fNJ4F9d4KF4",
        "query": "desert highway night",
    },
    {
        "slug": "mission_04",
        "photo_id": "X8uonmU2Ssw",
        "query": "television studio control room",
    },
    {
        "slug": "mission_05",
        "photo_id": "vN2TM-qNOo0",
        "query": "tehran skyline dusk",
    },
]

TARGET_SIZE = (800, 360)
PIXELATE_SIZE = (400, 180)
PALETTE_COLORS = 28


def api_get(url: str, access_key: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Client-ID {access_key}",
            "Accept-Version": "v1",
        },
    )
    with urllib.request.urlopen(request) as response:
        return json.load(response)


def download_bytes(url: str, access_key: str | None = None) -> bytes:
    headers = {}
    if access_key:
        headers["Authorization"] = f"Client-ID {access_key}"
        headers["Accept-Version"] = "v1"
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request) as response:
        return response.read()


def build_image(photo: dict) -> Image.Image:
    raw_url = photo["urls"]["raw"]
    raw_with_params = (
        f"{raw_url}&{urllib.parse.urlencode({'w': 1600, 'fit': 'max', 'q': 82})}"
    )
    source = Image.open(io.BytesIO(download_bytes(raw_with_params))).convert("RGB")
    fitted = ImageOps.fit(source, TARGET_SIZE, method=Image.Resampling.LANCZOS)

    fitted = ImageEnhance.Contrast(fitted).enhance(1.16)
    fitted = ImageEnhance.Color(fitted).enhance(0.9)
    fitted = ImageEnhance.Sharpness(fitted).enhance(1.2)

    reduced = fitted.resize(PIXELATE_SIZE, Image.Resampling.BILINEAR)
    quantized = reduced.quantize(colors=PALETTE_COLORS, method=Image.Quantize.MEDIANCUT)
    rgb = quantized.convert("RGB")

    final_image = rgb.resize(TARGET_SIZE, Image.Resampling.NEAREST)
    final_image = ImageEnhance.Contrast(final_image).enhance(1.08)
    final_image = ImageEnhance.Brightness(final_image).enhance(0.88)
    return final_image


def main() -> None:
    access_key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if not access_key:
        raise SystemExit("Set UNSPLASH_ACCESS_KEY before running this script.")

    output_dir = Path("assets/backgrounds")
    output_dir.mkdir(parents=True, exist_ok=True)

    manifest = []
    for spec in MISSION_SPECS:
        photo = api_get(
            f"https://api.unsplash.com/photos/{spec['photo_id']}",
            access_key,
        )
        download_bytes(photo["links"]["download_location"], access_key=access_key)

        final_image = build_image(photo)
        destination = output_dir / f"{spec['slug']}.png"
        final_image.save(destination, format="PNG")

        manifest.append(
            {
                "slug": spec["slug"],
                "query": spec["query"],
                "photo_id": spec["photo_id"],
                "author": photo["user"]["name"],
                "description": photo.get("description")
                or photo.get("alt_description")
                or spec["query"],
                "html_link": photo["links"]["html"],
                "output": str(destination).replace("\\", "/"),
            }
        )

    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
