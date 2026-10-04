# 005 – Appskall, ruting og navigasjon

**Kontekst:** Appen skal ha ett scrollområde, fast topp og navigasjon, native scroll og tilbakenavigasjon, hash-ruting og ingen horisontal overflyt (3.10). Den skal virke på GitHub Pages og installert.

**Valg:**
- Dokumentet er eneste scrollområde. Det gir riktig oppførsel på iOS (trykk på statuslinjen, gummistrikk og tilbake-sveip). Topplinjen er `position: sticky`, bunnmenyen `position: fixed`, og begge har `safe-area`-innfelt.
- Bunnmeny med fire faste punkter: Hjem, Søk, Favoritter og Innstillinger. «Om» nås fra innstillingene, forsiden og kildestatusindikatoren.
- Egen liten hash-ruter i stedet for et rutingbibliotek. Hver navigasjon er en historikkoppføring. Scrollposisjonen gjenopprettes ved tilbake, og fokus flyttes til `h1`.
- Tema settes av et lite innebygd skript i `index.html` før første tegning, så skjermen ikke blinker.

**Konsekvens:** Ingen nye avhengigheter. Ruter defineres i modulmanifestene og i `src/app/ruteliste.ts`.

**Tillegg 0.1.1 (etter test på iPhone):** Installerte nettapper på iOS la en lys overgang bak statuslinjen og kunne regne visningsområdet for kort ved oppstart, slik at det ble en stripe under bunnmenyen. Vi retter dette med farge på lerretet (`html`): toppfarge øverst og menyfarge nederst, med sidefargen på `body`. Det krever ingen skript og ingen gjetting på iOS-versjoner. «Teknisk informasjon» under «Om» viser skjermmål og sikre kanter, så feil kan feilsøkes på eiers telefon.

**Tillegg 0.1.2:** Fargeovergangen i 0.1.1 rettet stripen nederst, men ikke toningen øverst. Årsaken var at iOS henter fargen bak statuslinjen fra bakgrunnsfargen (`background-color`) til `html` og `body`, ikke fra et bakgrunnsbilde. Begge har nå toppfeltets farge, og sidefargen ligger på `.skall`. Virker ikke dette, er neste steg `apple-mobile-web-app-status-bar-style: black`.

**Tillegg 0.1.3:** Med mørk bakgrunnsfarge forsvant den grå toningen. iOS la likevel en uskarp, gjennomsiktig kant over øvre del av toppfeltet, så appnavnet så uklart ut. Eier valgte å flytte innholdet ned framfor å bruke svart statuslinje. I installert app på berøringsskjerm (`display-mode: standalone` og `pointer: coarse`) får toppfeltet `--topplinje-luft-installert` (1,5 rem) ekstra luft over innholdet. Verdien ligger i `tokens.css` og kan justeres.

**Endret 04.10.2026 (avgjørelse 056):** Bunnmenyen er tatt bort. Toppfeltet har tilbake, appnavnet (til forsiden), søk og innstillinger, og favorittene står på forsiden. Lerretet har sidefargen nederst.
