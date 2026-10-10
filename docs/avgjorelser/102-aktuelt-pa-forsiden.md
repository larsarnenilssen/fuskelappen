# 102 – Aktuelt på forsiden

**Kontekst:** Gjennomgangen 09.10.2026 viste at kalenderen, nyhetene, tallene og dagens jukselapp kunne tilpasses fire steder (panelet, «Tilpass», bryteren for sidekolonnen og Innstillinger), og at panelet ikke skilte seg nok fra modulene. Eier fikk tre forslag i testversjonen (sidekolonne med lukk, bånd og kompakt rad, grenen `claude/forside-forslag`) og valgte en variant nær forslag 1 (09.10.2026).

**Valg:**
- **Aktuelt:** Kalenderen, nyhetene, Videregående i tall og dagens jukselapp heter samlet «Aktuelt». Det er én gruppe (`panel`), med merkelappen «Aktuelt» som overskrift, filterknappen (menyen) og pilen til høyre, og fanene mellom visningene under. Det lukkes og åpnes med pilen, som de andre gruppene, og valget lagres i `lukket` og `apnet`.
- **Skrivebord:** Sidekolonnen beholdes: Aktuelt øverst og favorittene under. Aktuelt er åpent fra start («det skal forbli en sidekolonne»). Bryteren «Sidekolonne» og den smale skinnen er tatt bort. Er Aktuelt skjult og det ikke er favoritter, får gruppene hele bredden.
- **Mobil:** Aktuelt står i en egen ramme på den myke flaten i temafargen, med overskriften og filterknappen i rammen. Det er lukket fra start og viser da én linje: visningen og den neste datoen, nyheten, tallet eller faktumet.
- **Menyen** velger visningene, slår dagens jukselapp av og på, og har «Skjul Aktuelt» (`aktuelt` i `forside.skjult`). Bryteren for dagens jukselapp er tatt bort fra «Tilpass» og Innstillinger. Velkomsten har den fortsatt, og den lagrer det samme valget (`forside.jukselapp`).
- **«Tilpass»** har rekkefølgen på gruppene, bryteren «Vis Aktuelt på forsiden», som er veien tilbake når Aktuelt er skjult, og «Standard rekkefølge».
- **Dagens jukselapp** står ikke lenger først ved første besøk på dagen. Den er én av visningene, og visningen brukeren valgte sist, står (`forside.visning`). Det gule merket og «Tilbake til …» er tatt bort. `jukselappForlatt` kan finnes i lagrede data, men leses ikke.
- **Lagrede valg:** Ingen ny skjemaversjon. Den som hadde slått av sidekolonnen (`sidekolonne` i `skjult`), får Aktuelt lukket på skrivebord, ikke skjult, til det åpnes. `forside.visning`, visningene som er slått av og rekkefølgen står som før.
- **«Bare favoritter»** og favorittforsiden er som før.

**Konsekvens:** Aktuelt tilpasses på ett sted, i rammen selv. Fanene står nå under overskriften, ikke i den, og gruppen (`Gruppe`) har fått `klasse`, `verktoyAlltid` og `foran` for menyen. Forslagsgrenen og `?forslag=` er ikke tatt inn. En ny visning krever en oppføring i `VISNINGER`, en komponent i `Forsidepanel.tsx` og en tekst i `forside.panel` og `forside.tilpass.visning`.

**Endret 10.10.2026:** «Tilpass» har også en bryter for dagens jukselapp, så den kan slås på fra favorittforsiden. Med bare favoritter står jukselappen når den er slått på, også når Aktuelt er skjult (eier 10.10.2026, avgjørelse 108).
