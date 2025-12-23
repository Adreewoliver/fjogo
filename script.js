document.addEventListener('DOMContentLoaded', () => {
    
    // Configurações para GitHub Pages
    const REPO_NAME = '/fjogo'; 
    const WHATSAPP_NUMBER = "551155214500";

    // --- Menu Mobile ---
    const initMobileMenu = () => {
        const mobileBtn = document.querySelector('.mobile-toggle');
        const closeBtn = document.querySelector('.close-menu');
        const mobileMenu = document.querySelector('.mobile-menu-overlay');
        const mobileLinks = document.querySelectorAll('.mobile-menu-overlay nav a');

        const toggleMenu = () => mobileMenu?.classList.toggle('active');

        if (mobileBtn) mobileBtn.addEventListener('click', toggleMenu);
        if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
        mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));
    };

    // --- Efeitos de Scroll ---
    const initScrollEffects = () => {
        const header = document.querySelector('header');
        window.addEventListener('scroll', () => {
            if (header) {
                window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scrolled');
                    entry.target.classList.remove('is-hidden');
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.js-scroll').forEach(el => observer.observe(el));
    };

    // --- Blog (Caminhos Corrigidos) ---
    const initBlog = async () => {
        const container = document.getElementById('posts-container') || document.getElementById('blog-posts-container');
        if (!container) return;

        try {
            const response = await fetch(`${REPO_NAME}/blog_posts.json`);
            const posts = await response.json();

            container.innerHTML = ''; 
            posts.forEach(post => {
                const card = `
                    <article class="post-card blog-card">
                        <div class="post-image-wrapper blog-img">
                            <img src="${REPO_NAME}/${post.imagem}" alt="${post.titulo}">
                        </div>
                        <div class="post-card-content blog-info">
                            <span class="category-label">${post.categoria || 'Jurídico'}</span>
                            <h3>${post.titulo}</h3>
                            <p>${post.resumo}</p>
                            <a href="${REPO_NAME}${post.link.startsWith('/') ? '' : '/'}${post.link}" class="read-more">Ler mais &rarr;</a>
                        </div>
                    </article>`;
                container.innerHTML += card;
            });
        } catch (error) {
            console.error('Erro ao carregar blog:', error);
        }
    };

    // --- Formulários e WhatsApp ---
    const initForms = () => {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                const btn = this.querySelector('button[type="submit"]');
                const statusMsg = this.querySelector('#status-envio') || this.querySelector('.mensagem-sucesso');
                const textoOriginalBtn = btn.innerHTML;

                // Captura dinâmica de campos
                const nome = this.querySelector('input[placeholder*="NOME"], .campo-nome, #nome')?.value || "";
                const email = this.querySelector('input[type="email"], .campo-email')?.value || "";
                const tel = this.querySelector('input[type="tel"], .campo-telefone, #whatsapp')?.value || "";
                const msg = this.querySelector('textarea, .campo-mensagem, #mensagem')?.value || "Olá, gostaria de um contato.";

                const textoWhats = `*Contato via Site FJOGO*%0A%0A*Nome:* ${nome}%0A*E-mail:* ${email}%0A*WhatsApp:* ${tel}%0A*Mensagem:* ${msg}`;
                
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

                // Abre WhatsApp e mantém a página
                window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${textoWhats}`, '_blank');

                // Feedback de Sucesso na tela
                setTimeout(() => {
                    if (statusMsg) {
                        statusMsg.style.display = 'block';
                    }
                    btn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
                    
                    setTimeout(() => {
                        this.reset();
                        if (statusMsg) statusMsg.style.display = 'none';
                        btn.disabled = false;
                        btn.innerHTML = textoOriginalBtn;
                    }, 4000);
                }, 800);
            });
        });
    };

    initMobileMenu();
    initScrollEffects();
    initBlog();
    initForms();
});