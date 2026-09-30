// Godkjenning med avkrysning og /godkjent (avgjørelse 021).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import {
  avkryssede,
  kommandoIder,
  settBekreftet,
  settFingeravtrykk,
  settKontrollertInnhold,
  settKontrollertVerdi,
} from '../../scripts/kilder/godkjenning.ts';

const les = (sti: string) => readFileSync(join(__dirname, '../..', sti), 'utf8');

describe('godkjenning fra en kontrollsak', () => {
  it('leser bare punktene som er krysset av, og hopper over tallforslag og Grep', () => {
    const sak = [
      '- [x] Jeg har sett på endringene i SFS 2213, og det nye fingeravtrykket kan godkjennes. <!-- godkjenn-kilde:ks-sfs2213-avtaletekst:sha256:abc -->',
      '- [ ] Ikke krysset av <!-- godkjenn-kilde:arbeidsmiljoloven:sha256:def -->',
      '- [X] **Lønn i brutte måneder:** Stemmer det? <!-- praksis:lonn-brutte-maneder -->',
      '- [x] «Årsverk» (begrep): kontrollert for mer enn 12 måneder siden. <!-- kontroll:innhold:arsverk -->',
      '- [x] Regelverdien `s/a`: kilden er endret. <!-- kontroll:verdi:sfs2213-2026-2027/arsverk_timer -->',
      '- [x] `s/a`: Kilden har nå 10. <!-- verdi:s/a:10 -->',
      '- [x] Grep <!-- grep:udir-grep:sha256:x -->',
    ].join('\n');
    expect(avkryssede(sak)).toEqual([
      { type: 'kilde', id: 'ks-sfs2213-avtaletekst', fingeravtrykk: 'sha256:abc' },
      { type: 'praksis', id: 'lonn-brutte-maneder' },
      { type: 'innhold', id: 'arsverk' },
      { type: 'verdi', id: 'sfs2213-2026-2027/arsverk_timer' },
    ]);
  });

  it('leser id-ene etter /godkjent', () => {
    expect(kommandoIder('/godkjent arsverk, `planleggingsdager` hta-2026-2028/feriepenger_prosent')).toEqual(['arsverk', 'planleggingsdager', 'hta-2026-2028/feriepenger_prosent']);
    expect(kommandoIder('/godkjent')).toEqual([]);
    expect(kommandoIder('Takk!')).toEqual([]);
  });

  it('setter kontrollert for et begrep uten å røre de andre', () => {
    const fil = les('content/begreper/arbeidstid.yaml');
    const ny = settKontrollertInnhold(fil, 'arsverk', '2026-10-05');
    const data = parse(ny ?? '') as { id: string; kontrollert: unknown }[];
    expect(data.find((e) => e.id === 'arsverk')?.kontrollert).toEqual({ dato: '2026-10-05' });
    expect(data.filter((e) => e.kontrollert !== null)).toHaveLength(1);
    expect(settKontrollertInnhold(fil, 'finnes-ikke', '2026-10-05')).toBeNull();
  });

  it('setter kontrollert for en regelverdi', () => {
    const ny = settKontrollertVerdi(les('rules/hta/2026-2028.yaml'), 'feriepenger_prosent', '2026-10-05');
    const data = parse(ny ?? '') as { verdier: Record<string, { kontrollert: unknown }> };
    expect(data.verdier.feriepenger_prosent?.kontrollert).toEqual({ dato: '2026-10-05' });
    expect(data.verdier.feriepenger_prosent_over_60?.kontrollert).toBeNull();
  });

  it('setter bekreftet for en praksis', () => {
    const ny = settBekreftet(les('content/kontroll/praksis.yaml'), 'periodenokkel', '2026-10-05');
    const data = parse(ny ?? '') as { praksis: { id: string; bekreftet: unknown }[] };
    expect(data.praksis.find((p) => p.id === 'periodenokkel')?.bekreftet).toEqual({ dato: '2026-10-05' });
    expect(data.praksis.filter((p) => p.bekreftet !== null)).toHaveLength(1);
  });

  it('setter nytt fingeravtrykk med kommentar om hvem og når', () => {
    const fil = les('content/kilder.yaml');
    const fp = `sha256:${'a'.repeat(64)}`;
    const ny = settFingeravtrykk(fil, 'ks-hovedtariffavtalen', fp, '2026-10-05', '42') ?? '';
    const data = parse(ny) as { kilder: { id: string; godkjent_fingeravtrykk: string | null }[] };
    expect(data.kilder.find((k) => k.id === 'ks-hovedtariffavtalen')?.godkjent_fingeravtrykk).toBe(fp);
    expect(ny).toContain(`    # Godkjent av eier 2026-10-05 (sak #42).\n    godkjent_fingeravtrykk: ${fp}`);
    expect(ny.split('\n').length).toBe(fil.split('\n').length);
    expect(data.kilder.find((k) => k.id === 'ks-sfs2213')?.godkjent_fingeravtrykk).toMatch(/^sha256:7b5f/);
  });
});
