(function () {
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const widgetId = new URL(currentScript.src).searchParams.get('id');
  if (!widgetId) { console.error('Sofia AI: Missing widget ID'); return; }

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    #sw * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }

    /* ─ Trigger button ─ */
    #sw-btn {
      position: fixed; bottom: 24px; right: 20px;
      display: flex; align-items: center; gap: 10px;
      height: 56px; padding: 0 20px 0 12px;
      background: linear-gradient(135deg, #d4a843 0%, #b8882e 55%, #c9973a 100%);
      border: none; border-radius: 28px; cursor: pointer;
      box-shadow: 0 4px 20px rgba(201,151,58,0.5);
      z-index: 99999;
      transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
    }
    #sw-btn::before {
      content: ''; position: absolute; inset: -3px; border-radius: 32px;
      background: rgba(201,151,58,0.25);
      animation: sw-pulse 2.8s ease-in-out infinite; pointer-events: none;
    }
    @keyframes sw-pulse {
      0%,100% { transform: scale(1); opacity: .5; }
      50%      { transform: scale(1.05); opacity: 0; }
    }
    #sw-btn:hover { transform: scale(1.04) translateY(-2px); box-shadow: 0 8px 28px rgba(201,151,58,0.65); }
    #sw-btn:active { transform: scale(0.96); }
    #sw-btn svg { width: 30px; height: 30px; flex-shrink: 0; position: relative; z-index: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
    #sw-btn-label { display: flex; flex-direction: column; align-items: flex-start; position: relative; z-index: 1; }
    #sw-btn-title { font-size: 14px; font-weight: 600; color: #fff; line-height: 1.25; white-space: nowrap; letter-spacing: 0.01em; }
    #sw-btn-sub   { font-size: 11px; font-weight: 400; color: rgba(255,255,255,0.85); line-height: 1.25; white-space: nowrap; }
    #sw-btn circle { transition: opacity .2s; }
    #sw-btn:hover circle:nth-child(2) { animation: sw-dot .75s ease-in-out infinite; }
    #sw-btn:hover circle:nth-child(3) { animation: sw-dot .75s ease-in-out .14s infinite; }
    #sw-btn:hover circle:nth-child(4) { animation: sw-dot .75s ease-in-out .28s infinite; }
    @keyframes sw-dot { 0%,100%{transform:translateY(0);opacity:1} 50%{transform:translateY(-2.5px);opacity:.45} }

    /* ─ Tooltip ─ */
    #sw-tip {
      position: fixed; bottom: 92px; right: 20px;
      background: #1a1916; border: 1px solid #2a2825;
      border-radius: 10px 10px 2px 10px;
      padding: 9px 14px; font-size: 13px; color: #f0ebe0;
      white-space: nowrap; pointer-events: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      z-index: 99997; opacity: 0; transform: translateY(5px);
      transition: opacity .25s ease, transform .25s ease;
    }
    #sw-tip.on { opacity: 1; transform: translateY(0); }
    #sw-tip::after {
      content: ''; position: absolute; bottom: -5px; right: 16px;
      width: 9px; height: 9px; background: #1a1916;
      border-right: 1px solid #2a2825; border-bottom: 1px solid #2a2825;
      transform: rotate(45deg);
    }

    /* ─ Chat window ─ */
    #sw-chat {
      position: fixed; bottom: 92px; right: 20px;
      width: 360px; max-width: calc(100vw - 24px);
      height: 520px; max-height: calc(100vh - 110px);
      background: #0f0e0c;
      border: 1px solid #2a2825;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.75);
      display: none; flex-direction: column;
      z-index: 99998; overflow: hidden;
      transform-origin: bottom right;
      transform: scale(0.94) translateY(12px); opacity: 0;
      transition: transform .28s cubic-bezier(.34,1.56,.64,1), opacity .22s ease;
    }
    #sw-chat.open { display: flex; transform: scale(1) translateY(0); opacity: 1; }

    /* ─ Header ─ */
    #sw-header {
      padding: 14px 16px;
      background: #1a1916;
      border-bottom: 1px solid #2a2825;
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    #sw-avatar {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #c9973a, #8a6520);
      display: flex; align-items: center; justify-content: center;
      font-size: 17px;
      box-shadow: 0 0 0 2px rgba(201,151,58,0.3);
    }
    #sw-hinfo { flex: 1; min-width: 0; }
    #sw-hname { font-size: 15px; font-weight: 600; color: #f0ebe0; line-height: 1.3; }
    #sw-hstatus {
      font-size: 11px; color: #5dba77; margin-top: 2px;
      display: flex; align-items: center; gap: 5px;
    }
    #sw-hstatus::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: #5dba77; box-shadow: 0 0 5px rgba(93,186,119,0.7); flex-shrink: 0;
    }
    #sw-close {
      background: transparent; border: none; cursor: pointer;
      color: #c8c0b0; width: 30px; height: 30px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; line-height: 1;
      transition: background .15s, color .15s; flex-shrink: 0;
    }
    #sw-close:hover { background: rgba(255,255,255,0.07); color: #f0ebe0; }

    /* ─ Messages ─ */
    #sw-msgs {
      flex: 1; overflow-y: auto;
      padding: 16px 14px;
      display: flex; flex-direction: column; gap: 4px;
      background: #0f0e0c;
      -webkit-overflow-scrolling: touch;
    }
    #sw-msgs::-webkit-scrollbar { width: 3px; }
    #sw-msgs::-webkit-scrollbar-track { background: transparent; }
    #sw-msgs::-webkit-scrollbar-thumb { background: rgba(201,151,58,0.18); border-radius: 2px; }

    /* ─ Row + Bubble ─ */
    .sw-row {
      display: flex;
      animation: sw-in .18s ease forwards;
    }
    @keyframes sw-in {
      from { opacity: 0; transform: translateY(5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .sw-row.bot  { justify-content: flex-start; }
    .sw-row.user { justify-content: flex-end; }

    .sw-row.bot  + .sw-row.bot  { margin-top: 2px !important; }
    .sw-row.user + .sw-row.user { margin-top: 2px !important; }
    .sw-row.bot  + .sw-row.user { margin-top: 12px !important; }
    .sw-row.user + .sw-row.bot  { margin-top: 12px !important; }

    .sw-bubble {
      max-width: 75%;
      padding: 11px 15px !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
      word-wrap: break-word;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .sw-row.bot .sw-bubble {
      background: #1a1916;
      color: #f0ebe0;
      border-radius: 14px 14px 14px 3px;
      border: 1px solid #2a2825;
    }

    .sw-row.user .sw-bubble {
      background: #c9973a;
      color: #0f0e0c;
      font-weight: 500;
      border-radius: 14px 14px 3px 14px;
    }

    /* ─ Typing ─ */
    .sw-typing-row { display: flex; justify-content: flex-start; margin-top: 4px; animation: sw-in .18s ease forwards; }
    .sw-typing-bbl {
      padding: 13px 17px !important;
      background: #1a1916; border: 1px solid #2a2825;
      border-radius: 14px 14px 14px 3px;
      display: inline-flex; gap: 5px; align-items: center;
    }
    .sw-typing-bbl span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #c9973a;
      animation: sw-bounce 1.3s ease-in-out infinite;
    }
    .sw-typing-bbl span:nth-child(2) { animation-delay: .16s; }
    .sw-typing-bbl span:nth-child(3) { animation-delay: .32s; }
    @keyframes sw-bounce {
      0%,60%,100% { transform: translateY(0); opacity: .35; }
      30%          { transform: translateY(-5px); opacity: 1; }
    }

    /* ─ Input area ─ */
    #sw-input-area {
      padding: 10px 12px;
      background: #1a1916;
      border-top: 1px solid #2a2825;
      display: flex; gap: 8px; align-items: flex-end;
      flex-shrink: 0;
    }
    #sw-input {
      flex: 1; background: #0f0e0c;
      border: 1px solid #2a2825; border-radius: 20px;
      padding: 10px 16px !important;
      font-size: 14px !important; color: #f0ebe0 !important;
      resize: none; outline: none;
      max-height: 88px; min-height: 42px; line-height: 1.45;
      transition: border-color .2s;
      -webkit-appearance: none; display: block;
    }
    #sw-input::placeholder { color: rgba(200,192,176,0.45) !important; }
    #sw-input:focus { border-color: rgba(201,151,58,0.45); }

    #sw-send {
      width: 42px; height: 42px; border-radius: 50%;
      background: #c9973a; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: transform .2s ease, background .2s ease;
      -webkit-tap-highlight-color: transparent;
    }
    #sw-send:hover { transform: scale(1.08); background: #d4a843; }
    #sw-send:active { transform: scale(0.93); }
    #sw-send svg { width: 16px; height: 16px; fill: #0f0e0c; margin-left: 2px; }

    /* ─ Mobile ─ */
    @media (max-width: 480px) {
      #sw-btn  { bottom: 16px; right: 14px; }
      #sw-chat { right: 0; left: 0; bottom: 0; width: 100%; max-width: 100%; height: 82vh; max-height: 82vh; border-radius: 18px 18px 0 0; border-bottom: none; }
      #sw-tip  { right: 14px; bottom: 86px; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── HTML ── */
  const widget = document.createElement('div');
  widget.id = 'sw';
  widget.innerHTML = `
    <button id="sw-btn" aria-label="Chat with Sofia">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
        <path d="M16 2C8.27 2 2 7.82 2 15c0 3.3 1.3 6.3 3.45 8.55L4 30l7.2-2.4C12.67 28.18 14.3 28.5 16 28.5c7.73 0 14-5.82 14-13S23.73 2 16 2z" fill="white"/>
        <circle cx="11" cy="15" r="1.8" fill="#b8882e"/>
        <circle cx="16" cy="15" r="1.8" fill="#b8882e"/>
        <circle cx="21" cy="15" r="1.8" fill="#b8882e"/>
      </svg>
      <div id="sw-btn-label">
        <span id="sw-btn-title">Chat with Sofia</span>
        <span id="sw-btn-sub">AI Beauty Assistant</span>
      </div>
    </button>

    <div id="sw-tip">Ready to book your next appointment? ✨</div>

    <div id="sw-chat">
      <div id="sw-header">
        <div id="sw-avatar">✦</div>
        <div id="sw-hinfo">
          <div id="sw-hname">Sofia</div>
          <div id="sw-hstatus">Online now</div>
        </div>
        <button id="sw-close" aria-label="Close">✕</button>
      </div>
      <div id="sw-msgs"></div>
      <div id="sw-input-area">
        <textarea id="sw-input" placeholder="Type a message…" rows="1"></textarea>
        <button id="sw-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  /* ── State ── */
  let messages = [];
  let isOpen = false;
  let isTyping = false;
  let tipShown = false;

  const chat    = document.getElementById('sw-chat');
  const btn     = document.getElementById('sw-btn');
  const closeBtn= document.getElementById('sw-close');
  const msgs    = document.getElementById('sw-msgs');
  const input   = document.getElementById('sw-input');
  const sendBtn = document.getElementById('sw-send');
  const tip     = document.getElementById('sw-tip');

  setTimeout(() => {
    if (!isOpen && !tipShown) {
      tipShown = true;
      tip.classList.add('on');
      setTimeout(() => tip.classList.remove('on'), 5000);
    }
  }, 12000);

  btn.addEventListener('click', () => {
    tip.classList.remove('on');
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    if (isOpen && messages.length === 0)
      setTimeout(() => botMsg('Welcome ✦ I\'m Sofia — your personal beauty concierge. How can I help you today?'), 220);
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => { isOpen = false; chat.classList.remove('open'); });

  async function send() {
    const text = input.value.trim();
    if (!text || isTyping) return;
    input.value = '';
    input.style.height = 'auto';
    userMsg(text);
    messages.push({ role: 'user', content: text });
    typingOn();
    try {
      const res  = await fetch('https://claude-widget.vercel.app/api/widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, widgetId })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'll be right with you.";
      typingOff();
      botMsg(reply);
      messages.push({ role: 'assistant', content: reply });
    } catch {
      typingOff();
      botMsg("Sorry, I'm having a moment. Please try again.");
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 88) + 'px'; });

  function botMsg(text) {
    const row = document.createElement('div');
    row.className = 'sw-row bot';
    const b = document.createElement('div');
    b.className = 'sw-bubble';
    b.textContent = text;
    row.appendChild(b);
    msgs.appendChild(row);
    scroll();
  }

  function userMsg(text) {
    const row = document.createElement('div');
    row.className = 'sw-row user';
    const b = document.createElement('div');
    b.className = 'sw-bubble';
    b.textContent = text;
    row.appendChild(b);
    msgs.appendChild(row);
    scroll();
  }

  function typingOn() {
    isTyping = true;
    const row = document.createElement('div');
    row.className = 'sw-typing-row';
    row.id = 'sw-typing';
    row.innerHTML = '<div class="sw-typing-bbl"><span></span><span></span><span></span></div>';
    msgs.appendChild(row);
    scroll();
  }

  function typingOff() {
    isTyping = false;
    const t = document.getElementById('sw-typing');
    if (t) t.remove();
  }

  function scroll() { msgs.scrollTop = msgs.scrollHeight; }

})();
