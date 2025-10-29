(function(){
  /**
   * MiniExp MOD: Sandbox Sokoban
   * - Stage editor with seamless switch to playtest
   * - Import / export JSON based stages
   * - +25 EXP each time a crate is newly slotted onto a goal
   * - +100 EXP when all crates are on goals (stage clear)
   */
  function create(root, awardXp, opts){
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'sandbox_sokoban' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        try { return localization.t(key, fallback, params); } catch {}
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };

    const wrapper = document.createElement('div');
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '960px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '16px 20px 24px';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    wrapper.style.color = '#e2e8f0';
    wrapper.style.background = 'linear-gradient(145deg, #0f172a 0%, #020617 100%)';
    wrapper.style.borderRadius = '18px';
    wrapper.style.boxShadow = '0 18px 40px rgba(2,6,23,0.65)';

    const heading = document.createElement('div');
    heading.style.display = 'flex';
    heading.style.alignItems = 'baseline';
    heading.style.justifyContent = 'space-between';
    heading.style.gap = '12px';

    const title = document.createElement('h2');
    title.textContent = text('.title', 'サンドボックス倉庫番');
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.fontWeight = '600';

    const modeBar = document.createElement('div');
    modeBar.style.display = 'inline-flex';
    modeBar.style.background = 'rgba(15,23,42,0.6)';
    modeBar.style.border = '1px solid rgba(148,163,184,0.25)';
    modeBar.style.borderRadius = '999px';
    modeBar.style.padding = '4px';
    modeBar.style.gap = '4px';

    heading.appendChild(title);
    heading.appendChild(modeBar);
    wrapper.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = text('.description', '編集とプレイを行き来しながら、自分だけの倉庫番ステージを作成できます。木箱をはめると25EXP、完全クリアで100EXP獲得。');
    description.style.margin = '8px 0 16px';
    description.style.fontSize = '14px';
    description.style.opacity = '0.9';
    wrapper.appendChild(description);

    const statusBar = document.createElement('div');
    statusBar.style.minHeight = '22px';
    statusBar.style.fontSize = '13px';
    statusBar.style.marginBottom = '14px';
    statusBar.style.padding = '6px 10px';
    statusBar.style.borderRadius = '10px';
    statusBar.style.background = 'rgba(30,41,59,0.55)';
    statusBar.style.border = '1px solid rgba(148,163,184,0.2)';
    statusBar.style.display = 'flex';
    statusBar.style.alignItems = 'center';
    statusBar.style.justifyContent = 'space-between';
    const statusMessage = document.createElement('span');
    statusMessage.textContent = text('.status.ready', '編集中: 左のツールから配置してみましょう。');
    const statusExtra = document.createElement('span');
    statusExtra.style.fontVariantNumeric = 'tabular-nums';
    statusExtra.style.opacity = '0.75';
    statusBar.appendChild(statusMessage);
    statusBar.appendChild(statusExtra);
    wrapper.appendChild(statusBar);

    const panels = document.createElement('div');
    panels.style.display = 'grid';
    panels.style.gridTemplateColumns = '1fr';
    panels.style.gap = '16px';
    wrapper.appendChild(panels);

    const editorPanel = document.createElement('div');
    const playPanel = document.createElement('div');
    panels.appendChild(editorPanel);
    panels.appendChild(playPanel);

    const TOOL_TYPES = [
      { id: 'floor', label: text('.tool.floor', '床'), hint: text('.tool.floor.hint', '基本の床マス') },
      { id: 'wall', label: text('.tool.wall', '壁'), hint: text('.tool.wall.hint', '移動できない壁') },
      { id: 'goal', label: text('.tool.goal', 'ゴール'), hint: text('.tool.goal.hint', '木箱をはめる目標地点') },
      { id: 'crate', label: text('.tool.crate', '木箱'), hint: text('.tool.crate.hint', '押して動かす木箱 (クリックで配置/削除)') },
      { id: 'player', label: text('.tool.player', '作業員'), hint: text('.tool.player.hint', '開始位置 (1つのみ)') },
    ];

    const MIN_SIZE = 4;
    const MAX_SIZE = 18;

    const stage = createInitialStage();
    let selectedTool = 'wall';
    let playState = null;
    let clears = 0;
    let totalFits = 0;
    let widthControl;
    let heightControl;

    function createInitialStage(){
      const width = 8;
      const height = 6;
      const tiles = Array.from({ length: height }, () => Array.from({ length: width }, () => 'floor'));
      const goals = new Set();
      const crates = [];
      const player = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
      return { width, height, tiles, goals, crates, player };
    }

    function stageKey(x, y){ return `${x},${y}`; }
    function hasGoal(x, y){ return stage.goals.has(stageKey(x, y)); }
    function addGoal(x, y){ stage.goals.add(stageKey(x, y)); }
    function removeGoal(x, y){ stage.goals.delete(stageKey(x, y)); }
    function findCrateIndex(x, y){ return stage.crates.findIndex(c => c.x === x && c.y === y); }
    function hasCrate(x, y){ return findCrateIndex(x, y) !== -1; }

    function clampSize(value){
      if (!Number.isFinite(value)) return MIN_SIZE;
      return Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(value)));
    }

    function resizeStage(newWidth, newHeight){
      const width = clampSize(newWidth);
      const height = clampSize(newHeight);
      if (width === stage.width && height === stage.height) return;
      const tiles = Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => (y < stage.height && x < stage.width) ? stage.tiles[y][x] : 'floor')
      );
      stage.tiles = tiles;
      stage.width = width;
      stage.height = height;
      stage.crates = stage.crates.filter(c => c.x < width && c.y < height);
      stage.crates = stage.crates.map(c => ({ x: c.x, y: c.y }));
      stage.goals = new Set([...stage.goals].filter(key => {
        const [sx, sy] = key.split(',').map(Number);
        return sx < width && sy < height;
      }));
      if (stage.player && (stage.player.x >= width || stage.player.y >= height)){
        stage.player = { x: Math.min(width - 1, stage.player.x), y: Math.min(height - 1, stage.player.y) };
      }
      if (widthControl) widthControl.setValue(stage.width);
      if (heightControl) heightControl.setValue(stage.height);
      updateStatusExtra();
      renderEditor();
      updateExportPreview();
    }

    function setSelectedTool(tool){
      selectedTool = tool;
      toolButtons.forEach(btn => {
        const active = btn.dataset.tool === tool;
        btn.style.background = active ? 'linear-gradient(135deg, rgba(56,189,248,0.8), rgba(14,165,233,0.65))' : 'rgba(15,23,42,0.7)';
        btn.style.color = active ? '#0f172a' : '#e2e8f0';
        btn.style.boxShadow = active ? '0 0 0 1px rgba(14,165,233,0.55)' : 'none';
      });
      const hint = TOOL_TYPES.find(t => t.id === tool)?.hint || '';
      setStatus(hint, null);
    }

    function applyTool(x, y){
      const base = stage.tiles[y][x];
      if (selectedTool === 'wall'){
        stage.tiles[y][x] = 'wall';
        removeGoal(x, y);
        if (hasCrate(x, y)) stage.crates.splice(findCrateIndex(x, y), 1);
        if (stage.player && stage.player.x === x && stage.player.y === y) stage.player = null;
      } else if (selectedTool === 'floor'){
        stage.tiles[y][x] = 'floor';
      } else if (selectedTool === 'goal'){
        stage.tiles[y][x] = 'floor';
        if (hasGoal(x, y)) removeGoal(x, y); else addGoal(x, y);
      } else if (selectedTool === 'crate'){
        stage.tiles[y][x] = 'floor';
        const index = findCrateIndex(x, y);
        if (index === -1) {
          stage.crates.push({ x, y });
          if (stage.player && stage.player.x === x && stage.player.y === y) stage.player = null;
        } else {
          stage.crates.splice(index, 1);
        }
      } else if (selectedTool === 'player'){
        stage.tiles[y][x] = 'floor';
        const index = findCrateIndex(x, y);
        if (index !== -1) stage.crates.splice(index, 1);
        stage.player = { x, y };
      }
      if (base !== stage.tiles[y][x]){
        setStatus(text('.status.updated', 'マスを更新しました。'), '#38bdf8');
      }
      updateStatusExtra();
      renderEditor();
      updateExportPreview();
    }

    function updateStatusExtra(){
      const crateCount = stage.crates.length;
      const goalCount = stage.goals.size;
      const hasPlayer = !!stage.player;
      statusExtra.textContent = text('.status.summary', () => `木箱 ${crateCount} / ゴール ${goalCount} / 作業員 ${hasPlayer ? '1' : '0'}`, {
        crates: crateCount,
        goals: goalCount,
        hasPlayer,
      });
    }

    const toolBar = document.createElement('div');
    toolBar.style.display = 'flex';
    toolBar.style.flexWrap = 'wrap';
    toolBar.style.gap = '8px';
    toolBar.style.marginBottom = '12px';
    editorPanel.appendChild(toolBar);

    const toolButtons = TOOL_TYPES.map(tool => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.tool = tool.id;
      btn.textContent = tool.label;
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.padding = '8px 16px';
      btn.style.borderRadius = '999px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '600';
      btn.style.transition = 'all 0.15s ease';
      btn.addEventListener('click', () => setSelectedTool(tool.id));
      toolBar.appendChild(btn);
      return btn;
    });

    // Editor Panel setup
    editorPanel.style.background = 'rgba(15,23,42,0.7)';
    editorPanel.style.border = '1px solid rgba(148,163,184,0.25)';
    editorPanel.style.borderRadius = '16px';
    editorPanel.style.padding = '16px';

    const editorTitle = document.createElement('h3');
    editorTitle.textContent = text('.editor.title', 'ステージエディタ');
    editorTitle.style.margin = '0 0 12px';
    editorTitle.style.fontSize = '18px';
    editorTitle.style.fontWeight = '600';
    editorPanel.appendChild(editorTitle);

    const editorControls = document.createElement('div');
    editorControls.style.display = 'grid';
    editorControls.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
    editorControls.style.gap = '12px';
    editorControls.style.marginBottom = '14px';
    editorPanel.appendChild(editorControls);

    widthControl = createLabeledInput(text('.editor.width', '幅'), stage.width, value => resizeStage(value, stage.height));
    heightControl = createLabeledInput(text('.editor.height', '高さ'), stage.height, value => resizeStage(stage.width, value));
    editorControls.appendChild(widthControl.element);
    editorControls.appendChild(heightControl.element);

    function createLabeledInput(labelText, initialValue, onChange){
      const wrapper = document.createElement('label');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '6px';
      const span = document.createElement('span');
      span.textContent = labelText;
      span.style.fontSize = '12px';
      span.style.opacity = '0.75';
      const input = document.createElement('input');
      input.type = 'number';
      input.min = String(MIN_SIZE);
      input.max = String(MAX_SIZE);
      input.style.background = 'rgba(15,23,42,0.85)';
      input.style.border = '1px solid rgba(148,163,184,0.35)';
      input.style.borderRadius = '10px';
      input.style.padding = '6px 10px';
      input.style.color = '#e2e8f0';
      input.style.fontSize = '14px';

      function commit(value){
        const numeric = parseInt(value, 10);
        const clamped = clampSize(Number.isFinite(numeric) ? numeric : initialValue);
        input.value = String(clamped);
        onChange(clamped);
      }

      input.addEventListener('change', () => commit(input.value));
      input.addEventListener('blur', () => commit(input.value));

      wrapper.appendChild(span);
      wrapper.appendChild(input);

      input.value = String(clampSize(initialValue));

      return {
        element: wrapper,
        setValue(value){
          const clamped = clampSize(value);
          input.value = String(clamped);
        }
      };
    }

    const editorGrid = document.createElement('div');
    editorGrid.style.display = 'grid';
    editorGrid.style.justifyContent = 'start';
    editorGrid.style.gap = '2px';
    editorGrid.style.userSelect = 'none';
    editorGrid.style.touchAction = 'manipulation';
    editorGrid.style.background = 'rgba(2,6,23,0.85)';
    editorGrid.style.padding = '12px';
    editorGrid.style.borderRadius = '12px';
    editorGrid.style.border = '1px solid rgba(148,163,184,0.25)';
    editorPanel.appendChild(editorGrid);

    const ioArea = document.createElement('textarea');
    ioArea.rows = 8;
    ioArea.style.width = '100%';
    ioArea.style.resize = 'vertical';
    ioArea.style.background = 'rgba(15,23,42,0.85)';
    ioArea.style.border = '1px solid rgba(148,163,184,0.3)';
    ioArea.style.borderRadius = '12px';
    ioArea.style.padding = '10px';
    ioArea.style.color = '#e2e8f0';
    ioArea.style.fontFamily = 'monospace';
    ioArea.style.fontSize = '12px';

    const ioButtons = document.createElement('div');
    ioButtons.style.display = 'flex';
    ioButtons.style.flexWrap = 'wrap';
    ioButtons.style.gap = '8px';
    ioButtons.style.margin = '12px 0 0';

    const exportBtn = createActionButton(text('.editor.export', 'エクスポート'), () => {
      ioArea.value = JSON.stringify(serializeStage(), null, 2);
      setStatus(text('.status.exported', 'ステージデータを出力しました。コピーして保存できます。'), '#38bdf8');
    });
    const importBtn = createActionButton(text('.editor.import', 'インポート'), () => {
      if (!ioArea.value.trim()){
        setStatus(text('.status.import.empty', 'インポートするJSONを入力してください。'), '#f87171');
        return;
      }
      try {
        const parsed = JSON.parse(ioArea.value);
        applyImportedStage(parsed);
        setStatus(text('.status.import.success', 'ステージを読み込みました。'), '#4ade80');
      } catch (err){
        console.error(err);
        setStatus(text('.status.import.error', 'JSONの解析に失敗しました。形式を確認してください。'), '#f87171');
      }
    });
    const clearBtn = createActionButton(text('.editor.clear', '初期化'), () => {
      const fresh = createInitialStage();
      stage.width = fresh.width;
      stage.height = fresh.height;
      stage.tiles = fresh.tiles;
      stage.goals = fresh.goals;
      stage.crates = fresh.crates;
      stage.player = fresh.player;
      if (widthControl) widthControl.setValue(stage.width);
      if (heightControl) heightControl.setValue(stage.height);
      updateStatusExtra();
      renderEditor();
      updateExportPreview();
      setStatus(text('.status.reset', '初期ステージに戻しました。'), '#38bdf8');
    });
    ioButtons.appendChild(exportBtn);
    ioButtons.appendChild(importBtn);
    ioButtons.appendChild(clearBtn);

    const ioContainer = document.createElement('div');
    const ioLabel = document.createElement('div');
    ioLabel.textContent = text('.editor.io', 'インポート / エクスポート (JSON)');
    ioLabel.style.marginTop = '14px';
    ioLabel.style.marginBottom = '6px';
    ioLabel.style.fontSize = '13px';
    ioLabel.style.opacity = '0.75';
    ioContainer.appendChild(ioLabel);
    ioContainer.appendChild(ioArea);
    ioContainer.appendChild(ioButtons);
    editorPanel.appendChild(ioContainer);

    function createActionButton(label, onClick){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.padding = '8px 16px';
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(148,163,184,0.35)';
      btn.style.background = 'rgba(15,23,42,0.75)';
      btn.style.color = '#e2e8f0';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '600';
      btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(30,41,59,0.85)');
      btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(15,23,42,0.75)');
      btn.addEventListener('click', onClick);
      return btn;
    }

    function serializeStage(){
      return {
        width: stage.width,
        height: stage.height,
        walls: stage.tiles.reduce((acc, row, y) => {
          row.forEach((cell, x) => { if (cell === 'wall') acc.push([x, y]); });
          return acc;
        }, []),
        goals: [...stage.goals].map(key => key.split(',').map(Number)),
        crates: stage.crates.map(c => [c.x, c.y]),
        player: stage.player ? [stage.player.x, stage.player.y] : null,
      };
    }

    function applyImportedStage(data){
      if (!data || typeof data !== 'object') throw new Error('invalid stage data');
      const width = clampSize(parseInt(data.width, 10));
      const height = clampSize(parseInt(data.height, 10));
      const tiles = Array.from({ length: height }, () => Array.from({ length: width }, () => 'floor'));
      const goals = new Set();
      const crates = [];
      if (Array.isArray(data.walls)){
        data.walls.forEach(pair => {
          if (!Array.isArray(pair) || pair.length !== 2) return;
          const [x, y] = pair.map(n => parseInt(n, 10));
          if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < width && y < height){
            tiles[y][x] = 'wall';
          }
        });
      }
      if (Array.isArray(data.goals)){
        data.goals.forEach(pair => {
          if (!Array.isArray(pair) || pair.length !== 2) return;
          const [x, y] = pair.map(n => parseInt(n, 10));
          if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < width && y < height){
            goals.add(stageKey(x, y));
          }
        });
      }
      if (Array.isArray(data.crates)){
        data.crates.forEach(pair => {
          if (!Array.isArray(pair) || pair.length !== 2) return;
          const [x, y] = pair.map(n => parseInt(n, 10));
          if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < width && y < height && tiles[y][x] !== 'wall'){
            if (!crates.some(c => c.x === x && c.y === y)) crates.push({ x, y });
          }
        });
      }
      let player = null;
      if (Array.isArray(data.player) && data.player.length === 2){
        const [px, py] = data.player.map(n => parseInt(n, 10));
        if (Number.isInteger(px) && Number.isInteger(py) && px >= 0 && py >= 0 && px < width && py < height && tiles[py][px] !== 'wall'){
          player = { x: px, y: py };
        }
      }
      stage.width = width;
      stage.height = height;
      stage.tiles = tiles;
      stage.goals = goals;
      stage.crates = crates;
      stage.player = player;
      if (widthControl) widthControl.setValue(stage.width);
      if (heightControl) heightControl.setValue(stage.height);
      updateStatusExtra();
      renderEditor();
      updateExportPreview();
    }

    function renderEditor(){
      editorGrid.innerHTML = '';
      editorGrid.style.gridTemplateColumns = `repeat(${stage.width}, 32px)`;
      for (let y = 0; y < stage.height; y++){
        for (let x = 0; x < stage.width; x++){
          const cell = document.createElement('button');
          cell.type = 'button';
          cell.dataset.x = String(x);
          cell.dataset.y = String(y);
          cell.style.width = '32px';
          cell.style.height = '32px';
          cell.style.border = '1px solid rgba(30,41,59,0.8)';
          cell.style.borderRadius = '6px';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          cell.style.fontSize = '16px';
          cell.style.fontWeight = '600';
          cell.style.cursor = 'pointer';
          cell.style.background = stage.tiles[y][x] === 'wall' ? '#1f2937' : '#0f172a';
          cell.style.color = '#e2e8f0';
          const isGoal = hasGoal(x, y);
          const crateIndex = findCrateIndex(x, y);
          const isPlayer = stage.player && stage.player.x === x && stage.player.y === y;
          let glyph = '';
          if (stage.tiles[y][x] === 'wall'){
            glyph = '■';
            cell.style.color = '#94a3b8';
          } else if (crateIndex !== -1 && isGoal){
            glyph = '★';
            cell.style.color = '#facc15';
            cell.style.background = '#4338ca';
          } else if (crateIndex !== -1){
            glyph = '⬜';
            cell.style.color = '#fbbf24';
            cell.style.background = '#1e3a8a';
          } else if (isPlayer){
            glyph = '＠';
            cell.style.color = '#34d399';
            cell.style.background = '#065f46';
          } else if (isGoal){
            glyph = '◎';
            cell.style.color = '#38bdf8';
            cell.style.background = '#1d4ed8';
          }
          if (isPlayer && crateIndex !== -1){
            cell.style.background = '#0f766e';
            glyph = '⚠';
          }
          cell.textContent = glyph;
          cell.addEventListener('click', () => applyTool(x, y));
          editorGrid.appendChild(cell);
        }
      }
    }

    function updateExportPreview(){
      ioArea.placeholder = JSON.stringify(serializeStage(), null, 2);
    }

    function setStatus(message, color){
      statusMessage.textContent = message;
      statusBar.style.borderColor = color ? color + '55' : 'rgba(148,163,184,0.25)';
      if (color){
        statusBar.style.boxShadow = `0 0 0 1px ${color}33`;
        statusMessage.style.color = color;
      } else {
        statusBar.style.boxShadow = 'none';
        statusMessage.style.color = '#e2e8f0';
      }
    }

    // Play Panel setup
    playPanel.style.background = 'rgba(15,23,42,0.7)';
    playPanel.style.border = '1px solid rgba(148,163,184,0.25)';
    playPanel.style.borderRadius = '16px';
    playPanel.style.padding = '16px';

    const playTitle = document.createElement('h3');
    playTitle.textContent = text('.play.title', 'プレイテスト');
    playTitle.style.margin = '0 0 12px';
    playTitle.style.fontSize = '18px';
    playTitle.style.fontWeight = '600';
    playPanel.appendChild(playTitle);

    const playInfo = document.createElement('div');
    playInfo.style.display = 'flex';
    playInfo.style.flexWrap = 'wrap';
    playInfo.style.gap = '12px';
    playInfo.style.fontSize = '13px';
    playInfo.style.marginBottom = '12px';
    playPanel.appendChild(playInfo);

    const playBoard = document.createElement('div');
    playBoard.style.display = 'grid';
    playBoard.style.gap = '2px';
    playBoard.style.justifyContent = 'start';
    playBoard.style.background = 'rgba(2,6,23,0.85)';
    playBoard.style.padding = '12px';
    playBoard.style.borderRadius = '12px';
    playBoard.style.border = '1px solid rgba(148,163,184,0.25)';
    playBoard.setAttribute('tabindex', '0');
    playPanel.appendChild(playBoard);

    const playHint = document.createElement('div');
    playHint.style.fontSize = '12px';
    playHint.style.opacity = '0.7';
    playHint.style.marginTop = '10px';
    playHint.textContent = text('.play.hint', '矢印キーまたはWASDで操作。リセットで再挑戦。');
    playPanel.appendChild(playHint);

    const playButtons = document.createElement('div');
    playButtons.style.display = 'flex';
    playButtons.style.flexWrap = 'wrap';
    playButtons.style.gap = '8px';
    playButtons.style.marginTop = '12px';
    const resetBtn = createActionButton(text('.play.reset', 'リセット'), () => {
      if (playState){
        beginPlay();
        setStatus(text('.status.resetPlay', 'ステージをリセットしました。'), '#38bdf8');
      }
    });
    playButtons.appendChild(resetBtn);
    playPanel.appendChild(playButtons);

    function cloneStage(){
      return {
        width: stage.width,
        height: stage.height,
        tiles: stage.tiles.map(row => row.slice()),
        goals: new Set(stage.goals),
        crates: stage.crates.map(c => ({ x: c.x, y: c.y })),
        player: stage.player ? { x: stage.player.x, y: stage.player.y } : null,
      };
    }

    function validateStage(){
      if (!stage.player) return { ok: false, message: text('.validate.player', '作業員の開始位置が必要です。') };
      if (stage.crates.length === 0) return { ok: false, message: text('.validate.crate', '最低1つの木箱を配置してください。') };
      if (stage.goals.size === 0) return { ok: false, message: text('.validate.goal', '最低1つのゴールを配置してください。') };
      if (stage.crates.length > stage.goals.size) return { ok: false, message: text('.validate.balance', 'ゴール数は木箱以上にしましょう。') };
      for (const crate of stage.crates){
        if (stage.tiles[crate.y][crate.x] === 'wall') return { ok: false, message: text('.validate.crateWall', '壁の上に木箱は置けません。') };
      }
      if (stage.tiles[stage.player.y][stage.player.x] === 'wall') return { ok: false, message: text('.validate.playerWall', '作業員の位置が壁になっています。') };
      return { ok: true, stage: cloneStage() };
    }

    function beginPlay(){
      const validation = validateStage();
      if (!validation.ok){
        setStatus(validation.message, '#f87171');
        editorPanel.style.display = 'block';
        playPanel.style.display = 'none';
        updateModeButtons('editor');
        return false;
      }
      playState = {
        ...validation.stage,
        moves: 0,
        completed: false,
      };
      updatePlayInfo();
      renderPlayBoard();
      playBoard.focus();
      setStatus(text('.status.play', 'プレイモード: 箱をゴールに押し込みましょう！'), '#38bdf8');
      return true;
    }

    function countCratesOnGoals(){
      return playState.crates.reduce((acc, crate) => acc + (playState.goals.has(stageKey(crate.x, crate.y)) ? 1 : 0), 0);
    }

    function renderPlayBoard(){
      playBoard.innerHTML = '';
      playBoard.style.gridTemplateColumns = `repeat(${playState.width}, 32px)`;
      for (let y = 0; y < playState.height; y++){
        for (let x = 0; x < playState.width; x++){
          const cell = document.createElement('div');
          cell.style.width = '32px';
          cell.style.height = '32px';
          cell.style.borderRadius = '6px';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          cell.style.fontSize = '16px';
          cell.style.fontWeight = '600';
          cell.style.border = '1px solid rgba(30,41,59,0.8)';
          const isWall = playState.tiles[y][x] === 'wall';
          const goal = playState.goals.has(stageKey(x, y));
          const crateIndex = playState.crates.findIndex(c => c.x === x && c.y === y);
          const isPlayer = playState.player && playState.player.x === x && playState.player.y === y;
          let glyph = '';
          if (isWall){
            glyph = '■';
            cell.style.background = '#111827';
            cell.style.color = '#94a3b8';
          } else if (crateIndex !== -1 && goal){
            glyph = '★';
            cell.style.background = '#facc15';
            cell.style.color = '#0f172a';
          } else if (crateIndex !== -1){
            glyph = '⬜';
            cell.style.background = '#f97316';
            cell.style.color = '#0f172a';
          } else if (isPlayer && goal){
            glyph = '⛳';
            cell.style.background = '#22d3ee';
            cell.style.color = '#0f172a';
          } else if (isPlayer){
            glyph = '＠';
            cell.style.background = '#34d399';
            cell.style.color = '#0f172a';
          } else if (goal){
            glyph = '◎';
            cell.style.background = '#2563eb';
            cell.style.color = '#e2e8f0';
          } else {
            cell.style.background = '#0f172a';
            cell.style.color = '#e2e8f0';
          }
          playBoard.appendChild(cell);
        }
      }
    }

    function updatePlayInfo(){
      const cratesOnGoal = playState ? countCratesOnGoals() : 0;
      playInfo.textContent = text('.play.info', () => `手数 ${playState?.moves ?? 0} / 木箱 ${cratesOnGoal} / ${playState?.crates.length ?? 0}`, {
        moves: playState?.moves ?? 0,
        cratesOnGoal,
        cratesTotal: playState?.crates.length ?? 0,
      });
    }

    function tryMove(dx, dy){
      if (!playState || playState.completed) return;
      const nextX = playState.player.x + dx;
      const nextY = playState.player.y + dy;
      if (nextX < 0 || nextY < 0 || nextX >= playState.width || nextY >= playState.height) return;
      if (playState.tiles[nextY][nextX] === 'wall') return;
      const crateIndex = playState.crates.findIndex(c => c.x === nextX && c.y === nextY);
      let crateMoved = false;
      if (crateIndex !== -1){
        const pushX = nextX + dx;
        const pushY = nextY + dy;
        if (pushX < 0 || pushY < 0 || pushX >= playState.width || pushY >= playState.height) return;
        if (playState.tiles[pushY][pushX] === 'wall') return;
        if (playState.crates.some(c => c.x === pushX && c.y === pushY)) return;
        const wasGoal = playState.goals.has(stageKey(nextX, nextY));
        const willBeGoal = playState.goals.has(stageKey(pushX, pushY));
        playState.crates[crateIndex] = { x: pushX, y: pushY };
        crateMoved = true;
        if (!wasGoal && willBeGoal){
          totalFits += 1;
          awardXp && awardXp(25, { type: 'crate_goal', x: pushX, y: pushY });
          setStatus(text('.status.crateFit', '木箱をはめました！ +25EXP'), '#facc15');
        }
      }
      playState.player = { x: nextX, y: nextY };
      playState.moves += 1;
      renderPlayBoard();
      updatePlayInfo();
      if (crateMoved){
        checkClear();
      }
    }

    function checkClear(){
      if (!playState) return;
      const cratesOnGoal = countCratesOnGoals();
      if (cratesOnGoal === playState.crates.length && playState.crates.length > 0){
        if (!playState.completed){
          playState.completed = true;
          clears += 1;
          awardXp && awardXp(100, { type: 'stage_clear', moves: playState.moves });
          setStatus(text('.status.cleared', 'ステージクリア！ +100EXP'), '#facc15');
        }
      }
    }

    function handleKeydown(event){
      const keyMap = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], W: [0, -1], s: [0, 1], S: [0, 1], a: [-1, 0], A: [-1, 0], d: [1, 0], D: [1, 0]
      };
      const dir = keyMap[event.key];
      if (!dir) return;
      event.preventDefault();
      tryMove(dir[0], dir[1]);
    }

    playBoard.addEventListener('keydown', handleKeydown);

    function setMode(mode){
      if (mode === 'play'){
        editorPanel.style.display = 'none';
        playPanel.style.display = 'block';
        const started = beginPlay();
        if (!started){
          return;
        }
      } else {
        editorPanel.style.display = 'block';
        playPanel.style.display = 'none';
        setStatus(text('.status.editMode', '編集モードに戻りました。'), '#38bdf8');
      }
      updateModeButtons(mode);
    }

    function updateModeButtons(active){
      modeButtons.forEach(btn => {
        const isActive = btn.dataset.mode === active;
        btn.style.background = isActive ? 'linear-gradient(135deg, rgba(56,189,248,0.8), rgba(14,165,233,0.65))' : 'rgba(15,23,42,0.7)';
        btn.style.color = isActive ? '#0f172a' : '#e2e8f0';
      });
    }

    const modeButtons = ['editor', 'play'].map(mode => {
      const label = mode === 'editor' ? text('.mode.editor', '編集') : text('.mode.play', 'プレイ');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.mode = mode;
      btn.textContent = label;
      btn.style.border = 'none';
      btn.style.cursor = 'pointer';
      btn.style.padding = '8px 18px';
      btn.style.borderRadius = '999px';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '600';
      btn.style.transition = 'all 0.15s ease';
      btn.addEventListener('click', () => setMode(mode));
      modeBar.appendChild(btn);
      return btn;
    });

    setMode('editor');
    setSelectedTool(selectedTool);
    updateStatusExtra();
    renderEditor();
    updateExportPreview();

    root.appendChild(wrapper);

    function start(){}
    function stop(){}
    function destroy(){
      playBoard.removeEventListener('keydown', handleKeydown);
      wrapper.remove();
    }
    function getScore(){
      return { clears, crateFits: totalFits };
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'sandbox_sokoban',
    name: 'サンドボックス倉庫番',
    nameKey: 'selection.miniexp.games.sandbox_sokoban.name',
    description: 'ステージ編集＆プレイを行き来できる倉庫番。木箱で+25EXP、クリアで+100EXP。',
    descriptionKey: 'selection.miniexp.games.sandbox_sokoban.description',
    categoryIds: ['puzzle'],
    create,
  });
})();
