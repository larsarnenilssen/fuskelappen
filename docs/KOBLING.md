# Kobling fra fagkode til årsramme

Laget automatisk (`npm run kobling:rapport`). Kildesjekken lager rapporten på nytt hver mandag etter at Grep er hentet. Grep hentet 2026-10-01.

Koblingen står i `rules/sfs2213/kobling-fagkode.yaml`. Fellesfag kobles eksplisitt per fagkode, utdanningsprogram og trinn. Felles programfag kobles med regler på fagkodeprefiks, utdanningsprogram og trinn. Alt er et forslag som ikke er kontrollert ennå. Se avgjørelse 023.

## Sammendrag

| | Fagkoder |
|---|---:|
| Fagkoder i videregående i Grep | 1978 |
| Koblet til én årsramme | 718 |
| Koblet, men årsrammen avhenger av utdanningsprogram eller trinn (kalkulatoren spør) | 30 |
| Ikke koblet (listen nederst) | 1230 |

Av de koblede er 491 koblet eksplisitt og 257 med regel.

## Avvik

Ingen avvik.

## Programnavn i vedlegg 1 og utdanningsprogram i Grep

Tabellen skal bekreftes av eier.

| Vedlegg 1 | Utdanningsprogram | Kode i Grep |
|---|---|---|
| Stud.spes | Studiespesialisering | ST |
| MDD | Musikk, dans og drama | MD |
| Idrett | Idrettsfag | ID |
| Kunst, design og arkitektur | Kunst, design og arkitektur | KD |
| Med./komm | Medier og kommunikasjon | ME |
| Med./komm. | Medier og kommunikasjon | ME |
| Yrkesfag | Yrkesfaglige utdanningsprogram | BA, DT, EL, FD, HS, IM, NA, RM, SR, TP |
| Yrkes/På | Påbygging til generell studiekompetanse | PB |
| Yrkesf/På | Påbygging til generell studiekompetanse | PB |
| Rest. og mat | Restaurant- og matfag | RM |
| Bygg og anl. | Bygg- og anleggsteknikk | BA |
| Naturbruk | Naturbruk | NA |
| Tekn/ind.prod | Teknologi- og industrifag | TP |
| Helse/sos | Helse- og oppvekstfag | HS |
| Elektrofag | Elektro og datateknologi | EL |
| Håndverk, design og produktutvikling | Håndverk, design og produktutvikling | DT |
| Frisør, blomster, interiør og eksponeringsdesign | Frisør, blomster, interiør og eksponeringsdesign | FD |
| Salg, service, reiseliv | Salg, service og reiseliv | SR |
| Informasjonsteknologi og medieproduksjon | Informasjonsteknologi og medieproduksjon | IM |
| Design og hå | Design og håndverk (utgått) | – |
| Serv/samf | Service og samferdsel (utgått) | – |

## Utvalg til kontroll

Et fast utvalg koblinger (det samme fra uke til uke så lenge dataene er de samme). Stemmer årsrammen med det dere bruker?

| Fagkode | Fag | Program og trinn | Rad i vedlegg 1 | Årsramme (60/45) | Hvordan |
|---|---|---|---|---|---|
| FSP6538 | Thai I, 1. år | ID Vg1 | 46: Fremmedspråk – Idrett Vg1 | 554/739 | eksplisitt |
| FSP6538 | Thai I, 1. år | MD Vg1 | 47: Fremmedspråk – MDD Vg1 | 554/739 | eksplisitt |
| FSP6538 | Thai I, 1. år | ST Vg1 | 45: Fremmedspråk – Stud.spes Vg1 | 554/739 | eksplisitt |
| MAT1142 | Matematikk 1T-Y IM, muntlig-praktisk | IM Vg1 | 72: Matematikk – Yrkesfag Vg1 | 525/700 * | eksplisitt |
| NOR1263 | Norsk, vg2 yrkesfaglige utdanningsprogram, muntlig | BA Vg1 | 64: Norsk – Yrkesfag Vg1 | 525/700 * | eksplisitt |
| NOR1263 | Norsk, vg2 yrkesfaglige utdanningsprogram, muntlig | BA Vg2 | 65: Norsk – Yrkesfag Vg2 | 525/700 * | eksplisitt |
| NOR1263 | Norsk, vg2 yrkesfaglige utdanningsprogram, muntlig | DT Vg1 | 64: Norsk – Yrkesfag Vg1 | 525/700 * | eksplisitt |
| KRO1019 | Kroppsøving Vg3 | ST Vg3 | 8: Kroppsøv. – Stud.spes Vg3 | 635/847 | eksplisitt |
| REL1003 | Religion og etikk | ID Vg3 | 33: Rel/etikk – Idrett Vg3 | 569/759 | eksplisitt |
| REL1003 | Religion og etikk | MD Vg3 | 34: Rel/etikk – MDD Vg3 | 569/759 | eksplisitt |
| REL1003 | Religion og etikk | ST Vg3 | 35: Rel/etikk – Stud.spes Vg3 | 569/759 | eksplisitt |
| NAT1010 | Naturfag vg1 FD | FD Vg1 | 41: Naturfag – Yrkesfag Vg1 | 554/739 * | eksplisitt |
| ENG1008 | Engelsk vg1 studieforberedende utdanningsprogram, muntlig | ID Vg1 | 75: Engelsk – Idrett Vg1 | 525/700 * | eksplisitt |
| ENG1008 | Engelsk vg1 studieforberedende utdanningsprogram, muntlig | MD Vg1 | 76: Engelsk – MDD Vg1 | 525/700 * | eksplisitt |
| ENG1008 | Engelsk vg1 studieforberedende utdanningsprogram, muntlig | ST Vg1 | 68: Engelsk – Stud.spes Vg1 | 525/700 * | eksplisitt |
| GEO1003 | Geografi | ID Vg2 | 51: Geografi – Idrett Vg2 | 554/739 | eksplisitt |
| GEO1003 | Geografi | MD Vg2 | 52: Geografi – MDD Vg2 | 554/739 | eksplisitt |
| GEO1003 | Geografi | ST Vg1 | 53: Geografi – Stud.spes Vg1 | 554/739 | eksplisitt |
| HIS1009 | Historie vg2 studieforberedende utdanningsprogram | ID Vg2 | 48: Historie – Idrett Vg2 | 554/739 | eksplisitt |
| HIS1009 | Historie vg2 studieforberedende utdanningsprogram | MD Vg2 | 49: Historie – MDD Vg2 | 554/739 | eksplisitt |
| HIS1009 | Historie vg2 studieforberedende utdanningsprogram | ST Vg2 | 50: Historie – Stud.spes Vg2 | 554/739 | eksplisitt |
| SAK1001 | Samfunnskunnskap | BA Vg2 | 36: Samf.fag – Yrkesfag Vg2 | 554/739 * | eksplisitt |
| SAK1001 | Samfunnskunnskap | DT Vg2 | 36: Samf.fag – Yrkesfag Vg2 | 554/739 * | eksplisitt |
| SAK1001 | Samfunnskunnskap | EL Vg2 | 36: Samf.fag – Yrkesfag Vg2 | 554/739 * | eksplisitt |
| REA3042 | Geofag 1 | ST Vg2 | 130: Geofag 1/2 – Stud.spes Vg2 | 496/661 | eksplisitt |
| REA3042 | Geofag 1 | ST Vg3 | 131: Geofag 1/2 – Stud.spes Vg3 | 496/661 | eksplisitt |
| SAM3054 | Sosiologi og sosialantropologi | ST Vg2 | 126: Pol/samf – Stud.spes Vg2 | 496/661 | eksplisitt |
| SAM3054 | Sosiologi og sosialantropologi | ST Vg3 | 127: Pol/samf – Stud.spes Vg3 | 496/661 | eksplisitt |
| SAM3072 | Psykologi 1 | ST Vg2 | 83: Psykologi – Stud.spes Vg2 | 525/700 | eksplisitt |
| SAM3072 | Psykologi 1 | ST Vg3 | 84: Psykologi – Stud.spes Vg3 | 525/700 | eksplisitt |
| SPR3033 | Kommunikasjon og kultur 1 | ST Vg2 | 78: Kultur/komm – Stud.spes Vg2 | 525/700 | eksplisitt |
| SPR3033 | Kommunikasjon og kultur 1 | ST Vg3 | 79: Kultur/komm – Stud.spes Vg3 | 525/700 | eksplisitt |
| REA3046 | Kjemi 2 | ST Vg2 | 134: Kjemi – Stud.spes Vg2 | 496/661 | eksplisitt |
| REA3046 | Kjemi 2 | ST Vg3 | 135: Kjemi – Stud.spes Vg3 | 496/661 | eksplisitt |
| APO3005 | Helseveiledning i apotek | HS Vg3 | 24: Felles programfag – Helse/sos Vg3 | 607,5/810 | regel hs-vg3 |
| BLK2004 | Karosseri- og lakkteknikk | TP Vg2 | 20: Felles programfag – Tekn/ind.prod Vg2 | 635/847 | regel tp-vg2 |
| BMF2004 | Produktutvikling og kvalitetssikring | TP Vg2 | 20: Felles programfag – Tekn/ind.prod Vg2 | 635/847 | regel tp-vg2 |
| UIM2004 | Produksjon og vedlikehold | DT Vg2 | 17: Felles programfag – Håndverk, design og produktutvikling Vg2 | 635/847 | regel dt-vg2 |
| KPL2003 | Analyse, dokumentasjon og kvalitet | TP Vg2 | 20: Felles programfag – Tekn/ind.prod Vg2 | 635/847 | regel tp-vg2 |
| STH2001 | Design og produktutvikling | DT Vg2 | 17: Felles programfag – Håndverk, design og produktutvikling Vg2 | 635/847 | regel dt-vg2 |
| AMB2005 | Ambulansemedisin | HS Vg2 | 23: Felles programfag – Helse/sos Vg2 | 607,5/810 | regel hs-vg2 |
| HSE3005 | Helse og sykdom | HS Vg3 | 24: Felles programfag – Helse/sos Vg3 | 607,5/810 | regel hs-vg3 |
| IDR2025 | Treningslære 1 vg1 | ID Vg1 | 59: Felles programfag – Idrett Vg1 | 554/739 | regel id-vg1 |
| YFF4206 | Yrkesfaglig fordypning vg2 | BA Vg2 | 14: Felles programfag – Bygg og anl. Vg2 | 635/847 | regel yff-ba-vg2 |
| YFF4206 | Yrkesfaglig fordypning vg2 | DT Vg2 | 17: Felles programfag – Håndverk, design og produktutvikling Vg2 | 635/847 | regel yff-dt-vg2 |
| YFF4206 | Yrkesfaglig fordypning vg2 | EL Vg2 | 27: Felles programfag – Elektrofag Vg2 | 583,5/778 | regel yff-el-vg2 |

## Program og trinn uten kobling

Fag med årstimer som brukes på et utdanningsprogram og trinn i Grep, men som ikke er koblet der. Ofte fordi vedlegg 1 ikke har en rad for programmet og trinnet.

