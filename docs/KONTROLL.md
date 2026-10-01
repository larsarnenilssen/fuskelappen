# Kontrolloversikt

<!-- Generert av `npm run kontroll:rapport`. Kildesjekken lager den på nytt hver uke. Ikke rediger for hånd. -->

Oppdatert 01.10.2026. Kildesjekken kjørte sist 30.09.2026, verdisjekken 30.09.2026.

Oversikten viser hva som bygger på hver kilde, og hvor langt kontrollen er kommet. «Automatisk sjekk» betyr at sitatet med tallet fortsatt står i kilden. Det er ikke det samme som din kontroll. Se `docs/EIER.md`, punkt 10–12.

Når du har kontrollert noe, skriver du `/godkjent` og id-ene i en kommentar i kontrollsaken, for eksempel `/godkjent arsverk planleggingsdager feriepenger_prosent`. Id-ene står i `kodeskrift` i tabellene.

## Sammendrag

| Din kontroll | Antall |
|---|---|
| Kontrollert | 1 |
| Kilden er endret etter kontrollen | 0 |
| Bør kontrolleres på nytt (over 12 måneder) | 0 |
| Ikke kontrollert | 75 |
| Praksis og tolkninger som bør bekreftes | 12 av 12 |

| Automatisk sjekk av regelverdier | Antall |
|---|---|
| Samsvarer med kilden | 27 |
| Avvik fra kilden | 0 |
| Ikke sjekket (kilden kunne ikke leses eller sjekkes ikke) | 0 |
| Enkeltverdier fra kilden uten sitat | 2 |

**Kobling fra fagkode til årsramme** (fase 2): 1197 av 1978 fagkoder er koblet, 781 er ikke koblet, og det er 0 avvik. Se [docs/KOBLING.md](KOBLING.md) for avviksrapporten, tabellen over programnavn, et utvalg koblinger til kontroll og listen over ukoblede fag.

## Må ses på

Ingenting akkurat nå.

## Praksis og tolkninger

Dette bygger appen på uten at det står i kildene. Du bekrefter punktene i kontrollrundene i mai og august.

