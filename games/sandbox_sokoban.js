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

    const STYLE_ID = 'sandbox-sokoban-style';
    ensureStyles();

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
      { id: 'floor', label: text('.tool.floor.label', '床'), hint: text('.tool.floor.hint', '基本の床マス') },
      { id: 'wall', label: text('.tool.wall.label', '壁'), hint: text('.tool.wall.hint', '移動できない壁') },
      { id: 'goal', label: text('.tool.goal.label', 'ゴール'), hint: text('.tool.goal.hint', '木箱をはめる目標地点') },
      { id: 'crate', label: text('.tool.crate.label', '木箱'), hint: text('.tool.crate.hint', '押して動かす木箱 (クリックで配置/削除)') },
      { id: 'player', label: text('.tool.player.label', '作業員'), hint: text('.tool.player.hint', '開始位置 (1つのみ)') },
    ];

    const MIN_SIZE = 4;
    const MAX_SIZE = 18;
    const DIRS = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    const stage = createInitialStage();
    let selectedTool = 'wall';
    let playState = null;
    let clears = 0;
    let totalFits = 0;
    let widthControl;
    let heightControl;
    let generatorLevelControl;
    let generatorSymmetryControl;

    function ensureStyles(){
      if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        .sandbox-sokoban-cell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #d4d4d8;
          border-radius: 6px;
          overflow: hidden;
        }
        .sandbox-sokoban-cell.wall {
          background: #000000;
          border-color: #000000;
          color: #f8fafc;
        }
        .sandbox-sokoban-goal {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #bae6fd;
          border: 2px solid #38bdf8;
          box-shadow: inset 0 0 6px rgba(14,165,233,0.45);
        }
        .sandbox-sokoban-crate {
          position: relative;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: #b45309;
          border: 3px solid #78350f;
          box-shadow: 0 3px 0 rgba(15,23,42,0.35);
        }
        .sandbox-sokoban-crate.on-goal {
          box-shadow: 0 0 0 3px rgba(250,204,21,0.8), 0 3px 0 rgba(15,23,42,0.35);
        }
        .sandbox-sokoban-player {
          position: relative;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          text-shadow: 0 1px 2px rgba(148,163,184,0.6);
          z-index: 10;
        }
        .sandbox-sokoban-entity {
          position: absolute;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          pointer-events: none;
        }
        .sandbox-sokoban-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }

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
      const workers = stage.player ? 1 : 0;
      statusExtra.textContent = text('.status.summary', () => `木箱 ${crateCount} / ゴール ${goalCount} / 作業員 ${workers}`, {
        crates: crateCount,
        goals: goalCount,
        workers,
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
    editorControls.appendChild(heightControl.element);
    generatorLevelControl = createLabeledSelect(
      text('.generator.level', '生成レベル'),
      1,
      Array.from({ length: 10 }, (_, index) => ({ value: index + 1, label: `${text('.generator.levelPrefix', 'Lv.')} ${index + 1}` }))
    );
    editorControls.appendChild(generatorLevelControl.element);
    generatorSymmetryControl = createLabeledSelect(
      text('.generator.symmetry', '対称性'),
      'none',
      [
        { value: 'none', label: text('.symmetry.none', 'なし') },
        { value: 'horizontal', label: text('.symmetry.horizontal', '左右対称') },
        { value: 'vertical', label: text('.symmetry.vertical', '上下対称') },
        { value: 'rotational', label: text('.symmetry.rotational', '点対称 (180°)') },
      ]
    );
    editorControls.appendChild(generatorSymmetryControl.element);

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

    function createLabeledSelect(labelText, initialValue, options){
      const wrapper = document.createElement('label');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '6px';
      const span = document.createElement('span');
      span.textContent = labelText;
      span.style.fontSize = '12px';
      span.style.opacity = '0.75';
      const select = document.createElement('select');
      select.style.background = 'rgba(15,23,42,0.85)';
      select.style.border = '1px solid rgba(148,163,184,0.35)';
      select.style.borderRadius = '10px';
      select.style.padding = '6px 10px';
      select.style.color = '#e2e8f0';
      select.style.fontSize = '14px';
      options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = String(option.value);
        opt.textContent = option.label;
        select.appendChild(opt);
      });
      select.value = String(initialValue);
      wrapper.appendChild(span);
      wrapper.appendChild(select);
      return {
        element: wrapper,
        getValue(){
          return select.value;
        },
        setValue(value){
          select.value = String(value);
        }
      };
    }

    const generatorRow = document.createElement('div');
    generatorRow.style.display = 'flex';
    generatorRow.style.flexWrap = 'wrap';
    generatorRow.style.gap = '8px';
    generatorRow.style.alignItems = 'flex-end';
    generatorRow.style.marginBottom = '12px';


    const generateBtn = createActionButton(text('.generator.generate', '逆再生で生成'), () => {
      const level = Math.max(1, Math.min(10, parseInt(generatorLevelControl.getValue(), 10) || 1));
      const symmetry = generatorSymmetryControl.getValue();
      const generated = generateStageByReverse(level, symmetry);
      if (generated){
        applyImportedStage(generated);
        setStatus(text('.status.generated', () => `レベル${level}のステージを生成しました。`), '#4ade80');
      } else {
        setStatus(text('.status.generateFailed', '生成に失敗しました。条件を調整して再試行してください。'), '#f87171');
      }
    });
    generatorRow.appendChild(generateBtn);
    const generatorHelp = document.createElement('div');
    generatorHelp.textContent = text('.generator.help', '逆再生法でランダム生成。レベルが高いほど複雑になります。');
    generatorHelp.style.fontSize = '12px';
    generatorHelp.style.opacity = '0.7';
    generatorHelp.style.flexBasis = '100%';
    generatorHelp.style.marginTop = '4px';
    generatorRow.appendChild(generatorHelp);
    editorPanel.appendChild(generatorRow);

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

    function generateStageByReverse(level, symmetry){
      const config = createGeneratorConfig(level, symmetry);
      for (let attempt = 0; attempt < 25; attempt++){ // retry a few times for tougher levels
        const base = createGeneratorBase(config);
        if (!base) continue;
        const simulated = runReverseSimulation(base, config);
        if (!simulated) continue;
        return serializeGeneratedStage(simulated);
      }
      return null;
    }

    function createGeneratorConfig(levelInput, symmetry){
      const level = Math.max(1, Math.min(10, Math.floor(levelInput || 1)));
      const crateCount = Math.min(2 + Math.floor(level / 2), 6);
      const pushTarget = 6 + level * 4;
      const minPushes = Math.max(4, Math.floor(pushTarget * 0.55));
      const width = Math.min(MAX_SIZE, 6 + Math.floor((level + 1) / 2) * 2);
      const height = Math.min(MAX_SIZE, 6 + Math.floor(level / 2) * 2);
      const wallDensity = Math.min(0.22, 0.04 + level * 0.015);
      const minCratesOffGoal = Math.min(crateCount, Math.max(1, Math.floor(level / 3) + 1));
      return { level, crateCount, pushTarget, minPushes, width, height, wallDensity, minCratesOffGoal, symmetry };
    }

    function createGeneratorBase(config){
      const width = clampSize(config.width);
      const height = clampSize(config.height);
      if (width < MIN_SIZE || height < MIN_SIZE) return null;
      const tiles = Array.from({ length: height }, () => Array.from({ length: width }, () => 'floor'));
      for (let x = 0; x < width; x++){
        tiles[0][x] = 'wall';
        tiles[height - 1][x] = 'wall';
      }
      for (let y = 0; y < height; y++){
        tiles[y][0] = 'wall';
        tiles[y][width - 1] = 'wall';
      }
      const interiorCells = [];
      for (let y = 1; y < height - 1; y++){
        for (let x = 1; x < width - 1; x++){
          interiorCells.push({ x, y });
        }
      }
      const wallTargets = Math.min(interiorCells.length, Math.round(interiorCells.length * config.wallDensity));
      const wallCandidates = interiorCells.slice();
      shuffle(wallCandidates);
      let placedWalls = 0;
      
      const getSym = (x, y) => {
        if (config.symmetry === 'horizontal') return { x: width - 1 - x, y };
        if (config.symmetry === 'vertical') return { x, y: height - 1 - y };
        if (config.symmetry === 'rotational') return { x: width - 1 - x, y: height - 1 - y };
        return null;
      };

      for (const cell of wallCandidates){
        if (placedWalls >= wallTargets) break;
        if (tiles[cell.y][cell.x] === 'wall') continue;

        const sym = getSym(cell.x, cell.y);
        
        tiles[cell.y][cell.x] = 'wall';
        if (sym) tiles[sym.y][sym.x] = 'wall';

        if (!isFloorConnected(tiles)){
          tiles[cell.y][cell.x] = 'floor';
          if (sym) tiles[sym.y][sym.x] = 'floor';
          continue;
        }
        placedWalls += 1;
        if (sym && (sym.x !== cell.x || sym.y !== cell.y)) placedWalls += 1;
      }

      const goalCandidates = interiorCells.filter(cell => tiles[cell.y][cell.x] !== 'wall' && !isCornerCell(cell.x, cell.y, tiles));
      if (goalCandidates.length < config.crateCount) return null;
      shuffle(goalCandidates);
      
      const goals = new Set();
      const crates = [];
      
      for (const cell of goalCandidates){
        if (goals.size >= config.crateCount) break;
        if (goals.has(stageKey(cell.x, cell.y))) continue;
        
        const sym = getSym(cell.x, cell.y);
        
        goals.add(stageKey(cell.x, cell.y));
        crates.push({ x: cell.x, y: cell.y });
        
        if (sym && !goals.has(stageKey(sym.x, sym.y)) && goals.size < config.crateCount){
           // Check if symmetric spot is also valid (it should be if walls are symmetric)
           if (tiles[sym.y][sym.x] !== 'wall' && !isCornerCell(sym.x, sym.y, tiles)){
             goals.add(stageKey(sym.x, sym.y));
             crates.push({ x: sym.x, y: sym.y });
           }
        }
      }

      if (crates.length < 1) return null;

      const playerCandidates = interiorCells.filter(cell => tiles[cell.y][cell.x] !== 'wall' && !goals.has(stageKey(cell.x, cell.y)));
      if (!playerCandidates.length) return null;
      shuffle(playerCandidates);
      const playerCell = playerCandidates[0];
      return {
        width,
        height,
        tiles,
        goals,
        crates,
        player: { x: playerCell.x, y: playerCell.y },
      };
    }

    function runReverseSimulation(base, config){
      const state = {
        width: base.width,
        height: base.height,
        tiles: base.tiles.map(row => row.slice()),
        goals: new Set(base.goals),
        crates: base.crates.map(c => ({ x: c.x, y: c.y })),
        player: { x: base.player.x, y: base.player.y },
      };
      const crateMap = new Map();
      state.crates.forEach((crate, index) => {
        crateMap.set(stageKey(crate.x, crate.y), index);
      });
      const visitedStates = new Set();
      visitedStates.add(createSignature(state.crates, state.player));

      let reverseMoves = 0;
      let iterations = 0;
      let idleMoves = 0;
      let lastMove = null;
      const maxIterations = config.pushTarget * 25;

      while (reverseMoves < config.pushTarget && iterations < maxIterations){
        iterations += 1;
        const reachable = computeReachableCells(state, crateMap);
        if (!reachable.length) break;
        const pullCandidates = collectPullCandidates(state, reachable, crateMap, lastMove, visitedStates);
        if (!pullCandidates.length){
          idleMoves += 1;
          if (idleMoves > config.pushTarget * 4) break;
          const reposition = reachable[Math.floor(Math.random() * reachable.length)];
          state.player = { x: reposition.x, y: reposition.y };
          continue;
        }
        idleMoves = 0;
        const choice = randomChoice(pullCandidates);
        state.player = { x: choice.from.x, y: choice.from.y };
        const crate = state.crates[choice.crateIndex];
        const oldKey = stageKey(crate.x, crate.y);
        crateMap.delete(oldKey);
        crate.x = choice.target.x;
        crate.y = choice.target.y;
        const newKey = stageKey(crate.x, crate.y);
        crateMap.set(newKey, choice.crateIndex);
        state.player = { x: choice.to.x, y: choice.to.y };
        reverseMoves += 1;
        lastMove = { crateIndex: choice.crateIndex, dir: choice.dir };
        visitedStates.add(createSignature(state.crates, state.player));
      }

      if (reverseMoves < config.minPushes) return null;
      if (countCratesOffGoal(state) < config.minCratesOffGoal) return null;
      if (!isGeneratedStateConsistent(state)) return null;

      const reachable = computeReachableCells(state, crateMap);
      if (reachable.length){
        const crateKeys = new Set();
        crateMap.forEach((_, key) => crateKeys.add(key));
        const safeCells = reachable.filter(pos => !crateKeys.has(stageKey(pos.x, pos.y)) && !isAdjacentToCrate(pos.x, pos.y, crateKeys));
        const chosen = safeCells.length ? randomChoice(safeCells) : randomChoice(reachable);
        state.player = { x: chosen.x, y: chosen.y };
      }

      return state;
    }

    function computeReachableCells(state, crateMap){
      const reachable = [];
      const visited = new Set();
      const queue = [{ x: state.player.x, y: state.player.y }];
      const crateKeys = new Set(crateMap.keys());
      while (queue.length){
        const current = queue.shift();
        const key = stageKey(current.x, current.y);
        if (visited.has(key)) continue;
        visited.add(key);
        reachable.push({ x: current.x, y: current.y });
        for (const dir of DIRS){
          const nx = current.x + dir.dx;
          const ny = current.y + dir.dy;
          if (!isInsideBounds(nx, ny, state.width, state.height)) continue;
          if (state.tiles[ny][nx] === 'wall') continue;
          if (crateKeys.has(stageKey(nx, ny))) continue;
          const nKey = stageKey(nx, ny);
          if (!visited.has(nKey)){
            queue.push({ x: nx, y: ny });
          }
        }
      }
      return reachable;
    }

    function collectPullCandidates(state, reachable, crateMap, lastMove, visitedStates){
      const candidates = [];
      const fallback = [];
      for (const pos of reachable){
        for (const dir of DIRS){
          const crateX = pos.x - dir.dx;
          const crateY = pos.y - dir.dy;
          if (!isInsideBounds(crateX, crateY, state.width, state.height)) continue;
          const crateKey = stageKey(crateX, crateY);
          if (!crateMap.has(crateKey)) continue;
          const playerNextX = pos.x + dir.dx;
          const playerNextY = pos.y + dir.dy;
          if (!isInsideBounds(playerNextX, playerNextY, state.width, state.height)) continue;
          if (state.tiles[playerNextY][playerNextX] === 'wall') continue;
          const playerNextKey = stageKey(playerNextX, playerNextY);
          if (crateMap.has(playerNextKey)) continue;
          const crateIndex = crateMap.get(crateKey);
          if (wouldBeDeadlock(pos.x, pos.y, crateMap, crateKey, state.tiles, state.goals)) continue;
          const playerAfter = { x: playerNextX, y: playerNextY };
          const signature = signatureWithMove(state.crates, crateIndex, pos.x, pos.y, playerAfter);
          if (visitedStates.has(signature)) continue;
          const candidate = {
            from: { x: pos.x, y: pos.y },
            dir,
            crateIndex,
            target: { x: pos.x, y: pos.y },
            to: playerAfter,
            signature,
          };
          if (lastMove && lastMove.crateIndex === crateIndex && isOppositeDirection(lastMove.dir, dir)){
            fallback.push(candidate);
          } else {
            candidates.push(candidate);
          }
        }
      }
      return candidates.length ? candidates : fallback;
    }

    function wouldBeDeadlock(targetX, targetY, crateMap, movingKey, tiles, goals){
      if (goals.has(stageKey(targetX, targetY))) return false;
      const occupied = new Set();
      crateMap.forEach((_, key) => {
        if (key !== movingKey) occupied.add(key);
      });
      occupied.add(stageKey(targetX, targetY));
      const blockedLeft = isBlockedCell(targetX - 1, targetY, occupied, tiles);
      const blockedRight = isBlockedCell(targetX + 1, targetY, occupied, tiles);
      const blockedUp = isBlockedCell(targetX, targetY - 1, occupied, tiles);
      const blockedDown = isBlockedCell(targetX, targetY + 1, occupied, tiles);
      if ((blockedUp || blockedDown) && (blockedLeft || blockedRight)) return true;
      return false;
    }

    function isBlockedCell(x, y, occupied, tiles){
      if (y < 0 || y >= tiles.length || x < 0 || x >= tiles[0].length) return true;
      if (tiles[y][x] === 'wall') return true;
      if (occupied.has(stageKey(x, y))) return true;
      return false;
    }

    function isAdjacentToCrate(x, y, crateKeys){
      for (const dir of DIRS){
        if (crateKeys.has(stageKey(x + dir.dx, y + dir.dy))) return true;
      }
      return false;
    }

    function isOppositeDirection(a, b){
      return a && b && a.dx === -b.dx && a.dy === -b.dy;
    }

    function createSignature(crates, player){
      const crateKeys = crates.map(crate => stageKey(crate.x, crate.y)).sort();
      return `${crateKeys.join('|')}|P:${player.x},${player.y}`;
    }

    function signatureWithMove(crates, crateIndex, newX, newY, playerAfter){
      const crateKeys = crates.map((crate, index) => {
        if (index === crateIndex) return stageKey(newX, newY);
        return stageKey(crate.x, crate.y);
      }).sort();
      return `${crateKeys.join('|')}|P:${playerAfter.x},${playerAfter.y}`;
    }

    function countCratesOffGoal(state){
      let off = 0;
      for (const crate of state.crates){
        if (!state.goals.has(stageKey(crate.x, crate.y))) off += 1;
      }
      return off;
    }

    function isGeneratedStateConsistent(state){
      if (!state || !Array.isArray(state.crates)) return false;
      if (!state.goals || typeof state.goals.size !== 'number') return false;
      if (state.goals.size !== state.crates.length) return false;
      const seenCrates = new Set();
      for (const crate of state.crates){
        if (!Number.isInteger(crate.x) || !Number.isInteger(crate.y)) return false;
        if (!isInsideBounds(crate.x, crate.y, state.width, state.height)) return false;
        if (state.tiles[crate.y][crate.x] === 'wall') return false;
        const crateKey = stageKey(crate.x, crate.y);
        if (seenCrates.has(crateKey)) return false;
        seenCrates.add(crateKey);
      }
      for (const key of state.goals){
        const [gx, gy] = key.split(',').map(n => parseInt(n, 10));
        if (!Number.isInteger(gx) || !Number.isInteger(gy)) return false;
        if (!isInsideBounds(gx, gy, state.width, state.height)) return false;
        if (state.tiles[gy][gx] === 'wall') return false;
      }
      if (state.player){
        if (!isInsideBounds(state.player.x, state.player.y, state.width, state.height)) return false;
        if (state.tiles[state.player.y][state.player.x] === 'wall') return false;
      }
      return true;
    }

    function serializeGeneratedStage(state){
      const walls = [];
      for (let y = 0; y < state.height; y++){
        for (let x = 0; x < state.width; x++){
          if (state.tiles[y][x] === 'wall') walls.push([x, y]);
        }
      }
      return {
        width: state.width,
        height: state.height,
        walls,
        goals: [...state.goals].map(key => key.split(',').map(Number)),
        crates: state.crates.map(crate => [crate.x, crate.y]),
        player: state.player ? [state.player.x, state.player.y] : null,
      };
    }

    function isFloorConnected(tiles){
      let start = null;
      let floorCount = 0;
      for (let y = 0; y < tiles.length; y++){
        for (let x = 0; x < tiles[0].length; x++){
          if (tiles[y][x] !== 'wall'){
            floorCount += 1;
            if (!start) start = { x, y };
          }
        }
      }
      if (!start) return false;
      const visited = new Set();
      const queue = [start];
      while (queue.length){
        const current = queue.shift();
        const key = stageKey(current.x, current.y);
        if (visited.has(key)) continue;
        visited.add(key);
        for (const dir of DIRS){
          const nx = current.x + dir.dx;
          const ny = current.y + dir.dy;
          if (!isInsideBounds(nx, ny, tiles[0].length, tiles.length)) continue;
          if (tiles[ny][nx] === 'wall') continue;
          const nKey = stageKey(nx, ny);
          if (!visited.has(nKey)) queue.push({ x: nx, y: ny });
        }
      }
      return visited.size === floorCount;
    }

    function isCornerCell(x, y, tiles){
      const left = tiles[y][x - 1] === 'wall';
      const right = tiles[y][x + 1] === 'wall';
      const up = tiles[y - 1][x] === 'wall';
      const down = tiles[y + 1][x] === 'wall';
      return (left || right) && (up || down);
    }

    function isInsideBounds(x, y, width, height){
      return x >= 0 && x < width && y >= 0 && y < height;
    }

    function shuffle(array){
      for (let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function randomChoice(array){
      return array[Math.floor(Math.random() * array.length)];
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
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          cell.style.fontSize = '16px';
          cell.style.fontWeight = '600';
          cell.style.cursor = 'pointer';
          cell.style.padding = '0';
          cell.style.background = '#ffffff';
          cell.style.border = '1px solid #d4d4d8';
          cell.style.color = '#0f172a';
          cell.className = 'sandbox-sokoban-cell sandbox-sokoban-cell--editor';
          const isGoal = hasGoal(x, y);
          const crateIndex = findCrateIndex(x, y);
          const isPlayer = stage.player && stage.player.x === x && stage.player.y === y;
          decorateCell(cell, {
            wall: stage.tiles[y][x] === 'wall',
            goal: isGoal,
            crate: crateIndex !== -1,
            crateOnGoal: crateIndex !== -1 && isGoal,
            player: isPlayer,
          });
          cell.addEventListener('click', () => applyTool(x, y));
          editorGrid.appendChild(cell);
        }
      }
    }

    function updateExportPreview(){
      ioArea.placeholder = JSON.stringify(serializeStage(), null, 2);
    }

    function decorateCell(cell, { wall, goal, crate, crateOnGoal, player }){
      cell.innerHTML = '';
      if (wall){
        cell.classList.add('wall');
        cell.style.background = '#000000';
        cell.style.border = '1px solid #000000';
        cell.style.color = '#f8fafc';
        return;
      }
      cell.classList.remove('wall');
      cell.style.background = '#ffffff';
      cell.style.border = '1px solid #d4d4d8';
      cell.style.color = '#0f172a';
      if (goal){
        cell.appendChild(createGoalMarker());
      }
      if (crate){
        const crateEl = createCrateMarker();
        if (crateOnGoal) crateEl.classList.add('on-goal');
        cell.appendChild(crateEl);
      }
      if (player){
        cell.appendChild(createPlayerMarker());
      }
    }

    function createGoalMarker(){
      const goal = document.createElement('div');
      goal.className = 'sandbox-sokoban-goal';
      goal.setAttribute('aria-hidden', 'true');
      return goal;
    }

    function createCrateMarker(){
      const crate = document.createElement('div');
      crate.className = 'sandbox-sokoban-crate';
      crate.setAttribute('aria-hidden', 'true');
      return crate;
    }

    function createPlayerMarker(){
      const player = document.createElement('div');
      player.className = 'sandbox-sokoban-player';
      player.textContent = '＠';
      player.setAttribute('aria-hidden', 'true');
      return player;
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
    playBoard.style.background = '#f8fafc';
    playBoard.style.padding = '12px';
    playBoard.style.borderRadius = '12px';
    playBoard.style.border = '1px solid rgba(148,163,184,0.25)';
    playBoard.style.position = 'relative';
    playBoard.style.touchAction = 'none';
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
    const undoBtn = createActionButton(text('.play.undo', '戻す (Z)'), () => {
      undo();
    });
    playButtons.appendChild(undoBtn);
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
        history: [],
      };
      updatePlayInfo();
      initializePlayBoard();
      updateEntities();
      playBoard.focus();
      setStatus(text('.status.play', 'プレイモード: 箱をゴールに押し込みましょう！'), '#38bdf8');
      return true;
    }

    function countCratesOnGoals(){
      return playState.crates.reduce((acc, crate) => acc + (playState.goals.has(stageKey(crate.x, crate.y)) ? 1 : 0), 0);
    }

    let entityLayer = null;
    let crateElements = [];
    let playerElement = null;

    function initializePlayBoard(){
      playBoard.innerHTML = '';
      playBoard.style.gridTemplateColumns = `repeat(${playState.width}, 32px)`;
      
      // Static grid
      for (let y = 0; y < playState.height; y++){
        for (let x = 0; x < playState.width; x++){
          const cell = document.createElement('div');
          cell.style.width = '32px';
          cell.style.height = '32px';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          cell.style.fontSize = '16px';
          cell.style.fontWeight = '600';
          cell.style.background = '#ffffff';
          cell.style.border = '1px solid #d4d4d8';
          cell.style.color = '#0f172a';
          cell.className = 'sandbox-sokoban-cell sandbox-sokoban-cell--play';
          
          const wall = playState.tiles[y][x] === 'wall';
          const goal = playState.goals.has(stageKey(x, y));
          
          decorateCell(cell, { wall, goal });
          playBoard.appendChild(cell);
        }
      }

      // Entity layer
      entityLayer = document.createElement('div');
      entityLayer.className = 'sandbox-sokoban-layer';
      playBoard.appendChild(entityLayer);

      // Create elements
      crateElements = playState.crates.map(() => {
        const el = document.createElement('div');
        el.className = 'sandbox-sokoban-entity';
        const inner = createCrateMarker();
        el.appendChild(inner);
        entityLayer.appendChild(el);
        return { el, inner };
      });

      playerElement = document.createElement('div');
      playerElement.className = 'sandbox-sokoban-entity';
      playerElement.style.zIndex = '20';
      playerElement.appendChild(createPlayerMarker());
      entityLayer.appendChild(playerElement);
    }

    function updateEntities(){
      if (!playState) return;
      
      const cellSize = 32;
      const gap = 2;
      const padding = 12;
      const pitch = cellSize + gap;

      // Update Crates
      playState.crates.forEach((crate, i) => {
        if (crateElements[i]){
          const { el, inner } = crateElements[i];
          el.style.transform = `translate(${crate.x * pitch + padding}px, ${crate.y * pitch + padding}px)`;
          const onGoal = playState.goals.has(stageKey(crate.x, crate.y));
          if (onGoal) inner.classList.add('on-goal');
          else inner.classList.remove('on-goal');
        }
      });

      // Update Player
      if (playState.player && playerElement){
        playerElement.style.transform = `translate(${playState.player.x * pitch + padding}px, ${playState.player.y * pitch + padding}px)`;
      }
    }

    function updatePlayInfo(){
      const cratesOnGoal = playState ? countCratesOnGoals() : 0;
      const moves = playState?.moves ?? 0;
      const cratesTotal = playState?.crates.length ?? 0;
      playInfo.textContent = text('.play.info', () => `手数 ${moves} / 木箱 ${cratesOnGoal}/${cratesTotal}`, {
        moves,
        cratesOnGoal,
        cratesTotal,
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
      let nextCratePos = null;

      if (crateIndex !== -1){
        const pushX = nextX + dx;
        const pushY = nextY + dy;
        if (pushX < 0 || pushY < 0 || pushX >= playState.width || pushY >= playState.height) return;
        if (playState.tiles[pushY][pushX] === 'wall') return;
        if (playState.crates.some(c => c.x === pushX && c.y === pushY)) return;
        nextCratePos = { x: pushX, y: pushY };
        crateMoved = true;
      }

      pushHistory();

      if (crateMoved){
        const wasGoal = playState.goals.has(stageKey(nextX, nextY));
        const willBeGoal = playState.goals.has(stageKey(nextCratePos.x, nextCratePos.y));
        playState.crates[crateIndex] = nextCratePos;
        if (!wasGoal && willBeGoal){
          totalFits += 1;
          awardXp && awardXp(25, { type: 'crate_goal', x: nextCratePos.x, y: nextCratePos.y });
          setStatus(text('.status.crateFit', '木箱をはめました！ +25EXP'), '#facc15');
        }
      }
      playState.player = { x: nextX, y: nextY };
      playState.moves += 1;
      updateEntities();
      updatePlayInfo();
      if (crateMoved){
        checkClear();
      }
    }

    function pushHistory(){
      if (!playState) return;
      playState.history.push({
        player: { ...playState.player },
        crates: playState.crates.map(c => ({ ...c })),
        moves: playState.moves
      });
    }

    function undo(){
      if (!playState || !playState.history.length || playState.completed) return;
      const prev = playState.history.pop();
      playState.player = prev.player;
      playState.crates = prev.crates;
      playState.moves = prev.moves;
      updateEntities();
      updatePlayInfo();
      setStatus(text('.status.undo', '1手戻しました。'), '#38bdf8');
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
      if (event.key === 'z' || event.key === 'Z'){
        undo();
        return;
      }
      if (!dir) return;
      event.preventDefault();
      tryMove(dir[0], dir[1]);
    }

    playBoard.addEventListener('keydown', handleKeydown);

    let touchStartX = 0;
    let touchStartY = 0;

    function handleTouchStart(e){
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e){
      if (e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      
      if (Math.max(absX, absY) > 30){
        if (absX > absY){
          tryMove(dx > 0 ? 1 : -1, 0);
        } else {
          tryMove(0, dy > 0 ? 1 : -1);
        }
        e.preventDefault();
      }
    }

    playBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
    playBoard.addEventListener('touchend', handleTouchEnd, { passive: false });

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
      playBoard.removeEventListener('touchstart', handleTouchStart);
      playBoard.removeEventListener('touchend', handleTouchEnd);
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
