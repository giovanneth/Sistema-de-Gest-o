// Função para alternar menu hambúrguer
function toggleMenu(event) {
    // Prevenir comportamento padrão caso seja chamado de um evento
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    const body = document.body;
    
    if (!navLinks) {
        console.error('Elemento navLinks não encontrado');
        return false;
    }
    
    if (!hamburger) {
        console.error('Elemento hamburger não encontrado');
        return false;
    }
    
    const isActive = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    console.log('Menu toggle:', isActive ? 'aberto' : 'fechado');
    console.log('Largura da janela:', window.innerWidth);
    console.log('Classe active:', navLinks.classList.contains('active'));
    
    // Adicionar/remover overlay em mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        if (isActive) {
            body.classList.add('menu-open');
            body.style.overflow = 'hidden'; // Prevenir scroll do body
            // Forçar estilo inline para garantir que apareça
            navLinks.style.left = '0';
            // Criar overlay
            setTimeout(() => {
                const existingOverlay = document.querySelector('.menu-overlay');
                if (!existingOverlay) {
                    const overlay = document.createElement('div');
                    overlay.className = 'menu-overlay';
                    overlay.style.cssText = 'position: fixed; top: 60px; left: 0; width: 100%; height: calc(100% - 60px); background: rgba(0, 0, 0, 0.5); z-index: 1000; cursor: pointer;';
                    overlay.addEventListener('click', closeMenu);
                    body.appendChild(overlay);
                }
            }, 10);
        } else {
            body.classList.remove('menu-open');
            body.style.overflow = '';
            navLinks.style.left = '-100%';
            // Remover overlay
            const existingOverlay = document.querySelector('.menu-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
        }
    } else {
        // Em desktop, remover estilos inline
        navLinks.style.left = '';
    }
    
    return false; // Prevenir comportamento padrão
}

// Fechar menu
function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    const body = document.body;
    
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        body.classList.remove('menu-open');
        body.style.overflow = '';
        
        // Forçar fechar em mobile
        if (window.innerWidth <= 768) {
            navLinks.style.left = '-100%';
        }
        
        // Remover overlay se existir
        const overlay = document.querySelector('.menu-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Garantir que as funções estejam disponíveis globalmente
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    
    // Garantir que o menu está fechado inicialmente em mobile
    if (window.innerWidth <= 768 && navLinks) {
        navLinks.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }
    
    // Adicionar event listener ao hamburger via JavaScript (além do onclick)
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu(e);
        });
    }
    
    if (navLinks) {
        // Fechar menu ao clicar em um link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });
    }
    
    // O overlay já tem seu próprio event listener para fechar o menu
    // Não é necessário adicionar outro listener aqui
    
    // Fechar menu ao redimensionar janela
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
    
    // Fechar menu ao pressionar ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
});

// Garantir que funciona mesmo se o DOM já estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Já está sendo tratado acima
    });
} else {
    // DOM já está carregado, executar imediatamente
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu(e);
        });
    }
}
