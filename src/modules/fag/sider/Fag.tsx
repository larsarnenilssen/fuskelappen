// Fagside: fagkode, type, trinn, utdanningsprogram, årstimetall og vurderingsordning fra Grep, og kompetansemål,
// underveisvurdering og vurderingsordning fra læreplanen. Læreplanteksten vises på målformen planen er fastsatt i,
// merket og uoversatt (OPPDRAG 3.6).
// Rekkefølge (eier 01.10.2026): grunnopplysninger med årsramme, så kompetansemål, så vurdering samlet, så
// programområdene. Delene kan lukkes, og begrepene har «i» med lenke til begrepsbanken.
import type { ComponentChildren } from "preact";
import { useEffect, useId, useState } from "preact/hooks";
import { naviger } from "../../../app/ruter.ts";
import { type T, useTekst } from "../../../app/tilstand.ts";
import { FavorittKnapp } from "../../../components/FavorittKnapp.tsx";
import { Forklaring } from "../../../components/Forklaring.tsx";
import { Ikon } from "../../../components/Ikon.tsx";
import { Kildeliste } from "../../../components/Kildelenke.tsx";
import { useSammenlagt } from "../../../components/Sammenlegg.tsx";
import {
  finnKobling,
  type Koblingsresultat,
} from "../../arbeidstid/beregning/index.ts";
import { fagvalgFraKobling } from "../../arbeidstid/fagvalg.ts";
import {
  nyGruppe,
  useKoblingsdata,
} from "../../arbeidstid/komponenter/Skjema.tsx";
import { overforSkjema } from "../../arbeidstid/kontekst.ts";
import { hentBegreper } from "../../begreper/innhold.ts";
import type { Innholdselement } from "../../../core/innhold/skjema.ts";
import {
  formaterDato,
  formaterTall,
  type Malform,
  type Tekstnokkel,
} from "../../../core/i18n/tekst.ts";
import type { SideProps } from "../../typer.ts";
import { lastFagindeks, lastFagrelasjoner, lastLaereplan } from "../data.ts";
import {
  htmlSpraak,
  programmerFor,
  programSammendrag,
  udirLenke,
} from "../oppslag.ts";
import type {
  Fag,
  Fagindeks,
  Fagtype,
  Laereplan,
  Vurdering,
} from "../skjema.ts";
import { fagtypeTekst, koTekst, programTekst, trinnTekst } from "../visning.ts";
import {
  brukesSammenMed,
  erstatterKoder,
  gjeldendeKoder,
  nyLaereplan,
} from "../vigo/oppslag.ts";
import type { Fagrelasjoner } from "../vigo/skjema.ts";

/** Navnet på en fagkode: fra fagindeksen, ellers fra VIGO, ellers bare koden. */
function navnFor(
  kode: string,
  indeks: Fagindeks,
  rel: Fagrelasjoner,
  malform: Malform,
): string {
  return (
    indeks.fag[kode]?.navn[malform] ??
    rel.navn[kode] ??
    rel.erstatninger[kode]?.navn ??
    ""
  );
}

/** Lenke til fagsiden når koden finnes i fagindeksen, ellers bare kode og navn. */
function Faglenke({
  kode,
  indeks,
  rel,
  malform,
}: {
  kode: string;
  indeks: Fagindeks;
  rel: Fagrelasjoner;
  malform: Malform;
}) {
  const tekst = `${kode} ${navnFor(kode, indeks, rel, malform)}`.trim();
  return indeks.fag[kode] ? (
    <a href={`#/fag/${kode}`}>{tekst}</a>
  ) : (
    <>{tekst}</>
  );
}

const utgattTekst = (t: T, utgatt: string | null, malform: Malform) =>
  utgatt === null
    ? ""
    : utgatt === "ukjent"
      ? t("fag.side.utgatt")
      : t("fag.side.utgattDato", { dato: formaterDato(utgatt, malform) });

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

