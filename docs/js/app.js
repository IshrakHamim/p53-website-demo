import { PRODUCTS, CATEGORIES, COLLECTIONS, SIZE_CHARTS, TESTIMONIALS, FACEBOOK_URL, getProduct, formatPrice } from './data.js';
import { flatlaySVG } from './flatlay.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const IMG = 'img/products/';

// Lazy-load the heavy 3D modules so the first paint is fast.
let viewerMod, heroMod;
const loadViewer = () => (viewerMod ||= import('./viewer.js'));
const loadHero = () => (heroMod ||= import('./hero.js'));

let cleanups = [];
const onCleanup = (fn) => cleanups.push(fn);

/* =========================================================
   Shared UI
   ========================================================= */
const GENDER_LABEL = { men: 'Men', women: 'Women', unisex: 'Men & Women' };
const svgURL = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function card(p) {
  return `
  <article class="card" data-slug="${p.slug}">
    <a href="#/product/${p.slug}" class="card-media">
      <div class="card-img still" data-still="${p.slug}"><span class="skeleton"></span></div>
      <img class="card-img alt" src="${svgURL(flatlaySVG(p))}" alt="" loading="lazy" />
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <span class="chip-360" title="Rotate in 360°"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>360°</span>
    </a>
    <div class="card-body">
      <div class="card-meta"><span>${p.collection}</span><span>${GENDER_LABEL[p.gender]}</span></div>
      <h3><a href="#/product/${p.slug}">${p.name}</a></h3>
      <div class="card-foot">
        <span class="price ${p.price == null ? 'tba' : ''}">${formatPrice(p)}</span>
        <span class="swatches">${(p.variants || [p.color.hex]).slice(0, 5).map((c) => `<i style="--c:${c}"></i>`).join('')}</span>
      </div>
    </div>
  </article>`;
}

// Fill [data-still] placeholders with rendered 3D stills (queued, cached).
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
        const angle = el.dataset.angle != null ? +el.dataset.angle : -28;
        renderStill({ product: p, angle, color: el.dataset.color || undefined }).then((url) => {
          if (!url) url = svgURL(flatlaySVG(p)); // no WebGL: fall back to the generated flat-lay
          const img = new Image();
          img.alt = `${p.name} — 3D render`;
          img.src = url;
          img.onload = () => { el.innerHTML = ''; el.appendChild(img); el.classList.add('ready'); };
        });
      });
    }, { rootMargin: '300px' });
    els.forEach((el) => io.observe(el));
    onCleanup(() => io.disconnect());
  });
}

function noWebGL(el, p) {
  el.classList.add('loaded', 'no-gl');
  el.innerHTML = `<img src="${svgURL(flatlaySVG(p))}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain"/><p class="no-gl-note">3D view needs WebGL. Try a recent browser.</p>`;
}

export function toast(msg) {
  const t = $('#toast');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 3200);
}

// Reveal-on-scroll
function reveal(root = app) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal', root).forEach((el) => io.observe(el));
  onCleanup(() => io.disconnect());
}

/* =========================================================
   Home
   ========================================================= */
