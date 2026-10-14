// Logic + data checks for the web version (no browser needed).
//
//   node tools/test_logic.mjs [--app <path-to-flutter-app>] [--dart-dump <file>]
//
// Always: ports of the app's unit tests (test/data_test.dart,
// quiz_engine_test.dart, stroke_data_test.dart) run against data/*.json.
// --app:       data/*.json must match the app's assets/data/hangul.json exactly.
// --dart-dump: compare stages, syllables, word order, example words and stroke
//              guides with a JSON dump produced by the app's own Dart code
//              (see README "Verifying parity with the app").

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Repository } from '../js/data.js';
import { compose, decompose } from '../js/hangul.js';
import { strokesFor } from '../js/strokes.js';
import * as Quiz from '../js/quiz-engine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

let failures = 0;
let passes = 0;
function check(name, cond, detail = '') {
  if (cond) {
    passes++;
  } else {
    failures++;
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const core = readJson(path.join(root, 'data/core.json'));
const { words } = readJson(path.join(root, 'data/words.json'));
const repo = new Repository(core);
repo.setWords(words);

// ── data_test.dart ──────────────────────────────────────────
check('14 basic consonants', repo.basicConsonants.length === 14);
check('5 double consonants', repo.doubleConsonants.length === 5);
check('10 vowels', repo.vowels.length === 10);
check('11 compound vowels', repo.compoundVowels.length === 11);
check('399 syllables', repo.syllables.length === 399);
check('2400 words', repo.words.length === 2400 && core.wordCount === 2400);
check('40 jamoSpeak', Object.keys(core.jamoSpeak).length === 40);
check('19 jamoName', Object.keys(core.jamoName).length === 19);
check('40 stroke guides', Object.keys(core.strokes).length === 40);

check('compose 가', compose('ㄱ', 'ㅏ') === '가');
check('compose 희', compose('ㅎ', 'ㅢ') === '희');
const hak = decompose('학');
check('decompose 학', hak.cho === 'ㅎ' && hak.jung === 'ㅏ' && hak.jong > 0);
check('decompose A', decompose('A') === null);

check('first group ㄱ', repo.syllableGroups[0].consonant.char === 'ㄱ');
check('second group ㄲ', repo.syllableGroups[1].consonant.char === 'ㄲ');
const ga = repo.syllables[0];
check('가 = ga, ㄱ + ㅏ', ga.char === '가' && ga.roman === 'ga' && ga.sound === 'ㄱ + ㅏ');
check('아 = a', repo.syllables.find((s) => s.char === '아').roman === 'a');

check('speak 기역', repo.speakText(repo.basicConsonants[0]) === '기역');
check('speak 아', repo.speakText(repo.vowels[0]) === '아');
check('speak word as written', repo.speakText(repo.words[0]) === repo.words[0].char);
const consonant = (c) => repo.consonants.find((i) => i.char === c);
check('name 지읒', repo.jamoName(consonant('ㅈ')) === '지읒');
check('speak 지읃', repo.speakText(consonant('ㅈ')) === '지읃');
check('name 티읕', repo.jamoName(consonant('ㅌ')) === '티읕');
check('speak 티읃', repo.speakText(consonant('ㅌ')) === '티읃');
check('speak 미음', repo.speakText(consonant('ㅁ')) === '미음');
const cv = Object.fromEntries(repo.compoundVowels.map((v) => [v.char, v]));
check('speak 얘/와/왜', repo.speakText(cv['ㅒ']) === '얘' && repo.speakText(cv['ㅘ']) === '와'
  && repo.speakText(cv['ㅙ']) === '왜');

check('stage ids 1-8', eq(repo.stages.map((s) => s.id), [1, 2, 3, 4, 5, 6, 7, 8]));
for (const stage of repo.stages) {
  const items = repo.stageItems(stage);
  check(`${stage.title}: >= 4 distinct chars`, new Set(items.map((i) => i.char)).size >= 4);
  check(`${stage.title}: >= 4 distinct romans`, new Set(items.map((i) => i.roman)).size >= 4);
}
const sizes = repo.stages.map((s) => repo.stageItems(s).length);
check('stage sizes', eq(sizes, [7, 12, 10, 10, 8, 2392, 140, 404]), JSON.stringify(sizes));

const gExamples = repo.exampleWords(repo.basicConsonants[0]);
check('examples for ㄱ exist', gExamples.length > 0);
for (const w of gExamples) {
  check(`example ${w.char} contains ㄱ`, w.char.split('').some((s) => decompose(s)?.cho === 'ㄱ'));
}
check('no examples for a word', repo.exampleWords(repo.words[0]).length === 0);
check('examples for 가 are words', repo.exampleWords(repo.syllables[0])[0]?.kind === 'word');

// ── quiz_engine_test.dart ───────────────────────────────────
let seed = 42;
const rng = () => {
  // mulberry32
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
let optionProblems = 0;
for (const stage of repo.stages) {
  const pool = repo.stageItems(stage);
  for (let round = 0; round < 30; round++) {
    const qs = Quiz.buildQuiz(pool, { rng });
    if (qs.length !== 10) optionProblems++;
    for (const q of qs) {
      const labels = q.options.map((o) => Quiz.labelOf(q, o));
      if (new Set(labels).size !== Quiz.OPTION_COUNT) optionProblems++;
      if (q.options.filter((o) => Quiz.isCorrect(q, o)).length !== 1) optionProblems++;
    }
  }
}
check('every question has 4 distinct options incl. the answer', optionProblems === 0, `${optionProblems} problems`);
const letterQs = Array.from({ length: 20 }, () => Quiz.buildQuiz(repo.stageItems(repo.stageById(1)))).flat();
check('no meaning questions for letters', letterQs.every((q) => q.type !== Quiz.QuestionType.meaningToChar));
const wordQs = Array.from({ length: 20 }, () => Quiz.buildQuiz(repo.stageItems(repo.stageById(5)))).flat();
check('meaning questions appear for words', wordQs.some((q) => q.type === Quiz.QuestionType.meaningToChar));
check('stars 0..10', eq(Array.from({ length: 11 }, (_, c) => Quiz.starsFor(c)), [0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 3]));
check('streak points', Quiz.pointsFor(1) === 100 && Quiz.pointsFor(2) === 120 && Quiz.pointsFor(5) === 150);

// ── stroke_data_test.dart ───────────────────────────────────
for (const item of [...repo.consonants, ...repo.vowels, ...repo.compoundVowels, ...repo.syllables]) {
  const s = strokesFor(core.strokes, item.char);
  const ok = s && s.length > 0 && s.every((st) => st.length >= 2
    && st.every(([x, y]) => x >= 0 && x <= 1 && y >= 0 && y <= 1));
  check(`stroke guide ${item.char}`, ok);
}
const count = (c) => strokesFor(core.strokes, c)?.length;
check('stroke counts', eq(['ㄱ', 'ㄹ', 'ㅂ', 'ㅌ', 'ㅎ', 'ㅃ', 'ㅙ', '가', '희'].map(count), [1, 3, 4, 3, 3, 8, 5, 3, 5]));
check('no guide for 엄마 / 밥', strokesFor(core.strokes, '엄마') === null && strokesFor(core.strokes, '밥') === null);

// ── --app: data/*.json == app asset ─────────────────────────
const app = argValue('--app');
if (app) {
  const src = readJson(path.join(app, 'assets/data/hangul.json'));
  for (const key of ['consonants', 'vowels', 'compoundVowels']) {
    check(`${key} identical to app`, eq(core[key], src[key].map(({ id, char, roman, sound }) => ({ id, char, roman, sound }))));
  }
  check('jamoSpeak identical to app', eq(core.jamoSpeak, src.jamoSpeak));
  check('jamoName identical to app', eq(core.jamoName, src.jamoName));
  check('words identical to app (order + fields)',
    eq(words, src.words.map(({ id, char, roman, meaning }) => ({ id, char, roman, meaning }))));
  const empty = [...words, ...core.consonants, ...core.vowels, ...core.compoundVowels]
    .filter((i) => Object.values(i).some((v) => typeof v !== 'string' || v.trim() === ''));
  check('no empty fields', empty.length === 0, JSON.stringify(empty.slice(0, 3)));
  const counts = Object.fromEntries(['consonants', 'vowels', 'compoundVowels', 'jamoSpeak', 'jamoName', 'words']
    .map((k) => [k, Array.isArray(src[k]) ? src[k].length : Object.keys(src[k]).length]));
  console.log('app counts:', JSON.stringify(counts));
}

// ── --dart-dump: computed content == app's Dart code ────────
const dumpPath = argValue('--dart-dump');
if (dumpPath) {
  const dart = readJson(dumpPath);
  check('syllables == Dart', eq(repo.syllables.map((s) => [s.id, s.char, s.roman, s.sound]), dart.syllables));
  check('stages == Dart', eq(repo.stages.map((s) => ({ id: s.id, title: s.title, subtitle: s.subtitle,
    items: repo.stageItems(s).map((i) => i.id) })), dart.stages));
  check('wordsSorted == Dart', eq(repo.wordsSorted.map((w) => w.id), dart.wordsSorted));
  let exampleDiffs = 0;
  for (const item of [...repo.consonants, ...repo.vowels, ...repo.compoundVowels, ...repo.syllables]) {
    const ours = repo.exampleWords(item).map((w) => w.id);
    if (!eq(ours, dart.examples[item.id])) {
      exampleDiffs++;
      if (exampleDiffs <= 3) console.error(`  examples ${item.char}: web ${ours} / app ${dart.examples[item.id]}`);
    }
  }
  check('example words == Dart (all 439 letters/syllables)', exampleDiffs === 0, `${exampleDiffs} differ`);
  check('speak/name == Dart', eq(Object.fromEntries([...repo.consonants, ...repo.vowels, ...repo.compoundVowels]
    .map((i) => [i.char, [repo.speakText(i), repo.jamoName(i)]])), dart.speak));
  let strokeDiffs = 0;
  let wordQuirks = 0;
  // core.json keeps 4 decimals, so circles scaled into a syllable can differ
  // from the app in the 4th decimal (< 0.1 px on a 360 px pad).
  const close = (a, b) => a && a.length === b.length && a.every((s, i) => s.length === b[i].length
    && s.every(([x, y], j) => Math.abs(x - b[i][j][0]) < 2e-4 && Math.abs(y - b[i][j][1]) < 2e-4));
  for (const [char, dartStrokes] of Object.entries(dart.strokes)) {
    const ours = strokesFor(core.strokes, char);
    if (char.length > 1) {
      // The app returns the first syllable's guide for multi-syllable words
      // that start with an open syllable (e.g. 아빠); the web shows none.
      wordQuirks++;
      continue;
    }
    if (!close(ours, dartStrokes.map((s) => s.map(([x, y]) => [Number(x), Number(y)])))) {
      strokeDiffs++;
      if (strokeDiffs <= 3) console.error(`  strokes ${char} differ`);
    }
  }
  check('stroke guides == Dart (letters + syllables)', strokeDiffs === 0, `${strokeDiffs} differ`);
  console.log(`note: app shows a stroke guide for ${wordQuirks} multi-syllable words (first syllable only); web shows none`);
}

console.log(`${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
