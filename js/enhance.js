/* =============================================================
   enhance.js — ADDITIVE behavior for the "ME" site.
   Loaded with `defer` AFTER main.js and chat.js, so all existing
   DOM + the existing chat handlers are already wired up.
   Nothing here removes or rewrites existing markup; it only
   appends elements and adds new interactions.
   ============================================================= */
(function () {
    'use strict';

    /* -------------------- Dark mode toggle -------------------- */
    var root = document.documentElement;
    var themeBtn = document.getElementById('themeToggle');

    function reflectTheme() {
        var dark = root.getAttribute('data-theme') === 'dark';
        if (themeBtn) {
            var i = themeBtn.querySelector('i');
            if (i) { i.className = dark ? 'fas fa-sun' : 'fas fa-moon'; }
            themeBtn.setAttribute('aria-pressed', String(dark));
        }
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) { meta.setAttribute('content', dark ? '#0f1115' : '#ffffff'); }
    }
    reflectTheme();

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var dark = root.getAttribute('data-theme') === 'dark';
            if (dark) {
                root.removeAttribute('data-theme');
                try { localStorage.setItem('theme', 'light'); } catch (e) {}
            } else {
                root.setAttribute('data-theme', 'dark');
                try { localStorage.setItem('theme', 'dark'); } catch (e) {}
            }
            reflectTheme();
        });
    }

    /* -------------------- App metadata (real data) -------------------- */
    /* Keyed by App Store id (read from each card's App Store link).
       tag = one-line value prop; tech = real stack tags;
       cat = filter category; shots = screenshot folder (or null). */
    var APPS = {
        '6748370595': { cat: 'Finance', tag: 'Log expenses just by chatting — AI reads the amount, category and date.', tech: ['SwiftUI', 'SwiftData', 'Gemini'], shots: 'piggy-finance' },
        '6748324487': { cat: 'Productivity', tag: 'Turn plain-language plans into scheduled calendar events.', tech: ['SwiftUI', 'EventKit', 'Gemini'], shots: 'ai-calendar' },
        '6748370992': { cat: 'Health & Wellness', tag: 'Build habits with streaks, charts and gentle AI nudges.', tech: ['SwiftUI', 'SwiftData', 'Charts'], shots: 'weirabits' },
        '6748373741': { cat: 'AI & Utilities', tag: 'Real forecasts plus AI insights and a true UV index.', tech: ['SwiftUI', 'WeatherKit', 'OpenAI + Gemini'], shots: 'ai-weather' },
        '6748548518': { cat: 'Productivity', tag: 'A focus timer that plans your tasks from natural language.', tech: ['SwiftUI', 'SwiftData', 'OpenAI'], shots: 'ai-pomodoro' },
        '6748568205': { cat: 'Education', tag: 'Learn with an 18k-word deck and AI-generated examples.', tech: ['SwiftUI', 'SwiftData', '#Predicate'], shots: 'ai-vocabulary' },
        '6748717022': { cat: 'Health & Wellness', tag: 'Snap a meal and estimate calories with AI vision.', tech: ['SwiftUI', 'Vision', 'Gemini'], shots: 'ai-calories' },
        '6748549192': { cat: 'Lifestyle', tag: 'An agentic coach that suggests what to say next.', tech: ['SwiftUI', 'OpenAI', 'Agentic'], shots: 'dating-chat' },
        '6748650326': { cat: 'AI & Utilities', tag: 'Chat across multiple AI models in one place.', tech: ['SwiftUI', 'Streaming', 'Multi-LLM'], shots: 'ai-platform' },
        '6749024443': { cat: 'AI & Utilities', tag: 'An AI fill-light assistant for better photos and video.', tech: ['SwiftUI', 'AVFoundation', 'OpenAI'], shots: 'ai-smart-light' },
        '6749164175': { cat: 'Health & Wellness', tag: 'Guided sessions with AI-generated meditations.', tech: ['SwiftUI', 'AVFoundation', 'OpenAI'], shots: 'ai-meditation' },
        '6749191628': { cat: 'Productivity', tag: 'Plan the day and reflect with an AI companion.', tech: ['SwiftUI', 'SwiftData', 'OpenAI'], shots: 'dailymatters' },
        '6749191633': { cat: 'Productivity', tag: 'An agentic daily planner that adapts to your day.', tech: ['SwiftUI', 'SwiftData', 'Agentic'], shots: 'ai-daily-matters' },
        '6749165632': { cat: 'Lifestyle', tag: 'Discover your type with an AI-guided assessment.', tech: ['SwiftUI', 'OpenAI', 'Gemini'], shots: 'aimbti' },
        '6749274211': { cat: 'Health & Wellness', tag: 'Smart hydration reminders tuned by AI.', tech: ['SwiftUI', 'SwiftData', 'Notifications'], shots: null },
        '6749283592': { cat: 'Productivity', tag: 'Notes that summarize and organize themselves.', tech: ['SwiftUI', 'SwiftData', 'OpenAI'], shots: null },
        '6748947046': { cat: 'Productivity', tag: 'Record, transcribe and summarize with AI.', tech: ['SwiftUI', 'Speech', 'OpenAI'], shots: 'ai-voice-notes' }
    };

    /* -------------------- Lightbox -------------------- */
    var lb, lbContent;
    function ensureLightbox() {
        if (lb) { return; }
        lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.setAttribute('aria-label', 'App screenshots');
        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'lightbox-close';
        close.innerHTML = '&times;';
        close.setAttribute('aria-label', 'Close');
        lbContent = document.createElement('div');
        lbContent.className = 'lightbox-content';
        lb.appendChild(close);
        lb.appendChild(lbContent);
        document.body.appendChild(lb);
        function hide() { lb.classList.remove('open'); lbContent.innerHTML = ''; }
        close.addEventListener('click', hide);
        lb.addEventListener('click', function (e) { if (e.target === lb) { hide(); } });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lb.classList.contains('open')) { hide(); }
        });
    }
    function openLightbox(srcs) {
        ensureLightbox();
        lbContent.innerHTML = '';
        srcs.forEach(function (src) {
            var frame = document.createElement('div');
            frame.className = 'lb-frame';
            var img = document.createElement('img');
            img.src = src;
            img.alt = 'App screenshot';
            img.loading = 'lazy';
            frame.appendChild(img);
            lbContent.appendChild(frame);
        });
        lb.classList.add('open');
    }

    /* -------------------- Enrich existing app cards -------------------- */
    var cards = Array.prototype.slice.call(document.querySelectorAll('.apps-grid .app-card'));
    cards.forEach(function (card) {
        var link = card.querySelector('a[href*="/id"]');
        var id = null;
        if (link) {
            var m = link.getAttribute('href').match(/id(\d+)/);
            if (m) { id = m[1]; }
        }
        var data = id && APPS[id];
        if (!data) { return; }

        card.setAttribute('data-category', data.cat);

        var h3 = card.querySelector('h3');
        if (h3) {
            var tags = document.createElement('div');
            tags.className = 'app-tags';
            data.tech.forEach(function (t) {
                var s = document.createElement('span');
                s.className = 'app-tag';
                s.textContent = t;
                tags.appendChild(s);
            });
            var tagline = document.createElement('p');
            tagline.className = 'app-tagline';
            tagline.textContent = data.tag;
            h3.insertAdjacentElement('afterend', tags);
            h3.insertAdjacentElement('afterend', tagline);
        }

        if (data.shots) {
            var linksDiv = card.querySelector('.app-links');
            if (linksDiv) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-screens';
                btn.innerHTML = '<i class="fas fa-image"></i> View screens';
                btn.addEventListener('click', function () {
                    openLightbox([1, 2, 3].map(function (n) {
                        return 'assets/screenshots/' + data.shots + '/' + n + '.png';
                    }));
                });
                linksDiv.appendChild(btn);
            }
        }
    });

    /* -------------------- Category filter -------------------- */
    var filterBar = document.getElementById('appFilter');
    if (filterBar) {
        var cats = ['All'];
        cards.forEach(function (c) {
            var cat = c.getAttribute('data-category');
            if (cat && cats.indexOf(cat) < 0) { cats.push(cat); }
        });
        cats.forEach(function (cat, idx) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'app-filter-btn' + (idx === 0 ? ' active' : '');
            b.textContent = cat;
            b.addEventListener('click', function () {
                var all = filterBar.querySelectorAll('.app-filter-btn');
                Array.prototype.forEach.call(all, function (x) { x.classList.remove('active'); });
                b.classList.add('active');
                cards.forEach(function (c) {
                    var show = (cat === 'All') || (c.getAttribute('data-category') === cat);
                    c.style.display = show ? '' : 'none';
                });
            });
            filterBar.appendChild(b);
        });
    }

    /* -------------------- Case-study phone frames -> lightbox -------------------- */
    Array.prototype.forEach.call(document.querySelectorAll('.phone-frame[data-shot]'), function (pf) {
        pf.addEventListener('click', function () {
            openLightbox([pf.getAttribute('data-shot')]);
        });
    });

    /* -------------------- "Ask my AI twin" -> existing chat -------------------- */
    function openTwinChat(prompt) {
        var widget = document.getElementById('chatWidget');
        var toggle = document.getElementById('chatToggle');
        var form = document.getElementById('chatForm');
        var input = document.getElementById('chatInput');
        if (!widget || !form || !input) { return; }

        if (!widget.classList.contains('active')) {
            if (toggle) { toggle.click(); }          // reuse existing open + greeting logic
            else { widget.classList.add('active'); }
        }
        if (prompt) {
            input.value = prompt;
            setTimeout(function () {
                if (typeof form.requestSubmit === 'function') { form.requestSubmit(); }
                else { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }
            }, 80);
        } else {
            try { input.focus(); } catch (e) {}
        }
    }
    Array.prototype.forEach.call(document.querySelectorAll('.ai-twin-btn'), function (b) {
        b.addEventListener('click', function () { openTwinChat(); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.twin-chip'), function (c) {
        c.addEventListener('click', function () {
            openTwinChat(c.getAttribute('data-prompt') || c.textContent);
        });
    });
}());
