// Temaene og gruppene i kalenderen (fase 6, pakke 5, avgjørelse 066). Egen fil uten zod, så adressene til kalenderen
// kan brukes i startpakken.

/** Temaene i kalenderen. Rekkefølgen er rekkefølgen i filteret. */
export const KALENDERTEMAER = ['inntak', 'vurdering', 'eksamen', 'skolerute', 'regelverk'] as const;
export type Kalendertema = (typeof KALENDERTEMAER)[number];

/** Hvem en frist gjelder. Felles for alle modulene, så kalenderen kan filtrere på tvers. */
export const FRISTGRUPPER = ['elever', 'privatister', 'laerlinger', 'voksne', 'fortrinnsrett'] as const;
export type Fristgruppe = (typeof FRISTGRUPPER)[number];
