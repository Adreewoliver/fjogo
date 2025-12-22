document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inicializa a lógica do Menu Mobile
    const initMobileMenu = () => {
        const mobileBtn = document.querySelector('.mobile-toggle');
        const closeBtn = document.querySelector('.close-menu');
        const mobileMenu = document.querySelector('.mobile-menu-overlay');
        const mobileLinks = document.querySelectorAll('.mobile-menu-overlay nav a');

        const toggleMenu = () => {
            if (mobileMenu) {
                mobileMenu.classList.toggle('active');
            }
        };

        if (mobileBtn) mobileBtn.addEventListener('click', toggleMenu);
        if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
        
        // Fecha o menu ao clicar em um link
        mobileLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    };

    // 2. Inicializa o efeito de Scroll no Header
    const initHeaderScroll = () => {
        const header = document.querySelector('header');
        if (!header) return;

        const handleScroll = () => {
            // Usa requestAnimationFrame para otimizar o listener de scroll
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        };
        
        // Executa uma vez ao carregar para verificar a posição inicial
        handleScroll(); 
        window.addEventListener('scroll', handleScroll);
    };

    // 3. Inicializa a animação suave para links âncora
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // 4. Inicializa a lógica de Paginação do Blog
    const initBlogPagination = () => {
        const postsContainer = document.getElementById('posts-container');
        const paginationContainer = document.getElementById('pagination-container');
        const postsPerPage = 5; 
        let allPosts = []; // Armazena todos os posts

        if (!postsContainer || !paginationContainer) return;

        // Função para carregar os dados do JSON
        const fetchPosts = async () => {
            try {
                const response = await fetch('blog_posts.json'); 
                if (!response.ok) {
                    throw new Error('Erro ao carregar o arquivo JSON: ' + response.statusText);
                }
                return await response.json();
            } catch (error) {
                console.error('Falha ao buscar posts:', error);
                postsContainer.innerHTML = '<p class="text-center">Não foi possível carregar os posts do blog no momento.</p>';
                return [];
            }
        };

        // Função que renderiza os posts na tela
        const displayPosts = (posts, page) => {
            postsContainer.innerHTML = ''; 

            const startIndex = (page - 1) * postsPerPage;
            const endIndex = startIndex + postsPerPage;
            
            const postsToDisplay = posts.slice(startIndex, endIndex);

            postsToDisplay.forEach(post => {
                const postCard = document.createElement('article');
                postCard.classList.add('post-card');
                
                postCard.innerHTML = `
                    <div class="post-image-wrapper">
                        <img src="${post.imagem || 'assets/default.jpg'}" alt="${post.titulo}">
                    </div>
                    <div class="post-card-content">
                        <span class="category-label">${post.categoria}</span>
                        <h3><a href="${post.link}">${post.titulo}</a></h3>
                        <p>${post.resumo}</p>
                        <span class="post-date">${post.data}</span>
                        <a href="${post.link}" class="read-more">Ler mais &rarr;</a>
                    </div>
                `;
                postsContainer.appendChild(postCard);
            });

            setupPagination(posts, page);
        };

        // Função que cria os botões de paginação
        const setupPagination = (posts, currentPage) => {
            paginationContainer.innerHTML = ''; 

            const pageCount = Math.ceil(posts.length / postsPerPage);
            
            if (pageCount <= 1) return;

            // Função auxiliar para criar um botão de paginação
            const createPaginationButton = (text, pageIndex, isActive = false) => {
                const button = document.createElement('a');
                button.innerHTML = text;
                button.href = '#'; 
                button.classList.add('pagination-button');
                if (isActive) {
                    button.classList.add('active');
                }

                button.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    
                    postsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    displayPosts(allPosts, pageIndex);
                });
                return button;
            };

            // Botão "Anterior"
            if (currentPage > 1) {
                const prevButton = createPaginationButton('&#8592; Anterior', currentPage - 1);
                paginationContainer.appendChild(prevButton);
            }

            // Botões Numéricos
            for (let i = 1; i <= pageCount; i++) {
                const button = createPaginationButton(i, i, i === currentPage);
                paginationContainer.appendChild(button);
            }

            // Botão "Próximo"
            if (currentPage < pageCount) {
                const nextButton = createPaginationButton('Próximo &#8594;', currentPage + 1);
                paginationContainer.appendChild(nextButton);
            }
        };

        // Inicia o carregamento do blog
        fetchPosts().then(posts => {
            allPosts = posts;
            displayPosts(allPosts, 1); 
        });
    };

    // 5. Inicializa a animação de Scroll Reveal
    const initScrollReveal = () => {
        // Verifica se a API Intersection Observer é suportada
        if (!('IntersectionObserver' in window)) {
            console.warn('Intersection Observer não suportado. Animações de Scroll Reveal desativadas.');
            return;
        }

        // Seleciona todos os elementos que devem ser animados
        // Adicione a classe 'js-scroll' aos elementos no seu HTML que você quer animar
        const scrollElements = document.querySelectorAll('.js-scroll');

        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.15 // 15% do elemento visível
        };

        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Adiciona a classe 'scrolled' para iniciar a animação
                    entry.target.classList.add('scrolled');
                    // Para de observar o elemento após a animação
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        scrollElements.forEach(el => {
            // Garante que o elemento comece invisível (você deve adicionar o CSS para isso)
            el.classList.add('is-hidden'); 
            scrollObserver.observe(el);
        });
    };

    // Chamada de todas as funções de inicialização
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initBlogPagination();
    initScrollReveal();
});
// Carrossel Infinito de Clientes
const track = document.querySelector('.logos-track');
if (track) {
    const slides = Array.from(track.children);
    // Clona cada slide para criar o efeito de loop contínuo
    slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        track.appendChild(clone);
    });
}

// Carregamento de posts do blog em blog-posts-container (se existir)
const blogContainer = document.getElementById('blog-posts-container');
if (blogContainer) {
    // CAMINHO CORRIGIDO: Busca o JSON na raiz (../)
    fetch('../blog_posts.json')
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then(posts => {
            posts.forEach(post => {
                const card = `
                    <article class="blog-card">
                        <div class="blog-img">
                            <img src="../${post.imagem || 'assets/blog/default.jpg'}" alt="${post.titulo}">
                        </div>
                        <div class="blog-info">
                            <h3>${post.titulo}</h3>
                            <p>${post.resumo || 'Clique para ler mais sobre este assunto jurídico.'}</p>
                            <a href="${post.link}" class="read-more">Ler Artigo &rarr;</a>
                        </div>
                    </article>
                `;
                blogContainer.innerHTML += card;
            });
        })
        .catch(error => console.error('Erro ao carregar posts:', error));
        fetch('../blog_posts.json')
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            const card = `
                <article class="blog-card">
                    <div class="blog-img">
                        <img src="../${post.imagem}" alt="${post.titulo}">
                    </div>
                    <div class="blog-info">
                        <h3>${post.titulo}</h3>
                        <p>${post.resumo}</p>
                        <a href="${post.link}" class="read-more">Ler Artigo &rarr;</a>
                    </div>
                </article>
            `;
            container.innerHTML += card;
        });
    })
}