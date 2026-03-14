(function() {
  // Get widget ID from script tag
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const src = currentScript.src;
  const widgetId = new URL(src).searchParams.get('id');

  if (!widgetId) {
    console.error('Sofia AI: Missing widget ID');
    return;
  }

  // Styles
  const styles = `
    #sofia-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    
    #sofia-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #c9973a;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(201,151,58,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    #sofia-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 24px rgba(201,151,58,0.5);
    }

    #sofia-btn svg { width: 24px; height: 24px; fill: #0f0e0c; }

    #sofia-chat {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      height: 520px;
      background: #0f0e0c;
      border: 1px solid #2a2825;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.4);
      display: none;
      flex-direction: column;
      z-index: 99998;
      overflow: hidden;
    }

    #sofia-chat.open { display: flex; }

    #sofia-header {
      padding: 16px 20px;
      background: #1a1916;
      border-bottom: 1px solid #2a2825;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #sofia-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #c9973a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    #sofia-header-info { flex: 1; }
    #sofia-header-name { font-size: 14px; font-weight: 600; color: #f0ebe0; }
    #sofia-header-status { font-size: 11px; color: #c9973a; }

    #sofia-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b6560;
      font-size: 20px;
      line-height: 1;
      padding: 0;
    }

    #sofia-close:hover { color: #f0ebe0; }

    #sofia-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    #sofia-messages::-webkit-scrollbar { width: 4px; }
    #sofia-messages::-webkit-scrollbar-track { background: transparent; }
    #sofia-messages::-webkit-scrollbar-thumb { background: #2a2825; border-radius: 2px; }

    .sofia-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
    }

    .sofia-msg.bot {
      background: #1a1916;
      color: #f0ebe0;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }

    .sofia-msg.user {
      background: #c9973a;
      color: #0f0e0c;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }

    .sofia-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: #1a1916;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }

    .sofia-typing span {
      width: 6px;
      height: 6px;
      background: #c9973a;
      border-radius: 50%;
      animation: typing 1.2s infinite;
    }

    .sofia-typing span:nth-child(2) { animation-delay: 0.2s; }
    .sofia-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    #sofia-input-area {
      padding: 12px 16px;
      background: #1a1916;
      border-top: 1px solid #2a2825;
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    #sofia-input {
      flex: 1;
      background: #0f0e0c;
      border: 1px solid #2a2825;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      color: #f0ebe0;
      resize: none;
      outline: none;
      max-height: 80px;
      min-height: 40px;
      line-height: 1.4;
    }

    #sofia-input::placeholder { color: #6b6560; }
    #sofia-input:focus { border-color: #c9973a; }

    #sofia-send {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #c9973a;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s;
    }

    #sofia-send:hover { opacity: 0.85; }
    #sofia-send svg { width: 16px; height: 16px; fill: #0f0e0c; }

    @media (max-width: 400px) {
      #sofia-chat { width: calc(100vw - 32px); right: 16px; bottom: 84px; }
      #sofia-btn { right: 16px; bottom: 16px; }
    }
  `;

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // Create widget HTML
  const widget = document.createElement('div');
  widget.id = 'sofia-widget';
  widget.innerHTML = `
    <button id="sofia-btn" aria-label="Chat with Sofia">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    </button>

    <div id="sofia-chat">
      <div id="sofia-header">
        <div id="sofia-avatar">💛</div>
        <div id="sofia-header-info">
          <div id="sofia-header-name">Sofia</div>
          <div id="sofia-header-status">● Online now</div>
        </div>
        <button id="sofia-close">×</button>
      </div>

      <div id="sofia-messages"></div>

      <div id="sofia-input-area">
        <textarea id="sofia-input" placeholder="Type a message..." rows="1"></textarea>
        <button id="sofia-send">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // State
  let messages = [];
  let isOpen = false;
  let isTyping = false;

  const chat = document.getElementById('sofia-chat');
  const btn = document.getElementById('sofia-btn');
  const closeBtn = document.getElementById('sofia-close');
  const messagesEl = document.getElementById('sofia-messages');
  const input = document.getElementById('sofia-input');
  const sendBtn = document.getElementById('sofia-send');

  // Toggle chat
  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    if (isOpen && messages.length === 0) {
      addBotMessage("Welcome 💛 I'm Sofia — how can I help you today?");
    }
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chat.classList.remove('open');
  });

  // Send message
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isTyping) return;

    input.value = '';
    input.style.height = 'auto';

    addUserMessage(text);
    messages.push({ role: 'user', content: text });

    showTyping();

    try {
      const response = await fetch('https://claude-widget.vercel.app/api/widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, widgetId })
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "I'll be right with you.";

      hideTyping();
      addBotMessage(reply);
      messages.push({ role: 'assistant', content: reply });

    } catch (error) {
      hideTyping();
      addBotMessage("Sorry, I'm having trouble connecting. Please try again.");
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'sofia-msg bot';
    msg.textContent = text;
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'sofia-msg user';
    msg.textContent = text;
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function showTyping() {
    isTyping = true;
    const typing = document.createElement('div');
    typing.className = 'sofia-typing';
    typing.id = 'sofia-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    const typing = document.getElementById('sofia-typing');
    if (typing) typing.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

})();
