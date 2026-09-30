// Tekst fra PDF-er (f.eks. hovedtariffavtalen), til verdisjekken. Bruker pdfjs-dist (docs/avgjorelser/017).
import { normaliserTekst } from '../../src/core/kontroll/tekst.ts';

/** Normalisert tekst fra alle sidene i en PDF. Linjeskift blir mellomrom. */
export async function pdfTekst(data: Uint8Array): Promise<string> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // verbosity 0: bare feil, ikke advarsler om skrifttyper.
  const lasting = getDocument({ data, useSystemFonts: true, verbosity: 0 });
  const dokument = await lasting.promise;
  try {
    const sider: string[] = [];
    for (let i = 1; i <= dokument.numPages; i++) {
      const innhold = await (await dokument.getPage(i)).getTextContent();
      sider.push(innhold.items.map((el) => ('str' in el ? el.str + (el.hasEOL ? '\n' : '') : '')).join(''));
    }
    return normaliserTekst(sider.join('\n'));
  } finally {
    await lasting.destroy();
  }
}
