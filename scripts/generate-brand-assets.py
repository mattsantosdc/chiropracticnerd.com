"""Generate site assets from the approved V2 SVG masters.

Run with Python 3 + Pillow and Inkscape installed. No font files or remote
conversion service are needed: the wordmark is already outlined.
"""
from copy import deepcopy
from pathlib import Path
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
BRAND = PUBLIC / "brand/v2"
SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)


def derive_horizontal_logo():
    source = ET.parse(BRAND / "chiropractic-nerd-logo.svg").getroot()
    by_id = {element.get("id"): element for element in source.iter()}
    # Reuse the exact master paths and colors; change only their arrangement.
    logo = ET.Element(f"{{{SVG_NS}}}svg", {
        "viewBox": "0 0 590 120",
        "role": "img",
        "aria-labelledby": "cn-v2-horizontal-title cn-v2-horizontal-desc",
    })
    ET.SubElement(logo, f"{{{SVG_NS}}}title", {"id": "cn-v2-horizontal-title"}).text = "Chiropractic Nerd"
    ET.SubElement(logo, f"{{{SVG_NS}}}desc", {"id": "cn-v2-horizontal-desc"}).text = "Variation 2 brain-question-mark beside the outlined Chiropractic Nerd wordmark."
    logo.append(deepcopy(source.find(f"{{{SVG_NS}}}defs")))
    icon = ET.SubElement(logo, f"{{{SVG_NS}}}g", {"transform": "translate(0 3) scale(.44)"})
    icon.append(deepcopy(by_id["cn-v2-logo-brain-question-mark"]))
    word = ET.SubElement(logo, f"{{{SVG_NS}}}g", {"transform": "translate(110 31) scale(1.08)"})
    word.append(deepcopy(by_id["cn-v2-logo-wordmark"]))
    # Distinct IDs also allow the horizontal and stacked logos to be inlined.
    content = ET.tostring(logo, encoding="unicode").replace("cn-v2-logo-", "cn-v2-horizontal-")
    (BRAND / "chiropractic-nerd-logo-horizontal.svg").write_text(content + "\n", encoding="utf-8")


def render_svg(source, destination, size):
    subprocess.run([
        "inkscape", str(source), f"--export-filename={destination}",
        f"--export-width={size}", f"--export-height={size}",
    ], check=True, capture_output=True)


def main():
    if shutil.which("inkscape") is None:
        raise SystemExit("Install Inkscape and make its command available before generating assets.")
    derive_horizontal_logo()
    shutil.copyfile(BRAND / "favicon.svg", PUBLIC / "favicon.svg")
    with tempfile.TemporaryDirectory(prefix="chiropractic-nerd-icons-") as directory:
        temporary = Path(directory)
        for size in (16, 32):
            render_svg(PUBLIC / "favicon.svg", PUBLIC / f"favicon-{size}x{size}.png", size)
        # Touch/app icons use a fully opaque square. The OS applies its own mask.
        for size, filename in ((180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
            rendered = temporary / filename
            render_svg(PUBLIC / "favicon.svg", rendered, size)
            with Image.open(rendered).convert("RGBA") as icon:
                square = Image.new("RGBA", icon.size, "#F6F7F4")
                square.alpha_composite(icon)
                square.convert("RGB").save(PUBLIC / filename, optimize=True)
        # Three embedded resolutions, including the 16px browser-tab fallback.
        with Image.open(PUBLIC / "icon-512.png") as icon:
            icon.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("Generated horizontal logo, favicon SVG/ICO, 16/32px PNGs, and 180/192/512px icons.")


if __name__ == "__main__":
    main()
