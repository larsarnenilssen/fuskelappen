# 085 – Varsler til eier

**Kontekst:** Eier vil få vite det hver gang noe har gått galt eller bør ses på, men ikke når alt virker. Varslene skal forklare problemet godt nok til at eier kan løse det eller be Claude om hjelp. Har eier gått glipp av e-poster en stund, skal feilen ikke gå tapt: det som ikke løser seg selv, skal komme igjen (eier 07.10.2026). Før dette fikk kontrollsaken bare en kommentar om at noe var nytt, lenkesaken ga e-post bare da den ble laget, og en arbeidsflyt som feilet, ga bare GitHubs korte e-post. En nyhetskilde som sluttet å virke, ble meldt først neste mandag.

**Valg:**
- **Alle varsler er saker på GitHub, med samme regel** (`scripts/varsel/plan.ts`): saken lages når noe er galt, og får en kommentar med det nye øverst og hele listen under når noe nytt kommer til. Står noe åpent uten at noe nytt kommer til, kommer en påminnelse med hele listen. Saken lukkes med en kort kommentar når alt er i orden. Et merke nederst i saken husker når den ble laget, når eier sist fikk e-post og hvilke punkter som var med. Datoer og «N ganger på rad» regnes ikke som noe nytt.
- **Sakene:**
  - `kontroll` (mandag, påminnelse annenhver uke)
  - `lenker` (mandag, annenhver uke)
  - `nyheter`: nyhetskilder som ikke har kunnet hentes på mer enn to dager, oppdatert hver morgen, påminnelse hver uke
  - `feil`: én sak per arbeidsflyt som har feilet, påminnelse hver uke
- **Feil i automatikken:** Kildesjekk, Nyheter, Sett versjonstag, CI på main og Godkjenning har en siste jobb som kaller `.github/workflows/varsle.yml`. Saken sier:
  - hva arbeidsflyten gjør og hva feilen betyr for appen
  - hvilken jobb og hvilket steg som feilet, med et utdrag av loggen
  - hva eier gjør

  Steg i kildesjekken som får feile uten at jobben stopper (Grep, lenkesjekken og endringsforslagene), meldes også. Skriptet kjøres med Node uten `npm ci`.
- **Nyhetskildene** står ikke lenger under «Kilder som ikke kunne sjekkes» i kontrollsaken, fordi de har egen sak.
- **Kontrollrundene** har kildene som stenger for kildesjekken og sjekkes for hånd (`SJEKKES_FOR_HAND`): særavtalesiden hos KS og sidene på vestlandfylke.no.

**Konsekvens:** Hver e-post kan leses alene, og en feil som ikke løser seg selv, kommer igjen hver eller annenhver uke til den er løst. Når det går bra, kommer ingen e-post, unntatt den korte kommentaren når en sak lukkes. GitHubs egen e-post om arbeidsflyter som feiler, kommer fortsatt. Eier kan slå den av under GitHub → Settings → Notifications → Actions. Slik behandler eier sakene: `docs/EIER.md`, punkt 6b.

**Endret 09.10.2026:** «Publiser» og oppetiden har også saker med etiketten `feil`, og saken ber eier sende lenken til Claude med en gang når feilen ligner en formatendring hos en kilde (avgjørelse 099).

**Endret 09.10.2026:** Linjene mellom `<!-- uten-varsel -->` og `<!-- /uten-varsel -->` teller ikke som punkter. Der står ukens kontroll i kontrollsaken. Den gir verken kommentar eller påminnelse, men holder saken åpen (avgjørelse 106).
