(function(){
  const STYLE_ID = 'sandbox-sugoroku-style';
  const BOARD_WIDTH = 680;
  const BOARD_HEIGHT = 420;
  const MIN_RATIO_X = 0.02;
  const MAX_RATIO_X = 0.98;
  const MIN_RATIO_Y = 0.05;
  const MAX_RATIO_Y = 0.95;
  const EFFECT_TYPES = [
    { id: 'none', label: '効果なし', color: '#475569', summary: () => 'イベントなし' },
    { id: 'reward', label: 'ボーナス', color: '#22c55e', summary: node => `${Math.abs(Number(node.effectValue) || 0)}G獲得` },
    { id: 'penalty', label: 'ペナルティ', color: '#f97316', summary: node => `${Math.abs(Number(node.effectValue) || 0)}G失う` },
    { id: 'exp', label: 'EXP', color: '#6366f1', summary: node => `${Math.abs(Number(node.effectValue) || 0)}EXP` },
    { id: 'jump', label: 'ワープ', color: '#f472b6', summary: node => node.jumpTargetId ? `→ ${node.jumpTargetId}` : '行き先未設定' },
    { id: 'message', label: 'メッセージ', color: '#eab308', summary: node => node.message ? node.message.slice(0, 10) + (node.message.length > 10 ? '…' : '') : '自由入力' },
  ];

  function ensureStyles(){
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sandbox-sugoroku-wrapper{display:flex;flex-direction:column;gap:16px;color:#e2e8f0;font-family:"Segoe UI","Hiragino Sans","BIZ UDPGothic",sans-serif;background:linear-gradient(160deg,#020617,#0f172a);padding:18px 22px;border-radius:20px;box-shadow:0 20px 40px rgba(2,6,23,0.75);}
      .sandbox-sugoroku-header{display:flex;flex-direction:column;gap:6px;}
      .sandbox-sugoroku-header h2{margin:0;font-size:22px;font-weight:600;}
      .sandbox-sugoroku-header p{margin:0;color:rgba(226,232,240,0.82);font-size:14px;}
      .sandbox-sugoroku-panels{display:grid;grid-template-columns:1fr;gap:18px;}
      @media(min-width:1080px){.sandbox-sugoroku-panels{grid-template-columns:minmax(360px,1fr) 320px;}}
      .sandbox-sugoroku-board{position:relative;width:100%;max-width:${BOARD_WIDTH}px;height:${BOARD_HEIGHT}px;background:radial-gradient(circle at 20% 20%,rgba(56,189,248,0.2),transparent 60%),#0f172a;border-radius:22px;border:1px solid rgba(148,163,184,0.3);box-shadow:inset 0 0 24px rgba(2,6,23,0.9);overflow:hidden;margin:0 auto;}
      .sandbox-sugoroku-board svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}
      .sandbox-sugoroku-node{position:absolute;transform:translate(-50%,-50%);width:90px;padding:8px 10px;border-radius:14px;border:2px solid rgba(148,163,184,0.4);background:rgba(15,23,42,0.85);color:#f8fafc;text-align:left;cursor:pointer;transition:transform 0.15s ease,box-shadow 0.2s ease,border-color 0.2s ease;}
      .sandbox-sugoroku-node strong{display:block;font-size:14px;margin-bottom:4px;}
      .sandbox-sugoroku-node span{display:block;font-size:12px;color:rgba(226,232,240,0.85);}
      .sandbox-sugoroku-node.selected{box-shadow:0 0 0 3px rgba(96,165,250,0.6);}
      .sandbox-sugoroku-node.start{border-color:#38bdf8;}
      .sandbox-sugoroku-node.play-active{box-shadow:0 0 0 3px rgba(34,197,94,0.8);}
      .sandbox-sugoroku-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}
      .sandbox-sugoroku-toolbar button,.sandbox-sugoroku-toolbar label{border-radius:999px;border:1px solid rgba(148,163,184,0.4);background:rgba(15,23,42,0.6);color:#e2e8f0;padding:6px 14px;font-size:13px;cursor:pointer;}
      .sandbox-sugoroku-toolbar button.active{background:rgba(37,99,235,0.8);border-color:rgba(59,130,246,0.9);}
      .sandbox-sugoroku-inspector{background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.3);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:12px;}
      .sandbox-sugoroku-inspector h3{margin:0;font-size:16px;}
      .sandbox-sugoroku-inspector label{display:flex;flex-direction:column;font-size:12px;gap:4px;color:rgba(226,232,240,0.9);}
      .sandbox-sugoroku-inspector input,.sandbox-sugoroku-inspector select,.sandbox-sugoroku-inspector textarea{border-radius:10px;border:1px solid rgba(148,163,184,0.4);background:rgba(2,6,23,0.6);color:#f8fafc;padding:6px 8px;font-size:13px;font-family:inherit;}
      .sandbox-sugoroku-inspector textarea{min-height:60px;}
      .sandbox-sugoroku-inspector .connections{display:flex;flex-wrap:wrap;gap:6px;}
      .sandbox-sugoroku-tag{display:inline-flex;align-items:center;gap:4px;background:rgba(59,130,246,0.18);border:1px solid rgba(59,130,246,0.5);border-radius:999px;padding:4px 8px;font-size:12px;}
      .sandbox-sugoroku-tag button{border:none;background:none;color:inherit;cursor:pointer;padding:0;font-size:12px;}
      .sandbox-sugoroku-panel{background:rgba(15,23,42,0.65);border:1px solid rgba(148,163,184,0.25);border-radius:20px;padding:16px;}
      .sandbox-sugoroku-panel h3{margin:0 0 8px;font-size:16px;}
      .sandbox-sugoroku-log{max-height:220px;overflow:auto;border-radius:14px;border:1px solid rgba(148,163,184,0.25);padding:10px;font-size:13px;background:rgba(2,6,23,0.4);}
      .sandbox-sugoroku-log p{margin:0 0 6px;}
      .sandbox-sugoroku-branch{display:flex;flex-direction:column;gap:8px;margin-top:8px;}
      .sandbox-sugoroku-branch button{padding:6px 10px;border-radius:10px;border:1px solid rgba(148,163,184,0.4);background:rgba(2,6,23,0.5);color:#f8fafc;cursor:pointer;text-align:left;}
      .sandbox-sugoroku-import{display:flex;flex-direction:column;gap:8px;}
      .sandbox-sugoroku-import textarea{min-height:120px;}
    `;
    document.head.appendChild(style);
  }

  function cloneBoard(board){
    return {
      nodes: board.nodes.map(node => ({ ...node })),
      edges: board.edges.map(edge => ({ ...edge })),
      startNodeId: board.startNodeId,
      diceSides: board.diceSides
    };
  }

  function createDefaultBoard(){
    const nodes = [
      { id: 'node-1', name: 'スタート', x: 0.1, y: 0.5, effectType: 'none', effectValue: 0, jumpTargetId: '', message: '', note: '開始地点' },
      { id: 'node-2', name: 'チャンス', x: 0.35, y: 0.25, effectType: 'reward', effectValue: 250, jumpTargetId: '', message: '臨時収入', note: '' },
      { id: 'node-3', name: 'トラブル', x: 0.6, y: 0.45, effectType: 'penalty', effectValue: 180, jumpTargetId: '', message: '', note: '' },
      { id: 'node-4', name: 'ワープ', x: 0.38, y: 0.75, effectType: 'jump', effectValue: 0, jumpTargetId: 'node-2', message: '', note: '' },
      { id: 'node-5', name: 'ゴール', x: 0.85, y: 0.5, effectType: 'exp', effectValue: 80, jumpTargetId: '', message: 'おめでとう!', note: '' }
    ];
    const edges = [
      { id: 'edge-1', from: 'node-1', to: 'node-2' },
      { id: 'edge-2', from: 'node-2', to: 'node-3' },
      { id: 'edge-3', from: 'node-3', to: 'node-5' },
      { id: 'edge-4', from: 'node-1', to: 'node-4' },
      { id: 'edge-5', from: 'node-4', to: 'node-3' }
    ];
    return { nodes, edges, startNodeId: 'node-1', diceSides: 6 };
  }

  function clamp(value, min, max){
    return Math.min(max, Math.max(min, value));
  }

  function sanitizeRatio(value, min, max, fallback){
    if (!Number.isFinite(value)) return fallback;
    return clamp(value, min, max);
  }

  function formatNumber(value){
    try {
      return new Intl.NumberFormat('ja-JP').format(value);
    } catch {
      return String(value);
    }
  }

  function create(root, awardXp, opts){
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'sandbox_sugoroku', textKeyPrefix: 'games.sandboxSugoroku' })
      : null);

    const text = (key, fallback, params) => {
      if (key && localization && typeof localization.t === 'function'){
        try {
          const localized = localization.t(key, fallback, params);
          if (localized != null) return localized;
        } catch (error){
          console.warn('[sandbox_sugoroku] translate failed', key, error);
        }
      }
      if (typeof fallback === 'function') return fallback(params || {});
      return fallback ?? '';
    };

    ensureStyles();

    const wrapper = document.createElement('div');
    wrapper.className = 'sandbox-sugoroku-wrapper';

    const header = document.createElement('div');
    header.className = 'sandbox-sugoroku-header';
    const title = document.createElement('h2');
    title.textContent = text('.title', 'サンドボックスすごろく');
    const desc = document.createElement('p');
    desc.textContent = text('.description', 'ノードを置いて接続し、オリジナルの盤面を作成。インポート/エクスポートや即プレイテストに対応。');
    header.appendChild(title);
    header.appendChild(desc);
    wrapper.appendChild(header);

    const toolbar = document.createElement('div');
    toolbar.className = 'sandbox-sugoroku-toolbar';
    const addLinkBtn = document.createElement('button');
    addLinkBtn.textContent = 'リンクモード';
    const bidirectionalToggle = document.createElement('label');
    const bidiInput = document.createElement('input');
    bidiInput.type = 'checkbox';
    bidiInput.checked = true;
    bidiInput.style.marginRight = '4px';
    bidirectionalToggle.appendChild(bidiInput);
    bidirectionalToggle.appendChild(document.createTextNode('双方向リンク'));
    toolbar.appendChild(addLinkBtn);
    toolbar.appendChild(bidirectionalToggle);

    const diceLabel = document.createElement('label');
    diceLabel.textContent = 'サイコロ面';
    const diceInput = document.createElement('input');
    diceInput.type = 'number';
    diceInput.min = '2';
    diceInput.max = '20';
    diceInput.value = '6';
    diceInput.style.width = '70px';
    diceInput.addEventListener('input', () => {
      const value = Math.round(Number(diceInput.value) || 6);
      board.diceSides = clamp(value, 2, 20);
      diceInput.value = String(board.diceSides);
      exportBoard();
    });
    diceLabel.appendChild(diceInput);
    toolbar.appendChild(diceLabel);
    wrapper.appendChild(toolbar);

    const panels = document.createElement('div');
    panels.className = 'sandbox-sugoroku-panels';
    wrapper.appendChild(panels);

    const leftPanel = document.createElement('div');
    leftPanel.style.display = 'flex';
    leftPanel.style.flexDirection = 'column';
    leftPanel.style.gap = '16px';
    panels.appendChild(leftPanel);

    const editorBoardContainer = document.createElement('div');
    leftPanel.appendChild(editorBoardContainer);

    const playPanel = document.createElement('div');
    playPanel.className = 'sandbox-sugoroku-panel';
    leftPanel.appendChild(playPanel);

    const sidePanel = document.createElement('div');
    sidePanel.style.display = 'flex';
    sidePanel.style.flexDirection = 'column';
    sidePanel.style.gap = '16px';
    panels.appendChild(sidePanel);

    const inspector = document.createElement('div');
    inspector.className = 'sandbox-sugoroku-inspector';
    sidePanel.appendChild(inspector);

    const importPanel = document.createElement('div');
    importPanel.className = 'sandbox-sugoroku-panel sandbox-sugoroku-import';
    sidePanel.appendChild(importPanel);

    const exportTextarea = document.createElement('textarea');
    const importBtn = document.createElement('button');
    importBtn.textContent = 'インポート';
    importBtn.style.alignSelf = 'flex-end';
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'エクスポートを更新';
    exportBtn.style.alignSelf = 'flex-end';
    importPanel.appendChild(document.createElement('h3')).textContent = 'インポート / エクスポート';
    importPanel.appendChild(exportTextarea);
    importPanel.appendChild(exportBtn);
    importPanel.appendChild(importBtn);

    const playBoardContainer = document.createElement('div');
    playPanel.appendChild(playBoardContainer);

    const playControls = document.createElement('div');
    playControls.style.display = 'grid';
    playControls.style.gridTemplateColumns = 'repeat(auto-fit,minmax(120px,1fr))';
    playControls.style.gap = '10px';
    playControls.style.marginTop = '10px';
    playPanel.appendChild(playControls);

    const rollBtn = document.createElement('button');
    rollBtn.textContent = 'サイコロを振る';
    rollBtn.style.padding = '10px 12px';
    rollBtn.style.borderRadius = '12px';
    rollBtn.style.border = 'none';
    rollBtn.style.background = 'linear-gradient(135deg,#0ea5e9,#6366f1)';
    rollBtn.style.color = '#f8fafc';
    rollBtn.style.cursor = 'pointer';
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'リセット';
    resetBtn.style.borderRadius = '12px';
    resetBtn.style.border = '1px solid rgba(148,163,184,0.4)';
    resetBtn.style.background = 'rgba(2,6,23,0.45)';
    resetBtn.style.color = '#f8fafc';
    playControls.appendChild(rollBtn);
    playControls.appendChild(resetBtn);

    const playInfo = document.createElement('div');
    playInfo.style.display = 'grid';
    playInfo.style.gridTemplateColumns = 'repeat(auto-fit,minmax(140px,1fr))';
    playInfo.style.gap = '10px';
    playInfo.style.marginTop = '10px';
    playPanel.appendChild(playInfo);

    const branchPanel = document.createElement('div');
    branchPanel.className = 'sandbox-sugoroku-branch';
    playPanel.appendChild(branchPanel);

    const logPanel = document.createElement('div');
    logPanel.className = 'sandbox-sugoroku-log';
    playPanel.appendChild(logPanel);

    let board = createDefaultBoard();
    let selectedNodeId = board.startNodeId;
    let linkMode = false;
    let pendingLinkFrom = null;
    let nextNodeIndex = 6;

    const playState = {
      currentNodeId: board.startNodeId,
      money: 0,
      turns: 0,
      lastRoll: null,
      awaitingChoice: null,
      pendingSteps: 0,
      log: []
    };

    function getNode(id){
      return board.nodes.find(node => node.id === id) || null;
    }

    function getOutgoing(id){
      return board.edges.filter(edge => edge.from === id);
    }

    function addNodeAt(xRatio, yRatio){
      const id = `node-${nextNodeIndex++}`;
      const node = { id, name: `ノード${nextNodeIndex - 1}`, x: xRatio, y: yRatio, effectType: 'none', effectValue: 0, jumpTargetId: '', message: '', note: '' };
      board.nodes.push(node);
      if (!board.startNodeId) board.startNodeId = id;
      selectedNodeId = id;
      refreshAll();
    }

    function removeNode(nodeId){
      board.nodes = board.nodes.filter(node => node.id !== nodeId);
      board.edges = board.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);
      if (board.startNodeId === nodeId){
        board.startNodeId = board.nodes[0]?.id || '';
      }
      if (selectedNodeId === nodeId){
        selectedNodeId = board.nodes[0]?.id || '';
      }
      if (playState.currentNodeId === nodeId){
        playState.currentNodeId = board.startNodeId;
      }
      refreshAll();
    }

    function addEdge(fromId, toId){
      if (!fromId || !toId || fromId === toId) return;
      const exists = board.edges.some(edge => edge.from === fromId && edge.to === toId);
      if (exists) return;
      board.edges.push({ id: `edge-${Date.now()}-${Math.random().toString(16).slice(2)}`, from: fromId, to: toId });
      refreshAll();
    }

    function removeEdge(edgeId){
      board.edges = board.edges.filter(edge => edge.id !== edgeId);
      refreshAll();
    }

    function selectNode(nodeId){
      selectedNodeId = nodeId;
      pendingLinkFrom = null;
      refreshInspector();
      renderEditorBoard();
    }

    function handleBoardClick(event){
      if (!event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      addNodeAt(clamp(x, MIN_RATIO_X, MAX_RATIO_X), clamp(y, MIN_RATIO_Y, MAX_RATIO_Y));
    }

    function renderBoard(container, options){
      container.innerHTML = '';
      const boardEl = document.createElement('div');
      boardEl.className = 'sandbox-sugoroku-board';
      container.appendChild(boardEl);

      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      boardEl.appendChild(svg);

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      const markerId = options.editable ? 'sandbox-sugoroku-arrow-editor' : 'sandbox-sugoroku-arrow-play';
      marker.id = markerId;
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '10');
      marker.setAttribute('refX', '6');
      marker.setAttribute('refY', '3');
      marker.setAttribute('orient', 'auto');
      const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrowPath.setAttribute('d', 'M0,0 L0,6 L6,3 z');
      arrowPath.setAttribute('fill', 'rgba(148,163,184,0.6)');
      marker.appendChild(arrowPath);
      defs.appendChild(marker);
      svg.appendChild(defs);

      const rect = boardEl.getBoundingClientRect();
      const width = rect.width || BOARD_WIDTH;
      const height = rect.height || BOARD_HEIGHT;

      board.edges.forEach(edge => {
        const from = getNode(edge.from);
        const to = getNode(edge.to);
        if (!from || !to) return;
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.dataset.from = edge.from;
        line.dataset.to = edge.to;
        line.setAttribute('x1', (from.x * width).toString());
        line.setAttribute('y1', (from.y * height).toString());
        line.setAttribute('x2', (to.x * width).toString());
        line.setAttribute('y2', (to.y * height).toString());
        line.setAttribute('stroke', 'rgba(148,163,184,0.6)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', `url(#${markerId})`);
        svg.appendChild(line);
      });

      board.nodes.forEach(node => {
        const nodeEl = document.createElement('button');
        nodeEl.type = 'button';
        nodeEl.className = 'sandbox-sugoroku-node';
        nodeEl.style.left = `${node.x * width}px`;
        nodeEl.style.top = `${node.y * height}px`;
        const effect = EFFECT_TYPES.find(type => type.id === node.effectType) || EFFECT_TYPES[0];
        nodeEl.style.borderColor = effect.color;
        nodeEl.style.background = `linear-gradient(135deg, ${effect.color}33, rgba(15,23,42,0.85))`;
        if (node.id === board.startNodeId) nodeEl.classList.add('start');
        if (node.id === selectedNodeId && options.editable) nodeEl.classList.add('selected');
        if (!options.editable && node.id === playState.currentNodeId) nodeEl.classList.add('play-active');
        const label = document.createElement('strong');
        label.textContent = node.name || node.id;
        const summary = document.createElement('span');
        summary.textContent = effect.summary(node);
        nodeEl.appendChild(label);
        nodeEl.appendChild(summary);
        nodeEl.addEventListener('click', event => {
          event.stopPropagation();
          if (options.editable){
            if (linkMode){
              if (!pendingLinkFrom){
                pendingLinkFrom = node.id;
                addLinkBtn.textContent = 'リンク先を選択';
              } else if (pendingLinkFrom === node.id){
                pendingLinkFrom = null;
                addLinkBtn.textContent = 'リンクモード';
              } else {
                addEdge(pendingLinkFrom, node.id);
                if (bidiInput.checked) addEdge(node.id, pendingLinkFrom);
                pendingLinkFrom = null;
                linkMode = false;
                addLinkBtn.classList.remove('active');
                addLinkBtn.textContent = 'リンクモード';
              }
            } else {
              selectNode(node.id);
            }
          } else if (playState.awaitingChoice){
            handleBranchChoice(node.id);
          }
        });
        if (options.editable){
          nodeEl.addEventListener('pointerdown', event => {
            if (linkMode) return;
            nodeEl.setPointerCapture(event.pointerId);
            const startX = node.x;
            const startY = node.y;
            const originX = event.clientX;
            const originY = event.clientY;
            function updateLines(){
              const currentX = node.x * width;
              const currentY = node.y * height;
              svg.querySelectorAll(`line[data-from="${node.id}"]`).forEach(line => {
                line.setAttribute('x1', currentX.toString());
                line.setAttribute('y1', currentY.toString());
              });
              svg.querySelectorAll(`line[data-to="${node.id}"]`).forEach(line => {
                line.setAttribute('x2', currentX.toString());
                line.setAttribute('y2', currentY.toString());
              });
            }
            function move(ev){
              const dx = (ev.clientX - originX) / width;
              const dy = (ev.clientY - originY) / height;
              node.x = clamp(startX + dx, MIN_RATIO_X, MAX_RATIO_X);
              node.y = clamp(startY + dy, MIN_RATIO_Y, MAX_RATIO_Y);
              nodeEl.style.left = `${node.x * width}px`;
              nodeEl.style.top = `${node.y * height}px`;
              updateLines();
              renderPlayBoard();
            }
            function up(ev){
              nodeEl.releasePointerCapture(ev.pointerId);
              nodeEl.removeEventListener('pointermove', move);
              nodeEl.removeEventListener('pointerup', up);
              renderEditorBoard();
              renderPlayBoard();
              exportBoard();
            }
            nodeEl.addEventListener('pointermove', move);
            nodeEl.addEventListener('pointerup', up);
          });
        }
        boardEl.appendChild(nodeEl);
      });

      if (options.editable){
        boardEl.addEventListener('click', event => {
          if (event.target.closest('.sandbox-sugoroku-node')) return;
          handleBoardClick(event);
        });
      }
    }

    function renderEditorBoard(){
      renderBoard(editorBoardContainer, { editable: true });
    }

    function renderPlayBoard(){
      renderBoard(playBoardContainer, { editable: false });
    }

    function refreshInspector(){
      inspector.innerHTML = '';
      const title = document.createElement('h3');
      title.textContent = 'ノード詳細';
      inspector.appendChild(title);

      const node = getNode(selectedNodeId);
      if (!node){
        const empty = document.createElement('p');
        empty.textContent = 'ノードを選択してください';
        inspector.appendChild(empty);
        return;
      }

      const nameField = document.createElement('label');
      nameField.textContent = 'ラベル';
      const nameInput = document.createElement('input');
      nameInput.value = node.name;
      nameInput.addEventListener('input', () => {
        node.name = nameInput.value;
        renderEditorBoard();
        renderPlayBoard();
        exportBoard();
      });
      nameField.appendChild(nameInput);
      inspector.appendChild(nameField);

      const typeField = document.createElement('label');
      typeField.textContent = '効果タイプ';
      const typeSelect = document.createElement('select');
      EFFECT_TYPES.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.label;
        if (node.effectType === type.id) option.selected = true;
        typeSelect.appendChild(option);
      });
      typeSelect.addEventListener('change', () => {
        node.effectType = typeSelect.value;
        renderEditorBoard();
        renderPlayBoard();
        refreshInspector();
        exportBoard();
      });
      typeField.appendChild(typeSelect);
      inspector.appendChild(typeField);

      if (node.effectType === 'reward' || node.effectType === 'penalty' || node.effectType === 'exp'){
        const valueField = document.createElement('label');
        valueField.textContent = node.effectType === 'exp' ? 'EXP量' : '金額';
        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.value = node.effectValue;
        valueInput.addEventListener('input', () => {
          node.effectValue = Number(valueInput.value) || 0;
          renderEditorBoard();
          renderPlayBoard();
          exportBoard();
        });
        valueField.appendChild(valueInput);
        inspector.appendChild(valueField);
      }

      if (node.effectType === 'jump'){
        const jumpField = document.createElement('label');
        jumpField.textContent = 'ワープ先';
        const jumpSelect = document.createElement('select');
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '未設定';
        jumpSelect.appendChild(emptyOption);
        board.nodes.forEach(target => {
          const option = document.createElement('option');
          option.value = target.id;
          option.textContent = target.name || target.id;
          if (node.jumpTargetId === target.id) option.selected = true;
          jumpSelect.appendChild(option);
        });
        jumpSelect.addEventListener('change', () => {
          node.jumpTargetId = jumpSelect.value;
          exportBoard();
        });
        jumpField.appendChild(jumpSelect);
        inspector.appendChild(jumpField);
      }

      if (node.effectType === 'message' || node.message){
        const messageField = document.createElement('label');
        messageField.textContent = 'メッセージ';
        const messageInput = document.createElement('textarea');
        messageInput.value = node.message || '';
        messageInput.addEventListener('input', () => {
          node.message = messageInput.value;
          exportBoard();
        });
        messageField.appendChild(messageInput);
        inspector.appendChild(messageField);
      }

      const noteField = document.createElement('label');
      noteField.textContent = 'メモ/補足';
      const noteInput = document.createElement('textarea');
      noteInput.value = node.note || '';
      noteInput.addEventListener('input', () => {
        node.note = noteInput.value;
        exportBoard();
      });
      noteField.appendChild(noteInput);
      inspector.appendChild(noteField);

      const startField = document.createElement('label');
      startField.textContent = '開始ノード';
      const startToggle = document.createElement('button');
      startToggle.textContent = node.id === board.startNodeId ? '開始地点に設定済み' : '開始地点にする';
      startToggle.style.borderRadius = '10px';
      startToggle.style.border = '1px solid rgba(148,163,184,0.4)';
      startToggle.style.background = node.id === board.startNodeId ? 'rgba(34,197,94,0.25)' : 'rgba(2,6,23,0.45)';
      startToggle.style.color = '#f8fafc';
      startToggle.style.padding = '6px 8px';
      startToggle.addEventListener('click', () => {
        board.startNodeId = node.id;
        playState.currentNodeId = node.id;
        renderEditorBoard();
        renderPlayBoard();
        refreshPlayInfo();
        exportBoard();
      });
      startField.appendChild(startToggle);
      inspector.appendChild(startField);

      const connectionsTitle = document.createElement('h3');
      connectionsTitle.textContent = '接続';
      inspector.appendChild(connectionsTitle);

      const connectionsContainer = document.createElement('div');
      connectionsContainer.className = 'connections';
      getOutgoing(node.id).forEach(edge => {
        const tag = document.createElement('span');
        tag.className = 'sandbox-sugoroku-tag';
        const target = getNode(edge.to);
        tag.textContent = target ? target.name : edge.to;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => removeEdge(edge.id));
        tag.appendChild(removeBtn);
        connectionsContainer.appendChild(tag);
      });
      inspector.appendChild(connectionsContainer);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'ノードを削除';
      deleteBtn.style.marginTop = '10px';
      deleteBtn.style.borderRadius = '12px';
      deleteBtn.style.border = '1px solid rgba(248,113,113,0.6)';
      deleteBtn.style.background = 'rgba(248,113,113,0.12)';
      deleteBtn.style.color = '#fecaca';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.addEventListener('click', () => { if (confirm('このノードを削除しますか？')) removeNode(node.id); });
      inspector.appendChild(deleteBtn);
    }

    function refreshPlayInfo(){
      playInfo.innerHTML = '';
      const items = [
        { label: '現在地', value: getNode(playState.currentNodeId)?.name || '-' },
        { label: '資金', value: `${formatNumber(playState.money)}G` },
        { label: 'ターン', value: `${formatNumber(playState.turns)}` },
        { label: '直近の出目', value: playState.lastRoll ? `${playState.lastRoll}` : '-' },
      ];
      items.forEach(item => {
        const box = document.createElement('div');
        box.style.background = 'rgba(2,6,23,0.4)';
        box.style.padding = '10px 12px';
        box.style.borderRadius = '12px';
        box.style.border = '1px solid rgba(148,163,184,0.3)';
        const label = document.createElement('div');
        label.style.fontSize = '11px';
        label.style.color = 'rgba(226,232,240,0.65)';
        label.textContent = item.label;
        const value = document.createElement('strong');
        value.style.fontSize = '18px';
        value.textContent = item.value;
        box.appendChild(label);
        box.appendChild(value);
        playInfo.appendChild(box);
      });
    }

    function pushLog(message){
      playState.log.unshift(`${new Date().toLocaleTimeString()} ${message}`);
      playState.log = playState.log.slice(0, 24);
      logPanel.innerHTML = '';
      playState.log.forEach(entry => {
        const p = document.createElement('p');
        p.textContent = entry;
        logPanel.appendChild(p);
      });
    }

    function resetPlay(){
      playState.currentNodeId = board.startNodeId || board.nodes[0]?.id || '';
      playState.money = 0;
      playState.turns = 0;
      playState.lastRoll = null;
      playState.pendingSteps = 0;
      playState.awaitingChoice = null;
      playState.log = [];
      branchPanel.innerHTML = '';
      pushLog('プレイをリセットしました');
      refreshPlayInfo();
      renderPlayBoard();
    }

    function handleBranchChoice(targetId){
      if (!playState.awaitingChoice) return;
      const candidates = playState.awaitingChoice;
      if (!candidates.includes(targetId)) return;
      playState.awaitingChoice = null;
      branchPanel.innerHTML = '';
      moveTo(targetId);
    }

    function moveTo(nodeId){
      playState.currentNodeId = nodeId;
      renderPlayBoard();
      if (playState.pendingSteps > 0){
        playState.pendingSteps -= 1;
        continueMovement();
      } else {
        resolveNodeEffect();
      }
    }

    function continueMovement(){
      if (playState.pendingSteps <= 0){
        branchPanel.innerHTML = '';
        resolveNodeEffect();
        return;
      }
      const options = getOutgoing(playState.currentNodeId);
      if (options.length === 0){
        pushLog('進める先がありません。');
        playState.pendingSteps = 0;
        branchPanel.innerHTML = '';
        resolveNodeEffect();
        return;
      }
      if (options.length === 1){
        moveTo(options[0].to);
        return;
      }
      playState.awaitingChoice = options.map(edge => edge.to);
      branchPanel.innerHTML = '';
      const info = document.createElement('p');
      info.textContent = '進む先を選択';
      branchPanel.appendChild(info);
      playState.awaitingChoice.forEach(targetId => {
        const node = getNode(targetId);
        const button = document.createElement('button');
        button.textContent = node ? node.name : targetId;
        button.addEventListener('click', () => handleBranchChoice(targetId));
        branchPanel.appendChild(button);
      });
    }

    function resolveNodeEffect(){
      const node = getNode(playState.currentNodeId);
      if (!node) return;
      let logMessage = `${node.name || node.id} に到着`;
      const value = Number(node.effectValue) || 0;
      switch(node.effectType){
        case 'reward':
          {
            const gain = Math.abs(value);
            playState.money += gain;
            awardXp?.(Math.max(1, Math.round(gain / 40) || 1), { type: 'reward' });
            logMessage += ` / ${formatNumber(gain)}G獲得`;
          }
          break;
        case 'penalty':
          playState.money -= Math.abs(value);
          awardXp?.(1, { type: 'penalty' });
          logMessage += ` / ${formatNumber(Math.abs(value))}G失う`;
          break;
        case 'exp':
          {
            const expGain = Math.abs(value);
            awardXp?.(Math.max(1, expGain), { type: 'exp' });
            logMessage += ` / ${formatNumber(expGain)}EXP`;
          }
          break;
        case 'jump':
          if (node.jumpTargetId){
            logMessage += ' / ワープ発動';
            pushLog(logMessage);
            moveTo(node.jumpTargetId);
            refreshPlayInfo();
            return;
          }
          break;
        case 'message':
          if (node.message){
            logMessage += ` / ${node.message}`;
          }
          break;
        default:
          break;
      }
      if (node.message && node.effectType !== 'message'){
        logMessage += ` / ${node.message}`;
      }
      pushLog(logMessage);
      refreshPlayInfo();
    }

    function rollDice(){
      if (!board.startNodeId || !getNode(board.startNodeId)){
        alert('開始地点を設定してください');
        return;
      }
      const sides = Math.max(2, Number(board.diceSides) || 6);
      const roll = 1 + Math.floor(Math.random() * sides);
      playState.lastRoll = roll;
      playState.turns += 1;
      playState.pendingSteps = roll;
      pushLog(`サイコロ: ${roll}`);
      continueMovement();
      refreshPlayInfo();
    }

    function exportBoard(){
      const data = JSON.stringify(board, null, 2);
      exportTextarea.value = data;
    }

    function importBoardFromTextarea(){
      try {
        const data = JSON.parse(exportTextarea.value);
        if (!Array.isArray(data?.nodes) || !Array.isArray(data?.edges)){
          alert('形式が不正です');
          return;
        }
        board = cloneBoard({
          nodes: data.nodes.map(node => ({
            id: String(node.id || ''),
            name: node.name || '',
            x: sanitizeRatio(Number(node.x), MIN_RATIO_X, MAX_RATIO_X, 0.5),
            y: sanitizeRatio(Number(node.y), MIN_RATIO_Y, MAX_RATIO_Y, 0.5),
            effectType: EFFECT_TYPES.some(type => type.id === node.effectType) ? node.effectType : 'none',
            effectValue: Number(node.effectValue) || 0,
            jumpTargetId: node.jumpTargetId || '',
            message: node.message || '',
            note: node.note || ''
          })),
          edges: data.edges.map(edge => ({ id: edge.id || `edge-${Math.random()}`, from: String(edge.from), to: String(edge.to) })),
          startNodeId: data.startNodeId || data.nodes?.[0]?.id || '',
          diceSides: clamp(Math.round(Number(data.diceSides) || 6), 2, 20)
        });
        nextNodeIndex = board.nodes.reduce((max, node) => {
          const match = /node-(\d+)/.exec(node.id);
          if (!match) return max;
          return Math.max(max, Number(match[1]) + 1);
        }, board.nodes.length + 1);
        selectedNodeId = board.startNodeId;
        resetPlay();
        refreshAll();
      } catch (error){
        alert('JSONの読み込みに失敗しました');
        console.error(error);
      }
    }

    addLinkBtn.addEventListener('click', () => {
      linkMode = !linkMode;
      if (!linkMode){
        pendingLinkFrom = null;
        addLinkBtn.textContent = 'リンクモード';
      } else {
        addLinkBtn.textContent = '開始ノードを選択';
      }
      addLinkBtn.classList.toggle('active', linkMode);
    });

    rollBtn.addEventListener('click', () => {
      if (playState.pendingSteps > 0 || playState.awaitingChoice){
        alert('現在の移動が完了していません');
        return;
      }
      rollDice();
    });
    resetBtn.addEventListener('click', resetPlay);
    exportBtn.addEventListener('click', exportBoard);
    importBtn.addEventListener('click', importBoardFromTextarea);

    resetPlay();
    refreshAll();

    root.appendChild(wrapper);

    function refreshAll(){
      if (playState.currentNodeId && !getNode(playState.currentNodeId)){
        playState.currentNodeId = board.startNodeId || board.nodes[0]?.id || '';
      }
      diceInput.value = String(board.diceSides);
      renderEditorBoard();
      renderPlayBoard();
      refreshInspector();
      refreshPlayInfo();
      exportBoard();
    }
  }

  if (typeof window !== 'undefined' && window.registerMiniGame){
    window.registerMiniGame({
      id: 'sandbox_sugoroku',
      name: 'サンドボックスすごろく',
      nameKey: 'selection.miniexp.games.sandbox_sugoroku.name',
      description: 'ノードと効果を自由に編集できる人生すごろく派生MOD',
      descriptionKey: 'selection.miniexp.games.sandbox_sugoroku.description',
      categoryIds: ['board'],
      create
    });
  }
})();
