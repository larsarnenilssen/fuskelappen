# Forslag: mer opplæring og en nyhetsside

Råd til eier 06.10.2026. Ingenting her er bygget.

**Eiers svar (06.10.2026):** Rekkefølgen er godkjent. Mer opplæring tas som fase 6, pakke 7, før fase 7 (`fase-6-pakke-7-mer-opplaering.md`). Nyhetene tas som fase 7b, etter fase 7 (`fase-7b-nyheter.md`).
- Ingress avgjøres når designet vises.
- Flest mulig kilder, inntil det blir uforsvarlig. Skraping av Lektorlaget er ugreit.
- Nyhetsfilen kan publiseres daglig uten PR.
- Om KS og KF Infoserie tar eier stilling etter rådet i `fase-7b-nyheter.md`.

## 1. Mer opplæring (meir opplæring)

**Kildene:**
- Opplæringsforskriften § 5-2 er kjernen. Første ledd sier at eleven har gjennomført når hen har fulgt opplæringen fram til 1. mars. Tredje ledd gjelder fag- eller svenneprøve som ikke er bestått: da gis Vg3 i skole bygd på Vg2.
- Andre bestemmelser:
  - § 4-3 om melding og frist
  - § 4-9 femte ledd om løpende inntak
  - § 5-1 tredje ledd om tilpassede løp
  - § 14-2 om voksne
  - vurderingsreglene i §§ 9-16 fjerde ledd, 9-28 tredje ledd, 9-36–9-38, 9-66 tredje ledd og 9-69 femte ledd
- Udir har veiledningene «Rett til mer opplæring» (seks kapitler med egne adresser), «Rett til mer opplæring for voksne» og «Fullføringsretten for elever med individuelt tilrettelagt opplæring».

**Det appen har i dag:** fristen `fr-mer-opplaering` i Kalenderen (fra `content/inntak/frister.yaml`), og noen omtaler i Vurdering. Appen har ikke noe begrep, og veiviseren for rett til inntak har ikke noe steg om mer opplæring.

**Plassering:** En side i **Inntak** («Mer opplæring»), fordi det er en rett til opplæring og fylkeskommunen gjør vedtaket. Lenker hit:
- **Vurdering:** fra «ikke bestått» og fra standpunkt og eksamen
- **Lærlinger og kandidater:** en overgang «Fag- eller svenneprøven ikke bestått → Vg3 i skole», med § 5-2 tredje ledd som kilde
- **Tilrettelegging:** fullføringsretten for elever med individuelt tilrettelagt opplæring
- **Kalenderen:** fristen lenker til siden
- **Veiviseren for rett til inntak:** et steg «Har eleven fag som ikke er bestått?»

**Innholdet, med egne ord og kilde for hvert punkt:**
1. Hvem har rett: gjennomført, men ikke bestått (§ 5-2)
2. Hva retten gir: opplæring i fagene som ikke er bestått, og ny vurdering
3. Fag- eller svenneprøve ikke bestått: Vg3 i skole (§ 5-2 tredje ledd)
4. Søknad, frist og vedtak (§ 4-3, Udir «Søknadsfrist»)
5. Organisering og løpende inntak (§ 4-9, Udir «Organisering»)
6. Vurdering: standpunkt, eksamen og privatist (§§ 9-16, 9-28, 9-36–9-38)
7. Voksne (§ 14-2) og elever med individuelt tilrettelagt opplæring (Udir om fullføringsretten)

Begrepet `mer-opplaering` får `lenkeord` «meir opplæring» og «rett til mer opplæring». Alt nytt får `kontrollert: null` og kontrollspørsmål. Et eksempel: klage på vedtaket står ikke i kildene over, så det tas ikke med uten eiers svar.

**Plass i prosessen:** en liten pakke før fase 7, f.eks. «fase 6, pakke 7». Den bygger på Inntak, Vurdering og lærlinger og kandidater, som er ferdige, og trenger ingen ny teknikk. Omfanget er én designrunde med mockup, så innhold og tester.

## 2. Nyhetsside

**Kildene (kartlagt 06.10.2026, fra skymiljøet):**

