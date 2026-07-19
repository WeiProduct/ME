// Chat Widget — Wei Fu's AI digital twin.
// Talks to the hardened Vercel proxy (api/chat-proxy.js in this repo).
// The system prompt below is PUBLIC by design: it contains only verified,
// published facts. The proxy enforces model/origin allow-lists and size caps.
const chatWidget = document.getElementById('chatWidget');
const chatToggle = document.getElementById('chatToggle');
const chatMinimize = document.getElementById('chatMinimize');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const voiceToggleBtn = document.getElementById('voiceToggle');
const fullscreenToggleBtn = document.getElementById('fullscreenToggle');

// ---------------------------------------------------------------------------
// Persona: every statement here is a verified public fact. Nothing else may
// be asserted by the twin as fact.
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are the AI digital twin of Wei Fu on his portfolio site. Speak AS Wei, first person. Reply in the visitor's language (English or 中文).

WHO I AM
- Mobile/iOS software engineer; founder of WeiProduct, an AI consumer-product studio. San Francisco Bay Area. Bilingual English/Chinese.
- Open to iOS / AI / software-engineering roles. Work authorization: F-1 OPT, seeking H-1B sponsorship.
- Contact: weifu@umass.edu (personal/recruiting), founder@weiproduct.com (company/investors). Links: weiproduct.com, weifuandy.com, github.com/WeiProduct, linkedin.com/in/wei-fu-004724256. Résumé: Wei_Fu_Resume.pdf on this site.

EDUCATION
- UMass Amherst, dual B.S. Computer Science + Managerial Economics (May 2025). GPA 3.63/4.00, Dean's List 5 semesters, 4-year merit scholarship.
- A/A− coursework: Artificial Intelligence, Machine Learning, Operating Systems, Computer Networks, Software Entrepreneurship, Data Management, Money & Banking, Fundamentals of Finance, Managerial Economics.

