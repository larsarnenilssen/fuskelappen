// Felles typer for beregningene i arbeidstidsmodulen.
// Hver beregning gir resultatet og trinnene i utregningen, med formel, verdier og hvor hver verdi kommer fra,
// slik at appen kan vise metoden trinn for trinn. Tekstene til trinn og størrelser står i src/strings.
import type { Oppslag } from '../../../core/regler/motor.ts';

/** Leser en regelverdi, f.eks. «sfs2213.arsverk_timer». I appen er dette hentVerdi() med brukerens kontekst. */
export type Hent = (nokkel: string) => Oppslag;

export type Enhet =
  | 'prosent'
  | 'timer'
  | 'arsrammetimer'
  | 'timer_per_uke'
  | 'minutter'
  | 'uker'
  | 'dager'
  | 'okter'
  | 'elever'
  | 'kroner'
  | 'kroner_per_time'
  | 'faktor'
  | 'tall';

/** Navn på størrelser. Teksten står i src/strings under arbeidstid.storrelser.<navn>. */
export type Storrelse =
  | 'arstimer'
  | 'arsramme'
  | 'arsrammer'
  | 'arsramme_justert'
  | 'stjernetillegg'
  | 'elever'
  | 'okter_per_uke'
  | 'minutter_per_okt'
  | 'uker'
  | 'beskjeftigelse'
  | 'beskjeftigelser'
  | 'sum_beskjeftigelse'
  | 'timer_i_perioden'
  | 'dager_i_perioden'
  | 'dager_i_skolearet'
  | 'periodenokkel'
  | 'perioderamme'
  | 'periodebeskjeftigelse'
  | 'vikartimer'
  | 'antall_okter'
  | 'endring_beskjeftigelse'
  | 'timelonn_konstant'
  | 'kalkulert_tid'
  | 'arslonn'
  | 'arsverk'
  | 'ferie_teller'
  | 'ferie_nevner'
  | 'timelonn'
  | 'lonn'
  | 'feriepengesats'
  | 'feriepenger'
  | 'samlet_lonn'
  | 'reduksjon_arsrammetimer'
  | 'arsramme_funksjon'
  | 'funksjonsprosent'
  | 'planfestet'
  | 'selvdisponert'
  | 'planfestet_okning'
  | 'planfestet_ny'
  | 'skolear_dager'
  | 'arbeidsaar_tillegg'
  | 'arbeidsaar_dager'
  | 'arbeidsdager_per_uke'
  | 'arbeidsaar_uker'
  | 'planfestet_maks_uke'
  | 'planfestet_maks'
  | 'planfestet_per_uke'
  | 'utvidelse_timer'
  | 'timer_per_dag'
  | 'utvidelse_dager'
  | 'stilling'
  | 'arsverk_stilling'
  | 'planfestet_undervisning'
  | 'funksjonstid'
  | 'moter_per_uke'
  | 'skolear_uker'
  | 'motetid'
  | 'annen_planfestet'
  | 'selvdisponert_stilling'
  | 'overtidsprosent'
  | 'overtidstimer'
  | 'overtidstillegg'
  | 'overtidsbetaling'
  | 'undervisningsprosent'
  | 'funksjon'
  | 'funksjoner'
  | 'samlet_beskjeftigelse'
  | 'teknisk_differanse'
  | 'teknisk_timer'
  | 'motetid_i_funksjon'
  | 'funksjonstid_etter_moter'
  | 'planfestet_stilling'
  | 'arbeidsaar_uker_utvidet'
  | 'arslonn_stilling'
  | 'funksjon_uten_utvidelse'
  | 'funksjonstid_uten_utvidelse'
  | 'funksjonstid_i_alt'
  | 'ikke_fordelt'
  | 'undervisningsdel'
  | 'funksjonstillegg'
  | 'lonn_i_alt'
  | 'redusert_undervisning'
  | 'arsverk_60'
  | 'ekstra_feriedager';

export interface Operand {
  navn: Storrelse;
  verdi: number;
  enhet: Enhet;
  /**
   * regel: fra rules/ via hentVerdi(). tabell: en rad i en regeltabell (f.eks. vedlegg 1).
   * inndata: skrevet inn av brukeren. trinn: resultatet av et tidligere trinn.
   */
  opprinnelse: 'regel' | 'tabell' | 'inndata' | 'trinn';
  /** Regeloppslaget verdien kommer fra (nivå, kilde, kontrollert). */
  oppslag?: Oppslag;
  /** Flere tall som inngår, f.eks. årsrammene når laveste brukes. */
  liste?: number[];
  /** Beskrivelse av raden verdien er hentet fra, f.eks. «Engelsk – Stud.spes Vg1». */
  rad?: string;
}

/** Id for et trinn. Tekst og formel står i src/strings under arbeidstid.trinn.<id>. */
export type TrinnId =
  | 'arstimer_fra_okter'
  | 'laveste_arsramme'
  | 'stjernetillegg'
  | 'beskjeftigelse'
  | 'sum_beskjeftigelse'
  | 'timer_i_perioden_fra_okter'
  | 'periodenokkel'
  | 'perioderamme'
  | 'periodebeskjeftigelse'
  | 'vikartimer'
  | 'endring_beskjeftigelse'
  | 'kalkulert_tid'
  | 'timelonn'
  | 'lonn'
  | 'feriepenger'
  | 'samlet_lonn'
  | 'funksjonsprosent'
  | 'selvdisponert'
  | 'planfestet_okning'
  | 'planfestet_ny'
  | 'arbeidsaar_dager'
  | 'ekstra_feriedager_60'
  | 'arbeidsaar_dager_60'
  | 'arbeidsaar_uker'
  | 'planfestet_maks'
  | 'planfestet_per_uke'
  | 'planfestet_per_uke_maks'
  | 'utvidelse_timer'
  | 'utvidelse_dager'
  | 'stilling'
  | 'arsverk_stilling'
  | 'planfestet_undervisning'
  | 'funksjonstid'
  | 'motetid'
  | 'annen_planfestet'
  | 'selvdisponert_stilling'
  | 'overtidsprosent'
  | 'overtidstimer'
  | 'kalkulert_tid_overtid'
  | 'overtidsbetaling'
  | 'sum_funksjon'
  | 'samlet_beskjeftigelse'
  | 'teknisk_differanse'
  | 'teknisk_timer'
  | 'motetid_i_funksjon'
  | 'funksjonstid_etter_moter'
  | 'planfestet_stilling'
  | 'arbeidsaar_uker_utvidet'
  | 'arslonn_stilling'
  | 'stilling_alle_funksjoner'
  | 'funksjonstid_uten_utvidelse'
  | 'funksjonstid_i_alt'
  | 'selvdisponert_med_funksjon'
  | 'ikke_fordelt'
  | 'undervisningsdel'
  | 'lonn_i_alt'
  | 'uker_i_perioden'
  | 'samlet_med_reduksjon';

export interface Trinn {
  id: TrinnId;
  /** Nøkkelen i objektet er plassholderen i formelen, f.eks. {arstimer}. */
  operander: Record<string, Operand>;
  resultat: Operand;
  /** Gruppen trinnet gjelder, når beregningen har flere grupper (1, 2, …). */
  gruppe?: number;
}

export type AdvarselId = 'over_hel_stilling' | 'motetid_for_stor' | 'mangler_elevtall' | 'uker_fra_dager';

export interface Utregning {
  trinn: Trinn[];
  advarsler: AdvarselId[];
}
