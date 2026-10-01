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
});
