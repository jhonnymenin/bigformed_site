// Rodar com: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mensagem, linkWhatsApp, linkEmail } from '../js/contato.js';

test('sem nada preenchido', () => {
  assert.equal(mensagem(), 'Olá, BigforMed! Quero conversar sobre os serviços da BigforMed.');
});

test('o que vem marcado de início na página', () => {
  assert.equal(
    mensagem({ assuntos: ['Captação de patrocínios'] }),
    'Olá, BigforMed! Quero conversar sobre captação de patrocínios.',
  );
});

test('nome e organização apresentam a pessoa', () => {
  assert.equal(
    mensagem({ nome: 'Ana', org: 'SGSP', assuntos: ['Eventos e simpósios'] }),
    'Olá, BigforMed! Sou Ana, da SGSP. Quero conversar sobre eventos e simpósios.',
  );
});

test('sem organização, o perfil apresenta; "outro" não', () => {
  assert.match(mensagem({ nome: 'Rui', perfil: 'industria' }), /Sou Rui, de uma empresa da indústria da saúde\./);
  assert.match(mensagem({ nome: 'Rui', perfil: 'outro' }), /Sou Rui\. Quero/);
});

test('organização sem nome não entra', () => {
  assert.equal(mensagem({ org: 'Takeda' }), mensagem());
});

test('vários assuntos viram uma lista em português', () => {
  assert.match(
    mensagem({ assuntos: ['Presença digital', 'Identidade visual', 'Consultoria estratégica'] }),
    /sobre presença digital, identidade visual e consultoria estratégica\.$/,
  );
});

test('detalhe vai num parágrafo à parte; espaços sobrando somem', () => {
  assert.equal(mensagem({ nome: '  ', detalhe: ' Congresso em março ' }), `${mensagem()}\n\nCongresso em março`);
});

test('os links levam o texto codificado', () => {
  assert.equal(linkWhatsApp('Olá & tchau'), 'https://wa.me/5511992858914?text=Ol%C3%A1%20%26%20tchau');
  assert.equal(
    linkEmail('Oi', 'Presença digital'),
    'mailto:contato@bigformed.com.br?subject=Contato%20pelo%20site%3A%20Presen%C3%A7a%20digital&body=Oi',
  );
});
