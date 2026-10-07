// Felles oppsett for Vitest: begge tekstbitene lastes før testene, som i søkeindeksen (avgjørelse 083).
import { lastAlleTekster } from '../src/core/i18n/tekst.ts';

await lastAlleTekster();