| Praksis | Spørsmål | Grunnlag | Bekreftet |
|---|---|---|---|
| **Lønn i brutte måneder** | Regnes lønn for deler av en måned fortsatt som arbeidsdagene ÷ 21,67 av månedslønnen, med offentlige fridager som arbeidsdager? | Eier 30.09.2026. Praksis i lønnssystemet og i Vestland fylkeskommune. | ikke bekreftet |
| **Variabel lønn for deltidsansatte** | Gjelder det fortsatt at beskjeftigelse over en stilling under 100 %, opp til hel stilling, gir variabel lønn uten overtidstillegg? Er dommen om overtid for deltidsansatte blitt rettskraftig? | Eier 30.09.2026, inntil dommen om overtid for deltidsansatte er rettskraftig. | ikke bekreftet |
| **Overtidsbetaling for undervisning** | Betales overtid for undervisning fortsatt som kalkulert tid × timelønn × 1,5? | Eier 29.09.2026. Hovedtariffavtalen § 6.4 og § 6.5.3. | ikke bekreftet |
| **Planleggingsdager** | Brukes fortsatt 45 timer planleggingsdager for alle, tatt fra annen planfestet tid, slik Visma InSchool gjør? | Eier 30.09.2026. Visma InSchool. | ikke bekreftet |
| **Skoleåret og timer per uke** | Er elevenes skoleår fortsatt 190 dager og 38 uker, og skal timene per uke fordeles på 38 skoleuker? | Opplæringslova. Paragrafen er ikke lagt inn i kilderegisteret ennå, så tallene sjekkes ikke automatisk. | ikke bekreftet |
| **Planfestet tid fra 60 år** | Regnes planfestet tid for lærere som er 60 år og eldre fortsatt som samme andel av årsverket (1150 × 1650 ÷ 1687,5 = 1124,44 timer)? | Eier 30.09.2026. | ikke bekreftet |
| **Periodenøkkel** | Regnes periodebeskjeftigelse fortsatt med undervisningsdager i perioden ÷ undervisningsdager i skoleåret, slik Visma InSchool gjør? | Eier 30.09.2026. Visma InSchool. | ikke bekreftet |
| **Frigjort tid for 57-åringer** | Skal redusert undervisning for lærere som har fylt 57 år, fortsatt regnes som for nyutdannede og lærere over 60 år, selv om avtaleteksten ikke sier det uttrykkelig? | Eier 30.09.2026. | ikke bekreftet |
| **Funksjoner i årsrammetimer** | Gjøres funksjoner som er oppgitt i årsrammetimer, fortsatt om til prosent med årsrammen 607,5? | Tolkning av vedlegg 1 til SFS 2213 (årsramme ved redusert undervisning på grunn av funksjon). | ikke bekreftet |
| **Utvidet arbeidsår** | Regnes utvidelsen av arbeidsåret fortsatt som timene over 37,5 × 38 + 45 = 1470 planfestede timer, delt på 7,5 timer per dag? | Eier 30.09.2026. | ikke bekreftet |
| **Tillegg for funksjoner** | Er 12 000 kroner fortsatt riktig standardbeløp når navnet på en funksjon ikke kjennes igjen, og har fylket egne satser for andre funksjoner? | Appens valg, med utgangspunkt i SFS 2213 punkt 9.1. | ikke bekreftet |
| **Årsramme for yrkesfaglig fordypning** | Skal yrkesfaglig fordypning (YFF) ha årsrammen for felles programfag på utdanningsprogrammet og trinnet, slik vedlegg 1 sier om prosjekt til fordypning? | Claude 30.09.2026, ut fra vedlegg 1 til SFS 2213 («Prosjekt til fordypning»). Prosjekt til fordypning ble yrkesfaglig fordypning med fagfornyelsen i 2020. | ikke bekreftet |

## Per kilde

### SFS 2213 med vedlegg 1 og protokoll (avtaleteksten)

