// Adressen til Videregående i tall (avgjørelse 080). Egen fil, så manifestet og forsiden ikke tar med komponentene i
// startpakken.
export const STATISTIKK_RUTE = '/statistikk';
export const statistikkLenke = (fylke: string | null | undefined) => `#${STATISTIKK_RUTE}${fylke ? `?fylke=${fylke}` : ''}`;
