// Midlertidig: kartlegger Lovdatas gratis datasett fra GitHub Actions (utviklingsmiljøet når ikke Lovdata).
// Skriver listen over datasett, filnavn og utdrag av dokumentene i utvalget til data/lovdata/utforsk/, så leseren
// kan lages etter den virkelige strukturen. Fjernes når leseren er på plass.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const UA = 'Fuskelappen-kildesjekk/0.1 (+https://github.com/larsarnenilssen/fuskelappen)';
const ut = '.generert/lovdata-utforsk';
mkdirSync(ut, { recursive: true });

async function hent(url: string): Promise<Response> {
  const svar = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(300_000) });
  if (!svar.ok) throw new Error(`${url} svarte ${svar.status}`);
  return svar;
}

const liste = await (await hent('https://api.lovdata.no/v1/publicData/list')).text();
writeFileSync(join(ut, 'liste.json'), liste);
console.log(liste.slice(0, 3000));

const sok: Record<string, RegExp> = {
  opplaeringslova: /nl-20230609-030/,
  forvaltningsloven: /nl-19670210-000/,
  opplaeringsforskrifta: /sf-20240603-0900/,
  helsemiljo: /sf-20230328-0449/,
  arbeidsmiljoloven: /nl-20050617-062/,
};

for (const navn of ['gjeldende-lover.tar.bz2', 'gjeldende-sentrale-forskrifter.tar.bz2']) {
  let fil: string;
  try {
    fil = join(mkdtempSync(join(tmpdir(), 'lovdata-')), navn);
    writeFileSync(fil, Buffer.from(await (await hent(`https://api.lovdata.no/v1/publicData/get/${navn}`)).arrayBuffer()));
  } catch (e) {
    console.log(`Kunne ikke hente ${navn}: ${String(e)}`);
    continue;
  }
  const filer = execFileSync('tar', ['-tjf', fil], { maxBuffer: 256 * 1024 * 1024 }).toString().split('\n').filter(Boolean);
  writeFileSync(join(ut, `${navn}.filer.txt`), filer.join('\n'));
  console.log(`${navn}: ${filer.length} filer, f.eks. ${filer.slice(0, 5).join(', ')}`);
  const mappe = mkdtempSync(join(tmpdir(), 'lovdata-ut-'));
  execFileSync('tar', ['-xjf', fil, '-C', mappe], { maxBuffer: 256 * 1024 * 1024 });
  for (const f of filer) {
    if (f.endsWith('/')) continue;
    const innhold = readFileSync(join(mappe, f), 'utf8');
    const tittel = /<title>([^<]*)<\/title>/i.exec(innhold)?.[1] ?? '';
    for (const [id, re] of Object.entries(sok)) {
      if (re.test(f)) {
        const trygt = f.replace(/[^a-z0-9.-]/gi, '_');
        writeFileSync(join(ut, `${id}--${trygt}.html`), innhold);
        // Strukturen: tagger med klasse, og hvor mange det er av hver.
        const telling = new Map<string, number>();
        for (const m of innhold.matchAll(/<([a-z0-9]+)((?:\s+[a-z-]+="[^"]*")*)\s*\/?>/gi)) {
          const klasse = /class="([^"]*)"/.exec(m[2] ?? '')?.[1];
          const k = `${m[1]}${klasse ? `.${klasse}` : ''}`;
          telling.set(k, (telling.get(k) ?? 0) + 1);
        }
        writeFileSync(join(ut, `${id}--${trygt}.struktur.txt`), [`${tittel}\n${innhold.length} tegn`, ...[...telling].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}\t${k}`)].join('\n'));
        // Et utdrag midt i, rundt første «§ 11-1» eller «§ 4-1», for paragrafer med ledd og lister.
        const midt = innhold.search(/§\s*11-1\b|§\s*4-1\b|§\s*28\b/);
        if (midt > 0) writeFileSync(join(ut, `${id}--${trygt}.midt.html`), innhold.slice(Math.max(0, midt - 3000), midt + 12000));
        console.log(`Treff ${id}: ${f} – ${tittel}`);
      }
    }
  }
}
