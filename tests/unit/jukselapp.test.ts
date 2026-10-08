// Dagens jukselapp (fase 8, avgjørelse 085): teksten i et faktum, utvalget per dag og faktaene fra alle modulene.
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesFil } from '../../scripts/innhold/last.ts';
import { lesFagindeks } from '../../scripts/data/les.ts';
import { lesRegelsett } from '../../scripts/innhold/alt.ts';
import { lesHash, matchRute } from '../../src/app/ruter.ts';
import { lastAlleTekster } from '../../src/core/i18n/tekst.ts';
import { kilderegisterSkjema } from '../../src/core/innhold/skjema.ts';
import { dagnummer, erSynlig, faktatekst, hentFaktum, LENGSTE, modulOgRunde, plassIRunde, setninger } from '../../src/core/jukselapp/fakta.ts';
import { stegadresser } from '../../src/core/jukselapp/innhold.ts';
import { finnVei, lagKart, lesSvar, veiTil } from '../../src/core/veiviser/veiviser.ts';
import { byggJukselappfag } from '../../src/modules/fag/jukselappfag.ts';
import { aktiveModuler, alleRuter } from '../../src/modules/register.ts';
import type { Faktum } from '../../src/modules/typer.ts';
import { hentInnhold as hentSkolemiljo, veiviserRute } from '../../src/modules/skolemiljo/innhold.ts';
import { faktaFraStatistikk } from '../../src/modules/statistikk/fakta.ts';
import { lastStatistikk } from '../../src/data/statistikk.ts';

const rot = join(import.meta.dirname, '../..');
const t = (nb: string, nn = nb) => ({ nb, nn });

describe('teksten i et faktum', () => {
  it('tar de første setningene i første avsnitt, høyst om lag 240 tegn, og like mange på nynorsk', () => {
    const tekst = faktatekst(t('Første setning er her. Andre setning følger. ' + 'Lang tredje setning. '.repeat(20), 'Fyrste setning er her. Andre setning følgjer. ' + 'Lang tredje setning. '.repeat(20)));
    expect(tekst?.nb.startsWith('Første setning er her. Andre setning følger.')).toBe(true);
    expect(tekst?.nb.length).toBeLessThanOrEqual(240);
    expect(setninger(tekst?.nb ?? '').length).toBe(setninger(tekst?.nn ?? '').length);
  });

  it('gjør HTML og markdown om til ren tekst', () => {
    expect(faktatekst(t('<p>Se <a class="begrepslenke" href="#/begreper/x">årsrammen</a> &amp; <strong>mer</strong>.</p><ul><li>Punkt</li></ul>'))?.nb).toBe('Se årsrammen & mer.');
    expect(faktatekst(t('Se [opplæringslova § 12-4](#/lov/opplaeringslova/12-4) og **dette**.\n\nNeste avsnitt.'))?.nb).toBe('Se opplæringslova § 12-4 og dette.');
  });

  it('deler ikke setningen ved datoer og forkortelser', () => {
    expect(setninger('Søk innen 1. mars hvert år. Neste setning.')).toEqual(['Søk innen 1. mars hvert år.', 'Neste setning.']);
    expect(setninger('Fravær, f.eks. sykdom, teller.')).toHaveLength(1);
  });

  it('gir ikke noe faktum av lister, tekst som slutter med kolon, eller en for lang første setning', () => {
    expect(faktatekst(t('- Et punkt\n- Et til'))).toBeNull();
    expect(faktatekst(t('<ul><li>Et punkt</li></ul>'))).toBeNull();
    expect(faktatekst(t('Reglene er disse:'))).toBeNull();
    expect(faktatekst(t(`${'ord '.repeat(LENGSTE / 4 + 10)}slutt.`))).toBeNull();
  });
});

describe('utvalget per dag', () => {
  it('går gjennom alle faktaene før noe gjentas, også når antallet går opp i 7', () => {
    for (const n of [1, 2, 7, 14, 77, 151, 853]) {
      const plasser = new Set(Array.from({ length: n }, (_, r) => plassIRunde(r, n)));
      expect(plasser.size, `n = ${n}`).toBe(n);
    }
  });

  it('gir to dager etter hverandre fakta fra ulike moduler', () => {
    const a = modulOgRunde('2026-10-08', 0, 12);
    const b = modulOgRunde('2026-10-09', 0, 12);
    expect(a.modul).not.toBe(b.modul);
    expect(dagnummer('2026-10-09') - dagnummer('2026-10-08')).toBe(1);
  });

  const faktum = (id: string, gyldighet?: Faktum['gyldighet']): Faktum => ({ id, tittel: t(id), tekst: t('Tekst.'), under: t('Modul'), lenke: t(id), rute: '/x', kilder: [{ id: 'k' }], ...(gyldighet ? { gyldighet } : {}) });
  const moduler = [
    { id: 'a', fakta: async () => [faktum('a1'), faktum('a2')] },
    { id: 'b', fakta: async () => [] },
    { id: 'c', fakta: async () => [faktum('c1', { niva: 'fylke', fylke: '46', forhold: 'supplerer' })] },
  ];

  it('gir samme faktum hele dagen, og hopper over moduler uten fakta for brukeren', async () => {
    const sted = { fylke: null, skole: null };
    const forste = await hentFaktum(moduler, sted, '2026-10-08', 0);
    expect(await hentFaktum(moduler, sted, '2026-10-08', 0)).toEqual(forste);
    for (let steg = 0; steg < 6; steg++) expect((await hentFaktum(moduler, sted, '2026-10-08', steg))?.faktum.id.startsWith('a')).toBe(true);
  });

  it('viser fylkets fakta bare når fylket er valgt', async () => {
    expect(erSynlig({ niva: 'fylke', fylke: '46', forhold: 'supplerer' }, { fylke: '46', skole: null })).toBe(true);
    expect(erSynlig({ niva: 'fylke', fylke: '46', forhold: 'supplerer' }, { fylke: '03', skole: null })).toBe(false);
    const ider = new Set<string>();
    for (let steg = 0; steg < 6; steg++) ider.add((await hentFaktum(moduler, { fylke: '46', skole: null }, '2026-10-08', steg))?.faktum.id ?? '');
    expect(ider).toContain('c1');
  });

  it('gir knappen for ny jukselapp et nytt faktum, og null uten fakta', async () => {
    const r = await hentFaktum(moduler, { fylke: null, skole: null }, '2026-10-08', 0);
    const neste = await hentFaktum(moduler, { fylke: null, skole: null }, '2026-10-08', (r?.steg ?? 0) + 1);
    expect(neste?.faktum.id).not.toBe(r?.faktum.id);
    expect(await hentFaktum([{ id: 'b', fakta: async () => [] }], { fylke: null, skole: null }, '2026-10-08', 0)).toBeNull();
  });
});

