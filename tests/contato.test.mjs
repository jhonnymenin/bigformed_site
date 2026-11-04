// Rodar com: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mensagem, linkWhatsApp, linkEmail } from '../js/contato.js';

test('sem nada preenchido, a sociedade médica é o padrão', () => {
  assert.equal(mensagem(), 'Olá, BigforMed! Quero conversar sobre captação de patrocínio.');
});

test('nome e organização entram na apresentação', () => {
  assert.equal(
    mensagem({ nome: 'Ana', org: 'SGSP' }),
    'Olá, BigforMed! Sou Ana, da SGSP. Quero conversar sobre captação de patrocínio.',
  );
});

test('só a organização, sem nome', () => {
  assert.equal(
    mensagem({ org: 'Takeda', publico: 'industria' }),
    'Olá, BigforMed! Falo pela Takeda. Quero patrocinar sociedades médicas.',
  );
});

test('espaços sobrando não viram texto', () => {
  assert.equal(mensagem({ nome: '   ', org: '  ' }), mensagem());
});

test('público desconhecido cai no padrão', () => {
  assert.equal(mensagem({ publico: 'outro' }), mensagem());
});

test('os links levam o texto codificado', () => {
  assert.equal(linkWhatsApp('Olá & tchau'), 'https://wa.me/5511992858914?text=Ol%C3%A1%20%26%20tchau');
  assert.match(linkEmail('Oi'), /^mailto:contato@bigformed\.com\.br\?subject=Contato%20pelo%20site&body=Oi$/);
});
