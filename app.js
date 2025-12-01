// app.js - animaciones y comportamiento (defer cargado)
document.addEventListener('DOMContentLoaded', () => {
  // footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // NAV toggle
  const menuToggle = document.getElementById('menuToggle');
  const navPanel = document.getElementById('main-nav');
  menuToggle && menuToggle.addEventListener('click', () => {
    const open = navPanel.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(!!open));
    // pequeño pulso
    menuToggle.animate([{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 250 });
  });

  // cerrar nav al click en enlace y smooth scroll
  navPanel && navPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => {
    navPanel.classList.remove('open');
    menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
    // smooth scroll con offset
    e.preventDefault();
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        const headerH = document.getElementById('site-header').offsetHeight + 8;
        const y = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }));

  // asegurar scrollMarginTop para anclas
  function updateScrollMargin() {
    const headerH = document.getElementById('site-header').offsetHeight;
    document.querySelectorAll('.menu-section').forEach(sec => {
      sec.style.scrollMarginTop = (headerH + 12) + 'px';
    });
  }
  window.addEventListener('load', updateScrollMargin);
  window.addEventListener('resize', updateScrollMargin);

  // IntersectionObserver para revelar con efecto escalonado
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // añadir clase reveal con retardo basado en índice para efecto escalonado
        setTimeout(() => {
          entry.target.classList.add('reveal');
        }, entry.target.dataset.delay ? Number(entry.target.dataset.delay) : (idx * 90));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.card').forEach((card, i) => {
    card.dataset.delay = String(i * 40);
    io.observe(card);
  });

  // Parallax hero (ligero)
  const hero = document.getElementById('hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const sc = window.scrollY;
      hero.style.transform = `translateY(${sc * 0.02}px)`;
    }, { passive: true });
  }

  // Ripple effect on touch/click for cards
  function createRipple(e, el) {
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 1.6;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.45), rgba(255,255,255,0.06))';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0.9';
    ripple.style.transition = 'transform .6s cubic-bezier(.2,.9,.25,1), opacity .6s ease';
    el.appendChild(ripple);
    requestAnimationFrame(()=> {
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });
    setTimeout(()=> ripple.remove(), 700);
  }

  document.querySelectorAll('.card').forEach(card => {
    // ensure relative container for ripple
    card.style.position = 'relative';
    card.addEventListener('pointerdown', (ev) => {
      createRipple(ev, card);
    });
  });

  // Floating action button scroll-to-top or to first section
  const fab = document.getElementById('fabOrder');
  const firstSection = document.querySelector('.menu-section');
  if (fab && firstSection) {
    fab.addEventListener('click', () => {
      const headerH = document.getElementById('site-header').offsetHeight + 8;
      const y = firstSection.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top: y, behavior: 'smooth' });
      // small feedback
      fab.animate([{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 220 });
    });
  }

  // Tilt effect with device orientation (mobile) and pointermove fallback
  function setTilt(el, x, y) {
    const rx = (y - 0.5) * 6; // rotateX
    const ry = (x - 0.5) * -6; // rotateY
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  }
  document.querySelectorAll('.card').forEach(card => {
    // pointermove tilt
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setTilt(card, x, y);
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });

  // Lazy set prices if data-price present (useful si quieres cambiar con JS)
  document.querySelectorAll('.item.card').forEach(item => {
    const priceSpan = item.querySelector('.price');
    const priceData = item.getAttribute('data-price');
    if (priceData && priceData.trim() !== '') {
      priceSpan.textContent = priceData;
    } else {
      // leave as dash — you can update .dataset.price desde el servidor o JS
      priceSpan.textContent = '—';
    }
  });

  // Small accessibility: focus-visible outline for keyboard users
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('user-is-tabbing');
  });

  // Prefetch images on idle to make scrolling snappier
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      document.querySelectorAll('.media img').forEach(img => {
        if (img.complete) return;
        const src = img.getAttribute('src');
        const i = new Image();
        i.src = src;
      });
    });
  }

});



