// Stien tilbake øverst på en side: «Opplæringsløp › Helse- og oppvekstfag» eller «Begreper». Siste ledd er siden
// over den brukeren står på. Viser hvor i appen siden hører hjemme, også når brukeren kom dit via en lenke.
import { useTekst } from '../app/tilstand.ts';

export function Brodsmuler({ ledd }: { ledd: readonly { tekst: string; href: string }[] }) {
  const { t } = useTekst();
  return (
    <nav class="brodsmuler" aria-label={t('felles.plassering')}>
      <ol>
        {ledd.map((l) => (
          <li key={l.href}>
            <a href={l.href}>{l.tekst}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
