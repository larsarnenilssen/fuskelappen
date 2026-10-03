# 046 – Frister på en tidslinje

**Kontekst:** Fase 5, pakke 2: fristene ved inntak skal kunne leses med ett blikk, på mobil og PC (eier 03.10.2026). Frist-elementet i innholdsmodellen hadde bare en fast dato hvert år, og mange frister ved inntak har ikke en fast dato (svar i juli, «minst fire uker før fristen», hele året for voksne).

**Valg:**
- **Innholdet:** `regel` kan være en fast dato hvert år (`arlig`), en måned (`maned`) eller hele året (`lopende`). `naar` er tidspunktet med ord når det ikke er en dato. `grupper` sier hvem fristen gjelder (`ungdom`, `voksne`, `fortrinn`), og `paragrafer` lenker til Regelverk som stegene i veiviserne. Frister uten grupper gjelder alle.
- **Siden** `#/inntak/frister`: inntaksåret fra oktober til september. Øverst en stripe med tolv måneder og en prikk per frist (hul prikk for fylkets frister), og et trykk går til måneden. Under står fristene per måned, lukket til brukeren åpner dem. Måneder uten frister står bare i stripen.
- **Filteret** står i adressen (`?vis=voksne`), så en lenke kan gå rett til fristene for en gruppe.
- **Vestland:** fristene fra den lokale forskriften supplerer de nasjonale og vises bare når Vestland er valgt.
- **Svar og andre inntak:** Datoene settes av fylkene og står på Vilbli. Appen lenker dit. Vilbli kan ikke hentes automatisk ennå, så det finnes ingen årlig fil med datoer.
- **Oversikten** over Inntak viser den neste fristen, med lenke til tidslinjen.

**Konsekvens:** Andre moduler kan bruke de samme feltene for sine frister. Den neste fristen regnes ut fra datoen på enheten.
