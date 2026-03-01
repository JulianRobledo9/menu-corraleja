// ===== ELEMENTOS DEL DOM =====
const header = document.getElementById('header');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchSuggestions = document.getElementById('searchSuggestions');
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

// ===== BÚSQUEDA CON AUTOCOMPLETE =====
// Recopilar todos los platos disponibles (solo los completos)
function getAllMenuItems() {
    const items = [];
    menuItems.forEach(item => {
        const name = item.querySelector('h3')?.textContent.trim() || '';
        const description = item.querySelector('p')?.textContent.trim() || '';
        const price = item.querySelector('.menu-item-price')?.textContent.trim() || '';
        const imgElement = item.querySelector('.menu-item-img img');
        const imgSrc = imgElement?.src.trim() || '';
        
        // Solo incluir items que tengan nombre, imagen, descripción y precio válidos
        if (name && imgSrc && description && price) {
            items.push({
                name: name,
                description: description,
                price: price,
                element: item
            });
        }
    });
    return items;
}

const allMenuItems = getAllMenuItems();
let currentSuggestionIndex = -1;

// Generar sugerencias mientras el usuario escribe (búsqueda más precisa)
function generateSuggestions() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const suggestionsContainer = searchSuggestions;
    
    // Limpiar sugerencias previas
    suggestionsContainer.innerHTML = '';
    currentSuggestionIndex = -1;
    
    if (searchTerm === '' || searchTerm.length < 2) {
        suggestionsContainer.classList.remove('active');
        return;
    }
    
    // Filtrar platos que coincidan: priorizar coincidencias en el nombre
    const matches = allMenuItems.filter(item => {
        const name = item.name.toLowerCase();
        // Buscar si el término coincide con el inicio de una palabra en el nombre
        const nameWords = name.split(/\s+/);
        const isNameMatch = nameWords.some(word => word.startsWith(searchTerm));
        
        // También incluir si está en mitad del nombre, pero con menor prioridad
        const isPartialNameMatch = name.includes(searchTerm);
        
        return isNameMatch || isPartialNameMatch;
    });
    
    // Ordenar: primero los que coinciden en el inicio del nombre
    matches.sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().split(/\s+/)[0].startsWith(searchTerm);
        const bStartsWith = b.name.toLowerCase().split(/\s+/)[0].startsWith(searchTerm);
        return bStartsWith - aStartsWith; // true (1) antes que false (0)
    });
    
    if (matches.length === 0) {
        suggestionsContainer.innerHTML = '<li class="search-suggestion-item" style="cursor:not-allowed;"><span class="search-suggestion-text">No hay resultados para "' + searchTerm + '"</span></li>';
        suggestionsContainer.classList.add('active');
        return;
    }
    
    // Mostrar máximo 6 sugerencias
    matches.slice(0, 6).forEach((match, index) => {
        const li = document.createElement('li');
        li.className = 'search-suggestion-item';
        li.dataset.index = index;
        
        // Resaltar el término buscado en la sugerencia (solo en el nombre)
        const highlightedName = match.name.replace(
            new RegExp(`(${searchTerm})`, 'gi'),
            '<strong>$1</strong>'
        );
        
        li.innerHTML = `
            <span class="search-suggestion-icon">🍽️</span>
            <span class="search-suggestion-text">${highlightedName}</span>
            <span style="color:var(--accent); font-weight:600; font-size:0.9rem;">${match.price}</span>
        `;
        
        li.addEventListener('click', () => {
            // Limpiar búsqueda y sugerencias
            searchInput.value = '';
            suggestionsContainer.classList.remove('active');
            suggestionsContainer.innerHTML = '';
            
            // Mostrar todos los items (deshacer cualquier filtro previo)
            menuItems.forEach(item => item.style.display = 'block');
            
            // Scroll suave al platillo seleccionado
            const headerHeight = header.offsetHeight;
            const itemPosition = match.element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: itemPosition - headerHeight - 30,
                behavior: 'smooth'
            });
            
            // Destacar el item brevemente
            match.element.style.boxShadow = '0 0 20px var(--accent)';
            setTimeout(() => {
                match.element.style.boxShadow = '';
            }, 2000);
        });
        
        suggestionsContainer.appendChild(li);
    });
    
    suggestionsContainer.classList.add('active');
}

// Ejecutar búsqueda y mostrar resultados (solo buscar en nombres completos)
function performSearch(searchTerm = null) {
    const term = (searchTerm || searchInput.value).toLowerCase().trim();
    
    menuItems.forEach(item => {
        const name = item.querySelector('h3')?.textContent.toLowerCase() || '';
        const imgElement = item.querySelector('.menu-item-img img');
        const imgSrc = imgElement?.src.trim() || '';
        const description = item.querySelector('p')?.textContent.toLowerCase() || '';
        const price = item.querySelector('.menu-item-price')?.textContent.trim() || '';
        
        // Solo mostrar items completos que coincidan por nombre
        const isComplete = imgSrc && description && price;
        const matchesName = name.includes(term);
        
        if (term === '' || (isComplete && matchesName)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Navegación por sugerencias con teclado
if (searchInput) {
    searchInput.addEventListener('input', generateSuggestions);
    
    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsContainer.querySelectorAll('.search-suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, items.length - 1);
            updateSuggestionSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
            updateSuggestionSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentSuggestionIndex >= 0 && items[currentSuggestionIndex]) {
                items[currentSuggestionIndex].click();
            } else {
                performSearch();
                suggestionsContainer.classList.remove('active');
            }
        } else if (e.key === 'Escape') {
            suggestionsContainer.classList.remove('active');
        }
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            suggestionsContainer.classList.remove('active');
        }
    });
}

function updateSuggestionSelection(items) {
    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentSuggestionIndex);
    });
}

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Si está vacío, mostrar todos los items
            menuItems.forEach(item => item.style.display = 'block');
        } else {
            performSearch();
        }
        
        searchSuggestions.classList.remove('active');
    });
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



