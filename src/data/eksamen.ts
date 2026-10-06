// Eksamensdatoene fra udir.no og fylkenes sider (data/eksamen/datoer.json), hentet i januar og august av
// scripts/hent-eksamen.ts (fase 6, pakke 3, avgjørelse 059). Se src/data/README.md.
import type { Eksamensdatoer } from '../modules/eksamen/eksamensdatoer/skjema.ts';
import { enGang } from './enGang.ts';

export const lastEksamensdatoer = enGang(() => import('../../data/eksamen/datoer.json').then((m) => m.default as unknown as Eksamensdatoer));
