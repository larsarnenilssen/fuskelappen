// Kalenderen (fase 6, pakke 5, avgjørelse 066): vinduet, utfoldingen av fristene, filteret, streken for i dag, de
// neste datoene, adressen og lenkene fra fristene.
import { describe, expect, it } from 'vitest';
import type { Frist } from '../../src/core/innhold/skjema.ts';
import { kalenderLenke, lesValg, sporringFor } from '../../src/modules/kalender/adresse.ts';
import {
  delInn,
  idagIndeks,
  manederIVindu,
  nestePoster,
  passert,
  rullendeVindu,
  skolearIVindu,
  skolearVindu,
  utvid,
  velgPoster,
  type Kalenderoppforing,
} from '../../src/modules/kalender/beregning/kalender.ts';
import { fristposter, temaFor } from '../../src/modules/kalender/beregning/oppforinger.ts';
import { paragraftekst } from '../../src/modules/kalender/datakilder.ts';
import { finnLenker } from '../../src/modules/kalender/lenker.ts';
import { datocelle } from '../../src/modules/kalender/visning.ts';
import { aktiveModuler } from '../../src/modules/register.ts';

const o = (id: string, ekstra: Partial<Kalenderoppforing>): Kalenderoppforing => ({
  id,
  tittel: { nb: id, nn: id },
  tema: ['inntak'],
  grupper: [],
  lenker: [],
  paragrafer: [],
  kilder: [{ id: 'x' }],
  fylke: null,
  ...ekstra,
});

describe('vinduet', () => {
  it('rullende tolv måneder starter i måneden vi er i', () => {
    expect(rullendeVindu('2026-10-05')).toEqual({ fra: '2026-10-01', til: '2027-09-30' });
    expect(rullendeVindu('2027-01-31')).toEqual({ fra: '2027-01-01', til: '2027-12-31' });
    expect(manederIVindu(rullendeVindu('2026-10-05'))).toHaveLength(12);
  });

  it('skoleåret går fra august til juli', () => {
    expect(skolearVindu(2026)).toEqual({ fra: '2026-08-01', til: '2027-07-31' });
    expect(skolearIVindu(rullendeVindu('2026-10-05'))).toEqual([2026, 2027]);
    expect(skolearIVindu(skolearVindu(2026))).toEqual([2026]);
  });
});

describe('utfoldingen', () => {
  const v = rullendeVindu('2026-10-05');

  it('en årlig frist får en post med dato i vinduet', () => {
    const p = utvid([o('mars', { regel: { type: 'arlig', dag: 1, maned: 3 } })], v);
    expect(p.map((x) => x.fra)).toEqual(['2027-03-01']);
  });

  it('en frist med måned får en post uten dag, og en periode én post i hver måned', () => {
    const p = utvid([o('jan', { regel: { type: 'maned', maned: 1 } }), o('svar', { regel: { type: 'perioden', fra: 7, til: 8 } })], v);
    expect(p.map((x) => `${x.oppforing.id}:${x.maned}:${x.fra}`)).toEqual(['jan:2027-01:null', 'svar:2027-07:null', 'svar:2027-08:null']);
    expect(p[1]?.periode).toEqual({ fra: 7, til: 8 });
  });

  it('en periode med dato som startet før vinduet, står i første måned', () => {
    const p = utvid([o('oppmelding', { dato: '2026-09-01', til: '2026-10-01' })], v);
    expect(p[0]?.maned).toBe('2026-10');
    expect(datocelle('2026-09-01', '2026-10-01', '2026-10', 'nb')).toEqual({ dag: '1. sep', ukedag: null, til: '1. okt' });
  });

  it('løpende frister står ikke i månedene', () => {
    expect(utvid([o('voksne', { regel: { type: 'lopende' } })], v)).toEqual([]);
  });
});

