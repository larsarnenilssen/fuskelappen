# Fasittester

Eiergodkjente eksempler med input, forventet svar og begrunnelse. **Endres aldri uten eiers godkjenning.**
Feiler en fasittest, er det koden eller regelsettet som skal undersøkes.

Hvert regelverk får sin egen mappe, f.eks. `tests/fasit/sfs2213/`. Hvert eksempel er én YAML-fil:

```yaml
id: sfs2213-001
beskrivelse: Kort beskrivelse av situasjonen (anonymisert)
godkjent: { av: eier, dato: 2026-09-29 }
kalkulator: beskjeftigelse
input: { ... }
forventet: { ... }
begrunnelse: Hvorfor svaret er riktig, med henvisning til kilden.
```

`fasit.test.ts` regner ut hvert eksempel med regelfilene i `rules/` og datoen i `godkjent` (eller `input.dato`),
og sammenligner med `forventet` avrundet til to desimaler. Mellomregningene er uavrundede.

## Input og forventet per kalkulator (SFS 2213)

Årsrammer oppgis som rader i vedlegg 1: `{ fag, program, trinn }`, skrevet slik vedlegget gjør (f.eks.
`{ fag: Engelsk, program: Stud.spes, trinn: Vg1 }`). For felles programfag er `fag: null`. Flere rader betyr
elever fra ulike program eller nivåer i samme time (laveste årsramme brukes).

| kalkulator | input | forventet |
|---|---|---|
| `beskjeftigelse` | `grupper: [{ arsrammer, elever, arstimer }]` | `beskjeftigelse`, `arsramme` (første gruppe) |
| `periode` | `grupper: [{ arsrammer, elever, timer }]`, `dager_i_perioden`, `dager_i_skolearet` | `beskjeftigelse` |
| `planfestet` | `reduksjon: { prosent }` eller `{ arsrammetimer }` | `funksjonsprosent`, `planfestet`, `per_uke`, `utvidelse_dager` |
| `vikar-fast` | `arsrammer`, `elever`, `okter`, `minutter` | `endring` |
| `timevikar` | som `vikar-fast`, pluss `lonn: { stillingsgruppe, ansiennitet }` eller `{ arslonn }`, `over60` | `kalkulert_tid`, `timelonn`, `lonn`, `feriepenger`, `samlet` |
| `stillingsplan` | `stilling`, `grupper: [{ arsrammer, elever, arstimer }]`, `funksjoner: [{ prosent }]` | `undervisning`, `beskjeftigelse`, `differanse` (minus er teknisk undertid), `timer_fag_1`, `timer_fag_2` … (differansen i årsrammetimer med årsrammen i gruppe 1, 2 …) |

Bare nøklene som står under `forventet`, sjekkes.
