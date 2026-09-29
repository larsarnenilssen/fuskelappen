// Sjekkmetode «lovdata»: henter Lovdatas datasett med gjeldende lover (tar.bz2), trekker ut loven og den delen
// kilderegisteret peker på (uttrekk.selektor), og lager et fingeravtrykk. Kjøres i GitHub Actions; Lovdata
// avviser forespørsler fra utviklingsmiljøet. Datasettet pakkes ut med systemets tar (ingen ny avhengighet).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Kilde } from '../../src/core/innhold/skjema.ts';
import { lagFingeravtrykk } from './logikk.ts';
import { LOVDATA_LOVER, lovdataFilnavn, strukturhint, trekkUt, USER_AGENT } from './metoder.ts';

let arkiv: Promise<string> | null = null;

/** Laster ned datasettet én gang per kjøring. */
function hentArkiv(): Promise<string> {
  arkiv ??= (async () => {
    const svar = await fetch(LOVDATA_LOVER, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(300_000) });
    if (!svar.ok) throw new Error(`${LOVDATA_LOVER} svarte ${svar.status} ${svar.statusText}`);
    const fil = join(mkdtempSync(join(tmpdir(), 'lovdata-')), 'gjeldende-lover.tar.bz2');
    writeFileSync(fil, Buffer.from(await svar.arrayBuffer()));
    return fil;
  })();
  return arkiv;
}

export async function sjekkLovdata(kilde: Kilde): Promise<{ fingeravtrykk: string }> {
  const fil = await hentArkiv();
  const navn = lovdataFilnavn(kilde.url);
  const liste = execFileSync('tar', ['-tjf', fil], { maxBuffer: 256 * 1024 * 1024 }).toString().split('\n');
  const oppforing = liste.find((l) => l.includes(navn));
  if (!oppforing) throw new Error(`Fant ikke ${navn} i datasettet. Første oppføringer: ${liste.slice(0, 5).join(', ')}`);
  const html = execFileSync('tar', ['-xjf', fil, '-O', oppforing], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  if (!kilde.uttrekk) return { fingeravtrykk: lagFingeravtrykk(trekkUt(html, { selektor: 'body', fjern: [] })) };
  try {
    return { fingeravtrykk: lagFingeravtrykk(trekkUt(html, kilde.uttrekk)) };
  } catch (e) {
    throw new Error(`${e instanceof Error ? e.message : String(e)} ${strukturhint(html)}`, { cause: e });
  }
}
