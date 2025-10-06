(function(){
  const STYLE_TAG_ID = 'mini-logic-circuit-style';
  const STYLE_RULES = `
    .logic-circuit-root { display:flex; flex-direction:column; gap:16px; width:100%; height:100%; box-sizing:border-box; padding:24px; background:linear-gradient(135deg,#e2e8f0,#f8fafc); font-family:"Noto Sans JP","Hiragino Sans",sans-serif; color:#0f172a; }
    .logic-circuit-header { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; }
    .logic-circuit-title { margin:0; font-size:26px; letter-spacing:0.02em; }
    .logic-circuit-subtitle { font-size:14px; color:#475569; }
    .logic-circuit-actions { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
    .logic-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.4); color:#1d4ed8; font-weight:600; font-size:13px; }
    .logic-chip.high { background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.45); color:#166534; }
    .logic-chip.low { background:rgba(248,113,113,0.18); border-color:rgba(248,113,113,0.4); color:#7f1d1d; }
    .logic-chip.neutral { background:rgba(148,163,184,0.25); border-color:rgba(148,163,184,0.4); color:#1f2937; }
    .logic-circuit-toolbar { display:flex; flex-direction:column; gap:12px; }
    .logic-tool-groups { display:flex; flex-wrap:wrap; gap:8px; }
    .logic-tool-button { border:none; border-radius:12px; padding:10px 14px; background:rgba(15,23,42,0.08); color:#0f172a; cursor:pointer; display:flex; flex-direction:column; gap:4px; min-width:96px; transition:all 0.2s ease; box-shadow:0 2px 4px rgba(15,23,42,0.08); }
    .logic-tool-button:hover { transform:translateY(-1px); box-shadow:0 4px 10px rgba(15,23,42,0.16); }
    .logic-tool-button.active { background:linear-gradient(135deg,#38bdf8,#2563eb); color:#f8fafc; box-shadow:0 6px 16px rgba(37,99,235,0.35); }
    .logic-tool-button span { display:block; text-align:left; }
    .logic-tool-label { font-weight:700; font-size:14px; }
    .logic-tool-desc { font-size:11px; opacity:0.85; }
    .logic-circuit-layout { display:grid; grid-template-columns:minmax(420px,2fr) minmax(260px,1fr); gap:16px; flex:1; min-height:520px; }
    .logic-board-wrapper { background:#f1f5f9; border-radius:16px; border:1px solid rgba(148,163,184,0.5); box-shadow:inset 0 1px 0 rgba(255,255,255,0.6); position:relative; overflow:hidden; min-height:520px; }
    .logic-board { position:relative; width:100%; height:100%; background-image:linear-gradient(90deg,rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(0deg,rgba(148,163,184,0.18) 1px, transparent 1px); background-size:32px 32px; cursor:crosshair; }
    .logic-board::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(148,163,184,0.15),rgba(191,219,254,0.15)); pointer-events:none; }
    .logic-wire-layer { position:absolute; inset:0; pointer-events:none; }
    .logic-wire-path { fill:none; stroke-width:3; stroke:rgba(71,85,105,0.65); pointer-events:visibleStroke; cursor:pointer; transition:stroke 0.2s ease, stroke-width 0.2s ease; }
    .logic-wire-path.active { stroke:rgba(34,197,94,0.85); stroke-width:4; filter:drop-shadow(0 0 6px rgba(34,197,94,0.45)); }
    .logic-wire-path.pending { stroke-dasharray:6 4; stroke:rgba(59,130,246,0.8); }
    .logic-component { position:absolute; width:190px; min-height:128px; border-radius:14px; background:#ffffff; border:1px solid rgba(148,163,184,0.55); box-shadow:0 8px 20px rgba(15,23,42,0.12); display:flex; flex-direction:column; user-select:none; }
    .logic-component.selected { border-color:#2563eb; box-shadow:0 12px 26px rgba(37,99,235,0.28); }
    .logic-comp-header { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid rgba(148,163,184,0.35); cursor:grab; border-top-left-radius:14px; border-top-right-radius:14px; background:linear-gradient(135deg,#e2e8f0,#f8fafc); }
    .logic-comp-title { font-size:15px; font-weight:700; margin:0; }
    .logic-comp-body { display:grid; grid-template-columns:28px 1fr 28px; gap:4px; padding:10px 12px 12px; flex:1; }
    .logic-port-column { display:flex; flex-direction:column; gap:10px; align-items:center; justify-content:center; }
    .logic-port { width:16px; height:16px; border-radius:50%; border:2px solid rgba(15,23,42,0.65); background:#ffffff; box-shadow:0 2px 4px rgba(15,23,42,0.18); cursor:pointer; transition:transform 0.1s ease, background 0.1s ease, border 0.1s ease; position:relative; }
    .logic-port::after { content:''; position:absolute; inset:3px; border-radius:50%; background:rgba(15,23,42,0.12); }
    .logic-port:hover { transform:scale(1.15); }
    .logic-port.output { border-color:#2563eb; }
    .logic-port.input { border-color:#0f766e; }
    .logic-port.active { background:#22c55e; border-color:#15803d; box-shadow:0 0 8px rgba(34,197,94,0.5); }
    .logic-port.pending { background:#facc15; border-color:#f97316; }
    .logic-comp-content { display:flex; flex-direction:column; gap:8px; justify-content:flex-start; align-items:flex-start; padding:4px 6px; }
    .logic-mini-button { padding:6px 10px; border-radius:8px; border:1px solid rgba(148,163,184,0.6); background:rgba(15,23,42,0.04); cursor:pointer; font-weight:600; font-size:13px; transition:all 0.2s ease; }
    .logic-mini-button:hover { background:rgba(37,99,235,0.15); border-color:rgba(37,99,235,0.5); }
    .logic-step-input { width:84px; padding:6px 8px; border-radius:8px; border:1px solid rgba(148,163,184,0.6); background:#ffffff; font-size:12px; box-shadow:inset 0 1px 2px rgba(15,23,42,0.08); color:#0f172a; }
    .logic-step-input:focus { outline:none; border-color:#2563eb; box-shadow:0 0 0 2px rgba(37,99,235,0.25); }
    .logic-range-row { display:flex; flex-direction:column; gap:4px; width:100%; font-size:12px; color:#334155; }
    .logic-range-row input[type="range"] { width:100%; }
    .logic-led-indicator { width:28px; height:28px; border-radius:50%; border:2px solid rgba(15,23,42,0.45); box-shadow:inset 0 4px 10px rgba(15,23,42,0.25); }
    .logic-led-indicator.on { background:radial-gradient(circle at 30% 30%, #fef3c7, #fbbf24 55%, #f59e0b 100%); border-color:#f59e0b; box-shadow:0 0 12px rgba(245,158,11,0.55); }
    .logic-led-indicator.off { background:#0f172a; border-color:#334155; }
    .logic-inspector { background:rgba(15,23,42,0.92); color:#e2e8f0; border-radius:16px; padding:18px; border:1px solid rgba(148,163,184,0.4); display:flex; flex-direction:column; gap:16px; box-shadow:0 12px 28px rgba(15,23,42,0.35); }
    .logic-inspector h3 { margin:0; font-size:18px; }
    .logic-inspector-section { display:flex; flex-direction:column; gap:8px; background:rgba(15,23,42,0.55); padding:12px; border-radius:12px; border:1px solid rgba(148,163,184,0.3); }
    .logic-inspector dl { display:grid; grid-template-columns:max-content 1fr; gap:6px 12px; margin:0; font-size:13px; }
    .logic-inspector dt { opacity:0.75; }
    .logic-inspector code { background:rgba(15,23,42,0.85); padding:2px 6px; border-radius:6px; border:1px solid rgba(148,163,184,0.25); font-family:"JetBrains Mono","Fira Code",monospace; }
    .logic-truth-table { width:100%; border-collapse:collapse; font-size:12px; }
    .logic-truth-table th, .logic-truth-table td { border:1px solid rgba(148,163,184,0.35); padding:4px 6px; text-align:center; }
    .logic-truth-table th { background:rgba(59,130,246,0.15); color:#bfdbfe; }
    .logic-empty-inspector { font-size:13px; opacity:0.85; line-height:1.6; }
    .logic-board-hint { font-size:12px; color:#334155; }
    .logic-wires-hint { font-size:12px; color:#e2e8f0; line-height:1.5; }
    .logic-footer-note { font-size:12px; color:#94a3b8; }
  `;

  function ensureStyle(){
    if (document.getElementById(STYLE_TAG_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.textContent = STYLE_RULES;
    document.head.appendChild(style);
  }

  function boolLabel(value){
    return value ? 'HIGH' : 'LOW';
  }

  function xorCount(inputs){
    let count = 0;
    for (const v of inputs) if (v) count++;
    return count % 2 === 1;
  }

  const COMPONENT_LIBRARY = [
    {
      id: 'toggle',
      label: 'トグル入力',
      icon: '⏻',
      category: '入力',
      description: 'クリックでON/OFFを切り替える基本入力',
      inputs: 0,
      outputs: 1,
      defaultState: false,
      setup(component, dom, helpers){
        const button = document.createElement('button');
        button.className = 'logic-mini-button';
        button.textContent = 'OFFにする';
        button.addEventListener('click', () => {
          component.state = !component.state;
          helpers.grantXp(1, { type: 'toggle', component: component.id });
          helpers.scheduleEvaluation();
          helpers.updateInspector();
        });
        dom.content.appendChild(button);
        component.controls = { button };
      },
      compute(component){
        return [Boolean(component.state)];
      },
      updateVisual(component){
        if (!component.controls) return;
        const isHigh = Boolean(component.state);
        component.controls.button.textContent = isHigh ? 'OFFにする' : 'ONにする';
        if (component.dom?.status) {
          component.dom.status.textContent = isHigh ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${isHigh ? 'high' : 'low'}`;
        }
      },
      truth(inputs){
        return inputs[0] || false;
      }
    },
    {
      id: 'clock',
      label: 'クロック',
      icon: '⏱️',
      category: '入力',
      description: '一定周期で振動するクロック入力',
      inputs: 0,
      outputs: 1,
      defaultState: false,
      setup(component, dom, helpers){
        component.period = 800;
        component.elapsed = 0;
        const row = document.createElement('div');
        row.className = 'logic-range-row';
        const label = document.createElement('label');
        label.textContent = '周期 (ms)';
        const range = document.createElement('input');
        range.type = 'range';
        range.min = '120';
        range.max = '2000';
        range.value = String(component.period);
        range.addEventListener('input', () => {
          component.period = Math.max(60, Number(range.value) || 500);
          helpers.updateInspector();
        });
        row.appendChild(label);
        row.appendChild(range);
        dom.content.appendChild(row);
        component.controls = { range };
      },
      compute(component){
        return [Boolean(component.state)];
      },
      updateVisual(component){
        if (component.dom?.status) {
          const isHigh = Boolean(component.state);
          component.dom.status.textContent = isHigh ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${isHigh ? 'high' : 'low'}`;
        }
      }
    },
    {
      id: 'const_high',
      label: '定数1',
      icon: '🔼',
      category: '入力',
      description: '常にHIGHを出力する定数ソース',
      inputs: 0,
      outputs: 1,
      compute(){ return [true]; },
      updateVisual(component){
        if (component.dom?.status) {
          component.dom.status.textContent = 'HIGH';
          component.dom.status.className = 'logic-chip high';
        }
      },
      truth(){ return true; }
    },
    {
      id: 'const_low',
      label: '定数0',
      icon: '🔽',
      category: '入力',
      description: '常にLOWを出力する定数ソース',
      inputs: 0,
      outputs: 1,
      compute(){ return [false]; },
      updateVisual(component){
        if (component.dom?.status) {
          component.dom.status.textContent = 'LOW';
          component.dom.status.className = 'logic-chip low';
        }
      },
      truth(){ return false; }
    },
    {
      id: 'buffer',
      label: 'バッファ',
      icon: '➡️',
      category: 'ゲート',
      description: '入力をそのまま出力するバッファ',
      propagationDelayNs: 1.0,
      inputs: 1,
      outputs: 1,
      compute(component, inputs){ return [Boolean(inputs[0])]; },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          component.dom.status.textContent = out ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){ return inputs[0] || false; }
    },
    {
      id: 'not',
      label: 'NOT',
      icon: '⊝',
      category: 'ゲート',
      description: '入力を反転するNOTゲート',
      propagationDelayNs: 1.4,
      inputs: 1,
      outputs: 1,
      compute(component, inputs){ return [!Boolean(inputs[0])]; },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          component.dom.status.textContent = out ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){ return !inputs[0]; }
    },
    {
      id: 'and',
      label: 'AND',
      icon: '∧',
      category: 'ゲート',
      description: '全ての入力がHIGHでHIGH',
      propagationDelayNs: 2.6,
      inputs: 2,
      outputs: 1,
      compute(component, inputs){ return [inputs.every(Boolean)]; },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          component.dom.status.textContent = out ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){ return inputs.every(Boolean); }
    },
    {
      id: 'nand',
      label: 'NAND',
      icon: '⊼',
      category: 'ゲート',
      description: 'ANDの反転',
      propagationDelayNs: 3.0,
      inputs: 2,
      outputs: 1,
      compute(component, inputs){ return [!inputs.every(Boolean)]; },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          component.dom.status.textContent = out ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){ return !inputs.every(Boolean); }
    },
    {
      id: 'or',
      label: 'OR',
      icon: '∨',
      category: 'ゲート',
      description: 'いずれかの入力がHIGHでHIGH',
      propagationDelayNs: 2.4,
      inputs: 2,
      outputs: 1,
      compute(component, inputs){ return [inputs.some(Boolean)]; },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          component.dom.status.textContent = out ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){ return inputs.some(Boolean); }
    },
    {
      id: 'nor',
      label: 'NOR',
      icon: '⊽',
      category: 'ゲート',
      description: 'ORの反転',
      propagationDelayNs: 2.8,
      inputs: 2,
      outputs: 1,
      compute(component, inputs){ return [!inputs.some(Boolean)]; },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          component.dom.status.textContent = out ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){ return !inputs.some(Boolean); }
    },
    {
      id: 'xor',
      label: 'XOR',
      icon: '⊕',
      category: 'ゲート',
      description: '入力のHIGH数が奇数でHIGH',
      propagationDelayNs: 3.8,
      inputs: 2,
      outputs: 1,
      compute(component, inputs){ return [xorCount(inputs)]; },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          component.dom.status.textContent = out ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){ return xorCount(inputs); }
    },
    {
      id: 'xnor',
      label: 'XNOR',
      icon: '⊙',
      category: 'ゲート',
      description: 'XORの反転',
      propagationDelayNs: 3.9,
      inputs: 2,
      outputs: 1,
      compute(component, inputs){ return [!xorCount(inputs)]; },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          component.dom.status.textContent = out ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){ return !xorCount(inputs); }
    },
    {
      id: 'splitter',
      label: 'スプリッタ',
      icon: '⇉',
      category: '配線',
      description: '1入力を複数の出力へ複製する',
      propagationDelayNs: 0.6,
      inputs: 1,
      outputs: 2,
      compute(component, inputs){
        const value = Boolean(inputs[0]);
        return [value, value];
      },
      updateVisual(component){
        if (component.dom?.status) {
          const outs = component.cachedOutputs || [];
          const label = outs.map(v => (v ? '1' : '0')).join(' ');
          component.dom.status.textContent = label ? `OUT: ${label}` : 'OUT: 0';
          component.dom.status.className = 'logic-chip neutral';
        }
      }
    },
    {
      id: 'mux2',
      label: '2:1 MUX',
      icon: '⤴️',
      category: '複合',
      description: '選択信号で入力を切り替える2入力1出力の多重化器',
      propagationDelayNs: 4.4,
      inputs: 3,
      outputs: 1,
      compute(component, inputs){
        const [in0, in1, sel] = [Boolean(inputs[0]), Boolean(inputs[1]), Boolean(inputs[2])];
        return [sel ? in1 : in0];
      },
      updateVisual(component){
        if (component.dom?.status) {
          const out = Boolean(component.cachedOutputs?.[0]);
          const sel = Boolean(component.lastInputs?.[2]);
          component.dom.status.textContent = `OUT:${out ? '1' : '0'} (SEL=${sel ? '1' : '0'})`;
          component.dom.status.className = `logic-chip ${out ? 'high' : 'low'}`;
        }
      },
      truth(inputs){
        return inputs[2] ? inputs[1] : inputs[0];
      }
    },
    {
      id: 'decoder2',
      label: '2-4デコーダ',
      icon: '🧮',
      category: '複合',
      description: '2ビット入力からワンホットの4出力を生成するデコーダ',
      propagationDelayNs: 4.8,
      inputs: 2,
      outputs: 4,
      compute(component, inputs){
        const [a, b] = [Boolean(inputs[0]), Boolean(inputs[1])];
        const index = (Number(a) << 1) | Number(b);
        const out = [false, false, false, false];
        out[index] = true;
        return out;
      },
      updateVisual(component){
        if (component.dom?.status) {
          const outs = component.cachedOutputs || [];
          component.dom.status.textContent = outs.map(v => (v ? '1' : '0')).join('');
          component.dom.status.className = 'logic-chip neutral';
        }
      }
    },
    {
      id: 'd_ff',
      label: 'Dフリップフロップ',
      icon: '⌛',
      category: 'シーケンシャル',
      description: '立ち上がりクロックでD入力をラッチしQ/Q̅を出力する同期フリップフロップ (非同期リセット付)',
      propagationDelayNs: 6.2,
      inputs: 3,
      outputs: 2,
      setup(component, dom){
        component.state = Boolean(component.state);
        component.prevClock = false;
        const indicator = document.createElement('div');
        indicator.className = 'logic-chip neutral';
        indicator.textContent = 'Q=0 / Q̅=1';
        dom.content.appendChild(indicator);
        component.controls = Object.assign({}, component.controls, { indicator });
      },
      compute(component, inputs){
        if (typeof component.state !== 'boolean') component.state = false;
        const [d, clk, reset] = [Boolean(inputs[0]), Boolean(inputs[1]), Boolean(inputs[2])];
        const prevClock = typeof component.prevClock === 'boolean' ? component.prevClock : Boolean(component.lastInputs?.[1]);
        if (reset) {
          component.state = false;
        } else if (!prevClock && clk) {
          component.state = d;
        }
        component.prevClock = clk;
        return [component.state, !component.state];
      },
      updateVisual(component){
        const q = Boolean(component.cachedOutputs?.[0]);
        if (component.dom?.status) {
          component.dom.status.textContent = `Q=${q ? '1' : '0'}`;
          component.dom.status.className = `logic-chip ${q ? 'high' : 'low'}`;
        }
        if (component.controls?.indicator) {
          component.controls.indicator.textContent = `Q=${q ? 1 : 0} / Q̅=${q ? 0 : 1}`;
          component.controls.indicator.className = `logic-chip ${q ? 'high' : 'low'}`;
        }
      },
      inspect(component){
        return [
          { label: 'ラッチ状態', value: component.state ? 'SET' : 'RESET' },
          { label: '前回クロック', value: component.prevClock ? 'HIGH' : 'LOW' }
        ];
      }
    },
    {
      id: 'sr_latch',
      label: 'SRラッチ',
      icon: '🔁',
      category: 'シーケンシャル',
      description: 'NOR構成の基本SRラッチ。Sでセット、Rでリセット。',
      propagationDelayNs: 5.5,
      inputs: 2,
      outputs: 2,
      setup(component, dom){
        component.state = Boolean(component.state);
        component.metaInvalid = false;
        const indicator = document.createElement('div');
        indicator.className = 'logic-chip neutral';
        indicator.textContent = '安定';
        dom.content.appendChild(indicator);
        component.controls = Object.assign({}, component.controls, { indicator });
      },
      compute(component, inputs){
        if (typeof component.state !== 'boolean') component.state = false;
        const [set, reset] = [Boolean(inputs[0]), Boolean(inputs[1])];
        component.metaInvalid = false;
        if (set && reset) {
          component.metaInvalid = true;
        } else if (set) {
          component.state = true;
        } else if (reset) {
          component.state = false;
        }
        return component.metaInvalid ? [false, false] : [component.state, !component.state];
      },
      updateVisual(component){
        if (component.dom?.status) {
          if (component.metaInvalid) {
            component.dom.status.textContent = '不定状態';
            component.dom.status.className = 'logic-chip low';
          } else {
            const q = Boolean(component.cachedOutputs?.[0]);
            component.dom.status.textContent = `Q=${q ? '1' : '0'}`;
            component.dom.status.className = `logic-chip ${q ? 'high' : 'low'}`;
          }
        }
        if (component.controls?.indicator) {
          component.controls.indicator.textContent = component.metaInvalid ? 'S=R=1 (不定)' : (component.state ? 'SET' : 'RESET');
          component.controls.indicator.className = `logic-chip ${component.metaInvalid ? 'low' : (component.state ? 'high' : 'neutral')}`;
        }
      },
      inspect(component){
        return component.metaInvalid ? [{ label: '注意', value: 'SとRが同時に1です。安定しません。' }] : [];
      }
    },
    {
      id: 't_ff',
      label: 'Tフリップフロップ',
      icon: '⏲️',
      category: 'シーケンシャル',
      description: '立ち上がりクロック毎にT入力がHIGHなら出力を反転。リセット入力付き。',
      propagationDelayNs: 6.0,
      inputs: 3,
      outputs: 2,
      setup(component){
        component.state = Boolean(component.state);
        component.prevClock = false;
      },
      compute(component, inputs){
        if (typeof component.state !== 'boolean') component.state = false;
        const [toggle, clk, reset] = [Boolean(inputs[0]), Boolean(inputs[1]), Boolean(inputs[2])];
        const prevClock = typeof component.prevClock === 'boolean' ? component.prevClock : Boolean(component.lastInputs?.[1]);
        if (reset) {
          component.state = false;
        } else if (!prevClock && clk && toggle) {
          component.state = !component.state;
        }
        component.prevClock = clk;
        return [component.state, !component.state];
      },
      updateVisual(component){
        const q = Boolean(component.cachedOutputs?.[0]);
        if (component.dom?.status) {
          component.dom.status.textContent = `Q=${q ? '1' : '0'}`;
          component.dom.status.className = `logic-chip ${q ? 'high' : 'low'}`;
        }
      },
      inspect(component){
        return [
          { label: 'トグル状態', value: component.state ? '1' : '0' },
          { label: '前回クロック', value: component.prevClock ? 'HIGH' : 'LOW' }
        ];
      }
    },
    {
      id: 'probe',
      label: 'プローブ',
      icon: '🔍',
      category: '計測',
      description: '入力値を監視する計測ノード',
      propagationDelayNs: 0.2,
      inputs: 1,
      outputs: 0,
      compute(){ return []; },
      updateVisual(component){
        if (component.dom?.status) {
          const input = Boolean(component.lastInputs?.[0]);
          component.dom.status.textContent = input ? 'HIGH' : 'LOW';
          component.dom.status.className = `logic-chip ${input ? 'high' : 'low'}`;
        }
        if (component.controls?.indicator) {
          component.controls.indicator.textContent = component.lastInputs?.[0] ? '1' : '0';
        }
      },
      setup(component, dom){
        const indicator = document.createElement('div');
        indicator.className = 'logic-chip neutral';
        indicator.textContent = '0';
        dom.content.appendChild(indicator);
        component.controls = { indicator };
      }
    },
    {
      id: 'led',
      label: 'LED',
      icon: '💡',
      category: '出力',
      description: '入力がHIGHのとき点灯',
      propagationDelayNs: 1.5,
      inputs: 1,
      outputs: 0,
      compute(){ return []; },
      setup(component, dom){
        const lamp = document.createElement('div');
        lamp.className = 'logic-led-indicator off';
        dom.content.appendChild(lamp);
        component.controls = { lamp };
      },
      updateVisual(component){
        const isOn = Boolean(component.lastInputs?.[0]);
        if (component.controls?.lamp) {
          component.controls.lamp.className = `logic-led-indicator ${isOn ? 'on' : 'off'}`;
        }
        if (component.dom?.status) {
          component.dom.status.textContent = isOn ? 'ON' : 'OFF';
          component.dom.status.className = `logic-chip ${isOn ? 'high' : 'low'}`;
        }
      }
    }
  ];

  function groupByCategory(list){
    const map = new Map();
    for (const item of list) {
      const cat = item.category || 'その他';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(item);
    }
    return map;
  }

  window.registerMiniGame({
    id: 'logic_circuit',
    name: '論理回路シミュレータ', nameKey: 'selection.miniexp.games.logic_circuit.name',
    description: '入力・ゲート・出力を組んで論理回路をリアルタイム検証', descriptionKey: 'selection.miniexp.games.logic_circuit.description', categoryIds: ['toy'],
    category: 'トイ',
    version: '0.1.0',
    author: 'mod',
    create(root, awardXp){
      if (!root) throw new Error('Logic circuit simulator requires a container');
      ensureStyle();

      const state = {
        components: [],
        wires: [],
        componentEls: new Map(),
        wireEls: new Map(),
        nextComponentId: 1,
        nextWireId: 1,
        selectedComponentId: null,
        pendingConnection: null,
        sessionXp: 0,
        evaluationScheduled: false,
        activeToolId: null,
        rafId: null,
        lastTick: performance.now(),
        isRunning: false,
        simTime: 0,
        stepDuration: 100
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'logic-circuit-root';
      wrapper.tabIndex = 0;

      const header = document.createElement('div');
      header.className = 'logic-circuit-header';

      const titleWrap = document.createElement('div');
      const title = document.createElement('h2');
      title.className = 'logic-circuit-title';
      title.textContent = '論理回路シミュレータ';
      const subtitle = document.createElement('div');
      subtitle.className = 'logic-circuit-subtitle';
      subtitle.textContent = '入力ノードとゲートを並べ、リアルタイム評価で組み合わせ論理を検証';
      titleWrap.appendChild(title);
      titleWrap.appendChild(subtitle);

      const headerActions = document.createElement('div');
      headerActions.className = 'logic-circuit-actions';
      const xpChip = document.createElement('div');
      xpChip.className = 'logic-chip';
      xpChip.textContent = 'セッションEXP: 0';
      const timeChip = document.createElement('div');
      timeChip.className = 'logic-chip neutral';
      timeChip.textContent = '経過時間: 0.0ms';

      const clearButton = document.createElement('button');
      clearButton.className = 'logic-mini-button';
      clearButton.textContent = 'キャンバス初期化';
      clearButton.addEventListener('click', () => {
        if (!state.components.length && !state.wires.length) return;
        for (const wire of [...state.wires]) removeWire(wire.id);
        for (const comp of [...state.components]) removeComponent(comp.id);
        state.selectedComponentId = null;
        state.simTime = 0;
        updateInspector();
        updateSimulationControls();
        scheduleEvaluation();
      });

      const deselectButton = document.createElement('button');
      deselectButton.className = 'logic-mini-button';
      deselectButton.textContent = 'ツール解除 (Esc)';
      deselectButton.addEventListener('click', () => setActiveTool(null));

      const runButton = document.createElement('button');
      runButton.className = 'logic-mini-button';
      runButton.textContent = '⏸ 停止';
      runButton.addEventListener('click', () => {
        if (state.isRunning) {
          stop();
        } else {
          start();
        }
        updateSimulationControls();
      });

      const stepButton = document.createElement('button');
      stepButton.className = 'logic-mini-button';
      stepButton.textContent = '⏭ ステップ';
      stepButton.addEventListener('click', () => {
        stop();
        advanceSimulation(state.stepDuration, { immediate: true });
      });

      const stepControl = document.createElement('label');
      stepControl.style.display = 'flex';
      stepControl.style.alignItems = 'center';
      stepControl.style.gap = '6px';
      stepControl.style.fontSize = '12px';
      stepControl.textContent = 'ステップ(ms)';
      const stepInput = document.createElement('input');
      stepInput.type = 'number';
      stepInput.min = '1';
      stepInput.max = '10000';
      stepInput.value = String(state.stepDuration);
      stepInput.className = 'logic-step-input';
      stepInput.addEventListener('change', () => {
        const value = Number(stepInput.value);
        if (Number.isFinite(value)) {
          state.stepDuration = Math.max(1, Math.min(10000, Math.round(value)));
        }
        stepInput.value = String(state.stepDuration);
        updateSimulationControls();
      });
      stepControl.appendChild(stepInput);

      headerActions.appendChild(xpChip);
      headerActions.appendChild(timeChip);
      headerActions.appendChild(runButton);
      headerActions.appendChild(stepButton);
      headerActions.appendChild(stepControl);
      headerActions.appendChild(clearButton);
      headerActions.appendChild(deselectButton);

      header.appendChild(titleWrap);
      header.appendChild(headerActions);

      const toolbar = document.createElement('div');
      toolbar.className = 'logic-circuit-toolbar';

      const boardHint = document.createElement('div');
      boardHint.className = 'logic-board-hint';
      boardHint.textContent = 'ツールを選択し、キャンバスの空いている場所をクリックして配置します。出力ポート→入力ポートの順でクリックすると配線できます。Deleteキーで選択中の部品を削除。';

      const toolGroups = document.createElement('div');
      toolGroups.className = 'logic-tool-groups';

      const groups = groupByCategory(COMPONENT_LIBRARY);
      const toolButtons = new Map();
      for (const [cat, defs] of groups) {
        const groupEl = document.createElement('div');
        groupEl.style.display = 'flex';
        groupEl.style.flexDirection = 'column';
        groupEl.style.gap = '6px';

        const label = document.createElement('div');
        label.textContent = cat;
        label.style.fontSize = '12px';
        label.style.fontWeight = '700';
        label.style.letterSpacing = '0.04em';
        label.style.color = '#1f2937';

        const buttonsWrap = document.createElement('div');
        buttonsWrap.style.display = 'flex';
        buttonsWrap.style.flexWrap = 'wrap';
        buttonsWrap.style.gap = '8px';

        for (const def of defs) {
          const btn = document.createElement('button');
          btn.className = 'logic-tool-button';
          btn.dataset.toolId = def.id;

          const icon = document.createElement('span');
          icon.textContent = def.icon || '■';
          icon.style.fontSize = '20px';

          const labelEl = document.createElement('span');
          labelEl.className = 'logic-tool-label';
          labelEl.textContent = def.label;

          const desc = document.createElement('span');
          desc.className = 'logic-tool-desc';
          desc.textContent = def.description;

          btn.appendChild(icon);
          btn.appendChild(labelEl);
          btn.appendChild(desc);

          btn.addEventListener('click', () => {
            if (state.activeToolId === def.id) {
              setActiveTool(null);
            } else {
              setActiveTool(def.id);
            }
          });

          toolButtons.set(def.id, btn);
          buttonsWrap.appendChild(btn);
        }

        groupEl.appendChild(label);
        groupEl.appendChild(buttonsWrap);
        toolGroups.appendChild(groupEl);
      }

      toolbar.appendChild(boardHint);
      toolbar.appendChild(toolGroups);

      const layout = document.createElement('div');
      layout.className = 'logic-circuit-layout';

      const boardWrapper = document.createElement('div');
      boardWrapper.className = 'logic-board-wrapper';
      const board = document.createElement('div');
      board.className = 'logic-board';
      const wireLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      wireLayer.classList.add('logic-wire-layer');
      wireLayer.setAttribute('width', '100%');
      wireLayer.setAttribute('height', '100%');

      boardWrapper.appendChild(board);
      boardWrapper.appendChild(wireLayer);

      const inspector = document.createElement('div');
      inspector.className = 'logic-inspector';
      const inspectorTitle = document.createElement('h3');
      inspectorTitle.textContent = '部品インスペクタ';
      const inspectorEmpty = document.createElement('div');
      inspectorEmpty.className = 'logic-empty-inspector';
      inspectorEmpty.textContent = '部品を選択すると詳細と真理値表を表示します。最大入力3本のゲートで真理値表を自動生成します。';

      const inspectorDetails = document.createElement('div');
      inspectorDetails.className = 'logic-inspector-section';
      inspectorDetails.style.display = 'none';
      const inspectorStats = document.createElement('dl');
      const truthSection = document.createElement('div');
      truthSection.className = 'logic-inspector-section';
      truthSection.style.display = 'none';
      const truthTitle = document.createElement('div');
      truthTitle.textContent = '真理値表';
      truthTitle.style.fontWeight = '700';
      truthTitle.style.fontSize = '13px';
      const truthTableWrap = document.createElement('div');

      const inspectorFooter = document.createElement('div');
      inspectorFooter.className = 'logic-wires-hint';
      inspectorFooter.textContent = '配線はパスをクリックで削除。Alt+入力クリックでその入力への配線を解除。';

      inspector.appendChild(inspectorTitle);
      inspector.appendChild(inspectorEmpty);
      inspectorDetails.appendChild(inspectorStats);
      inspector.appendChild(inspectorDetails);
      truthSection.appendChild(truthTitle);
      truthSection.appendChild(truthTableWrap);
      inspector.appendChild(truthSection);
      inspector.appendChild(inspectorFooter);

      layout.appendChild(boardWrapper);
      layout.appendChild(inspector);

      const footer = document.createElement('div');
      footer.className = 'logic-footer-note';
      footer.textContent = 'ヒント: 入力をトグルして即座に出力を確認。シミュレーション制御で一時停止やステップ実行を行いながらシーケンシャル動作を解析できます。';

      wrapper.appendChild(header);
      wrapper.appendChild(toolbar);
      wrapper.appendChild(layout);
      wrapper.appendChild(footer);
      root.appendChild(wrapper);

      const resizeObserver = new ResizeObserver(() => {
        updateAllWireGeometry();
      });
      resizeObserver.observe(boardWrapper);

      const handleViewportChange = () => {
        updateAllWireGeometry();
      };
      window.addEventListener('scroll', handleViewportChange, true);
      window.addEventListener('resize', handleViewportChange);

      function updateXp(amount){
        state.sessionXp += amount;
        xpChip.textContent = `セッションEXP: ${state.sessionXp}`;
      }

      function grantXp(amount, meta){
        if (!awardXp || !amount) return;
        try {
          awardXp(amount, Object.assign({ source: 'logic_circuit' }, meta || {}));
        } catch {}
        updateXp(amount);
      }

      function updateSimulationControls(){
        timeChip.textContent = `経過時間: ${state.simTime.toFixed(1)}ms`;
        runButton.textContent = state.isRunning ? '⏸ 停止' : '▶ 再開';
        stepButton.disabled = state.isRunning;
        stepInput.value = String(state.stepDuration);
      }

      function setActiveTool(toolId){
        state.activeToolId = toolId;
        for (const [id, btn] of toolButtons.entries()) {
          btn.classList.toggle('active', id === toolId);
        }
      }

      function getBoardRect(){
        return board.getBoundingClientRect();
      }

      function boardPoint(event){
        const rect = getBoardRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      }

      function scheduleEvaluation(){
        if (state.evaluationScheduled) return;
        state.evaluationScheduled = true;
        requestAnimationFrame(() => {
          state.evaluationScheduled = false;
          evaluateCircuit();
        });
      }

      function createPort(kind, componentId, index){
        const port = document.createElement('div');
        port.className = `logic-port ${kind}`;
        port.dataset.componentId = componentId;
        port.dataset.portIndex = String(index);
        port.dataset.kind = kind;
        if (kind === 'output') {
          port.title = `出力 #${index + 1}`;
          port.addEventListener('click', () => {
            if (state.pendingConnection && state.pendingConnection.kind === 'output' && state.pendingConnection.componentId === componentId && state.pendingConnection.portIndex === index) {
              clearPendingConnection();
              return;
            }
            startPendingConnection('output', componentId, index, port);
          });
        } else {
          port.title = `入力 #${index + 1}`;
          port.addEventListener('click', (event) => {
            if (event.altKey) {
              removeInputConnections(componentId, index);
              scheduleEvaluation();
              return;
            }
            if (state.pendingConnection && state.pendingConnection.kind === 'output') {
              createWire(state.pendingConnection.componentId, state.pendingConnection.portIndex, componentId, index);
              clearPendingConnection();
            } else {
              startPendingConnection('input', componentId, index, port);
            }
          });
        }
        return port;
      }

      function startPendingConnection(kind, componentId, portIndex, element){
        clearPendingConnection();
        state.pendingConnection = { kind, componentId, portIndex, element };
        element.classList.add('pending');
        if (kind === 'output') {
          const phantomId = `pending-${Date.now()}`;
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.classList.add('logic-wire-path', 'pending');
          path.dataset.wireId = phantomId;
          wireLayer.appendChild(path);
          state.wireEls.set(phantomId, path);
        }
      }

      function clearPendingConnection(){
        if (state.pendingConnection?.element) {
          state.pendingConnection.element.classList.remove('pending');
        }
        if (state.pendingConnection && state.pendingConnection.kind === 'output') {
          const phantomId = [...state.wireEls.keys()].find(id => id.startsWith('pending-'));
          if (phantomId) {
            const path = state.wireEls.get(phantomId);
            if (path && path.parentNode) path.parentNode.removeChild(path);
            state.wireEls.delete(phantomId);
          }
        }
        state.pendingConnection = null;
      }

      function removeInputConnections(componentId, portIndex){
        for (const wire of [...state.wires]) {
          if (wire.to.componentId === componentId && wire.to.portIndex === portIndex) {
            removeWire(wire.id);
          }
        }
      }

      function addComponent(def, x, y){
        const id = `cmp_${state.nextComponentId++}`;
        const component = {
          id,
          def,
          type: def.id,
          x,
          y,
          state: def.defaultState || false,
          cachedOutputs: new Array(def.outputs || 0).fill(false),
          lastInputs: new Array(def.inputs || 0).fill(false)
        };

        const element = document.createElement('div');
        element.className = 'logic-component';
        element.dataset.componentId = id;

        const headerEl = document.createElement('div');
        headerEl.className = 'logic-comp-header';
        const titleEl = document.createElement('div');
        titleEl.className = 'logic-comp-title';
        titleEl.textContent = def.label;
        const statusChip = document.createElement('div');
        statusChip.className = 'logic-chip neutral';
        statusChip.textContent = '---';
        headerEl.appendChild(titleEl);
        headerEl.appendChild(statusChip);

        const bodyEl = document.createElement('div');
        bodyEl.className = 'logic-comp-body';
        const inputCol = document.createElement('div');
        inputCol.className = 'logic-port-column';
        const contentCol = document.createElement('div');
        contentCol.className = 'logic-comp-content';
        const outputCol = document.createElement('div');
        outputCol.className = 'logic-port-column';

        const inputs = [];
        for (let i = 0; i < (def.inputs || 0); i++) {
          const port = createPort('input', id, i);
          inputs.push(port);
          inputCol.appendChild(port);
        }
        const outputs = [];
        for (let i = 0; i < (def.outputs || 0); i++) {
          const port = createPort('output', id, i);
          outputs.push(port);
          outputCol.appendChild(port);
        }

        bodyEl.appendChild(inputCol);
        bodyEl.appendChild(contentCol);
        bodyEl.appendChild(outputCol);

        element.appendChild(headerEl);
        element.appendChild(bodyEl);

        board.appendChild(element);

        component.dom = {
          root: element,
          header: headerEl,
          status: statusChip,
          inputs,
          outputs,
          content: contentCol
        };

        if (typeof def.setup === 'function') {
          def.setup(component, component.dom, { grantXp, scheduleEvaluation, updateInspector });
        }
        if (typeof def.updateVisual === 'function') {
          def.updateVisual(component);
        }

        const rect = element.getBoundingClientRect();
        component.width = rect.width;
        component.height = rect.height;
        positionComponent(component, x, y);

        element.addEventListener('mousedown', (event) => {
          event.stopPropagation();
        });
        element.addEventListener('click', (event) => {
          event.stopPropagation();
          selectComponent(id);
        });

        headerEl.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          event.stopPropagation();
          selectComponent(id);
          beginDrag(component, event);
        }, { passive: false });

        state.components.push(component);
        state.componentEls.set(id, component);
        grantXp(2, { type: 'component-add', component: def.id });
        scheduleEvaluation();
        selectComponent(id);
        return component;
      }

      function positionComponent(component, x, y){
        const width = component.width || 200;
        const height = component.height || 140;
        const boardRectLocal = board.getBoundingClientRect();
        const maxX = boardRectLocal.width - width - 16;
        const maxY = boardRectLocal.height - height - 16;
        component.x = Math.max(8, Math.min(maxX, x));
        component.y = Math.max(8, Math.min(maxY, y));
        component.dom.root.style.transform = `translate(${component.x}px, ${component.y}px)`;
        updateAllWireGeometry();
      }

      function beginDrag(component, startEvent){
        const startX = startEvent.clientX;
        const startY = startEvent.clientY;
        const initialX = component.x;
        const initialY = component.y;

        function onMove(event){
          const dx = event.clientX - startX;
          const dy = event.clientY - startY;
          positionComponent(component, initialX + dx, initialY + dy);
        }

        function onUp(){
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        }

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      }

      function removeComponent(componentId){
        const component = state.componentEls.get(componentId);
        if (!component) return;
        for (const wire of [...state.wires]) {
          if (wire.from.componentId === componentId || wire.to.componentId === componentId) {
            removeWire(wire.id);
          }
        }
        if (component.dom?.root?.parentNode) {
          component.dom.root.parentNode.removeChild(component.dom.root);
        }
        state.components = state.components.filter(c => c.id !== componentId);
        state.componentEls.delete(componentId);
        if (state.selectedComponentId === componentId) {
          state.selectedComponentId = null;
        }
        scheduleEvaluation();
      }

      function createWire(fromComponentId, fromPortIndex, toComponentId, toPortIndex){
        if (fromComponentId === toComponentId) return;
        removeInputConnections(toComponentId, toPortIndex);
        const id = `wire_${state.nextWireId++}`;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('logic-wire-path');
        path.dataset.wireId = id;
        path.addEventListener('click', (event) => {
          event.stopPropagation();
          removeWire(id);
          scheduleEvaluation();
        });
        wireLayer.appendChild(path);
        const wire = {
          id,
          from: { componentId: fromComponentId, portIndex: fromPortIndex },
          to: { componentId: toComponentId, portIndex: toPortIndex },
          element: path
        };
        state.wires.push(wire);
        state.wireEls.set(id, path);
        grantXp(1, { type: 'wire-create', from: fromComponentId, to: toComponentId });
        updateWireGeometry(wire);
        scheduleEvaluation();
      }

      function removeWire(id){
        const index = state.wires.findIndex(w => w.id === id);
        if (index >= 0) {
          const wire = state.wires[index];
          if (wire.element?.parentNode) wire.element.parentNode.removeChild(wire.element);
          state.wires.splice(index, 1);
          state.wireEls.delete(id);
        }
      }

      function getConnectorCenter(componentId, kind, portIndex){
        const component = state.componentEls.get(componentId);
        if (!component) return null;
        const ports = kind === 'output' ? component.dom.outputs : component.dom.inputs;
        const port = ports?.[portIndex];
        if (!port) return null;
        const portRect = port.getBoundingClientRect();
        const rect = getBoardRect();
        return {
          x: portRect.left - rect.left + portRect.width / 2,
          y: portRect.top - rect.top + portRect.height / 2
        };
      }

      function updateWireGeometry(wire){
        const start = getConnectorCenter(wire.from.componentId, 'output', wire.from.portIndex);
        const end = getConnectorCenter(wire.to.componentId, 'input', wire.to.portIndex);
        if (!start || !end) return;
        const dx = Math.max(Math.abs(end.x - start.x) * 0.45, 40);
        const pathData = `M${start.x},${start.y} C${start.x + dx},${start.y} ${end.x - dx},${end.y} ${end.x},${end.y}`;
        wire.element.setAttribute('d', pathData);
      }

      function updateAllWireGeometry(){
        for (const wire of state.wires) {
          updateWireGeometry(wire);
        }
      }

      function selectComponent(id){
        state.selectedComponentId = id;
        for (const comp of state.components) {
          comp.dom.root.classList.toggle('selected', comp.id === id);
        }
        updateInspector();
      }

      function renderTruthTable(component){
        const def = component.def;
        const inputsCount = def.inputs || 0;
        if (inputsCount === 0 || inputsCount > 4 || typeof def.truth !== 'function' || def.outputs !== 1) {
          truthSection.style.display = 'none';
          truthTableWrap.innerHTML = '';
          return;
        }
        const table = document.createElement('table');
        table.className = 'logic-truth-table';
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        for (let i = 0; i < inputsCount; i++) {
          const th = document.createElement('th');
          th.textContent = `IN${i + 1}`;
          headRow.appendChild(th);
        }
        const thOut = document.createElement('th');
        thOut.textContent = 'OUT';
        headRow.appendChild(thOut);
        thead.appendChild(headRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        const total = Math.pow(2, inputsCount);
        for (let mask = 0; mask < total; mask++) {
          const row = document.createElement('tr');
          const inputs = [];
          for (let bit = 0; bit < inputsCount; bit++) {
            const value = Boolean(mask & (1 << (inputsCount - bit - 1)));
            inputs.push(value);
            const td = document.createElement('td');
            td.textContent = value ? '1' : '0';
            row.appendChild(td);
          }
          const output = Boolean(def.truth(inputs));
          const tdOut = document.createElement('td');
          tdOut.textContent = output ? '1' : '0';
          row.appendChild(tdOut);
          tbody.appendChild(row);
        }
        table.appendChild(tbody);
        truthTableWrap.innerHTML = '';
        truthTableWrap.appendChild(table);
        truthSection.style.display = '';
      }

      function updateInspector(){
        const component = state.componentEls.get(state.selectedComponentId);
        if (!component) {
          inspectorEmpty.style.display = '';
          inspectorDetails.style.display = 'none';
          truthSection.style.display = 'none';
          truthTableWrap.innerHTML = '';
          return;
        }
        inspectorEmpty.style.display = 'none';
        inspectorDetails.style.display = '';
        inspectorStats.innerHTML = '';

        const addRow = (label, value) => {
          const dt = document.createElement('dt');
          dt.textContent = label;
          const dd = document.createElement('dd');
          if (value instanceof Node) {
            dd.appendChild(value);
          } else {
            dd.textContent = value;
          }
          inspectorStats.appendChild(dt);
          inspectorStats.appendChild(dd);
        };

        addRow('ID', component.id);
        addRow('タイプ', component.def.label);
        addRow('入力ポート', String(component.def.inputs || 0));
        addRow('出力ポート', String(component.def.outputs || 0));
        if (component.def.id === 'clock') {
          addRow('周期 (ms)', String(Math.round(component.period || 0)));
        }
        if ((component.lastInputs || []).length) {
          const code = document.createElement('code');
          code.textContent = component.lastInputs.map(v => (v ? '1' : '0')).join(' ');
          addRow('最新入力', code);
        }
        if ((component.cachedOutputs || []).length) {
          const code = document.createElement('code');
          code.textContent = component.cachedOutputs.map(v => (v ? '1' : '0')).join(' ');
          addRow('最新出力', code);
        }
        const fanIn = state.wires.filter(w => w.to.componentId === component.id).length;
        const fanOut = state.wires.filter(w => w.from.componentId === component.id).length;
        addRow('入力接続', `${fanIn} 本`);
        addRow('出力接続', `${fanOut} 本`);
        if (typeof component.def.propagationDelayNs === 'number') {
          addRow('伝播遅延(目安)', `${component.def.propagationDelayNs.toFixed(1)} ns`);
        }
        if (typeof component.def.inspect === 'function') {
          try {
            const extras = component.def.inspect(component) || [];
            for (const info of extras) {
              if (!info || !info.label) continue;
              addRow(info.label, info.value ?? '');
            }
          } catch {}
        }
        if (component.def.description) addRow('説明', component.def.description);
        renderTruthTable(component);
      }

      function evaluateCircuit(){
        const outputs = new Map();
        const lastInputsMap = new Map();
        for (const component of state.components) {
          outputs.set(component.id, component.cachedOutputs ? [...component.cachedOutputs] : new Array(component.def.outputs || 0).fill(false));
        }
        const maxIterations = 16;
        for (let iteration = 0; iteration < maxIterations; iteration++) {
          let changed = false;
          for (const component of state.components) {
            const def = component.def;
            const inputValues = new Array(def.inputs || 0).fill(false);
            for (const wire of state.wires) {
              if (wire.to.componentId !== component.id) continue;
              const sourceOutputs = outputs.get(wire.from.componentId) || [];
              const value = Boolean(sourceOutputs[wire.from.portIndex] || false);
              if (value) {
                inputValues[wire.to.portIndex] = true;
              }
            }
            let computed;
            try {
              computed = def.compute ? def.compute(component, inputValues.slice()) : [];
            } catch {
              computed = new Array(def.outputs || 0).fill(false);
            }
            if (!Array.isArray(computed)) {
              computed = [Boolean(computed)];
            }
            const prev = outputs.get(component.id) || [];
            const normalized = computed.map(Boolean);
            if (normalized.length < (def.outputs || 0)) {
              while (normalized.length < (def.outputs || 0)) normalized.push(false);
            }
            if (!arrayEquals(prev, normalized)) {
              outputs.set(component.id, normalized);
              changed = true;
            }
            lastInputsMap.set(component.id, inputValues);
          }
          if (!changed) break;
        }

        for (const component of state.components) {
          component.cachedOutputs = outputs.get(component.id) || new Array(component.def.outputs || 0).fill(false);
          component.lastInputs = lastInputsMap.get(component.id) || new Array(component.def.inputs || 0).fill(false);
          updateConnectorVisual(component);
          if (typeof component.def.updateVisual === 'function') {
            component.def.updateVisual(component);
          }
        }

        for (const wire of state.wires) {
          const sourceOutputs = outputs.get(wire.from.componentId) || [];
          const value = Boolean(sourceOutputs[wire.from.portIndex] || false);
          wire.element.classList.toggle('active', value);
          updateWireGeometry(wire);
        }

        updateInspector();
      }

      function arrayEquals(a, b){
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (Boolean(a[i]) !== Boolean(b[i])) return false;
        }
        return true;
      }

      function updateConnectorVisual(component){
        if (component.dom?.inputs) {
          component.dom.inputs.forEach((el, index) => {
            const value = Boolean(component.lastInputs?.[index]);
            el.classList.toggle('active', value);
          });
        }
        if (component.dom?.outputs) {
          component.dom.outputs.forEach((el, index) => {
            const value = Boolean(component.cachedOutputs?.[index]);
            el.classList.toggle('active', value);
          });
        }
      }

      function handleBoardPointerMove(event){
        if (!state.pendingConnection || state.pendingConnection.kind !== 'output') return;
        const phantomId = [...state.wireEls.keys()].find(id => id.startsWith('pending-'));
        if (!phantomId) return;
        const path = state.wireEls.get(phantomId);
        if (!path) return;
        const start = getConnectorCenter(state.pendingConnection.componentId, 'output', state.pendingConnection.portIndex);
        const rect = getBoardRect();
        const end = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        if (!start) return;
        const dx = Math.max(Math.abs(end.x - start.x) * 0.45, 30);
        const d = `M${start.x},${start.y} C${start.x + dx},${start.y} ${end.x - dx},${end.y} ${end.x},${end.y}`;
        path.setAttribute('d', d);
      }

      function handleBoardClick(event){
        const target = event.target;
        if (target.closest('.logic-component') || target.closest('.logic-port') || target.closest('.logic-wire-path')) {
          return;
        }
        if (!state.activeToolId) {
          clearPendingConnection();
          selectComponent(null);
          return;
        }
        const def = COMPONENT_LIBRARY.find(item => item.id === state.activeToolId);
        if (!def) return;
        const point = boardPoint(event);
        const offsetX = point.x - 90;
        const offsetY = point.y - 64;
        addComponent(def, offsetX, offsetY);
      }

      function advanceSimulation(delta, options = {}){
        const immediate = Boolean(options.immediate);
        if (!Number.isFinite(delta) || delta < 0) delta = 0;
        state.simTime += delta;
        let dirty = false;
        for (const component of state.components) {
          if (component.def.id === 'clock') {
            component.elapsed = (component.elapsed || 0) + delta;
            const period = Math.max(60, component.period || 500);
            while (component.elapsed >= period) {
              component.elapsed -= period;
              component.state = !component.state;
              dirty = true;
            }
          }
          if (typeof component.def.advance === 'function') {
            try {
              if (component.def.advance(component, delta, { scheduleEvaluation, state })) {
                dirty = true;
              }
            } catch {}
          }
        }
        if (dirty) {
          if (state.isRunning && !immediate) {
            scheduleEvaluation();
          } else {
            evaluateCircuit();
          }
        } else if (immediate) {
          evaluateCircuit();
        }
        updateSimulationControls();
        return dirty;
      }

      function tick(now){
        if (!state.isRunning) return;
        const delta = now - state.lastTick;
        state.lastTick = now;
        advanceSimulation(delta);
        state.rafId = requestAnimationFrame(tick);
      }

      function handleKeyDown(event){
        if (event.key === 'Escape') {
          setActiveTool(null);
          clearPendingConnection();
        }
        if (event.key === 'Delete' || event.key === 'Backspace') {
          if (state.selectedComponentId) {
            removeComponent(state.selectedComponentId);
            updateInspector();
          }
        }
      }

      board.addEventListener('mousedown', handleBoardClick);
      board.addEventListener('pointermove', handleBoardPointerMove);
      wrapper.addEventListener('keydown', handleKeyDown);
      board.addEventListener('mouseleave', () => {
        const phantomId = [...state.wireEls.keys()].find(id => id.startsWith('pending-'));
        if (phantomId) {
          const path = state.wireEls.get(phantomId);
          if (path) path.setAttribute('d', '');
        }
      });

      function start(){
        if (state.isRunning) return;
        state.isRunning = true;
        state.lastTick = performance.now();
        state.rafId = requestAnimationFrame(tick);
        scheduleEvaluation();
        updateSimulationControls();
      }

      function stop(){
        if (!state.isRunning) return;
        state.isRunning = false;
        if (state.rafId) cancelAnimationFrame(state.rafId);
        state.rafId = null;
        updateSimulationControls();
      }

      function destroy(){
        stop();
        resizeObserver.disconnect();
        window.removeEventListener('scroll', handleViewportChange, true);
        window.removeEventListener('resize', handleViewportChange);
        clearPendingConnection();
        board.removeEventListener('mousedown', handleBoardClick);
        board.removeEventListener('pointermove', handleBoardPointerMove);
        wrapper.removeEventListener('keydown', handleKeyDown);
        if (wrapper.parentNode === root) root.removeChild(wrapper);
        state.components.length = 0;
        state.wires.length = 0;
        state.componentEls.clear();
        state.wireEls.clear();
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
  });
})();
