// Kort liste med delresultater under hovedverdien i et resultatkort.
export function Oversiktsliste({ rader }: { rader: { navn: string; verdi: string }[] }) {
  return (
    <dl class="oversikt">
      {rader.map((r) => (
        <div key={r.navn} class="oversikt-rad">
          <dt>{r.navn}</dt>
          <dd class="tall">{r.verdi}</dd>
        </div>
      ))}
    </dl>
  );
}
