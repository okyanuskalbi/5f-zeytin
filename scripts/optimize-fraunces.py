"""Rebuild the self-hosted Fraunces faces. Requires fonttools[woff].
SOFT=50 and WONK=1 are baked in; opsz remains variable (9..144).
The normal face only needs weight 600. Italic 400 remains available on demand.
Upstream SIL Open Font License is retained in app/fonts/OFL.txt.
"""
from hashlib import sha256
from pathlib import Path
import subprocess
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SOURCES = [{'style': 'normal', 'weight': 600, 'source': 'https://raw.githubusercontent.com/google/fonts/4024282d9b0cffcdb8e3024560862746178d741f/ofl/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf', 'sha256': '177ff6c0f14e5550a3c624247cd1189611d4eb65d000b14944c63d967958abbb'}, {'style': 'italic', 'weight': 400, 'source': 'https://raw.githubusercontent.com/google/fonts/4024282d9b0cffcdb8e3024560862746178d741f/ofl/fraunces/Fraunces-Italic%5BSOFT,WONK,opsz,wght%5D.ttf', 'sha256': 'b24448c43702fac4ee856781d461a0dfba8d8e594b6e8e190234b75fed2c0e01'}]

def main():
    cache = ROOT / ".cache/font-source"
    cache.mkdir(parents=True, exist_ok=True)
    for face in SOURCES:
        source = cache / (face["style"] + ".ttf")
        subprocess.run(["curl", "-fsSL", face["source"], "-o", str(source)], check=True)
        if sha256(source.read_bytes()).hexdigest() != face["sha256"]:
            raise ValueError("Upstream font hash mismatch")
        font = instantiateVariableFont(TTFont(source), {"wght": face["weight"], "SOFT": 50, "WONK": 1}, inplace=True)
        font.flavor = "woff2"
        font.save(ROOT / "app/fonts" / ("Fraunces-" + face["style"] + ".woff2"))

if __name__ == "__main__":
    main()
