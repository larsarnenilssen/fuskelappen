# Innholdsmodell

Skjemaene er definert med zod i `src/core/innhold/skjema.ts` og `src/core/regler/skjema.ts`. De valideres ved bygg og i innholdstestene (`tests/content/`). Tekstfelt kan inneholde Markdown.

## Innholdselement (`content/<modul>/*.yaml`)

En fil kan inneholde ett element eller en liste.

| Felt | Påkrevd | Innhold |
|---|---|---|
| `id` | ja | små bokstaver a–z, tall og bindestrek |
| `type` | ja | `begrep`, `regel`, `forklaring`, `steg`, `frist`, `kildeomtale`, `veiviser`, `vei`, `utgangspunkt` |
| `tittel` | ja | `{ nb, nn }`, begge påkrevd |
| `tekst` | ja | `{ nb, nn }`, begge påkrevd, Markdown tillatt |
| `kildetekst` | nei | sitat fra kilden, uoversatt: `{ spraak: nb \| nn \| se \| en, tekst }` |
| `gyldighet` | nei | `{ niva: nasjonal }` (standard), `{ niva: fylke, fylke, forhold }` eller `{ niva: skole, fylke, skole, forhold }`. `forhold` er `erstatter` eller `supplerer` |
| `kilder` | ja | minst én `{ id, punkt?, url? }`. `id` må finnes i `content/kilder.yaml` |
| `kontrollert` | ja | `null` eller `{ dato: ÅÅÅÅ-MM-DD }`. **Settes bare av eier.** |
| `kontrollsporsmal` | ja i `content/` | 1–5 spørsmål til eier (bokmål) om det som er usikkert i teksten: om noe kan misforstås, eller om en praksis stemmer. Vises bare i kontrolloversikten og kontrollsakene, ikke i appen (avgjørelse 019). Under spørsmålene står kildene elementet viser til, med lenke og punkt, så eier kan sjekke svaret der. Minst én kilde må ha `punkt` eller `url` |
| `stikkord` | nei | ekstra søkeord |
| `relatert` | nei | id-er til annet innhold (må finnes) |
| `lenkeord` | nei | bare begreper: ordene som lenker til begrepet i brødtekst, når tittelen ikke er ordet i teksten. `{ nb: [], nn: [] }` slår lenkingen av (avgjørelse 050) |
| `kodeliste` | nei | kodeliste fra VIGO Kodeverksbase som vises under teksten, med søk: `fagmerknader` eller `vitnemalsmerknader` (avgjørelse 026) |
| `privatskole` | nei | det som er ulikt for privatskoler: `{ tekst, kilder }`, med kildene i privatskolelova eller privatskoleforskrifta. Vises i kortet eller steget når brukeren har valgt «Privatskole» (avgjørelse 075) |

Frister (`type: frist`) har i tillegg `modul`, `malgruppe` (`skoleleder`, `laerer`) og enten `dato` eller `regel` (`{ type: arlig, dag, maned }`).

Veivisere (avgjørelse 041): en veiviser (`type: veiviser`) har i tillegg `start` (id til første steg), `faser` (`{ id, tittel }`), `farge` (`blaa`, `lilla`, `turkis` eller `rav`, avgjørelse 042) og `rekkefolge` (plassen på oversikten). Et steg (`type: steg`) har `veiviser` (id) og kan ha `fase`, `ansvar`, `dokumentasjon`, `frist`, `fristKort` (to–tre ord til merket i kartet), `forklaring` (Markdown, skjult til den åpnes), `paragrafer` (`dokument/nummer` i Regelverk), `laereplaner` (`[{ kode, kompetansegivende, merknad }]`, vises i en boks med fagkodene fra Grep) og enten `neste` (id) eller `sporsmal` (`{ tekst, svar: [{ id, tekst, neste }] }`). Et steg uten `neste` og `sporsmal` er et utfall, der veien ender. Testene sjekker at alle steg kan nås, at ingen peker på steg som ikke finnes, at paragrafene finnes, og at læreplanene finnes i Grep og er kompetansegivende bare når fagene har tallkarakter.

