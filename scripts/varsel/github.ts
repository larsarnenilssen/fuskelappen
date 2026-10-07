// Sakene til eier på GitHub: finne den åpne saken, og opprette, oppdatere eller lukke den etter planen i plan.ts.
// Uten GITHUB_TOKEN skrives handlingene bare ut (tørrkjøring).
import type { AapenSak, Varselhandling } from './plan.ts';

export interface Github {
  kall<T>(metode: string, sti: string, kropp?: unknown): Promise<T>;
}

export function lagGithub(token: string, repo = process.env.GITHUB_REPOSITORY ?? 'larsarnenilssen/jukselappen', api = process.env.GITHUB_API_URL ?? 'https://api.github.com'): Github {
  return {
    async kall<T>(metode: string, sti: string, kropp?: unknown): Promise<T> {
      const svar = await fetch(`${api}/repos/${repo}${sti}`, {
        method: metode,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        ...(kropp === undefined ? {} : { body: JSON.stringify(kropp) }),
      });
      if (!svar.ok) throw new Error(`GitHub ${metode} ${sti}: ${svar.status} ${await svar.text()}`);
      return (svar.status === 204 ? null : await svar.json()) as T;
    },
  };
}

type Sak = { number: number; body: string | null; pull_request?: unknown };

/** Den åpne saken med etiketten, og som har `merke` i teksten når det er oppgitt. */
export async function finnAapenSak(gh: Github, etikett: string, merke?: string): Promise<AapenSak | null> {
  const saker = await gh.kall<Sak[]>('GET', `/issues?labels=${encodeURIComponent(etikett)}&state=open&per_page=100`);
  const sak = saker.find((s) => !s.pull_request && (!merke || (s.body ?? '').includes(merke)));
  return sak ? { nummer: sak.number, tekst: sak.body } : null;
}

async function sikreEtikett(gh: Github, navn: string, beskrivelse: string): Promise<void> {
  try {
    await gh.kall('GET', `/labels/${encodeURIComponent(navn)}`);
  } catch {
    await gh.kall('POST', '/labels', { name: navn, color: 'd93f0b', description: beskrivelse });
  }
}

/** Utfører handlingene. Uten gh skrives de bare ut. */
export async function utforVarsel(gh: Github | null, handlinger: readonly Varselhandling[], etikett: string, beskrivelse: string): Promise<void> {
  if (handlinger.length === 0) console.log(`Ingen sak (${etikett}): ingenting å varsle.`);
  for (const h of handlinger) {
    if (!gh) {
      console.log(`[tørrkjøring] ${h.type}${'nummer' in h ? ` #${h.nummer}` : ''}\n${'tekst' in h ? h.tekst : ''}\n${'kommentar' in h && h.kommentar ? `\nKommentar:\n${h.kommentar}` : ''}`);
      continue;
    }
    if (h.type === 'opprett') {
      await sikreEtikett(gh, etikett, beskrivelse);
      const ny = await gh.kall<{ number: number }>('POST', '/issues', { title: h.tittel, body: h.tekst, labels: [etikett] });
      console.log(`Opprettet sak #${ny.number}: ${h.tittel}`);
    } else if (h.type === 'oppdater') {
      await gh.kall('PATCH', `/issues/${h.nummer}`, { title: h.tittel, body: h.tekst });
      if (h.kommentar) await gh.kall('POST', `/issues/${h.nummer}/comments`, { body: h.kommentar });
      console.log(`Oppdaterte sak #${h.nummer}${h.kommentar ? ' med kommentar (e-post)' : ' uten kommentar'}.`);
    } else {
      await gh.kall('POST', `/issues/${h.nummer}/comments`, { body: h.kommentar });
      await gh.kall('PATCH', `/issues/${h.nummer}`, { state: 'closed', state_reason: 'completed' });
      console.log(`Lukket sak #${h.nummer}.`);
    }
  }
}
