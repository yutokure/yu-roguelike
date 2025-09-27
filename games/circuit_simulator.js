(function(){
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const MIN_RESISTANCE = 1e-4;
  const MAX_RESISTANCE = 1e9;
  const DEFAULT_BOARD = { width: 760, height: 520 };
  const NODE_RADIUS = 14;
  const GRID_SIZE = 32;

  const COMPONENT_TYPES = {
    wire: {
      id: 'wire',
      label: '導線',
      description: '抵抗値ほぼ0の線',
      defaultProps: () => ({ resistance: 0.001 })
    },
    resistor: {
      id: 'resistor',
      label: '抵抗',
      description: 'オーム抵抗',
      defaultProps: () => ({ resistance: 100 })
    },
    power: {
      id: 'power',
      label: '電源',
      description: '理想電圧源＋内部抵抗',
      defaultProps: () => ({ voltage: 12, resistance: 0.5 })
    },
    ammeter: {
      id: 'ammeter',
      label: '電流計',
      description: '回路電流を計測（ほぼ0Ω）',
      defaultProps: () => ({ resistance: 0.0005 })
    },
    voltmeter: {
      id: 'voltmeter',
      label: '電圧計',
      description: 'ノード間電位差を測定',
      defaultProps: () => ({ name: '' }),
      isProbe: true
    },
    wattmeter: {
      id: 'wattmeter',
      label: '電力計',
      description: 'ノード間電力を測定',
      defaultProps: () => ({ name: '' }),
      isProbe: true
    }
  };

  function clampResistance(value, fallback = 1){
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    if (Math.abs(num) < MIN_RESISTANCE) return num >= 0 ? MIN_RESISTANCE : -MIN_RESISTANCE;
    if (Math.abs(num) > MAX_RESISTANCE) return num >= 0 ? MAX_RESISTANCE : -MAX_RESISTANCE;
    return num;
  }

  function clampVoltage(value, fallback = 5){
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    if (num > 1000) return 1000;
    if (num < -1000) return -1000;
    return num;
  }

  function formatNumber(value, digits = 3){
    if (!Number.isFinite(value)) return '—';
    const abs = Math.abs(value);
    if (abs >= 1000 || abs < 0.01) return value.toExponential(2);
    return value.toFixed(digits);
  }

  function createId(prefix){
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function canonicalPair(a, b){
    return a < b ? { key: `${a}|${b}`, sign: 1 } : { key: `${b}|${a}`, sign: -1 };
  }

  function solveCircuit(nodes, elements, groundId){
    const nodeIds = nodes.map(n => n.id);
    if (nodeIds.length === 0) {
      return {
        nodeVoltages: {},
        elementStats: {},
        branchCurrents: {},
        totals: { delivered: 0, dissipated: 0 },
        warnings: ['ノードがありません']
      };
    }

    if (!nodeIds.includes(groundId)) {
      groundId = nodeIds[0];
    }

    const activeNodes = nodeIds.filter(id => id !== groundId);
    const size = activeNodes.length;
    const indexMap = Object.create(null);
    activeNodes.forEach((id, idx) => { indexMap[id] = idx; });

    const matrix = Array.from({ length: size }, () => Array(size).fill(0));
    const vector = Array(size).fill(0);

    const warnings = [];

    function addConductance(nodeA, nodeB, conductance){
      if (!Number.isFinite(conductance) || Math.abs(conductance) < 1e-12) return;
      const isGroundA = nodeA === groundId;
      const isGroundB = nodeB === groundId;
      if (!isGroundA){
        const i = indexMap[nodeA];
        if (i !== undefined) {
          matrix[i][i] += conductance;
        }
      }
      if (!isGroundB){
        const j = indexMap[nodeB];
        if (j !== undefined) {
          matrix[j][j] += conductance;
        }
      }
      if (!isGroundA && !isGroundB){
        const i = indexMap[nodeA];
        const j = indexMap[nodeB];
        if (i !== undefined && j !== undefined) {
          matrix[i][j] -= conductance;
          matrix[j][i] -= conductance;
        }
      }
    }

    function addCurrentSource(posNode, negNode, current){
      if (!Number.isFinite(current) || Math.abs(current) < 1e-12) return;
      if (posNode !== groundId){
        const idx = indexMap[posNode];
        if (idx !== undefined) vector[idx] += current;
      }
      if (negNode !== groundId){
        const idx = indexMap[negNode];
        if (idx !== undefined) vector[idx] -= current;
      }
    }

    const branchCurrents = Object.create(null);

    function accumulateBranch(nodeA, nodeB, currentFromAtoB){
      if (!Number.isFinite(currentFromAtoB)) return;
      const { key, sign } = canonicalPair(nodeA, nodeB);
      branchCurrents[key] = (branchCurrents[key] || 0) + currentFromAtoB * sign;
    }

    const conductiveElements = [];

    elements.forEach(el => {
      if (!el || !el.nodeA || !el.nodeB) return;
      if (el.type === 'voltmeter' || el.type === 'wattmeter') return;
      conductiveElements.push(el);
    });

    conductiveElements.forEach(el => {
      const { nodeA, nodeB } = el;
      if (!nodeIds.includes(nodeA) || !nodeIds.includes(nodeB)) return;
      if (el.type === 'power') {
        const voltage = clampVoltage(el.voltage ?? 0, 0);
        const resistance = clampResistance(el.resistance ?? 0.5, 0.5);
        const conductance = 1 / Math.abs(resistance);
        addConductance(nodeA, nodeB, conductance);
        const current = voltage / resistance;
        addCurrentSource(nodeA, nodeB, current);
      } else {
        const res = clampResistance(el.resistance ?? 1, 1);
        const conductance = 1 / Math.abs(res);
        addConductance(nodeA, nodeB, conductance);
      }
    });

    let solution = Array(size).fill(0);
    if (size > 0){
      try {
        const A = matrix.map(row => row.slice());
        const b = vector.slice();
        for (let col = 0; col < size; col++){
          let pivot = col;
          let maxAbs = Math.abs(A[pivot][col]);
          for (let row = col + 1; row < size; row++){
            const val = Math.abs(A[row][col]);
            if (val > maxAbs){
              maxAbs = val;
              pivot = row;
            }
          }
          if (maxAbs < 1e-9){
            throw new Error('行列が特異なため解けません');
          }
          if (pivot !== col){
            [A[col], A[pivot]] = [A[pivot], A[col]];
            [b[col], b[pivot]] = [b[pivot], b[col]];
          }
          const pivotVal = A[col][col];
          for (let j = col; j < size; j++){
            A[col][j] /= pivotVal;
          }
          b[col] /= pivotVal;
          for (let row = 0; row < size; row++){
            if (row === col) continue;
            const factor = A[row][col];
            if (Math.abs(factor) < 1e-12) continue;
            for (let j = col; j < size; j++){
              A[row][j] -= factor * A[col][j];
            }
            b[row] -= factor * b[col];
          }
        }
        solution = b;
      } catch (err){
        warnings.push(err.message || '回路の解が求まりませんでした');
        solution = Array(size).fill(0);
      }
    }

    const nodeVoltages = Object.create(null);
    nodeVoltages[groundId] = 0;
    activeNodes.forEach((id, idx) => {
      nodeVoltages[id] = solution[idx];
    });

    const elementStats = Object.create(null);
    let totalDelivered = 0;
    let totalDissipated = 0;

    elements.forEach(el => {
      if (!el || !el.nodeA || !el.nodeB) return;
      const va = nodeVoltages[el.nodeA] ?? 0;
      const vb = nodeVoltages[el.nodeB] ?? 0;
      const voltage = va - vb;
      let current = 0;
      let power = 0;
      if (el.type === 'power'){
        const voltageRating = clampVoltage(el.voltage ?? 0, 0);
        const resistance = clampResistance(el.resistance ?? 0.5, 0.5);
        current = (voltageRating - voltage) / resistance;
        power = voltageRating * current;
        accumulateBranch(el.nodeA, el.nodeB, current);
        if (power > 0){
          totalDelivered += power;
        }
      } else if (el.type === 'resistor' || el.type === 'wire' || el.type === 'ammeter'){
        const resistance = clampResistance(el.resistance ?? 1, 1);
        current = voltage / resistance;
        power = voltage * current;
        accumulateBranch(el.nodeA, el.nodeB, current);
        if (power > 0){
          totalDissipated += power;
        }
      } else if (el.type === 'voltmeter' || el.type === 'wattmeter'){
        const { key, sign } = canonicalPair(el.nodeA, el.nodeB);
        const stored = branchCurrents[key] || 0;
        current = stored * sign;
        power = voltage * current;
      }
      elementStats[el.id] = {
        voltage,
        current,
        power
      };
    });

    return {
      nodeVoltages,
      elementStats,
      branchCurrents,
      totals: { delivered: totalDelivered, dissipated: totalDissipated },
      warnings
    };
  }

  function create(root, awardXp){
    if (!root) throw new Error('MiniExp Circuit Simulator requires a container');

    const state = {
      nodes: [],
      elements: [],
      groundNodeId: null,
      selected: null,
      pendingTool: 'select',
      pendingNodes: [],
      solution: null,
      warnings: [],
      sessionXp: 0
    };

    function award(code, value, detail){
      if (typeof awardXp === 'function'){
        awardXp(code, value, detail);
      }
      state.sessionXp += value;
    }

    function addDefaultCircuit(){
      const groundId = createId('node');
      const positiveId = createId('node');
      const loadId = createId('node');
      state.nodes.push(
        { id: positiveId, x: 280, y: 140, name: 'ノードA' },
        { id: loadId, x: 520, y: 280, name: 'ノードB' },
        { id: groundId, x: 280, y: 420, name: 'グラウンド' }
      );
      state.groundNodeId = groundId;
      const powerId = createId('component');
      const resistorId = createId('component');
      const wireId = createId('component');
      state.elements.push(
        { id: powerId, type: 'power', nodeA: positiveId, nodeB: groundId, voltage: 12, resistance: 0.5, name: '電源' },
        { id: resistorId, type: 'resistor', nodeA: positiveId, nodeB: loadId, resistance: 120, name: 'R1' },
        { id: wireId, type: 'wire', nodeA: loadId, nodeB: groundId, resistance: 0.001, name: 'ライン' }
      );
    }

    addDefaultCircuit();

    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = '260px minmax(0, 1fr) 280px';
    wrapper.style.gap = '16px';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.padding = '18px';
    wrapper.style.background = 'linear-gradient(130deg,#f8fafc,#e2e8f0)';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';

    const leftPanel = document.createElement('div');
    leftPanel.style.display = 'flex';
    leftPanel.style.flexDirection = 'column';
    leftPanel.style.gap = '12px';
    leftPanel.style.padding = '16px';
    leftPanel.style.background = 'rgba(15,23,42,0.92)';
    leftPanel.style.color = '#e2e8f0';
    leftPanel.style.borderRadius = '16px';
    leftPanel.style.boxShadow = '0 12px 32px rgba(15,23,42,0.35)';

    const title = document.createElement('h2');
    title.textContent = '電気回路シミュレータ';
    title.style.margin = '0';
    title.style.fontSize = '22px';
    title.style.letterSpacing = '0.03em';

    const subtitle = document.createElement('div');
    subtitle.textContent = '電源・抵抗・計器をつないで直流回路を解析します。';
    subtitle.style.fontSize = '13px';
    subtitle.style.opacity = '0.85';

    const toolSection = document.createElement('div');
    toolSection.style.display = 'flex';
    toolSection.style.flexDirection = 'column';
    toolSection.style.gap = '8px';

    const toolHeader = document.createElement('div');
    toolHeader.textContent = 'ツール';
    toolHeader.style.fontWeight = '700';
    toolHeader.style.fontSize = '14px';

    const toolGrid = document.createElement('div');
    toolGrid.style.display = 'grid';
    toolGrid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    toolGrid.style.gap = '8px';

    function makeToolButton(label, toolId){
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.dataset.toolId = toolId;
      btn.style.padding = '10px';
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(148,163,184,0.35)';
      btn.style.background = 'rgba(30,64,175,0.25)';
      btn.style.color = '#e0f2fe';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        state.pendingTool = toolId;
        state.pendingNodes = [];
        render();
      });
      return btn;
    }

    const selectBtn = makeToolButton('選択・移動', 'select');
    selectBtn.style.gridColumn = '1 / -1';
    const addNodeBtn = makeToolButton('ノード追加', 'add-node');
    addNodeBtn.style.gridColumn = '1 / -1';

    toolGrid.appendChild(selectBtn);
    toolGrid.appendChild(addNodeBtn);

    Object.values(COMPONENT_TYPES).forEach(def => {
      const btn = makeToolButton(def.label, def.id);
      toolGrid.appendChild(btn);
    });

    const statusBox = document.createElement('div');
    statusBox.style.background = 'rgba(148,163,184,0.18)';
    statusBox.style.border = '1px solid rgba(148,163,184,0.35)';
    statusBox.style.borderRadius = '12px';
    statusBox.style.padding = '12px';
    statusBox.style.fontSize = '12px';
    statusBox.style.display = 'flex';
    statusBox.style.flexDirection = 'column';
    statusBox.style.gap = '4px';

    const summaryBox = document.createElement('div');
    summaryBox.style.background = 'rgba(14,165,233,0.18)';
    summaryBox.style.border = '1px solid rgba(56,189,248,0.5)';
    summaryBox.style.borderRadius = '12px';
    summaryBox.style.padding = '12px';
    summaryBox.style.fontSize = '12px';
    summaryBox.style.display = 'flex';
    summaryBox.style.flexDirection = 'column';
    summaryBox.style.gap = '4px';

    toolSection.appendChild(toolHeader);
    toolSection.appendChild(toolGrid);

    leftPanel.appendChild(title);
    leftPanel.appendChild(subtitle);
    leftPanel.appendChild(toolSection);
    leftPanel.appendChild(statusBox);
    leftPanel.appendChild(summaryBox);

    const workspaceWrap = document.createElement('div');
    workspaceWrap.style.position = 'relative';
    workspaceWrap.style.background = 'rgba(15,23,42,0.08)';
    workspaceWrap.style.borderRadius = '16px';
    workspaceWrap.style.border = '1px solid rgba(148,163,184,0.35)';
    workspaceWrap.style.boxShadow = '0 12px 36px rgba(15,23,42,0.2)';
    workspaceWrap.style.overflow = 'hidden';

    workspaceWrap.style.backgroundImage = `
      linear-gradient(0deg, rgba(148,163,184,0.18) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)
    `;
    workspaceWrap.style.backgroundSize = `${GRID_SIZE}px ${GRID_SIZE}px`;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${DEFAULT_BOARD.width} ${DEFAULT_BOARD.height}`);
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.minHeight = '460px';
    svg.style.cursor = 'pointer';

    workspaceWrap.appendChild(svg);

    const inspector = document.createElement('div');
    inspector.style.display = 'flex';
    inspector.style.flexDirection = 'column';
    inspector.style.gap = '12px';
    inspector.style.padding = '16px';
    inspector.style.background = 'rgba(255,255,255,0.82)';
    inspector.style.borderRadius = '16px';
    inspector.style.border = '1px solid rgba(148,163,184,0.35)';
    inspector.style.boxShadow = '0 12px 24px rgba(15,23,42,0.15)';

    const inspectorTitle = document.createElement('h3');
    inspectorTitle.textContent = 'インスペクタ';
    inspectorTitle.style.margin = '0';
    inspectorTitle.style.fontSize = '18px';
    inspectorTitle.style.color = '#1f2937';

    const inspectorBody = document.createElement('div');
    inspectorBody.style.fontSize = '13px';
    inspectorBody.style.display = 'flex';
    inspectorBody.style.flexDirection = 'column';
    inspectorBody.style.gap = '10px';

    inspector.appendChild(inspectorTitle);
    inspector.appendChild(inspectorBody);

    wrapper.appendChild(leftPanel);
    wrapper.appendChild(workspaceWrap);
    wrapper.appendChild(inspector);

    root.innerHTML = '';
    root.appendChild(wrapper);

    let dragging = null;

    svg.addEventListener('mousedown', (ev) => {
      const target = ev.target;
      if (target && target.dataset && target.dataset.nodeId){
        const nodeId = target.dataset.nodeId;
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node) return;
        const rect = svg.getBoundingClientRect();
        const offsetX = ev.clientX - rect.left;
        const offsetY = ev.clientY - rect.top;
        const sx = offsetX * (DEFAULT_BOARD.width / rect.width);
        const sy = offsetY * (DEFAULT_BOARD.height / rect.height);
        dragging = {
          nodeId,
          dx: sx - node.x,
          dy: sy - node.y
        };
        ev.preventDefault();
      }
    });

    const handleMouseMove = (ev) => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      const offsetX = ev.clientX - rect.left;
      const offsetY = ev.clientY - rect.top;
      const sx = offsetX * (DEFAULT_BOARD.width / rect.width);
      const sy = offsetY * (DEFAULT_BOARD.height / rect.height);
      const node = state.nodes.find(n => n.id === dragging.nodeId);
      if (!node) return;
      node.x = Math.max(32, Math.min(DEFAULT_BOARD.width - 32, sx - dragging.dx));
      node.y = Math.max(32, Math.min(DEFAULT_BOARD.height - 32, sy - dragging.dy));
      updateSolution();
      render();
    };

    const handleMouseUp = () => {
      dragging = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    svg.addEventListener('click', (ev) => {
      const rect = svg.getBoundingClientRect();
      const offsetX = ev.clientX - rect.left;
      const offsetY = ev.clientY - rect.top;
      const sx = offsetX * (DEFAULT_BOARD.width / rect.width);
      const sy = offsetY * (DEFAULT_BOARD.height / rect.height);

      if (state.pendingTool === 'add-node'){
        const snappedX = Math.round(sx / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(sy / GRID_SIZE) * GRID_SIZE;
        const id = createId('node');
        state.nodes.push({ id, x: snappedX, y: snappedY, name: `ノード${state.nodes.length + 1}` });
        if (!state.groundNodeId){
          state.groundNodeId = id;
        }
        award('circuit-node', 2, { id });
        updateSolution();
        render();
        return;
      }

      const target = ev.target;
      if (target && target.dataset){
        if (target.dataset.nodeId){
          const nodeId = target.dataset.nodeId;
          if (state.pendingTool && state.pendingTool !== 'select' && state.pendingTool !== 'add-node'){
            handlePendingNode(nodeId);
            return;
          }
          state.selected = { type: 'node', id: nodeId };
          render();
          return;
        }
        if (target.dataset.elementId){
          const elementId = target.dataset.elementId;
          state.selected = { type: 'element', id: elementId };
          render();
          return;
        }
      }

      if (state.pendingTool !== 'add-node'){
        state.selected = null;
        state.pendingNodes = [];
        render();
      }
    });

    function handlePendingNode(nodeId){
      const node = state.nodes.find(n => n.id === nodeId);
      if (!node) return;
      state.pendingNodes.push(nodeId);
      if (state.pendingNodes.length === 2){
        const [a, b] = state.pendingNodes;
        if (a === b){
          state.pendingNodes = [];
          render();
          return;
        }
        const type = state.pendingTool;
        if (type && COMPONENT_TYPES[type]){
          const def = COMPONENT_TYPES[type];
          const props = def.defaultProps ? def.defaultProps() : {};
          const id = createId('component');
          const element = Object.assign({ id, type, nodeA: a, nodeB: b, name: `${def.label}${state.elements.length + 1}` }, props);
          state.elements.push(element);
          state.pendingNodes = [];
          if (!def.isProbe){
            award('circuit-add', 4, { type });
          } else {
            award('circuit-probe', 2, { type });
          }
          updateSolution();
          state.selected = { type: 'element', id };
        }
      }
      render();
    }

    function updateSolution(){
      const result = solveCircuit(state.nodes, state.elements, state.groundNodeId);
      state.solution = result;
      state.warnings = result.warnings;
    }

    function deleteElement(id){
      const idx = state.elements.findIndex(el => el.id === id);
      if (idx >= 0){
        state.elements.splice(idx, 1);
        updateSolution();
        render();
      }
    }

    function deleteNode(id){
      const idx = state.nodes.findIndex(n => n.id === id);
      if (idx >= 0){
        state.nodes.splice(idx, 1);
        state.elements = state.elements.filter(el => el.nodeA !== id && el.nodeB !== id);
        if (state.groundNodeId === id){
          state.groundNodeId = state.nodes[0]?.id || null;
        }
        updateSolution();
        render();
      }
    }

    function renderToolbarState(){
      const buttons = toolGrid.querySelectorAll('button');
      buttons.forEach(btn => {
        const toolId = btn.dataset.toolId;
        if (toolId === state.pendingTool){
          btn.style.background = 'linear-gradient(135deg,#38bdf8,#2563eb)';
          btn.style.color = '#0f172a';
        } else {
          btn.style.background = 'rgba(30,64,175,0.25)';
          btn.style.color = '#e0f2fe';
        }
      });
    }

    function renderStatus(){
      statusBox.innerHTML = '';
      const activeTool = state.pendingTool;
      const lineTool = document.createElement('div');
      lineTool.textContent = `モード: ${activeTool === 'select' ? '選択' : activeTool === 'add-node' ? 'ノード追加' : (COMPONENT_TYPES[activeTool]?.label || activeTool)}`;
      statusBox.appendChild(lineTool);

      if (state.pendingNodes.length === 1){
        const node = state.nodes.find(n => n.id === state.pendingNodes[0]);
        if (node){
          const l = document.createElement('div');
          l.textContent = `接続開始: ${node.name || node.id}`;
          statusBox.appendChild(l);
        }
      }

      const groundNode = state.nodes.find(n => n.id === state.groundNodeId);
      const groundLine = document.createElement('div');
      groundLine.textContent = `グラウンド: ${groundNode ? (groundNode.name || groundNode.id) : '未設定'}`;
      statusBox.appendChild(groundLine);

      if (state.warnings && state.warnings.length){
        state.warnings.forEach(w => {
          const warn = document.createElement('div');
          warn.textContent = `⚠ ${w}`;
          warn.style.color = '#fcd34d';
          statusBox.appendChild(warn);
        });
      }
    }

    function renderSummary(){
      summaryBox.innerHTML = '';
      const solution = state.solution;
      if (!solution){
        const msg = document.createElement('div');
        msg.textContent = '解析待ちです';
        summaryBox.appendChild(msg);
        return;
      }
      const { totals, nodeVoltages } = solution;
      const deliveredLine = document.createElement('div');
      deliveredLine.textContent = `供給電力: ${formatNumber(totals.delivered, 2)} W`;
      summaryBox.appendChild(deliveredLine);
      const dissipatedLine = document.createElement('div');
      dissipatedLine.textContent = `消費電力: ${formatNumber(totals.dissipated, 2)} W`;
      summaryBox.appendChild(dissipatedLine);
      const xpLine = document.createElement('div');
      xpLine.textContent = `セッションXP: ${state.sessionXp}`;
      summaryBox.appendChild(xpLine);
      const voltList = document.createElement('div');
      voltList.textContent = 'ノード電位:';
      summaryBox.appendChild(voltList);
      state.nodes.forEach(node => {
        const value = nodeVoltages[node.id];
        if (value === undefined) return;
        const entry = document.createElement('div');
        entry.textContent = `- ${(node.name || node.id)}: ${formatNumber(value, 2)} V`;
        entry.style.paddingLeft = '8px';
        summaryBox.appendChild(entry);
      });
    }

    function drawBoard(){
      while (svg.firstChild){
        svg.removeChild(svg.firstChild);
      }

      const solution = state.solution;
      const voltages = solution ? solution.nodeVoltages : {};
      const stats = solution ? solution.elementStats : {};

      state.elements.forEach(el => {
        const nodeA = state.nodes.find(n => n.id === el.nodeA);
        const nodeB = state.nodes.find(n => n.id === el.nodeB);
        if (!nodeA || !nodeB) return;
        const group = document.createElementNS(SVG_NS, 'g');
        group.dataset.elementId = el.id;
        group.style.cursor = 'pointer';

        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', nodeA.x);
        line.setAttribute('y1', nodeA.y);
        line.setAttribute('x2', nodeB.x);
        line.setAttribute('y2', nodeB.y);
        line.setAttribute('stroke-width', el.type === 'wire' ? 6 : 4);
        let color = '#0f172a';
        if (el.type === 'resistor') color = '#f97316';
        else if (el.type === 'power') color = '#4f46e5';
        else if (el.type === 'ammeter') color = '#14b8a6';
        else if (el.type === 'voltmeter') color = '#0ea5e9';
        else if (el.type === 'wattmeter') color = '#ec4899';
        else color = '#475569';
        if (state.selected && state.selected.type === 'element' && state.selected.id === el.id){
          line.setAttribute('stroke', '#22d3ee');
          line.setAttribute('stroke-width', 8);
        } else {
          line.setAttribute('stroke', color);
        }
        line.setAttribute('stroke-linecap', 'round');
        group.appendChild(line);

        const midX = (nodeA.x + nodeB.x) / 2;
        const midY = (nodeA.y + nodeB.y) / 2;
        const textBg = document.createElementNS(SVG_NS, 'rect');
        textBg.setAttribute('x', midX - 70);
        textBg.setAttribute('y', midY - 24);
        textBg.setAttribute('width', 140);
        textBg.setAttribute('height', 32);
        textBg.setAttribute('rx', 10);
        textBg.setAttribute('fill', 'rgba(248,250,252,0.85)');
        textBg.setAttribute('stroke', 'rgba(148,163,184,0.5)');
        textBg.setAttribute('stroke-width', '1');

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', midX);
        label.setAttribute('y', midY - 4);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '11');
        label.setAttribute('font-family', '"Noto Sans JP", sans-serif');
        label.setAttribute('fill', '#0f172a');
        const stat = stats[el.id] || { voltage: 0, current: 0, power: 0 };
        let line1 = '';
        if (el.type === 'resistor' || el.type === 'wire' || el.type === 'ammeter'){
          line1 = `${el.name || el.type}  ${formatNumber(el.resistance ?? 0, 2)}Ω`;
        } else if (el.type === 'power'){
          line1 = `${el.name || '電源'}  ${formatNumber(el.voltage ?? 0, 2)}V`; 
        } else if (el.type === 'voltmeter'){
          line1 = `${el.name || '電圧計'}`;
        } else if (el.type === 'wattmeter'){
          line1 = `${el.name || '電力計'}`;
        }
        const line2 = `V:${formatNumber(stat.voltage, 2)}V  I:${formatNumber(stat.current, 2)}A`;
        const line3 = `P:${formatNumber(stat.power, 2)}W`;

        const textLine1 = document.createElementNS(SVG_NS, 'tspan');
        textLine1.setAttribute('x', midX);
        textLine1.setAttribute('dy', '0');
        textLine1.textContent = line1;

        const textLine2 = document.createElementNS(SVG_NS, 'tspan');
        textLine2.setAttribute('x', midX);
        textLine2.setAttribute('dy', '12');
        textLine2.textContent = line2;

        const textLine3 = document.createElementNS(SVG_NS, 'tspan');
        textLine3.setAttribute('x', midX);
        textLine3.setAttribute('dy', '12');
        textLine3.textContent = line3;

        label.appendChild(textLine1);
        label.appendChild(textLine2);
        label.appendChild(textLine3);

        group.appendChild(textBg);
        group.appendChild(label);

        group.addEventListener('click', (ev) => {
          ev.stopPropagation();
          state.selected = { type: 'element', id: el.id };
          render();
        });

        svg.appendChild(group);
      });

      state.nodes.forEach(node => {
        const group = document.createElementNS(SVG_NS, 'g');
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', NODE_RADIUS);
        circle.dataset.nodeId = node.id;
        circle.style.cursor = 'pointer';
        const pendingIndex = state.pendingNodes.indexOf(node.id);
        if (state.selected && state.selected.type === 'node' && state.selected.id === node.id){
          circle.setAttribute('fill', '#22d3ee');
          circle.setAttribute('stroke', '#0f172a');
          circle.setAttribute('stroke-width', '3');
        } else if (pendingIndex !== -1){
          circle.setAttribute('fill', '#fcd34d');
          circle.setAttribute('stroke', '#b45309');
          circle.setAttribute('stroke-width', '3');
        } else if (state.groundNodeId === node.id){
          circle.setAttribute('fill', '#0f172a');
          circle.setAttribute('stroke', '#38bdf8');
          circle.setAttribute('stroke-width', '3');
        } else {
          circle.setAttribute('fill', '#38bdf8');
          circle.setAttribute('stroke', '#0f172a');
          circle.setAttribute('stroke-width', '2');
        }
        group.appendChild(circle);

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', node.x);
        label.setAttribute('y', node.y - NODE_RADIUS - 8);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '12');
        label.setAttribute('font-family', '"Noto Sans JP", sans-serif');
        label.setAttribute('fill', '#0f172a');
        label.textContent = node.name || node.id;
        group.appendChild(label);

        const voltageValue = voltages[node.id];
        if (Number.isFinite(voltageValue)){
          const voltLabel = document.createElementNS(SVG_NS, 'text');
          voltLabel.setAttribute('x', node.x);
          voltLabel.setAttribute('y', node.y + NODE_RADIUS + 16);
          voltLabel.setAttribute('text-anchor', 'middle');
          voltLabel.setAttribute('font-size', '11');
          voltLabel.setAttribute('fill', '#1f2937');
          voltLabel.textContent = `${formatNumber(voltageValue, 2)} V`;
          group.appendChild(voltLabel);
        }

        group.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (state.pendingTool && state.pendingTool !== 'select' && state.pendingTool !== 'add-node'){
            handlePendingNode(node.id);
          } else {
            state.selected = { type: 'node', id: node.id };
            render();
          }
        });

        svg.appendChild(group);
      });
    }

    function renderInspector(){
      inspectorBody.innerHTML = '';
      if (!state.selected){
        const msg = document.createElement('div');
        msg.textContent = 'ノードまたはコンポーネントを選択してください。';
        inspectorBody.appendChild(msg);
        return;
      }

      if (state.selected.type === 'node'){
        const node = state.nodes.find(n => n.id === state.selected.id);
        if (!node){
          inspectorBody.textContent = 'ノードが見つかりません';
          return;
        }
        const title = document.createElement('div');
        title.textContent = `ノード: ${node.name || node.id}`;
        title.style.fontWeight = '700';
        inspectorBody.appendChild(title);

        const nameLabel = document.createElement('label');
        nameLabel.textContent = '名称';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = node.name || '';
        nameInput.style.padding = '8px';
        nameInput.style.borderRadius = '8px';
        nameInput.style.border = '1px solid rgba(148,163,184,0.45)';
        nameInput.addEventListener('change', () => {
          node.name = nameInput.value || '';
          render();
        });
        nameLabel.appendChild(nameInput);
        inspectorBody.appendChild(nameLabel);

        const voltageValue = state.solution?.nodeVoltages?.[node.id];
        const voltageLine = document.createElement('div');
        voltageLine.textContent = `電位: ${formatNumber(voltageValue, 2)} V`;
        inspectorBody.appendChild(voltageLine);

        const groundBtn = document.createElement('button');
        groundBtn.textContent = 'このノードをグラウンドに設定';
        groundBtn.style.padding = '8px';
        groundBtn.style.borderRadius = '8px';
        groundBtn.style.border = '1px solid #0ea5e9';
        groundBtn.style.background = '#0ea5e9';
        groundBtn.style.color = '#0f172a';
        groundBtn.style.cursor = 'pointer';
        groundBtn.addEventListener('click', () => {
          state.groundNodeId = node.id;
          updateSolution();
          render();
        });
        inspectorBody.appendChild(groundBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'ノード削除';
        deleteBtn.style.padding = '8px';
        deleteBtn.style.borderRadius = '8px';
        deleteBtn.style.border = '1px solid #ef4444';
        deleteBtn.style.background = 'rgba(239,68,68,0.15)';
        deleteBtn.style.color = '#ef4444';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.addEventListener('click', () => {
          if (confirm('このノードと接続部品を削除しますか？')){
            deleteNode(node.id);
            state.selected = null;
            render();
          }
        });
        inspectorBody.appendChild(deleteBtn);
        return;
      }

      if (state.selected.type === 'element'){
        const element = state.elements.find(el => el.id === state.selected.id);
        if (!element){
          inspectorBody.textContent = 'コンポーネントが見つかりません';
          return;
        }
        const stat = state.solution?.elementStats?.[element.id] || { voltage: 0, current: 0, power: 0 };
        const nodeA = state.nodes.find(n => n.id === element.nodeA);
        const nodeB = state.nodes.find(n => n.id === element.nodeB);

        const header = document.createElement('div');
        header.textContent = `${COMPONENT_TYPES[element.type]?.label || element.type}`;
        header.style.fontWeight = '700';
        inspectorBody.appendChild(header);

        const nameLabel = document.createElement('label');
        nameLabel.textContent = '名称';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = element.name || '';
        nameInput.style.padding = '8px';
        nameInput.style.borderRadius = '8px';
        nameInput.style.border = '1px solid rgba(148,163,184,0.45)';
        nameInput.addEventListener('change', () => {
          element.name = nameInput.value || '';
          render();
        });
        nameLabel.appendChild(nameInput);
        inspectorBody.appendChild(nameLabel);

        if (element.type === 'resistor' || element.type === 'wire' || element.type === 'ammeter'){
          const resLabel = document.createElement('label');
          resLabel.textContent = '抵抗 (Ω)';
          const resInput = document.createElement('input');
          resInput.type = 'number';
          resInput.step = '0.001';
          resInput.value = element.resistance ?? 1;
          resInput.style.padding = '8px';
          resInput.style.borderRadius = '8px';
          resInput.style.border = '1px solid rgba(148,163,184,0.45)';
          resInput.addEventListener('change', () => {
            element.resistance = clampResistance(resInput.value, element.resistance ?? 1);
            updateSolution();
            render();
          });
          resLabel.appendChild(resInput);
          inspectorBody.appendChild(resLabel);
        }

        if (element.type === 'power'){
          const voltLabel = document.createElement('label');
          voltLabel.textContent = '電圧 (V)';
          const voltInput = document.createElement('input');
          voltInput.type = 'number';
          voltInput.step = '0.1';
          voltInput.value = element.voltage ?? 0;
          voltInput.style.padding = '8px';
          voltInput.style.borderRadius = '8px';
          voltInput.style.border = '1px solid rgba(148,163,184,0.45)';
          voltInput.addEventListener('change', () => {
            element.voltage = clampVoltage(voltInput.value, element.voltage ?? 0);
            updateSolution();
            render();
          });
          voltLabel.appendChild(voltInput);
          inspectorBody.appendChild(voltLabel);

          const resLabel = document.createElement('label');
          resLabel.textContent = '内部抵抗 (Ω)';
          const resInput = document.createElement('input');
          resInput.type = 'number';
          resInput.step = '0.01';
          resInput.value = element.resistance ?? 0.5;
          resInput.style.padding = '8px';
          resInput.style.borderRadius = '8px';
          resInput.style.border = '1px solid rgba(148,163,184,0.45)';
          resInput.addEventListener('change', () => {
            element.resistance = clampResistance(resInput.value, element.resistance ?? 0.5);
            updateSolution();
            render();
          });
          resLabel.appendChild(resInput);
          inspectorBody.appendChild(resLabel);
        }

        if (element.type === 'voltmeter' || element.type === 'wattmeter'){
          const note = document.createElement('div');
          note.textContent = '計器は回路には影響しません。ノード間の実測値を表示します。';
          note.style.fontSize = '12px';
          note.style.color = '#334155';
          inspectorBody.appendChild(note);
        }

        const nodesLine = document.createElement('div');
        nodesLine.textContent = `接続: ${(nodeA?.name || element.nodeA)} ↔ ${(nodeB?.name || element.nodeB)}`;
        inspectorBody.appendChild(nodesLine);

        const statsList = document.createElement('div');
        statsList.innerHTML = `電圧: <strong>${formatNumber(stat.voltage, 3)} V</strong><br>電流: <strong>${formatNumber(stat.current, 3)} A</strong><br>電力: <strong>${formatNumber(stat.power, 3)} W</strong>`;
        inspectorBody.appendChild(statsList);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'コンポーネント削除';
        deleteBtn.style.padding = '8px';
        deleteBtn.style.borderRadius = '8px';
        deleteBtn.style.border = '1px solid #ef4444';
        deleteBtn.style.background = 'rgba(239,68,68,0.12)';
        deleteBtn.style.color = '#b91c1c';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.addEventListener('click', () => {
          if (confirm('このコンポーネントを削除しますか？')){
            deleteElement(element.id);
            state.selected = null;
            render();
          }
        });
        inspectorBody.appendChild(deleteBtn);
      }
    }

    function render(){
      renderToolbarState();
      renderStatus();
      renderSummary();
      drawBoard();
      renderInspector();
    }

    updateSolution();
    render();

    function start(){ /* noop */ }
    function stop(){ /* noop */ }
    function destroy(){
      try {
        if (root.contains(wrapper)) root.removeChild(wrapper);
      } catch {}
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

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
    id: 'circuit_simulator',
    name: '電気回路シミュレータ',
    description: 'DC回路を構成して電圧・電流・電力をリアルタイム計測するトイ系シミュレータ',
    category: 'トイ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();
