# Fase 6, pakke 3: Eksamen og klage – overlevering (04.10.2026)

Start en ny samtale med: «Les docs/arbeidsordrer/fase-6-pakke-3.md og start pakke 3.» Les også `AGENTS.md`, `docs/arbeidsordrer/fase-6.md` og `docs/arbeidsordrer/fase-6-forslag.md` (delene «Pakke 3: Eksamen og klage», «Nye begreper til begrepsbanken» og alle svarene fra eier).

## Levert så langt

- **0.31.0:** fase 6, pakke 1, modulen **Vurdering** (avgjørelse 054). Regelverk og kilder står som lukkede rader nederst i alle kort (`Kortfot`). Bare de berørte ende-til-ende-testene kjøres lokalt, og hele suiten kjøres i CI med åtte jobber (avgjørelse 055).
- **0.32.0:** forsiden kan tilpasses, og toppfeltet erstatter bunnmenyen (avgjørelse 056).
- **0.33.0:** fase 6, pakke 2, **Fraværsgrensen** (avgjørelse 057):
  - Kalkulatoren `#/vurdering/fravaer?fag=…` med regler i `rules/vurdering/2025.yaml`, beregning i `src/modules/vurdering/beregning/fravaer.ts` og fasittestene FR1–FR8 i `tests/fasit/vurdering/`.
  - VIGO `courses` og `fam-connected-to-course`: sentralt eller lokalt gitt eksamen, sensur og fagmerknader i `data/vigo/fagrelasjoner.json` (`vurdering`), og kontroll av årstimetall og trekkordning fra Grep (`avvik`, i kontrollsaken og på fagarket).
  - Fagarket har boksen «Fravær og eksamen» med lenkene «I Vurdering». Begreper kan ha en gul `merknad`.
  - Søketreffene sier hva treffet er (typene i `Sokeoppforingstype`, aldri «funksjon»), og søkefeltet har et kryss.
  - Øktlengden huskes på enheten (`src/app/kalkulatorvalg.ts`). Forsiden står i rader på stor skjerm.

## Pakke 3: det som skal bygges (godkjent av eier i forslaget)

Detaljene står i `fase-6-forslag.md`, «Pakke 3: Eksamen og klage». Kort:

