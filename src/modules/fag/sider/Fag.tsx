// Fagside: fagkode, type, trinn, utdanningsprogram, årstimetall og vurderingsordning fra Grep, og kompetansemål,
// underveisvurdering og vurderingsordning fra læreplanen. Læreplanteksten vises på målformen planen er fastsatt i,
// merket og uoversatt (OPPDRAG 3.6).
import { useEffect, useState } from 'preact/hooks';
import { type T, useTekst } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Kildeliste } from '../../../components/Kildelenke.tsx';
import { formaterDato, formaterTall, type Malform, type Tekstnokkel } from '../../../core/i18n/tekst.ts';
import type { SideProps } from '../../typer.ts';
import { lastFagindeks, lastFagrelasjoner, lastLaereplan } from '../data.ts';
import { htmlSpraak, programmerFor, udirLenke } from '../oppslag.ts';
import type { Fag, Fagindeks, Laereplan, Vurdering } from '../skjema.ts';
import { fagtypeTekst, koTekst, programTekst, trinnTekst } from '../visning.ts';
import { brukesSammenMed, erstatterKoder, gjeldendeKoder, nyLaereplan } from '../vigo/oppslag.ts';
import type { Fagrelasjoner } from '../vigo/skjema.ts';

/** Navnet på en fagkode: fra fagindeksen, ellers fra VIGO, ellers bare koden. */
function navnFor(kode: string, indeks: Fagindeks, rel: Fagrelasjoner, malform: Malform): string {
  return indeks.fag[kode]?.navn[malform] ?? rel.navn[kode] ?? rel.erstatninger[kode]?.navn ?? '';
}

/** Lenke til fagsiden når koden finnes i fagindeksen, ellers bare kode og navn. */
function Faglenke({ kode, indeks, rel, malform }: { kode: string; indeks: Fagindeks; rel: Fagrelasjoner; malform: Malform }) {
  const tekst = `${kode} ${navnFor(kode, indeks, rel, malform)}`.trim();
  return indeks.fag[kode] ? <a href={`#/fag/${kode}`}>{tekst}</a> : <>{tekst}</>;
}

const utgattTekst = (t: T, utgatt: string | null, malform: Malform) =>
  utgatt === null ? '' : utgatt === 'ukjent' ? t('fag.side.utgatt') : t('fag.side.utgattDato', { dato: formaterDato(utgatt, malform) });

function Avsnitt({ tekst }: { tekst: readonly string[] }) {
  return (
    <>
      {tekst.map((a, i) => (
        <p key={i} class="linjeskift">
          {a}
        </p>
      ))}
    </>
  );
}

