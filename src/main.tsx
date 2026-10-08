import { render } from 'preact';
import './styles/tokens.css';
import './styles/tema.css';
import './styles/base.css';
import { Skall } from './app/Skall.tsx';
import { startRuting } from './app/ruter.ts';
import { anvendInnstillinger, tilstand } from './app/tilstand.ts';
import { lastTekster } from './core/i18n/tekst.ts';

anvendInnstillinger(tilstand.data.innstillinger);
startRuting();
// Skissen til designløftet (fase 8b) finnes ikke i produksjonsbygget.
if (import.meta.env.MODE !== 'production' || __TESTVERSJON__) void import('./app/designskisse.ts').then((m) => m.startDesignskisse());

// Bare tekstene for målformen brukeren har valgt, lastes ved oppstart (avgjørelse 083). Feiler lastingen, vises appen
// likevel, med nøklene der tekstene skulle stått, så brukeren kan laste på nytt.
const rot = document.getElementById('app');
const vis = () => {
  if (rot) render(<Skall />, rot);
};
lastTekster(tilstand.data.innstillinger.malform).then(vis, vis);
