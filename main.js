// Initialize Feather icons
if (window.feather) {
  feather.replace();
}

// Reveal on Scroll Logic (IntersectionObserver)
const initReveal = () => {
  const revealElements = document.querySelectorAll('.reveal-left, .fade-in-observer');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Use proper classes based on the element
        if (entry.target.classList.contains('reveal-left')) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.add('visible');
        }
        // Stop observing once visible to save performance
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Trigger when 10% is visible
    rootMargin: '0px 0px -50px 0px' // Slightly earlier trigger
  });

  revealElements.forEach(el => revealObserver.observe(el));
};

document.addEventListener('DOMContentLoaded', initReveal);

// Global owner/repo
const owner = 'bolognacarmine-cell';
const repo = 'miosito';

// Professional Carousel Logic
class ProfessionalCarousel {
  constructor(el) {
    this.el = el;
    this.inner = el.querySelector('.pro-carousel-inner');
    this.slides = Array.from(el.querySelectorAll('.pro-carousel-item'));
    this.dots = Array.from(el.querySelectorAll('.pro-dot'));
    this.toggleBtn = el.querySelector('.pro-carousel-toggle');
    this.prevBtn = el.querySelector('.prev');
    this.nextBtn = el.querySelector('.next');
    
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoplayInterval = null;
    this.isPlaying = this.totalSlides > 1;
    this.startX = 0;
    this.isDragging = false;

    if (this.totalSlides <= 1) {
      this.el.classList.add('single-slide');
      return;
    }

    this.init();
  }

  init() {
    // Event Listeners
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());
    this.toggleBtn?.addEventListener('click', () => this.toggleAutoplay());
    
    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this.goTo(i));
    });

    // Touch events for swipe
    this.el.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
    this.el.addEventListener('touchmove', (e) => this.touchMove(e), { passive: true });
    this.el.addEventListener('touchend', () => this.touchEnd());

    // Pause on interaction
    this.el.addEventListener('mouseenter', () => this.pause());
    this.el.addEventListener('mouseleave', () => { if (this.isPlaying) this.start(); });
    this.el.addEventListener('focusin', () => this.pause());

    // Keyboard support
    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    this.start();
    this.updateUI();
  }

  goTo(index) {
    this.currentIndex = (index + this.totalSlides) % this.totalSlides;
    this.inner.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    this.updateUI();
  }

  next() { this.goTo(this.currentIndex + 1); }
  prev() { this.goTo(this.currentIndex - 1); }

  start() {
    this.stop();
    if (this.isPlaying) {
      this.autoplayInterval = setInterval(() => this.next(), 4000);
    }
  }

  stop() {
    if (this.autoplayInterval) clearInterval(this.autoplayInterval);
  }

  pause() { this.stop(); }

  toggleAutoplay() {
    this.isPlaying = !this.isPlaying;
    this.isPlaying ? this.start() : this.stop();
    this.updateToggleIcon();
  }

  updateUI() {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
      dot.setAttribute('aria-selected', i === this.currentIndex);
    });
    this.updateToggleIcon();
  }

  updateToggleIcon() {
    if (!this.toggleBtn) return;
    const icon = this.isPlaying ? 'pause' : 'play';
    this.toggleBtn.innerHTML = `<i data-feather="${icon}" class="w-4 h-4"></i>`;
    if (window.feather) feather.replace();
  }

  touchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
    this.pause();
  }

  touchMove(e) {
    if (!this.isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = this.startX - currentX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? this.next() : this.prev();
      this.isDragging = false;
    }
  }

  touchEnd() {
    this.isDragging = false;
    if (this.isPlaying) this.start();
  }
}

// Global registry for carousels
const carouselRegistry = new Map();

// Helper to handle image paths (especially from CMS)
const processImagePath = (path) => {
  if (!path) return 'https://via.placeholder.com/400x300?text=Immagine+non+disponibile';
  if (path.startsWith('http')) return path;
  
  // Rendi il percorso relativo alla root se non lo è
  let cleanPath = path.startsWith('/') ? path : '/' + path;
  
  // Se è un'immagine caricata dal CMS, prova a caricarla da GitHub per sincronizzazione immediata
  // ma gestisci anche il caso in cui il percorso nel JSON sia già corretto per il sito statico
  if (cleanPath.startsWith('/images/uploads/')) {
    // Prova prima il percorso locale (che funzionerà dopo il deploy)
    // Ma per lo sviluppo/anteprima immediata usiamo GitHub
    return `https://raw.githubusercontent.com/${owner}/${repo}/main${cleanPath}`;
  }
  return cleanPath;
};

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      if (mobileMenu) mobileMenu.classList.add('hidden');
    }
  });
});

