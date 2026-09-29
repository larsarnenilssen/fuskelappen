import { render } from 'preact';
import './styles/tokens.css';
import './styles/tema.css';
import './styles/base.css';
import { Skall } from './app/Skall.tsx';
import { startRuting } from './app/ruter.ts';
import { anvendInnstillinger, tilstand } from './app/tilstand.ts';

anvendInnstillinger(tilstand.data.innstillinger);
startRuting();

const rot = document.getElementById('app');
if (rot) render(<Skall />, rot);
