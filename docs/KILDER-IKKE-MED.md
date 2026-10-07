# Kilder som ikke er med ennå

Kilder vi har prøvd å ta med i appen, men som ikke er med, eller bare er delvis med, fordi noe har stengt for det (eier 07.10.2026). Listen er forhindret arbeid som kan tas opp igjen. Når en kilde blir prøvd på nytt, tatt med eller gitt opp, oppdateres raden. Kilder eier har valgt bort, står for seg nederst.

«Skymiljøet» er maskinen Claude arbeider fra. «Actions» er GitHub Actions, der hentingen går. En kilde som bare stenger skymiljøet, kan ofte hentes fra Actions.

## Nyheter (fase 7b)

| Kilde | Hva vi ville ha | Hvorfor ikke | Hva kan åpne den |
|---|---|---|---|
| Trøndelag fylkeskommune | Nyheter om videregående i Trøndelag | Nyhetsarkivet lastes av JavaScript fra `/api/`, og robots.txt stenger `/api/`. | En feed fra fylket, eller at fylket tillater `/api/`. |
| Østfold fylkeskommune | Nyheter om videregående i Østfold | Nettstedet svarer ikke, verken fra skymiljøet eller fra Actions. | Prøv igjen fra Actions (`npm run nyheter:prove`). |
| Oslo kommune, Utdanningsetaten | Nyheter om videregående i Oslo | Ingen nyhetsliste for videregående. | En nyhetsside eller feed for videregående. |
| Agder, Akershus, Buskerud, Finnmark, Møre og Romsdal, Nordland, Rogaland og Troms | – | Med. Feeden (`/ArtikkelRSS.ashx`) er tillatt etter ordlyden i robots.txt, som stenger `/artikkelRSS.aspx`. | Tas ut hvis et fylke sier fra. |
| Skolenes landsforbund | Nyheter fra et lærerforbund | WordPress-feeden svarer ikke, verken fra skymiljøet eller fra Actions. | Prøv igjen fra Actions. Står som prøvekilde i `content/nyheter/kilder.yaml`. |
| Norsk Lektorlag | Nyheter fra et lærerforbund | Ingen feed, og listen har ingen datoer. Det ville krevd henting av hver sak. | En feed, eller datoer i listen. |
| KS | Nyheter om skole og arbeidsgiverpolitikk | Ingen feed, og robots.txt stenger hele nettstedet. Nyhetssiden har i stedet en fast lenke til KS. | En feed, eller at KS åpner for henting. |
| KF Infoserie (Kommuneforlaget) | Nyheter om regelverk | Krever abonnement og innlogging. Henting kan bryte vilkårene. | Avtale med Kommuneforlaget. |
| Utdanningsforskning.no og KSU | Forskningsnytt om skolen | Ingen feed. | En feed. |
| Fafo, SINTEF, Forskningsrådet, Idunn, nasjonale sentre og andre universiteter og høyskoler | Forskningsnytt om skolen | Ingen feed, eller lite om videregående. forskning.no og NIFU dekker en del. | En feed med eget tema for skole. |
| Lovdata, RSS for Norsk Lovtidend | Nye endringer i regelverket | RSS-en svarer 405 fra skymiljøet og er ikke prøvd fra Actions. Nyhetene bygges i stedet fra Lovdata-dataene appen har. | Prøv RSS-en fra Actions, hvis dataene vi har, ikke er nok. |

## Fylkene: tekst, lenker og datoer

| Kilde | Hva vi ville ha | Hvorfor ikke | Hva kan åpne den |
|---|---|---|---|
| Vestland fylkeskommune (vestlandfylke.no) | Fylkets tekster i veiviserne (rettleiingstenesta, midlertidig vedtak, særskild språkopplæring, innføringskurs, klagenemnd), eksamens- og inntaksdatoer og kildesjekk | Nettstedet bryter forbindelsen fra skymiljøet, og har siden 03.10.2026 heller ikke svart fra Actions. Alle elleve `vlfk-*`-kilder i `content/kilder.yaml` er satt til `aktiv: false`, og tekstene er skrevet generelt. Nyhetene fra Vestland kommer fra et eget arkiv som svarer. | Prøv igjen fra Actions, eller spør fylket. Eier kan også lime inn sidene i en kontrollsak. |
| Fylkenes temasider (`content/fylker/lenker.yaml`) | Kontrollerte lenker til fylkenes sider om inntak, klage, språk, privatister og mer | 58 lenker er bare sett i søk (`bekreftet: null`), fordi nettstedet stenger skymiljøet. Alle i Østfold, Buskerud, Vestfold, Telemark, Agder, Møre og Romsdal og Vestland, og én i Troms. Noen temaer mangler helt. | Eier kontrollerer lenkene. www.ofk.no, www.bfk.no og www.vestfoldfylke.no er fortsatt stengt. Uten www virker de. |
| Inntaksdatoer: Oslo, Innlandet og Nordland | Fylkets egne datoer for inntaket | Sidene lenker bare til Vilbli. | Datoer på fylkets egen side. |
| Inntaksdatoer: Vestland | Som over | Nettstedet stenger (se Vestland over). | Som over. |
| Inntaksdatoer: Østfold, Buskerud, Rogaland og Møre og Romsdal | Datoer med årstall | Med, men sidene har ikke årstall, så året antas (`aarAntas`). | Årstall på sidene. |
| Eksamensdatoer: Vestland | Fylkets eksamensdatoer | Nettstedet stenger (se Vestland over). | Som over. |
| Privatistkarakterer: Buskerud, Troms og Møre og Romsdal | Når karakterene for privatister kommer | Sidene viste et skoleår som var gått, og er tatt ut. | Prøv igjen når sidene er oppdatert. |
| Skolerute for fylkene uten forskrift i Lovdata | Skoleruta for alle fylkene | Lovdata har forskrift bare for Rogaland, Vestland, Troms og Finnmark. Eier har ikke avgjort om de andre skal hentes fra fylkenes sider. | Eiers avgjørelse. |