// Back to top button + nav glass on scroll
const backToTopBtn = document.getElementById('back-to-top');
const navEl = document.querySelector('nav');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 50) {
    if (backToTopBtn) {
      backToTopBtn.classList.remove('opacity-0', 'invisible');
      backToTopBtn.classList.add('opacity-100', 'visible');
    }
    navEl?.classList.add('nav-scrolled');
  } else {
    if (backToTopBtn) {
      backToTopBtn.classList.add('opacity-0', 'invisible');
      backToTopBtn.classList.remove('opacity-100', 'visible');
    }
    navEl?.classList.remove('nav-scrolled');
  }
});

backToTopBtn?.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Intersection Observer for animations
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.classList.add('animate-fade-in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

const initObservers = () => {
  document.querySelectorAll('.fade-in-observer, .service-card, .contact-card, .reveal, .reveal-in, .about-photo').forEach(el => {
    revealObserver.observe(el);
  });
};

// Carousel Logic
let heroSlides = [];
let currentHeroSlide = 0;
let heroInterval;

const renderHeroSlide = (index) => {
  const hero = document.getElementById('hero-dynamic-content');
  if (!hero || heroSlides.length === 0) return;
  
  const slide = heroSlides[index];
  
  const content = hero.querySelector('.hero-wrapper');
  if (content) {
    content.classList.remove('animate-ui-reveal');
    content.style.opacity = '0';
  }

  setTimeout(() => {
    const titleParts = slide.title.split(' ');
    const lastWord = titleParts.pop();
    const processedTitle = `${titleParts.join(' ')} <span class="hero-accent">${lastWord}</span>`;

    hero.innerHTML = `
      <div class="hero-wrapper flex flex-col lg:flex-row gap-10 lg:gap-16 items-center animate-ui-reveal">
        <div class="hero-content lg:w-3/5">
          <div class="badge reveal inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-bold mb-6 tracking-wider uppercase">
            <span class="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Tech Excellence Since 2005</span>
          </div>
          <h1 class="reveal text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-8 bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            ${processedTitle}
          </h1>
          <p class="reveal text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed">
            ${slide.subtitle}
          </p>
          <div class="hero-btns reveal flex flex-wrap gap-5">
            <a href="#contact" class="bg-pc-blue-600 text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-orange-600/20 hover:bg-pc-blue-700 hover:-translate-y-1 transition-all flex items-center group">
              <i data-feather="phone" class="mr-3 w-5 h-5 group-hover:rotate-12 transition-transform"></i>
              Chiama ora
            </a>
            <a href="#services" class="bg-slate-900 text-slate-200 border border-slate-700 px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center justify-center">
              I nostri servizi
            </a>
          </div>
          <div class="mt-12 flex gap-3">
            ${heroSlides.map((_, i) => `
              <div onclick="goToHeroSlide(${i})" class="h-1.5 rounded-full cursor-pointer transition-all duration-500 ${i === index ? 'bg-orange-500 w-10' : 'bg-slate-800 w-4 hover:bg-slate-700'}"></div>
            `).join('')}
          </div>
        </div>
        <div class="hero-visual lg:w-2/5 reveal-in relative">
          <div class="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 group">
            <img src="${processImagePath(slide.image)}" alt="PC Work" class="w-full h-auto transform group-hover:scale-105 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
          </div>
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/20 blur-[80px] rounded-full"></div>
          <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>
        </div>
      </div>
    `;
    feather.replace();
    document.querySelectorAll('#hero-dynamic-content .reveal, #hero-dynamic-content .reveal-in').forEach(el => revealObserver.observe(el));
  }, 300);
};

window.goToHeroSlide = (index) => {
  currentHeroSlide = index;
  renderHeroSlide(currentHeroSlide);
  resetHeroInterval();
};

const resetHeroInterval = () => {
  if (heroInterval) clearInterval(heroInterval);
  if (heroSlides.length > 1) {
    heroInterval = setInterval(() => {
      currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
      renderHeroSlide(currentHeroSlide);
    }, 6000);
  }
};

async function fetchCarousel() {
  const hero = document.getElementById('hero-dynamic-content');
  if (!hero) return;
  
  try {
    // Fetch from local site to ensure sync with deployed images
    const res = await fetch(`/content/gallery.json?t=${Date.now()}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    heroSlides = data.slides || [];
    
    if (heroSlides.length > 0) {
      renderHeroSlide(0);
      resetHeroInterval();
    }
  } catch (e) { 
    console.error("Carousel error", e);
  }
}

async function fetchContentList(type) {
  try {
    const res = await fetch(`/api/content/list?type=${encodeURIComponent(type)}&t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch (e) {
    return [];
  }
}

const setAnchorVisibility = (hash, visible) => {
  const anchors = document.querySelectorAll(`a[href="${hash}"]`);
  anchors.forEach((a) => {
    const wrapper = a.closest('li');
    const target = wrapper || a;
    target.style.display = visible ? '' : 'none';
  });
};

const removeSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.remove();
  setAnchorVisibility(`#${id}`, false);
};

const showSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
  setAnchorVisibility(`#${id}`, true);
};

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

async function fetchContent() {
  const grid = document.getElementById('hardwareGrid');
  const vetrinaSection = document.getElementById('vetrina');
  if (!grid || !vetrinaSection) return;

  try {
    const products = await fetchContentList('prodotti');
    const visibleProducts = Array.isArray(products)
      ? products.filter((p) => p && p.featured !== false && isNonEmptyString(p.title))
      : [];

    if (visibleProducts.length === 0) {
      removeSection('vetrina');
      return;
    }

    showSection('vetrina');
    grid.innerHTML = '';

    for (const product of visibleProducts) {
      
      if (!product) continue;
      
      let imageList = [];

      if (product.images && Array.isArray(product.images)) {
        imageList = product.images.map(img => {
          const path = typeof img === 'string' ? img : (img.url || img.image);
          return processImagePath(path);
        });
      } else if (product.image) {
        imageList = [processImagePath(product.image)];
      } else {
        imageList = ['https://via.placeholder.com/400x300?text=Immagine+non+disponibile'];
      }
      
      const carouselId = `carousel-${Math.random().toString(36).substr(2, 9)}`;
      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 service-card fade-in-observer visible';
      
      const hasMultipleImages = imageList.length > 1;
      
      const imageSection = `
        <div id="${carouselId}" class="pro-carousel ${!hasMultipleImages ? 'single-slide' : ''}" role="region" aria-label="Galleria immagini ${product.title}">
          <div class="pro-carousel-inner">
            ${imageList.map(img => `
              <div class="pro-carousel-item">
                <img src="${img}" loading="lazy" alt="${product.title}" onerror="this.src='https://via.placeholder.com/400x300?text=Errore+caricamento'">
              </div>
            `).join('')}
          </div>
          
          <button class="pro-carousel-btn prev" aria-label="Immagine precedente">
            <i data-feather="chevron-left"></i>
          </button>
          <button class="pro-carousel-btn next" aria-label="Immagine successiva">
            <i data-feather="chevron-right"></i>
          </button>
          
          <button class="pro-carousel-toggle" aria-label="Play/Pausa carosello">
            <i data-feather="pause"></i>
          </button>
          
          <div class="pro-carousel-dots" role="tablist">
            ${imageList.map((_, i) => `
              <button class="pro-dot" role="tab" aria-label="Vai a immagine ${i+1}" aria-selected="${i === 0}"></button>
            `).join('')}
          </div>
        </div>
      `;

      card.innerHTML = `
        ${imageSection}
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <span class="text-[10px] font-bold tracking-widest uppercase bg-pc-blue-100 dark:bg-blue-900/40 text-pc-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">${product.category || 'Hardware'}</span>
            <span class="text-xl font-black text-pc-blue-600 dark:text-blue-400">${product.price || 'P.R.'}</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">${product.title}</h3>
          <p class="text-gray-600 dark:text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">${product.body || ''}</p>
          <a href="https://wa.me/3335920941?text=Ciao,%20sono%20interessato%20a:%20${encodeURIComponent(product.title)}" 
             class="w-full block bg-pc-blue-600 hover:bg-pc-blue-700 text-white text-center py-3 rounded-xl font-bold shadow-lg hover:shadow-pc-blue-500/30 transition-all duration-300 transform active:scale-95">
            Richiedi Info
          </a>
        </div>
      `;
      grid.appendChild(card);
      
      // Initialize the professional carousel for this card
      if (hasMultipleImages) {
        carouselRegistry.set(carouselId, new ProfessionalCarousel(card.querySelector('.pro-carousel')));
      }
    }
    if (window.feather) feather.replace();
  } catch (error) {
    console.error('Errore nel caricamento dei contenuti:', error);
    removeSection('vetrina');
  }
}

// Old carousel logic removed
// window.moveProductCarousel = function(id, direction) { ... }

window.acceptCookies = function() {
  localStorage.setItem('cookies-accepted', 'true');
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.transform = 'translateY(100%)';
  }
};

