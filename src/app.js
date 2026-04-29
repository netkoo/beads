// ==============================
// DATA & STATE
// ==============================
const COLORS = [
    '#c4623a', '#c9a84c', '#7a8c6e', '#5c3d2e', '#3d6e8c',
    '#8c3d6e', '#1a1410', '#a3b899', '#e8c97a', '#6e3d8c',
    '#d4a5a5', '#4a7c8c', '#e07b39', '#2e5c3d', '#8c6b3d',
];

const PALETTE_BG = [
    ['#e8d5b7', '#c9a84c'], ['#d4c5b0', '#8c6b3d'], ['#b5c4b1', '#7a8c6e'],
    ['#c5b5d4', '#6e3d8c'], ['#b5c5d4', '#3d6e8c'], ['#d4b5b5', '#8c3d3d'],
    ['#d4c5b5', '#c4623a'], ['#b5d4b5', '#2e5c3d'],
];

let products = [];
let activeFilter = 'semua';
let selectedColors = [];

// ==============================
// LOCALSTORAGE
// ==============================
const CATALOG_VERSION = 'v3-img';
function save() {
    localStorage.setItem('manik_products', JSON.stringify(products));
    localStorage.setItem('manik_version', CATALOG_VERSION);
}
function load() {
    const ver = localStorage.getItem('manik_version');
    if (ver !== CATALOG_VERSION) { localStorage.removeItem('manik_products'); return; }
    const d = localStorage.getItem('manik_products');
    if (d) products = JSON.parse(d);
}

// ==============================
// SVG BEAD ILLUSTRATIONS
// ==============================
function beadSVG(colors, shape = 'round') {
    const [bg, accent] = colors || ['#c9a84c', '#f5f0e8'];
    const shapes = {
        round: `
      <circle cx="80" cy="70" r="42" fill="${bg}" />
      <circle cx="80" cy="70" r="42" fill="url(#gloss)" />
      <ellipse cx="65" cy="52" rx="12" ry="7" fill="white" opacity="0.25" transform="rotate(-30,65,52)" />
      <circle cx="80" cy="70" r="42" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>`,
        faceted: `
      <polygon points="80,28 122,52 122,88 80,112 38,88 38,52" fill="${bg}" />
      <polygon points="80,28 122,52 122,88 80,112 38,88 38,52" fill="url(#gloss)" />
      <polygon points="80,28 122,52 80,70" fill="white" opacity="0.15"/>
      <polygon points="80,28 122,52 122,88 80,112 38,88 38,52" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>`,
        barrel: `
      <ellipse cx="80" cy="70" rx="38" ry="28" fill="${bg}" />
      <ellipse cx="80" cy="70" rx="38" ry="28" fill="url(#gloss)" />
      <ellipse cx="65" cy="58" rx="10" ry="6" fill="white" opacity="0.25" transform="rotate(-15,65,58)"/>
      <ellipse cx="80" cy="70" rx="38" ry="28" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>`,
        bicone: `
      <polygon points="80,28 118,70 80,112 42,70" fill="${bg}" />
      <polygon points="80,28 118,70 80,112 42,70" fill="url(#gloss)" />
      <polygon points="80,28 118,70 80,70 42,70" fill="white" opacity="0.12"/>
      <polygon points="80,28 118,70 80,112 42,70" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>`,
    };
    const s = shapes[shape] || shapes.round;
    return `<svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gloss" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stop-color="white" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.15"/>
      </radialGradient>
    </defs>
    ${s}
  </svg>`;
}

function cardImageHTML(p, idx) {
    if (p.image) {
        return `<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
      <div class="card-image-fallback" style="display:none;">${cardSVGFallback(p, idx)}</div>`;
    }
    return `<div class="card-image-fallback">${cardSVGFallback(p, idx)}</div>`;
}
function cardSVGFallback(p, idx) {
    const pal = p.palette || PALETTE_BG[idx % PALETTE_BG.length];
    const shape = p.shape || 'round';
    const [bg, accent] = pal;
    const svgBody = beadSVG([bg, accent], shape);
    const bgColor = bg + '22';
    return `<div style="background:${bgColor};width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:1.5rem;">${svgBody}</div>`;
}

// ==============================
// HERO BEADS
// ==============================
function renderHeroBeads() {
    const shapes = ['round', 'faceted', 'barrel', 'bicone', 'round', 'faceted', 'barrel', 'bicone'];
    const el = document.getElementById('hero-beads');
    el.innerHTML = PALETTE_BG.map((p, i) => {
        const [bg, ac] = p;
        return `<div class="bead-swatch" style="background:${bg};background:radial-gradient(circle at 35% 35%, ${ac}55, ${bg});box-shadow:0 8px 24px ${bg}88, inset 0 -3px 8px rgba(0,0,0,0.15), inset 0 3px 8px rgba(255,255,255,0.35);"></div>`;
    }).join('');
}

function openImage(src) {
    const modal = document.getElementById('imgModal');
    const img = document.getElementById('imgModalSrc');

    img.src = src;

    // reset dulu
    modal.classList.remove('zoom');

    // trigger reflow biar animasi jalan ulang
    modal.style.display = 'flex';
    void modal.offsetWidth;

    modal.classList.add('open');
}

