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
    expect(test).toMatchObject({ name: 'Test og bygg', if: 'always()', needs: ['endringer', 'sjekk', 'bygg-e2e', 'e2e'] });
  });
});
