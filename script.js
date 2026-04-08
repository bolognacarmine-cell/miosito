// Initialize Feather icons
if (window.feather) {
  feather.replace();
}

// Global owner/repo
const owner = 'bolognacarmine-cell';
const repo = 'miosito';

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
            <img src="${slide.image}" alt="PC Work" class="w-full h-auto transform group-hover:scale-105 transition-transform duration-700">
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
    const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/content/gallery.json?t=${Date.now()}`);
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

async function fetchContent() {
  const grid = document.getElementById('hardwareGrid');
  const vetrinaSection = document.getElementById('vetrina');
  if (!grid || !vetrinaSection) return;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content/prodotti?t=${Date.now()}`);
    if (!res.ok) throw new Error('Fetch failed');
    
    const files = await res.json();
    const productFiles = files.filter(f => f.name.endsWith('.json'));

    if (productFiles.length === 0) {
      vetrinaSection.style.display = 'none';
      return;
    }

    vetrinaSection.style.display = 'block';
    grid.innerHTML = '';

    for (const file of productFiles) {
      const productRes = await fetch(file.download_url + '?t=' + Date.now());
      const product = await productRes.json();
      
      if (!product) continue;
      
      let imageList = [];
      if (product.images && Array.isArray(product.images)) {
        imageList = product.images.map(img => typeof img === 'string' ? img : img.image);
      } else if (product.image) {
        imageList = [product.image];
      } else {
        imageList = ['https://via.placeholder.com/400x300?text=Immagine+non+disponibile'];
      }
      
      const carouselId = `carousel-${Math.random().toString(36).substr(2, 9)}`;
      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 service-card fade-in-observer visible';
      
      let imageSection = '';
      if (imageList.length > 1) {
        imageSection = `
          <div id="${carouselId}" class="relative h-48 md:h-64 lg:h-72 overflow-hidden group bg-slate-100">
            <div class="carousel-inner">
              ${imageList.map(img => `
                <div class="carousel-item">
                  <img src="${img}" loading="lazy" alt="${product.title}">
                </div>
              `).join('')}
            </div>
            <button onclick="event.preventDefault(); moveProductCarousel('${carouselId}', -1)" class="absolute left-3 top-1/2 -translate-y-1/2 product-carousel-btn z-10">
              <i data-feather="chevron-left" class="w-5 h-5"></i>
            </button>
            <button onclick="event.preventDefault(); moveProductCarousel('${carouselId}', 1)" class="absolute right-3 top-1/2 -translate-y-1/2 product-carousel-btn z-10">
              <i data-feather="chevron-right" class="w-5 h-5"></i>
            </button>
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              ${imageList.map((_, i) => `<div class="carousel-dot" data-index="${i}"></div>`).join('')}
            </div>
          </div>
        `;
      } else {
        imageSection = `
          <div class="h-48 md:h-64 lg:h-72 overflow-hidden relative group bg-slate-100">
            <img src="${imageList[0]}" 
                 loading="lazy"
                 alt="${product.title}" 
                 class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
            <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition duration-500"></div>
          </div>
        `;
      }

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
    }
    feather.replace();
    document.querySelectorAll('.carousel-dot[data-index="0"]').forEach(dot => {
      dot.classList.add('active');
    });
  } catch (error) {
    console.error('Errore nel caricamento dei contenuti:', error);
    vetrinaSection.style.display = 'none';
  }
}

window.moveProductCarousel = function(id, direction) {
  const container = document.getElementById(id);
  if (!container) return;
  
  const inner = container.querySelector('.carousel-inner');
  const slides = inner.children;
  const total = slides.length;
  
  let current = parseInt(container.dataset.currentIndex || 0);
  current = (current + direction + total) % total;
  
  container.dataset.currentIndex = current;
  inner.style.transform = `translateX(-${current * 100}%)`;
  
  const dots = container.querySelectorAll('.carousel-dot');
  dots.forEach((dot, i) => {
    if (i === current) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
};

window.acceptCookies = function() {
  localStorage.setItem('cookies-accepted', 'true');
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.transform = 'translateY(100%)';
  }
};

// Initialize everything on load
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  initObservers();
  fetchContent();
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
