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

/* =============================================================
   enhance.js — ROUND 2 additive layer.
   A second, self-contained IIFE appended below the round-1 layer.
   Adds: Ship Log (from committed Apple snapshot), GitHub panel,
   a11y fixes, command palette, coursework proof chips, and
   contact quick actions. No existing markup is modified.
   ============================================================= */
(function () {
    'use strict';

    /* ---------- Shared helpers ---------- */
    function fmtDate(iso) {
        try {
            return new Date(iso).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        } catch (e) { return iso; }
    }

    function openTwin(prompt) {
        var widget = document.getElementById('chatWidget');
        var toggle = document.getElementById('chatToggle');
        var form = document.getElementById('chatForm');
        var input = document.getElementById('chatInput');
        if (!widget || !form || !input) { return; }
        if (!widget.classList.contains('active')) {
            if (toggle) { toggle.click(); }
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

    /* English display names for the site (Apple trackNames are kept
       in the committed snapshot and shown via title tooltips). */
    var DISPLAY_NAMES = {
        '6748370595': 'Piggy Accounting',
        '6748324487': 'AI Calendar',
        '6748370992': 'Habits',
        '6748373741': 'AI Weather',
        '6748548518': 'AI Pomodoro Timer',
        '6748568205': 'AI Vocabulary',
        '6748717022': 'Food Calories',
        '6748549192': 'Dating Chat',
        '6748650326': 'Grok iOS: AI Platform',
        '6749024443': 'AI Smart Light',
        '6749164175': 'Meditation',
        '6749191628': 'Dailymatters',
        '6749191633': 'AI Daily Matters',
        '6749165632': 'AIMBTI',
        '6749274211': 'AI Drink Water',
        '6749283592': 'AI Note',
        '6748947046': 'AI Voice Notes'
    };

    /* ---------- 1) Ship Log — committed Apple App Store snapshot ---------- */
    var shipTimeline = document.getElementById('shipLogTimeline');
    var shipCaption = document.getElementById('shipLogCaption');
    var SHIPLOG_VISIBLE = 8;

    function renderShipLog(snapshot) {
        var apps = (snapshot.apps || []).slice().sort(function (a, b) {
            return new Date(b.updated) - new Date(a.updated);
        });
        if (!apps.length) { shipLogFallback(); return; }

        var list = document.createElement('ol');
        list.className = 'shiplog-list';

        apps.forEach(function (app, idx) {
            var li = document.createElement('li');
            li.className = 'shiplog-entry';
            if (idx >= SHIPLOG_VISIBLE) { li.hidden = true; }

            var dot = document.createElement('span');
            dot.className = 'shiplog-dot';
            dot.setAttribute('aria-hidden', 'true');

            var body = document.createElement('div');
            body.className = 'shiplog-body';

            var head = document.createElement('div');
            head.className = 'shiplog-head';

            var date = document.createElement('span');
            date.className = 'shiplog-date';
            date.textContent = fmtDate(app.updated);

            var name = document.createElement('a');
            name.className = 'shiplog-app';
            name.href = app.url;
            name.target = '_blank';
            name.rel = 'noopener noreferrer';
            var display = DISPLAY_NAMES[app.id] || app.name;
            name.textContent = display;
            if (display !== app.name) { name.title = 'Published on the App Store as “' + app.name + '”'; }

            var ver = document.createElement('span');
            ver.className = 'shiplog-version';
            ver.textContent = 'v' + app.version;

            head.appendChild(date);
            head.appendChild(name);
            head.appendChild(ver);
            body.appendChild(head);

            var notesText = (app.notes || '').trim();
            if (!notesText && /^1\.0(\.\d+)?$/.test(app.version || '')) {
                notesText = 'Initial App Store release.';
            }
            if (notesText) {
                var notes = document.createElement('p');
                notes.className = 'shiplog-notes';
                notes.textContent = notesText;
                body.appendChild(notes);
            }

            li.appendChild(dot);
            li.appendChild(body);
            list.appendChild(li);
        });

        shipTimeline.innerHTML = '';
        shipTimeline.appendChild(list);

        if (apps.length > SHIPLOG_VISIBLE) {
            var toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'shiplog-toggle';
            toggle.textContent = 'Show all ' + apps.length + ' releases';
            var expanded = false;
            toggle.addEventListener('click', function () {
                expanded = !expanded;
                Array.prototype.forEach.call(list.children, function (li, idx) {
                    if (idx >= SHIPLOG_VISIBLE) { li.hidden = !expanded; }
                });
                toggle.textContent = expanded
                    ? 'Show fewer'
                    : 'Show all ' + apps.length + ' releases';
            });
            shipTimeline.appendChild(toggle);
        }

        if (shipCaption && snapshot.fetched) {
            shipCaption.textContent = 'Data: Apple App Store (iTunes Lookup API), fetched ' + fmtDate(snapshot.fetched) + '.';
            shipCaption.hidden = false;
        }
    }

    function shipLogFallback() {
        if (!shipTimeline) { return; }
        var p = document.createElement('p');
        p.className = 'shiplog-fallback';
        p.textContent = 'Release history is published on each app’s App Store page — see the links in the section above.';
        shipTimeline.innerHTML = '';
        shipTimeline.appendChild(p);
    }

    if (shipTimeline) {
        fetch('assets/data/appstore.json')
            .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })
            .then(renderShipLog)
            .catch(shipLogFallback);
    }

    /* ---------- 2) Open Source & Activity — live GitHub API ---------- */
    var ghStats = document.getElementById('ghStats');
    var ghRepos = document.getElementById('ghRepos');
    var ghFallback = document.getElementById('ghFallback');

    function ghFail() {
        if (ghFallback) {
            ghFallback.innerHTML = '';
            ghFallback.appendChild(document.createTextNode('Live GitHub stats are unavailable right now (API rate limit). Everything is public at '));
            var a = document.createElement('a');
            a.href = 'https://github.com/WeiProduct';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = 'github.com/WeiProduct';
            ghFallback.appendChild(a);
            ghFallback.appendChild(document.createTextNode('.'));
        }
    }

    function ghStatTile(num, label) {
        var tile = document.createElement('div');
        tile.className = 'gh-stat';
        var n = document.createElement('span');
        n.className = 'gh-stat-num';
        n.textContent = num;
        var l = document.createElement('span');
        l.className = 'gh-stat-label';
        l.textContent = label;
        tile.appendChild(n);
        tile.appendChild(l);
        return tile;
    }

    function renderGh(user, repos) {
        ghStats.innerHTML = '';
        ghStats.appendChild(ghStatTile(user.public_repos, 'Public repositories'));
        ghStats.appendChild(ghStatTile(user.followers, 'Followers'));
        ghStats.hidden = false;

        var pool = repos.filter(function (r) { return !r.fork; });
        pool.sort(function (a, b) {
            if (a.name === 'ME') { return -1; }
            if (b.name === 'ME') { return 1; }
            if ((b.stargazers_count || 0) !== (a.stargazers_count || 0)) {
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            }
            return new Date(b.pushed_at) - new Date(a.pushed_at);
        });
        var picks = pool.slice(0, 6);
        if (!picks.length) { ghFail(); return; }

        ghRepos.innerHTML = '';
        picks.forEach(function (repo) {
            var card = document.createElement('div');
            card.className = 'gh-card';

            var h3 = document.createElement('h3');
            var a = document.createElement('a');
            a.href = repo.html_url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            var icon = document.createElement('i');
            icon.className = 'fab fa-github';
            icon.setAttribute('aria-hidden', 'true');
            a.appendChild(icon);
            a.appendChild(document.createTextNode(repo.name));
            h3.appendChild(a);
            card.appendChild(h3);

            var desc = document.createElement('p');
            desc.className = 'gh-desc';
            desc.textContent = repo.description || 'No description provided.';
            card.appendChild(desc);

            var meta = document.createElement('p');
            meta.className = 'gh-meta';
            if (repo.language) {
                var lang = document.createElement('span');
                var dotEl = document.createElement('span');
                dotEl.className = 'gh-lang-dot';
                dotEl.setAttribute('aria-hidden', 'true');
                lang.appendChild(dotEl);
                lang.appendChild(document.createTextNode(repo.language));
                meta.appendChild(lang);
            }
            if (repo.stargazers_count > 0) {
                var stars = document.createElement('span');
                stars.textContent = '★ ' + repo.stargazers_count;
                meta.appendChild(stars);
            }
            var updated = document.createElement('span');
            updated.textContent = 'Updated ' + fmtDate(repo.pushed_at);
            meta.appendChild(updated);
            card.appendChild(meta);

            ghRepos.appendChild(card);
        });
        ghRepos.hidden = false;
        if (ghFallback) { ghFallback.hidden = true; }
    }

    if (ghStats && ghRepos) {
        Promise.all([
            fetch('https://api.github.com/users/WeiProduct').then(function (r) {
                if (!r.ok) { throw new Error(r.status); } return r.json();
            }),
            fetch('https://api.github.com/users/WeiProduct/repos?per_page=100&sort=pushed').then(function (r) {
                if (!r.ok) { throw new Error(r.status); } return r.json();
            })
        ]).then(function (res) {
            try { renderGh(res[0], res[1]); } catch (e) { ghFail(); }
        }).catch(ghFail);
    }

    /* ---------- 3) A11y layer ---------- */
    // aria-labels for icon-only links/buttons
    Array.prototype.forEach.call(document.querySelectorAll('.social-links a:not([aria-label])'), function (a) {
        var href = a.getAttribute('href') || '';
        if (href.indexOf('github') >= 0) { a.setAttribute('aria-label', 'GitHub profile'); }
        else if (href.indexOf('linkedin') >= 0) { a.setAttribute('aria-label', 'LinkedIn profile'); }
        else { a.setAttribute('aria-label', 'External profile'); }
    });
    Array.prototype.forEach.call(document.querySelectorAll('button[title]:not([aria-label])'), function (b) {
        b.setAttribute('aria-label', b.getAttribute('title'));
    });
    var sendBtn = document.querySelector('.chat-send');
    if (sendBtn && !sendBtn.getAttribute('aria-label')) { sendBtn.setAttribute('aria-label', 'Send message'); }
    var minBtn = document.getElementById('chatMinimize');
    if (minBtn && !minBtn.getAttribute('aria-label')) { minBtn.setAttribute('aria-label', 'Minimize chat'); }

    // Scroll-reveal safety: honor prefers-reduced-motion and add a
    // fallback so content can never stay stuck at opacity 0.
    function revealSection(s, instant) {
        if (instant) { s.style.transition = 'none'; }
        s.style.opacity = '1';
        s.style.transform = 'none';
    }
    var prefersReduced = false;
    try { prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    document.addEventListener('DOMContentLoaded', function () {
        var sections = document.querySelectorAll('section:not(.hero)');
        if (prefersReduced) {
            Array.prototype.forEach.call(sections, function (s) { revealSection(s, true); });
            return;
        }
        function sweep() {
            Array.prototype.forEach.call(sections, function (s) {
                var rect = s.getBoundingClientRect();
                var visible = rect.top < window.innerHeight + 80 && rect.bottom > -80;
                if (visible && parseFloat(window.getComputedStyle(s).opacity) < 0.9) {
                    revealSection(s, false);
                }
            });
        }
        setTimeout(sweep, 2500);
        window.addEventListener('load', function () { setTimeout(sweep, 1500); });
    });

    /* ---------- 4) Coursework → proof chips ---------- */
    var CHIP_MAP = [
        {
            match: 'Machine Learning',
            chips: [
                ['Food Calories (AI vision)', 'https://apps.apple.com/app/id6748717022'],
                ['AI Weather (LLM insights)', 'https://apps.apple.com/app/id6748373741'],
                ['Dating Chat (agentic coach)', 'https://apps.apple.com/app/id6748549192']
            ]
        },
        {
            match: 'Software Development',
            chips: [
                ['AI Calendar', 'https://apps.apple.com/app/id6748324487'],
                ['AI Voice Notes', 'https://apps.apple.com/app/id6748947046'],
                ['This site (open source)', 'https://github.com/WeiProduct/ME']
            ]
        },
        {
            match: 'FinTech',
            chips: [
                ['Piggy Accounting', 'https://apps.apple.com/app/id6748370595'],
                ['17 apps shipped as a solo business', '#apps']
            ]
        },
        {
            match: 'Data & Analytics',
            chips: [
                ['Habits (streaks & charts)', 'https://apps.apple.com/app/id6748370992'],
                ['AI Vocabulary (18k-word dataset)', 'https://apps.apple.com/app/id6748568205'],
                ['Piggy Accounting (spending stats)', 'https://apps.apple.com/app/id6748370595']
            ]
        }
    ];
    Array.prototype.forEach.call(document.querySelectorAll('.coursework-category'), function (cat) {
        var h3 = cat.querySelector('h3');
        if (!h3) { return; }
        var entry = null;
        CHIP_MAP.forEach(function (e) {
            if (h3.textContent.indexOf(e.match) >= 0) { entry = e; }
        });
        if (!entry) { return; }
        var wrap = document.createElement('div');
        wrap.className = 'applied-chips';
        var label = document.createElement('span');
        label.className = 'applied-label';
        label.textContent = 'Applied in →';
        wrap.appendChild(label);
        entry.chips.forEach(function (c) {
            var a = document.createElement('a');
            a.className = 'applied-chip';
            a.textContent = c[0];
            a.href = c[1];
            if (c[1].charAt(0) !== '#') {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            wrap.appendChild(a);
        });
        cat.appendChild(wrap);
    });

    /* ---------- 5) Contact quick actions + FAQ twin link ---------- */
    function copyText(text, done) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, done); });
        } else { legacyCopy(text, done); }
    }
    function legacyCopy(text, done) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
    }
    var copyBtn = document.getElementById('copyEmailBtn');
    if (copyBtn) {
        var copyBtnHTML = copyBtn.innerHTML;
        copyBtn.addEventListener('click', function () {
            copyText(copyBtn.getAttribute('data-email') || '', function () {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(function () {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = copyBtnHTML;
                }, 2000);
            });
        });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.faq-twin-link'), function (b) {
        b.addEventListener('click', function () {
            openTwin('Walk me through what you could demo in an interview.');
        });
    });

    /* ---------- 6) Command palette (Cmd/Ctrl+K) ---------- */
    var cmdk = { overlay: null, input: null, list: null, items: [], active: 0 };

    function paletteCommands(query) {
        var cmds = [];
        var sections = [
            ['home', 'Home'], ['about', 'About'], ['coursework', 'Coursework'],
            ['apps', 'iOS Apps'], ['ship-log', 'Ship Log'], ['featured', 'Featured Screens'],
            ['architecture', 'Engineering Deep Dive'], ['open-source', 'Open Source & Activity'],
            ['how-i-work', 'How I Work'], ['skills', 'Skills'], ['tech-stack', 'Tech Stack'],
            ['faq', 'Recruiter FAQ'], ['contact', 'Contact']
        ];
        sections.forEach(function (s) {
            var el = document.getElementById(s[0]);
            if (!el) { return; }
            cmds.push({
                label: s[1], hint: 'Jump to section', icon: 'fas fa-hashtag',
                run: function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        });
        Array.prototype.forEach.call(document.querySelectorAll('.apps-grid .app-card'), function (card) {
            var h3 = card.querySelector('h3');
            var link = card.querySelector('a[href*="apps.apple.com"]');
            if (!h3 || !link) { return; }
            cmds.push({
                label: h3.textContent.trim(), hint: 'Open on the App Store', icon: 'fab fa-app-store',
                run: function () { window.open(link.href, '_blank', 'noopener'); }
            });
        });
        cmds.push({
            label: 'Toggle dark mode', hint: 'Theme', icon: 'fas fa-moon',
            run: function () {
                var t = document.getElementById('themeToggle');
                if (t) { t.click(); }
            }
        });
        cmds.push({
            label: 'Download résumé (PDF)', hint: 'Wei_Fu_Resume.pdf', icon: 'fas fa-file-pdf',
            run: function () { window.location.href = 'Wei_Fu_Resume.pdf'; }
        });
        cmds.push({
            label: 'Open résumé (web)', hint: 'resume.html', icon: 'fas fa-file-lines',
            run: function () { window.location.href = 'resume.html'; }
        });
        cmds.push({
            label: 'Copy email address', hint: 'founder@weiproduct.com', icon: 'fas fa-copy',
            run: function () { copyText('founder@weiproduct.com', function () {}); }
        });
        cmds.push({
            label: 'Ask my AI twin', hint: 'Open chat', icon: 'fas fa-robot',
            run: function () { openTwin(); }
        });
        if (query && query.trim() && query.trim() !== '?') {
            cmds.push({
                label: 'Ask my AI twin: “' + query.trim() + '”',
                hint: 'Send as prompt', icon: 'fas fa-robot',
                alwaysShow: true,
                run: function () { openTwin(query.trim()); }
            });
        }
        return cmds;
    }

    function fuzzyScore(query, label) {
        var q = query.toLowerCase();
        var l = label.toLowerCase();
        if (!q) { return 1; }
        var qi = 0, score = 0, streak = 0;
        for (var i = 0; i < l.length && qi < q.length; i++) {
            if (l[i] === q[qi]) {
                streak += 1;
                score += 1 + streak;
                if (i === 0 || l[i - 1] === ' ' || l[i - 1] === '-') { score += 4; }
                qi += 1;
            } else {
                streak = 0;
            }
        }
        return qi === q.length ? score : 0;
    }

    var HELP_ROWS = [
        ['⌘K / Ctrl+K', 'Open or close this palette'],
        ['?', 'Show these shortcuts'],
        ['↑ ↓', 'Navigate results'],
        ['Enter', 'Run the selected command'],
        ['Esc', 'Close palette / lightbox / chat overlay'],
        ['Type anything', 'Fuzzy-match sections, apps and actions — or send it to the AI twin']
    ];

    function renderPalette() {
        var query = cmdk.input.value;
        cmdk.list.innerHTML = '';
        cmdk.items = [];

        if (query.trim() === '?') {
            var title = document.createElement('div');
            title.className = 'cmdk-help-title';
            title.textContent = 'Keyboard shortcuts';
            cmdk.list.appendChild(title);
            HELP_ROWS.forEach(function (row) {
                var div = document.createElement('div');
                div.className = 'cmdk-item';
                var kbd = document.createElement('span');
                kbd.className = 'cmdk-kbd';
                kbd.textContent = row[0];
                var txt = document.createElement('span');
                txt.textContent = row[1];
                txt.style.marginLeft = '0.4rem';
                div.appendChild(kbd);
                div.appendChild(txt);
                cmdk.list.appendChild(div);
            });
            return;
        }

        var scored = [];
        paletteCommands(query).forEach(function (c) {
            var s = c.alwaysShow ? 0.5 : fuzzyScore(query, c.label + ' ' + c.hint);
            if (s > 0) { scored.push({ cmd: c, score: s }); }
        });
        scored.sort(function (a, b) { return b.score - a.score; });
        scored = scored.slice(0, 12);

        if (!scored.length) {
            var empty = document.createElement('div');
            empty.className = 'cmdk-empty';
            empty.textContent = 'No matches. Press Enter to ask the AI twin, or ? for shortcuts.';
            cmdk.list.appendChild(empty);
            return;
        }

        scored.forEach(function (s, idx) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cmdk-item' + (idx === 0 ? ' active' : '');
            btn.setAttribute('role', 'option');
            btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
            var icon = document.createElement('i');
            icon.className = s.cmd.icon;
            icon.setAttribute('aria-hidden', 'true');
            var label = document.createElement('span');
            label.textContent = s.cmd.label;
            var hint = document.createElement('span');
            hint.className = 'cmdk-item-hint';
            hint.textContent = s.cmd.hint;
            btn.appendChild(icon);
            btn.appendChild(label);
            btn.appendChild(hint);
            btn.addEventListener('click', function () { runCommand(s.cmd); });
            cmdk.list.appendChild(btn);
            cmdk.items.push(btn);
        });
        cmdk.active = 0;
    }

    function runCommand(cmd) {
        closePalette();
        cmd.run();
    }

    function setActive(idx) {
        if (!cmdk.items.length) { return; }
        cmdk.active = (idx + cmdk.items.length) % cmdk.items.length;
        cmdk.items.forEach(function (el, i) {
            el.classList.toggle('active', i === cmdk.active);
            el.setAttribute('aria-selected', i === cmdk.active ? 'true' : 'false');
        });
        cmdk.items[cmdk.active].scrollIntoView({ block: 'nearest' });
    }

    function ensurePalette() {
        if (cmdk.overlay) { return; }
        var overlay = document.createElement('div');
        overlay.className = 'cmdk-overlay';
        overlay.hidden = true;

        var box = document.createElement('div');
        box.className = 'cmdk-box';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', 'Command palette');

        var input = document.createElement('input');
        input.className = 'cmdk-input';
        input.type = 'text';
        input.placeholder = 'Jump to a section, open an app, or ask the AI twin…';
        input.setAttribute('aria-label', 'Command palette search');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');

        var list = document.createElement('div');
        list.className = 'cmdk-list';
        list.setAttribute('role', 'listbox');

        var footer = document.createElement('div');
        footer.className = 'cmdk-footer';
        [['↑↓', 'navigate'], ['Enter', 'run'], ['Esc', 'close'], ['?', 'shortcuts']].forEach(function (pair) {
            var span = document.createElement('span');
            var kbd = document.createElement('span');
            kbd.className = 'cmdk-kbd';
            kbd.textContent = pair[0];
            span.appendChild(kbd);
            span.appendChild(document.createTextNode(' ' + pair[1]));
            footer.appendChild(span);
        });

        box.appendChild(input);
        box.appendChild(list);
        box.appendChild(footer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) { closePalette(); }
        });
        input.addEventListener('input', renderPalette);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(cmdk.active + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(cmdk.active - 1); }
            else if (e.key === 'Enter') {
                e.preventDefault();
                if (cmdk.items[cmdk.active]) { cmdk.items[cmdk.active].click(); }
                else if (input.value.trim() && input.value.trim() !== '?') {
                    var q = input.value.trim();
                    closePalette();
                    openTwin(q);
                }
            }
        });

        cmdk.overlay = overlay;
        cmdk.input = input;
        cmdk.list = list;
    }

    function openPalette(prefill) {
        ensurePalette();
        cmdk.overlay.hidden = false;
        cmdk.input.value = prefill || '';
        renderPalette();
        setTimeout(function () { cmdk.input.focus(); }, 0);
    }
    function closePalette() {
        if (cmdk.overlay) { cmdk.overlay.hidden = true; }
    }
    function paletteOpen() {
        return cmdk.overlay && !cmdk.overlay.hidden;
    }

    document.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') {
            e.preventDefault();
            if (paletteOpen()) { closePalette(); } else { openPalette(); }
            return;
        }
        if (e.key === 'Escape' && paletteOpen()) { closePalette(); return; }
        if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey && !paletteOpen()) {
            var t = e.target;
            var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || (t && t.isContentEditable)) { return; }
            e.preventDefault();
            openPalette('?');
        }
    });
    var cmdkHintBtn = document.getElementById('cmdkHint');
    if (cmdkHintBtn) {
        cmdkHintBtn.addEventListener('click', function () { openPalette(); });
    }
}());
