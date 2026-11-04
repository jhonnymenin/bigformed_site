// BigforMed — comportamento e movimento.
// Tudo funciona sem script: o conteúdo está no HTML e as cenas têm composição final.
// O script só acrescenta chegada, as duas cenas de rolagem e o formulário que monta a mensagem.
(() => {
  const WA = '5511992858914';
  const EMAIL = 'contato@bigformed.com.br';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#ano').textContent = new Date().getFullYear();

  // ---------- Os dois públicos (a coisa viva da página) ----------
  let audience = 'sociedade';
  function setAudience(who) {
    if (who === audience) return;
    audience = who;
    document.body.dataset.audience = who;
    $$('[data-set-audience]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setAudience === who)));
    $$('[data-for]').forEach((el) => { el.hidden = el.dataset.for !== who; });
    // o título entra de novo, linha por linha
    $$(`.hero__title [data-for="${who}"] [data-line]`).forEach((l) => { l.style.animation = 'none'; void l.offsetWidth; l.style.animation = ''; });
    compose();
  }
  $$('[data-set-audience]').forEach((b) => b.addEventListener('click', () => setAudience(b.dataset.setAudience)));

  // ---------- Formulário: a mensagem sai pronta no WhatsApp ----------
  const form = $('#composer');
  const nameIn = $('#f-nome');
  const orgIn = $('#f-org');
  const err = $('#composer-error');
  function compose() {
    const nome = nameIn.value.trim();
    const org = orgIn.value.trim();
    let txt = 'Olá, BigforMed!';
    if (nome) txt += ` Sou ${nome}${org ? `, da ${org}` : ''}.`;
    else if (org) txt += ` Falo pela ${org}.`;
    txt += audience === 'industria'
      ? ' Quero patrocinar sociedades médicas.'
      : ' Quero conversar sobre captação de patrocínio.';
    $('#preview').textContent = txt;
    $('#f-text').value = txt;
    $('#mail-link').href = `mailto:${EMAIL}?subject=${encodeURIComponent('Contato pelo site')}&body=${encodeURIComponent(txt)}`;
    return { txt, nome };
  }
  form.addEventListener('input', () => {
    if (nameIn.value.trim()) { nameIn.removeAttribute('aria-invalid'); err.hidden = true; }
    compose();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { txt, nome } = compose();
    if (!nome) { nameIn.setAttribute('aria-invalid', 'true'); err.hidden = false; nameIn.focus(); return; }
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
  });
  compose();

  // ---------- Barra fixa: aparece depois do hero e pega a cor do capítulo ----------
  const bar = $('#bar');
  const grounds = [
    ['.hero', 'paper'], ['.patrons', 'petrol'], ['.fan', 'deep'], ['.steps', 'paper'], ['.figures', 'white'],
    ['.window', 'ink'], ['.slips', 'cyan'], ['.about', 'paper'], ['.faq', 'white'], ['.contact', 'petrol'], ['.foot', 'deep'],
  ].map(([s, g]) => [$(s), g]).filter(([el]) => el);
  const hero = $('.hero');
  function onScroll() {
    bar.classList.toggle('is-shown', hero.getBoundingClientRect().bottom < 64 || bar.classList.contains('is-open'));
    const hit = grounds.find(([el]) => { const r = el.getBoundingClientRect(); return r.top <= 32 && r.bottom > 32; });
    if (hit) bar.dataset.ground = hit[1];
    $$('.bar__links a').forEach((a) => {
      const sec = $(a.getAttribute('href'));
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      a.classList.toggle('is-active', r.top <= innerHeight * .4 && r.bottom > innerHeight * .4);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('.bar__menu');
  const closeMenu = () => { bar.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu'; };
  menuBtn.addEventListener('click', () => {
    const open = bar.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Fechar' : 'Menu';
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // ---------- Entradas: cada parte de cada seção, em sequência, uma vez ----------
  const counts = new Map();
  $$('[data-reveal]').forEach((el) => {
    const sec = el.closest('section') || document.body;
    const n = counts.get(sec) || 0; counts.set(sec, n + 1);
    el.style.setProperty('--d', `${Math.min(n, 5) * 80}ms`);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  // ---------- Números que rolam até o valor, uma vez ----------
  const fmt = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const roll = (el) => {
    const end = parseFloat(el.dataset.roll); const d = parseInt(el.dataset.decimals || '0', 10);
    if (reduced) return;
    const t0 = performance.now(); const dur = 1600;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(end * e, d);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const rio = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { roll(e.target); rio.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-roll]').forEach((el) => rio.observe(el));

  // ---------- Faixa de fotos do contato: duplica para o laço não ter emenda ----------
  const strip = $('.strip__track');
  if (strip) [...strip.children].forEach((img) => strip.appendChild(img.cloneNode(true)));

  // ---------- Cenas de rolagem ----------
  if (!window.Stage) return;
  window.Scenes = window.Scenes || {};

  // Cena 1: as quatro frentes chegam como cartas dadas na mesa, uma por vez.
  Scenes.fan = (root, opts = {}) => matchMedia('(max-width: 1023px)').matches ? (root.classList.add('is-rest'), null) : Stage.scene(root, {
    hold: opts.hold ?? 2,
    phone: 'rest',
    build(tl, { q }) {
      const cards = q('.fcard');
      const table = q('.fan__table')[0];
      // no começo a mesa está deslocada para a primeira carta ficar no centro
      // no tablet a mesa está reduzida, então o deslocamento encolhe junto
      const scale = () => table.getBoundingClientRect().width / table.offsetWidth || 1;
      tl.fromTo(table, { x: () => 375 * scale() }, { x: 0, duration: .85, ease: 'none' }, 0);
      const tilt = [-4, 2, -2, 4];               // o leque final; o GSAP assume a rotação de cada carta
      cards.forEach((c, i) => {
        gsap.set(c, { rotate: tilt[i] });
        tl.fromTo(c, { y: () => innerHeight * 0.9, rotate: tilt[i] * 3 }, { y: 0, rotate: tilt[i], duration: .2, ease: 'power2.out' }, .04 + i * .2);
      });
    },
  });

  // Cena 2: o elefante do logo é a janela; ela cresce até o congresso ocupar a tela.
  Scenes['elephant-window'] = (root, opts = {}) => Stage.scene(root, {
    hold: opts.hold ?? 1.6,
    build(tl, { q, stage }) {
      const pic = q('.window__pic')[0];
      const P = { x: 0.58, y: 0.053 };          // um ponto no meio do traço grosso do topo do elefante
      const ratio = 600 / 569;                   // altura / largura da máscara
      const state = { t: 0 };
      const apply = () => {
        const W = stage.clientWidth; const H = stage.clientHeight;
        const s0 = Math.min(W, H) * 0.42;        // largura inicial do elefante
        const s1 = Math.max(W, H) * 14;          // grande o bastante para o traço cobrir a tela
        const t = state.t;
        const size = s0 * Math.pow(s1 / s0, t);  // zoom geométrico: velocidade constante ao olho
        const ax = 0.5 + (P.x - 0.5) * Math.min(1, t * 3);
        const ay = 0.5 + (P.y - 0.5) * Math.min(1, t * 3);
        const cx = W / 2; const cy = H * 0.56;
        pic.style.setProperty('--ms', `${size}px`);
        pic.style.setProperty('--mx', `${cx - ax * size}px`);
        pic.style.setProperty('--my', `${cy - ay * size * ratio}px`);
      };
      apply();
      addEventListener('resize', apply);
      tl.to(q('.window__title'), { autoAlpha: 0, y: -40, duration: .14 }, .12)
        .to(state, { t: 1, duration: .62, ease: 'power1.in', onUpdate: apply }, .1)
        .fromTo(q('.window__pic img'), { scale: 1.25 }, { scale: 1, duration: .72 }, .1)
        .from(q('.window__cap'), { autoAlpha: 0, y: 30, duration: .12 }, .8);
    },
  });

  Stage.smooth();
  Stage.init();

  // links internos com a rolagem suave, quando ela existe
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#topo' ? 0 : $(id);
    if (target === null) return;
    closeMenu();
    if (!Stage.lenis) return;
    e.preventDefault();
    Stage.lenis.scrollTo(target, { offset: id === '#topo' ? 0 : -64, duration: 1.2 });
  }));
  if (Stage.lenis) Stage.lenis.on('scroll', onScroll);
})();
