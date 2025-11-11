/**
 * BPAZ-Agentic-Platform Widget - Pure JavaScript Chat Widget
 * Makes direct requests to target API without backend dependency
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        targetUrl: '',
        apiKey: '',
        position: 'right',
        color: '#2563eb',
        width: '400px',
        height: '600px',
        label: '💬'
    };

    // Widget state
    let isOpen = false;
    let elements = {};
    let sessionId = null;

    // Initialize widget
    function init() {
        // Get configuration from script attributes
        const script = document.currentScript || getCurrentScript();
        if (script) {
            const dataset = script.dataset || {};
            config.targetUrl = dataset.targetUrl || '';
            config.apiKey = dataset.apiKey || '';
            config.position = dataset.position || 'right';
            config.color = dataset.color || '#2563eb';
            config.width = dataset.width || '400px';
            config.height = dataset.height || '600px';
            config.label = dataset.label || '💬';
        }

        // Validate configuration
        if (!config.targetUrl) {
            console.error('[BPAZ Widget] Target URL is required');
            return;
        }

        // Generate session ID
        sessionId = generateSessionId();

        // Create widget elements
        createWidget();

        // Expose global API
        window.BPAZWidget = {
            show: showWidget,
            hide: hideWidget,
            toggle: toggleWidget,
            updateConfig: updateConfig,
            getConfig: () => ({ ...config })
        };

        console.log('[BPAZ Widget] Initialized successfully');
    }

    function getCurrentScript() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    }

    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function createWidget() {
        // Create widget button
        elements.button = createElement('button', {
            id: 'bpaz-widget-button',
            className: 'bpaz-widget-button',
            innerHTML: config.label,
            onclick: toggleWidget
        });

        // Create widget container
        elements.container = createElement('div', {
            id: 'bpaz-widget-container',
            className: 'bpaz-widget-container'
        });

        // Create chat interface
        elements.chat = createChatInterface();
        elements.container.appendChild(elements.chat);

        // Apply styles
        applyStyles();

        // Add to DOM
        document.body.appendChild(elements.button);
        document.body.appendChild(elements.container);
    }

    function createElement(tag, props) {
        const element = document.createElement(tag);
        Object.keys(props).forEach(key => {
            if (key === 'onclick') {
                element.addEventListener('click', props[key]);
            } else {
                element[key] = props[key];
            }
        });
        return element;
    }

    function createChatInterface() {
        const chat = createElement('div', {
            className: 'bpaz-chat-interface',
            innerHTML: `
                <div class="bpaz-chat-header">
                    <div class="bpaz-chat-title">
                        <span class="bpaz-chat-icon">🤖</span>
                        BPAZ-Agentic-Platform AI
                    </div>
                    <button class="bpaz-chat-close" onclick="window.BPAZWidget.hide()">×</button>
                </div>
                <div class="bpaz-chat-messages" id="bpaz-chat-messages">
                    <div class="bpaz-welcome-message">
                        <div class="bpaz-message bpaz-message-bot">
                            <div class="bpaz-message-content">
                                Hello! I'm your AI assistant. How can I help you today?
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bpaz-chat-input">
                    <input type="text" id="bpaz-message-input" placeholder="Type your message..." />
                    <button id="bpaz-send-button">
                        <span class="bpaz-send-icon">→</span>
                    </button>
                </div>
                <div class="bpaz-chat-status">
                    <div class="bpaz-status-indicator" id="bpaz-status-indicator">
                        <span class="bpaz-status-dot"></span>
                        <span class="bpaz-status-text">Ready</span>
                    </div>
                </div>
            `
        });

        // Add event listeners
        setTimeout(() => {
            const messageInput = document.getElementById('bpaz-message-input');
            const sendButton = document.getElementById('bpaz-send-button');

            if (messageInput && sendButton) {
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') sendMessage();
                });
                sendButton.addEventListener('click', sendMessage);
            }
        }, 0);

        return chat;
    }

    function applyStyles() {
        const styles = `
            .bpaz-widget-button {
                position: fixed;
                bottom: 20px;
                ${config.position}: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${config.color};
                color: white;
                border: none;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                transition: all 0.3s ease;
            }
            
            .bpaz-widget-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            }
            
            .bpaz-widget-container {
                position: fixed;
                bottom: 100px;
                ${config.position}: 20px;
                width: ${config.width};
                height: ${config.height};
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                z-index: 9998;
                display: none;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            }
            
            .bpaz-chat-interface {
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .bpaz-chat-header {
                background: ${config.color};
                color: white;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .bpaz-chat-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
            }
            
            .bpaz-chat-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .bpaz-chat-close:hover {
                background: rgba(255,255,255,0.1);
            }
            
            .bpaz-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .bpaz-message {
                display: flex;
                max-width: 85%;
            }
            
            .bpaz-message-bot {
                align-self: flex-start;
            }
            
            .bpaz-message-user {
                align-self: flex-end;
            }
            
            .bpaz-message-content {
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .bpaz-message-bot .bpaz-message-content {
                background: #f1f3f5;
                color: #333;
            }
            
            .bpaz-message-user .bpaz-message-content {
                background: ${config.color};
                color: white;
            }
            
            .bpaz-chat-input {
                border-top: 1px solid #e9ecef;
                padding: 16px 20px;
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            #bpaz-message-input {
                flex: 1;
                border: 1px solid #e9ecef;
                border-radius: 24px;
                padding: 10px 16px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
            }
            
            #bpaz-message-input:focus {
                border-color: ${config.color};
            }
            
            #bpaz-send-button {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: ${config.color};
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: transform 0.2s;
            }
            
            #bpaz-send-button:hover {
                transform: scale(1.1);
            }
            
            #bpaz-send-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .bpaz-chat-status {
                border-top: 1px solid #e9ecef;
                padding: 8px 20px;
                background: #f8f9fa;
            }
            
            .bpaz-status-indicator {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: #6c757d;
            }
            
            .bpaz-status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #28a745;
            }
            
            .bpaz-status-dot.connecting {
                background: #ffc107;
                animation: bpaz-pulse 2s infinite;
            }
            
            .bpaz-status-dot.error {
                background: #dc3545;
            }
            
            @keyframes bpaz-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .bpaz-typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 8px 16px;
                background: #f1f3f5;
                border-radius: 18px;
                font-size: 14px;
                color: #6c757d;
            }
            
            .bpaz-typing-dots {
                display: flex;
                gap: 2px;
            }
            
            .bpaz-typing-dots span {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #6c757d;
                animation: bpaz-typing 1.4s infinite;
            }
            
            .bpaz-typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .bpaz-typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes bpaz-typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-8px); }
            }
        `;

        // Add styles to page
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    function showWidget() {
        elements.container.style.display = 'block';
        isOpen = true;
    }

    function hideWidget() {
        elements.container.style.display = 'none';
        isOpen = false;
    }

    function toggleWidget() {
        if (isOpen) {
            hideWidget();
        } else {
            showWidget();
        }
    }

    function updateConfig(newConfig) {
        Object.assign(config, newConfig);
        console.log('[BPAZ Widget] Configuration updated:', config);
    }

    function setStatus(message, type = 'ready') {
        const statusIndicator = document.getElementById('bpaz-status-indicator');
        if (statusIndicator) {
            const dot = statusIndicator.querySelector('.bpaz-status-dot');
            const text = statusIndicator.querySelector('.bpaz-status-text');
            
            if (dot && text) {
                dot.className = `bpaz-status-dot ${type}`;
                text.textContent = message;
            }
        }
    }

    function addMessage(content, isUser = false) {
        const messagesContainer = document.getElementById('bpaz-chat-messages');
        if (!messagesContainer) return;

        const messageDiv = createElement('div', {
            className: `bpaz-message ${isUser ? 'bpaz-message-user' : 'bpaz-message-bot'}`,
            innerHTML: `<div class="bpaz-message-content">${content}</div>`
        });

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const messagesContainer = document.getElementById('bpaz-chat-messages');
        if (!messagesContainer) return;

        const typingDiv = createElement('div', {
            id: 'bpaz-typing-indicator',
            className: 'bpaz-message bpaz-message-bot',
            innerHTML: `
                <div class="bpaz-typing-indicator">
                    Typing
                    <div class="bpaz-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `
        });

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('bpaz-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async function sendMessage() {
        const messageInput = document.getElementById('bpaz-message-input');
        const sendButton = document.getElementById('bpaz-send-button');
        
        if (!messageInput || !messageInput.value.trim()) return;

        const message = messageInput.value.trim();
        messageInput.value = '';
        sendButton.disabled = true;

        // Add user message
        addMessage(message, true);

        // Show typing indicator
        showTypingIndicator();
        setStatus('Thinking...', 'connecting');

        try {
            const response = await sendToAPI(message);
            removeTypingIndicator();
            addMessage(response);
            setStatus('Ready', 'ready');
        } catch (error) {
            console.error('[BPAZ Widget] API Error:', error);
            removeTypingIndicator();
            addMessage('Sorry, I encountered an error. Please try again.', false);
            setStatus('Error', 'error');
        } finally {
            sendButton.disabled = false;
        }
    }

    async function sendToAPI(message) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
            headers['X-API-Key'] = config.apiKey;
        }

        // Use only the working endpoint
        const url = config.targetUrl + '/api/workflow/execute';
        const payload = {
                input: message,
                message: message,
                session_id: sessionId
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            return extractResponse(data);
        }

        throw new Error('API request failed');
    }

    function extractResponse(data) {
        // Try different response formats
        if (data.response) return data.response;
        if (data.result && data.result.response) return data.result.response;
        if (data.message) return data.message;
        if (data.text) return data.text;
        if (data.content) return data.content;
        
        // Fallback
        return typeof data === 'string' ? data : 'I received your message but couldn\'t parse the response.';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();