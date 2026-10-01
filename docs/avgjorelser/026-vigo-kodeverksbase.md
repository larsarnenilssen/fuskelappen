# 026 – VIGO Kodeverksbase

**Kontekst:** Eier vil at appen skal oppdage og vise når fag går ut eller endres, og vise sammenhengen mellom fag og eksamenskoder. Eier vil også ha fagmerknadene (FAM-koder) og vitnemålsmerknadene samlet i begrepsbanken, med søk. Grep har ikke dette. VIGO Kodeverksbase (`kodeverk.vigo.no`) er fylkeskommunenes felles kodeverk for videregående opplæring, forvaltet av Novari IKS. Novari skriver at den er åpen for oppslag. Den har ingen lisens og ingen dokumentasjon av API-et. Eier avgjorde 01.10.2026 at informasjonen er offentlig og kan brukes.

**Valg:**
- **Henting:** `scripts/hent-vigo.ts` (`npm run hent:vigo`) henter fem tabeller og koblinger med samme POST-API som nettsiden bruker, i sider på høyst 2000 rader, og skriver:
  - `data/vigo/fagrelasjoner.json`: utgåtte fagkoder og kodene som erstatter dem (en kode kan være delt opp i flere), nye versjoner av læreplaner, fag som brukes sammen, og fag som bygger på andre fag (rekkefølgen på fag over flere trinn i tilbudsstrukturen, eier 01.10.2026). VIGOs egne koder for opplæringsfag (med Z) er utelatt.
  - `data/vigo/merknader.json`: FAM- og VMM-koder med tekst på bokmål, nynorsk, samisk og engelsk, hvor de brukes, om de krever vedlegg, og sluttdato.
- **Kontroller:** skjema (zod) og minste antall. Ved feil beholdes forrige filer. Filene skrives bare ved endret innhold.
- **Kildesjekken:** henter VIGO i samme steg som Grep og Udir-1, og testene kjøres på alt samlet. Ny sjekkmetode `vigo-kodeverk` med kilden `vigo-kodeverk` i kilderegisteret. Endringene står i kildesjekkrapporten. Feiler testene, blir status «endret», dataene tas ikke inn, og endringsforslaget (avgjørelse 020) får dem.
- **Fagsiden** viser fag som brukes sammen og utgåtte koder faget erstatter, og sier fra når læreplanen er erstattet. En utgått fagkode i adressen eller i fagsøket viser kodene som erstatter den, også gjennom flere ledd.
- **Begrepsbanken** har to oppslag, «Fagmerknader (FAM-koder)» og «Vitnemålsmerknader (VMM-koder)», med feltet `kodeliste`. Listen vises under teksten, med søk på kode og tekst. Søket står i adressen. Utgåtte koder står sammenlagt nederst. Hver gjeldende kode er med i det samlede søket og åpner oppslaget med koden søkt fram. Tekstene er VIGOs egne, på bokmål eller nynorsk etter appens målform.
- **Dataene lastes når de trengs**, som egne JS-biter.
- **Resten av kodebasen** er beskrevet i `docs/VIGO-KODEVERK.md` til senere bruk.

**Konsekvens:** Når en fagkode går ut i VIGO, får brukeren vite hvilken kode som gjelder, uten kodeendring. Nye og endrede merknader kommer med automatisk. Endrer Novari API-et, feiler hentingen, de gamle dataene blir stående, og kildesjekken sier fra.