PORTFOLIO
- 18 iOS apps built. 17 are live on the App Store; all 17 first releases shipped within four weeks (Jul 9 – Aug 6, 2025, Apple data). 15 of 17 have shipped post-1.0 updates.
- Live apps (name=id; public link format https://apps.apple.com/app/id<ID>): AI Calendar=6748324487, Piggy Finance/记账2=6748370595, WeiRabits=6748370992, AI Weather/WeathersPro=6748373741, AI Pomodoro Timer=6748548518, AI Vocabulary=6748568205, Food Calories=6748717022, Dating Chat=6748549192, AI Platform=6748650326, AI Smart Light=6749024443, AI Meditation=6749164175, Dailymatters=6749191628, AI Daily Matters=6749191633, AIMBTI=6749165632, AI Drink Water=6749274211, AI Note=6749283592, AI Voice Notes=6748947046.
- ilink is the 18th app and is submitted for App Store review, not yet publicly downloadable. It turns longer family voice updates into one or two AI-generated sentences, preserves the original transcript, and can regenerate the summary. It is designed for family check-ins, especially between older parents and adult children.

ENGINEERING
- SwiftUI + SwiftData clients. Hardened per-app Vercel serverless proxies: origin/model allow-lists, server-side key management. OpenAI, Whisper, Claude and Gemini integrations. XCTest/XCUITest suites in multiple apps. App Store Connect API release automation. Products are bilingual EN/中文.

WEIPRODUCT (company thesis)
- 18 focused AI agents across 5 life domains (productivity, finance, learning, wellness, utility and family use cases) that connect into one personal context layer.
- Roadmap: Phase 1 focused agents (shipped) → Phase 2 cross-agent context (in progress) → Phase 3 unified personal decision layer (planned).
- Moat framing: shared agent infrastructure + compounding cross-agent context + shipping velocity. No public traction metrics yet.

RULES
- Concise by default: 2–5 sentences. Use a short "-" bullet list only when listing several apps, courses or steps.
- The facts above are the COMPLETE public knowledge base. Never invent facts, metrics, downloads, revenue or user counts. If asked for numbers or details not listed here (e.g. downloads, revenue, users), say they aren't published yet and offer weifu@umass.edu.
- Stay within Wei's public professional scope (work, apps, engineering, education, availability, WeiProduct). Politely decline personal, political or unrelated questions and steer back to Wei's work.
- When useful to a recruiter, point to the résumé (Wei_Fu_Resume.pdf on this site) and weifu@umass.edu.
- Formatting: plain sentences; you may use **bold**, "-" bullet lists, and markdown links [label](https://...).`;

// ---------------------------------------------------------------------------
// API configuration — hardened proxy (origin allow-list includes
// weiproduct.github.io, weiproduct.com and localhost:5000 for dev).
// ---------------------------------------------------------------------------
const API_ENDPOINT = 'https://personal-portfolio-api-sandy.vercel.app/api/chat-proxy';
const CHAT_MODEL = 'gpt-4o-mini';
const CHAT_TEMPERATURE = 0.5;
const CHAT_MAX_TOKENS = 700;
const HISTORY_LIMIT = 12;          // messages kept per request (proxy caps at 20)
const CHAR_BUDGET = 7600;          // stay under the proxy's 8000-char cap

// In-session conversation (user + assistant turns; greeting excluded).
const conversation = [];
let awaitingReply = false;

function buildMessages() {
    const msgs = conversation.slice(-HISTORY_LIMIT);
    let total = SYSTEM_PROMPT.length +
        msgs.reduce((n, m) => n + m.content.length, 0);
    while (msgs.length > 1 && total > CHAR_BUDGET) {
        total -= msgs[0].content.length;
        msgs.shift();
    }
    return [{ role: 'system', content: SYSTEM_PROMPT }].concat(msgs);
}

// ---------------------------------------------------------------------------
// Markdown-lite rendering (sanitized). Input is escaped FIRST, then a small
// set of patterns is converted: **bold**, `code`, [label](https://...) links,
// "-"/"*" bullet lists, "1." numbered lists. Only http(s) hrefs are allowed.
// ---------------------------------------------------------------------------
function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderInline(escaped) {
    let s = escaped;
    // [label](https://url) — href restricted to http(s)
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        (m, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Autolink bare http(s) URLs not already inside an attribute/label
    s = s.replace(/(^|[\s(（])(https?:\/\/[^\s<)）]+)/g,
        (m, pre, url) => `${pre}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    return s;
}

function renderMarkdown(text) {
    const lines = escapeHtml(text).split(/\r?\n/);
    let html = '';
    let inUl = false;
    let inOl = false;
    let para = [];
    const flushPara = () => {
        if (para.length) {
            html += '<p>' + para.map(renderInline).join('<br>') + '</p>';
            para = [];
        }
    };
    const closeLists = () => {
        if (inUl) { html += '</ul>'; inUl = false; }
        if (inOl) { html += '</ol>'; inOl = false; }
    };
    lines.forEach((line) => {
        const l = line.trim();
        const mUl = l.match(/^[-*•]\s+(.*)$/);
        const mOl = l.match(/^\d{1,2}[.)]\s+(.*)$/);
        const mH = l.match(/^#{1,4}\s+(.*)$/);
        if (mUl) {
            flushPara();
            if (inOl) { html += '</ol>'; inOl = false; }
            if (!inUl) { html += '<ul>'; inUl = true; }
            html += '<li>' + renderInline(mUl[1]) + '</li>';
        } else if (mOl) {
            flushPara();
            if (inUl) { html += '</ul>'; inUl = false; }
            if (!inOl) { html += '<ol>'; inOl = true; }
            html += '<li>' + renderInline(mOl[1]) + '</li>';
        } else if (mH) {
            flushPara();
            closeLists();
            html += '<p><strong>' + renderInline(mH[1]) + '</strong></p>';
        } else if (!l) {
            flushPara();
            closeLists();
        } else {
            closeLists();
            para.push(l);
        }
    });
    flushPara();
    closeLists();
    return html;
}

// ---------------------------------------------------------------------------
// Widget open/close + focus management
// ---------------------------------------------------------------------------
const GREETING = "Hi — I'm Wei's AI twin, speaking as Wei. iOS/AI engineer, founder of WeiProduct, **18 apps built — 17 live and ilink in review**. Ask me about my apps, architecture, coursework or availability — English or 中文 both work.";

function openChat() {
    chatWidget.classList.add('active');
    chatToggle.style.display = 'none';
    chatToggle.setAttribute('aria-expanded', 'true');
    if (chatMessages.children.length === 0) {
        addMessage('bot', GREETING);
        renderSuggestions(GREETING);
    }
    setTimeout(() => { try { chatInput.focus(); } catch (e) {} }, 60);
}

function closeChat() {
    chatWidget.classList.remove('active');
    chatToggle.style.display = 'flex';
    chatToggle.setAttribute('aria-expanded', 'false');
    try { chatToggle.focus(); } catch (e) {}
}

// Toggle chat widget (hero chips / Cmd+K rely on chatToggle.click())
chatToggle.addEventListener('click', () => {
    if (chatWidget.classList.contains('active')) { closeChat(); }
    else { openChat(); }
});

// Minimize chat widget
chatMinimize.addEventListener('click', closeChat);

// Esc closes the chat (unless the command palette or lightbox owns Esc)
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!chatWidget.classList.contains('active')) return;
    const palette = document.querySelector('.cmdk-overlay');
    if (palette && !palette.hidden) return;
    const lightbox = document.querySelector('.lightbox.open');
    if (lightbox) return;
    closeChat();
});

// Toggle voice functionality
voiceToggleBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    voiceToggleBtn.classList.toggle('active', voiceEnabled);

    const icon = voiceToggleBtn.querySelector('i');
    if (voiceEnabled) {
        icon.className = 'fas fa-volume-up';
        if (window.speechSynthesis) {
            setTimeout(() => {
                speakMessage('Voice enabled.');
            }, 100);
        }
    } else {
        icon.className = 'fas fa-volume-mute';
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
});

// Toggle fullscreen mode
fullscreenToggleBtn.addEventListener('click', () => {
    chatWidget.classList.toggle('fullscreen');
    const icon = fullscreenToggleBtn.querySelector('i');

    if (chatWidget.classList.contains('fullscreen')) {
        icon.className = 'fas fa-compress';
        fullscreenToggleBtn.title = 'Exit fullscreen';
    } else {
        icon.className = 'fas fa-expand';
        fullscreenToggleBtn.title = 'Toggle fullscreen';
    }
});

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------
function weiAvatar(thinking) {
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'wei-avatar';
    avatarDiv.setAttribute('aria-hidden', 'true');
    avatarDiv.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#000" class="avatar-main"/>
            <text x="20" y="26" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#fff">W</text>
            <circle cx="20" cy="20" r="17" fill="none" stroke="#007bff" stroke-width="2" class="avatar-pulse${thinking ? ' thinking' : ''}" opacity="0.5"/>
        </svg>`;
    return avatarDiv;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add message to chat with avatar. Bot messages get sanitized markdown-lite.
function addMessage(sender, text) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${sender}`;

    if (sender === 'bot') {
        messageContainer.appendChild(weiAvatar(false));
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    if (sender === 'bot') {
        messageDiv.innerHTML = renderMarkdown(text);
    } else {
        messageDiv.textContent = text;
    }
    messageContainer.appendChild(messageDiv);

    chatMessages.appendChild(messageContainer);
    scrollToBottom();

    if (sender === 'bot' && window.speechSynthesis && voiceEnabled) {
        speakMessage(text.replace(/\*\*/g, '').replace(/`/g, ''));
    }
    return messageContainer;
}

// ---------------------------------------------------------------------------
// Suggested follow-up chips (static pool, picked by simple keyword affinity)
// ---------------------------------------------------------------------------
const CHIP_POOL = [
    { label: 'Walk me through the 18 apps', prompt: 'Walk me through your 18 apps — what are the highlights?', keys: ['app', 'ship', 'built', 'portfolio', 'store'] },
    { label: 'How are they architected?', prompt: 'How are your apps architected? Walk me through the stack.', keys: ['architect', 'stack', 'swiftui', 'swiftdata', 'engineering', 'tech'] },
    { label: 'API key security', prompt: 'How do your Vercel proxies keep API keys safe?', keys: ['proxy', 'security', 'key', 'vercel', 'server'] },
    { label: 'Work authorization', prompt: 'What is your work authorization status?', keys: ['visa', 'authorization', 'opt', 'h-1b', 'h1b', 'sponsor'] },
    { label: 'Roles & availability', prompt: 'What roles are you looking for, and when can you start?', keys: ['role', 'hire', 'available', 'job', 'recruit', 'start'] },
    { label: 'Coursework & GPA', prompt: 'Which CS and economics courses did you do best in?', keys: ['course', 'gpa', 'umass', 'degree', 'education', 'study'] },
    { label: "WeiProduct's vision", prompt: "What is WeiProduct's long-term vision and roadmap?", keys: ['weiproduct', 'company', 'vision', 'roadmap', 'agent', 'founder', 'thesis'] },
    { label: 'Shipping velocity', prompt: 'How did you ship 17 apps in four weeks?', keys: ['four weeks', 'velocity', 'fast', 'ship', 'automation'] },
    { label: 'Testing approach', prompt: 'How do you test your apps?', keys: ['test', 'xctest', 'xcuitest', 'quality'] },
    { label: 'AI integrations', prompt: 'Which AI models do you integrate, and how?', keys: ['openai', 'gemini', 'claude', 'whisper', 'model', 'llm', 'ai'] },
    { label: 'Contact Wei', prompt: 'How can I contact Wei about a role?', keys: ['contact', 'email', 'reach', 'resume', 'résumé'] },
    { label: '用中文介绍一下', prompt: '请用中文介绍一下你自己和你的应用。', keys: ['中文', '介绍', '应用'] }
];
const usedPrompts = new Set();

function removeSuggestions() {
    const old = chatMessages.querySelector('.chat-suggestions');
    if (old) old.remove();
}

function renderSuggestions(contextText) {
    removeSuggestions();
    const ctx = (contextText || '').toLowerCase();
    const scored = CHIP_POOL
        .filter((c) => !usedPrompts.has(c.prompt))
        .map((c) => ({
            c,
            score: c.keys.reduce((n, k) => n + (ctx.includes(k) ? 1 : 0), 0)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((s) => s.c);
    if (!scored.length) return;

    const row = document.createElement('div');
    row.className = 'chat-suggestions';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Suggested questions');
    scored.forEach((chip) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chat-suggestion-chip';
        btn.textContent = chip.label;
        btn.addEventListener('click', () => {
            usedPrompts.add(chip.prompt);
            sendUserMessage(chip.prompt);
        });
        row.appendChild(btn);
    });
    chatMessages.appendChild(row);
    scrollToBottom();
}

// ---------------------------------------------------------------------------
// Typing indicator / error state
// ---------------------------------------------------------------------------
let typingContainer = null;

function showTyping() {
    removeTyping();
    typingContainer = document.createElement('div');
    typingContainer.className = 'message-container bot typing-container';
    typingContainer.setAttribute('aria-hidden', 'true');
    typingContainer.appendChild(weiAvatar(true));
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.innerHTML = '<span class="typing-indicator"><i class="fas fa-circle"></i><i class="fas fa-circle"></i><i class="fas fa-circle"></i></span>';
    typingContainer.appendChild(typingDiv);
    chatMessages.appendChild(typingContainer);
    scrollToBottom();
}

function removeTyping() {
    if (typingContainer) {
        typingContainer.remove();
        typingContainer = null;
    }
}

function showError() {
    const container = document.createElement('div');
    container.className = 'message-container bot chat-error-container';
    container.appendChild(weiAvatar(false));

    const bubble = document.createElement('div');
    bubble.className = 'chat-message bot chat-error';
    const p = document.createElement('p');
    p.textContent = "Sorry — I couldn't reach the server just now. You can retry, or email me directly at weifu@umass.edu.";
    bubble.appendChild(p);

    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'chat-retry-btn';
    retryBtn.innerHTML = '<i class="fas fa-rotate-right" aria-hidden="true"></i> Retry';
    retryBtn.addEventListener('click', () => {
        container.remove();
        requestReply();
    });
    bubble.appendChild(retryBtn);

    container.appendChild(bubble);
    chatMessages.appendChild(container);
    scrollToBottom();
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------
async function requestReply() {
    if (awaitingReply) return;
    awaitingReply = true;
    showTyping();
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: CHAT_MODEL,
                messages: buildMessages(),
                temperature: CHAT_TEMPERATURE,
                max_tokens: CHAT_MAX_TOKENS
            })
        });

        if (!response.ok) {
            throw new Error('API request failed: ' + response.status);
        }

        const data = await response.json();
        const botResponse = data && data.choices && data.choices[0] &&
            data.choices[0].message ? data.choices[0].message.content : '';
        if (!botResponse) {
            throw new Error('Empty response');
        }

        conversation.push({ role: 'assistant', content: botResponse });
        removeTyping();
        addMessage('bot', botResponse);
        const lastUser = conversation.filter((m) => m.role === 'user').slice(-1)[0];
        renderSuggestions(((lastUser && lastUser.content) || '') + ' ' + botResponse);
    } catch (error) {
        console.error('Chat error:', error);
        removeTyping();
        showError();
    } finally {
        awaitingReply = false;
    }
}

