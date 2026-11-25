import { PRODUCTS, CATEGORIES, SIZE_CHARTS, TESTIMONIALS, FACEBOOK_URL, getProduct, getColour, formatPrice, forGender } from './data.js';
import { flatlaySVG } from './flatlay.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const IMG = 'img/products/';

let viewerMod, heroMod;
const loadViewer = () => (viewerMod ||= import('./viewer.js'));
const loadHero = () => (heroMod ||= import('./hero.js'));

let cleanups = [];
const onCleanup = (fn) => cleanups.push(fn);

/* =========================================================
   Variant helpers
   ========================================================= */
const svgURL = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const GENDER_LABEL = { men: 'Men', women: 'Women', unisex: 'Men & Women' };
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || '';

/** Fit shown for a product: unisex styles switch to the women's cut in the women's view. */
const fitFor = (p, view) => (p.gender === 'women' ? 'women' : p.gender === 'men' ? 'men' : view === 'women' ? 'women' : 'men');
function variant(p, colour, fit) {
  const garment = { ...(colour.garment || {}) };
  if (p.gender === 'unisex' && fit === 'women' && p.garment.type === 'suit') garment.cut = 'female';
  return { color: colour.hex, garment };
}
const enc = (o) => encodeURIComponent(JSON.stringify(o));
const stillAttrs = (p, colour, fit, angle = -28) => {
  const v = variant(p, colour, fit);
  return `data-still="${p.slug}" data-color="${v.color}" data-g="${enc(v.garment)}" data-angle="${angle}"`;
};
const defaultColour = (p, fit) => (fit === 'women' && p.womenDefault ? getColour(p, p.womenDefault) : p.colors[0]);
const productURL = (p, colour, fit) => `#/product/${p.slug}?color=${colour.id}${p.gender === 'unisex' && fit === 'women' ? '&fit=women' : ''}`;

function card(p, view = 'all') {
  const fit = fitFor(p, view);
  const colour = defaultColour(p, fit);
  const photo = colour.photos[0];
  return `
  <article class="card">
    <a href="${productURL(p, colour, fit)}" class="card-media">
      <div class="card-img still" ${stillAttrs(p, colour, fit)}><span class="skeleton"></span></div>
      ${photo
        ? `<img class="card-img alt photo" src="${IMG}${photo}" alt="" loading="lazy" /><span class="card-src">Original photo</span>`
        : `<img class="card-img alt" src="${svgURL(flatlaySVG(p, variant(p, colour, fit)))}" alt="" loading="lazy" />`}
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <span class="chip-360">360°</span>
    </a>
    <div class="card-body">
      <h3><a href="${productURL(p, colour, fit)}">${p.name}</a></h3>
      <p class="card-sub">${catName(p.category)}${p.gender === 'unisex' && p.garment.type === 'suit' ? ' · Men’s & women’s cut' : ''}</p>
      <div class="card-foot">
        <span class="price tba">${formatPrice(p)}</span>
        <span class="swatches" title="${p.colors.length} colour${p.colors.length > 1 ? 's' : ''}">${p.colors.map((c) => `<i style="--c:${c.hex}"></i>`).join('')}</span>
      </div>
    </div>
  </article>`;
}

function hydrateStills(root = app) {
  const els = $$('[data-still]', root);
  if (!els.length) return;
  loadViewer().then(({ renderStill }) => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target;
        const p = getProduct(el.dataset.still);
        const garment = el.dataset.g ? JSON.parse(decodeURIComponent(el.dataset.g)) : {};
        const opts = { product: p, angle: +(el.dataset.angle ?? -28), color: el.dataset.color, garment };
        renderStill(opts).then((url) => {
          if (!url) url = svgURL(flatlaySVG(p, opts)); // no WebGL → generated flat-lay
          const img = new Image();
          img.alt = `${p.name} 3D preview`;
          img.src = url;
          img.onload = () => { el.innerHTML = ''; el.appendChild(img); el.classList.add('ready'); };
        });
      });
    }, { rootMargin: '300px' });
    els.forEach((el) => io.observe(el));
    onCleanup(() => io.disconnect());
  });
}

