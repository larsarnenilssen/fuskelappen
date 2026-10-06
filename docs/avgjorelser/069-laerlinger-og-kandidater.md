# 069 – Lærlinger og kandidater: veiene og overgangene som innhold

**Kontekst:** Eier ville ha veiene til fag- og svennebrev, praksisbrev og kompetansebevis i Opplæringstilbud. Veiene skulle kunne kombineres og byttes mellom, med kilde på hver overgang, og testes som veiviserne (fase 6, pakke 6, runde 3 og 4 i `docs/arbeidsordrer/fase-6-forslag.md` og fire designrunder i `fase-6-pakke-6-forslag.md`, 04. og 06.10.2026).

**Valg:**
- **Siden:**
  - «Lærlinger og kandidater» (`#/opplaeringslop/laerlinger-og-kandidater`). Rollene står først i tittel og tekst, og fag- og svennebrev er det veiene ender i (eier 06.10.2026).
  - Tre faner: «Veiene», «Sammenlign» og «Bytte vei». Fanen og valgene står i adressen.
  - Hver vei har sin egen side, med prøven «I Vurdering» først og «Kommer fra» og «Veien videre».
  - Prøvesiden i Vurdering har «Veiene hit» som et lukket kort.
- **Innholdet:** To nye elementtyper, `vei` og `utgangspunkt`, i `content/opplaeringslop/veier.yaml`.
  - En overgang går fra et utgangspunkt til en vei eller en side, med vilkår og minst én kilde (skjemaet krever det).
  - «Veien videre» er overgangene fra utgangspunktet i `etter`.
  - Kildene vises med kortnavn og punkt, og lenker til paragrafen i Lov og forskrift.
- **Bare det kildene sier** (eier 06.10.2026):
  - Voksne, tid i stegene og fellesfag står bare der en kilde sier det. Ellers sier teksten at forskriften ikke har noen egen regel.
  - Merknadene hos Udir brukes som forklaring, men hjemmelen er lovteksten. Merknadenes henvisning til ol. § 7-7 tredje ledd gjengis ikke.
- **Utseendet:**
  - Stegene har fargen til delen (skole blå, bedrift rav, praksis grønn, prøven bær), og delen står også i teksten.
  - De står som en loddrett sti når kolonnen er smal, og som en rad når det er plass (container query, 34rem).
  - Fra 64rem står «Veiene» (listen og den valgte veien), «Bytte vei» og siden for hver vei i to kolonner, og siden er opptil 72rem bred.
- **Felles komponent:** `components/Lukketkort.tsx`, et lukket kort for innhold som ikke er et innholdselement.

**Konsekvens:**
- En ny vei eller overgang legges til i YAML-filen uten kodeendringer. `tests/content/veier.test.ts` fanger overganger uten kilde og veier som ikke kan nås.
- Søket finner siden på «fag- og svennebrev», og hver vei.
- Tekster med regler (oppsigelse og heving, kompetansebevis for elever) står i `content/`, ikke i `src/strings/`.