function home() {
  const best = ['black-premium-scrub-suit', 'navy-blue-premium-classic-ot-dress', 'lavender-mist-three-quarter-scrub-suit', 'sea-green-premium-ot-dress', 'white-three-quarter-ot-dress', 'maroon-premium-ot-dress', 'ocean-blue-scrub-suit', 'slate-grey-scrub-suit'].map(getProduct);
  const colourProducts = PRODUCTS.filter((p) => p.garment.type === 'suit');
  const studioSet = ['black-premium-scrub-suit', 'navy-blue-premium-classic-ot-dress', 'teal-green-comfort-ot-dress', 'maroon-premium-ot-dress', 'lavender-mist-three-quarter-scrub-suit', 'ocean-blue-scrub-suit', 'white-three-quarter-ot-dress', 'classic-white-coat'].map(getProduct);

  app.innerHTML = `
  <section class="hero" id="hero">
    <div class="hero-canvas" id="heroCanvas"></div>
    <div class="hero-content container">
      <p class="eyebrow"><span class="dot"></span> Medical apparel · Bangladesh</p>
      <h1 class="hero-title">
        <span class="line"><span>Made for comfort.</span></span>
        <span class="line"><span><em>Made for care.</em></span></span>
      </h1>
      <p class="hero-sub">Premium scrubs and OT dresses engineered for long duty hours, and the first in Bangladesh you can rotate in full 360° before you buy.</p>
      <div class="hero-cta">
        <a href="#/shop?gender=women" class="btn btn-primary">Shop Women</a>
        <a href="#/shop?gender=men" class="btn btn-ghost">Shop Men</a>
      </div>
      <a href="#studio" class="hero-hint" data-scroll="studio"><span class="spin360">360°</span> Try the Fit Studio</a>
    </div>
    <div class="hero-stats container">
      <div><b>${PRODUCTS.length}</b><span>Styles</span></div>
      <div><b>M–4XL</b><span>Size range</span></div>
      <div><b>12</b><span>Colours</span></div>
      <div><b>360°</b><span>Every product</span></div>
    </div>
    <div class="scroll-cue" aria-hidden="true"><span></span></div>
  </section>

  <div class="marquee" aria-hidden="true"><div class="marquee-track">
    ${Array(2).fill(['Premium quality fabric', 'Breathable all day', 'Built for long duty hours', 'Functional pockets', 'Name embroidery', 'Designed for doctors', 'Easy care']
      .map((t) => `<span>${t}</span><i>✦</i>`).join('')).join('')}
  </div></div>

  <section class="section container">
    <div class="section-head reveal">
      <div><p class="kicker">Shop by colour</p><h2>Twelve shades of on-duty</h2></div>
      <a href="#/shop" class="link-arrow">View all</a>
    </div>
    <div class="colour-rail reveal">
      ${colourProducts.map((p) => `
        <a class="colour-tile" href="#/product/${p.slug}" style="--c:${p.color.hex}">
          <div class="colour-img" data-still="${p.slug}" data-angle="-18"><span class="skeleton"></span></div>
          <span class="colour-name"><i></i>${p.color.name}</span>
        </a>`).join('')}
    </div>
  </section>

  <section class="section container">
    <div class="section-head reveal"><div><p class="kicker">Shop categories</p><h2>Find your fit</h2></div></div>
    <div class="cat-grid">
      <a href="#/shop?gender=women" class="cat-card big reveal" style="--bg:#e9e6fb">
        <div class="cat-photo"><img src="${IMG}lavender-mist.jpg" alt="Lavender three-quarter scrub" loading="lazy" /></div>
        <div class="cat-copy"><p class="kicker">Women</p><h3>Female cut &amp; three-quarter sleeve</h3><span class="btn btn-sm">Shop Women</span></div>
      </a>
      <a href="#/shop?gender=men" class="cat-card big reveal" style="--bg:#dfeef5">
        <div class="cat-photo"><img src="${IMG}sea-green.jpg" alt="Sea green OT dress" loading="lazy" /></div>
        <div class="cat-copy"><p class="kicker">Men</p><h3>Classic V-neck OT dresses</h3><span class="btn btn-sm">Shop Men</span></div>
      </a>
      ${CATEGORIES.map((c) => {
        const p = PRODUCTS.find((x) => x.categories.includes(c.id));
        return `<a href="#/shop?category=${c.id}" class="cat-card small reveal">
          <div class="cat-still" data-still="${p.slug}" data-angle="-24"><span class="skeleton"></span></div>
          <div><h4>${c.name}</h4><p>${c.blurb}</p></div></a>`;
      }).join('')}
    </div>
  </section>

  <section class="studio" id="studio">
    <div class="container studio-grid">
      <div class="studio-copy reveal">
        <p class="kicker light">P53 Fit Studio</p>
        <h2>See every stitch.<br/><em>From every side.</em></h2>
        <p>Photos only show the front. Our Fit Studio lets doctors drag and spin every P53 garment a full 360°, checking the pockets, the side slits and the back yoke before they order.</p>
        <div class="studio-swatches" role="radiogroup" aria-label="Choose product">
          ${studioSet.map((p, i) => `<button class="swatch ${i === 0 ? 'active' : ''}" style="--c:${p.color.hex}" data-slug="${p.slug}" title="${p.name}" aria-label="${p.name}"></button>`).join('')}
        </div>
        <p class="studio-name" id="studioName">${studioSet[0].name}</p>
        <div class="studio-actions">
          <a href="#/product/${studioSet[0].slug}" class="btn btn-light" id="studioLink">View product</a>
        </div>
      </div>
      <div class="studio-stage reveal">
        <div class="viewer" id="studioViewer">
          <div class="viewer-loading"><span class="spinner"></span></div>
          <div class="drag-hint"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 12h8M8 12l3-3M8 12l3 3M16 12l-3-3M16 12l-3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Drag to rotate</div>
          <div class="angle-dial"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-width="2"/><circle id="dialArc" cx="20" cy="20" r="17" fill="none" stroke="#8cc63f" stroke-width="2.5" stroke-dasharray="0 107" transform="rotate(-90 20 20)" stroke-linecap="round"/></svg><span id="angleVal">0°</span></div>
        </div>
        <div class="view-snaps">
          <button data-snap="0">Front</button><button data-snap="90">Side</button><button data-snap="180">Back</button><button data-snap="270">Side</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="section-head reveal"><div><p class="kicker">Best sellers</p><h2>Loved on every ward</h2></div><a href="#/shop" class="link-arrow">Shop all</a></div>
    <div class="grid products-grid">${best.map(card).join('')}</div>
  </section>

  <section class="section container embroidery reveal">
    <div class="emb-art"><img src="${svgURL(flatlaySVG(getProduct('white-three-quarter-ot-dress'), { name: 'DR. JOYA DEVI' }))}" alt="White OT dress with name embroidery" /></div>
    <div class="emb-copy">
      <p class="kicker">Personalise</p>
      <h2>Your name, <em>embroidered.</em></h2>
      <p>Add up to 15 letters of name embroidery on selected OT dresses and white coats. Type your name on the product page and watch it appear on the 3D garment.</p>
      <a href="#/product/white-three-quarter-ot-dress" class="btn btn-primary">Try it on the 3D model</a>
    </div>
  </section>

  <section class="section heroes">
    <div class="container">
      <div class="section-head reveal"><div><p class="kicker">P53 family</p><h2>Worn by real healthcare heroes</h2></div></div>
      <div class="hero-cards">
        ${TESTIMONIALS.map((t) => `
          <figure class="hcard reveal">
            <img src="${IMG}${t.img}" alt="${t.name} wearing P53" loading="lazy" />
            <figcaption><b>${t.name}</b><span>${t.role}</span><em>Wearing: ${t.product}</em></figcaption>
          </figure>`).join('')}
      </div>
    </div>
  </section>

  <section class="section container perks reveal">
    ${[
      ['M', 'Sizes M to 4XL', 'Generous size range with detailed measurement charts.'],
      ['✦', 'Premium fabric', 'Soft, breathable and long lasting, made for 12-hour shifts.'],
      ['↺', '360° preview', 'Rotate every product before you order. No surprises.'],
      ['✉', 'Bulk orders', 'Outfitting a hospital or clinic? Group pricing coming soon.'],
    ].map(([i, h, p]) => `<div class="perk"><span class="perk-i">${i}</span><h4>${h}</h4><p>${p}</p></div>`).join('')}
  </section>

  <section class="cta-band">
    <div class="container cta-inner reveal">
      <div><h2>Online ordering is coming soon.</h2><p>Until then, message P53 on Facebook to order any product you see here.</p></div>
      <a href="${FACEBOOK_URL}" target="_blank" rel="noopener" class="btn btn-light">Order on Facebook</a>
    </div>
  </section>`;

  // Hero
  loadHero().then(({ initHero }) => {
    if (!$('#heroCanvas')) return;
    onCleanup(initHero($('#heroCanvas')));
  });

  // Fit Studio viewer
  const stage = $('#studioViewer');
  const startStudio = () => loadViewer().then(({ GarmentViewer }) => {
    if (!document.body.contains(stage)) return;
    const arc = $('#dialArc');
    let v;
    try { v = new GarmentViewer(stage, studioSet[0], {
      onAngle: (d) => { $('#angleVal').textContent = `${d}°`; arc.setAttribute('stroke-dasharray', `${(d / 360) * 107} 107`); },
    }); } catch (e) { return noWebGL(stage, studioSet[0]); }
    stage.classList.add('loaded');
    onCleanup(() => v.dispose());
    $$('.studio-swatches .swatch').forEach((b) => b.addEventListener('click', () => {
      $$('.studio-swatches .swatch').forEach((x) => x.classList.toggle('active', x === b));
      const p = getProduct(b.dataset.slug);
      v.setProduct(p);
      $('#studioName').textContent = p.name;
      $('#studioLink').href = `#/product/${p.slug}`;
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
   Shop / listing
   ========================================================= */
function shop(params) {
  const state = {
    gender: params.get('gender') || 'all',
    category: params.get('category') || 'all',
    collection: params.get('collection') || 'all',
    colour: params.get('colour') || 'all',
    size: params.get('size') || 'all',
    sort: params.get('sort') || 'featured',
  };
  const title = state.gender !== 'all' ? GENDER_LABEL[state.gender] : state.category !== 'all' ? CATEGORIES.find((c) => c.id === state.category)?.name : 'All Products';
  const colours = [...new Map(PRODUCTS.map((p) => [p.color.name, p.color.hex])).entries()];
  const sizes = ['M', 'L', 'XL', 'XXL', '3XL', '4XL'];

  const radio = (name, value, label, count) => `
    <label class="opt"><input type="radio" name="${name}" value="${value}" ${state[name] === value ? 'checked' : ''}/><span>${label}</span>${count != null ? `<em>${count}</em>` : ''}</label>`;

  app.innerHTML = `
  <section class="page-head container">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><span>Shop</span></nav>
    <h1>${title}</h1>
    <p class="muted">Every product rendered in 3D. Hover to see the folded set, open to rotate 360°.</p>
  </section>
  <section class="container shop">
    <aside class="filters" id="filters">
      <div class="filters-head"><h3>Filter</h3><button class="link" data-reset>Reset</button></div>
      <details open><summary>Shop for</summary>
        ${radio('gender', 'all', 'Everyone')}${radio('gender', 'women', 'Women')}${radio('gender', 'men', 'Men')}${radio('gender', 'unisex', 'Unisex only')}
      </details>
      <details open><summary>Category</summary>
        ${radio('category', 'all', 'All categories')}
        ${CATEGORIES.map((c) => radio('category', c.id, c.name, PRODUCTS.filter((p) => p.categories.includes(c.id)).length)).join('')}
      </details>
      <details open><summary>Collection</summary>
        ${radio('collection', 'all', 'All collections')}${COLLECTIONS.map((c) => radio('collection', c, c)).join('')}
      </details>
      <details open><summary>Colour</summary>
        <div class="colour-filter">
          <button class="cf ${state.colour === 'all' ? 'active' : ''}" data-colour="all" title="All colours">All</button>
          ${colours.map(([n, h]) => `<button class="cf dot ${state.colour === n ? 'active' : ''}" data-colour="${n}" style="--c:${h}" title="${n}" aria-label="${n}"></button>`).join('')}
        </div>
      </details>
      <details open><summary>Size</summary>
        <div class="size-filter">
          <button class="sf ${state.size === 'all' ? 'active' : ''}" data-size="all">All</button>
          ${sizes.map((s) => `<button class="sf ${state.size === s ? 'active' : ''}" data-size="${s}">${s}</button>`).join('')}
        </div>
      </details>
    </aside>
    <div class="shop-main">
      <div class="shop-bar">
        <button class="btn btn-sm btn-ghost filter-toggle" data-filters>Filters</button>
        <span id="count" class="muted"></span>
        <label class="sort">Sort
          <select id="sort">
            <option value="featured">Featured</option><option value="name">Name A–Z</option><option value="new">Newest</option>
          </select>
        </label>
      </div>
      <div class="grid products-grid" id="grid"></div>
    </div>
  </section>`;

  $('#sort').value = state.sort;

  const apply = () => {
    let list = PRODUCTS.filter((p) => {
      if (state.gender === 'women' && !['women', 'unisex'].includes(p.gender)) return false;
      if (state.gender === 'men' && !['men', 'unisex'].includes(p.gender)) return false;
      if (state.gender === 'unisex' && p.gender !== 'unisex') return false;
      if (state.category !== 'all' && !p.categories.includes(state.category)) return false;
      if (state.collection !== 'all' && p.collection !== state.collection) return false;
      if (state.colour !== 'all' && p.color.name !== state.colour) return false;
      if (state.size !== 'all' && !p.sizes.includes(state.size)) return false;
      return true;
    });
    if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === 'new') list = [...list].reverse();
    $('#grid').innerHTML = list.length ? list.map(card).join('') : `<div class="empty"><h3>No products match</h3><p>Try removing a filter.</p><button class="btn btn-primary" data-reset>Reset filters</button></div>`;
    $('#count').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    // keep the URL shareable without re-rendering
    const q = new URLSearchParams(Object.entries(state).filter(([, v]) => v !== 'all' && v !== 'featured'));
    history.replaceState(null, '', `#/shop${q.toString() ? `?${q}` : ''}`);
    hydrateStills($('#grid'));
  };

  $('#filters').addEventListener('change', (e) => { if (e.target.name) { state[e.target.name] = e.target.value; apply(); } });
  const handler = (e) => {
    const t = e.target.closest('[data-colour],[data-size],[data-reset],[data-filters]');
    if (!t) return;
    if (t.dataset.colour) { state.colour = t.dataset.colour; $$('.cf').forEach((b) => b.classList.toggle('active', b === t)); }
    if (t.dataset.size) { state.size = t.dataset.size; $$('.sf').forEach((b) => b.classList.toggle('active', b === t)); }
    if (t.hasAttribute('data-reset')) { if (location.hash === '#/shop') route(); else location.hash = '#/shop'; return; }
    if (t.hasAttribute('data-filters')) { $('#filters').classList.toggle('open'); return; }
    apply();
  };
  app.addEventListener('click', handler);
  onCleanup(() => app.removeEventListener('click', handler));
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; apply(); });
  apply();
}

/* =========================================================
   Product detail
   ========================================================= */
function product(slug) {
  const p = getProduct(slug);
  if (!p) return notFound();
  const chart = SIZE_CHARTS.find((c) => (p.garment.type === 'coat' ? c.id === 'white-coat' : p.gender === 'women' ? c.id === 'female-scrub' : c.id === 'scrub-suit'));
  const related = PRODUCTS.filter((x) => x.slug !== p.slug && (x.gender === p.gender || x.categories.some((c) => p.categories.includes(c)))).slice(0, 4);

  // Homogeneous gallery: 360° → folded set → front/side/back renders → original campaign photos
  const views = [
    { id: '360', label: '360°' },
    { id: 'flat', label: 'Folded set' },
    ...(p.garment.type !== 'cap' ? [{ id: 'a0', label: 'Front', angle: 0 }, { id: 'a90', label: 'Side', angle: 90 }, { id: 'a180', label: 'Back', angle: 180 }] : [{ id: 'a180', label: 'Back', angle: 180 }]),
    ...p.photos.map((f, i) => ({ id: `ph${i}`, label: 'Campaign', photo: f })),
  ];

  app.innerHTML = `
  <section class="container pdp">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><a href="#/shop?gender=${p.gender === 'unisex' ? 'all' : p.gender}">${GENDER_LABEL[p.gender]}</a><span>/</span><span>${p.name}</span></nav>
    <div class="pdp-grid">
      <div class="gallery">
        <div class="stage" id="stage">
          <div class="viewer" id="pdpViewer">
            <div class="viewer-loading"><span class="spinner"></span></div>
            <div class="drag-hint"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 12h8M8 12l3-3M8 12l3 3M16 12l-3-3M16 12l-3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Drag to rotate 360°</div>
            <div class="angle-dial dark"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-opacity=".15" stroke-width="2"/><circle id="dialArc" cx="20" cy="20" r="17" fill="none" stroke="#29a3d6" stroke-width="2.5" stroke-dasharray="0 107" transform="rotate(-90 20 20)" stroke-linecap="round"/></svg><span id="angleVal">0°</span></div>
            <div class="view-snaps on-stage"><button data-snap="0">Front</button><button data-snap="90">Side</button><button data-snap="180">Back</button></div>
          </div>
          <div class="stage-alt" id="stageAlt" hidden></div>
        </div>
        <div class="thumbs" role="tablist">
          ${views.map((v, i) => `
            <button class="thumb ${i === 0 ? 'active' : ''}" data-view="${v.id}" role="tab" aria-label="${v.label}">
              ${v.id === '360' ? `<span class="t360">360°</span>`
                : v.id === 'flat' ? `<img src="${svgURL(flatlaySVG(p))}" alt="" />`
                : v.photo ? `<img src="${IMG}${v.photo}" alt="" loading="lazy" />`
                : `<div class="tstill" data-still="${p.slug}" data-angle="${v.angle}"><span class="skeleton"></span></div>`}
              <small>${v.label}</small>
            </button>`).join('')}
        </div>
      </div>

      <div class="buy">
        <p class="kicker">${p.collection} · ${GENDER_LABEL[p.gender]}</p>
        <h1>${p.name}</h1>
        <div class="price-row"><span class="price big tba">${formatPrice(p)}</span><span class="muted small">Price to be announced by P53</span></div>
        <p class="desc">${p.description}</p>

        <div class="opt-group">
          <div class="opt-label">Colour: <b id="colourName">${p.color.name}</b></div>
          <div class="pdp-swatches">
            ${(p.variants || [p.color.hex]).map((c, i) => `<button class="swatch ${i === 0 ? 'active' : ''}" style="--c:${c}" data-color="${c}" aria-label="Colour ${i + 1}"></button>`).join('')}
            ${!p.variants ? PRODUCTS.filter((x) => x.slug !== p.slug && x.gender === p.gender && x.garment.sleeve === p.garment.sleeve && x.garment.type === p.garment.type).slice(0, 5).map((x) => `<a class="swatch link" href="#/product/${x.slug}" style="--c:${x.color.hex}" title="${x.name}" aria-label="${x.name}"></a>`).join('') : ''}
          </div>
        </div>

        <div class="opt-group">
          <div class="opt-label">Size: <b id="sizeName">Select</b> <a href="#size-chart" class="link small" data-chart>Size chart</a></div>
          <div class="sizes">${p.sizes.map((s) => `<button class="size" data-size="${s}">${s}</button>`).join('')}</div>
        </div>

        ${p.embroidery ? `
        <div class="opt-group">
          <label class="opt-label" for="embInput">Name embroidery <span class="muted small">(up to 15 letters)</span></label>
          <input id="embInput" class="input" maxlength="15" placeholder="e.g. DR. RAHMAN" autocomplete="off" />
          <p class="muted small">Watch it appear on the 3D garment as you type.</p>
        </div>` : ''}

        <div class="buy-actions">
          <div class="qty"><button data-q="-1" aria-label="Decrease">−</button><span id="qty">1</span><button data-q="1" aria-label="Increase">+</button></div>
          <button class="btn btn-primary grow" id="addBag">Add to bag</button>
        </div>
        <a class="btn btn-ghost full" href="${FACEBOOK_URL}" target="_blank" rel="noopener">Order via Facebook</a>

        <ul class="features">${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>

        <div class="accordion">
          <details open><summary>Details</summary><p>${p.description}</p><p class="muted small">Available sizes: ${p.sizes.join(', ')}.</p></details>
          <details id="size-chart"><summary>Size chart</summary>${chart ? chartTable(chart) : '<p>Free size.</p>'}</details>
          <details><summary>Delivery &amp; returns</summary><p>Nationwide delivery across Bangladesh. Delivery charges, timelines and the exchange policy will be published when online ordering launches.</p></details>
          <details><summary>Care</summary><p>Machine wash cold with similar colours. Do not bleach. Tumble dry low or line dry. Warm iron if needed.</p></details>
        </div>
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="section-head"><div><p class="kicker">You may also like</p><h2>Complete the set</h2></div></div>
    <div class="grid products-grid">${related.map(card).join('')}</div>
  </section>`;

  let viewer, size = null, qty = 1, color = p.color.hex;
  const stageAlt = $('#stageAlt');
  const viewerEl = $('#pdpViewer');

  loadViewer().then(({ GarmentViewer }) => {
    if (!document.body.contains(viewerEl)) return;
    const arc = $('#dialArc');
    try { viewer = new GarmentViewer(viewerEl, p, {
      onAngle: (d) => { $('#angleVal').textContent = `${d}°`; arc.setAttribute('stroke-dasharray', `${(d / 360) * 107} 107`); },
    }); } catch (e) { return noWebGL(viewerEl, p); }
    viewerEl.classList.add('loaded');
    onCleanup(() => viewer.dispose());
  });

  $$('.thumb').forEach((t) => t.addEventListener('click', () => {
    $$('.thumb').forEach((x) => x.classList.toggle('active', x === t));
    const v = views.find((x) => x.id === t.dataset.view);
    if (v.id === '360') { stageAlt.hidden = true; viewerEl.hidden = false; return; }
    viewerEl.hidden = true; stageAlt.hidden = false;
    if (v.id === 'flat') stageAlt.innerHTML = `<img src="${svgURL(flatlaySVG(p, { color, name: $('#embInput')?.value?.toUpperCase() || '' }))}" alt="${p.name} folded set" />`;
    else if (v.photo) stageAlt.innerHTML = `<img class="photo" src="${IMG}${v.photo}" alt="${p.name} campaign photo" />`;
    else {
      stageAlt.innerHTML = `<div class="big-still" data-still="${p.slug}" data-angle="${v.angle}" ${color !== p.color.hex ? `data-color="${color}"` : ''}><span class="spinner"></span></div>`;
      hydrateStills(stageAlt);
    }
  }));
  $$('[data-snap]').forEach((b) => b.addEventListener('click', () => viewer?.snapTo(+b.dataset.snap)));
  $$('.pdp-swatches button.swatch').forEach((b) => b.addEventListener('click', () => {
    $$('.pdp-swatches button.swatch').forEach((x) => x.classList.toggle('active', x === b));
    color = b.dataset.color;
    viewer?.setColor(color);
  }));
  $$('.size').forEach((b) => b.addEventListener('click', () => {
    $$('.size').forEach((x) => x.classList.toggle('active', x === b));
    size = b.dataset.size; $('#sizeName').textContent = size;
  }));
  $$('[data-q]').forEach((b) => b.addEventListener('click', () => { qty = Math.max(1, qty + +b.dataset.q); $('#qty').textContent = qty; }));
  $('[data-chart]').addEventListener('click', (e) => { e.preventDefault(); const d = $('#size-chart'); d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  const emb = $('#embInput');
  if (emb) emb.addEventListener('input', () => {
    viewer?.setEmbroidery(emb.value);
    // bring the front into view so the name is visible
    if (viewer && emb.value.length === 1) viewer.snapTo(0);
  });
  $('#addBag').addEventListener('click', () => {
    if (!size) { toast('Please select a size first'); $('.sizes').classList.add('shake'); setTimeout(() => $('.sizes').classList.remove('shake'), 500); return; }
    bag.add({ slug: p.slug, size, qty, color, name: emb?.value || '' });
    toast(`<b>Added to bag.</b> Online checkout is coming soon.`);
  });

  hydrateStills();
}

function chartTable(c) {
  return `
  <div class="chart">
    <div class="table-wrap"><table>
      <thead><tr><th>Measurement (inch)</th>${c.sizes.map((s) => `<th>${s}</th>`).join('')}</tr></thead>
      <tbody>${c.rows.map(([label, ...vals]) => `<tr><th>${label}</th>${vals.map((v) => `<td>${v == null ? '<span class="tbc">TBC</span>' : v}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>
    <p class="muted small">Values transcribed from the P53 size chart. Measurements marked TBC will be confirmed by P53.</p>
  </div>`;
}

/* =========================================================
   Size guide / About / 404
   ========================================================= */
function sizeGuide() {
  app.innerHTML = `
  <section class="page-head container">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><span>Size guide</span></nav>
    <h1>Size guide</h1>
    <p class="muted">All measurements are garment measurements in inches. If you are between sizes, we recommend sizing up for comfort on long shifts.</p>
  </section>
  <section class="container size-guide">
    ${SIZE_CHARTS.map((c) => `
      <article class="sg-card reveal">
        <div class="sg-head"><div><h2>${c.title}</h2><p class="muted">${c.note}</p></div><img src="img/charts/${c.img}" alt="Original ${c.title} chart" /></div>
        ${chartTable(c)}
      </article>`).join('')}
    <article class="sg-card how reveal">
      <h2>How to measure</h2>
      <div class="how-grid">
        <div><b>Chest</b><p>Measure around the fullest part of your chest, under the arms, keeping the tape level.</p></div>
        <div><b>Top length</b><p>From the highest point of the shoulder down to the hem.</p></div>
        <div><b>Sleeve</b><p>From the shoulder seam to the end of the sleeve.</p></div>
        <div><b>Waist</b><p>Around your natural waist. Trousers have an elastic waistband with drawstring.</p></div>
      </div>
    </article>
  </section>`;
  reveal();
}

function about() {
  app.innerHTML = `
  <section class="page-head container">
    <nav class="crumbs"><a href="#/">Home</a><span>/</span><span>About</span></nav>
    <h1>About P53</h1>
  </section>
  <section class="container about">
    <div class="about-copy reveal">
      <p class="lead">P53 is named after the gene that protects the body's cells. We make apparel for the people who protect everyone else.</p>
      <p>From cardiac anaesthesiologists at Chittagong Medical College Hospital to dental teams in Feni, doctors across Bangladesh trust P53 for premium, breathable scrubs that look sharp from the first hour of a shift to the last.</p>
      <p>Every OT dress is designed for long duty hours, with functional pockets, a comfortable fit and an embroidered P53 mark. Selected styles can carry your own name.</p>
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
  $('#contactForm').addEventListener('submit', (e) => { e.preventDefault(); toast('Thanks! Contact form is coming soon. Please message us on Facebook.'); });
  reveal();
}

function notFound() {
  app.innerHTML = `<section class="container page-head"><h1>Page not found</h1><p><a class="btn btn-primary" href="#/shop">Back to shop</a></p></section>`;
}

/* =========================================================
   Bag (demo only — kept in memory/localStorage)
   ========================================================= */
const bag = {
  items: (() => { try { return JSON.parse(localStorage.getItem('p53bag') || '[]'); } catch { return []; } })(),
  save() { try { localStorage.setItem('p53bag', JSON.stringify(this.items)); } catch {} this.render(); },
  add(i) { this.items.push(i); this.save(); },
  remove(idx) { this.items.splice(idx, 1); this.save(); },
  render() {
    $('#bagCount').textContent = this.items.reduce((n, i) => n + i.qty, 0);
    $('#bagCount').classList.toggle('show', this.items.length > 0);
    $('#bagBody').innerHTML = this.items.length
      ? `${this.items.map((i, idx) => {
          const p = getProduct(i.slug);
          return `<div class="bag-item"><img src="${svgURL(flatlaySVG(p, { color: i.color }))}" alt=""/><div><b>${p.name}</b><span>Size ${i.size} · Qty ${i.qty}${i.name ? ` · “${i.name}”` : ''}</span><span class="price tba">${formatPrice(p)}</span></div><button class="link" data-remove="${idx}">Remove</button></div>`;
        }).join('')}
        <div class="bag-foot"><p>Checkout &amp; payment are <b>coming soon</b>.</p><a class="btn btn-primary full" href="${FACEBOOK_URL}" target="_blank" rel="noopener">Order via Facebook</a></div>`
      : `<div class="bag-empty"><p>Your bag is empty.</p><a href="#/shop" class="btn btn-primary" data-action="close">Start shopping</a></div>`;
  },
};

/* =========================================================
   Header: mega menu, drawers, search
   ========================================================= */
function megaContent(gender) {
  const list = PRODUCTS.filter((p) => p.gender === gender || p.gender === 'unisex');
  const cats = CATEGORIES.filter((c) => list.some((p) => p.categories.includes(c.id)));
  const cols = [...new Map(list.map((p) => [p.color.name, p.color.hex])).entries()];
  const feature = list.find((p) => p.badge) || list[0];
  return `
  <div class="mega-inner container">
    <div class="mega-col"><h5>Featured</h5>
      <a href="#/shop?gender=${gender}">Shop all ${GENDER_LABEL[gender]}</a>
      <a href="#/shop?gender=${gender}&collection=Premium">Premium collection</a>
      <a href="#/shop?gender=${gender}&category=summer-lite">Summer Lite</a>
      <a href="#/size-guide">Size guide</a>
    </div>
    <div class="mega-col"><h5>Shop by category</h5>${cats.map((c) => `<a href="#/shop?gender=${gender}&category=${c.id}">${c.name}</a>`).join('')}</div>
    <div class="mega-col"><h5>Shop by colour</h5><div class="mega-colours">${cols.map(([n, h]) => `<a href="#/shop?gender=${gender}&colour=${encodeURIComponent(n)}"><i style="--c:${h}"></i>${n}</a>`).join('')}</div></div>
    <a class="mega-feature" href="#/product/${feature.slug}">
      <img src="${IMG}${feature.photos[0]}" alt="${feature.name}" />
      <span>${feature.name}</span>
    </a>
  </div>`;
}

function initHeader() {
  const mega = $('#mega');
  let closeT;
  $$('.has-mega').forEach((item) => {
    const open = () => { clearTimeout(closeT); mega.innerHTML = megaContent(item.dataset.mega); mega.classList.add('open'); mega.setAttribute('aria-hidden', 'false'); };
    item.addEventListener('mouseenter', open);
    item.addEventListener('focusin', open);
    item.addEventListener('mouseleave', () => (closeT = setTimeout(() => mega.classList.remove('open'), 160)));
  });
  mega.addEventListener('mouseenter', () => clearTimeout(closeT));
  mega.addEventListener('mouseleave', () => mega.classList.remove('open'));
  mega.addEventListener('click', () => mega.classList.remove('open'));

  $('#drawerNav').innerHTML = `
    <a href="#/">Home</a>
    <details><summary>Women</summary><a href="#/shop?gender=women">Shop all women</a>${CATEGORIES.map((c) => `<a href="#/shop?gender=women&category=${c.id}">${c.name}</a>`).join('')}</details>
    <details><summary>Men</summary><a href="#/shop?gender=men">Shop all men</a>${CATEGORIES.map((c) => `<a href="#/shop?gender=men&category=${c.id}">${c.name}</a>`).join('')}</details>
    <a href="#/shop?category=three-quarter">Three-Quarter Sleeve</a>
    <a href="#/shop?category=summer-lite">Summer Lite</a>
    <a href="#/shop?category=white-coat">White Coats</a>
    <a href="#/shop?category=caps">Surgical Caps</a>
    <a href="#/size-guide">Size Guide</a>
    <a href="#/about">About &amp; Contact</a>`;

  const closeAll = () => {
    $$('.drawer, .search-overlay').forEach((d) => { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); });
    document.body.classList.remove('locked');
  };
  const openEl = (el) => { closeAll(); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.classList.add('locked'); };

  document.addEventListener('click', (e) => {
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
    if (soon) { e.preventDefault(); toast(`${soon.textContent} — coming soon.`); }
    if (e.target.closest('.drawer a, .search-results a')) closeAll();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  $('#searchInput').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const res = q ? PRODUCTS.filter((p) => `${p.name} ${p.color.name} ${p.collection} ${p.gender} ${p.categories.join(' ')}`.toLowerCase().includes(q)) : [];
    $('#searchResults').innerHTML = q
      ? res.length ? res.map((p) => `<a href="#/product/${p.slug}" class="sr"><img src="${svgURL(flatlaySVG(p))}" alt=""/><span><b>${p.name}</b><em>${p.collection} · ${GENDER_LABEL[p.gender]}</em></span></a>`).join('') : '<p class="muted">No results.</p>'
      : `<p class="muted">Popular: <a href="#/shop?gender=women">Women</a> · <a href="#/shop?category=three-quarter">Three-quarter</a> · <a href="#/product/black-premium-scrub-suit">Black premium</a></p>`;
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
  $('#mega').classList.remove('open');
  const hash = location.hash.slice(1) || '/';
  if (hash.startsWith('studio')) return; // in-page anchor
  const [path, qs] = hash.split('?');
  const params = new URLSearchParams(qs || '');
  const parts = path.split('/').filter(Boolean);
  document.body.dataset.page = parts[0] || 'home';
  if (!parts.length) home();
  else if (parts[0] === 'shop') shop(params);
  else if (parts[0] === 'product') product(parts[1]);
  else if (parts[0] === 'size-guide') sizeGuide();
  else if (parts[0] === 'about') about();
  else notFound();
  window.scrollTo({ top: 0, behavior: 'instant' });
  const p = parts[0] === 'product' && getProduct(parts[1]);
  document.title = p ? `${p.name} — P53` : 'P53 — Premium Scrubs & OT Dresses';
}

window.addEventListener('hashchange', route);

initHeader();
bag.render();
document.fonts?.ready.finally(route) ?? route();