async function fetchOfferte() {
  const grid = document.getElementById('offerteGrid');
  const offerteSection = document.getElementById('offerte');
  if (!grid || !offerteSection) return;

  try {
    const offers = await fetchContentList('offerte');
    const visibleOffers = Array.isArray(offers)
      ? offers.filter((o) => o && o.active === true && isNonEmptyString(o.title))
      : [];

    if (visibleOffers.length === 0) {
      removeSection('offerte');
      return;
    }

    showSection('offerte');
    grid.innerHTML = '';

    for (const offer of visibleOffers) {
      
      let imageList = [];
      if (offer.images && Array.isArray(offer.images)) {
        imageList = offer.images.map(img => {
          const path = typeof img === 'string' ? img : (img.url || img.image);
          return processImagePath(path);
        });
      } else if (offer.image) {
        imageList = [processImagePath(offer.image)];
      } else {
        imageList = ['https://via.placeholder.com/400x300?text=Immagine+non+disponibile'];
      }
      
      const carouselId = `carousel-offer-${Math.random().toString(36).substr(2, 9)}`;
      const card = document.createElement('div');
      card.className = 'bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl hover:border-orange-500/50 transition-all duration-500 group';
      
      const hasMultipleImages = imageList.length > 1;
      
      const imageSection = `
        <div id="${carouselId}" class="pro-carousel ${!hasMultipleImages ? 'single-slide' : ''}" style="height: 300px;">
          <div class="pro-carousel-inner">
            ${imageList.map(img => `
              <div class="pro-carousel-item">
                <img src="${img}" class="w-full h-full object-cover" loading="lazy" alt="${offer.title}" onerror="this.src='https://via.placeholder.com/400x300?text=Errore+caricamento'">
              </div>
            `).join('')}
          </div>
          ${hasMultipleImages ? `
          <button class="pro-carousel-btn prev"><i data-feather="chevron-left"></i></button>
          <button class="pro-carousel-btn next"><i data-feather="chevron-right"></i></button>
          <div class="pro-carousel-dots">
            ${imageList.map((_, i) => `<button class="pro-dot ${i === 0 ? 'active' : ''}"></button>`).join('')}
          </div>
          ` : ''}
        </div>
      `;

      card.innerHTML = `
        <div class="flex flex-col md:flex-row h-full">
          <div class="md:w-1/2 relative">
            ${imageSection}
            <div class="absolute top-4 left-4 bg-orange-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Offerta</div>
          </div>
          <div class="md:w-1/2 p-8 flex flex-col">
            <div class="mb-4">
              <h3 class="text-2xl font-black text-white mb-2 uppercase tracking-tight">${offer.title}</h3>
              <p class="text-orange-400 text-sm font-bold">${offer.subtitle || ''}</p>
            </div>
            <div class="text-slate-300 text-sm mb-6 flex-grow prose prose-invert max-w-none">
              ${offer.body || ''}
            </div>
            <div class="flex items-center justify-between mt-auto pt-6 border-t border-slate-700">
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Prezzo Speciale</span>
                <span class="text-3xl font-black text-white">${offer.price || 'P.R.'}</span>
              </div>
              <a href="https://wa.me/3335920941?text=Interessato%20all'offerta:%20${encodeURIComponent(offer.title)}" 
                 class="bg-pc-blue-600 hover:bg-pc-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95">
                Prenota Ora
              </a>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
      
      if (hasMultipleImages) {
        carouselRegistry.set(carouselId, new ProfessionalCarousel(card.querySelector('.pro-carousel')));
      }
    }
    if (window.feather) feather.replace();
  } catch (error) {
    console.error('Errore nel caricamento delle offerte:', error);
    removeSection('offerte');
  }
}

async function fetchServizi() {
  const grid = document.getElementById('servicesGrid');
  const servicesSection = document.getElementById('services');
  if (!grid || !servicesSection) return;

  try {
    const services = await fetchContentList('servizi');
    const visibleServices = Array.isArray(services)
      ? services.filter((s) => s && isNonEmptyString(s.title) && isNonEmptyString(s.body))
      : [];

    if (visibleServices.length === 0) {
      removeSection('services');
      return;
    }

    showSection('services');
    grid.innerHTML = '';

    for (const service of visibleServices) {
      const title = String(service.title || '').trim();
      const body = String(service.body || '').trim();
      const icon = String(service.icon || 'cpu').trim();
      const image = processImagePath(service.image);

      const card = document.createElement('div');
      card.className = 'service-card group relative bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 transition-all duration-500 hover:border-orange-500/50';
      card.innerHTML = `
        <div class="absolute inset-0 z-0">
          <img src="${image}" alt="${title}" class="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>
        <div class="relative z-10 p-8 flex flex-col h-full">
          <div class="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
            <i data-feather="${icon}" class="w-8 h-8 text-orange-500"></i>
          </div>
          <h3 class="text-xl font-black text-white mb-4 uppercase tracking-tight">${title}</h3>
          <p class="text-slate-300 text-sm mb-8 leading-relaxed font-medium">${body}</p>
          <div class="mt-auto">
            <a href="#contact" class="text-orange-500 font-bold hover:text-orange-400 transition-colors inline-flex items-center gap-2 group/link">
              Scopri di più <i data-feather="chevron-right" class="w-4 h-4 group-hover/link:translate-x-1 transition-transform"></i>
            </a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    }

    if (window.feather) feather.replace();
  } catch (e) {
    removeSection('services');
  }
}

