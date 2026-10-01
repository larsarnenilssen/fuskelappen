# 027 – Lenker til Vilbli for skolene som har et tilbud

**Kontekst:** Eier vil vise hvilke skoler som tilbyr hvert tilbud. Det finnes ingen åpen kilde for det (avgjørelse 026, `docs/VIGO-KODEVERK.md`). Vilbli.no, fylkeskommunenes tjeneste for søkere, viser skolene og lærebedriftene for hvert tilbud og holder det oppdatert fra VIGO. Vilbli stenger for maskinell henting. Eier ba 01.10.2026 om lenker til Vilbli som mellomlanding.

**Valg:**
- `src/modules/fag/tilbud/vilbli.ts` lager lenken fra programområdekodene og «bygger på» i Grep. Formatet er `https://www.vilbli.no/nb/nb/<fylke>/<utdanningsprogram>/program/v.<program>/<løpet>/<side>`, lest ut av adressene på Vilbli.
  - `<fylke>` er `no` for hele landet.
  - `<løpet>` er kodene fra vg1 og fram til tilbudet.
  - `<side>` er `p5` for skoler og lærebedrifter og `p2` for fag- og timefordelingen.
- Når et tilbud kan nås fra flere programområder, følger lenken løpet brukeren kom fra.
- Appen lagrer ingen skoledata og gjør ingen kall til Vilbli. Det er bare lenker.
- `docs/TILBUDSSTRUKTUR.md` har lenkene nå. Visningen i appen får dem også, med fylket fra innstillingene.

**Konsekvens:** Lenkene følger Grep hver uke uten vedlikehold. Endrer Vilbli adresseformatet, virker ikke lenkene lenger. Det kan ikke kontrolleres automatisk. Vilbli svarer alle automatiske forespørsler med en side for «Human Verification», så en sjekk kan ikke skille en virkende lenke fra en brutt. Kontrollrundene i mai og august (avgjørelse 019) har derfor seks lenker til avkrysning (`kontrollenker()`), som eier åpner for hånd.
