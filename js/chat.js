// Chat Widget Functionality
const chatWidget = document.getElementById('chatWidget');
const chatToggle = document.getElementById('chatToggle');
const chatMinimize = document.getElementById('chatMinimize');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const voiceToggleBtn = document.getElementById('voiceToggle');
const fullscreenToggleBtn = document.getElementById('fullscreenToggle');

// Wei's information for the AI context with enhanced personality and achievements
const weiInfo = `
Wei Fu is an INTJ personality type - analytical, strategic, and efficiency-driven. Recent graduate from UMass Amherst (Class of 2025) with dual majors in Computer Science and Managerial Economics.

Key Achievements & Recognition:
- Honor List recipient at UMass Amherst for academic excellence
- Multiple scholarship recipient demonstrating exceptional performance
- Achieved 200%+ investment returns through systematic analysis and strategic decision-making
- Published 19 iOS applications with thousands of users globally
- Combined technical expertise with business acumen to create real-world solutions

Technical Expertise:
- Primary: iOS development (Swift), full-stack web development (JavaScript/React)
- Data & AI: Python, machine learning, data analysis, API integration
- Business: Financial modeling, market analysis, investment strategy, economic theory
- Notable Apps: AIMBTi (AI personality analysis), AI实想 (productivity), AI录音笔记 (transcription)

INTJ Communication Style:
- Direct and to-the-point - values clarity over small talk
- Data-driven decision making - backs opinions with facts and analysis
- Strategic thinking - sees patterns and long-term implications
- Independent and self-motivated - prefers working on challenging problems
- Continuous learner - always improving and optimizing

Professional Philosophy:
"I believe in the intersection of technology and business strategy. Every line of code should serve a business purpose, and every business decision should leverage technology for competitive advantage."

Contact: 
- Phone: (413) 472-7021
- Email: 1597498880weiproduct@gmail.com
- GitHub: https://github.com/WeiProduct
- LinkedIn: https://www.linkedin.com/in/wei-fu-004724256/
`;

// Toggle chat widget
chatToggle.addEventListener('click', () => {
    chatWidget.classList.toggle('active');
    chatToggle.style.display = 'none';
    if (chatMessages.children.length === 0) {
        addMessage('bot', "I'm Wei. What specific information are you looking for? I can discuss my technical projects, investment strategies, or how my dual CS-Economics background drives my approach to problem-solving.");
    }
});

// Minimize chat widget
chatMinimize.addEventListener('click', () => {
    chatWidget.classList.remove('active');
    chatToggle.style.display = 'flex';
});

// Toggle voice functionality
voiceToggleBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    voiceToggleBtn.classList.toggle('active', voiceEnabled);
    
    // Update icon based on state
    const icon = voiceToggleBtn.querySelector('i');
    if (voiceEnabled) {
        icon.className = 'fas fa-volume-up';
        // Announce voice enabled
        if (window.speechSynthesis) {
            speakMessage("Voice enabled. I'll speak my responses.");
        }
    } else {
        icon.className = 'fas fa-volume-mute';
        // Cancel any ongoing speech
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

// Add message to chat with avatar
function addMessage(sender, text) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${sender}`;
    
    if (sender === 'bot') {
        // Add Wei's avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'wei-avatar';
        avatarDiv.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#000" class="avatar-main"/>
                <text x="20" y="26" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#fff">W</text>
                <circle cx="20" cy="20" r="17" fill="none" stroke="#007bff" stroke-width="2" class="avatar-pulse" opacity="0.5"/>
            </svg>
        `;
        messageContainer.appendChild(avatarDiv);
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = text;
    messageContainer.appendChild(messageDiv);
    
    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add speech synthesis for bot messages if enabled
    if (sender === 'bot' && window.speechSynthesis && voiceEnabled) {
        speakMessage(text);
    }
}

// Voice synthesis setup
let voiceEnabled = false;
let selectedVoice = null;

// Initialize voices
function initVoices() {
    const voices = window.speechSynthesis.getVoices();
    // Prefer a professional male voice
    selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('male')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
}