function sendUserMessage(text) {
    const msg = (text || '').trim();
    if (!msg || awaitingReply) return;
    removeSuggestions();
    addMessage('user', msg);
    conversation.push({ role: 'user', content: msg });
    requestReply();
}

// Handle form submission (hero chips + Cmd+K palette call requestSubmit here)
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    chatInput.value = '';
    autosizeInput();
    sendUserMessage(userMessage);
});

// Input autosize + Enter-to-send (Shift+Enter for a newline)
function autosizeInput() {
    if (chatInput.tagName !== 'TEXTAREA') return;
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
}
chatInput.addEventListener('input', autosizeInput);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (typeof chatForm.requestSubmit === 'function') { chatForm.requestSubmit(); }
        else { chatForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }
    }
});

// ---------------------------------------------------------------------------
// Voice synthesis (existing feature, kept)
// ---------------------------------------------------------------------------
let voiceEnabled = false;
let selectedVoice = null;

const voicePreferences = {
    preferred: [
        'Google UK English Male',
        'Microsoft David - English (United States)',
        'Microsoft Mark - English (United States)',
        'Daniel',
        'Alex',
        'Fred',
        'Bruce',
        'Junior',
        'Ralph'
    ],
    deepVoiceKeywords: ['david', 'mark', 'daniel', 'alex', 'fred', 'bruce', 'ralph', 'male', 'man'],
    avoidKeywords: ['female', 'woman', 'girl', 'child', 'kid', 'samantha', 'victoria', 'karen']
};