| Program | Trinn | Fagtype | Fagkoder | Eksempler |
|---|---|---|---:|---|
| Bygg- og anleggsteknikk (BA) | Vg1 | fellesfag | 18 | ENG1013, KEF1001, KEF1101, NAT1020 |
| Bygg- og anleggsteknikk (BA) | Vg2 | felles programfag | 1 | YFO2002 |
| Bygg- og anleggsteknikk (BA) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Håndverk, design og produktutvikling (DT) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1024 |
| Håndverk, design og produktutvikling (DT) | Vg2 | felles programfag | 1 | YFO2002 |
| Håndverk, design og produktutvikling (DT) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Elektro og datateknologi (EL) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1021 |
| Elektro og datateknologi (EL) | Vg2 | felles programfag | 1 | YFO2002 |
| Elektro og datateknologi (EL) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Elektro og datateknologi (EL) | Vg3 | fellesfag | 1 | KRO1019 |
| Frisør, blomster, interiør og eksponeringsdesign (FD) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1022 |
| Frisør, blomster, interiør og eksponeringsdesign (FD) | Vg2 | felles programfag | 1 | YFO2002 |
| Frisør, blomster, interiør og eksponeringsdesign (FD) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Frisør, blomster, interiør og eksponeringsdesign (FD) | Vg3 | felles programfag | 4 | EKD3001, EKD3002, INT3004, INT3005 |
| Frisør, blomster, interiør og eksponeringsdesign (FD) | Vg3 | fellesfag | 1 | KRO1019 |
| Helse- og oppvekstfag (HS) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1023 |
| Helse- og oppvekstfag (HS) | Vg2 | felles programfag | 1 | YFO2002 |
| Helse- og oppvekstfag (HS) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Helse- og oppvekstfag (HS) | Vg3 | fellesfag | 1 | KRO1019 |
| Idrettsfag (ID) | Vg1 | fellesfag | 26 | ENG1011, KEF1004, KEF1104, NAT1019 |
| Idrettsfag (ID) | Vg1 | valgfritt programfag | 18 | IDR3013, IDR3014, IDR3015, IDR3016 |
| Idrettsfag (ID) | Vg2 | fellesfag | 26 | GEO1004, HIS1012, KEF1006, KEF1106 |
| Idrettsfag (ID) | Vg2 | valgfritt programfag | 18 | IDR3013, IDR3014, IDR3015, IDR3016 |
| Idrettsfag (ID) | Vg3 | fellesfag | 26 | HIS1013, KEF1008, KEF1108, KRI1037 |
| Idrettsfag (ID) | Vg3 | valgfritt programfag | 16 | IDR3013, IDR3014, IDR3015, IDR3016 |
| Informasjonsteknologi og medieproduksjon (IM) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1025 |
| Informasjonsteknologi og medieproduksjon (IM) | Vg2 | felles programfag | 1 | YFO2002 |
| Informasjonsteknologi og medieproduksjon (IM) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Kunst, design og arkitektur (KD) | Vg1 | fellesfag | 133 | ENG1007, FSP6138, FSP6141, FSP6148 |
| Kunst, design og arkitektur (KD) | Vg1 | valgfritt programfag | 1 | KRI1023 |
| Kunst, design og arkitektur (KD) | Vg2 | fellesfag | 145 | FSP6139, FSP6142, FSP6149, FSP6152 |
| Kunst, design og arkitektur (KD) | Vg2 | valgfritt programfag | 7 | KDA3007, KDA3008, KDA3009, KDA3010 |
| Kunst, design og arkitektur (KD) | Vg3 | fellesfag | 42 | FSP6156, FSP6166, FSP6176, FSP6186 |
| Kunst, design og arkitektur (KD) | Vg3 | valgfritt programfag | 6 | KDA3007, KDA3008, KDA3009, KDA3010 |
| Musikk, dans og drama (MD) | Vg1 | fellesfag | 26 | ENG1011, KEF1004, KEF1104, NAT1019 |
| Musikk, dans og drama (MD) | Vg1 | valgfritt programfag | 7 | KRI1023, MDD3006, MDD3007, MDD3008 |
| Musikk, dans og drama (MD) | Vg2 | fellesfag | 26 | GEO1004, HIS1012, KEF1006, KEF1106 |
| Musikk, dans og drama (MD) | Vg2 | valgfritt programfag | 8 | DAN3003, DAN3004, DRA3003, DRA3004 |
| Musikk, dans og drama (MD) | Vg3 | fellesfag | 25 | HIS1013, KEF1008, KEF1108, NOR1053 |
| Musikk, dans og drama (MD) | Vg3 | valgfritt programfag | 7 | DAN3003, DAN3004, DRA3003, DRA3004 |
| Medier og kommunikasjon (ME) | Vg1 | fellesfag | 133 | ENG1007, FSP6138, FSP6141, FSP6148 |
| Medier og kommunikasjon (ME) | Vg1 | valgfritt programfag | 1 | KRI1023 |
| Medier og kommunikasjon (ME) | Vg2 | fellesfag | 145 | FSP6139, FSP6142, FSP6149, FSP6152 |
| Medier og kommunikasjon (ME) | Vg2 | valgfritt programfag | 6 | KRI1024, MOK3007, MOK3008, MOK3009 |
| Medier og kommunikasjon (ME) | Vg3 | fellesfag | 42 | FSP6156, FSP6166, FSP6176, FSP6186 |
| Medier og kommunikasjon (ME) | Vg3 | valgfritt programfag | 6 | MOK3007, MOK3008, MOK3009, MOK3010 |
| Naturbruk (NA) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1026 |
| Naturbruk (NA) | Vg2 | felles programfag | 1 | YFO2002 |
| Naturbruk (NA) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Naturbruk (NA) | Vg3 | fellesfag | 4 | KRO1019, NOR1054, NOR1058, NOR1062 |
| Naturbruk (NA) | Vg3 | valgfritt programfag | 6 | LBR3012, LBR3013, LBR3014, NAB3008 |
| Påbygging til generell studiekompetanse (PB) | Vg3 | fellesfag | 26 | KRO1019, HIS1014, HIS1015, KEF1010 |
| Restaurant- og matfag (RM) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1027 |
| Restaurant- og matfag (RM) | Vg2 | felles programfag | 1 | YFO2002 |
| Restaurant- og matfag (RM) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Salg, service og reiseliv (SR) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1028 |
| Salg, service og reiseliv (SR) | Vg2 | felles programfag | 1 | YFO2002 |
| Salg, service og reiseliv (SR) | Vg2 | fellesfag | 21 | NOR1066, NOR1076, NOR1152, NOR1156 |
| Studiespesialisering (ST) | Vg1 | fellesfag | 28 | ENG1011, GEO1004, KEF1004, KEF1104 |
| Studiespesialisering (ST) | Vg1 | valgfritt programfag | 2 | KRI1023, KRI1028 |
| Studiespesialisering (ST) | Vg2 | fellesfag | 24 | HIS1012, KEF1006, KEF1106, NOR1052 |
| Studiespesialisering (ST) | Vg2 | valgfritt programfag | 164 | KRI1024, KRI1029, PSP5790, PSP5792 |
| Studiespesialisering (ST) | Vg3 | fellesfag | 26 | HIS1013, KEF1008, KEF1108, KRI1037 |
| Studiespesialisering (ST) | Vg3 | valgfritt programfag | 163 | SPR3022, PSP5790, PSP5792, PSP5794 |
| Teknologi- og industrifag (TP) | Vg1 | fellesfag | 19 | ENG1013, KEF1001, KEF1101, NAT1029 |
| Teknologi- og industrifag (TP) | Vg2 | felles programfag | 1 | YFO2002 |
| Teknologi- og industrifag (TP) | Vg2 | fellesfag | 23 | KEF1002, KEF1102, NOR1066, NOR1076 |
| Teknologi- og industrifag (TP) | Vg2 | valgfritt programfag | 2 | MAR2014, MAR2015 |
| Teknologi- og industrifag (TP) | Vg3 | fellesfag | 1 | KRO1019 |

## Fagkoder som ikke er koblet

### Fellesfag som ikke er koblet (242)

Fellesfag kobles bare eksplisitt. Dette er varianter (samisk plan, tegnspråk, kort botid, grunnleggende norsk, styrket opplæring, morsmål), samisk, og fellesfag på program og trinn uten rad i vedlegg 1. Skal de ha samme årsramme som hovedfaget?

<details><summary>Vis fagkodene</summary>

