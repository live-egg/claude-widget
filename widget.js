(function () {
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const widgetId = new URL(currentScript.src).searchParams.get('id');
  if (!widgetId) { console.error('Sofia AI: Missing widget ID'); return; }

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

    #sw * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; }

    /* ─ Trigger button ─ */
    #sw-btn {
      position: fixed; bottom: 24px; right: 20px;
      display: flex; align-items: center; gap: 10px;
      height: 58px; padding: 0 22px 0 14px;
      background: linear-gradient(135deg, #d4a843 0%, #b8882e 50%, #c9973a 100%);
      border: none; border-radius: 29px; cursor: pointer;
      box-shadow: 0 4px 24px rgba(201,151,58,0.45), 0 1px 4px rgba(0,0,0,0.2);
      z-index: 99999;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
    }
    #sw-btn::before {
      content: ''; position: absolute; inset: -3px; border-radius: 34px;
      background: linear-gradient(135deg, rgba(212,168,67,0.4), transparent);
      animation: sw-pulse 2.5s ease-in-out infinite; pointer-events: none;
    }
    @keyframes sw-pulse {
      0%,100% { transform: scale(1); opacity: .6; }
      50%      { transform: scale(1.04); opacity: 0; }
    }
    #sw-btn:hover { transform: scale(1.04) translateY(-2px); box-shadow: 0 8px 32px rgba(201,151,58,0.6), 0 2px 8px rgba(0,0,0,0.2); }
    #sw-btn:active { transform: scale(0.97); }
    #sw-btn > svg { width: 32px; height: 32px; flex-shrink: 0; position: relative; z-index: 1; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3)); }
    #sw-btn circle { transition: opacity .2s; }
    #sw-btn:hover circle:nth-child(2) { animation: sw-dot .8s ease-in-out infinite; }
    #sw-btn:hover circle:nth-child(3) { animation: sw-dot .8s ease-in-out .15s infinite; }
    #sw-btn:hover circle:nth-child(4) { animation: sw-dot .8s ease-in-out .3s infinite; }
    @keyframes sw-dot { 0%,100%{opacity:1;transform:translateY(0)} 50%{opacity:.5;transform:translateY(-2px)} }
    #sw-btn-label { display: flex; flex-direction: column; align-items: flex-start; position: relative; z-index: 1; }
    #sw-btn-title { font-size: 15px; font-weight: 700; color: #fff; line-height: 1.2; white-space: nowrap; letter-spacing: 0.01em; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }
    #sw-btn-sub   { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.9); line-height: 1.2; white-space: nowrap; text-shadow: 0 1px 3px rgba(0,0,0,0.35); }

    /* ─ Tooltip ─ */
    #sw-tip {
      position: fixed; bottom: 96px; right: 20px;
      background: #1e1c18; border: 1px solid rgba(201,151,58,0.3);
      border-radius: 12px 12px 4px 12px;
      padding: 10px 14px; font-size: 13px; color: #e8e0d0;
      white-space: nowrap; pointer-events: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      z-index: 99997; opacity: 0; transform: translateY(6px);
      transition: opacity .3s ease, transform .3s ease;
    }
    #sw-tip.on { opacity: 1; transform: translateY(0); }
    #sw-tip::after {
      content: ''; position: absolute; bottom: -6px; right: 18px;
      width: 10px; height: 10px; background: #1e1c18;
      border-right: 1px solid rgba(201,151,58,0.3); border-bottom: 1px solid rgba(201,151,58,0.3);
      transform: rotate(45deg);
    }

    /* ─ Chat window ─ */
    #sw-chat {
      position: fixed; bottom: 96px; right: 20px;
      width: 380px; max-width: calc(100vw - 24px);
      height: 560px; max-height: calc(100vh - 120px);
      background: #1c1b19;
      border: 1px solid rgba(201,151,58,0.18);
      border-radius: 20px;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(201,151,58,0.06);
      display: none; flex-direction: column;
      z-index: 99998; overflow: hidden;
      transform-origin: bottom right;
      transform: scale(0.95) translateY(12px); opacity: 0;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease;
      position: fixed;
    }
    #sw-chat::before {
      content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
      background: linear-gradient(90deg, transparent, #c9973a, transparent);
      opacity: .5; z-index: 5; pointer-events: none;
    }
    #sw-chat.open { display: flex; transform: scale(1) translateY(0); opacity: 1; }

    /* ─ Header ─ */
    #sw-header {
      padding: 14px 16px 12px;
      background: #1c1b19;
      border-bottom: 1px solid rgba(201,151,58,0.1);
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    #sw-avatar {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(145deg, #c9973a, #7a5418);
      display: flex; align-items: center; justify-content: center;
      font-family: Georgia, serif; font-size: 16px; color: #1a1610; font-weight: 600;
      box-shadow: 0 0 0 2px rgba(201,151,58,0.2);
      position: relative;
    }
    #sw-avatar-dot {
      position: absolute; bottom: 1px; right: 1px;
      width: 9px; height: 9px; background: #52c97a;
      border-radius: 50%; border: 2px solid #1c1b19;
      box-shadow: 0 0 5px rgba(82,201,122,0.5);
    }
    #sw-hinfo { flex: 1; }
    #sw-hname { font-size: 14px; font-weight: 600; color: #f0ebe0; letter-spacing: 0.01em; }
    #sw-hstatus { font-size: 11px; color: #52c97a; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
    #sw-hstatus::before { content: ''; width: 5px; height: 5px; background: #52c97a; border-radius: 50%; display: block; }
    #sw-hsalon { text-align: right; }
    #sw-hsalon-name { font-size: 10px; color: #c8c0b0; letter-spacing: 0.06em; text-transform: uppercase; }
    #sw-hsalon-tag  { font-size: 9px; color: #c9973a; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px; opacity: .8; }
    #sw-close {
      background: transparent; border: none; cursor: pointer;
      color: #6b6560; width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; line-height: 1;
      transition: background .15s, color .15s; flex-shrink: 0;
    }
    #sw-close:hover { background: rgba(255,255,255,0.08); color: #f0ebe0; }

    /* ─ Messages ─ */
    #sw-msgs {
      flex: 1; overflow-y: auto;
      padding: 14px 12px 8px;
      display: flex; flex-direction: column; gap: 8px;
      scroll-behavior: smooth;
    }
    #sw-msgs::-webkit-scrollbar { width: 2px; }
    #sw-msgs::-webkit-scrollbar-thumb { background: rgba(201,151,58,0.2); border-radius: 2px; }

    .sw-datesep {
      text-align: center; font-size: 10px; color: #6a6050;
      letter-spacing: 0.08em; text-transform: uppercase; margin: 2px 0;
    }

    .sw-msg {
      max-width: 84%; display: flex; flex-direction: column;
      animation: sw-in 0.25s cubic-bezier(0.34,1.3,0.64,1) forwards;
      opacity: 0; transform: translateY(8px);
    }
    @keyframes sw-in { to { opacity: 1; transform: translateY(0); } }

    .sw-msg.bot  { align-self: flex-start; }
    .sw-msg.user { align-self: flex-end; }

    .sw-bubble {
      padding: 10px 13px !important;
      border-radius: 14px;
      font-size: 13.5px !important;
      line-height: 1.56 !important;
      word-break: break-word;
    }

    .sw-msg.bot .sw-bubble {
      background: #242220; color: #f0ebe0;
      border-bottom-left-radius: 3px;
      border: 1px solid rgba(255,255,255,0.04);
    }

    .sw-msg.user .sw-bubble {
      background: linear-gradient(135deg, #c9973a, #9a6e1f);
      color: #1a1208; font-weight: 500;
      border-bottom-right-radius: 3px;
    }

    .sw-time {
      font-size: 10px; color: #6a6050; margin-top: 3px; padding: 0 2px;
    }
    .sw-msg.bot .sw-time  { align-self: flex-start; }
    .sw-msg.user .sw-time { align-self: flex-end; }

    /* ─ Quick replies ─ */
    .sw-qr { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; align-self: flex-start; max-width: 100%; }
    .sw-qr-btn {
      background: transparent; border: 1px solid rgba(201,151,58,0.25);
      color: #d4a84b; font-size: 12px; padding: 5px 12px;
      border-radius: 18px; cursor: pointer;
      transition: all .15s; white-space: nowrap; font-family: inherit;
    }
    .sw-qr-btn:hover { background: rgba(201,151,58,0.08); border-color: rgba(201,151,58,0.45); }

    /* ─ Typing ─ */
    .sw-typing {
      align-self: flex-start;
      padding: 11px 14px !important;
      background: #242220; border: 1px solid rgba(255,255,255,0.04);
      border-radius: 14px; border-bottom-left-radius: 3px;
      display: flex; gap: 4px; align-items: center;
      opacity: 0; transition: opacity .2s;
    }
    .sw-typing.show { opacity: 1; }
    .sw-dot { width: 6px; height: 6px; background: #c9973a; border-radius: 50%; animation: sw-bounce 1.2s infinite ease-in-out; }
    .sw-dot:nth-child(2) { animation-delay: .18s; }
    .sw-dot:nth-child(3) { animation-delay: .36s; }
    @keyframes sw-bounce { 0%,60%,100%{transform:translateY(0);opacity:.3} 30%{transform:translateY(-5px);opacity:1} }

    /* ─ Input ─ */
    #sw-input-row {
      padding: 9px 12px 11px;
      border-top: 1px solid rgba(255,255,255,0.05);
      background: #1c1b19;
      display: flex; gap: 8px; align-items: center;
      flex-shrink: 0;
    }
    #sw-input-box {
      flex: 1; background: #2a2825;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px; padding: 9px 13px !important;
      transition: border-color .2s;
    }
    #sw-input-box:focus-within { border-color: rgba(201,151,58,0.3); }
    #sw-input {
      width: 100%; background: transparent; border: none; outline: none;
      color: #f0ebe0 !important; font-size: 13.5px !important; font-family: inherit;
      caret-color: #c9973a;
    }
    #sw-input::placeholder { color: #6a6050 !important; }
    #sw-send {
      width: 37px; height: 37px; border-radius: 9px;
      background: linear-gradient(135deg, #c9973a, #9a6e1f);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: opacity .18s, transform .1s;
      box-shadow: 0 2px 10px rgba(201,151,58,0.25);
      -webkit-tap-highlight-color: transparent;
    }
    #sw-send:hover { opacity: .85; }
    #sw-send:active { transform: scale(0.93); }
    #sw-send:disabled { opacity: .3; cursor: not-allowed; }
    #sw-send svg { width: 15px; height: 15px; fill: #1a1208; }

    /* ─ Footer ─ */
    #sw-footer {
      text-align: center; padding: 4px 0 7px;
      font-size: 9.5px; color: #6a6050; letter-spacing: 0.06em;
      background: #1c1b19; flex-shrink: 0;
    }
    #sw-footer a { color: #c9973a; text-decoration: none; opacity: .6; }

    /* ─ Mobile ─ */
    @media (max-width: 480px) {
      #sw-btn  { bottom: 16px; right: 16px; height: 54px; padding: 0 18px 0 12px; }
      #sw-chat { right: 0; left: 0; bottom: 0; width: 100%; max-width: 100%; height: 85vh; max-height: 85vh; border-radius: 20px 20px 0 0; border-bottom: none; }
      #sw-tip  { right: 16px; bottom: 84px; }
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
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
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
        <div id="sw-avatar">
          S
          <span id="sw-avatar-dot"></span>
        </div>
        <div id="sw-hinfo">
          <div id="sw-hname">Sofia</div>
          <div id="sw-hstatus">Online now</div>
        </div>
        <div id="sw-hsalon">
          <div id="sw-hsalon-name">Sofia AI Booking</div>
          <div id="sw-hsalon-tag">AI Administrator</div>
        </div>
        <button id="sw-close" aria-label="Close">✕</button>
      </div>

      <div id="sw-msgs">
        <div class="sw-datesep">Today</div>
        <div class="sw-typing" id="sw-typing">
          <div class="sw-dot"></div>
          <div class="sw-dot"></div>
          <div class="sw-dot"></div>
        </div>
      </div>

      <div id="sw-input-row">
        <div id="sw-input-box">
          <input id="sw-input" placeholder="Message Sofia…" autocomplete="off" />
        </div>
        <button id="sw-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>

      <div id="sw-footer">Powered by <a href="#" target="_blank">Sofia AI</a></div>
    </div>
  `;
  document.body.appendChild(widget);

  /* ── State ── */
  let history = [];
  let isOpen = false;
  let busy = false;
  let tipShown = false;

  const chat    = document.getElementById('sw-chat');
  const btn     = document.getElementById('sw-btn');
  const closeBtn= document.getElementById('sw-close');
  const msgsEl  = document.getElementById('sw-msgs');
  const input   = document.getElementById('sw-input');
  const sendBtn = document.getElementById('sw-send');
  const typing  = document.getElementById('sw-typing');
  const tip     = document.getElementById('sw-tip');

  const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  /* tooltip */
  setTimeout(() => {
    if (!isOpen && !tipShown) {
      tipShown = true;
      tip.classList.add('on');
      setTimeout(() => tip.classList.remove('on'), 5000);
    }
  }, 12000);

  /* open/close */
  btn.addEventListener('click', () => {
    tip.classList.remove('on');
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    if (isOpen && history.length === 0) startGreeting();
    if (isOpen) input.focus();
  });
  closeBtn.addEventListener('click', () => { isOpen = false; chat.classList.remove('open'); });

  /* greeting */
  function startGreeting() {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addBotMsg(
        "Welcome 💛 I'm Sofia — how can I help you today?",
        ['📅 Book appointment', '💅 Services & prices', '👩‍🎨 Our team', '💬 Ask a question']
      );
    }, 1200);
  }

  function setTyping(on) {
    typing.classList.toggle('show', on);
    if (on) msgsEl.scrollTop = 99999;
  }

  function addBotMsg(text, qr = []) {
    const div = document.createElement('div');
    div.className = 'sw-msg bot';
    const b = document.createElement('div');
    b.className = 'sw-bubble';
    b.textContent = text;
    const t = document.createElement('div');
    t.className = 'sw-time';
    t.textContent = `Sofia · ${nowTime()}`;
    div.appendChild(b);
    div.appendChild(t);
    msgsEl.insertBefore(div, typing);

    if (qr.length) {
      const wrap = document.createElement('div');
      wrap.className = 'sw-qr';
      qr.forEach(label => {
        const qbtn = document.createElement('button');
        qbtn.className = 'sw-qr-btn';
        qbtn.textContent = label;
        qbtn.onclick = () => { wrap.remove(); send(label); };
        wrap.appendChild(qbtn);
      });
      msgsEl.insertBefore(wrap, typing);
    }
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function addUserMsg(text) {
    const div = document.createElement('div');
    div.className = 'sw-msg user';
    const b = document.createElement('div');
    b.className = 'sw-bubble';
    b.textContent = text;
    const t = document.createElement('div');
    t.className = 'sw-time';
    t.textContent = nowTime();
    div.appendChild(b);
    div.appendChild(t);
    msgsEl.insertBefore(div, typing);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  /* send */
  async function send(override) {
    const text = (override || input.value).trim();
    if (!text || busy) return;
    input.value = '';
    busy = true;
    sendBtn.disabled = true;
    addUserMsg(text);
    history.push({ role: 'user', content: text });
    setTyping(true);
    try {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 500));
      const res  = await fetch('https://claude-widget.vercel.app/api/widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, widgetId })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'll be right with you.";
      history.push({ role: 'assistant', content: reply });
      setTyping(false);
      addBotMsg(reply);
    } catch {
      setTyping(false);
      addBotMsg("I'm having a moment — please try again.");
    }
    busy = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', () => send());
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(); } });

})();