function toast(msg) {
  const t = $('#toast');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 3200);
}
function reveal(root = app) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal', root).forEach((el) => io.observe(el));
  onCleanup(() => io.disconnect());
}
function noWebGL(el, p, v) {
  el.classList.add('loaded', 'no-gl');
  el.innerHTML = `<img src="${svgURL(flatlaySVG(p, v))}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain"/><p class="no-gl-note">3D view needs WebGL. Try a recent browser.</p>`;
}
const dialHTML = (dark) => `<div class="angle-dial ${dark ? 'dark' : ''}"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-opacity=".18" stroke-width="2"/><circle class="dial-arc" cx="20" cy="20" r="17" fill="none" stroke="${dark ? '#29a3d6' : '#8cc63f'}" stroke-width="2.5" stroke-dasharray="0 107" transform="rotate(-90 20 20)" stroke-linecap="round"/></svg><span class="dial-val">0°</span></div>`;
const dragHint = (t) => `<div class="drag-hint"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 12h8M8 12l3-3M8 12l3 3M16 12l-3-3M16 12l-3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>${t}</div>`;
const angleUpdater = (root) => (d) => { $('.dial-val', root).textContent = `${d}°`; $('.dial-arc', root).setAttribute('stroke-dasharray', `${(d / 360) * 107} 107`); };

/* =========================================================
   Home
   ========================================================= */
