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
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    
    // Adicionar event listener ao botão de toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMenu(e);
        });
    }
    
    // Fechar menu ao clicar no overlay
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    // Fechar menu ao clicar em um link (mobile)
    if (sidebar) {
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
});

// Garantir que as funções estejam disponíveis globalmente
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
