(function(){
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const MIN_RESISTANCE = 1e-4;
  const MAX_RESISTANCE = 1e12;
  const DEFAULT_BOARD = { width: 760, height: 520 };
  const NODE_RADIUS = 14;
  const GRID_SIZE = 32;

  const COLOR_THEMES = {
    light: {
      wrapperBg: 'linear-gradient(130deg,#f8fafc,#e2e8f0)',
      textPrimary: '#0f172a',
      mutedText: '#475569',
      leftPanelBg: 'rgba(15,23,42,0.92)',
      leftPanelText: '#e2e8f0',
      leftPanelShadow: '0 12px 32px rgba(15,23,42,0.35)',
      toolButtonBg: 'rgba(30,64,175,0.25)',
      toolButtonBorder: '1px solid rgba(148,163,184,0.35)',
      toolButtonText: '#e0f2fe',
      toolButtonActiveBg: 'linear-gradient(135deg,#38bdf8,#2563eb)',
      toolButtonActiveText: '#0f172a',
      toolButtonActiveBorder: '1px solid rgba(148,163,184,0.45)',
      statusBg: 'rgba(148,163,184,0.18)',
      statusBorder: '1px solid rgba(148,163,184,0.35)',
      statusWarning: '#fcd34d',
      summaryBg: 'rgba(14,165,233,0.18)',
      summaryBorder: '1px solid rgba(56,189,248,0.5)',
      workspaceBg: 'rgba(15,23,42,0.08)',
      workspaceBorder: '1px solid rgba(148,163,184,0.35)',
      workspaceShadow: '0 12px 36px rgba(15,23,42,0.2)',
      gridLine: 'rgba(148,163,184,0.18)',
      svgBg: '#f8fafc',
      inspectorBg: 'rgba(255,255,255,0.9)',
      inspectorBorder: '1px solid rgba(148,163,184,0.35)',
      inspectorText: '#1f2937',
      inspectorMuted: '#475569',
      inputBg: '#ffffff',
      inputBorder: '1px solid rgba(148,163,184,0.45)',
      inputText: '#0f172a',
      primaryButtonBg: '#0ea5e9',
      primaryButtonBorder: '#0ea5e9',
      primaryButtonText: '#0f172a',
      dangerButtonBg: 'rgba(239,68,68,0.15)',
      dangerButtonBorder: '#ef4444',
      dangerButtonText: '#ef4444',
      cardBg: 'rgba(248,250,252,0.85)',
      cardBorder: 'rgba(148,163,184,0.5)',
      nodeLabel: '#0f172a',
      voltageLabel: '#1f2937',
      groundFill: '#0f172a',
      groundStroke: '#38bdf8'
    },
    dark: {
      wrapperBg: 'radial-gradient(circle at top, rgba(15,23,42,0.9), rgba(2,6,23,0.95))',
      textPrimary: '#e2e8f0',
      mutedText: '#cbd5f5',
      leftPanelBg: 'rgba(15,23,42,0.96)',
      leftPanelText: '#e2e8f0',
      leftPanelShadow: '0 20px 44px rgba(2,6,23,0.7)',
      toolButtonBg: 'rgba(30,64,175,0.4)',
      toolButtonBorder: '1px solid rgba(96,165,250,0.4)',
      toolButtonText: '#e0f2fe',
      toolButtonActiveBg: 'linear-gradient(135deg,#38bdf8,#1d4ed8)',
      toolButtonActiveText: '#0f172a',
      toolButtonActiveBorder: '1px solid rgba(125,211,252,0.75)',
      statusBg: 'rgba(30,41,59,0.78)',
      statusBorder: '1px solid rgba(148,163,184,0.45)',
      statusWarning: '#facc15',
      summaryBg: 'rgba(14,165,233,0.28)',
      summaryBorder: '1px solid rgba(56,189,248,0.55)',
      workspaceBg: 'rgba(15,23,42,0.55)',
      workspaceBorder: '1px solid rgba(148,163,184,0.45)',
      workspaceShadow: '0 18px 44px rgba(2,6,23,0.65)',
      gridLine: 'rgba(94,234,212,0.25)',
      svgBg: '#0f172a',
      inspectorBg: 'rgba(15,23,42,0.92)',
      inspectorBorder: '1px solid rgba(59,130,246,0.45)',
      inspectorText: '#e2e8f0',
      inspectorMuted: '#cbd5f5',
      inputBg: 'rgba(15,23,42,0.85)',
      inputBorder: '1px solid rgba(94,234,212,0.35)',
      inputText: '#e2e8f0',
      primaryButtonBg: '#0284c7',
      primaryButtonBorder: '#0ea5e9',
      primaryButtonText: '#e0f2fe',
      dangerButtonBg: 'rgba(239,68,68,0.25)',
      dangerButtonBorder: '#f87171',
      dangerButtonText: '#fca5a5',
      cardBg: 'rgba(15,23,42,0.85)',
      cardBorder: 'rgba(148,163,184,0.5)',
      nodeLabel: '#e2e8f0',
      voltageLabel: '#bae6fd',
      groundFill: '#0f172a',
      groundStroke: '#38bdf8'
    }
  };

  function detectColorScheme(){
    const doc = document.documentElement;
    const body = document.body;
    const dataTheme = (doc?.dataset?.theme || body?.dataset?.theme || '').toLowerCase();
    if (dataTheme === 'dark') return 'dark';
    if (dataTheme === 'light') return 'light';
    const classes = new Set([
      ...(doc ? Array.from(doc.classList) : []),
      ...(body ? Array.from(body.classList) : [])
    ]);
    for (const cls of classes){
      if (cls && /dark/.test(cls)) return 'dark';
      if (cls && /light/.test(cls)) return 'light';
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

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
    capacitor: {
      id: 'capacitor',
      label: 'コンデンサ',
      description: '容量性リアクタンス素子',
      defaultProps: () => ({ capacitance: 1e-6 })
    },
    inductor: {
      id: 'inductor',
      label: 'インダクタ',
      description: '誘導性リアクタンス素子',
      defaultProps: () => ({ inductance: 1e-3 })
    },
    power: {
      id: 'power',
      label: '電源',
      description: '理想電圧源＋内部抵抗',
      defaultProps: () => ({ voltage: 12, resistance: 0.5 })
    },
    ac_source: {
      id: 'ac_source',
      label: 'AC電源',
      description: '正弦波電圧源（RMS設定）',
      defaultProps: () => ({ amplitude: 5, phase: 0, resistance: 0.2 })
    },
    current_source: {
      id: 'current_source',
      label: '電流源',
      description: '理想定電流源',
      defaultProps: () => ({ current: 0.05, phase: 0 })
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
    if (abs >= 1000 || abs < 0.0001) return value.toExponential(2);
    return value.toFixed(digits);
  }

  function clampPhase(value, fallback = 0){
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    let phase = num % 360;
    if (phase > 180) phase -= 360;
    if (phase <= -180) phase += 360;
    return phase;
  }

  function clampCapacitance(value, fallback = 1e-6){
    const num = Number(value);
    if (!Number.isFinite(num) || num === 0) return fallback;
    const abs = Math.abs(num);
    if (abs < 1e-12) return Math.sign(num) * 1e-12;
    if (abs > 1) return Math.sign(num) * 1;
    return num;
  }

  function clampInductance(value, fallback = 1e-3){
    const num = Number(value);
    if (!Number.isFinite(num) || num === 0) return fallback;
    const abs = Math.abs(num);
    if (abs < 1e-9) return Math.sign(num) * 1e-9;
    if (abs > 10) return Math.sign(num) * 10;
    return num;
  }

  function clampCurrent(value, fallback = 0.01){
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    if (num > 1000) return 1000;
    if (num < -1000) return -1000;
    return num;
  }

  function clampFrequency(value, fallback = 50){
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    if (num < 0) return 0;
    if (num > 1e6) return 1e6;
    return num;
  }

  function isComplex(value){
    return value && typeof value === 'object' && Number.isFinite(value.re) && Number.isFinite(value.im);
  }

  function toComplex(value){
    if (isComplex(value)) return { re: value.re, im: value.im };
    const num = Number(value);
    if (!Number.isFinite(num)) return { re: 0, im: 0 };
    return { re: num, im: 0 };
  }

  function complexAdd(a, b){
    const x = toComplex(a);
    const y = toComplex(b);
    return { re: x.re + y.re, im: x.im + y.im };
  }

  function complexSub(a, b){
    const x = toComplex(a);
    const y = toComplex(b);
    return { re: x.re - y.re, im: x.im - y.im };
  }

  function complexMul(a, b){
    const x = toComplex(a);
    const y = toComplex(b);
    return {
      re: x.re * y.re - x.im * y.im,
      im: x.re * y.im + x.im * y.re
    };
  }

  function complexDiv(a, b){
    const x = toComplex(a);
    const y = toComplex(b);
    const denom = y.re * y.re + y.im * y.im;
    if (denom === 0) return { re: 0, im: 0 };
    return {
      re: (x.re * y.re + x.im * y.im) / denom,
      im: (x.im * y.re - x.re * y.im) / denom
    };
  }

  function complexConj(value){
    const x = toComplex(value);
    return { re: x.re, im: -x.im };
  }

  function complexAbs(value){
    const x = toComplex(value);
    return Math.hypot(x.re, x.im);
  }

  function complexArgDeg(value){
    const x = toComplex(value);
    return Math.atan2(x.im, x.re) * 180 / Math.PI;
  }

  function complexIsZero(value, epsilon = 1e-12){
    return complexAbs(value) < epsilon;
  }

  function polarToComplex(magnitude, phaseDeg){
    const mag = Number(magnitude) || 0;
    const rad = (Number(phaseDeg) || 0) * Math.PI / 180;
    return { re: mag * Math.cos(rad), im: mag * Math.sin(rad) };
  }

  function formatQuantity(value, unit, mode, digits = 3){
    if (mode === 'ac' && isComplex(value)){
      const mag = complexAbs(value);
      const phase = complexArgDeg(value);
      return `${formatNumber(mag, digits)} ${unit} ∠${formatNumber(phase, 1)}°`;
    }
    const real = isComplex(value) ? value.re : value;
    return `${formatNumber(real, digits)} ${unit}`;
  }

  function formatPowerQuantity(value, mode, digits = 3){
    if (mode === 'ac' && isComplex(value)){
      const real = value.re;
      const reactive = value.im;
      const apparent = complexAbs(value);
      return `${formatNumber(real, digits)} W / ${formatNumber(reactive, digits)} var (|S|=${formatNumber(apparent, digits)} VA)`;
    }
    const real = isComplex(value) ? value.re : value;
    return `${formatNumber(real, digits)} W`;
  }

  function createId(prefix){
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function canonicalPair(a, b){
    return a < b ? { key: `${a}|${b}`, sign: 1 } : { key: `${b}|${a}`, sign: -1 };
  }

  function solveCircuit(nodes, elements, groundId, options = {}){
    const mode = options.mode === 'ac' ? 'ac' : 'dc';
    const frequencyHz = clampFrequency(options.frequencyHz ?? 50, 50);
    const omega = 2 * Math.PI * frequencyHz;
    const isAC = mode === 'ac';
    const nodeIds = nodes.map(n => n.id);
    if (nodeIds.length === 0) {
      return {
        nodeVoltages: {},
        elementStats: {},
        branchCurrents: {},
        totals: { delivered: { re: 0, im: 0 }, dissipated: { re: 0, im: 0 } },
        warnings: ['ノードがありません'],
        diagnostics: []
      };
    }

    if (!nodeIds.includes(groundId)) {
      groundId = nodeIds[0];
    }

    const activeNodes = nodeIds.filter(id => id !== groundId);
    const size = activeNodes.length;
    const indexMap = Object.create(null);
    activeNodes.forEach((id, idx) => { indexMap[id] = idx; });

    const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ re: 0, im: 0 })));
    const vector = Array.from({ length: size }, () => ({ re: 0, im: 0 }));

    const warnings = [];
    const diagnostics = [];

    function addConductance(nodeA, nodeB, conductance){
      const g = toComplex(conductance);
      if (complexIsZero(g)) return;
      const isGroundA = nodeA === groundId;
      const isGroundB = nodeB === groundId;
      if (!isGroundA){
        const i = indexMap[nodeA];
        if (i !== undefined) {
          matrix[i][i] = complexAdd(matrix[i][i], g);
        }
      }
      if (!isGroundB){
        const j = indexMap[nodeB];
        if (j !== undefined) {
          matrix[j][j] = complexAdd(matrix[j][j], g);
        }
      }
      if (!isGroundA && !isGroundB){
        const i = indexMap[nodeA];
        const j = indexMap[nodeB];
        if (i !== undefined && j !== undefined) {
          matrix[i][j] = complexSub(matrix[i][j], g);
          matrix[j][i] = complexSub(matrix[j][i], g);
        }
      }
    }

    function addCurrentSource(posNode, negNode, current){
      const value = toComplex(current);
      if (complexIsZero(value)) return;
      if (posNode !== groundId){
        const idx = indexMap[posNode];
        if (idx !== undefined) vector[idx] = complexAdd(vector[idx], value);
      }
      if (negNode !== groundId){
        const idx = indexMap[negNode];
        if (idx !== undefined) vector[idx] = complexSub(vector[idx], value);
      }
    }

    const branchCurrents = Object.create(null);

    function accumulateBranch(nodeA, nodeB, currentFromAtoB){
      const value = toComplex(currentFromAtoB);
      if (complexIsZero(value)) return;
      const { key, sign } = canonicalPair(nodeA, nodeB);
      const prev = branchCurrents[key] || { re: 0, im: 0 };
      branchCurrents[key] = complexAdd(prev, complexMul(value, { re: sign, im: 0 }));
    }

    const conductiveElements = [];
    const connectionCount = Object.create(null);

    elements.forEach(el => {
      if (!el || !el.nodeA || !el.nodeB) return;
      if (el.type === 'voltmeter' || el.type === 'wattmeter') return;
      if (el.type === 'capacitor' && (!isAC || omega === 0)) return;
      conductiveElements.push(el);
      connectionCount[el.nodeA] = (connectionCount[el.nodeA] || 0) + 1;
      connectionCount[el.nodeB] = (connectionCount[el.nodeB] || 0) + 1;
    });

    conductiveElements.forEach(el => {
      const { nodeA, nodeB } = el;
      if (!nodeIds.includes(nodeA) || !nodeIds.includes(nodeB)) return;
      if (el.type === 'power' || el.type === 'ac_source') {
        const resistance = clampResistance(el.resistance ?? 0.5, 0.5);
        const conductance = resistance === 0 ? 0 : 1 / Math.abs(resistance);
        addConductance(nodeA, nodeB, conductance);
        let sourceVoltage = 0;
        if (el.type === 'ac_source'){
          const amplitude = Number(el.amplitude ?? 0);
          const phase = clampPhase(el.phase ?? 0, 0);
          sourceVoltage = polarToComplex(amplitude, phase);
        } else {
          sourceVoltage = toComplex(clampVoltage(el.voltage ?? 0, 0));
        }
        const current = resistance === 0 ? { re: 0, im: 0 } : complexDiv(sourceVoltage, resistance);
        addCurrentSource(nodeA, nodeB, current);
      } else if (el.type === 'current_source'){
        const currentAmp = clampCurrent(el.current ?? 0.01, 0.01);
        const phase = clampPhase(el.phase ?? 0, 0);
        const value = isAC ? polarToComplex(currentAmp, phase) : { re: currentAmp, im: 0 };
        addCurrentSource(nodeA, nodeB, value);
      } else {
        let admittance = null;
        if (el.type === 'capacitor'){
          const capacitance = clampCapacitance(el.capacitance ?? 1e-6, 1e-6);
          if (isAC && omega > 0){
            admittance = { re: 0, im: omega * capacitance };
          } else {
            admittance = { re: 0, im: 0 };
          }
        } else if (el.type === 'inductor'){
          const inductance = clampInductance(el.inductance ?? 1e-3, 1e-3);
          if (isAC && omega > 0){
            admittance = { re: 0, im: -1 / (omega * inductance) };
          } else {
            const res = clampResistance(MIN_RESISTANCE, MIN_RESISTANCE);
            admittance = { re: 1 / res, im: 0 };
          }
        } else {
          const res = clampResistance(el.resistance ?? 1, 1);
          const conductance = 1 / Math.abs(res);
          admittance = { re: conductance, im: 0 };
        }
        if (admittance) addConductance(nodeA, nodeB, admittance);
      }
    });

    let solution = Array(size).fill({ re: 0, im: 0 });
    if (size > 0){
      try {
        const A = matrix.map(row => row.map(cell => ({ re: cell.re, im: cell.im })));
        const b = vector.map(cell => ({ re: cell.re, im: cell.im }));
        for (let col = 0; col < size; col++){
          let pivot = col;
          let maxAbs = complexAbs(A[pivot][col]);
          for (let row = col + 1; row < size; row++){
            const val = complexAbs(A[row][col]);
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
            A[col][j] = complexDiv(A[col][j], pivotVal);
          }
          b[col] = complexDiv(b[col], pivotVal);
          for (let row = 0; row < size; row++){
            if (row === col) continue;
            const factor = A[row][col];
            if (complexAbs(factor) < 1e-12) continue;
            for (let j = col; j < size; j++){
              A[row][j] = complexSub(A[row][j], complexMul(factor, A[col][j]));
            }
            b[row] = complexSub(b[row], complexMul(factor, b[col]));
          }
        }
        solution = b;
      } catch (err){
        warnings.push(err.message || '回路の解が求まりませんでした');
        solution = Array(size).fill(0);
      }
    }

    const nodeVoltages = Object.create(null);
    nodeVoltages[groundId] = { re: 0, im: 0 };
    activeNodes.forEach((id, idx) => {
      nodeVoltages[id] = solution[idx];
    });

    const elementStats = Object.create(null);
    let totalDelivered = { re: 0, im: 0 };
    let totalDissipated = { re: 0, im: 0 };

    elements.forEach(el => {
      if (!el || !el.nodeA || !el.nodeB) return;
      const va = nodeVoltages[el.nodeA] ?? { re: 0, im: 0 };
      const vb = nodeVoltages[el.nodeB] ?? { re: 0, im: 0 };
      const voltage = complexSub(va, vb);
      let current = { re: 0, im: 0 };
      let power = { re: 0, im: 0 };
      if (el.type === 'power' || el.type === 'ac_source'){
        const resistance = clampResistance(el.resistance ?? 0.5, 0.5);
        const rating = el.type === 'ac_source'
          ? polarToComplex(Number(el.amplitude ?? 0), clampPhase(el.phase ?? 0, 0))
          : toComplex(clampVoltage(el.voltage ?? 0, 0));
        current = complexDiv(complexSub(rating, voltage), resistance);
        power = complexMul(voltage, complexConj(current));
        accumulateBranch(el.nodeA, el.nodeB, current);
      } else if (el.type === 'resistor' || el.type === 'wire' || el.type === 'ammeter'){
        const resistance = clampResistance(el.resistance ?? 1, 1);
        current = complexDiv(voltage, resistance);
        power = complexMul(voltage, complexConj(current));
        accumulateBranch(el.nodeA, el.nodeB, current);
      } else if (el.type === 'capacitor'){
        const capacitance = clampCapacitance(el.capacitance ?? 1e-6, 1e-6);
        if (isAC && omega > 0){
          const admittance = { re: 0, im: omega * capacitance };
          current = complexMul(voltage, admittance);
          power = complexMul(voltage, complexConj(current));
        }
        accumulateBranch(el.nodeA, el.nodeB, current);
      } else if (el.type === 'inductor'){
        const inductance = clampInductance(el.inductance ?? 1e-3, 1e-3);
        if (isAC && omega > 0){
          const admittance = { re: 0, im: -1 / (omega * inductance) };
          current = complexMul(voltage, admittance);
          power = complexMul(voltage, complexConj(current));
        } else {
          current = complexDiv(voltage, MIN_RESISTANCE);
          power = complexMul(voltage, complexConj(current));
        }
        accumulateBranch(el.nodeA, el.nodeB, current);
      } else if (el.type === 'current_source'){
        const currentAmp = clampCurrent(el.current ?? 0.01, 0.01);
        const phase = clampPhase(el.phase ?? 0, 0);
        current = isAC ? polarToComplex(currentAmp, phase) : { re: currentAmp, im: 0 };
        power = complexMul(voltage, complexConj(current));
        accumulateBranch(el.nodeA, el.nodeB, current);
      } else if (el.type === 'voltmeter' || el.type === 'wattmeter'){
        const { key, sign } = canonicalPair(el.nodeA, el.nodeB);
        const stored = branchCurrents[key] || { re: 0, im: 0 };
        current = complexMul(stored, { re: sign, im: 0 });
        power = complexMul(voltage, complexConj(current));
      }
      elementStats[el.id] = {
        voltage,
        current,
        power
      };

      const realPower = power.re || 0;
      if (realPower > 0){
        totalDissipated = complexAdd(totalDissipated, power);
      } else if (realPower < 0){
        totalDelivered = complexAdd(totalDelivered, { re: -power.re, im: -power.im });
      }
    });

    nodeIds.forEach(id => {
      if (id === groundId) return;
      if (!connectionCount[id]){
        const node = nodes.find(n => n.id === id);
        diagnostics.push(`ノード「${node?.name || id}」は非導電要素により孤立しています`);
      }
    });

    if (!isAC){
      const hasCapacitor = elements.some(el => el?.type === 'capacitor');
      const hasInductor = elements.some(el => el?.type === 'inductor');
      if (hasCapacitor) diagnostics.push('DC解析ではコンデンサが開放状態として扱われます');
      if (hasInductor) diagnostics.push('DC解析ではインダクタはほぼ短絡として扱われます');
    } else if (frequencyHz === 0){
      diagnostics.push('AC解析の周波数が0Hzのため、結果はDCと同一です');
    }

    return {
      nodeVoltages,
      elementStats,
      branchCurrents,
      totals: { delivered: totalDelivered, dissipated: totalDissipated },
      warnings,
      diagnostics,
      mode,
      frequencyHz
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
      diagnostics: [],
      analysisMode: 'dc',
      frequencyHz: 50,
      sessionXp: 0
    };

    const originalRootStyle = {
      padding: root.style.padding || '',
      margin: root.style.margin || '',
      background: root.style.background || '',
      border: root.style.border || '',
      minHeight: root.style.minHeight || '',
      display: root.style.display || '',
      justifyContent: root.style.justifyContent || '',
      alignItems: root.style.alignItems || '',
      width: root.style.width || '',
      maxWidth: root.style.maxWidth || ''
    };

    root.style.padding = '0';
    root.style.margin = '0 auto';
    root.style.background = 'transparent';
    root.style.border = 'none';
    root.style.minHeight = '0';
    root.style.display = 'flex';
    root.style.justifyContent = 'center';
    root.style.alignItems = 'stretch';
    root.style.width = 'min(96vw, 1400px)';
    root.style.maxWidth = '1400px';

    let currentTheme = detectColorScheme();
    let applyTheme = () => {};
    const listeners = [];

    function getTheme(){
      return COLOR_THEMES[currentTheme] || COLOR_THEMES.light;
    }

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

    const toolButtons = [];

    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'minmax(280px, 320px) minmax(0, 1fr) minmax(300px, 360px)';
    wrapper.style.gap = '16px';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.padding = '24px 32px';
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
    subtitle.textContent = '電源・受動素子・計器をつないでDC/AC回路をリアルタイム解析します。';
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
      toolButtons.push(btn);
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

    const analysisBox = document.createElement('div');
    analysisBox.style.background = 'rgba(148,163,184,0.18)';
    analysisBox.style.border = '1px solid rgba(148,163,184,0.35)';
    analysisBox.style.borderRadius = '12px';
    analysisBox.style.padding = '12px';
    analysisBox.style.fontSize = '12px';
    analysisBox.style.display = 'flex';
    analysisBox.style.flexDirection = 'column';
    analysisBox.style.gap = '8px';

    const analysisHeader = document.createElement('div');
    analysisHeader.textContent = '解析モード';
    analysisHeader.style.fontWeight = '700';
    analysisHeader.style.fontSize = '13px';

    const modeButtonWrap = document.createElement('div');
    modeButtonWrap.style.display = 'grid';
    modeButtonWrap.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    modeButtonWrap.style.gap = '8px';

    const modeButtons = [];

    function makeModeButton(label, mode){
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.dataset.mode = mode;
      btn.style.padding = '8px';
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(148,163,184,0.35)';
      btn.style.background = 'rgba(30,64,175,0.25)';
      btn.style.color = '#e0f2fe';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = '600';
      btn.addEventListener('click', () => {
        state.analysisMode = mode;
        updateSolution();
        render();
      });
      modeButtons.push(btn);
      return btn;
    }

    const dcBtn = makeModeButton('DC解析', 'dc');
    const acBtn = makeModeButton('AC解析', 'ac');
    modeButtonWrap.appendChild(dcBtn);
    modeButtonWrap.appendChild(acBtn);

    const freqWrapper = document.createElement('div');
    freqWrapper.style.display = 'flex';
    freqWrapper.style.flexDirection = 'column';
    freqWrapper.style.gap = '6px';

    const freqLabel = document.createElement('div');
    freqLabel.textContent = '解析周波数 (Hz)';

    const freqInputs = document.createElement('div');
    freqInputs.style.display = 'grid';
    freqInputs.style.gridTemplateColumns = 'minmax(0, 1fr) 80px';
    freqInputs.style.gap = '8px';
    freqInputs.style.alignItems = 'center';

    const freqSlider = document.createElement('input');
    freqSlider.type = 'range';
    freqSlider.min = '0';
    freqSlider.max = '100000';
    freqSlider.step = '1';

    const freqNumber = document.createElement('input');
    freqNumber.type = 'number';
    freqNumber.min = '0';
    freqNumber.max = '1000000';
    freqNumber.step = '1';
    freqNumber.style.padding = '6px';
    freqNumber.style.borderRadius = '8px';
    freqNumber.style.border = '1px solid rgba(148,163,184,0.45)';
    freqNumber.style.background = 'rgba(15,23,42,0.05)';
    freqNumber.style.color = '#0f172a';

    function updateFrequency(value){
      const clamped = clampFrequency(value, state.frequencyHz);
      state.frequencyHz = clamped;
      freqSlider.value = String(clamped);
      freqNumber.value = String(clamped);
      updateSolution();
      render();
    }

    freqSlider.addEventListener('input', () => {
      updateFrequency(Number(freqSlider.value));
    });
    freqNumber.addEventListener('change', () => {
      updateFrequency(Number(freqNumber.value));
    });

    freqInputs.appendChild(freqSlider);
    freqInputs.appendChild(freqNumber);

    const freqHint = document.createElement('div');
    freqHint.textContent = 'AC解析で有効。0Hz〜1MHzまで設定可能。';
    freqHint.style.fontSize = '11px';
    freqHint.style.opacity = '0.8';

    freqWrapper.appendChild(freqLabel);
    freqWrapper.appendChild(freqInputs);
    freqWrapper.appendChild(freqHint);

    analysisBox.appendChild(analysisHeader);
    analysisBox.appendChild(modeButtonWrap);
    analysisBox.appendChild(freqWrapper);

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
    leftPanel.appendChild(analysisBox);
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

    applyTheme = (mode) => {
      const theme = COLOR_THEMES[mode] || COLOR_THEMES.light;
      wrapper.style.background = theme.wrapperBg;
      wrapper.style.color = theme.textPrimary;
      leftPanel.style.background = theme.leftPanelBg;
      leftPanel.style.color = theme.leftPanelText;
      leftPanel.style.boxShadow = theme.leftPanelShadow;
      title.style.color = theme.leftPanelText;
      subtitle.style.color = theme.leftPanelText;
      toolHeader.style.color = theme.leftPanelText;
      analysisBox.style.background = theme.statusBg;
      analysisBox.style.border = theme.statusBorder;
      analysisHeader.style.color = theme.leftPanelText;
      freqLabel.style.color = theme.leftPanelText;
      freqHint.style.color = theme.leftPanelText;
      statusBox.style.background = theme.statusBg;
      statusBox.style.border = theme.statusBorder;
      statusBox.style.color = theme.leftPanelText;
      summaryBox.style.background = theme.summaryBg;
      summaryBox.style.border = theme.summaryBorder;
      summaryBox.style.color = theme.leftPanelText;
      freqNumber.style.border = theme.inputBorder;
      freqNumber.style.background = theme.inputBg;
      freqNumber.style.color = theme.inputText;
      workspaceWrap.style.background = theme.workspaceBg;
      workspaceWrap.style.border = theme.workspaceBorder;
      workspaceWrap.style.boxShadow = theme.workspaceShadow;
      workspaceWrap.style.backgroundImage = `
        linear-gradient(0deg, ${theme.gridLine} 1px, transparent 1px),
        linear-gradient(90deg, ${theme.gridLine} 1px, transparent 1px)
      `;
      svg.style.background = theme.svgBg;
      inspector.style.background = theme.inspectorBg;
      inspector.style.border = theme.inspectorBorder;
      inspector.style.color = theme.inspectorText;
      inspector.style.boxShadow = mode === 'dark'
        ? '0 18px 40px rgba(2,6,23,0.6)'
        : '0 12px 24px rgba(15,23,42,0.15)';
      inspectorTitle.style.color = theme.inspectorText;
      inspectorBody.style.color = theme.inspectorText;
      renderToolbarState();
      renderAnalysisControls();
    };

    applyTheme(currentTheme);

    function syncTheme(){
      const next = detectColorScheme();
      if (next !== currentTheme){
        currentTheme = next;
        applyTheme(currentTheme);
        render();
      }
    }

    const schemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (schemeQuery){
      const handleScheme = () => syncTheme();
      if (typeof schemeQuery.addEventListener === 'function') schemeQuery.addEventListener('change', handleScheme);
      else if (typeof schemeQuery.addListener === 'function') schemeQuery.addListener(handleScheme);
      listeners.push(() => {
        if (typeof schemeQuery.removeEventListener === 'function') schemeQuery.removeEventListener('change', handleScheme);
        else if (typeof schemeQuery.removeListener === 'function') schemeQuery.removeListener(handleScheme);
      });
    }

    const observerTargets = [document.documentElement, document.body].filter(Boolean);
    if (observerTargets.length){
      const observer = new MutationObserver(syncTheme);
      observerTargets.forEach(target => observer.observe(target, { attributes: true, attributeFilter: ['class', 'data-theme'] }));
      listeners.push(() => observer.disconnect());
    }

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
      const result = solveCircuit(state.nodes, state.elements, state.groundNodeId, {
        mode: state.analysisMode,
        frequencyHz: state.frequencyHz
      });
      state.solution = result;
      state.warnings = result.warnings;
      state.diagnostics = result.diagnostics || [];
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
      const theme = getTheme();
      toolButtons.forEach(btn => {
        const active = btn.dataset.toolId === state.pendingTool;
        btn.style.border = active ? theme.toolButtonActiveBorder : theme.toolButtonBorder;
        btn.style.background = active ? theme.toolButtonActiveBg : theme.toolButtonBg;
        btn.style.color = active ? theme.toolButtonActiveText : theme.toolButtonText;
        btn.style.boxShadow = active ? '0 0 0 1px rgba(59,130,246,0.45)' : 'none';
      });
    }

    function renderAnalysisControls(){
      const theme = getTheme();
      modeButtons.forEach(btn => {
        const active = btn.dataset.mode === state.analysisMode;
        btn.style.border = active ? theme.toolButtonActiveBorder : theme.toolButtonBorder;
        btn.style.background = active ? theme.toolButtonActiveBg : theme.toolButtonBg;
        btn.style.color = active ? theme.toolButtonActiveText : theme.toolButtonText;
        btn.style.boxShadow = active ? '0 0 0 1px rgba(59,130,246,0.45)' : 'none';
      });
      const isAC = state.analysisMode === 'ac';
      freqWrapper.style.display = 'flex';
      freqWrapper.style.opacity = isAC ? '1' : '0.45';
      freqSlider.disabled = !isAC;
      freqNumber.disabled = !isAC;
      freqSlider.style.opacity = isAC ? '1' : '0.4';
      freqNumber.style.opacity = isAC ? '1' : '0.6';
      freqLabel.style.opacity = isAC ? '1' : '0.6';
      freqHint.style.display = 'block';
      freqHint.textContent = isAC
        ? 'AC解析で有効。0Hz〜1MHzまで設定可能。'
        : 'AC解析を有効化すると周波数を調整できます。';
      freqSlider.value = String(state.frequencyHz);
      freqNumber.value = String(state.frequencyHz);
    }

    function renderStatus(){
      statusBox.innerHTML = '';

      const analysisLine = document.createElement('div');
      if (state.analysisMode === 'ac'){
        analysisLine.textContent = `解析モード: AC (${formatNumber(state.frequencyHz, 2)} Hz)`;
      } else {
        analysisLine.textContent = '解析モード: DC';
      }
      statusBox.appendChild(analysisLine);

      if (state.analysisMode === 'ac' && state.frequencyHz > 0){
        const omegaLine = document.createElement('div');
        omegaLine.textContent = `角周波数: ${formatNumber(state.frequencyHz * 2 * Math.PI, 2)} rad/s`;
        statusBox.appendChild(omegaLine);
      }

      const activeTool = state.pendingTool;
      const lineTool = document.createElement('div');
      lineTool.textContent = `操作ツール: ${activeTool === 'select' ? '選択' : activeTool === 'add-node' ? 'ノード追加' : (COMPONENT_TYPES[activeTool]?.label || activeTool)}`;
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
        const theme = getTheme();
        state.warnings.forEach(w => {
          const warn = document.createElement('div');
          warn.textContent = `⚠ ${w}`;
          warn.style.color = theme.statusWarning;
          statusBox.appendChild(warn);
        });
      }

      if (state.diagnostics && state.diagnostics.length){
        const diagHeader = document.createElement('div');
        diagHeader.textContent = '診断:';
        diagHeader.style.marginTop = '4px';
        diagHeader.style.fontWeight = '600';
        statusBox.appendChild(diagHeader);
        state.diagnostics.forEach(msg => {
          const line = document.createElement('div');
          line.textContent = `・${msg}`;
          statusBox.appendChild(line);
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
      const { totals, nodeVoltages, branchCurrents } = solution;
      const deliveredLine = document.createElement('div');
      deliveredLine.textContent = `供給電力: ${formatPowerQuantity(totals.delivered, state.analysisMode, 2)}`;
      summaryBox.appendChild(deliveredLine);
      const dissipatedLine = document.createElement('div');
      dissipatedLine.textContent = `消費電力: ${formatPowerQuantity(totals.dissipated, state.analysisMode, 2)}`;
      summaryBox.appendChild(dissipatedLine);

      if (state.analysisMode === 'ac'){
        const deliveredApparent = complexAbs(totals.delivered || { re: 0, im: 0 });
        const pf = deliveredApparent > 0 ? (totals.delivered.re || 0) / deliveredApparent : 1;
        const pfLine = document.createElement('div');
        pfLine.textContent = `力率: ${formatNumber(pf, 3)}`;
        summaryBox.appendChild(pfLine);
      }

      let maxVoltage = 0;
      let maxVoltageNode = null;
      state.nodes.forEach(node => {
        const value = nodeVoltages[node.id];
        if (!value) return;
        const mag = complexAbs(value);
        if (mag > maxVoltage){
          maxVoltage = mag;
          maxVoltageNode = node;
        }
      });

      if (maxVoltageNode){
        const maxLine = document.createElement('div');
        maxLine.textContent = `最大ノード電位: ${(maxVoltageNode.name || maxVoltageNode.id)} = ${formatQuantity(nodeVoltages[maxVoltageNode.id], state.analysisMode === 'ac' ? 'Vrms' : 'V', state.analysisMode, 3)}`;
        summaryBox.appendChild(maxLine);
      }

      if (branchCurrents){
        let peakCurrent = 0;
        Object.values(branchCurrents).forEach(val => {
          const mag = complexAbs(val);
          if (mag > peakCurrent) peakCurrent = mag;
        });
        const currentLine = document.createElement('div');
        currentLine.textContent = `最大枝電流: ${formatNumber(peakCurrent, 3)} ${state.analysisMode === 'ac' ? 'Arms' : 'A'}`;
        summaryBox.appendChild(currentLine);
      }

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
        entry.textContent = `- ${(node.name || node.id)}: ${formatQuantity(value, state.analysisMode === 'ac' ? 'Vrms' : 'V', state.analysisMode, 3)}`;
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
      const theme = getTheme();

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
        let color = theme.textPrimary;
        if (el.type === 'resistor') color = '#f97316';
        else if (el.type === 'power') color = '#4f46e5';
        else if (el.type === 'ac_source') color = '#c026d3';
        else if (el.type === 'ammeter') color = '#14b8a6';
        else if (el.type === 'voltmeter') color = '#0ea5e9';
        else if (el.type === 'wattmeter') color = '#ec4899';
        else if (el.type === 'capacitor') color = '#22d3ee';
        else if (el.type === 'inductor') color = '#8b5cf6';
        else if (el.type === 'current_source') color = '#22c55e';
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
        textBg.setAttribute('fill', theme.cardBg);
        textBg.setAttribute('stroke', theme.cardBorder);
        textBg.setAttribute('stroke-width', '1');

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', midX);
        label.setAttribute('y', midY - 4);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '11');
        label.setAttribute('font-family', '"Noto Sans JP", sans-serif');
        label.setAttribute('fill', theme.nodeLabel);
        const stat = stats[el.id] || { voltage: 0, current: 0, power: 0 };
        let line1 = '';
        if (el.type === 'resistor' || el.type === 'wire' || el.type === 'ammeter'){
          line1 = `${el.name || el.type}  ${formatNumber(el.resistance ?? 0, 2)}Ω`;
        } else if (el.type === 'power'){
          line1 = `${el.name || '電源'}  ${formatNumber(el.voltage ?? 0, 2)}V`;
        } else if (el.type === 'ac_source'){
          const amplitude = formatNumber(el.amplitude ?? 0, 2);
          const phase = formatNumber(clampPhase(el.phase ?? 0, 0), 1);
          line1 = `${el.name || 'AC電源'}  ${amplitude}Vrms ∠${phase}°`;
        } else if (el.type === 'capacitor'){
          line1 = `${el.name || 'コンデンサ'}  ${formatNumber(el.capacitance ?? 0, 2)}F`;
        } else if (el.type === 'inductor'){
          line1 = `${el.name || 'インダクタ'}  ${formatNumber(el.inductance ?? 0, 2)}H`;
        } else if (el.type === 'current_source'){
          const amplitude = formatNumber(el.current ?? 0, 2);
          let phaseText = '';
          if (state.analysisMode === 'ac'){
            phaseText = ` ∠${formatNumber(clampPhase(el.phase ?? 0, 0), 1)}°`;
          }
          line1 = `${el.name || '電流源'}  ${amplitude}A${phaseText}`;
        } else if (el.type === 'voltmeter'){
          line1 = `${el.name || '電圧計'}`;
        } else if (el.type === 'wattmeter'){
          line1 = `${el.name || '電力計'}`;
        }
        const voltageUnit = state.analysisMode === 'ac' ? 'Vrms' : 'V';
        const currentUnit = state.analysisMode === 'ac' ? 'Arms' : 'A';
        const line2 = `V:${formatQuantity(stat.voltage, voltageUnit, state.analysisMode, 2)}  I:${formatQuantity(stat.current, currentUnit, state.analysisMode, 2)}`;
        const realPower = isComplex(stat.power) ? stat.power.re : (stat.power ?? 0);
        const reactivePower = isComplex(stat.power) ? stat.power.im : 0;
        let line3 = `P:${formatNumber(realPower, 2)}W`;
        if (state.analysisMode === 'ac'){
          line3 = `P:${formatNumber(realPower, 2)}W  Q:${formatNumber(reactivePower, 2)}var`;
        }

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
          circle.setAttribute('stroke', theme.textPrimary);
          circle.setAttribute('stroke-width', '3');
        } else if (pendingIndex !== -1){
          circle.setAttribute('fill', '#fcd34d');
          circle.setAttribute('stroke', '#b45309');
          circle.setAttribute('stroke-width', '3');
        } else if (state.groundNodeId === node.id){
          circle.setAttribute('fill', theme.groundFill);
          circle.setAttribute('stroke', theme.groundStroke);
          circle.setAttribute('stroke-width', '3');
        } else {
          circle.setAttribute('fill', '#38bdf8');
          circle.setAttribute('stroke', theme.textPrimary);
          circle.setAttribute('stroke-width', '2');
        }
        group.appendChild(circle);

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', node.x);
        label.setAttribute('y', node.y - NODE_RADIUS - 8);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '12');
        label.setAttribute('font-family', '"Noto Sans JP", sans-serif');
        label.setAttribute('fill', theme.nodeLabel);
        label.textContent = node.name || node.id;
        group.appendChild(label);

        const voltageValue = voltages[node.id];
        if (voltageValue !== undefined){
          const voltLabel = document.createElementNS(SVG_NS, 'text');
          voltLabel.setAttribute('x', node.x);
          voltLabel.setAttribute('y', node.y + NODE_RADIUS + 16);
          voltLabel.setAttribute('text-anchor', 'middle');
          voltLabel.setAttribute('font-size', '11');
          voltLabel.setAttribute('fill', theme.voltageLabel);
          voltLabel.textContent = formatQuantity(voltageValue, state.analysisMode === 'ac' ? 'Vrms' : 'V', state.analysisMode, 2);
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
      const theme = getTheme();
      if (!state.selected){
        const msg = document.createElement('div');
        msg.textContent = 'ノードまたはコンポーネントを選択してください。';
        msg.style.color = theme.inspectorMuted;
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
        title.style.color = theme.inspectorText;
        inspectorBody.appendChild(title);

        const nameLabel = document.createElement('label');
        nameLabel.textContent = '名称';
        nameLabel.style.display = 'flex';
        nameLabel.style.flexDirection = 'column';
        nameLabel.style.gap = '6px';
        nameLabel.style.color = theme.inspectorText;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = node.name || '';
        nameInput.style.padding = '8px';
        nameInput.style.borderRadius = '8px';
        nameInput.style.border = theme.inputBorder;
        nameInput.style.background = theme.inputBg;
        nameInput.style.color = theme.inputText;
        nameInput.addEventListener('change', () => {
          node.name = nameInput.value || '';
          render();
        });
        nameLabel.appendChild(nameInput);
        inspectorBody.appendChild(nameLabel);

        const voltageValue = state.solution?.nodeVoltages?.[node.id];
        const voltageLine = document.createElement('div');
        voltageLine.textContent = `電位: ${formatQuantity(voltageValue || { re: 0, im: 0 }, state.analysisMode === 'ac' ? 'Vrms' : 'V', state.analysisMode, 3)}`;
        voltageLine.style.color = theme.inspectorMuted;
        inspectorBody.appendChild(voltageLine);

        const groundBtn = document.createElement('button');
        groundBtn.textContent = 'このノードをグラウンドに設定';
        groundBtn.style.padding = '8px';
        groundBtn.style.borderRadius = '8px';
        groundBtn.style.border = `1px solid ${theme.primaryButtonBorder}`;
        groundBtn.style.background = theme.primaryButtonBg;
        groundBtn.style.color = theme.primaryButtonText;
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
        deleteBtn.style.border = `1px solid ${theme.dangerButtonBorder}`;
        deleteBtn.style.background = theme.dangerButtonBg;
        deleteBtn.style.color = theme.dangerButtonText;
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
        header.style.color = theme.inspectorText;
        inspectorBody.appendChild(header);

        const nameLabel = document.createElement('label');
        nameLabel.textContent = '名称';
        nameLabel.style.display = 'flex';
        nameLabel.style.flexDirection = 'column';
        nameLabel.style.gap = '6px';
        nameLabel.style.color = theme.inspectorText;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = element.name || '';
        nameInput.style.padding = '8px';
        nameInput.style.borderRadius = '8px';
        nameInput.style.border = theme.inputBorder;
        nameInput.style.background = theme.inputBg;
        nameInput.style.color = theme.inputText;
        nameInput.addEventListener('change', () => {
          element.name = nameInput.value || '';
          render();
        });
        nameLabel.appendChild(nameInput);
        inspectorBody.appendChild(nameLabel);

        if (element.type === 'resistor' || element.type === 'wire' || element.type === 'ammeter'){
          const resLabel = document.createElement('label');
          resLabel.textContent = '抵抗 (Ω)';
          resLabel.style.display = 'flex';
          resLabel.style.flexDirection = 'column';
          resLabel.style.gap = '6px';
          resLabel.style.color = theme.inspectorText;
          const resInput = document.createElement('input');
          resInput.type = 'number';
          resInput.step = '0.001';
          resInput.value = element.resistance ?? 1;
          resInput.style.padding = '8px';
          resInput.style.borderRadius = '8px';
          resInput.style.border = theme.inputBorder;
          resInput.style.background = theme.inputBg;
          resInput.style.color = theme.inputText;
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
          voltLabel.style.display = 'flex';
          voltLabel.style.flexDirection = 'column';
          voltLabel.style.gap = '6px';
          voltLabel.style.color = theme.inspectorText;
          const voltInput = document.createElement('input');
          voltInput.type = 'number';
          voltInput.step = '0.1';
          voltInput.value = element.voltage ?? 0;
          voltInput.style.padding = '8px';
          voltInput.style.borderRadius = '8px';
          voltInput.style.border = theme.inputBorder;
          voltInput.style.background = theme.inputBg;
          voltInput.style.color = theme.inputText;
          voltInput.addEventListener('change', () => {
            element.voltage = clampVoltage(voltInput.value, element.voltage ?? 0);
            updateSolution();
            render();
          });
          voltLabel.appendChild(voltInput);
          inspectorBody.appendChild(voltLabel);

          const resLabel = document.createElement('label');
          resLabel.textContent = '内部抵抗 (Ω)';
          resLabel.style.display = 'flex';
          resLabel.style.flexDirection = 'column';
          resLabel.style.gap = '6px';
          resLabel.style.color = theme.inspectorText;
          const resInput = document.createElement('input');
          resInput.type = 'number';
          resInput.step = '0.01';
          resInput.value = element.resistance ?? 0.5;
          resInput.style.padding = '8px';
          resInput.style.borderRadius = '8px';
          resInput.style.border = theme.inputBorder;
          resInput.style.background = theme.inputBg;
          resInput.style.color = theme.inputText;
          resInput.addEventListener('change', () => {
            element.resistance = clampResistance(resInput.value, element.resistance ?? 0.5);
            updateSolution();
            render();
          });
          resLabel.appendChild(resInput);
          inspectorBody.appendChild(resLabel);
        }

        if (element.type === 'ac_source'){
          const ampLabel = document.createElement('label');
          ampLabel.textContent = '電圧（RMS, V）';
          ampLabel.style.display = 'flex';
          ampLabel.style.flexDirection = 'column';
          ampLabel.style.gap = '6px';
          ampLabel.style.color = theme.inspectorText;
          const ampInput = document.createElement('input');
          ampInput.type = 'number';
          ampInput.step = '0.1';
          ampInput.value = element.amplitude ?? 0;
          ampInput.style.padding = '8px';
          ampInput.style.borderRadius = '8px';
          ampInput.style.border = theme.inputBorder;
          ampInput.style.background = theme.inputBg;
          ampInput.style.color = theme.inputText;
          ampInput.addEventListener('change', () => {
            const val = Number(ampInput.value);
            element.amplitude = Number.isFinite(val) ? Math.max(0, val) : (element.amplitude ?? 0);
            updateSolution();
            render();
          });
          ampLabel.appendChild(ampInput);
          inspectorBody.appendChild(ampLabel);

          const phaseLabel = document.createElement('label');
          phaseLabel.textContent = '位相 (°)';
          phaseLabel.style.display = 'flex';
          phaseLabel.style.flexDirection = 'column';
          phaseLabel.style.gap = '6px';
          phaseLabel.style.color = theme.inspectorText;
          const phaseInput = document.createElement('input');
          phaseInput.type = 'number';
          phaseInput.step = '1';
          phaseInput.value = clampPhase(element.phase ?? 0, 0);
          phaseInput.style.padding = '8px';
          phaseInput.style.borderRadius = '8px';
          phaseInput.style.border = theme.inputBorder;
          phaseInput.style.background = theme.inputBg;
          phaseInput.style.color = theme.inputText;
          phaseInput.addEventListener('change', () => {
            element.phase = clampPhase(phaseInput.value, element.phase ?? 0);
            updateSolution();
            render();
          });
          phaseLabel.appendChild(phaseInput);
          inspectorBody.appendChild(phaseLabel);

          const resLabel = document.createElement('label');
          resLabel.textContent = '内部抵抗 (Ω)';
          resLabel.style.display = 'flex';
          resLabel.style.flexDirection = 'column';
          resLabel.style.gap = '6px';
          resLabel.style.color = theme.inspectorText;
          const resInput = document.createElement('input');
          resInput.type = 'number';
          resInput.step = '0.01';
          resInput.value = element.resistance ?? 0.2;
          resInput.style.padding = '8px';
          resInput.style.borderRadius = '8px';
          resInput.style.border = theme.inputBorder;
          resInput.style.background = theme.inputBg;
          resInput.style.color = theme.inputText;
          resInput.addEventListener('change', () => {
            element.resistance = clampResistance(resInput.value, element.resistance ?? 0.2);
            updateSolution();
            render();
          });
          resLabel.appendChild(resInput);
          inspectorBody.appendChild(resLabel);
        }

        if (element.type === 'capacitor'){
          const capLabel = document.createElement('label');
          capLabel.textContent = '容量 (F)';
          capLabel.style.display = 'flex';
          capLabel.style.flexDirection = 'column';
          capLabel.style.gap = '6px';
          capLabel.style.color = theme.inspectorText;
          const capInput = document.createElement('input');
          capInput.type = 'number';
          capInput.step = '1e-9';
          capInput.value = element.capacitance ?? 1e-6;
          capInput.style.padding = '8px';
          capInput.style.borderRadius = '8px';
          capInput.style.border = theme.inputBorder;
          capInput.style.background = theme.inputBg;
          capInput.style.color = theme.inputText;
          capInput.addEventListener('change', () => {
            element.capacitance = clampCapacitance(capInput.value, element.capacitance ?? 1e-6);
            updateSolution();
            render();
          });
          capLabel.appendChild(capInput);
          inspectorBody.appendChild(capLabel);

          const freq = state.solution?.frequencyHz ?? state.frequencyHz;
          if (state.analysisMode === 'ac' && freq > 0){
            const omega = 2 * Math.PI * freq;
            const capacitance = clampCapacitance(element.capacitance ?? 1e-6, 1e-6);
            const reactance = -1 / (omega * capacitance);
            const reactLine = document.createElement('div');
            reactLine.textContent = Number.isFinite(reactance)
              ? `リアクタンス Xc: ${formatNumber(reactance, 3)} Ω`
              : 'リアクタンス Xc: ∞ Ω';
            reactLine.style.color = theme.inspectorMuted;
            inspectorBody.appendChild(reactLine);
          }
        }

        if (element.type === 'inductor'){
          const indLabel = document.createElement('label');
          indLabel.textContent = 'インダクタンス (H)';
          indLabel.style.display = 'flex';
          indLabel.style.flexDirection = 'column';
          indLabel.style.gap = '6px';
          indLabel.style.color = theme.inspectorText;
          const indInput = document.createElement('input');
          indInput.type = 'number';
          indInput.step = '1e-6';
          indInput.value = element.inductance ?? 1e-3;
          indInput.style.padding = '8px';
          indInput.style.borderRadius = '8px';
          indInput.style.border = theme.inputBorder;
          indInput.style.background = theme.inputBg;
          indInput.style.color = theme.inputText;
          indInput.addEventListener('change', () => {
            element.inductance = clampInductance(indInput.value, element.inductance ?? 1e-3);
            updateSolution();
            render();
          });
          indLabel.appendChild(indInput);
          inspectorBody.appendChild(indLabel);

          const freq = state.solution?.frequencyHz ?? state.frequencyHz;
          if (state.analysisMode === 'ac' && freq > 0){
            const omega = 2 * Math.PI * freq;
            const inductance = clampInductance(element.inductance ?? 1e-3, 1e-3);
            const reactance = omega * inductance;
            const reactLine = document.createElement('div');
            reactLine.textContent = Number.isFinite(reactance)
              ? `リアクタンス Xl: ${formatNumber(reactance, 3)} Ω`
              : 'リアクタンス Xl: —';
            reactLine.style.color = theme.inspectorMuted;
            inspectorBody.appendChild(reactLine);
          }
        }

        if (element.type === 'current_source'){
          const curLabel = document.createElement('label');
          curLabel.textContent = '電流 (A)';
          curLabel.style.display = 'flex';
          curLabel.style.flexDirection = 'column';
          curLabel.style.gap = '6px';
          curLabel.style.color = theme.inspectorText;
          const curInput = document.createElement('input');
          curInput.type = 'number';
          curInput.step = '0.001';
          curInput.value = element.current ?? 0.05;
          curInput.style.padding = '8px';
          curInput.style.borderRadius = '8px';
          curInput.style.border = theme.inputBorder;
          curInput.style.background = theme.inputBg;
          curInput.style.color = theme.inputText;
          curInput.addEventListener('change', () => {
            element.current = clampCurrent(curInput.value, element.current ?? 0.05);
            updateSolution();
            render();
          });
          curLabel.appendChild(curInput);
          inspectorBody.appendChild(curLabel);

          if (state.analysisMode === 'ac'){
            const phaseLabel = document.createElement('label');
            phaseLabel.textContent = '位相 (°)';
            phaseLabel.style.display = 'flex';
            phaseLabel.style.flexDirection = 'column';
            phaseLabel.style.gap = '6px';
            phaseLabel.style.color = theme.inspectorText;
            const phaseInput = document.createElement('input');
            phaseInput.type = 'number';
            phaseInput.step = '1';
            phaseInput.value = clampPhase(element.phase ?? 0, 0);
            phaseInput.style.padding = '8px';
            phaseInput.style.borderRadius = '8px';
            phaseInput.style.border = theme.inputBorder;
            phaseInput.style.background = theme.inputBg;
            phaseInput.style.color = theme.inputText;
            phaseInput.addEventListener('change', () => {
              element.phase = clampPhase(phaseInput.value, element.phase ?? 0);
              updateSolution();
              render();
            });
            phaseLabel.appendChild(phaseInput);
            inspectorBody.appendChild(phaseLabel);
          }
        }

        if (element.type === 'voltmeter' || element.type === 'wattmeter'){
          const note = document.createElement('div');
          note.textContent = '計器は回路には影響しません。ノード間の実測値を表示します。';
          note.style.fontSize = '12px';
          note.style.color = theme.inspectorMuted;
          inspectorBody.appendChild(note);
        }

        const nodesLine = document.createElement('div');
        nodesLine.textContent = `接続: ${(nodeA?.name || element.nodeA)} ↔ ${(nodeB?.name || element.nodeB)}`;
        nodesLine.style.color = theme.inspectorMuted;
        inspectorBody.appendChild(nodesLine);

        const statsList = document.createElement('div');
        const voltageText = formatQuantity(stat.voltage, state.analysisMode === 'ac' ? 'Vrms' : 'V', state.analysisMode, 3);
        const currentText = formatQuantity(stat.current, state.analysisMode === 'ac' ? 'Arms' : 'A', state.analysisMode, 3);
        const powerText = formatPowerQuantity(stat.power, state.analysisMode, 3);
        statsList.innerHTML = `電圧: <strong>${voltageText}</strong><br>電流: <strong>${currentText}</strong><br>電力: <strong>${powerText}</strong>`;
        statsList.style.color = theme.inspectorText;
        statsList.querySelectorAll('strong').forEach(strong => {
          strong.style.color = theme.primaryButtonBorder;
        });
        inspectorBody.appendChild(statsList);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'コンポーネント削除';
        deleteBtn.style.padding = '8px';
        deleteBtn.style.borderRadius = '8px';
        deleteBtn.style.border = `1px solid ${theme.dangerButtonBorder}`;
        deleteBtn.style.background = theme.dangerButtonBg;
        deleteBtn.style.color = theme.dangerButtonText;
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
      renderAnalysisControls();
      renderStatus();
      renderSummary();
      drawBoard();
      renderInspector();
    }

    updateSolution();
    render();
    syncTheme();

    function start(){ /* noop */ }
    function stop(){ /* noop */ }
    function destroy(){
      while (listeners.length){
        const dispose = listeners.pop();
        try { dispose(); } catch {}
      }
      try {
        if (root.contains(wrapper)) root.removeChild(wrapper);
      } catch {}
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      root.style.padding = originalRootStyle.padding;
      root.style.margin = originalRootStyle.margin;
      root.style.background = originalRootStyle.background;
      root.style.border = originalRootStyle.border;
      root.style.minHeight = originalRootStyle.minHeight;
      root.style.display = originalRootStyle.display;
      root.style.justifyContent = originalRootStyle.justifyContent;
      root.style.alignItems = originalRootStyle.alignItems;
      root.style.width = originalRootStyle.width;
      root.style.maxWidth = originalRootStyle.maxWidth;
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
    name: '電気回路シミュレータ', nameKey: 'selection.miniexp.games.circuit_simulator.name',
    description: 'DC/AC回路を構成して電圧・電流・電力・力率をリアルタイム解析するトイ系シミュレータ', descriptionKey: 'selection.miniexp.games.circuit_simulator.description', categoryIds: ['toy'],
    category: 'トイ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();
