---
name: ny-kilde
description: Ta inn en ny kilde i Jukselappen (en side, et datasett, en lov eller forskrift, en nyhetskilde), eller føre opp en kilde som ikke kan hentes. Brukes når nytt innhold eller nye tall bygger på en kilde som ikke står i content/kilder.yaml, eller når en kilde stenger, flytter eller må gis opp.
---

# Ny kilde

Reglene i AGENTS.md («Innhold og kilder») gjelder. Kort: `godkjent: null`, aldri sett `godkjent` eller `godkjent_fingeravtrykk` selv, og kopier ikke partenes tolkninger eller andres veiledninger.

## 1. Kan den brukes?

- **Lisens og vilkår:** NLOD og CC BY kan brukes med kreditering. Er vilkårene uklare: `lisens: Opphavsrett <utgiver>. Vilkår for gjenbruk er ikke avklart. Lenkes, kopieres ikke.`, og skriv med egne ord.
- **robots.txt og vilkår:** Stenger nettstedet for roboter, krever innlogging, har ingen feed eller ingen lisens: ta den ikke med. Før den i stedet i `docs/KILDER-IKKE-MED.md` (steg 4).
- **Nås fra Actions?** Skymiljøet når ikke alle nettsteder (Lovdata nås bare fra Actions). En kilde som bare stenger skymiljøet, kan ofte hentes i kildesjekken.

## 2. Kilderegisteret

Ny oppføring i `content/kilder.yaml` med feltene i `docs/INNHOLDSMODELL.md` («Kilderegister»): `id`, `navn`, `utgiver`, `url`, `type`, `niva` (og `fylke` for lokale), `lisens`, `sjekkmetode`, `aktiv`, `uttrekk` for `side` og `lovdata`, og:

```yaml
    godkjent: null
    godkjent_fingeravtrykk: null
```

- Lov eller forskrift i Lov og forskrift: også en oppføring i `content/lovverk.yaml` med kapitlene eller paragrafene som skal med.
- Nyhetskilde: `content/nyheter/kilder.yaml`, og prøv den med `npm run nyheter:prove`.
- Data under NLOD eller CC BY: kreditering under «Om» (tekstene i `src/strings/nb.ts` og `nn.ts`).
- Kjør `npm run kilder:dokumenter`, så `docs/KILDER.md` er oppdatert (testet).

## 3. Innholdet som bygger på kilden

- Hver kilde i et innholdselement har `id`, `punkt` og `url` til avsnittet når kilden har egne adresser for avsnitt.
- Nytt innhold får `kontrollert: null` og 1–5 `kontrollsporsmal` om det som er usikkert, så eier kan svare ut fra kilden.
- Tall i `rules/` får `sitat` (kort, ordrett der tallet står), eller `grunnlag: avledet`/`praksis` med merknad.
- Praksis eller tolkning som ikke står i kilden: `content/kontroll/praksis.yaml` med `bekreftet: null`.

## 4. Kilder som ikke er med

En kilde som skulle vært med, men ikke kan hentes, får en rad i riktig tabell i `docs/KILDER-IKKE-MED.md`: kilde, hva vi ville ha, hvorfor ikke, og hva som kan åpne den. Blir den tatt med eller gitt opp senere, oppdateres raden.

## 5. Godkjenning

Eier godkjenner kilden med `/godkjent` i kontrollsaken, eller sier fra med dato. Først da settes `godkjent`. Nevn den nye kilden i PR-en og i rapporten til eier.

## Ferdig når

`npm run lint`, `npm run typecheck`, `npm test` og `npm run test:e2e:berorte` er grønne, og `docs/KILDER.md` er generert på nytt.