// Initialize everything on load
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  initObservers();
  setAnchorVisibility('#services', false);
  setAnchorVisibility('#offerte', false);
  setAnchorVisibility('#vetrina', false);
  fetchServizi();
  fetchContent();
  fetchOfferte();
  fetchCarousel();

  if (!localStorage.getItem('cookies-accepted')) {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      setTimeout(() => {
        banner.style.transform = 'translateY(0)';
      }, 1000);
    }
  }
});

// Netlify Identity
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}

// ------------------------------
// "Voce IA" (TTS) per portfolio
// ------------------------------
(() => {
  const btn = document.getElementById('pcwork-tts-btn');
  const speechEl = document.getElementById('pcwork-demo-speech');
  const featured = document.getElementById('pcwork-demo-featured');
  if (!btn || !speechEl || !featured) return;

  const synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;

  let currentUtterance = null;
  let isSpeaking = false;
  let userInteracted = false;
  let autoSpoken = false;

  const updateButton = () => {
    const icon = isSpeaking ? 'volume-x' : 'volume-2';
    const label = isSpeaking ? 'Ferma' : 'Ascolta';
    btn.innerHTML = `<i data-feather="${icon}" class="w-4 h-4"></i> ${label}`;
    if (window.feather) feather.replace();
  };

  const pickItalianVoice = () => {
    const voices = synth.getVoices?.() || [];
    // Preferisci "it-IT" se presente
    return voices.find(v => (v.lang || '').toLowerCase().startsWith('it')) || null;
  };

  const stop = () => {
    try { synth.cancel(); } catch (_) {}
    isSpeaking = false;
    currentUtterance = null;
    updateButton();
  };

  const speak = (text) => {
    if (!text) return;
    stop();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    u.rate = 1.02;
    u.pitch = 1.0;
    u.volume = 1.0;

    // A volte le voci arrivano in async: proviamo comunque a selezionare la migliore
    const voice = pickItalianVoice();
    if (voice) u.voice = voice;

    u.onend = () => {
      isSpeaking = false;
      currentUtterance = null;
      updateButton();
    };
    u.onerror = () => {
      isSpeaking = false;
      currentUtterance = null;
      updateButton();
    };

    currentUtterance = u;
    isSpeaking = true;
    updateButton();
    synth.speak(u);
  };

  // Se le voci vengono caricate dopo, aggiorniamo la selezione (senza interrompere)
  if (typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = () => {};
  }

  // Browser policy: per non rischiare blocchi, l'autoplay parte solo dopo una prima interazione utente
  const markInteractionOnce = () => { userInteracted = true; };
  document.addEventListener('click', markInteractionOnce, { once: true, capture: true });
  document.addEventListener('keydown', markInteractionOnce, { once: true, capture: true });

  btn.addEventListener('click', () => {
    userInteracted = true;
    if (isSpeaking) stop();
    else speak(speechEl.textContent.trim());
  });

  // Auto-avvio: appena l'utente ha interagito e la card entra in viewport (una sola volta per sessione)
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (autoSpoken) return;
      if (!userInteracted) return;
      autoSpoken = true;
      speak(speechEl.textContent.trim());
    });
  }, { threshold: 0.35 });
  obs.observe(featured);

  // Stop se si cambia pagina/sezione rapidamente
  window.addEventListener('beforeunload', stop);
  updateButton();
})();
