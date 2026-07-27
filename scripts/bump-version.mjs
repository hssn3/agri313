/**
 * bump-version.mjs
 * اجرا قبل از هر build — نسخه را بالا می‌برد و changelog را آپدیت می‌کند
 * استفاده: node scripts/bump-version.mjs [patch|minor|major] "توضیح تغییر"
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '..');

// ── خواندن نسخه فعلی ──────────────────────────────────────
const pkgPath = resolve(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const [maj, min, pat] = pkg.version.split('.').map(Number);

// ── تعیین نوع bump ─────────────────────────────────────────
const bumpType = process.argv[2] || 'patch';
const changeNote = process.argv[3] || 'بهبودها و رفع اشکال';

let newVersion;
if (bumpType === 'major') newVersion = `${maj + 1}.0.0`;
else if (bumpType === 'minor') newVersion = `${maj}.${min + 1}.0`;
else newVersion = `${maj}.${min}.${pat + 1}`;

// ── آپدیت package.json ────────────────────────────────────
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`✅ نسخه: ${pkg.version.replace(newVersion, `${pkg.version} →`)} ${newVersion}`);

// ── آپدیت CHANGELOG.md ───────────────────────────────────
const changelogPath = resolve(ROOT, 'CHANGELOG.md');
let existing = '';
try { existing = readFileSync(changelogPath, 'utf8'); } catch {}

const now = new Date();
const dateFa = now.toLocaleDateString('fa-IR', { year:'numeric', month:'long', day:'numeric' });
const dateISO = now.toISOString().split('T')[0];

const entry = `## [${newVersion}] — ${dateISO} (${dateFa})\n${changeNote}\n\n`;

const header = existing.startsWith('# CHANGELOG')
  ? existing.slice(0, existing.indexOf('\n') + 1)
  : '# CHANGELOG — SmartAgri Analyze\n';
const body = existing.startsWith('# CHANGELOG') ? existing.slice(existing.indexOf('\n') + 1) : existing;

writeFileSync(changelogPath, header + '\n' + entry + body, 'utf8');
console.log(`📝 CHANGELOG.md آپدیت شد — v${newVersion}`);

// ── inject version در index.html و build ─────────────────
const htmlPath = resolve(ROOT, 'index.html');
let html = readFileSync(htmlPath, 'utf8');
html = html.replace(
  /<script>window\.__APP_VERSION__.*?<\/script>/,
  ''
);
html = html.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  `<script>window.__APP_VERSION__="${newVersion}";</script>\n  <script type="module" src="/src/main.tsx"></script>`
);
writeFileSync(htmlPath, html, 'utf8');
console.log(`🔖 __APP_VERSION__ = "${newVersion}" در index.html تنظیم شد`);
