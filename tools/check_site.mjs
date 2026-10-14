// Link check against a running static server (no dependencies).
//
//   python -m http.server 8000          (in the folder that contains the site)
//   node tools/check_site.mjs http://127.0.0.1:8000/korean_challenge_web/
//
// Fetches every HTML page in the repo root (including the old page URLs),
// every asset they reference (src/href), every JS module reachable through
// static or dynamic imports, every fetch()/URL() path in the JS, and the
// files named in manifest.webmanifest. Exits 1 on any non-200 response.

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:8000/');
if (!base.pathname.endsWith('/')) base.pathname += '/';

const OLD_PAGES = ['index.html', 'consonants.html', 'double-consonants.html', 'vowels.html',
  'syllables.html', 'words.html', 'free-study.html', 'quiz.html', 'result.html', 'stroke.html',
  'settings.html'];

const checked = new Map(); // url -> status
const queue = [];
const enqueue = (url, from) => {
  const u = new URL(url);
  u.hash = '';
  if (u.origin !== base.origin) return; // external links are not checked here
  if (!u.pathname.startsWith(base.pathname)) {
    checked.set(u.href, `outside the site folder (from ${from})`);
    return;
  }
  if (!checked.has(u.href)) {
    checked.set(u.href, null);
    queue.push({ url: u.href, from });
  }
};

const htmlRefs = (text) => [...text.matchAll(/\s(?:src|href)="([^"#][^"]*)"/g)].map((m) => m[1]);
const jsRefs = (text) => [
  ...[...text.matchAll(/(?:import|export)\s[^'"]*?from\s*'([^']+)'/g)].map((m) => m[1]),
  ...[...text.matchAll(/import\(\s*`\.\/views\/\$\{[^}]+\}\.js`\s*\)/g)].flatMap(() =>
    readdirSync(path.join(root, 'js/views')).filter((f) => f.endsWith('.js')).map((f) => `./views/${f}`)),
  ...[...text.matchAll(/import\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]),
  ...[...text.matchAll(/new URL\(`\.\.\/data\/\$\{name\}`/g)].flatMap(() => ['../data/core.json', '../data/words.json']),
  ...[...text.matchAll(/fetch\(`([a-z0-9_./-]+)\?/gi)].map((m) => `__DOC__${m[1]}`),
  ...[...text.matchAll(/src="([a-z0-9_./-]+\.(?:png|ico|svg))"/gi)].map((m) => `__DOC__${m[1]}`),
];

for (const page of readdirSync(root).filter((f) => f.endsWith('.html'))) enqueue(new URL(page, base).href, 'repo');
for (const page of OLD_PAGES) enqueue(new URL(page, base).href, 'old URL list');
enqueue(new URL('notice.json', base).href, 'Android app (AppConfig.noticeUrl)');
enqueue(base.href, 'site root');
enqueue(new URL('img/og-image.png', base).href, 'og:image (absolute URL in index.html)');

let failures = 0;
while (queue.length) {
  const { url, from } = queue.shift();
  let res;
  try {
    res = await fetch(url, { redirect: 'manual' });
  } catch (e) {
    checked.set(url, `ERR ${e.message}`);
    failures++;
    continue;
  }
  checked.set(url, res.status);
  if (res.status !== 200) {
    failures++;
    console.error(`FAIL ${res.status} ${url}  (referenced by ${from})`);
    continue;
  }
  const type = res.headers.get('content-type') ?? '';
  const text = /html|javascript|json|css|manifest/.test(type) || /\.(html|js|json|css|webmanifest)$/.test(url)
    ? await res.text() : '';
  if (url.endsWith('/') || url.endsWith('.html')) {
    for (const ref of htmlRefs(text)) {
      if (/^(https?:|mailto:)/.test(ref)) continue;
      enqueue(new URL(ref, url).href, url);
    }
  } else if (url.endsWith('.js')) {
    for (const ref of jsRefs(text)) {
      if (ref.startsWith('__DOC__')) enqueue(new URL(ref.slice(7), base).href, url); // relative to index.html
      else enqueue(new URL(ref, url).href, url);
    }
  } else if (url.endsWith('.webmanifest')) {
    for (const icon of JSON.parse(text).icons ?? []) enqueue(new URL(icon.src, url).href, url);
  }
}

for (const [url, status] of checked) {
  if (typeof status === 'string') {
    failures++;
    console.error(`FAIL ${url}: ${status}`);
  }
}
const ok = [...checked.values()].filter((s) => s === 200).length;
console.log(`${ok} URLs OK, ${failures} failed`);
console.log([...checked.keys()].map((u) => `  ${checked.get(u)} ${u.replace(base.href, '')}`).join('\n'));
process.exit(failures ? 1 : 0);
