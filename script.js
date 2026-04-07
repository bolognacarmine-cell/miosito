/* --- PC WORK 2026 - MAIN SCRIPT --- */

// Configuration
const owner = 'bolognacarmine-cell';
const repo = 'miosito';

// Initialize Feather Icons
function initIcons() {
  if (window.feather) {
    feather.replace();
  }
}

// --- INTERSECTION OBSERVER FOR REVEAL ANIMATIONS ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Once revealed, we can stop observing this specific element
      // revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal, .reveal-in, .service-card, .contact-card').forEach(el => {
    revealObserver.observe(el);
  });
}

// --- SCROLL LOGIC ---
function initScroll() {
  const header = document.getElementById('header');
  const btt = document.getElementById('back-to-top');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
      if (btt) btt.style.display = 'flex';
    } else {
      header?.classList.remove('scrolled');
      if (btt) btt.style.display = 'none';
    }
  });

  if (btt) {
    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// --- DYNAMIC CONTENT FETCHING ---

// Fetch Hero Carousel
async function fetchCarousel() {
  const hero = document.getElementById('hero-dynamic-content');
  if (!hero) return;

  try {
    const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/content/gallery.json?t=${Date.now()}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const slide = data.slides[0];
    
    // Process title to add accent to the last word or specific part
    const titleParts = slide.title.split(' ');
    const lastWord = titleParts.pop();
    const processedTitle = `${titleParts.join(' ')} <span class="hero-accent">${lastWord}</span>`;
    
    hero.innerHTML = `
      <div class="hero-wrapper" style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: var(--space-12); align-items: center;">
        <div class="hero-content">
          <div class="badge reveal" style="display: inline-block; padding: 4px 16px; background: var(--pc-blue-100); color: var(--pc-blue-700); border-radius: 99px; font-size: 12px; font-weight: 700; margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">Tech Excellence Since 2005</div>
          <h1 class="reveal" style="font-size: var(--text-hero); font-weight: 800; line-height: 1.1; margin-bottom: 24px; color: var(--text-main);">
            ${processedTitle}
          </h1>
          <p class="reveal" style="font-size: var(--text-lg); color: var(--text-muted); margin-bottom: 32px; max-width: 600px;">
            ${slide.subtitle}
          </p>
          <div class="hero-btns reveal" style="display: flex; gap: 16px;">
            <a href="#contact" class="btn btn-primary">Inizia un Progetto <i data-feather="arrow-right"></i></a>
            <a href="#services" class="btn btn-outline">I Nostri Servizi</a>
          </div>
        </div>
        <div class="hero-visual reveal-in" style="position: relative;">
          <div style="position: absolute; top: -10%; left: -10%; width: 120%; height: 120%; background: var(--pc-blue-200); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; filter: blur(60px); opacity: 0.3; z-index: -1;"></div>
          <img src="${slide.image}" alt="PC Work" style="width: 100%; border-radius: var(--radius-xl); box-shadow: var(--shadow-premium); transition: var(--transition-smooth);" class="hover-rotate">
        </div>
      </div>
    `;
    feather.replace();
    document.querySelectorAll('#hero-dynamic-content .reveal, #hero-dynamic-content .reveal-in').forEach(el => revealObserver.observe(el));
  } catch (e) { 
    console.error("Carousel error", e);
    // Fallback hero statico
    hero.innerHTML = `
      <div class="hero-wrapper" style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: var(--space-12); align-items: center;">
        <div class="hero-content">
          <h1 class="reveal" style="font-size: var(--text-hero); font-weight: 800; line-height: 1.1; margin-bottom: 24px;">Assistenza Informatica <span class="hero-accent">Professionale</span></h1>
          <p class="reveal" style="font-size: var(--text-lg); color: var(--text-muted); margin-bottom: 32px;">Soluzioni hardware e software d'avanguardia a Marcianise.</p>
          <div class="hero-btns reveal" style="display: flex; gap: 16px;">
            <a href="#contact" class="btn btn-primary">Contattaci</a>
          </div>
        </div>
      </div>
    `;
  }
}

// Fetch Vetrina (Products)
async function fetchContent() {
  const grid = document.getElementById('hardwareGrid');
  const vetrinaSection = document.getElementById('vetrina');
  if (!grid || !vetrinaSection) return;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content/prodotti?t=${Date.now()}`);
    if (!res.ok) throw new Error('Fetch failed');
    
    const files = await res.json();
    const productFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.json'));

    if (productFiles.length === 0) {
      vetrinaSection.style.display = 'none';
      return;
    }

    vetrinaSection.style.display = 'block';
    grid.innerHTML = '';

    for (const file of productFiles) {
      try {
        const cRes = await fetch(file.download_url);
        const text = await cRes.text();
        let p;
        
        if (file.name.endsWith('.json')) {
          p = JSON.parse(text);
        } else {
          const m = text.match(/^---([\s\S]*?)---/);
          if (m) {
            p = jsyaml.load(m[1]);
            p.body = text.replace(/^---[\s\S]*?---/, '').trim();
          }
        }
        
        if (p) {
          let imgs = [];
          if (Array.isArray(p.images)) {
            imgs = p.images.map(i => {
              if (Array.isArray(i)) return i[0];
              if (typeof i === 'object') return i.image || Object.values(i)[0];
              return i;
            }).filter(i => typeof i === 'string');
          } else if (p.image) {
            imgs = [p.image];
          }
          
          if (imgs.length === 0) imgs = ['https://via.placeholder.com/400x300?text=No+Image'];

          const cid = `carousel-${Math.random().toString(36).substr(2,9)}`;
          const card = document.createElement('div');
          card.className = 'service-card reveal';
          card.innerHTML = `
            <div id="${cid}" class="relative overflow-hidden" style="height: 200px; border-radius: var(--radius-md); margin-bottom: var(--space-4);">
              <div class="carousel-inner h-full">
                ${imgs.map(img => `<img src="${img}" class="w-full h-full object-cover flex-shrink-0">`).join('')}
              </div>
              ${imgs.length > 1 ? `
                <button onclick="moveC('${cid}', -1)" class="product-carousel-btn" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%;"><i data-feather="chevron-left"></i></button>
                <button onclick="moveC('${cid}', 1)" class="product-carousel-btn" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%;"><i data-feather="chevron-right"></i></button>
              ` : ''}
            </div>
            <h3 style="font-size: var(--text-lg); margin-bottom: 8px;">${p.title || 'Prodotto'}</h3>
            <p style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: 16px; line-clamp: 2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${p.body || ''}</p>
            <div class="flex justify-between items-center">
              <span style="font-weight: 800; color: var(--pc-blue-600);">${p.price || 'P.R.'}</span>
              <a href="https://wa.me/3335920941?text=Interessato a: ${p.title}" class="btn btn-primary" style="padding: 8px 16px; font-size: 12px;">Info</a>
            </div>
          `;
          grid.appendChild(card);
          revealObserver.observe(card);
        }
      } catch (err) { console.error("Error processing file:", file.name, err); }
    }
    feather.replace();
  } catch (e) { 
    console.error("Content fetch error:", e);
    vetrinaSection.style.display = 'none';
  }
}

// Fetch Portfolio
async function fetchPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const fallbackProjects = [
    {
      title: "Road Runner",
      description: "Sito web professionale per Road Runner, specializzato in logistica e trasporti rapidi su moto.",
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
      link: "https://www.road-runner.it"
    },
    {
      title: "DP Cars",
      description: "Piattaforma web elegante per DP Cars, concessionaria auto di lusso e servizi automotive.",
      image: "https://raw.githubusercontent.com/bolognacarmine-cell/miosito/main/images/uploads/dpcars-custom.jpg",
      link: "https://www.dpcars.it"
    },
    {
      title: "Pizzeria La Romana",
      description: "Sito web per Pizzeria La Romana a Marcianise, con menu digitale e prenotazioni online.",
      image: "https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&q=80&w=800",
      link: "https://www.pizzerialaromana.it"
    }
  ];

  const renderProject = (p) => {
    const card = document.createElement('div');
    card.className = 'service-card reveal';
    card.innerHTML = `
      <div class="relative overflow-hidden" style="height: 250px; border-radius: var(--radius-md); margin-bottom: var(--space-4);">
        <img src="${p.image}" class="w-full h-full object-cover transition-smooth hover-rotate" onerror="this.src='https://via.placeholder.com/400x300?text=Portfolio+Image'">
      </div>
      <h3 style="font-size: var(--text-lg); margin-bottom: 8px;">${p.title || 'Progetto'}</h3>
      <p style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: 16px;">${p.description || ''}</p>
      <a href="${p.link || '#'}" target="_blank" class="btn btn-outline w-full" style="font-size: 12px;">Visita Sito</a>
    `;
    grid.appendChild(card);
    revealObserver.observe(card);
  };

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content/portfolio?t=${Date.now()}`);
    if (!res.ok) throw new Error('API failed');
    
    const files = await res.json();
    const portfolioFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.json'));

    if (portfolioFiles.length === 0) throw new Error('No files');

    grid.innerHTML = '';
    for (const file of portfolioFiles) {
      try {
        const cRes = await fetch(file.download_url);
        const text = await cRes.text();
        let p;
        if (file.name.endsWith('.json')) p = JSON.parse(text);
        else {
          const m = text.match(/^---([\s\S]*?)---/);
          if (m) { p = jsyaml.load(m[1]); p.description = text.replace(/^---[\s\S]*?---/, '').trim(); }
        }
        if (p) renderProject(p);
      } catch (e) { console.error("Portfolio item error", e); }
    }
  } catch (e) { 
    console.warn("Using fallback portfolio");
    grid.innerHTML = '';
    fallbackProjects.forEach(renderProject);
  }
  feather.replace();
}

// Carousel Navigation Helper
window.moveC = (id, dir) => {
  const c = document.getElementById(id);
  const inner = c?.querySelector('.carousel-inner');
  if(!c || !inner) return;
  let idx = parseInt(c.dataset.idx || 0);
  idx = (idx + dir + inner.children.length) % inner.children.length;
  c.dataset.idx = idx;
  inner.style.transform = `translateX(-${idx * 100}%)`;
};

// --- INITIALIZATION ---
window.addEventListener('load', () => {
  initIcons();
  initScroll();
  initReveal();
  
  // Dynamic Content
  fetchCarousel();
  fetchContent();
  fetchPortfolio();
});
