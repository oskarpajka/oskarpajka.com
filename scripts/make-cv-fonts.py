# Makes the static Archivo cuts the CV uses, from the variable woff2 files in public/fonts/.
# Chromium embeds variable fonts in a PDF as Type3 glyphs; static cuts embed as real fonts.
# Run once after changing a weight or width in src/pages/cv.astro:
#   pip install fonttools brotli
#   python scripts/make-cv-fonts.py
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parent.parent
src = root / "public" / "fonts"
out = src / "cv"
out.mkdir(exist_ok=True)

cuts = [(100, 400), (100, 600), (125, 600), (125, 700)]  # (width %, weight)
for subset in ("latin", "latin-ext"):
    for width, weight in cuts:
        font = TTFont(src / f"archivo-{subset}-wdth-normal.woff2")
        instantiateVariableFont(font, {"wdth": width, "wght": weight}, inplace=True, updateFontNames=False)
        font.flavor = "woff2"
        name = out / f"archivo-{subset}-{width}-{weight}.woff2"
        font.save(name)
        print(name.relative_to(root))
