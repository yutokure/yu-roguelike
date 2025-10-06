
(function(){
  const STORAGE_KEY = 'mini_video_history_v1';
  const MAX_HISTORY = 20;
  const HISTORY_RENDER_LIMIT = 5;
  const PROGRESS_INTERVAL_SECONDS = 60;
  const YT_API_SRC = 'https://www.youtube.com/iframe_api';

  let youtubeApiPromise = null;

  function loadHistory(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(entry => {
        if (!entry || typeof entry !== 'object') return null;
        const type = entry.type === 'youtube' ? 'youtube' : 'local';
        const id = typeof entry.id === 'string' ? entry.id : null;
        const title = typeof entry.title === 'string' ? entry.title : '未タイトル';
        const source = typeof entry.source === 'string' ? entry.source : '';
        const duration = Number.isFinite(entry.duration) ? entry.duration : null;
        const lastViewedAt = Number.isFinite(entry.lastViewedAt) ? entry.lastViewedAt : Date.now();
        const originalUrl = typeof entry.originalUrl === 'string' ? entry.originalUrl : null;
        if (!id || !source) return null;
        return { id, type, title, source, duration, lastViewedAt, originalUrl };
      }).filter(Boolean);
    } catch {
      return [];
    }
  }

  function persistHistory(items){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
    } catch {}
  }

  function formatDuration(seconds){
    if (!Number.isFinite(seconds) || seconds <= 0) return '-';
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0){
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function formatTimestamp(ts){
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return new Date(ts).toISOString();
    }
  }

  function parseYouTubeId(input){
    if (typeof input !== 'string') return null;
    const url = input.trim();
    if (!url) return null;
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.hostname === 'youtu.be'){
        return parsed.pathname.slice(1) || null;
      }
      if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com' || parsed.hostname.endsWith('.youtube.com')){
        if (parsed.searchParams.has('v')){
          return parsed.searchParams.get('v');
        }
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts[0] === 'embed' && parts[1]){
          return parts[1];
        }
      }
      return null;
    } catch {
      if (/^[a-zA-Z0-9_-]{6,}$/u.test(url)) return url;
      return null;
    }
  }

  function ensureYouTubeApi(){
    if (window.YT && typeof window.YT.Player === 'function'){
      return Promise.resolve(window.YT);
    }
    if (youtubeApiPromise) return youtubeApiPromise;
    youtubeApiPromise = new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null);
      }, 8000);
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function(){
        clearTimeout(timeout);
        if (typeof previousReady === 'function'){
          try { previousReady(); } catch (err) { console.error(err); }
        }
        resolve(window.YT || null);
      };
      const existing = document.querySelector(`script[src="${YT_API_SRC}"]`);
      if (!existing){
        const script = document.createElement('script');
        script.src = YT_API_SRC;
        script.async = true;
        script.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        document.head.appendChild(script);
      }
    });
    return youtubeApiPromise;
  }

  function awardXpSafe(awardXp, amount, payload){
    if (typeof awardXp !== 'function') return;
    try {
      awardXp(amount, payload);
    } catch (err){
      console.error('awardXp failed', err);
    }
  }

  function create(root, awardXp){
    if (!root) throw new Error('Video player requires a root element');

    const historyItems = loadHistory();

    const state = {
      currentSource: null,
      currentMeta: null,
      sessionXp: 0,
      progressMarker: 0,
      pendingLoad: null,
      html5Url: null,
      youtubePlayer: null,
      youtubeFallbackIframe: null,
      youtubeProgressTimer: null,
      localPlayAwarded: false,
      localEndedAwarded: false,
      youtubePlayAwarded: false,
      youtubeEndedAwarded: false,
      pendingLocalHistoryId: null,
      destroyed: false
    };

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'minmax(0, 2.2fr) minmax(0, 1fr)';
    wrapper.style.gap = '16px';
    wrapper.style.padding = '24px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.background = '#0f172a';
    wrapper.style.color = '#f8fafc';
    wrapper.tabIndex = 0;

    const mainColumn = document.createElement('div');
    mainColumn.style.display = 'flex';
    mainColumn.style.flexDirection = 'column';
    mainColumn.style.gap = '16px';

    const sideColumn = document.createElement('div');
    sideColumn.style.display = 'flex';
    sideColumn.style.flexDirection = 'column';
    sideColumn.style.gap = '16px';

    const headerCard = document.createElement('div');
    headerCard.style.display = 'flex';
    headerCard.style.flexDirection = 'column';
    headerCard.style.gap = '12px';
    headerCard.style.padding = '20px';
    headerCard.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
    headerCard.style.borderRadius = '18px';
    headerCard.style.boxShadow = '0 20px 40px rgba(15,23,42,0.3)';

    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.alignItems = 'center';
    titleRow.style.justifyContent = 'space-between';
    titleRow.style.flexWrap = 'wrap';
    titleRow.style.gap = '12px';

    const title = document.createElement('h2');
    title.textContent = '動画プレイヤー';
    title.style.margin = '0';
    title.style.fontSize = '28px';
    title.style.fontWeight = '700';

    const xpBadge = document.createElement('div');
    xpBadge.textContent = 'セッションEXP: 0';
    xpBadge.style.padding = '6px 12px';
    xpBadge.style.borderRadius = '999px';
    xpBadge.style.background = 'rgba(56,189,248,0.2)';
    xpBadge.style.color = '#38bdf8';
    xpBadge.style.fontWeight = '600';

    titleRow.appendChild(title);
    titleRow.appendChild(xpBadge);

    const infoGrid = document.createElement('div');
    infoGrid.style.display = 'grid';
    infoGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))';
    infoGrid.style.gap = '12px';

    function createInfoItem(label){
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '4px';
      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      labelEl.style.fontSize = '12px';
      labelEl.style.color = '#94a3b8';
      const valueEl = document.createElement('span');
      valueEl.textContent = '-';
      valueEl.style.fontSize = '16px';
      valueEl.style.fontWeight = '600';
      valueEl.style.color = '#e2e8f0';
      wrap.appendChild(labelEl);
      wrap.appendChild(valueEl);
      return { wrapper: wrap, valueEl };
    }

    const infoSource = createInfoItem('ソース');
    const infoTitle = createInfoItem('タイトル');
    const infoDuration = createInfoItem('長さ');
    const infoStatus = createInfoItem('ステータス');

    infoGrid.appendChild(infoSource.wrapper);
    infoGrid.appendChild(infoTitle.wrapper);
    infoGrid.appendChild(infoDuration.wrapper);
    infoGrid.appendChild(infoStatus.wrapper);

    headerCard.appendChild(titleRow);
    headerCard.appendChild(infoGrid);

    const controlsCard = document.createElement('div');
    controlsCard.style.background = 'rgba(15,23,42,0.8)';
    controlsCard.style.border = '1px solid rgba(148,163,184,0.2)';
    controlsCard.style.borderRadius = '18px';
    controlsCard.style.padding = '20px';
    controlsCard.style.display = 'flex';
    controlsCard.style.flexDirection = 'column';
    controlsCard.style.gap = '16px';

    const sourceTabs = document.createElement('div');
    sourceTabs.style.display = 'inline-flex';
    sourceTabs.style.padding = '4px';
    sourceTabs.style.borderRadius = '999px';
    sourceTabs.style.background = 'rgba(15,23,42,0.6)';
    sourceTabs.style.gap = '4px';
    sourceTabs.style.alignSelf = 'flex-start';

    function createTabButton(label){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.border = 'none';
      btn.style.padding = '8px 18px';
      btn.style.borderRadius = '999px';
      btn.style.background = 'transparent';
      btn.style.color = '#cbd5f5';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'background 0.2s, color 0.2s';
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(30,64,175,0.35)';
      });
      btn.addEventListener('mouseleave', () => {
        if (btn !== activeTab) btn.style.background = 'transparent';
      });
      return btn;
    }

    const localTab = createTabButton('ローカルファイル');
    const youtubeTab = createTabButton('YouTube URL');
    sourceTabs.appendChild(localTab);
    sourceTabs.appendChild(youtubeTab);

    const messageBanner = document.createElement('div');
    messageBanner.style.minHeight = '24px';
    messageBanner.style.fontSize = '14px';
    messageBanner.style.fontWeight = '500';

    function setMessage(type, text){
      if (!text){
        messageBanner.textContent = '';
        messageBanner.style.display = 'none';
        return;
      }
      messageBanner.textContent = text;
      messageBanner.style.display = 'block';
      if (type === 'error'){
        messageBanner.style.color = '#fca5a5';
      } else if (type === 'success'){
        messageBanner.style.color = '#6ee7b7';
      } else {
        messageBanner.style.color = '#bfdbfe';
      }
    }

    const localSection = document.createElement('div');
    localSection.style.display = 'flex';
    localSection.style.flexDirection = 'column';
    localSection.style.gap = '12px';

    const localHint = document.createElement('p');
    localHint.textContent = 'MP4 / WebM / Ogg など、ブラウザで再生できる動画を選択してください。';
    localHint.style.margin = '0';
    localHint.style.fontSize = '14px';
    localHint.style.color = '#cbd5f5';

    const localInputRow = document.createElement('div');
    localInputRow.style.display = 'flex';
    localInputRow.style.gap = '12px';
    localInputRow.style.alignItems = 'center';
    localInputRow.style.flexWrap = 'wrap';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.style.color = '#f8fafc';

    const selectedFileLabel = document.createElement('span');
    selectedFileLabel.textContent = 'ファイル未選択';
    selectedFileLabel.style.fontSize = '14px';
    selectedFileLabel.style.color = '#94a3b8';

    localInputRow.appendChild(fileInput);
    localInputRow.appendChild(selectedFileLabel);

    localSection.appendChild(localHint);
    localSection.appendChild(localInputRow);

    const youtubeSection = document.createElement('div');
    youtubeSection.style.display = 'none';
    youtubeSection.style.flexDirection = 'column';
    youtubeSection.style.gap = '12px';

    const youtubeInputRow = document.createElement('div');
    youtubeInputRow.style.display = 'flex';
    youtubeInputRow.style.gap = '12px';
    youtubeInputRow.style.flexWrap = 'wrap';

    const youtubeInput = document.createElement('input');
    youtubeInput.type = 'url';
    youtubeInput.placeholder = 'https://www.youtube.com/watch?v=...';
    youtubeInput.style.flex = '1';
    youtubeInput.style.minWidth = '200px';
    youtubeInput.style.padding = '10px 14px';
    youtubeInput.style.borderRadius = '12px';
    youtubeInput.style.border = '1px solid rgba(148,163,184,0.4)';
    youtubeInput.style.background = 'rgba(15,23,42,0.6)';
    youtubeInput.style.color = '#f8fafc';

    const youtubeLoadBtn = document.createElement('button');
    youtubeLoadBtn.type = 'button';
    youtubeLoadBtn.textContent = '読み込み';
    youtubeLoadBtn.style.padding = '10px 18px';
    youtubeLoadBtn.style.borderRadius = '12px';
    youtubeLoadBtn.style.border = 'none';
    youtubeLoadBtn.style.background = '#2563eb';
    youtubeLoadBtn.style.color = '#f8fafc';
    youtubeLoadBtn.style.fontWeight = '600';
    youtubeLoadBtn.style.cursor = 'pointer';

    youtubeInputRow.appendChild(youtubeInput);
    youtubeInputRow.appendChild(youtubeLoadBtn);

    const youtubeHint = document.createElement('p');
    youtubeHint.textContent = 'YouTube の URL または動画IDを入力してください。IFrame API が利用できない環境では簡易モードで再生します。';
    youtubeHint.style.margin = '0';
    youtubeHint.style.fontSize = '14px';
    youtubeHint.style.color = '#cbd5f5';

    youtubeSection.appendChild(youtubeInputRow);
    youtubeSection.appendChild(youtubeHint);

    controlsCard.appendChild(sourceTabs);
    controlsCard.appendChild(localSection);
    controlsCard.appendChild(youtubeSection);
    controlsCard.appendChild(messageBanner);

    const playerCard = document.createElement('div');
    playerCard.style.flex = '1';
    playerCard.style.background = 'rgba(15,23,42,0.8)';
    playerCard.style.borderRadius = '18px';
    playerCard.style.border = '1px solid rgba(148,163,184,0.2)';
    playerCard.style.padding = '20px';
    playerCard.style.display = 'flex';
    playerCard.style.flexDirection = 'column';
    playerCard.style.gap = '12px';

    const playerViewport = document.createElement('div');
    playerViewport.style.position = 'relative';
    playerViewport.style.width = '100%';
    playerViewport.style.flex = '1';
    playerViewport.style.background = '#020617';
    playerViewport.style.borderRadius = '16px';
    playerViewport.style.overflow = 'hidden';
    playerViewport.style.display = 'flex';
    playerViewport.style.alignItems = 'center';
    playerViewport.style.justifyContent = 'center';

    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.playsInline = true;
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.background = 'black';
    videoElement.style.display = 'none';

    const youtubeContainer = document.createElement('div');
    youtubeContainer.style.width = '100%';
    youtubeContainer.style.height = '100%';
    youtubeContainer.style.display = 'none';

    const placeholder = document.createElement('div');
    placeholder.textContent = '再生する動画を選択してください。';
    placeholder.style.color = '#64748b';
    placeholder.style.fontSize = '16px';

    playerViewport.appendChild(videoElement);
    playerViewport.appendChild(youtubeContainer);
    playerViewport.appendChild(placeholder);

    const statusText = document.createElement('div');
    statusText.style.fontSize = '14px';
    statusText.style.color = '#94a3b8';
    statusText.textContent = 'ソース未選択。';

    playerCard.appendChild(playerViewport);
    playerCard.appendChild(statusText);

    mainColumn.appendChild(headerCard);
    mainColumn.appendChild(controlsCard);
    mainColumn.appendChild(playerCard);

    const historyCard = document.createElement('div');
    historyCard.style.background = 'rgba(15,23,42,0.8)';
    historyCard.style.borderRadius = '18px';
    historyCard.style.border = '1px solid rgba(148,163,184,0.2)';
    historyCard.style.padding = '20px';
    historyCard.style.display = 'flex';
    historyCard.style.flexDirection = 'column';
    historyCard.style.gap = '12px';

    const historyHeaderRow = document.createElement('div');
    historyHeaderRow.style.display = 'flex';
    historyHeaderRow.style.alignItems = 'center';
    historyHeaderRow.style.justifyContent = 'space-between';

    const historyTitle = document.createElement('h3');
    historyTitle.textContent = '視聴履歴';
    historyTitle.style.margin = '0';
    historyTitle.style.fontSize = '18px';

    const historyClearBtn = document.createElement('button');
    historyClearBtn.type = 'button';
    historyClearBtn.textContent = '履歴をクリア';
    historyClearBtn.style.border = 'none';
    historyClearBtn.style.background = 'rgba(239,68,68,0.2)';
    historyClearBtn.style.color = '#fca5a5';
    historyClearBtn.style.padding = '6px 12px';
    historyClearBtn.style.borderRadius = '999px';
    historyClearBtn.style.cursor = 'pointer';

    historyHeaderRow.appendChild(historyTitle);
    historyHeaderRow.appendChild(historyClearBtn);

    const historyList = document.createElement('div');
    historyList.style.display = 'flex';
    historyList.style.flexDirection = 'column';
    historyList.style.gap = '8px';

    const historyEmpty = document.createElement('div');
    historyEmpty.textContent = '視聴履歴はまだありません。';
    historyEmpty.style.fontSize = '14px';
    historyEmpty.style.color = '#94a3b8';

    historyCard.appendChild(historyHeaderRow);
    historyCard.appendChild(historyList);
    historyCard.appendChild(historyEmpty);

    const shortcutCard = document.createElement('div');
    shortcutCard.style.background = 'rgba(15,23,42,0.8)';
    shortcutCard.style.borderRadius = '18px';
    shortcutCard.style.border = '1px solid rgba(148,163,184,0.2)';
    shortcutCard.style.padding = '20px';
    shortcutCard.style.display = 'flex';
    shortcutCard.style.flexDirection = 'column';
    shortcutCard.style.gap = '8px';

    const shortcutTitle = document.createElement('h3');
    shortcutTitle.textContent = 'ショートカット / ヒント';
    shortcutTitle.style.margin = '0';
    shortcutTitle.style.fontSize = '18px';

    const shortcutList = document.createElement('ul');
    shortcutList.style.margin = '0';
    shortcutList.style.paddingLeft = '20px';
    shortcutList.style.display = 'flex';
    shortcutList.style.flexDirection = 'column';
    shortcutList.style.gap = '4px';
    shortcutList.style.fontSize = '14px';
    shortcutList.style.color = '#cbd5f5';

    const hints = [
      'Space: 再生/一時停止 (ローカル動画 / API 利用時の YouTube)',
      '← / →: -5 / +5 秒シーク (ローカル動画 / API 利用時の YouTube)',
      '履歴のエントリをクリックして再度再生できます。ローカル動画は再選択ダイアログが開きます。',
      'YouTube 簡易モードでは YouTube 側のショートカットをご利用ください。'
    ];

    hints.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      shortcutList.appendChild(li);
    });

    shortcutCard.appendChild(shortcutTitle);
    shortcutCard.appendChild(shortcutList);

    sideColumn.appendChild(historyCard);
    sideColumn.appendChild(shortcutCard);

    wrapper.appendChild(mainColumn);
    wrapper.appendChild(sideColumn);
    root.appendChild(wrapper);

    let activeTab = localTab;
    function setActiveTab(tab){
      activeTab = tab;
      [localTab, youtubeTab].forEach(btn => {
        if (btn === tab){
          btn.style.background = 'rgba(37,99,235,0.6)';
          btn.style.color = '#e0f2fe';
        } else {
          btn.style.background = 'transparent';
          btn.style.color = '#cbd5f5';
        }
      });
      localSection.style.display = tab === localTab ? 'flex' : 'none';
      youtubeSection.style.display = tab === youtubeTab ? 'flex' : 'none';
      if (tab === youtubeTab){
        youtubeInput.focus();
      }
    }

    setActiveTab(localTab);

    function updateXpDisplay(){
      xpBadge.textContent = `セッションEXP: ${state.sessionXp.toFixed(1).replace(/\.0$/, '')}`;
    }

    function addXp(amount, payload){
      if (!Number.isFinite(amount) || amount <= 0) return;
      state.sessionXp += amount;
      updateXpDisplay();
      awardXpSafe(awardXp, amount, payload);
    }

    function updateInfoPanel(){
      if (!state.currentMeta){
        infoSource.valueEl.textContent = '-';
        infoTitle.valueEl.textContent = '-';
        infoDuration.valueEl.textContent = '-';
        infoStatus.valueEl.textContent = '-';
        return;
      }
      infoSource.valueEl.textContent = state.currentMeta.type === 'youtube' ? 'YouTube' : 'ローカル';
      infoTitle.valueEl.textContent = state.currentMeta.title || '-';
      infoDuration.valueEl.textContent = formatDuration(state.currentMeta.duration);
      infoStatus.valueEl.textContent = statusText.textContent || '-';
    }

    function updateHistoryList(){
      historyList.innerHTML = '';
      const toShow = historyItems.slice(0, HISTORY_RENDER_LIMIT);
      if (toShow.length === 0){
        historyEmpty.style.display = 'block';
        return;
      }
      historyEmpty.style.display = 'none';
      toShow.forEach(entry => {
        const item = document.createElement('button');
        item.type = 'button';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.alignItems = 'flex-start';
        item.style.gap = '4px';
        item.style.width = '100%';
        item.style.padding = '12px 14px';
        item.style.borderRadius = '14px';
        item.style.border = '1px solid rgba(148,163,184,0.2)';
        item.style.background = 'rgba(30,41,59,0.6)';
        item.style.color = '#f8fafc';
        item.style.cursor = 'pointer';
        item.style.textAlign = 'left';

        const titleEl = document.createElement('span');
        titleEl.textContent = entry.title;
        titleEl.style.fontSize = '15px';
        titleEl.style.fontWeight = '600';

        const meta = document.createElement('span');
        meta.style.fontSize = '12px';
        meta.style.color = '#94a3b8';
        const typeLabel = entry.type === 'youtube' ? 'YouTube' : 'ローカル';
        meta.textContent = `${typeLabel} / ${formatDuration(entry.duration)} / ${formatTimestamp(entry.lastViewedAt)}`;

        item.appendChild(titleEl);
        item.appendChild(meta);

        item.addEventListener('click', () => {
          if (entry.type === 'youtube'){
            loadYouTubeUrl(entry.originalUrl || `https://www.youtube.com/watch?v=${entry.source}`, { fromHistory: true });
          } else {
            state.pendingLocalHistoryId = entry.id;
            setMessage('info', '同じ動画ファイルを再選択してください。');
            fileInput.click();
          }
        });

        historyList.appendChild(item);
      });
    }

    updateHistoryList();

    function recordHistory(meta){
      if (!meta || !meta.id) return;
      const entry = {
        id: meta.id,
        type: meta.type,
        title: meta.title || '未タイトル',
        source: meta.source,
        duration: meta.duration || null,
        lastViewedAt: Date.now(),
        originalUrl: meta.originalUrl || null
      };
      const index = historyItems.findIndex(item => item.id === entry.id);
      if (index >= 0){
        historyItems.splice(index, 1);
      }
      historyItems.unshift(entry);
      if (historyItems.length > MAX_HISTORY){
        historyItems.length = MAX_HISTORY;
      }
      persistHistory(historyItems);
      updateHistoryList();
    }

    function clearHistory(){
      historyItems.length = 0;
      persistHistory(historyItems);
      updateHistoryList();
      setMessage('info', '履歴をクリアしました。');
    }

    historyClearBtn.addEventListener('click', () => {
      clearHistory();
    });

    function setStatus(text){
      statusText.textContent = text;
      updateInfoPanel();
    }

    function resetProgressAwards(){
      state.progressMarker = 0;
      state.localPlayAwarded = false;
      state.localEndedAwarded = false;
      state.youtubePlayAwarded = false;
      state.youtubeEndedAwarded = false;
    }

    function cleanupLocal(){
      if (videoElement.src){
        try { videoElement.pause(); } catch {}
        videoElement.removeAttribute('src');
        videoElement.load();
      }
      if (state.html5Url){
        URL.revokeObjectURL(state.html5Url);
        state.html5Url = null;
      }
    }

    function stopYouTubeProgressTimer(){
      if (state.youtubeProgressTimer){
        clearInterval(state.youtubeProgressTimer);
        state.youtubeProgressTimer = null;
      }
    }

    function cleanupYouTube(){
      stopYouTubeProgressTimer();
      if (state.youtubePlayer && typeof state.youtubePlayer.destroy === 'function'){
        try { state.youtubePlayer.destroy(); } catch {}
      }
      state.youtubePlayer = null;
      state.youtubeFallbackIframe = null;
      youtubeContainer.innerHTML = '';
    }

    function cleanupSource(){
      cleanupLocal();
      cleanupYouTube();
      state.currentSource = null;
      state.currentMeta = null;
      state.pendingLoad = null;
      resetProgressAwards();
      videoElement.style.display = 'none';
      youtubeContainer.style.display = 'none';
      placeholder.style.display = 'flex';
      setStatus('ソース未選択。');
      updateInfoPanel();
    }

    function grantLoadXp(){
      if (!state.pendingLoad || !state.currentMeta) return;
      const { type, fromHistory } = state.pendingLoad;
      state.pendingLoad = null;
      const base = type === 'local' ? 5 : 3;
      addXp(base, { type: 'video-load', sourceType: type, id: state.currentMeta.id });
      if (fromHistory){
        addXp(2, { type: 'video-history-replay', sourceType: type, id: state.currentMeta.id });
      }
      recordHistory(state.currentMeta);
    }

    function handleProgressXp(seconds, sourceType){
      if (!Number.isFinite(seconds)) return;
      if (seconds - state.progressMarker >= PROGRESS_INTERVAL_SECONDS){
        state.progressMarker = seconds;
        addXp(1, { type: 'video-progress', sourceType, seconds });
      }
    }

    videoElement.addEventListener('loadedmetadata', () => {
      if (state.currentSource !== 'local') return;
      const duration = Number.isFinite(videoElement.duration) ? videoElement.duration : null;
      if (state.currentMeta){
        state.currentMeta.duration = duration;
        updateInfoPanel();
        recordHistory(state.currentMeta);
      }
      if (state.pendingLoad && state.pendingLoad.type === 'local'){
        grantLoadXp();
        setMessage('success', 'ローカル動画を読み込みました。');
        setStatus('ローカル動画を読み込みました。再生を開始してください。');
      }
    });

    videoElement.addEventListener('error', () => {
      setMessage('error', '動画の読み込み中にエラーが発生しました。別のファイルを試してください。');
      setStatus('読み込みエラー');
    });

    videoElement.addEventListener('play', () => {
      if (state.currentSource !== 'local') return;
      if (!state.localPlayAwarded){
        state.localPlayAwarded = true;
        addXp(1, { type: 'video-play', sourceType: 'local', id: state.currentMeta?.id || null });
      }
      setStatus('再生中');
    });

    videoElement.addEventListener('pause', () => {
      if (state.currentSource !== 'local') return;
      setStatus('一時停止');
    });

    videoElement.addEventListener('ended', () => {
      if (state.currentSource !== 'local') return;
      if (!state.localEndedAwarded){
        state.localEndedAwarded = true;
        addXp(8, { type: 'video-complete', sourceType: 'local', id: state.currentMeta?.id || null });
      }
      setStatus('再生完了');
    });

    videoElement.addEventListener('timeupdate', () => {
      if (state.currentSource !== 'local') return;
      const seconds = Math.floor(videoElement.currentTime);
      handleProgressXp(seconds, 'local');
    });

    function setupYouTubePlayer(videoId){
      ensureYouTubeApi().then(YT => {
        if (
          state.destroyed ||
          state.currentSource !== 'youtube' ||
          state.currentMeta?.source !== videoId
        ){
          return;
        }
        youtubeContainer.innerHTML = '';
        if (!YT || typeof YT.Player !== 'function'){
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
          iframe.allowFullscreen = true;
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          youtubeContainer.appendChild(iframe);
          state.youtubeFallbackIframe = iframe;
          setStatus('YouTube (簡易モード) を読み込みました。');
          if (
            state.currentMeta?.source === videoId &&
            state.pendingLoad &&
            state.pendingLoad.type === 'youtube'
          ){
            grantLoadXp();
            setMessage('success', 'YouTube 動画を簡易モードで読み込みました。');
          }
          return;
        }

        const player = new YT.Player(youtubeContainer, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady(event){
              if (
                state.currentSource !== 'youtube' ||
                state.currentMeta?.source !== videoId
              ){
                try {
                  event?.target?.destroy?.();
                } catch (err){
                  console.warn('Failed to destroy stale YouTube player', err);
                }
                return;
              }
              state.youtubePlayer = event.target;
              const duration = Number.isFinite(event.target.getDuration?.()) ? event.target.getDuration() : null;
              if (state.currentMeta){
                state.currentMeta.duration = duration;
                updateInfoPanel();
                recordHistory(state.currentMeta);
              }
              if (state.pendingLoad && state.pendingLoad.type === 'youtube'){
                grantLoadXp();
                setMessage('success', 'YouTube 動画を読み込みました。');
                setStatus('YouTube 動画を読み込みました。再生を開始してください。');
              } else {
                setStatus('YouTube 動画準備完了。');
              }
            },
            onStateChange(event){
              if (state.currentSource !== 'youtube') return;
              if (state.currentMeta?.source !== videoId) return;
              const playerState = event.data;
              if (playerState === window.YT.PlayerState.PLAYING){
                setStatus('再生中');
                if (!state.youtubePlayAwarded){
                  state.youtubePlayAwarded = true;
                  addXp(1, { type: 'video-play', sourceType: 'youtube', id: state.currentMeta?.id || null });
                }
                stopYouTubeProgressTimer();
                state.youtubeProgressTimer = setInterval(() => {
                  if (!state.youtubePlayer) return;
                  const seconds = Math.floor(state.youtubePlayer.getCurrentTime?.() || 0);
                  handleProgressXp(seconds, 'youtube');
                }, 1000);
              } else if (playerState === window.YT.PlayerState.PAUSED){
                setStatus('一時停止');
                stopYouTubeProgressTimer();
              } else if (playerState === window.YT.PlayerState.ENDED){
                stopYouTubeProgressTimer();
                if (!state.youtubeEndedAwarded){
                  state.youtubeEndedAwarded = true;
                  addXp(8, { type: 'video-complete', sourceType: 'youtube', id: state.currentMeta?.id || null });
                }
                setStatus('再生完了');
              } else if (playerState === window.YT.PlayerState.BUFFERING){
                setStatus('バッファリング中…');
              }
            },
            onError(){
              setStatus('YouTube プレイヤーエラー');
              setMessage('error', 'YouTube 動画の読み込みに失敗しました。');
            }
          }
        });

        state.youtubePlayer = player;
      });
    }

    async function fetchYouTubeTitle(videoId){
      const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
      try {
        const res = await fetch(endpoint, { mode: 'cors' });
        if (!res.ok) throw new Error('oEmbed request failed');
        const data = await res.json();
        if (data && typeof data.title === 'string') return data.title;
      } catch (err){
        console.warn('Failed to fetch YouTube title', err);
      }
      return `YouTube動画 (${videoId})`;
    }

    async function loadYouTubeUrl(url, options = {}){
      const videoId = parseYouTubeId(url);
      if (!videoId){
        setMessage('error', '有効な YouTube URL または動画IDを入力してください。');
        return;
      }
      cleanupSource();
      setActiveTab(youtubeTab);
      youtubeContainer.style.display = 'block';
      videoElement.style.display = 'none';
      placeholder.style.display = 'none';
      resetProgressAwards();
      state.currentSource = 'youtube';
      state.currentMeta = {
        id: `youtube:${videoId}`,
        type: 'youtube',
        title: `YouTube動画 (${videoId})`,
        source: videoId,
        duration: null,
        originalUrl: url
      };
      state.pendingLoad = { type: 'youtube', fromHistory: !!options.fromHistory };
      setStatus('YouTube 動画を読み込み中…');
      updateInfoPanel();
      try {
        const title = await fetchYouTubeTitle(videoId);
        if (state.currentMeta && state.currentMeta.id === `youtube:${videoId}`){
          state.currentMeta.title = title;
          updateInfoPanel();
        }
      } catch {}
      setupYouTubePlayer(videoId);
    }

    function loadLocalFile(file){
      if (!(file instanceof File)){
        setMessage('error', '動画ファイルを選択してください。');
        return;
      }
      const metaId = `local:${file.name}:${file.size}`;
      const fromHistory = state.pendingLocalHistoryId === metaId;
      state.pendingLocalHistoryId = null;
      cleanupSource();
      setActiveTab(localTab);
      videoElement.style.display = 'block';
      youtubeContainer.style.display = 'none';
      placeholder.style.display = 'none';
      resetProgressAwards();
      const objectUrl = URL.createObjectURL(file);
      state.html5Url = objectUrl;
      state.currentSource = 'local';
      state.currentMeta = {
        id: metaId,
        type: 'local',
        title: file.name,
        source: file.name,
        duration: null
      };
      state.pendingLoad = { type: 'local', fromHistory };
      videoElement.src = objectUrl;
      videoElement.load();
      selectedFileLabel.textContent = file.name;
      setMessage('info', 'ローカル動画を読み込み中…');
      setStatus('ローカル動画を読み込み中…');
      updateInfoPanel();
    }

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (file){
        loadLocalFile(file);
      }
    });

    localTab.addEventListener('click', () => {
      setActiveTab(localTab);
      setMessage(null, '');
    });

    youtubeTab.addEventListener('click', () => {
      setActiveTab(youtubeTab);
      setMessage(null, '');
    });

    youtubeLoadBtn.addEventListener('click', () => {
      const url = youtubeInput.value;
      loadYouTubeUrl(url, { fromHistory: false });
    });

    youtubeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){
        e.preventDefault();
        loadYouTubeUrl(youtubeInput.value, { fromHistory: false });
      }
    });

    wrapper.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (state.currentSource === 'local'){
        if (e.code === 'Space'){
          e.preventDefault();
          if (videoElement.paused){
            videoElement.play().catch(() => {});
          } else {
            videoElement.pause();
          }
        } else if (e.code === 'ArrowRight'){
          e.preventDefault();
          videoElement.currentTime = Math.min(videoElement.duration || Infinity, videoElement.currentTime + 5);
        } else if (e.code === 'ArrowLeft'){
          e.preventDefault();
          videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
        }
      } else if (state.currentSource === 'youtube' && state.youtubePlayer){
        if (e.code === 'Space'){
          e.preventDefault();
          const stateCode = state.youtubePlayer.getPlayerState?.();
          if (stateCode === window.YT?.PlayerState?.PLAYING){
            state.youtubePlayer.pauseVideo?.();
          } else {
            state.youtubePlayer.playVideo?.();
          }
        } else if (e.code === 'ArrowRight'){
          e.preventDefault();
          const current = state.youtubePlayer.getCurrentTime?.() || 0;
          state.youtubePlayer.seekTo?.(current + 5, true);
        } else if (e.code === 'ArrowLeft'){
          e.preventDefault();
          const current = state.youtubePlayer.getCurrentTime?.() || 0;
          state.youtubePlayer.seekTo?.(Math.max(0, current - 5), true);
        }
      }
    });

    function stop(){
      cleanupSource();
      setMessage(null, '');
    }

    function destroy(){
      if (state.destroyed) return;
      state.destroyed = true;
      stop();
      if (wrapper.parentElement){
        wrapper.parentElement.removeChild(wrapper);
      }
    }

    function start(){
      setStatus('ソース未選択。');
      updateInfoPanel();
      updateXpDisplay();
    }

    start();

    return {
      start,
      stop,
      destroy,
      getScore(){
        return state.sessionXp;
      }
    };
  }

  window.registerMiniGame({
    id: 'video_player',
    name: '動画プレイヤー', nameKey: 'selection.miniexp.games.video_player.name',
    description: 'ローカル動画とYouTubeを再生し、視聴操作でEXPを獲得できるユーティリティ', descriptionKey: 'selection.miniexp.games.video_player.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();
