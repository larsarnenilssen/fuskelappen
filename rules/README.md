# Regelsett

Tariff- og lovavhengige verdier som data, én mappe per regelverk og én fil per periode. Skjemaet står i
`docs/INNHOLDSMODELL.md`, og all lesing går gjennom `hentVerdi()` i `src/core/regler/`.

- `sfs2213/2026-2027.yaml`: SFS 2213 for 1.1.2026–31.12.2027 (årsverk, planfestet tid, grenser, tillegg).
- `sfs2213/arsrammer-2026-2027.yaml`: vedlegg 1 (årsrammer i videregående), del av samme regelsett.
- `sfs2213/fagsok-2026-2027.yaml`: søkeord for fagsøket (fulle navn, Grep-koder og kallenavn), del av samme regelsett.
- `hta/2026-2028.yaml`: hovedtariffavtalen 1.5.2026–30.4.2028 (timelønn, feriepenger, overtidstillegg, garantilønn).

Alle verdier har `kontrollert: null` til eier har godkjent dem. Ny periode: ny fil med nye datoer og nye fasittester.
