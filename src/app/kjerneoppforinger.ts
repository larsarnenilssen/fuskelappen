// Søkeoppføringer for appens egne sider (innstillinger, om, kilder, favoritter).
import { app } from '../config/app.ts';
import { begge, hentTekst } from '../core/i18n/tekst.ts';
import type { Sokeoppforing } from '../core/sok/sok.ts';

export function kjerneoppforinger(): Sokeoppforing[] {
  return [
    {
      id: 'side:innstillinger',
      type: 'side',
      tittel: begge('innstillinger.tittel'),
      tekst: begge('innstillinger.sted.forklaring'),
      stikkord: ['målform', 'bokmål', 'nynorsk', 'tema', 'mørk', 'lys', 'fylke', 'skole', 'eksport', 'import'],
      rute: '/innstillinger',
      modul: 'app',
    },
    {
      id: 'side:om',
      type: 'side',
      tittel: begge('om.tittel'),
      tekst: { nb: hentTekst('nb', 'om.innledning', { app: app.navn }), nn: hentTekst('nn', 'om.innledning', { app: app.navn }) },
      stikkord: ['personvern', 'kreditering', 'versjon', 'ansvar', 'NLOD'],
      rute: '/om',
      modul: 'app',
    },
    {
      id: 'side:kilder',
      type: 'side',
      tittel: begge('kildestatus.tittel'),
      tekst: begge('kildestatus.forklaring'),
      stikkord: ['kilder', 'kildestatus', 'lovdata', 'udir', 'ks'],
      rute: '/om/kilder',
      modul: 'app',
    },
    {
      id: 'side:favoritter',
      type: 'side',
      tittel: begge('favoritter.tittel'),
      rute: '/favoritter',
      modul: 'app',
    },
  ];
}
