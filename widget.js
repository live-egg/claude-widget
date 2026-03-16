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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    #sofia-widget * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

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
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.01em;
      line-height: 1.2;
      white-space: nowrap;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }

    #sofia-btn-sub {
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
      bottom: 90px;
      right: 20px;
      background: #1c1917;
      border-radius: 10px 10px 2px 10px;
      padding: 8px 14px;
      font-size: 13px;
      color: #e8dfc8;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.35);
      z-index: 99997;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: none;
    }

    #sofia-tooltip.visible { opacity: 1; transform: translateY(0); }

    #sofia-tooltip::after {
      content: '';
      position: absolute;
      bottom: -5px;
      right: 16px;
      width: 9px;
      height: 9px;
      background: #1c1917;
      transform: rotate(45deg);
      border-radius: 1px;
    }

    /* ── Chat window ── */
    #sofia-chat {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 370px;
      max-width: calc(100vw - 24px);
      height: 540px;
      max-height: calc(100vh - 110px);
      background: #18160f;
      border-radius: 18px;
      box-shadow: 0 16px 50px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,151,58,0.18);
      display: none;
      flex-direction: column;
      z-index: 99998;
      overflow: hidden;
      transform-origin: bottom right;
      transform: scale(0.95) translateY(10px);
      opacity: 0;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s ease;
    }

    #sofia-chat.open {
      display: flex;
      transform: scale(1) translateY(0);
      opacity: 1;
    }

    /* ── Header ── */
    #sofia-header {
      padding: 14px 16px;
      background: #1e1a10;
      border-bottom: 1px solid rgba(201,151,58,0.15);
      display: flex;
      align-items: center;
      gap: 11px;
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
    }

    #sofia-header-info { flex: 1; min-width: 0; }

    #sofia-header-name {
      font-size: 15px;
      font-weight: 600;
      color: #f5e4a0;
      line-height: 1.3;
    }

    #sofia-header-status {
      font-size: 12px;
      color: #5dba77;
      margin-top: 1px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    #sofia-header-status::before {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #5dba77;
      flex-shrink: 0;
    }

    #sofia-close {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #7a7060;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      line-height: 1;
      transition: background 0.15s, color 0.15s;
      flex-shrink: 0;
    }

    #sofia-close:hover { background: rgba(255,255,255,0.08); color: #f0ebe0; }

    /* ── Messages area ── */
    #sofia-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #18160f;
      -webkit-overflow-scrolling: touch;
    }

    #sofia-messages::-webkit-scrollbar { width: 3px; }
    #sofia-messages::-webkit-scrollbar-track { background: transparent; }
    #sofia-messages::-webkit-scrollbar-thumb { background: rgba(201,151,58,0.2); border-radius: 2px; }

    /* ── Message bubbles — iMessage-like ── */
    .sofia-msg-wrap {
      display: flex;
      flex-direction: column;
      margin-bottom: 6px;
      animation: sofia-in 0.18s ease forwards;
    }

    @keyframes sofia-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .sofia-msg-wrap.bot  { align-items: flex-start; }
    .sofia-msg-wrap.user { align-items: flex-end; }

    .sofia-bubble {
      max-width: 78%;
      padding: 13px 18px;
      font-size: 14.5px;
      line-height: 1.6;
      word-wrap: break-word;
      word-break: break-word;
    }

    /* Bot bubble — warm gold-tinted dark */
    .sofia-msg-wrap.bot .sofia-bubble {
      background: #2b2009;
      color: #f0e0bc;
      border-radius: 18px 18px 18px 4px;
    }

    /* User bubble — green-tinted dark */
    .sofia-msg-wrap.user .sofia-bubble {
      background: #152210;
      color: #c4e8c8;
      border-radius: 18px 18px 4px 18px;
      text-align: left;
    }

    /* Grouping: consecutive messages from same sender get tighter corners */
    .sofia-msg-wrap.bot + .sofia-msg-wrap.bot .sofia-bubble {
      border-radius: 4px 18px 18px 4px;
    }

    .sofia-msg-wrap.bot:last-of-type .sofia-bubble,
    .sofia-msg-wrap.bot + .sofia-msg-wrap.user ~ .sofia-msg-wrap.bot .sofia-bubble {
      border-radius: 4px 18px 18px 18px;
    }

    .sofia-msg-wrap.user + .sofia-msg-wrap.user .sofia-bubble {
      border-radius: 18px 4px 4px 18px;
    }

    /* ── Typing indicator ── */
    .sofia-typing-wrap {
      align-self: flex-start;
      animation: sofia-in 0.18s ease forwards;
      margin-bottom: 2px;
    }

    .sofia-typing-bubble {
      padding: 12px 16px;
      background: #2b2009;
      border-radius: 18px 18px 18px 4px;
      display: inline-flex;
      gap: 5px;
      align-items: center;
    }

    .sofia-typing-bubble span {
      width: 7px;
      height: 7px;
      background: #c9973a;
      border-radius: 50%;
      animation: sofia-dot 1.2s ease-in-out infinite;
    }

    .sofia-typing-bubble span:nth-child(2) { animation-delay: 0.16s; }
    .sofia-typing-bubble span:nth-child(3) { animation-delay: 0.32s; }

    @keyframes sofia-dot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    /* ── Input area ── */
    #sofia-input-area {
      padding: 10px 12px;
      background: #1e1a10;
      border-top: 1px solid rgba(201,151,58,0.13);
      display: flex;
      gap: 8px;
      align-items: flex-end;
      flex-shrink: 0;
    }

    #sofia-input {
      flex: 1;
      background: #252015;
      border: 1.5px solid rgba(201,151,58,0.22);
      border-radius: 22px;
      padding: 11px 16px;
      font-size: 14px;
      color: #e8dfc8;
      resize: none;
      outline: none;
      max-height: 90px;
      min-height: 44px;
      line-height: 1.45;
      transition: border-color 0.2s, background 0.2s;
      -webkit-appearance: none;
      display: block;
    }

    #sofia-input::placeholder { color: rgba(232,223,200,0.28); }
    #sofia-input:focus { border-color: rgba(201,151,58,0.55); background: #1e1a10; }

    #sofia-send {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #d4a843, #b8882e);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 2px 10px rgba(180,130,40,0.4);
      -webkit-tap-highlight-color: transparent;
    }

    #sofia-send:hover { transform: scale(1.07); box-shadow: 0 4px 16px rgba(180,130,40,0.55); }
    #sofia-send:active { transform: scale(0.92); }

    #sofia-send svg { width: 17px; height: 17px; fill: #fff; margin-left: 2px; }

    /* ── Mobile ── */
    @media (max-width: 480px) {
      #sofia-btn { bottom: 16px; right: 14px; height: 50px; padding: 0 16px 0 12px; }
      #sofia-chat {
        right: 0; left: 0; bottom: 0;
        width: 100%; max-width: 100%;
        height: 80vh; max-height: 80vh;
        border-radius: 20px 20px 0 0;
        bottom: 0;
      }
      #sofia-tooltip { right: 14px; bottom: 80px; }
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
        <button id="sofia-close" aria-label="Close">✕</button>
      </div>
      <div id="sofia-messages"></div>
      <div id="sofia-input-area">
        <textarea id="sofia-input" placeholder="Type a message…" rows="1"></textarea>
        <button id="sofia-send" aria-label="Send">
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

  const chat    = document.getElementById('sofia-chat');
  const btn     = document.getElementById('sofia-btn');
  const closeBtn= document.getElementById('sofia-close');
  const msgArea = document.getElementById('sofia-messages');
  const input   = document.getElementById('sofia-input');
  const sendBtn = document.getElementById('sofia-send');
  const tooltip = document.getElementById('sofia-tooltip');

  /* tooltip after 15s */
  setTimeout(() => {
    if (!isOpen && !tooltipShown) {
      tooltipShown = true;
      tooltip.classList.add('visible');
      setTimeout(() => tooltip.classList.remove('visible'), 5000);
    }
  }, 15000);

  /* open / close */
  btn.addEventListener('click', () => {
    tooltip.classList.remove('visible');
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    if (isOpen && messages.length === 0) {
      setTimeout(() => addBotMsg("Welcome 💛 I'm Sofia — how can I help you today?"), 200);
    }
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chat.classList.remove('open');
  });

  /* send */
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isTyping) return;
    input.value = '';
    input.style.height = 'auto';
    addUserMsg(text);
    messages.push({ role: 'user', content: text });
    showTyping();

    try {
      const res = await fetch('https://claude-widget.vercel.app/api/widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, widgetId })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'll be right with you.";
      hideTyping();
      addBotMsg(reply);
      messages.push({ role: 'assistant', content: reply });
    } catch {
      hideTyping();
      addBotMsg("Sorry, I'm having trouble connecting. Please try again.");
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
  });

  /* helpers */
  function addBotMsg(text) {
    const wrap = document.createElement('div');
    wrap.className = 'sofia-msg-wrap bot';
    const bubble = document.createElement('div');
    bubble.className = 'sofia-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    msgArea.appendChild(wrap);
    scrollEnd();
  }

  function addUserMsg(text) {
    const wrap = document.createElement('div');
    wrap.className = 'sofia-msg-wrap user';
    const bubble = document.createElement('div');
    bubble.className = 'sofia-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    msgArea.appendChild(wrap);
    scrollEnd();
  }

  function showTyping() {
    isTyping = true;
    const wrap = document.createElement('div');
    wrap.className = 'sofia-typing-wrap';
    wrap.id = 'sofia-typing';
    wrap.innerHTML = '<div class="sofia-typing-bubble"><span></span><span></span><span></span></div>';
    msgArea.appendChild(wrap);
    scrollEnd();
  }

  function hideTyping() {
    isTyping = false;
    const t = document.getElementById('sofia-typing');
    if (t) t.remove();
  }

  function scrollEnd() {
    msgArea.scrollTop = msgArea.scrollHeight;
  }

})();