function initVoices() {
    const voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
        setTimeout(initVoices, 100);
        return;
    }

    const scoredVoices = voices
        .filter(voice => voice.lang.startsWith('en'))
        .map(voice => {
            let score = 0;
            const nameLower = voice.name.toLowerCase();

            if (voicePreferences.preferred.some(pref => nameLower.includes(pref.toLowerCase()))) {
                score += 100;
            }
            voicePreferences.deepVoiceKeywords.forEach(keyword => {
                if (nameLower.includes(keyword)) { score += 50; }
            });
            voicePreferences.avoidKeywords.forEach(keyword => {
                if (nameLower.includes(keyword)) { score -= 100; }
            });
            if (voice.lang === 'en-US' || voice.lang === 'en-GB') { score += 25; }
            if (nameLower.includes('google')) { score += 30; }
            if (nameLower.includes('microsoft')) { score += 20; }

            return { voice, score };
        })
        .sort((a, b) => b.score - a.score);

    selectedVoice = scoredVoices[0]?.voice || voices[0];
}

function speakMessage(text) {
    if (!window.speechSynthesis || !selectedVoice) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 0.85;
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
    };
    window.speechSynthesis.speak(utterance);
}

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = initVoices;
    initVoices();
}

// Debug helpers (kept — callable from the console)
window.listAvailableVoices = function () {
    const voices = window.speechSynthesis.getVoices();
    voices.forEach((voice, index) => {
        console.log(`${index}: ${voice.name} (${voice.lang})`);
    });
    return voices;
};

