// Appens navn og metadata. Dette er eneste sted navnet defineres.
// Manifest, sidetittel og README henter verdiene herfra.

export const app = {
  navn: 'Protokollen',
  kortnavn: 'Protokollen',
  beskrivelse: {
    nb: 'Regelverk for lærerstillinger og skolens drift i videregående opplæring – regnet ut, forklart og med kilder.',
    nn: 'Regelverk for lærarstillingar og drifta av skulen i vidaregåande opplæring – rekna ut, forklart og med kjelder.',
  },
  repo: 'https://github.com/larsarnenilssen/protokollen',
  // Stien appen publiseres under på GitHub Pages.
  base: '/protokollen/',
} as const;
