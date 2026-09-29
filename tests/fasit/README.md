# Fasittester

Eiergodkjente eksempler med input, forventet svar og begrunnelse. **Endres aldri uten eiers godkjenning.**
Feiler en fasittest, er det koden eller regelsettet som skal undersøkes.

Hvert regelverk får sin egen mappe, f.eks. `tests/fasit/sfs2213/`. Hvert eksempel er én YAML-fil:

```yaml
id: sfs2213-001
beskrivelse: Kort beskrivelse av situasjonen (anonymisert)
godkjent: { av: eier, dato: 2026-10-01 }
kalkulator: beskjeftigelse
input: { ... }
forventet: { ... }
begrunnelse: Hvorfor svaret er riktig, med henvisning til kilden.
```

Fase 0 har ingen fasiteksempler. Eksemplene for SFS 2213 kommer fra eier i fase 1.