function home() {
  const studioSet = [
    ['premium-scrub-set', 'black', 'men'], ['premium-scrub-set', 'navy', 'women'], ['premium-scrub-set', 'maroon', 'men'],
    ['three-quarter-sleeve-set', 'lavender', 'women'], ['three-quarter-sleeve-set', 'white', 'women'],
    ['summer-lite-scrub-set', 'teal-green', 'men'], ['female-cut-scrub-set', 'ocean-blue', 'women'], ['white-coat', 'white', 'men'],
  ].map(([s, c, fit]) => { const p = getProduct(s); return { p, colour: getColour(p, c), fit }; });
  const label = (e) => `${e.p.name} · ${e.colour.name}${e.p.gender === 'unisex' && e.p.garment.type === 'suit' ? (e.fit === 'women' ? ' · Women’s cut' : ' · Men’s cut') : ''}`;

  app.innerHTML = `
  <section class="hero" id="hero">
    <div class="hero-canvas" id="heroCanvas"></div>
    <div class="hero-content container">
      <p class="eyebrow"><span class="dot"></span> Medical apparel · Bangladesh</p>
      <h1 class="hero-title">
        <span class="line"><span>Made for comfort.</span></span>
        <span class="line"><span><em>Made for care.</em></span></span>
      </h1>
      <p class="hero-sub">Premium scrubs and OT dresses built for long duty hours, and the first in Bangladesh you can turn a full 360° before you buy.</p>
      <div class="hero-cta">
        <a href="#/shop?for=women" class="btn btn-primary">Shop Women</a>
        <a href="#/shop?for=men" class="btn btn-ghost">Shop Men</a>
      </div>
      <a href="#studio" class="hero-hint" data-scroll="studio"><span class="spin360">360°</span> Try the Fit Studio</a>
    </div>
    <div class="scroll-cue" aria-hidden="true"><span></span></div>
  </section>

  <div class="marquee" aria-hidden="true"><div class="marquee-track">
    ${Array(2).fill(['Premium quality fabric', 'Breathable all day', 'Built for long duty hours', 'Functional pockets', 'Name embroidery', 'Sizes M to 4XL']
      .map((t) => `<span>${t}</span><i>✦</i>`).join('')).join('')}
  </div></div>

  <section class="section container">
    <div class="audience">
      <a href="#/shop?for=women" class="aud-card reveal" style="--tint:#ece9fb">
        <img src="${IMG}women-portrait.jpg" alt="Female doctor in a lavender three-quarter sleeve set" loading="lazy" />
        <div class="aud-copy"><p class="kicker">For her</p><h2>Women</h2><p>Female-cut and three-quarter sleeve sets, plus white coats and caps.</p><span class="link-arrow">Shop women</span></div>
      </a>
      <a href="#/shop?for=men" class="aud-card reveal" style="--tint:#e3f0ec">
        <img src="${IMG}men-portrait.jpg" alt="Doctor in a sea green scrub set" loading="lazy" />
        <div class="aud-copy"><p class="kicker">For him</p><h2>Men</h2><p>Premium and Summer Lite scrub sets, white coats and caps.</p><span class="link-arrow">Shop men</span></div>
      </a>
    </div>
  </section>

  <section class="section container">
    <div class="section-head reveal"><div><p class="kicker">The collection</p><h2>Every style, every colour</h2></div><a href="#/shop" class="link-arrow">Shop all</a></div>
    <div class="grid products-grid">${PRODUCTS.map((p) => card(p)).join('')}</div>
  </section>

  <section class="studio" id="studio">
    <div class="container studio-grid">
      <div class="studio-copy reveal">
        <p class="kicker light">P53 Fit Studio</p>
        <h2>See every stitch.<br/><em>From every side.</em></h2>
        <p>Photos only show the front. The Fit Studio lets doctors drag and turn every P53 style a full 360° to check the pockets, side slits and back before ordering.</p>
        <div class="studio-swatches" role="radiogroup" aria-label="Choose style">
          ${studioSet.map((e, i) => `<button class="swatch ${i === 0 ? 'active' : ''}" style="--c:${e.colour.hex}" data-i="${i}" title="${label(e)}" aria-label="${label(e)}"></button>`).join('')}
        </div>
        <p class="studio-name" id="studioName">${label(studioSet[0])}</p>
        <div class="studio-ref" id="studioRef"></div>
        <a href="${productURL(studioSet[0].p, studioSet[0].colour, studioSet[0].fit)}" class="btn btn-light" id="studioLink">View product</a>
      </div>
      <div class="studio-stage reveal">
        <div class="viewer" id="studioViewer"><div class="viewer-loading"><span class="spinner"></span></div>${dragHint('Drag to rotate')}${dialHTML(false)}</div>
        <div class="view-snaps"><button data-snap="0">Front</button><button data-snap="90">Side</button><button data-snap="180">Back</button></div>
      </div>
    </div>
  </section>

  <section class="section container embroidery reveal">
    <div class="emb-art"><img src="${svgURL(flatlaySVG(getProduct('three-quarter-sleeve-set'), { color: '#f1f1ee', name: 'DR. JOYA DEVI' }))}" alt="White set with name embroidery" /></div>
    <div class="emb-copy">
      <p class="kicker">Personalise</p>
      <h2>Your name, <em>embroidered.</em></h2>
      <p>Add up to 15 letters of name embroidery to the white three-quarter set and the white coat. Type your name and watch it appear on the 3D garment.</p>
      <a href="#/product/three-quarter-sleeve-set?color=white" class="btn btn-primary">Try it in 3D</a>
    </div>
  </section>

  <section class="section heroes">
    <div class="container">
      <div class="section-head reveal"><div><p class="kicker">P53 family</p><h2>Worn by real healthcare heroes</h2></div></div>
      <div class="hero-cards">
        ${TESTIMONIALS.map((t) => `
          <figure class="hcard reveal">
            <img src="${IMG}${t.img}" alt="${t.name} wearing P53" loading="lazy" />
            <figcaption><b>${t.name}</b><span>${t.role}</span><em>${t.product}</em></figcaption>
          </figure>`).join('')}
      </div>
    </div>
  </section>

  <section class="cta-band">
    <div class="container cta-inner reveal">
      <div><h2>Online ordering is coming soon.</h2><p>Until then, message P53 on Facebook to order any style you see here.</p></div>
      <a href="${FACEBOOK_URL}" target="_blank" rel="noopener" class="btn btn-light">Order on Facebook</a>
    </div>
  </section>`;

  loadHero().then(({ initHero }) => { if ($('#heroCanvas')) onCleanup(initHero($('#heroCanvas'))); });

  const stage = $('#studioViewer');
  const setRef = (e) => {
    const ph = e.colour.photos[0];
    $('#studioRef').innerHTML = ph ? `<img src="${IMG}${ph}" alt="" /><span>Modelled from P53’s original photo</span>` : `<span class="muted-light">Reference photo coming soon</span>`;
  };
  setRef(studioSet[0]);
  const startStudio = () => loadViewer().then(({ GarmentViewer }) => {
    if (!document.body.contains(stage)) return;
    const first = studioSet[0];
    let v;
    try { v = new GarmentViewer(stage, first.p, { ...variant(first.p, first.colour, first.fit), onAngle: angleUpdater(stage) }); }
    catch (e) { return noWebGL(stage, first.p, variant(first.p, first.colour, first.fit)); }
    stage.classList.add('loaded');
    onCleanup(() => v.dispose());
    $$('.studio-swatches .swatch').forEach((b) => b.addEventListener('click', () => {
      $$('.studio-swatches .swatch').forEach((x) => x.classList.toggle('active', x === b));
      const e = studioSet[+b.dataset.i];
      v.setProduct(e.p, variant(e.p, e.colour, e.fit));
      $('#studioName').textContent = label(e);
      $('#studioLink').href = productURL(e.p, e.colour, e.fit);
      setRef(e);
    }));
    $$('.view-snaps button').forEach((b) => b.addEventListener('click', () => v.snapTo(+b.dataset.snap)));
  });
  const sio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sio.disconnect(); startStudio(); } }, { rootMargin: '200px' });
  sio.observe(stage);
  onCleanup(() => sio.disconnect());

  $('[data-scroll="studio"]').addEventListener('click', (e) => { e.preventDefault(); $('#studio').scrollIntoView({ behavior: 'smooth' }); });
  hydrateStills();
  reveal();
}

/* =========================================================
   Shop
   ========================================================= */
