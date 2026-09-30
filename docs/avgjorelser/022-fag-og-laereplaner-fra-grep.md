# 022 – Fag og læreplaner fra Grep

**Kontekst:** Fase 2 skal ha oppslag i fag og læreplaner for videregående: søk og filter, fagside med kompetansemål, vurderingsordning og underveisvurdering, og favoritter (OPPDRAG fase 2). Dataene skal hentes automatisk fra Grep hver uke, med validering, endringsrapport og tilbakefall. Appen gjør ingen kall til eksterne tjenester.

**Valg:**
- **Hvordan Grep henger sammen:** fagkode (NOR1260) → opplæringsfag (NOR1Z63) → programområder (STUSP1----), læreplan (NOR01-08) og kompetansemålsett. Opplæringsfaget har fagtype, trinn og opplæringsnivå. `npm run hent:grep` henter alle publiserte opplæringsfag i videregående, fagkodene deres, programområdene, læreplanene (LK20) og kompetansemålsettene. Det tar om lag to minutter.
- **To slags filer:**
  - `data/grep/fagindeks.json` (om lag 60 kB komprimert): alle fagkodene med navn på bokmål og nynorsk, fagtype, trinn, programområder, årstimetall (`omfang-totalt`), læreplan og vurderingsordning (koder for trekkordning, eksamensordning, eksamensform og vurderingsuttrykk) for elever og privatister. Appen laster den som en egen JS-bit første gang den trengs. Den følger med når appen installeres.
  - `data/grep/laereplaner/<kode>.json` (om lag 400 filer): kompetansemål, underveisvurdering, standpunktvurdering og vurderingsordning. Filene hentes når brukeren åpner et fag, og tjenestearbeideren tar vare på dem til bruk uten nett.
- **Målform:** Læreplanene har tekstene på målformen de er fastsatt i (`fastsatt-spraak` i Grep: bokmål, nynorsk eller samisk). Bare denne målformen lagres, og den vises merket og uoversatt, med `lang`-attributt. Navnene på fag og programområder har Grep på begge målformer, og de følger appens målform.
- **Gjeldende læreplan:** Har et opplæringsfag flere LK20-planer, velges planen som gjelder på datoen for hentingen, deretter publiserte planer.
- **HTML i Grep** (bare `<p>`, `<br>` og enkel utheving) gjøres om til ren tekst i avsnitt. Appen setter aldri inn HTML fra Grep.
- **Kodene i vurderingsordningen** har egne tekster på bokmål og nynorsk i `src/strings/moduler/fag.*.ts`. En ny kode i Grep vises med tittelen fra Grep til den får egen tekst.
- **Validering og tilbakefall:** Før noe skrives, sjekkes antall fag, programområder og læreplaner, skjemaet (zod, `src/modules/fag/skjema.ts`), at hvert fag har sin læreplanfil, og at nesten alle planer har kompetansemål. Feiler hentingen eller valideringen, blir forrige snapshot stående, og kildesjekken melder «feilet». Filene skrives bare når innholdet er endret. Læreplanmappen skrives på nytt i sin helhet, så planer som er fjernet i Grep, forsvinner.
- **Endringsrapporten** har nå også nye, fjernede og endrede fag (årstimetall, vurderingsordning, navn) og læreplaner (fingeravtrykk per fil). Endrede læreplaner og fag står i den ukentlige kontrollsaken, med lenke til udir.no.
- **Søk:** Fagene er med i det samlede søket (navn og fagkode). Søkeindeksen ble da om lag 90 kB komprimert. Den lastes første gang noen søker, og er ikke med i startpakken. Kompetansemålene er ikke med i det samlede søket ennå (OPPDRAG 3.7).
- **Favoritter:** `favorittbare()` kan få id-ene brukeren har som favoritter. Fagmodulen laster da fagindeksen bare når det finnes favorittfag.
- **Kilder:** `udir-grep` dekker dataene. Ny kilde `udir-lk20` (læreplanene på udir.no) er lenken på fagsidene. Den sjekkes ikke for seg, fordi endringer kommer gjennom Grep.

**Konsekvens:** Fagdataene oppdateres og publiseres automatisk hver uke når testene består. Eier får beskjed om endrede læreplaner i kontrollsaken. Programområdene, fagkodene og årstimetallet fagsøket i kalkulatorene bruker fra fase 1, lages nå fra samme henting.
