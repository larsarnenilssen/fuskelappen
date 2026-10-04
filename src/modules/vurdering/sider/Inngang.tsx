// Et kort med ikon som lenker til en side i Vurdering, på oversikten og under «Videre» på sidene (fase 6). Samme
// utseende som kortet for tidslinjen i Inntak.
import { Ikon, type Ikonnavn } from '../../../components/Ikon.tsx';

export function Inngang({ rute, ikon, tittel, tekst }: { rute: string; ikon: Ikonnavn; tittel: string; tekst: string }) {
  return (
    <a class="frist-inngang" href={`#${rute}`}>
      <span class="frist-inngang-tittel">
        <Ikon navn={ikon} />
        {tittel}
      </span>
      <span class="frist-inngang-neste">{tekst}</span>
      <Ikon navn="hoyre" class="frist-inngang-pil" />
    </a>
  );
}
