"""Give the certification badges the transparency three of them were missing.

Two of the five were exported as white marks with alpha as coverage on nothing. The other three
were flattened onto an opaque near-black background first, so the footer's `invert` turned that
background into a light grey box behind the badge while its neighbours had none.

Flattening is reversible here because we know both ends of it. A pixel was composited as

    out = 255 * a + bg * (1 - a)

with white marks over a single background colour, so

    a = (out - bg) / (255 - bg)

which recovers the coverage the exporter threw away. The result is the same shape as the two
that were already right: white, with alpha doing the work.

    python scripts/unflatten_certs.py          # report
    python scripts/unflatten_certs.py --write  # rewrite the files in place
"""

import argparse
import collections
import pathlib
import sys

from PIL import Image

CERTS = pathlib.Path(__file__).resolve().parent.parent / "public" / "certs"


def background_of(im: Image.Image) -> tuple[int, int, int] | None:
    """The colour a badge was flattened onto, or None if it was not flattened.

    The most common pixel: a badge is mostly background. Transparent already means nothing to
    undo, and a file that is already right must not be touched twice — the second pass would
    read its white marks as the background and erase the badge.
    """
    counts = collections.Counter(im.getdata())
    (r, g, b, a), _ = counts.most_common(1)[0]
    if a == 0:
        return None
    return (r, g, b)


def unflatten(im: Image.Image, bg: tuple[int, int, int]) -> Image.Image:
    base = sum(bg) / 3
    span = 255 - base
    if span <= 1:
        raise SystemExit("The background is white; coverage cannot be recovered from it.")
    out = Image.new("RGBA", im.size)
    pixels = []
    for r, g, b, _a in im.getdata():
        lum = (r + g + b) / 3
        alpha = round(max(0.0, min(1.0, (lum - base) / span)) * 255)
        pixels.append((255, 255, 255, alpha))
    out.putdata(pixels)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--write", action="store_true", help="rewrite the files (otherwise report only)")
    args = ap.parse_args()

    for path in sorted(CERTS.glob("*.png")):
        im = Image.open(path).convert("RGBA")
        bg = background_of(im)
        if bg is None:
            print(f"{path.name:16} already transparent — left alone")
            continue
        print(f"{path.name:16} flattened onto rgb{bg}" + ("" if args.write else "  [report only]"))
        if not args.write:
            continue
        fixed = unflatten(im, bg)
        # Keep the original, but not under public/: everything there is served, and a file
        # called iso27001.flattened.png sitting beside the real badge is one somebody will
        # eventually link to by mistake. These are certification marks and a bad conversion
        # must be undoable without going back to whoever supplied them.
        originals = pathlib.Path(__file__).resolve().parent / "cert-originals"
        originals.mkdir(exist_ok=True)
        backup = originals / f"{path.stem}.flattened.png"
        if not backup.exists():
            path.replace(backup)
        fixed.save(path, "PNG", optimize=True)
        print(f"{'':16} written; original kept as {backup.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
