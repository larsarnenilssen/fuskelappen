// Alle ruter: appens egne sider og rutene fra modulregisteret.
import type { ComponentType } from 'preact';
import type { Tekstverdi } from '../core/i18n/tekst.ts';
import { alleRuter } from '../modules/register.ts';
import type { SideProps } from '../modules/typer.ts';
import Forside from './sider/Forside.tsx';

export interface Rute {
  sti: string;
  tittel: Tekstverdi;
  side: () => Promise<{ default: ComponentType<SideProps> }>;
  modul?: string;
}

const kjerne: Rute[] = [
  { sti: '/', tittel: 'forside.tittel', side: () => Promise.resolve({ default: Forside }) },
  { sti: '/sok', tittel: 'sok.tittel', side: () => import('./sider/Sok.tsx') },
  { sti: '/favoritter', tittel: 'favoritter.tittel', side: () => import('./sider/Favoritter.tsx') },
  { sti: '/innstillinger', tittel: 'innstillinger.tittel', side: () => import('./sider/Innstillinger.tsx') },
  { sti: '/om', tittel: 'om.tittel', side: () => import('./sider/Om.tsx') },
  { sti: '/om/kilder', tittel: 'kildestatus.tittel', side: () => import('./sider/Kilder.tsx') },
  { sti: '/kategori/:id', tittel: 'forside.moduler', side: () => import('./sider/Kategori.tsx') },
];

// Fjernes helt fra produksjonsbygget.
const utviklingsruter: Rute[] =
  import.meta.env.MODE !== 'production'
  ? [{ sti: '/utvikling/komponenter', tittel: 'utvikling.tittel', side: () => import('./sider/Komponentkatalog.tsx') }]
  : [];

export const ruter: readonly Rute[] = [
  ...kjerne,
  ...utviklingsruter,
  ...alleRuter().map(({ modul, rute }) => ({ ...rute, modul: modul.id })),
];

/** Faste stier som finnes uavhengig av moduler. Brukes også i testene. */
export const kjernestier = kjerne.map((r) => r.sti);