`ks-sfs2213-avtaletekst` · Kildesjekk: i orden (30.09.2026) · [Åpne kilden](https://www.kf-infoserie.no/a/h/931fe8f5-8cdf-47ab-a8fb-9e8dba6f8e66/250413?ticketId=be4f9bea-3190-4670-89e2-df98ec83dd5e)

**Regelverdier**

| Verdi | Punkt | Tall | Automatisk sjekk | Din kontroll |
|---|---|---|---|---|
| `arsverk_timer` (sfs2213-2026-2027) | 4 | 1687,5 timer | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `arsverk_timer_60_ar` (sfs2213-2026-2027) | 4 | 1650 timer | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `arbeidsaar_tillegg_dager` (sfs2213-2026-2027) | 4 a | 6 dager | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `timer_per_dag` (sfs2213-2026-2027) | 4 a | 7,5 timer | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `arbeidsdager_per_uke` (sfs2213-2026-2027) | 5.1 | 5 dager | avledet av andre verdier | ikke kontrollert |
| `planfestet_timer` (sfs2213-2026-2027) | 5.1 | 1150 timer | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `planfestet_maks_dag` (sfs2213-2026-2027) | 5.1 | 9 timer | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `planfestet_maks_uke` (sfs2213-2026-2027) | 5.1 | 37,5 timer | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `arsramme_funksjon` (sfs2213-2026-2027) | Vedlegg 1 | 607,5 årsrammetimer (60 min) | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `arsramme_funksjon_45` (sfs2213-2026-2027) | Vedlegg 1 | 810 årsrammetimer (45 min) | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `stjernetillegg` (sfs2213-2026-2027) | Vedlegg 1 | 52,5 årsrammetimer (60 min) | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `stjernetillegg_45` (sfs2213-2026-2027) | Vedlegg 1 | 70 årsrammetimer (45 min) | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `stjerne_maks_elever` (sfs2213-2026-2027) | Vedlegg 1 | 15 elever | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `kontaktlaerer_reduksjon` (sfs2213-2026-2027) | 7.3 b | 28,5 årsrammetimer (60 min) | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `livsfase_nyutdannet_prosent` (sfs2213-2026-2027) | 6 | 6 prosent | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `livsfase_57_prosent` (sfs2213-2026-2027) | 6 | 6 prosent | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `livsfase_60_prosent` (sfs2213-2026-2027) | 6 | 12,5 prosent | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `godtgjoring_kontaktlaerer` (sfs2213-2026-2027) | 9.1 | 12000 kroner per år | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `godtgjoring_radgiver` (sfs2213-2026-2027) | 9.1 | 12000 kroner per år | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `arsrammer` (sfs2213-2026-2027) | Vedlegg 1 | tabell, 151 rader | ✅ samsvarer (30.09.2026). Alle 151 radene stemmer. | ikke kontrollert |

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Undervisning (`bruk-undervisning`) | forklaring | 5.2 | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |
| Møtetid (`bruk-motetid`) | forklaring | 5.1, 5.2 | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |
| Annen planfestet tid og annet elevrettet arbeid (`bruk-annen-planfestet`) | forklaring | 4, 5.1, 5.2 | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |
| Planleggingsdager (`bruk-planleggingsdager`) | forklaring | 4 a | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |
| Funksjoner og andre oppgaver (`bruk-funksjonstid`) | forklaring | 5.3, 7.3 | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |
| Tid læreren disponerer selv (`bruk-selvdisponert`) | forklaring | 3, 5.2 | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |
| Slik regnes arbeidsplanen ut (`metode-arbeidsplan`) | forklaring | 4, 5.1, 5.2, 5.3, 6, 7.3 b, 9.1, Vedlegg 1 | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Slik regnes beskjeftigelsen ut (`metode-beskjeftigelse`) | forklaring | 5.2, Vedlegg 1 | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Slik regnes vikartimene ut (`metode-vikar`) | forklaring | Vedlegg 1 | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Slik regnes overtiden ut (`metode-overtid`) | forklaring | 5.2 | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Arbeidstid (`arbeidstid`) | begrep | 4–5 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Årsverk (`arsverk`) | begrep | 4 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Arbeidsår (`arbeidsar`) | begrep | 4, 5.3 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Årsramme (`arsramme`) | begrep | Vedlegg 1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Fag merket * (`stjernefag`) | begrep | Vedlegg 1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| 60- og 45-minutters enheter (`minuttenheter`) | begrep | Vedlegg 1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Beskjeftigelse (`beskjeftigelse`) | begrep | Vedlegg 1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Periodebeskjeftigelse (`periodebeskjeftigelse`) | begrep | Vedlegg 1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Planfestet arbeidstid (`planfestet-arbeidstid`) | begrep | 5.1, 5.2 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Tid læreren disponerer selv (`selvdisponert-tid`) | begrep | 5.2 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| For- og etterarbeid (`for-og-etterarbeid`) | begrep | 5.1, 5.2 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Annet elevrettet arbeid (`annet-elevrettet-arbeid`) | begrep | 5.1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Funksjoner og andre arbeidsoppgaver (`andre-arbeidsoppgaver`) | begrep | 5.3, 7.3 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Fast overtid (`fast-overtid`) | begrep | 5.2 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Planleggingsdager (`planleggingsdager`) | begrep | 4 a | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Lokale forhandlinger om arbeidstid (`lokale-forhandlinger`) | begrep | 4 b, 5.1, Protokoll 2026 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Drøftinger (`drofting`) | begrep | 4, 7.3 a | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Teknisk undertid og teknisk overtid (`teknisk-undertid-overtid`) | begrep | Vedlegg 1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Livsfasetiltak (redusert undervisning) (`livsfasetiltak`) | begrep | 4, 6 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Kontaktlærer (`kontaktlaerer`) | begrep | 7.3 b, 9.1, Vedlegg 1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Godtgjøring for funksjoner (`funksjonsgodtgjoring`) | begrep | 9.1 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |

### Hovedtariffavtalen 1.5.2026–30.4.2028

`ks-hovedtariffavtalen` · Kildesjekk: i orden (30.09.2026) · [Åpne kilden](https://www.ks.no/globalassets/fagomrader/lonn-og-tariff/tariff-2024/hovedtariffavtalen-2026-2028---interaktiv-til-nettsiden.pdf)

**Regelverdier**

| Verdi | Punkt | Tall | Automatisk sjekk | Din kontroll |
|---|---|---|---|---|
| `timelonn_konstant` (hta-2026-2028) | Kap. 1 § 12.4 | 1400 | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `timelonn_arsverk_timer` (hta-2026-2028) | Kap. 1 § 12.4 | 1687,5 timer | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `timelonn_ferie_teller` (hta-2026-2028) | Kap. 1 § 12.4 | 100 | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `timelonn_ferie_nevner` (hta-2026-2028) | Kap. 1 § 12.4 | 112 | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `feriepenger_prosent` (hta-2026-2028) | Kap. 1 § 7.4.2 | 12 prosent | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `feriepenger_prosent_over_60` (hta-2026-2028) | Kap. 1 § 7.4.2 | 14,3 prosent | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `overtidstillegg_prosent` (hta-2026-2028) | Kap. 1 § 6.5.3 | 50 prosent | ✅ samsvarer (30.09.2026) | ikke kontrollert |
| `garantilonn` (hta-2026-2028) | Kap. 4 punkt 4.1 | tabell, 5 rader | ✅ samsvarer (30.09.2026). Alle 5 radene stemmer. | ikke kontrollert |
| `garantilonn_ansiennitet` (hta-2026-2028) | Kap. 4 punkt 4.1 | liste: 0, 6, 8, 10, 16 | tabell eller liste, sjekkes ikke automatisk ennå | ikke kontrollert |

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Slik regnes arbeidsplanen ut (`metode-arbeidsplan`) | forklaring | Kap. 4 punkt 4.1, Kap. 1 § 7.4.2 | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Slik regnes vikartimene ut (`metode-vikar`) | forklaring | Kap. 1 § 12.4, Kap. 1 § 7.4.2, Kap. 4 punkt 4.1 | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Slik regnes overtiden ut (`metode-overtid`) | forklaring | Kap. 1 § 6.4, Kap. 1 § 6.5.3, Kap. 1 § 7.4.2, Kap. 1 § 12.4 | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Kalkulert tid (`kalkulert-tid`) | begrep | Kap. 1 § 12.4 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Fast overtid (`fast-overtid`) | begrep | Kap. 1 § 6 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Variabel lønn (`variabel-lonn`) | begrep | Kap. 1 § 6.2, Kap. 1 § 12.4 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |
| Delt dagsverk (`delt-dagsverk`) | begrep | Kap. 1 § 5.5 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |

### Lov om arbeidsmiljø, arbeidstid og stillingsvern mv. (arbeidsmiljøloven)

`arbeidsmiljoloven` · Kildesjekk: i orden (30.09.2026) · [Åpne kilden](https://lovdata.no/lov/2005-06-17-62)

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Arbeidstid (`arbeidstid`) | begrep | Kapittel 10 | `content/begreper/arbeidstid.yaml` | ikke kontrollert |

### Lov om grunnskoleopplæringa og den vidaregåande opplæringa (opplæringslova)

`opplaeringslova` · Kildesjekk: sjekkes ikke automatisk · [Åpne kilden](https://lovdata.no/lov/2023-06-09-30)

**Regelverdier**

| Verdi | Punkt | Tall | Automatisk sjekk | Din kontroll |
|---|---|---|---|---|
| `skolear_uker` (sfs2213-2026-2027) | – | 38 uker | mangler sitat | ikke kontrollert |
| `skolear_dager` (sfs2213-2026-2027) | – | 190 dager | mangler sitat | ikke kontrollert |

### Grep – fag, læreplaner, vurderingsordninger og årstimetall

`udir-grep` · Kildesjekk: i orden (30.09.2026) · [Åpne kilden](https://data.udir.no/kl06/v201906/)

**Regelverdier**

| Verdi | Punkt | Tall | Automatisk sjekk | Din kontroll |
|---|---|---|---|---|
| `arstimer` (sfs2213-2026-2027) | – | tabell, 98 rader | tabell eller liste, sjekkes ikke automatisk ennå | ikke kontrollert |
| `fagnavn` (sfs2213-2026-2027) | – | tabell, 33 rader | tabell eller liste, sjekkes ikke automatisk ennå | ikke kontrollert |
| `kallenavn` (sfs2213-2026-2027) | – | tabell, 43 rader | tabell eller liste, sjekkes ikke automatisk ennå | ikke kontrollert |
| `programnavn` (sfs2213-2026-2027) | – | tabell, 21 rader | avledet av andre verdier | kontrollert 01.10.2026 |
| `kobling_fellesfag` (sfs2213-2026-2027) | – | tabell, 316 rader | avledet av andre verdier | ikke kontrollert |
| `kobling_programfag` (sfs2213-2026-2027) | – | tabell, 39 rader | avledet av andre verdier | ikke kontrollert |
| `kobling_regler` (sfs2213-2026-2027) | – | tabell, 63 rader | avledet av andre verdier | ikke kontrollert |
| `kobling_yff` (sfs2213-2026-2027) | – | tabell, 21 rader | praksis, sjekkes ikke automatisk | ikke kontrollert |

### VIGO Kodeverksbase – erstattede fag, fag som brukes sammen, fagmerknader og vitnemålsmerknader

`vigo-kodeverk` · Kildesjekk: sjekkes ikke automatisk · [Åpne kilden](https://kodeverk.vigo.no/)

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Fagmerknader (FAM-koder) (`fagmerknader`) | begrep | Fagmerknader | `content/begreper/dokumentasjon.yaml` | ikke kontrollert |
| Vitnemålsmerknader (VMM-koder) (`vitnemalsmerknader`) | begrep | Vitnemålsmerknader | `content/begreper/dokumentasjon.yaml` | ikke kontrollert |

### Erfaringer med arbeidstidsavtalen for undervisningspersonell (SFS 2213) – FoU-rapport for KS (Proba samfunnsanalyse, 2025)

`ks-fou-sfs2213` · Kildesjekk: sjekkes ikke automatisk · [Åpne kilden](https://www.ks.no/contentassets/fe673f1aa4254bc0b9e2f49f00434251/erfaringer-med-sfs2213_rapport.pdf)

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Undervisning (`bruk-undervisning`) | forklaring | – | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |
| Annen planfestet tid og annet elevrettet arbeid (`bruk-annen-planfestet`) | forklaring | – | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |
| Annet elevrettet arbeid (`annet-elevrettet-arbeid`) | begrep | – | `content/begreper/arbeidstid.yaml` | ikke kontrollert |

### Utdanningsforbundets krav ved forhandlingene om SFS 2213, 24.11.2025 (dok. nr. 1)

`udf-krav-sfs2213-2025` · Kildesjekk: sjekkes ikke automatisk · [Åpne kilden](https://www.ks.no/contentassets/8241bae38e5a49c385d5f549a05a33ef/utdanningsforbundet.pdf)

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Annen planfestet tid og annet elevrettet arbeid (`bruk-annen-planfestet`) | forklaring | – | `content/arbeidstid/bruk-av-tiden.yaml` | ikke kontrollert |

### Visma InSchool – 3.25 Beregning av lønn for vikartimer

`inschool-vikartimer` · Kildesjekk: sjekkes ikke automatisk · [Åpne kilden](https://inschool.zendesk.com/hc/no/articles/4417711337105-3-25-Beregning-av-l%C3%B8nn-for-vikartimer)

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Slik regnes vikartimene ut (`metode-vikar`) | forklaring | – | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Kalkulert tid (`kalkulert-tid`) | begrep | – | `content/begreper/arbeidstid.yaml` | ikke kontrollert |

### Visma InSchool – 2a.17 Periodebeskjeftigelse

`inschool-periodebeskjeftigelse` · Kildesjekk: sjekkes ikke automatisk · [Åpne kilden](https://inschool.zendesk.com/hc/no/articles/27581133712274-2a-17-Fag-og-timefordeling-Periodebeskjeftigelse-ny-funksjonalitet)

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Slik regnes arbeidsplanen ut (`metode-arbeidsplan`) | forklaring | – | `content/arbeidstid/metoder.yaml` | ikke kontrollert |
| Periodebeskjeftigelse (`periodebeskjeftigelse`) | begrep | – | `content/begreper/arbeidstid.yaml` | ikke kontrollert |

### Visma InSchool – 3.13 Kontering og generering av fastlønn og faste tillegg

`inschool-fastlonn` · Kildesjekk: sjekkes ikke automatisk · [Åpne kilden](https://inschool.zendesk.com/hc/no/articles/19452863757970)

**Regelverdier**

| Verdi | Punkt | Tall | Automatisk sjekk | Din kontroll |
|---|---|---|---|---|
| `arbeidsdager_per_maned` (hta-2026-2028) | – | 21,67 dager | praksis, sjekkes ikke automatisk | ikke kontrollert |

**Innhold som bygger på kilden**

| Innhold | Type | Punkt | Fil | Din kontroll |
|---|---|---|---|---|
| Slik regnes arbeidsplanen ut (`metode-arbeidsplan`) | forklaring | – | `content/arbeidstid/metoder.yaml` | ikke kontrollert |

## Kontrollspørsmål

Spørsmål om det som er usikkert i hver tekst: om noe kan misforstås, og om praksisen stemmer. Svar gjerne i en kommentar i kontrollsaken, eller skriv til Claude.

**Undervisning** (`bruk-undervisning`, forklaring, ikke kontrollert)

- Er KS-rapporten fra 2025 gjengitt nøytralt?

**Møtetid** (`bruk-motetid`, forklaring, ikke kontrollert)

- Er det riktig å regne møtetiden for 38 uker, uten møter på planleggingsdagene?

**Annen planfestet tid og annet elevrettet arbeid** (`bruk-annen-planfestet`, forklaring, ikke kontrollert)

- Er Utdanningsforbundets krav fra 2025 gjengitt riktig, og bør KS’ syn også nevnes for å være balansert?

**Planleggingsdager** (`bruk-planleggingsdager`, forklaring, ikke kontrollert)

- Er det riktig at timene til planleggingsdagene tas fra annen planfestet tid?

**Funksjoner og andre oppgaver** (`bruk-funksjonstid`, forklaring, ikke kontrollert)

- Er det tydelig at valget om en funksjon utvider planfestet tid eller ikke, er en forenkling i appen?

**Tid læreren disponerer selv** (`bruk-selvdisponert`, forklaring, ikke kontrollert)

- Er punkt 3 gjengitt riktig om hvor og når læreren gjør arbeidet utenom undervisningen?

**Slik regnes arbeidsplanen ut** (`metode-arbeidsplan`, forklaring, ikke kontrollert)

- Er det riktig at funksjoner som ikke utvider planfestet tid, fordeles som undervisning (1150 × prosent planfestet)?
- Er det tydelig nok at samme regel brukes for 57-åringer som for nyutdannede og lærere over 60 år, selv om avtaleteksten ikke sier det uttrykkelig?
- Stemmer utvidelsen av arbeidsåret (timene over 1470 ÷ 7,5 timer per dag) med praksis?
- Stemmer lønn i en periode (hele måneder, og arbeidsdager ÷ 21,67 i brutte måneder) med lønnssystemet?

**Slik regnes beskjeftigelsen ut** (`metode-beskjeftigelse`, forklaring, ikke kontrollert)

- Er omregningen fra økter per uke (økter × minutter ÷ 60 × 38 uker) riktig når skoleukene har ulik lengde?

**Slik regnes vikartimene ut** (`metode-vikar`, forklaring, ikke kontrollert)

- Er det riktig at timevikarer får feriepenger i tillegg til lønnen etter formelen i § 12.4?

**Slik regnes overtiden ut** (`metode-overtid`, forklaring, ikke kontrollert)

- Er det riktig at overtidsbetaling for undervisning er kalkulert tid × timelønn × 1,5?
- Er «Overtid for deltidsansatte er ikke med ennå» fortsatt dekkende, nå som Arbeidsplan regner variabel lønn?

**Arbeidstid** (`arbeidstid`, begrep, ikke kontrollert)

- Er det riktig å si at arbeidstiden består av planfestet tid og tid læreren disponerer selv, også når arbeidsåret er utvidet på grunn av funksjoner?

**Årsverk** (`arsverk`, begrep, ikke kontrollert)

- Stemmer det at forskjellen mellom 1687,5 og 1650 timer er fem arbeidsdager ekstra ferie?
- Er det riktig at planfestet tid er samme andel av årsverket for lærere som er 60 år og eldre (1124,44 timer), eller kan fylket regne annerledes?

**Arbeidsår** (`arbeidsar`, begrep, ikke kontrollert)

- Kan «Arbeidsåret kan også utvides når planfestet tid går over 37,5 timer i uka» leses som at det gjelder alle lærere, og ikke bare ved funksjoner og andre oppgaver etter punkt 5.3?

**Årsramme** (`arsramme`, begrep, ikke kontrollert)

- Er regelen om laveste årsramme for grupper med elever fra ulike program eller nivåer gjengitt riktig og fullstendig?

**Fag merket *** (`stjernefag`, begrep, ikke kontrollert)

- Er «det faktiske antallet elever i klassen» tydelig nok for grupper som ikke er klasser, for eksempel valgfag på tvers av klasser?

**60- og 45-minutters enheter** (`minuttenheter`, begrep, ikke kontrollert)

- Kan det misforstås at kalkulatorene regner i 60-minutters timer når skolen bruker 45-minutters økter?

**Beskjeftigelse** (`beskjeftigelse`, begrep, ikke kontrollert)

- Er formelen årstimer ÷ årsramme × 100 den samme som skolen og Visma InSchool bruker?
- Er forskjellen mellom beskjeftigelse og stillingsprosent forklart godt nok?

**Periodebeskjeftigelse** (`periodebeskjeftigelse`, begrep, ikke kontrollert)

- Er periodenøkkelen (undervisningsdager i perioden ÷ undervisningsdager i skoleåret) forklart slik Visma InSchool regner?

**Planfestet arbeidstid** (`planfestet-arbeidstid`, begrep, ikke kontrollert)

- Er listen over hva planfestet tid først og fremst brukes til, gjengitt riktig etter punkt 5.1?

**Tid læreren disponerer selv** (`selvdisponert-tid`, begrep, ikke kontrollert)

- Er 537,5 timer riktig for en hel stilling uten funksjoner, og er «ikke-planfestet tid» en betegnelse som brukes i fylket?

**For- og etterarbeid** (`for-og-etterarbeid`, begrep, ikke kontrollert)

- Er det riktig at for- og etterarbeid gjøres både i planfestet tid og i tiden læreren disponerer selv?

**Annet elevrettet arbeid** (`annet-elevrettet-arbeid`, begrep, ikke kontrollert)

- Er det nøytralt nok å si at hva som regnes med, ofte avklares lokalt?

**Funksjoner og andre arbeidsoppgaver** (`andre-arbeidsoppgaver`, begrep, ikke kontrollert)

- Er det riktig at tiden læreren disponerer selv, reduseres med samme prosentandel som undervisningen (punkt 5.3)?

**Fast overtid** (`fast-overtid`, begrep, ikke kontrollert)

- Er skillet mellom fast overtid (økt årsramme) og pålagt arbeid ut over oversikten over planfestet tid forklart riktig?

**Planleggingsdager** (`planleggingsdager`, begrep, ikke kontrollert)

- Er det riktig at timene for deltid og perioder, og plasseringen av ferien for lærere over 60 år, avgjøres lokalt?

**Lokale forhandlinger om arbeidstid** (`lokale-forhandlinger`, begrep, ikke kontrollert)

- Er protokollen fra 2026 og listen over hva partene kan avtale lokalt, gjengitt riktig?

**Drøftinger** (`drofting`, begrep, ikke kontrollert)

- Er planleggingsdagene og tidsressurspotten de viktigste eksemplene på drøftinger i SFS 2213?

**Teknisk undertid og teknisk overtid** (`teknisk-undertid-overtid`, begrep, ikke kontrollert)

- Er «teknisk undertid» og «teknisk overtid» begrepene fylket bruker?
- Er det tydelig at variabel lønn bare gjelder stillinger under 100 %?

**Livsfasetiltak (redusert undervisning)** (`livsfasetiltak`, begrep, ikke kontrollert)

- Er det riktig at den frigjorte tiden for nyutdannede og lærere over 60 år legges i planfestet tid, og er det tydelig at 57-åringer ikke er nevnt i den regelen?

**Kontaktlærer** (`kontaktlaerer`, begrep, ikke kontrollert)

- Er det riktig å gjøre 28,5 årsrammetimer om til prosent med årsrammen 607,5 (4,69 %)?

**Godtgjøring for funksjoner** (`funksjonsgodtgjoring`, begrep, ikke kontrollert)

- Er det riktig at tillegget for funksjoner er pensjonsgivende?
- Har fylket egne satser for andre funksjoner som appen bør vise når fylket er valgt?

**Kalkulert tid** (`kalkulert-tid`, begrep, ikke kontrollert)

- Er «kalkulert tid» et begrep som brukes i Visma InSchool eller lønnssystemet, eller bør det stå at det er appens navn?

**Variabel lønn** (`variabel-lonn`, begrep, ikke kontrollert)

- Er det nøytralt å si at overtidstillegg for deltidsansatte er omstridt mellom partene?
- Betaler fylket fortsatt variabel lønn som vikartimer uten overtidstillegg?

**Delt dagsverk** (`delt-dagsverk`, begrep, ikke kontrollert)

- Er delt dagsverk (arbeidsdagen strekker seg over 9 timer eller mer) beskrevet riktig etter hovedtariffavtalen § 5.5?

**Fagmerknader (FAM-koder)** (`fagmerknader`, begrep, ikke kontrollert)

- Er det riktig å beskrive fagmerknader som merknader ved et fag på vitnemål og kompetansebevis, og ikke på andre dokumenter?
- Stemmer det at tekst i vinkelparentes, f.eks. <åååå> og <fagkode>, fylles ut for hver elev?
- Er det nyttig å vise de utgåtte kodene (sammenlagt nederst), eller bør de skjules helt?

**Vitnemålsmerknader (VMM-koder)** (`vitnemalsmerknader`, begrep, ikke kontrollert)

- Er skillet riktig: vitnemålsmerknader gjelder hele vitnemålet, fagmerknader gjelder et enkelt fag?
- Brukes vitnemålsmerknadene også på kompetansebevis, eller bare på vitnemål?

