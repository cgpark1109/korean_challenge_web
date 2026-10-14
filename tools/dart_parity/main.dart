// Run via tools/dart_parity/run.py: dumps what the app's Dart code computes
// (syllables, stages, word order, example words, stroke guides) as JSON.
import 'dart:convert';
import 'dart:io';
import 'hangul_repository.dart';
import 'stroke_data.dart';

void main(List<String> args) {
  final repo = HangulRepository.fromJsonString(File(args[0]).readAsStringSync());
  String r(double v) => v.toStringAsFixed(4);
  final out = <String, dynamic>{
    'syllables': [for (final s in repo.syllables) [s.id, s.char, s.roman, s.sound]],
    'stages': [for (final s in repo.stages) {'id': s.id, 'title': s.title, 'subtitle': s.subtitle, 'items': [for (final i in s.items) i.id]}],
    'wordsSorted': [for (final w in repo.wordsSorted) w.id],
    'examples': {
      for (final i in [...repo.consonants, ...repo.vowels, ...repo.compoundVowels, ...repo.syllables])
        i.id: [for (final w in repo.exampleWords(i)) w.id]
    },
    'speak': {for (final i in [...repo.consonants, ...repo.vowels, ...repo.compoundVowels]) i.char: [repo.speakText(i), repo.jamoName(i)]},
    'strokes': {
      for (final c in [...repo.consonants, ...repo.vowels, ...repo.compoundVowels, ...repo.syllables, ...repo.words])
        if (StrokeData.forChar(c.char) case final s?) c.char: [for (final st in s) [for (final p in st) [r(p.dx), r(p.dy)]]]
    },
  };
  stdout.write(jsonEncode(out));
}
