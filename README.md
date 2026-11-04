# Site BigforMed

Site institucional estático (HTML + CSS + JS, sem build). Substitui a versão antiga feita no Bolt (React + Supabase), que está guardada em `legacy-bolt/` só para consulta.

## Rodar localmente

```bash
python3 -m http.server 4802
# abrir http://localhost:4802
```

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | Página principal |
| `privacidade/`, `termos/` | Páginas legais |
| `css/site.css` | Todo o visual |
| `js/contato.js` | Número, e-mail e o texto da mensagem do WhatsApp: o único lugar onde isso mora |
| `tests/` | Testes do contato: `node --test tests/*.test.mjs` |
| `js/site.js` | Formulário, troca de público, entradas e as duas cenas de rolagem (cartas em leque e janela do elefante) |
| `vendor/` | GSAP 3.12.5, Lenis 1.1.13 e o palco das cenas (`vendor/scenes/`), servidos localmente |
| `img/p/` | Fotos do site, em preto e branco, já recortadas no tamanho de uso |
| `img/` | Marca, favicon, imagem de compartilhamento e logos dos parceiros |
| `assets/credits.json` | Licença e autoria das fotos de terceiros |
| `vercel.json` | URLs limpas e cache das imagens |

## Contato

Não há backend nem banco. O formulário monta a mensagem e abre o WhatsApp `(11) 99285-8914`, ou o e-mail `contato@bigformed.com.br`. Para trocar o número ou o e-mail, edite `js/contato.js`. Os links `wa.me` do `index.html` só valem para quem navega sem JavaScript; com script, o site usa o número de `contato.js`.

## Publicar

Qualquer hospedagem estática serve. Na Vercel: importar a pasta, sem comando de build, diretório de saída `.`. Depois apontar o domínio.

## Empresa

BigforMed Prestação de Serviços Ltda. · CNPJ 48.469.974/0001-45 · bigformed.com
