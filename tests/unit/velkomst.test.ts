import { describe, expect, it } from 'vitest';
import { veiviseroverskrift } from '../../src/components/Veiviserinnganger.tsx';
import { ANBEFALTE, lesRolle, ROLLER } from '../../src/app/velkomst/roller.ts';
import { samleFavorittbare } from '../../src/modules/register.ts';
import { velkomstNb } from '../../src/strings/velkomst.nb.ts';
import { velkomstNn } from '../../src/strings/velkomst.nn.ts';

describe('velkomsten (fase 10)', () => {
  it('de anbefalte favorittene finnes i modulenes favorittbare', async () => {
    const alle = await samleFavorittbare();
    for (const rolle of ROLLER) {
      for (const id of ANBEFALTE[rolle]) expect(alle.has(id), `${rolle}: ${id}`).toBe(true);
    }
  });

  it('en rolle som ikke finnes, leses som ingen rolle', () => {
    expect(lesRolle('rektor')).toBe('rektor');
    expect(lesRolle('vaktmester')).toBeNull();
    expect(lesRolle(undefined)).toBeNull();
  });

  it('hver rolle har navn på begge målformer', () => {
    for (const rolle of ROLLER) {
      expect(velkomstNb.rolle.roller[rolle]).toBeTruthy();
      expect(velkomstNn.rolle.roller[rolle]).toBeTruthy();
    }
  });
});

describe('overskriften over veiviserne', () => {
  it('står i entall for én og i flertall for flere (eier 08.10.2026)', () => {
    expect(veiviseroverskrift(1)).toBe('felles.veiviser');
    expect(veiviseroverskrift(2)).toBe('felles.veivisere');
  });
});
