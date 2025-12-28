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
