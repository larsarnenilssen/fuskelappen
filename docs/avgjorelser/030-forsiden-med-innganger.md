# 030 – Forsiden med hovedbokser og en boks med resten

**Kontekst:** Eier ønsket 01.10.2026 færre steg og en ryddigere forside. Hurtigkalkulatorene hadde egen overskrift og gjentok det som sto under «Arbeidstid». Mellomsiden for arbeidstid var et ekstra steg. De nye modulene Læreplanverket og Opplæringsløp skal stå direkte under «Læreplanverk og opplæringsløp», uten mellomside.

**Valg:**
- Hver modul kan oppgi `innganger` i manifestet: boksene den har på forsiden under kategorien sin. Innganger merket `flere` står i én boks som er lukket til brukeren åpner den, med tittelen `flereTittel` og navnene på det som ligger i den. Om boksen er åpen, huskes for siden i nettleserhistorikken, som de andre sammenleggbare kortene.
- Uten `innganger` er modulen selv én boks, som før. Forsiden bygges fortsatt bare fra modulregisteret.
- Arbeidstid: Arbeidsplan er hovedboksen. Beskjeftigelse, Vikartimer og Overtid står under «Flere kalkulatorer». Egen overskrift for hurtigkalkulatorer og oversiktssiden for arbeidstid er tatt bort. `#/arbeidstid` sender til forsiden uten ny oppføring i historikken.
- Kategorien «Fag og vurdering» heter nå «Læreplanverk og opplæringsløp».

**Konsekvens:** Én måte å vise moduler på overalt. Nye moduler med flere funksjoner kan bruke samme mønster uten endring i forsidekoden. `hurtigfunksjoner` finnes ikke lenger.
