# Fase 6, pakke 7: «Mer opplæring» – forslag til eier (06.10.2026)

Grunnlaget er `fase-6-pakke-7-mer-opplaering.md` og kapittel 1 i `forslag-meropplaering-og-nyheter.md`. Mockupen er bygget i appen og ligger på grenen `claude/fase-6-pakke-7-opplaering-f56d98` og i testversjonen (`https://jukselappen.no/test/#/inntak/mer-opplaering`).

Innholdet er skrevet rett i `content/inntak/mer-opplaering.yaml`, på bokmål og nynorsk, med kilder og kontrollspørsmål. Alt har `kontrollert: null`. Klage på vedtaket er ikke med, fordi det ikke står i kildene.

## 1. Plassering

- **Adressen:** `#/inntak/mer-opplaering`, med sti «Inntak» og stjerne.
- **Inntak:** et nytt kort «Mer opplæring i fag som ikke er bestått» mellom veiviseren og kalenderen (skjermbilde 4).
- **Søket** finner siden på «mer opplæring», «ikke bestått», «stryk», «IV» og «fullføringsretten».
- **Ikon:** et nytt ikon «igjen» (en pil i ring).
- `?del=<id>` åpner et kort og ruller dit, som på Eksamen. Tilrettelegging og prøvesiden lenker rett til kortet sitt.

## 2. Siden (skjermbilde 1–3)

Samme byggeklosser som Vurdering, så siden ser kjent ut:

1. **Hvem har rett?** En sammenligning «Har rett» mot «Har ikke rett», med tre rader: opplæringen i faget (1. mars), karakteren og veien videre. Regelverket og kildene står som lukkede rader under.
2. **Hva retten gir:** ett kort. Opplæring fram mot ny standpunktkarakter, etter læreplanen, med unntak fra timetallet.
3. **Fra melding til ny karakter:** en sti med fire steg: melde fra (fylkets frist), vedtak, opplæringen og ny standpunktkarakter.
4. **Fag- eller svenneprøven:** en boks med tabell over løpene: hovedmodellen (2+2), avviksfag, særløp (1+3) og kontrakt som avviker.
5. **Vurdering:** fire kort: ny, utsatt eller særskilt eksamen samtidig, trekket til eksamen, fraværsgrensen og førstegangsvitnemål.
6. **Voksne:** to kort: fag som ikke er bestått (§ 14-2 første ledd) og fag- eller svenneprøven (andre ledd, også fagbrev på jobb).
7. **Individuelt tilrettelagt opplæring:** fullføringsretten for elever med IOP, og tilpassede løp (ofo. § 5-1 tredje ledd).
8. **Videre:** kalenderen, veiviseren, utsatt, ny og særskilt eksamen og lærlinger og kandidater.

**På skrivebord** (fra 64rem) står siden i to kolonner, som lærlinger og kandidater: 1–4 til venstre, 5–8 til høyre (skjermbilde 3).

## 3. Lenker til siden

- **Begrepet `mer-opplaering`:** «Mer opplæring», med lenkeord «mer opplæring» og «rett til mer opplæring» (nynorsk «meir opplæring» og «rett til meir opplæring»). Teksten i hele appen lenker dit av seg selv, og begrepet lenker til siden.
- **Vurdering:** en lenke under «Når eleven ikke består eller ikke møter» på Eksamen (skjermbilde 7), og under «Når kandidaten ikke består …» på prøvesiden.
- **Lærlinger og kandidater:** en ny overgang under «Lærling»: «Mer opplæring på Vg3», med § 5-2 tredje ledd og § 4-9 femte ledd som kilder (skjermbilde 6).
- **Tilrettelegging:** én setning i steget «Individuell opplæringsplan (IOP)» om fullføringsretten, med lenke til kortet.
- **Kalenderen:** `fr-mer-opplaering` og de to datoene om mer opplæring i Vurdering lenker til siden.
- **Veiviseren «Rett, inntak og søknad»:** et nytt svar under «Hvilket trinn søker søkeren til?»: «Mer opplæring i fag som ikke er bestått». Det går til et nytt sluttsteg «Mer opplæring» med fristen og lenke til siden (skjermbilde 5).

## 4. Kildene

Tre nye kilder i kilderegisteret, fulgt av kildesjekken:
- `udir-mer-opplaering`: «Rett til mer opplæring» (seks kapitler)
- `udir-mer-opplaering-voksne`: «Rett til mer opplæring for voksne» (fire kapitler)
- `udir-fullforingsretten-iop`: «Fullføringsretten for elever med individuelt tilrettelagt opplæring»

Hver kilde i kortene har `punkt` og `url` til kapitlet eller avsnittet.

## 5. Spørsmål til eier

1. **«Vg3 i skole»:** Arbeidsordren sier «Vg3 i skole». Forskriften sier «opplæringstilbod på vidaregåande trinn 3», og Udir sier at opplæringen er ment å skje i bedrift der det er mulig. Mockupen skriver derfor «et tilbud på Vg3» og «Mer opplæring på Vg3». Er det riktig?
2. **Overgangen** står under «Lærling». Skal «Fag- eller svenneprøven ikke bestått» heller være et eget utgangspunkt under «Hvor er du nå?»?
3. **Veiviseren:** Er et svar under «Hvilket trinn søker søkeren til?» greit, eller vil du ha et eget spørsmål («Har eleven fag som ikke er bestått?»)? Et eget spørsmål gir ett trykk mer for alle.
4. **Førstegangsvitnemål og tilpassede løp** står i kildene (Udirs kapittel 5 og siden om fullføringsretten), men ikke i arbeidsordren. Skal de være med?
5. **Privatskoler:** Udirs kapittel 6 sier at privatskoler kan tilby mer opplæring, men ikke har plikt til det og ikke kan gjøre unntak fra timetallet. Skal det med?

De andre kontrollspørsmålene står ved hvert kort i YAML-filen og kommer i kontrolloversikten.
