// BigforMed — comportamento e movimento da página.
// GSAP + ScrollTrigger + Lenis ficam em /vendor (sem CDN em produção: o site não quebra se um CDN cair).
import { mensagem, linkWhatsApp, linkEmail, WHATSAPP } from './contato.js';

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = matchMedia('(min-width: 1024px)');
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $('#ano').textContent = new Date().getFullYear();

  // ---------- Texto partido em palavras (mantendo o <em>) ----------
  function split(el) {
    if (el.dataset.splitDone) return $$('.w > span', el);
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.dataset.splitDone = '1';
    return $$('.w > span', el);
  }

  // ---------- Formulário: monta a mensagem do WhatsApp ----------
  const form = $('#composer');
  const preview = $('#preview');
  const hiddenText = $('#f-text');
  const mail = $('#mail-link');
  const err = $('#composer-error');
  // os links fixos do HTML existem para quem está sem script; com script, o número vem de contato.js
  $$('a[href^="https://wa.me/"]').forEach((a) => { a.href = `https://wa.me/${WHATSAPP}`; });

  function compose() {
    const f = new FormData(form);
    const nome = (f.get('nome') || '').trim();
    const assuntos = f.getAll('assunto');
    const txt = mensagem({ nome, org: f.get('org') || '', perfil: f.get('perfil'), assuntos, detalhe: f.get('detalhe') || '' });
    preview.textContent = txt;
    hiddenText.value = txt;
    mail.href = linkEmail(txt, assuntos[0]);
    return { txt, nome };
  }
  form.addEventListener('input', (e) => {
    if (e.target.name === 'perfil' && e.target.value !== 'outro') setAudience(e.target.value, true);
    if (e.target.name === 'nome' && e.target.value.trim()) { e.target.removeAttribute('aria-invalid'); err.hidden = true; }
    compose();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { txt, nome } = compose();
    if (!nome) {
      const n = $('#f-nome'); n.setAttribute('aria-invalid', 'true'); err.hidden = false; n.focus();
      if (hasGsap && !reduced) gsap.fromTo(n, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' });
      return;
    }
    window.open(linkWhatsApp(txt), '_blank', 'noopener');
  });
  compose();

  // ---------- Os dois públicos ----------
  let audience = 'sociedade';
  function setAudience(who, fromForm) {
    if (who === audience || (who !== 'sociedade' && who !== 'industria')) return;
    audience = who;
    document.body.dataset.audience = who;
    $$('[data-set-audience]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.setAudience === who));
    const outgoing = $$('[data-for]').filter((el) => !el.hidden);
    const incoming = $$(`[data-for="${who}"]`);
    const swap = () => {
      outgoing.forEach((el) => { el.hidden = true; });
      incoming.forEach((el) => { el.hidden = false; });
    };
    if (hasGsap && !reduced) {
      const oldTitle = outgoing.find((el) => el.classList.contains('hero__line'));
      const newTitle = incoming.find((el) => el.classList.contains('hero__line'));
      gsap.to(oldTitle ? split(oldTitle) : [], { yPercent: -110, duration: .45, stagger: .025, ease: 'power3.in', onComplete: () => {
        swap();
        if (newTitle) gsap.fromTo(split(newTitle), { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .05, ease: 'expo.out' });
        gsap.fromTo('.hero__lead span:not([hidden])', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .6 });
      } });
    } else swap();
    if (!fromForm) {
      const radio = $(`input[name="perfil"][value="${who}"]`);
      if (radio) { radio.checked = true; compose(); }
    }
  }
  $$('[data-set-audience]').forEach((b) => b.addEventListener('click', () => setAudience(b.dataset.setAudience)));

  // ---------- Menu ----------
  const nav = $('#nav');
  const burger = $('.nav__burger');
  const closeMenu = () => { if (window.__lenis && nav.classList.contains('is-open')) window.__lenis.start(); nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menu'); };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // ---------- Depoimentos ----------
  const quotes = $$('.quote');
  let q = 0;
  const showQuote = (n) => {
    quotes[q].classList.remove('is-active');
    q = (n + quotes.length) % quotes.length;
    quotes[q].classList.add('is-active');
    $('#q-now').textContent = q + 1;
  };
  $$('[data-quote]').forEach((b) => b.addEventListener('click', () => { showQuote(q + (b.dataset.quote === 'next' ? 1 : -1)); clearInterval(qTimer); }));
  let qTimer = reduced ? 0 : setInterval(() => showQuote(q + 1), 7000);

  // ---------- Marquee: duplica para o loop não ter emenda ----------
  $$('.marquee__track').forEach((t) => {
    [...t.children].forEach((li) => {
      const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelector('img').alt = ''; t.appendChild(c);
    });
  });

  // ---------- Luz que segue o mouse nos cards de número ----------
  $$('.tile').forEach((t) => t.addEventListener('pointermove', (e) => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', `${e.clientX - r.left}px`); t.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  // ---------- Sem GSAP ou com movimento reduzido: tudo visível e pronto ----------
  const loader = $('.loader');
  if (!hasGsap || reduced) {
    document.documentElement.classList.add('no-motion');
    $$('.manifesto__text').forEach((el) => { el.style.color = ''; });
    $$('.fw').forEach((el) => { el.style.color = 'inherit'; });
    if (loader) loader.remove();
    $$('.step').forEach((s) => s.classList.add('is-on'));
    // links internos com rolagem nativa
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', () => closeMenu()));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---------- Rolagem suave ----------
  const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#topo' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault(); closeMenu();
    lenis.scrollTo(target, { offset: id === '#topo' ? 0 : -20, duration: 1.4 });
  }));

  // Barra: some ao descer, volta ao subir
  let lastY = 0;
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('is-scrolled', scroll > 30);
    if (nav.classList.contains('is-open')) nav.classList.remove('is-hidden'); else nav.classList.toggle('is-hidden', scroll > lastY && scroll > 500);
    lastY = scroll;
  });

  // Barra clara sobre as seções claras
  // Olha qual seção está atrás da barra; as escuras que sobrepõem as claras (cantos arredondados) vencem
  const lightSecs = $$('.services, .process, .quotes, .faq');
  const darkSecs = $$('.numbers, .contact, .band');
  const under = (sec) => { const r = sec.getBoundingClientRect(); return r.top <= 40 && r.bottom > 40; };
  const navTheme = () => nav.classList.toggle('is-light', lightSecs.some(under) && !darkSecs.some(under));
  lenis.on('scroll', navTheme);
  ScrollTrigger.addEventListener('refresh', navTheme);
  navTheme();

  // Link ativo no menu
  $$('.nav__links a[href^="#"]').forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
  });

  // ---------- Contadores ----------
  const fmt = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  function countUp(el, delay = 0) {
    const end = parseFloat(el.dataset.count); const d = parseInt(el.dataset.decimals || '0', 10);
    const o = { v: 0 };
    el.textContent = fmt(0, d);
    return gsap.to(o, { v: end, duration: 2, delay, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v, d); } });
  }

  // ---------- Abertura + entrada do hero ----------
  const heroWords = split($('.hero__line:not([hidden])'));
  gsap.set(heroWords, { yPercent: 110 });
  gsap.set(['.hero__tag', '.switch', '.hero__lead', '.hero__actions', '.hero__stats li', '.hero__scroll', '.nav'], { autoAlpha: 0, y: 24 });
  gsap.set('.hero__elephant', { autoAlpha: 0, scale: .85, rotate: -6 });

  const intro = gsap.timeline({ paused: true, onComplete: () => document.documentElement.classList.add('is-loaded') });
  intro
    .to('.hero__elephant', { autoAlpha: 1, scale: 1, rotate: 0, duration: 2.2, ease: 'expo.out' }, 0)
    .to(heroWords, { yPercent: 0, duration: 1.3, stagger: .07, ease: 'expo.out' }, .1)
    .to('.nav', { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' }, .3)
    .to(['.hero__tag', '.switch'], { autoAlpha: 1, y: 0, duration: 1, stagger: .08, ease: 'expo.out' }, .35)
    .to(['.hero__lead', '.hero__actions'], { autoAlpha: 1, y: 0, duration: 1, stagger: .1, ease: 'expo.out' }, .6)
    .to('.hero__stats li', { autoAlpha: 1, y: 0, duration: 1, stagger: .1, ease: 'expo.out' }, .8)
    .add(() => $$('.hero__stats [data-count]').forEach((el, i) => countUp(el, i * .1)), .8)
    .to('.hero__scroll', { autoAlpha: 1, y: 0, duration: .8 }, 1.2);

  const firstVisit = !sessionStorage.getItem('bfm-seen');
  if (loader && firstVisit) {
    sessionStorage.setItem('bfm-seen', '1');
    const n = { v: 0 }; const num = $('#loader-num');
    gsap.timeline({ onComplete: () => { loader.remove(); lenis.start(); } })
      .from('.loader__mark', { scale: .6, autoAlpha: 0, duration: .9, ease: 'expo.out' })
      .to(n, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(n.v); } }, 0)
      .to('.loader__mark', { scale: 14, autoAlpha: 0, duration: 1.1, ease: 'expo.in' }, 1.25)
      .to('.loader__count', { autoAlpha: 0, y: -30, duration: .5 }, 1.25)
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 1.75)
      .add(() => intro.play(), 1.95);
  } else {
    if (loader) loader.remove();
    lenis.start(); intro.play();
  }

  // Hero: o elefante e o título reagem ao mouse e à rolagem
  if (fine) {
    const ex = gsap.quickTo('.hero__elephant', 'x', { duration: 1.4, ease: 'power3' });
    const ey = gsap.quickTo('.hero__elephant', 'y', { duration: 1.4, ease: 'power3' });
    $('.hero').addEventListener('pointermove', (e) => {
      ex((e.clientX / innerWidth - .5) * -40); ey((e.clientY / innerHeight - .5) * -30);
    });
  }
  gsap.to('.hero__inner', { yPercent: -18, autoAlpha: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__elephant-fill', { scale: 1.3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // ---------- Títulos das seções sobem palavra por palavra ----------
  $$('[data-split]').forEach((h) => {
    gsap.from(split(h), { yPercent: 110, duration: 1.2, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  // Demais blocos: sobem em sequência por seção
  $$('section').forEach((sec) => {
    const items = $$('[data-reveal]', sec);
    if (!items.length) return;
    gsap.from(items, { y: 60, autoAlpha: 0, duration: 1.1, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: items[0], start: 'top 88%' } });
  });
  $$('.process__head > :not(h2), .faq__head > :not(h2), .numbers__head .tag, .quotes__head .tag, .contact__intro > :not(h2), .services__intro > :not(h2), .band p, .faq__list .qa').forEach((el) => {
    gsap.from(el, { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  gsap.from('.composer', { y: 80, autoAlpha: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.composer', start: 'top 85%' } });
  gsap.from('.partners__title', { y: 20, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: '.partners', start: 'top 85%' } });

  // ---------- Manifesto: as palavras acendem conforme a rolagem ----------
  const mWords = (() => {
    const el = $('.manifesto__text');
    const out = [];
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span'); s.className = 'fw'; s.textContent = p; out.push(s); frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else walk(n);
    });
    walk(el); return out;
  })();
  gsap.to(mWords, { color: (i, el) => (el.closest('em') ? '#4DBEEE' : '#EAF5FA'), stagger: .1, ease: 'none',
    scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 45%', scrub: .6 } });

  // ---------- Soluções: trilho horizontal fixo no desktop ----------
  ScrollTrigger.matchMedia({
    '(min-width: 1024px)': () => {
      const track = $('.services__track');
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.services', pin: '.services__pin', start: 'top top', end: () => `+=${dist()}`, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
      gsap.to('.services__progress span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.services', start: 'top top', end: () => `+=${dist()}`, scrub: true } });
      $$('.card').forEach((c) => {
        gsap.from(c, { y: 120, rotate: 4, autoAlpha: .3, ease: 'power2.out',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 100%', end: 'left 60%', scrub: true } });
        const img = $('.card__media--photo img', c);
        if (img) gsap.fromTo(img, { xPercent: -8, scale: 1.15 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    },
  });

  // ---------- Processo: a linha enche e as etapas acendem ----------
  gsap.to('.steps__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
  $$('.step').forEach((s) => {
    ScrollTrigger.create({ trigger: s, start: 'top 62%', onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') });
    gsap.from(s.children, { y: 40, autoAlpha: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 80%' } });
  });

  // ---------- Números ----------
  $$('.bento [data-count]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => countUp(el) });
  });
  gsap.fromTo('.tile__line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: 'power3.inOut', scrollTrigger: { trigger: '.tile--hero', start: 'top 80%' } });
  gsap.from('.tile__area', { autoAlpha: 0, duration: 2, delay: .6, scrollTrigger: { trigger: '.tile--hero', start: 'top 80%' } });

  // ---------- Faixa: a foto abre até a borda ----------
  gsap.fromTo('.band__frame', { clipPath: 'inset(0 12% round 40px)' }, { clipPath: 'inset(0 0% round 0px)', ease: 'none',
    scrollTrigger: { trigger: '.band', start: 'top 85%', end: 'top 10%', scrub: true } });
  gsap.fromTo('.band__img', { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });

  // ---------- Rodapé: letras do nome sobem ----------
  gsap.from('.footer__word span', { yPercent: 100, autoAlpha: 0, duration: 1.2, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '.footer__word', start: 'top 95%' } });

  // ---------- Botões magnéticos ----------
  if (fine) {
    $$('.magnetic').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const yTo = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  // ---------- Cursor ----------
  if (fine) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor'); const dot = $('.cursor__dot'); const ring = $('.cursor__ring'); const label = $('.cursor__label');
    const dx = gsap.quickTo(dot, 'x', { duration: .1 }); const dy = gsap.quickTo(dot, 'y', { duration: .1 });
    const rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }); const ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
    addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    const light = $$('.services, .process, .quotes, .faq');
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      const card = t.closest('.card');
      cur.classList.toggle('is-label', !!card && desktop.matches);
      label.textContent = card ? 'Arraste' : '';
      cur.classList.toggle('is-hover', !card && !!t.closest('a, button, summary, label.chip, .marquee__track li'));
      cur.classList.toggle('is-light', light.some((s) => s.contains(t)));
    });
    document.addEventListener('pointerleave', () => gsap.to([dot, ring], { autoAlpha: 0, duration: .3 }));
    document.addEventListener('pointerenter', () => gsap.to([dot, ring], { autoAlpha: 1, duration: .3 }));
  }

  // FAQ: abre um por vez e recalcula as posições
  $$('.qa').forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) $$('.qa').forEach((o) => { if (o !== d) o.open = false; });
    if (d.open) gsap.from($('.qa__body', d), { height: 0, autoAlpha: 0, duration: .6, ease: 'expo.out', clearProps: 'height' });
    ScrollTrigger.refresh();
  }));

  addEventListener('load', () => ScrollTrigger.refresh());
})();
