# Regelsett

Tariff- og lovavhengige verdier som data, én mappe per regelverk og én fil per periode, f.eks.
`rules/sfs2213/2026-2027.yaml`. Skjemaet står i `docs/INNHOLDSMODELL.md`, og all lesing går gjennom
`hentVerdi()` i `src/core/regler/`. Fase 0 har ingen regelsett; SFS 2213 kommer i fase 1.
