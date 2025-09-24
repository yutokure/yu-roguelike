(function(){
  /** MiniExp: Physics Sandbox "物理遊び" (v0.1.0) */
  const STYLE_TAG_ID = 'mini-exp-phys-style';
  const STYLE_RULES = `
    .phys-play { display:flex; flex-direction:column; gap:12px; background:rgba(15,23,42,0.04); padding:12px; border-radius:12px; border:1px solid rgba(148,163,184,0.35); }
    .phys-toolbar { display:flex; flex-wrap:wrap; align-items:flex-start; justify-content:space-between; gap:12px; padding:8px 12px; background:linear-gradient(135deg,#0f172a,#1e293b); color:#e2e8f0; border-radius:10px; box-shadow:0 4px 12px rgba(15,23,42,0.2); }
    .phys-tool-group, .phys-action-group { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
    .phys-tool-btn, .phys-action-btn { padding:8px 14px; border-radius:999px; border:1px solid rgba(226,232,240,0.35); background:rgba(226,232,240,0.12); color:#e2e8f0; font-weight:700; cursor:pointer; transition:all 0.2s ease; }
    .phys-tool-btn:hover, .phys-action-btn:hover { background:rgba(226,232,240,0.24); box-shadow:0 3px 10px rgba(15,23,42,0.35); }
    .phys-tool-btn.active { background:linear-gradient(135deg,#38bdf8,#0ea5e9); border-color:transparent; color:#0f172a; box-shadow:0 4px 12px rgba(14,165,233,0.35); }
    .phys-action-group .phys-action-btn:nth-child(1) { background:linear-gradient(135deg,#22c55e,#16a34a); border:none; }
    .phys-action-group .phys-action-btn:nth-child(2) { background:linear-gradient(135deg,#f59e0b,#d97706); border:none; }
    .phys-action-group .phys-action-btn:nth-child(3) { background:linear-gradient(135deg,#38bdf8,#2563eb); border:none; }
    .phys-action-group .phys-action-btn:nth-child(4) { background:linear-gradient(135deg,#ef4444,#dc2626); border:none; }
    .phys-action-group .phys-action-btn:nth-child(5),
    .phys-action-group .phys-action-btn:nth-child(6) { background:rgba(226,232,240,0.15); color:#f8fafc; border:1px solid rgba(226,232,240,0.35); }
    .phys-layout { display:grid; grid-template-columns: minmax(320px, 2fr) minmax(220px, 1fr); gap:12px; }
    .phys-viewport { background:#0f172a; border-radius:12px; border:1px solid rgba(15,23,42,0.45); min-height:420px; position:relative; overflow:hidden; }
    .phys-canvas { width:100%; height:100%; display:block; background:transparent; }
    .phys-inspector { background:rgba(15,23,42,0.85); color:#e2e8f0; border-radius:12px; padding:12px; border:1px solid rgba(148,163,184,0.35); max-height:520px; overflow:auto; }
    .phys-inspector h3 { margin-top:0; font-size:16px; letter-spacing:0.02em; }
    .phys-section { display:flex; flex-direction:column; gap:8px; margin-bottom:14px; padding:10px; border-radius:10px; background:rgba(15,23,42,0.55); border:1px solid rgba(226,232,240,0.1); }
    .phys-section h4 { margin:0; font-size:14px; color:#e0f2fe; }
    .phys-section h5 { margin:4px 0 0; font-size:12px; color:#bae6fd; }
    .phys-section label { font-size:12px; color:#cbd5f5; display:flex; flex-direction:column; gap:2px; }
    .phys-section input[type="range"] { width:100%; }
    .phys-section input[type="color"] { width:100%; height:32px; border:none; border-radius:8px; }
    .phys-section select, .phys-section button { padding:6px 10px; border-radius:8px; border:1px solid rgba(226,232,240,0.2); background:rgba(226,232,240,0.08); color:#e2e8f0; }
    .phys-section button { cursor:pointer; transition:background 0.2s ease; }
    .phys-section button:hover { background:rgba(226,232,240,0.2); }
    .phys-hint { font-size:12px; color:#cbd5f5; line-height:1.6; }
    .phys-checkbox { display:flex; align-items:center; gap:6px; font-size:12px; color:#f8fafc; }
    .phys-checkbox input { width:16px; height:16px; }
    .phys-conn-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:4px; font-size:12px; }
    .phys-conn-list li { display:flex; align-items:center; justify-content:space-between; gap:8px; background:rgba(226,232,240,0.08); padding:4px 6px; border-radius:6px; }
    .phys-hud { display:flex; gap:6px; flex-wrap:wrap; color:#0f172a; font-weight:700; }
    .phys-hud-line { background:#e0f2fe; padding:6px 12px; border-radius:999px; box-shadow:0 2px 6px rgba(14,116,144,0.2); }
    .phys-section select:focus, .phys-section input:focus, .phys-section button:focus { outline:2px solid rgba(59,130,246,0.65); outline-offset:1px; }
  `;

  function ensureStyleInjected(){
    if (document.getElementById(STYLE_TAG_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.textContent = STYLE_RULES;
    document.head.appendChild(style);
  }
  const STORAGE_KEY = 'MiniExpPhysicsLayouts';
  const MATERIALS = {
    wood:  { id:'wood',  label:'木材',    density:0.6, restitution:0.25, friction:0.5, color:'#c97a43', flammability:0.8, conductivity:0.1 },
    metal: { id:'metal', label:'金属',    density:1.8, restitution:0.15, friction:0.3, color:'#9aa0a6', flammability:0.0, conductivity:0.9 },
    rubber:{ id:'rubber',label:'ゴム',    density:0.9, restitution:0.75, friction:0.9, color:'#22262b', flammability:0.2, conductivity:0.05 },
    stone: { id:'stone', label:'石材',    density:1.4, restitution:0.1, friction:0.7, color:'#6b7280', flammability:0.05, conductivity:0.2 },
    gel:   { id:'gel',   label:'ゼラチン', density:0.4, restitution:0.55, friction:0.2, color:'#60a5fa', flammability:0.0, conductivity:0.3 },
    plasma:{ id:'plasma',label:'プラズマ', density:0.1, restitution:0.95, friction:0.05, color:'#f97316', flammability:1.0, conductivity:0.95 }
  };
  const DEFAULT_MATERIAL = 'wood';

  const TOOLS = [
    { id:'select', label:'選択', title:'図形やエミッタを選択・ドラッグ' },
    { id:'add-circle', label:'円', title:'円形の剛体を追加' },
    { id:'add-box', label:'箱', title:'箱型の剛体を追加' },
    { id:'add-fire', label:'火', title:'炎エミッタを追加' },
    { id:'add-water', label:'水', title:'水エミッタを追加' },
    { id:'add-vine', label:'ツタ', title:'ツタエミッタを追加' },
    { id:'add-lightning', label:'雷', title:'雷エミッタを追加' },
    { id:'add-circuit', label:'回路', title:'回路ノードを追加' }
  ];

  function clamp(v, min, max){ return v < min ? min : (v > max ? max : v); }
  function lerp(a,b,t){ return a + (b-a)*t; }
  function mixColor(color, overlay, amt){
    const parse = (hex) => {
      if (!hex) return [255,255,255];
      const h = hex.replace('#','');
      return [
        parseInt(h.substring(0,2),16),
        parseInt(h.substring(2,4),16),
        parseInt(h.substring(4,6),16)
      ];
    };
    const toHex = (v) => {
      const s = clamp(Math.round(v),0,255).toString(16).padStart(2,'0');
      return s;
    };
    const a = parse(color); const b = parse(overlay);
    return `#${toHex(lerp(a[0],b[0],amt))}${toHex(lerp(a[1],b[1],amt))}${toHex(lerp(a[2],b[2],amt))}`;
  }

  function deepClone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('MiniExp Physics Sandbox requires a container');
    ensureStyleInjected();
    const difficulty = (opts && opts.difficulty) || 'NORMAL';

    const state = {
      tool:'select',
      running:false,
      pausedByHost:false,
      wasRunningBeforeHostStop:false,
      gravity:{ x:0, y:600 },
      airDrag:0.08,
      bodies:[],
      emitters:[],
      particles:[],
      vines:[],
      selection:null,
      selectionKind:null,
      collisionCooldown:new Map(),
      sessionExp:0,
      pendingConnection:null,
      savedLayouts:loadLayouts(),
      initialSnapshot:null,
      bounds:{ width:900, height:560 },
      accumulator:0,
      lastTimestamp:0,
      loopHandle:null
    };
    const gravityScale = difficulty === 'EASY' ? 0.8 : difficulty === 'HARD' ? 1.25 : 1;
    state.gravity.y *= gravityScale;

    const container = document.createElement('div');
    container.className = 'phys-play';

    const toolbar = document.createElement('div');
    toolbar.className = 'phys-toolbar';

    const toolGroup = document.createElement('div');
    toolGroup.className = 'phys-tool-group';
    TOOLS.forEach(def => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.tool = def.id;
      btn.textContent = def.label;
      btn.title = def.title;
      btn.className = 'phys-tool-btn';
      btn.addEventListener('click', () => setTool(def.id));
      toolGroup.appendChild(btn);
    });
    toolbar.appendChild(toolGroup);

    const actionGroup = document.createElement('div');
    actionGroup.className = 'phys-action-group';

    const startBtn = createActionButton('開始', 'シミュレーションを開始/再開', () => setRunning(true));
    const pauseBtn = createActionButton('停止', 'シミュレーションを一時停止', () => setRunning(false));
    const resetBtn = createActionButton('リセット', '初期状態へ戻す', () => resetWorld());
    const deleteBtn = createActionButton('削除', '選択中の図形/エミッタを削除', () => removeSelected());
    const saveBtn = createActionButton('保存', '現在の配置を保存', () => promptSave());
    const loadBtn = createActionButton('読み込み', '保存した配置を読み込む', () => promptLoad());

    actionGroup.append(startBtn, pauseBtn, resetBtn, deleteBtn, saveBtn, loadBtn);
    toolbar.appendChild(actionGroup);

    const layout = document.createElement('div');
    layout.className = 'phys-layout';

    const viewport = document.createElement('div');
    viewport.className = 'phys-viewport';
    const canvas = document.createElement('canvas');
    canvas.className = 'phys-canvas';
    viewport.appendChild(canvas);
    layout.appendChild(viewport);

    const inspector = document.createElement('div');
    inspector.className = 'phys-inspector';
    layout.appendChild(inspector);

    const hud = document.createElement('div');
    hud.className = 'phys-hud';

    container.append(toolbar, layout, hud);
    root.appendChild(container);

    const ctx = canvas.getContext('2d');

    let pointerDown = false;
    let drawPreview = null;
    let dragInfo = null;

    function createActionButton(label, title, handler){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.title = title;
      btn.className = 'phys-action-btn';
      btn.addEventListener('click', handler);
      return btn;
    }

    function setTool(toolId){
      state.tool = toolId;
      const buttons = toolGroup.querySelectorAll('button');
      buttons.forEach(btn => {
        if (btn.dataset.tool === toolId) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      state.pendingConnection = null;
      renderInspector();
    }

    function setRunning(flag){
      state.running = !!flag;
      if (state.running) state.wasRunningBeforeHostStop = true;
    }

    function gainXp(amount, meta){
      try {
        const gained = awardXp(Math.max(0, amount), Object.assign({ mini:'physics' }, meta || {}));
        if (typeof gained === 'number' && Number.isFinite(gained)) state.sessionExp += gained;
      } catch {}
    }

    function spawnBody(kind, params){
      const id = `b${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
      const body = Object.assign({
        id,
        kind:'body',
        shape: kind,
        x: params?.x ?? state.bounds.width/2,
        y: params?.y ?? state.bounds.height/4,
        vx: 0,
        vy: 0,
        width: params?.width ?? 80,
        height: params?.height ?? 80,
        radius: params?.radius ?? 40,
        static: !!params?.static,
        material: params?.material || DEFAULT_MATERIAL,
        mass: 1,
        invMass: 1,
        restitution: params?.restitution ?? 0.3,
        friction: params?.friction ?? 0.4,
        color: params?.color || MATERIALS[params?.material || DEFAULT_MATERIAL]?.color || '#8884d8',
        burnTimer:0,
        wetness:0,
        vineGrip:0,
        chargeTimer:0,
        damage:0
      });
      applyMaterial(body, body.material);
      if (kind === 'circle') body.radius = clamp(body.radius, 8, 160);
      else {
        body.width = clamp(body.width, 20, 240);
        body.height = clamp(body.height, 20, 240);
      }
      state.bodies.push(body);
      selectObject(body, 'body');
      renderInspector();
      gainXp(10, { reason:'add-body' });
      return body;
    }

    function spawnEmitter(kind, params){
      const id = `e${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
      const emitter = Object.assign({
        id,
        kind,
        x: params?.x ?? state.bounds.width/2,
        y: params?.y ?? state.bounds.height/2,
        rate: params?.rate ?? 8,
        spread: params?.spread ?? 0.3,
        power: params?.power ?? 1,
        enabled: true,
        lifetime: params?.lifetime ?? 0,
        accum:0,
        poweredTicks:0,
        source:false,
        connections: params?.connections ? Array.from(params.connections) : []
      });
      state.emitters.push(emitter);
      selectObject(emitter, 'emitter');
      renderInspector();
      gainXp(8, { reason:`add-${kind}` });
      return emitter;
    }

    function applyMaterial(body, materialId){
      const mat = MATERIALS[materialId] || MATERIALS[DEFAULT_MATERIAL];
      body.material = mat.id;
      body.restitution = mat.restitution;
      body.friction = mat.friction;
      body.color = mat.color;
      const area = body.shape === 'circle' ? Math.PI * body.radius * body.radius : body.width * body.height;
      const density = mat.density;
      const mass = Math.max(0.05, area * density * 0.001);
      body.mass = body.static ? Infinity : mass;
      body.invMass = body.static ? 0 : (1 / mass);
    }

    function selectObject(obj, kind){
      state.selection = obj ? obj.id : null;
      state.selectionKind = obj ? kind : null;
      renderInspector();
    }

    function getSelected(){
      if (!state.selection) return null;
      if (state.selectionKind === 'body') return state.bodies.find(b => b.id === state.selection) || null;
      if (state.selectionKind === 'emitter') return state.emitters.find(e => e.id === state.selection) || null;
      if (state.selectionKind === 'vine') return state.vines.find(v => v.id === state.selection) || null;
      return null;
    }

    function removeSelected(){
      if (!state.selection) return;
      if (state.selectionKind === 'body') {
        const idx = state.bodies.findIndex(b => b.id === state.selection);
        if (idx >= 0) { state.bodies.splice(idx,1); gainXp(5, { reason:'remove-body' }); }
      } else if (state.selectionKind === 'emitter') {
        const idx = state.emitters.findIndex(e => e.id === state.selection);
        if (idx >= 0) { state.emitters.splice(idx,1); gainXp(4, { reason:'remove-emitter' }); }
      } else if (state.selectionKind === 'vine') {
        const idx = state.vines.findIndex(v => v.id === state.selection);
        if (idx >= 0) state.vines.splice(idx,1);
      }
      state.selection = null;
      state.selectionKind = null;
      renderInspector();
    }

    function resizeCanvas(){
      const rect = viewport.getBoundingClientRect();
      const width = Math.max(480, Math.floor(rect.width));
      const height = Math.max(360, Math.floor(rect.height));
      canvas.width = width;
      canvas.height = height;
      state.bounds.width = width;
      state.bounds.height = height;
    }

    function worldFromEvent(evt){
      const rect = canvas.getBoundingClientRect();
      const x = (evt.clientX - rect.left) * (canvas.width / rect.width);
      const y = (evt.clientY - rect.top) * (canvas.height / rect.height);
      return { x, y };
    }

    function findObjectAt(x, y){
      for (let i = state.emitters.length - 1; i >= 0; i--) {
        const e = state.emitters[i];
        const dx = x - e.x;
        const dy = y - e.y;
        if (Math.hypot(dx, dy) <= 18) return { obj: e, kind:'emitter' };
      }
      for (let i = state.bodies.length - 1; i >= 0; i--) {
        const b = state.bodies[i];
        if (b.shape === 'circle') {
          const dx = x - b.x;
          const dy = y - b.y;
          if (Math.hypot(dx, dy) <= b.radius) return { obj:b, kind:'body' };
        } else if (Math.abs(x - b.x) <= b.width/2 && Math.abs(y - b.y) <= b.height/2) {
          return { obj:b, kind:'body' };
        }
      }
      return null;
    }

    const handleMouseDown = (evt) => {
      const pos = worldFromEvent(evt);
      pointerDown = true;
      if (state.tool === 'select') {
        const hit = findObjectAt(pos.x, pos.y);
        if (hit) {
          selectObject(hit.obj, hit.kind);
          if (hit.kind === 'body' && !state.running) {
            dragInfo = { id: hit.obj.id, kind:'body', offsetX: pos.x - hit.obj.x, offsetY: pos.y - hit.obj.y };
          } else if (hit.kind === 'emitter' && !state.running) {
            dragInfo = { id: hit.obj.id, kind:'emitter', offsetX: pos.x - hit.obj.x, offsetY: pos.y - hit.obj.y };
          }
        } else {
          selectObject(null, null);
        }
      } else if (state.tool === 'add-circle') {
        const body = spawnBody('circle', { x: pos.x, y: pos.y });
        drawPreview = { id: body.id, shape:'circle', origin:pos, min:12 };
      } else if (state.tool === 'add-box') {
        const body = spawnBody('box', { x: pos.x, y: pos.y });
        drawPreview = { id: body.id, shape:'box', origin:pos };
      } else {
        const emitter = spawnEmitter(toolToKind(state.tool), { x: pos.x, y: pos.y });
        if (state.tool === 'add-circuit' && state.pendingConnection) {
          connectCircuit(state.pendingConnection, emitter.id);
          state.pendingConnection = null;
        }
      }
    };

    const handleMouseMove = (evt) => {
      if (!pointerDown && !dragInfo) return;
      const pos = worldFromEvent(evt);
      if (drawPreview) {
        const body = state.bodies.find(b => b.id === drawPreview.id);
        if (!body) return;
        if (drawPreview.shape === 'circle') {
          const r = Math.max(drawPreview.min, Math.hypot(pos.x - drawPreview.origin.x, pos.y - drawPreview.origin.y));
          body.radius = clamp(r, 12, 240);
          applyMaterial(body, body.material);
        } else {
          body.width = clamp(Math.abs(pos.x - drawPreview.origin.x) * 2, 20, 320);
          body.height = clamp(Math.abs(pos.y - drawPreview.origin.y) * 2, 20, 320);
          applyMaterial(body, body.material);
        }
      } else if (dragInfo) {
        if (dragInfo.kind === 'body') {
          const body = state.bodies.find(b => b.id === dragInfo.id);
          if (body) {
            body.x = clamp(pos.x - dragInfo.offsetX, body.width/2, state.bounds.width - body.width/2);
            body.y = clamp(pos.y - dragInfo.offsetY, body.height/2, state.bounds.height - body.height/2);
          }
        } else if (dragInfo.kind === 'emitter') {
          const emitter = state.emitters.find(e => e.id === dragInfo.id);
          if (emitter) {
            emitter.x = clamp(pos.x - dragInfo.offsetX, 16, state.bounds.width - 16);
            emitter.y = clamp(pos.y - dragInfo.offsetY, 16, state.bounds.height - 16);
          }
        }
      }
    };

    const handleMouseUp = () => {
      pointerDown = false;
      drawPreview = null;
      dragInfo = null;
    };

    const handleKeyDown = (evt) => {
      if (evt.key === 'Delete' || evt.key === 'Backspace') removeSelected();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    function toolToKind(tool){
      switch(tool){
        case 'add-fire': return 'fire';
        case 'add-water': return 'water';
        case 'add-vine': return 'vine';
        case 'add-lightning': return 'lightning';
        case 'add-circuit': return 'circuit';
      }
      return 'fire';
    }

    function connectCircuit(idA, idB){
      if (idA === idB) return;
      const a = state.emitters.find(e => e.id === idA && e.kind === 'circuit');
      const b = state.emitters.find(e => e.id === idB && e.kind === 'circuit');
      if (!a || !b) return;
      if (!a.connections.includes(idB)) a.connections.push(idB);
      if (!b.connections.includes(idA)) b.connections.push(idA);
      gainXp(3, { reason:'wire-connect' });
    }

    function disconnectCircuit(idA, idB){
      const a = state.emitters.find(e => e.id === idA && e.kind === 'circuit');
      const b = state.emitters.find(e => e.id === idB && e.kind === 'circuit');
      if (!a || !b) return;
      a.connections = a.connections.filter(id => id !== idB);
      b.connections = b.connections.filter(id => id !== idA);
    }

    function igniteBody(body, intensity){
      if (!body) return;
      const mat = MATERIALS[body.material] || MATERIALS[DEFAULT_MATERIAL];
      const effective = Math.max(0, intensity * mat.flammability - body.wetness * 0.3);
      if (effective <= 0) return;
      const prev = body.burnTimer;
      body.burnTimer = clamp(body.burnTimer + effective, 0, 30);
      if (prev === 0 && body.burnTimer > 0) gainXp(3, { reason:'ignite' });
    }

    function soakBody(body, amount){
      if (!body) return;
      body.wetness = clamp(body.wetness + amount, 0, 12);
      if (amount > 0.4) body.burnTimer = Math.max(0, body.burnTimer - amount * 1.2);
    }

    function entangleBody(body, amount){
      if (!body) return;
      const prev = body.vineGrip;
      body.vineGrip = clamp(body.vineGrip + amount, 0, 10);
      if (prev < 0.1 && body.vineGrip >= 0.1) gainXp(2, { reason:'vine-grip' });
    }

    function chargeBody(body, energy){
      if (!body) return;
      const prev = body.chargeTimer;
      body.chargeTimer = clamp(body.chargeTimer + energy, 0, 10);
      if (prev === 0 && body.chargeTimer > 0) gainXp(4, { reason:'charge' });
    }

    function powerCircuitNode(node, duration){
      if (!node) return;
      const prev = node.poweredTicks;
      node.poweredTicks = Math.max(node.poweredTicks, duration);
      if (prev <= 0 && node.poweredTicks > 0) gainXp(5, { reason:'circuit-power' });
    }

    function propagateCircuit(dt){
      const queue = [];
      const visited = new Set();
      state.emitters.forEach(node => {
        if (node.kind !== 'circuit') return;
        if (node.source) node.poweredTicks = Math.max(node.poweredTicks, 5);
        if (node.poweredTicks > 0) {
          queue.push(node);
          visited.add(node.id);
        }
      });
      while(queue.length){
        const node = queue.shift();
        node.poweredTicks = Math.max(0, node.poweredTicks - dt);
        node.accum = (node.accum || 0) + dt;
        if (node.poweredTicks > 0 && node.accum >= 0.25) {
          node.accum -= 0.25;
          spawnParticle('spark', node.x, node.y, { power: node.power || 1 });
        }
        if (node.poweredTicks <= 0) continue;
        for (const id of node.connections || []){
          const other = state.emitters.find(e => e.id === id && e.kind === 'circuit');
          if (!other) continue;
          if (other.poweredTicks < node.poweredTicks * 0.8) other.poweredTicks = Math.max(other.poweredTicks, node.poweredTicks * 0.6);
          if (!visited.has(id)) { queue.push(other); visited.add(id); }
        }
      }
    }

    function spawnParticle(type, x, y, extras){
      const particle = Object.assign({
        id: `p${Math.random().toString(36).slice(2)}`,
        type,
        x,
        y,
        vx:0,
        vy:0,
        life: type === 'lightning' ? 0.6 : type === 'spark' ? 0.4 : 1.6,
        payload: {}
      }, extras || {});
      switch(type){
        case 'fire':
          particle.vx = (Math.random()-0.5)*40;
          particle.vy = -80 - Math.random()*40;
          particle.life = 1.2 + Math.random()*0.8;
          break;
        case 'water':
          particle.vx = (Math.random()-0.5)*20;
          particle.vy = 60 + Math.random()*60;
          particle.life = 2.5;
          break;
        case 'vine':
          particle.vx = (Math.random()-0.5)*10;
          particle.vy = 30 + Math.random()*30;
          particle.life = 3.5;
          break;
        case 'lightning':
          particle.vx = (Math.random()-0.5)*30;
          particle.vy = 250 + Math.random()*150;
          particle.life = 0.35;
          break;
        case 'spark':
          particle.vx = (Math.random()-0.5)*120;
          particle.vy = (Math.random()-0.5)*120;
          particle.life = 0.5;
          break;
      }
      state.particles.push(particle);
      return particle;
    }

    function updateEmitters(dt){
      state.emitters.forEach(emitter => {
        if (!emitter.enabled) return;
        emitter.lifetime = Math.max(0, emitter.lifetime - dt);
        emitter.accum = (emitter.accum || 0) + emitter.rate * dt;
        const count = Math.floor(emitter.accum);
        emitter.accum -= count;
        for (let i=0;i<count;i++) {
          switch(emitter.kind){
            case 'fire':
              spawnParticle('fire', emitter.x + (Math.random()-0.5)*10, emitter.y + (Math.random()-0.5)*10, { power: emitter.power || 1 });
              break;
            case 'water':
              spawnParticle('water', emitter.x + (Math.random()-0.5)*12, emitter.y, { power: emitter.power || 1 });
              break;
            case 'vine':
              spawnParticle('vine', emitter.x, emitter.y, { power: emitter.power || 1 });
              break;
            case 'lightning':
              spawnParticle('lightning', emitter.x, emitter.y, { power: emitter.power || 1 });
              break;
            case 'circuit':
              break;
          }
        }
      });
    }

    function updateParticles(dt){
      const bodies = state.bodies;
      const remove = [];
      for (let i=0;i<state.particles.length;i++){
        const p = state.particles[i];
        p.life -= dt;
        if (p.life <= 0) { remove.push(i); continue; }
        switch(p.type){
          case 'fire':
            p.vy -= 80 * dt;
            p.vx += (Math.random()-0.5)*20*dt;
            break;
          case 'water':
            p.vy += state.gravity.y * 0.6 * dt;
            p.vx *= (1 - 0.4*dt);
            break;
          case 'vine':
            p.vy += state.gravity.y * 0.2 * dt;
            p.vx *= (1 - 0.5*dt);
            break;
          case 'lightning':
            p.vy += state.gravity.y * 0.05 * dt;
            break;
          case 'spark':
            p.vx *= (1 - 0.6*dt);
            p.vy *= (1 - 0.6*dt);
            break;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -32 || p.x > state.bounds.width + 32 || p.y < -64 || p.y > state.bounds.height + 64) {
          remove.push(i);
          continue;
        }
        for (const body of bodies){
          if (!intersectsParticleBody(p, body)) continue;
          if (p.type === 'fire') {
            igniteBody(body, 0.4 * (p.power || 1) * dt * 60);
          } else if (p.type === 'water') {
            soakBody(body, 0.3 * (p.power || 1) * dt * 60);
            body.vy -= 15*dt;
          } else if (p.type === 'vine') {
            entangleBody(body, 0.15 * (p.power || 1));
            attemptGrowVine(p, body);
          } else if (p.type === 'lightning') {
            chargeBody(body, 0.5 * (p.power || 1));
            const node = nearestCircuitNode(p.x, p.y, 40);
            if (node) powerCircuitNode(node, 3);
          } else if (p.type === 'spark') {
            chargeBody(body, 0.2 * (p.power || 1));
          }
        }
        if (p.type === 'lightning' || p.type === 'spark') {
          const node = nearestCircuitNode(p.x, p.y, 28);
          if (node) powerCircuitNode(node, 2.5);
        }
      }
      for (let i=remove.length-1;i>=0;i--) state.particles.splice(remove[i],1);
    }

    function intersectsParticleBody(p, body){
      if (body.shape === 'circle') {
        const dx = p.x - body.x;
        const dy = p.y - body.y;
        return (dx*dx + dy*dy) <= Math.pow(body.radius + 6, 2);
      }
      return Math.abs(p.x - body.x) <= body.width/2 + 6 && Math.abs(p.y - body.y) <= body.height/2 + 6;
    }

    function attemptGrowVine(particle, body){
      const id = `v${Math.random().toString(36).slice(2,8)}`;
      const node = { id, x: particle.x, y: particle.y, life: 6, host: body.id };
      state.vines.push(node);
      gainXp(2, { reason:'vine-grow' });
    }

    function nearestCircuitNode(x, y, radius){
      let best = null; let bestDist = radius;
      for (const node of state.emitters){
        if (node.kind !== 'circuit') continue;
        const dist = Math.hypot(x - node.x, y - node.y);
        if (dist <= bestDist){ best = node; bestDist = dist; }
      }
      return best;
    }

    function updateVines(dt){
      for (let i=state.vines.length-1;i>=0;i--){
        const node = state.vines[i];
        node.life -= dt;
        if (node.life <= 0) { state.vines.splice(i,1); continue; }
        const body = state.bodies.find(b => b.id === node.host);
        if (body) {
          node.x = lerp(node.x, body.x, 0.05);
          node.y = lerp(node.y, body.y + (body.height||body.radius) * 0.5, 0.05);
        }
      }
    }

    function updateBodies(dt){
      for (const [key, value] of state.collisionCooldown.entries()){
        const remain = value - dt;
        if (remain <= 0) state.collisionCooldown.delete(key);
        else state.collisionCooldown.set(key, remain);
      }
      for (const body of state.bodies){
        if (!body.static) {
          body.vx += state.gravity.x * dt;
          body.vy += state.gravity.y * dt;
          body.vx *= (1 - clamp(state.airDrag + body.vineGrip * 0.05, 0, 0.98) * dt);
          body.vy *= (1 - clamp(state.airDrag + body.vineGrip * 0.05, 0, 0.98) * dt);
          if (body.chargeTimer > 0) {
            body.vx += (Math.random()-0.5) * 40 * dt;
            body.vy -= Math.random() * 30 * dt;
          }
          body.x += body.vx * dt;
          body.y += body.vy * dt;
        }
        body.burnTimer = Math.max(0, body.burnTimer - dt * (0.5 + body.wetness*0.1));
        body.wetness = Math.max(0, body.wetness - dt * 0.3);
        body.vineGrip = Math.max(0, body.vineGrip - dt * 0.2);
        body.chargeTimer = Math.max(0, body.chargeTimer - dt * 0.5);
        if (!body.static) {
          if (body.shape === 'circle') {
            if (body.x - body.radius < 0) { body.x = body.radius; body.vx = Math.abs(body.vx) * body.restitution; registerCollisionXp(body, null, Math.abs(body.vx)); }
            if (body.x + body.radius > state.bounds.width) { body.x = state.bounds.width - body.radius; body.vx = -Math.abs(body.vx) * body.restitution; registerCollisionXp(body, null, Math.abs(body.vx)); }
            if (body.y - body.radius < 0) { body.y = body.radius; body.vy = Math.abs(body.vy) * body.restitution; registerCollisionXp(body, null, Math.abs(body.vy)); }
            if (body.y + body.radius > state.bounds.height) { body.y = state.bounds.height - body.radius; body.vy = -Math.abs(body.vy) * body.restitution; registerCollisionXp(body, null, Math.abs(body.vy)); }
          } else {
            if (body.x - body.width/2 < 0) { body.x = body.width/2; body.vx = Math.abs(body.vx) * body.restitution; registerCollisionXp(body, null, Math.abs(body.vx)); }
            if (body.x + body.width/2 > state.bounds.width) { body.x = state.bounds.width - body.width/2; body.vx = -Math.abs(body.vx) * body.restitution; registerCollisionXp(body, null, Math.abs(body.vx)); }
            if (body.y - body.height/2 < 0) { body.y = body.height/2; body.vy = Math.abs(body.vy) * body.restitution; registerCollisionXp(body, null, Math.abs(body.vy)); }
            if (body.y + body.height/2 > state.bounds.height) { body.y = state.bounds.height - body.height/2; body.vy = -Math.abs(body.vy) * body.restitution; registerCollisionXp(body, null, Math.abs(body.vy)); }
          }
        }
        if (!body.static && body.burnTimer > 12) {
          const shrink = 1 - 0.002 * dt * 60;
          if (body.shape === 'circle') body.radius = Math.max(6, body.radius * shrink);
          else {
            body.width = Math.max(12, body.width * shrink);
            body.height = Math.max(12, body.height * shrink);
          }
          applyMaterial(body, body.material);
        }
      }
      resolveCollisions();
    }

    function resolveCollisions(){
      for (let i=0;i<state.bodies.length;i++){
        for (let j=i+1;j<state.bodies.length;j++){
          const a = state.bodies[i];
          const b = state.bodies[j];
          handleCollisionPair(a,b);
        }
      }
    }

    function handleCollisionPair(a,b){
      if (a.static && b.static) return;
      if (a.shape === 'circle' && b.shape === 'circle') resolveCircleCircle(a,b);
      else if (a.shape === 'circle' && b.shape === 'box') resolveCircleBox(a,b);
      else if (a.shape === 'box' && b.shape === 'circle') resolveCircleBox(b,a);
      else resolveBoxBox(a,b);
    }

    function resolveCircleCircle(a,b){
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;
      if (dist >= minDist || dist === 0) return;
      const nx = dx / dist;
      const ny = dy / dist;
      const penetration = minDist - dist;
      const invMassSum = a.invMass + b.invMass;
      if (invMassSum > 0){
        if (!a.static) { a.x -= nx * penetration * (a.invMass / invMassSum); a.y -= ny * penetration * (a.invMass / invMassSum); }
        if (!b.static) { b.x += nx * penetration * (b.invMass / invMassSum); b.y += ny * penetration * (b.invMass / invMassSum); }
      }
      const rvx = b.vx - a.vx;
      const rvy = b.vy - a.vy;
      const velAlongNormal = rvx * nx + rvy * ny;
      if (velAlongNormal > 0) return;
      const restitution = Math.min(a.restitution, b.restitution);
      let impulse = -(1 + restitution) * velAlongNormal;
      impulse /= invMassSum || 1;
      const ix = impulse * nx;
      const iy = impulse * ny;
      if (!a.static) { a.vx -= ix * a.invMass; a.vy -= iy * a.invMass; }
      if (!b.static) { b.vx += ix * b.invMass; b.vy += iy * b.invMass; }
      registerCollisionXp(a,b, Math.abs(impulse));
    }

    function resolveBoxBox(a,b){
      const dx = b.x - a.x;
      const px = (b.width/2 + a.width/2) - Math.abs(dx);
      if (px <= 0) return;
      const dy = b.y - a.y;
      const py = (b.height/2 + a.height/2) - Math.abs(dy);
      if (py <= 0) return;
      const restitution = Math.min(a.restitution, b.restitution);
      if (px < py) {
        const sx = Math.sign(dx) || 1;
        separateAlongAxis(a,b, px, sx, 0);
        const rvx = (b.vx - a.vx) * sx;
        const impulse = -(1 + restitution) * rvx / (a.invMass + b.invMass || 1);
        if (!a.static) a.vx -= impulse * a.invMass * sx;
        if (!b.static) b.vx += impulse * b.invMass * sx;
        registerCollisionXp(a,b, Math.abs(impulse));
      } else {
        const sy = Math.sign(dy) || 1;
        separateAlongAxis(a,b, py, 0, sy);
        const rvy = (b.vy - a.vy) * sy;
        const impulse = -(1 + restitution) * rvy / (a.invMass + b.invMass || 1);
        if (!a.static) a.vy -= impulse * a.invMass * sy;
        if (!b.static) b.vy += impulse * b.invMass * sy;
        registerCollisionXp(a,b, Math.abs(impulse));
      }
    }

    function separateAlongAxis(a,b, penetration, nx, ny){
      const invMassSum = a.invMass + b.invMass;
      if (invMassSum <= 0) return;
      if (!a.static) { a.x -= nx * penetration * (a.invMass / invMassSum); a.y -= ny * penetration * (a.invMass / invMassSum); }
      if (!b.static) { b.x += nx * penetration * (b.invMass / invMassSum); b.y += ny * penetration * (b.invMass / invMassSum); }
    }

    function resolveCircleBox(circle, box){
      const closestX = clamp(circle.x, box.x - box.width/2, box.x + box.width/2);
      const closestY = clamp(circle.y, box.y - box.height/2, box.y + box.height/2);
      const dx = circle.x - closestX;
      const dy = circle.y - closestY;
      const distSq = dx*dx + dy*dy;
      if (distSq > circle.radius * circle.radius) return;
      const dist = Math.sqrt(distSq) || 0.0001;
      const nx = dx / dist;
      const ny = dy / dist;
      const penetration = circle.radius - dist;
      const invMassSum = circle.invMass + box.invMass;
      if (invMassSum > 0){
        if (!circle.static) { circle.x += nx * penetration * (circle.invMass / invMassSum); circle.y += ny * penetration * (circle.invMass / invMassSum); }
        if (!box.static) { box.x -= nx * penetration * (box.invMass / invMassSum); box.y -= ny * penetration * (box.invMass / invMassSum); }
      }
      const rvx = box.vx - circle.vx;
      const rvy = box.vy - circle.vy;
      const velAlongNormal = rvx * nx + rvy * ny;
      if (velAlongNormal > 0) return;
      const restitution = Math.min(circle.restitution, box.restitution);
      let impulse = -(1 + restitution) * velAlongNormal;
      impulse /= invMassSum || 1;
      const ix = impulse * nx;
      const iy = impulse * ny;
      if (!circle.static) { circle.vx -= ix * circle.invMass; circle.vy -= iy * circle.invMass; }
      if (!box.static) { box.vx += ix * box.invMass; box.vy += iy * box.invMass; }
      registerCollisionXp(circle, box, Math.abs(impulse));
    }

    function registerCollisionXp(a,b, impulse){
      const key = a && b ? (a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`) : (a ? `${a.id}|wall` : 'wall');
      if (state.collisionCooldown.get(key) > 0) return;
      const xp = Math.min(25, Math.max(0, impulse * 0.08));
      if (xp > 0.2) {
        gainXp(xp, { reason:'collision' });
        state.collisionCooldown.set(key, 0.25);
      }
    }

    function updateHud(){
      hud.innerHTML = '';
      const info = document.createElement('div');
      info.className = 'phys-hud-line';
      info.textContent = `図形 ${state.bodies.length} / エミッタ ${state.emitters.length} / 粒子 ${state.particles.length}`;
      const info2 = document.createElement('div');
      info2.className = 'phys-hud-line';
      const powered = state.emitters.filter(e => e.kind === 'circuit' && e.poweredTicks > 0).length;
      info2.textContent = `Powered ${powered} / Gravity ${state.gravity.y.toFixed(0)} / EXP ${state.sessionExp.toFixed(1)}`;
      hud.append(info, info2);
    }

    function renderInspector(){
      inspector.innerHTML = '';
      const title = document.createElement('h3');
      title.textContent = '設定';
      inspector.appendChild(title);

      const worldSection = document.createElement('div');
      worldSection.className = 'phys-section';
      const gLabel = document.createElement('label');
      gLabel.textContent = `重力Y (${state.gravity.y.toFixed(0)})`;
      const gInput = document.createElement('input');
      gInput.type = 'range';
      gInput.min = '-2000';
      gInput.max = '2000';
      gInput.value = String(state.gravity.y);
      gInput.addEventListener('input', () => {
        state.gravity.y = Number(gInput.value);
        gLabel.textContent = `重力Y (${state.gravity.y.toFixed(0)})`;
      });
      const dragLabel = document.createElement('label');
      dragLabel.textContent = `空気抵抗 (${state.airDrag.toFixed(2)})`;
      const dragInput = document.createElement('input');
      dragInput.type = 'range';
      dragInput.min = '0';
      dragInput.max = '0.5';
      dragInput.step = '0.01';
      dragInput.value = String(state.airDrag);
      dragInput.addEventListener('input', () => {
        state.airDrag = Number(dragInput.value);
        dragLabel.textContent = `空気抵抗 (${state.airDrag.toFixed(2)})`;
      });
      worldSection.append(gLabel, gInput, dragLabel, dragInput);
      inspector.appendChild(worldSection);

      const selected = getSelected();
      if (!selected) {
        const p = document.createElement('p');
        p.className = 'phys-hint';
        p.textContent = '上部ツールから図形を追加して選択すると詳細設定が表示されます。';
        inspector.appendChild(p);
      } else if (state.selectionKind === 'body') {
        renderBodyInspector(selected);
      } else if (state.selectionKind === 'emitter') {
        renderEmitterInspector(selected);
      }

      const saveSection = document.createElement('div');
      saveSection.className = 'phys-section';
      const saveTitle = document.createElement('h4');
      saveTitle.textContent = '保存データ';
      const saveSelect = document.createElement('select');
      (state.savedLayouts || []).forEach(layout => {
        const opt = document.createElement('option');
        opt.value = layout.name;
        opt.textContent = layout.name;
        saveSelect.appendChild(opt);
      });
      const loadBtn2 = document.createElement('button');
      loadBtn2.textContent = '読み込み';
      loadBtn2.addEventListener('click', () => {
        const name = saveSelect.value;
        if (name) applySnapshotByName(name);
      });
      const deleteBtn2 = document.createElement('button');
      deleteBtn2.textContent = '削除';
      deleteBtn2.addEventListener('click', () => {
        const name = saveSelect.value;
        if (!name) return;
        const idx = state.savedLayouts.findIndex(l => l.name === name);
        if (idx >= 0) {
          state.savedLayouts.splice(idx,1);
          storeLayouts();
          renderInspector();
        }
      });
      saveSection.append(saveTitle, saveSelect, loadBtn2, deleteBtn2);
      inspector.appendChild(saveSection);
    }

    function renderBodyInspector(body){
      const section = document.createElement('div');
      section.className = 'phys-section';
      const h = document.createElement('h4');
      h.textContent = '図形プロパティ';
      const matLabel = document.createElement('label');
      matLabel.textContent = '素材プリセット';
      const matSelect = document.createElement('select');
      Object.values(MATERIALS).forEach(mat => {
        const opt = document.createElement('option');
        opt.value = mat.id;
        opt.textContent = mat.label;
        if (body.material === mat.id) opt.selected = true;
        matSelect.appendChild(opt);
      });
      matSelect.addEventListener('change', () => {
        applyMaterial(body, matSelect.value);
      });

      const massLabel = document.createElement('label');
      massLabel.textContent = `質量 (推定 ${body.mass.toFixed(2)})`;
      const staticToggle = document.createElement('label');
      staticToggle.className = 'phys-checkbox';
      const staticInput = document.createElement('input');
      staticInput.type = 'checkbox';
      staticInput.checked = body.static;
      staticInput.addEventListener('change', () => {
        body.static = staticInput.checked;
        applyMaterial(body, body.material);
      });
      staticToggle.append(staticInput, document.createTextNode('固定する'));

      const restLabel = document.createElement('label'); restLabel.textContent = `反発 (${body.restitution.toFixed(2)})`;
      const restInput = document.createElement('input');
      restInput.type = 'range'; restInput.min = '0'; restInput.max = '1'; restInput.step = '0.05'; restInput.value = String(body.restitution);
      restInput.addEventListener('input', () => {
        body.restitution = Number(restInput.value);
        restLabel.textContent = `反発 (${body.restitution.toFixed(2)})`;
      });
      const fricLabel = document.createElement('label'); fricLabel.textContent = `摩擦 (${body.friction.toFixed(2)})`;
      const fricInput = document.createElement('input');
      fricInput.type = 'range'; fricInput.min = '0'; fricInput.max = '1'; fricInput.step = '0.05'; fricInput.value = String(body.friction);
      fricInput.addEventListener('input', () => {
        body.friction = Number(fricInput.value);
        fricLabel.textContent = `摩擦 (${body.friction.toFixed(2)})`;
      });

      section.append(h, matLabel, matSelect, massLabel, staticToggle, restLabel, restInput, fricLabel, fricInput);

      if (body.shape === 'circle') {
        const rLabel = document.createElement('label'); rLabel.textContent = `半径 (${body.radius.toFixed(1)})`;
        const rInput = document.createElement('input');
        rInput.type = 'range'; rInput.min = '10'; rInput.max = '240'; rInput.value = String(body.radius);
        rInput.addEventListener('input', () => {
          body.radius = Number(rInput.value);
          rLabel.textContent = `半径 (${body.radius.toFixed(1)})`;
          applyMaterial(body, body.material);
        });
        section.append(rLabel, rInput);
      } else {
        const wLabel = document.createElement('label'); wLabel.textContent = `幅 (${body.width.toFixed(1)})`;
        const wInput = document.createElement('input'); wInput.type = 'range'; wInput.min = '20'; wInput.max = '320'; wInput.value = String(body.width);
        wInput.addEventListener('input', () => {
          body.width = Number(wInput.value);
          wLabel.textContent = `幅 (${body.width.toFixed(1)})`;
          applyMaterial(body, body.material);
        });
        const hLabel = document.createElement('label'); hLabel.textContent = `高さ (${body.height.toFixed(1)})`;
        const hInput = document.createElement('input'); hInput.type = 'range'; hInput.min = '20'; hInput.max = '320'; hInput.value = String(body.height);
        hInput.addEventListener('input', () => {
          body.height = Number(hInput.value);
          hLabel.textContent = `高さ (${body.height.toFixed(1)})`;
          applyMaterial(body, body.material);
        });
        section.append(wLabel, wInput, hLabel, hInput);
      }

      const colorLabel = document.createElement('label'); colorLabel.textContent = '色';
      const colorInput = document.createElement('input'); colorInput.type = 'color'; colorInput.value = body.color;
      colorInput.addEventListener('input', () => { body.color = colorInput.value; });
      section.append(colorLabel, colorInput);
      inspector.appendChild(section);
    }

    function renderEmitterInspector(emitter){
      const section = document.createElement('div');
      section.className = 'phys-section';
      const h = document.createElement('h4'); h.textContent = 'エミッタ設定';
      const kindLabel = document.createElement('p'); kindLabel.textContent = `タイプ: ${emitter.kind}`;
      const rateLabel = document.createElement('label'); rateLabel.textContent = `レート (${emitter.rate.toFixed(1)}/s)`;
      const rateInput = document.createElement('input'); rateInput.type = 'range'; rateInput.min = '0'; rateInput.max = '40'; rateInput.step = '0.5'; rateInput.value = String(emitter.rate);
      rateInput.addEventListener('input', () => {
        emitter.rate = Number(rateInput.value);
        rateLabel.textContent = `レート (${emitter.rate.toFixed(1)}/s)`;
      });
      const powerLabel = document.createElement('label'); powerLabel.textContent = `強さ (${(emitter.power||1).toFixed(1)})`;
      const powerInput = document.createElement('input'); powerInput.type = 'range'; powerInput.min = '0.2'; powerInput.max = '5'; powerInput.step = '0.1'; powerInput.value = String(emitter.power || 1);
      powerInput.addEventListener('input', () => {
        emitter.power = Number(powerInput.value);
        powerLabel.textContent = `強さ (${(emitter.power||1).toFixed(1)})`;
      });

      section.append(h, kindLabel, rateLabel, rateInput, powerLabel, powerInput);

      if (emitter.kind === 'circuit') {
        const sourceToggle = document.createElement('label'); sourceToggle.className = 'phys-checkbox';
        const sourceInput = document.createElement('input'); sourceInput.type = 'checkbox'; sourceInput.checked = emitter.source;
        sourceInput.addEventListener('change', () => { emitter.source = sourceInput.checked; });
        sourceToggle.append(sourceInput, document.createTextNode('常時通電させる'));
        section.append(sourceToggle);

        const connTitle = document.createElement('h5'); connTitle.textContent = '接続ノード';
        section.append(connTitle);
        const list = document.createElement('ul'); list.className = 'phys-conn-list';
        (emitter.connections || []).forEach(id => {
          const li = document.createElement('li');
          li.textContent = `→ ${id.slice(0,6)}`;
          const btn = document.createElement('button'); btn.textContent = '切断';
          btn.addEventListener('click', () => { disconnectCircuit(emitter.id, id); renderInspector(); });
          li.appendChild(btn);
          list.appendChild(li);
        });
        section.append(list);
        const connectBtn = document.createElement('button'); connectBtn.textContent = state.pendingConnection === emitter.id ? '接続キャンセル' : '接続モード';
        connectBtn.addEventListener('click', () => {
          if (state.pendingConnection === emitter.id) state.pendingConnection = null;
          else state.pendingConnection = emitter.id;
          renderInspector();
        });
        section.append(connectBtn);
      }

      inspector.appendChild(section);
    }

    function updateHudInspector(){
      updateHud();
    }

    function updateWorld(dt){
      updateBodies(dt);
      updateEmitters(dt);
      updateParticles(dt);
      updateVines(dt);
      propagateCircuit(dt);
    }

    function renderWorld(){
      ctx.clearRect(0,0,canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,canvas.width, canvas.height);
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x=0;x<=canvas.width;x+=gridSize){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
      for (let y=0;y<=canvas.height;y+=gridSize){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }

      // draw wires
      ctx.strokeStyle = 'rgba(94,234,212,0.5)'; ctx.lineWidth = 2;
      state.emitters.forEach(node => {
        if (node.kind !== 'circuit') return;
        for (const id of node.connections || []){
          const other = state.emitters.find(e => e.id === id && e.kind === 'circuit');
          if (!other) continue;
          if (node.id < other.id) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // bodies
      state.bodies.forEach(body => {
        let fill = body.color;
        if (body.burnTimer > 0) fill = mixColor(fill, '#f97316', clamp(body.burnTimer/12, 0, 1));
        if (body.wetness > 0) fill = mixColor(fill, '#60a5fa', clamp(body.wetness/6, 0, 0.8));
        if (body.chargeTimer > 0) fill = mixColor(fill, '#facc15', clamp(body.chargeTimer/5, 0, 0.6));
        ctx.fillStyle = fill;
        ctx.strokeStyle = state.selection === body.id ? '#facc15' : 'rgba(15,23,42,0.8)';
        ctx.lineWidth = state.selection === body.id ? 3 : 1.5;
        if (body.shape === 'circle') {
          ctx.beginPath(); ctx.arc(body.x, body.y, body.radius, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.rect(body.x - body.width/2, body.y - body.height/2, body.width, body.height); ctx.fill(); ctx.stroke();
        }
      });

      // emitters
      state.emitters.forEach(emitter => {
        const radius = emitter.kind === 'circuit' ? 12 : 10;
        const colors = {
          fire:'#f97316',
          water:'#3b82f6',
          vine:'#22c55e',
          lightning:'#eab308',
          circuit: emitter.poweredTicks > 0 ? '#67e8f9' : '#94a3b8'
        };
        ctx.fillStyle = colors[emitter.kind] || '#e2e8f0';
        ctx.beginPath(); ctx.arc(emitter.x, emitter.y, radius, 0, Math.PI*2); ctx.fill();
        if (state.selection === emitter.id) {
          ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.stroke();
        }
      });

      // vines
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 2;
      state.vines.forEach(node => {
        ctx.beginPath();
        ctx.moveTo(node.x - 4, node.y);
        ctx.lineTo(node.x + 4, node.y + 12);
        ctx.stroke();
      });

      // particles
      state.particles.forEach(p => {
        switch(p.type){
          case 'fire': ctx.fillStyle = 'rgba(249,115,22,0.6)'; break;
          case 'water': ctx.fillStyle = 'rgba(96,165,250,0.7)'; break;
          case 'vine': ctx.fillStyle = 'rgba(34,197,94,0.6)'; break;
          case 'lightning': ctx.fillStyle = 'rgba(234,179,8,0.8)'; break;
          case 'spark': ctx.fillStyle = 'rgba(103,232,249,0.8)'; break;
          default: ctx.fillStyle = 'rgba(226,232,240,0.6)';
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
      });
    }

    function step(timestamp){
      if (!state.loopHandle) return;
      if (!state.lastTimestamp) state.lastTimestamp = timestamp;
      const dt = Math.min(0.05, (timestamp - state.lastTimestamp)/1000);
      state.lastTimestamp = timestamp;
      if (state.running) {
        state.accumulator += dt;
        const stepSize = 1/60;
        while(state.accumulator >= stepSize){
          updateWorld(stepSize);
          state.accumulator -= stepSize;
        }
      }
      renderWorld();
      updateHudInspector();
      state.loopHandle = requestAnimationFrame(step);
    }

    function ensureLoop(){
      if (!state.loopHandle) {
        state.loopHandle = requestAnimationFrame(step);
      }
    }

    function stopLoop(){
      if (state.loopHandle) {
        cancelAnimationFrame(state.loopHandle);
        state.loopHandle = null;
      }
      state.lastTimestamp = 0;
      state.accumulator = 0;
    }

    function snapshot(){
      return {
        gravity: Object.assign({}, state.gravity),
        airDrag: state.airDrag,
        bodies: state.bodies.map(b => deepClone(b)),
        emitters: state.emitters.map(e => deepClone(e)),
        vines: state.vines.map(v => deepClone(v))
      };
    }

    function applySnapshot(snap){
      if (!snap) return;
      state.gravity = Object.assign({ x:0, y:600 }, snap.gravity || {});
      state.airDrag = snap.airDrag ?? state.airDrag;
      state.bodies = (snap.bodies || []).map(b => Object.assign({}, b));
      state.emitters = (snap.emitters || []).map(e => {
        const copy = Object.assign({}, e);
        copy.connections = Array.isArray(copy.connections) ? Array.from(copy.connections) : [];
        return copy;
      });
      state.vines = (snap.vines || []).map(v => Object.assign({}, v));
      state.particles = [];
      state.selection = null;
      state.selectionKind = null;
      renderInspector();
    }

    function resetWorld(){
      if (!state.initialSnapshot) state.initialSnapshot = snapshot();
      applySnapshot(state.initialSnapshot);
    }

    function promptSave(){
      const name = window.prompt('保存名を入力してください', `layout-${state.savedLayouts.length+1}`);
      if (!name) return;
      const snap = snapshot();
      const idx = state.savedLayouts.findIndex(l => l.name === name);
      if (idx >= 0) state.savedLayouts[idx] = { name, data: snap };
      else state.savedLayouts.push({ name, data: snap });
      storeLayouts();
      renderInspector();
      gainXp(6, { reason:'save-layout' });
    }

    function promptLoad(){
      if (!state.savedLayouts.length) { window.alert('保存データがありません。'); return; }
      const names = state.savedLayouts.map(l => l.name).join(', ');
      const name = window.prompt(`読み込む名前を入力: ${names}`);
      if (!name) return;
      applySnapshotByName(name);
    }

    function applySnapshotByName(name){
      const entry = state.savedLayouts.find(l => l.name === name);
      if (!entry) return;
      applySnapshot(entry.data);
      gainXp(2, { reason:'load-layout' });
    }

    function loadLayouts(){
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const data = JSON.parse(raw);
        if (!Array.isArray(data)) return [];
        return data;
      } catch { return []; }
    }

    function storeLayouts(){
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedLayouts || []));
      } catch {}
    }

    function start(){
      ensureLoop();
      if (state.wasRunningBeforeHostStop) setRunning(true);
    }

    function stop(){
      state.wasRunningBeforeHostStop = state.running;
      state.running = false;
    }

    function destroy(){
      stopLoop();
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', resizeCanvas);
      try { root.removeChild(container); } catch {}
    }

    function getScore(){
      return state.sessionExp;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    renderInspector();
    ensureLoop();
    state.initialSnapshot = snapshot();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id:'physics_sandbox',
    name:'物理遊び',
    description:'粉遊び×剛体シミュレーション。図形に素材を設定して火・水・ツタ・雷・回路で遊ぼう',
    create
  });
})();
