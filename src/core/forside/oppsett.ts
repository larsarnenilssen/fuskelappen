// Plasseringen av gruppene på forsiden når de står i to eller tre spalter (eier 10.10.2026, avgjørelse 108). Ren
// logikk: Forside.tsx måler gruppene og setter plassene. Testes i tests/unit/forsideoppsett.test.ts.

export interface Gruppeboks {
  /** Høyden med luften under, i hele piksler. */
  hoyde: number;
  lukket: boolean;
}

export interface Gruppeplass {
  /** Spalten, fra 0. */
  spalte: number;
  /** Avstanden fra toppen, i piksler. */
  topp: number;
}

/**
 * Gruppene står i rader, i rekkefølgen fra «Tilpass», så overskriftene i en rad står på linje. Er det luft under en
 * gruppe fordi en nabo i raden er høyere, rykker de neste lukkede gruppene opp i luften, i spalten som slutter høyest,
 * så lenge de får plass før raden slutter. En åpen gruppe, eller en lukket som ikke får plass, starter en ny rad under
 * den høyeste gruppen, med overskriften på linje med naboene sine. `slingring` er hvor mye en lukket gruppe kan gå
 * forbi slutten av raden og likevel rykke opp.
 */
export function plasserGrupper(bokser: readonly Gruppeboks[], spalter: number, slingring = 0): Gruppeplass[] {
  const plasser: Gruppeplass[] = [];
  let radTopp = 0;
  // Bunnen i hver spalte som er tatt i bruk i raden.
  let bunner: number[] = [];
  for (const boks of bokser) {
    if (bunner.length < Math.max(1, spalter)) {
      plasser.push({ spalte: bunner.length, topp: radTopp });
      bunner.push(radTopp + boks.hoyde);
      continue;
    }
    const radBunn = Math.max(...bunner);
    if (boks.lukket) {
      const lavest = Math.min(...bunner);
      const spalte = bunner.indexOf(lavest);
      if (lavest + boks.hoyde <= radBunn + slingring) {
        plasser.push({ spalte, topp: lavest });
        bunner[spalte] = lavest + boks.hoyde;
        continue;
      }
    }
    radTopp = radBunn;
    plasser.push({ spalte: 0, topp: radTopp });
    bunner = [radTopp + boks.hoyde];
  }
  return plasser;
}
