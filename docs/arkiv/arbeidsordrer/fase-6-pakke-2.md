# Fase 6, pakke 2: Fravær – overlevering (04.10.2026)

Start en ny samtale med: «Les docs/arbeidsordrer/fase-6-pakke-2.md og start pakke 2.» Les også `AGENTS.md`, `docs/arbeidsordrer/fase-6.md` og `docs/arbeidsordrer/fase-6-forslag.md` (delen «Pakke 2: Fravær», «VIGO Kodeverksbase» og svarene fra eier).

## Levert så langt

- **0.31.0:** fase 6, pakke 1, modulen **Vurdering** (avgjørelse 054). Regelverk og kilder står som lukkede rader nederst i alle kort (`Kortfot`). Bare de berørte ende-til-ende-testene kjøres lokalt, og hele suiten kjøres i CI med åtte jobber (avgjørelse 055).
- **0.32.0:** forsiden kan tilpasses, og toppfeltet erstatter bunnmenyen (avgjørelse 056). Favorittene står på forsiden og har ikoner (`ikonForFavoritt`, regel i AGENTS.md).

## Pakke 2: det som skal bygges (godkjent av eier)

Detaljene står i `fase-6-forslag.md`, «Pakke 2: Fravær». Kort:

1. **Fraværskalkulator** i modulen Vurdering, med samme oppbygning som poengberegningen i Inntak (avgjørelse 047):
   - Velg fag (søk på navn eller kode) eller skriv inn timer, og velg øktlengde (45, 60, 90 eller annet).
   - Svaret er grensen i klokketimer og økter ved 10 % og 15 %, med utregningen linje for linje og kilde på hver linje.
   - «Sjekk fraværet» (valgfritt) har fire felt og en stolpe med merker ved 10 % og 15 %, og utfallet står med tekst.
   - Unntakene, hva som ikke er fravær, og forskjellen mot fraværet på vitnemålet står lukket til de åpnes.
2. **Regler som data:** `rules/vurdering/2025.yaml` med 10, 15 og 60 minutter, med `sitat`, lest med `hentVerdi()`. Beregningen er rene funksjoner i `src/modules/vurdering/beregning/fravaer.ts`, med tester.
3. **Fasittestene FR1–FR8 er godkjent av eier** og legges i `tests/fasit/`:
   - FR2: 18 økter innenfor, 19 over. Kalkulatoren regner etter regelen, og Udirs eksempel ses bort fra.
   - FR3: 11 timer innenfor, 12 over (hele timer).
   - FR8: 15 timer teller, rektor kan avgjøre. Helsefravær med legeerklæring før grensen og udokumentert fravær teller sammen i 15-prosentrammen. Dette står i praksislisten (`fravaer-15-prosent-legeerklaering`, `bekreftet: null`).
   - Bruk alltid hele årstimetallet, også ved sen oppstart og fagbytte, med en merknad.
4. **VIGO Kodeverksbase** (eier vil ha det, også som kontroll for fagarkene):
   - `courses`, bare fagkodene i fagindeksen. Kontrollerer årstimetallet og vurderingsordningen fra Grep, og avvik kommer i kontrollsaken. Ny opplysning: sentralt eller lokalt gitt eksamen.
   - `relation/fam-connected-to-course`: fagmerknadene som hører til hvert fag.
   - Hentes i skript, kontrolleres før de tas inn, og lastes gjennom `src/data/vigo.ts`.
5. **Fagarket** får en rad «Vurdering»: fraværsgrensen i faget (lenke til kalkulatoren med faget valgt), om eksamen er sentralt eller lokalt gitt, og fagmerknadene (lenke til FAM-oppslaget). Avvik mellom Grep og VIGO merkes.
6. **Lenker:** veiviseren «Grunnlag for vurdering» (steget om fravær) lenker til kalkulatoren, og kalkulatoren lenker tilbake.

## Eiers føringer fra pakke 1 som også gjelder her

- **Ikke nevn FAM-koder** i veiviseren (eier: «overflødig»). Spør eier før FAM51 nevnes i kalkulatoren.
- **Ikke skriv at et varsel om fravær ikke dekker manglende grunnlag, eller omvendt.** Kildene sier det ikke.
- **Skriv «underveisvurdering», «sluttvurdering» og «halvårsvurdering» helt ut** der det er plass.
- **Visning:** regelverk og kilder står i lukkede rader nederst i kort (`Kortfot`), og stien tilbake (`Brodsmuler`) står på alle undersider.
- **Favoritter:** nye sider med stjerneknapp får en oppføring i `favorittbare`, eventuelt med eget ikon (det testes).

## Arbeidsmåte i dette miljøet

- **Først et kort forslag til eier.** Bygg deretter, og vis skjermbilder (iPhone 15 Pro i WebKit, gjerne også PC og mørk visning) før testene.
- **Skjermbilder:** kjør `npm run build` og `npx vite preview --port 4173`, med et midlertidig skript i rotmappen som slettes etterpå. Stopp forhåndsvisningen før ende-til-ende-testene, ellers gjenbruker Playwright feil server.
- **Testene lokalt:** `PLAYWRIGHT_BROWSERS_PATH=/root/pw163 npm run test:e2e:berorte`. Bare WebKit er installert lokalt. Overflyttesten for `#/opplaeringslop/skoler?fylke=46&tilbud=HSHEA2` i 320 px feiler bare lokalt på grunn av fontene, og er grønn i CI.
- **Ny e2e-spesifikasjon:** legg til en linje i `MODULSPEKER` i `scripts/e2e/velg.ts` hvis det kommer en ny spesifikasjon, og merk tester som bare gjelder mobil med `@mobil`.
- **Kildesjekken** (`npm run kilder:sjekk`) feiler lokalt for Lovdata og Grep, fordi de bare hentes i GitHub Actions. Ikke commit `data/status/*` fra en lokal kjøring.
- **Versjon:** settes med en egen PR som øker `package.json` og flytter endringsloggen. Når den flettes, tagger og publiserer arbeidsflyten (avgjørelse 029). Avtal nummeret med eier.
