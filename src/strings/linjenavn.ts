// Linjenavnene i rundskrivet om fag- og timefordeling (Udir-1) på nynorsk, og utskrevne forkortelser på bokmål
// (eier 02.10.2026). Rundskrivet finnes bare på bokmål. Nøkkelen er teksten i rundskrivet.
// Et navn som ikke står her, vises som i rundskrivet, og kildesjekken melder det i kontrollsaken.
export const LINJENAVN: Readonly<Record<string, { nb?: string; nn: string }>> = {
  'Opplæring i bedrift': { nn: 'Opplæring i bedrift' },
  'Norsk/norsk for elever med samisk/norsk for elever med tegnspråk': { nn: 'Norsk/norsk for elevar med samisk/norsk for elevar med teiknspråk' },
  Norsk: { nn: 'Norsk' },
  'Norsk tegnspråk': { nn: 'Norsk teiknspråk' },
  'Norsk for elever med tegnspråk': { nn: 'Norsk for elevar med teiknspråk' },
  'Førstespråk samisk/norsk': { nn: 'Førstespråk samisk/norsk' },
  'Førstespråk samisk/andrespråk samisk, kvensk eller finsk': { nn: 'Førstespråk samisk/andrespråk samisk, kvensk eller finsk' },
  'Andrespråk norsk/samisk/kvensk/finsk': { nn: 'Andrespråk norsk/samisk/kvensk/finsk' },
  Matematikk: { nn: 'Matematikk' },
  Naturfag: { nn: 'Naturfag' },
  Engelsk: { nn: 'Engelsk' },
  Fremmedspråk: { nn: 'Framandspråk' },
  Geografi: { nn: 'Geografi' },
  Historie: { nn: 'Historie' },
  'Religion og etikk': { nn: 'Religion og etikk' },
  Samfunnskunnskap: { nn: 'Samfunnskunnskap' },
  Kroppsøving: { nn: 'Kroppsøving' },
  'Felles programfag fra eget programområde': { nn: 'Felles programfag frå eige programområde' },
  'Felles programfag fra eget utdanningsprogram': { nn: 'Felles programfag frå eige utdanningsprogram' },
  'Yrkesfaglig fordypning': { nn: 'Yrkesfagleg fordjuping' },
  'Yrkesfaglig opphenting': { nn: 'Yrkesfagleg opphenting' },
  'Programfag fra eget programområde (fordypning)': { nn: 'Programfag frå eige programområde (fordjuping)' },
  'Programfag fra studieforberedende utdanningsprogram': { nn: 'Programfag frå studieførebuande utdanningsprogram' },
  'Programfag fra studieforb. utdanningsprogram': { nb: 'Programfag fra studieforberedende utdanningsprogram', nn: 'Programfag frå studieførebuande utdanningsprogram' },
  'Programfag fra studief. eller yrkesf. utdanningsprogram': {
    nb: 'Programfag fra studieforberedende eller yrkesfaglige utdanningsprogram',
    nn: 'Programfag frå studieførebuande eller yrkesfaglege utdanningsprogram',
  },
  'Programfag fra eget programområde eller studieforberedende utdanningsprogram': { nn: 'Programfag frå eige programområde eller studieførebuande utdanningsprogram' },
};
