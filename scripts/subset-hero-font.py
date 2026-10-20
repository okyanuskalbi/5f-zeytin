"""Subset the existing approved face; run with Python + fonttools[woff]."""

from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = root / "app/fonts/Fraunces-normal.woff2"
output = root / "app/fonts/Fraunces-hero.woff2"
font = TTFont(source)
axes = [(axis.axisTag, axis.minValue, axis.maxValue) for axis in font["fvar"].axes]
options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.name_legacy = True
options.name_languages = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(text="Kökü toprakta. Yeri sofrada.")
subsetter.subset(font)
font.flavor = "woff2"
font.save(output)
derived = TTFont(output)
assert axes == [(axis.axisTag, axis.minValue, axis.maxValue) for axis in derived["fvar"].axes]
assert all(ord(char) in derived.getBestCmap() for char in "Kökü toprakta. Yeri sofrada.")
assert output.stat().st_size < 20 * 1024
print(f"{output.relative_to(root)}: {output.stat().st_size} bytes; axes {axes}")
