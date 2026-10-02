// Deling av en variant i Arbeidsplan som lenke (fase 3): pakking i adressen, kontroll av skjemaet fra lenken,
// og sammenligning av to varianter med samme utregning som på siden.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MAKS_PAKKET, pakk, pakkUt } from '../../src/core/deling.ts';
import { finnVerdi, slaaSammen } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { type Arbeidsplanskjema, beregnArbeidsplan, lesDeltArbeidsplan, nokkeltallForArbeidsplan, nyttArbeidsplanskjema } from '../../src/modules/arbeidstid/arbeidsplan.ts';
import { finnRad, type Hent, lesArsrammer } from '../../src/modules/arbeidstid/beregning/index.ts';
import { lesDeltLenke } from '../../src/modules/arbeidstid/komponenter/Varianter.tsx';
import { lesFil } from '../../scripts/innhold/last.ts';

const rot = join(__dirname, '../..');
const regler = readdirSync(join(rot, 'rules'), { recursive: true })
  .map(String)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => lesFil(rot, join(rot, 'rules', f)) as Regelsett);
const alle = slaaSammen(regler);
const hent: Hent = (n) => finnVerdi(alle, n, { dato: '2026-09-29' });
const rader = lesArsrammer(hent('sfs2213.arsrammer'));
const engelsk = finnRad(rader, { fag: 'Engelsk', program: 'Stud.spes', trinn: 'Vg1' });

/** Arbeidsplan med engelsk på vg1 i fire grupper, og kontaktlærer på 5 % når kontaktlaerer er sann. */
function skjema(kontaktlaerer: boolean): Arbeidsplanskjema {
  const s = nyttArbeidsplanskjema();
  const gruppe = s.grupper[0];
  if (!gruppe || !engelsk) throw new Error('mangler gruppe eller rad');
  return {
    ...s,
    grupper: [{ ...gruppe, id: 1, arsrammer: [{ valg: String(engelsk.nr), t60: null, stjerne: false }], arstimer: 140 * 4 }],
    funksjoner: kontaktlaerer ? [{ id: 1, navn: 'Kontaktlærer', prosent: 5, enhet: 'prosent', timer: null, utvider: true }] : [],
  };
}

describe('pakking i adressen', () => {
  it('gir samme verdi tilbake, med bare tegn som kan stå i en adresse', async () => {
    const verdi = { v: 1, navn: 'Før endring – æøå', skjema: skjema(true) };
    const tekst = await pakk(verdi);
    expect(tekst).toMatch(/^z[A-Za-z0-9_-]+$/);
    expect(await pakkUt(tekst)).toEqual(verdi);
  });

  it('komprimerer, så et vanlig skjema gir en kort lenke', async () => {
    const tekst = await pakk({ v: 1, skjema: skjema(true) });
    expect(tekst.length).toBeLessThan(JSON.stringify(skjema(true)).length);
    expect(tekst.length).toBeLessThan(1000);
  });

  it('leser ukomprimert innhold (nettlesere uten CompressionStream)', async () => {
    const json = Buffer.from(JSON.stringify({ a: 1 })).toString('base64url');
    expect(await pakkUt(`j${json}`)).toEqual({ a: 1 });
  });

  it('avviser tekst som ikke kan leses, uten å kaste', async () => {
    for (const tekst of ['', 'z', 'x123', 'zæøå', 'z!!!', 'zAAAA', `j${'A'.repeat(MAKS_PAKKET)}`, 'j' + Buffer.from('ikke json').toString('base64url')]) {
      expect(await pakkUt(tekst)).toBeNull();
    }
  });
});

