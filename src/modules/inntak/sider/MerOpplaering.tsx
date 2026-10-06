// Mer opplæring (fase 6, pakke 7): retten til mer opplæring i fag som ikke er bestått (opplæringsforskrifta § 5-2) og
// etter fag- eller svenneprøven, med fristen, vedtaket, vurderingen, voksne og elever med individuelt tilrettelagt
// opplæring. Kortene står i content/inntak/mer-opplaering.yaml, med prefiks etter delen på siden. Samme byggeklosser
// som sidene i Vurdering: sammenligningen, stien og boksen med tabell.
// `?del=<id>` åpner et kort og ruller dit, så Tilrettelegging, Vurdering og veiviseren kan lenke rett til det.
import { useEffect, useState } from "preact/hooks";
import { useTekst } from "../../../app/tilstand.ts";
import { Brodsmuler } from "../../../components/Brodsmuler.tsx";
import { Innholdskort } from "../../../components/Innholdskort.tsx";
import { Kortfot } from "../../../components/Kortfot.tsx";
import { unikeKilder } from "../../../components/kilderader.ts";
import { Samleboks } from "../../../components/Samleboks.tsx";
import { Sammenligning } from "../../../components/Sammenligning.tsx";
import { Sidetopp } from "../../../components/Sidetopp.tsx";
import { Sti } from "../../../components/Sti.tsx";
import { kalenderLenke } from "../../kalender/adresse.ts";
import type { SideProps } from "../../typer.ts";
import { Inngang } from "../../vurdering/sider/Inngang.tsx";
import {
  type Forklaringselement,
  hentInnhold,
  medPrefiks,
  veiviserRute,
} from "../innhold.ts";

/** Delene av siden med kort, i rekkefølgen de står. */
const DELER = [
  { prefiks: "mo-vurdering-", overskrift: "inntak.merOpplaering.vurdering" },
  { prefiks: "mo-voksne-", overskrift: "inntak.merOpplaering.voksne" },
  { prefiks: "mo-iop-", overskrift: "inntak.merOpplaering.iop" },
] as const;

export default function MerOpplaering({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
  }, []);
  const del = sporring.get("del");
  useEffect(() => {
    if (innhold && del)
      document.getElementById(del)?.scrollIntoView({ block: "start" });
  }, [innhold, del]);
  const alle = innhold ?? [];
  const finn = (id: string) => alle.find((e) => e.id === id);
  const rader = medPrefiks(alle, "mo-rad-");
  const retten = finn("mo-innhold");
  const fagprove = finn("mo-fagprove");
  const steg = medPrefiks(alle, "mo-sti-").map((e) => ({
    element: e,
    naar: e.naar ? [e.naar[malform]] : [],
    aapen: del === e.id,
  }));

  return (
    <div class="side mo-bred">
      <Brodsmuler ledd={[{ tekst: t("inntak.tittel"), href: "#/inntak" }]} />
      <Sidetopp
        tittel={t("inntak.merOpplaering.tittel")}
        favoritt="inntak:mer-opplaering"
      />
      <p class="ingress">{t("inntak.merOpplaering.innledning")}</p>
      {innhold === null ? (
        <p class="dempet">{t("app.lasterInn")}</p>
      ) : (
        <div class="mo-to">
          {/* På skrivebord: retten og gangen til venstre, de egne reglene og «Videre» til høyre (fra 64rem). */}
          <div class="mo-to-hoved">
            <section>
              <h2 class="liten-overskrift">{t("inntak.merOpplaering.hvem")}</h2>
              <Sammenligning
                tittel={t("inntak.merOpplaering.hvem")}
                venstre={t("inntak.merOpplaering.venstre")}
                hoyre={t("inntak.merOpplaering.hoyre")}
                rader={rader.flatMap((r) =>
                  r.sammenligning
                    ? [
                        {
                          id: r.id,
                          tittel: r.tittel,
                          venstre: r.sammenligning.venstre,
                          hoyre: r.sammenligning.hoyre,
                        },
                      ]
                    : [],
                )}
              />
              {/* Sammenligningen er en tabell, ikke et kort, så kildene til radene står samlet under den (avgjørelse 071). */}
              <Kortfot
                kilder={unikeKilder(rader.flatMap((r) => r.kilder))}
                nokkel="mo-rad"
              />
            </section>
            {retten && (
              <section>
                <h2 class="liten-overskrift">
                  {t("inntak.merOpplaering.retten")}
                </h2>
                <Innholdskort element={retten} aapen={del === retten.id} />
              </section>
            )}
            <section>
              <h2 class="liten-overskrift">
                {t("inntak.merOpplaering.gangen")}
              </h2>
              <Sti steg={steg} etikett={t("inntak.merOpplaering.gangen")} />
            </section>
            {fagprove && (
              <section>
                <h2 class="liten-overskrift">
                  {t("inntak.merOpplaering.fagprove")}
                </h2>
                <Samleboks
                  element={fagprove}
                  tabell={fagprove.tabell}
                  aapen={del === fagprove.id}
                />
              </section>
            )}
          </div>
          <div class="mo-to-side">
            {DELER.map(({ prefiks, overskrift }) => (
              <section key={prefiks}>
                <h2 class="liten-overskrift">{t(overskrift)}</h2>
                {medPrefiks(alle, prefiks).map((e) => (
                  <Innholdskort key={e.id} element={e} aapen={del === e.id} />
                ))}
              </section>
            ))}
            <section>
              <h2 class="liten-overskrift">
                {t("inntak.merOpplaering.videre")}
              </h2>
              <ul class="vu-videre">
                <li>
                  <Inngang
                    rute={kalenderLenke("inntak")}
                    ikon="kalender"
                    tittel={t("inntak.merOpplaering.fristen")}
                    tekst={t("inntak.merOpplaering.fristenTekst")}
                  />
                </li>
                <li>
                  <Inngang
                    rute={veiviserRute("rett-inntak-soknad")}
                    ikon="veiviser"
                    tittel={t("inntak.merOpplaering.veiviser")}
                    tekst={t("inntak.merOpplaering.veiviserTekst")}
                  />
                </li>
                <li>
                  <Inngang
                    rute="/vurdering/eksamen?del=ek-utsatt-ny-sarskilt"
                    ikon="vurdering"
                    tittel={t("inntak.merOpplaering.eksamen")}
                    tekst={t("inntak.merOpplaering.eksamenTekst")}
                  />
                </li>
                <li>
                  <Inngang
                    rute="/opplaeringslop/laerlinger-og-kandidater?fane=bytte&fra=laerling"
                    ikon="vei"
                    tittel={t("inntak.merOpplaering.laerlinger")}
                    tekst={t("inntak.merOpplaering.laerlingerTekst")}
                  />
                </li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
