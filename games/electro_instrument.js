(function(){
  const STYLE_ID = 'mini-exp-electro-style';
  const STYLE_CSS = `
    .electro-studio { display:flex; flex-direction:column; gap:16px; padding:18px; width:100%; box-sizing:border-box; font-family:'Segoe UI','Hiragino Sans','sans-serif'; color:#0f172a; background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(14,116,144,0.12)); border-radius:16px; border:1px solid rgba(15,23,42,0.12); box-shadow:0 18px 42px rgba(15,23,42,0.12); }
    .electro-header { display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; }
    .electro-header h2 { margin:0; font-size:20px; letter-spacing:0.02em; display:flex; align-items:center; gap:8px; }
    .electro-header h2 span { font-size:13px; font-weight:600; color:#2563eb; padding:2px 10px; background:rgba(37,99,235,0.12); border-radius:999px; }
    .electro-controls { display:flex; flex-wrap:wrap; gap:12px; align-items:center; }
    .electro-control { display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:600; color:#1f2937; }
    .electro-control select, .electro-control input[type="range"] { min-width:160px; border-radius:999px; border:1px solid rgba(15,23,42,0.16); padding:6px 14px; font-weight:600; color:#0f172a; background:rgba(255,255,255,0.92); box-shadow:0 4px 12px rgba(15,23,42,0.12); }
    .electro-control input[type="range"] { padding:0; height:4px; border-radius:999px; background:linear-gradient(90deg,#38bdf8,#2563eb); box-shadow:none; }
    .electro-meter { display:flex; flex-direction:column; gap:4px; font-size:12px; color:#1f2937; }
    .electro-meter .value { font-size:18px; font-weight:700; color:#0f172a; }
    .electro-keyboard { position:relative; width:100%; max-width:860px; align-self:center; padding:16px; border-radius:18px; background:linear-gradient(160deg,rgba(15,23,42,0.88),rgba(30,41,59,0.92)); box-shadow:0 20px 46px rgba(15,23,42,0.45); }
    .electro-keyboard-inner { position:relative; margin:0 auto; }
    .electro-key.white { position:relative; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; width:64px; height:220px; margin-right:2px; border-radius:0 0 12px 12px; background:linear-gradient(180deg,#f8fafc,#e2e8f0); border:1px solid rgba(148,163,184,0.6); box-shadow:inset 0 -6px 12px rgba(148,163,184,0.25); cursor:pointer; transition:transform 0.05s ease, background 0.1s ease; }
    .electro-key.white:last-child { margin-right:0; }
    .electro-key.white.active { transform:translateY(2px); background:linear-gradient(180deg,#e2e8f0,#cbd5f5); box-shadow:inset 0 -8px 14px rgba(37,99,235,0.25); }
    .electro-key.black { position:absolute; top:0; width:44px; height:140px; border-radius:0 0 9px 9px; background:linear-gradient(180deg,#0f172a,#1e293b); border:1px solid rgba(148,163,184,0.45); box-shadow:0 12px 22px rgba(15,23,42,0.5); cursor:pointer; transform:translateX(-22px); display:flex; flex-direction:column; align-items:center; justify-content:flex-end; padding-bottom:12px; transition:transform 0.05s ease, background 0.1s ease; color:#cbd5f5; font-size:11px; font-weight:600; }
    .electro-key.black::after { content:""; position:absolute; inset:0; border-radius:0 0 9px 9px; background:linear-gradient(180deg,rgba(226,232,240,0.12),rgba(14,116,144,0.18)); opacity:0; transition:opacity 0.1s ease; }
    .electro-key.black.active { transform:translate(-22px, 2px); background:linear-gradient(180deg,#1f2937,#334155); box-shadow:0 10px 18px rgba(37,99,235,0.45); }
    .electro-key.black.active::after { opacity:1; }
    .electro-key.white span, .electro-key.black span { pointer-events:none; text-transform:uppercase; }
    .electro-key.white .note { font-size:13px; font-weight:700; color:#1f2937; margin-bottom:8px; }
    .electro-key.white .kbd { font-size:11px; font-weight:600; color:#475569; margin-bottom:6px; background:rgba(148,163,184,0.25); padding:2px 8px; border-radius:999px; }
    .electro-key.black .note { font-size:12px; margin-bottom:6px; }
    .electro-key.black .kbd { font-size:10px; color:#cbd5f5; background:rgba(59,130,246,0.28); padding:2px 6px; border-radius:999px; }
    .electro-infos { display:flex; flex-wrap:wrap; gap:16px; font-size:12px; color:#1f2937; justify-content:space-between; }
    .electro-infos p { margin:0; max-width:480px; line-height:1.7; color:#0f172a; }
    .electro-activity { display:flex; flex-direction:column; gap:6px; }
    .electro-activity strong { color:#2563eb; }
    .electro-recent { display:flex; gap:6px; flex-wrap:wrap; }
    .electro-recent .tag { background:rgba(59,130,246,0.14); color:#1d4ed8; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.02em; }
    .electro-legend { display:flex; gap:10px; flex-wrap:wrap; font-size:11px; color:#1f2937; }
    .electro-legend span { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; background:rgba(226,232,240,0.72); }
    .electro-legend span::before { content:""; display:inline-block; width:12px; height:12px; border-radius:999px; }
    .electro-legend .white::before { background:#f8fafc; border:1px solid rgba(148,163,184,0.6); }
    .electro-legend .black::before { background:#0f172a; border:1px solid rgba(148,163,184,0.45); }
  `;

  function ensureStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLE_CSS;
    document.head.appendChild(style);
  }

  const WHITE_KEY_WIDTH = 66;
  const BLACK_KEY_OFFSET = WHITE_KEY_WIDTH / 2;

  const KEY_LAYOUT = [
    { midi:60, note:'C4', type:'white', key:'a' },
    { midi:61, note:'C#4', type:'black', key:'w', between:['C4','D4'] },
    { midi:62, note:'D4', type:'white', key:'s' },
    { midi:63, note:'D#4', type:'black', key:'e', between:['D4','E4'] },
    { midi:64, note:'E4', type:'white', key:'d' },
    { midi:65, note:'F4', type:'white', key:'f' },
    { midi:66, note:'F#4', type:'black', key:'t', between:['F4','G4'] },
    { midi:67, note:'G4', type:'white', key:'g' },
    { midi:68, note:'G#4', type:'black', key:'y', between:['G4','A4'] },
    { midi:69, note:'A4', type:'white', key:'h' },
    { midi:70, note:'A#4', type:'black', key:'u', between:['A4','B4'] },
    { midi:71, note:'B4', type:'white', key:'j' },
    { midi:72, note:'C5', type:'white', key:'k' },
    { midi:73, note:'C#5', type:'black', key:'o', between:['C5','D5'] },
    { midi:74, note:'D5', type:'white', key:'l' },
    { midi:75, note:'D#5', type:'black', key:'p', between:['D5','E5'] },
    { midi:76, note:'E5', type:'white', key:';' },
    { midi:77, note:'F5', type:'white', key:"'" },
    { midi:78, note:'F#5', type:'black', key:"]", between:['F5','G5'] },
    { midi:79, note:'G5', type:'white', key:'z' },
    { midi:80, note:'G#5', type:'black', key:"x", between:['G5','A5'] },
    { midi:81, note:'A5', type:'white', key:'c' },
    { midi:82, note:'A#5', type:'black', key:'v', between:['A5','B5'] },
    { midi:83, note:'B5', type:'white', key:'b' }
  ];

  const KEY_DISPLAY = {
    a:'A', w:'W', s:'S', e:'E', d:'D', f:'F', t:'T', g:'G', y:'Y', h:'H', u:'U', j:'J', k:'K', o:'O', l:'L', p:'P', ';':';', "'":"'", ']':']', z:'Z', x:'X', c:'C', v:'V', b:'B'
  };

  const INSTRUMENTS = [
    {
      id:'piano',
      label:'スタジオピアノ',
      envelope:{ attack:0.018, decay:0.28, sustain:0.45, release:1.1 },
      oscillators:[
        { type:'sine', gain:0.85 },
        { type:'triangle', gain:0.25, detune:1200 }
      ],
      vibrato:{ rate:5.2, depth:5, delay:0.22 },
      volume:0.9
    },
    {
      id:'synth_pad',
      label:'シンセパッド',
      envelope:{ attack:0.35, decay:0.4, sustain:0.8, release:2.6 },
      oscillators:[
        { type:'sawtooth', gain:0.6, detune:-6 },
        { type:'sawtooth', gain:0.6, detune:6 }
      ],
      vibrato:{ rate:4.4, depth:9, delay:0.6 },
      volume:0.7
    },
    {
      id:'electric_organ',
      label:'エレクトリックオルガン',
      envelope:{ attack:0.02, decay:0.12, sustain:0.7, release:0.7 },
      oscillators:[
        { type:'square', gain:0.7 },
        { type:'triangle', gain:0.3, detune:1200 }
      ],
      vibrato:{ rate:6.5, depth:4.5, delay:0.18 },
      volume:0.65
    },
    {
      id:'digital_strings',
      label:'デジタルストリングス',
      envelope:{ attack:0.26, decay:0.35, sustain:0.75, release:2.8 },
      oscillators:[
        { type:'triangle', gain:0.7, detune:-4 },
        { type:'triangle', gain:0.7, detune:4 },
        { type:'sine', gain:0.25, detune:1200 }
      ],
      vibrato:{ rate:5.8, depth:6.5, delay:0.35 },
      volume:0.75
    }
  ];

  const KEY_MAP = {};
  KEY_LAYOUT.forEach(k => { KEY_MAP[k.key] = k; });

  function midiToFreq(midi){
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('MiniExp Electro Instrument requires a container');
    ensureStyle();

    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const xpPerNote = difficulty === 'HARD' ? 1.2 : difficulty === 'EASY' ? 0.6 : 0.9;

    const wrapper = document.createElement('div');
    wrapper.className = 'electro-studio';

    const header = document.createElement('div');
    header.className = 'electro-header';

    const title = document.createElement('h2');
    title.textContent = '電子楽器スタジオ';
    const badge = document.createElement('span');
    badge.textContent = 'TOY MOD';
    title.appendChild(badge);
    header.appendChild(title);

    const controls = document.createElement('div');
    controls.className = 'electro-controls';

    const instrumentControl = document.createElement('label');
    instrumentControl.className = 'electro-control';
    instrumentControl.textContent = '音色';
    const instrumentSelect = document.createElement('select');
    INSTRUMENTS.forEach(inst => {
      const opt = document.createElement('option');
      opt.value = inst.id;
      opt.textContent = inst.label;
      instrumentSelect.appendChild(opt);
    });
    instrumentControl.appendChild(instrumentSelect);

    const volumeControl = document.createElement('label');
    volumeControl.className = 'electro-control';
    volumeControl.textContent = 'マスターボリューム';
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = '75';
    volumeSlider.step = '1';
    volumeControl.appendChild(volumeSlider);

    const xpMeter = document.createElement('div');
    xpMeter.className = 'electro-meter';
    const xpLabel = document.createElement('span');
    xpLabel.textContent = 'セッションEXP';
    const xpValue = document.createElement('span');
    xpValue.className = 'value';
    xpValue.textContent = '0';
    xpMeter.appendChild(xpLabel);
    xpMeter.appendChild(xpValue);

    controls.appendChild(instrumentControl);
    controls.appendChild(volumeControl);
    controls.appendChild(xpMeter);
    header.appendChild(controls);
    wrapper.appendChild(header);

    const keyboardFrame = document.createElement('div');
    keyboardFrame.className = 'electro-keyboard';

    const keyboardInner = document.createElement('div');
    keyboardInner.className = 'electro-keyboard-inner';
    keyboardFrame.appendChild(keyboardInner);

    wrapper.appendChild(keyboardFrame);

    const infos = document.createElement('div');
    infos.className = 'electro-infos';
    const description = document.createElement('p');
    description.textContent = 'ピアノ鍵盤で自由に演奏し、音色を切り替えてサウンドメイク。各音を奏でるたびにEXPを獲得します。キーボードでも演奏可能です。';
    const legend = document.createElement('div');
    legend.className = 'electro-legend';
    const whiteLegend = document.createElement('span');
    whiteLegend.className = 'white';
    whiteLegend.textContent = '白鍵：基本音';
    const blackLegend = document.createElement('span');
    blackLegend.className = 'black';
    blackLegend.textContent = '黒鍵：半音';
    legend.appendChild(whiteLegend);
    legend.appendChild(blackLegend);
    infos.appendChild(description);
    infos.appendChild(legend);
    wrapper.appendChild(infos);

    const activity = document.createElement('div');
    activity.className = 'electro-activity';
    const activityLabel = document.createElement('div');
    activityLabel.innerHTML = '<strong>最新のフレーズ</strong> (最大10音)';
    const recentWrap = document.createElement('div');
    recentWrap.className = 'electro-recent';
    activity.appendChild(activityLabel);
    activity.appendChild(recentWrap);
    wrapper.appendChild(activity);

    root.appendChild(wrapper);

    const noteDefs = KEY_LAYOUT.map(def => ({ ...def, frequency: midiToFreq(def.midi) }));

    const whiteNotes = noteDefs.filter(n => n.type === 'white');
    const blackNotes = noteDefs.filter(n => n.type === 'black');

    const whiteCount = whiteNotes.length;
    keyboardInner.style.width = `${whiteCount * WHITE_KEY_WIDTH}px`;
    keyboardInner.style.height = '224px';

    const keyElements = new Map();
    const recentNotes = [];

    let audioCtx = null;
    let masterGain = null;
    let activeVoices = new Map();
    let currentInstrument = INSTRUMENTS[0];
    let listenersActive = false;
    let sessionXp = 0;

    function ensureAudio(){
      if (!audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) throw new Error('Web Audio API is not supported');
        audioCtx = new AudioCtx();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = Number(volumeSlider.value) / 100;
        masterGain.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume?.();
      }
      return audioCtx;
    }

    function highlight(noteName, isActive){
      const el = keyElements.get(noteName);
      if (!el) return;
      if (isActive) el.classList.add('active');
      else el.classList.remove('active');
    }

    function updateRecent(noteName){
      recentNotes.push(noteName);
      while (recentNotes.length > 10) recentNotes.shift();
      recentWrap.innerHTML = '';
      if (recentNotes.length === 0) {
        const placeholder = document.createElement('span');
        placeholder.className = 'tag';
        placeholder.textContent = 'まだ音がありません';
        recentWrap.appendChild(placeholder);
        return;
      }
      recentNotes.slice().reverse().forEach(name => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = name;
        recentWrap.appendChild(tag);
      });
    }

    function grantXp(){
      sessionXp += xpPerNote;
      xpValue.textContent = sessionXp.toFixed(1).replace(/\.0$/, '');
      try {
        awardXp && awardXp(xpPerNote, { type:'perform', label:'note' });
      } catch {}
    }

    function scheduleRelease(noteName){
      const voice = activeVoices.get(noteName);
      if (!voice) return;
      const release = Math.max(0.08, voice.instrument.envelope.release || 0.5);
      const now = audioCtx.currentTime;
      const gain = voice.gain;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0.0001, now, release / 3);
      voice.oscillators.forEach(entry => {
        try { entry.osc.stop(now + release + 0.05); } catch {}
      });
      if (voice.lfo) {
        try { voice.lfo.stop(now + release + 0.05); } catch {}
      }
      if (voice.cleanupTimer) clearTimeout(voice.cleanupTimer);
      voice.cleanupTimer = setTimeout(() => {
        try { gain.disconnect(); } catch {}
        voice.oscillators.forEach(entry => {
          try { entry.osc.disconnect(); } catch {}
          if (entry.gainNode) {
            try { entry.gainNode.disconnect(); } catch {}
          }
        });
        if (voice.lfo) {
          try { voice.lfo.disconnect(); } catch {}
          voice.lfoGains?.forEach(g => { try { g.disconnect(); } catch {}; });
        }
      }, (release + 0.1) * 1000);
      activeVoices.delete(noteName);
      highlight(noteName, false);
    }

    function startVoice(noteDef){
      if (!noteDef) return;
      ensureAudio();
      if (!audioCtx) return;
      const noteName = noteDef.note;
      const existing = activeVoices.get(noteName);
      if (existing) {
        scheduleRelease(noteName);
      }
      const now = audioCtx.currentTime;
      const instrument = currentInstrument;
      const env = instrument.envelope || { attack:0.01, decay:0.1, sustain:0.7, release:0.5 };
      const mainGain = audioCtx.createGain();
      mainGain.gain.setValueAtTime(0.0001, now);
      const peak = instrument.volume || 0.8;
      mainGain.gain.linearRampToValueAtTime(peak, now + Math.max(0.005, env.attack || 0.01));
      mainGain.gain.linearRampToValueAtTime(peak * (env.sustain ?? 0.7), now + Math.max(0.005, env.attack || 0.01) + Math.max(0.01, env.decay || 0.1));
      mainGain.connect(masterGain);

      const oscillatorEntries = [];
      instrument.oscillators.forEach(cfg => {
        const osc = audioCtx.createOscillator();
        osc.type = cfg.type || 'sine';
        osc.frequency.setValueAtTime(noteDef.frequency, now);
        if (Number.isFinite(cfg.detune)) osc.detune.setValueAtTime(cfg.detune, now);
        let gainNode = null;
        if (cfg.gain != null && cfg.gain !== 1) {
          gainNode = audioCtx.createGain();
          gainNode.gain.setValueAtTime(cfg.gain, now);
          osc.connect(gainNode);
          gainNode.connect(mainGain);
        } else {
          osc.connect(mainGain);
        }
        osc.start(now);
        oscillatorEntries.push({ osc, gainNode });
      });

      let lfo = null;
      const lfoGains = [];
      if (instrument.vibrato && instrument.vibrato.depth > 0 && instrument.vibrato.rate > 0) {
        lfo = audioCtx.createOscillator();
        const depth = instrument.vibrato.depth;
        const rate = instrument.vibrato.rate;
        const delay = instrument.vibrato.delay || 0;
        lfo.frequency.setValueAtTime(rate, now);
        oscillatorEntries.forEach(entry => {
          const lfoGain = audioCtx.createGain();
          lfoGain.gain.setValueAtTime(0, now);
          lfoGain.gain.setValueAtTime(0, now + delay);
          lfoGain.gain.linearRampToValueAtTime(depth, now + delay + 0.2);
          lfo.connect(lfoGain);
          lfoGain.connect(entry.osc.detune);
          lfoGains.push(lfoGain);
        });
        lfo.start(now + (instrument.vibrato.delay || 0));
      }

      activeVoices.set(noteName, {
        gain: mainGain,
        oscillators: oscillatorEntries,
        instrument,
        lfo,
        lfoGains,
        cleanupTimer: null
      });
      highlight(noteName, true);
      grantXp();
      updateRecent(noteName);
    }

    function handleKeyDown(ev){
      if (!listenersActive) return;
      if (ev.repeat) return;
      if (ev.target && ['INPUT','TEXTAREA','SELECT'].includes(ev.target.tagName)) return;
      const key = ev.key?.toLowerCase();
      const noteDef = KEY_MAP[key];
      if (!noteDef) return;
      ev.preventDefault();
      startVoice(noteDef);
    }

    function handleKeyUp(ev){
      if (!listenersActive) return;
      const key = ev.key?.toLowerCase();
      const noteDef = KEY_MAP[key];
      if (!noteDef) return;
      ev.preventDefault();
      if (!audioCtx) return;
      scheduleRelease(noteDef.note);
    }

    function bindKey(noteDef){
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `electro-key ${noteDef.type}`;
      el.dataset.note = noteDef.note;
      el.title = `${noteDef.note}${noteDef.key ? ` / ${noteDef.key.toUpperCase()}キー` : ''}`;

      const noteLabel = document.createElement('span');
      noteLabel.className = 'note';
      noteLabel.textContent = noteDef.note.replace(/([0-9])$/, (_, num) => `${num}`);
      const kbdLabel = document.createElement('span');
      kbdLabel.className = 'kbd';
      if (noteDef.key) kbdLabel.textContent = KEY_DISPLAY[noteDef.key] || noteDef.key.toUpperCase();
      else kbdLabel.textContent = '-';

      el.appendChild(noteLabel);
      el.appendChild(kbdLabel);

      keyElements.set(noteDef.note, el);

      if (noteDef.type === 'white') {
        const whiteIndex = whiteNotes.findIndex(n => n.note === noteDef.note);
        el.style.position = 'relative';
        el.style.left = `${whiteIndex * WHITE_KEY_WIDTH}px`;
        keyboardInner.appendChild(el);
      } else {
        const leftWhite = noteDef.between ? noteDef.between[0] : null;
        const rightWhite = noteDef.between ? noteDef.between[1] : null;
        const leftIndex = leftWhite ? whiteNotes.findIndex(n => n.note === leftWhite) : 0;
        const rightIndex = rightWhite ? whiteNotes.findIndex(n => n.note === rightWhite) : leftIndex + 1;
        const position = (leftIndex + 1) * WHITE_KEY_WIDTH - BLACK_KEY_OFFSET;
        el.style.left = `${position}px`;
        el.style.zIndex = '5';
        keyboardInner.appendChild(el);
      }

      const pointerDown = ev => {
        ev.preventDefault();
        try { el.setPointerCapture(ev.pointerId); } catch {}
        startVoice(noteDef);
      };
      const pointerUp = ev => {
        ev.preventDefault();
        try { el.releasePointerCapture(ev.pointerId); } catch {}
        if (!audioCtx) return;
        scheduleRelease(noteDef.note);
      };
      const pointerLeave = ev => {
        if ((ev.buttons & 1) === 0) return;
        if (!audioCtx) return;
        scheduleRelease(noteDef.note);
      };
      el.addEventListener('pointerdown', pointerDown);
      el.addEventListener('pointerup', pointerUp);
      el.addEventListener('pointercancel', pointerUp);
      el.addEventListener('pointerout', pointerLeave);
    }

    whiteNotes.forEach(bindKey);
    blackNotes.forEach(bindKey);

    function setInstrument(id){
      const next = INSTRUMENTS.find(inst => inst.id === id) || INSTRUMENTS[0];
      currentInstrument = next;
    }

    instrumentSelect.addEventListener('change', () => {
      setInstrument(instrumentSelect.value);
    });
    setInstrument(instrumentSelect.value);

    volumeSlider.addEventListener('input', () => {
      if (!masterGain) return;
      masterGain.gain.value = Number(volumeSlider.value) / 100;
    });

    function renderRecentPlaceholder(){
      recentWrap.innerHTML = '';
      const placeholder = document.createElement('span');
      placeholder.className = 'tag';
      placeholder.textContent = 'キーを押して演奏開始';
      recentWrap.appendChild(placeholder);
    }

    function start(){
      if (listenersActive) return;
      listenersActive = true;
      window.addEventListener('keydown', handleKeyDown, { passive:false });
      window.addEventListener('keyup', handleKeyUp, { passive:false });
      recentNotes.length = 0;
      renderRecentPlaceholder();
    }

    function stop(){
      if (!listenersActive) return;
      listenersActive = false;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      Array.from(activeVoices.keys()).forEach(note => scheduleRelease(note));
      activeVoices.clear();
      keyElements.forEach(el => el.classList.remove('active'));
    }

    function destroy(){
      stop();
      try { root.removeChild(wrapper); } catch {}
      if (audioCtx) {
        try { masterGain?.disconnect(); } catch {}
        try { audioCtx.close(); } catch {}
      }
      audioCtx = null;
      masterGain = null;
      activeVoices = new Map();
    }

    start();

    return {
      start,
      stop,
      destroy,
      getScore(){ return sessionXp; }
    };
  }

  window.registerMiniGame({
    id: 'electro_instrument',
    name: '電子楽器スタジオ',
    description: '電子鍵盤で自由に演奏し音色チェンジ毎音EXP',
    category: 'トイ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();