Veiene for lærlinger og kandidater (avgjørelse 069, `content/opplaeringslop/veier.yaml`):
- **Vei (`type: vei`):** id-en begynner med `vei-`, og adressen er id-en uten det. I tillegg til de vanlige feltene:
  - `mal`: `fagbrev`, `praksisbrev` eller `kompetansebevis`
  - `kortnavn`: til knappen «Mer om …»
  - `kort`: én linje i listen
  - `steg`: `[{ del: skole | bedrift | praksis | prove, tekst, tid?, rute }]`, der `tid` bare står når kilden sier hvor lang tid steget tar
  - `kontrakt`, `prove`, `melderOpp`, `fellesfag` (`ja`, `nei` eller `ingen` egen regel), `fellesfagTekst`, `dokumentasjon`, `voksne` (bare når kildene sier noe om voksne), `etter` (utgangspunktet når veien er gått) og `rekkefolge`
  - `tekst` er ingressen.
- **Utgangspunkt (`type: utgangspunkt`):** id-en begynner med `fra-`. Det har `overganger`: `[{ til | side, vilkar, kilder }]`. `til` er en vei, og `side` er `{ tittel, rute }` til en annen side i appen. Hver overgang har minst én kilde, og utgangspunktet har kildene til alle overgangene sine i `kilder`.
- **Testene sjekker:**
  - at alle veier kan nås
  - at overgangene peker på noe som finnes
  - at ingen overgang mangler kilde
  - at kildene har punkt, og at paragrafene finnes i Regelverk
  - at stegene lenker til sider og begreper som finnes

Samme `id` kan finnes på flere nivåer. Da erstatter det mest lokale elementet det mer generelle (`forhold: erstatter`).

```yaml
# Eksempel på formatet. Teksten er ikke kontrollert innhold.
- id: arsramme
  type: begrep
  tittel: { nb: Årsramme, nn: Årsramme }
  tekst:
    nb: Antall timer undervisning i et fag som utgjør en full stilling.
    nn: Talet på timar undervisning i eit fag som utgjer ei full stilling.
  kilder: [{ id: ks-sfs2213, punkt: "Vedlegg 1" }]
  kontrollert: null
  stikkord: [årstimer, beskjeftigelse]
```

### Status

Status beregnes automatisk (`beregnStatus()` i `src/core/innhold/status.ts`):

| Status | Når |
|---|---|
| `utkast` | `kontrollert: null` (vises ikke med merke, se avgjørelse 016) |
| `kontrollert` | kontrollert av eier |
| `kilde_endret` | en kilde har status `endret` etter kontrolldatoen |
| `bor_kontrolleres` | kontrollert for mer enn 12 måneder siden |

## Regelsett (`rules/<regelverk>/*.yaml`)

```yaml
# Eksempel på formatet (fra OPPDRAG.md). Verdiene legges inn og kontrolleres i fase 1.
id: sfs2213-2026-2027
regelverk: sfs2213
gyldig_fra: 2026-01-01
gyldig_til: 2027-12-31
kilde: ks-sfs2213
gyldighet: { niva: nasjonal }      # standard; lokale sett: { niva: fylke, fylke: "46", forhold: erstatter }
verdier:
  arsverk_timer:
    verdi: 1687.5
    enhet: timer
    kilde: { id: ks-sfs2213, punkt: "4" }
    kontrollert: null              # settes av eier
    sitat: "utføres innenfor et årsverk på 1687,5 timer (1650 timer for lærere som er 60 år og eldre)"
  arbeidsdager_per_uke:
    verdi: 5
    kilde: { id: ks-sfs2213, punkt: "5.1" }
    kontrollert: null
    grunnlag: avledet              # avledet eller praksis når verdien ikke står i kilden
    merknad: 37,5 timer per uke ÷ 7,5 timer per dag.
```

