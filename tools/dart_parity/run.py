#!/usr/bin/env python3
"""Dump what the app's own Dart code computes, for tools/test_logic.mjs.

Usage:
    python tools/dart_parity/run.py <path-to-flutter-app> [out.json]
    node tools/test_logic.mjs --app <path-to-flutter-app> --dart-dump out.json

Copies the app's pure-Dart data/logic files (hangul_repository, hangul_compose,
hangul_item, stage, stroke_data) into a temp folder next to a tiny shim for
`dart:ui` / `rootBundle`, then runs them with the Dart SDK (`dart` on PATH,
e.g. from Flutter). Nothing in the app checkout is modified.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
FILES = ["data/hangul_compose.dart", "data/hangul_item.dart", "data/stage.dart",
         "data/hangul_repository.dart", "logic/stroke_data.dart"]


def main():
    app = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2] if len(sys.argv) > 2 else "dart_dump.json").resolve()
    # Short path: Windows' dart.bat fails in deeply nested folders.
    work = Path(tempfile.mkdtemp(prefix="lkh_dart_"))
    try:
        for f in FILES:
            src = (app / "lib" / f).read_text(encoding="utf-8")
            src = re.sub(r"package:learn_korean_hangul/(data|logic)/", "", src)
            src = src.replace("package:flutter/services.dart", "shim.dart")
            src = src.replace("'dart:ui'", "'shim.dart'")
            (work / Path(f).name).write_text(src, encoding="utf-8")
        shutil.copy(HERE / "shim.dart", work)
        shutil.copy(HERE / "main.dart", work)
        (work / "pubspec.yaml").write_text(
            "name: dart_parity\nenvironment:\n  sdk: '>=3.0.0 <4.0.0'\n", encoding="utf-8")
        dart = shutil.which("dart") or "dart"
        with out.open("wb") as fh:
            subprocess.run([dart, "run", "main.dart", str(app / "assets/data/hangul.json")],
                           cwd=work, stdout=fh, check=True, shell=os.name == "nt")
        print(f"wrote {out}")
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
