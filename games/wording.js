(function(){
  const STORAGE_KEY = 'miniexp_wording_v1';
  const EDIT_COOLDOWN = 800;
  const FORMAT_COOLDOWN = 300;
  const INSERT_COOLDOWN = 400;
  const SAVE_BONUS = 6;
  const LAUNCH_BONUS = 8;
  const DEFAULT_TITLE = '文書1';

  function loadPersistentState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return {
        title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title : DEFAULT_TITLE,
        contentHTML: typeof parsed.contentHTML === 'string' ? parsed.contentHTML : '',
        zoom: Number.isFinite(parsed.zoom) ? Math.min(200, Math.max(50, parsed.zoom)) : 100,
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
        columnCount: Number.isInteger(parsed.columnCount) ? Math.min(3, Math.max(1, parsed.columnCount)) : 1,
        lineHeight: Number.isFinite(parsed.lineHeight) ? Math.min(3, Math.max(1, parsed.lineHeight)) : 1.6,
        pageTint: typeof parsed.pageTint === 'string' ? parsed.pageTint : 'white',
        showRuler: typeof parsed.showRuler === 'boolean' ? parsed.showRuler : true,
        showStatusBar: typeof parsed.showStatusBar === 'boolean' ? parsed.showStatusBar : true
      };
    } catch {
      return null;
    }
  }

  function writePersistentState(state){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        title: state.title,
        contentHTML: state.contentHTML,
        zoom: state.zoom,
        theme: state.theme,
        columnCount: state.columnCount,
        lineHeight: state.lineHeight,
        pageTint: state.pageTint,
        showRuler: state.showRuler,
        showStatusBar: state.showStatusBar
      }));
    } catch {}
  }

  const WORDING_FONTS = [
    { label: '游ゴシック', value: '"Yu Gothic UI", "YuGothic", sans-serif' },
    { label: '游明朝', value: '"Yu Mincho", "YuMincho", serif' },
    { label: 'メイリオ', value: '"Meiryo", sans-serif' },
    { label: 'ヒラギノ角ゴ', value: '"Hiragino Kaku Gothic ProN", sans-serif' },
    { label: '等幅 (Consolas)', value: 'Consolas, "Cascadia Mono", monospace' }
  ];

  const FONT_SIZE_OPTIONS = [8,9,10,11,12,14,16,18,20,22,24,26,28,36,48,72];

  function create(root, awardXp, opts){
    if (!root) throw new Error('MiniExp Wording requires a container');

    const shortcuts = opts?.shortcuts;

    const persisted = loadPersistentState();
    const state = {
      title: persisted?.title || DEFAULT_TITLE,
      savedTitle: persisted?.title || DEFAULT_TITLE,
      contentHTML: persisted?.contentHTML || '',
      savedHTML: persisted?.contentHTML || '',
      zoom: persisted?.zoom || 100,
      theme: persisted?.theme || 'light',
      columnCount: persisted?.columnCount || 1,
      lineHeight: persisted?.lineHeight || 1.6,
      pageTint: persisted?.pageTint || 'white',
      showRuler: persisted?.showRuler !== false,
      showStatusBar: persisted?.showStatusBar !== false,
      ribbonTab: 'home',
      lastEditAt: 0,
      sessionXp: 0,
      lastFormatAt: 0,
      isRunning: false,
      searchQuery: '',
      searchIndex: -1,
      searchResults: [],
      searchReplaceText: '',
      reviewHighlight: false
    };

    const xpCooldowns = new Map();
    let persistTimer = null;
    const skipFormatXpCommands = new Set(['insertText', 'insertHTML']);
    let shortcutsDisabled = false;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'radial-gradient(circle at top left, rgba(79,70,229,0.45), rgba(15,23,42,0.85))';
    wrapper.style.padding = '18px';

    const frame = document.createElement('div');
    frame.style.width = 'min(1280px, 98%)';
    frame.style.height = 'min(720px, 98%)';
    frame.style.display = 'flex';
    frame.style.flexDirection = 'column';
    frame.style.background = 'linear-gradient(160deg, rgba(255,255,255,0.96), rgba(226,232,240,0.96))';
    frame.style.borderRadius = '18px';
    frame.style.boxShadow = '0 42px 80px rgba(15,23,42,0.55)';
    frame.style.overflow = 'hidden';
    frame.style.fontFamily = '"Segoe UI", "Yu Gothic UI", sans-serif';

    const titleBar = document.createElement('div');
    titleBar.style.display = 'flex';
    titleBar.style.alignItems = 'center';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.padding = '8px 18px';
    titleBar.style.background = 'linear-gradient(90deg,#1e3a8a,#1d4ed8,#2563eb)';
    titleBar.style.color = '#e0e7ff';

    const titleLeft = document.createElement('div');
    titleLeft.style.display = 'flex';
    titleLeft.style.alignItems = 'center';
    titleLeft.style.gap = '12px';

    const appBadge = document.createElement('div');
    appBadge.style.width = '32px';
    appBadge.style.height = '32px';
    appBadge.style.borderRadius = '9px';
    appBadge.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(96,165,250,0.9))';
    appBadge.style.display = 'flex';
    appBadge.style.alignItems = 'center';
    appBadge.style.justifyContent = 'center';
    appBadge.style.fontWeight = '700';
    appBadge.style.fontSize = '15px';
    appBadge.textContent = 'W';

    const titleLabel = document.createElement('div');
    titleLabel.style.fontSize = '16px';
    titleLabel.style.fontWeight = '600';
    titleLabel.style.display = 'flex';
    titleLabel.style.alignItems = 'baseline';
    titleLabel.style.gap = '6px';

    const titleName = document.createElement('span');
    const titleSuffix = document.createElement('span');
    titleSuffix.style.fontSize = '13px';
    titleSuffix.style.opacity = '0.8';
    titleSuffix.textContent = '- Wording';

    const renameBtn = document.createElement('button');
    renameBtn.type = 'button';
    renameBtn.textContent = '名前の変更';
    renameBtn.style.border = 'none';
    renameBtn.style.borderRadius = '16px';
    renameBtn.style.padding = '4px 10px';
    renameBtn.style.fontSize = '12px';
    renameBtn.style.color = '#1e3a8a';
    renameBtn.style.background = 'rgba(255,255,255,0.9)';
    renameBtn.style.cursor = 'pointer';

    titleLabel.appendChild(titleName);
    titleLabel.appendChild(titleSuffix);

    titleLeft.appendChild(appBadge);
    titleLeft.appendChild(titleLabel);
    titleLeft.appendChild(renameBtn);

    const titleRight = document.createElement('div');
    titleRight.style.display = 'flex';
    titleRight.style.alignItems = 'center';
    titleRight.style.gap = '8px';

    const windowButtons = ['—','□','×'].map(symbol => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = symbol;
      btn.style.width = '32px';
      btn.style.height = '24px';
      btn.style.borderRadius = '6px';
      btn.style.border = 'none';
      btn.style.background = 'rgba(255,255,255,0.15)';
      btn.style.color = '#e0e7ff';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'background 0.2s ease';
      btn.addEventListener('pointerenter', () => {
        btn.style.background = symbol === '×' ? 'rgba(252,165,165,0.4)' : 'rgba(255,255,255,0.3)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.background = 'rgba(255,255,255,0.15)';
      });
      if (symbol === '×') {
        btn.addEventListener('click', () => {
          if (!state.savedHTML || state.savedHTML === state.contentHTML || confirm('保存せずに閉じますか？')) {
            quit();
          }
        });
      }
      return btn;
    });
    windowButtons.forEach(btn => titleRight.appendChild(btn));

    titleBar.appendChild(titleLeft);
    titleBar.appendChild(titleRight);

    const ribbonArea = document.createElement('div');
    ribbonArea.style.background = '#f8fafc';
    ribbonArea.style.borderBottom = '1px solid rgba(148,163,184,0.35)';
    ribbonArea.style.display = 'flex';
    ribbonArea.style.flexDirection = 'column';

    const quickBar = document.createElement('div');
    const quickBarButtons = [];
    const ribbonGroupButtons = [];
    quickBar.style.display = 'flex';
    quickBar.style.alignItems = 'center';
    quickBar.style.gap = '6px';
    quickBar.style.padding = '6px 18px';
    quickBar.style.background = 'rgba(226,232,240,0.7)';

    function createIconButton(icon, label){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `<span style="font-size:16px;line-height:1">${icon}</span>`;
      btn.title = label;
      btn.style.width = '32px';
      btn.style.height = '32px';
      btn.style.borderRadius = '8px';
      btn.style.border = '1px solid rgba(148,163,184,0.4)';
      btn.style.background = '#fff';
      btn.style.cursor = 'pointer';
      btn.style.display = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
      btn.addEventListener('pointerenter', () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 10px 18px rgba(15,23,42,0.15)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
      });
      quickBarButtons.push(btn);
      return btn;
    }

    const quickSaveBtn = createIconButton('💾', '上書き保存 (Ctrl+S)');
    const quickSaveAsBtn = createIconButton('📝', '名前を付けて保存 (Ctrl+Shift+S)');
    const quickUndoBtn = createIconButton('↶', '元に戻す (Ctrl+Z)');
    const quickRedoBtn = createIconButton('↷', 'やり直し (Ctrl+Y)');
    const quickPrintBtn = createIconButton('🖨️', '印刷');

    quickSaveBtn.addEventListener('click', () => { saveDocument(false); });
    quickSaveAsBtn.addEventListener('click', () => { saveDocument(true); });
    quickUndoBtn.addEventListener('click', () => { document.execCommand('undo'); });
    quickRedoBtn.addEventListener('click', () => { document.execCommand('redo'); });
    quickPrintBtn.addEventListener('click', () => {
      showToast('印刷ダイアログは近日対応予定です');
      grantXp('insert', 3, INSERT_COOLDOWN);
    });

    quickBar.appendChild(quickSaveBtn);
    quickBar.appendChild(quickSaveAsBtn);
    quickBar.appendChild(quickUndoBtn);
    quickBar.appendChild(quickRedoBtn);
    quickBar.appendChild(quickPrintBtn);

    const tabBar = document.createElement('div');
    tabBar.style.display = 'flex';
    tabBar.style.alignItems = 'flex-end';
    tabBar.style.padding = '0 18px';
    tabBar.style.gap = '24px';

    const tabs = [
      { id:'home', label:'ホーム' },
      { id:'insert', label:'挿入' },
      { id:'layout', label:'レイアウト' },
      { id:'review', label:'校閲' },
      { id:'view', label:'表示' }
    ];

    const tabButtons = new Map();

    const ribbonTabButtons = [];

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = tab.label;
      btn.dataset.tab = tab.id;
      btn.style.border = 'none';
      btn.style.background = 'transparent';
      btn.style.padding = '12px 6px 10px';
      btn.style.fontSize = '15px';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.borderBottom = '3px solid transparent';
      btn.addEventListener('click', () => {
        state.ribbonTab = tab.id;
        renderRibbon();
      });
      tabButtons.set(tab.id, btn);
      tabBar.appendChild(btn);
      ribbonTabButtons.push(btn);
    });

    const ribbonContent = document.createElement('div');
    ribbonContent.style.display = 'grid';
    ribbonContent.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    ribbonContent.style.gap = '12px';
    ribbonContent.style.padding = '12px 18px 18px';

    function createGroup(title){
      const group = document.createElement('div');
      group.style.background = '#ffffff';
      group.style.border = '1px solid rgba(148,163,184,0.35)';
      group.style.borderRadius = '12px';
      group.style.padding = '10px';
      group.style.display = 'flex';
      group.style.flexDirection = 'column';
      group.style.gap = '10px';
      group.style.boxShadow = '0 12px 24px rgba(15,23,42,0.12)';
      const label = document.createElement('div');
      label.textContent = title;
      label.style.fontSize = '12px';
      label.style.fontWeight = '600';
      label.style.color = '#1e293b';
      label.style.letterSpacing = '0.05em';
      group.appendChild(label);
      return group;
    }

    function makeToggleButton(text, opts){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = text;
      btn.style.border = '1px solid rgba(148,163,184,0.5)';
      btn.style.borderRadius = '8px';
      btn.style.padding = '6px 10px';
      btn.style.background = '#fff';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '14px';
      btn.style.color = '#111827';
      btn.dataset.command = opts?.command || '';
      btn.addEventListener('click', () => {
        if (opts?.handler) {
          opts.handler();
        } else if (btn.dataset.command) {
          runCommand(btn.dataset.command, opts?.value);
        }
        if (opts?.grantXp) grantXp(opts.grantXp.type, opts.grantXp.amount, opts.grantXp.cooldown || FORMAT_COOLDOWN);
      });
      ribbonGroupButtons.push(btn);
      return btn;
    }

    const colorPickerText = document.createElement('input');
    colorPickerText.type = 'color';
    colorPickerText.value = '#1f2937';
    colorPickerText.style.width = '40px';
    colorPickerText.style.height = '32px';
    colorPickerText.style.border = '1px solid rgba(148,163,184,0.5)';
    colorPickerText.style.borderRadius = '8px';
    colorPickerText.addEventListener('input', () => {
      runCommand('foreColor', colorPickerText.value);
      grantXp('format', 2, FORMAT_COOLDOWN);
    });

    const colorPickerHighlight = document.createElement('input');
    colorPickerHighlight.type = 'color';
    colorPickerHighlight.value = '#facc15';
    colorPickerHighlight.style.width = '40px';
    colorPickerHighlight.style.height = '32px';
    colorPickerHighlight.style.border = '1px solid rgba(148,163,184,0.5)';
    colorPickerHighlight.style.borderRadius = '8px';
    colorPickerHighlight.addEventListener('input', () => {
      runCommand('hiliteColor', colorPickerHighlight.value);
      grantXp('format', 2, FORMAT_COOLDOWN);
    });

    const fontSelect = document.createElement('select');
    fontSelect.style.padding = '6px 10px';
    fontSelect.style.border = '1px solid rgba(148,163,184,0.5)';
    fontSelect.style.borderRadius = '8px';
    fontSelect.style.fontSize = '13px';
    WORDING_FONTS.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      fontSelect.appendChild(option);
    });
    fontSelect.addEventListener('change', () => {
      runCommand('fontName', fontSelect.value);
      grantXp('format', 2, FORMAT_COOLDOWN);
    });

    const fontSizeSelect = document.createElement('select');
    fontSizeSelect.style.padding = '6px 10px';
    fontSizeSelect.style.border = '1px solid rgba(148,163,184,0.5)';
    fontSizeSelect.style.borderRadius = '8px';
    fontSizeSelect.style.fontSize = '13px';
    FONT_SIZE_OPTIONS.forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = `${size} pt`;
      fontSizeSelect.appendChild(option);
    });
    fontSizeSelect.value = '11';
    fontSizeSelect.addEventListener('change', () => {
      // document.execCommand fontSize expects 1-7, so use custom span
      applyInlineStyle(`font-size:${fontSizeSelect.value}pt`);
      grantXp('format', 2, FORMAT_COOLDOWN);
    });

    const homeGroups = [];
    const groupClipboard = createGroup('クリップボード');
    const pasteBtn = makeToggleButton('貼り付け', { handler(){ document.execCommand('paste'); }, grantXp:{ type:'insert', amount:2, cooldown:INSERT_COOLDOWN }});
    const copyBtn = makeToggleButton('コピー', { handler(){ document.execCommand('copy'); }});
    const cutBtn = makeToggleButton('切り取り', { handler(){ document.execCommand('cut'); grantXp('format', 1, FORMAT_COOLDOWN); }});
    groupClipboard.appendChild(pasteBtn);
    groupClipboard.appendChild(copyBtn);
    groupClipboard.appendChild(cutBtn);
    homeGroups.push(groupClipboard);

    const groupFont = createGroup('フォント');
    const fontRow1 = document.createElement('div');
    fontRow1.style.display = 'flex';
    fontRow1.style.flexWrap = 'wrap';
    fontRow1.style.gap = '6px';
    [
      { text:'B', command:'bold' },
      { text:'I', command:'italic' },
      { text:'U', command:'underline' },
      { text:'abc', handler: () => runCommand('strikeThrough') },
      { text:'上付き', handler: () => runCommand('superscript') },
      { text:'下付き', handler: () => runCommand('subscript') }
    ].forEach(cfg => {
      const btn = makeToggleButton(cfg.text, { command: cfg.command, handler: cfg.handler });
      fontRow1.appendChild(btn);
    });
    const fontRow2 = document.createElement('div');
    fontRow2.style.display = 'flex';
    fontRow2.style.gap = '6px';
    fontRow2.style.flexWrap = 'wrap';
    fontRow2.appendChild(fontSelect);
    fontRow2.appendChild(fontSizeSelect);
    fontRow2.appendChild(colorPickerText);
    fontRow2.appendChild(colorPickerHighlight);
    groupFont.appendChild(fontRow1);
    groupFont.appendChild(fontRow2);
    homeGroups.push(groupFont);

    const groupParagraph = createGroup('段落');
    const paraRow = document.createElement('div');
    paraRow.style.display = 'flex';
    paraRow.style.flexWrap = 'wrap';
    paraRow.style.gap = '6px';
    [
      { text:'•', handler: () => runCommand('insertUnorderedList') },
      { text:'1.', handler: () => runCommand('insertOrderedList') },
      { text:'左揃え', handler: () => runCommand('justifyLeft') },
      { text:'中央', handler: () => runCommand('justifyCenter') },
      { text:'右揃え', handler: () => runCommand('justifyRight') },
      { text:'両端', handler: () => runCommand('justifyFull') },
      { text:'インデント↑', handler: () => runCommand('outdent') },
      { text:'インデント↓', handler: () => runCommand('indent') }
    ].forEach(cfg => {
      const btn = makeToggleButton(cfg.text, { handler: cfg.handler });
      paraRow.appendChild(btn);
    });
    groupParagraph.appendChild(paraRow);
    homeGroups.push(groupParagraph);

    const groupStyles = createGroup('スタイル');
    const styleRow = document.createElement('div');
    styleRow.style.display = 'grid';
    styleRow.style.gridTemplateColumns = 'repeat(2, minmax(0,1fr))';
    styleRow.style.gap = '6px';
    [
      { text:'本文', block:'p' },
      { text:'見出し 1', block:'h1' },
      { text:'見出し 2', block:'h2' },
      { text:'引用', block:'blockquote' }
    ].forEach(cfg => {
      const btn = makeToggleButton(cfg.text, { handler: () => {
        runCommand('formatBlock', cfg.block);
      }});
      styleRow.appendChild(btn);
    });
    groupStyles.appendChild(styleRow);
    homeGroups.push(groupStyles);

    const insertGroups = [];
    const groupInsert = createGroup('挿入');
    const insertRow = document.createElement('div');
    insertRow.style.display = 'flex';
    insertRow.style.flexWrap = 'wrap';
    insertRow.style.gap = '6px';
    const insertDate = makeToggleButton('日付', { handler: () => {
      const now = new Date();
      runCommand('insertText', now.toLocaleDateString());
      grantXp('insert', 3, INSERT_COOLDOWN);
    }});
    const insertTime = makeToggleButton('時刻', { handler: () => {
      const now = new Date();
      runCommand('insertText', now.toLocaleTimeString());
      grantXp('insert', 3, INSERT_COOLDOWN);
    }});
    const insertLine = makeToggleButton('横罫線', { handler: () => {
      runCommand('insertHorizontalRule');
      grantXp('insert', 3, INSERT_COOLDOWN);
    }});
    const insertEmoji = makeToggleButton('スタンプ', { handler: () => {
      const emojis = ['📌','✨','🔥','✅','💡','🎯','📝','⭐','📎'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      runCommand('insertText', ` ${emoji} `);
      grantXp('insert', 3, INSERT_COOLDOWN);
    }});
    const insertToc = makeToggleButton('目次', { handler: () => {
      const template = '<ol><li>はじめに</li><li>本題</li><li>まとめ</li></ol>';
      runCommand('insertHTML', template);
      grantXp('insert', 3, INSERT_COOLDOWN);
    }});
    insertRow.appendChild(insertDate);
    insertRow.appendChild(insertTime);
    insertRow.appendChild(insertLine);
    insertRow.appendChild(insertEmoji);
    insertRow.appendChild(insertToc);
    groupInsert.appendChild(insertRow);
    insertGroups.push(groupInsert);

    const groupMedia = createGroup('メディア');
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';
    const insertImageBtn = makeToggleButton('画像', { handler: () => imageInput.click() });
    imageInput.addEventListener('change', () => {
      const file = imageInput.files && imageInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        runCommand('insertHTML', `<img src="${reader.result}" alt="" style="max-width:100%;height:auto;border-radius:8px;">`);
        grantXp('insert', 4, INSERT_COOLDOWN);
      };
      reader.readAsDataURL(file);
      imageInput.value = '';
    });
    const insertDivider = makeToggleButton('テキストボックス', { handler: () => {
      const html = '<div style="border:1px solid #94a3b8;padding:12px;border-radius:12px;background:#f8fafc;">テキストボックス</div>';
      runCommand('insertHTML', html);
      grantXp('insert', 4, INSERT_COOLDOWN);
    }});
    groupMedia.appendChild(insertImageBtn);
    groupMedia.appendChild(insertDivider);
    groupMedia.appendChild(imageInput);
    insertGroups.push(groupMedia);

    const layoutGroups = [];
    const reviewGroups = [];
    const viewGroups = [];
    const groupTheme = createGroup('テーマ');
    const themeRow = document.createElement('div');
    themeRow.style.display = 'flex';
    themeRow.style.gap = '6px';
    const lightBtn = makeToggleButton('ライト', { handler: () => { state.theme = 'light'; updateTheme(); grantXp('format', 2, FORMAT_COOLDOWN); }});
    const darkBtn = makeToggleButton('ダーク紙', { handler: () => { state.theme = 'dark'; updateTheme(); grantXp('format', 2, FORMAT_COOLDOWN); }});
    themeRow.appendChild(lightBtn);
    themeRow.appendChild(darkBtn);
    groupTheme.appendChild(themeRow);
    layoutGroups.push(groupTheme);

    const groupColumns = createGroup('列');
    const columnRow = document.createElement('div');
    columnRow.style.display = 'flex';
    columnRow.style.gap = '6px';
    [1,2,3].forEach(count => {
      const btn = makeToggleButton(`${count} 列`, { handler: () => {
        state.columnCount = count;
        editor.style.columnCount = String(count);
        grantXp('format', 2, FORMAT_COOLDOWN);
        schedulePersist();
      }});
      columnRow.appendChild(btn);
    });
    groupColumns.appendChild(columnRow);
    layoutGroups.push(groupColumns);

    const groupMargins = createGroup('余白');
    const marginRow = document.createElement('div');
    marginRow.style.display = 'flex';
    marginRow.style.gap = '6px';
    [
      { text:'狭い', value:'40px' },
      { text:'標準', value:'64px' },
      { text:'広い', value:'90px' }
    ].forEach(cfg => {
      const btn = makeToggleButton(cfg.text, { handler: () => {
        page.style.padding = `${cfg.value} ${Math.max(parseInt(cfg.value,10)+60, 60)}px`;
        grantXp('format', 2, FORMAT_COOLDOWN);
      }});
      marginRow.appendChild(btn);
    });
    groupMargins.appendChild(marginRow);
    layoutGroups.push(groupMargins);

    const groupProofing = createGroup('校閲ツール');
    const reviewRow = document.createElement('div');
    reviewRow.style.display = 'flex';
    reviewRow.style.flexWrap = 'wrap';
    reviewRow.style.gap = '6px';
    const wordCountBtn = makeToggleButton('文字数カウント', { handler: () => {
      const text = editor.innerText || '';
      const trimmed = text.trim();
      const charCount = text.replace(/\s+/g, '').length;
      const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
      const paragraphCount = trimmed ? trimmed.split(/\n{2,}/).length : 0;
      showToast(`文字数: ${charCount} / 単語: ${wordCount} / 段落: ${paragraphCount}`);
    }});
    const readingTimeBtn = makeToggleButton('読了目安', { handler: () => {
      const text = editor.innerText || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      if (!words) {
        showToast('本文がありません');
        return;
      }
      const wordsPerMinute = 400;
      const totalMinutes = words / wordsPerMinute;
      let minutes = Math.floor(totalMinutes);
      let seconds = Math.round((totalMinutes - minutes) * 60);
      if (minutes === 0 && seconds === 0) seconds = 30;
      if (minutes === 0) minutes = 1;
      if (seconds >= 60) {
        minutes += 1;
        seconds = 0;
      }
      showToast(`およそ ${minutes} 分 ${seconds.toString().padStart(2, '0')} 秒で読めます`);
    }});
    const reviewHighlightBtn = makeToggleButton('長文検出', { handler: () => {
      state.reviewHighlight = !state.reviewHighlight;
      reviewHighlightBtn.textContent = state.reviewHighlight ? '長文解除' : '長文検出';
      updateReviewHighlights();
    }});
    reviewRow.appendChild(wordCountBtn);
    reviewRow.appendChild(readingTimeBtn);
    reviewRow.appendChild(reviewHighlightBtn);
    groupProofing.appendChild(reviewRow);
    reviewGroups.push(groupProofing);

    const groupComments = createGroup('コメント');
    const commentRow = document.createElement('div');
    commentRow.style.display = 'flex';
    commentRow.style.flexWrap = 'wrap';
    commentRow.style.gap = '6px';
    const insertCommentBtn = makeToggleButton('コメント挿入', { handler: () => {
      const note = prompt('コメントを入力してください');
      if (!note) return;
      const span = document.createElement('span');
      span.textContent = `💬 ${note}`;
      span.setAttribute('style', 'background:rgba(254,240,138,0.85);padding:2px 6px;border-radius:6px;margin:0 2px;font-size:13px;');
      runCommand('insertHTML', span.outerHTML);
    }});
    const changeSummaryBtn = makeToggleButton('変更サマリ', { handler: () => {
      const currentLength = (editor.innerText || '').replace(/\s+/g, '').length;
      const savedVirtual = document.createElement('div');
      savedVirtual.innerHTML = state.savedHTML || '';
      const savedLength = (savedVirtual.innerText || '').replace(/\s+/g, '').length;
      const diff = Math.abs(currentLength - savedLength);
      if (!diff && state.contentHTML === state.savedHTML) {
        showToast('保存済み: 差分はありません');
      } else {
        showToast(`未保存の差分目安: 約 ${diff} 文字`);
      }
    }});
    commentRow.appendChild(insertCommentBtn);
    commentRow.appendChild(changeSummaryBtn);
    groupComments.appendChild(commentRow);
    reviewGroups.push(groupComments);

    const groupLineHeight = createGroup('行間');
    const lineRow = document.createElement('div');
    lineRow.style.display = 'flex';
    lineRow.style.flexWrap = 'wrap';
    lineRow.style.gap = '6px';
    [
      { text:'1.2 倍', value:1.2 },
      { text:'1.5 倍', value:1.5 },
      { text:'2.0 倍', value:2.0 }
    ].forEach(cfg => {
      const btn = makeToggleButton(cfg.text, { handler: () => {
        setLineHeight(cfg.value);
      }});
      lineRow.appendChild(btn);
    });
    groupLineHeight.appendChild(lineRow);
    viewGroups.push(groupLineHeight);

    const groupGuides = createGroup('ガイド');
    const guidesRow = document.createElement('div');
    guidesRow.style.display = 'flex';
    guidesRow.style.flexWrap = 'wrap';
    guidesRow.style.gap = '6px';
    const toggleRulerBtn = makeToggleButton('ルーラー表示', { handler: () => {
      state.showRuler = !state.showRuler;
      ruler.style.display = state.showRuler ? 'flex' : 'none';
      toggleRulerBtn.textContent = state.showRuler ? 'ルーラー非表示' : 'ルーラー表示';
      schedulePersist();
    }});
    toggleRulerBtn.textContent = state.showRuler ? 'ルーラー非表示' : 'ルーラー表示';
    const toggleStatusBtn = makeToggleButton('ステータスバー', { handler: () => {
      state.showStatusBar = !state.showStatusBar;
      statusBar.style.display = state.showStatusBar ? 'flex' : 'none';
      toggleStatusBtn.textContent = state.showStatusBar ? 'ステータス隠す' : 'ステータス表示';
      schedulePersist();
    }});
    toggleStatusBtn.textContent = state.showStatusBar ? 'ステータス隠す' : 'ステータス表示';
    guidesRow.appendChild(toggleRulerBtn);
    guidesRow.appendChild(toggleStatusBtn);
    groupGuides.appendChild(guidesRow);
    viewGroups.push(groupGuides);

    const groupPaper = createGroup('紙の色');
    const paperRow = document.createElement('div');
    paperRow.style.display = 'flex';
    paperRow.style.flexWrap = 'wrap';
    paperRow.style.gap = '6px';
    [
      { text:'ホワイト', value:'white' },
      { text:'クリーム', value:'cream' },
      { text:'グレー', value:'gray' }
    ].forEach(cfg => {
      const btn = makeToggleButton(cfg.text, { handler: () => {
        setPageTint(cfg.value);
      }});
      paperRow.appendChild(btn);
    });
    groupPaper.appendChild(paperRow);
    viewGroups.push(groupPaper);

    const ribbonRegistry = {
      home: homeGroups,
      insert: insertGroups,
      layout: layoutGroups,
      review: reviewGroups,
      view: viewGroups
    };

    ribbonArea.appendChild(quickBar);
    ribbonArea.appendChild(tabBar);
    ribbonArea.appendChild(ribbonContent);

    const bodyArea = document.createElement('div');
    bodyArea.style.flex = '1';
    bodyArea.style.position = 'relative';
    bodyArea.style.background = 'linear-gradient(120deg,#e2e8f0,#cbd5f5)';
    bodyArea.style.padding = '24px 0';
    bodyArea.style.overflow = 'auto';

    const pageViewport = document.createElement('div');
    pageViewport.style.width = '100%';
    pageViewport.style.height = '100%';
    pageViewport.style.display = 'flex';
    pageViewport.style.flexDirection = 'column';
    pageViewport.style.alignItems = 'center';
    pageViewport.style.pointerEvents = 'auto';

    const ruler = document.createElement('div');
    ruler.style.width = 'min(880px, 80%)';
    ruler.style.height = '32px';
    ruler.style.background = 'linear-gradient(90deg,rgba(226,232,240,0.9),rgba(148,163,184,0.6))';
    ruler.style.borderRadius = '12px';
    ruler.style.marginBottom = '16px';
    ruler.style.display = 'flex';
    ruler.style.alignItems = 'center';
    ruler.style.justifyContent = 'space-between';
    ruler.style.padding = '0 12px';
    ruler.style.color = '#334155';
    ruler.style.fontSize = '12px';
    ruler.textContent = '0      5      10      15      20      25      30';
    ruler.style.display = state.showRuler ? 'flex' : 'none';

    const page = document.createElement('div');
    page.style.width = 'min(880px, 86%)';
    page.style.minHeight = '960px';
    page.style.background = '#ffffff';
    page.style.borderRadius = '18px';
    page.style.boxShadow = '0 24px 64px rgba(15,23,42,0.25)';
    page.style.padding = '64px 120px';
    page.style.transition = 'background 0.3s ease, color 0.3s ease';

    const editor = document.createElement('div');
    editor.contentEditable = 'true';
    editor.spellcheck = true;
    editor.style.minHeight = '800px';
    editor.style.outline = 'none';
    editor.style.lineHeight = String(state.lineHeight);
    editor.style.fontSize = '11pt';
    editor.style.color = '#111827';
    editor.style.columnGap = '48px';
    editor.style.columnCount = String(state.columnCount);
    editor.style.wordBreak = 'break-word';
    editor.innerHTML = state.contentHTML || '<p>ようこそ、Wording へ！ここで文章作成を始めましょう。</p>';

    page.appendChild(editor);
    pageViewport.appendChild(ruler);
    pageViewport.appendChild(page);
    applyPageTint();
    bodyArea.appendChild(pageViewport);

    const statusBar = document.createElement('div');
    statusBar.style.height = '36px';
    statusBar.style.display = 'flex';
    statusBar.style.alignItems = 'center';
    statusBar.style.justifyContent = 'space-between';
    statusBar.style.padding = '0 18px';
    statusBar.style.background = '#1e293b';
    statusBar.style.color = '#e2e8f0';
    statusBar.style.fontSize = '12px';
    statusBar.style.display = state.showStatusBar ? 'flex' : 'none';

    const statusLeft = document.createElement('div');
    statusLeft.style.display = 'flex';
    statusLeft.style.gap = '16px';

    const statusRight = document.createElement('div');
    statusRight.style.display = 'flex';
    statusRight.style.gap = '12px';
    statusRight.style.alignItems = 'center';

    const zoomDownBtn = createIconButton('－', 'ズームアウト');
    const zoomLabel = document.createElement('span');
    zoomLabel.style.minWidth = '48px';
    zoomLabel.style.display = 'inline-block';
    zoomLabel.style.textAlign = 'center';
    const zoomUpBtn = createIconButton('＋', 'ズームイン');

    zoomDownBtn.addEventListener('click', () => { changeZoom(-10); });
    zoomUpBtn.addEventListener('click', () => { changeZoom(10); });

    statusRight.appendChild(zoomDownBtn);
    statusRight.appendChild(zoomLabel);
    statusRight.appendChild(zoomUpBtn);

    statusBar.appendChild(statusLeft);
    statusBar.appendChild(statusRight);

    const searchOverlay = document.createElement('div');
    searchOverlay.style.position = 'absolute';
    searchOverlay.style.inset = '0';
    searchOverlay.style.display = 'none';
    searchOverlay.style.alignItems = 'center';
    searchOverlay.style.justifyContent = 'center';
    searchOverlay.style.backdropFilter = 'blur(4px)';
    searchOverlay.style.background = 'rgba(15,23,42,0.35)';

    const searchPanel = document.createElement('div');
    searchPanel.style.background = '#fff';
    searchPanel.style.padding = '20px';
    searchPanel.style.borderRadius = '16px';
    searchPanel.style.boxShadow = '0 24px 60px rgba(15,23,42,0.35)';
    searchPanel.style.width = 'min(420px, 92%)';
    searchPanel.style.display = 'flex';
    searchPanel.style.flexDirection = 'column';
    searchPanel.style.gap = '12px';

    const searchTitle = document.createElement('h3');
    searchTitle.textContent = '検索と置換';
    searchTitle.style.margin = '0';
    searchTitle.style.fontSize = '18px';
    searchPanel.appendChild(searchTitle);

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '検索語';
    searchInput.style.padding = '8px 12px';
    searchInput.style.fontSize = '14px';
    searchInput.style.border = '1px solid rgba(148,163,184,0.6)';
    searchInput.style.borderRadius = '8px';

    const replaceInput = document.createElement('input');
    replaceInput.type = 'text';
    replaceInput.placeholder = '置換文字列';
    replaceInput.style.padding = '8px 12px';
    replaceInput.style.fontSize = '14px';
    replaceInput.style.border = '1px solid rgba(148,163,184,0.6)';
    replaceInput.style.borderRadius = '8px';

    const searchStatus = document.createElement('div');
    searchStatus.style.fontSize = '12px';
    searchStatus.style.color = '#475569';

    const searchBtnRow = document.createElement('div');
    searchBtnRow.style.display = 'flex';
    searchBtnRow.style.gap = '8px';
    searchBtnRow.style.flexWrap = 'wrap';

    function makeActionButton(text, handler){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = text;
      btn.style.padding = '8px 16px';
      btn.style.fontSize = '14px';
      btn.style.borderRadius = '8px';
      btn.style.border = 'none';
      btn.style.background = '#1d4ed8';
      btn.style.color = '#e0f2fe';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', handler);
      return btn;
    }

    const searchNextBtn = makeActionButton('次を検索', () => {
      performSearch(searchInput.value.trim(), false);
    });
    const replaceBtn = makeActionButton('置換', () => {
      performSearch(searchInput.value.trim(), true, replaceInput.value);
    });
    const replaceAllBtn = makeActionButton('すべて置換', () => {
      const count = replaceAll(searchInput.value.trim(), replaceInput.value);
      searchStatus.textContent = count ? `${count} 件置換しました` : '一致はありません';
    });
    const closeSearchBtn = makeActionButton('閉じる', hideSearch);
    closeSearchBtn.style.background = '#64748b';

    searchBtnRow.appendChild(searchNextBtn);
    searchBtnRow.appendChild(replaceBtn);
    searchBtnRow.appendChild(replaceAllBtn);
    searchBtnRow.appendChild(closeSearchBtn);

    searchPanel.appendChild(searchInput);
    searchPanel.appendChild(replaceInput);
    searchPanel.appendChild(searchStatus);
    searchPanel.appendChild(searchBtnRow);
    searchOverlay.appendChild(searchPanel);
    frame.appendChild(searchOverlay);

    frame.appendChild(titleBar);
    frame.appendChild(ribbonArea);
    frame.appendChild(bodyArea);
    frame.appendChild(statusBar);

    root.appendChild(wrapper);
    wrapper.appendChild(frame);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.html,.htm,.txt,.rtf,.wording';
    fileInput.style.display = 'none';
    root.appendChild(fileInput);

    const openBtn = createIconButton('📂', '開く (Ctrl+O)');
    quickBar.insertBefore(openBtn, quickSaveBtn);
    openBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileOpen);

    renameBtn.addEventListener('click', () => {
      const next = prompt('文書名を入力してください', state.title);
      if (next && next.trim()) {
        state.title = next.trim();
        updateTitle();
        schedulePersist();
      }
    });

    editor.addEventListener('input', () => {
      state.contentHTML = editor.innerHTML;
      state.lastEditAt = Date.now();
      schedulePersist();
      updateStatus();
      if (state.reviewHighlight) updateReviewHighlights();
      grantXp('edit', 1, EDIT_COOLDOWN);
    });

    editor.addEventListener('focus', () => {
      page.style.boxShadow = '0 32px 70px rgba(15,23,42,0.28)';
    });
    editor.addEventListener('blur', () => {
      page.style.boxShadow = '0 24px 64px rgba(15,23,42,0.25)';
    });

    bodyArea.addEventListener('scroll', () => {
      if (bodyArea.scrollTop > 24) {
        ruler.style.opacity = '0.3';
      } else {
        ruler.style.opacity = '1';
      }
    });

    document.addEventListener('selectionchange', handleSelectionChange);

    function ensureFocus(){
      if (document.activeElement !== editor) {
        editor.focus({ preventScroll: true });
      }
    }

    function runCommand(cmd, value){
      ensureFocus();
      try {
        let arg = value;
        if (cmd === 'formatBlock' && typeof value === 'string' && !/^</.test(value)) {
          arg = `<${value}>`;
        }
        document.execCommand(cmd, false, arg);
        if (!skipFormatXpCommands.has(cmd)) {
          grantXp('format', 2, FORMAT_COOLDOWN);
        }
      } catch (err) {
        console.warn('Wording command failed', cmd, err);
      }
      state.contentHTML = editor.innerHTML;
      schedulePersist();
      updateTitle();
      updateStatus();
      if (state.reviewHighlight) updateReviewHighlights();
    }

    function applyInlineStyle(style){
      ensureFocus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        const span = document.createElement('span');
        span.setAttribute('style', style);
        span.textContent = '\u200b';
        range.insertNode(span);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      } else {
        const span = document.createElement('span');
        span.setAttribute('style', style);
        span.appendChild(range.extractContents());
        range.insertNode(span);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      }
      state.contentHTML = editor.innerHTML;
      schedulePersist();
      updateTitle();
      updateStatus();
      if (state.reviewHighlight) updateReviewHighlights();
    }

    function changeZoom(delta){
      const next = Math.min(200, Math.max(50, state.zoom + delta));
      state.zoom = next;
      page.style.transformOrigin = 'top center';
      page.style.transform = `scale(${next / 100})`;
      pageViewport.style.paddingBottom = `${Math.max(0, (next - 100) * 2)}px`;
      zoomLabel.textContent = `${state.zoom}%`;
      schedulePersist();
    }

    function setLineHeight(value){
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return;
      const next = Math.min(2.5, Math.max(1, parseFloat(numeric.toFixed(2))));
      state.lineHeight = next;
      editor.style.lineHeight = String(next);
      schedulePersist();
      grantXp('format', 2, FORMAT_COOLDOWN);
    }

    function setPageTint(tint){
      state.pageTint = tint;
      applyPageTint();
      schedulePersist();
      grantXp('format', 2, FORMAT_COOLDOWN);
      if (state.reviewHighlight) updateReviewHighlights();
    }

    function applyPageTint(){
      const isDark = state.theme === 'dark';
      let background = isDark ? '#f1f5f9' : '#ffffff';
      let textColor = isDark ? '#0f172a' : '#111827';
      if (!isDark) {
        if (state.pageTint === 'cream') background = '#fff8e7';
        if (state.pageTint === 'gray') background = '#f1f5f9';
      } else {
        if (state.pageTint === 'cream') background = '#fff3d9';
        if (state.pageTint === 'gray') background = '#e2e8f0';
      }
      page.style.background = background;
      editor.style.color = textColor;
    }

    function updateReviewHighlights(){
      const highlighted = editor.querySelectorAll('[data-review-highlight="1"]');
      highlighted.forEach(node => {
        node.style.background = '';
        node.style.boxShadow = '';
        node.removeAttribute('data-review-highlight');
      });
      if (!state.reviewHighlight) return;
      const color = state.theme === 'dark' ? 'rgba(251,191,36,0.25)' : 'rgba(248,113,113,0.18)';
      const targets = editor.querySelectorAll('p, li, blockquote');
      targets.forEach(node => {
        const text = node.innerText ? node.innerText.replace(/\s+/g, '') : '';
        if (text.length >= 80) {
          node.setAttribute('data-review-highlight', '1');
          node.style.background = color;
          node.style.boxShadow = 'inset 0 0 0 1px rgba(248,113,113,0.45)';
        }
      });
    }

    function updateTheme(){
      const isDark = state.theme === 'dark';
      if (isDark) {
        ribbonArea.style.background = '#1e293b';
        quickBar.style.background = 'rgba(30,41,59,0.88)';
        quickBar.style.color = '#e2e8f0';
        tabBar.style.background = 'rgba(15,23,42,0.65)';
      } else {
        ribbonArea.style.background = '#f8fafc';
        quickBar.style.background = 'rgba(226,232,240,0.7)';
        quickBar.style.color = '#0f172a';
        tabBar.style.background = 'transparent';
      }

      applyPageTint();

      quickBarButtons.forEach(btn => {
        if (isDark) {
          btn.style.background = 'rgba(51,65,85,0.95)';
          btn.style.border = '1px solid rgba(148,163,184,0.55)';
          btn.style.color = '#e2e8f0';
          const span = btn.querySelector('span');
          if (span) span.style.color = '#e2e8f0';
        } else {
          btn.style.background = '#fff';
          btn.style.border = '1px solid rgba(148,163,184,0.4)';
          btn.style.color = '#0f172a';
          const span = btn.querySelector('span');
          if (span) span.style.color = '#1f2937';
        }
      });

      ribbonGroupButtons.forEach(btn => {
        if (isDark) {
          btn.style.background = 'rgba(51,65,85,0.92)';
          btn.style.border = '1px solid rgba(148,163,184,0.55)';
          btn.style.color = '#e2e8f0';
        } else {
          btn.style.background = '#fff';
          btn.style.border = '1px solid rgba(148,163,184,0.5)';
          btn.style.color = '#111827';
        }
      });

      ribbonTabButtons.forEach(btn => {
        btn.style.color = isDark ? '#e2e8f0' : '#1e293b';
      });

      if (state.reviewHighlight) updateReviewHighlights();
    }

    function updateTitle(){
      titleName.textContent = state.title + (state.contentHTML !== state.savedHTML ? '*' : '');
    }

    function updateStatus(){
      const text = editor.innerText || '';
      const charCount = text.replace(/\s+/g, '').length;
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      statusLeft.textContent = `ページ 1 / 1 | 文字数: ${charCount} | 単語: ${wordCount}`;
      zoomLabel.textContent = `${state.zoom}%`;
    }

    function showToast(message){
      if (window && window.showMiniExpBadge) {
        window.showMiniExpBadge(message, { variant: 'info' });
      }
    }

    function grantXp(action, amount, cooldown){
      const now = Date.now();
      if (cooldown) {
        const last = xpCooldowns.get(action) || 0;
        if (now - last < cooldown) return;
        xpCooldowns.set(action, now);
      }
      try {
        awardXp?.(amount, { type: action });
        state.sessionXp += amount;
        if (window && window.showMiniExpBadge) {
          window.showMiniExpBadge(`+${amount}XP (${action})`, { variant: action === 'save' ? 'success' : 'combo', level: Math.min(5, amount) });
        }
      } catch {}
    }

    function schedulePersist(){
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        writePersistentState(state);
      }, 600);
    }

    function flushPersist(){
      if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = null;
      }
      writePersistentState(state);
    }

    function handleFileOpen(){
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '');
        if (/</.test(text)) {
          editor.innerHTML = text;
        } else {
          editor.innerText = text;
        }
        state.contentHTML = editor.innerHTML;
        state.savedHTML = editor.innerHTML;
        state.title = file.name.replace(/\.[^.]+$/, '');
        state.savedTitle = state.title;
        updateTitle();
        updateStatus();
        schedulePersist();
        grantXp('insert', 3, INSERT_COOLDOWN);
      };
      reader.readAsText(file);
      fileInput.value = '';
    }

    function saveDocument(forceRename){
      let name = state.title;
      if (forceRename || !name || name === DEFAULT_TITLE) {
        const entered = prompt('保存するファイル名 (.wording.html)', name || DEFAULT_TITLE);
        if (!entered) return;
        name = entered;
        state.title = entered;
      }
      const blob = new Blob([
        `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><title>${name}</title></head><body>${state.contentHTML}</body></html>`
      ], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${name}.wording.html`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.remove();
      }, 0);
      state.savedHTML = state.contentHTML;
      state.savedTitle = state.title;
      updateTitle();
      schedulePersist();
      grantXp('save', SAVE_BONUS, 0);
    }

    function handleSelectionChange(){
      if (!state.isRunning) return;
      updateStatus();
    }

    function showSearch(){
      searchOverlay.style.display = 'flex';
      searchInput.focus();
      state.searchQuery = '';
      state.searchResults = [];
      searchStatus.textContent = '';
    }

    function hideSearch(){
      searchOverlay.style.display = 'none';
      editor.focus();
    }

    function collectTextNodes(){
      const nodes = [];
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.trim()) nodes.push(node);
      }
      return nodes;
    }

    function performSearch(query, replace, replaceText = ''){
      if (!query) {
        searchStatus.textContent = '検索語を入力してください';
        return;
      }
      if (state.searchQuery !== query) {
        state.searchQuery = query;
        state.searchIndex = -1;
        state.searchResults = buildSearchIndex(query);
      }
      if (!state.searchResults.length) {
        searchStatus.textContent = '一致はありません';
        return;
      }
      state.searchIndex = (state.searchIndex + 1) % state.searchResults.length;
      const { node, start, end } = state.searchResults[state.searchIndex];
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      editor.focus({ preventScroll: false });
      range.startContainer.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (replace) {
        range.deleteContents();
        range.insertNode(document.createTextNode(replaceText));
        state.contentHTML = editor.innerHTML;
        state.searchResults = buildSearchIndex(query);
        grantXp('insert', 3, INSERT_COOLDOWN);
        updateTitle();
      }
      searchStatus.textContent = `${state.searchResults.length} 件中 ${state.searchIndex + 1} 件目`;
      updateStatus();
      schedulePersist();
    }

    function buildSearchIndex(query){
      const lower = query.toLowerCase();
      const results = [];
      const nodes = collectTextNodes();
      nodes.forEach(node => {
        const text = node.nodeValue;
        let idx = text.toLowerCase().indexOf(lower);
        while (idx !== -1) {
          results.push({ node, start: idx, end: idx + query.length });
          idx = text.toLowerCase().indexOf(lower, idx + query.length);
        }
      });
      return results;
    }

    function escapeRegExp(str){
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function replaceAll(query, replaceText){
      if (!query) return 0;
      const results = buildSearchIndex(query);
      if (!results.length) return 0;
      const nodes = collectTextNodes();
      const pattern = new RegExp(escapeRegExp(query), 'gi');
      nodes.forEach(node => {
        node.nodeValue = node.nodeValue.replace(pattern, replaceText);
      });
      state.contentHTML = editor.innerHTML;
      schedulePersist();
      updateStatus();
      updateTitle();
      grantXp('insert', 3, INSERT_COOLDOWN);
      return results.length;
    }

    function handleFileNew(){
      if (state.contentHTML !== state.savedHTML && !confirm('保存されていない変更があります。新規作成しますか？')) return;
      state.title = `文書${Math.floor(Math.random()*999)+1}`;
      editor.innerHTML = '<p>新しい文書を開始しましょう。</p>';
      state.contentHTML = editor.innerHTML;
      state.savedHTML = editor.innerHTML;
      state.savedTitle = state.title;
      updateTitle();
      updateStatus();
      schedulePersist();
      grantXp('insert', 2, INSERT_COOLDOWN);
    }

    function onKeydown(ev){
      if (ev.defaultPrevented) return;
      if (ev.ctrlKey || ev.metaKey) {
        const key = ev.key.toLowerCase();
        switch(key){
          case 's':
            ev.preventDefault();
            saveDocument(ev.shiftKey);
            break;
          case 'o':
            ev.preventDefault();
            fileInput.click();
            break;
          case 'n':
            ev.preventDefault();
            handleFileNew();
            break;
          case 'p':
            ev.preventDefault();
            showToast('印刷ダイアログは近日対応予定です');
            break;
          case 'f':
            ev.preventDefault();
            showSearch();
            break;
          case 'h':
            ev.preventDefault();
            showSearch();
            break;
          case 'b':
            ev.preventDefault();
            runCommand('bold');
            break;
          case 'i':
            ev.preventDefault();
            runCommand('italic');
            break;
          case 'u':
            ev.preventDefault();
            runCommand('underline');
            break;
          case 'l':
            ev.preventDefault();
            runCommand('justifyLeft');
            break;
          case 'e':
            ev.preventDefault();
            runCommand('justifyCenter');
            break;
          case 'r':
            ev.preventDefault();
            runCommand('justifyRight');
            break;
          case 'j':
            ev.preventDefault();
            runCommand('justifyFull');
            break;
          case 'y':
            ev.preventDefault();
            document.execCommand('redo');
            break;
          case 'z':
            ev.preventDefault();
            document.execCommand('undo');
            break;
        }
        if (ev.shiftKey && key === 's') {
          ev.preventDefault();
          saveDocument(true);
        }
        if (ev.altKey && key === '1') {
          ev.preventDefault();
          runCommand('formatBlock', 'h1');
        }
        if (ev.altKey && key === '2') {
          ev.preventDefault();
          runCommand('formatBlock', 'h2');
        }
      }
    }

    function start(){
      if (state.isRunning) return;
      state.isRunning = true;
      if (!shortcutsDisabled) {
        shortcuts?.disableKey('p');
        shortcuts?.disableKey('r');
        shortcutsDisabled = true;
      }
      document.addEventListener('keydown', onKeydown);
      grantXp('launch', LAUNCH_BONUS, 0);
      renderRibbon();
      updateTitle();
      updateTheme();
      changeZoom(0);
      updateStatus();
    }

    function stop(){
      if (!state.isRunning) return;
      state.isRunning = false;
      document.removeEventListener('keydown', onKeydown);
      if (shortcutsDisabled) {
        shortcuts?.enableKey('p');
        shortcuts?.enableKey('r');
        shortcutsDisabled = false;
      }
    }

    function destroy(){
      stop();
      if (shortcutsDisabled) {
        shortcuts?.enableKey('p');
        shortcuts?.enableKey('r');
        shortcutsDisabled = false;
      }
      flushPersist();
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('resize', handleResize);
      wrapper.remove();
      fileInput.remove();
    }

    function quit(){
      destroy();
    }

    function getScore(){
      return Math.max(0, Math.floor(state.sessionXp));
    }

    function renderRibbon(){
      ribbonContent.innerHTML = '';
      tabButtons.forEach((btn, id) => {
        if (id === state.ribbonTab) {
          btn.style.borderBottom = '3px solid #2563eb';
          btn.style.color = '#1e3a8a';
        } else {
          btn.style.borderBottom = '3px solid transparent';
          btn.style.color = '#475569';
        }
      });
      const groups = ribbonRegistry[state.ribbonTab] || [];
      groups.forEach(group => {
        ribbonContent.appendChild(group);
      });
    }

    function handleResize(){
      const width = frame.clientWidth;
      if (width < 720) {
        ribbonContent.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
        page.style.padding = '48px 48px';
      } else {
        ribbonContent.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
        page.style.padding = '64px 120px';
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'wording',
    name: 'Wording',
    description: '編集+1 / 書式+2 / 保存+6 EXP のワープロ',
    category: 'ユーティリティ',
    create
  });
})();
