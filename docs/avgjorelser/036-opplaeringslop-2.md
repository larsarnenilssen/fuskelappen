# 036 – Opplæringsløp 2: oversikt, sortering etter kildene og navn på begge målformer

**Kontekst:** Eier gikk gjennom Opplæringsløp (0.18.0, avgjørelse 035). Lange lister og trær var uoversiktlige, timene var vanskelige å få oversikt over, og rundskrivets navn sto på bokmål også på nynorsk. Eier vil ikke ha manuell sortering. Appen skal ikke tilpasses dagens tilbudsstruktur så mye at den blir feil etter neste revisjon av fag og tilbud (eier 02.10.2026).

**Valg:**
- **Oversikt og kollaps:**
  - Grenene i løpet er lukket fra start, og streken i treet ender ved siste tilbud.
  - Alle rubrikker kan legges sammen, og appen husker dem i historikken.
  - Oversikten har eget søk etter tilbud.
  - Tilbudssiden har sti tilbake til program og oversikt.
- **Timene:** Tilbudssiden viser timene i alt med en stolpe i fagtypefargene, og én rubrikk per kategori. Hvert fag står på én linje med lenken i navnet. Vurderingskoder (muntlig, tverrfaglig eksamen) står nederst i rubrikken. De er ikke egne fag med timer.
- **Sortering etter kildene:** Lange lister har søk og står i grupper.
  - Programfag til valg deles først etter programområdene fagene hører til i Grep på samme trinn, så etter læreplan.
  - Fordypning og andre lister grupperes bare etter læreplan.
  - Læreplaner med ett fag står som lenke direkte.
  - Grupperingen kommer fra Grep og krever ikke vedlikehold. Et fag i flere programområder står i hvert av dem.
- **Fagarket:** «Inngår i tilbud» viser hvordan faget inngår i hvert tilbud, med timene (`fagITilbud`).
- **Arbeidsplan:** Tilbudssiden kan legge fellesfag og felles programfag med fast fagkode inn i en ny arbeidsplan, med årsramme for programmet og trinnet.
- **Navn:**
  - Linjenavnene i rundskrivet har nynorsk og utskrevne forkortelser i `src/strings/linjenavn.ts`.
  - Kolonnene for tilpassede ordninger skrives ut (`navn.ts`).
  - Ukjente navn vises som i rundskrivet, så ingenting går i stykker. `npm run tilbud:rapport` skriver dem til `.generert/tilbud-navn.json`, og kontrollsaken melder dem hver uke.
  - Testene bruker egne eksempler, ikke dataene, så et nytt navn ikke stopper hentingen.
- **Avvik:** Avvik mellom rundskrivet og Grep lagres som data (`Avvik`) og vises som nøytral merknad der de gjelder, f.eks. «Rundskrivet har 925 timer. Fagene i Grep har til sammen 700.» Rapporten bruker `avvikTekst` og er uendret.

**Konsekvens:** Det eneste som må vedlikeholdes for hånd, er nynorsk for nye linjenavn og utskrift av nye ordninger. Kontrollsaken melder dem, og til det er gjort vises rundskrivets tekst. Endres tilbudsstrukturen, følger grupperingen, avvikene og timene kildene ved neste bygg. Avgjørelse 035 sier at avvik ikke vises og at linjenavn vises uoversatt. Det gjelder ikke lenger.
