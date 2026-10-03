# 049 – Felles datalag

**Kontekst:** Gjennomgangen i avgjørelse 048 fant at de samme dataene fra kildene ble lagret eller lest flere steder: tre Grep-filer fra fase 1 var avledet av samme henting som fagindeksen, lastingen av fagindeks, fag- og timefordeling og merknader sto i flere moduler, skriptene leste filene hver for seg, og poengberegningen fant tabellene i Udir-1 med nummer mens Opplæringsløp brukte tittelen. Eier ba 03.10.2026 om at forslagene gjennomføres.

**Valg:**
- **Fagsøket lages fra fagindeksen** når appen bygges (`virtual:fagsok`, `src/modules/arbeidstid/fagsokdata.ts`). `data/grep/programomrader.json`, `fagkoder.json` og `arstimer.json` er slettet. Fagkoder i årstimetabellen som er utgått i Grep (SPR3023, SPR3024), får ingen årstimer fra Grep; testen lister dem.
- **Fingeravtrykket for Grep** i kildesjekken er fagindeksen uten tidspunktet for hentingen.
- **`src/data/`** har all lasting av data fra kildene i appen: `grep.ts`, `fagfordeling.ts`, `udir.ts`, `vigo.ts` og `skolear.ts` (skoleåret og valget av fag- og timefordeling). Hver laster lastes én gang og deles (`enGang`). Modulene gir dem videre i stedet for å laste selv. Se `src/data/README.md`.
- **`scripts/data/les.ts`** leser de samme filene for skriptene og Vite-pluginene.
- **Udir-1 leses med tittel:** Poengberegningen finner tabellene med navnet på utdanningsprogrammet i tittelen, ikke med tabellnummeret. Navnene testes mot Grep.
- **Faste periodenavn:** Koblingsfilen heter nå `rules/sfs2213/kobling-fagkode-2026-2027.yaml`, som de andre regelfilene for perioden. Skriptene finner regelsett og fag- og timefordeling etter dato.

**Konsekvens:** Hver opplysning fra kildene står ett sted og hentes ett sted. Et nytt rundskriv med andre tabellnumre krever ingen kodeendring så lenge titlene er de samme. Startpakken øker med under 1 kB (85,6 kB), fordi de små lasterne nå er egne filer som deles mellom modulene.
