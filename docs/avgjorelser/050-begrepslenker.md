# 050 – Lenker til begrepsbanken i brødtekst

**Kontekst:** Eier ba 03.10.2026 om at begreper i brødtekst lenker til begrepsbanken, diskré og konsekvent, og at nye begreper får lenker av seg selv. Hele appen skulle ikke bli én stor blå lenke.

**Valg:**
- **Automatisk ved bygg:** Når teksten i `content/` gjøres om fra markdown til HTML (`scripts/innhold/last.ts`), legger `src/core/innhold/begrepslenker.ts` inn lenkene. Innledninger og hjelpetekster fra `src/strings` får lenker med komponenten `Begrepstekst`, med lenkeordene fra `virtual:begrepsord`.
- **Første forekomst:** Hvert begrep lenkes første gang det står i en tekst, ikke senere. Vanlig praksis for ordlister, og det holder teksten rolig.
- **Ikke** i overskrifter, uthevede ledetekster (`**Klage:**`), andre lenker, lov- og forskriftstekst (`kildetekst`) eller til begrepet teksten handler om.
- **Fylker:** Et begrep for ett fylke lenkes bare fra tekst for samme fylke. Tekster i `src/strings` lenker bare til nasjonale begreper.
- **Ordene:** Tittelen på begrepet, eller `lenkeord` når tittelen ikke er ordet i teksten (f.eks. «fortrinnsrett» for «Fortrinnsrett ved inntak»). Vanlige bøyningsendelser kommer med for ord på minst fem bokstaver. `lenkeord: { nb: [], nn: [] }` slår lenkingen av, f.eks. for «Kompetanse», som også brukes om de ansattes kompetanse.
- **Utseende:** Teksten beholder fargen og får en tynn, stiplet, dempet strek under (`a.begrepslenke` i `base.css`). Streken skiller lenken fra teksten uten farge (WCAG 1.4.1). Ved pek og fokus blir den heltrukket i lenkefargen. Lenker som allerede gikk til begrepsbanken i teksten, får samme utseende.
- **Egne lenker beholdes:** «Om begrepet …»-lenker under en seksjon og «i»-knappen på fagsiden er handlinger, ikke ord i en setning, og står som før. «Om begrepet lov» og «Om begrepet overordnet del» etter innledningen er fjernet, fordi ordene i innledningen nå er lenker.

**Konsekvens:** Et nytt begrep med enkel tittel lenkes uten mer arbeid. En test krever `lenkeord` når tittelen ikke er enkel, og at to begreper ikke har samme lenkeord.
