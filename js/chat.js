// Slim chat widget. System prompt lives on the server (api/chat-proxy.js).

const widget = document.getElementById('chatWidget');
const toggle = document.getElementById('chatToggle');
const closeBtn = document.getElementById('chatClose');
const messagesEl = document.getElementById('chatMessages');
const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const sendBtn = document.getElementById('chatSend');

const API_ENDPOINT =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api/chat-proxy'
    : 'https://personal-portfolio-api-sandy.vercel.app/api/chat-proxy';

const history = [];
let openerEl = null;

function focusables() {
  return [closeBtn, input, sendBtn].filter((el) => el && !el.disabled);
}

function trapFocus(e) {
  if (e.key !== 'Tab' || widget.hidden) return;
  const items = focusables();
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

const SUGGESTIONS = [
  "What's the thesis?",
  'How do you ship so fast?',
  'Open to collab?',
];

function renderSuggestions() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-suggestions';
  for (const text of SUGGESTIONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-suggestion';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      input.value = text;
      wrap.remove();
      form.requestSubmit();
    });
    wrap.appendChild(btn);
  }
  messagesEl.appendChild(wrap);
}

function openWidget() {
  openerEl = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
  widget.hidden = false;
  widget.classList.add('open');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.style.display = 'none';
  if (messagesEl.children.length === 0) {
    appendMessage(
      'bot',
      "Hi — I'm Wei's assistant. Ask about the apps, the studio, or how I work.",
    );
    renderSuggestions();
  }
  input.focus();
}

function closeWidget() {
  widget.classList.remove('open');
  widget.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.style.display = '';
  (openerEl || toggle).focus();
  openerEl = null;
}

function appendMessage(role, text, opts = {}) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  if (opts.error) div.classList.add('error');
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function appendTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

toggle?.addEventListener('click', openWidget);
closeBtn?.addEventListener('click', closeWidget);

document.addEventListener('keydown', (e) => {
  if (widget.hidden) return;
  if (e.key === 'Escape') {
    closeWidget();
    return;
  }
  trapFocus(e);
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userText = input.value.trim();
  if (!userText) return;

  messagesEl.querySelector('.chat-suggestions')?.remove();
  appendMessage('user', userText);
  history.push({ role: 'user', content: userText });
  input.value = '';
  sendBtn.disabled = true;

  const typingEl = appendTyping();

  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: history.slice(-8),
        temperature: 0.6,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    typingEl.remove();
    if (reply) {
      appendMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });
    } else {
      appendMessage('bot', 'No response. Try again?', { error: true });
    }
  } catch (err) {
    console.error(err);
    typingEl.remove();
    appendMessage(
      'bot',
      "Can't reach the server right now. Email 1597498880weiproduct@gmail.com instead.",
      { error: true },
    );
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});
