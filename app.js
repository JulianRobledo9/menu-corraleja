// ===== ELEMENTOS DEL DOM =====
const header = document.getElementById('header');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const menuItems = document.querySelectorAll('.menu-item');
const backToTop = document.getElementById('backToTop');
const currentYear = document.getElementById('current-year');
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Año actual en footer
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Scroll suave para todos los enlaces del menú
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Cerrar todos los dropdowns después de hacer clic
                document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
                
                // Rotar iconos de vuelta
                document.querySelectorAll('.nav-dropdown-btn i').forEach(icon => {
                    icon.style.transform = 'rotate(0deg)';
                });
            }
        });
    });

    // Ajustar el scroll margin para todas las secciones
    function updateScrollMargin() {
        const headerHeight = header.offsetHeight;
        document.querySelectorAll('.menu-section').forEach(section => {
            section.style.scrollMarginTop = (headerHeight + 20) + 'px';
        });
    }
    
    updateScrollMargin();
    window.addEventListener('resize', updateScrollMargin);
});

// ===== MENÚ HAMBURGUESA =====
if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        navMenu.classList.toggle('open');
    });

    // cerrar cuando se hace clic fuera del menú o del botón
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-menu') && !e.target.closest('#navToggle')) {
            navMenu.classList.remove('open');
        }
    });

    // cerrar el menú al seleccionar cualquier enlace (para no quedarse abierto)
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
        });
    });
}

// ===== HEADER SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        backToTop.classList.add('show');
    } else {
        header.classList.remove('scrolled');
        backToTop.classList.remove('show');
    }
    
    // Resaltar sección activa
    highlightActiveSection();
});

// ===== BÚSQUEDA =====
function searchMenu() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    menuItems.forEach(item => {
        const name = item.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = item.querySelector('p')?.textContent.toLowerCase() || '';
        const matches = name.includes(searchTerm) || description.includes(searchTerm);
        
        // Mostrar u ocultar el item
        if (searchTerm === '' || matches) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('input', searchMenu);
}

if (searchBtn) {
    searchBtn.addEventListener('click', searchMenu);
}

// ===== DROPDOWNS - Mejorado para que se vean completos =====
document.querySelectorAll('.nav-dropdown-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdownId = btn.getAttribute('data-dropdown');
        const dropdown = document.getElementById(dropdownId);
        const icon = btn.querySelector('i');
        
        // Cerrar otros dropdowns
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
            if (menu.id !== dropdownId) {
                menu.classList.remove('active');
                const otherBtn = document.querySelector(`[data-dropdown="${menu.id}"] i`);
                if (otherBtn) otherBtn.style.transform = 'rotate(0deg)';
            }
        });
        
        // Toggle del dropdown actual
        if (dropdown) {
            const willOpen = !dropdown.classList.contains('active');
            dropdown.classList.toggle('active');
            // Si abrimos el dropdown, posicionarlo como flotante fixed para evitar clipping
            if (willOpen) {
                dropdown.classList.add('floating');
                const btnRect = btn.getBoundingClientRect();
                // calcular left centrado respecto al botón
                const left = Math.max(8, btnRect.left + btnRect.width / 2 - dropdown.offsetWidth / 2);
                const top = btnRect.bottom + 8; // 8px de espacio debajo del botón
                dropdown.style.left = left + 'px';
                dropdown.style.top = top + 'px';
                dropdown.style.position = 'fixed';
            } else {
                // limpiar estilos inline al cerrar
                dropdown.classList.remove('floating');
                dropdown.style.left = '';
                dropdown.style.top = '';
                dropdown.style.position = '';
            }
            if (icon) {
                icon.style.transform = dropdown.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
            
            // Asegurar que el dropdown sea visible (ajustar posición si es necesario)
            if (dropdown.classList.contains('active')) {
                const dropdownRect = dropdown.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                // Si el dropdown se sale de la pantalla hacia abajo
                if (dropdownRect.bottom > viewportHeight) {
                    dropdown.style.maxHeight = (viewportHeight - dropdownRect.top - 20) + 'px';
                    dropdown.style.overflowY = 'auto';
                } else {
                    dropdown.style.maxHeight = '';
                    dropdown.style.overflowY = '';
                }
            }
        }
    });
});

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-dropdown')) {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
            menu.classList.remove('active');
            const btn = document.querySelector(`[data-dropdown="${menu.id}"] i`);
            if (btn) btn.style.transform = 'rotate(0deg)';
        });
    }
});

// ===== VOLVER ARRIBA =====
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== ANIMACIONES AL HACER SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.menu-item').forEach(item => {
    observer.observe(item);
});

// ===== RESALTAR SECCIÓN ACTIVA EN LA NAVEGACIÓN =====
function highlightActiveSection() {
    const sections = document.querySelectorAll('.menu-section');
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
    
    let current = '';
    const headerHeight = header.offsetHeight;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - headerHeight - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href.includes(current) && current !== '') {
            link.classList.add('active');
        }
    });
}

// ===== MANEJAR CAMBIOS DE HASH EN LA URL =====
window.addEventListener('hashchange', () => {
    if (location.hash) {
        const target = document.querySelector(location.hash);
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Si la página carga con un hash, hacer scroll
if (location.hash) {
    setTimeout(() => {
        const target = document.querySelector(location.hash);
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }, 100);
}

// ===== AÑADIR ESTILOS PARA LINKS ACTIVOS =====
const style = document.createElement('style');
style.textContent = `
    .nav-link.active, .dropdown-link.active {
        background: var(--secondary) !important;
        color: var(--primary-dark) !important;
        font-weight: 600 !important;
    }
    
    .dropdown-menu {
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        max-height: 80vh;
        overflow-y: auto;
    }
`;
document.head.appendChild(style);



