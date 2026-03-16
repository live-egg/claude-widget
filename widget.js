(function() {
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const src = currentScript.src;
  const widgetId = new URL(src).searchParams.get('id');

  if (!widgetId) {
    console.error('Sofia AI: Missing widget ID');
    return;
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

    #sofia-widget * { box-sizing: border-box; margin: 0; padding: 0; }

    #sofia-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d4a843 0%, #b8882e 50%, #c9973a 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(201,151,58,0.45), 0 1px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
    }

    #sofia-btn::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(212,168,67,0.4), transparent);
      animation: sofia-pulse 2.5s ease-in-out infinite;
    }

    @keyframes sofia-pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.18); opacity: 0; }
    }

    #sofia-btn:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 8px 32px rgba(201,151,58,0.6), 0 2px 8px rgba(0,0,0,0.3);
    }

    #sofia-btn:active { transform: scale(0.96); }

#sofia-btn svg {
  width: 30px;
  height: 30px;
  position: relative;
  z-index: 1;
}

#sofia-btn circle {
  opacity: 0.5;
  transition: opacity 0.2s;
}

#sofia-btn:hover circle:nth-child(1) {
  animation: dot-pulse 0.8s ease-in-out infinite;
}
#sofia-btn:hover circle:nth-child(2) {
  animation: dot-pulse 0.8s ease-in-out 0.15s infinite;
}
#sofia-btn:hover circle:nth-child(3) {
  animation: dot-pulse 0.8s ease-in-out 0.3s infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.5; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-2px); }
}

    #sofia-tooltip {
      position: fixed;
      bottom: 104px;
      right: 28px;
      background: linear-gradient(135deg, #1e1c18, #181612);
      border: 1px solid rgba(201,151,58,0.3);
      border-radius: 12px 12px 4px 12px;
      padding: 10px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #e8e0d0;
      white-space: nowrap;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      z-index: 99997;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    }

    #sofia-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }

    #sofia-tooltip::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 18px;
      width: 10px;
      height: 10px;
      background: #181612;
      border-right: 1px solid rgba(201,151,58,0.3);
      border-bottom: 1px solid rgba(201,151,58,0.3);
      transform: rotate(45deg);
    }

    #sofia-chat {
      position: fixed;
      bottom: 106px;
      right: 28px;
      width: 370px;
      height: 540px;
      background: #0d0c0a;
      border: 1px solid rgba(201,151,58,0.2);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
      display: none;
      flex-direction: column;
      z-index: 99998;
      overflow: hidden;
      transform: translateY(12px) scale(0.97);
      opacity: 0;
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease;
    }

    #sofia-chat.open {
      display: flex;
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    #sofia-header {
      padding: 18px 20px;
      background: linear-gradient(180deg, #1a1814 0%, #131210 100%);
      border-bottom: 1px solid rgba(201,151,58,0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    #sofia-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d4a843, #9a6e1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      box-shadow: 0 2px 12px rgba(201,151,58,0.3);
    }

    #sofia-header-info { flex: 1; }

    #sofia-header-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px;
      font-weight: 600;
      color: #f0ebe0;
      letter-spacing: 0.02em;
      line-height: 1.2;
    }

    #sofia-header-status {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: #c9973a;
      letter-spacing: 0.04em;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    #sofia-header-status::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 6px rgba(74,222,128,0.6);
      flex-shrink: 0;
    }

    #sofia-close {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      cursor: pointer;
      color: #6b6560;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      transition: background 0.2s, color 0.2s;
    }

    #sofia-close:hover {
      background: rgba(255,255,255,0.1);
      color: #f0ebe0;
    }

    #sofia-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #0d0c0a;
    }

    #sofia-messages::-webkit-scrollbar { width: 3px; }
    #sofia-messages::-webkit-scrollbar-track { background: transparent; }
    #sofia-messages::-webkit-scrollbar-thumb { background: rgba(201,151,58,0.2); border-radius: 2px; }

    .sofia-msg {
      max-width: 82%;
      padding: 11px 15px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      line-height: 1.55;
      animation: sofia-msg-in 0.25s ease forwards;
    }

    @keyframes sofia-msg-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .sofia-msg.bot {
      background: linear-gradient(135deg, #1e1c18 0%, #181612 100%);
      color: #e8e0d0;
      border-radius: 16px 16px 16px 4px;
      border: 1px solid rgba(201,151,58,0.12);
      align-self: flex-start;
    }

    .sofia-msg.user {
      background: linear-gradient(135deg, #2a1f08 0%, #1e1608 100%);
      color: #f0d89a;
      border-radius: 16px 16px 4px 16px;
      border: 1px solid rgba(201,151,58,0.25);
      align-self: flex-end;
      text-align: right;
    }

    .sofia-typing {
      display: flex;
      gap: 5px;
      padding: 14px 16px;
      background: linear-gradient(135deg, #1e1c18, #181612);
      border-radius: 16px 16px 16px 4px;
      border: 1px solid rgba(201,151,58,0.12);
      align-self: flex-start;
      animation: sofia-msg-in 0.25s ease forwards;
    }

    .sofia-typing span {
      width: 5px;
      height: 5px;
      background: #c9973a;
      border-radius: 50%;
      animation: sofia-bounce 1.3s ease-in-out infinite;
    }

    .sofia-typing span:nth-child(2) { animation-delay: 0.15s; }
    .sofia-typing span:nth-child(3) { animation-delay: 0.3s; }

    @keyframes sofia-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    #sofia-input-area {
      padding: 14px 16px;
      background: linear-gradient(180deg, #131210 0%, #0f0e0c 100%);
      border-top: 1px solid rgba(201,151,58,0.1);
      display: flex;
      gap: 10px;
      align-items: flex-end;
      flex-shrink: 0;
    }

    #sofia-input {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(201,151,58,0.2);
      border-radius: 12px;
      padding: 10px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      color: #e8e0d0;
      resize: none;
      outline: none;
      max-height: 80px;
      min-height: 42px;
      line-height: 1.5;
      transition: border-color 0.2s, background 0.2s;
    }

    #sofia-input::placeholder {
      color: rgba(240,235,224,0.25);
      font-style: italic;
    }

    #sofia-input:focus {
      border-color: rgba(201,151,58,0.5);
      background: rgba(255,255,255,0.06);
    }

    #sofia-send {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #d4a843, #b8882e);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
      box-shadow: 0 2px 12px rgba(201,151,58,0.3);
    }

    #sofia-send:hover {
      transform: scale(1.06) translateY(-1px);
      box-shadow: 0 4px 16px rgba(201,151,58,0.5);
    }

    #sofia-send:active { transform: scale(0.94); }
    #sofia-send svg { width: 17px; height: 17px; fill: #0f0e0c; }

    @media (max-width: 420px) {
      #sofia-chat { width: calc(100vw - 24px); right: 12px; bottom: 90px; }
      #sofia-btn { right: 12px; bottom: 16px; }
      #sofia-tooltip { right: 12px; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const widget = document.createElement('div');
  widget.id = 'sofia-widget';
  widget.innerHTML = `
    <button id="sofia-btn" aria-label="Chat with Sofia">
<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 3C8.82 3 3 8.37 3 15c0 3.1 1.23 5.92 3.25 8.03L5 29l6.3-2.1C12.8 27.6 14.37 28 16 28c7.18 0 13-5.37 13-12S23.18 3 16 3z" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"/>
  <circle cx="11" cy="15" r="1.5" fill="#1a1814"/>
  <circle cx="16" cy="15" r="1.5" fill="#1a1814"/>
  <circle cx="21" cy="15" r="1.5" fill="#1a1814"/>
</svg>
    </button>
    <div id="sofia-tooltip">Need help booking? 💛</div>

    <div id="sofia-chat">
      <div id="sofia-header">
        <div id="sofia-avatar">💛</div>
        <div id="sofia-header-info">
          <div id="sofia-header-name">Sofia</div>
          <div id="sofia-header-status">Online now</div>
        </div>
        <button id="sofia-close">✕</button>
      </div>

      <div id="sofia-messages"></div>

      <div id="sofia-input-area">
        <textarea id="sofia-input" placeholder="Ask me anything…" rows="1"></textarea>
        <button id="sofia-send">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  let messages = [];
  let isOpen = false;
  let isTyping = false;
  let tooltipShown = false;

  const chat = document.getElementById('sofia-chat');
  const btn = document.getElementById('sofia-btn');
  const closeBtn = document.getElementById('sofia-close');
  const messagesEl = document.getElementById('sofia-messages');
  const input = document.getElementById('sofia-input');
  const sendBtn = document.getElementById('sofia-send');
  const tooltip = document.getElementById('sofia-tooltip');

  setTimeout(() => {
    if (!isOpen && !tooltipShown) {
      tooltipShown = true;
      tooltip.classList.add('visible');
      setTimeout(() => {
        tooltip.classList.remove('visible');
      }, 5000);
    }
  }, 15000);

  btn.addEventListener('click', () => {
    tooltip.classList.remove('visible');
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Welcome 💛 I'm Sofia — how can I help you today?");
      }, 200);
    }
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chat.classList.remove('open');
  });

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