function shop(params) {
  const state = { view: params.get('for') || 'all', category: params.get('category') || 'all' };

  app.innerHTML = `
  <section class="page-head container shop-head">
    <h1>Shop</h1>
    <div class="seg" role="radiogroup" aria-label="Shopping for">
      <span class="seg-label">Shopping for</span>
      ${[['all', 'All'], ['women', 'Women'], ['men', 'Men']].map(([v, l]) => `<button role="radio" data-view="${v}" class="${state.view === v ? 'active' : ''}" aria-checked="${state.view === v}">${l}</button>`).join('')}
    </div>
  </section>
  <section class="container shop">
    <div class="shop-bar"><div class="chips" id="chips"></div><span id="count" class="muted count"></span></div>
    <div class="grid products-grid" id="grid"></div>
  </section>`;

  const apply = () => {
    const pool = forGender(state.view);
    const cats = CATEGORIES.filter((c) => pool.some((p) => p.category === c.id));
    if (state.category !== 'all' && !cats.some((c) => c.id === state.category)) state.category = 'all';
    $('#chips').innerHTML = [{ id: 'all', name: 'All' }, ...cats].map((c) => `<button data-category="${c.id}" class="${state.category === c.id ? 'active' : ''}">${c.name}</button>`).join('');
    const list = pool.filter((p) => state.category === 'all' || p.category === state.category);
    $('#grid').innerHTML = list.map((p) => card(p, state.view)).join('');
    $('#count').textContent = `${list.length} style${list.length === 1 ? '' : 's'}`;
    const q = new URLSearchParams(Object.entries({ for: state.view, category: state.category }).filter(([, v]) => v !== 'all'));
    history.replaceState(null, '', `#/shop${q.toString() ? `?${q}` : ''}`);
    hydrateStills($('#grid'));
  };

  const handler = (e) => {
    const t = e.target.closest('[data-view],[data-category]');
    if (!t) return;
    if (t.dataset.view) {
      state.view = t.dataset.view;
      $$('[data-view]').forEach((b) => { b.classList.toggle('active', b === t); b.setAttribute('aria-checked', b === t); });
    } else state.category = t.dataset.category;
    apply();
  };
  app.addEventListener('click', handler);
  onCleanup(() => app.removeEventListener('click', handler));
  apply();
}

/* =========================================================
   Product
   ========================================================= */
