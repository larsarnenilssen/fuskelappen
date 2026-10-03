// Kontrollgrunnlaget i regelsettene: sitater som gir verdisjekken noe å sjekke, og tall som henger sammen.
// Sammenhengstestene fanger en feil i én verdi selv om kilden er uendret (docs/avgjorelser/017).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Kilderegister, Praksisfil } from '../../src/core/innhold/skjema.ts';
import { lesVerdistatus, verdiISitat, verdinokkel } from '../../src/core/kontroll/verdisjekk.ts';
import type { Regelsett, Tabellrad } from '../../src/core/regler/skjema.ts';
import { lesInnhold, lesRegelsett } from '../../scripts/innhold/alt.ts';
import { lesFil } from '../../scripts/innhold/last.ts';
import { dokumenttekst, type Lovdokument } from '../../src/modules/lov/typer.ts';
import { normaliserTekst } from '../../src/core/kontroll/tekst.ts';

const rot = join(__dirname, '../..');
const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
const regelsett = lesRegelsett(rot);
const kilder = new Map(register.kilder.map((k) => [k.id, k]));

// Kilder der kildejobben leser teksten, så verdisjekken kan se etter sitatet.
// lovtekst: kildesjekken gir teksten fra data/lovdata til verdisjekken (avgjørelse 047).
const LESBARE = new Set(['side', 'kf-infoserie', 'fil', 'lovdata', 'lovtekst']);

function sett(id: string): Regelsett {
  const r = regelsett.find((x) => x.id === id);
  if (!r) throw new Error(`Fant ikke regelsettet ${id}`);
  return r;
}

function tall(r: Regelsett, nokkel: string): number {
  const v = r.verdier[nokkel]?.verdi;
  if (typeof v !== 'number') throw new Error(`${r.id}/${nokkel} er ikke et tall`);
  return v;
}

function tabell(r: Regelsett, nokkel: string): Tabellrad[] {
  const v = r.verdier[nokkel]?.verdi;
  if (!Array.isArray(v)) throw new Error(`${r.id}/${nokkel} er ikke en tabell`);
  return v as Tabellrad[];
}

const alleVerdier = regelsett.flatMap((r) => Object.entries(r.verdier).map(([nokkel, v]) => ({ id: verdinokkel(r.id, nokkel), v })));

describe('sitater på regelverdiene', () => {
  it('hvert sitat inneholder verdien slik kilden skriver den', () => {
    const feil = alleVerdier
      .filter(({ v }) => v.sitat !== undefined)
      .filter(({ v }) => typeof v.verdi !== 'number' || verdiISitat(v.sitat as string, v.verdi) === null)
      .map(({ id }) => id);
    expect(feil).toEqual([]);
  });

  it('alle enkeltverdier fra en kilde som leses automatisk, har sitat', () => {
    const mangler = alleVerdier
      .filter(({ v }) => typeof v.verdi === 'number' && v.grunnlag === undefined && v.sitat === undefined)
      .filter(({ v }) => {
        const k = kilder.get(v.kilde.id);
        return k !== undefined && k.aktiv && LESBARE.has(k.sjekkmetode);
      })
      .map(({ id }) => id);
    expect(mangler).toEqual([]);
  });

  it('sitater fra lov- og forskriftstekst står ordrett i teksten fra Lovdata (data/lovdata)', () => {
    // Samme tekst som kildesjekken ser etter sitatene i hver uke. Testen fanger et sitat som er skrevet feil.
    const tekster = new Map<string, string>();
    for (const fil of readdirSync(join(rot, 'data/lovdata')).filter((f) => f.endsWith('.json'))) {
      const dok = JSON.parse(readFileSync(join(rot, 'data/lovdata', fil), 'utf8')) as Lovdokument & { kilde?: string };
      if (dok.kilde) tekster.set(dok.kilde, `${tekster.get(dok.kilde) ?? ''}\n${normaliserTekst(dokumenttekst(dok))}`);
    }
    const lovverdier = alleVerdier.filter(({ v }) => v.sitat !== undefined && kilder.get(v.kilde.id)?.sjekkmetode === 'lovtekst');
    expect(lovverdier.length).toBeGreaterThan(0);
    const feil = lovverdier.filter(({ v }) => !(tekster.get(v.kilde.id) ?? '').includes(normaliserTekst(v.sitat as string))).map(({ id }) => id);
    expect(feil).toEqual([]);
  });

  it('verdier som er avledet eller bygger på praksis, har en merknad som forklarer det, og ikke sitat', () => {
    const feil = alleVerdier
      .filter(({ v }) => v.grunnlag !== undefined && (!v.merknad || v.sitat !== undefined))
      .map(({ id }) => id);
    expect(feil).toEqual([]);
  });

  it('verdistatus gjelder bare verdier som finnes, og enkeltverdier med sitat', () => {
    const status = lesVerdistatus(JSON.parse(readFileSync(join(rot, 'data/status/verdistatus.json'), 'utf8')));
    expect(status).not.toBeNull();
    const sjekkbare = new Set(alleVerdier.filter(({ v }) => v.sitat !== undefined || Array.isArray(v.verdi)).map(({ id }) => id));
    expect(Object.keys(status?.verdier ?? {}).filter((id) => !sjekkbare.has(id))).toEqual([]);
  });
});