function closeImg() {
    const modal = document.getElementById('imgModal');

    modal.classList.remove('open', 'zoom');

    setTimeout(() => {
        modal.style.display = 'none';
    }, 200);
}

function closeImgModal(e) {
    if (e.target.id === 'imgModal') {
        closeImg();
    }
}

// zoom toggle
document.addEventListener('click', (e) => {
    if (e.target.id === 'imgModalSrc') {
        document.getElementById('imgModal').classList.toggle('zoom');
    }
});

// ==============================
// RENDER CATALOG
// ==============================
function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    const q = document.getElementById('search-input').value.toLowerCase();
    let visible = products.filter(p => {
        const matchFilter = activeFilter === 'semua' || p.category === activeFilter;
        const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    if (visible.length === 0) {
        grid.innerHTML = `<div class="empty-state"><p>Belum ada produk</p><small>Stay Tune!!!</small></div>`;
        return;
    }

    grid.innerHTML = visible.map((p, i) => {
        const badge = p.badge ? `<span class="card-tag ${p.badge}">${p.badge === 'new' ? 'Baru' : 'Sale'}</span>` : '';
        const colorDots = (p.colors || []).map(c => `<div class="color-dot" style="background:${c}"></div>`).join('');
        const price = parseInt(p.price || 0).toLocaleString('id-ID');
        return `
    <div class="product-card" style="animation-delay:${i * 0.05}s" onclick="openImage('${p.image}')">
      <div class="card-image">
        ${cardImageHTML(p, i)}
        ${badge}
      </div>
      <div class="card-body">
        <div class="card-cat">${catLabel(p.category)} ${p.origin ? '· ' + p.origin : ''}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.desc || 'Manik berkualitas tinggi, cocok untuk berbagai kerajinan tangan.'}</div>
        <div class="card-footer">
          <div class="card-colors">${colorDots}</div>
        </div>
        ${p.stock ? `<div style="font-size:0.6rem;color:var(--muted);margin-top:0.5rem;letter-spacing:0.05em;">Stok: ${p.stock}</div>` : ''}
      </div>
    </div>`;
    }).join('');
    // footer : <div class="card-price">Rp ${price}</div>
}

function catLabel(c) {
    return { bbeads: 'Bracelet Beads', naturalstone: 'Natural Stone', bagcharm: 'Bagcharm', strap: 'Strap Phone', wbeads: 'Watch Beads' }[c] || c;
}

// ==============================
// FILTERS
// ==============================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderCatalog();
    });
});
document.getElementById('search-input').addEventListener('input', renderCatalog);

// ==============================
// MODAL
// ==============================
function openModal() {
    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    renderColorPicker();
    selectedColors = [];
}
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
    resetForm();
}
function closeModalOutside(e) {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function renderColorPicker() {
    const row = document.getElementById('color-picker');
    row.innerHTML = COLORS.map(c => `
    <div class="color-swatch-opt" style="background:${c}" data-color="${c}" onclick="toggleColor(this,'${c}')"></div>
  `).join('');
}

function toggleColor(el, c) {
    if (selectedColors.includes(c)) {
        selectedColors = selectedColors.filter(x => x !== c);
        el.classList.remove('selected');
    } else {
        selectedColors.push(c);
        el.classList.add('selected');
    }
}

function previewImage(url) {
    const wrap = document.getElementById('img-preview');
    const img = document.getElementById('img-preview-el');
    if (url && url.startsWith('http')) {
        img.src = url;
        wrap.style.display = 'block';
    } else {
        wrap.style.display = 'none';
    }
}

// ==============================
// SUBMIT
// ==============================
function submitProduct() {
    const name = document.getElementById('f-name').value.trim();
    const price = document.getElementById('f-price').value;
    if (!name || !price) { alert('Nama dan harga produk wajib diisi.'); return; }

    const shapes = ['round', 'faceted', 'barrel', 'bicone'];
    const paletteIdx = products.length % PALETTE_BG.length;

    const product = {
        id: Date.now(),
        name,
        category: document.getElementById('f-cat').value,
        desc: document.getElementById('f-desc').value.trim(),
        price,
        stock: document.getElementById('f-stock').value.trim(),
        origin: document.getElementById('f-origin').value.trim(),
        badge: document.getElementById('f-badge').value,
        image: document.getElementById('f-image').value.trim(),
        colors: [...selectedColors],
        palette: PALETTE_BG[paletteIdx],
        shape: shapes[products.length % shapes.length],
    };

    products.unshift(product);
    save();
    closeModal();
    renderCatalog();
}

function resetForm() {
    ['f-name', 'f-desc', 'f-price', 'f-stock', 'f-origin', 'f-image'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-cat').selectedIndex = 0;
    document.getElementById('f-badge').selectedIndex = 0;
    document.getElementById('img-preview').style.display = 'none';
    selectedColors = [];
}

// ==============================
// DEFAULT PRODUCTS bbeads:'Bracelet Beads', naturalstone:'Natural Stone', bagcharm:'Bagcharm', strap:'Strap Phone', wbeads:'Watch Beads' </br>
// ==============================
const defaultProducts = [];

// ==============================
// INIT
// ==============================
load();

if (products.length === 0) {
    products = PRODUCTS.map((p, i) => ({
        ...p,
        palette: PALETTE_BG[i % PALETTE_BG.length]
    }));
    save();
}

renderHeroBeads();
renderCatalog();