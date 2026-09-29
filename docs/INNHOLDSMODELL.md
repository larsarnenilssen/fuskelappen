# Innholdsmodell

Skjemaene er definert med zod i `src/core/innhold/skjema.ts` og `src/core/regler/skjema.ts`. De valideres ved bygg og i innholdstestene (`tests/content/`). Tekstfelt kan inneholde Markdown.

## Innholdselement (`content/<modul>/*.yaml`)

En fil kan inneholde ett element eller en liste.

| Felt | Påkrevd | Innhold |
|---|---|---|
| `id` | ja | små bokstaver a–z, tall og bindestrek |
| `type` | ja | `begrep`, `regel`, `forklaring`, `steg`, `frist`, `kildeomtale` |
| `tittel` | ja | `{ nb, nn }`, begge påkrevd |
| `tekst` | ja | `{ nb, nn }`, begge påkrevd, Markdown tillatt |
| `kildetekst` | nei | sitat fra kilden, uoversatt: `{ spraak: nb \| nn \| se \| en, tekst }` |
| `gyldighet` | nei | `{ niva: nasjonal }` (standard), `{ niva: fylke, fylke, forhold }` eller `{ niva: skole, fylke, skole, forhold }`. `forhold` er `erstatter` eller `supplerer` |
| `kilder` | ja | minst én `{ id, punkt?, url? }`. `id` må finnes i `content/kilder.yaml` |
| `kontrollert` | ja | `null` eller `{ dato: ÅÅÅÅ-MM-DD }`. **Settes bare av eier.** |
| `stikkord` | nei | ekstra søkeord |
| `relatert` | nei | id-er til annet innhold (må finnes) |

Frister (`type: frist`) har i tillegg `modul`, `malgruppe` (`skoleleder`, `laerer`) og enten `dato` eller `regel` (`{ type: arlig, dag, maned }`).

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
| `utkast` | `kontrollert: null` |
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
```

- Et regelsett kan deles på flere filer med samme `id`, `regelverk`, periode og gyldighet, og hver sin `del` (f.eks. `del: arsrammer`). Delene slås sammen ved lasting, og en verdinøkkel kan bare stå i én del.
- `verdi` kan være et tall, en tekst, sann/usann, en liste eller en **tabell**: en liste av rader med enkle celler. Vedlegg 1 til SFS 2213 ligger slik i `rules/sfs2213/arsrammer-2026-2027.yaml`, med én rad per fag, utdanningsprogram og trinn (`t60`, `t45`, `kategori`, `fag`, `program`, `trinn`, `stjerne`).
- Verdier leses bare gjennom `hentVerdi('regelverk.nokkel', kontekst)`.
- Nasjonale perioder for samme regelverk kan ikke overlappe. Det testes.
- Verdier med `kontrollert: null` vises med merket «ikke kontrollert».

## Kilderegister (`content/kilder.yaml`)

| Felt | Innhold |
|---|---|
| `id`, `navn`, `utgiver`, `url` | identifikasjon |
| `type` | `side`, `lovdata-datasett`, `grep`, `data` |
| `niva`, `fylke` | `nasjonal`, `fylke` eller `skole`. Lokale kilder har fylke |
| `lisens` | f.eks. `NLOD 2.0`, eller «Opphavsrett … Lenkes, kopieres ikke.» |
| `sjekkmetode` | `side`, `kf-infoserie`, `fil`, `lovdata`, `grep`, `nsr` eller `ingen` |
| `aktiv` | om kildejobben sjekker kilden nå. Kilder aktiveres i fasen der de tas i bruk |
| `uttrekk` | for `side` og `lovdata`: `selektor` (CSS), valgfritt `inneholder` (tekst treffet må ha) og `fjern` (selektorer som fjernes først) |
| `godkjent_fingeravtrykk` | `sha256:…` eller `null`. **Oppdateres bare etter beskjed fra eier.** |
| `faser`, `merknad` | dokumentasjon |

## Andre filer

- `content/fylker.yaml`: fylkene (nummer og navn) med kilde.
- `content/sok/synonymer.yaml`: par av nynorsk variant og bokmålsform for søket.
- `data/`: genererte data (`status/kildestatus.json`, `skoler/vgs.json`, `grep/programomrader.json`). Endres bare av skript.
