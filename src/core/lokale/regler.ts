// Hvilke lokale regler som gjelder for brukeren (fase 9, avgjørelse 093). Rene funksjoner uten avhengighet til
// grensesnittet.
//
// - Brukerens egne regler gjelder når brukeren har valgt fylket (og skolen) de er lagt inn for, og datoen er innenfor
//   «gjelder fra» og «til».
// - En egen regel med samme kode som en godkjent er byttet ut med den godkjente («Din kopi er byttet ut»).
// - En egen regel som endrer en godkjent (`endrer`), gjelder for brukeren i stedet for den godkjente.
// - Egne verdier går foran godkjente, og skolen foran fylket (finnVerdi i src/core/regler/motor.ts).
import type { LokalVerdi } from '../regler/motor.ts';
import type { EgenRegel, GodkjentRegel, PublisertRegel, Tema } from './skjema.ts';

export interface Sted {
  fylke: string | null;
  skole: string | null;
}

export type Egenstatus = 'egen' | 'innmeldt' | 'godkjent' | 'utlopt';

type Stedsregel = Pick<EgenRegel, 'niva' | 'fylke' | 'skole'>;

/** Gjelder regelen for fylket og skolen brukeren har valgt? */
export function passerSted(r: Stedsregel, sted: Sted): boolean {
  if (r.fylke !== sted.fylke) return false;
  return r.niva === 'fylke' || (r.skole !== null && r.skole === sted.skole);
}

/** Er datoen innenfor «gjelder fra» og «til»? */
export function gjelderPaa(fra: string | undefined, til: string | undefined, dato: string): boolean {
  return (fra === undefined || fra <= dato) && (til === undefined || dato <= til);
}

/** Er brukerens regel byttet ut med en godkjent regel med samme kode? */
export function erErstattet(egen: Pick<EgenRegel, 'kode'>, godkjente: readonly Pick<PublisertRegel, 'kode'>[]): boolean {
  return godkjente.some((g) => g.kode === egen.kode);
}

export function egenstatus(egen: EgenRegel, godkjente: readonly Pick<PublisertRegel, 'kode'>[], dato: string): Egenstatus {
  if (erErstattet(egen, godkjente)) return 'godkjent';
  if (egen.gjelderTil !== undefined && egen.gjelderTil < dato) return 'utlopt';
  return egen.innmeldt ? 'innmeldt' : 'egen';
}

/** Brukerens egne regler som gjelder nå, for stedet brukeren har valgt. */
export function aktiveEgne(egne: readonly EgenRegel[], godkjente: readonly PublisertRegel[], sted: Sted, dato: string): EgenRegel[] {
  return egne.filter((e) => passerSted(e, sted) && gjelderPaa(e.gjelderFra, e.gjelderTil, dato) && !erErstattet(e, godkjente));
}

/** De godkjente reglene som gjelder for stedet nå, uten dem brukeren har endret for seg selv. */
export function aktiveGodkjente(godkjente: readonly PublisertRegel[], egne: readonly EgenRegel[], sted: Sted, dato: string): PublisertRegel[] {
  const endret = new Set(aktiveEgne(egne, godkjente, sted, dato).flatMap((e) => (e.endrer ? [e.endrer] : [])));
  return godkjente.filter((g) => passerSted(g, sted) && gjelderPaa(g.gjelder_fra, g.gjelder_til, dato) && !endret.has(g.kode));
}

/** De lokale verdiene til regelkonteksten (Regelkontekst.lokale): brukerens egne og de godkjente. */
export function lokaleVerdier(egne: readonly EgenRegel[], godkjente: readonly PublisertRegel[], sted: Sted, dato: string): LokalVerdi[] {
  const verdier: LokalVerdi[] = [];
  for (const e of aktiveEgne(egne, godkjente, sted, dato)) {
    if (e.type !== 'verdi' || e.nokkel === undefined || e.verdi === undefined) continue;
    verdier.push({ nokkel: e.nokkel, verdi: e.verdi, niva: e.niva, fylke: e.fylke, skole: e.skole, egen: true, kode: e.kode, kontrollert: null, stedsnavn: e.stedsnavn });
  }
  for (const g of aktiveGodkjente(godkjente, egne, sted, dato)) {
    if (g.type !== 'verdi' || g.nokkel === undefined || g.verdi === undefined) continue;
    verdier.push({
      nokkel: g.nokkel,
      verdi: g.verdi,
      niva: g.niva,
      fylke: g.fylke,
      skole: g.skole,
      egen: false,
      kode: g.kode,
      kontrollert: g.kontrollert?.dato ?? null,
      stedsnavn: g.stedsnavn,
    });
  }
  return verdier;
}

