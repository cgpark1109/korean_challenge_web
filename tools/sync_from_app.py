#!/usr/bin/env python3
"""Sync the web version's data and icons from the Flutter app.

Usage:
    python tools/sync_from_app.py <path-to-korean_challenge-app> [--no-icons]

Reads (never writes) the app checkout:
    assets/data/hangul.json        letters, letter names, TTS text, 2,400 words
    lib/logic/stroke_data.dart     stroke-order guides for the 40 jamo
    pubspec.yaml                   app version (shown in Settings)
    assets/branding/icon.png       app icon        (favicon / touch icons)
    store/feature_graphic.png      Play feature graphic (Open Graph image)

Writes, inside this repo:
    data/core.json     everything the first screen needs (~20 KB)
    data/words.json    the word list, loaded lazily (~200 KB, ~45 KB gzipped)
    img/*.png, favicon.ico

The script is deterministic: running it twice on the same app version
produces byte-identical files, so `git diff` shows only real content changes.
Icons need Pillow (`pip install pillow`); pass --no-icons to skip them.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
import textwrap
from pathlib import Path

WEB_ROOT = Path(__file__).resolve().parents[1]

LETTER_KEYS = ("consonants", "vowels", "compoundVowels")
LETTER_FIELDS = ("id", "char", "roman", "sound")
WORD_FIELDS = ("id", "char", "roman", "meaning")
EXPECTED_COUNTS = {
    "consonants": 19,
    "vowels": 10,
    "compoundVowels": 11,
    "jamoSpeak": 40,
    "jamoName": 19,
}


def fail(message: str) -> None:
    sys.exit(f"sync_from_app: {message}")


# ── hangul.json ──────────────────────────────────────────────


def load_hangul(app: Path) -> dict:
    path = app / "assets" / "data" / "hangul.json"
    if not path.is_file():
        fail(f"not found: {path}")
    data = json.loads(path.read_text(encoding="utf-8"))

    for key, count in EXPECTED_COUNTS.items():
        actual = len(data.get(key) or [])
        if actual != count:
            # Not fatal: the app may grow. The web reads counts from the data.
            print(f"  note: {key} has {actual} entries (web was built for {count})")

    def clean(items, fields, key):
        out = []
        for i, item in enumerate(items):
            missing = [f for f in fields if not str(item.get(f, "")).strip()]
            if missing:
                fail(f"{key}[{i}] is missing {missing}: {item}")
            out.append({f: item[f] for f in fields})
        return out

    letters = {k: clean(data[k], LETTER_FIELDS, k) for k in LETTER_KEYS}
    words = clean(data["words"], WORD_FIELDS, "words")
    ids = [w["id"] for w in words]
    if len(set(ids)) != len(ids):
        fail("duplicate word ids in hangul.json")
    return {
        "letters": letters,
        "jamoSpeak": dict(data["jamoSpeak"]),
        "jamoName": dict(data.get("jamoName") or {}),
        "words": words,
    }


# ── stroke_data.dart ─────────────────────────────────────────


def _s(raw):
    return [[[float(x), float(y)] for x, y in stroke] for stroke in raw]


def _circle(cx, cy, r, segments=36):
    """Same as StrokeData._circle: counter-clockwise from the top."""
    return [
        [cx - r * math.sin(2 * math.pi * i / segments),
         cy - r * math.cos(2 * math.pi * i / segments)]
        for i in range(segments + 1)
    ]


def _fit(strokes, left, top, width, height):
    return [[[left + x * width, top + y * height] for x, y in s] for s in strokes]


def _double(single):
    return _fit(single, 0, 0.05, 0.52, 0.9) + _fit(single, 0.48, 0.05, 0.52, 0.9)


def load_strokes(app: Path) -> dict:
    """Evaluates the `_jamo` table of stroke_data.dart.

    The table is plain data built from a few helpers (_s, _circle, _double)
    plus spreads, so after a handful of mechanical rewrites it is a valid
    Python function body. Anything unexpected fails loudly instead of
    producing wrong strokes.
    """
    path = app / "lib" / "logic" / "stroke_data.dart"
    src = path.read_text(encoding="utf-8")
    m = re.search(
        r"_jamo = \(\) \{\n(?P<body>.*?)\n  \}\(\);", src, flags=re.S
    )
    if not m:
        fail(f"could not find the _jamo table in {path}")
    body = m.group("body")
    body = re.sub(r"^\s*//.*$", "", body, flags=re.M)  # line comments
    body = re.sub(r"\bfinal (\w+) =", r"\1 =", body)
    body = body.replace("return <String, List<Stroke>>{", "return {")
    body = body.replace("...", "*")  # Dart spread -> Python unpacking
    body = re.sub(r";\s*$", "", body, flags=re.M)
    if re.search(r"[^\x00-\x7fㄱ-ㆎ]", body):
        fail("unexpected characters in the _jamo table; update the parser")
    code = "def _build():\n" + textwrap.indent(textwrap.dedent(body), "    ")
    scope = {"_s": _s, "_circle": _circle, "_double": _double}
    try:
        exec(compile(code, str(path), "exec"), scope)  # noqa: S102 - own source
        table = scope["_build"]()
    except Exception as e:  # pragma: no cover - only on format changes
        fail(f"could not evaluate the _jamo table ({e}); update the parser")

    def r(v):
        return round(v, 4)

    out = {}
    for char, strokes in table.items():
        out[char] = [[[r(x), r(y)] for x, y in stroke] for stroke in strokes]
        for stroke in out[char]:
            if len(stroke) < 2 or any(not (0 <= v <= 1) for p in stroke for v in p):
                fail(f"bad stroke for {char}: {stroke}")

    # Layout constants of StrokeData.forChar, checked so a change in the app
    # is noticed (the web port lives in js/strokes.js).
    for needle in (
        "Rect.fromLTWH(0.04, 0.18, 0.46, 0.64)",
        "Rect.fromLTWH(0.36, 0, 0.64, 1)",
        "Rect.fromLTWH(0.2, 0.02, 0.6, 0.5)",
        "Rect.fromLTWH(0, 0.32, 1, 0.68)",
        "Rect.fromLTWH(0.06, 0.04, 0.48, 0.34)",
    ):
        if needle not in src:
            fail(f"syllable layout changed in stroke_data.dart ({needle} not "
                 "found); update js/strokes.js and this check")
    return out


def app_version(app: Path) -> str:
    m = re.search(r"^version:\s*([0-9.]+)", (app / "pubspec.yaml").read_text(
        encoding="utf-8"), flags=re.M)
    return m.group(1) if m else "unknown"


# ── icons ────────────────────────────────────────────────────


def build_icons(app: Path) -> None:
    try:
        from PIL import Image
    except ImportError:
        print("  Pillow not installed; skipping icons (pip install pillow)")
        return
    icon = app / "assets" / "branding" / "icon.png"
    if not icon.is_file():
        print(f"  {icon} not found; skipping icons")
        return
    img_dir = WEB_ROOT / "img"
    img_dir.mkdir(exist_ok=True)
    src = Image.open(icon).convert("RGB")

    def save(size, name):
        out = src.resize((size, size), Image.LANCZOS)
        out.save(img_dir / name, optimize=True)

    save(512, "icon-512.png")
    save(192, "icon-192.png")
    save(180, "apple-touch-icon.png")
    save(32, "favicon-32.png")
    src.resize((48, 48), Image.LANCZOS).save(
        WEB_ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    feature = app / "store" / "feature_graphic.png"
    if feature.is_file():
        Image.open(feature).convert("RGB").save(
            img_dir / "og-image.png", optimize=True)


# ── main ─────────────────────────────────────────────────────


def write_json(path: Path, data) -> int:
    path.parent.mkdir(exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    path.write_text(text + "\n", encoding="utf-8", newline="\n")
    return path.stat().st_size


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("app", type=Path, help="path to the Flutter app repo")
    parser.add_argument("--no-icons", action="store_true")
    args = parser.parse_args()
    app = args.app.resolve()

    hangul = load_hangul(app)
    strokes = load_strokes(app)
    version = app_version(app)

    jamo = {i["char"] for k in LETTER_KEYS for i in hangul["letters"][k]}
    if missing := sorted(jamo - strokes.keys()):
        fail(f"no stroke guide for {missing}")

    core = {
        "appVersion": version,
        **hangul["letters"],
        "jamoSpeak": hangul["jamoSpeak"],
        "jamoName": hangul["jamoName"],
        "wordCount": len(hangul["words"]),
        "strokes": strokes,
    }
    size_core = write_json(WEB_ROOT / "data" / "core.json", core)
    size_words = write_json(
        WEB_ROOT / "data" / "words.json", {"words": hangul["words"]})

    if not args.no_icons:
        build_icons(app)

    letters = {k: len(v) for k, v in hangul["letters"].items()}
    print(f"Synced from app {version}: {letters}, "
          f"{len(hangul['jamoSpeak'])} speak / {len(hangul['jamoName'])} names, "
          f"{len(hangul['words'])} words, {len(strokes)} stroke guides")
    print(f"  data/core.json  {size_core:,} bytes")
    print(f"  data/words.json {size_words:,} bytes")


if __name__ == "__main__":
    main()
