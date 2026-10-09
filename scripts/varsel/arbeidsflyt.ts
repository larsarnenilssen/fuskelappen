// Varsel når en arbeidsflyt feiler (avgjørelse 085). Kjøres av .github/workflows/varsle.yml som siste jobb i
// arbeidsflytene som går av seg selv. Feilet kjøringen, lages eller oppdateres saken for arbeidsflyten (etikett
// «feil») etter regelen i plan.ts. Gikk den bra, lukkes saken. Kjøres med Node uten npm ci:
//   node --experimental-strip-types scripts/varsel/arbeidsflyt.ts
// Miljø: RESULTAT (feilet eller ok), DELFEIL (steg som feilet uten å stoppe kjøringen, skilt med |), ARBEIDSFLYT,
// JOBBER (bare disse jobbene, skilt med |; tom for alle), GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_RUN_NUMBER,
// GITHUB_SERVER_URL, GITHUB_API_URL.
import { arbeidsflytmerke, type Feiletjobb, feiltekst, feiltittel, loggutdrag } from './feil.ts';
import { finnAapenSak, lagGithub, utforVarsel } from './github.ts';
import { norskDato, planleggVarsel } from './plan.ts';

const ETIKETT = 'feil';
const env = process.env;
const navn = env.ARBEIDSFLYT ?? 'ukjent';
const repo = env.GITHUB_REPOSITORY ?? 'larsarnenilssen/jukselappen';
const api = env.GITHUB_API_URL ?? 'https://api.github.com';
const server = env.GITHUB_SERVER_URL ?? 'https://github.com';
const kjoring = { nummer: env.GITHUB_RUN_NUMBER ?? '?', url: `${server}/${repo}/actions/runs/${env.GITHUB_RUN_ID ?? ''}`, dato: new Date().toISOString().slice(0, 10) };
const token = env.GITHUB_TOKEN;
const gh = token ? lagGithub(token, repo, api) : null;

interface Jobb {
  id: number;
  name: string;
  conclusion: string | null;
  html_url: string;
  steps?: { name: string; conclusion: string | null }[];
}

/** Loggen for en jobb. GitHub sender videre til en adresse som ikke skal ha token, og fetch fjerner det selv. */
async function logg(id: number): Promise<string | null> {
  try {
    const svar = await fetch(`${api}/repos/${repo}/actions/jobs/${id}/logs`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
    return svar.ok ? await svar.text() : null;
  } catch {
    return null;
  }
}

async function feiledeJobber(): Promise<Feiletjobb[]> {
  if (!gh || !env.GITHUB_RUN_ID) return [];
  const { jobs } = await gh.kall<{ jobs: Jobb[] }>('GET', `/actions/runs/${env.GITHUB_RUN_ID}/jobs?per_page=100`);
  const delfeil = new Set((env.DELFEIL ?? '').split('|').filter(Boolean));
  const bare = new Set((env.JOBBER ?? '').split('|').filter(Boolean));
  const feilet = jobs.filter((j) => (bare.size === 0 || bare.has(j.name)) && (j.conclusion === 'failure' || (j.steps ?? []).some((s) => delfeil.has(s.name))));
  return Promise.all(
    feilet.map(async (j) => {
      const tekst = await logg(j.id);
      const steg = (j.steps ?? []).filter((s) => s.conclusion === 'failure' || delfeil.has(s.name)).map((s) => s.name);
      return {
        navn: j.name,
        steg: [...new Set(steg)].map((s) => ({ navn: s, fortsatte: delfeil.has(s) })),
        url: j.html_url,
        utdrag: tekst ? loggutdrag(tekst) : null,
      };
    }),
  );
}

const feilet = env.RESULTAT === 'feilet';
const tekst = feilet ? feiltekst(navn, kjoring, await feiledeJobber(), `${server}/${repo}/actions`) : null;
const handlinger = planleggVarsel(
  {
    tittel: feiltittel(navn),
    tekst,
    idag: kjoring.dato,
    paminnelseDager: 7,
    lukk: (siden) => `Arbeidsflyten ${navn} gikk bra igjen ${norskDato(kjoring.dato)} ([kjøring ${kjoring.nummer}](${kjoring.url})). Feilen ble meldt ${norskDato(siden)}. Lukker saken.`,
  },
  gh ? await finnAapenSak(gh, ETIKETT, arbeidsflytmerke(navn)) : null,
);
await utforVarsel(gh, handlinger, ETIKETT, 'En arbeidsflyt har feilet');