describe('tallene henger sammen', () => {
  const sfs = sett('sfs2213-2026-2027');
  const hta = sett('hta-2026-2028');

  it('årsverket er et helt antall dager à 7,5 timer, og 60+ har fem dager mindre', () => {
    const perDag = tall(sfs, 'timer_per_dag');
    const dager = tall(sfs, 'arsverk_timer') / perDag;
    const dager60 = tall(sfs, 'arsverk_timer_60_ar') / perDag;
    expect(Number.isInteger(dager)).toBe(true);
    expect(dager).toBe(225);
    expect(dager - dager60).toBe(5);
  });

  it('arbeidsåret (skoleåret + tilleggsdagene) er kortere enn årsverket i dager', () => {
    const dager = tall(sfs, 'skolear_dager') + tall(sfs, 'arbeidsaar_tillegg_dager');
    expect(dager).toBe(196);
    expect(dager).toBeLessThan(tall(sfs, 'arsverk_timer') / tall(sfs, 'timer_per_dag'));
  });

  it('en uke er arbeidsdager × timer per dag, og skoleåret er uker × arbeidsdager', () => {
    expect(tall(sfs, 'arbeidsdager_per_uke') * tall(sfs, 'timer_per_dag')).toBe(tall(sfs, 'planfestet_maks_uke'));
    expect(tall(sfs, 'skolear_uker') * tall(sfs, 'arbeidsdager_per_uke')).toBe(tall(sfs, 'skolear_dager'));
  });

  it('planfestet tid er mindre enn årsverket', () => {
    expect(tall(sfs, 'planfestet_timer')).toBeLessThan(tall(sfs, 'arsverk_timer_60_ar'));
  });

  it('60- og 45-minutters enheter står i forholdet 3 : 4', () => {
    const par: [string, string][] = [
      ['arsramme_funksjon', 'arsramme_funksjon_45'],
      ['stjernetillegg', 'stjernetillegg_45'],
    ];
    for (const [t60, t45] of par) expect(Math.round((tall(sfs, t60) * 4) / 3)).toBe(tall(sfs, t45));
  });

  it('hver rad i vedlegg 1 har 45-minutters årsrammen lik 60-minutters årsrammen × 4/3, avrundet', () => {
    const feil = tabell(sfs, 'arsrammer')
      .filter((r) => Math.round(((r.t60 as number) * 4) / 3) !== r.t45)
      .map((r) => `rad ${String(r.nr)}: ${String(r.t60)}/${String(r.t45)}`);
    expect(feil).toEqual([]);
  });

  it('radene i vedlegg 1 er nummerert 1, 2, 3 … uten hull', () => {
    const nr = tabell(sfs, 'arsrammer').map((r) => r.nr);
    expect(nr).toEqual(nr.map((_, i) => i + 1));
  });

  it('årsverket i timelønnsformelen i hovedtariffavtalen er det samme som i SFS 2213', () => {
    expect(tall(hta, 'timelonn_arsverk_timer')).toBe(tall(sfs, 'arsverk_timer'));
  });

  it('brøken 100/112 trekker ut feriepenger på 12 %', () => {
    expect(tall(hta, 'timelonn_ferie_nevner') - tall(hta, 'timelonn_ferie_teller')).toBe(tall(hta, 'feriepenger_prosent'));
  });

  it('arbeidsdager per måned er 5 dager × 52 uker ÷ 12, avrundet til to desimaler', () => {
    expect(tall(hta, 'arbeidsdager_per_maned')).toBe(Math.round(((tall(sfs, 'arbeidsdager_per_uke') * 52) / 12) * 100) / 100);
  });

  it('garantilønnen øker med ansienniteten og med utdanningen', () => {
    const trinn = hta.verdier.garantilonn_ansiennitet?.verdi as number[];
    const rader = tabell(hta, 'garantilonn');
    for (const rad of rader) {
      const lonn = trinn.map((t) => rad[`ar_${t}`] as number);
      expect(lonn).toEqual([...lonn].sort((a, b) => a - b));
    }
    for (const t of trinn) {
      const kolonne = rader.map((r) => r[`ar_${t}`] as number);
      expect(kolonne).toEqual([...kolonne].sort((a, b) => a - b));
    }
  });
});

describe('kontrollspørsmål og praksis', () => {
  const innhold = lesInnhold(rot);
  const praksis = (lesFil(rot, join(rot, 'content/kontroll/praksis.yaml')) as Praksisfil).praksis;

  it('alt innhold i content/ har 1–5 kontrollspørsmål som slutter med spørsmålstegn', () => {
    const feil = innhold
      .filter(({ element: e }) => {
        const s = e.kontrollsporsmal ?? [];
        return s.length < 1 || s.length > 5 || s.some((q) => !q.endsWith('?'));
      })
      .map(({ element }) => element.id);
    expect(feil).toEqual([]);
  });

  it('innhold med kontrollspørsmål viser til et konkret sted i minst én kilde (punkt eller url)', () => {
    const feil = innhold.filter(({ element: e }) => (e.kontrollsporsmal ?? []).length > 0 && !e.kilder.some((k) => k.punkt || k.url)).map(({ element }) => element.id);
    expect(feil).toEqual([]);
  });

  it('praksislisten viser bare til regelverdier og innhold som finnes', () => {
    const verdier = new Set(alleVerdier.map(({ id }) => id));
    const ider = new Set(innhold.map(({ element }) => element.id));
    const ukjente = praksis.flatMap((p) => p.berorer.filter((b) => !(b.includes('/') ? verdier.has(b) : ider.has(b))).map((b) => `${p.id}: ${b}`));
    expect(ukjente).toEqual([]);
  });

  it('praksis er ikke bekreftet uten eier (bare formatet sjekkes)', () => {
    for (const p of praksis) if (p.bekreftet) expect(p.bekreftet.dato).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('verdier med grunnlag praksis står i praksislisten', () => {
    const iListen = new Set(praksis.flatMap((p) => p.berorer));
    const mangler = alleVerdier.filter(({ id, v }) => v.grunnlag === 'praksis' && !iListen.has(id)).map(({ id }) => id);
    expect(mangler).toEqual([]);
  });
});
