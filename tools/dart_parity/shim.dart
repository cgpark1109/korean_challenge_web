// Minimal stand-ins for dart:ui (Offset, Rect) and rootBundle, so the app's
// pure-Dart data files run on the plain Dart VM (see run.py).
class Offset {
  const Offset(this.dx, this.dy);
  final double dx, dy;
  Offset operator *(double s) => Offset(dx * s, dy * s);
  Offset operator +(Offset o) => Offset(dx + o.dx, dy + o.dy);
}
class Rect {
  const Rect.fromLTWH(this.left, this.top, this.width, this.height);
  final double left, top, width, height;
}
class _Bundle { Future<String> loadString(String p) async => throw UnimplementedError(); }
final rootBundle = _Bundle();