- ENG1011 Engelsk for elever med tegnspråk, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- ENG1013 Engelsk for elever med tegnspråk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- ENG3001 Engelsk, styrket opplæring, vg1 (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- ENG3002 Engelsk, styrket opplæring, vg2 (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- ENG3003 Engelsk, styrket opplæring, vg3 (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- GEO1004 Geografi, samisk plan (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg1)
- HIS1012 Historie, samisk plan, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- HIS1013 Historie, samisk plan, Vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- HIS1014 Historie, samisk plan, Vg3 påbygging til generell studiekompetanse (PB Vg3)
- HIS1015 Historie, Vg3, påbygging til generell studiekompetanse for elever med samisk, kvensk eller finsk som andrespråk (PB Vg3)
- KEF1001 Kvensk som andrespråk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- KEF1002 Kvensk som andrespråk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- KEF1003 Kvensk som andrespråk, muntlig for privatister, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- KEF1004 Kvensk som andrespråk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- KEF1005 Kvensk som andrespråk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- KEF1006 Kvensk som andrespråk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- KEF1007 Kvensk som andrespråk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- KEF1008 Kvensk som andrespråk, vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- KEF1009 Kvensk som andrespråk, vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- KEF1010 Kvensk som andrespråk, vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- KEF1011 Kvensk som andrespråk, vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- KEF1101 Finsk som andrespråk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- KEF1102 Finsk som andrespråk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- KEF1103 Finsk som andrespråk, muntlig for privatister, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- KEF1104 Finsk som andrespråk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- KEF1105 Finsk som andrespråk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- KEF1106 Finsk som andrespråk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- KEF1107 Finsk som andrespråk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- KEF1108 Finsk som andrespråk, vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- KEF1109 Finsk som andrespråk, vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- KEF1110 Finsk som andrespråk, vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- KEF1111 Finsk som andrespråk, vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- KRI1037 Religion og etikk for katolske skoler (ID Vg3, ST Vg3)
- NAT1019 Naturfag vg1 studieforberedende utdanningsprogram, samisk plan (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NAT1020 Naturfag vg1 BA, samisk plan (BA Vg1)
- NAT1021 Naturfag vg1 EL, samisk plan (EL Vg1)
- NAT1022 Naturfag vg1 FD, samisk plan (FD Vg1)
- NAT1023 Naturfag vg1 HS, samisk plan (HS Vg1)
- NAT1024 Naturfag vg1 DT, samisk plan (DT Vg1)
- NAT1025 Naturfag vg1 IM, samisk plan (IM Vg1)
- NAT1026 Naturfag vg1 NA, samisk plan (NA Vg1)
- NAT1027 Naturfag vg1 RM, samisk plan (RM Vg1)
- NAT1028 Naturfag vg1 SR, samisk plan (SR Vg1)
- NAT1029 Naturfag vg1 TP, samisk plan (TP Vg1)
- NAT1030 Naturfag Vg3 påbygging til generell studiekompetanse, samisk plan (PB Vg3)
- NOR1051 Grunnleggende norsk for språklige minoriteter, nivå 1, vg1 studieforberedende utdanningsprogram og vg2 yrkesfaglige utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1052 Grunnleggende norsk for språklige minoriteter, nivå 1, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1053 Grunnleggende norsk for språklige minoriteter, nivå 1, vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1054 Grunnleggende norsk for språklige minoriteter, nivå 1, vg3 påbygging til generell studiekompetanse (NA Vg3, PB Vg3)
- NOR1055 Grunnleggende norsk for språklige minoriteter, nivå 2, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1056 Grunnleggende norsk for språklige minoriteter, nivå 2, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1057 Grunnleggende norsk for språklige minoriteter, nivå 2, vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1058 Grunnleggende norsk for språklige minoriteter, nivå 2, vg3 påbygging til generell studiekompetanse (NA Vg3, PB Vg3)
- NOR1059 Grunnleggende norsk for språklige minoriteter, nivå 3, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1060 Grunnleggende norsk for språklige minoriteter, nivå 3, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1061 Grunnleggende norsk for språklige minoriteter, nivå 3, vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1062 Grunnleggende norsk for språklige minoriteter, nivå 3, vg3 påbygging til generell studiekompetanse (NA Vg3, PB Vg3)
- NOR1065 Norsk tegnspråk, vg1 yrkesfaglige utdanningsprogram (DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1, NA Vg1 …)
- NOR1066 Norsk tegnspråk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1067 Norsk tegnspråk, vg2 yrkesfaglige utdanningsprogram, muntlig samhandling (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1068 Norsk tegnspråk, vg1 studieforberedende utdanningsprogram, tekstskaping (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1069 Norsk tegnspråk, vg1 studieforberedende utdanningsprogram, muntlig samhandling (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1070 Norsk tegnspråk, vg2 studieforberedende utdanningsprogram, tekstskaping (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1071 Norsk tegnspråk, vg2 studieforberedende utdanningsprogram, muntlig samhandling (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1072 Norsk tegnspråk, vg3 studieforberedende utdanningsprogram, tekstskaping (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1073 Norsk tegnspråk, vg3 studieforberedende utdanningsprogram, muntlig samhandling (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1074 Norsk tegnspråk, vg3 påbygging til generell studiekompetanse, tekstskaping (PB Vg3)
- NOR1075 Norsk tegnspråk, vg3 påbygging til generell studiekompetanse, muntlig samhandling (PB Vg3)
- NOR1076 Norsk for elever med tegnspråk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1077 Norsk for elever med tegnspråk, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1078 Norsk for elever med tegnspråk, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1079 Norsk for elever med tegnspråk, vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1080 Norsk for elever med tegnspråk, vg3 påbygging til generell studiekompetanse (PB Vg3)
- NOR1151 Grunnleggende norsk for språklige minoriteter, nivå 1, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- NOR1152 Grunnleggende norsk for språklige minoriteter, nivå 1, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1155 Grunnleggende norsk for språklige minoriteter, nivå 2, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- NOR1156 Grunnleggende norsk for språklige minoriteter, nivå 2, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1159 Grunnleggende norsk for språklige minoriteter, nivå 3, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- NOR1160 Grunnleggende norsk for språklige minoriteter, nivå 3, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1274 Norsk for elever med samisk som førstespråk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1275 Norsk for elever med samisk som førstespråk, vg2 yrkesfaglige utdanningsprogram, muntlig (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1276 Norsk for elever med samisk som førstespråk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1277 Norsk for elever med samisk som førstespråk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1278 Norsk for elever med samisk som førstespråk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1279 Norsk for elever med samisk som førstespråk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1280 Norsk for elever med samisk som førstespråk, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1281 Norsk for elever med samisk som førstespråk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1282 Norsk for elever med samisk som førstespråk, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- NOR1283 Norsk for elever med samisk som førstespråk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- NOR1284 Norsk for elever med samisk/kvensk/finsk som andrespråk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1285 Norsk for elever med samisk/kvensk/finsk som andrespråk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1286 Norsk for elever med samisk/kvensk/finsk som andrespråk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1287 Norsk for elever med samisk/kvensk/finsk som andrespråk, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1288 Norsk for elever med samisk/kvensk/finsk som andrespråk, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- NOR1412 Norsk for elever i vgo med kort botid i Norge, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1413 Norsk for elever i vgo med kort botid i Norge, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1414 Norsk for elever i vgo med kort botid i Norge, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1416 Norsk for elever i vgo med kort botid i Norge, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1418 Norsk for elever i vgo med kort botid i Norge, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1419 Norsk for elever i vgo med kort botid i Norge, vg2 yrkesfaglige utdanningsprogram, muntlig (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1420 Norsk for elever i vgo med kort botid i Norge, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1421 Norsk for elever i vgo med kort botid i Norge, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1422 Norsk for elever i vgo med kort botid i Norge, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- NOR1423 Norsk for elever i vgo med kort botid i Norge, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- NOR1801 Morsmål for språklige minoriteter, nivå 1 (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1802 Morsmål for språklige minoriteter, nivå 1 (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1803 Morsmål for språklige minoriteter, nivå 1 (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1804 Morsmål for språklige minoriteter, nivå 1 (NA Vg3, PB Vg3)
- NOR1805 Morsmål for språklige minoriteter, nivå 2 (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1806 Morsmål for språklige minoriteter, nivå 2 (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1807 Morsmål for språklige minoriteter, nivå 2 (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1808 Morsmål for språklige minoriteter, nivå 2 (NA Vg3, PB Vg3)
- NOR1809 Morsmål for språklige minoriteter, nivå 3 (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR1810 Morsmål for språklige minoriteter, nivå 3 (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR1811 Morsmål for språklige minoriteter, nivå 3 (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- NOR1812 Morsmål for språklige minoriteter, nivå 3 (NA Vg3, PB Vg3)
- NOR1813 Morsmål for språklige minoriteter, nivå 1 (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- NOR1814 Morsmål for språklige minoriteter, nivå 1 (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1815 Morsmål for språklige minoriteter, nivå 2 (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- NOR1816 Morsmål for språklige minoriteter, nivå 2 (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR1817 Morsmål for språklige minoriteter, nivå 3 (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- NOR1818 Morsmål for språklige minoriteter, nivå 3 (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- NOR3001 Norsk, styrket opplæring, vg1 (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- NOR3002 Norsk, styrket opplæring, vg2 (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- NOR3003 Norsk, styrket opplæring, vg3 (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- REL1004 Religion og etikk, samisk plan (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAK1002 Samfunnskunnskap, samisk plan (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, ID Vg2 …)
- SAS2001 Samisk som andrespråk, samisk 2, nordsamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS2002 Samisk som andrespråk, samisk 2, nordsamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS2003 Samisk som andrespråk, samisk 2, nordsamisk, vg2 yrkesfaglige utdanningsprogram, muntlig (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS2004 Samisk som andrespråk, samisk 2, nordsamisk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS2005 Samisk som andrespråk, samisk 2, nordsamisk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS2006 Samisk som andrespråk, samisk 2, nordsamisk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS2007 Samisk som andrespråk, samisk 2, nordsamisk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS2008 Samisk som andrespråk, samisk 2, nordsamisk, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS2009 Samisk som andrespråk, samisk 2, nordsamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS2010 Samisk som andrespråk, samisk 2, sørsamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS2011 Samisk som andrespråk, samisk 2, sørsamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS2012 Samisk som andrespråk, samisk 2, sørsamisk, vg2 yrkesfaglige utdanningsprogram, muntlig (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS2013 Samisk som andrespråk, samisk 2, sørsamisk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS2014 Samisk som andrespråk, samisk 2, sørsamisk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS2015 Samisk som andrespråk, samisk 2, sørsamisk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS2016 Samisk som andrespråk, samisk 2, sørsamisk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS2017 Samisk som andrespråk, samisk 2, sørsamisk, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS2018 Samisk som andrespråk, samisk 2, sørsamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS2019 Samisk som andrespråk, samisk 2, lulesamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS2020 Samisk som andrespråk, samisk 2, lulesamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS2021 Samisk som andrespråk, samisk 2, lulesamisk, vg2 yrkesfaglige utdanningsprogram, muntlig (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS2022 Samisk som andrespråk, samisk 2, lulesamisk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS2023 Samisk som andrespråk, samisk 2, lulesamisk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS2024 Samisk som andrespråk, samisk 2, lulesamisk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS2025 Samisk som andrespråk, samisk 2, lulesamisk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS2026 Samisk som andrespråk, samisk 2, lulesamisk, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS2027 Samisk som andrespråk, samisk 2, lulesamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS2028 Samisk som andrespråk, samisk 2, nordsamisk, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- SAS2029 Samisk som andrespråk, samisk 2, nordsamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SAS2030 Samisk som andrespråk, samisk 2, sørsamisk, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- SAS2031 Samisk som andrespråk, samisk 2, sørsamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SAS2032 Samisk som andrespråk, samisk 2, lulesamisk, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- SAS2033 Samisk som andrespråk, samisk 2, lulesamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SAS3029 Samisk som andrespråk, samisk 3, nordsamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS3030 Samisk som andrespråk, samisk 3, nordsamisk, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS3031 Samisk som andrespråk, samisk 3, sørsamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS3032 Samisk som andrespråk, samisk 3, sørsamisk, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS3033 Samisk som andrespråk, samisk 3, lulesamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS3034 Samisk som andrespråk, samisk 3, lulesamisk, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS3035 Samisk som andrespråk, samisk 3, nordsamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS3036 Samisk som andrespråk, samisk 3, nordsamisk, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS3037 Samisk som andrespråk, samisk 3, sørsamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS3038 Samisk som andrespråk, samisk 3, sørsamisk, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS3039 Samisk som andrespråk, samisk 3, lulesamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS3040 Samisk som andrespråk, samisk 3, lulesamisk, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS3041 Samisk som andrespråk, samisk 3, nordsamisk, Vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS3042 Samisk som andrespråk, samisk 3, nordsamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS3043 Samisk som andrespråk, samisk 3, sørsamisk, Vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS3044 Samisk som andrespråk, samisk 3, sørsamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS3045 Samisk som andrespråk, samisk 3, lulesamisk, Vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS3046 Samisk som andrespråk, samisk 3, lulesamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS3047 Samisk som andrespråk, samisk 3, nordsamisk, Vg3 påbygging til generell studiekompetanse (PB Vg3)
- SAS3048 Samisk som andrespråk, samisk 3, nordsamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SAS3049 Samisk som andrespråk, samisk 3, sørsamisk, Vg3 påbygging til generell studiekompetanse (PB Vg3)
- SAS3050 Samisk som andrespråk, samisk 3, sørsamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SAS3051 Samisk som andrespråk, samisk 3, lulesamisk, Vg3 påbygging til generell studiekompetanse (PB Vg3)
- SAS3052 Samisk som andrespråk, samisk 3, lulesamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SAS4000 Samisk som andrespråk, samisk 4, styrket opplæring (ID Vg1, ID Vg2, ID Vg3, KD Vg1, KD Vg2, KD Vg3 …)
- SAS4031 Samisk som andrespråk, samisk 4, nordsamisk, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS4033 Samisk som andrespråk, samisk 4, nordsamisk, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS4035 Samisk som andrespråk, samisk 4, nordsamisk, Vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS4036 Samisk som andrespråk, samisk 4, nordsamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS4037 Samisk som andrespråk, samisk 4, nordsamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS4038 Samisk som andrespråk, samisk 4, nordsamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS4039 Samisk som andrespråk, samisk 4, nordsamisk, Vg3 påbygging til generell studiekompetanse (PB Vg3)
- SAS4040 Samisk som andrespråk, samisk 4, nordsamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SAS4041 Samisk som andrespråk, samisk 4, sørsamisk, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS4043 Samisk som andrespråk, samisk 4, sørsamisk, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS4045 Samisk som andrespråk, samisk 4, sørsamisk, Vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS4046 Samisk som andrespråk, samisk 4, sørsamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS4047 Samisk som andrespråk, samisk 4, sørsamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS4048 Samisk som andrespråk, samisk 4, sørsamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS4049 Samisk som andrespråk, samisk 4, sørsamisk, Vg3 påbygging til generell studiekompetanse (PB Vg3)
- SAS4050 Samisk som andrespråk, samisk 4, sørsamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SAS4051 Samisk som andrespråk, samisk 4, lulesamisk, vg1 studieforberedende utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SAS4053 Samisk som andrespråk, samisk 4, lulesamisk, vg2 studieforberedende utdanningsprogram (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SAS4055 Samisk som andrespråk, samisk 4, lulesamisk, Vg3 studieforberedende utdanningsprogram (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS4056 Samisk som andrespråk, samisk 4, lulesamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SAS4057 Samisk som andrespråk, samisk 4, lulesamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SAS4058 Samisk som andrespråk, samisk 4, lulesamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SAS4059 Samisk som andrespråk, samisk 4, lulesamisk, Vg3 påbygging til generell studiekompetanse (PB Vg3)
- SAS4060 Samisk som andrespråk, samisk 4, lulesamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SFS1025 Samisk som førstespråk, samisk 1, nordsamisk, vg1 yrkesfaglige utdanningsprogram (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SFS1026 Samisk som førstespråk, samisk 1, nordsamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SFS1027 Samisk som førstespråk, samisk 1, nordsamisk, vg2 yrkesfaglige utdanningsprogram, muntlig (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SFS1028 Samisk som førstespråk, samisk 1, nordsamisk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SFS1029 Samisk som førstespråk, samisk 1, nordsamisk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SFS1030 Samisk som førstespråk, samisk 1, nordsamisk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SFS1031 Samisk som førstespråk, samisk 1, nordsamisk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SFS1032 Samisk som førstespråk, samisk 1, nordsamisk, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SFS1033 Samisk som førstespråk, samisk 1, nordsamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SFS1034 Samisk som førstespråk, samisk 1, sørsamisk, vg1 yrkesfaglige utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SFS1035 Samisk som førstespråk, samisk 1, sørsamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SFS1036 Samisk som førstespråk, samisk 1, sørsamisk, vg2 yrkesfaglige utdanningsprogram, muntlig (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SFS1037 Samisk som førstespråk, samisk 1, sørsamisk, vg1 studieforberedende utdanningsprogram, skriftlig (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- SFS1038 Samisk som førstespråk, samisk 1, sørsamisk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SFS1039 Samisk som førstespråk, samisk 1, sørsamisk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SFS1040 Samisk som førstespråk, samisk 1, sørsamisk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SFS1041 Samisk som førstespråk, samisk 1, sørsamisk, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SFS1042 Samisk som førstespråk, samisk 1, sørsamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SFS1043 Samisk som førstespråk, samisk 1, lulesamisk, vg1 yrkesfaglige utdanningsprogram (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SFS1044 Samisk som førstespråk, samisk 1, lulesamisk, vg2 yrkesfaglige utdanningsprogram (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SFS1045 Samisk som førstespråk, samisk 1, lulesamisk, vg2 yrkesfaglige utdanningsprogram, muntlig (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- SFS1046 Samisk som førstespråk, samisk 1, lulesamisk, vg1 studieforberedende utdanningsprogram, skriftlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SFS1047 Samisk som førstespråk, samisk 1, lulesamisk, vg1 studieforberedende utdanningsprogram, muntlig (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- SFS1048 Samisk som førstespråk, samisk 1, lulesamisk, vg2 studieforberedende utdanningsprogram, skriftlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SFS1049 Samisk som førstespråk, samisk 1, lulesamisk, vg2 studieforberedende utdanningsprogram, muntlig (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- SFS1050 Samisk som førstespråk, samisk 1, lulesamisk, Vg3 studieforberedende utdanningsprogram, skriftlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SFS1051 Samisk som førstespråk, samisk 1, lulesamisk, Vg3 studieforberedende utdanningsprogram, muntlig (ID Vg3, KD Vg3, MD Vg3, ME Vg3, ST Vg3)
- SFS1052 Samisk som førstespråk, samisk 1, nordsamisk, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- SFS1053 Samisk som førstespråk, samisk 1, nordsamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SFS1054 Samisk som førstespråk, samisk 1, sørsamisk, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- SFS1055 Samisk som førstespråk, samisk 1, sørsamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)
- SFS1056 Samisk som førstespråk, samisk 1, lulesamisk, Vg3 påbygging til generell studiekompetanse, skriftlig (PB Vg3)
- SFS1059 Samisk som førstespråk, samisk 1, lulesamisk, Vg3 påbygging til generell studiekompetanse, muntlig (PB Vg3)

</details>

### Programfag uten rad i vedlegg 1 (219)

Programfag med årstimer der ingen regel eller eksplisitt kobling passer: valgfrie programfag vedlegget ikke nevner, og program og trinn uten rad for felles programfag.

<details><summary>Vis fagkodene</summary>

- DAN3003 Scenisk dans fordypning 1 (MD Vg2, MD Vg3)
- DAN3004 Scenisk dans fordypning 2 (MD Vg2, MD Vg3)
- DRA3003 Teaterproduksjon fordypning 1 (MD Vg2, MD Vg3)
- DRA3004 Teaterproduksjon fordypning 2 (MD Vg2, MD Vg3)
- EKD3001 Produksjon og konseptutvikling (FD Vg3)
- EKD3002 Bedriftskultur og markedsføring (FD Vg3)
- IDR3013 Toppidrett 1 (ID Vg1, ID Vg2, ID Vg3)
- IDR3014 Toppidrett 2 (ID Vg1, ID Vg2, ID Vg3)
- IDR3015 Toppidrett 3 (ID Vg1, ID Vg2, ID Vg3)
- IDR3016 Breddeidrett 1 (ID Vg1, ID Vg2, ID Vg3)
- IDR3017 Breddeidrett 2 (ID Vg1, ID Vg2, ID Vg3)
- IDR3018 Breddeidrett 3 (ID Vg1, ID Vg2, ID Vg3)
- IDR3019 Friluftsliv 1 (ID Vg1, ID Vg2, ID Vg3)
- IDR3020 Friluftsliv 2 (ID Vg1, ID Vg2, ID Vg3)
- IDR3021 Lederutvikling 1 (ID Vg1, ID Vg2, ID Vg3)
- IDR3022 Lederutvikling 2 (ID Vg1, ID Vg2, ID Vg3)
- IDRPF04 Konkurranse- og toppidrett 2 (ID Vg1, ID Vg2, ID Vg3)
- IDRPF05 Konkurranse- og toppidrett 3 (ID Vg1, ID Vg2, ID Vg3)
- IDRPF06 Konkurranse- og toppidrett 2 (ID Vg1, ID Vg2, ID Vg3)
- IDRPF07 Konkurranse- og toppidrett 3 (ID Vg1, ID Vg2, ID Vg3)
- IDRPF08 Toppidrett og prestasjonsutvikling 2 (ID Vg1, ID Vg2, ID Vg3)
- IDRPF09 Toppidrett og prestasjonsutvikling 3 (ID Vg1, ID Vg2, ID Vg3)
- INT3004 Prosess og prosjektering (FD Vg3)
- INT3005 Kunde og kommunikasjon (FD Vg3)
- KDA3007 Kunst og skapende arbeid (KD Vg2, KD Vg3)
- KDA3008 Design og bærekraft (KD Vg2, KD Vg3)
- KDA3009 Arkitektur og samfunn (KD Vg2, KD Vg3)
- KDA3010 Foto og grafikk 1 (KD Vg2, KD Vg3)
- KDA3011 Foto og grafikk 2 (KD Vg2, KD Vg3)
- KDA3012 Samisk visuell kultur (KD Vg2, KD Vg3)
- KRI1023 Kristendomskunnskap 3, vg1 (ID Vg1, KD Vg1, MD Vg1, ME Vg1, ST Vg1)
- KRI1024 Kristendomskunnskap 3, vg2 (ID Vg2, KD Vg2, MD Vg2, ME Vg2, ST Vg2)
- KRI1028 Katolsk kristendom, vg1 (ID Vg1, ST Vg1)
- KRI1029 Katolsk kristendom, vg2 (ID Vg2, ST Vg2)
- LBR3012 Maskiner og teknologi i landbruk (NA Vg3)
- LBR3013 Økonomi og driftsledelse (NA Vg3)
- LBR3014 Økologisk landbruk (NA Vg3)
- MAR2014 Dekk (TP Vg2)
- MAR2015 Maskin (TP Vg2)
- MDD3006 Bevegelse (MD Vg1)
- MDD3007 Lytting (MD Vg1)
- MDD3008 Danseteknikker (MD Vg1)
- MDD3009 Musikk (MD Vg1)
- MDD3010 Teaterensemble (MD Vg1)
- MOK3007 Tekst (ME Vg2, ME Vg3)
- MOK3008 Bilde (ME Vg2, ME Vg3)
- MOK3009 Lyddesign (ME Vg2, ME Vg3)
- MOK3010 Grafisk design (ME Vg2, ME Vg3)
- MOK3011 Medieutvikling (ME Vg2, ME Vg3)
- MOK3012 Mediespesialisering (ME Vg3)
- MUS3006 Musikk fordypning 1 (MD Vg2, MD Vg3)
- MUS3008 Musikk fordypning 2 (MD Vg2, MD Vg3)
- MUS3010 Samisk musikk og scene (MD Vg1, MD Vg2, MD Vg3)
- NAB3008 Bruk og vern av natur (NA Vg3)
- NAB3009 Feltarbeid i naturbruk (NA Vg3)
- NAB3010 Naturbasert næringsutvikling (NA Vg3)
- PSP5790 Finsk nivå I (ST Vg2, ST Vg3)
- PSP5792 Finsk nivå II (ST Vg2, ST Vg3)
- PSP5794 Finsk nivå III (ST Vg2, ST Vg3)
- PSP5796 Fransk nivå I (ST Vg2, ST Vg3)
- PSP5798 Fransk nivå II (ST Vg2, ST Vg3)
- PSP5800 Fransk nivå III (ST Vg2, ST Vg3)
- PSP5802 Lulesamisk nivå I (ST Vg2, ST Vg3)
- PSP5804 Lulesamisk nivå II (ST Vg2, ST Vg3)
- PSP5806 Lulesamisk nivå III (ST Vg2, ST Vg3)
- PSP5808 Nordsamisk nivå I (ST Vg2, ST Vg3)
- PSP5810 Nordsamisk nivå II (ST Vg2, ST Vg3)
- PSP5812 Nordsamisk nivå III (ST Vg2, ST Vg3)
- PSP5814 Sørsamisk, nivå I (ST Vg2, ST Vg3)
- PSP5816 Sørsamisk nivå II (ST Vg2, ST Vg3)
- PSP5818 Sørsamisk nivå III (ST Vg2, ST Vg3)
- PSP5820 Russisk, nivå I (ST Vg2, ST Vg3)
- PSP5822 Russisk nivå II (ST Vg2, ST Vg3)
- PSP5824 Russisk nivå III (ST Vg2, ST Vg3)
- PSP5826 Spansk, nivå I (ST Vg2, ST Vg3)
- PSP5828 Spansk nivå II (ST Vg2, ST Vg3)
- PSP5830 Spansk nivå III (ST Vg2, ST Vg3)
- PSP5832 Tegnspråk, nivå I (ST Vg2, ST Vg3)
- PSP5834 Tegnspråk nivå II (ST Vg2, ST Vg3)
- PSP5836 Tegnspråk nivå III (ST Vg2, ST Vg3)
- PSP5838 Tysk, nivå I (ST Vg2, ST Vg3)
- PSP5840 Tysk nivå II (ST Vg2, ST Vg3)
- PSP5842 Tysk nivå III (ST Vg2, ST Vg3)
- PSP5844 Italiensk nivå I (ST Vg2, ST Vg3)
- PSP5846 Italiensk nivå II (ST Vg2, ST Vg3)
- PSP5848 Italiensk nivå III (ST Vg2, ST Vg3)
- PSP5850 Japansk nivå I (ST Vg2, ST Vg3)
- PSP5852 Japansk nivå II (ST Vg2, ST Vg3)
- PSP5854 Japansk nivå III (ST Vg2, ST Vg3)
- PSP5856 Arabisk nivå I (ST Vg2, ST Vg3)
- PSP5858 Arabisk nivå II (ST Vg2, ST Vg3)
- PSP5860 Arabisk nivå III (ST Vg2, ST Vg3)
- PSP5862 Kinesisk nivå I (ST Vg2, ST Vg3)
- PSP5864 Kinesisk nivå II (ST Vg2, ST Vg3)
- PSP5866 Kinesisk nivå III (ST Vg2, ST Vg3)
- PSP5868 Portugisisk nivå I (ST Vg2, ST Vg3)
- PSP5870 Portugisisk nivå II (ST Vg2, ST Vg3)
- PSP5872 Portugisisk nivå III (ST Vg2, ST Vg3)
- PSP5874 Albansk nivå I (ST Vg2, ST Vg3)
- PSP5876 Albansk nivå II (ST Vg2, ST Vg3)
- PSP5878 Albansk nivå III (ST Vg2, ST Vg3)
- PSP5880 Bosnisk nivå I (ST Vg2, ST Vg3)
- PSP5882 Bosnisk nivå II (ST Vg2, ST Vg3)
- PSP5884 Bosnisk nivå III (ST Vg2, ST Vg3)
- PSP5886 Dari nivå I (ST Vg2, ST Vg3)
- PSP5888 Dari nivå II (ST Vg2, ST Vg3)
- PSP5890 Dari nivå III (ST Vg2, ST Vg3)
- PSP5892 Koreansk nivå I (ST Vg2, ST Vg3)
- PSP5894 Koreansk nivå II (ST Vg2, ST Vg3)
- PSP5896 Koreansk nivå III (ST Vg2, ST Vg3)
- PSP5898 Kurdisk (sorani) nivå I (ST Vg2, ST Vg3)
- PSP5900 Kurdisk (sorani) nivå II (ST Vg2, ST Vg3)
- PSP5902 Kurdisk (sorani) nivå III (ST Vg2, ST Vg3)
- PSP5904 Persisk nivå I (ST Vg2, ST Vg3)
- PSP5906 Persisk nivå II (ST Vg2, ST Vg3)
- PSP5908 Persisk nivå III (ST Vg2, ST Vg3)
- PSP5910 Polsk nivå I (ST Vg2, ST Vg3)
- PSP5912 Polsk nivå II (ST Vg2, ST Vg3)
- PSP5914 Polsk nivå III (ST Vg2, ST Vg3)
- PSP5916 Somali nivå I (ST Vg2, ST Vg3)
- PSP5918 Somali nivå II (ST Vg2, ST Vg3)
- PSP5920 Somali nivå III (ST Vg2, ST Vg3)
- PSP5922 Tamil nivå I (ST Vg2, ST Vg3)
- PSP5924 Tamil nivå II (ST Vg2, ST Vg3)
- PSP5926 Tamil nivå III (ST Vg2, ST Vg3)
- PSP5928 Tyrkisk nivå I (ST Vg2, ST Vg3)
- PSP5930 Tyrkisk nivå II (ST Vg2, ST Vg3)
- PSP5932 Tyrkisk nivå III (ST Vg2, ST Vg3)
- PSP5934 Urdu nivå I (ST Vg2, ST Vg3)
- PSP5936 Urdu nivå II (ST Vg2, ST Vg3)
- PSP5938 Urdu nivå III (ST Vg2, ST Vg3)
- PSP5940 Vietnamesisk nivå I (ST Vg2, ST Vg3)
- PSP5942 Vietnamesisk nivå II (ST Vg2, ST Vg3)
- PSP5944 Vietnamesisk nivå III (ST Vg2, ST Vg3)
- PSP5946 Amharisk nivå I (ST Vg2, ST Vg3)
- PSP5948 Amharisk nivå II (ST Vg2, ST Vg3)
- PSP5950 Amharisk nivå III (ST Vg2, ST Vg3)
- PSP5952 Estisk nivå I (ST Vg2, ST Vg3)
- PSP5954 Estisk nivå II (ST Vg2, ST Vg3)
- PSP5956 Estisk nivå III (ST Vg2, ST Vg3)
- PSP5958 Filipino nivå I (ST Vg2, ST Vg3)
- PSP5960 Filipino nivå II (ST Vg2, ST Vg3)
- PSP5962 Filipino nivå III (ST Vg2, ST Vg3)
- PSP5964 Hebraisk nivå I (ST Vg2, ST Vg3)
- PSP5966 Hebraisk nivå II (ST Vg2, ST Vg3)
- PSP5968 Hebraisk nivå III (ST Vg2, ST Vg3)
- PSP5970 Kantonesisk nivå I (ST Vg2, ST Vg3)
- PSP5972 Kantonesisk nivå II (ST Vg2, ST Vg3)
- PSP5974 Kantonesisk nivå III (ST Vg2, ST Vg3)
- PSP5976 Latvisk nivå I (ST Vg2, ST Vg3)
- PSP5978 Latvisk nivå II (ST Vg2, ST Vg3)
- PSP5980 Latvisk nivå III (ST Vg2, ST Vg3)
- PSP5982 Nederlandsk nivå I (ST Vg2, ST Vg3)
- PSP5984 Nederlandsk nivå II (ST Vg2, ST Vg3)
- PSP5986 Nederlandsk nivå III (ST Vg2, ST Vg3)
- PSP5988 Oromo nivå I (ST Vg2, ST Vg3)
- PSP5990 Oromo nivå II (ST Vg2, ST Vg3)
- PSP5992 Oromo nivå III (ST Vg2, ST Vg3)
- PSP5994 Panjabi nivå I (ST Vg2, ST Vg3)
- PSP5996 Panjabi nivå II (ST Vg2, ST Vg3)
- PSP5998 Panjabi nivå III (ST Vg2, ST Vg3)
- PSP6000 Pashto nivå I (ST Vg2, ST Vg3)
- PSP6002 Pashto nivå II (ST Vg2, ST Vg3)
- PSP6004 Pashto nivå III (ST Vg2, ST Vg3)
- PSP6006 Tigrinja nivå I (ST Vg2, ST Vg3)
- PSP6008 Tigrinja nivå II (ST Vg2, ST Vg3)
- PSP6010 Tigrinja nivå III (ST Vg2, ST Vg3)
- PSP6012 Islandsk nivå I (ST Vg2, ST Vg3)
- PSP6014 Islandsk nivå II (ST Vg2, ST Vg3)
- PSP6016 Islandsk nivå III (ST Vg2, ST Vg3)
- PSP6018 Hindi nivå I (ST Vg2, ST Vg3)
- PSP6020 Hindi nivå II (ST Vg2, ST Vg3)
- PSP6022 Hindi nivå III (ST Vg2, ST Vg3)
- PSP6032 Litauisk nivå I (ST Vg2, ST Vg3)
- PSP6034 Litauisk nivå II (ST Vg2, ST Vg3)
- PSP6036 Litauisk nivå III (ST Vg2, ST Vg3)
- PSP6038 Thai nivå I (ST Vg2, ST Vg3)
- PSP6040 Thai nivå II (ST Vg2, ST Vg3)
- PSP6042 Thai nivå III (ST Vg2, ST Vg3)
- PSP6044 Serbisk nivå I (ST Vg2, ST Vg3)
- PSP6046 Serbisk nivå II (ST Vg2, ST Vg3)
- PSP6048 Serbisk nivå III (ST Vg2, ST Vg3)
- PSP6050 Nygresk nivå I (ST Vg2, ST Vg3)
- PSP6052 Nygresk nivå II (ST Vg2, ST Vg3)
- PSP6054 Nygresk nivå III (ST Vg2, ST Vg3)
- PSP6056 Ungarsk nivå I (ST Vg2, ST Vg3)
- PSP6058 Ungarsk nivå II (ST Vg2, ST Vg3)
- PSP6060 Ungarsk nivå III (ST Vg2, ST Vg3)
- PSP6062 Ukrainsk nivå I (ST Vg2, ST Vg3)
- PSP6064 Ukrainsk nivå II (ST Vg2, ST Vg3)
- PSP6066 Ukrainsk nivå III (ST Vg2, ST Vg3)
- PSP6068 Bulgarsk nivå I (ST Vg2, ST Vg3)
- PSP6070 Bulgarsk nivå II (ST Vg2, ST Vg3)
- PSP6072 Bulgarsk nivå III (ST Vg2, ST Vg3)
- PSP6074 Kroatisk nivå I (ST Vg2, ST Vg3)
- PSP6076 Kroatisk nivå II (ST Vg2, ST Vg3)
- PSP6078 Kroatisk nivå III (ST Vg2, ST Vg3)
- PSP6080 Kurdisk (kurmanji) nivå I (ST Vg2, ST Vg3)
- PSP6082 Kurdisk (kurmanji) nivå II (ST Vg2, ST Vg3)
- PSP6084 Kurdisk (kurmanji) nivå III (ST Vg2, ST Vg3)
- PSP6086 Rumensk nivå I (ST Vg2, ST Vg3)
- PSP6088 Rumensk nivå II (ST Vg2, ST Vg3)
- PSP6090 Rumensk nivå III (ST Vg2, ST Vg3)
- PSP6092 Kvensk nivå I (ST Vg2, ST Vg3)
- PSP6094 Kvensk nivå II (ST Vg2, ST Vg3)
- PSP6096 Kvensk nivå III (ST Vg2, ST Vg3)
- REA3041 Geofag X (ST Vg2, ST Vg3)
- REA3051 Teknologi og forskningslære X (ST Vg2, ST Vg3)
- REA3055 Matematikk X (ST Vg2, ST Vg3)
- REA3064 Programmering og modellering X (ST Vg2, ST Vg3)
- REA3065 Statistikk (ST Vg2, ST Vg3)
- REA3067 Matematikk for økonomi (ST Vg2, ST Vg3)
- SAM3051 Sosialkunnskap (ST Vg2, ST Vg3)
- SAM3053 Samfunnsgeografi (ST Vg2, ST Vg3)
- SAM3066 Samisk historie og samfunn 1 (ST Vg2, ST Vg3)
- SAM3067 Samisk historie og samfunn 2 (ST Vg2, ST Vg3)
- SAM3068 Økonomistyring (ST Vg2, ST Vg3)
- SAM3070 Økonomi og ledelse (ST Vg2, ST Vg3)
- YFO2002 Yrkesfaglig opphenting (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)

</details>

### Programfag uten årstimer i Grep (281)

Ofte eksamenskoder (tverrfaglig eksamen) eller vurderingskoder (muntlig). Reglene gjelder bare fag med årstimer.

<details><summary>Vis fagkodene</summary>

- AKT2007 Tverrfaglig eksamen aktivitør (HS Vg2)
- AKV2008 Tverrfaglig eksamen akvakultur (NA Vg2)
- AMB2008 Tverrfaglig eksamen ambulansefag (HS Vg2)
- AMK2006 Tverrfaglig eksamen arbeidsmaskiner (TP Vg2)
- AMK2102 Arbeidsmaskiner (TP Vg3)
- AMM3011 Anleggsmaskinmekanikerfaget (TP Vg3)
- AMM3103 Tverrfaglig eksamen, anleggsmaskinmekanikerfaget (TP Vg3)
- ANG2003 Tverrfaglig eksamen anleggsgartner (BA Vg2)
- ANL2007 Tverrfaglig eksamen anleggsteknikk (BA Vg2)
- APO3008 Tverrfaglig eksamen, apotekteknikk (HS Vg3)
- AUT2006 Tverrfaglig eksamen i automatisering (EL Vg2)
- AUT2102 Automatisering (EL Vg3)
- AUT3008 Automatiseringsfaget (EL Vg3)
- AUT3103 Automatiseringsfaget, skriftlig (EL Vg3)
- AVI3013 Luftfartøysystemer, part 66-13 (B2) (EL Vg3)
- AVI3014 Luftfartøysystemer, part 66-14 (B2) (EL Vg3)
- AVI3016 Vedlikeholdsteknikk, part 66-7A(B2) (EL Vg3)
- AVI3017 Vedlikeholdsteknikk, part 66-7A Essay 1(B2) (EL Vg3)
- AVI3018 Vedlikeholdsteknikk, part 66-7A Essay 2(B2) (EL Vg3)
- AVI3020 Flysikkerhet, part 66-9A(B1B2) (EL Vg3)
- AVI3022 Flysikkerhet, part 66-10(B1B2) (EL Vg3)
- BAK2003 Tverrfaglig eksamen baker og konditor (RM Vg2)
- BAT1007 Tverrfaglig eksamen, bygg- og anleggsteknikk, privatister (BA Vg1)
- BBF2006 Tverrfaglig eksamen i båtbyggerfag (DT Vg2)
- BLD2006 Tverrfaglig eksamen blomsterdekoratør (FD Vg2)
- BLK2006 Tverrfaglig eksamen bilskade, lakk og karosseri (TP Vg2)
- BMF2006 Tverrfaglig eksamen børsemaker (TP Vg2)
- BMO2003 Tverrfaglig eksamen betong og mur (BA Vg2)
- BRT2010 Tverrfaglig eksamen brønnteknikk (TP Vg2)
- BUA2008 Tverrfaglig eksamen barne- og ungdomsarbeiderfag (HS Vg2)
- DAN2016 Dans i perspektiv 1, muntlig-praktisk (MD Vg2, MD Vg3)
- DAN2018 Dans i perspektiv 2, muntlig-praktisk (MD Vg2, MD Vg3)
- DAT3006 Dataelektronikerfaget (EL Vg3)
- DAT3103 Dataelektronikerfaget, skriftlig (EL Vg3)
- DDU2007 Tverrfaglig eksamen duodji/duodje/duedtie (DT Vg2)
- DEL2006 Tverrfaglig eksamen datateknologi og elektronikk (EL Vg2)
- DEL2102 Datateknologi og elektronikk (EL Vg3)
- DGH2006 Tverrfaglig eksamen gull- og sølvsmedhåndverk (DT Vg2)
- DRA2015 Teater i perspektiv 1, muntlig-praktisk (MD Vg2, MD Vg3)
- DRA2017 Teater i perspektiv 2, muntlig-praktisk (MD Vg2, MD Vg3)
- DRF2003 Tverrfaglig eksamen dronefag (EL Vg2)
- DTH1003 Tverrfaglig eksamen, håndverk, design og produktutvikling, privatister (DT Vg1)
- DTR2007 Tverrfaglig eksamen trearbeid (DT Vg2)
- EKD3003 Tverrfaglig eksamen eksponeringsdesign (FD Vg3)
- ELE1008 Tverrfaglig eksamen, elektro og datateknologi, for privatister (EL Vg1)
- ELE2007 Tverrfaglig eksamen elenergi og ekom (EL Vg2)
- FBI1003 Tverrfaglig eksamen, frisør, blomster, interiør og eksponeringsdesign, for privatister (FD Vg1)
- FFA2006 Tverrfaglig eksamen fiske og fangst (NA Vg2)
- FLY2003 Luftfartøylære, part 66-1 (EL Vg2)
- FLY2004 Luftfartøylære, part 66-2 (EL Vg2)
- FLY2005 Luftfartøylære, part 66-3 (EL Vg2)
- FLY2006 Luftfartøylære, part 66-4B1 (EL Vg2)
- FLY2007 Luftfartøylære, part 66-4B2 (EL Vg2)
- FLY2008 Luftfartøylære, part 66-5B1 (EL Vg2)
- FLY2009 Luftfartøylære, part 66-5B2 (EL Vg2)
- FLY2010 Luftfartøylære, part 66-6B1 (EL Vg2)
- FLY2011 Luftfartøylære, part 66-6B2 (EL Vg2)
- FLY2012 Luftfartøylære, part 66-8 (EL Vg2)
- FLY3015 Luftfartøysystemer, part 66-11A(B1.1) (EL Vg3)
- FLY3016 Luftfartøysystemer, part 66-12(B1.3-B1.4) (EL Vg3)
- FLY3017 Luftfartøysystemer, part 66-15(B1) (EL Vg3)
- FLY3018 Luftfartøysystemer, part 66-17(B1) (EL Vg3)
- FLY3020 Vedlikeholdsteknikk, part 66-7A(B1) (EL Vg3)
- FLY3021 Vedlikeholdsteknikk, part 66-7A Essay 1(B1) (EL Vg3)
- FLY3022 Vedlikeholdsteknikk, part 66-7A Essay 2(B1) (EL Vg3)
- FLY3024 Flysikkerhet, part 66-9A(B1B2) (EL Vg3)
- FLY3026 Flysikkerhet, part 66-10(B1B2) (EL Vg3)
- FOT2008 Tverrfaglig eksamen fotterapi og ortopediteknikk (HS Vg2)
- FOT3008 Tverrfaglig eksamen fotterapi (HS Vg3)
- FRI2006 Tverrfaglig eksamen frisør (FD Vg2)
- HDF2003 Tverrfaglig eksamen heste- og dyrefag (NA Vg2)
- HEA2008 Tverrfaglig eksamen helsearbeiderfag (HS Vg2)
- HES2008 Tverrfaglig eksamen helseservicefag (HS Vg2)
- HSE3008 Tverrfaglig eksamen, helsesekretær (HS Vg3)
- HSF1009 Tverrfaglig eksamen, helse- og oppvekstfag, privatister (HS Vg1)
- HUD2008 Tverrfaglig eksamen hudpleie (HS Vg2)
- HUD3012 Tverrfaglig eksamen, hudterapifaget (HS Vg3)
- IED2003 Tverrfaglig eksamen interiør og eksponeringsdesign (FD Vg2)
- IKM1004 Tverrfaglig eksamen, informasjonsteknologi og medieproduksjon, privatister (IM Vg1)
- INT3006 Tverrfaglig eksamen interiør (FD Vg3)
- ITK2004 Tverrfaglig eksamen informasjonsteknologi (IM Vg2)
- KEM2006 Tverrfaglig eksamen klima, energi og miljøteknikk (BA Vg2)
- KJT2006 Tverrfaglig eksamen kjøretøy (TP Vg2)
- KOS2003 Tverrfaglig eksamen kokk- og servitørfag (RM Vg2)
- KPL2004 Tverrfaglig eksamen kjemiprosess- og laboratoriefag (TP Vg2)
- KVV2004 Tverrfaglig eksamen kulde-, varmepumpe og og ventilasjonsteknikk (EL Vg2)
- LBR3015 Økologisk landbruk, muntlig (NA Vg3)
- LBR3016 Tverrfaglig eksamen, landbruk (NA Vg3)
- LBR3020 Tverrfaglig eksamen landbruk (NA Vg3)
- LGA2012 Tverrfaglig eksamen landbruk og gartnernæring (NA Vg2)
- MAR2016 Tverrfaglig eksamen maritime fag, dekk (TP Vg2)
- MAR2017 Tverrfaglig eksamen maritime fag, maskin (TP Vg2)
- MED2008 Tverrfaglig eksamen medieproduksjon (IM Vg2)
- MEL3104 Maritim elektrikerfaget, skriftlig (EL Vg3)
- MOK2011 Mediesamfunnet 3, praktisk (ME Vg3)
- MPR2003 Tverrfaglig eksamen kjøttfag og næringsmiddelindustri (RM Vg2)
- MUS2015 Musikk i perspektiv, muntlig (MD Vg2, MD Vg3)
- MUS2017 Musikk i perspektiv 2, muntlig (MD Vg2, MD Vg3)
- MUS3007 Musikk fordypning 1, muntlig-praktisk (MD Vg2, MD Vg3)
- MUS3009 Musikk fordypning 2, muntlig-praktisk (MD Vg2, MD Vg3)
- NAB1007 Tverrfaglig eksamen, naturbruk, privatister (NA Vg1)
- NAB3011 Naturforvaltning, muntlig (NA Vg3)
- NAB3012 Naturbasert næringsutvikling, muntlig (NA Vg3)
- OFT2006 Tverrfaglig eksamen overflateteknikk (BA Vg2)
- PIN2007 Tverrfaglig eksamen industriteknologi (TP Vg2)
- PSP5791 Finsk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5793 Finsk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5795 Finsk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5797 Fransk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5799 Fransk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5801 Fransk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5803 Lulesamisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5805 Lulesamisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5807 Lulesamisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5809 Nordsamisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5811 Nordsamisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5813 Nordsamisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5815 Sørsamisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5817 Sørsamisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5819 Sørsamisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5821 Russisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5823 Russisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5825 Russisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5827 Spansk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5829 Spansk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5831 Spansk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5833 Tegnspråk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5835 Tegnspråk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5837 Tegnspråk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5839 Tysk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5841 Tysk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5843 Tysk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5845 Italiensk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5847 Italiensk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5849 Italiensk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5851 Japansk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5853 Japansk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5855 Japansk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5857 Arabisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5859 Arabisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5861 Arabisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5863 Kinesisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5865 Kinesisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5867 Kinesisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5869 Portugisisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5871 Portugisisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5873 Portugisisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5875 Albansk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5877 Albansk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5879 Albansk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5881 Bosnisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5883 Bosnisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5885 Bosnisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5887 Dari nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5889 Dari nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5891 Dari nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5893 Koreansk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5895 Koreansk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5897 Koreansk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5899 Kurdisk (sorani) nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5901 Kurdisk (sorani) nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5903 Kurdisk (sorani) nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5905 Persisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5907 Persisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5909 Persisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5911 Polsk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5913 Polsk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5915 Polsk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5917 Somali nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5919 Somali nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5921 Somali nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5923 Tamil nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5925 Tamil nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5927 Tamil nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5929 Tyrkisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5931 Tyrkisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5933 Tyrkisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5935 Urdu nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5937 Urdu nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5939 Urdu nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5941 Vietnamesisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5943 Vietnamesisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5945 Vietnamesisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5947 Amharisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5949 Amharisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5951 Amharisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5953 Estisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5955 Estisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5957 Estisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5959 Filipino nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5961 Filipino nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5963 Filipino nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5965 Hebraisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5967 Hebraisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5969 Hebraisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5971 Kantonesisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5973 Kantonesisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5975 Kantonesisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5977 Latvisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5979 Latvisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5981 Latvisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5983 Nederlandsk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5985 Nederlandsk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5987 Nederlandsk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5989 Oromo nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5991 Oromo nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5993 Oromo nivå III, muntlig (ST Vg2, ST Vg3)
- PSP5995 Panjabi nivå I, muntlig (ST Vg2, ST Vg3)
- PSP5997 Panjabi nivå II, muntlig (ST Vg2, ST Vg3)
- PSP5999 Panjabi nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6001 Pashto nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6003 Pashto nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6005 Pashto nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6007 Tigrinja nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6009 Tigrinja nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6011 Tigrinja nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6013 Islandsk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6015 Islandsk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6017 Islandsk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6019 Hindi nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6021 Hindi nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6023 Hindi nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6033 Litauisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6035 Litauisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6037 Litauisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6039 Thai nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6041 Thai nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6043 Thai nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6045 Serbisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6047 Serbisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6049 Serbisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6051 Nygresk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6053 Nygresk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6055 Nygresk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6057 Ungarsk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6059 Ungarsk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6061 Ungarsk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6063 Ukrainsk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6065 Ukrainsk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6067 Ukrainsk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6069 Bulgarsk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6071 Bulgarsk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6073 Bulgarsk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6075 Kroatisk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6077 Kroatisk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6079 Kroatisk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6081 Kurdisk (kurmanji) nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6083 Kurdisk (kurmanji) nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6085 Kurdisk (kurmanji) nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6087 Rumensk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6089 Rumensk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6091 Rumensk nivå III, muntlig (ST Vg2, ST Vg3)
- PSP6093 Kvensk nivå I, muntlig (ST Vg2, ST Vg3)
- PSP6095 Kvensk nivå II, muntlig (ST Vg2, ST Vg3)
- PSP6097 Kvensk nivå III, muntlig (ST Vg2, ST Vg3)
- REA3066 Statistikk, muntlig (ST Vg2, ST Vg3)
- REA3068 Matematikk for økonomi, muntlig (ST Vg2, ST Vg3)
- REI2012 Tverrfaglig eksamen reindrift (NA Vg2)
- RLF2004 Tverrfaglig eksamen rørlegger (BA Vg2)
- RMF1008 Tverrfaglig eksamen, restaurant- og matfag, privatister (RM Vg1)
- ROM3012 Tverrfaglig eksamen romteknologi (EL Vg3)
- SAM3052 Sosialkunnskap, muntlig (ST Vg2, ST Vg3)
- SAM3069 Økonomistyring, muntlig-praktisk (ST Vg2, ST Vg3)
- SAM3071 Økonomi og ledelse, muntlig-praktisk (ST Vg2, ST Vg3)
- SBR2006 Tverrfaglig eksamen skogbruk (NA Vg2)
- SME2006 Tverrfaglig eksamen i smed (DT Vg2)
- SSR1004 Tverrfaglig eksamen, salg, service og reiseliv, privatister (SR Vg1)
- SSR2004 Tverrfaglig eksamen salg, service og reiseliv (SR Vg2)
- STH2003 Tverrfaglig eksamen søm og tekstilhåndverk (DT Vg2)
- TAN3008 Tverrfaglig eksamen, tannhelsesekretær (HS Vg3)
- TIP1009 Tverrfaglig eksamen, teknologi- og industrifag, privatister (TP Vg1)
- TMF2004 Tverrfaglig eksamen tømrer (BA Vg2)
- TOL2004 Tverrfaglig eksamen transport og logistikk (TP Vg2)
- TRT2006 Tverrfaglig eksamen treteknikk (BA Vg2)
- UIM2006 Tverrfaglig eksamen ur- og instrumentmaker (DT Vg2)
- YFF4190 Yrkesfaglig fordypning vg1 (BA Vg1, DT Vg1, EL Vg1, FD Vg1, HS Vg1, IM Vg1 …)
- YFF4290 Yrkesfaglig fordypning vg2 (BA Vg2, DT Vg2, EL Vg2, FD Vg2, HS Vg2, IM Vg2 …)
- YSL2001 Bransjeteknikk (TP Vg3)
- YSL2002 Transport og logistikk (TP Vg3)
- YSL3001 Transport (TP Vg3)
- YSL3002 Planlegging og drift (TP Vg3)

</details>

### Opplæring i bedrift (481)

Faget brukes bare i programområder med opplæring i bedrift (læretid, fagprøve). Det gir ingen undervisning med årsramme på skolen.

<details><summary>Vis fagkodene</summary>

- AKT3004 Aktivitørfaget
- AKT3103 Aktivitørfaget, skriftlig
- AKV3004 Akvakulturfaget
- AKV3103 Akvakulturfaget, skriftlig
- ALU3004 Aluminiumskonstruksjonsfaget
- ALU3103 Aluminiumskonstruksjonsfaget, skriftlig
- AMB3004 Ambulansefaget
- AMB3103 Ambulansefaget, skriftlig
- AMF3004 Anleggsmaskinførerfaget
- AMF3103 Anleggsmaskinførerfaget, skriftlig
- ANG3004 Anleggsgartnerfaget
- ANG3103 Anleggsgartnerfaget, skriftlig
- ARL3001 Anleggsrørleggerfaget
- ARL3103 Anleggsrørleggerfaget, skriftlig
- ASF3004 Asfaltfaget
- ASF3103 Asfaltfaget, skriftlig
- AVI4004 Avionikerfaget
- BAK3004 Bakerfaget
- BAK3103 Bakerfaget, skriftlig
- BAN3004 Banemontørfaget
- BAN3103 Banemontørfaget, skriftlig
- BDK3001 Bilfaget, demontering av kjøretøy
- BDK3103 Bilfaget, demontering av kjøretøy, skriftlig
- BDR3004 Byggdrifterfaget - særløp
- BDR3103 Byggdrifterfaget, skriftlig
- BET3004 Betongfaget
- BET3103 Betongfaget, skriftlig
- BETV105 Helse, miljø og sikkerhet og arbeidsliv
- BETV106 Forskaling
- BETV107 Armering
- BETV108 Betongteknologi og utstøping
- BFB3004 Brannforebyggerfaget – særløp
- BFB3103 Brannforebyggerfaget- skriftlig
- BIP3001 Bilpleiefaget
- BIP3103 Bilpleiefaget, skriftlig
- BKF3004 Bøkkerfaget
- BKF3103 Bøkkerfaget, skriftlig
- BKO3004 Brønnfaget, komplettering
- BKO3103 Brønnfaget, komplettering, skriftlig
- BKV3004 Brønnfaget, kveilerøroperasjoner
- BKV3103 Brønnfaget, kveilerøroperasjoner, skriftlig
- BLA3004 Billakkererfaget
- BLA3103 Billakkerarfaget, skriftlig
- BLD3004 Blomsterdekoratørfaget
- BLD3103 Blomsterdekoratørfaget, skriftlig
- BLDV100 Kommunikasjon og kundeveiledning
- BLDV101 Idè og produktutvikling
- BLDV102 Materialkunnskap og yrkesidentitet
- BLDV103 Blomsterdekorering og håndverksferdigheter
- BLDV104 Økonomi og arbeidsliv
- BLY3004 Blyglasshåndverkerfaget - særløp
- BLY3103 Blyglasshåndverkerfaget, skriftlig
- BMF2102 Børsemaker
- BMF3004 Børsemakerfaget
- BMF3103 Børsemakerfaget, skriftlig
- BMK3004 Bilfaget, lette kjøretøy
- BMK3103 Bilfaget, lette kjøretøy, skriftlig
- BNT3004 Buntmakerfaget
- BNT3103 Buntmakerfaget, skriftlig
- BOR3004 Boreoperatørfaget
- BOR3103 Boreoperatørfaget, skriftlig
- BRE3004 Brønnfaget, elektriske kabeloperasjoner
- BRE3103 Brønnfaget, elektriske kabeloperasjoner, skriftlig
- BRH3004 Brønnfaget, havbunnsinstallasjoner
- BRH3103 Brønnfaget, havbunnsinstallasjoner, skriftlig
- BRM3004 Brønnfaget, mekaniske kabeloperasjoner
- BRM3103 Brønnfaget, mekaniske kabeloperasjoner, skriftlig
- BRO3004 Brønn- og borefaget
- BRO3103 Brønn- og borefaget, skriftlig
- BRS3004 Brønnfaget, sementering
- BRS3103 Brønnfaget, sementering, skriftlig
- BSK3004 Bilskadefaget
- BSK3103 Bilskadefaget, skriftlig
- BSM3001 Bilsalmakerfaget
- BSM3103 Bilsalmakerfaget, skriftlig
- BTK3004 Bilfaget, tunge kjøretøy
- BTK3103 Bilfaget, tunge kjøretøy, skriftlig
- BUA3004 Barne- og ungdomsarbeiderfaget
- BUA3103 Barne- og ungdomsarbeiderfaget, skriftlig
- BUN3004 Bunadtilvirkerfaget
- BUN3103 Bunadtilvirkerfaget, skriftlig
- BUNV100 Søm og tilvirkning
- BUNV101 Formidling og kundebehandling
- BUNV102 Forretningsdrift og arbeidsliv
- BUNV103 Bunadbruk og yrkesidentitet
- BYM3001 Byggmontasjefaget – særløp
- BYM3103 Byggmontasjefaget - skriftlig
- CNC3004 CNC-maskineringsfaget
- CNC3103 CNC-maskineringsfaget, skriftlig
- DKO3004 Dimensjonskontrollfaget
- DKO3103 Dimensjonskontrollfaget, skriftlig
- DRF3001 Droneoperatørfaget
- DRF3103 Droneoperatørfaget, skriftlig
- DYR3001 Dyrefaget
- DYR3103 Dyrefaget, skriftlig
- EKF3001 Ernæringskokkfaget
- EKF3103 Ernæringskokkfaget, skriftlig
- EKFV100 Mattrygghet
- EKFV101 Demokrati, yrkesidentitet og arbeidsliv
- EKFV102 Råvarekunnskap, bærekraft og håndverksferdigheter
- EKFV103 Ernæring, måltidsutvikling og folkehelse
- ELE2102 Elenergi og ekom
- ELE3004 Elektrikerfaget
- ELE3103 Elektrikerfaget, skriftlig
- EMO3004 Energimontørfaget
- EMO3103 Energimontørfaget, skriftlig
- EOP3004 Energioperatørfaget
- EOP3103 Energioperatørfaget, skriftlig
- ERF3004 Elektroreparatørfaget
- ERF3103 Elektroreparatørfaget
- FFA3004 Fiske og fangst
- FFA3103 Fiske og fangst, skriftlig
- FFAV107 Helse, miljø og sikkerhet ombord
- FFAV108 Fangst og redskap
- FFAV109 Drift av fartøy
- FFAV110 Organisering, arbeidsforhold og forvaltning
- FGY3004 Forgyllerfaget - særløp
- FGY3103 Forgyllerfaget, skriftlig
- FIL3004 Filigranssølvsmedfaget
- FIL3103 Filigranssølvsmedfaget, skriftlig
- FIR3004 Fiskeri- og akvakulturredskapsfaget
- FIR3103 Fiskeri- og akvakulturredskapsfaget, skriftlig
- FJE3004 Fjell- og bergverksfaget, fordypningsområde fjellsikring
- FJE3005 Fjell- og bergverksfaget, fordypningsområde knuseverk
- FJE3006 Fjell- og bergverksfaget, fordypningsområde bergsprenging
- FJE3103 Fjell- og bergverksfaget, fordypningsområde fjellsikring, skriftlig
- FJE3104 Fjell- og bergverksfaget, fordypningsområde knuseverk, skriftlig
- FJE3105 Fjell- og bergverksfaget, fordypningsområde bergsprenging, skriftlig
- FMF3001 Fundamenteringsfaget
- FMF3103 Fundamenteringsfaget, skriftlig
- FMK3004 Finmekanikerfaget
- FMK3103 Finmekanikerfaget, skriftlig
- FMO4004 Flymotormekanikerfaget
- FRI3004 Frisørfaget
- FRI3103 Frisørfaget, skriftlig
- FRIV100 Bransjekunnskap
- FRIV101 Hår og hodebunnspleie
- FRIV102 Kjemiske prosesser
- FRIV103 Kommunikasjon og kundeservice
- FRIV104 Verktøy og teknikker
- FST4004 Flystrukturmekanikerfaget
- FSY4004 Flysystemmekanikerfaget
- FUO3004 Fjernstyrte undervannsoperasjoner
- FUO3103 Fjernstyrte undervannsoperasjoner
- FVF3001 Ferskvarehandlerfaget
- FVF3103 Ferskvarehandlerfaget, skriftlig
- GAR3004 Gartnerfaget
- GAR3103 Gartnerfaget, skriftlig
- GBF3004 Glassblåserfaget - særløp
- GBF3103 Glassblåserfaget, skriftlig
- GIP3004 Gipsmakerfaget - særløp
- GIP3103 Gipsmakerfaget, skriftlig
- GLA3004 Glassfaget - særløp
- GLA3103 Glassfaget, skriftlig
- GNSV100 Norsk og samfunnskunnskap, VOV
- GNSV200 Norsk og samfunnskunnskap for språklige minoriteter, VOV
- GPT3004 Grafisk produksjonsteknikkfaget
- GPT3103 Grafisk produksjonsteknikkfaget, skriftlig
- GRF3004 Gravørfaget - særløp
- GRF3103 Gravørfaget, skriftlig
- GSF3001 Glassliperfaget
- GSF3103 Glassliperfaget, skriftlig
- GTL3004 Gjørtlerfaget - særløp
- GTL3103 Gjørtlerfaget, skriftlig
- GUL3004 Gullsmedfaget
- GUL3103 Gullsmedfaget, skriftlig
- GVF3004 Gjenvinningsfaget
- GVF3103 Gjenvinningsfaget, skriftlig
- GVFV100 Internkontroll og helse, miljø og sikkerhet
- GVFV101 Regelverk og rammeverk
- GVFV102 Drift i praksis
- GVFV103 Økonomi og forvaltning
- GVFV104 Utvikling, bærekraft og sirkulær økonomi
- HAV3001 Havbruksteknikkfaget
- HAV3103 Havbruksteknikkfaget, skriftlig
- HBB3004 Håndbokbinderfaget - særløp
- HBB3103 Håndbokbinderfaget, skriftlig
- HEA3004 Helsearbeiderfaget
- HEA3103 Helsearbeiderfaget, skriftlig
- HEAV105 Profesjonalitet i helsearbeiderfaget
- HEAV106 Livskvalitet og helsekompetanse
- HEAV107 Grunnleggende sykepleie
- HEAV108 Rehabilitering, habilitering og hverdagsmestring
- HEI3004 Heismontørfaget
- HEI3103 Heismontørfaget, skriftlig
- HJU3004 Hjulutrustningsfaget
- HJU3103 Hjulutrustningsfaget, skriftlig
- HMD3004 Horn-, bein- og metallduodjifaget
- HMD3103 Horn-, bein- og metallduodjifaget, skriftlig
- HSK3004 Herreskredderfaget
- HSK3103 Herreskredderfaget, skriftlig
- HST3004 Hestefaget
- HST3103 Hestefaget, skriftlig
- HVF3004 Håndveverfaget
- HVF3103 Håndveverfaget, skriftlig
- HVFV100 Veving og grunnbindingene
- HVFV101 Vevnaden
- HVFV102 Tradisjon og nyskapning
- HVFV103 Vedlikehold og ressursutnyttelse
- HVFV104 Yrkesutøvelse
- HVS3004 Hovslagerfaget - særløp
- HVS3103 Hovslagerfaget, skriftlig
- IHP3001 Innholdsproduksjonsfaget
- IHP3103 Innholdsproduksjonsfaget, skriftlig
- IME3004 Industrimekanikerfaget
- IME3103 Industrimekanikerfaget, skriftlig
- IMF3004 Industrimalerfaget
- IMF3103 Industrimalerfaget, skriftlig
- IMO3004 Industrimontørfaget
- IMO3103 Industrimontørfaget, skriftlig
- IMP3004 Industriell matproduksjon
- IMP3103 Industriell matproduksjon, skriftlig
- IOM3004 Industrioppmålingsfaget
- IOM3103 Industrioppmålingsfaget, skriftlig
- IOV3004 Industriell overflatebehandling
- IOV3103 Industriell overflatebehandling, skriftlig
- IRL3004 Industrirørleggerfaget
- IRL3103 Industrirørleggerfaget, skriftlig
- ISL3001 Isolatørfaget
- ISL3103 Isolatørfaget, skriftlig
- ISN3004 Industrisnekkerfaget
- ISN3103 Industrisnekkerfaget, skriftlig
- ITA3004 Industritapetsererfaget
- ITA3103 Industritapetsererfaget, skriftlig
- ITD3001 IT-driftsfaget
- ITD3103 IT-driftsfaget, skriftlig
- ITF3001 Industritekstilfaget, fordypningsområde farging, trykking og etterbehandling
- ITF3004 Industritekstilfaget, fordypningsområde garnframstilling
- ITF3005 Industritekstilfaget, fordypningsområde industrisøm
- ITF3006 Industritekstilfaget, fordypningsområde trikotasje
- ITF3007 Industritekstilfaget, fordypningsområde veving
- ITF3103 Industritekstilfaget, fordypningsområde farging, trykking og etterbehandling, skriftlig
- ITF3104 Industritekstilfaget, fordypningsområde garnframstilling, skriftlig
- ITF3105 Industritekstilfaget, fordypningsområde industrisøm, skriftlig
- ITF3106 Industritekstilfaget, fordypningsområde trikotasje, skriftlig
- ITF3107 Industritekstilfaget, fordypningsområde veving, skriftlig
- IUV3001 IT-utviklerfaget
- IUV3103 IT-utviklerfaget, skriftlig
- KAR3004 Chassispåbyggefaget
- KAR3103 Chassispåbyggerfaget, skriftlig
- KBB3004 Komposittbåtbyggerfaget
- KBB3103 Komposittbåtbyggerfaget, skriftlig
- KER3004 Keramikerfaget - særløp
- KER3103 Keramikerfaget, skriftlig
- KJD3004 Kjole- og draktsyerfaget
- KJD3103 Kjole- og draktsyerfaget, skriftlig
- KJP3004 Kjemiprosessfaget
- KJP3103 Kjemiprosessfaget, skriftlig
- KLO3004 Kran- og løfteoperasjonsfaget
- KLO3103 Kran- og løfteoperasjonsfaget, skriftlig
- KOK3004 Kokkfaget
- KOK3103 Kokkfaget, skriftlig
- KOKV107 Mattrygghet
- KOKV108 Demokrati, yrkesidentitet og arbeidsliv
- KOKV109 Råvarekunnskap og håndverksferdigheter
- KOKV110 Måltidsutvikling, bærekraft og ernæring
- KON3004 Konditorfaget
- KON3103 Konditorfaget, skriftlig
- KRV3004 Kurvmakerfaget - særløp
- KRV3103 Kurvmakerfaget, skriftlig
- KSK3004 Kjøttskjærerfaget
- KSK3103 Kjøttskjærerfaget, skriftlig
- KST3004 Kostymesyerfaget
- KST3103 Kostymesyerfaget, skriftlig
- KVP3001 Kulde- og varmepumpeteknikkfaget
- KVP3103 Kulde- og varmepumpeteknikkfaget, skriftlig
- LAB3004 Laboratoriefaget
- LAB3103 Laboratoriefaget, skriftlig
- LBF3001 Landbruksfaget
- LBF3103 Landbruksfaget, skriftlig
- LMM3004 Landbruksmaskinmekanikerfaget
- LMM3103 Landbruksmaskinmekanikerfaget, skriftlig
- LOG3004 Logistikkfaget
- LOG3103 Logistikkfaget, skriftlig
- LOGV107 Grunnleggende bransjeforståelse
- LOGV108 Produksjon og logistikkoperatørens rolle
- LOGV109 Sertifisert og dokumentert opplæring
- LOGV110 Vurdering kvalitet og økonomi
- LSM3004 Låsesmedfaget
- LSM3103 Låsesmedfaget, skriftlig
- MBT3004 Møbeltapetsererfaget - særløp
- MBT3103 Møbeltapetsererfaget, skriftlig
- MDF3001 Mediedesignfaget
- MDF3103 Mediedesignfaget, skriftlig
- MEL4003 Maritim elektrikerfaget
- MET3001 Medieteknikkfaget
- MET3103 Medieteknikkfaget, skriftlig
- MFF3001 Murer- og flisleggerfaget
- MFF3103 Murer- og flisleggerfaget, skriftlig
- MME3004 Motormekanikerfaget
- MME3103 Motormekanikerfaget, skriftlig
- MOB3004 Modellbyggerfaget
- MOB3103 Modellbyggjarfaget, skriftlig
- MOD3004 Modistfaget
- MOD3103 Modistfaget, skriftlig
- MOT3001 Maler- og overflateteknikkfaget
- MOT3103 Maler- og overflateteknikkfaget, skriftlig
- MOTV106 Helse, miljø og sikkerhet
- MOTV107 Planlegging
- MOTV108 Overflatebehandling
- MOTV109 Maling og tapetsering
- MOTV110 Golvlegging
- MPM3004 Maskør- og parykkmakerfaget - særløp
- MPM3103 Maskør- og parykkmakerfaget, skriftlig
- MSF3004 Møbelsnekkerfaget
- MSF3103 Møbelsnekkerfaget, skriftlig
- MSY3004 Motorsykkelfaget
- MSY3103 Motorsykkelfaget, skriftlig
- MTS3004 Matrosfaget
- MTS3103 Matrosfaget, skriftlig
- NDT3004 NDT-kontrollørfaget
- NDT3103 NDT-kontrollørfaget, skriftlig
- OPT3004 Optronikerfaget
- OPT3103 Optronikerfaget, skriftlig
- ORG3004 Orgelbyggerfaget
- ORG3103 Orgelbyggerfaget, skriftlig
- ORT3004 Ortopediteknikkfaget
- ORT3103 Ortopediteknikkfaget, skriftlig
- PFD3004 Profileringsdesignfaget
- PFD3103 Profileringsdesignfaget, skriftlig
- PLA3004 Platearbeiderfaget
- PLA3103 Platearbeiderfaget, skriftlig
- PLF3001 Plastfaget
- PLF3103 Plastfaget, skriftlig
- PMF3004 Pølsemakerfaget
- PMF3103 Pølsemakerfaget, skriftlig
- POM3004 Polymerkomposittfaget
- POM3103 Polymerkomposittfaget, skriftlig
- POR3004 Portørfaget
- POR3103 Portørfaget, skriftlig
- PRO3004 Produksjonselektronikerfaget
- PRO3103 Produksjonselektronikerfaget, skriftlig
- PRT3004 Produksjonsteknikkfaget
- PRT3103 Produksjonsteknikkfaget, skriftlig
- PRTV106 Helse, miljø og sikkerhet
- PRTV107 Produksjon og drift
- PRTV108 Kvalitet
- PRTV109 Forebyggende vedlikehold
- PRTV110 Forbedringsarbeid, økonomi og bærekraft
- REI3004 Reindriftsfaget
- REI3103 Reindriftsfaget, skriftlig
- REP3004 Repslagerfaget - særløp
- REP3103 Repslagerfaget, skriftlig
- RLF3004 Rørleggerfaget
- RLF3103 Rørleggerfaget, skriftlig
- RLFV104 Helse, miljø og sikkerhet og bransjelære
- RLFV105 Utvendige røranlegg og andre rørsystemer
- RLFV106 Sanitæranlegg
- RLFV107 Vannbårne energianlegg
- RLFV108 Brannsikringsanlegg
- RLV3004 Reiselivsfaget
- RLV3103 Reiselivsfaget, skriftlig
- ROF3004 Renholdsoperatørfaget - særløp
- ROF3103 Renholdsoperatørfaget - skriftlig
- ROFV100 Helse, miljø og sikkerhet og ergonomi i renhold
- ROFV101 Renholdsplanlegging og arbeidsbeskrivelser
- ROFV102 Overflatemateriale, renholdsmaskiner, utstyr og metoder
- ROFV103 Kvalitet, service og samhandling
- RSD3004 Reservedelsfaget
- RSD3103 Reservedelsfaget, skriftlig
- SAL3004 Salmakerfaget
- SAL3103 Salmakerfaget, skriftlig
- SBF3001 Stillasbyggerfaget - særløp
- SBF3103 Stillasbyggerfaget - skriftlig
- SEI3004 Seilmakerfaget - særløp
- SEI3103 Seilmakerfaget, skriftlig
- SER3004 Servitørfaget
- SER3103 Servitørfaget, skriftlig
- SGR3004 Serigrafifaget
- SGR3103 Serigrafifaget, skriftlig
- SIG3004 Signalmontørfaget
- SIG3103 Signalmontørfaget, skriftlig
- SIK3004 Sikkerhetsfaget
- SIK3103 Sikkerhetsfaget, skriftlig
- SKF3004 Skogfaget
- SKF3103 Skogfaget, skriftlig
- SKO3004 Skomakerfaget
- SKO3103 Skomakerfaget, skriftlig
- SLF3004 Slakterfaget
- SLF3103 Slakterfaget, skriftlig
- SLG3004 Salgsfaget
- SLG3103 Salgsfaget, skriftlig
- SLGV105 Regelverk og arbeidsliv
- SLGV106 Service og relasjoner
- SLGV107 Markedsføring og salgsprosesser
- SLGV108 Økonomi og bærekraft i virksomheten
- SLV3004 Sølvsmedfaget
- SLV3103 Sølvsmedfaget, skriftlig
- SME3004 Smedfaget
- SME3103 Smedfaget, skriftlig
- SMK3001 Skipsmotormekanikerfaget
- SMK3103 Skipsmotormekanikerfaget, skriftlig
- SMP3004 Sjømatproduksjon
- SMP3103 Sjømatproduksjon, skriftlig
- SNE3001 Snekkerfaget, fordypningsområde innredning
- SNE3004 Snekkerfaget, fordypningsområde dør og vindu
- SNE3005 Snekkerfaget, fordypningsområde trapp
- SNE3103 Snekkerfaget, fordypningsområde innredning, skriftlig
- SNE3104 Snekkerfaget, fordypningsområde dør og vindu, skriftlig
- SNE3105 Snekkerfaget, fordypningsområde trapp, skriftlig
- SNEV100 Planlegging
- SNEV101 Produksjon og overflatebehandling
- SNEV102 Helse, miljø og sikkerhet og arbeidsmiljø
- SNEV103 Fordypning i innredning
- SNEV104 Fordypning i dør og vindu
- SNEV105 Fordypning i trapp
- SOA3001 Service- og administrasjonsfaget
- SOA3103 Service- og administrasjonsfaget, skriftlig
- SPD3004 Skinn- og pelsduodjifaget
- SPD3103 Skinn- og pelsduodjifaget, skriftlig
- SRL2001 Forretningsdrift
- SRL2002 Innovasjon og markedsføring
- SRL2003 Kultur og kommunikasjon
- SRL2004 Tverrfaglig eksamen salg og reiseliv
- SSH2001 Sikkerhet
- SSH2002 Administrasjon og bærekraftig drift
- SSH2003 Kommunikasjon og yrkesutøvelse
- SSH2004 Tverrfaglig eksamen service, sikkerhet og administrasjon
- STE3004 Steinfaget - særløp
- STE3103 Steinfaget, skriftlig
- STR3004 Strikkefaget
- STR3103 Strikkefaget, skriftlig
- SVE3004 Sveisefaget
- SVE3103 Sveisefaget, skriftlig
- SYM3001 Sykkelmekanikerfaget
- SYM3103 Sykkelmekanikerfaget, skriftlig
- TAK3004 Tak- og membrantekkerfaget
- TAK3103 Tak- og membrantekkerfaget, skriftlig
- TAV3004 Tavlemontørfaget
- TAV3103 Tavlemontørfaget
- TDR3004 Tredreierfaget
- TDR3103 Tredreierfaget, skriftlig
- TED3004 Tekstilduodjifaget
- TED3103 Tekstilduodjifaget, skriftlig
- TEL3004 Telekommunikasjonsmontørfaget
- TEL3103 Telekommunikasjonsmontørfaget, skriftlig
- TKS3004 Taksidermistfaget - særløp
- TKS3103 Taksidermistfaget, skriftlig
- TLM3001 Truck- og liftmekanikerfaget
- TLM3103 Truck- og liftmekanikerfaget, skriftlig
- TLT3001 Trelast- og limtreproduksjonsfaget, fordypningsområde høvellastproduksjon
- TLT3004 Trelast- og limtreproduksjonsfaget, fordypningsområde skurlastproduksjon
- TLT3005 Trelast- og limtreproduksjon, fordypningsområde konstruksjonslimtre
- TLT3006 Trelast- og limtreproduksjonsfaget, fordypningsområde limtreplater og komponenter
- TLT3103 Trelast- og limtreproduksjonsfaget, fordypningsområde høvellastproduksjon, skriftlig
- TLT3104 Trelast- og limtreproduksjonsfaget, fordypningsområde skurlastproduksjon, skriftlig
- TLT3105 Trelast- og limtreproduksjonsfaget, fordypningsområde konstruksjonlimtre, skriftlig
- TLT3106 Trelast- og limtreproduksjonsfaget, fordypningsområde limtreplater og komponenter, skriftlig
- TMF3004 Tømrerfaget
- TMF3103 Tømrerfaget, skriftlig
- TOG3004 Togelektrikerfaget
- TOG3103 Togelektrikerfaget
- TRB3004 Trebåtbyggerfaget
- TRB3103 Trebåtbyggerfaget, skriftlig
- TRD3004 Treduodjifaget
- TRD3103 Treduodjifaget, skriftlig
- TSK3004 Treskjærerfaget
- TSK3103 Treskjærerfaget, skriftlig
- TSR3001 Tekstilrensfaget
- TSR3103 Tekstilrensfaget, skriftlig
- URM3004 Urmakerfaget
- URM3103 Urmakerfaget, skriftlig
- VAF3001 Vaskerifaget
- VAF3103 Vaskerifaget, skriftlig
- VBL3004 Ventilasjons- og blikkenslagerfaget
- VBL3103 Ventilasjons- og blikkenslagerfaget, skriftlig
- VEN3001 Ventilasjonsteknikkfaget
- VEN3103 Ventilasjonsteknikkfaget, skriftlig
- VER3004 Verktøymakerfaget
- VER3103 Verktøymakerfaget, skriftlig
- VHD3004 Ull- og garnduodjifaget
- VHD3103 Ull- og garnduodjifaget, skriftlig
- VIK3004 Viklerfaget
- VIK3103 Viklerfaget
- VOA3004 Vei- og anleggsfaget
- VOA3103 Vei- og anleggsfaget, skriftlig
- VOV3001 Veidrift- og veivedlikeholdsfaget
- VOV3103 Veidrift- og veivedlikeholdsfaget, skriftlig
- YRK3002 Yrkessjåførforskriften, § 16
- YRK3004 Yrkessjåførfaget
- YRK3103 Yrkessjåførfaget, skriftlig

</details>

### Individuell opplæringsplan og andre fagtyper (7)

Fagkoder for individuell opplæringsplan har ikke eget fag eller eget utdanningsprogram.

<details><summary>Vis fagkodene</summary>

- IOP1000 Individuell opplæringsplan 1. år
- IOP2000 Individuell opplæringsplan 2. år
- IOP3000 Individuell opplæringsplan 3. år
- IOP4000 Individuell opplæringsplan 4. år
- IOP5000 Individuell opplæringsplan 5. år
- IOP6000 Individuell opplæringsplan 6. år
- IOP7000 Individuell opplæringsplan 7. år

</details>
