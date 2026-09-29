// Egne lintregler for Protokollen.

/** UI-tekst skal ligge i src/strings/ eller content/, ikke direkte i JSX. */
const ingenTekstIJsx = {
  meta: {
    type: 'problem',
    docs: { description: 'Forbyr tekst med bokstaver direkte i JSX og i tekstattributter' },
    messages: {
      tekst: 'UI-tekst skal hentes fra src/strings/ (t(...)) eller content/, ikke skrives direkte i JSX: «{{tekst}}»',
    },
    schema: [],
  },
  create(context) {
    const harBokstaver = (s) => /\p{L}/u.test(s);
    const tekstattributter = new Set(['aria-label', 'title', 'alt', 'placeholder', 'aria-description']);
    return {
      JSXText(node) {
        const tekst = node.value.trim();
        if (tekst && harBokstaver(tekst)) context.report({ node, messageId: 'tekst', data: { tekst } });
      },
      JSXAttribute(node) {
        if (!tekstattributter.has(node.name.name)) return;
        const v = node.value;
        if (v && v.type === 'Literal' && typeof v.value === 'string' && harBokstaver(v.value)) {
          context.report({ node, messageId: 'tekst', data: { tekst: v.value } });
        }
      },
    };
  },
};

export default { rules: { 'ingen-tekst-i-jsx': ingenTekstIJsx } };
