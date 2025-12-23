/**
 * @jest-environment jsdom
 */

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('script.js integration tests', () => {
    let originalFetch;
    let originalIntersectionObserver;
    let originalRaf;

    beforeAll(() => {
        originalFetch = global.fetch;
        originalIntersectionObserver = global.IntersectionObserver;
        originalRaf = global.requestAnimationFrame;
    });

    afterAll(() => {
        global.fetch = originalFetch;
        global.IntersectionObserver = originalIntersectionObserver;
        global.requestAnimationFrame = originalRaf;
    });

    beforeEach(() => {
        document.body.innerHTML = '';
        jest.resetModules();
        // Make rAF synchronous for tests
        global.requestAnimationFrame = cb => cb();
        // Default fetch mock (can be overridden in tests)
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
        }));
    });

    test('mobile menu toggles active class on open/close and link click', async () => {
        document.body.innerHTML = `
            <button class="mobile-toggle"></button>
            <button class="close-menu"></button>
            <div class="mobile-menu-overlay"><nav><a href="#x" class="m-link"></a></nav></div>
        `;

        await jest.isolateModulesAsync(async () => {
            require('./script.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));
            const mobileBtn = document.querySelector('.mobile-toggle');
            const closeBtn = document.querySelector('.close-menu');
            const mobileMenu = document.querySelector('.mobile-menu-overlay');
            const link = document.querySelector('.m-link');

            mobileBtn.click();
            expect(mobileMenu.classList.contains('active')).toBe(true);

            closeBtn.click();
            expect(mobileMenu.classList.contains('active')).toBe(false);

            // open then click link to close
            mobileBtn.click();
            expect(mobileMenu.classList.contains('active')).toBe(true);
            link.click();
            expect(mobileMenu.classList.contains('active')).toBe(false);
        });
    });

    test('header receives scrolled class based on window.scrollY', async () => {
        document.body.innerHTML = `<header></header>`;
        await jest.isolateModulesAsync(async () => {
            require('./script.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));
            const header = document.querySelector('header');

            // simulate scroll beyond threshold
            global.scrollY = 100;
            window.dispatchEvent(new Event('scroll'));
            expect(header.classList.contains('scrolled')).toBe(true);

            // simulate scroll back to top
            global.scrollY = 0;
            window.dispatchEvent(new Event('scroll'));
            expect(header.classList.contains('scrolled')).toBe(false);
        });
    });

    test('smooth scroll calls scrollIntoView on target', async () => {
        document.body.innerHTML = `
            <a href="#target" id="anchor">go</a>
            <div id="target"></div>
        `;
        const target = document.getElementById('target');
        target.scrollIntoView = jest.fn();

        await jest.isolateModulesAsync(async () => {
            require('./script.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));

            const anchor = document.getElementById('anchor');
            anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        });
    });

    test('blog pagination loads posts and creates pagination buttons', async () => {
        // provide containers expected by initBlogPagination
        document.body.innerHTML = `
            <div id="posts-container"></div>
            <div id="pagination-container"></div>
        `;

        // mock fetch to return 7 posts so pagination >1 page (postsPerPage=5)
        const mockPosts = Array.from({ length: 7 }, (_, i) => ({
            titulo: `Post ${i+1}`,
            imagem: `img${i+1}.jpg`,
            resumo: `Resumo ${i+1}`,
            categoria: 'Cat',
            data: '2025-01-01',
            link: '#'
        }));
        global.fetch = jest.fn((url) => Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPosts)
        }));

        await jest.isolateModulesAsync(async () => {
            require('./script.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));
            await flushPromises();

            const postsContainer = document.getElementById('posts-container');
            const paginationContainer = document.getElementById('pagination-container');

            // first page should render 5 posts
            expect(postsContainer.querySelectorAll('.post-card').length).toBe(5);

            // pagination should exist and include numeric buttons
            const buttons = Array.from(paginationContainer.querySelectorAll('.pagination-button'));
            expect(buttons.length).toBeGreaterThanOrEqual(2);
            const page2 = buttons.find(b => b.textContent.trim() === '2');
            expect(page2).toBeDefined();

            // click page 2 and expect remaining 2 posts
            page2.click();
            // allow any async handlers to run
            await flushPromises();
            expect(postsContainer.querySelectorAll('.post-card').length).toBe(2);
        });
    });

    test('scroll reveal adds is-hidden and scrolled classes when IntersectionObserver present', async () => {
        // mock IntersectionObserver to immediately call callback with isIntersecting true
        class MockIO {
            constructor(cb) { this.cb = cb; }
            observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
            unobserve() {}
        }
        global.IntersectionObserver = MockIO;

        document.body.innerHTML = `<div class="js-scroll">reveal me</div>`;

        await jest.isolateModulesAsync(async () => {
            require('./script.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));
            await flushPromises();

            const el = document.querySelector('.js-scroll');
            // script should have added is-hidden then scrolled via observer callback
            expect(el.classList.contains('is-hidden')).toBe(true);
            expect(el.classList.contains('scrolled')).toBe(true);
        });
    });
});

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function() {};
}