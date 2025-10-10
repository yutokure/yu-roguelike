(function(){
  const STORAGE_KEY = 'mini_notepad_state_v1';
  const EDIT_XP_COOLDOWN = 750;
  const DEFAULT_FILENAME_FALLBACK = 'タイトルなし.txt';
  const DEFAULT_TIMESTAMP_PATTERN = '{year}-{month}-{day} {hour}:{minute}:{second}';

  function loadPersistentState(defaultFileName){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return {
        fileName: typeof parsed.fileName === 'string' && parsed.fileName.trim() ? parsed.fileName : defaultFileName,
        text: typeof parsed.text === 'string' ? parsed.text : '',
        zoom: Number.isFinite(parsed.zoom) ? Math.min(200, Math.max(50, parsed.zoom)) : 100,
        wordWrap: !!parsed.wordWrap,
        showStatusBar: parsed.showStatusBar !== false,
        lineEnding: parsed.lineEnding === '\n' || parsed.lineEnding === '\r\n' ? parsed.lineEnding : '\r\n'
      };
    } catch {
      return null;
    }
  }

  function writePersistentState(state){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fileName: state.fileName,
        text: state.text,
        zoom: state.zoom,
        wordWrap: state.wordWrap,
        showStatusBar: state.showStatusBar,
        lineEnding: state.lineEnding
      }));
    } catch {}
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('MiniExp Notepad requires a container');

    const shortcuts = opts?.shortcuts;
    const i18n = typeof window !== 'undefined' ? window.I18n : null;

    const translate = (key, fallback, params) => {
      if (key && typeof i18n?.t === 'function') {
        try {
          const value = i18n.t(key, params);
          if (typeof value === 'string' && value !== key) return value;
          if (value !== undefined && value !== null && value !== key) return value;
        } catch {}
      }
      if (typeof fallback === 'function') {
        try { return fallback(); } catch { return ''; }
      }
      if (fallback !== undefined) return fallback;
      if (typeof key === 'string') return key;
      return '';
    };

    const formatNumber = (value, options) => {
      if (typeof i18n?.formatNumber === 'function') {
        try {
          return i18n.formatNumber(value, options);
        } catch {}
      }
      if (options?.minimumIntegerDigits) {
        return String(Math.trunc(value)).padStart(options.minimumIntegerDigits, '0');
      }
      return String(value);
    };

    const getDefaultFileName = () => translate('games.notepad.defaultFileName', DEFAULT_FILENAME_FALLBACK);
    const getTimestampPattern = () => translate('games.notepad.timestamp.pattern', DEFAULT_TIMESTAMP_PATTERN);
    const getPrintLabel = () => translate('games.notepad.print.label', '印刷');
    const getNotepadTitle = () => translate('games.notepad.print.windowTitleFallback', () => translate('selection.miniexp.games.notepad.name', 'メモ帳'));

    let currentDefaultFileName = getDefaultFileName();

    const persisted = loadPersistentState(currentDefaultFileName);
    const state = {
      fileName: persisted?.fileName || currentDefaultFileName,
      text: persisted?.text || '',
      savedText: persisted?.text || '',
      zoom: persisted?.zoom || 100,
      wordWrap: persisted?.wordWrap ?? true,
      showStatusBar: persisted?.showStatusBar ?? true,
      lineEnding: persisted?.lineEnding || '\r\n',
      encoding: 'UTF-8',
      lastEditAwardAt: 0,
      sessionXp: 0
    };

    const listeners = [];
    let persistTimer = null;
    let currentMenu = null;
    let settingsPanel = null;
    let settingsControls = null;
    let isRunning = false;
    let shortcutsDisabled = false;
    let localeUnsubscribe = null;

    function formatTimestamp(date, pattern){
      const safePattern = typeof pattern === 'string' && pattern ? pattern : DEFAULT_TIMESTAMP_PATTERN;
      const d = date instanceof Date ? date : new Date(date);
      if (!(d instanceof Date) || Number.isNaN(d.getTime())) return safePattern;
      const tokens = {
        year: String(d.getFullYear()),
        month: String(d.getMonth() + 1).padStart(2, '0'),
        day: String(d.getDate()).padStart(2, '0'),
        hour: String(d.getHours()).padStart(2, '0'),
        minute: String(d.getMinutes()).padStart(2, '0'),
        second: String(d.getSeconds()).padStart(2, '0')
      };
      return safePattern.replace(/\{([^{}]+)\}/g, (match, token) => {
        const key = token.trim().toLowerCase();
        if (Object.prototype.hasOwnProperty.call(tokens, key)) {
          return tokens[key];
        }
        return match;
      });
    }

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'linear-gradient(135deg, rgba(148,163,184,0.08), rgba(15,23,42,0.7))';

    const frame = document.createElement('div');
    frame.style.width = 'min(960px, 96%)';
    frame.style.height = 'min(320px, 96%)';
    frame.style.display = 'flex';
    frame.style.flexDirection = 'column';
    frame.style.background = '#f4f7fb';
    frame.style.borderRadius = '14px';
    frame.style.boxShadow = '0 18px 54px rgba(15,23,42,0.35)';
    frame.style.border = '1px solid rgba(148,163,184,0.3)';
    frame.style.overflow = 'hidden';
    frame.style.fontFamily = '"Segoe UI", "Hiragino Sans", sans-serif';
    frame.style.position = 'relative';

    const titleBar = document.createElement('div');
    titleBar.style.display = 'flex';
    titleBar.style.alignItems = 'center';
    titleBar.style.background = '#ffffff';
    titleBar.style.padding = '0 12px';
    titleBar.style.height = '44px';
    titleBar.style.borderBottom = '1px solid rgba(148,163,184,0.25)';

    const appIcon = document.createElement('div');
    appIcon.style.width = '26px';
    appIcon.style.height = '26px';
    appIcon.style.marginRight = '10px';
    appIcon.style.borderRadius = '6px';
    appIcon.style.background = 'linear-gradient(120deg, #4f9cf7, #347edb)';
    appIcon.style.boxShadow = '0 4px 10px rgba(79,156,247,0.4)';

    const tabStrip = document.createElement('div');
    tabStrip.style.flex = '1';
    tabStrip.style.display = 'flex';
    tabStrip.style.alignItems = 'center';
    tabStrip.style.gap = '8px';

    const activeTab = document.createElement('div');
    activeTab.style.display = 'flex';
    activeTab.style.alignItems = 'center';
    activeTab.style.padding = '6px 12px';
    activeTab.style.borderRadius = '8px';
    activeTab.style.background = '#e8f1ff';
    activeTab.style.color = '#1d4ed8';
    activeTab.style.fontWeight = '600';
    const activeTabLabel = document.createElement('span');
    activeTab.appendChild(activeTabLabel);

    const newTabBtn = document.createElement('button');
    newTabBtn.type = 'button';
    newTabBtn.textContent = '+';
    newTabBtn.style.width = '24px';
    newTabBtn.style.height = '24px';
    newTabBtn.style.borderRadius = '8px';
    newTabBtn.style.border = '1px dashed rgba(148,163,184,0.4)';
    newTabBtn.style.background = 'transparent';
    newTabBtn.style.cursor = 'pointer';
    newTabBtn.style.color = '#64748b';

    tabStrip.appendChild(activeTab);
    tabStrip.appendChild(newTabBtn);

    const windowControls = document.createElement('div');
    windowControls.style.display = 'flex';
    windowControls.style.gap = '4px';
    windowControls.style.marginLeft = '12px';

    ['—', '□', '×'].forEach(symbol => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = symbol;
      btn.style.width = '32px';
      btn.style.height = '24px';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.background = 'transparent';
      btn.style.cursor = 'pointer';
      btn.style.color = '#334155';
      btn.addEventListener('pointerenter', () => { btn.style.background = symbol === '×' ? '#fee2e2' : '#e2e8f0'; });
      btn.addEventListener('pointerleave', () => { btn.style.background = 'transparent'; });
      if (symbol === '×') {
        btn.addEventListener('click', () => {
          const message = translate('games.notepad.confirm.discardChanges', '変更を破棄して閉じますか？');
          if (!state.savedText || state.savedText === state.text || confirm(message)) quit();
        });
      }
      windowControls.appendChild(btn);
    });

    titleBar.appendChild(appIcon);
    titleBar.appendChild(tabStrip);
    titleBar.appendChild(windowControls);

    const menuBar = document.createElement('div');
    menuBar.style.display = 'flex';
    menuBar.style.alignItems = 'center';
    menuBar.style.gap = '16px';
    menuBar.style.padding = '0 14px';
    menuBar.style.height = '36px';
    menuBar.style.background = '#f9fafb';
    menuBar.style.borderBottom = '1px solid rgba(148,163,184,0.2)';
    menuBar.style.color = '#1f2937';
    menuBar.style.fontSize = '15px';

    const commandBar = document.createElement('div');
    commandBar.style.display = 'flex';
    commandBar.style.alignItems = 'center';
    commandBar.style.flexWrap = 'wrap';
    commandBar.style.gap = '8px';
    commandBar.style.padding = '10px 18px';
    commandBar.style.background = '#ffffff';
    commandBar.style.borderBottom = '1px solid rgba(148,163,184,0.18)';
    const commandButtons = {};

    const editorWrap = document.createElement('div');
    editorWrap.style.flex = '1';
    editorWrap.style.display = 'flex';
    editorWrap.style.flexDirection = 'column';
    editorWrap.style.background = '#ffffff';
    editorWrap.style.minHeight = 'clamp(160px, 35vh, 320px)';

    const textarea = document.createElement('textarea');
    textarea.value = state.text;
    textarea.style.flex = '1';
    textarea.style.resize = 'none';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.padding = '24px 28px';
    textarea.style.fontFamily = '"Segoe UI", "Yu Gothic", sans-serif';
    textarea.style.lineHeight = '1.6';
    textarea.style.color = '#111827';
    textarea.style.background = '#ffffff';
    textarea.style.whiteSpace = state.wordWrap ? 'pre-wrap' : 'pre';
    textarea.style.overflowWrap = 'break-word';
    textarea.style.fontSize = computeFontSize(state.zoom);
    textarea.wrap = state.wordWrap ? 'soft' : 'off';
    textarea.style.minHeight = 'clamp(160px, 35vh, 320px)';

    const statusBar = document.createElement('div');
    statusBar.style.display = state.showStatusBar ? 'flex' : 'none';
    statusBar.style.alignItems = 'center';
    statusBar.style.justifyContent = 'space-between';
    statusBar.style.padding = '6px 18px';
    statusBar.style.fontSize = '13px';
    statusBar.style.background = '#f1f5f9';
    statusBar.style.borderTop = '1px solid rgba(148,163,184,0.25)';
    statusBar.style.color = '#1f2937';

    const statusLeft = document.createElement('div');
    const statusRight = document.createElement('div');
    statusLeft.style.display = 'flex';
    statusLeft.style.gap = '12px';
    statusRight.style.display = 'flex';
    statusRight.style.gap = '12px';
    statusBar.appendChild(statusLeft);
    statusBar.appendChild(statusRight);

    const hiddenFileInput = document.createElement('input');
    hiddenFileInput.type = 'file';
    hiddenFileInput.accept = '.txt,.md,.json,.log,.csv,text/plain';
    hiddenFileInput.style.display = 'none';

    const hiddenDownloader = document.createElement('a');
    hiddenDownloader.style.display = 'none';

    editorWrap.appendChild(textarea);
    editorWrap.appendChild(statusBar);

    frame.appendChild(titleBar);
    frame.appendChild(menuBar);
    frame.appendChild(commandBar);
    frame.appendChild(editorWrap);
    frame.appendChild(hiddenFileInput);
    frame.appendChild(hiddenDownloader);
    wrapper.appendChild(frame);
    root.appendChild(wrapper);

    populateMenuBar();
    populateCommandBar();
    updateTitle();
    updateStatusBar();
    persistSoon();

    if (typeof i18n?.onLocaleChanged === 'function') {
      localeUnsubscribe = i18n.onLocaleChanged(() => {
        try {
          handleLocaleChange();
        } catch (error) {
          console.error('[Notepad] Failed to apply locale change:', error);
        }
      });
    }

    award('open', 5);

    newTabBtn.addEventListener('click', () => newDocument());

    function populateMenuBar(){
      menuBar.innerHTML = '';
      const menuDefs = [
        { key: 'file', labelKey: 'games.notepad.menu.file', fallback: 'ファイル' },
        { key: 'edit', labelKey: 'games.notepad.menu.edit', fallback: '編集' },
        { key: 'view', labelKey: 'games.notepad.menu.view.label', fallback: '表示' }
      ];
      menuDefs.forEach(def => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = translate(def.labelKey, def.fallback);
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '15px';
        btn.style.color = '#111827';
        btn.style.padding = '4px 0';
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          toggleMenu(def.key, btn);
        });
        menuBar.appendChild(btn);
      });
    }

    function populateCommandBar(){
      commandBar.innerHTML = '';

      const createGroup = (buttonDefs) => {
        const box = document.createElement('div');
        box.style.display = 'flex';
        box.style.gap = '6px';
        buttonDefs.forEach(def => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = def.icon;
          const label = translate(def.labelKey, def.label);
          btn.title = label;
          btn.setAttribute('aria-label', label);
          btn.style.minWidth = def.minWidth || '44px';
          btn.style.height = '34px';
          btn.style.borderRadius = '8px';
          btn.style.border = '1px solid rgba(148,163,184,0.4)';
          btn.style.background = '#ffffff';
          btn.style.color = '#1f2937';
          btn.style.cursor = 'pointer';
          btn.style.fontWeight = '600';
          btn.dataset.command = def.key;
          btn.addEventListener('click', (ev) => def.handler(ev, btn));
          commandButtons[def.key] = btn;
          box.appendChild(btn);
        });
        commandBar.appendChild(box);
      };

      createGroup([
        { key: 'heading', icon: 'H1', labelKey: 'games.notepad.commands.heading', label: '見出しを切り替え', handler: () => toggleHeadingLevel() },
        { key: 'bullet', icon: '•', labelKey: 'games.notepad.commands.bullet', label: '箇条書きを切り替え', handler: () => toggleBulletList() }
      ]);

      createGroup([
        { key: 'bold', icon: 'B', labelKey: 'games.notepad.commands.bold', label: '太字 (Markdown)', handler: () => toggleWrap('**', '**') },
        { key: 'italic', icon: 'I', labelKey: 'games.notepad.commands.italic', label: '斜体 (Markdown)', handler: () => toggleWrap('*', '*') },
        { key: 'underline', icon: 'U', labelKey: 'games.notepad.commands.underline', label: '下線タグ', handler: () => toggleWrap('<u>', '</u>') }
      ]);

      createGroup([
        { key: 'wordWrap', icon: '↔', labelKey: 'games.notepad.commands.wordWrap', label: '折り返しを切り替え', handler: () => toggleWordWrap() },
        { key: 'zoomReset', icon: `${state.zoom}%`, labelKey: 'games.notepad.commands.zoomReset', label: 'ズームを既定に戻す', handler: () => setZoom(100), minWidth: '64px' }
      ]);

      createGroup([
        { key: 'settings', icon: '⚙', labelKey: 'games.notepad.commands.settings', label: '設定', handler: (ev, btn) => toggleSettingsPanel(btn) }
      ]);

      refreshCommandBarStates();
    }

    function styleCommandButton(btn, { active = false, disabled = false } = {}){
      if (!btn) return;
      btn.disabled = !!disabled;
      btn.style.background = active ? '#2563eb' : '#ffffff';
      btn.style.color = active ? '#f8fafc' : '#1f2937';
      btn.style.cursor = disabled ? 'default' : 'pointer';
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    function refreshCommandBarStates(){
      styleCommandButton(commandButtons.wordWrap, { active: state.wordWrap });
      if (commandButtons.zoomReset) {
        commandButtons.zoomReset.textContent = `${formatNumber(state.zoom)}%`;
        styleCommandButton(commandButtons.zoomReset, { active: state.zoom !== 100 });
      }
      styleCommandButton(commandButtons.bold, { active: isSelectionWrapped('**', '**') });
      styleCommandButton(commandButtons.italic, { active: isSelectionWrapped('*', '*') });
      styleCommandButton(commandButtons.underline, { active: isSelectionWrapped('<u>', '</u>') });
      styleCommandButton(commandButtons.settings, { active: !!settingsPanel });
    }

    function isSelectionWrapped(prefix, suffix){
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const value = textarea.value || '';
      if (start === end) {
        if (start < prefix.length || end + suffix.length > value.length) return false;
        return value.slice(start - prefix.length, start) === prefix && value.slice(end, end + suffix.length) === suffix;
      }
      if (start < prefix.length || end + suffix.length > value.length) return false;
      return value.slice(start - prefix.length, start) === prefix && value.slice(end, end + suffix.length) === suffix;
    }

    function toggleHeadingLevel(){
      toggleLinePrefix('# ');
    }

    function toggleBulletList(){
      toggleLinePrefix('- ');
    }

    function toggleLinePrefix(prefix){
      const value = textarea.value;
      if (value.length === 0 && textarea.selectionStart === 0 && textarea.selectionEnd === 0) {
        textarea.value = prefix;
        textarea.setSelectionRange(prefix.length, prefix.length);
        textarea.focus();
        handleTextChanged();
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
      const blockEndIndex = value.indexOf('\n', end);
      const lineEnd = blockEndIndex === -1 ? value.length : blockEndIndex;
      const selectedBlock = value.slice(lineStart, lineEnd);
      const lines = selectedBlock.split('\n');
      const allPrefixed = lines.every(line => !line.trim() || line.startsWith(prefix));
      const updatedLines = lines.map(line => {
        if (!line.trim()) return line;
        if (allPrefixed) {
          return line.startsWith(prefix) ? line.slice(prefix.length) : line;
        }
        return line.startsWith(prefix) ? line : prefix + line;
      });
      const replacement = updatedLines.join('\n');
      if (replacement === selectedBlock) {
        textarea.setSelectionRange(lineStart, lineStart + replacement.length);
        textarea.focus();
        return;
      }
      const newValue = value.slice(0, lineStart) + replacement + value.slice(lineEnd);
      textarea.value = newValue;
      const newSelectionStart = lineStart;
      const newSelectionEnd = lineStart + replacement.length;
      textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      textarea.focus();
      handleTextChanged();
    }

    function toggleWrap(prefix, suffix){
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const hasSelection = start !== end;
      const canUnwrap = start >= prefix.length && end + suffix.length <= value.length &&
        value.slice(start - prefix.length, start) === prefix &&
        value.slice(end, end + suffix.length) === suffix;

      if (canUnwrap) {
        const newValue = value.slice(0, start - prefix.length) + value.slice(start, end) + value.slice(end + suffix.length);
        const newStart = start - prefix.length;
        const newEnd = end - prefix.length;
        textarea.value = newValue;
        textarea.setSelectionRange(newStart, newEnd);
      } else {
        const selectedText = value.slice(start, end);
        const newValue = value.slice(0, start) + prefix + selectedText + suffix + value.slice(end);
        textarea.value = newValue;
        const caret = start + prefix.length;
        if (hasSelection) {
          textarea.setSelectionRange(caret, caret + selectedText.length);
        } else {
          textarea.setSelectionRange(caret, caret);
        }
      }
      textarea.focus();
      handleTextChanged();
    }

    function toggleSettingsPanel(anchor){
      if (settingsPanel) {
        closeSettingsPanel();
        return;
      }
      closeMenu();

      const panel = document.createElement('div');
      panel.style.position = 'absolute';
      const anchorRect = anchor.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      panel.style.top = `${anchorRect.bottom - frameRect.top + 6}px`;
      panel.style.left = `${anchorRect.left - frameRect.left}px`;
      panel.style.background = '#ffffff';
      panel.style.border = '1px solid rgba(148,163,184,0.25)';
      panel.style.borderRadius = '10px';
      panel.style.boxShadow = '0 16px 36px rgba(15,23,42,0.25)';
      panel.style.padding = '12px 16px';
      panel.style.width = '240px';
      panel.style.zIndex = '25';
      panel.style.display = 'flex';
      panel.style.flexDirection = 'column';
      panel.style.gap = '12px';
      panel.addEventListener('click', ev => ev.stopPropagation());

      const title = document.createElement('div');
      title.textContent = translate('games.notepad.settings.title', '設定');
      title.style.fontWeight = '600';
      title.style.fontSize = '15px';
      panel.appendChild(title);

      const { row: wrapRow, input: wrapCheckbox } = createSettingsToggle(translate('games.notepad.settings.wordWrap', '折り返し'), state.wordWrap, (checked) => setWordWrap(checked));
      const { row: statusRow, input: statusCheckbox } = createSettingsToggle(translate('games.notepad.settings.statusBar', 'ステータスバー'), state.showStatusBar, (checked) => setStatusBarVisible(checked));

      const zoomBlock = document.createElement('div');
      zoomBlock.style.display = 'flex';
      zoomBlock.style.flexDirection = 'column';
      zoomBlock.style.gap = '6px';

      const zoomHeader = document.createElement('div');
      zoomHeader.style.display = 'flex';
      zoomHeader.style.justifyContent = 'space-between';
      zoomHeader.style.alignItems = 'center';
      const zoomLabel = document.createElement('span');
      zoomLabel.textContent = translate('games.notepad.settings.zoom', 'ズーム');
      zoomLabel.style.fontSize = '14px';
      const zoomValue = document.createElement('span');
      zoomValue.style.fontSize = '13px';
      zoomValue.style.color = '#475569';
      zoomHeader.appendChild(zoomLabel);
      zoomHeader.appendChild(zoomValue);

      const zoomSlider = document.createElement('input');
      zoomSlider.type = 'range';
      zoomSlider.min = '50';
      zoomSlider.max = '200';
      zoomSlider.value = String(state.zoom);
      zoomSlider.step = '10';
      zoomSlider.addEventListener('input', () => setZoom(Number(zoomSlider.value)));

      const zoomButtons = document.createElement('div');
      zoomButtons.style.display = 'flex';
      zoomButtons.style.gap = '8px';
      const zoomOutBtn = document.createElement('button');
      zoomOutBtn.type = 'button';
      zoomOutBtn.textContent = '−';
      zoomOutBtn.style.flex = '1';
      zoomOutBtn.style.height = '32px';
      zoomOutBtn.style.borderRadius = '6px';
      zoomOutBtn.style.border = '1px solid rgba(148,163,184,0.4)';
      zoomOutBtn.addEventListener('click', () => adjustZoom(-10));
      const zoomInBtn = document.createElement('button');
      zoomInBtn.type = 'button';
      zoomInBtn.textContent = '+';
      zoomInBtn.style.flex = '1';
      zoomInBtn.style.height = '32px';
      zoomInBtn.style.borderRadius = '6px';
      zoomInBtn.style.border = '1px solid rgba(148,163,184,0.4)';
      zoomInBtn.addEventListener('click', () => adjustZoom(10));
      const zoomResetBtn = document.createElement('button');
      zoomResetBtn.type = 'button';
      zoomResetBtn.textContent = translate('games.notepad.settings.zoomReset', 'リセット');
      zoomResetBtn.style.flex = '2';
      zoomResetBtn.style.height = '32px';
      zoomResetBtn.style.borderRadius = '6px';
      zoomResetBtn.style.border = '1px solid rgba(148,163,184,0.4)';
      zoomResetBtn.addEventListener('click', () => setZoom(100));
      zoomButtons.appendChild(zoomOutBtn);
      zoomButtons.appendChild(zoomResetBtn);
      zoomButtons.appendChild(zoomInBtn);

      zoomBlock.appendChild(zoomHeader);
      zoomBlock.appendChild(zoomSlider);
      zoomBlock.appendChild(zoomButtons);

      const timestampBtn = document.createElement('button');
      timestampBtn.type = 'button';
      timestampBtn.textContent = translate('games.notepad.settings.insertTimestamp', '日時を挿入');
      timestampBtn.style.height = '34px';
      timestampBtn.style.borderRadius = '8px';
      timestampBtn.style.border = '1px solid rgba(148,163,184,0.4)';
      timestampBtn.style.background = '#f8fafc';
      timestampBtn.addEventListener('click', () => {
        insertTimestamp();
        renderSettingsPanelState();
      });

      panel.appendChild(wrapRow);
      panel.appendChild(statusRow);
      panel.appendChild(zoomBlock);
      panel.appendChild(timestampBtn);

      frame.appendChild(panel);
      settingsPanel = panel;
      settingsControls = {
        wrapCheckbox,
        statusCheckbox,
        zoomSlider,
        zoomValue
      };
      renderSettingsPanelState();
      refreshCommandBarStates();
    }

    function createSettingsToggle(labelText, checked, onToggle){
      const row = document.createElement('label');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.style.gap = '8px';
      row.style.fontSize = '14px';
      const span = document.createElement('span');
      span.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !!checked;
      input.addEventListener('change', () => onToggle(input.checked));
      row.appendChild(span);
      row.appendChild(input);
      return { row, input };
    }

    function closeSettingsPanel(){
      if (!settingsPanel) return;
      try { frame.removeChild(settingsPanel); } catch {}
      settingsPanel = null;
      settingsControls = null;
      refreshCommandBarStates();
    }

    function renderSettingsPanelState(){
      if (!settingsControls) return;
      settingsControls.wrapCheckbox.checked = state.wordWrap;
      settingsControls.statusCheckbox.checked = state.showStatusBar;
      settingsControls.zoomSlider.value = String(state.zoom);
      settingsControls.zoomValue.textContent = `${formatNumber(state.zoom)}%`;
    }

    function toggleMenu(menuKey, anchor){
      closeSettingsPanel();
      if (currentMenu && currentMenu.__menuKey === menuKey) {
        closeMenu();
        return;
      }
      if (currentMenu) {
        currentMenu.remove();
        currentMenu = null;
      }
      const menu = document.createElement('div');
      menu.style.position = 'absolute';
      const anchorRect = anchor.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      menu.style.top = `${anchorRect.bottom - frameRect.top + 6}px`;
      menu.style.left = `${anchorRect.left - frameRect.left}px`;
      menu.style.background = '#ffffff';
      menu.style.border = '1px solid rgba(148,163,184,0.25)';
      menu.style.borderRadius = '8px';
      menu.style.boxShadow = '0 16px 36px rgba(15,23,42,0.25)';
      menu.style.padding = '6px 0';
      menu.style.minWidth = '180px';
      menu.style.zIndex = '20';

      const addItem = (label, handler, shortcut = '', enabled = true) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.textContent = label;
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.width = '100%';
        item.style.padding = '6px 16px';
        item.style.border = 'none';
        item.style.background = 'transparent';
        item.style.color = enabled ? '#111827' : '#94a3b8';
        item.style.fontSize = '14px';
        item.style.cursor = enabled ? 'pointer' : 'default';
        if (shortcut) {
          const span = document.createElement('span');
          span.textContent = shortcut;
          span.style.fontSize = '12px';
          span.style.color = '#64748b';
          item.appendChild(span);
        }
        if (enabled && handler) item.addEventListener('click', () => {
          handler();
          closeMenu();
        });
        item.addEventListener('pointerenter', () => { if (enabled) item.style.background = '#f1f5f9'; });
        item.addEventListener('pointerleave', () => { item.style.background = 'transparent'; });
        menu.appendChild(item);
      };

      const addSeparator = () => {
        const hr = document.createElement('div');
        hr.style.height = '1px';
        hr.style.margin = '4px 0';
        hr.style.background = 'rgba(148,163,184,0.2)';
        menu.appendChild(hr);
      };

      if (menuKey === 'file') {
        addItem(translate('games.notepad.menu.fileNew', '新規'), newDocument, 'Ctrl+N');
        addItem(translate('games.notepad.menu.fileOpen', '開く...'), openDocument, 'Ctrl+O');
        addItem(translate('games.notepad.menu.fileSave', '上書き保存'), () => saveDocument(false), 'Ctrl+S', state.text !== state.savedText);
        addItem(translate('games.notepad.menu.fileSaveAs', '名前を付けて保存...'), () => saveDocument(true), 'Ctrl+Shift+S');
        addSeparator();
        addItem(translate('games.notepad.menu.filePrint', '印刷...'), printDocument, 'Ctrl+P');
      } else if (menuKey === 'edit') {
        addItem(translate('games.notepad.menu.editUndo', '元に戻す'), () => execCommand('undo'), 'Ctrl+Z');
        addItem(translate('games.notepad.menu.editRedo', 'やり直し'), () => execCommand('redo'), 'Ctrl+Y');
        addSeparator();
        addItem(translate('games.notepad.menu.editCut', '切り取り'), () => execCommand('cut'), 'Ctrl+X');
        addItem(translate('games.notepad.menu.editCopy', 'コピー'), () => execCommand('copy'), 'Ctrl+C');
        addItem(translate('games.notepad.menu.editPaste', '貼り付け'), () => execCommand('paste'), 'Ctrl+V');
        addItem(translate('games.notepad.menu.editDelete', '削除'), () => execCommand('delete'));
        addSeparator();
        addItem(translate('games.notepad.menu.editFind', '検索...'), findText, 'Ctrl+F');
        addItem(translate('games.notepad.menu.editReplace', '置換...'), replaceText, 'Ctrl+H');
        addSeparator();
        addItem(translate('games.notepad.menu.editSelectAll', 'すべて選択'), () => execCommand('selectAll'), 'Ctrl+A');
      } else {
        addItem(translate('games.notepad.menu.viewZoomIn', 'ズームイン'), () => adjustZoom(10), 'Ctrl+Plus');
        addItem(translate('games.notepad.menu.viewZoomOut', 'ズームアウト'), () => adjustZoom(-10), 'Ctrl+Minus');
        addItem(translate('games.notepad.menu.viewZoomReset', 'ズームを既定に戻す'), () => setZoom(100), 'Ctrl+0');
        addSeparator();
        addItem(state.wordWrap ? translate('games.notepad.menu.view.disableWordWrap', '折り返しを無効化') : translate('games.notepad.menu.view.enableWordWrap', '折り返しを有効化'), toggleWordWrap);
        addItem(state.showStatusBar ? translate('games.notepad.menu.view.hideStatusBar', 'ステータスバーを非表示') : translate('games.notepad.menu.view.showStatusBar', 'ステータスバーを表示'), toggleStatusBar);
      }

      closeMenu();
      menu.__menuKey = menuKey;
      currentMenu = menu;
      frame.appendChild(menu);
    }

    function closeMenu(){
      if (currentMenu) {
        currentMenu.remove();
        currentMenu = null;
      }
      refreshCommandBarStates();
    }

    function execCommand(cmd){
      try { document.execCommand(cmd); } catch {}
    }

    function newDocument(){
      if (state.text !== state.savedText) {
        const message = translate('games.notepad.confirm.newWithoutSaving', '変更を保存せずに新しいファイルを開きますか？');
        if (!confirm(message)) return;
      }
      closeMenu();
      closeSettingsPanel();
      const defaultName = getDefaultFileName();
      currentDefaultFileName = defaultName;
      state.fileName = defaultName;
      state.text = '';
      state.savedText = '';
      state.lineEnding = '\r\n';
      textarea.value = '';
      updateTitle();
      scheduleStatusUpdate();
      persistSoon();
    }

    function openDocument(){
      closeMenu();
      closeSettingsPanel();
      hiddenFileInput.value = '';
      hiddenFileInput.click();
    }

    const onFileChange = () => {
      const file = hiddenFileInput.files && hiddenFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = typeof reader.result === 'string' ? reader.result : '';
        const defaultName = getDefaultFileName();
        if (!file.name) currentDefaultFileName = defaultName;
        state.fileName = file.name || defaultName;
        state.text = content;
        state.savedText = content;
        textarea.value = content;
        state.lineEnding = detectLineEnding(content);
        updateTitle();
        scheduleStatusUpdate();
        persistSoon();
      };
      reader.onerror = () => alert(translate('games.notepad.alerts.fileReadFailed', 'ファイルの読み込みに失敗しました。'));
      reader.readAsText(file, 'utf-8');
    };
    hiddenFileInput.addEventListener('change', onFileChange);

    function saveDocument(forcePrompt){
      const defaultName = getDefaultFileName();
      let name = state.fileName || defaultName;
      if (forcePrompt || name === currentDefaultFileName) {
        const promptMessage = translate('games.notepad.prompts.saveFileName', '保存するファイル名を入力してください');
        const entered = prompt(promptMessage, name);
        if (!entered) return;
        name = entered.trim();
        if (!name) name = defaultName;
      }
      if (!name) name = defaultName;
      const payload = textarea.value;
      state.lineEnding = detectLineEnding(payload);
      const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
      hiddenDownloader.href = URL.createObjectURL(blob);
      hiddenDownloader.download = name;
      hiddenDownloader.click();
      setTimeout(() => URL.revokeObjectURL(hiddenDownloader.href), 0);
      state.fileName = name;
      currentDefaultFileName = defaultName;
      state.savedText = payload;
      state.text = payload;
      updateTitle();
      scheduleStatusUpdate();
      persistSoon();
      award('save', 5);
    }

    function printDocument(){
      closeMenu();
      closeSettingsPanel();
      const printWindow = window.open('', '_blank', 'noopener');
      if (!printWindow) {
        alert(translate('games.notepad.alerts.printPopupBlocked', '印刷ウィンドウを開けませんでした。ポップアップを許可してください。'));
        return;
      }
      const locale = (typeof i18n?.getLocale === 'function' && i18n.getLocale()) || (typeof i18n?.getDefaultLocale === 'function' && i18n.getDefaultLocale()) || 'ja';
      const fallbackTitle = getNotepadTitle();
      const title = state.fileName || fallbackTitle;
      const escapedTitle = escapeHtml(title);
      const escapedBody = escapeHtml(textarea.value);
      const printLabel = escapeHtml(getPrintLabel());
      const html = `<!DOCTYPE html><html lang="${escapeHtml(locale)}"><head><meta charset="utf-8"><title>${escapedTitle} - ${printLabel}</title><style>body{font-family:'Segoe UI','Yu Gothic',sans-serif;padding:24px;margin:0;background:#ffffff;color:#0f172a;}h1{font-size:18px;margin:0 0 16px 0;}pre{white-space:pre-wrap;word-break:break-word;font-size:${computeFontSize(state.zoom)};line-height:1.6;}</style></head><body><h1>${escapedTitle}</h1><pre>${escapedBody}</pre></body></html>`;
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      let printed = false;
      const triggerPrint = () => {
        if (printed) return;
        printed = true;
        try { printWindow.focus(); } catch {}
        try { printWindow.print(); } catch {}
      };
      printWindow.addEventListener('load', triggerPrint, { once: true });
      printWindow.addEventListener('afterprint', () => {
        try { printWindow.close(); } catch {}
      });
      setTimeout(triggerPrint, 150);
    }

    function escapeHtml(str){
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function findText(){
      const message = translate('games.notepad.prompts.search', '検索する文字列を入力してください');
      const term = prompt(message);
      if (!term) return;
      const text = textarea.value;
      const start = textarea.selectionEnd;
      const idx = text.indexOf(term, start);
      const target = idx >= 0 ? idx : text.indexOf(term, 0);
      if (target >= 0) {
        textarea.focus();
        textarea.setSelectionRange(target, target + term.length);
        scheduleStatusUpdate();
      } else {
        alert(translate('games.notepad.alerts.searchNotFound', '見つかりませんでした。'));
      }
    }

    function replaceText(){
      const targetPrompt = translate('games.notepad.prompts.replaceTarget', '置換する文字列を入力してください');
      const term = prompt(targetPrompt);
      if (term === null) return;
      const replacementPrompt = translate('games.notepad.prompts.replaceWith', '置換後の文字列を入力してください');
      const repl = prompt(replacementPrompt, '');
      if (repl === null) return;
      const text = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = text.slice(start, end);
      if (selected === term) {
        const newText = text.slice(0, start) + repl + text.slice(end);
        textarea.value = newText;
        state.text = newText;
        textarea.setSelectionRange(start, start + repl.length);
        handleTextChanged();
      } else {
        const idx = text.indexOf(term, end);
        if (idx >= 0) {
          textarea.focus();
          textarea.setSelectionRange(idx, idx + term.length);
        } else {
          alert(translate('games.notepad.alerts.replaceNotFound', '対象の文字列が見つかりませんでした。'));
        }
      }
    }

    function insertTimestamp(){
      const now = new Date();
      const pattern = getTimestampPattern();
      const stamp = formatTimestamp(now, pattern);
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      textarea.value = value.slice(0, start) + stamp + value.slice(end);
      const caret = start + stamp.length;
      textarea.setSelectionRange(caret, caret);
      textarea.focus();
      handleTextChanged();
    }

    function setWordWrap(value){
      const next = !!value;
      if (state.wordWrap === next) return;
      state.wordWrap = next;
      textarea.style.whiteSpace = state.wordWrap ? 'pre-wrap' : 'pre';
      textarea.wrap = state.wordWrap ? 'soft' : 'off';
      refreshCommandBarStates();
      renderSettingsPanelState();
      persistSoon();
    }

    function toggleWordWrap(){
      setWordWrap(!state.wordWrap);
    }

    function setStatusBarVisible(value){
      const next = !!value;
      if (state.showStatusBar === next) return;
      state.showStatusBar = next;
      statusBar.style.display = state.showStatusBar ? 'flex' : 'none';
      updateStatusBar();
      renderSettingsPanelState();
      persistSoon();
    }

    function toggleStatusBar(){
      setStatusBarVisible(!state.showStatusBar);
    }

    function adjustZoom(delta){
      const next = Math.max(50, Math.min(200, state.zoom + delta));
      setZoom(next);
    }

    function setZoom(value){
      state.zoom = Math.max(50, Math.min(200, value));
      textarea.style.fontSize = computeFontSize(state.zoom);
      updateStatusBar();
      refreshCommandBarStates();
      renderSettingsPanelState();
      persistSoon();
    }

    function computeFontSize(zoom){
      const base = 15;
      return `${Math.round(base * (zoom / 100))}px`;
    }

    function handleTextChanged(){
      const nextText = textarea.value;
      const textChanged = nextText !== state.text;
      if (textChanged) {
        state.text = nextText;
        state.lineEnding = detectLineEnding(state.text);
        persistSoon();
        if (Date.now() - state.lastEditAwardAt >= EDIT_XP_COOLDOWN) {
          state.lastEditAwardAt = Date.now();
          award('edit', 1);
        }
      }
      scheduleStatusUpdate();
      refreshCommandBarStates();
      renderSettingsPanelState();
    }

    function detectLineEnding(text){
      if (text.indexOf('\r\n') !== -1) return '\r\n';
      if (text.indexOf('\n') !== -1) return '\n';
      return state.lineEnding || '\r\n';
    }

    function scheduleStatusUpdate(){
      updateStatusBar();
      updateTitle();
    }

    function updateTitle(){
      const dirty = state.text !== state.savedText;
      activeTabLabel.textContent = `${dirty ? '*' : ''}${state.fileName}`;
    }

    function updateStatusBar(){
      if (!state.showStatusBar) return;
      const pos = textarea.selectionStart || 0;
      const text = textarea.value.slice(0, pos);
      const lines = text.split(/\r?\n/);
      const line = lines.length;
      const column = (lines[lines.length - 1] || '').length + 1;
      const length = textarea.value.length;
      statusLeft.innerHTML = '';
      statusRight.innerHTML = '';
      const positionText = translate('games.notepad.status.position', '行 {line}, 列 {column}', {
        line: formatNumber(line),
        column: formatNumber(column)
      });
      const lengthText = translate('games.notepad.status.length', '{count} 文字', {
        count: formatNumber(length)
      });
      const typeText = translate('games.notepad.status.typeText', 'テキスト');
      statusLeft.appendChild(makeStatusChip(positionText));
      statusLeft.appendChild(makeStatusChip(lengthText));
      statusLeft.appendChild(makeStatusChip(typeText));
      statusRight.appendChild(makeStatusChip(`${formatNumber(state.zoom)}%`));
      statusRight.appendChild(makeStatusChip(state.lineEnding === '\n'
        ? translate('games.notepad.status.lineEnding.lf', 'Unix (LF)')
        : translate('games.notepad.status.lineEnding.crlf', 'Windows (CRLF)')));
      statusRight.appendChild(makeStatusChip(state.encoding));
    }

    function makeStatusChip(text){
      const chip = document.createElement('span');
      chip.textContent = text;
      chip.style.padding = '2px 8px';
      chip.style.borderRadius = '6px';
      chip.style.background = '#e2e8f0';
      chip.style.color = '#1e293b';
      chip.style.fontSize = '12px';
      return chip;
    }

    function persistSoon(){
      if (persistTimer) return;
      persistTimer = setTimeout(() => {
        persistTimer = null;
        writePersistentState(state);
      }, 400);
    }

    function award(type, amount){
      if (!awardXp || !amount) return 0;
      try {
        const gained = awardXp(amount, { type });
        const num = Number(gained);
        if (Number.isFinite(num)) state.sessionXp += num;
        return gained;
      } catch {
        return 0;
      }
    }

    function handleShortcut(e){
      if (!isRunning) return;
      if (!e.ctrlKey && !e.metaKey) return;
      const key = e.key.toLowerCase();
      if (key === 'n') { e.preventDefault(); newDocument(); }
      else if (key === 'o') { e.preventDefault(); openDocument(); }
      else if (key === 's') {
        e.preventDefault();
        if (e.shiftKey) saveDocument(true); else saveDocument(false);
      } else if (key === 'f') { e.preventDefault(); findText(); }
      else if (key === 'h') { e.preventDefault(); replaceText(); }
      else if (key === 'p') { e.preventDefault(); printDocument(); }
      else if (key === '0') { e.preventDefault(); setZoom(100); }
      else if (key === '=') { e.preventDefault(); adjustZoom(10); }
      else if (key === '-') { e.preventDefault(); adjustZoom(-10); }
    }

    function handleSelection(){
      updateStatusBar();
      refreshCommandBarStates();
    }

    function handleClickOutside(ev){
      const target = ev.target;
      if (currentMenu && !currentMenu.contains(target) && !menuBar.contains(target)) closeMenu();
      if (settingsPanel && !settingsPanel.contains(target) && target !== commandButtons.settings) closeSettingsPanel();
    }

    function handleBlur(){
      closeMenu();
      closeSettingsPanel();
    }

    function handleLocaleChange(){
      const previousDefault = currentDefaultFileName;
      const nextDefault = getDefaultFileName();
      currentDefaultFileName = nextDefault;
      if (state.fileName === previousDefault) {
        state.fileName = nextDefault;
      }
      closeMenu();
      closeSettingsPanel();
      populateMenuBar();
      populateCommandBar();
      updateTitle();
      updateStatusBar();
      persistSoon();
    }

    let currentRuntimeRef = null;

    function quit(){
      if (currentRuntimeRef) {
        try { currentRuntimeRef.stop(); } catch {}
        try { currentRuntimeRef.destroy(); } catch {}
      }
    }

    textarea.addEventListener('input', handleTextChanged);
    textarea.addEventListener('select', handleSelection);
    textarea.addEventListener('keyup', handleSelection);

    listeners.push({ target: document, type: 'keydown', handler: handleShortcut });
    listeners.push({ target: document, type: 'click', handler: handleClickOutside, capture: true });
    listeners.push({ target: window, type: 'blur', handler: handleBlur });

    function start(){
      if (isRunning) return;
      isRunning = true;
      if (!shortcutsDisabled) {
        shortcuts?.disableKey('p');
        shortcutsDisabled = true;
      }
      listeners.forEach(l => l.target.addEventListener(l.type, l.handler, l.capture || false));
      textarea.focus();
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      listeners.forEach(l => l.target.removeEventListener(l.type, l.handler, l.capture || false));
      if (shortcutsDisabled) {
        shortcuts?.enableKey('p');
        shortcutsDisabled = false;
      }
    }

    function destroy(){
      stop();
      if (shortcutsDisabled) {
        shortcuts?.enableKey('p');
        shortcutsDisabled = false;
      }
      closeMenu();
      closeSettingsPanel();
      if (typeof localeUnsubscribe === 'function') {
        try { localeUnsubscribe(); } catch {}
        localeUnsubscribe = null;
      }
      if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = null;
      }
      writePersistentState(state);
      textarea.removeEventListener('input', handleTextChanged);
      textarea.removeEventListener('select', handleSelection);
      textarea.removeEventListener('keyup', handleSelection);
      hiddenFileInput.removeEventListener('change', onFileChange);
      try { root.removeChild(wrapper); } catch {}
      currentRuntimeRef = null;
    }

    const runtime = {
      start,
      stop,
      destroy,
      getScore(){ return state.sessionXp; }
    };

    currentRuntimeRef = runtime;
    start();
    return runtime;
  }

  window.registerMiniGame({
    id: 'notepad',
    name: 'メモ帳', nameKey: 'selection.miniexp.games.notepad.name',
    description: '開く+5 / 編集+1 / 保存+5 EXP、Windows風メモ帳', descriptionKey: 'selection.miniexp.games.notepad.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();
