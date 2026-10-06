# Arbeidsordre: fase 7b – Nyheter

Lim inn teksten under streken som første melding i en ny samtale. Bakgrunnen står under arbeidsordren.

---

Vi starter fase 7b i Jukselappen: **Nyheter** (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md` (fase 7b og «Gjelder alle faser»)
- `CHANGELOG.md` (siste versjoner)
- Denne filen, også bakgrunnen under arbeidsordren
- Kapittel 2 i `docs/arbeidsordrer/forslag-meropplaering-og-nyheter.md`: kildene slik de ble kartlagt 06.10.2026
- Avgjørelsene i `docs/avgjorelser/`:
  - om kildesjekken og dataene (008, 048, 049, 053)
  - om rytmen (063)
  - om forsiden og sidekolonnen (056, 068)
  - om kalenderen (066)

**Mine svar (06.10.2026):**
- **Kilder:** Flest mulig kilder, inntil det punktet der det blir uforsvarlig. Det er f.eks. ugreit å skrape Lektorlaget.
- **Ingress:** Om ingress vises for alle, noen eller ingen, tar jeg stilling til når jeg ser designet.
- **Publisering:** Nyhetsfilen kan publiseres daglig uten PR.
- **KS og KF Infoserie:** Jeg tar stilling etter rådet i bakgrunnen under. Først vil jeg forstå hvordan KS-kildene hentes i dag.

**Fasen:**
- **Skriptet:** Et skript i GitHub Actions henter tittel, dato, lenke og eventuelt ingress til `data/nyheter.json`. Det henter ikke bilder eller hele tekster. Appen gjør ingen eksterne kall.
- **Svikt:** Feiler en kilde, eller gir den null saker, beholdes forrige liste, og kilden får status i Kildestatus.
- **Daglig publisering uten PR,** når filen passer skjemaet. Det skrives et avgjørelsesnotat om det før koden.
- **«Siste nytt» på forsiden,** slik «Neste datoer» står i dag (på skrivebord i sidekolonnen), og en egen side under «Oppslag» med filter på type (myndigheter, fagpresse, organisasjoner) og kilde.
- **Merking:** Organisasjonene merkes som interesseparter. Utdanningsnytt merkes som fagpresse, utgitt av Utdanningsforbundet.
- **Statsforvalteren:** Sakene vises bare når fylket er valgt.
- **Kilderegisteret:** Hver kilde får en oppføring i `content/kilder.yaml` med lisens.

**Arbeidsmåte:**
- Først et forslag med mockup til meg, i appen, med skjermbilder på mobil og skrivebord. Vis gjerne en variant med ingress og en uten.
- Legg fram listen over kilder med vurdering for hver, etter kriteriene i bakgrunnen.
- Ingen ende-til-ende-tester før jeg har sagt at designet er ferdig.
- Push til `test` etter hver designrunde.
- Versjons-PR når vi er enige.

---

## Bakgrunn

### Kriterier for en kilde (forslag)

En kilde tas med når:
1. den har en feed (RSS/Atom), eller en nyhetsliste som har tittel, dato og lenke på én side, så én forespørsel per henting er nok
2. robots.txt tillater stien
3. den ikke krever innlogging eller abonnement
4. den er relevant for videregående

Skraping av hver artikkelside for å finne dato eller ingress tas ikke med (Lektorlaget, eier 06.10.2026).

Med disse kriteriene blir det:
- **Med feed:** regjeringen.no, Statsforvalteren, Utdanningsnytt, Skolelederforbundet og Skolenes landsforbund
- **Med liste på én side:** Udir og Utdanningsforbundet. Dette må eier si ja til, fordi det er en liste og ikke en feed.
- **Fra data appen har fra før:** Lovdata (Lovtidend)

### Hvordan KS-kildene hentes i dag

Kildesjekken (`kilder.yml`) går hver uke med User-Agent `Jukselappen-kildesjekk/0.1 (+https://github.com/larsarnenilssen/jukselappen)`. Den sjekker om kildene er endret. Ingenting fra KS kopieres inn i appen; appen lenker til KS.

| Kilde | Hva | Hvordan |
|---|---|---|
| `ks-sfs2213` | Særavtalesiden på ks.no | henter siden og sammenligner fingeravtrykket (`side`) |
| `ks-hovedtariffavtalen` | PDF-en av hovedtariffavtalen på ks.no | henter filen og sammenligner fingeravtrykket (`fil`) |
| `ks-sfs2213-avtaletekst` | SFS 2213 hos KF Infoserie | Åpner den åpne delingslenken KS selv har lagt på særavtalesiden, i Chromium (Playwright), fordi KF Infoserie er en JavaScript-app. Teksten brukes til fingeravtrykket og til å sjekke at sitatene i `rules/` står i avtalen (avgjørelse 008 og 017). |
| `ks-fou-sfs2213` | FoU-rapporten | ingen sjekk |

ks.no har `User-agent: *` → `Disallow: /` i robots.txt. Bare navngitte roboter som Googlebot og ClaudeBot slipper inn. Kildesjekken bryter derfor strengt tatt robots.txt, med tre–fire forespørsler i uka. robots.txt for KF Infoserie kunne ikke leses fra skymiljøet.

### KF Infoserie i nyhetene: for og mot

**For:**
- KS er arbeidsgiverpart i SFS 2213 og hovedtariffavtalen.
- KF Infoserie har rundskrivene og lønns- og tariffnytt fra KS. Det er det mest relevante for ledere som arbeider med arbeidstid.

**Mot:**
- KF Infoserie er en abonnementstjeneste fra Kommuneforlaget. Nyhetene ligger bak innlogging. Den åpne lenken vi bruker i dag, gjelder bare ett dokument KS har valgt å dele. For å hente nyheter må vi lagre en innlogging i Actions og legge ut innhold fra en betalt tjeneste. Det kan bryte abonnementsvilkårene.
- Det finnes ingen feed. Hentingen må gå gjennom nettleseren (Playwright) og brekker når appen endres.
- KS sier nei til ukjente roboter i robots.txt.

**Råd:**
1. **Spør KS og Kommuneforlaget** i en kort e-post: kan Jukselappen hente tittel, dato og lenke daglig fra KS' nyhetsliste for lønn og arbeidsgiver (`ks.no/les-mer/?theme=43`), og kan kildesjekken fortsette som i dag med den oppgitte User-Agent? Spør Kommuneforlaget om de har en feed eller et API for KF Infoserie. Det er de eneste som kan gjøre dette forsvarlig.
2. **Til svaret kommer:** ingen henting fra KS eller KF Infoserie til nyhetene. Nyhetssiden får en fast lenke «Nytt fra KS» til ks.no og KF Infoserie. Kildesjekken går som før, fordi den er lav i volum og har en oppgitt avsender. Ved nei fra KS kan vi bruke Utdanningsforbundets side om SFS 2213 (`udf-sfs2213`, sekundærkilde), og eventuelt en manuell kontroll av avtaleteksten.
3. **Ja fra KS:** tittel, dato og lenke fra ks.no, merket «KS (arbeidsgiver)». **Feed fra Kommuneforlaget:** også KF Infoserie, med lenke for dem som har abonnement.
