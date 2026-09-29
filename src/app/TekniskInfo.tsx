// Mål på skjerm og visningsområde. Hjelper eier å finne feil i visningen på egen telefon.
import { useEffect, useRef, useState } from 'preact/hooks';
import { useTekst } from './tilstand.ts';

interface Maal {
  skjerm: string;
  visning: string;
  synlig: string;
  kanter: string;
  installert: boolean;
}

function mal(probe: HTMLElement | null): Maal {
  const stil = probe ? getComputedStyle(probe) : null;
  const kant = (s: string | undefined) => Math.round(parseFloat(s ?? '0') || 0);
  const vv = window.visualViewport;
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return {
    skjerm: `${screen.width} × ${screen.height}`,
    visning: `${window.innerWidth} × ${window.innerHeight}`,
    synlig: vv ? `${Math.round(vv.width)} × ${Math.round(vv.height)}` : '–',
    kanter: stil ? [stil.paddingTop, stil.paddingRight, stil.paddingBottom, stil.paddingLeft].map(kant).join(' / ') : '–',
    installert: standalone || window.matchMedia('(display-mode: standalone)').matches,
  };
}

export function TekniskInfo() {
  const { t } = useTekst();
  const probe = useRef<HTMLDivElement>(null);
  const [maal, settMaal] = useState<Maal | null>(null);

  useEffect(() => {
    const oppdater = () => settMaal(mal(probe.current));
    oppdater();
    window.addEventListener('resize', oppdater);
    window.visualViewport?.addEventListener('resize', oppdater);
    return () => {
      window.removeEventListener('resize', oppdater);
      window.visualViewport?.removeEventListener('resize', oppdater);
    };
  }, []);

  return (
    <div class="teknisk">
      <div ref={probe} class="sikker-kant-probe" aria-hidden="true" />
      <p class="liten">{t('om.teknisk.forklaring')}</p>
      {maal && (
        <dl class="teknisk-liste">
          <dt>{t('om.teknisk.skjerm')}</dt>
          <dd>{maal.skjerm}</dd>
          <dt>{t('om.teknisk.visning')}</dt>
          <dd>{maal.visning}</dd>
          <dt>{t('om.teknisk.synlig')}</dt>
          <dd>{maal.synlig}</dd>
          <dt>{t('om.teknisk.kanter')}</dt>
          <dd>{maal.kanter}</dd>
          <dt>{t('om.teknisk.installert')}</dt>
          <dd>{maal.installert ? t('om.teknisk.ja') : t('om.teknisk.nei')}</dd>
        </dl>
      )}
    </div>
  );
}