function product(slug, params) {
  const p = getProduct(slug);
  if (!p) return notFound();
  const fitChoice = p.gender === 'unisex' && p.garment.type === 'suit';
  const state = {
    colour: getColour(p, params.get('color')),
    fit: p.gender === 'women' ? 'women' : p.gender === 'men' ? 'men' : params.get('fit') === 'women' ? 'women' : 'men',
    size: null, qty: 1, view: '360', name: '',
  };
  const related = PRODUCTS.filter((x) => x.slug !== p.slug && (x.gender === p.gender || x.gender === 'unisex' || p.gender === 'unisex')).slice(0, 4);

  app.innerHTML = `
  <section class="container pdp">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><a href="#/shop">Shop</a><span>/</span><a href="#/shop?category=${p.category}">${catName(p.category)}</a></nav>
    <div class="pdp-grid">
      <div class="gallery">
        <div class="stage">
          <div class="viewer" id="pdpViewer">
            <div class="viewer-loading"><span class="spinner"></span></div>
            ${dragHint('Drag to rotate 360°')}${dialHTML(true)}
            <div class="view-snaps on-stage"><button data-snap="0">Front</button><button data-snap="90">Side</button><button data-snap="180">Back</button></div>
          </div>
          <div class="stage-alt" id="stageAlt" hidden></div>
        </div>
        <div class="thumbs" id="thumbs" role="tablist"></div>
        <div class="source-card" id="sourceCard"></div>
      </div>

      <div class="buy">
        <p class="kicker">${catName(p.category)} · ${GENDER_LABEL[p.gender]}</p>
        <h1>${p.name}</h1>
        <div class="price-row"><span class="price big tba">${formatPrice(p)}</span><span class="muted small">Price to be announced</span></div>
        <p class="desc">${p.description}</p>

        <div class="opt-group">
          <div class="opt-label">Colour <b id="colourName"></b></div>
          <div class="pdp-swatches">${p.colors.map((c) => `<button class="swatch" style="--c:${c.hex}" data-colour="${c.id}" title="${c.name}" aria-label="${c.name}"></button>`).join('')}</div>
          <p class="muted small colour-note" id="colourNote"></p>
        </div>

        ${fitChoice ? `
        <div class="opt-group">
          <div class="opt-label">Fit</div>
          <div class="seg seg-sm" role="radiogroup" aria-label="Fit">
            <button role="radio" data-fit="men">Men’s cut</button><button role="radio" data-fit="women">Women’s cut</button>
          </div>
        </div>` : ''}

        <div class="opt-group">
          <div class="opt-label">Size <b id="sizeName"></b></div>
          <div class="sizes">${p.sizes.map((s) => `<button class="size" data-size="${s}">${s}</button>`).join('')}</div>
          <div id="sizeChart"></div>
        </div>

        <div class="opt-group" id="embGroup" hidden>
          <label class="opt-label" for="embInput">Name embroidery <span class="muted small">up to 15 letters</span></label>
          <input id="embInput" class="input" maxlength="15" placeholder="e.g. DR. RAHMAN" autocomplete="off" />
        </div>

        <div class="buy-actions">
          <div class="qty"><button data-q="-1" aria-label="Decrease">−</button><span id="qty">1</span><button data-q="1" aria-label="Increase">+</button></div>
          <button class="btn btn-primary grow" id="addBag">Add to bag</button>
        </div>
        <a class="btn btn-ghost full" href="${FACEBOOK_URL}" target="_blank" rel="noopener">Order via Facebook</a>

        <ul class="features">${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <div class="accordion">
          <details><summary>Delivery &amp; returns</summary><p>Nationwide delivery across Bangladesh. Delivery charges, timelines and the exchange policy will be published when online ordering launches.</p></details>
          <details><summary>Care</summary><p>Machine wash cold with similar colours. Do not bleach. Tumble dry low or line dry. Warm iron if needed.</p></details>
        </div>
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="section-head"><div><h2 class="h-sm">You may also like</h2></div></div>
    <div class="grid products-grid">${related.map((x) => card(x, state.fit)).join('')}</div>
  </section>`;

  const viewerEl = $('#pdpViewer');
  const stageAlt = $('#stageAlt');
  let viewer;
  const v = () => variant(p, state.colour, state.fit);

  const renderChart = () => {
    const key = p.chart && (p.chart[state.fit] || Object.values(p.chart)[0]);
    const c = key && SIZE_CHARTS[key];
    if (!c) { $('#sizeChart').innerHTML = ''; return; }
    $('#sizeChart').innerHTML = `
      <div class="size-inline">
        <div class="si-head"><span>${c.title} measurements <span class="muted">(inches)</span></span>
          <details class="htm"><summary>How to measure</summary><p><b>Chest</b> around the fullest part, under the arms. <b>Length</b> from the highest shoulder point to the hem. <b>Sleeve</b> from shoulder seam to cuff. <b>Waist</b> elastic, with drawstring.</p></details>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th></th>${c.sizes.map((s) => `<th data-s="${s}">${s}</th>`).join('')}</tr></thead>
          <tbody>${c.rows.map(([l, ...vals]) => `<tr><th>${l}</th>${vals.map((x, i) => `<td data-s="${c.sizes[i]}">${x == null ? '<span class="tbc">TBC</span>' : x}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>
      </div>`;
    highlightSize();
  };
  const highlightSize = () => $$('#sizeChart [data-s]').forEach((el) => el.classList.toggle('sel', el.dataset.s === state.size));

  const renderThumbs = () => {
    const views = [
      { id: '360', label: '360°' },
      ...(p.garment.type === 'cap' ? [] : [{ id: 'a0', label: 'Front', angle: 0 }, { id: 'a180', label: 'Back', angle: 180 }]),
      { id: 'flat', label: 'Folded' },
      ...state.colour.photos.map((f, i) => ({ id: `ph${i}`, label: 'Original', photo: f })),
    ];
    if (!views.some((x) => x.id === state.view)) state.view = '360';
    $('#thumbs').innerHTML = views.map((x) => `
      <button class="thumb ${x.id === state.view ? 'active' : ''} ${x.photo ? 'is-photo' : ''}" data-tview="${x.id}" role="tab" aria-label="${x.label}">
        ${x.id === '360' ? '<span class="t360">360°</span>'
          : x.id === 'flat' ? `<img src="${svgURL(flatlaySVG(p, { ...v(), name: state.name.toUpperCase() }))}" alt="" />`
          : x.photo ? `<img src="${IMG}${x.photo}" alt="" loading="lazy" />`
          : `<div class="tstill" ${stillAttrs(p, state.colour, state.fit, x.angle)}><span class="skeleton"></span></div>`}
        <small>${x.label}</small>
      </button>`).join('');
    $('#thumbs')._views = views;
    hydrateStills($('#thumbs'));
  };
  const showView = (id) => {
    state.view = id;
    $$('.thumb').forEach((t) => t.classList.toggle('active', t.dataset.tview === id));
    const x = $('#thumbs')._views.find((y) => y.id === id);
    if (id === '360') { stageAlt.hidden = true; viewerEl.hidden = false; return; }
    viewerEl.hidden = true; stageAlt.hidden = false;
    if (id === 'flat') stageAlt.innerHTML = `<img src="${svgURL(flatlaySVG(p, { ...v(), name: state.name.toUpperCase() }))}" alt="${p.name} folded" />`;
    else if (x.photo) stageAlt.innerHTML = `<figure class="orig"><img class="photo" src="${IMG}${x.photo}" alt="${p.name} original photo" /><figcaption>Original P53 photo · ${state.colour.name}</figcaption></figure>`;
    else { stageAlt.innerHTML = `<div class="big-still" ${stillAttrs(p, state.colour, state.fit, x.angle)}><span class="spinner"></span></div>`; hydrateStills(stageAlt); }
  };
  const renderSource = () => {
    const ph = state.colour.photos[0];
    $('#sourceCard').innerHTML = ph
      ? `<button class="src-thumb" data-tview="ph0"><img src="${IMG}${ph}" alt="Original ${state.colour.name} photo" /></button>
         <div><b>Modelled from the original photo</b><span>This 3D preview of ${p.name} in ${state.colour.name} is based on P53’s product photo. Tap to compare.</span></div>`
      : `<div class="src-empty">↺</div><div><b>Reference photo coming soon</b><span>This 3D preview is based on the P53 size chart and style. Product photography is coming soon.</span></div>`;
  };

  const applyVariant = (rebuild = true) => {
    $$('.pdp-swatches .swatch').forEach((b) => b.classList.toggle('active', b.dataset.colour === state.colour.id));
    $$('[data-fit]').forEach((b) => { b.classList.toggle('active', b.dataset.fit === state.fit); b.setAttribute('aria-checked', b.dataset.fit === state.fit); });
    $('#colourName').textContent = state.colour.name;
    $('#colourNote').textContent = state.colour.note || '';
    const emb = !!state.colour.embroidery;
    $('#embGroup').hidden = !emb;
    if (!emb) { state.name = ''; $('#embInput').value = ''; }
    renderThumbs(); renderSource(); renderChart();
    if (state.view !== '360') showView(state.view);
    if (rebuild && viewer) { viewer.embroidery = state.name; viewer.setVariant(v()); }
    history.replaceState(null, '', productURL(p, state.colour, state.fit));
  };

  loadViewer().then(({ GarmentViewer }) => {
    if (!document.body.contains(viewerEl)) return;
    try { viewer = new GarmentViewer(viewerEl, p, { ...v(), onAngle: angleUpdater(viewerEl) }); }
    catch (e) { return noWebGL(viewerEl, p, v()); }
    viewerEl.classList.add('loaded');
    onCleanup(() => viewer.dispose());
  });

  const handler = (e) => {
    const t = e.target.closest('[data-tview],[data-snap],[data-colour],[data-fit],[data-size],[data-q]');
    if (!t) return;
    if (t.dataset.tview) showView(t.dataset.tview);
    else if (t.dataset.snap) { showView('360'); viewer?.snapTo(+t.dataset.snap); }
    else if (t.dataset.colour) { state.colour = getColour(p, t.dataset.colour); applyVariant(); }
    else if (t.dataset.fit) { state.fit = t.dataset.fit; applyVariant(); }
    else if (t.dataset.size) { state.size = t.dataset.size; $$('.size').forEach((b) => b.classList.toggle('active', b === t)); $('#sizeName').textContent = state.size; highlightSize(); }
    else if (t.dataset.q) { state.qty = Math.max(1, state.qty + +t.dataset.q); $('#qty').textContent = state.qty; }
  };
  app.addEventListener('click', handler);
  onCleanup(() => app.removeEventListener('click', handler));

  $('#embInput').addEventListener('input', (e) => {
    state.name = e.target.value;
    if (state.view !== '360') showView('360');
    viewer?.setEmbroidery(state.name);
    if (viewer && state.name.length === 1) viewer.snapTo(0);
  });
  $('#addBag').addEventListener('click', () => {
    if (!state.size) { toast('Please select a size first'); $('.sizes').classList.add('shake'); setTimeout(() => $('.sizes').classList.remove('shake'), 500); return; }
    bag.add({ slug: p.slug, colour: state.colour.id, fit: state.fit, size: state.size, qty: state.qty, name: state.name });
    toast('<b>Added to bag.</b> Online checkout is coming soon.');
  });

  applyVariant(false);
  hydrateStills();
}

/* =========================================================
   About / 404
   ========================================================= */
function about() {
  app.innerHTML = `
  <section class="page-head container"><h1>About P53</h1></section>
  <section class="container about">
    <div class="about-copy reveal">
      <p class="lead">P53 is named after the gene that protects the body's cells. We make apparel for the people who protect everyone else.</p>
      <p>From cardiac anaesthesiologists at Chittagong Medical College Hospital to dental teams in Feni, doctors across Bangladesh trust P53 for premium, breathable scrubs that look sharp from the first hour of a shift to the last.</p>
      <a class="btn btn-primary" href="${FACEBOOK_URL}" target="_blank" rel="noopener">Message us on Facebook</a>
    </div>
    <form class="contact reveal" id="contactForm">
      <h3>Contact &amp; bulk orders</h3>
      <label>Name<input class="input" required /></label>
      <label>Phone or email<input class="input" required /></label>
      <label>Hospital / clinic <span class="muted small">(optional)</span><input class="input" /></label>
      <label>Message<textarea class="input" rows="4"></textarea></label>
      <button class="btn btn-primary full">Send message</button>
      <p class="muted small">Demo form. Messaging goes live with the full website.</p>
    </form>
  </section>`;
  $('#contactForm').addEventListener('submit', (e) => { e.preventDefault(); toast('Thanks! The contact form is coming soon. Please message us on Facebook.'); });
  reveal();
}
function notFound() {
  app.innerHTML = `<section class="container page-head"><h1>Page not found</h1><p><a class="btn btn-primary" href="#/shop">Back to shop</a></p></section>`;
}

/* =========================================================
   Bag (demo)
   ========================================================= */
const bag = {
  items: (() => { try { return JSON.parse(localStorage.getItem('p53bag2') || '[]'); } catch { return []; } })(),
  save() { try { localStorage.setItem('p53bag2', JSON.stringify(this.items)); } catch {} this.render(); },
  add(i) { this.items.push(i); this.save(); },
  remove(idx) { this.items.splice(idx, 1); this.save(); },
  render() {
    const items = this.items.filter((i) => getProduct(i.slug));
    $('#bagCount').textContent = items.reduce((n, i) => n + i.qty, 0);
    $('#bagCount').classList.toggle('show', items.length > 0);
    $('#bagBody').innerHTML = items.length
      ? `${items.map((i, idx) => {
          const p = getProduct(i.slug); const c = getColour(p, i.colour);
          return `<div class="bag-item"><img src="${svgURL(flatlaySVG(p, variant(p, c, i.fit)))}" alt=""/><div><b>${p.name}</b><span>${c.name} · ${i.size} · Qty ${i.qty}${i.name ? ` · “${i.name}”` : ''}</span><span class="price tba">${formatPrice(p)}</span></div><button class="link" data-remove="${idx}">Remove</button></div>`;
        }).join('')}
        <div class="bag-foot"><p>Checkout &amp; payment are <b>coming soon</b>.</p><a class="btn btn-primary full" href="${FACEBOOK_URL}" target="_blank" rel="noopener">Order via Facebook</a></div>`
      : `<div class="bag-empty"><p>Your bag is empty.</p><a href="#/shop" class="btn btn-primary">Start shopping</a></div>`;
  },
};

/* =========================================================
   Header: single Shop menu (scales to any number of categories)
   ========================================================= */
function shopMenu() {
  const col = (g, img) => {
    const cats = CATEGORIES.filter((c) => forGender(g).some((p) => p.category === c.id));
    return `
    <div class="sm-col">
      <a class="sm-img" href="#/shop?for=${g}"><img src="${IMG}${img}" alt="" /></a>
      <div class="sm-links">
        <h5>${g === 'women' ? 'Women' : 'Men'}</h5>
        <a class="sm-all" href="#/shop?for=${g}">Shop all ${g}</a>
        ${cats.map((c) => `<a href="#/shop?for=${g}&category=${c.id}">${c.name}</a>`).join('')}
      </div>
    </div>`;
  };
  return `<div class="sm-inner container">${col('women', 'women-portrait.jpg')}${col('men', 'men-portrait.jpg')}
    <div class="sm-col sm-side"><h5>Featured</h5><a href="#/product/premium-scrub-set">Premium Scrub Set</a><a href="#/product/three-quarter-sleeve-set?color=white">Name embroidery</a><a href="#/" data-goto-studio>360° Fit Studio</a><a href="#/shop">All products</a></div></div>`;
}

function initHeader() {
  const menu = $('#shopMenu');
  menu.innerHTML = shopMenu();
  const trigger = $('.nav-shop');
  let t;
  const open = () => { clearTimeout(t); menu.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); };
  const close = () => { t = setTimeout(() => { menu.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }, 140); };
  trigger.addEventListener('mouseenter', open); trigger.addEventListener('mouseleave', close);
  trigger.addEventListener('focus', open);
  menu.addEventListener('mouseenter', open); menu.addEventListener('mouseleave', close);
  menu.addEventListener('click', () => menu.classList.remove('open'));

  $('#drawerNav').innerHTML = `
    <a href="#/">Home</a>
    <details open><summary>Women</summary><a href="#/shop?for=women">Shop all women</a>${CATEGORIES.filter((c) => forGender('women').some((p) => p.category === c.id)).map((c) => `<a href="#/shop?for=women&category=${c.id}">${c.name}</a>`).join('')}</details>
    <details><summary>Men</summary><a href="#/shop?for=men">Shop all men</a>${CATEGORIES.filter((c) => forGender('men').some((p) => p.category === c.id)).map((c) => `<a href="#/shop?for=men&category=${c.id}">${c.name}</a>`).join('')}</details>
    <a href="#/" data-goto-studio>Fit Studio</a>
    <a href="#/about">About &amp; Contact</a>`;

  const closeAll = () => {
    $$('.drawer, .search-overlay').forEach((d) => { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); });
    document.body.classList.remove('locked');
  };
  const openEl = (el) => { closeAll(); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.classList.add('locked'); };

  document.addEventListener('click', (e) => {
    const studio = e.target.closest('[data-goto-studio]');
    if (studio) {
      e.preventDefault(); closeAll(); menu.classList.remove('open');
      const go = () => $('#studio')?.scrollIntoView({ behavior: 'smooth' });
      if (document.body.dataset.page === 'home') go(); else { location.hash = '#/'; setTimeout(go, 400); }
      return;
    }
    const a = e.target.closest('[data-action]');
    if (a) {
      const act = a.dataset.action;
      if (act === 'menu') openEl($('#mobileMenu'));
      if (act === 'bag') openEl($('#bagDrawer'));
      if (act === 'search') { openEl($('#search')); setTimeout(() => $('#searchInput').focus(), 50); }
      if (act === 'account') toast('Accounts are coming soon.');
      if (act === 'close') closeAll();
      return;
    }
    if (e.target.classList.contains('drawer')) closeAll();
    const rm = e.target.closest('[data-remove]');
    if (rm) bag.remove(+rm.dataset.remove);
    const soon = e.target.closest('[data-soon]');
    if (soon) { e.preventDefault(); toast(`${soon.textContent}: coming soon.`); }
    if (e.target.closest('.drawer a, .search-results a')) closeAll();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAll(); menu.classList.remove('open'); } });

  $('#searchInput').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const hits = [];
    if (q) PRODUCTS.forEach((p) => p.colors.forEach((c) => {
      if (`${p.name} ${c.name} ${catName(p.category)} ${p.gender}`.toLowerCase().includes(q)) hits.push({ p, c });
    }));
    // collapse to one row per product unless the query matched a colour
    const rows = hits.filter((h, i) => hits.findIndex((x) => x.p === h.p) === i || h.c.name.toLowerCase().includes(q));
    $('#searchResults').innerHTML = q
      ? rows.length ? rows.slice(0, 8).map(({ p, c }) => `<a href="${productURL(p, c, fitFor(p, 'all'))}" class="sr"><img src="${svgURL(flatlaySVG(p, variant(p, c, 'men')))}" alt=""/><span><b>${p.name}</b><em>${c.name} · ${catName(p.category)}</em></span></a>`).join('') : '<p class="muted">No results.</p>'
      : `<p class="muted">Try: <a href="#/shop?for=women">Women</a> · <a href="#/product/three-quarter-sleeve-set">Three-quarter</a> · <a href="#/product/premium-scrub-set?color=black">Black</a></p>`;
  });
  $('#searchInput').dispatchEvent(new Event('input'));

  const header = $('#header');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
}

/* =========================================================
   Router
   ========================================================= */
function route() {
  cleanups.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
  cleanups = [];
  $('#shopMenu').classList.remove('open');
  const hash = location.hash.slice(1) || '/';
  if (hash.startsWith('studio')) return;
  const [path, qs] = hash.split('?');
  const params = new URLSearchParams(qs || '');
  // legacy links
  if (params.get('gender')) params.set('for', params.get('gender'));
  const parts = path.split('/').filter(Boolean);
  document.body.dataset.page = parts[0] || 'home';
  if (!parts.length) home();
  else if (parts[0] === 'shop') shop(params);
  else if (parts[0] === 'product') product(parts[1], params);
  else if (parts[0] === 'about') about();
  else if (parts[0] === 'size-guide') { location.replace('#/shop'); return; }
  else notFound();
  window.scrollTo({ top: 0, behavior: 'instant' });
  const p = parts[0] === 'product' && getProduct(parts[1]);
  document.title = p ? `${p.name} | P53` : 'P53 | Premium Scrubs & OT Dresses';
}
window.addEventListener('hashchange', route);

initHeader();
bag.render();
document.fonts?.ready.finally(route) ?? route();