describe('veien til et steg i en veiviser', () => {
  it('finner svarene på den korteste veien', () => {
    const kart = lagKart('a', [
      { id: 'a', sporsmal: { svar: [{ id: 'ja', neste: 'b' }, { id: 'nei', neste: 'c' }] } },
      { id: 'b', neste: 'd' },
      { id: 'c' },
      { id: 'd' },
    ]);
    expect(veiTil(kart, 'd')).toEqual(['ja']);
    expect(veiTil(kart, 'c')).toEqual(['nei']);
    expect(veiTil(kart, 'x')).toBeNull();
  });

  it('lenker stegene i veiviserne rett til steget', async () => {
    const { veivisere, steg } = await hentSkolemiljo();
    const adresser = stegadresser([...veivisere, ...steg], veiviserRute);
    expect(adresser.size).toBeGreaterThan(0);
    for (const [id, adresse] of adresser) {
      const { sti, sporring } = lesHash(adresse);
      const veiviser = veivisere.find((v) => sti === veiviserRute(v.id));
      expect(veiviser, adresse).toBeDefined();
      const kart = lagKart(veiviser?.start ?? '', steg.filter((s) => s.veiviser === veiviser?.id && (s.gyldighet.niva === 'nasjonal' || s.gyldighet.forhold !== 'supplerer')));
      expect(finnVei(kart, lesSvar(sporring.get('svar')), sporring.get('steg')).gjeldende, adresse).toBe(id);
    }
  });
});

describe('faktaene fra modulene', () => {
  const register = kilderegisterSkjema.parse(lesFil(rot, join(rot, 'content/kilder.yaml')));
  const kilder = new Set(register.kilder.map((k) => k.id));

  it('alle modulene har fakta(), og de fleste gir fakta', async () => {
    await lastAlleTekster();
    const lister = await Promise.all(aktiveModuler.map(async (m) => ({ id: m.id, fakta: await m.fakta() })));
    expect(lister.filter((l) => l.fakta.length > 0).length).toBeGreaterThanOrEqual(10);
    for (const id of ['begreper', 'vurdering', 'eksamen', 'inntak', 'skolemiljo', 'tilrettelegging', 'arbeidstid', 'opplaeringslop', 'laereplanverket', 'lov', 'fag', 'statistikk']) {
      expect(lister.find((l) => l.id === id)?.fakta.length, id).toBeGreaterThan(0);
    }
  }, 60_000);

  it('hvert faktum har tekst på begge målformer, kilder i registeret og en adresse i appen', async () => {
    await lastAlleTekster();
    const alle = (await Promise.all(aktiveModuler.map((m) => m.fakta()))).flat();
    const ider = alle.map((f) => f.id);
    expect(ider.filter((id, i) => ider.indexOf(id) !== i)).toEqual([]);
    const ruter = alleRuter();
    for (const f of alle) {
      for (const m of ['nb', 'nn'] as const) {
        expect(f.tittel[m].length, f.id).toBeGreaterThan(0);
        expect(f.lenke[m].length, f.id).toBeGreaterThan(0);
        expect(f.tekst[m], f.id).toMatch(/[.!?»)]$/);
        expect(f.tekst[m], f.id).not.toMatch(/[<>]|\]\(|\*\*/);
      }
      expect(f.kilder.length, f.id).toBeGreaterThan(0);
      for (const k of f.kilder) expect(kilder.has(k.id), `${f.id}: ${k.id}`).toBe(true);
      const { sti } = lesHash(f.rute);
      expect(ruter.some(({ rute }) => matchRute(rute.sti, sti)), `${f.id}: ${f.rute}`).toBe(true);
    }
  }, 60_000);

  it('fylkets tall har fylket i gyldigheten, og landets har ingen', async () => {
    await lastAlleTekster();
    const fakta = faktaFraStatistikk(await lastStatistikk());
    expect(fakta.find((f) => f.id === 'statistikk:sokere:L')?.gyldighet).toBeUndefined();
    expect(fakta.find((f) => f.id === 'statistikk:sokere:F46')?.gyldighet).toEqual({ niva: 'fylke', fylke: '46', forhold: 'supplerer' });
    expect(fakta.find((f) => f.id === 'statistikk:sokere:F46')?.tekst.nb).toContain('Vestland');
  });

  it('fagene har årstimene og årsrammen fra SFS 2213 vedlegg 1', () => {
    const fag = byggJukselappfag(lesFagindeks(rot), lesRegelsett(rot), '2026-10-08');
    expect(fag.length).toBeGreaterThan(100);
    expect(fag.find(([kode]) => kode === 'MAT1019')).toEqual(['MAT1019', 'Matematikk 1P', 'Matematikk 1P', 140, 525, 700]);
  });
});
