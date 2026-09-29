# Kilder

<!-- Generert fra content/kilder.yaml med `npm run kilder:dokumenter`. Ikke rediger for hånd. -->

Kildene appen bygger på. Kildejobben (`.github/workflows/kilder.yml`) sjekker de aktive kildene hver uke og varsler eier ved endring eller feil. Se `docs/ARKITEKTUR.md`.

| Kilde | Utgiver | Nivå | Type | Lisens | Sjekk | Faser |
|---|---|---|---|---|---|---|
| [SFS 2213 Arbeidstidsavtalen for undervisningspersonalet, med vedlegg og protokoller](https://www.ks.no/fagomrader/lonn-og-tariff/saravtaler/) | KS | nasjonal | side | Opphavsrett KS. Lenkes, kopieres ikke. | side | 1, 2, 3 |
| [Hovedtariffavtalen](https://www.ks.no/fagomrader/lonn-og-tariff/hovedtariffavtalen/) | KS | nasjonal | side | Opphavsrett KS. Lenkes, kopieres ikke. | side (ikke aktiv) | 1, 3 |
| [Lov om arbeidsmiljø, arbeidstid og stillingsvern mv. (arbeidsmiljøloven)](https://lovdata.no/lov/2005-06-17-62) | Lovdata | nasjonal | lovdata-datasett | NLOD 2.0 | lovdata (ikke aktiv) | 1, 3 |
| [Lov om grunnskoleopplæringa og den vidaregåande opplæringa (opplæringslova)](https://lovdata.no/lov/2023-06-09-30) | Lovdata | nasjonal | lovdata-datasett | NLOD 2.0 | lovdata (ikke aktiv) | 4, 5, 6, 7, 8 |
| [Forskrift om grunnskoleopplæringa og den vidaregåande opplæringa (opplæringsforskrifta), med vurderingsreglane](https://www.udir.no/regelverkstolkninger/opplaring/forskrift-om-grunnskoleopplaringa-og-den-vidaregaande-opplaringa-opplaringsforskrifta/) | Lovdata | nasjonal | lovdata-datasett | NLOD 2.0 | lovdata (ikke aktiv) | 4, 5, 6, 7, 8 |
| [Grep – fag, læreplaner, vurderingsordninger og årstimetall](https://data.udir.no/kl06/v201906/) | Utdanningsdirektoratet | nasjonal | grep | NLOD 2.0 | grep (ikke aktiv) | 2, 3, 6 |
| [Veileder om tilpasset opplæring og individuell tilrettelegging](https://www.udir.no/regelverk-og-tilsyn/skole-og-opplaring/veileder-for-tilpasset-opplaring-og-individuell-tilrettelegging/) | Utdanningsdirektoratet | nasjonal | side | NLOD 2.0 | side (ikke aktiv) | 4 |
| [Overordnet del – verdier og prinsipper for grunnopplæringen](https://www.udir.no/lk20/overordnet-del/) | Utdanningsdirektoratet | nasjonal | side | NLOD 2.0 | side (ikke aktiv) | 4, 6 |
| [Lokal forskrift om inntak til vidaregåande opplæring, Vestland fylkeskommune](https://www.vlfk.no/) | Vestland fylkeskommune (Lovdata) | fylke (46) | side | NLOD 2.0 | lovdata (ikke aktiv) | 5 |
| [Skulereglar for dei vidaregåande skulane i Vestland fylkeskommune](https://www.vlfk.no/) | Vestland fylkeskommune (Lovdata) | fylke (46) | side | NLOD 2.0 | lovdata (ikke aktiv) | 7 |
| [vlfk.no – sider om inntak, tilrettelegging og språkopplæring](https://www.vlfk.no/) | Vestland fylkeskommune | fylke (46) | side | Opphavsrett Vestland fylkeskommune. Lenkes, kopieres ikke. | side (ikke aktiv) | 4, 5 |
| [Nasjonalt skoleregister (NSR)](https://data-nsr.udir.no/) | Utdanningsdirektoratet | nasjonal | data | NLOD 2.0 | nsr | 0 |
| [Standard for fylkesinndeling](https://www.ssb.no/klass/klassifikasjoner/104) | Statistisk sentralbyrå | nasjonal | side | NLOD 2.0 | ingen | 0 |

## Merknader

- **ks-sfs2213:** Fase 0 sjekker KS-oversikten over særavtaler. Selve avtaleteksten ligger hos KF Infoserie og får egen sjekk i fase 1.
- **opplaeringsforskrifta:** Lenken går foreløpig til Udirs gjengivelse. Lovdata-adressen settes når kilden aktiveres.
- **vlfk-forskrift-inntak:** Adressen til forskriften på Lovdata settes når kilden aktiveres i fase 5.
- **vlfk-skulereglar:** Adressen til forskriften på Lovdata settes når kilden aktiveres i fase 7.
- **vlfk-sider:** Hvilke sider som sjekkes, bestemmes når kilden aktiveres.
- **udir-nsr:** Skolelisten i innstillingene. Oppdateres automatisk; varsel bare ved feil.
- **ssb-fylkesinndeling:** Fylkeslisten i content/fylker.yaml. Endres sjelden og oppdateres for hånd.