| Kilde | Hvordan | Vis | Merknad |
|---|---|---|---|
| Regjeringen.no (KD) | RSS `…/rss/Rss/2581966/?owner=586` | tittel, ingress, dato, lenke | Står bak Cloudflare; bare RSS-stien svarer. Må filtreres på ord, fordi KD også har høyere utdanning og barnehage. |
| Udir | Nyhetslisten `/om-udir/siste-nytt/` (ingen RSS) | tittel, ingress, dato, lenke | NLOD. Må filtreres, fordi listen også har barnehage og grunnskole. |
| Statsforvalteren | RSS per embete `/{nb\|nn}/<embete>/nyheter/rss?limit=50` | tittel, kort ingress, dato, lenke | Vises bare når fylket er valgt (`gyldighet: fylke`). Bare 0–11 av 50 handler om skole. |
| Utdanningsnytt | RSS `/tag/videregående?lab_viewport=rss`, `/tag/skoleledelse?…` | tittel, dato, lenke (ingressen avgjør eier) | Fagpresse, utgitt av Utdanningsforbundet |
| Skolelederforbundet, Skolenes landsforbund | WordPress `/feed/` | tittel, dato, lenke | Merket som organisasjon |
| Utdanningsforbundet | Nyhetslisten `/nyheter/` (ingen RSS) | tittel, dato, lenke | Merket som organisasjon |
| Lektorlaget | Ingen feed, og listen mangler dato | – | Vent. Krever skraping og var ustabil. |
| KS | Ingen RSS. robots.txt nekter ukjente roboter (`User-agent: * Disallow: /`) | – | Ikke uten avklaring. Gjelder også dagens kildesjekk av ks.no. |
| KF Infoserie | Abonnement, en app med JavaScript | – | Ikke ta med |
| NDLA, KS Læring | Ingen nyheter | – | Ikke ta med |
| Lovdata | Har vi fra før (Lovtidend) | tittel, dato, lenke | Nye og endrede forskrifter fra KD, og lokale forskrifter, uten ny henting |

**Teknikk:** Appen gjør ingen eksterne kall (AGENTS.md). Et skript i GitHub Actions henter kildene, filtrerer dem og skriver `data/nyheter.json`: kilde, type, tittel, dato, lenke og eventuelt ingress, uten bilder og uten hele teksten. Appen leser filen som de andre dataene og viser når den ble hentet.
- **Frekvens:** daglig for regjeringen, Udir og Statsforvalteren. De andre kan hentes daglig eller ukentlig.
- **Når hentingen svikter:** feiler hentingen, eller gir en kilde null saker, beholdes forrige liste, og kilden får status i Kildestatus. Kilden skal ikke bli borte uten at det merkes.
- **Publisering:** Nyheter krever publisering hver dag. Det bør bli en egen jobb som oppdaterer bare `data/nyheter.json` og publiserer uten PR, når dataene passer skjemaet. I dag går data via ukentlig kontrollsak og PR (avgjørelse 063). Dette er et nytt valg og krever et avgjørelsesnotat.
- **Kilderegisteret:** hver kilde får oppføring i `content/kilder.yaml` med lisens.

**Design:**
- **Forsiden:** gruppen «Siste nytt» med de tre nyeste sakene, slik «Neste datoer» står i dag. På stor skjerm står den i sidekolonnen.
- **Egen side under «Oppslag»:** sakene etter dato, med filter på type (myndigheter, fagpresse, organisasjoner) og kilde.
- **Hver sak:** kildens navn som merke, tittel som lenke ut (åpnes i nettleseren), dato, og ingress når kilden tillater det.
- **Interesseparter:** Organisasjonene får merket «Organisasjon», og Utdanningsnytt får «Fagpresse (Utdanningsforbundet)».
- **Fylke:** Statsforvalterens saker vises bare med valgt fylke.
- **Uten nett:** Appen viser siste liste med datoen den ble hentet.

**Spørsmål til eier før bygging:**
1. **Ingress:** Ingress bare fra offentlige kilder (regjeringen, Udir, Statsforvalteren)? Eller også fra Utdanningsnytt?
2. **Organisasjonene:** Skal de være med, og hvilke? Skal Lektorlaget vente?
3. **KS:** Skal vi spørre KS om robots.txt, eller la være? Svaret påvirker også kildesjekken.
4. **Publisering:** Er daglig publisering uten PR greit for denne ene datafilen?
5. **Filteret:** Hvilke ord gjør en sak relevant for videregående?

**Plass i prosessen:** som egen fase eller pakke etter fase 7, før fase 8 (frister og årshjul), fordi «Siste nytt» og Kalenderen hører sammen på forsiden. Først et forslag med mockup og svar på spørsmålene. Deretter ett avgjørelsesnotat om henting og publisering, før koden skrives.
