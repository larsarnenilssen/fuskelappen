// Saken om nyhetskilder som ikke kan hentes (etikett «nyheter», avgjørelse 085). Kjøres hver dag i arbeidsflyten
// Nyheter etter hentingen. Uten GITHUB_TOKEN skrives saken bare ut.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Nyhetskilder } from '../../src/modules/nyheter/kildeskjema.ts';
import type { Nyheter } from '../../src/modules/nyheter/skjema.ts';
import { lesFil } from '../innhold/last.ts';
import { finnAapenSak, lagGithub, utforVarsel } from '../varsel/github.ts';
import { norskDato, planleggVarsel } from '../varsel/plan.ts';
import { nyhetsvarsel } from './status.ts';

const ETIKETT = 'nyheter';
const rot = fileURLToPath(new URL('../..', import.meta.url));
const nyheter = JSON.parse(readFileSync(join(rot, 'data/nyheter/nyheter.json'), 'utf8')) as Nyheter;
const { kilder } = lesFil(rot, join(rot, 'content/nyheter/kilder.yaml')) as Nyhetskilder;
const naa = new Date().toISOString();
const idag = naa.slice(0, 10);
const token = process.env.GITHUB_TOKEN;
const gh = token ? lagGithub(token) : null;
const handlinger = planleggVarsel(
  {
    tittel: 'Nyhetskilder som ikke kan hentes',
    tekst: nyhetsvarsel(nyheter, kilder, naa),
    idag,
    paminnelseDager: 7,
    lukk: (siden) => `Alle nyhetskildene kan hentes igjen (${norskDato(idag)}). Saken ble laget ${norskDato(siden)}. Lukker den.`,
  },
  gh ? await finnAapenSak(gh, ETIKETT) : null,
);
await utforVarsel(gh, handlinger, ETIKETT, 'Nyhetskilder som ikke kan hentes');
