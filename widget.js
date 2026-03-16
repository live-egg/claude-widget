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
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    #sofia-widget * { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Button ── */
    #sofia-btn {
      position: fixed;
      bottom: 24px;
      right: 20px;
      width: auto;
      height: 58px;
      border-radius: 29px;
      padding: 0 22px 0 14px;
      gap: 10px;
      background: linear-gradient(135deg, #d4a843 0%, #b8882e 50%, #c9973a 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(201,151,58,0.45), 0 1px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      z-index: 99999;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
    }

    #sofia-btn::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 34px;
      background: linear-gradient(135deg, rgba(212,168,67,0.4), transparent);
      animation: sofia-pulse 2.5s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes sofia-pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.04); opacity: 0; }
    }

    #sofia-btn:hover {
      transform: scale(1.04) translateY(-2px);
      box-shadow: 0 8px 32px rgba(201,151,58,0.6), 0 2px 8px rgba(0,0,0,0.2);
    }

    #sofia-btn:active { transform: scale(0.97); }

    #sofia-btn svg {
      width: 32px;
      height: 32px;
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));
    }

    #sofia-btn circle { transition: opacity 0.2s; }
    #sofia-btn:hover circle:nth-child(2) { animation: dot-pulse 0.8s ease-in-out infinite; }
    #sofia-btn:hover circle:nth-child(3) { animation: dot-pulse 0.8s ease-in-out 0.15s infinite; }
    #sofia-btn:hover circle:nth-child(4) { animation: dot-pulse 0.8s ease-in-out 0.3s infinite; }

    @keyframes dot-pulse {
      0%, 100% { opacity: 1; transform: translateY(0); }
      50% { opacity: 0.5; transform: translateY(-2px); }
    }

    #sofia-btn-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      position: relative;
      z-index: 1;
    }

    #sofia-btn-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.01em;
      line-height: 1.2;
      white-space: nowrap;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }

    #sofia-btn-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.9);
      line-height: 1.2;
      white-space: nowrap;
      text-shadow: 0 1px 3px rgba(0,0,0,0.35);
    }

    /* ── Tooltip ── */
    #sofia-tooltip {
      position: fixed;
      bottom: 96px;
      right: 20px;
      background: #1e1c18;
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

    #sofia-tooltip.visible { opacity: 1; transform: translateY(0); }

    #sofia-tooltip::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 18px;
      width: 10px;
      height: 10px;
      background: #1e1c18;
      border-right: 1px solid rgba(201,151,58,0.3);
      border-bottom: 1px solid rgba(201,151,58,0.3);
      transform: rotate(45deg);
    }

    /* ── Chat window ── */
    #sofia-chat {
      position: fixed;
      bottom: 96px;
      right: 20px;
      width: 380px;
      max-width: calc(100vw - 24px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: #111009;
      border: 1px solid rgba(201,151,58,0.25);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7);
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

    /* ── Header ── */
    #sofia-header {
      padding: 16px 20px;
      background: #1a1814;
      border-bottom: 2px solid rgba(201,151,58,0.25);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    #sofia-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d4a843, #9a6e1e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 2px 12px rgba(201,151,58,0.4);
    }

    #sofia-header-info { flex: 1; min-width: 0; }

    #sofia-header-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #f5e4a0;
      letter-spacing: 0.02em;
      line-height: 1.2;
    }

    #sofia-header-status {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: #4ade80;
      letter-spacing: 0.04em;
      margin-top: 3px;
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
      box-shadow: 0 0 6px rgba(74,222,128,0.8);
      flex-shrink: 0;
    }

    #sofia-close {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      cursor: pointer;
      color: #6b6560;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: background 0.2s, color 0.2s;
      flex-shrink: 0;
    }

    #sofia-close:hover { background: rgba(255,255,255,0.12); color: #f0ebe0; }

    /* ── Messages area ── */
    #sofia-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #111009;
      -webkit-overflow-scrolling: touch;
    }

    #sofia-messages::-webkit-scrollbar { width: 3px; }
    #sofia-messages::-webkit-scrollbar-track { background: transparent; }
    #sofia-messages::-webkit-scrollbar-thumb { background: rgba(201,151,58,0.25); border-radius: 2px; }

    /* ── Message bubbles — messenger style ── */
    .sofia-msg {
      max-width: 75%;
      font-family: 'DM Sans', sans-serif;
      font-size: 14.5px;
      line-height: 1.6;
      animation: sofia-msg-in 0.2s ease forwards;
      word-wrap: break-word;
      position: relative;
    }

    .sofia-msg-inner {
      padding: 12px 18px;
      border-radius: 20px;
    }

    @keyframes sofia-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Бот — золотий стиль */
    .sofia-msg.bot {
      align-self: flex-start;
    }

    .sofia-msg.bot .sofia-msg-inner {
      background: #2a1e06;
      color: #f5e4a0;
      border-radius: 4px 20px 20px 20px;
      border: 2px solid rgba(201,151,58,0.5);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
    }

    /* Юзер — зелений стиль */
    .sofia-msg.user {
      align-self: flex-end;
    }

    .sofia-msg.user .sofia-msg-inner {
      background: #0e1f11;
      color: #c8e6cc;
      border-radius: 20px 4px 20px 20px;
      border: 2px solid rgba(74,160,90,0.5);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
      text-align: right;
    }

    /* ── Typing indicator ── */
    .sofia-typing {
      align-self: flex-start;
      animation: sofia-msg-in 0.2s ease forwards;
    }

    .sofia-typing-inner {
      display: flex;
      gap: 5px;
      padding: 12px 18px;
      background: #2a1e06;
      border-radius: 4px 20px 20px 20px;
      border: 2px solid rgba(201,151,58,0.5);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }

    .sofia-typing span {
      width: 6px;
      height: 6px;
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

    /* ── Input area ── */
    #sofia-input-area {
      padding: 12px 14px;
      background: #1a1814;
      border-top: 2px solid rgba(201,151,58,0.2);
      display: flex;
      gap: 10px;
      align-items: flex-end;
      flex-shrink: 0;
    }

    #sofia-input {
      flex: 1;
      background: #0f0e0c;
      border: 2px solid rgba(201,151,58,0.3);
      border-radius: 20px;
      padding: 12px 18px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #e8e0d0;
      resize: none;
      outline: none;
      max-height: 80px;
      min-height: 46px;
      line-height: 1.5;
      transition: border-color 0.2s, background 0.2s;
      -webkit-appearance: none;
    }

    #sofia-input::placeholder { color: rgba(240,235,224,0.3); font-style: italic; }
    #sofia-input:focus { border-color: rgba(201,151,58,0.7); background: #111009; }

    #sofia-send {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d4a843, #b8882e);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
      box-shadow: 0 2px 12px rgba(201,151,58,0.4);
      -webkit-tap-highlight-color: transparent;
    }

    #sofia-send:hover { transform: scale(1.08) translateY(-1px); box-shadow: 0 4px 18px rgba(201,151,58,0.6); }
    #sofia-send:active { transform: scale(0.93); }
    #sofia-send svg { width: 18px; height: 18px; fill: #0f0e0c; margin-left: 2px; }

    /* ── Mobile ── */
    @media (max-width: 480px) {
      #sofia-btn { bottom: 16px; right: 16px; height: 54px; padding: 0 18px 0 12px; }
      #sofia-chat {
        right: 0; left: 0; bottom: 0;
        width: 100%; max-width: 100%;
        height: 85vh; max-height: 85vh;
        border-radius: 20px 20px 0 0;
        border-bottom: none;
      }
      #sofia-tooltip { right: 16px; bottom: 84px; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const widget = document.createElement('div');
  widget.id = 'sofia-widget';
  widget.innerHTML = `
    <button id="sofia-btn" aria-label="Chat with Sofia">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.27 2 2 7.82 2 15c0 3.3 1.3 6.3 3.45 8.55L4 30l7.2-2.4C12.67 28.18 14.3 28.5 16 28.5c7.73 0 14-5.82 14-13S23.73 2 16 2z" fill="white"/>
        <circle cx="11" cy="15" r="1.8" fill="#b8882e"/>
        <circle cx="16" cy="15" r="1.8" fill="#b8882e"/>
        <circle cx="21" cy="15" r="1.8" fill="#b8882e"/>
      </svg>
      <div id="sofia-btn-text">
        <span id="sofia-btn-title">Chat with Sofia</span>
        <span id="sofia-btn-sub">AI Beauty Assistant</span>
      </div>
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
        <textarea id="sofia-input" placeholder="Type a message…" rows="1"></textarea>
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
      setTimeout(() => { tooltip.classList.remove('visible'); }, 5000);
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
    msg.innerHTML = `<div class="sofia-msg-inner">${escapeHtml(text)}</div>`;
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'sofia-msg user';
    msg.innerHTML = `<div class="sofia-msg-inner">${escapeHtml(text)}</div>`;
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function showTyping() {
    isTyping = true;
    const typing = document.createElement('div');
    typing.className = 'sofia-typing';
    typing.id = 'sofia-typing';
    typing.innerHTML = '<div class="sofia-typing-inner"><span></span><span></span><span></span></div>';
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

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
