// Carrega um partial HTML (menu) e injeta na página, depois carrega js/menu.js dinamicamente
(function() {
    async function loadMenu() {
        try {
            const resp = await fetch('partials/menu.html');
            if (!resp.ok) return;
            const html = await resp.text();
            const container = document.getElementById('menu-include');
            if (!container) return;
            container.innerHTML = html;

            // Após inserir o HTML, carregar script do menu.js para inicializar comportamentos
            await loadScript('js/menu.js');
            if (window.setupMenu) {
                window.setupMenu();
            }

            // Fallback: se toggleMenu não existir, cria função simples
            if (!window.toggleMenu) {
                window.toggleMenu = function(event) {
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    const sidebar = document.querySelector('.sidebar');
                    const overlay = document.querySelector('.sidebar-overlay');
                    const body = document.body;
                    if (!sidebar) return;
                    const isActive = sidebar.classList.toggle('active');
                    if (overlay) overlay.classList.toggle('active', isActive);
                    body.classList.toggle('sidebar-open', isActive);
                };
            }

            // Garantir binding do botão de menu mesmo se algo falhar no script
            const toggleBtn = document.querySelector('.menu-toggle');
            if (toggleBtn && !toggleBtn.dataset.includeBound) {
                toggleBtn.dataset.includeBound = 'true';
                toggleBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.toggleMenu) {
                        window.toggleMenu(e);
                    }
                });
            }
        } catch (err) {
            console.error('Erro ao carregar partial do menu:', err);
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Falha ao carregar ' + src));
            document.body.appendChild(s);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadMenu);
    } else {
        loadMenu();
    }
})();