function Vurderingstabell({
  t,
  indeks,
  tittel,
  v,
}: {
  t: T;
  indeks: Fagindeks;
  tittel: string;
  v: Vurdering;
}) {
  const rader: [Tekstnokkel, string | null][] = [
    [
      "fag.side.standpunkt",
      v.standpunkt ? t("fag.side.ja") : t("fag.side.nei"),
    ],
    ["fag.side.eksamen", v.trekk && koTekst(t, indeks, "vurdering", v.trekk)],
    [
      "fag.side.eksamensordning",
      v.eksamensordning &&
        koTekst(t, indeks, "eksamensordning", v.eksamensordning),
    ],
    [
      "fag.side.eksamensform",
      v.eksamensform && koTekst(t, indeks, "eksamensform", v.eksamensform),
    ],
    ["fag.side.uttrykk", v.uttrykk && koTekst(t, indeks, "uttrykk", v.uttrykk)],
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

function Laereplandel({
  t,
  fag,
  plan,
  malform,
}: {
  t: T;
  fag: Fag;
  plan: Laereplan;
  malform: Malform;
}) {
  const spraakNavn = t(`fag.spraak.${plan.spraak}` as Tekstnokkel);
  const sett = plan.kompetansemaalsett.filter((s) => fag.km.includes(s.kode));
  const lang = htmlSpraak(plan.spraak);
  return (
    <>
      <p class="merker">
        <span class="merke">
          {t("fag.side.fastsatt", {
            spraak:
              spraakNavn === `fag.spraak.${plan.spraak}`
                ? plan.spraak
                : spraakNavn,
          })}
        </span>
      </p>
      <div lang={lang}>
        <p class="fag-laereplan-tittel">{plan.tittel}</p>
        {sett.length === 0 && (
          <p class="dempet" lang={malform}>
            {t("fag.side.ingenMaal")}
          </p>
        )}
        {sett.map((s) => {
          // «Kompetansemål og vurdering Vg1» → «Vg1». Uten noe etter, står bare «Kompetansemål».
          const del = s.tittel.replace(/^Kompetansemål og vurdering\s*/i, "");
          const med = (navn: string) => (del ? `${navn}: ${del}` : navn);
          return (
            <section key={s.kode} class="kompetansemaalsett">
              <h3 class="liten-overskrift">
                <span lang={malform}>{t("fag.side.kompetansemaal")}</span>
                {del && `: ${del}`}
              </h3>
              {s.ingress && <p>{s.ingress}</p>}
              <ul class="kompetansemaal">
                {s.maal.map((m) => (
                  <li key={m.kode}>{m.tekst}</li>
                ))}
              </ul>
              {s.underveis.length > 0 && (
                <Forklaring tittel={med(t("fag.side.underveis"))}>
                  <div lang={lang}>
                    <Avsnitt tekst={s.underveis} />
                  </div>
                </Forklaring>
              )}
              {s.standpunkt.length > 0 && (
                <Forklaring tittel={med(t("fag.side.standpunktvurdering"))}>
                  <div lang={lang}>
                    <Avsnitt tekst={s.standpunkt} />
                  </div>
                </Forklaring>
              )}
              <p class="liten">
                <a
                  href={udirLenke(plan.kode, s.kode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  lang={malform}
                >
                  {t("fag.side.udirLenke")} ({s.kode})
                  <Ikon navn="ekstern" class="ikon-liten" />
                  <span class="skjult-visuelt">
                    {" "}
                    {t("felles.eksternLenke", { nettsted: "udir.no" })}
                  </span>
                </a>
              </p>
            </section>
          );
        })}
      </div>
    </>
  );
}

/** Vurderingsordningen i læreplanen, under «Vurdering» sammen med vurderingen fra Grep (eier 01.10.2026). */
function VurderingIPlan({ t, plan }: { t: T; plan: Laereplan }) {
  if (plan.vurderingsordning.length === 0) return null;
  return (
    <Forklaring tittel={t("fag.side.vurderingsordningLaereplan")}>
      <div lang={htmlSpraak(plan.spraak)}>
        {plan.vurderingsordning.map((v) => (
          <section key={v.overskrift}>
            <h4 class="liten-overskrift">{v.overskrift}</h4>
            <Avsnitt tekst={v.tekst} />
          </section>
        ))}
      </div>
    </Forklaring>
  );
}

/** «i» ved et begrep: lenke til begrepet i begrepsbanken. */
function Begrepslenke({ id, navn }: { id: string; navn: string }) {
  const { t } = useTekst();
  return (
    <a
      class="begrep-i"
      href={`#/begreper/${id}`}
      aria-label={t("fag.side.omBegrep", { begrep: navn.toLowerCase() })}
    >
      <Ikon navn="info" class="ikon-liten" />
    </a>
  );
}

/** Begrepet som forklarer hver fagtype. */
const BEGREP_FOR_TYPE: Partial<Record<Fagtype, string>> = {
  fellesfag: "fellesfag",
  felles_programfag: "felles-programfag",
  valgfritt_programfag: "programfag",
  yrkesfaglig_fordypning: "yrkesfaglig-fordypning",
};

/** En del av fagarket med overskrift som åpner og lukker den. Hvilke deler som er åpne, huskes for siden. */
function Seksjon({
  id,
  tittel,
  lukket: standard = false,
  children,
}: {
  id: string;
  tittel: string;
  lukket?: boolean;
  children: ComponentChildren;
}) {
  const [lukket, veksle] = useSammenlagt(`fag-${id}`, standard);
  const innhold = useId();
  return (
    <section class="fag-seksjon" data-seksjon={id}>
      <h2 class="fag-seksjon-tittel">
        <button
          type="button"
          class="kortknapp"
          aria-expanded={!lukket}
          aria-controls={innhold}
          onClick={veksle}
        >
          <span class="kortknapp-tekst">{tittel}</span>
          <Ikon
            navn={lukket ? "ned" : "opp"}
            class="ikon-liten kortknapp-pil"
          />
        </button>
      </h2>
      <div id={innhold} hidden={lukket}>
        {children}
      </div>
    </section>
  );
}

/**
 * Årsrammen fra koblingen til vedlegg 1, med lenke som åpner en ny, ulagret arbeidsplan med faget som fag 1
 * (eier 01.10.2026, B4). Avhenger årsrammen av program og trinn, står radene under hverandre.
 */
function Arsramme({
  kode,
  fag,
  r,
  indeks,
  malform,
}: {
  kode: string;
  fag: Fag;
  r: Koblingsresultat;
  indeks: Fagindeks;
  malform: Malform;
}) {
  const { t } = useTekst();
  if (r.status === "ukoblet") return null;
  const regnUt = (e: Event) => {
    e.preventDefault();
    const gruppe = {
      ...nyGruppe(),
      arsrammer: [fagvalgFraKobling(kode, fag.navn, fag.timer, r)],
      arstimer: fag.timer,
      arstimerAuto: fag.timer !== null,
    };
    overforSkjema("arbeidsplan", { grupper: [gruppe] });
    naviger("/arbeidstid/arbeidsplan");
  };
  const verdi = (k: { rad: { t60: number; t45: number } }) => ({
    t60: formaterTall(k.rad.t60),
    t45: formaterTall(k.rad.t45),
  });
  return (
    <div>
      <dt>
        {t("fag.side.arsramme")}{" "}
        <Begrepslenke id="arsramme" navn={t("fag.side.arsramme")} />
      </dt>
      <dd>
        {r.status === "koblet" ? (
          t("fag.side.arsrammeVerdi", verdi(r.kandidat))
        ) : (
          <>
            {t("fag.side.arsrammeAvhenger")}
            <ul class="tett">
              {r.kandidater.map((k) => (
                <li key={`${k.program}-${k.trinn}-${k.rad.nr}`}>
                  {t("fag.side.arsrammeRad", {
                    program: programTekst(indeks, k.program, malform),
                    trinn: trinnTekst(t, k.trinn as Fag["trinn"][number]),
                    ...verdi(k),
                  })}
                </li>
              ))}
            </ul>
          </>
        )}
        <span class="dempet liten blokk">{t("fag.side.arsrammeHjelp")}</span>
        <a
          class="lenke-pil liten"
          href="#/arbeidstid/arbeidsplan"
          onClick={regnUt}
          data-regn-ut
        >
          {t("fag.side.regnUt")}
        </a>
      </dd>
    </div>
  );
}

/** Forklaringen av yrkesfaglig fordypning fra begrepsbanken, på fagarket for fagene i yrkesfaglig fordypning. */
function YffForklaring({ malform }: { malform: Malform }) {
  const { t } = useTekst();
  const [begrep, settBegrep] = useState<Innholdselement | null>(null);
  useEffect(() => {
    hentBegreper().then(
      (b) =>
        settBegrep(b.find((x) => x.id === "yrkesfaglig-fordypning") ?? null),
      () => undefined,
    );
  }, []);
  if (!begrep) return null;
  return (
    <div class="merknad">
      <h2 class="liten-overskrift">{t("fag.side.yffOverskrift")}</h2>
      <p>{begrep.tekst[malform]}</p>
      <p class="liten">
        <a href="#/begreper/yrkesfaglig-fordypning">{t("fag.side.lesMer")}</a>
      </p>
    </div>
  );
}

export default function Fagside({ parametre }: SideProps) {
  const { t, malform } = useTekst();
  const kode = parametre.kode ?? "";
  const [indeks, settIndeks] = useState<Fagindeks | null>(null);
  const [plan, settPlan] = useState<Laereplan | "laster" | "feil" | null>(null);
  const [forsok, settForsok] = useState(0);
  const [rel, settRel] = useState<Fagrelasjoner | null>(null);
  const koblingsdata = useKoblingsdata();

  useEffect(() => {
    void lastFagindeks().then(settIndeks);
    // Erstatninger og fag som brukes sammen, fra VIGO Kodeverksbase. Siden virker også uten.
    lastFagrelasjoner().then(settRel, () => undefined);
  }, []);
  const fag = indeks?.fag[kode];
  const lp = fag?.lp ?? null;
  useEffect(() => {
    if (!lp) return;
    settPlan("laster");
    lastLaereplan(lp).then(settPlan, () => settPlan("feil"));
  }, [lp, forsok]);

  if (indeks === null) return <p class="side dempet">{t("app.lasterInn")}</p>;
  if (!fag) {
    const nye = rel
      ? gjeldendeKoder(kode, rel, (k) => indeks.fag[k] !== undefined)
      : [];
    if (rel && nye.length > 0) {
      return (
        <div class="side">
          <h1 tabIndex={-1}>{t("fag.side.utgattKode", { kode })}</h1>
          <p>
            {rel.erstatninger[kode]?.navn}{" "}
            {utgattTekst(t, rel.erstatninger[kode]?.utgatt ?? null, malform) &&
              `(${utgattTekst(t, rel.erstatninger[kode]?.utgatt ?? null, malform)})`}
          </p>
          <p>{t("fag.side.erstattetAv")}</p>
          <ul>
            {nye.map((k) => (
              <li key={k}>
                <Faglenke
                  kode={k}
                  indeks={indeks}
                  rel={rel}
                  malform={malform}
                />
              </li>
            ))}
          </ul>
          <Kildeliste kilder={[{ id: "vigo-kodeverk", punkt: kode }]} />
        </div>
      );
    }
    return (
      <div class="side">
        <h1 tabIndex={-1}>{t("fag.side.ikkeFunnet")}</h1>
        <p>
          <a href="#/fag">{t("fag.side.tilbakeTilListen")}</a>
        </p>
      </div>
    );
  }
  const programmer = programmerFor(indeks, fag);
  const sammendrag = programSammendrag(indeks, programmer);
  const programtekster = [
    ...(sammendrag.alleYrkesfaglige ? [t("fag.side.alleYrkesfaglige")] : []),
    ...(sammendrag.alleStudieforberedende
      ? [t("fag.side.alleStudieforberedende")]
      : []),
    ...sammendrag.andre.map((p) => programTekst(indeks, p, malform)),
  ];
  const kobling = koblingsdata
    ? finnKobling(kode, indeks, koblingsdata.tabeller, koblingsdata.rader)
    : null;
  const erstatter = rel ? erstatterKoder(kode, rel) : [];
  const sammen = rel ? brukesSammenMed(kode, rel) : [];
  const nyPlan = rel && lp ? nyLaereplan(lp, rel) : null;
  const medVigo = erstatter.length > 0 || sammen.length > 0 || nyPlan !== null;
  const erYff = fag.type === "yrkesfaglig_fordypning";
  const typeBegrep = BEGREP_FOR_TYPE[fag.type];
  const kilder = [
    ...(lp ? [{ id: "udir-lk20", punkt: lp, url: udirLenke(lp) }] : []),
    { id: "udir-grep", punkt: kode },
    ...(kobling && kobling.status !== "ukoblet"
      ? [{ id: "ks-sfs2213-avtaletekst", punkt: "Vedlegg 1" }]
      : []),
    ...(erYff ? [{ id: "udir-yff-forskrift" }] : []),
    ...(medVigo ? [{ id: "vigo-kodeverk", punkt: kode }] : []),
  ];
  const antallMaal =
    plan && typeof plan === "object"
      ? plan.kompetansemaalsett
          .filter((x) => fag.km.includes(x.kode))
          .reduce((sum, x) => sum + x.maal.length, 0)
      : null;
  return (
    <article class="side">
      <div class="tittelrad">
        <h1 tabIndex={-1}>{fag.navn[malform]}</h1>
        <FavorittKnapp id={`fag:${kode}`} navn={fag.navn[malform]} />
      </div>
      <dl class="egenskaper">
        <div>
          <dt>{t("fag.side.fagkode")}</dt>
          <dd>{kode}</dd>
        </div>
        <div>
          <dt>
            {t("fag.side.fagtype")}{" "}
            {typeBegrep && (
              <Begrepslenke id={typeBegrep} navn={fagtypeTekst(t, fag.type)} />
            )}
          </dt>
          <dd>{fagtypeTekst(t, fag.type)}</dd>
        </div>
        {fag.trinn.length > 0 && (
          <div>
            <dt>
              {t("fag.side.trinn")}{" "}
              <Begrepslenke id="trinn-vg" navn={t("fag.side.trinn")} />
            </dt>
            <dd>{fag.trinn.map((x) => trinnTekst(t, x)).join(", ")}</dd>
          </div>
        )}
        {programtekster.length > 0 && (
          <div>
            <dt>
              {t("fag.side.program")}{" "}
              <Begrepslenke
                id="utdanningsprogram"
                navn={t("fag.side.program")}
              />
            </dt>
            <dd>{programtekster.join(", ")}</dd>
          </div>
        )}
        <div>
          <dt>{t("fag.side.arstimer")}</dt>
          <dd>
            {fag.timer !== null
              ? t("fag.side.arstimerVerdi", { timer: formaterTall(fag.timer) })
              : t("fag.side.arstimerMangler")}
          </dd>
        </div>
        {kobling && (
          <Arsramme
            kode={kode}
            fag={fag}
            r={kobling}
            indeks={indeks}
            malform={malform}
          />
        )}
        {rel && sammen.length > 0 && (
          <div>
            <dt>{t("fag.side.brukesSammen")}</dt>
            <dd>
              <ul class="tett">
                {sammen.map((k) => (
                  <li key={k}>
                    <Faglenke
                      kode={k}
                      indeks={indeks}
                      rel={rel}
                      malform={malform}
                    />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {erstatter.length > 0 && (
          <div>
            <dt>{t("fag.side.erstatter")}</dt>
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
      {nyPlan && lp && (
        <p class="merknad">
          {t("fag.side.nyLaereplan", { gammel: lp, ny: nyPlan })}
        </p>
      )}
      {erYff && <YffForklaring malform={malform} />}

      {!erYff && (
        <Seksjon
          id="kompetansemaal"
          tittel={
            antallMaal !== null
              ? `${t("fag.side.kompetansemaalSeksjon")} (${formaterTall(antallMaal)})`
              : t("fag.side.kompetansemaalSeksjon")
          }
        >
          {!lp ? (
            <p class="dempet">{t("fag.side.ingenLaereplan")}</p>
          ) : plan === "feil" ? (
            <p role="alert">
              {t("fag.side.laereplanFeil")}{" "}
              <button
                type="button"
                class="lenkeknapp"
                onClick={() => settForsok(forsok + 1)}
              >
                {t("app.provIgjen")}
              </button>
            </p>
          ) : plan === null || plan === "laster" ? (
            <p class="dempet">{t("fag.side.lasterLaereplan")}</p>
          ) : (
            <Laereplandel t={t} fag={fag} plan={plan} malform={malform} />
          )}
        </Seksjon>
      )}

      <Seksjon id="vurdering" tittel={t("fag.side.vurdering")}>
        {fag.elev || fag.privatist ? (
          <div class="fag-vurderinger">
            {fag.elev && (
              <Vurderingstabell
                t={t}
                indeks={indeks}
                tittel={t("fag.side.elev")}
                v={fag.elev}
              />
            )}
            {fag.privatist && (
              <Vurderingstabell
                t={t}
                indeks={indeks}
                tittel={t("fag.side.privatist")}
                v={fag.privatist}
              />
            )}
          </div>
        ) : (
          <p class="dempet">{t("fag.side.ingenVurdering")}</p>
        )}
        {plan && typeof plan === "object" && (
          <VurderingIPlan t={t} plan={plan} />
        )}
      </Seksjon>

      {fag.po.length > 0 && (
        <Seksjon
          id="programomrader"
          lukket
          tittel={t("fag.side.programomrader", { antall: fag.po.length })}
        >
          <p class="liten">
            <a href="#/begreper/programomrade">
              {t("fag.side.omProgramomrade")}
            </a>
          </p>
          <ul>
            {fag.po.map((p) => {
              const po = indeks.programomrader[p];
              return (
                <li key={p}>
                  {po
                    ? `${po.navn[malform]} (${p.replace(/-+$/, "")}, ${trinnTekst(t, po.trinn)})`
                    : p}
                </li>
              );
            })}
          </ul>
        </Seksjon>
      )}
      <Kildeliste kilder={kilder} />
    </article>
  );
}