- Et regelsett kan deles på flere filer med samme `id`, `regelverk`, periode og gyldighet, og hver sin `del` (f.eks. `del: arsrammer`). Delene slås sammen ved lasting, og en verdinøkkel kan bare stå i én del.
- `verdi` kan være et tall, en tekst, sann/usann, en liste eller en **tabell**: en liste av rader med enkle celler. Vedlegg 1 til SFS 2213 ligger slik i `rules/sfs2213/arsrammer-2026-2027.yaml`, med én rad per fag, utdanningsprogram og trinn (`t60`, `t45`, `kategori`, `fag`, `program`, `trinn`, `stjerne`).
- Verdier leses bare gjennom `hentVerdi('regelverk.nokkel', kontekst)`.
- `sitat`: et kort, ordrett utdrag fra kilden (høyst 200 tegn) der tallet står slik kilden skriver det, f.eks. «1687,5» eller «kr. 12 000». Kildejobben ser etter sitatet hver uke (verdisjekken, avgjørelse 017). Alle tall fra en kilde som kildejobben leser, må ha sitat. Det testes, og det testes at sitatet inneholder verdien.
- `grunnlag`: `avledet` (regnet ut fra andre verdier) eller `praksis` (praksis eier har beskrevet). Slike verdier har ikke sitat, men en `merknad` som forklarer grunnlaget. Uten `grunnlag` står verdien i kilden.
- Tabeller og lister har ikke sitat. De kontrolleres med egne tester, f.eks. at 45-minutters årsrammen er 60-minutters årsrammen × 4/3 i hver rad. Vedlegg 1 og garantilønnen sjekkes også rad for rad mot kilden hver uke (avgjørelse 018).
- Nasjonale perioder for samme regelverk kan ikke overlappe. Det testes.
- Verdier med `kontrollert: null` vises uten merke. Brukserklæringen under «Om appen» og setningen nederst på forsiden sier at appen er utviklet privat og kan ha feil (avgjørelse 016).

## Praksis og tolkninger (`content/kontroll/praksis.yaml`)

Det appen bygger på uten at det står i kildene, f.eks. 21,67 arbeidsdager per måned og 45 timer planleggingsdager for alle. Eier bekrefter punktene i kontrollrundene i mai og august (avgjørelse 019).

| Felt | Innhold |
|---|---|
| `id`, `tittel` | identifikasjon |
| `sporsmal` | spørsmålet eier skal svare på |
| `appen` | hva appen gjør |
| `grunnlag` | hvem som har bestemt det, og når |
| `berorer` | regelverdier (`regelsett/nøkkel`) og innhold (`id`) som bygger på praksisen. Må finnes (testes) |
| `bekreftet` | `null` eller `{ dato }`. **Settes bare av eier.** |

Regelverdier med `grunnlag: praksis` må stå i listen. Det testes.

## Kilderegister (`content/kilder.yaml`)

| Felt | Innhold |
|---|---|
| `id`, `navn`, `utgiver`, `url` | identifikasjon |
| `type` | `side`, `lovdata-datasett`, `grep`, `data` |
| `niva`, `fylke` | `nasjonal`, `fylke` eller `skole`. Lokale kilder har fylke |
| `lisens` | f.eks. `NLOD 2.0`, eller «Opphavsrett … Vilkår for gjenbruk er ikke avklart. Lenkes, kopieres ikke.» når vilkårene ikke er undersøkt (eier 02.10.2026) |
| `sjekkmetode` | `side`, `kf-infoserie`, `fil`, `lovdata`, `grep`, `nsr` eller `ingen` |
| `aktiv` | om kildejobben sjekker kilden nå. Kilder aktiveres i fasen der de tas i bruk |
| `uttrekk` | for `side` og `lovdata`: `selektor` (CSS), valgfritt `inneholder` (tekst treffet må ha) og `fjern` (selektorer som fjernes først) |
| `godkjent` | Datoen eier godkjente at kilden kan brukes i appen, eller `null` (avgjørelse 089). **Settes bare av eier.** Vises ikke i appen. |
| `godkjent_fingeravtrykk` | `sha256:…` eller `null`: innholdet eier sist har gått gjennom. Uten det sammenlignes det med det kildesjekken så første gang. **Oppdateres bare etter beskjed fra eier.** |
| `faser`, `merknad` | dokumentasjon |

## Andre filer

- `content/fylker.yaml`: fylkene (nummer og navn) med kilde.
- `content/sok/synonymer.yaml`: par av nynorsk variant og bokmålsform for søket.
- `data/`: genererte data (`status/kildestatus.json`, `skoler/vgs.json`, `grep/fagindeks.json`, `grep/laereplaner/`). Endres bare av skript.
