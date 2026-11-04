// Contato da BigforMed: tudo o que o site sabe sobre como alguém fala com a empresa.
// Número, e-mail e o texto da mensagem moram só aqui; a página só lê o formulário e mostra o resultado.
// Sem DOM de propósito: é testado direto com `node --test tests/*.test.mjs`.

export const WHATSAPP = '5511992858914';
export const EMAIL = 'contato@bigformed.com.br';

const PERFIS = { sociedade: 'uma sociedade médica', industria: 'uma empresa da indústria da saúde' };
const minuscula = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// Monta a mensagem a partir do formulário. Campos só com espaço contam como vazios.
// A organização só entra quando há nome; sem organização, o perfil apresenta a pessoa ("outro" não apresenta).
export function mensagem({ nome = '', org = '', perfil = 'sociedade', assuntos = [], detalhe = '' } = {}) {
  const n = nome.trim();
  const o = org.trim();
  let quem = 'Olá, BigforMed!';
  if (n) {
    quem += ` Sou ${n}`;
    if (o) quem += `, da ${o}`;
    else if (PERFIS[perfil]) quem += `, de ${PERFIS[perfil]}`;
    quem += '.';
  }
  const lista = assuntos.length > 1
    ? assuntos.slice(0, -1).map(minuscula).join(', ') + ' e ' + minuscula(assuntos.at(-1))
    : minuscula(assuntos[0] || 'os serviços da BigforMed');
  const d = detalhe.trim();
  return `${quem} Quero conversar sobre ${lista}.${d ? `\n\n${d}` : ''}`;
}

export const linkWhatsApp = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

export const linkEmail = (texto, assunto = 'BigforMed') =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(`Contato pelo site: ${assunto}`)}&body=${encodeURIComponent(texto)}`;