describe('filteret og visningen', () => {
  const v = rullendeVindu('2026-10-05');
  const poster = utvid(
    [
      o('nov', { regel: { type: 'arlig', dag: 1, maned: 11 }, grupper: ['voksne'] }),
      o('okt', { regel: { type: 'arlig', dag: 10, maned: 10 }, tema: ['eksamen'] }),
      o('uten', { regel: { type: 'maned', maned: 10 } }),
      o('lokal', { regel: { type: 'arlig', dag: 10, maned: 10 }, fylke: '46' }),
    ],
    v,
  );

  it('uten tema er postene uten fast dag ikke med, og nasjonale står før lokale samme dag', () => {
    expect(velgPoster(poster, { tema: null, gruppe: null }).map((p) => p.oppforing.id)).toEqual(['okt', 'lokal', 'nov']);
  });

  it('med tema kommer postene uten fast dag sist i måneden', () => {
    expect(velgPoster(poster, { tema: 'inntak', gruppe: null }).map((p) => p.oppforing.id)).toEqual(['lokal', 'uten', 'nov']);
  });

  it('gruppen viser frister for gruppen og frister for alle', () => {
    expect(velgPoster(poster, { tema: null, gruppe: 'elever' }).map((p) => p.oppforing.id)).toEqual(['okt', 'lokal']);
  });

  it('streken for i dag står foran den første posten etter i dag', () => {
    const okt = velgPoster(poster, { tema: 'inntak', gruppe: null }).filter((p) => p.maned === '2026-10');
    expect(idagIndeks(okt, '2026-10', '2026-10-05')).toBe(0);
    expect(idagIndeks(okt, '2026-11', '2026-10-05')).toBeNull();
  });

  it('passerte poster og de neste datoene', () => {
    const alle = velgPoster(poster, { tema: null, gruppe: null });
    expect(passert(alle[0]!, '2026-10-11')).toBe(true);
    expect(nestePoster(alle, '2026-10-11', 3).map((p) => p.oppforing.id)).toEqual(['nov']);
  });

  it('tolv måneder deles i tre eller fire deler', () => {
    const m = manederIVindu(v);
    expect(delInn(m, 3).map((d) => d.length)).toEqual([4, 4, 4]);
    expect(delInn(m, 4).map((d) => d.length)).toEqual([3, 3, 3, 3]);
  });
});

describe('adressen', () => {
  it('leser valgene, også de gamle gruppenavnene fra Inntak', () => {
    const v = lesValg(new URLSearchParams('tema=inntak&vis=ungdom&visning=skolear&aar=2027'));
    expect(v).toEqual({ visning: 'skolear', aar: 2027, tema: 'inntak', gruppe: 'elever' });
    expect(lesValg(new URLSearchParams('vis=fortrinn')).gruppe).toBe('fortrinnsrett');
    expect(lesValg(new URLSearchParams('tema=tull')).tema).toBeNull();
  });

  it('skriver bare det som ikke er standard', () => {
    expect(sporringFor({ visning: 'rullende', aar: 2027, tema: null, gruppe: null })).toEqual({});
    expect(kalenderLenke('eksamen', 'laerlinger')).toBe('/kalender?tema=eksamen&vis=laerlinger');
  });
});

describe('fristene i modulene', () => {
  it('har tema i kalenderen, og lenkene finnes i appen', async () => {
    const frister = (await Promise.all(aktiveModuler.map((m) => m.frister()))).flat() as Frist[];
    expect(frister.length).toBeGreaterThan(20);
    for (const f of frister) {
      expect(temaFor(f).length, f.id).toBeGreaterThan(0);
      const funnet = await finnLenker(f.lenker);
      expect(funnet.map((l) => l.rute), f.id).toEqual(f.lenker);
    }
  });

  it('gir poster for begge skoleårene i et rullende vindu', async () => {
    const frister = (await Promise.all(aktiveModuler.map((m) => m.frister()))).flat() as Frist[];
    const poster = fristposter(frister, null, rullendeVindu('2026-10-05'), null);
    const maneder = new Set(poster.map((p) => p.maned));
    expect(maneder.has('2026-10')).toBe(true);
    expect(maneder.has('2027-08')).toBe(true);
  });
});

describe('regelverket', () => {
  it('skriver paragrafene', () => {
    expect(paragraftekst(['6-6'], 'og')).toBe('§ 6-6');
    expect(paragraftekst(['2', '6', '7', '8', '30'], 'og')).toBe('§§ 2, 6, 7, 8 og 30');
  });
});
