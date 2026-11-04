// Contato da BigforMed: tudo o que o site sabe sobre como alguém fala com a empresa.
// Número, e-mail e o texto da mensagem moram só aqui; a página só lê os campos e mostra o resultado.
// Sem DOM de propósito: é testado direto com `node --test tests/`.

export const WHATSAPP = '5511992858914';
export const EMAIL = 'contato@bigformed.com.br';

const PEDIDO = {
  sociedade: 'Quero conversar sobre captação de patrocínio.',
  industria: 'Quero patrocinar sociedades médicas.',
};

// Monta a mensagem a partir do que a pessoa preencheu. Campos vazios ou só com espaço são ignorados;
// público desconhecido cai no de sociedade médica, que é o padrão da página.
export function mensagem({ nome = '', org = '', publico = 'sociedade' } = {}) {
  const n = nome.trim();
  const o = org.trim();
  let txt = 'Olá, BigforMed!';
  if (n) txt += ` Sou ${n}${o ? `, da ${o}` : ''}.`;
  else if (o) txt += ` Falo pela ${o}.`;
  return `${txt} ${PEDIDO[publico] ?? PEDIDO.sociedade}`;
}

export const linkWhatsApp = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

export const linkEmail = (texto) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent('Contato pelo site')}&body=${encodeURIComponent(texto)}`;