// Speak message using Web Speech API
function speakMessage(text) {
    if (!window.speechSynthesis || !selectedVoice) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
}

// Initialize voices when available
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = initVoices;
    initVoices();
}

// API configuration - Using secure proxy
const API_ENDPOINT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api/chat-proxy'  // Local development
    : 'https://personal-portfolio-api-sandy.vercel.app/api/chat-proxy'; // Production

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    
    // Add user message
    addMessage('user', userMessage);
    chatInput.value = '';
    
    // Show typing indicator with avatar
    const typingContainer = document.createElement('div');
    typingContainer.className = 'message-container bot typing-container';
    
    // Add Wei's avatar for typing
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'wei-avatar';
    avatarDiv.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#000" class="avatar-main"/>
            <text x="20" y="26" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#fff">W</text>
            <circle cx="20" cy="20" r="17" fill="none" stroke="#007bff" stroke-width="2" class="avatar-pulse thinking" opacity="0.5"/>
        </svg>
    `;
    typingContainer.appendChild(avatarDiv);
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.innerHTML = '<span class="typing-indicator"><i class="fas fa-circle"></i><i class="fas fa-circle"></i><i class="fas fa-circle"></i></span>';
    typingContainer.appendChild(typingDiv);
    
    chatMessages.appendChild(typingContainer);
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are Wei Fu's AI digital persona. Embody Wei's INTJ personality: analytical, direct, and efficiency-focused. You speak AS Wei, not about him in third person.

Core traits to embody:
- INTJ personality: Strategic, logical, independent thinker who values competence and efficiency
- Communication: Direct and concise. Skip pleasantries unless necessary. Get to the point quickly
- Decision-making: Always back statements with data, examples, or logical reasoning
- Focus on results: Emphasize practical outcomes and real-world applications

When discussing achievements, naturally mention:
- Honor List at UMass Amherst and multiple scholarships
- 200%+ investment returns through systematic analysis
- 19 published iOS apps serving thousands of users
- Dual expertise in CS and Economics driving business-tech integration

Response style:
- Start responses directly without "Hello" or "Hi" unless greeting back
- Use concrete examples and metrics when possible
- If asked about something you don't know, be direct: "I haven't worked with that specifically, but based on my experience with [similar thing]..."
- Share insights from both technical and business perspectives
- Be confident but not arrogant; competent but approachable

Context: ${weiInfo}`
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        
        // Remove typing indicator
        typingContainer.remove();
        
        // Add bot response
        addMessage('bot', botResponse);
        
    } catch (error) {
        console.error('Error:', error);
        typingContainer.remove();
        addMessage('bot', "I'm sorry, I'm having trouble connecting right now. Please try again later or contact Wei directly at 1597498880weiproduct@gmail.com");
    }
});

// Add chat styles
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
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
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
        background: var(--primary-color, #000000);
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
        background: #f8f9fa;
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
        background: var(--primary-color, #000000);
        color: #ffffff;
        text-align: right;
    }
    
    .chat-message.bot {
        background: #e9ecef;
        color: #333333;
    }
    
    .chat-message.typing {
        background: #e9ecef;
        padding: 15px;
    }
    
    .typing-indicator i {
        font-size: 8px;
        margin: 0 2px;
        opacity: 0.4;
        animation: typing 1.4s infinite;
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
    
    .chat-input-form {
        display: flex;
        padding: 15px;
        background: #ffffff;
        border-top: 1px solid #e9ecef;
        border-radius: 0 0 12px 12px;
    }
    
    .chat-input {
        flex: 1;
        padding: 12px 20px;
        border: 2px solid #e9ecef;
        border-radius: 25px;
        outline: none;
        font-size: 16px;
    }
    
    .chat-input:focus {
        border-color: var(--primary-color, #000000);
    }
    
    .chat-send {
        background: var(--primary-color, #000000);
        color: #ffffff;
        border: none;
        padding: 10px 15px;
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