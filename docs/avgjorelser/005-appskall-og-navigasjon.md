# 005 – Appskall, ruting og navigasjon

**Kontekst:** Appen skal ha ett scrollområde, fast topp og navigasjon, native scroll og tilbakenavigasjon, hash-ruting og ingen horisontal overflyt (3.10). Den skal virke på GitHub Pages og installert.

**Valg:**
- Dokumentet er eneste scrollområde. Det gir riktig oppførsel på iOS (trykk på statuslinjen, gummistrikk og tilbake-sveip). Topplinjen er `position: sticky`, bunnmenyen `position: fixed`, og begge har `safe-area`-innfelt.
- Bunnmeny med fire faste punkter: Hjem, Søk, Favoritter og Innstillinger. «Om» nås fra innstillingene, forsiden og kildestatusindikatoren.
- Egen liten hash-ruter i stedet for et rutingbibliotek. Hver navigasjon er en historikkoppføring. Scrollposisjonen gjenopprettes ved tilbake, og fokus flyttes til `h1`.
- Tema settes av et lite innebygd skript i `index.html` før første tegning, så skjermen ikke blinker.

**Konsekvens:** Ingen nye avhengigheter. Ruter defineres i modulmanifestene og i `src/app/ruteliste.ts`.
