// Função para alternar menu hambúrguer
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    const body = document.body;
    
    if (navLinks && hamburger) {
        const isActive = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Adicionar/remover overlay em mobile
        if (window.innerWidth <= 768) {
            if (isActive) {
                body.classList.add('menu-open');
                body.style.overflow = 'hidden'; // Prevenir scroll do body
            } else {
                body.classList.remove('menu-open');
                body.style.overflow = '';
            }
        }
    }
}

// Fechar menu
function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    const body = document.body;
    
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = '';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.getElementById('navLinks');
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
    
    // Fechar menu ao clicar no overlay (mobile)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger');
            const clickedElement = event.target;
            
            // Se clicou fora do menu e o menu está aberto
            if (navLinks && navLinks.classList.contains('active')) {
                const isClickInsideNav = navLinks.contains(clickedElement);
                const isClickOnHamburger = hamburger && hamburger.contains(clickedElement);
                
                if (!isClickInsideNav && !isClickOnHamburger) {
                    closeMenu();
                }
            }
        }
    });
    
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
