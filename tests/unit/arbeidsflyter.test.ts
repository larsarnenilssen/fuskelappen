// Arbeidsflytene i .github/workflows: det som må stemme med resten av repoet.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const rot = join(__dirname, '../..');

describe('arbeidsflyter', () => {
  it('CI bruker Playwright-bildet med samme versjon som @playwright/test', () => {
    const lock = JSON.parse(readFileSync(join(rot, 'package-lock.json'), 'utf8')) as { packages: Record<string, { version?: string }> };
    const versjon = lock.packages['node_modules/@playwright/test']?.version;
    const ci = readFileSync(join(rot, '.github/workflows/ci.yml'), 'utf8');
    expect(ci).toContain(`image: mcr.microsoft.com/playwright:v${versjon}-noble`);
  });

  it('versjonstaggen settes når package.json endres på main, og publiseringen kalles med taggen (avgjørelse 029)', () => {
    const fil = (navn: string) => parse(readFileSync(join(rot, '.github/workflows', navn), 'utf8')) as Record<string, unknown>;
    const tag = fil('versjonstag.yml') as { on: { push: { branches: string[]; paths: string[] } }; jobs: { publiser: { uses: string; with: { tag: string } } } };
    expect(tag.on.push.branches).toEqual(['main']);
    expect(tag.on.push.paths).toContain('package.json');
    expect(tag.jobs.publiser.uses).toBe('./.github/workflows/deploy.yml');
    expect(tag.jobs.publiser.with.tag).toContain('needs.tag.outputs.tag');
    const deploy = fil('deploy.yml') as { on: { workflow_call: { inputs: { tag: unknown } } } };
    expect(deploy.on.workflow_call.inputs.tag).toBeDefined();
  });

  it('publiseringen bygger når den kalles fra et push til main, og videresender bare ved push av en tag', () => {
    // I en kalt arbeidsflyt er github.event_name den kallende arbeidsflytens hendelse (push til main).
    const deploy = parse(readFileSync(join(rot, '.github/workflows/deploy.yml'), 'utf8')) as {
      jobs: { videresend: { if: string }; bygg: { if: string } };
    };
    expect(deploy.jobs.videresend.if).toContain("github.ref_type == 'tag'");
    expect(deploy.jobs.bygg.if).toContain("github.ref_type != 'tag'");
  });

  it('en versjon publiseres uten testversjonen, og grenen test slettes etterpå (avgjørelse 095)', () => {
    type Steg = { id?: string; run?: string; env?: Record<string, string> };
    type Jobb = { needs?: string[]; if?: string; outputs?: Record<string, string>; permissions?: Record<string, string>; steps: Steg[] };
    const fil = (navn: string) => parse(readFileSync(join(rot, '.github/workflows', navn), 'utf8')) as { on: Record<string, unknown>; jobs: Record<string, Jobb> };
    const deploy = fil('deploy.yml');
    const test = deploy.jobs.bygg?.steps.find((s) => s.id === 'test');
    expect(test?.env?.ONSKET).toBe('${{ inputs.tag }}');
    expect(test?.run?.indexOf('if [ -n "$ONSKET" ]')).toBeLessThan(test?.run?.indexOf('npm run build:test') ?? -1);
    expect(deploy.jobs.bygg?.outputs?.ta_ned_test).toBe('${{ steps.test.outputs.ta_ned }}');
    expect(deploy.jobs['ta-ned-test']).toMatchObject({ needs: ['bygg', 'publiser'], if: "needs.bygg.outputs.ta_ned_test == 'true'", permissions: { actions: 'write' } });
    expect(deploy.jobs['ta-ned-test']?.steps[0]?.run).toContain('testversjon.yml --repo "$GITHUB_REPOSITORY" --ref main -f ta_ned=true');
    const testversjon = fil('testversjon.yml');
    expect(testversjon.on.workflow_dispatch).toMatchObject({ inputs: { ta_ned: { type: 'boolean', default: false } } });
    expect(testversjon.jobs.publiser?.if).toBe('${{ !inputs.ta_ned }}');
    expect(testversjon.jobs['ta-ned']).toMatchObject({ if: '${{ inputs.ta_ned }}', permissions: { contents: 'write' } });
    expect(testversjon.jobs['ta-ned']?.steps[0]?.run).toContain('git/refs/heads/test');
  });

  it('CI hopper over jobbene på jobbnivå etter nivået, og «Test og bygg» samler alle (avgjørelse 067)', () => {
    type Jobb = { name?: string; needs?: string | string[]; if?: string; outputs?: Record<string, string>; steps?: { run?: string }[] };
    const ci = parse(readFileSync(join(rot, '.github/workflows/ci.yml'), 'utf8')) as { on: Record<string, unknown>; jobs: Record<string, Jobb> };
    expect(Object.keys(ci.on).sort()).toEqual(['pull_request', 'push', 'workflow_dispatch']);
    const { endringer, sjekk, 'bygg-e2e': bygg, e2e, test } = ci.jobs;
    expect(endringer?.outputs?.nivaa).toContain('steps.nivaa.outputs.nivaa');
    expect(endringer?.steps?.some((s) => s.run?.includes('scripts/ci/endringer.ts'))).toBe(true);
    expect(sjekk).toMatchObject({ needs: 'endringer', if: "needs.endringer.outputs.nivaa != 'ingen'" });
    expect(bygg).toMatchObject({ needs: 'endringer', if: "needs.endringer.outputs.nivaa == 'alt'" });
    expect(e2e?.needs).toBe('bygg-e2e');
    // Ikke always(): en kjøring som avbrytes av en nyere push, skal ikke gi «Test og bygg» rødt og varsel til eier.
    expect(test).toMatchObject({ name: 'Test og bygg', if: '${{ !cancelled() }}', needs: ['endringer', 'sjekk', 'bygg-e2e', 'e2e'] });
    expect(ci.jobs.varsle?.if).toContain("needs.test.result != 'skipped'");
  });

  it('publiseringen tar alle datamappene kildesjekken lagrer på main, og kildesjekken tester dem først (avgjørelse 098)', () => {
    type Steg = { name?: string; run?: string; env?: Record<string, string> };
    type Jobb = { env?: Record<string, string>; steps: Steg[] };
    const fil = (navn: string) => parse(readFileSync(join(rot, '.github/workflows', navn), 'utf8')) as { jobs: Record<string, Jobb> };
    const kilder = fil('kilder.yml').jobs.sjekk?.steps ?? [];
    const lagre = kilder.find((s) => s.name === 'Lagre kildestatus')?.run ?? '';
    // Datamappene som legges til i commiten, uten statusfilene (kildestatus.json hentes for seg).
    const lagret = new Set([...lagre.matchAll(/\bdata\/([a-z]+)/g)].map((m) => m[1]).filter((m) => m !== 'status'));
    const fraMain = (fil('deploy.yml').jobs.bygg?.env?.DATA_FRA_MAIN ?? '').split(' ');
    expect(lagret.size).toBeGreaterThan(10);
    for (const m of lagret) expect(fraMain, m).toContain(`data/${m}`);
    expect(fraMain).toContain('lokale');
    expect(fraMain).not.toContain('data/nyheter');
    // Alt som hentes i steget for Grep, testes før det lagres. Skoleregisteret hentes av kildesjekken og testes for seg.
    const hentet = (kilder.find((s) => s.name === 'Test de nye dataene')?.env?.HENTET ?? '').split(' ');
    for (const m of lagret) if (m !== 'skoler') expect(hentet, m).toContain(`data/${m}`);
    expect(kilder.find((s) => s.name === 'Test skoleregisteret')?.run).toContain('npx vitest run');
    expect(lagre).not.toContain('data/nyheter');
  });

  it('nyhetene lagres på grenen nyheter, ikke på main, og publiseres bare når sakene er endret (avgjørelse 098)', () => {
    const nyheter = readFileSync(join(rot, '.github/workflows/nyheter.yml'), 'utf8');
    expect(nyheter).toContain('refs/heads/nyheter');
    expect(nyheter).not.toContain('git add');
    expect(nyheter).toContain("if: needs.hent.outputs.nye_saker == 'ja'");
    const deploy = readFileSync(join(rot, '.github/workflows/deploy.yml'), 'utf8');
    expect(deploy).toContain('origin nyheter');
    expect(readFileSync(join(rot, '.gitignore'), 'utf8')).toContain('data/nyheter/');
  });

  it('publiseringen har røyktest og varsler selv når den er startet for seg (avgjørelse 099)', () => {
    type Steg = { id?: string; name?: string; uses?: string; run?: string };
    type Jobb = { needs?: string | string[]; if?: string; uses?: string; permissions?: Record<string, string>; steps?: Steg[] };
    const fil = (navn: string) => parse(readFileSync(join(rot, '.github/workflows', navn), 'utf8')) as { jobs: Record<string, Jobb> };
    const deploy = fil('deploy.yml');
    const steg = deploy.jobs.publiser?.steps ?? [];
    expect(steg[0]?.uses).toMatch(/^actions\/deploy-pages@/);
    expect(steg.at(-1)?.name).toBe('Sjekk at den nye utgaven er ute');
    expect(steg.at(-1)?.run).toContain('$INDEKS');
    expect(deploy.jobs.varsle).toMatchObject({ uses: './.github/workflows/varsle.yml', permissions: { issues: 'write' } });
    expect(deploy.jobs.varsle?.if).toContain("github.workflow == 'Publiser'");
    // De som kaller publiseringen, må gi varseljobben der lov til å skrive saker, ellers starter ikke kjøringen.
    for (const navn of ['kilder.yml', 'nyheter.yml', 'lokale-regler.yml', 'versjonstag.yml']) {
      const kall = Object.values(fil(navn).jobs).filter((j) => j.uses === './.github/workflows/deploy.yml');
      expect(kall.length, navn).toBeGreaterThan(0);
      for (const j of kall) expect(j.permissions?.issues, navn).toBe('write');
    }
  });

  it('oppetiden sjekkes hver time, og eier varsles først etter to feil på rad (avgjørelse 099)', () => {
    type Jobb = { name?: string; with?: Record<string, string>; steps?: { id?: string; 'continue-on-error'?: boolean; run?: string }[] };
    const nyheter = parse(readFileSync(join(rot, '.github/workflows/nyheter.yml'), 'utf8')) as { on: { schedule: { cron: string }[] }; jobs: Record<string, Jobb> };
    expect(nyheter.on.schedule[0]?.cron).toBe('47 * * * *');
    const sjekk = nyheter.jobs.oppe?.steps?.find((s) => s.id === 'sjekk');
    expect(sjekk?.['continue-on-error']).toBe(true);
    expect(sjekk?.run).toContain('sleep 600');
    expect(nyheter.jobs['varsle-oppetid']?.with).toMatchObject({ navn: 'Oppetid', jobber: nyheter.jobs.oppe?.name });
  });

  it('Dependabot og Node holdes oppdatert (avgjørelse 099)', () => {
    type Oppdatering = { 'package-ecosystem': string; schedule: { interval: string }; groups: Record<string, unknown> };
    const dependabot = parse(readFileSync(join(rot, '.github/dependabot.yml'), 'utf8')) as { updates: Oppdatering[] };
    expect(dependabot.updates.map((u) => u['package-ecosystem']).sort()).toEqual(['github-actions', 'npm']);
    for (const u of dependabot.updates) expect(u.schedule.interval).toBe('monthly');
    expect(Object.keys(dependabot.updates.find((u) => u['package-ecosystem'] === 'npm')?.groups ?? {}).sort()).toEqual(['npm-produksjon', 'npm-utvikling']);
    const node = readFileSync(join(rot, '.nvmrc'), 'utf8').trim();
    const pakke = JSON.parse(readFileSync(join(rot, 'package.json'), 'utf8')) as { engines: { node: string } };
    expect(pakke.engines.node).toBe(`>=${node}`);
  });
});