describe('skjema fra en delt lenke', () => {
  it('godtar et skjema fra appen og fyller inn felt som mangler', () => {
    const uten: Partial<Arbeidsplanskjema> = skjema(true);
    delete uten.visLonn;
    delete uten.periode;
    const lest = lesDeltArbeidsplan(uten);
    expect(lest?.funksjoner[0]?.navn).toBe('Kontaktlærer');
    expect(lest?.visLonn).toBe(false);
    expect(lest?.periode).toBe(false);
  });

  it('godtar et fag valgt med fagkode fra Grep', () => {
    const s = skjema(false);
    const gruppe = s.grupper[0];
    if (!gruppe) throw new Error('mangler gruppe');
    const fag = { kode: 'ENG0012', navn: { nb: 'Engelsk', nn: 'Engelsk' }, timer: 140, nr: engelsk?.nr ?? 0, metode: 'regel' as const, kandidater: [] };
    const medFag = { ...s, grupper: [{ ...gruppe, arsrammer: [{ valg: String(engelsk?.nr), t60: null, stjerne: false, fagkoder: ['ENG0012'], fag }] }] };
    expect(lesDeltArbeidsplan(medFag)).not.toBeNull();
  });

  it('avviser feil typer, ukjente felt og for lange lister', () => {
    const s = skjema(true);
    expect(lesDeltArbeidsplan(null)).toBeNull();
    expect(lesDeltArbeidsplan([])).toBeNull();
    expect(lesDeltArbeidsplan({ ...s, stilling: '100' })).toBeNull();
    expect(lesDeltArbeidsplan({ ...s, stilling: Number.NaN })).toBeNull();
    expect(lesDeltArbeidsplan({ ...s, livsfase: 'alle' })).toBeNull();
    expect(lesDeltArbeidsplan({ ...s, ekstra: 1 })).toBeNull();
    expect(lesDeltArbeidsplan({ ...s, funksjoner: [{ ...s.funksjoner[0], navn: 'x'.repeat(201) }] })).toBeNull();
    expect(lesDeltArbeidsplan({ ...s, funksjoner: [{ ...s.funksjoner[0], skript: '<script>' }] })).toBeNull();
    expect(lesDeltArbeidsplan({ ...s, grupper: Array.from({ length: 51 }, () => s.grupper[0]) })).toBeNull();
  });

  it('gir minst én gruppe', () => {
    expect(lesDeltArbeidsplan({ grupper: [] })?.grupper).toHaveLength(1);
  });

  it('lenken har navnet og skjemaet, og navnet kortes til 40 tegn', async () => {
    const del = await pakk({ v: 1, navn: `  ${'Med kontaktlærer '.repeat(4)}`, skjema: skjema(true) });
    const lest = await lesDeltLenke(del, lesDeltArbeidsplan);
    expect(lest?.navn).toHaveLength(40);
    expect(lest?.skjema.funksjoner).toHaveLength(1);
    expect(await lesDeltLenke(await pakk({ v: 2, skjema: skjema(true) }), lesDeltArbeidsplan)).toBeNull();
    expect(await lesDeltLenke(await pakk({ v: 1, skjema: { stilling: 'x' } }), lesDeltArbeidsplan)).toBeNull();
  });
});

describe('sammenligning av to varianter', () => {
  const tall = (s: Arbeidsplanskjema) => Object.fromEntries(nokkeltallForArbeidsplan(beregnArbeidsplan(hent, rader, s), s).map((n) => [n.id, n.verdi]));

  it('viser forskjellen med og uten kontaktlærer', () => {
    const uten = tall(skjema(false));
    const med = tall(skjema(true));
    expect(uten.stilling).toBe(100);
    expect(med.undervisning).toBeCloseTo(uten.undervisning ?? 0, 6);
    expect(uten.funksjoner).toBe(0);
    expect(med.funksjoner).toBe(5);
    expect((med.beskjeftigelse ?? 0) - (uten.beskjeftigelse ?? 0)).toBeCloseTo(5, 6);
    expect((med.differanse ?? 0) - (uten.differanse ?? 0)).toBeCloseTo(5, 6);
    // Funksjonstiden kommer fra kontaktlærerfunksjonen.
    expect(uten.del_funksjonstid).toBe(0);
    expect(med.del_funksjonstid ?? 0).toBeGreaterThan(0);
    // Lønn regnes bare når den er slått på.
    expect(med.lonn).toBeNull();
  });

  it('bruker samme utregning som siden', () => {
    const s = skjema(true);
    const b = beregnArbeidsplan(hent, rader, s);
    const n = Object.fromEntries(nokkeltallForArbeidsplan(b, s).map((x) => [x.id, x.verdi]));
    expect(n.beskjeftigelse).toBe(b.resultat?.beskjeftigelse.verdi);
    expect(n.planfestet).toBeCloseTo(b.fordeling?.deler.filter((d) => d.planfestet).reduce((sum, d) => sum + d.timer, 0) ?? -1, 6);
  });

  it('har lønn i året når lønnen er slått på', () => {
    const n = tall({ ...skjema(true), visLonn: true });
    expect(n.lonn ?? 0).toBeGreaterThan(0);
  });

  it('gir null når ingenting kan regnes ut', () => {
    const n = tall({ ...nyttArbeidsplanskjema(), stilling: null });
    expect(n.beskjeftigelse).toBeNull();
    expect(n.del_undervisning).toBeNull();
  });
});
