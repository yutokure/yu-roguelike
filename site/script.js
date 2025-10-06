document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            navLinks.classList.toggle('is-open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = document.querySelectorAll('.reveal');

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18 });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    const scrollContainer = document.querySelector('.scroll-top');
    const scrollButton = document.querySelector('.scroll-top-button');

    if (scrollContainer && scrollButton) {
        const updateScrollButton = () => {
            const show = window.scrollY > 600;
            scrollContainer.classList.toggle('is-visible', show);
        };

        updateScrollButton();
        window.addEventListener('scroll', updateScrollButton);

        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    const sections = document.querySelectorAll('main section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    if (sections.length && navItems.length && 'IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navItems.forEach(link => {
                        const href = link.getAttribute('href');
                        const isTarget = href === `#${id}`;
                        link.classList.toggle('is-active', isTarget);
                    });
                }
            });
        }, { threshold: 0.6 });

        sections.forEach(section => navObserver.observe(section));
    }

    const slides = [
        {
            title: '黄金の宝箱チャレンジ',
            tagline: 'タイミングバーを止めてレア報酬を獲得',
            points: [
                'ポインタの往復を見極めて成功すると特大強化アイテムやスキル護符を入手',
                '失敗すると最大HPに応じた爆発ダメージが発生するスリリングなイベント',
                'PCはSpace/Enter、モバイルはタップ操作でシンプルに挑戦'
            ]
        },
        {
            title: '電子楽器シンセ',
            tagline: 'アイデアをすぐ音にするブラウザ鍵盤',
            points: [
                'キーボードやクリックで音階を鳴らして音色をチェック',
                '和音や効果音の確認に便利な制作補助ツール',
                'インスピレーションを逃さずメロディを記録'
            ]
        },
        {
            title: '表計算エクセラー',
            tagline: 'データ調整を助ける軽量スプレッドシート',
            points: [
                'セルに値や式を入力してブラウザ上で素早く計算',
                'ダンジョンデータのバランス調整メモにも活用',
                '操作感の軽いUIで管理が簡単'
            ]
        },
        {
            title: 'フォーリングシューター',
            tagline: '反射神経を鍛えるスコアアタック',
            points: [
                '矢印キーで移動しながらスペースでショットを連射',
                '敵の降下速度を見極めて動きと攻撃を同時にこなす',
                '短時間で集中力を切り替えたいときにぴったり'
            ]
        }
    ];

    const carouselCard = document.querySelector('.carousel-card');
    const titleEl = carouselCard?.querySelector('.carousel-title');
    const taglineEl = carouselCard?.querySelector('.carousel-tagline');
    const pointsEl = carouselCard?.querySelector('.carousel-points');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    let currentIndex = 0;
    let autoRotateTimer;

    const renderSlide = (index) => {
        const slide = slides[index];
        if (!slide || !carouselCard || !titleEl || !taglineEl || !pointsEl) return;

        titleEl.textContent = slide.title;
        taglineEl.textContent = slide.tagline;
        pointsEl.innerHTML = '';

        slide.points.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            pointsEl.appendChild(li);
        });

        if (indicatorsContainer) {
            Array.from(indicatorsContainer.children).forEach((dot, dotIndex) => {
                const isActive = dotIndex === index;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
                dot.setAttribute('tabindex', isActive ? '0' : '-1');
            });
        }
    };

    const gotoSlide = (index) => {
        currentIndex = (index + slides.length) % slides.length;
        renderSlide(currentIndex);
    };

    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
        slides.forEach((slide, index) => {
            const button = document.createElement('button');
            button.className = 'carousel-dot';
            button.type = 'button';
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-label', `${slide.title}を表示`);
            button.addEventListener('click', () => {
                gotoSlide(index);
                restartAutoRotate();
            });
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    gotoSlide(index);
                    restartAutoRotate();
                }
            });
            indicatorsContainer.appendChild(button);
        });
    }

    renderSlide(currentIndex);

    const startAutoRotate = () => {
        if (prefersReducedMotion) return;
        stopAutoRotate();
        autoRotateTimer = window.setInterval(() => gotoSlide(currentIndex + 1), 7000);
    };

    const stopAutoRotate = () => {
        if (autoRotateTimer) {
            window.clearInterval(autoRotateTimer);
            autoRotateTimer = undefined;
        }
    };

    const restartAutoRotate = () => {
        stopAutoRotate();
        startAutoRotate();
    };

    startAutoRotate();

    prevButton?.addEventListener('click', () => {
        gotoSlide(currentIndex - 1);
        restartAutoRotate();
    });

    nextButton?.addEventListener('click', () => {
        gotoSlide(currentIndex + 1);
        restartAutoRotate();
    });

    const carousel = document.querySelector('.carousel');

    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoRotate);
        carousel.addEventListener('mouseleave', startAutoRotate);
        carousel.addEventListener('focusin', stopAutoRotate);
        carousel.addEventListener('focusout', startAutoRotate);
    }

    const manualCards = document.querySelectorAll('.manual-card');

    manualCards.forEach(card => {
        const url = card.getAttribute('data-url');
        if (!url) return;

        const openUrl = () => window.open(url, '_blank', 'noopener');

        card.addEventListener('click', openUrl);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openUrl();
            }
        });
    });
});