## Nasjonale tjenester

| Kilde | Hva vi ville ha | Hvorfor ikke | Hva kan åpne den |
|---|---|---|---|
| Vilbli.no | Tilbud per skole og fylke, inntak | Robotsjekk stenger henting. Bare lenker, kontrollert for hånd. Tilbudene kommer i stedet fra utdanning.no (avgjørelse 053). | Avtale med Vilbli eller Novari. |
| eksamensplan.udir.no | Eksamensplanen som data | robots.txt stenger alle unntatt søkemotorer, og det finnes ikke noe API eller datasett. Datoene leses fra udir.no og fylkene. | Et datasett fra Udir. |
| Regjeringen.no, «Endringer i lover og regler» | Oversikten over nye regler hvert år | Stenger henting. Lenkene kontrolleres for hånd i august. | At regjeringen.no åpner for henting. |
| utdanning.no, opplæringskontor per lærefag | Hvilke opplæringskontorer som har hvert lærefag | Bare i et internt API uten lisens, og med personopplysninger om enkeltpersonforetak (avgjørelse 053). | Et åpent datasett uten personopplysninger. |
| utdanning.no, API generelt | Innhold om utdanningsprogram og løp | Ingen lisens. Brukes bare til kontroll og lenker (avgjørelse 052). | Lisens fra HKdir. |
| VIGO kodeverk | Fagkoder og mer | Ingen lisens og ingen dokumentasjon. | Avtale med Novari. |

## Tall og statistikk

| Kilde | Hva vi ville ha | Hvorfor ikke | Hva kan åpne den |
|---|---|---|---|
| SSB (PxWebApi) | Gjennomføring for de sju fylkene som mangler i 2020-kullet | Stengt fra skymiljøet, ikke prøvd fra Actions. | Prøv fra Actions (avgjørelse 080). |
| Udir statistikkbank, rapport-API | Tallene i Videregående i tall | Med, men API-et er ikke dokumentert og «ikke ment for ekstern bruk». | Et åpent API fra Udir. |
| Nasjonalt skoleregister, elevtall | Elevtall per skole | Tomt for alle videregående skoler vi så på. | At feltet fylles. |

## Regelverk og avtaler

| Kilde | Hva vi ville ha | Hvorfor ikke | Hva kan åpne den |
|---|---|---|---|
| Lovdata (lovdata.no og api.lovdata.no) | Lov og forskrift | Med, men svarer 405 fra skymiljøet og virker bare fra Actions. | – |
| KS, særavtalesiden (`ks-sfs2213`) | Varsel når KS legger ut en ny SFS 2213 eller en ny protokoll | Svarer 403 Forbidden til kildesjekken fra 06.10.2026, og robots.txt stenger hele ks.no for ukjente roboter. Siden er slått av i kildesjekken og sjekkes for hånd i kontrollrundene i mai og august (eier 07.10.2026). Varselet kommer i stedet fra Utdanningsforbundets side med avtaleteksten (`udf-sfs2213`), som sjekkes hver uke. Den lå 07.10.2026 én versjon etter KF Infoserie. | At KS åpner for kildesjekken. |
| KS, PDF-en av hovedtariffavtalen | Kildesjekk av tallene fra hovedtariffavtalen | Med. PDF-en svarte fortsatt 06.10.2026, men ligger på samme nettsted som særavtalesiden. | – |
| KS, lisens for avtaletekstene | Å gjengi avtaleteksten | Lisensen er uklar, så teksten er skrevet med egne ord, med korte sitater for tallene. | Lisens fra KS. |
| KF Infoserie, SFS 2213 | Avtaleteksten | Bare den ene åpne delingslenken fra KS kan leses. | Avtale med Kommuneforlaget. |
| Visma InSchool (hjelpesidene) | Veiledning for skolene | Opphavsrett. Bare lenker, og lenkesjekken får ikke svar. | – |

## Sider lenkesjekken ikke når

Disse lenkes til, men sjekkes ikke automatisk fordi de stenger: gann.no, maere.no, skagerak.org, thorastorm.vgs.no, vgs.forusfriskole.no, vilbli.no, regjeringen.no og inschool.zendesk.com. Listen oppdateres automatisk i `data/status/stengte-lenker.json` og står i `docs/KONTROLL.md`.

## Valgt bort av eier

Ikke stengt, men eier har sagt nei. Kan også tas opp igjen.

| Kilde | Hvorfor |
|---|---|
| NRK | Nesten ingen treff for videregående, og halvparten av dem gjaldt grunnskolen (K3). |
| UiO, Institutt for lærerutdanning og skoleforskning | Mest om lærerutdanningen (K7). |
| E-post til KS om en feed | Eier sa nei (K9). |
