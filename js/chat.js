// Chat Widget Functionality
const chatWidget = document.getElementById('chatWidget');
const chatToggle = document.getElementById('chatToggle');
const chatMinimize = document.getElementById('chatMinimize');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

// Wei's information for the AI context
const weiInfo = `
Wei Fu is a recent graduate from the University of Massachusetts Amherst (Class of 2025) with dual majors in Computer Science and Managerial Economics. 

Key Information about Wei:
- Education: Computer Science (Primary Major) and Managerial Economics (Second Major) from UMass Amherst
- Expertise: iOS development, web development, Python, data analysis, business strategy
- Has developed 19 iOS applications including AIMBTi, AI实想, AI录音笔记, and many others
- Passionate about bridging technology and business through innovative solutions
- Skills include Swift, JavaScript, Python, Git, API integration, database management
- Business skills include financial analysis, market research, and economic modeling
- Contact: Phone (413) 472-7021, Email: 1597498880weiproduct@gmail.com
- GitHub: https://github.com/WeiProduct
- LinkedIn: https://www.linkedin.com/in/wei-fu-004724256/
`;

// Toggle chat widget
chatToggle.addEventListener('click', () => {
    chatWidget.classList.toggle('active');
    chatToggle.style.display = 'none';
    if (chatMessages.children.length === 0) {
        addMessage('bot', "Hi! I'm Wei's AI assistant. Feel free to ask me anything about Wei's background, skills, projects, or how to get in touch!");
    }
});

// Minimize chat widget
chatMinimize.addEventListener('click', () => {
    chatWidget.classList.remove('active');
    chatToggle.style.display = 'flex';
});

// Add message to chat
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.innerHTML = '<span class="typing-indicator"><i class="fas fa-circle"></i><i class="fas fa-circle"></i><i class="fas fa-circle"></i></span>';
    chatMessages.appendChild(typingDiv);
    
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
                        content: `You are Wei Fu's personal AI assistant on his portfolio website. Your role is to help visitors learn about Wei and answer their questions in a friendly, professional manner. Use the following information about Wei to answer questions: ${weiInfo}. Keep responses concise and helpful. If asked about specific projects or technical details not mentioned in the provided information, suggest they check Wei's GitHub profile or contact him directly.`
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        
        // Remove typing indicator
        typingDiv.remove();
        
        // Add bot response
        addMessage('bot', botResponse);
        
    } catch (error) {
        console.error('Error:', error);
        typingDiv.remove();
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
    
    .chat-header {
        background: var(--primary-color, #000000);
        color: #ffffff;
        padding: 20px;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .chat-header h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
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
    
    .chat-message {
        margin-bottom: 16px;
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
        margin-left: auto;
        text-align: right;
    }
    
    .chat-message.bot {
        background: #e9ecef;
        color: #333333;
        margin-right: auto;
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