# Learn Korean - Hangul (web)

The web version of **Learn Korean - Hangul** by GGOOK's Studio, published at
<https://cgpark1109.github.io/korean_challenge_web/>.

It mirrors the Android app 2.0 (`com.kysystemstudio.learnkorean`): the same
letters, names, romanization, 399 syllables, 2,400 basic words, 8 quiz stages
with stars and unlocks, stroke-order practice, speech speed and dark mode.

- Android app: [Google Play](https://play.google.com/store/apps/details?id=com.kysystemstudio.learnkorean&referrer=utm_source%3Dkysystemstudio%26utm_medium%3Dwebapp%26utm_campaign%3Dweb_version)
- Studio page: <https://kysystemstudio.com/games/learn-korean-hangul/>
- Privacy Policy: <https://kysystemstudio.com/privacy.html>

## Important: `notice.json` is used by the Android app

The released app fetches
`https://cgpark1109.github.io/korean_challenge_web/notice.json` at startup
(`AppConfig.noticeUrl`) to show a popup and a banner. Keep the file at the repo
root and keep its field names (`popup.active/title/message/button/version`,
`banner.active/message/link`). Editing it changes what **app users** see. The
web site reads the same file with the same rules (popup once per `version`,
banner `link` = a tab name such as `words`, optional `.html`).

`_redirects` is a Cloudflare Pages rule (GitHub Pages ignores it); it is kept
in case the site is also deployed there.

## Structure

Plain static files: no build step, no frameworks, no CDN scripts. All paths
are relative, so the folder works under any sub-path.

```
index.html                 the whole app (hash routes: #/learn, #/quiz/3, #/words …)
css/app.css                styles (hanji palette, light + dark)
js/main.js                 boot: data, theme, notice.json, router
js/router.js               hash router, back handling, keyboard
js/data.js                 content model (port of hangul_repository.dart)
js/hangul.js               syllable compose/decompose (hangul_compose.dart)
js/dart-sort.js            Dart's List.sort, so example words match the app
js/quiz-engine.js          quiz rules (quiz_engine.dart)
js/strokes.js              stroke-order layout (stroke_data.dart)
js/storage.js              progress + settings in localStorage
js/tts.js                  Web Speech API (ko-KR)
js/ui.js                   icons, dialog, toast helpers
js/views/*.js              one file per screen
data/core.json             letters, names, TTS text, stroke guides (generated)
data/words.json            2,400 words, loaded lazily (generated)
img/, favicon.ico          app icon + Open Graph image (generated)
consonants.html, quiz.html, …   old page URLs → forward into index.html
notice.json, _redirects    see above
tools/                     sync + checks (not loaded by the site)
```

Routes: `#/learn`, `#/learn/consonants|double-consonants|vowels|compound-vowels`,
`#/learn/syllables/<n>`, `#/item/<list>/<i>`, `#/stroke/<char>`, `#/quiz`,
`#/quiz/<stage>`, `#/quiz/<stage>/result`, `#/words`, `#/settings`.

### Old URLs

The previous site had one HTML file per screen. Those files are now tiny
forwarding pages (JavaScript `location.replace` + `<meta refresh>`, relative
URLs, `noindex`) so links and bookmarks keep working:

| Old URL | Goes to |
| --- | --- |
| `consonants.html`, `double-consonants.html`, `vowels.html`, `syllables.html` | the same category |
| `free-study.html?tab=…` | that category (default: compound vowels) |
| `words.html`, `settings.html` | Words / Settings tab |
| `quiz.html?stage=N` | quiz stage N (or the stage map if locked) |
| `result.html` | stage map |
| `stroke.html?char=X` | writing practice for X |

### Saved data (localStorage)

| Key | Value | Notes |
| --- | --- | --- |
| `stage_<1-8>` | `{"stars","score"}` | Same key and format as the app and the old web version, so stars carry over. Best stars and best score are kept independently. |
| `notice_seen_<version>` | `"true"` | Same as the old web version. |
| `lkh_tts_slow` | `"1"`/`"0"` | Migrated once from the old `ttsSpeed` (`slow`/`normal`). |
| `lkh_theme_mode` | `system`/`light`/`dark` | New. |

New keys have an `lkh_` prefix because all `cgpark1109.github.io` projects share
one localStorage.

If the page is opened inside the old 1.x app's WebView
(`window.flutter_inappwebview`), stars are also sent to and merged from the app,
and speech/external links use the app's handlers.

## Run locally

```sh
python -m http.server 8000
# open http://127.0.0.1:8000/
```

(Opening `index.html` from disk does not work: browsers block `fetch()` and
modules on `file://`.)

## Re-sync content after an app update

```sh
python tools/sync_from_app.py ../korean_challenge
node tools/test_logic.mjs --app ../korean_challenge
```

`sync_from_app.py` reads the app checkout (never writes to it) and regenerates
`data/core.json`, `data/words.json` and the icons:

- `assets/data/hangul.json` → letters, `jamoSpeak`, `jamoName`, words
- `lib/logic/stroke_data.dart` → the 40 jamo stroke guides (the Dart table is
  evaluated; the script fails loudly if its format or the syllable layout
  constants change)
- `pubspec.yaml` → version shown in Settings
- `assets/branding/icon.png`, `store/feature_graphic.png` → favicon, touch
  icons, Open Graph image (needs Pillow; `--no-icons` skips them)

The output is deterministic, so `git diff` shows only real changes. If the app
changes screens or rules (stages, scoring, stars, unlocks, example-word
ranking, stroke layout), port that change by hand: the JS files say which Dart
file they mirror.

### Verifying parity with the app

`tools/dart_parity/run.py` runs the app's own Dart data/logic code (copied to a
temp folder with a tiny shim; needs the Dart SDK, e.g. from Flutter) and dumps
syllables, stages, word order, example words and stroke guides. The logic test
compares the web against it:

```sh
python tools/dart_parity/run.py ../korean_challenge dart_dump.json
node tools/test_logic.mjs --app ../korean_challenge --dart-dump dart_dump.json
```

## Checks

```sh
for f in js/*.js js/views/*.js tools/*.mjs; do node --check "$f"; done
node tools/test_logic.mjs --app ../korean_challenge     # data + logic
python -m http.server 8000 &                              # then:
node tools/check_site.mjs http://127.0.0.1:8000/          # no 404s, old URLs included
```

## Accessibility and keyboard

- Quiz: <kbd>1</kbd>–<kbd>4</kbd> answer, <kbd>Enter</kbd>/<kbd>Space</kbd>
  continue (Space replays the sound before answering), <kbd>Esc</kbd> leave.
- Letter pages: <kbd>←</kbd>/<kbd>→</kbd> previous/next; <kbd>Esc</kbd> goes back
  on any sub-screen.
- Visible focus rings, labelled buttons, `lang="ko"` on Korean text, live
  regions for quiz feedback, colours meeting WCAG AA in both themes.
- Stroke practice uses Pointer Events (mouse, touch, pen).

Audio uses the browser's Web Speech API with a Korean (`ko-KR`) voice. If the
device has none, the site says so once (and Settings shows the voice status).
