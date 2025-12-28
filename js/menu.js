// Função para alternar menu sidebar
function toggleMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;
    
    if (!sidebar) {
        console.error('Sidebar não encontrado');
        return false;
    }
    
    const isActive = sidebar.classList.toggle('active');
    
    if (overlay) {
        overlay.classList.toggle('active', isActive);
    }
    
    if (isActive) {
        body.classList.add('sidebar-open');
    } else {
        body.classList.remove('sidebar-open');
    }
    
    return false;
}

// Fechar menu
function closeMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;
    
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) {
            overlay.classList.remove('active');
        }
        body.classList.remove('sidebar-open');
    }
}

// Event listeners
function applyAdminVisibility() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    try {
        const parsed = JSON.parse(currentUser);
        const isAdmin = (parsed.email && parsed.email.toLowerCase() === 'giovanneltda@gmail.com') ||
                        (parsed.username && parsed.username.toLowerCase() === 'giovanneltda@gmail.com');
        const adminItems = document.querySelectorAll('.admin-only');
        adminItems.forEach(item => {
            item.style.display = isAdmin ? 'block' : 'none';
        });
    } catch (e) {
        // ignore
    }
}

function setupMenu() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    // Adicionar event listener ao botão de toggle
    if (menuToggle && !menuToggle.dataset.bound) {
        menuToggle.dataset.bound = 'true';
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMenu(e);
        });
    }
    
    // Fechar menu ao clicar no overlay
    if (overlay && !overlay.dataset.bound) {
        overlay.dataset.bound = 'true';
        overlay.addEventListener('click', closeMenu);
    }
    
    // Fechar menu ao clicar em um link (mobile)
    if (sidebar && !sidebar.dataset.bound) {
        sidebar.dataset.bound = 'true';
        const links = sidebar.querySelectorAll('.sidebar-menu-link');
        links.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });
    }

    // Marcar link ativo conforme a URL
    if (sidebar) {
        const links = sidebar.querySelectorAll('.sidebar-menu-link');
        const current = window.location.pathname.split('/').pop();
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const hrefFile = href.split('/').pop();
            if (hrefFile === current || (hrefFile === '' && (current === '' || current === 'index.html'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    applyAdminVisibility();
}

// Delegação extra para garantir o toggle mesmo se listeners não ligarem
document.addEventListener('click', function(event) {
    const trigger = event.target.closest('.menu-toggle');
    if (trigger) {
        toggleMenu(event);
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMenu);
} else {
    setupMenu();
}

// Fechar menu ao redimensionar para desktop
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        // Em desktop, sidebar sempre visível, não precisa fechar
    } else {
        // Em mobile, pode manter fechado ou abrir conforme preferência
    }
});

// Fechar menu ao pressionar ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMenu();
    }
});

// Garantir que as funções estejam disponíveis globalmente
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.setupMenu = setupMenu;
window.applyAdminVisibility = applyAdminVisibility;
