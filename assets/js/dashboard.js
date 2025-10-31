/* ==============================================
   RESPONSIVE HANDLER
   ============================================== */

document.addEventListener('alpine:init', () => {
    Alpine.data('dashboardApp', () => ({
        // Estados
        darkMode: localStorage.getItem('darkMode') === 'true' || false,
        sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true' || false,
        settingsOpen: false,
        isMobile: false,
        isTablet: false,
        sidebarMobileOpen: false,
        searchOpen: false,
        
        // Colores
        colors: {
            primary: '#3b82f6',
            background: '#f8fafc',
            cardBg: '#ffffff',
            text: '#0f172a',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            boxShadow: 'rgba(0, 0, 0, 0.03)'
        },
        
        fontFamily: 'Inter',

        init() {
            // Cargar tema guardado
            this.loadTheme();
            
            // Detectar tamaño de pantalla inicial
            this.checkScreenSize();
            
            // Listener para cambios de tamaño
            window.addEventListener('resize', this.debounce(() => {
                this.checkScreenSize();
            }, 250));
            
            // Prevenir scroll del body cuando sidebar móvil está abierto
            this.$watch('sidebarMobileOpen', (value) => {
                if (this.isMobile) {
                    document.body.style.overflow = value ? 'hidden' : '';
                }
            });
            
            // Cerrar sidebar móvil al hacer clic en overlay
            document.addEventListener('click', (e) => {
                if (this.isMobile && this.sidebarMobileOpen) {
                    const sidebar = document.querySelector('.sidebar');
                    const menuButton = e.target.closest('button[\\@click*="sidebarCollapsed"]');
                    
                    if (!sidebar?.contains(e.target) && !menuButton) {
                        this.sidebarMobileOpen = false;
                    }
                }
            });
            
            // Manejar orientación en móviles
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.checkScreenSize(), 100);
            });
        },

        // Detectar tamaño de pantalla
        checkScreenSize() {
            const width = window.innerWidth;
            const wasMobile = this.isMobile;
            
            this.isMobile = width < 768;
            this.isTablet = width >= 768 && width < 1024;
            
            // Si cambiamos de móvil a desktop, cerrar sidebar móvil
            if (wasMobile && !this.isMobile) {
                this.sidebarMobileOpen = false;
                document.body.style.overflow = '';
            }
            
            // Auto-colapsar sidebar en tablet
            if (this.isTablet && !this.sidebarCollapsed) {
                // Opcional: puedes auto-colapsar en tablet
                // this.sidebarCollapsed = true;
            }
        },

        // Utility: Debounce
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Toggle sidebar (comportamiento diferente en móvil/desktop)
        toggleSidebar() {
            if (this.isMobile) {
                this.sidebarMobileOpen = !this.sidebarMobileOpen;
            } else {
                this.sidebarCollapsed = !this.sidebarCollapsed;
                localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
            }
        },

        // Body styles computados
        get bodyStyles() {
            return {
                fontFamily: this.fontFamily,
                background: this.colors.background,
                color: this.colors.text
            };
        },

        // Sidebar classes
        get sidebarClasses() {
            return {
                'mobile-open': this.isMobile && this.sidebarMobileOpen
            };
        },

        // Toggle Dark Mode
        setDarkMode(isDark) {
    this.darkMode = isDark;
    this.applyDarkMode();
    localStorage.setItem('darkMode', this.darkMode);
},

        // Aplicar Dark Mode
        applyDarkMode() {
            if (this.darkMode) {
                this.colors = {
                    primary: '#3b82f6',
                    background: '#0f172a',
                    cardBg: '#1e293b',
                    text: '#f1f5f9',
                    textSecondary: '#94a3b8',
                    border: '#334155',
                    boxShadow: 'rgba(0, 0, 0, 0.3)'
                };
            } else {
                this.colors = {
                    primary: '#3b82f6',
                    background: '#f8fafc',
                    cardBg: '#ffffff',
                    text: '#0f172a',
                    textSecondary: '#64748b',
                    border: '#e2e8f0',
                    boxShadow: 'rgba(0, 0, 0, 0.03)'
                };
            }
            this.saveTheme();
        },

        // Actualizar color individual
        updateColor(key, value) {
            this.colors[key] = value;
            this.saveTheme();
        },

        // Actualizar fuente
        updateFont(font) {
            this.fontFamily = font;
            this.saveTheme();
        },

        // Resetear colores
        resetColors() {
            this.darkMode = false;
            this.applyDarkMode();
            this.fontFamily = 'Inter';
            localStorage.removeItem('theme');
            localStorage.removeItem('darkMode');
        },

        // Guardar tema
        saveTheme() {
            const theme = {
                colors: this.colors,
                fontFamily: this.fontFamily,
                darkMode: this.darkMode
            };
            localStorage.setItem('theme', JSON.stringify(theme));
        },

        // Cargar tema
        loadTheme() {
            const saved = localStorage.getItem('theme');
            if (saved) {
                try {
                    const theme = JSON.parse(saved);
                    if (theme.colors) this.colors = theme.colors;
                    if (theme.fontFamily) this.fontFamily = theme.fontFamily;
                    if (theme.darkMode !== undefined) this.darkMode = theme.darkMode;
                } catch (e) {
                    console.error('Error loading theme:', e);
                }
            } else {
                this.applyDarkMode();
            }
        }
    }));
});

/* ==============================================
   AÑADIR OVERLAY PARA SIDEBAR MÓVIL
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Crear overlay para sidebar móvil
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.setAttribute('x-show', 'isMobile && sidebarMobileOpen');
    overlay.setAttribute('@click', 'sidebarMobileOpen = false');
    document.body.appendChild(overlay);
    
    // Añadir clases reactive al sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.setAttribute(':class', 'sidebarClasses');
    }
    
    // Actualizar todos los botones de toggle del menú
    const menuButtons = document.querySelectorAll('button[\\@click*="sidebarCollapsed"]');
    menuButtons.forEach(btn => {
        btn.setAttribute('@click', 'toggleSidebar()');
    });
    
    // Hacer tablas responsive añadiendo data-labels
    makeTablesResponsive();
    
    // Touch gestures para cerrar sidebar en móvil
    setupTouchGestures();
});

/* ==============================================
   TABLAS RESPONSIVE
   ============================================== */

function makeTablesResponsive() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index]);
                }
            });
        });
    });
}

/* ==============================================
   TOUCH GESTURES
   ============================================== */

function setupTouchGestures() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    sidebar.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    sidebar.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeDistance = touchStartX - touchEndX;
        
        // Swipe left para cerrar (al menos 50px)
        if (swipeDistance > 50 && window.innerWidth < 768) {
            const alpineData = Alpine.$data(document.body);
            if (alpineData && alpineData.sidebarMobileOpen) {
                alpineData.sidebarMobileOpen = false;
            }
        }
    }
}

/* ==============================================
   OPTIMIZACIÓN DE RENDIMIENTO
   ============================================== */

// Lazy load de charts cuando sean visibles
if ('IntersectionObserver' in window) {
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('chart-visible');
                // Aquí puedes inicializar charts bajo demanda
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.h-48').forEach(chart => {
            chartObserver.observe(chart);
        });
    });
}

/* ==============================================
   VIEWPORT HEIGHT FIX PARA MÓVILES
   ============================================== */

function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
setVH();

/* ==============================================
   UTILS EXPORT
   ============================================== */

window.dashboardUtils = {
    isMobile: () => window.innerWidth < 768,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: () => window.innerWidth >= 1024
};
