// Appens navn og metadata. Dette er eneste sted navnet defineres.
// Manifest, sidetittel og README henter verdiene herfra.

export const app = {
  navn: 'Jukselappen',
  kortnavn: 'Jukselappen',
  // Navnet på testversjonen under test/ (avgjørelse 045).
  testnavn: 'Jukselappen test',
  beskrivelse: {
    nb: 'Regelverk for lærerstillinger og skolens drift i videregående opplæring – regnet ut, forklart og med kilder.',
    nn: 'Regelverk for lærarstillingar og drifta av skulen i vidaregåande opplæring – rekna ut, forklart og med kjelder.',
  },
  repo: 'https://github.com/larsarnenilssen/jukselappen',
  // Stien appen publiseres under på GitHub Pages. I GitHub Actions brukes navnet på repoet (avgjørelse 058).
  base: '/jukselappen/',
  // Når kildesjekken kjører (UTC). Må stemme med cron i .github/workflows/kilder.yml; det sjekkes av en test.
  kildesjekk: { ukedag: 1, time: 4, minutt: 17 },
  // Der eier kan starte kildesjekken med en gang.
  kildesjekkUrl: 'https://github.com/larsarnenilssen/jukselappen/actions/workflows/kilder.yml',
} as const;
