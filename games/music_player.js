(function(){
  const STORAGE_KEY = 'mini_music_player_state_v1';
  const DB_NAME = 'mini_music_player_db';
  const DB_STORE = 'tracks';
  const DB_VERSION = 1;
  const MAX_TRACKS = 32;
  const MAX_FILE_SIZE = 12 * 1024 * 1024;
  const PERSIST_DELAY = 500;
  const EQ_PRESET_COOLDOWN = 30_000;

  const EQ_BANDS = [
    { freq: 60, type: 'lowshelf', label: '60Hz' },
    { freq: 170, type: 'peaking', label: '170Hz' },
    { freq: 350, type: 'peaking', label: '350Hz' },
    { freq: 1000, type: 'peaking', label: '1kHz' },
    { freq: 3500, type: 'peaking', label: '3.5kHz' },
    { freq: 10000, type: 'highshelf', label: '10kHz' }
  ];

  const EQ_PRESETS = {
    flat: { label: 'フラット', gains: [0, 0, 0, 0, 0, 0] },
    rock: { label: 'ロック', gains: [4, 3, 0, 2, 4, 5] },
    vocal: { label: 'ボーカル', gains: [-2, -1, 2, 4, 3, 1] },
    bass_boost: { label: '低音強調', gains: [6, 4, 2, 0, -1, -3] }
  };

  function createId(){
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'trk_' + Math.random().toString(36).slice(2);
  }

  function clamp(value, min, max){
    return Math.min(max, Math.max(min, value));
  }

  function safeString(value, fallback = ''){
    return typeof value === 'string' ? value : fallback;
  }

  function formatDuration(seconds){
    if (!Number.isFinite(seconds) || seconds <= 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function formatFileSize(bytes){
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    const units = ['B', 'KB', 'MB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1){
      size /= 1024;
      unit++;
    }
    return `${size.toFixed(unit === 0 ? 0 : 1)}${units[unit]}`;
  }

  function loadPersistentState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const tracks = Array.isArray(parsed.tracks) ? parsed.tracks.map(t => {
        if (!t || typeof t !== 'object') return null;
        const id = safeString(t.id, createId());
        const name = safeString(t.name, '名称未設定');
        const duration = Number.isFinite(t.duration) ? t.duration : null;
        const type = safeString(t.type, 'audio/mpeg');
        const size = Number.isFinite(t.size) ? t.size : null;
        const addedAt = Number.isFinite(t.addedAt) ? t.addedAt : Date.now();
        return { id, name, duration, type, size, addedAt };
      }).filter(Boolean) : [];
      const eqGains = Array.isArray(parsed.eqGains) ? parsed.eqGains.slice(0, EQ_BANDS.length).map(v => Number.isFinite(v) ? clamp(v, -12, 12) : 0) : EQ_BANDS.map(() => 0);
      while (eqGains.length < EQ_BANDS.length) eqGains.push(0);
      return {
        tracks,
        currentTrackId: safeString(parsed.currentTrackId, null),
        currentTime: Number.isFinite(parsed.currentTime) ? Math.max(0, parsed.currentTime) : 0,
        isPlaying: !!parsed.isPlaying,
        volume: Number.isFinite(parsed.volume) ? clamp(parsed.volume, 0, 1) : 0.8,
        playbackRate: Number.isFinite(parsed.playbackRate) ? clamp(parsed.playbackRate, 0.5, 2) : 1,
        loopMode: ['one', 'all'].includes(parsed.loopMode) ? parsed.loopMode : 'none',
        shuffle: !!parsed.shuffle,
        eqGains,
        eqPreset: safeString(parsed.eqPreset, 'flat') || 'flat'
      };
    } catch {
      return null;
    }
  }

  function writePersistentState(state){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tracks: state.tracks.map(t => ({
          id: t.id,
          name: t.name,
          duration: t.duration,
          type: t.type,
          size: t.size,
          addedAt: t.addedAt
        })),
        currentTrackId: state.currentTrackId,
        currentTime: state.currentTime,
        isPlaying: state.isPlaying,
        volume: state.volume,
        playbackRate: state.playbackRate,
        loopMode: state.loopMode,
        shuffle: state.shuffle,
        eqGains: state.eqGains,
        eqPreset: state.eqPreset
      }));
    } catch {}
  }

  function openDatabase(){
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB is not available'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error || new Error('Failed to open DB'));
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)){
          const store = db.createObjectStore(DB_STORE, { keyPath: 'id' });
          store.createIndex('addedAt', 'addedAt', { unique: false });
        }
      };
    });
  }

  class TrackStore {
    constructor(){
      this.db = null;
    }

    async init(){
      if (this.db) return this.db;
      this.db = await openDatabase();
      return this.db;
    }

    async getAll(){
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error || new Error('Failed to read tracks'));
      });
    }

    async get(id){
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('Failed to read track'));
      });
    }

    async put(track){
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const request = store.put(track);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to save track'));
      });
    }

    async delete(id){
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to delete track'));
      });
    }

    close(){
      try {
        if (this.db) this.db.close();
      } catch {}
      this.db = null;
    }
  }

  function createToast(){
    let timer = null;
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.bottom = '16px';
    el.style.right = '16px';
    el.style.padding = '10px 16px';
    el.style.borderRadius = '999px';
    el.style.background = 'rgba(15,23,42,0.86)';
    el.style.color = '#f8fafc';
    el.style.fontSize = '13px';
    el.style.fontWeight = '600';
    el.style.pointerEvents = 'none';
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.2s ease';
    return {
      element: el,
      show(message){
        el.textContent = message;
        el.style.opacity = '1';
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          el.style.opacity = '0';
        }, 2500);
      },
      hide(){
        if (timer) clearTimeout(timer);
        el.style.opacity = '0';
      }
    };
  }
  function create(root, awardXp){
    if (!root) throw new Error('MiniExp Music Player requires a container');

    const trackStore = new TrackStore();
    const persisted = loadPersistentState();

    const state = {
      tracks: persisted?.tracks ? persisted.tracks.slice(0, MAX_TRACKS) : [],
      currentTrackId: persisted?.currentTrackId || null,
      currentTime: persisted?.currentTime || 0,
      isPlaying: false,
      pendingResume: persisted?.isPlaying || false,
      volume: persisted?.volume ?? 0.8,
      playbackRate: persisted?.playbackRate ?? 1,
      loopMode: persisted?.loopMode || 'none',
      shuffle: persisted?.shuffle ?? false,
      eqGains: (persisted?.eqGains || []).slice(0, EQ_BANDS.length),
      eqPreset: persisted?.eqPreset || 'flat',
      sessionXp: 0,
      firstPlayAwarded: false,
      eqPresetCooldownAt: 0
    };
    while (state.eqGains.length < EQ_BANDS.length) state.eqGains.push(0);

    const objectUrls = new Map();

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audio.controls = false;
    audio.volume = clamp(state.volume, 0, 1);
    audio.playbackRate = clamp(state.playbackRate, 0.5, 2);

    let audioContext = null;
    let sourceNode = null;
    let gainNode = null;
    let analyserNode = null;
    let rafId = null;

    const eqNodes = [];
    let persistTimer = null;
    let isRunning = false;

    const toast = createToast();

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'linear-gradient(135deg, #0f172a, #1e293b)';
    wrapper.style.position = 'relative';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';

    const frame = document.createElement('div');
    frame.style.width = 'min(960px, 96%)';
    frame.style.height = 'min(620px, 96%)';
    frame.style.display = 'grid';
    frame.style.gridTemplateColumns = 'minmax(320px, 1.1fr) minmax(320px, 1fr)';
    frame.style.gridTemplateRows = 'auto 1fr auto';
    frame.style.background = 'rgba(15,23,42,0.8)';
    frame.style.backdropFilter = 'blur(22px)';
    frame.style.borderRadius = '20px';
    frame.style.boxShadow = '0 28px 80px rgba(2,6,23,0.6)';
    frame.style.color = '#e2e8f0';
    frame.style.overflow = 'hidden';

    const header = document.createElement('div');
    header.style.gridColumn = '1 / span 2';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.padding = '18px 24px';
    header.style.borderBottom = '1px solid rgba(148,163,184,0.18)';
    header.style.background = 'rgba(15,23,42,0.85)';

    const headerInfo = document.createElement('div');
    headerInfo.style.display = 'flex';
    headerInfo.style.alignItems = 'center';
    headerInfo.style.gap = '16px';

    const appIcon = document.createElement('div');
    appIcon.style.width = '42px';
    appIcon.style.height = '42px';
    appIcon.style.borderRadius = '14px';
    appIcon.style.background = 'linear-gradient(135deg, #38bdf8, #6366f1)';
    appIcon.style.display = 'flex';
    appIcon.style.alignItems = 'center';
    appIcon.style.justifyContent = 'center';
    appIcon.style.boxShadow = '0 12px 32px rgba(99,102,241,0.45)';
    appIcon.textContent = '♪';
    appIcon.style.fontSize = '20px';
    appIcon.style.fontWeight = '700';

    const headerTextWrap = document.createElement('div');
    headerTextWrap.style.display = 'flex';
    headerTextWrap.style.flexDirection = 'column';
    headerTextWrap.style.gap = '4px';

    const trackTitle = document.createElement('div');
    trackTitle.style.fontSize = '18px';
    trackTitle.style.fontWeight = '700';
    trackTitle.style.color = '#f8fafc';
    trackTitle.textContent = 'ミュージックプレイヤー';

    const trackSubtitle = document.createElement('div');
    trackSubtitle.style.fontSize = '13px';
    trackSubtitle.style.color = '#cbd5f5';
    trackSubtitle.textContent = 'ローカル音源を再生するユーティリティ';

    headerTextWrap.appendChild(trackTitle);
    headerTextWrap.appendChild(trackSubtitle);
    headerInfo.appendChild(appIcon);
    headerInfo.appendChild(headerTextWrap);

    const headerActions = document.createElement('div');
    headerActions.style.display = 'flex';
    headerActions.style.alignItems = 'center';
    headerActions.style.gap = '12px';

    const importLabel = document.createElement('label');
    importLabel.textContent = '音源を追加';
    importLabel.style.padding = '10px 18px';
    importLabel.style.borderRadius = '999px';
    importLabel.style.cursor = 'pointer';
    importLabel.style.background = 'linear-gradient(135deg, #22d3ee, #2563eb)';
    importLabel.style.color = '#0f172a';
    importLabel.style.fontWeight = '700';
    importLabel.style.boxShadow = '0 12px 24px rgba(34,211,238,0.45)';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    importLabel.appendChild(fileInput);

    const settingsBtn = document.createElement('button');
    settingsBtn.type = 'button';
    settingsBtn.textContent = '⚙';
    settingsBtn.style.width = '40px';
    settingsBtn.style.height = '40px';
    settingsBtn.style.borderRadius = '14px';
    settingsBtn.style.border = '1px solid rgba(148,163,184,0.24)';
    settingsBtn.style.background = 'rgba(15,23,42,0.6)';
    settingsBtn.style.color = '#e2e8f0';
    settingsBtn.style.cursor = 'pointer';
    settingsBtn.style.fontSize = '18px';

    const settingsMenu = document.createElement('div');
    settingsMenu.style.position = 'absolute';
    settingsMenu.style.top = '70px';
    settingsMenu.style.right = '24px';
    settingsMenu.style.minWidth = '220px';
    settingsMenu.style.background = 'rgba(15,23,42,0.95)';
    settingsMenu.style.border = '1px solid rgba(148,163,184,0.2)';
    settingsMenu.style.borderRadius = '16px';
    settingsMenu.style.boxShadow = '0 18px 44px rgba(15,23,42,0.6)';
    settingsMenu.style.padding = '12px';
    settingsMenu.style.display = 'none';
    settingsMenu.style.flexDirection = 'column';
    settingsMenu.style.gap = '8px';
    settingsMenu.style.zIndex = '20';

    const shuffleToggle = document.createElement('label');
    shuffleToggle.style.display = 'flex';
    shuffleToggle.style.alignItems = 'center';
    shuffleToggle.style.justifyContent = 'space-between';
    shuffleToggle.style.padding = '8px 12px';
    shuffleToggle.style.borderRadius = '12px';
    shuffleToggle.style.cursor = 'pointer';
    shuffleToggle.textContent = 'シャッフル再生';

    const shuffleInput = document.createElement('input');
    shuffleInput.type = 'checkbox';
    shuffleInput.checked = !!state.shuffle;
    shuffleInput.style.accentColor = '#38bdf8';
    shuffleInput.style.marginLeft = '12px';
    shuffleToggle.appendChild(shuffleInput);

    const loopLabel = document.createElement('label');
    loopLabel.style.display = 'flex';
    loopLabel.style.flexDirection = 'column';
    loopLabel.style.gap = '6px';
    loopLabel.textContent = 'ループモード';

    const loopSelect = document.createElement('select');
    loopSelect.style.padding = '8px 10px';
    loopSelect.style.borderRadius = '10px';
    loopSelect.style.border = '1px solid rgba(148,163,184,0.2)';
    loopSelect.style.background = 'rgba(15,23,42,0.8)';
    loopSelect.style.color = '#e2e8f0';
    [{ value: 'none', label: 'ループなし' }, { value: 'one', label: '1曲リピート' }, { value: 'all', label: '全曲リピート' }].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      loopSelect.appendChild(option);
    });
    loopSelect.value = state.loopMode;
    loopLabel.appendChild(loopSelect);

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'ライブラリを全削除';
    clearBtn.style.padding = '9px 12px';
    clearBtn.style.borderRadius = '12px';
    clearBtn.style.border = '1px solid rgba(248,113,113,0.45)';
    clearBtn.style.background = 'rgba(239,68,68,0.12)';
    clearBtn.style.color = '#fecaca';
    clearBtn.style.cursor = 'pointer';

    settingsMenu.appendChild(shuffleToggle);
    settingsMenu.appendChild(loopLabel);
    settingsMenu.appendChild(clearBtn);

    headerActions.appendChild(importLabel);
    headerActions.appendChild(settingsBtn);

    header.appendChild(headerInfo);
    header.appendChild(headerActions);

    const playlistPanel = document.createElement('div');
    playlistPanel.style.display = 'flex';
    playlistPanel.style.flexDirection = 'column';
    playlistPanel.style.padding = '20px';
    playlistPanel.style.gap = '16px';
    playlistPanel.style.borderRight = '1px solid rgba(148,163,184,0.12)';

    const playlistHeader = document.createElement('div');
    playlistHeader.style.display = 'flex';
    playlistHeader.style.alignItems = 'center';
    playlistHeader.style.justifyContent = 'space-between';

    const playlistTitle = document.createElement('div');
    playlistTitle.textContent = 'プレイリスト';
    playlistTitle.style.fontSize = '16px';
    playlistTitle.style.fontWeight = '700';

    const playlistCount = document.createElement('div');
    playlistCount.style.fontSize = '12px';
    playlistCount.style.color = '#cbd5f5';

    playlistHeader.appendChild(playlistTitle);
    playlistHeader.appendChild(playlistCount);

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = '検索...';
    searchInput.style.padding = '10px 12px';
    searchInput.style.borderRadius = '12px';
    searchInput.style.border = '1px solid rgba(148,163,184,0.24)';
    searchInput.style.background = 'rgba(15,23,42,0.6)';
    searchInput.style.color = '#e2e8f0';

    const playlistList = document.createElement('div');
    playlistList.style.flex = '1';
    playlistList.style.overflowY = 'auto';
    playlistList.style.display = 'flex';
    playlistList.style.flexDirection = 'column';
    playlistList.style.gap = '8px';
    playlistList.style.paddingRight = '4px';

    const controlsPanel = document.createElement('div');
    controlsPanel.style.display = 'flex';
    controlsPanel.style.flexDirection = 'column';
    controlsPanel.style.padding = '18px 22px';
    controlsPanel.style.gap = '18px';
    function createControlButton(label){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.width = '48px';
      btn.style.height = '48px';
      btn.style.borderRadius = '16px';
      btn.style.border = '1px solid rgba(148,163,184,0.2)';
      btn.style.background = 'rgba(15,23,42,0.6)';
      btn.style.color = '#f8fafc';
      btn.style.fontSize = '20px';
      btn.style.cursor = 'pointer';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      return btn;
    }

    const mainControls = document.createElement('div');
    mainControls.style.display = 'flex';
    mainControls.style.alignItems = 'center';
    mainControls.style.justifyContent = 'space-between';
    mainControls.style.gap = '12px';

    const prevBtn = createControlButton('⏮');
    const playPauseBtn = createControlButton('▶');
    playPauseBtn.style.width = '64px';
    playPauseBtn.style.height = '64px';
    playPauseBtn.style.fontSize = '24px';
    playPauseBtn.style.background = 'linear-gradient(135deg, #38bdf8, #6366f1)';
    playPauseBtn.style.border = 'none';
    playPauseBtn.style.boxShadow = '0 18px 36px rgba(56,189,248,0.45)';
    const nextBtn = createControlButton('⏭');
    const stopBtn = createControlButton('⏹');

    mainControls.appendChild(prevBtn);
    mainControls.appendChild(playPauseBtn);
    mainControls.appendChild(nextBtn);
    mainControls.appendChild(stopBtn);

    const timelineWrap = document.createElement('div');
    timelineWrap.style.display = 'flex';
    timelineWrap.style.flexDirection = 'column';
    timelineWrap.style.gap = '8px';

    const timeInfo = document.createElement('div');
    timeInfo.style.display = 'flex';
    timeInfo.style.alignItems = 'center';
    timeInfo.style.justifyContent = 'space-between';
    timeInfo.style.fontSize = '13px';
    timeInfo.style.color = '#cbd5f5';

    const timeCurrent = document.createElement('span');
    timeCurrent.textContent = '00:00';
    const timeRemaining = document.createElement('span');
    timeRemaining.textContent = '-00:00';
    timeInfo.appendChild(timeCurrent);
    timeInfo.appendChild(timeRemaining);

    const seekSlider = document.createElement('input');
    seekSlider.type = 'range';
    seekSlider.min = '0';
    seekSlider.max = '0';
    seekSlider.value = '0';
    seekSlider.step = '0.01';
    seekSlider.style.width = '100%';
    seekSlider.style.cursor = 'pointer';
    seekSlider.style.accentColor = '#38bdf8';

    timelineWrap.appendChild(timeInfo);
    timelineWrap.appendChild(seekSlider);

    const slidersRow = document.createElement('div');
    slidersRow.style.display = 'grid';
    slidersRow.style.gridTemplateColumns = '1fr 1fr';
    slidersRow.style.gap = '16px';

    const volumeWrap = document.createElement('label');
    volumeWrap.style.display = 'flex';
    volumeWrap.style.flexDirection = 'column';
    volumeWrap.style.gap = '6px';
    volumeWrap.style.fontSize = '13px';
    volumeWrap.style.color = '#cbd5f5';
    volumeWrap.textContent = '音量';

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = String(state.volume);
    volumeSlider.style.width = '100%';
    volumeSlider.style.accentColor = '#22d3ee';
    volumeWrap.appendChild(volumeSlider);

    const rateWrap = document.createElement('label');
    rateWrap.style.display = 'flex';
    rateWrap.style.flexDirection = 'column';
    rateWrap.style.gap = '6px';
    rateWrap.style.fontSize = '13px';
    rateWrap.style.color = '#cbd5f5';
    rateWrap.textContent = '再生速度';

    const rateSlider = document.createElement('input');
    rateSlider.type = 'range';
    rateSlider.min = '0.5';
    rateSlider.max = '2';
    rateSlider.step = '0.05';
    rateSlider.value = String(state.playbackRate);
    rateSlider.style.width = '100%';
    rateSlider.style.accentColor = '#a855f7';
    rateWrap.appendChild(rateSlider);

    slidersRow.appendChild(volumeWrap);
    slidersRow.appendChild(rateWrap);

    controlsPanel.appendChild(mainControls);
    controlsPanel.appendChild(timelineWrap);
    controlsPanel.appendChild(slidersRow);

    const vizPanel = document.createElement('div');
    vizPanel.style.display = 'flex';
    vizPanel.style.flexDirection = 'column';
    vizPanel.style.padding = '20px';
    vizPanel.style.gap = '16px';

    const oscWrap = document.createElement('div');
    oscWrap.style.flex = '1';
    oscWrap.style.background = 'rgba(15,23,42,0.6)';
    oscWrap.style.borderRadius = '16px';
    oscWrap.style.padding = '12px';
    oscWrap.style.display = 'flex';
    oscWrap.style.flexDirection = 'column';
    oscWrap.style.gap = '8px';

    const oscTitle = document.createElement('div');
    oscTitle.textContent = 'オシロスコープ';
    oscTitle.style.fontSize = '14px';
    oscTitle.style.fontWeight = '600';
    oscTitle.style.color = '#cbd5f5';

    const oscCanvas = document.createElement('canvas');
    oscCanvas.width = 420;
    oscCanvas.height = 140;
    oscCanvas.style.width = '100%';
    oscCanvas.style.height = '140px';
    oscCanvas.style.borderRadius = '12px';
    oscCanvas.style.background = 'rgba(2,6,23,0.8)';

    oscWrap.appendChild(oscTitle);
    oscWrap.appendChild(oscCanvas);

    const freqWrap = document.createElement('div');
    freqWrap.style.flex = '1';
    freqWrap.style.background = 'rgba(15,23,42,0.6)';
    freqWrap.style.borderRadius = '16px';
    freqWrap.style.padding = '12px';
    freqWrap.style.display = 'flex';
    freqWrap.style.flexDirection = 'column';
    freqWrap.style.gap = '8px';

    const freqTitle = document.createElement('div');
    freqTitle.textContent = '周波数スペクトラム';
    freqTitle.style.fontSize = '14px';
    freqTitle.style.fontWeight = '600';
    freqTitle.style.color = '#cbd5f5';

    const freqCanvas = document.createElement('canvas');
    freqCanvas.width = 420;
    freqCanvas.height = 140;
    freqCanvas.style.width = '100%';
    freqCanvas.style.height = '140px';
    freqCanvas.style.borderRadius = '12px';
    freqCanvas.style.background = 'rgba(2,6,23,0.8)';

    freqWrap.appendChild(freqTitle);
    freqWrap.appendChild(freqCanvas);

    const eqPanel = document.createElement('div');
    eqPanel.style.background = 'rgba(15,23,42,0.6)';
    eqPanel.style.borderRadius = '16px';
    eqPanel.style.padding = '16px';
    eqPanel.style.display = 'flex';
    eqPanel.style.flexDirection = 'column';
    eqPanel.style.gap = '12px';

    const eqHeader = document.createElement('div');
    eqHeader.style.display = 'flex';
    eqHeader.style.alignItems = 'center';
    eqHeader.style.justifyContent = 'space-between';

    const eqTitle = document.createElement('div');
    eqTitle.textContent = 'イコライザー';
    eqTitle.style.fontSize = '15px';
    eqTitle.style.fontWeight = '700';

    const eqPresetSelect = document.createElement('select');
    eqPresetSelect.style.padding = '6px 10px';
    eqPresetSelect.style.borderRadius = '10px';
    eqPresetSelect.style.border = '1px solid rgba(148,163,184,0.2)';
    eqPresetSelect.style.background = 'rgba(15,23,42,0.8)';
    eqPresetSelect.style.color = '#e2e8f0';
    Object.entries(EQ_PRESETS).forEach(([key, preset]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = preset.label;
      eqPresetSelect.appendChild(option);
    });
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'カスタム';
    eqPresetSelect.appendChild(customOption);
    eqPresetSelect.value = EQ_PRESETS[state.eqPreset] ? state.eqPreset : 'custom';

    eqHeader.appendChild(eqTitle);
    eqHeader.appendChild(eqPresetSelect);

    const eqSliders = document.createElement('div');
    eqSliders.style.display = 'flex';
    eqSliders.style.justifyContent = 'space-between';
    eqSliders.style.gap = '12px';

    const eqSliderControls = [];
    EQ_BANDS.forEach((band, index) => {
      const bandWrap = document.createElement('div');
      bandWrap.style.display = 'flex';
      bandWrap.style.flexDirection = 'column';
      bandWrap.style.alignItems = 'center';
      bandWrap.style.gap = '10px';
      bandWrap.style.flex = '1';

      const valueLabel = document.createElement('div');
      const initValue = state.eqGains[index] ?? 0;
      valueLabel.textContent = `${initValue.toFixed(1)}dB`;
      valueLabel.style.fontSize = '12px';
      valueLabel.style.color = '#cbd5f5';

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '-12';
      slider.max = '12';
      slider.step = '0.5';
      slider.value = String(initValue);
      slider.style.writingMode = 'bt-lr';
      slider.style.transform = 'rotate(-90deg)';
      slider.style.height = '140px';
      slider.style.width = '36px';
      slider.style.accentColor = '#38bdf8';

      const label = document.createElement('div');
      label.textContent = band.label;
      label.style.fontSize = '12px';
      label.style.color = '#cbd5f5';

      bandWrap.appendChild(valueLabel);
      bandWrap.appendChild(slider);
      bandWrap.appendChild(label);

      eqSliders.appendChild(bandWrap);
      eqSliderControls.push({ slider, valueLabel });
    });

    eqPanel.appendChild(eqHeader);
    eqPanel.appendChild(eqSliders);

    vizPanel.appendChild(oscWrap);
    vizPanel.appendChild(freqWrap);
    vizPanel.appendChild(eqPanel);

    const statusBar = document.createElement('div');
    statusBar.style.gridColumn = '1 / span 2';
    statusBar.style.display = 'flex';
    statusBar.style.alignItems = 'center';
    statusBar.style.justifyContent = 'space-between';
    statusBar.style.padding = '12px 20px';
    statusBar.style.background = 'rgba(15,23,42,0.85)';
    statusBar.style.fontSize = '13px';
    statusBar.style.color = '#cbd5f5';

    const statusPlaylist = document.createElement('div');
    const statusSession = document.createElement('div');
    statusSession.textContent = 'Session EXP: 0';

    statusBar.appendChild(statusPlaylist);
    statusBar.appendChild(statusSession);

    playlistPanel.appendChild(playlistHeader);
    playlistPanel.appendChild(searchInput);
    playlistPanel.appendChild(playlistList);

    frame.appendChild(header);
    frame.appendChild(playlistPanel);
    frame.appendChild(controlsPanel);
    frame.appendChild(vizPanel);
    frame.appendChild(statusBar);

    wrapper.appendChild(frame);
    wrapper.appendChild(settingsMenu);
    wrapper.appendChild(toast.element);
    root.appendChild(wrapper);
    function showToast(message){
      toast.show(message);
    }

    function schedulePersist(){
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        persistTimer = null;
        state.currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : state.currentTime;
        writePersistentState(state);
      }, PERSIST_DELAY);
    }

    function ensureAudioContext(){
      if (audioContext) return;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) throw new Error('Web Audio API is not available');
        audioContext = new Ctx();
        sourceNode = audioContext.createMediaElementSource(audio);
        gainNode = audioContext.createGain();
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;
        analyserNode.smoothingTimeConstant = 0.82;
        eqNodes.length = 0;
        let nodeChain = sourceNode;
        EQ_BANDS.forEach((band, index) => {
          const filter = audioContext.createBiquadFilter();
          filter.type = band.type;
          filter.frequency.value = band.freq;
          filter.Q.value = band.type === 'peaking' ? 1 : 0.707;
          filter.gain.value = clamp(state.eqGains[index] ?? 0, -12, 12);
          nodeChain.connect(filter);
          nodeChain = filter;
          eqNodes.push(filter);
        });
        nodeChain.connect(gainNode);
        gainNode.gain.value = 1;
        gainNode.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
      } catch (err) {
        showToast('オーディオコンテキストを初期化できませんでした');
      }
    }

    function updateEqGains(){
      eqNodes.forEach((node, index) => {
        try {
          node.gain.value = clamp(state.eqGains[index] ?? 0, -12, 12);
        } catch {}
      });
      schedulePersist();
    }

    function updateHeader(){
      const track = state.tracks.find(t => t.id === state.currentTrackId);
      if (track){
        trackTitle.textContent = track.name;
        const duration = track.duration ? formatDuration(track.duration) : '長さ計測中';
        trackSubtitle.textContent = `再生中 • ${duration}`;
      } else {
        trackTitle.textContent = 'ミュージックプレイヤー';
        trackSubtitle.textContent = 'ローカル音源を再生するユーティリティ';
      }
      playPauseBtn.textContent = state.isPlaying ? '⏸' : '▶';
    }

    function updateStatus(){
      const totalDuration = state.tracks.reduce((sum, track) => sum + (Number.isFinite(track.duration) ? track.duration : 0), 0);
      statusPlaylist.textContent = `曲数: ${state.tracks.length} / ${MAX_TRACKS} | 合計時間: ${formatDuration(totalDuration)}`;
      statusSession.textContent = `Session EXP: ${state.sessionXp}`;
      playlistCount.textContent = `${state.tracks.length} 曲`;
    }

    function createPlaylistItem(track){
      const item = document.createElement('div');
      item.style.display = 'grid';
      item.style.gridTemplateColumns = '1fr auto';
      item.style.gap = '8px';
      item.style.alignItems = 'center';
      item.style.padding = '12px';
      item.style.borderRadius = '14px';
      const isActive = track.id === state.currentTrackId;
      item.style.background = isActive ? 'rgba(56,189,248,0.16)' : 'rgba(15,23,42,0.65)';
      item.style.border = isActive ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(148,163,184,0.16)';
      item.style.cursor = 'pointer';

      const info = document.createElement('div');
      info.style.display = 'flex';
      info.style.flexDirection = 'column';
      info.style.gap = '4px';

      const name = document.createElement('div');
      name.textContent = track.name;
      name.style.fontSize = '14px';
      name.style.fontWeight = isActive ? '700' : '600';
      name.style.color = isActive ? '#f8fafc' : '#e2e8f0';
      name.style.wordBreak = 'break-word';

      const meta = document.createElement('div');
      meta.textContent = `${formatDuration(track.duration)} • ${formatFileSize(track.size)}`;
      meta.style.fontSize = '12px';
      meta.style.color = '#cbd5f5';

      info.appendChild(name);
      info.appendChild(meta);

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '6px';

      function createMiniButton(label){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.width = '28px';
        btn.style.height = '28px';
        btn.style.borderRadius = '10px';
        btn.style.border = '1px solid rgba(148,163,184,0.28)';
        btn.style.background = 'rgba(15,23,42,0.75)';
        btn.style.color = '#e2e8f0';
        btn.style.fontSize = '14px';
        btn.style.cursor = 'pointer';
        return btn;
      }

      const playBtn = createMiniButton('▶');
      const upBtn = createMiniButton('↑');
      const downBtn = createMiniButton('↓');
      const delBtn = createMiniButton('✕');

      actions.appendChild(playBtn);
      actions.appendChild(upBtn);
      actions.appendChild(downBtn);
      actions.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(actions);

      item.addEventListener('click', () => {
        if (track.id !== state.currentTrackId){
          setCurrentTrack(track.id, { autoPlay: true });
        }
      });

      playBtn.addEventListener('click', ev => {
        ev.stopPropagation();
        if (track.id === state.currentTrackId && state.isPlaying){
          pause();
        } else {
          setCurrentTrack(track.id, { autoPlay: true });
        }
      });

      upBtn.addEventListener('click', ev => {
        ev.stopPropagation();
        moveTrack(track.id, -1);
      });

      downBtn.addEventListener('click', ev => {
        ev.stopPropagation();
        moveTrack(track.id, 1);
      });

      delBtn.addEventListener('click', async ev => {
        ev.stopPropagation();
        await removeTrack(track.id);
      });

      name.addEventListener('dblclick', ev => {
        ev.stopPropagation();
        const newName = prompt('トラック名を入力', track.name);
        if (newName) renameTrack(track.id, newName);
      });

      return item;
    }

    function renderPlaylist(){
      playlistList.innerHTML = '';
      const keyword = searchInput.value.trim().toLowerCase();
      state.tracks.forEach(track => {
        if (keyword && !track.name.toLowerCase().includes(keyword)) return;
        playlistList.appendChild(createPlaylistItem(track));
      });
      updateStatus();
    }

    async function loadTrackUrl(id){
      if (objectUrls.has(id)) return objectUrls.get(id);
      try {
        const record = await trackStore.get(id);
        if (!record || !record.data) return null;
        const blob = new Blob([record.data], { type: record.type || 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        objectUrls.set(id, url);
        return url;
      } catch {
        showToast('音源の読み込みに失敗しました');
        return null;
      }
    }

    function revokeUrl(id){
      const url = objectUrls.get(id);
      if (url){
        URL.revokeObjectURL(url);
        objectUrls.delete(id);
      }
    }
    async function setCurrentTrack(id, options = {}){
      if (!id) return;
      const track = state.tracks.find(t => t.id === id);
      if (!track){
        showToast('トラックが見つかりません');
        return;
      }
      if (state.currentTrackId !== id){
        state.currentTrackId = id;
        state.currentTime = 0;
      }
      const url = await loadTrackUrl(id);
      if (!url) return;
      audio.src = url;
      const seekTime = Number.isFinite(options.seekTime) ? options.seekTime : state.currentTime;
      if (Number.isFinite(seekTime)){
        try { audio.currentTime = seekTime; } catch {}
      }
      audio.volume = clamp(state.volume, 0, 1);
      audio.playbackRate = clamp(state.playbackRate, 0.5, 2);
      schedulePersist();
      updateHeader();
      renderPlaylist();
      if (options.autoPlay){
        play().catch(()=>{});
      }
    }

    function getNextTrackId(direction){
      if (state.tracks.length === 0) return null;
      const currentIndex = state.tracks.findIndex(t => t.id === state.currentTrackId);
      if (state.shuffle){
        const available = state.tracks.filter(t => t.id !== state.currentTrackId);
        if (available.length === 0) return state.currentTrackId;
        const chosen = available[Math.floor(Math.random() * available.length)];
        return chosen ? chosen.id : state.currentTrackId;
      }
      if (currentIndex === -1){
        return state.tracks[0].id;
      }
      let nextIndex = currentIndex + direction;
      if (state.loopMode === 'all'){
        nextIndex = (nextIndex + state.tracks.length) % state.tracks.length;
        return state.tracks[nextIndex].id;
      }
      if (nextIndex < 0 || nextIndex >= state.tracks.length) return null;
      return state.tracks[nextIndex].id;
    }

    async function play(opts = {}){
      if (!state.currentTrackId){
        if (state.tracks.length === 0){
          showToast('再生するトラックがありません');
          return;
        }
        await setCurrentTrack(state.tracks[0].id, { autoPlay: false });
      }
      if (!state.currentTrackId) return;
      ensureAudioContext();
      if (opts.restart) {
        try { audio.currentTime = 0; } catch {}
      }
      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') await playPromise;
        if (!state.firstPlayAwarded){
          award(2, { type: 'play' });
          state.firstPlayAwarded = true;
        }
        state.isPlaying = true;
        schedulePersist();
        updateHeader();
        startVisualizer();
      } catch {
        state.isPlaying = false;
        updateHeader();
        showToast('再生を開始できませんでした');
      }
    }

    function pause(){
      audio.pause();
      state.isPlaying = false;
      schedulePersist();
      updateHeader();
    }

    function stopPlayback(){
      audio.pause();
      try { audio.currentTime = 0; } catch {}
      state.isPlaying = false;
      state.currentTime = 0;
      schedulePersist();
      updateHeader();
      updateProgressUI();
    }

    function nextTrack(direction){
      const nextId = getNextTrackId(direction);
      if (nextId){
        setCurrentTrack(nextId, { autoPlay: state.isPlaying });
      }
    }

    function moveTrack(id, delta){
      const idx = state.tracks.findIndex(t => t.id === id);
      if (idx === -1) return;
      const newIndex = idx + delta;
      if (newIndex < 0 || newIndex >= state.tracks.length) return;
      const [track] = state.tracks.splice(idx, 1);
      state.tracks.splice(newIndex, 0, track);
      renderPlaylist();
      schedulePersist();
    }

    function renameTrack(id, newName){
      const track = state.tracks.find(t => t.id === id);
      if (!track) return;
      track.name = newName.slice(0, 160);
      renderPlaylist();
      updateHeader();
      schedulePersist();
    }

    async function removeTrack(id){
      const idx = state.tracks.findIndex(t => t.id === id);
      if (idx === -1) return;
      const [removed] = state.tracks.splice(idx, 1);
      if (state.currentTrackId === id){
        pause();
        state.currentTrackId = null;
        state.currentTime = 0;
        audio.removeAttribute('src');
      }
      renderPlaylist();
      updateHeader();
      schedulePersist();
      revokeUrl(id);
      try {
        await trackStore.delete(id);
      } catch {}
      showToast(`${removed.name} を削除しました`);
    }

    async function handleFiles(files){
      if (!files || !files.length) return;
      const accepted = [];
      for (const file of files){
        if (!file.type.startsWith('audio/')) continue;
        if (file.size > MAX_FILE_SIZE){
          showToast(`${file.name} はサイズ上限を超えています`);
          continue;
        }
        if (state.tracks.length + accepted.length >= MAX_TRACKS){
          showToast('プレイリストの上限に達しました');
          break;
        }
        accepted.push(file);
      }
      if (!accepted.length) return;
      ensureAudioContext();
      for (const file of accepted){
        const id = createId();
        const data = await file.arrayBuffer();
        const record = { id, name: file.name, type: file.type, size: file.size, addedAt: Date.now(), data };
        try {
          await trackStore.put(record);
        } catch {
          showToast(`${file.name} を保存できませんでした`);
          continue;
        }
        const track = { id, name: file.name, duration: null, type: file.type, size: file.size, addedAt: record.addedAt };
        state.tracks.push(track);
        schedulePersist();
        award(3, { type: 'import' });
        loadTrackDuration(track);
      }
      renderPlaylist();
      if (!state.currentTrackId && state.tracks.length){
        await setCurrentTrack(state.tracks[0].id, { autoPlay: false });
      }
    }

    function loadTrackDuration(track){
      loadTrackUrl(track.id).then(url => {
        if (!url) return;
        const tempAudio = new Audio();
        tempAudio.src = url;
        tempAudio.addEventListener('loadedmetadata', () => {
          if (Number.isFinite(tempAudio.duration)){
            track.duration = tempAudio.duration;
            schedulePersist();
            renderPlaylist();
          }
        }, { once: true });
      });
    }

    function updateProgressUI(){
      const duration = Number.isFinite(audio.duration) ? audio.duration : (state.tracks.find(t => t.id === state.currentTrackId)?.duration ?? 0);
      const current = Number.isFinite(audio.currentTime) ? audio.currentTime : state.currentTime;
      if (Number.isFinite(duration) && duration > 0){
        seekSlider.max = duration.toString();
        seekSlider.disabled = false;
        timeRemaining.textContent = `-${formatDuration(Math.max(0, duration - current))}`;
      } else {
        seekSlider.max = '0';
        seekSlider.disabled = true;
        timeRemaining.textContent = '-00:00';
      }
      seekSlider.value = Number.isFinite(current) ? current.toString() : '0';
      timeCurrent.textContent = formatDuration(current);
    }

    function updateEqUI(){
      eqSliderControls.forEach((ctrl, index) => {
        const value = state.eqGains[index] ?? 0;
        ctrl.slider.value = String(value);
        ctrl.valueLabel.textContent = `${value.toFixed(1)}dB`;
      });
      eqPresetSelect.value = EQ_PRESETS[state.eqPreset] ? state.eqPreset : 'custom';
    }

    function award(amount, payload){
      const gained = Math.max(0, Math.floor(amount));
      if (!gained) return;
      try { awardXp(gained, payload || {}); } catch {}
      state.sessionXp += gained;
      updateStatus();
    }

    function awardTrackCompletion(){
      if (!state.currentTrackId) return;
      award(10, { type: 'complete', trackId: state.currentTrackId });
    }

    function applyEqPreset(presetKey){
      if (presetKey === 'custom') return;
      const preset = EQ_PRESETS[presetKey];
      if (!preset) return;
      state.eqGains = preset.gains.slice(0, EQ_BANDS.length).map(v => clamp(v, -12, 12));
      state.eqPreset = presetKey;
      updateEqGains();
      updateEqUI();
      const now = performance.now();
      if (now - state.eqPresetCooldownAt > EQ_PRESET_COOLDOWN){
        award(1, { type: 'preset', preset: presetKey });
        state.eqPresetCooldownAt = now;
      }
    }
    function startVisualizer(){
      if (!analyserNode || rafId) return;
      const oscCtx = oscCanvas.getContext('2d');
      const freqCtx = freqCanvas.getContext('2d');
      const timeData = new Uint8Array(analyserNode.fftSize);
      const freqData = new Uint8Array(analyserNode.frequencyBinCount);
      const peaks = new Float32Array(freqData.length);

      function draw(){
        analyserNode.getByteTimeDomainData(timeData);
        analyserNode.getByteFrequencyData(freqData);

        oscCtx.clearRect(0, 0, oscCanvas.width, oscCanvas.height);
        oscCtx.fillStyle = 'rgba(2,6,23,0.9)';
        oscCtx.fillRect(0, 0, oscCanvas.width, oscCanvas.height);
        const step = oscCanvas.width / timeData.length;
        oscCtx.beginPath();
        oscCtx.lineWidth = 2;
        oscCtx.strokeStyle = '#38bdf8';
        let x = 0;
        for (let i = 0; i < timeData.length; i++){
          const v = timeData[i] / 255;
          const y = v * oscCanvas.height;
          if (i === 0) oscCtx.moveTo(x, y);
          else oscCtx.lineTo(x, y);
          x += step;
        }
        oscCtx.stroke();

        freqCtx.clearRect(0, 0, freqCanvas.width, freqCanvas.height);
        freqCtx.fillStyle = 'rgba(2,6,23,0.9)';
        freqCtx.fillRect(0, 0, freqCanvas.width, freqCanvas.height);
        const barWidth = freqCanvas.width / freqData.length * 2.4;
        let barX = 0;
        for (let i = 0; i < freqData.length; i++){
          const value = freqData[i] / 255;
          const peak = Math.max(peaks[i] - 0.01, value);
          peaks[i] = peak;
          const h = value * freqCanvas.height;
          const peakH = peak * freqCanvas.height;
          freqCtx.fillStyle = 'rgba(99,102,241,0.5)';
          freqCtx.fillRect(barX, freqCanvas.height - h, barWidth, h);
          freqCtx.fillStyle = '#38bdf8';
          freqCtx.fillRect(barX, freqCanvas.height - peakH - 2, barWidth, 2);
          barX += barWidth + 1;
        }

        rafId = requestAnimationFrame(draw);
      }

      rafId = requestAnimationFrame(draw);
    }

    function stopVisualizer(){
      if (rafId){
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function handleTimeUpdate(){
      updateProgressUI();
      state.currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : state.currentTime;
      schedulePersist();
    }

    function handleRateChange(){
      state.playbackRate = clamp(parseFloat(rateSlider.value) || 1, 0.5, 2);
      audio.playbackRate = state.playbackRate;
      schedulePersist();
    }

    function handleVolumeChange(){
      state.volume = clamp(parseFloat(volumeSlider.value) || 0, 0, 1);
      audio.volume = state.volume;
      schedulePersist();
    }

    function handleSeek(){
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const value = parseFloat(seekSlider.value);
      if (!Number.isFinite(value)) return;
      try { audio.currentTime = clamp(value, 0, audio.duration); } catch {}
      state.currentTime = audio.currentTime;
      schedulePersist();
      updateProgressUI();
    }

    function toggleSettings(){
      settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'flex' : 'none';
    }

    function clearLibrary(){
      if (!confirm('すべての音源を削除しますか？')) return;
      pause();
      state.tracks.slice().forEach(track => revokeUrl(track.id));
      state.tracks = [];
      state.currentTrackId = null;
      state.currentTime = 0;
      audio.removeAttribute('src');
      renderPlaylist();
      updateHeader();
      schedulePersist();
      trackStore.init().then(db => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).clear();
      }).catch(()=>{});
      showToast('ライブラリをクリアしました');
    }

    function setupEventListeners(){
      fileInput.addEventListener('change', async () => {
        const files = Array.from(fileInput.files || []);
        await handleFiles(files);
        fileInput.value = '';
      });
      playPauseBtn.addEventListener('click', () => {
        if (state.isPlaying) pause();
        else play().catch(()=>{});
      });
      prevBtn.addEventListener('click', () => nextTrack(-1));
      nextBtn.addEventListener('click', () => nextTrack(1));
      stopBtn.addEventListener('click', () => stopPlayback());
      seekSlider.addEventListener('input', () => updateProgressUI());
      seekSlider.addEventListener('change', handleSeek);
      volumeSlider.addEventListener('input', handleVolumeChange);
      rateSlider.addEventListener('input', handleRateChange);
      searchInput.addEventListener('input', renderPlaylist);
      settingsBtn.addEventListener('click', toggleSettings);
      shuffleInput.addEventListener('change', () => {
        state.shuffle = shuffleInput.checked;
        schedulePersist();
      });
      loopSelect.addEventListener('change', () => {
        state.loopMode = loopSelect.value;
        schedulePersist();
      });
      clearBtn.addEventListener('click', clearLibrary);
      eqPresetSelect.addEventListener('change', () => {
        const value = eqPresetSelect.value;
        if (value === 'custom') return;
        applyEqPreset(value);
      });
      eqSliderControls.forEach((ctrl, index) => {
        ctrl.slider.addEventListener('input', () => {
          const val = clamp(parseFloat(ctrl.slider.value) || 0, -12, 12);
          ctrl.valueLabel.textContent = `${val.toFixed(1)}dB`;
          state.eqGains[index] = val;
          state.eqPreset = 'custom';
          updateEqGains();
          eqPresetSelect.value = 'custom';
        });
      });
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(audio.duration)){
          const track = state.tracks.find(t => t.id === state.currentTrackId);
          if (track){
            track.duration = audio.duration;
            schedulePersist();
          }
        }
        updateProgressUI();
      });
      audio.addEventListener('ended', () => {
        awardTrackCompletion();
        if (state.loopMode === 'one'){
          play({ restart: true });
        } else {
          const nextId = getNextTrackId(1);
          if (nextId){
            setCurrentTrack(nextId, { autoPlay: state.loopMode !== 'none' || state.shuffle || true });
          } else {
            pause();
          }
        }
      });
      audio.addEventListener('play', () => {
        state.isPlaying = true;
        updateHeader();
        ensureAudioContext();
        startVisualizer();
      });
      audio.addEventListener('pause', () => {
        state.isPlaying = false;
        updateHeader();
        if (!audioContext || audioContext.state !== 'running') stopVisualizer();
      });
      document.addEventListener('click', documentClickHandler);
    }

    function documentClickHandler(event){
      if (!settingsMenu.contains(event.target) && event.target !== settingsBtn){
        settingsMenu.style.display = 'none';
      }
    }

    function removeEventListeners(){
      document.removeEventListener('click', documentClickHandler);
    }

    function stopAll(){
      pause();
      stopVisualizer();
    }

    async function initialize(){
      try {
        const records = await trackStore.getAll();
        const recordMap = new Map(records.map(r => [r.id, r]));
        state.tracks = state.tracks.filter(track => {
          if (!recordMap.has(track.id)) return false;
          const record = recordMap.get(track.id);
          track.size = record.size;
          track.type = record.type;
          if (Number.isFinite(record.duration) && !Number.isFinite(track.duration)){
            track.duration = record.duration;
          }
          loadTrackDuration(track);
          return true;
        }).slice(0, MAX_TRACKS);
        if (!state.currentTrackId && state.tracks.length){
          state.currentTrackId = state.tracks[0].id;
        }
        if (state.currentTrackId){
          await setCurrentTrack(state.currentTrackId, { autoPlay: false, seekTime: state.currentTime });
        }
      } catch {
        showToast('ライブラリの読み込みに失敗しました');
      }
      renderPlaylist();
      updateHeader();
      updateStatus();
      updateEqUI();
      if (state.pendingResume){
        play().catch(()=>{});
      }
    }

    function start(){
      if (isRunning) return;
      isRunning = true;
      setupEventListeners();
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      stopAll();
      removeEventListeners();
    }

    function destroy(){
      stop();
      audio.pause();
      audio.removeAttribute('src');
      wrapper.remove();
      if (audioContext){
        try { audioContext.close(); } catch {}
      }
      trackStore.close();
      objectUrls.forEach(url => URL.revokeObjectURL(url));
      objectUrls.clear();
    }

    function getScore(){
      return state.sessionXp;
    }

    award(5, { type: 'open' });
    initialize();
    start();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'music_player',
    name: 'ミュージックプレイヤー',
    description: 'ローカル音源再生・視覚化・EQ搭載。再生や取り込みでEXP獲得',
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();