window.selectVoiceByIndex = function (index) {
    const voices = window.speechSynthesis.getVoices();
    if (index >= 0 && index < voices.length) {
        selectedVoice = voices[index];
        return true;
    }
    return false;
};

window.testVoice = function (message = "Hello, I'm Wei Fu.") {
    if (!voiceEnabled) {
        voiceEnabled = true;
        voiceToggleBtn.classList.add('active');
        const icon = voiceToggleBtn.querySelector('i');
        icon.className = 'fas fa-volume-up';
    }
    speakMessage(message);
};

// ---------------------------------------------------------------------------
// Styles. Colors flow through --chat-* variables (light defaults inline;
// dark values are provided additively by css/enhance.css [data-theme=dark]).
// ---------------------------------------------------------------------------
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .chat-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 450px;
        max-width: 95vw;
        height: 650px;
        max-height: 85vh;
        background: var(--chat-surface, #ffffff);
        border-radius: 16px;
        box-shadow: var(--chat-shadow, 0 10px 40px rgba(0, 0, 0, 0.15));
        border: 1px solid var(--chat-border, transparent);
        display: none;
        flex-direction: column;
        z-index: 1000;
        transition: all 0.3s ease;
    }

    .chat-widget.active {
        display: flex;
    }

    .chat-widget.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
        margin: 0;
    }

    .chat-widget.fullscreen .chat-header {
        border-radius: 0;
    }

    .fullscreen-toggle {
        background: none;
        border: none;
        color: #ffffff;
        cursor: pointer;
        font-size: 16px;
        padding: 5px;
        transition: opacity 0.3s;
    }

    .fullscreen-toggle:hover {
        opacity: 0.8;
    }

    .chat-header {
        background: var(--chat-header-bg, var(--primary-color, #000000));
        color: #ffffff;
        padding: 20px;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .chat-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .chat-header h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
    }

    .chat-header-subtitle {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 2px;
    }

    .chat-header-controls {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .voice-toggle {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
    }

    .voice-toggle.active {
        background: #007bff;
        border-color: #007bff;
    }

    .voice-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .chat-minimize {
        background: none;
        border: none;
        color: #ffffff;
        cursor: pointer;
        font-size: 16px;
        padding: 5px;
        transition: opacity 0.3s;
    }

    .chat-minimize:hover {
        opacity: 0.8;
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: var(--chat-messages-bg, #f8f9fa);
    }

    .message-container {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        gap: 12px;
    }

    .message-container.user {
        flex-direction: row-reverse;
    }

    .wei-avatar {
        flex-shrink: 0;
    }

    .wei-avatar svg {
        display: block;
    }

    .avatar-pulse {
        animation: pulse 2s ease-in-out infinite;
    }

    .avatar-pulse.thinking {
        animation: thinking-pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
        0% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
        100% { opacity: 0.3; transform: scale(1); }
    }

    @keyframes thinking-pulse {
        0% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.1); }
        100% { opacity: 0.2; transform: scale(1); }
    }

    .chat-message {
        padding: 12px 18px;
        border-radius: 20px;
        max-width: 80%;
        word-wrap: break-word;
        font-size: 15px;
        line-height: 1.5;
    }

    .chat-message.user {
        background: var(--chat-bubble-user-bg, var(--primary-color, #000000));
        color: #ffffff;
        text-align: right;
        white-space: pre-wrap;
    }

    .chat-message.bot {
        background: var(--chat-bubble-bot-bg, #e9ecef);
        color: var(--chat-bubble-bot-text, #333333);
    }

    .chat-message.bot p { margin: 0 0 8px; }
    .chat-message.bot p:last-child { margin-bottom: 0; }
    .chat-message.bot ul, .chat-message.bot ol {
        margin: 4px 0 8px;
        padding-left: 20px;
    }
    .chat-message.bot li { margin: 2px 0; }
    .chat-message.bot a {
        color: var(--chat-link, var(--primary-color, #2563eb));
        text-decoration: underline;
        text-underline-offset: 2px;
        word-break: break-all;
    }
    .chat-message.bot code {
        background: var(--chat-code-bg, rgba(0, 0, 0, 0.08));
        border-radius: 4px;
        padding: 1px 5px;
        font-size: 13px;
        font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;
    }

    .chat-message.typing {
        background: var(--chat-bubble-bot-bg, #e9ecef);
        padding: 15px;
    }

    .typing-indicator i {
        font-size: 8px;
        margin: 0 2px;
        opacity: 0.4;
        animation: typing 1.4s infinite;
        color: var(--chat-bubble-bot-text, #333333);
    }

    .typing-indicator i:nth-child(2) {
        animation-delay: 0.2s;
    }

    .typing-indicator i:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes typing {
        0%, 80%, 100% {
            opacity: 0.4;
        }
        40% {
            opacity: 1;
        }
    }

    .chat-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0 0 16px 52px;
    }

    .chat-suggestion-chip {
        background: var(--chat-chip-bg, #ffffff);
        color: var(--chat-chip-text, #333333);
        border: 1px solid var(--chat-chip-border, #d7dce2);
        border-radius: 16px;
        padding: 6px 12px;
        font-size: 13px;
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s;
    }

    .chat-suggestion-chip:hover,
    .chat-suggestion-chip:focus-visible {
        border-color: var(--primary-color, #2563eb);
        color: var(--primary-color, #2563eb);
    }

    .chat-error p { margin: 0 0 8px; }

    .chat-retry-btn {
        background: var(--primary-color, #2563eb);
        color: #ffffff;
        border: none;
        border-radius: 14px;
        padding: 6px 14px;
        font-size: 13px;
        cursor: pointer;
    }

    .chat-retry-btn:hover { opacity: 0.9; }

    .chat-quick-actions {
        display: flex;
        justify-content: flex-end;
        padding: 6px 15px;
        background: var(--chat-surface, #ffffff);
        border-top: 1px solid var(--chat-border, #e9ecef);
    }

    .chat-resume-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: var(--chat-muted, #64748b);
        text-decoration: none;
        padding: 3px 8px;
        border-radius: 12px;
    }

    .chat-resume-link:hover,
    .chat-resume-link:focus-visible {
        color: var(--primary-color, #2563eb);
    }

    .chat-input-form {
        display: flex;
        align-items: flex-end;
        padding: 10px 15px 15px;
        background: var(--chat-surface, #ffffff);
        border-radius: 0 0 12px 12px;
    }

    .chat-input {
        flex: 1;
        padding: 12px 20px;
        border: 2px solid var(--chat-border, #e9ecef);
        border-radius: 25px;
        outline: none;
        font-size: 16px;
        font-family: inherit;
        line-height: 1.4;
        background: var(--chat-input-bg, #ffffff);
        color: var(--chat-input-text, #111111);
        resize: none;
        overflow-y: auto;
        max-height: 120px;
    }

    .chat-input:focus {
        border-color: var(--primary-color, #000000);
    }

    .chat-send {
        background: var(--primary-color, #000000);
        color: #ffffff;
        border: none;
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        margin-left: 10px;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .chat-send:hover {
        transform: scale(1.1);
    }

    .chat-toggle {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 70px;
        height: 70px;
        background: var(--primary-color, #000000);
        color: #ffffff;
        border: none;
        border-radius: 50%;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chat-toggle:hover {
        transform: scale(1.1);
    }

    @media (prefers-reduced-motion: reduce) {
        .avatar-pulse,
        .avatar-pulse.thinking,
        .typing-indicator i {
            animation: none !important;
        }
        .chat-widget,
        .chat-toggle,
        .chat-send,
        .chat-suggestion-chip {
            transition: none !important;
        }
        .chat-send:hover,
        .chat-toggle:hover {
            transform: none !important;
        }
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .chat-widget {
            width: calc(100vw - 20px);
            height: calc(100vh - 80px);
            bottom: 10px;
            right: 10px;
            left: 10px;
            margin: 0 auto;
        }

        .chat-toggle {
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            font-size: 24px;
        }
    }
`;
document.head.appendChild(chatStyles);