/** Reglene og verdiene på siden for et tema: de godkjente og brukerens egne, skolen før fylket. */
export function reglerForTema(tema: Tema, egne: readonly EgenRegel[], godkjente: readonly PublisertRegel[], sted: Sted, dato: string) {
  const forst = <T extends { niva: 'fylke' | 'skole' }>(a: T, b: T) => (a.niva === b.niva ? 0 : a.niva === 'skole' ? -1 : 1);
  return {
    godkjente: aktiveGodkjente(godkjente, egne, sted, dato).filter((g) => g.tema === tema).sort(forst),
    egne: aktiveEgne(egne, godkjente, sted, dato).filter((e) => e.tema === tema).sort(forst),
  };
}

/**
 * Filen appen henter (data/lokale/regler.json): bare regler eier har kontrollert, uten kontrollspørsmålene, og uten
 * regler som er erstattet av en godkjent endring.
 */
export function lagPublisert(regler: readonly GodkjentRegel[]): { regler: PublisertRegel[] } {
  const kontrollerte = regler.filter((r) => r.kontrollert !== null);
  const erstattet = new Set(kontrollerte.flatMap((r) => (r.endrer ? [r.endrer] : [])));
  return {
    regler: kontrollerte
      .filter((r) => !erstattet.has(r.kode))
      .map((r) => {
        const publisert = { ...r };
        delete publisert.kontrollsporsmal;
        return publisert;
      }),
  };
}

/**
 * Feil i lokale/regler.yaml som skjemaet ikke fanger: en verdi trenger nøkkel og tall, en regel tittel og tekst, en
 * skoleregel skolen, og kodene må være unike. `kjenteNokler` er verdiene som kan være lokale (`lokal: true` i rules/).
 */
export function finnFeil(regler: readonly GodkjentRegel[], kjenteNokler: ReadonlySet<string>): string[] {
  const feil: string[] = [];
  const koder = new Set<string>();
  for (const r of regler) {
    if (koder.has(r.kode)) feil.push(`${r.kode}: koden står to ganger`);
    koder.add(r.kode);
    if (r.type === 'verdi') {
      if (r.nokkel === undefined || r.verdi === undefined) feil.push(`${r.kode}: en verdi trenger nokkel og verdi`);
      else if (!kjenteNokler.has(r.nokkel)) feil.push(`${r.kode}: ${r.nokkel} kan ikke være lokal (mangler lokal: true i rules/)`);
    } else if (r.tittel === undefined || r.tekst === undefined) {
      feil.push(`${r.kode}: en regel trenger tittel og tekst på bokmål og nynorsk`);
    }
    if (r.niva === 'skole' && !r.skole) feil.push(`${r.kode}: en regel for en skole trenger skolens nummer`);
    if (r.niva === 'fylke' && r.skole !== null) feil.push(`${r.kode}: en regel for et fylke har skole: null`);
    if (!r.kilde.offentlig && r.kilde.url) feil.push(`${r.kode}: en kilde som ikke er offentlig, har ingen lenke`);
    if (r.kilde.offentlig && !r.kilde.url) feil.push(`${r.kode}: en offentlig kilde trenger lenke`);
    if (r.gjelder_fra && r.gjelder_til && r.gjelder_fra > r.gjelder_til) feil.push(`${r.kode}: gjelder_fra er etter gjelder_til`);
    if (r.endrer === r.kode) feil.push(`${r.kode}: en regel kan ikke endre seg selv`);
  }
  return feil;
}
