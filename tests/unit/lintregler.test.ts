import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import regler from '../../eslint/regler.js';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

tester.run('ingen-tekst-i-jsx', regler.rules['ingen-tekst-i-jsx'], {
  valid: [
    { code: 'const x = <p>{t("forside.tittel")}</p>;' },
    { code: 'const x = <span> · </span>;' },
    { code: 'const x = <b>%</b>;' },
    { code: 'const x = <button aria-label={t("app.tilbake")} />;' },
  ],
  invalid: [
    { code: 'const x = <p>Hei</p>;', errors: [{ messageId: 'tekst' }] },
    { code: 'const x = <img alt="Et bilde" />;', errors: [{ messageId: 'tekst' }] },
    { code: 'const x = <button aria-label="Lukk" />;', errors: [{ messageId: 'tekst' }] },
  ],
});
