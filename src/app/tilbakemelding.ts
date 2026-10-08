// Tilbakemelding på e-post (eier 05.10.2026, avgjørelse 064). Appen åpner brukerens e-postprogram med emne og en kort
// mal. Ingenting sendes fra appen, og ingenting lagres.

/** Sidene der tilbakemeldingen står. Siden brukeren kom fra, er den tilbakemeldingen trolig gjelder. */
const UTEN = new Set(['/innstillinger', '/om']);
let forrige: string | null = null;

/** Merker siden brukeren står på. Kalles av skallet ved hver navigasjon. */
export function merkSide(sti: string, adresse: string): void {
  if (!UTEN.has(sti)) forrige = adresse;
}

/** Adressen til siden brukeren sist var på før Innstillinger eller Om appen, eller null. */
export function forrigeSide(): string | null {
  return forrige;
}

/** En mailto-lenke med emne og tekst. Linjeskift skrives som CRLF (RFC 6068). */
export function epostlenke(adresse: string, emne: string, linjer: readonly string[]): string {
  const kode = (s: string) => encodeURIComponent(s);
  return `mailto:${adresse}?subject=${kode(emne)}&body=${kode(linjer.join('\r\n'))}`;
}

/**
 * Åpner en mailto-lenke i e-postprogrammet. Lenken klikkes som en vanlig lenke i siden, så nettleseren behandler den
 * som et klikk fra brukeren (og ende-til-ende-testene kan fange den).
 */
export function aapneEpost(lenke: string): void {
  const a = document.createElement('a');
  a.href = lenke;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
}
