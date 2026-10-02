// Tilstand i en lenke: et utfylt skjema pakkes som JSON, komprimeres med nettleserens innebygde
// CompressionStream (deflate-raw) og skrives som base64url i adressen. Ingen avhengigheter, og ingenting
// sendes noe sted: lenken inneholder alt. Første tegn sier hvordan resten er pakket, så eldre lenker kan leses
// også om formatet endres: «z» er komprimert, «j» er ukomprimert (nettlesere uten CompressionStream).

/** Høyst så mange tegn i en pakket tilstand. Lengre tekst avvises før den pakkes ut. */
export const MAKS_PAKKET = 20_000;
/** Høyst så mange byte i en utpakket tilstand. */
const MAKS_UTPAKKET = 200_000;

function tilBase64url(bytes: Uint8Array): string {
  let binar = '';
  for (const b of bytes) binar += String.fromCharCode(b);
  return btoa(binar).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fraBase64url(tekst: string): Uint8Array {
  const b64 = tekst.replace(/-/g, '+').replace(/_/g, '/');
  const binar = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(binar.length);
  for (let i = 0; i < binar.length; i++) bytes[i] = binar.charCodeAt(i);
  return bytes;
}

async function gjennom(bytes: Uint8Array, strom: { readable: ReadableStream<Uint8Array>; writable: WritableStream<BufferSource> }, maks = Infinity): Promise<Uint8Array> {
  const deler: Uint8Array[] = [];
  let lengde = 0;
  const leser = new Blob([bytes as BlobPart]).stream().pipeThrough<Uint8Array>(strom).getReader();
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    lengde += value.length;
    if (lengde > maks) {
      await leser.cancel();
      throw new Error('For stor tilstand');
    }
    deler.push(value);
  }
  const ut = new Uint8Array(lengde);
  let i = 0;
  for (const d of deler) {
    ut.set(d, i);
    i += d.length;
  }
  return ut;
}

const kanKomprimere = () => typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

/** Pakker en verdi som tekst til en adresse. */
export async function pakk(verdi: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(verdi));
  if (!kanKomprimere()) return `j${tilBase64url(json)}`;
  return `z${tilBase64url(await gjennom(json, new CompressionStream('deflate-raw')))}`;
}

/** Pakker ut en verdi fra en adresse, eller gir null når teksten ikke kan leses. Verdien må sjekkes av den som bruker den. */
export async function pakkUt(tekst: string): Promise<unknown> {
  if (tekst.length < 2 || tekst.length > MAKS_PAKKET || !/^[zj][A-Za-z0-9_-]+$/.test(tekst)) return null;
  try {
    const bytes = fraBase64url(tekst.slice(1));
    let json: Uint8Array;
    if (tekst[0] === 'j') json = bytes;
    else if (kanKomprimere()) json = await gjennom(bytes, new DecompressionStream('deflate-raw'), MAKS_UTPAKKET);
    else return null;
    if (json.length > MAKS_UTPAKKET) return null;
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(json)) as unknown;
  } catch {
    return null;
  }
}