function Vurderingstabell({ t, indeks, tittel, v }: { t: T; indeks: Fagindeks; tittel: string; v: Vurdering }) {
  const rader: [Tekstnokkel, string | null][] = [
    ['fag.side.standpunkt', v.standpunkt ? t('fag.side.ja') : t('fag.side.nei')],
    ['fag.side.eksamen', v.trekk && koTekst(t, indeks, 'vurdering', v.trekk)],
    ['fag.side.eksamensordning', v.eksamensordning && koTekst(t, indeks, 'eksamensordning', v.eksamensordning)],
    ['fag.side.eksamensform', v.eksamensform && koTekst(t, indeks, 'eksamensform', v.eksamensform)],
    ['fag.side.uttrykk', v.uttrykk && koTekst(t, indeks, 'uttrykk', v.uttrykk)],
  ];
  return (
    <div class="fag-vurdering">
      <h3 class="liten-overskrift">{tittel}</h3>
      <dl class="egenskaper">
        {rader
          .filter((r): r is [Tekstnokkel, string] => r[1] !== null)
          .map(([n, verdi]) => (
            <div key={n}>
              <dt>{t(n)}</dt>
              <dd>{verdi}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

function Laereplandel({ t, fag, plan, malform }: { t: T; fag: Fag; plan: Laereplan; malform: Malform }) {
  const spraakNavn = t(`fag.spraak.${plan.spraak}` as Tekstnokkel);
  const sett = plan.kompetansemaalsett.filter((s) => fag.km.includes(s.kode));
  const lang = htmlSpraak(plan.spraak);
  return (
    <>
      <p class="merker">
        <span class="merke">{t('fag.side.fastsatt', { spraak: spraakNavn === `fag.spraak.${plan.spraak}` ? plan.spraak : spraakNavn })}</span>
      </p>
      <div lang={lang}>
        <p class="fag-laereplan-tittel">{plan.tittel}</p>
        {sett.length === 0 && <p class="dempet" lang={malform}>{t('fag.side.ingenMaal')}</p>}
        {sett.map((s) => (
          <section key={s.kode} class="kompetansemaalsett">
            <h3 class="liten-overskrift">
              <span lang={malform}>{t('fag.side.kompetansemaal')}</span>: {s.tittel.replace(/^Kompetansemål og vurdering\s*/i, '') || s.tittel}
            </h3>
            {s.ingress && <p>{s.ingress}</p>}
            <ul class="kompetansemaal">
              {s.maal.map((m) => (
                <li key={m.kode}>{m.tekst}</li>
              ))}
            </ul>
            {s.underveis.length > 0 && (
              <Forklaring tittel={`${t('fag.side.underveis')}: ${s.tittel.replace(/^Kompetansemål og vurdering\s*/i, '')}`}>
                <div lang={lang}>
                  <Avsnitt tekst={s.underveis} />
                </div>
              </Forklaring>
            )}
            {s.standpunkt.length > 0 && (
              <Forklaring tittel={`${t('fag.side.standpunktvurdering')}: ${s.tittel.replace(/^Kompetansemål og vurdering\s*/i, '')}`}>
                <div lang={lang}>
                  <Avsnitt tekst={s.standpunkt} />
                </div>
              </Forklaring>
            )}
            <p class="liten">
              <a href={udirLenke(plan.kode, s.kode)} target="_blank" rel="noopener noreferrer" lang={malform}>
                {t('fag.side.udirLenke')} ({s.kode})
                <Ikon navn="ekstern" class="ikon-liten" />
                <span class="skjult-visuelt"> {t('felles.eksternLenke', { nettsted: 'udir.no' })}</span>
              </a>
            </p>
          </section>
        ))}
        {plan.vurderingsordning.length > 0 && (
          <Forklaring tittel={t('fag.side.vurderingsordningLaereplan')}>
            <div lang={lang}>
              {plan.vurderingsordning.map((v) => (
                <section key={v.overskrift}>
                  <h4 class="liten-overskrift">{v.overskrift}</h4>
                  <Avsnitt tekst={v.tekst} />
                </section>
              ))}
            </div>
          </Forklaring>
        )}
      </div>
    </>
  );
}

export default function Fagside({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const kode = parametre.kode ?? '';
  const [indeks, settIndeks] = useState<Fagindeks | null>(null);
  const [plan, settPlan] = useState<Laereplan | 'laster' | 'feil' | null>(null);
  const [forsok, settForsok] = useState(0);
  const [rel, settRel] = useState<Fagrelasjoner | null>(null);

  useEffect(() => {
    void lastFagindeks().then(settIndeks);
    // Erstatninger og fag som brukes sammen, fra VIGO Kodeverksbase. Siden virker også uten.
    lastFagrelasjoner().then(settRel, () => undefined);
  }, []);
  const fag = indeks?.fag[kode];
  const lp = fag?.lp ?? null;
  useEffect(() => {
    if (!lp) return;
    settPlan('laster');
    lastLaereplan(lp).then(settPlan, () => settPlan('feil'));
  }, [lp, forsok]);

  if (indeks === null) return <p class="side dempet">{t('app.lasterInn')}</p>;
  if (!fag) {
    const nye = rel ? gjeldendeKoder(kode, rel, (k) => indeks.fag[k] !== undefined) : [];
    if (rel && nye.length > 0) {
      return (
        <div class="side">
          <h1 tabIndex={-1}>{t('fag.side.utgattKode', { kode })}</h1>
          <p>
            {rel.erstatninger[kode]?.navn} {utgattTekst(t, rel.erstatninger[kode]?.utgatt ?? null, malform) && `(${utgattTekst(t, rel.erstatninger[kode]?.utgatt ?? null, malform)})`}
          </p>
          <p>{t('fag.side.erstattetAv')}</p>
          <ul>
            {nye.map((k) => (
              <li key={k}>
                <Faglenke kode={k} indeks={indeks} rel={rel} malform={malform} />
              </li>
            ))}
          </ul>
          <Kildeliste kilder={[{ id: 'vigo-kodeverk', punkt: kode }]} />
        </div>
      );
    }
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t('fag.side.ikkeFunnet')}</h1>
        <p>
          <a href="#/fag">{t('fag.side.tilbakeTilListen')}</a>
        </p>
      </div>
    );
  }
  const programmer = programmerFor(indeks, fag);
  const erstatter = rel ? erstatterKoder(kode, rel) : [];
  const sammen = rel ? brukesSammenMed(kode, rel) : [];
  const nyPlan = rel && lp ? nyLaereplan(lp, rel) : null;
  const medVigo = erstatter.length > 0 || sammen.length > 0 || nyPlan !== null;
  const kilder = [...(lp ? [{ id: 'udir-lk20', punkt: lp, url: udirLenke(lp) }] : []), { id: 'udir-grep', punkt: kode }, ...(medVigo ? [{ id: 'vigo-kodeverk', punkt: kode }] : [])];
  return (
    <article class="side">
      <div class="tittelrad">
        <h1 tabIndex={-1}>{fag.navn[malform]}</h1>
        <FavorittKnapp id={`fag:${kode}`} navn={fag.navn[malform]} />
      </div>
      <dl class="egenskaper">
        <div>
          <dt>{t('fag.side.fagkode')}</dt>
          <dd>{kode}</dd>
        </div>
        <div>
          <dt>{t('fag.side.fagtype')}</dt>
          <dd>{fagtypeTekst(t, fag.type)}</dd>
        </div>
        {fag.trinn.length > 0 && (
          <div>
            <dt>{t('fag.side.trinn')}</dt>
            <dd>{fag.trinn.map((x) => trinnTekst(t, x)).join(', ')}</dd>
          </div>
        )}
        <div>
          <dt>{t('fag.side.arstimer')}</dt>
          <dd>{fag.timer !== null ? t('fag.side.arstimerVerdi', { timer: formaterTall(fag.timer) }) : t('fag.side.arstimerMangler')}</dd>
        </div>
        {programmer.length > 0 && (
          <div>
            <dt>{t('fag.side.program')}</dt>
            <dd>{programmer.map((p) => programTekst(indeks, p, malform)).join(', ')}</dd>
          </div>
        )}
        {rel && sammen.length > 0 && (
          <div>
            <dt>{t('fag.side.brukesSammen')}</dt>
            <dd>
              <ul class="tett">
                {sammen.map((k) => (
                  <li key={k}>
                    <Faglenke kode={k} indeks={indeks} rel={rel} malform={malform} />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {erstatter.length > 0 && (
          <div>
            <dt>{t('fag.side.erstatter')}</dt>
            <dd>
              <ul class="tett">
                {erstatter.map((e) => (
                  <li key={e.kode}>
                    {e.kode} {e.navn}
                    {e.utgatt && ` (${utgattTekst(t, e.utgatt, malform)})`}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      {nyPlan && lp && <p class="merknad">{t('fag.side.nyLaereplan', { gammel: lp, ny: nyPlan })}</p>}
      {fag.po.length > 0 && (
        <Forklaring tittel={t('fag.side.programomrader', { antall: fag.po.length })}>
          <ul>
            {fag.po.map((p) => {
              const po = indeks.programomrader[p];
              return (
                <li key={p}>
                  {po ? `${po.navn[malform]} (${p.replace(/-+$/, '')}, ${trinnTekst(t, po.trinn)})` : p}
                </li>
              );
            })}
          </ul>
        </Forklaring>
      )}

      <h2>{t('fag.side.vurdering')}</h2>
      {fag.elev || fag.privatist ? (
        <>
          <p class="dempet liten">{t('fag.side.vurderingIngress')}</p>
          <div class="fag-vurderinger">
            {fag.elev && <Vurderingstabell t={t} indeks={indeks} tittel={t('fag.side.elev')} v={fag.elev} />}
            {fag.privatist && <Vurderingstabell t={t} indeks={indeks} tittel={t('fag.side.privatist')} v={fag.privatist} />}
          </div>
        </>
      ) : (
        <p class="dempet">{t('fag.side.ingenVurdering')}</p>
      )}

      <h2>{t('fag.side.laereplan')}</h2>
      {!lp ? (
        <p class="dempet">{t('fag.side.ingenLaereplan')}</p>
      ) : plan === 'feil' ? (
        <p role="alert">
          {t('fag.side.laereplanFeil')}{' '}
          <button type="button" class="lenkeknapp" onClick={() => settForsok(forsok + 1)}>
            {t('app.provIgjen')}
          </button>
        </p>
      ) : plan === null || plan === 'laster' ? (
        <p class="dempet">{t('fag.side.lasterLaereplan')}</p>
      ) : (
        <Laereplandel t={t} fag={fag} plan={plan} malform={malform} />
      )}
      <Kildeliste kilder={kilder} />
    </article>
  );
}
