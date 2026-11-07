# Task182-1: approved tin cutout masks

These 1122×1402 grayscale alpha masks were extracted locally from the two
approved Task182 PNGs, using installed OpenCV GrabCut (8 iterations, initial
rectangle x=.08w, y=.08h, width=.84w, height=.84h), the largest external
contour with enclosed holes filled, and Pillow GaussianBlur(radius=.55).
Both silhouettes were visually reviewed against a contrasting background.
No generated image, external service or new source photography was used.

`prepare-v3-assets.mjs` retains the original approved source SHA and RGB,
applies only the reviewed alpha, and composites a soft olive ground shadow.
Canvas size and all existing output dimensions remain unchanged. The other
four products and cinematic layers are unchanged. Source photographs stay
read-only in AFINA-KAYNAK. `node --test scripts/teneke-cutout.test.mjs` checks
all 36 derivatives for transparent corners, an opaque label and soft alpha.
