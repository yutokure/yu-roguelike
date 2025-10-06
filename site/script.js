document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        ja: {
            'meta.title': 'Yuローグライク | 無限生成ローグライクのランディングページ',
            'meta.description': '376種類のダンジョン生成アルゴリズムと70種類の高品質ミニゲームを内包したYuローグライクの紹介サイト。ミニゲームの結果が経験値に繋がり、サンドボックスモードとパッシブの玉で自分だけの成長を楽しめます。',
            'lang.toggleLabel': 'English',
            'lang.toggleAria': '言語をEnglishに切り替える',
            'nav.ariaLabel': '主要ナビゲーション',
            'nav.feature': '特徴',
            'nav.flow': '冒険の流れ',
            'nav.create': 'カスタマイズ',
            'nav.minigames': 'ミニゲーム',
            'nav.manual': 'マニュアル',
            'nav.toggle': 'メニューを開く',
            'hero.eyebrow': '376の生成アルゴリズム × 70種のミニゲーム',
            'hero.title': 'Yuローグライクで、無限の冒険をデザインしよう',
            'hero.lead': '376種類のダンジョン生成アルゴリズムと、経験値に直結する70種類の高品質ミニゲーム。サンドボックスモードとパッシブの玉システムで、あなたのビルドを自由に磨き上げましょう。',
            'hero.primaryCta': 'デモを起動',
            'hero.secondaryCta': '特徴を見る',
            'hero.meta.platform': '対応',
            'hero.meta.platformValue': 'HTML / CSS / JavaScript',
            'hero.meta.save': '保存',
            'hero.meta.saveValue': 'ブラウザ自動セーブ',
            'hero.meta.mode': 'モード',
            'hero.meta.modeValue': '難易度選択 & サンドボックス',
            'hero.meta.license': 'ライセンス',
            'hero.meta.licenseValue': 'MIT（GitHub公開予定）',
            'hero.cardDungeon.title': 'Procedural Mastery',
            'hero.cardDungeon.body': '376通りに広がるフロアと遭遇。',
            'hero.cardSkill.title': 'Passive Orbs',
            'hero.cardSkill.body': '集めるほどビルドが加速。',
            'hero.cardMinigame.title': 'MiniExp Link',
            'hero.cardMinigame.body': 'ミニゲーム結果が経験値に。',
            'feature.kicker': 'Feature Highlights',
            'feature.heading': 'ゲームの魅力',
            'feature.body': '自動生成のダンジョン、多層的な育成システム、経験値と連動する高品質なミニゲームライブラリが、プレイヤーと制作者双方の創造力を刺激します。',
            'feature.card1.title': '376種のダンジョン生成',
            'feature.card1.body': '生成アルゴリズムを切り替えて、毎回違うレイアウト・敵・ギミックに挑戦。研究者も満足のバラエティです。',
            'feature.card2.title': '70種の高品質ミニゲーム',
            'feature.card2.body': 'ジャンル横断のMiniExpはすべて経験値に換算。腕試しがそのまま冒険者の成長へ繋がります。',
            'feature.card3.title': 'サンドボックスモード',
            'feature.card3.body': 'オープンなサンドボックスで自分だけのローグライクをシミュレート。敵配置も報酬も自由にチューニングできます。',
            'feature.card4.title': 'パッシブの玉システム',
            'feature.card4.body': '冒険で集めた玉が常時効果を発揮。ビルドを重ねるたびに戦略が深まる新感覚の育成サイクルです。',
            'flow.kicker': 'Gameplay',
            'flow.heading': '冒険の流れ',
            'flow.body': 'ゲーム内マニュアルをベースに、Yuローグライクならではの進行サイクルを4つのステップで紹介します。',
            'flow.step1.title': '1. ダンジョンと難易度を選択',
            'flow.step1.body': '376種類の生成アルゴリズムと推奨レベルを比較し、挑む世界と報酬テーブルを決定します。',
            'flow.step2.title': '2. ターン制で探索と戦略構築',
            'flow.step2.body': '1マス単位の移動とスキル管理でリスクを制御。パッシブの玉を意識したビルド調整が鍵です。',
            'flow.step3.title': '3. MiniExpで経験値をブースト',
            'flow.step3.body': '70種の高品質ミニゲームに挑戦し、スコアをそのまま冒険者の経験値や資源に変換します。',
            'flow.step4.title': '4. サンドボックスで再構築',
            'flow.step4.body': 'サンドボックスモードでデータを検証。MITライセンス準拠のコードをベースに新たな挑戦を共有できます。',
            'persona.kicker': 'For Creators',
            'persona.heading': '作る・学ぶ人へ',
            'persona.body': 'オープンライセンスで公開予定のプロジェクトだからこそ、ゲーム制作・学習・コミュニティ共有に幅広く活用できます。',
            'persona.card1.title': 'カスタマイズ志向の開発者に',
            'persona.card1.body': 'JSONやCSS、JavaScriptを編集して、独自のダンジョン、UI、イベントを組み込めます。',
            'persona.card1.point1': 'dungeontypesで生成アルゴリズムを差し替え',
            'persona.card1.point2': 'toolsタブでデータ連携を効率化',
            'persona.card1.point3': 'MITライセンスで派生作品も公開しやすい',
            'persona.card2.title': '教育・研修の教材として',
            'persona.card2.body': '豊富な設計資料とコメント付きコードで、アルゴリズムやゲームデザインの教材に最適です。',
            'persona.card2.point1': '376種アルゴリズムの比較・分析に最適',
            'persona.card2.point2': 'ミニゲームで反復練習と成果測定が可能',
            'persona.card2.point3': 'マニュアルで授業用シナリオを構築',
            'persona.card3.title': 'コミュニティとのシェアに',
            'persona.card3.body': 'サンドボックスとMiniExpを組み合わせ、ビルドやスコアを共有する新しい遊び方を提案できます。',
            'persona.card3.point1': 'ランキングや協力イベントのベースに',
            'persona.card3.point2': 'Passive Orbsのビルド解説を共有',
            'persona.card3.point3': 'GitHubで拡張MODをコラボ開発',
            'minigame.kicker': 'MiniExp Gallery',
            'minigame.heading': '収録ミニゲーム&ツール',
            'minigame.body': '70種類の高品質ミニゲームと制作ユーティリティから、代表的なコンテンツをピックアップしました。',
            'carousel.prev': '前へ',
            'carousel.next': '次へ',
            'manual.kicker': 'Documentation',
            'manual.heading': 'マニュアルで深掘り',
            'manual.body': 'オンラインマニュアルへのショートカットで、開発・攻略・MiniExpの連携方法を素早く確認できます。',
            'manual.card1.title': 'ゲーム全体の概要',
            'manual.card1.body': '想定ユーザーやゲーム全体の進行を把握し、冒険の全体像を掴みましょう。',
            'manual.card2.title': '遊び方と攻略',
            'manual.card2.body': 'ターン制探索やMiniExp連携のコツを押さえて効率良く成長。',
            'manual.card3.title': 'フォルダ構成ガイド',
            'manual.card3.body': 'カスタマイズに必要なファイル位置とデータ連携を整理します。',
            'manual.card4.title': 'ミニゲーム&ツール一覧',
            'manual.card4.body': '70種類のMiniExpラインナップと制作ツールの特徴をチェック。',
            'manual.cta': 'オンラインマニュアルを開く',
            'cta.heading': 'オープンな冒険を、今すぐ設計しよう',
            'cta.body': 'MITライセンスでGitHub公開予定。ダンジョン生成・MiniExp・サンドボックスを組み合わせて、自分だけのローグライクを世界にシェアできます。',
            'cta.primary': 'ゲームを起動',
            'cta.secondary': '導入ガイドを見る',
            'footer.copy': '© 2024 Yuローグライク Project. MITライセンス準備中。',
            'scrollTop.label': 'ページ上部に戻る'
        },
        en: {
            'meta.title': 'Yu Roguelike | Infinite Procedural Roguelike Landing Page',
            'meta.description': 'Discover Yu Roguelike with 376 dungeon generation algorithms, 70 premium mini-games that feed experience, a sandbox mode, and the passive orb growth system.',
            'lang.toggleLabel': '日本語',
            'lang.toggleAria': 'Switch language to Japanese',
            'nav.ariaLabel': 'Primary navigation',
            'nav.feature': 'Features',
            'nav.flow': 'Gameplay Flow',
            'nav.create': 'Customization',
            'nav.minigames': 'Mini-Games',
            'nav.manual': 'Manual',
            'nav.toggle': 'Open menu',
            'hero.eyebrow': '376 Generation Algorithms × 70 Premium Mini-Games',
            'hero.title': 'Design Infinite Adventures with Yu Roguelike',
            'hero.lead': 'Harness 376 unique dungeon generators and 70 premium mini-games that convert scores into experience. Sandbox mode and the passive orb system let you perfect every build.',
            'hero.primaryCta': 'Launch Demo',
            'hero.secondaryCta': 'Explore Features',
            'hero.meta.platform': 'Tech',
            'hero.meta.platformValue': 'HTML / CSS / JavaScript',
            'hero.meta.save': 'Saving',
            'hero.meta.saveValue': 'Auto save in browser',
            'hero.meta.mode': 'Modes',
            'hero.meta.modeValue': 'Difficulty Select & Sandbox',
            'hero.meta.license': 'License',
            'hero.meta.licenseValue': 'MIT (coming to GitHub)',
            'hero.cardDungeon.title': 'Procedural Mastery',
            'hero.cardDungeon.body': 'Encounter floors shaped by 376 blueprints.',
            'hero.cardSkill.title': 'Passive Orbs',
            'hero.cardSkill.body': 'Stack orbs to accelerate your build.',
            'hero.cardMinigame.title': 'MiniExp Link',
            'hero.cardMinigame.body': 'Mini-game scores turn into EXP.',
            'feature.kicker': 'Feature Highlights',
            'feature.heading': 'Why You\'ll Love It',
            'feature.body': 'Procedurally generated dungeons, layered progression, and an EXP-linked mini-game library ignite creativity for players and creators alike.',
            'feature.card1.title': '376 Dungeon Generators',
            'feature.card1.body': 'Swap algorithms to face new layouts, foes, and tricks every run—perfect for research and replayability.',
            'feature.card2.title': '70 Premium Mini-Games',
            'feature.card2.body': 'Every MiniExp genre feeds experience back into the campaign, so skill practice fuels growth.',
            'feature.card3.title': 'Sandbox Mode',
            'feature.card3.body': 'Prototype your own roguelike in an open sandbox—tune encounters, rewards, and pacing freely.',
            'feature.card4.title': 'Passive Orb Growth',
            'feature.card4.body': 'Earn orbs that grant permanent bonuses, unlocking deeper strategies with every expedition.',
            'flow.kicker': 'Gameplay',
            'flow.heading': 'How the Adventure Unfolds',
            'flow.body': 'Grounded in the in-game manual, these four beats show what makes Yu Roguelike unique.',
            'flow.step1.title': '1. Choose dungeon & difficulty',
            'flow.step1.body': 'Review 376 algorithms and recommended levels to pick your challenge and rewards.',
            'flow.step2.title': '2. Plan each turn strategically',
            'flow.step2.body': 'Move tile by tile, manage skills, and tune builds around passive orbs.',
            'flow.step3.title': '3. Boost EXP with MiniExp',
            'flow.step3.body': 'Tackle 70 premium mini-games and convert high scores directly into experience and resources.',
            'flow.step4.title': '4. Refine in sandbox mode',
            'flow.step4.body': 'Validate data in sandbox mode and share new runs built on MIT-licensed code.',
            'persona.kicker': 'For Creators',
            'persona.heading': 'Built for Makers & Learners',
            'persona.body': 'With an upcoming MIT release, Yu Roguelike is ideal for development, education, and community sharing.',
            'persona.card1.title': 'For customization-focused devs',
            'persona.card1.body': 'Edit JSON, CSS, and JavaScript to inject original dungeons, UI, and events.',
            'persona.card1.point1': 'Swap generation logic via dungeontypes',
            'persona.card1.point2': 'Streamline data handoffs with the tools tab',
            'persona.card1.point3': 'MIT license makes derivative releases simple',
            'persona.card2.title': 'For education & training',
            'persona.card2.body': 'Rich documentation and commented code make it a strong fit for algorithm and design lessons.',
            'persona.card2.point1': 'Perfect for analysing all 376 algorithms',
            'persona.card2.point2': 'Mini-games enable repeat practice and assessment',
            'persona.card2.point3': 'Manuals support ready-to-teach scenarios',
            'persona.card3.title': 'For community sharing',
            'persona.card3.body': 'Blend sandbox mode and MiniExp to pitch new builds and score challenges.',
            'persona.card3.point1': 'Foundation for leaderboards or co-op events',
            'persona.card3.point2': 'Share breakdowns of passive orb builds',
            'persona.card3.point3': 'Co-develop expansion mods on GitHub',
            'minigame.kicker': 'MiniExp Gallery',
            'minigame.heading': 'Featured Mini-Games & Tools',
            'minigame.body': 'Explore standout entries from the 70-piece high-quality MiniExp and utility collection.',
            'carousel.prev': 'Previous',
            'carousel.next': 'Next',
            'manual.kicker': 'Documentation',
            'manual.heading': 'Deep Dive Guides',
            'manual.body': 'Jump straight into manuals covering development, strategy, and MiniExp integrations.',
            'manual.card1.title': 'Project overview',
            'manual.card1.body': 'Understand target players and the full adventure flow at a glance.',
            'manual.card2.title': 'How to play & strategize',
            'manual.card2.body': 'Master turn-based exploration and get tips for linking MiniExp to growth.',
            'manual.card3.title': 'Folder structure guide',
            'manual.card3.body': 'Find the assets you need to customise data and systems quickly.',
            'manual.card4.title': 'Mini-game & tool index',
            'manual.card4.body': 'Review every MiniExp entry and supporting utilities in one place.',
            'manual.cta': 'Open online manual',
            'cta.heading': 'Start Designing an Open Adventure',
            'cta.body': 'The project is heading to GitHub under MIT. Combine dungeon generators, MiniExp, and sandbox systems to share your own roguelike.',
            'cta.primary': 'Launch Game',
            'cta.secondary': 'Read the Onboarding Guide',
            'footer.copy': '© 2024 Yu Roguelike Project. MIT License coming soon.',
            'scrollTop.label': 'Back to top'
        }
    };

    const slidesByLang = {
        ja: [
            {
                title: '黄金の宝箱チャレンジ',
                tagline: 'タイミングを制してMiniExp経験値を獲得',
                points: [
                    'ポインタの往復を見極めて成功すると強力な経験値ブーストとレア報酬を入手',
                    'ミスすると最大HPに応じた爆発ダメージが発生するスリリングなイベント',
                    'Space / Enter またはタップ操作で直感的に挑戦'
                ]
            },
            {
                title: '電子楽器シンセ',
                tagline: 'アイデアを即サウンドに落とし込む制作補助',
                points: [
                    'キーボードやクリックで音階を鳴らし即座に検証',
                    '和音確認や効果音づくりに便利な高品質プリセット',
                    'MiniExpの成果が経験値として本編にフィードバック'
                ]
            },
            {
                title: '表計算エクセラー',
                tagline: 'バランス調整を加速する軽量スプレッドシート',
                points: [
                    'セル入力と計算をブラウザで完結',
                    'ダンジョン報酬や敵データのチューニングに最適',
                    '共有テンプレートでチームの議論を効率化'
                ]
            },
            {
                title: 'フォーリングシューター',
                tagline: '反射神経を鍛えるMiniExpスコアアタック',
                points: [
                    '矢印キーとショットの組み合わせで爽快な操作感',
                    '降下する敵の速度を読みEXPボーナスを狙う',
                    '短時間で集中力を切り替えたいときに最適'
                ]
            }
        ],
        en: [
            {
                title: 'Golden Chest Challenge',
                tagline: 'Nail the timing bar and cash in EXP',
                points: [
                    'Master the oscillating pointer to earn massive EXP boosts and rare loot',
                    'Missing the window triggers explosive damage based on max HP for real tension',
                    'Play instantly with Space / Enter or a single tap'
                ]
            },
            {
                title: 'Browser Synth',
                tagline: 'Capture melodies without leaving the tab',
                points: [
                    'Trigger scales with keys or clicks to audition tones instantly',
                    'High-quality presets keep chord and SFX testing effortless',
                    'MiniExp results convert straight into campaign experience'
                ]
            },
            {
                title: 'Exceler Spreadsheet',
                tagline: 'Lightweight sheet for tuning balance',
                points: [
                    'Edit cells and formulas entirely in the browser',
                    'Perfect for calibrating dungeon rewards and enemy data',
                    'Shared templates keep team discussions fast and focused'
                ]
            },
            {
                title: 'Falling Shooter',
                tagline: 'Sharpen reflexes in a score attack',
                points: [
                    'Combine arrow-key movement with rapid shots for fluid play',
                    'Read falling enemy speed to chase EXP bonuses',
                    'Ideal for a quick focus reset between runs'
                ]
            }
        ]
    };

    const storageKey = 'yu-roguelike-lang';
    const htmlElement = document.documentElement;
    const metaDescription = document.querySelector('meta[name="description"]');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const langToggle = document.querySelector('.lang-toggle');
    const navItems = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('main section[id]');
    const revealElements = document.querySelectorAll('.reveal');
    const scrollContainer = document.querySelector('.scroll-top');
    const scrollButton = document.querySelector('.scroll-top-button');
    const carouselCard = document.querySelector('.carousel-card');
    const titleEl = carouselCard?.querySelector('.carousel-title');
    const taglineEl = carouselCard?.querySelector('.carousel-tagline');
    const pointsEl = carouselCard?.querySelector('.carousel-points');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    const carousel = document.querySelector('.carousel');
    const manualCards = document.querySelectorAll('.manual-card');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentLang = htmlElement.getAttribute('lang') === 'en' ? 'en' : 'ja';
    try {
        const storedLang = window.localStorage.getItem(storageKey);
        if (storedLang && translations[storedLang]) {
            currentLang = storedLang;
        }
    } catch (error) {
        // localStorage unavailable; ignore
    }

    htmlElement.setAttribute('lang', currentLang);

    let currentIndex = 0;
    let autoRotateTimer;

    const applyTranslations = (lang) => {
        const dictionary = translations[lang] || translations.ja;

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.getAttribute('data-i18n');
            if (!key) return;
            const value = dictionary[key];
            if (value !== undefined) {
                if (element.dataset.i18nMode === 'html') {
                    element.innerHTML = value;
                } else {
                    element.textContent = value;
                }
            }
        });

        document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
            const mappings = element.getAttribute('data-i18n-attr');
            if (!mappings) return;
            mappings.split(';').forEach((mapping) => {
                const [attrName, key] = mapping.split(':').map(segment => segment.trim());
                if (!attrName || !key) return;
                const value = dictionary[key];
                if (value !== undefined) {
                    element.setAttribute(attrName, value);
                }
            });
        });

        const title = dictionary['meta.title'];
        if (title) {
            document.title = title;
        }

        if (metaDescription) {
            const description = dictionary['meta.description'];
            if (description) {
                metaDescription.setAttribute('content', description);
            }
        }
    };

    const getSlides = () => slidesByLang[currentLang] || slidesByLang.ja || [];

    const renderSlide = (index) => {
        const slides = getSlides();
        const slide = slides[index];
        if (!slide || !carouselCard || !titleEl || !taglineEl || !pointsEl) return;

        titleEl.textContent = slide.title;
        taglineEl.textContent = slide.tagline;
        pointsEl.innerHTML = '';

        slide.points.forEach((point) => {
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
        const slides = getSlides();
        if (!slides.length) return;
        const length = slides.length;
        currentIndex = ((index % length) + length) % length;
        renderSlide(currentIndex);
    };

    const buildIndicators = () => {
        if (!indicatorsContainer) return;
        indicatorsContainer.innerHTML = '';
        const slides = getSlides();
        slides.forEach((slide, index) => {
            const button = document.createElement('button');
            button.className = 'carousel-dot';
            button.type = 'button';
            button.setAttribute('role', 'tab');
            const label = currentLang === 'ja' ? `${slide.title}を表示` : `View ${slide.title}`;
            button.setAttribute('aria-label', label);
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
    };

    const rebuildCarousel = () => {
        if (!carouselCard || !titleEl || !taglineEl || !pointsEl) return;
        buildIndicators();
        const slides = getSlides();
        if (!slides.length) return;
        if (currentIndex >= slides.length) {
            currentIndex = slides.length - 1;
        }
        if (currentIndex < 0) {
            currentIndex = 0;
        }
        renderSlide(currentIndex);
    };

    const stopAutoRotate = () => {
        if (autoRotateTimer) {
            window.clearInterval(autoRotateTimer);
            autoRotateTimer = undefined;
        }
    };

    const startAutoRotate = () => {
        if (prefersReducedMotion) return;
        stopAutoRotate();
        if (getSlides().length < 2) return;
        autoRotateTimer = window.setInterval(() => gotoSlide(currentIndex + 1), 7000);
    };

    const restartAutoRotate = () => {
        stopAutoRotate();
        startAutoRotate();
    };

    const setLanguage = (lang) => {
        if (!translations[lang]) return;
        currentLang = lang;
        htmlElement.setAttribute('lang', lang);
        applyTranslations(lang);
        rebuildCarousel();
        restartAutoRotate();
        try {
            window.localStorage.setItem(storageKey, lang);
        } catch (error) {
            // localStorage unavailable; ignore
        }
    };

    const toggleLanguage = () => {
        setLanguage(currentLang === 'ja' ? 'en' : 'ja');
    };

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

    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

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

    prevButton?.addEventListener('click', () => {
        gotoSlide(currentIndex - 1);
        restartAutoRotate();
    });

    nextButton?.addEventListener('click', () => {
        gotoSlide(currentIndex + 1);
        restartAutoRotate();
    });

    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoRotate);
        carousel.addEventListener('mouseleave', startAutoRotate);
        carousel.addEventListener('focusin', stopAutoRotate);
        carousel.addEventListener('focusout', startAutoRotate);
    }

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

    applyTranslations(currentLang);
    rebuildCarousel();
    startAutoRotate();
});
