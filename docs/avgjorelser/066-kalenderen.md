# 066 – Kalenderen: fristene fra alle modulene på én side

**Kontekst:** Fristene sto på to tidslinjer: Kalender for inntak (oktober–september) og Kalender for eksamen (august–juli). Eier ville ha én samlet kalender for fristene og datoene i alle modulene, med skoleruta og kommende endringer i regelverket. Den er grunnlaget for årshjulet og eksporten til kalender i fase 8 (fase 6, pakke 5, godkjent av eier 04. og 05.10.2026, `docs/arbeidsordrer/fase-6-pakke-5-forslag.md`).

**Valg:**
- **Ny modul Kalender** (`#/kalender`) under Oppslag. Den samler `frister()` fra alle manifestene. Beregningen er rene funksjoner i `src/modules/kalender/beregning/`.
- **Visning:** de neste tolv månedene (standard) eller et skoleår (august–juli), inneværende eller neste. Neste skoleår står alltid. Uten eksamensdatoer står eksamen med måneden, med en merknad.
  - Loddrett tidslinje, med en rød strek for i dag og passerte datoer dempet.
  - På stor skjerm står to (fra 64rem) eller tre (fra 72rem) deler av året side om side. Fire deler ga kortene mindre plass til teksten enn på mobil, og lange ord ble delt (eier 05.10.2026). Lange ord på smale mobiler deles med bindestrek (`hyphens: auto`).
- **Filter i adressen:** `tema` (inntak, vurdering, eksamen, skolerute, regelverk) og `vis` (elever, privatister, lærlinger, voksne, fortrinnsrett), og `visning=skolear&aar=…`.
  - Fristene har fått feltet `tema` (uten feltet gjelder modulen) og felles gruppenavn (`ungdom` ble `elever`, `fortrinn` ble `fortrinnsrett`). Gamle adresser med de gamle navnene virker.
- **Frister uten fast dag** vises bare med tema i filteret:
  - en frist med måned står sist i måneden («I løpet av januar»)
  - en frist over flere måneder står i hver av dem (ny regeltype `perioden`, f.eks. svar på søknaden juli–august)
  - løpende frister står under «Gjelder hele året»
- **Lenker** fra en dato til sider, veivisere og begreper står i feltet `lenker`. Tittelen og typen hentes fra søkeoppføringene til modulen. En test krever at alle lenkene finnes.
- **De gamle kalenderne** er tatt bort. Adressene sender videre til kalenderen, ferdig filtrert, og boksene i modulene lenker dit.
- **Forsiden** har gruppen «Neste datoer» med de tre neste datoene (forslag D). Den er lukket på mobil med neste dato under overskriften, og åpen på stor skjerm. Den flyttes og slås av under «Tilpass» (`forside.apnet` og `forside.skjult` i lagringen, uten ny skjemaversjon).
- **Skoleruta, fylkenes inntaksdatoer og kommende endringer i regelverket** kommer fra datafiler som hentes hver uke (`data/skolerute/`, `data/inntak/`, `data/lovdata/kommende.json`). Fylkets datoer vises bare når fylket er valgt.

- **Omtrentlige inntaksdatoer** står på datoen med ordet fra siden («ca.», «senest»). «Begynnelsen», «midten» og «slutten» av en måned blir de to første ukene, uken med den 15. og de to siste ukene (eier 05.10.2026). En side uten årstall gjelder inntaket samme år når den hentes fra januar til august, og datoen får en merknad om det. Fra september til desember brukes siden ikke (eier 05.10.2026).
- **Oversiktene over endringer** (regjeringen.no og Udir) står i `src/modules/kalender/oversikter.ts`. De har ny adresse for hver utgave, og kontrollrunden i august minner om å bytte dem. regjeringen.no stenger for automatisk henting.
- **Skoleårene** regnes fra dagens dato: inneværende og neste skoleår, og de neste tolv månedene. Datoene kommer fra filene som hentes hver uke, så kalenderen trenger ingen endring når et nytt skoleår begynner.

**Konsekvens:**
- Nye moduler med frister kommer med av seg selv. Et nytt tema (arbeidstid, skolemiljø) legges i `KALENDERTEMAER` og får farge i `tema.css`.
- Fase 8 bygger årshjulet og eksporten (.ics) på postene i kalenderen.
- `components/Tidslinje.tsx` og sidene for de to gamle kalenderne er fjernet.
