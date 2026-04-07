// Initialize Feather icons
if (window.feather) {
  feather.replace();
}

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
  if (window.pageYOffset > 300) {
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

// Add loading animation + reveal about photo
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  document.querySelectorAll('.about-photo').forEach(el => {
    el.classList.add('revealed');
  });
});

// Intersection Observer for fade-in
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in');
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe sections and cards
document
  .querySelectorAll('.fade-in-observer, .service-card, .contact-card')
  .forEach(el => observer.observe(el));

// Meta Pixel - Traccia clic su contatti (telefono, email, WhatsApp)
document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Contact');
    }
  });
});

// Traccia clic su WhatsApp
const whatsappLink = document.querySelector('a[href*="wa.me"]');
if (whatsappLink) {
  whatsappLink.addEventListener('click', () => {
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Contact');
    }
  });
}
