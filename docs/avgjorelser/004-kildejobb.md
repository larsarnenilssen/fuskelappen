# 004 – Kildejobb, fingeravtrykk og varsling

**Kontekst:** Kildene skal sjekkes ukentlig, endringer og feil skal varsles til eier som GitHub-issues, og appen skal vise kildestatus og «utdatert» (3.9). Eier har bestemt at kildene aktiveres i fasen der de tas i bruk, og at kildestatusen på Pages skal holdes fersk ukentlig.

**Valg:**
- Sjekkmetoder per kilde. Fase 0 aktiverer `nsr` (skolelisten) og `side` for KS-oversikten over særavtaler. `lovdata` og `grep` lages i fase 1 og 2.
- `side` sammenligner bare utvalgt, normalisert tekst (`uttrekk.selektor`, eventuelt `inneholder`), ikke hele HTML-en, for å unngå falske varsler. HTML leses med `node-html-parser` (ny utviklingsavhengighet, bare i skript).
- Uten `godkjent_fingeravtrykk` gir første kjøring status `endret` og en sak med fingeravtrykket til godkjenning. Det følger lukkeprosessen i 3.9.
- Én sak per kilde, gjenkjent med en skjult merkelapp i saksteksten. Saken oppdateres når tilstanden endres, og lukkes automatisk når kilden er i orden igjen.
- Strukturerte data (NSR, senere Grep) oppdateres automatisk. De gir sak bare ved feil, med endringsrapport i jobbsammendraget.
- Kildejobben publiserer siste tag på nytt med fersk `kildestatus.json`. Koden på Pages endres fortsatt bare ved ny tag.
- GitHub-API-et kalles med `fetch` og `GITHUB_TOKEN`, uten ekstra bibliotek. Lokalt er varslingen en tørrkjøring.

**Konsekvens:** Lovdata og kf-infoserie.no (der selve SFS 2213-teksten ligger) er ikke tilgjengelige fra skyøktene. De sjekkes derfor bare fra GitHub Actions, og det må vurderes når kildene aktiveres i fase 1.