1. **Oversikten «Eksamen»** i Vurdering, med lukkede deler og visualisering der det gir oversikt: trekk og antall eksamener (rutenett trinn × utdanningsprogram), oppmelding, særskilt tilrettelegging av eksamen (lenke begge veier til Tilrettelegging), utsatt, ny og særskilt eksamen (tabell), gjennomføring (tidsrammer, kl. 09.00 og 10.00, sensur, bortvisning og annullering), og Vestland bare når Vestland er valgt (VL-skule § 8 og § 13).
2. **Veiviseren «Klage på karakter»** med fasene «Hva klagen gjelder», «Begrunnelse og frist», «Skolen» og «Klageinstansen», og stegene 1–10 i forslaget. Den får en ny veiviserfarge, **bær** (dyp rosa, 700-tone #8a1f5c i lyst tema og 300-tone i mørkt), i `tokens.css`, `tema.css` og skjemaet (`veiviserfarge`, avgjørelse 042). Halvårsvurdering gir utfallet «Ingen klagerett».
3. **Frister og datoer** i felles format (avgjørelse 046), med tidslinjen «Eksamen og klage gjennom året» fra august til juli og filter for elever, privatister og lærlinger. Faste regler fra forskriften står i forslaget. Datoene fra Udir hentes av et skript fra eksamensplanen **hvert halvår** (eier, svar 7), kontrolleres før de tas inn og lastes gjennom `src/data/`. Robots.txt hos eksamensplan.udir.no stenger for andre enn søkemotorene: legg fram for eier hvordan hentingen gjøres før den bygges. Udirs egne sider er uenige to steder (påmeldingen åpner 19. eller 21. januar, hurtigklagen i uke 26 eller 27). Tidslinjen bruker eksamensplanen og lenker dit.
4. **Begreper:** trekkfag, sentralt og lokalt gitt eksamen, tverrfaglig eksamen, utsatt eksamen, ny eksamen, særskilt eksamen, særskilt tilrettelegging av eksamen, fag- og svenneprøve, prøvenemnd, klagenemnd, vitnemål og kompetansebevis. Sjekk først hvilke som finnes fra pakke 1. «Klage» er lenkeord for «Klage på enkeltvedtak», så klage på karakter får ikke eget begrep. Veiviseren lenkes fra begrepene standpunktkarakter og klagenemnd.
5. **Prøvene som sluttvurdering:** siden «Fag- og svenneprøven og de andre prøvene» i Vurdering: krav før prøven, oppmelding og frister, prøvenemnda, vurdering og karakterer, særskilt tilrettelegging, ny og utsatt prøve, og klage (veiviseren). Lenker til begrepene lærling, kontrakt om opplæring og lærebedrift og til oppslaget over opplæringskontorer. **Spør eier først** om siden hører til pakke 3, eller om den tas sammen med «Fag- og svennebrev» i Opplæringstilbud (mockup 3 og 4 og svarene i runde 4), som har «Veiene hit» med lenker begge veier.
6. **Fagarket:** eksamen i boksen «Fravær og eksamen» kan lenke til oversikten «Eksamen». Spør eier før noe mer legges inn der.

## Eiers føringer som gjelder videre

- **Ikke nevn FAM-koder** i veiviserne (eier: «overflødig»). I kalkulatorene står navnet på fagmerknaden med koden i parentes.
- **Ikke skriv at et varsel om fravær ikke dekker manglende grunnlag, eller omvendt.** Kildene sier det ikke. Lenker og tekster må ikke kunne leses som at varsel skal gis etter grensen (eier 04.10.2026).
- **Skriv «underveisvurdering», «sluttvurdering» og «halvårsvurdering» helt ut** der det er plass.
- **Visning:** regelverk og kilder i lukkede rader nederst i kort (`Kortfot`), og stien tilbake (`Brodsmuler`) på alle undersider. Lenker til en annen modul er merket «I Vurdering» (eller modulens navn).
- **Lenketekster** skal si hvor brukeren havner, og være korte. Lenker til veiviseren går til det riktige steget (`?steg=…&svar=…`).
- **Søket:** nye oppføringer får en type som sier hva treffet heter i appen (veiviser, kalkulator, tidslinje, side osv.).
- **Favoritter:** nye sider med stjerneknapp får en oppføring i `favorittbare`, eventuelt med eget ikon (det testes).
- **På stor skjerm** skal ingenting stå alene i høyre spalte før brukeren har fylt inn noe. Spar høyde der det går.

## Arbeidsmåte i dette miljøet

- **Først et kort forslag til eier.** Bygg deretter, og vis skjermbilder (iPhone 15 Pro i WebKit, PC i 1231 px og mørk visning) før testene.
- **Eier vil ikke ha lange tester før designet er ferdig.** Under designrundene: bare lint, typesjekk og eventuelt `npm test`. Når eier sier at designet er ferdig: `test:e2e:berorte` lokalt, så PR og hele suiten i CI.
- **Foreslå før du endrer** når eier ber om det, eller når et valg er faglig, juridisk eller endrer oppsettet mye.
- **Testversjon:** push til `test` (`git push origin <gren>:test --force`) når eier ber om det, og etter hver designrunde.
- **Skjermbilder:** `npm run build` og `npx vite preview --port 4173`, med et midlertidig skript i rotmappen som slettes etterpå. Stopp forhåndsvisningen før ende-til-ende-testene. Stopp prosessen ved å lese `/proc/<pid>/comm` (bare `node`, `sh` og `npm`), ikke med `pkill -f` eller en løkke som også treffer ditt eget skall.
- **WebKit lokalt:** finnes ikke `/root/pw163`, installer med `PLAYWRIGHT_BROWSERS_PATH=/root/pw163 npx playwright install webkit` og `npx playwright install-deps webkit`.
- **Testene lokalt:** `PLAYWRIGHT_BROWSERS_PATH=/root/pw163 npm run test:e2e:berorte`. Overflyttesten for `#/opplaeringslop/skoler?fylke=46&tilbud=HSHEA2` i 320 px feiler bare lokalt på grunn av fontene, og er grønn i CI.
- **Ny e2e-spesifikasjon:** legg til en linje i `MODULSPEKER` i `scripts/e2e/velg.ts` hvis det kommer en ny spesifikasjon, og merk tester som bare gjelder mobil med `@mobil`. Nye regelverk i `rules/` får en linje i `REGELMODULER`.
- **Kildesjekken** (`npm run kilder:sjekk`) feiler lokalt for Lovdata og Grep, fordi de bare hentes i GitHub Actions. Ikke commit `data/status/*` fra en lokal kjøring. Lokal henting med Node trenger `NODE_USE_ENV_PROXY=1`.
- **Startpakken** er 99,6 kB gzip (grense 150 kB). Eier har valgt å ikke laste bare den valgte målformen. Hold UI-tekstene korte.
- **Versjon:** settes med en egen PR som øker `package.json` og `package-lock.json` og flytter endringsloggen. Når den flettes, tagger og publiserer arbeidsflyten (avgjørelse 029). Claude velger nummeret når eier ber om det.

## Åpent

- Kontrollspørsmålene fra pakke 1 og 2 venter på eier (kontrolloversikten), og to poster i praksislisten: `fravaer-15-prosent-legeerklaering` og `fravaer-helse-etter-grensen`.
- «Fag- og svennebrev» i Opplæringstilbud er ikke bygget (se punkt 5 over).
- «Dagens jukselapp» kommer i fase 8 (`OPPDRAG.md`). Den skrus av og på fra forsiden.
