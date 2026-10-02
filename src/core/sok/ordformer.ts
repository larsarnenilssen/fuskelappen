// Ordformer for søk i tekst som står på én målform, som lov og forskrift (avgjørelse 039). Et søk på bokmål skal finne
// nynorsk tekst og omvendt, så hvert ord i søket gjøres om til noen få former som letes etter i teksten:
// - parene i content/sok/synonymer.yaml begge veier («skole» → «skule», «ikkje» → «ikke»)
// - vanlige endelser byttet («personlig» ↔ «personleg», «rettighet» ↔ «rettigheit», «krenkelse» ↔ «krenking»)
// - stammen uten bøyningsendelse («opplæringen» → «opplæring», som også står i «opplæringa»)
// Et ord passer når en av formene står i teksten. Det gir noen ekstra treff, men sjelden at noe viktig mangler.
import type { Synonymer } from '../innhold/skjema.ts';

/** Bøyningsendelser som tas bort, lengste først. Bare fra ord på minst seks bokstaver, og stammen blir minst fire. */
const ENDELSER = ['ingane', 'ingar', 'ane', 'ene', 'ar', 'er', 'en', 'et', 'a', 'e', 't', 'd'];

/** Endelser som skrives ulikt på bokmål og nynorsk. Byttes begge veier. */
const BYTT: readonly (readonly [string, string])[] = [
  ['lige', 'lege'],
  ['lig', 'leg'],
  ['het', 'heit'],
  ['else', 'ing'],
];

function stamme(ord: string): string {
  if (ord.length < 6) return ord;
  const endelse = ENDELSER.find((e) => ord.endsWith(e) && ord.length - e.length >= 4);
  return endelse ? ord.slice(0, -endelse.length) : ord;
}

function byttEndelser(ord: string): string[] {
  const ut = [ord];
  for (const [a, b] of BYTT) {
    if (ord.endsWith(a)) ut.push(ord.slice(0, -a.length) + b);
    else if (ord.endsWith(b)) ut.push(ord.slice(0, -b.length) + a);
  }
  return ut;
}

/** Lager en funksjon som gir formene et ord i søket skal letes etter med, i små bokstaver. */
export function lagOrdformer(synonymer: Synonymer): (ord: string) => string[] {
  const par = synonymer.grupper.flatMap((g) => g.varianter.map((v) => [v.toLowerCase(), g.kanonisk.toLowerCase()] as const));
  return (ord) => {
    const o = ord.toLowerCase();
    const former = new Set([o]);
    for (const [variant, kanonisk] of par) {
      if (o.includes(kanonisk)) former.add(o.split(kanonisk).join(variant));
      if (o.includes(variant)) former.add(o.split(variant).join(kanonisk));
    }
    const ut = new Set<string>();
    for (const f of [...former].flatMap(byttEndelser)) {
      for (const s of byttEndelser(stamme(f))) ut.add(s);
    }
    // Lengste først, så utdraget markerer så mye av ordet som mulig.
    return [...ut].sort((a, b) => b.length - a.length);
  };
}
