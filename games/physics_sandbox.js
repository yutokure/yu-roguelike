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
    wood:  { id:'wood',  label:'木材',    density:0.6, restitution:0.25, friction:0.5, color:'#c97a43', flammability:0.8, conductivity:0.1,
             thermalConductivity:0.18, heatCapacity:1.9, ignitionPoint:320, meltingPoint:620, boilingPoint:900, freezePoint:-40, baseTemperature:20,
             formula:'C6H10O5', composition:{ C:6, H:10, O:5 }, hazards:['flammable'] },
    metal: { id:'metal', label:'金属',    density:1.8, restitution:0.15, friction:0.3, color:'#9aa0a6', flammability:0.0, conductivity:0.9,
             thermalConductivity:0.72, heatCapacity:0.9, ignitionPoint:900, meltingPoint:1500, boilingPoint:2900, freezePoint:-80, baseTemperature:20,
             formula:'Fe', composition:{ Fe:1 }, hazards:['conductive'] },
    rubber:{ id:'rubber',label:'ゴム',    density:0.9, restitution:0.75, friction:0.9, color:'#22262b', flammability:0.2, conductivity:0.05,
             thermalConductivity:0.16, heatCapacity:1.7, ignitionPoint:310, meltingPoint:520, boilingPoint:850, freezePoint:-60, baseTemperature:20,
             formula:'C5H8', composition:{ C:5, H:8 }, hazards:['elastic'] },
    stone: { id:'stone', label:'石材',    density:1.4, restitution:0.1, friction:0.7, color:'#6b7280', flammability:0.05, conductivity:0.2,
             thermalConductivity:0.35, heatCapacity:0.85, ignitionPoint:800, meltingPoint:1200, boilingPoint:2600, freezePoint:-120, baseTemperature:20,
             formula:'SiO2', composition:{ Si:1, O:2 }, hazards:['insulator'] },
    gel:   { id:'gel',   label:'ゼラチン', density:0.4, restitution:0.55, friction:0.2, color:'#60a5fa', flammability:0.0, conductivity:0.3,
             thermalConductivity:0.28, heatCapacity:3.2, ignitionPoint:260, meltingPoint:180, boilingPoint:260, freezePoint:-10, baseTemperature:15,
             formula:'H2O', composition:{ H:2, O:1 }, hazards:['aqueous'] },
    plasma:{ id:'plasma',label:'プラズマ', density:0.1, restitution:0.95, friction:0.05, color:'#f97316', flammability:1.0, conductivity:0.95,
             thermalConductivity:0.95, heatCapacity:0.5, ignitionPoint:1800, meltingPoint:2400, boilingPoint:3200, freezePoint:400, baseTemperature:800,
             formula:'H+', composition:{ H:1 }, hazards:['superheated','ionized'] },
    ice:   { id:'ice',   label:'氷結',    density:0.92, restitution:0.05, friction:0.08, color:'#a5f3fc', flammability:0.0, conductivity:0.2,
             thermalConductivity:0.42, heatCapacity:2.1, ignitionPoint:0, meltingPoint:0, boilingPoint:100, freezePoint:-40, baseTemperature:-10,
             formula:'H2O(s)', composition:{ H:2, O:1 }, hazards:['aqueous'] },
    sand:  { id:'sand',  label:'砂',      density:1.1, restitution:0.18, friction:0.85, color:'#f5d0a9', flammability:0.05, conductivity:0.05,
             thermalConductivity:0.25, heatCapacity:0.9, ignitionPoint:750, meltingPoint:1400, boilingPoint:2600, freezePoint:-120, baseTemperature:20,
             formula:'SiO2', composition:{ Si:1, O:2 }, hazards:['insulator'] },
    glass: { id:'glass', label:'ガラス',  density:0.7, restitution:0.4,  friction:0.2, color:'#bae6fd', flammability:0.0, conductivity:0.35,
             thermalConductivity:0.5, heatCapacity:0.84, ignitionPoint:900, meltingPoint:1100, boilingPoint:2300, freezePoint:-90, baseTemperature:20,
             formula:'SiO2', composition:{ Si:1, O:2 }, hazards:['insulator'] },
    sodium:{ id:'sodium',label:'ナトリウム', density:0.97, restitution:0.05, friction:0.2, color:'#f4f4f5', flammability:0.95, conductivity:0.8,
             thermalConductivity:0.14, heatCapacity:1.23, ignitionPoint:90, meltingPoint:98, boilingPoint:883, freezePoint:0, baseTemperature:20,
             formula:'Na', composition:{ Na:1 }, hazards:['alkali-metal','water-reactive','conductive'],
             reactivity:{ water:{ type:'exothermic', energy:2200, heat:420, spawnSteam:true, spawnFire:true, spawnHydrogen:true, structural:0.45, consumeParticle:true, cooldown:0.35 } } }
  };
  const PERIODIC_TABLE = {
    H:  { symbol:'H',  name:'水素',    atomicNumber:1,  atomicMass:1.008,  category:'非金属',        standardState:'gas' },
    O:  { symbol:'O',  name:'酸素',    atomicNumber:8,  atomicMass:15.999, category:'非金属',        standardState:'gas' },
    Na: { symbol:'Na', name:'ナトリウム', atomicNumber:11, atomicMass:22.99,  category:'アルカリ金属',  standardState:'solid' },
    Fe: { symbol:'Fe', name:'鉄',      atomicNumber:26, atomicMass:55.845, category:'遷移金属',      standardState:'solid' },
    Si: { symbol:'Si', name:'ケイ素',  atomicNumber:14, atomicMass:28.085, category:'半金属',        standardState:'solid' },
    C:  { symbol:'C',  name:'炭素',    atomicNumber:6,  atomicMass:12.011, category:'非金属',        standardState:'solid' },
    Cl: { symbol:'Cl', name:'塩素',    atomicNumber:17, atomicMass:35.45,  category:'ハロゲン',      standardState:'gas' }
  };
  const HAZARD_LABELS = {
    flammable:'可燃性',
    conductive:'導電性',
    elastic:'弾性体',
    insulator:'絶縁体',
    aqueous:'水溶性',
    superheated:'超高温',
    ionized:'電離',
    'alkali-metal':'アルカリ金属',
    'water-reactive':'水と激しく反応'
  };
  const DEFAULT_MATERIAL = 'wood';

  const WALL_BODIES = {
    left:  { id:'wall-left',  static:true, invMass:0, invInertia:0, vx:0, vy:0, angularVelocity:0, angle:0, restitution:0.08, friction:0.85, absoluteWall:true, x:0, y:0 },
    right: { id:'wall-right', static:true, invMass:0, invInertia:0, vx:0, vy:0, angularVelocity:0, angle:0, restitution:0.08, friction:0.85, absoluteWall:true, x:0, y:0 },
    top:   { id:'wall-top',   static:true, invMass:0, invInertia:0, vx:0, vy:0, angularVelocity:0, angle:0, restitution:0.08, friction:0.85, absoluteWall:true, x:0, y:0 },
    bottom:{ id:'wall-bottom',static:true, invMass:0, invInertia:0, vx:0, vy:0, angularVelocity:0, angle:0, restitution:0.08, friction:0.9,  absoluteWall:true, x:0, y:0 }
  };

  const TOOLS = [
    { id:'select', label:'選択', title:'図形やエミッタを選択・ドラッグ' },
    { id:'god-finger', label:'神の指', title:'シミュレーション中の物体を直接つかんで動かす' },
    { id:'add-circle', label:'円', title:'円形の剛体を追加' },
    { id:'add-box', label:'箱', title:'箱型の剛体を追加' },
    { id:'add-wall', label:'絶対壁', title:'壊れない壁を描画' },
    { id:'add-fire', label:'火', title:'炎エミッタを追加' },
    { id:'add-water', label:'水', title:'水エミッタを追加' },
    { id:'add-ice', label:'氷', title:'氷結エミッタを追加' },
    { id:'add-wind', label:'風', title:'風のエミッタを追加' },
    { id:'add-vine', label:'ツタ', title:'ツタエミッタを追加' },
    { id:'add-lightning', label:'雷', title:'雷エミッタを追加' },
    { id:'add-acid', label:'酸', title:'酸性エミッタを追加' },
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

  function normalizeAngle(angle){
    if (!Number.isFinite(angle)) return 0;
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  function bodyAxes(body){
    const angle = normalizeAngle(body?.angle || 0);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      axisX:{ x:cos, y:sin },
      axisY:{ x:-sin, y:cos }
    };
  }

  function worldToLocal(body, x, y){
    const angle = normalizeAngle(body?.angle || 0);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - body.x;
    const dy = y - body.y;
    return {
      x: dx * cos + dy * sin,
      y: -dx * sin + dy * cos
    };
  }

  function localToWorld(body, x, y){
    const angle = normalizeAngle(body?.angle || 0);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: body.x + x * cos - y * sin,
      y: body.y + x * sin + y * cos
    };
  }

  function getBodySupportPoint(body, dir){
    const len = Math.hypot(dir.x, dir.y) || 1;
    const unit = { x: dir.x / len, y: dir.y / len };
    if (body.shape === 'circle') {
      return {
        x: body.x + unit.x * body.radius,
        y: body.y + unit.y * body.radius
      };
    }
    const { axisX, axisY } = bodyAxes(body);
    const halfW = (body.width || 0) / 2;
    const halfH = (body.height || 0) / 2;
    const projX = unit.x * axisX.x + unit.y * axisX.y;
    const projY = unit.x * axisY.x + unit.y * axisY.y;
    const signX = projX >= 0 ? 1 : -1;
    const signY = projY >= 0 ? 1 : -1;
    return {
      x: body.x + axisX.x * halfW * signX + axisY.x * halfH * signY,
      y: body.y + axisX.y * halfW * signX + axisY.y * halfH * signY
    };
  }

  function orientedExtents(body){
    if (body.shape === 'circle') {
      return { halfX: body.radius, halfY: body.radius };
    }
    const { axisX, axisY } = bodyAxes(body);
    const halfW = (body.width || 0) / 2;
    const halfH = (body.height || 0) / 2;
    return {
      halfX: Math.abs(axisX.x) * halfW + Math.abs(axisY.x) * halfH,
      halfY: Math.abs(axisX.y) * halfW + Math.abs(axisY.y) * halfH
    };
  }

  function cross2D(a,b){
    return (a.x * b.y) - (a.y * b.x);
  }

  function crossScalarVec(s, v){
    return { x: -s * v.y, y: s * v.x };
  }

  const PHASE_LABELS = { solid:'固体', liquid:'液体', gas:'気体' };
  function phaseLabel(phase){ return PHASE_LABELS[phase] || PHASE_LABELS.solid; }
  function phaseSymbol(phase){
    switch(phase){
      case 'liquid': return 'L';
      case 'gas': return 'G';
      default: return 'S';
    }
  }

  function deepClone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  const FLUID_RADIUS = 5;
  const FLUID_KERNEL_RADIUS = FLUID_RADIUS * 2.5;
  const FLUID_KERNEL_RADIUS_SQ = FLUID_KERNEL_RADIUS * FLUID_KERNEL_RADIUS;
  const FLUID_REST_DENSITY = 1.1;
  const FLUID_PRESSURE_STIFFNESS = 180;
  const FLUID_VISCOSITY = 0.25;
  const FLUID_SURFACE_TENSION = 0.35;
  const LIQUID_TYPES = new Set(['water','acid']);
  const FIRE_BASE_TEMPERATURE = 900;
  const STEAM_CONDENSE_TEMP = 60;

  function isLiquidParticle(p){
    return !!p && LIQUID_TYPES.has(p.type);
  }

  function flameColor(temp){
    const t = clamp((temp - 200) / 1000, 0, 1);
    const r = 255;
    const g = Math.round(120 + 110 * t);
    const b = Math.round(40 + 160 * t * (1 - 0.25 * t));
    const a = 0.45 + 0.45 * t;
    return `rgba(${r},${g},${b},${clamp(a, 0.1, 0.9)})`;
  }

  function waterColor(temp){
    const t = clamp((temp - 15) / 90, 0, 1);
    const cold = [70, 140, 255];
    const hot = [210, 120, 120];
    const r = Math.round(lerp(cold[0], hot[0], t));
    const g = Math.round(lerp(cold[1], hot[1], t));
    const b = Math.round(lerp(cold[2], hot[2], t));
    return `rgba(${r},${g},${b},0.7)`;
  }

  function acidColor(temp){
    const t = clamp((temp - 20) / 120, 0, 1);
    const cold = [160, 240, 80];
    const hot = [255, 180, 60];
    const r = Math.round(lerp(cold[0], hot[0], t));
    const g = Math.round(lerp(cold[1], hot[1], t));
    const b = Math.round(lerp(cold[2], hot[2], t));
    return `rgba(${r},${g},${b},0.7)`;
  }

  function adjustBodyTemperature(body, delta){
    if (!body) return;
    if (body.absoluteWall) {
      body.temperature = state.ambientTemperature;
      return;
    }
    const maxTemp = (body.meltingPoint ?? 1200) + 600;
    body.temperature = clamp((body.temperature ?? state.ambientTemperature) + delta, -200, maxTemp);
  }

  function adjustParticleTemperature(particle, delta){
    if (!particle) return;
    particle.temperature = clamp((particle.temperature ?? state.ambientTemperature) + delta, -200, 2500);
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
      godFinger:null,
      savedLayouts:loadLayouts(),
      initialSnapshot:null,
      bounds:{ width:900, height:560 },
      boundaryMode:'wall',
      accumulator:0,
      lastTimestamp:0,
      loopHandle:null,
      solverIterations:3,
      substeps:2,
      ambientTemperature:20
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
      if (toolId !== 'god-finger') state.godFinger = null;
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
        absoluteWall: !!params?.absoluteWall,
        phase: params?.phase || 'solid',
        material: params?.material || DEFAULT_MATERIAL,
        mass: 1,
        invMass: 1,
        inertia: 1,
        invInertia: 1,
        boundingRadius: params?.radius ?? Math.hypot((params?.width ?? 80)/2, (params?.height ?? 80)/2),
        angle: params?.angle ?? 0,
        angularVelocity: params?.angularVelocity ?? 0,
        torque: 0,
        restitution: params?.restitution ?? 0.3,
        friction: params?.friction ?? 0.4,
        color: params?.color || MATERIALS[params?.material || DEFAULT_MATERIAL]?.color || '#8884d8',
        burnTimer:0,
        wetness:0,
        vineGrip:0,
        chargeTimer:0,
        damage:0,
        reactionCooldown:0,
        freezeTimer:0,
        corrosion:0,
        temperature: state.ambientTemperature,
        heatCapacity:1,
        thermalConductivity:0.2,
        ignitionPoint:320,
        meltingPoint:800,
        boilingPoint: params?.boilingPoint,
        freezePoint: params?.freezePoint,
        baseTemperature: state.ambientTemperature,
        baseRestitution: params?.restitution ?? 0.3,
        baseFriction: params?.friction ?? 0.4,
        chemical:null
      });
      if (kind === 'circle') body.radius = clamp(body.radius, 8, 160);
      else {
        body.width = clamp(body.width, 20, 240);
        body.height = clamp(body.height, 20, 240);
      }
      applyMaterial(body, body.material);
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
        direction: params?.direction ?? 270,
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

    function updateBodyMassProperties(body){
      if (!body) return;
      const mat = MATERIALS[body.material] || MATERIALS[DEFAULT_MATERIAL];
      const area = body.shape === 'circle'
        ? Math.PI * (body.radius || 0) * (body.radius || 0)
        : (body.width || 0) * (body.height || 0);
      const density = mat?.density ?? 1;
      const mass = Math.max(0.05, area * density * 0.001);
      body.mass = (body.static || body.absoluteWall) ? Infinity : mass;
      body.invMass = (body.static || body.absoluteWall) ? 0 : (1 / mass);
      if (body.shape === 'circle') {
        const inertia = 0.5 * mass * Math.pow(body.radius || 0, 2);
        if (body.static || body.absoluteWall) {
          body.inertia = Infinity;
          body.invInertia = 0;
        } else {
          body.inertia = Math.max(inertia, 1e-6);
          body.invInertia = 1 / body.inertia;
        }
        body.boundingRadius = body.radius || 0;
      } else {
        const w = body.width || 0;
        const h = body.height || 0;
        const inertia = (mass * (w*w + h*h)) / 12;
        if (body.static || body.absoluteWall) {
          body.inertia = Infinity;
          body.invInertia = 0;
        } else {
          body.inertia = Math.max(inertia, 1e-6);
          body.invInertia = 1 / body.inertia;
        }
        body.boundingRadius = Math.hypot(w/2, h/2);
      }
      if (typeof body.angle !== 'number' || !Number.isFinite(body.angle)) body.angle = 0;
      if (typeof body.angularVelocity !== 'number' || !Number.isFinite(body.angularVelocity)) body.angularVelocity = 0;
      if (typeof body.torque !== 'number' || !Number.isFinite(body.torque)) body.torque = 0;
    }

    function createChemicalProfile(mat){
      if (!mat) return null;
      const components = [];
      let molarMass = 0;
      if (mat.composition) {
        for (const [symbol, count] of Object.entries(mat.composition)){
          const element = PERIODIC_TABLE[symbol];
          if (element) molarMass += element.atomicMass * (count || 0);
          components.push({
            symbol,
            count,
            name: element?.name || symbol,
            atomicNumber: element?.atomicNumber || null
          });
        }
      }
      return {
        formula: mat.formula || null,
        label: mat.label,
        components,
        composition: mat.composition ? Object.assign({}, mat.composition) : null,
        molarMass: components.length ? molarMass : null,
        hazards: Array.isArray(mat.hazards) ? [...mat.hazards] : [],
        hazardLabels: Array.isArray(mat.hazards) ? mat.hazards.map(id => HAZARD_LABELS[id] || id) : [],
        reactivity: mat.reactivity ? deepClone(mat.reactivity) : null
      };
    }

    function applyMaterial(body, materialId){
      const mat = MATERIALS[materialId] || MATERIALS[DEFAULT_MATERIAL];
      const hadTemp = typeof body.temperature === 'number' && Number.isFinite(body.temperature);
      const prevTemp = hadTemp ? body.temperature : (mat.baseTemperature ?? state.ambientTemperature);
      body.material = mat.id;
      body.baseRestitution = mat.restitution;
      body.baseFriction = mat.friction;
      if (!body.absoluteWall) {
        body.restitution = mat.restitution;
        body.friction = mat.friction;
      }
      body.color = body.absoluteWall ? '#1f2937' : mat.color;
      body.thermalConductivity = mat.thermalConductivity ?? body.thermalConductivity ?? 0.2;
      body.heatCapacity = mat.heatCapacity ?? body.heatCapacity ?? 1;
      body.ignitionPoint = mat.ignitionPoint ?? body.ignitionPoint ?? 320;
      body.meltingPoint = mat.meltingPoint ?? body.meltingPoint ?? 800;
      body.boilingPoint = mat.boilingPoint ?? body.boilingPoint ?? (body.meltingPoint + 400);
      body.freezePoint = mat.freezePoint ?? body.freezePoint ?? Math.max(-120, body.meltingPoint - 200);
      body.baseTemperature = mat.baseTemperature ?? state.ambientTemperature;
      body.phase = body.phase || 'solid';
      if (body.absoluteWall) {
        body.static = true;
        body.mass = Infinity;
        body.invMass = 0;
        body.restitution = 0;
        body.friction = 0.98;
        body.baseRestitution = 0;
        body.baseFriction = 0.98;
      }
      updateBodyMassProperties(body);
      body.temperature = body.absoluteWall ? state.ambientTemperature : (hadTemp ? prevTemp : body.baseTemperature);
      body.chemical = createChemicalProfile(mat);
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
        } else {
          const local = worldToLocal(b, x, y);
          if (Math.abs(local.x) <= (b.width/2) && Math.abs(local.y) <= (b.height/2)) {
            return { obj:b, kind:'body' };
          }
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
          if (hit.kind === 'body') {
            dragInfo = { id: hit.obj.id, kind:'body', mode:'select', offsetX: pos.x - hit.obj.x, offsetY: pos.y - hit.obj.y };
          } else if (hit.kind === 'emitter') {
            dragInfo = { id: hit.obj.id, kind:'emitter', mode:'select', offsetX: pos.x - hit.obj.x, offsetY: pos.y - hit.obj.y };
          }
        } else {
          selectObject(null, null);
          dragInfo = null;
        }
      } else if (state.tool === 'god-finger') {
        const hit = findObjectAt(pos.x, pos.y);
        if (hit && hit.kind === 'body') {
          const body = hit.obj;
          selectObject(body, 'body');
          const offsetX = pos.x - body.x;
          const offsetY = pos.y - body.y;
          const ext = orientedExtents(body);
          const halfW = ext.halfX;
          const halfH = ext.halfY;
          dragInfo = { id: body.id, kind:'body', mode:'god', offsetX, offsetY };
          state.godFinger = {
            id: body.id,
            offsetX,
            offsetY,
            targetX: clamp(pos.x - offsetX, halfW, state.bounds.width - halfW),
            targetY: clamp(pos.y - offsetY, halfH, state.bounds.height - halfH),
            pointerX: pos.x,
            pointerY: pos.y,
            active: true
          };
        } else {
          state.godFinger = null;
          dragInfo = null;
        }
      } else if (state.tool === 'add-circle') {
        const body = spawnBody('circle', { x: pos.x, y: pos.y });
        drawPreview = { id: body.id, shape:'circle', origin:pos, min:12 };
      } else if (state.tool === 'add-box') {
        const body = spawnBody('box', { x: pos.x, y: pos.y });
        drawPreview = { id: body.id, shape:'box', origin:pos };
      } else if (state.tool === 'add-wall') {
        const body = spawnBody('box', { x: pos.x, y: pos.y, static:true, material:'stone', color:'#1f2937', absoluteWall:true });
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
        if (dragInfo.mode === 'god') {
          const body = state.bodies.find(b => b.id === dragInfo.id);
          if (!body) { state.godFinger = null; return; }
          const ext = orientedExtents(body);
          const halfW = ext.halfX;
          const halfH = ext.halfY;
          const targetX = clamp(pos.x - dragInfo.offsetX, halfW, state.bounds.width - halfW);
          const targetY = clamp(pos.y - dragInfo.offsetY, halfH, state.bounds.height - halfH);
          state.godFinger = Object.assign(state.godFinger || {}, {
            id: body.id,
            offsetX: dragInfo.offsetX,
            offsetY: dragInfo.offsetY,
            targetX,
            targetY,
            pointerX: pos.x,
            pointerY: pos.y,
            active: true
          });
        } else if (dragInfo.kind === 'body') {
          const body = state.bodies.find(b => b.id === dragInfo.id);
          if (body) {
            const ext = orientedExtents(body);
            const halfW = ext.halfX;
            const halfH = ext.halfY;
            const targetX = clamp(pos.x - dragInfo.offsetX, halfW, state.bounds.width - halfW);
            const targetY = clamp(pos.y - dragInfo.offsetY, halfH, state.bounds.height - halfH);
            body.x = targetX;
            body.y = targetY;
            body.vx = 0;
            body.vy = 0;
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
      state.godFinger = null;
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
        case 'add-ice': return 'ice';
        case 'add-wind': return 'wind';
        case 'add-vine': return 'vine';
        case 'add-lightning': return 'lightning';
        case 'add-acid': return 'acid';
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
      if (!body || body.absoluteWall) return;
      const mat = MATERIALS[body.material] || MATERIALS[DEFAULT_MATERIAL];
      const effective = Math.max(0, intensity * mat.flammability - body.wetness * 0.3);
      if (effective <= 0) return;
      const prev = body.burnTimer;
      body.burnTimer = clamp(body.burnTimer + effective, 0, 30);
      adjustBodyTemperature(body, effective * 8);
      if (prev === 0 && body.burnTimer > 0) gainXp(3, { reason:'ignite' });
    }

    function soakBody(body, amount){
      if (!body || body.absoluteWall) return;
      body.wetness = clamp(body.wetness + amount, 0, 12);
      if (amount > 0.4) body.burnTimer = Math.max(0, body.burnTimer - amount * 1.2);
      adjustBodyTemperature(body, -amount * 4);
    }

    function freezeBody(body, amount){
      if (!body || body.absoluteWall) return;
      const prev = body.freezeTimer;
      body.freezeTimer = clamp(body.freezeTimer + amount, 0, 12);
      body.wetness = clamp(body.wetness + amount * 0.4, 0, 12);
      body.burnTimer = Math.max(0, body.burnTimer - amount * 1.5);
      adjustBodyTemperature(body, -amount * 6);
      if (prev <= 0 && body.freezeTimer > 0) gainXp(3, { reason:'freeze' });
    }

    function corrodeBody(body, amount){
      if (!body || body.absoluteWall) return;
      const prev = body.corrosion;
      body.corrosion = clamp(body.corrosion + amount, 0, 40);
      adjustBodyTemperature(body, amount * 0.8);
      if (amount > 0.25 && body.corrosion > prev) gainXp(4, { reason:'corrode' });
    }

    function triggerChemicalExplosion(sourceBody, reaction, reagent){
      if (!sourceBody || !reaction) return;
      const energy = Math.max(200, reaction.energy || 0);
      const heat = reaction.heat ?? 0;
      const radius = clamp(Math.sqrt(energy) * 2.2, 60, 240);
      const x = sourceBody.x;
      const y = sourceBody.y;
      state.bodies.forEach(body => {
        if (!body || body.absoluteWall) return;
        const dx = body.x - x;
        const dy = body.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist <= radius && dist > 0.001) {
          const falloff = 1 - dist / radius;
          const impulse = energy * falloff * 0.004;
          if (!body.static) {
            const nx = dx / dist;
            const ny = dy / dist;
            body.vx += nx * impulse * (body.invMass || 0);
            body.vy += ny * impulse * (body.invMass || 0);
          }
          adjustBodyTemperature(body, (body === sourceBody ? heat : heat * 0.4) * falloff);
        }
      });
      const spawnCount = Math.min(24, Math.max(6, Math.round(energy / 180)));
      if (reaction.spawnFire) {
        for (let i=0;i<spawnCount;i++){
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (radius * 0.4);
          spawnParticle('fire', x + Math.cos(angle) * r, y + Math.sin(angle) * r, {
            power: 1.1 + Math.random() * 0.6,
            temperature: Math.max(FIRE_BASE_TEMPERATURE, heat + 400)
          });
        }
      }
      if (reaction.spawnSteam) {
        for (let i=0;i<spawnCount;i++){
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (radius * 0.5);
          spawnParticle('steam', x + Math.cos(angle) * r, y + Math.sin(angle) * r, {
            temperature: Math.max(120, heat + 120)
          });
        }
      }
      if (reaction.spawnHydrogen) {
        for (let i=0;i<Math.ceil(spawnCount/2);i++){
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (radius * 0.35);
          spawnParticle('spark', x + Math.cos(angle) * r, y + Math.sin(angle) * r, {
            power: 1.2 + Math.random() * 0.8
          });
        }
      }
    }

    function executeChemicalReaction(body, reaction, particle, reagent){
      if (!reaction) return;
      triggerChemicalExplosion(body, reaction, reagent);
      body.reactionCooldown = Math.max(body.reactionCooldown || 0, reaction.cooldown ?? 0.25);
      adjustBodyTemperature(body, reaction.heat ?? 0);
      body.damage = Math.min(1.05, (body.damage || 0) + (reaction.structural ?? 0.25));
      body.wetness = Math.max(0, body.wetness - 0.5);
      if (particle) {
        particle.type = 'steam';
        particle.temperature = Math.max(particle.temperature || state.ambientTemperature, Math.max(120, (reaction.heat ?? 0) + 80));
        particle.vx *= 0.4;
        particle.vy = Math.min(particle.vy, -90);
        particle.life = Math.max(particle.life, 1.2);
        particle.maxLife = Math.max(particle.maxLife || 0, 18);
      }
      gainXp(9, { reason:'chemical-reaction', reagent, material: body.material });
    }

    function applyChemicalReactions(particle, body){
      if (!particle || !body || body.absoluteWall) return false;
      const chemical = body.chemical;
      if (!chemical || body.reactionCooldown > 0) return false;
      const reactionMap = chemical.reactivity || {};
      const reaction = reactionMap ? reactionMap[particle.type] : null;
      if (!reaction) return false;
      executeChemicalReaction(body, reaction, particle, particle.type);
      return true;
    }

    function pushBody(body, directionDeg, strength){
      if (!body || body.static) return;
      const rad = (directionDeg * Math.PI) / 180;
      const fx = Math.cos(rad) * strength;
      const fy = Math.sin(rad) * strength;
      body.vx += fx * (body.invMass || 0);
      body.vy += fy * (body.invMass || 0);
    }

    function entangleBody(body, amount){
      if (!body || body.absoluteWall) return;
      const prev = body.vineGrip;
      body.vineGrip = clamp(body.vineGrip + amount, 0, 10);
      if (prev < 0.1 && body.vineGrip >= 0.1) gainXp(2, { reason:'vine-grip' });
    }

    function chargeBody(body, energy){
      if (!body || body.absoluteWall) return;
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
        payload: {},
        radius: isLiquidParticle({ type }) ? FLUID_RADIUS : 4,
        temperature: state.ambientTemperature,
        seed: Math.random(),
        maxLife: 0,
        supported:false,
        age:0
      }, extras || {});
      switch(type){
        case 'fire':
          particle.vx = (Math.random()-0.5)*40;
          particle.vy = -80 - Math.random()*40;
          particle.life = 1.4 + Math.random()*0.8;
          particle.temperature = FIRE_BASE_TEMPERATURE * (particle.power || 1);
          particle.radius = 4.5 + Math.random()*1.5;
          particle.maxLife = particle.life;
          break;
        case 'water':
          particle.vx = (Math.random()-0.5)*20;
          particle.vy = 60 + Math.random()*60;
          particle.life = 60;
          particle.maxLife = 60;
          particle.temperature = state.ambientTemperature;
          particle.radius = FLUID_RADIUS;
          break;
        case 'ice':
          particle.vx = (Math.random()-0.5)*18;
          particle.vy = 40 + Math.random()*40;
          particle.life = 4;
          particle.temperature = Math.min(0, state.ambientTemperature - 20);
          break;
        case 'wind': {
          const ang = ((particle.direction ?? 0) * Math.PI) / 180;
          const speed = 180 * (particle.power || 1);
          particle.vx = Math.cos(ang) * speed;
          particle.vy = Math.sin(ang) * speed;
          particle.life = 0.9;
          break;
        }
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
        case 'acid':
          particle.vx = (Math.random()-0.5)*22;
          particle.vy = 70 + Math.random()*70;
          particle.life = 48;
          particle.maxLife = 48;
          particle.temperature = state.ambientTemperature + 5;
          particle.radius = FLUID_RADIUS;
          break;
        case 'steam':
          particle.vx = (Math.random()-0.5)*60;
          particle.vy = -80 - Math.random()*40;
          particle.life = 1.4;
          particle.temperature = Math.max(100, state.ambientTemperature + 20);
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
            case 'ice':
              spawnParticle('ice', emitter.x + (Math.random()-0.5)*12, emitter.y, { power: emitter.power || 1 });
              break;
            case 'wind':
              spawnParticle('wind', emitter.x, emitter.y, { power: emitter.power || 1, direction: emitter.direction || 0 });
              break;
            case 'vine':
              spawnParticle('vine', emitter.x, emitter.y, { power: emitter.power || 1 });
              break;
            case 'lightning':
              spawnParticle('lightning', emitter.x, emitter.y, { power: emitter.power || 1 });
              break;
            case 'acid':
              spawnParticle('acid', emitter.x + (Math.random()-0.5)*10, emitter.y, { power: emitter.power || 1 });
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
      const liquids = [];
      for (let i=0;i<state.particles.length;i++){
        const p = state.particles[i];
        p.life -= dt;
        if (p.life <= 0) { remove.push(i); continue; }
        if (p.maxLife > 0) p.life = Math.min(p.life, p.maxLife);
        p.age = (p.age || 0) + dt;
        if (isLiquidParticle(p)) {
          p.radius = p.radius || FLUID_RADIUS;
          p.supported = false;
        }
        switch(p.type){
          case 'fire': {
            const swirl = Math.sin((p.seed || 0) * Math.PI * 2 + p.age * 10);
            p.vx += swirl * 60 * dt;
            p.vy -= (120 + (p.temperature || FIRE_BASE_TEMPERATURE) * 0.04) * dt;
            p.vx *= (1 - clamp(0.8 * dt, 0, 0.2));
            adjustParticleTemperature(p, -180 * dt);
            p.radius = 3 + clamp((p.temperature - 250) / 600, 0, 1) * 3.5;
            break;
          }
          case 'water':
            p.vy += state.gravity.y * 0.9 * dt;
            p.vx *= (1 - clamp(1.6 * dt, 0, 0.7));
            adjustParticleTemperature(p, (state.ambientTemperature - p.temperature) * 0.25 * dt);
            break;
          case 'ice':
            p.vy += state.gravity.y * 0.65 * dt;
            p.vx *= (1 - clamp(0.9 * dt, 0, 0.6));
            adjustParticleTemperature(p, (Math.min(-10, state.ambientTemperature - 20) - p.temperature) * 0.3 * dt);
            break;
          case 'wind': {
            const ang = ((p.direction ?? 0) * Math.PI) / 180;
            const targetVx = Math.cos(ang) * 220 * (p.power || 1);
            const targetVy = Math.sin(ang) * 220 * (p.power || 1);
            p.vx = lerp(p.vx, targetVx, clamp(3*dt, 0, 1));
            p.vy = lerp(p.vy, targetVy, clamp(3*dt, 0, 1));
            break;
          }
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
          case 'acid':
            p.vy += state.gravity.y * 0.95 * dt;
            p.vx *= (1 - clamp(1.2 * dt, 0, 0.65));
            adjustParticleTemperature(p, (state.ambientTemperature + 15 - p.temperature) * 0.2 * dt);
            break;
          case 'steam':
            p.vy -= 120 * dt;
            p.vx += (Math.random()-0.5) * 40 * dt;
            adjustParticleTemperature(p, -60 * dt);
            if (p.temperature < STEAM_CONDENSE_TEMP && Math.random() < dt * 2){
              p.type = 'water';
              p.radius = FLUID_RADIUS;
              p.life = Math.max(p.life, 8);
              p.maxLife = 18;
              p.temperature = state.ambientTemperature;
              p.vx *= 0.5;
              p.vy = Math.min(p.vy, 0);
            }
            break;
        }
        if (p.type === 'water') {
          const temp = p.temperature ?? state.ambientTemperature;
          if (temp > 105) {
            p.type = 'steam';
            p.radius = 4;
            p.life = Math.max(p.life, 1.6);
            p.maxLife = Math.max(p.maxLife || 0, 18);
            p.vy = Math.min(p.vy, -60);
            p.temperature = Math.max(110, temp);
          } else if (temp < 0) {
            p.type = 'ice';
            p.radius = FLUID_RADIUS;
            p.life = Math.max(p.life, 20);
            p.maxLife = Math.max(p.maxLife || 0, 40);
            p.temperature = Math.min(temp, 0);
          }
        } else if (p.type === 'ice') {
          const temp = p.temperature ?? state.ambientTemperature;
          if (temp > 2) {
            p.type = 'water';
            p.radius = FLUID_RADIUS;
            p.life = Math.max(p.life, 18);
            p.maxLife = Math.max(p.maxLife || 0, 40);
            p.temperature = Math.max(temp, state.ambientTemperature);
          }
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        let supported = false;
        if (isLiquidParticle(p)) {
          if (resolveLiquidBounds(p)) supported = true;
          for (const body of bodies){
            if (resolveLiquidBodyContact(p, body)) supported = true;
          }
          liquids.push(p);
          if (supported) {
            if (Math.abs(p.vy) < 15) p.vy = 0;
            p.vx *= (1 - clamp(5*dt, 0, 0.85));
          }
          p.supported = supported;
          if (supported && p.maxLife > 0) {
            p.life = Math.min(p.maxLife, p.life + dt * 0.8);
          }
        }
        if (p.x < -32 || p.x > state.bounds.width + 32 || p.y < -64 || p.y > state.bounds.height + 64) {
          remove.push(i);
          continue;
        }
        for (const body of bodies){
          if (!intersectsParticleBody(p, body)) continue;
          handleParticleBodyContact(p, body, dt);
        }
        if (p.type === 'lightning' || p.type === 'spark') {
          const radius = p.type === 'lightning' ? 40 : 28;
          const node = nearestCircuitNode(p.x, p.y, radius);
          if (node) powerCircuitNode(node, p.type === 'lightning' ? 3 : 2.5);
        }
      }
      if (liquids.length > 1) resolveLiquidInteractions(liquids, dt);
      for (let i=remove.length-1;i>=0;i--) state.particles.splice(remove[i],1);
    }

    function resolveLiquidBounds(p){
      const r = p.radius || FLUID_RADIUS;
      let supported = false;
      if (p.x < r) { p.x = r; if (p.vx < 0) p.vx *= -0.3; }
      if (p.x > state.bounds.width - r) { p.x = state.bounds.width - r; if (p.vx > 0) p.vx *= -0.3; }
      if (p.y >= state.bounds.height - r) { p.y = state.bounds.height - r; if (p.vy > 0) p.vy = 0; supported = true; }
      if (p.y < r) { p.y = r; if (p.vy < 0) p.vy = 0; }
      return supported;
    }

    function resolveLiquidBodyContact(p, body){
      const r = p.radius || FLUID_RADIUS;
      if (body.shape === 'circle') {
        const dx = p.x - body.x;
        const dy = p.y - body.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = body.radius + r;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          const penetration = minDist - dist + 0.2;
          p.x += nx * penetration;
          p.y += ny * penetration;
          const vn = p.vx * nx + p.vy * ny;
          if (vn < 0) {
            p.vx -= vn * nx;
            p.vy -= vn * ny;
          }
          p.vx *= 0.92;
          p.vy *= 0.92;
          return ny < -0.2;
        }
        return false;
      }
      const halfW = (body.width || 0) / 2 + r;
      const halfH = (body.height || 0) / 2 + r;
      const dx = p.x - body.x;
      const dy = p.y - body.y;
      if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) {
        const penX = halfW - Math.abs(dx);
        const penY = halfH - Math.abs(dy);
        if (penX < penY) {
          const sx = dx < 0 ? -1 : 1;
          p.x = body.x + sx * halfW;
          if (p.vx * sx > 0) p.vx = 0;
          p.vy *= 0.88;
          return false;
        }
        const sy = dy < 0 ? -1 : 1;
        p.y = body.y + sy * halfH;
        if (p.vy * sy > 0) p.vy = 0;
        p.vx *= 0.88;
        return sy < 0;
      }
      return false;
    }

    function resolveLiquidInteractions(liquids, dt){
      if (!liquids.length) return;
      const cellSize = FLUID_KERNEL_RADIUS;
      const grid = new Map();
      const keyFor = (x, y) => `${x}:${y}`;
      for (let i=0;i<liquids.length;i++){
        const p = liquids[i];
        const cellX = Math.floor(p.x / cellSize);
        const cellY = Math.floor(p.y / cellSize);
        const key = keyFor(cellX, cellY);
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(i);
        p.density = 0;
        p.pressure = 0;
      }
      for (let i=0;i<liquids.length;i++){
        const a = liquids[i];
        const cellX = Math.floor(a.x / cellSize);
        const cellY = Math.floor(a.y / cellSize);
        for (let ox=-1;ox<=1;ox++){
          for (let oy=-1;oy<=1;oy++){
            const bucket = grid.get(keyFor(cellX + ox, cellY + oy));
            if (!bucket) continue;
            for (const idx of bucket){
              const b = liquids[idx];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distSq = dx*dx + dy*dy;
              if (distSq > FLUID_KERNEL_RADIUS_SQ) continue;
              const dist = Math.sqrt(distSq) || 0.0001;
              const q = 1 - dist / FLUID_KERNEL_RADIUS;
              a.density += q * q;
            }
          }
        }
        a.density = Math.max(a.density, FLUID_REST_DENSITY * 0.6);
        a.pressure = Math.max(0, (a.density - FLUID_REST_DENSITY) * FLUID_PRESSURE_STIFFNESS);
      }
      for (let i=0;i<liquids.length;i++){
        const a = liquids[i];
        const cellX = Math.floor(a.x / cellSize);
        const cellY = Math.floor(a.y / cellSize);
        for (let ox=-1;ox<=1;ox++){
          for (let oy=-1;oy<=1;oy++){
            const bucket = grid.get(keyFor(cellX + ox, cellY + oy));
            if (!bucket) continue;
            for (const idx of bucket){
              if (idx <= i) continue;
              const b = liquids[idx];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distSq = dx*dx + dy*dy;
              if (distSq > FLUID_KERNEL_RADIUS_SQ || distSq === 0) continue;
              const dist = Math.sqrt(distSq);
              const nx = dx / dist;
              const ny = dy / dist;
              const q = 1 - dist / FLUID_KERNEL_RADIUS;
              const pressure = (a.pressure + b.pressure) * 0.5;
              const pressureForce = pressure * q * q * dt * 0.03;
              a.vx -= nx * pressureForce;
              a.vy -= ny * pressureForce;
              b.vx += nx * pressureForce;
              b.vy += ny * pressureForce;
              const avgVx = (a.vx + b.vx) / 2;
              const avgVy = (a.vy + b.vy) / 2;
              const visc = clamp(FLUID_VISCOSITY * q * dt, 0, 0.6);
              a.vx = lerp(a.vx, avgVx, visc);
              a.vy = lerp(a.vy, avgVy, visc);
              b.vx = lerp(b.vx, avgVx, visc);
              b.vy = lerp(b.vy, avgVy, visc);
              const separation = q * q * FLUID_SURFACE_TENSION * FLUID_KERNEL_RADIUS * dt * 6;
              a.x -= nx * separation;
              a.y -= ny * separation;
              b.x += nx * separation;
              b.y += ny * separation;
              if (dy > 0) a.supported = true;
              if (dy < 0) b.supported = true;
            }
          }
        }
      }
    }

    function handleParticleBodyContact(p, body, dt){
      if (body?.absoluteWall) return;
      if (applyChemicalReactions(p, body)) return;
      switch(p.type){
        case 'fire': {
          igniteBody(body, 0.45 * (p.power || 1) * dt * 60);
          const heat = (p.temperature || FIRE_BASE_TEMPERATURE) - (body.temperature || state.ambientTemperature);
          adjustBodyTemperature(body, heat * 0.015);
          adjustParticleTemperature(p, -heat * 0.01 * dt);
          break;
        }
        case 'water': {
          soakBody(body, 0.35 * (p.power || 1) * dt * 60);
          body.vy -= 15*dt;
          const diff = body.temperature - p.temperature;
          adjustBodyTemperature(body, -diff * 0.02);
          adjustParticleTemperature(p, diff * 0.03);
          if (body.temperature > body.ignitionPoint && Math.random() < clamp((body.temperature - body.ignitionPoint)/400, 0, 0.6) * dt) {
            p.type = 'steam';
            p.temperature = Math.max(120, body.temperature);
            p.vx *= 0.4;
            p.vy = -80;
            p.life = 1.5;
            p.radius = 4;
            return;
          }
          if (body.temperature < 0 && Math.random() < dt * 3) {
            p.type = 'ice';
            p.temperature = Math.min(body.temperature, 0);
            p.vx *= 0.3;
            p.vy *= 0.3;
          }
          if (body.burnTimer > 4 && Math.random() < 0.35) {
            spawnParticle('steam', body.x, body.y - (body.height || body.radius) * 0.6, { power: Math.min(1.2, body.burnTimer/10) });
          }
          break;
        }
        case 'vine':
          entangleBody(body, 0.15 * (p.power || 1));
          attemptGrowVine(p, body);
          break;
        case 'lightning':
          chargeBody(body, 0.5 * (p.power || 1));
          break;
        case 'spark':
          chargeBody(body, 0.2 * (p.power || 1));
          break;
        case 'ice':
          freezeBody(body, 0.35 * (p.power || 1));
          adjustBodyTemperature(body, Math.min(-10, p.temperature || -10) * 0.02);
          break;
        case 'wind':
          pushBody(body, p.direction ?? 0, (p.power || 1) * 140 * dt);
          break;
        case 'acid': {
          corrodeBody(body, 0.3 * (p.power || 1) * dt * 60);
          const diff = (p.temperature ?? state.ambientTemperature) - (body.temperature ?? state.ambientTemperature);
          adjustBodyTemperature(body, diff * 0.01);
          break;
        }
        case 'steam':
          soakBody(body, 0.05 * (p.power || 1));
          adjustBodyTemperature(body, (p.temperature - (body.temperature || state.ambientTemperature)) * 0.01);
          break;
      }
      if (p.type === 'lightning') {
        const node = nearestCircuitNode(p.x, p.y, 40);
        if (node) powerCircuitNode(node, 3);
      }
    }

    function intersectsParticleBody(p, body){
      const r = (p.radius || 6) + 2;
      if (body.shape === 'circle') {
        const dx = p.x - body.x;
        const dy = p.y - body.y;
        return (dx*dx + dy*dy) <= Math.pow(body.radius + r, 2);
      }
      return Math.abs(p.x - body.x) <= body.width/2 + r && Math.abs(p.y - body.y) <= body.height/2 + r;
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
      if (state.godFinger && !state.bodies.some(b => b.id === state.godFinger.id)) state.godFinger = null;
      for (const [key, value] of state.collisionCooldown.entries()){
        const remain = value - dt;
        if (remain <= 0) state.collisionCooldown.delete(key);
        else state.collisionCooldown.set(key, remain);
      }
      const bodiesToRemove = [];
      const bounds = state.bounds;
      for (const body of state.bodies){
        body.torque = 0;
        if (state.godFinger && state.godFinger.id === body.id) {
          const gf = state.godFinger;
          const ext = orientedExtents(body);
          const halfW = ext.halfX;
          const halfH = ext.halfY;
          const targetX = clamp((gf.targetX ?? body.x), halfW, state.bounds.width - halfW);
          const targetY = clamp((gf.targetY ?? body.y), halfH, state.bounds.height - halfH);
          if (body.static || body.absoluteWall) {
            body.x = targetX;
            body.y = targetY;
          } else {
            const dx = targetX - body.x;
            const dy = targetY - body.y;
            const stiffness = 40;
            const damping = 12;
            body.vx += dx * stiffness * dt;
            body.vy += dy * stiffness * dt;
            body.vx *= (1 - clamp(damping * dt, 0, 0.9));
            body.vy *= (1 - clamp(damping * dt, 0, 0.9));
            if (Math.hypot(dx, dy) < 6) {
              body.vx *= (1 - clamp(10 * dt, 0, 0.9));
              body.vy *= (1 - clamp(10 * dt, 0, 0.9));
            }
            if (Number.isFinite(body.invInertia) && body.invInertia > 0) {
              const pointerX = gf.pointerX ?? (body.x + gf.offsetX);
              const pointerY = gf.pointerY ?? (body.y + gf.offsetY);
              const rx = pointerX - body.x;
              const ry = pointerY - body.y;
              const forceX = dx * stiffness * (body.mass === Infinity ? 0 : body.mass);
              const forceY = dy * stiffness * (body.mass === Infinity ? 0 : body.mass);
              const torque = rx * forceY - ry * forceX;
              body.torque += torque;
            }
          }
        }
        let removeBody = false;
        if (!body.absoluteWall) {
          body.reactionCooldown = Math.max(0, (body.reactionCooldown || 0) - dt);
          if (body.damage >= 1) {
            bodiesToRemove.push(body.id);
            for (let k=0;k<8;k++){
              const angle = Math.random() * Math.PI * 2;
              const radius = (body.radius || Math.min(body.width, body.height) / 2 || 20) * Math.random();
              spawnParticle('spark', body.x + Math.cos(angle) * radius, body.y + Math.sin(angle) * radius, { power: 1.1 + Math.random()*0.6 });
            }
            gainXp(6, { reason:'structure-fail', material: body.material });
            continue;
          }
        }
        if (!body.static) {
          body.vx += state.gravity.x * dt;
          body.vy += state.gravity.y * dt;
          body.vx *= (1 - clamp(state.airDrag + body.vineGrip * 0.05, 0, 0.98) * dt);
          body.vy *= (1 - clamp(state.airDrag + body.vineGrip * 0.05, 0, 0.98) * dt);
          if (body.chargeTimer > 0) {
            body.vx += (Math.random()-0.5) * 40 * dt;
            body.vy -= Math.random() * 30 * dt;
          }
          if (body.freezeTimer > 0) {
            const damp = clamp(body.freezeTimer / 12, 0, 1);
            body.vx *= (1 - 0.35 * damp * dt);
            body.vy *= (1 - 0.35 * damp * dt);
          }
          if (Number.isFinite(body.invInertia) && body.invInertia > 0) {
            body.angularVelocity += (body.torque || 0) * body.invInertia * dt;
            if (body.chargeTimer > 0) {
              body.angularVelocity += (Math.random()-0.5) * 24 * dt;
            }
            const speed = Math.hypot(body.vx, body.vy);
            if (body.shape === 'box' && speed > 6) {
              const desired = Math.atan2(body.vy, body.vx);
              let diff = normalizeAngle(desired - body.angle);
              diff = clamp(diff, -Math.PI/2, Math.PI/2);
              body.angularVelocity += diff * clamp(speed / 140, -2, 2) * (state.airDrag + 0.05);
            }
            const angularDrag = clamp(state.airDrag * 1.8 + body.vineGrip * 0.08, 0, 6);
            body.angularVelocity *= (1 - clamp(angularDrag * dt, 0, 0.9));
            if (body.freezeTimer > 0) {
              const damp = clamp(body.freezeTimer / 12, 0, 1);
              body.angularVelocity *= (1 - clamp(damp * 0.6 * dt, 0, 0.9));
            }
            body.angle = normalizeAngle(body.angle + body.angularVelocity * dt);
          } else {
            body.angularVelocity = 0;
            body.angle = normalizeAngle(body.angle || 0);
          }
          body.x += body.vx * dt;
          body.y += body.vy * dt;
          if (state.boundaryMode === 'void') {
            const ext = orientedExtents(body);
            const minX = body.x - ext.halfX;
            const maxX = body.x + ext.halfX;
            const minY = body.y - ext.halfY;
            const maxY = body.y + ext.halfY;
            const margin = 160;
            if (maxX < -margin || minX > bounds.width + margin || maxY < -margin || minY > bounds.height + margin) {
              removeBody = true;
            }
          }
        }
        if (removeBody) {
          bodiesToRemove.push(body.id);
          continue;
        }
        body.burnTimer = Math.max(0, body.burnTimer - dt * (0.5 + body.wetness*0.1));
        body.wetness = Math.max(0, body.wetness - dt * 0.3);
        body.vineGrip = Math.max(0, body.vineGrip - dt * 0.2);
        body.chargeTimer = Math.max(0, body.chargeTimer - dt * 0.5);
        body.freezeTimer = Math.max(0, body.freezeTimer - dt * 0.6);
        body.corrosion = Math.max(0, body.corrosion - dt * 0.2);
        if (!body.static && state.boundaryMode === 'wall') {
          resolveBoundaryCollisions(body);
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
        if (!body.static && body.corrosion > 0.4) {
          const erosion = clamp(body.corrosion / 40, 0, 0.6) * 0.002 * dt * 60;
          if (erosion > 0) {
            if (body.shape === 'circle') body.radius = Math.max(6, body.radius * (1 - erosion));
            else {
              body.width = Math.max(12, body.width * (1 - erosion));
              body.height = Math.max(12, body.height * (1 - erosion));
            }
            applyMaterial(body, body.material);
          }
        }
      }
      if (bodiesToRemove.length) {
        state.bodies = state.bodies.filter(b => !bodiesToRemove.includes(b.id));
        if (state.selectionKind === 'body' && bodiesToRemove.includes(state.selection)) {
          state.selection = null;
          state.selectionKind = null;
        }
      }
      resolveCollisions(state.solverIterations);
    }

    function bodiesThermallyTouching(a, b){
      if (!a || !b) return false;
      if (a.absoluteWall || b.absoluteWall) return false;
      if (a.shape === 'circle' && b.shape === 'circle') {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        return dist <= a.radius + b.radius + 16;
      }
      const bounds = (body) => {
        if (body.shape === 'circle') {
          return {
            minX: body.x - body.radius,
            maxX: body.x + body.radius,
            minY: body.y - body.radius,
            maxY: body.y + body.radius
          };
        }
        return {
          minX: body.x - body.width/2,
          maxX: body.x + body.width/2,
          minY: body.y - body.height/2,
          maxY: body.y + body.height/2
        };
      };
      const A = bounds(a);
      const B = bounds(b);
      const margin = 12;
      return !(A.maxX + margin < B.minX || A.minX - margin > B.maxX || A.maxY + margin < B.minY || A.minY - margin > B.maxY);
    }

    function updateThermodynamics(dt){
      const ambient = state.ambientTemperature;
      const bodies = state.bodies;
      for (const body of bodies){
        if (body.absoluteWall) {
          body.temperature = state.ambientTemperature;
          body.phase = 'solid';
          continue;
        }
        const mat = MATERIALS[body.material] || MATERIALS[DEFAULT_MATERIAL];
        const conductivity = body.thermalConductivity ?? mat.thermalConductivity ?? 0.25;
        const burnFactor = clamp(body.burnTimer / 30, 0, 1);
        const ambientDiff = ambient - (body.temperature ?? ambient);
        adjustBodyTemperature(body, ambientDiff * conductivity * 0.05 * dt);
        if (body.burnTimer > 0) {
          const target = (body.ignitionPoint ?? 320) + 220;
          adjustBodyTemperature(body, (target - body.temperature) * 0.18 * burnFactor * dt);
        }
        if (body.wetness > 0.1) {
          adjustBodyTemperature(body, -body.wetness * 0.5 * dt);
        }
        if (body.freezeTimer > 0.1) {
          adjustBodyTemperature(body, -body.freezeTimer * 0.4 * dt);
        }
        if (body.temperature > body.ignitionPoint && mat.flammability > 0) {
          body.burnTimer = clamp(body.burnTimer + (body.temperature - body.ignitionPoint) * mat.flammability * 0.01 * dt, 0, 30);
        }
        if (!body.static && body.temperature > body.meltingPoint + 40) {
          const melt = clamp((body.temperature - body.meltingPoint) / 400, 0, 1) * dt;
          if (body.shape === 'circle') body.radius = Math.max(6, body.radius * (1 - 0.015 * melt));
          else {
            body.width = Math.max(12, body.width * (1 - 0.015 * melt));
            body.height = Math.max(12, body.height * (1 - 0.015 * melt));
          }
          applyMaterial(body, body.material);
        }
        if (body.burnTimer > 0.6) {
          const rate = clamp(body.burnTimer / 8, 0.1, 4);
          if (Math.random() < rate * dt) {
            const offsetX = (Math.random()-0.5) * (body.width || body.radius*1.2 || 20);
            const offsetY = - (body.height || body.radius) * (0.3 + Math.random()*0.4);
            spawnParticle('fire', body.x + offsetX, body.y + offsetY, {
              power: clamp(body.burnTimer / 8, 0.5, 2.5),
              temperature: Math.max(body.temperature, FIRE_BASE_TEMPERATURE)
            });
          }
        }
      }
      for (let i=0;i<bodies.length;i++){
        for (let j=i+1;j<bodies.length;j++){
          const a = bodies[i];
          const b = bodies[j];
          if (!bodiesThermallyTouching(a,b)) continue;
          const cond = Math.min(a.thermalConductivity ?? 0.25, b.thermalConductivity ?? 0.25);
          const diff = (b.temperature ?? ambient) - (a.temperature ?? ambient);
          if (Math.abs(diff) < 0.01) continue;
          const flow = diff * cond * 0.08 * dt;
          adjustBodyTemperature(a, flow);
          adjustBodyTemperature(b, -flow);
        }
      }
    }

    function applyPhaseTransition(body, nextPhase){
      const prev = body.phase || 'solid';
      if (prev === nextPhase) return;
      body.phase = nextPhase;
      body.phaseAge = 0;
      if (nextPhase === 'liquid') {
        gainXp(1.5, { reason:'phase-liquid' });
      } else if (nextPhase === 'gas') {
        for (let i=0;i<3;i++) {
          spawnParticle('steam', body.x + (Math.random()-0.5) * (body.width || body.radius * 2 || 40), body.y + (Math.random()-0.5) * (body.height || body.radius * 2 || 40), {
            temperature: Math.max(120, body.temperature || state.ambientTemperature + 40)
          });
        }
        gainXp(2.5, { reason:'phase-gas' });
      } else if (nextPhase === 'solid' && prev !== 'solid') {
        gainXp(1, { reason:'phase-solid' });
      }
    }

    function processParticleReactions(dt, waters, fires, acids, ices){
      const fireDistSq = 18 * 18;
      for (const water of waters){
        for (const fire of fires){
          const dx = fire.x - water.x;
          const dy = fire.y - water.y;
          if ((dx*dx + dy*dy) <= fireDistSq){
            if (water.type === 'water') {
              water.type = 'steam';
              water.temperature = Math.max(110, water.temperature, fire.temperature || FIRE_BASE_TEMPERATURE);
              water.life = Math.max(water.life, 1.2);
              water.maxLife = Math.max(water.maxLife || 0, 18);
              water.vx *= 0.5;
              water.vy = Math.min(water.vy, -80);
              water.radius = 4;
            }
            fire.life = Math.max(0.1, fire.life - dt * 2);
            adjustParticleTemperature(fire, -220 * dt);
          }
        }
        for (const acid of acids){
          const dx = acid.x - water.x;
          const dy = acid.y - water.y;
          if ((dx*dx + dy*dy) <= 17 * 17){
            acid.type = 'water';
            acid.temperature = Math.max(acid.temperature, water.temperature + 5);
            acid.life = Math.min(acid.life, 24);
            acid.maxLife = Math.max(acid.maxLife || 0, 24);
            if (Math.random() < dt * 2) {
              spawnParticle('steam', (acid.x + water.x) / 2, (acid.y + water.y) / 2, { temperature: Math.max(100, acid.temperature) });
            }
          }
        }
      }
      const meltDistSq = 17 * 17;
      for (const ice of ices){
        for (const fire of fires){
          const dx = fire.x - ice.x;
          const dy = fire.y - ice.y;
          if ((dx*dx + dy*dy) <= meltDistSq){
            ice.type = 'water';
            ice.temperature = Math.max(ice.temperature, 20);
            ice.life = Math.max(ice.life, 16);
            ice.radius = FLUID_RADIUS;
          }
        }
      }
    }

    function updateChemistry(dt){
      const waters = [];
      const fires = [];
      const acids = [];
      const ices = [];
      for (const p of state.particles){
        switch(p.type){
          case 'water': waters.push(p); break;
          case 'fire': fires.push(p); break;
          case 'acid': acids.push(p); break;
          case 'ice': ices.push(p); break;
        }
      }
      for (const body of state.bodies){
        if (body.absoluteWall) continue;
        const temp = body.temperature ?? state.ambientTemperature;
        const melt = body.meltingPoint ?? 800;
        const boil = body.boilingPoint ?? (melt + 400);
        const freeze = body.freezePoint ?? Math.max(-120, melt - 200);
        let desiredPhase = body.phase || 'solid';
        if (temp >= boil) desiredPhase = 'gas';
        else if (temp >= melt) desiredPhase = 'liquid';
        else if (temp <= freeze) desiredPhase = 'solid';
        else if (desiredPhase === 'gas' && temp < boil - 80) desiredPhase = 'liquid';
        else if (desiredPhase === 'liquid' && temp < melt - 40) desiredPhase = 'solid';
        if (desiredPhase !== body.phase) applyPhaseTransition(body, desiredPhase);
        body.phase = body.phase || desiredPhase;
        body.phaseAge = (body.phaseAge || 0) + dt;
        const baseRest = body.baseRestitution ?? body.restitution;
        const baseFric = body.baseFriction ?? body.friction;
        if (body.phase === 'liquid') {
          body.restitution = lerp(body.restitution, baseRest * 0.55, clamp(4*dt, 0, 1));
          body.friction = lerp(body.friction, Math.max(0.05, baseFric * 0.6), clamp(4*dt, 0, 1));
        } else if (body.phase === 'gas') {
          body.restitution = lerp(body.restitution, 0.05, clamp(4*dt, 0, 1));
          body.friction = lerp(body.friction, 0.03, clamp(4*dt, 0, 1));
          if (!body.static) {
            body.vx *= (1 - clamp(0.45 * dt, 0, 0.35));
            body.vy *= (1 - clamp(0.45 * dt, 0, 0.35));
          }
          if (!body.static && Math.random() < dt * 0.3) {
            const shrink = clamp(dt * 6, 0, 0.25);
            if (body.shape === 'circle') body.radius = Math.max(6, body.radius * (1 - shrink));
            else {
              body.width = Math.max(12, body.width * (1 - shrink));
              body.height = Math.max(12, body.height * (1 - shrink));
            }
            updateBodyMassProperties(body);
          }
        } else {
          body.restitution = lerp(body.restitution, baseRest, clamp(5*dt, 0, 1));
          body.friction = lerp(body.friction, baseFric, clamp(5*dt, 0, 1));
        }
        if (body.wetness > 2 && temp > Math.max(95, (body.boilingPoint ?? 120) - 20)) {
          if (Math.random() < clamp(body.wetness * dt * 0.6, 0, 0.85)) {
            spawnParticle('steam', body.x + (Math.random()-0.5) * (body.width || body.radius || 24), body.y - (body.height || body.radius || 24) * 0.4, {
              temperature: Math.max(100, temp)
            });
            body.wetness = Math.max(0, body.wetness - 0.3);
          }
        }
        if (body.corrosion > 12 && body.material === 'metal') {
          if (Math.random() < dt * 0.6) {
            spawnParticle('spark', body.x + (Math.random()-0.5) * (body.width || body.radius || 20), body.y + (Math.random()-0.5) * (body.height || body.radius || 20), {
              power: clamp(1 + body.corrosion / 20, 1, 3)
            });
          }
        }
      }
      processParticleReactions(dt, waters, fires, acids, ices);
    }

    function resolveBoundaryCollisions(body){
      if (!body || state.boundaryMode !== 'wall') return;
      const bounds = state.bounds;
      const leftSupport = getBodySupportPoint(body, { x:-1, y:0 });
      if (leftSupport.x < 0) {
        const penetration = -leftSupport.x;
        const contact = { x: 0, y: clamp(leftSupport.y, 0, bounds.height) };
        const wall = WALL_BODIES.left;
        wall.x = contact.x;
        wall.y = contact.y;
        resolveContact(body, wall, { x:-1, y:0 }, penetration, contact);
      }
      const rightSupport = getBodySupportPoint(body, { x:1, y:0 });
      if (rightSupport.x > bounds.width) {
        const penetration = rightSupport.x - bounds.width;
        const contact = { x: bounds.width, y: clamp(rightSupport.y, 0, bounds.height) };
        const wall = WALL_BODIES.right;
        wall.x = contact.x;
        wall.y = contact.y;
        resolveContact(body, wall, { x:1, y:0 }, penetration, contact);
      }
      const topSupport = getBodySupportPoint(body, { x:0, y:-1 });
      if (topSupport.y < 0) {
        const penetration = -topSupport.y;
        const contact = { x: clamp(topSupport.x, 0, bounds.width), y: 0 };
        const wall = WALL_BODIES.top;
        wall.x = contact.x;
        wall.y = contact.y;
        resolveContact(body, wall, { x:0, y:-1 }, penetration, contact);
      }
      const bottomSupport = getBodySupportPoint(body, { x:0, y:1 });
      if (bottomSupport.y > bounds.height) {
        const penetration = bottomSupport.y - bounds.height;
        const contact = { x: clamp(bottomSupport.x, 0, bounds.width), y: bounds.height };
        const wall = WALL_BODIES.bottom;
        wall.x = contact.x;
        wall.y = contact.y;
        resolveContact(body, wall, { x:0, y:1 }, penetration, contact);
      }
    }

    function resolveCollisions(iterations){
      const passes = Math.max(1, Math.floor(iterations || 1));
      for (let iter=0; iter<passes; iter++){
        for (let i=0;i<state.bodies.length;i++){
          for (let j=i+1;j<state.bodies.length;j++){
            const a = state.bodies[i];
            const b = state.bodies[j];
            handleCollisionPair(a,b);
          }
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
      const minDist = (a.radius || 0) + (b.radius || 0);
      if (dist >= minDist || dist === 0) return;
      const nx = dx / dist;
      const ny = dy / dist;
      const penetration = minDist - dist;
      const pointA = { x: a.x + nx * (a.radius || 0), y: a.y + ny * (a.radius || 0) };
      const pointB = { x: b.x - nx * (b.radius || 0), y: b.y - ny * (b.radius || 0) };
      const contact = { x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2 };
      resolveContact(a, b, { x:nx, y:ny }, penetration, contact);
    }

    function projectBoxOntoAxis(box, axis){
      const { axisX, axisY } = bodyAxes(box);
      const halfW = (box.width || 0) / 2;
      const halfH = (box.height || 0) / 2;
      const centerProj = box.x * axis.x + box.y * axis.y;
      const extent = halfW * Math.abs(axis.x * axisX.x + axis.y * axisX.y)
        + halfH * Math.abs(axis.x * axisY.x + axis.y * axisY.y);
      return { min: centerProj - extent, max: centerProj + extent };
    }

    function resolveBoxBox(a,b){
      const axes = [];
      const axesA = bodyAxes(a);
      const axesB = bodyAxes(b);
      axes.push(axesA.axisX, axesA.axisY, axesB.axisX, axesB.axisY);
      let minOverlap = Infinity;
      let smallestAxis = null;
      const centerDiff = { x: b.x - a.x, y: b.y - a.y };
      for (const axis of axes){
        const len = Math.hypot(axis.x, axis.y);
        if (len === 0) continue;
        const unit = { x: axis.x / len, y: axis.y / len };
        const projA = projectBoxOntoAxis(a, unit);
        const projB = projectBoxOntoAxis(b, unit);
        const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
        if (overlap <= 0) return;
        if (overlap < minOverlap) {
          minOverlap = overlap;
          smallestAxis = unit;
        }
      }
      if (!smallestAxis || !Number.isFinite(minOverlap)) return;
      let normal = smallestAxis;
      if ((centerDiff.x * normal.x + centerDiff.y * normal.y) < 0) {
        normal = { x: -normal.x, y: -normal.y };
      }
      const supportA = getBodySupportPoint(a, normal);
      const supportB = getBodySupportPoint(b, { x:-normal.x, y:-normal.y });
      const contact = { x: (supportA.x + supportB.x) / 2, y: (supportA.y + supportB.y) / 2 };
      resolveContact(a, b, normal, minOverlap, contact);
    }

    function resolveCircleBox(circle, box){
      const cos = Math.cos(box.angle || 0);
      const sin = Math.sin(box.angle || 0);
      const dx = circle.x - box.x;
      const dy = circle.y - box.y;
      const localX = cos * dx + sin * dy;
      const localY = -sin * dx + cos * dy;
      const halfW = (box.width || 0) / 2;
      const halfH = (box.height || 0) / 2;
      let closestX = clamp(localX, -halfW, halfW);
      let closestY = clamp(localY, -halfH, halfH);
      let diffX = localX - closestX;
      let diffY = localY - closestY;
      let distSq = diffX*diffX + diffY*diffY;
      let normalLocal;
      let penetration;
      if (distSq < 1e-8) {
        const dxEdge = halfW - Math.abs(localX);
        const dyEdge = halfH - Math.abs(localY);
        if (dxEdge < dyEdge) {
          const sx = localX >= 0 ? 1 : -1;
          normalLocal = { x: sx, y: 0 };
          penetration = (circle.radius || 0) - dxEdge;
          closestX = sx * halfW;
          closestY = clamp(localY, -halfH, halfH);
        } else {
          const sy = localY >= 0 ? 1 : -1;
          normalLocal = { x: 0, y: sy };
          penetration = (circle.radius || 0) - dyEdge;
          closestX = clamp(localX, -halfW, halfW);
          closestY = sy * halfH;
        }
        distSq = 1;
      } else {
        const dist = Math.sqrt(distSq);
        normalLocal = { x: diffX / dist, y: diffY / dist };
        penetration = (circle.radius || 0) - dist;
      }
      if (penetration <= 0) return;
      const normalWorld = {
        x: cos * normalLocal.x - sin * normalLocal.y,
        y: sin * normalLocal.x + cos * normalLocal.y
      };
      const normal = { x: -normalWorld.x, y: -normalWorld.y };
      const boxPoint = localToWorld(box, closestX, closestY);
      const circlePoint = {
        x: circle.x + normal.x * (circle.radius || 0),
        y: circle.y + normal.y * (circle.radius || 0)
      };
      const contact = { x: (boxPoint.x + circlePoint.x) / 2, y: (boxPoint.y + circlePoint.y) / 2 };
      resolveContact(circle, box, normal, penetration, contact);
    }

    function resolveContact(a,b, normal, penetration, contactPoint){
      if ((!a || a.static) && (!b || b.static)) return;
      if (penetration <= 0) return;
      const invMassA = a?.invMass || 0;
      const invMassB = b?.invMass || 0;
      const invInertiaA = a?.invInertia || 0;
      const invInertiaB = b?.invInertia || 0;
      if ((invMassA + invMassB + invInertiaA + invInertiaB) <= 0) return;
      const rA = a ? { x: contactPoint.x - a.x, y: contactPoint.y - a.y } : { x:0, y:0 };
      const rB = b ? { x: contactPoint.x - b.x, y: contactPoint.y - b.y } : { x:0, y:0 };

      const totalInvMass = invMassA + invMassB;
      if (totalInvMass > 0) {
        const percent = 0.6;
        const slop = 0.01;
        const correctionMag = Math.max(penetration - slop, 0) / totalInvMass * percent;
        if (a && !a.static) {
          a.x -= normal.x * correctionMag * invMassA;
          a.y -= normal.y * correctionMag * invMassA;
        }
        if (b && !b.static) {
          b.x += normal.x * correctionMag * invMassB;
          b.y += normal.y * correctionMag * invMassB;
        }
      }

      const angVelA = a?.angularVelocity || 0;
      const angVelB = b?.angularVelocity || 0;
      const velA = a ? { x: a.vx + (-angVelA * rA.y), y: a.vy + (angVelA * rA.x) } : { x:0, y:0 };
      const velB = b ? { x: b.vx + (-angVelB * rB.y), y: b.vy + (angVelB * rB.x) } : { x:0, y:0 };
      const rv = { x: velB.x - velA.x, y: velB.y - velA.y };
      const velAlongNormal = rv.x * normal.x + rv.y * normal.y;
      if (velAlongNormal > 0) return;

      const restitution = Math.min(a?.restitution ?? 0.2, b?.restitution ?? 0.2);
      let j = -(1 + restitution) * velAlongNormal;
      let denom = invMassA + invMassB;
      denom += invInertiaA * Math.pow(cross2D(rA, normal), 2);
      denom += invInertiaB * Math.pow(cross2D(rB, normal), 2);
      if (denom <= 0) return;
      j /= denom;

      const impulse = { x: normal.x * j, y: normal.y * j };
      if (a && !a.static) {
        a.vx -= impulse.x * invMassA;
        a.vy -= impulse.y * invMassA;
        if (invInertiaA > 0) a.angularVelocity -= cross2D(rA, impulse) * invInertiaA;
      }
      if (b && !b.static) {
        b.vx += impulse.x * invMassB;
        b.vy += impulse.y * invMassB;
        if (invInertiaB > 0) b.angularVelocity += cross2D(rB, impulse) * invInertiaB;
      }

      const tangent = { x: rv.x - velAlongNormal * normal.x, y: rv.y - velAlongNormal * normal.y };
      const tLen = Math.hypot(tangent.x, tangent.y);
      if (tLen > 1e-6) {
        tangent.x /= tLen;
        tangent.y /= tLen;
        const vt = rv.x * tangent.x + rv.y * tangent.y;
        let denomF = invMassA + invMassB;
        denomF += invInertiaA * Math.pow(cross2D(rA, tangent), 2);
        denomF += invInertiaB * Math.pow(cross2D(rB, tangent), 2);
        if (denomF > 0) {
          let jt = -vt / denomF;
          const mu = Math.sqrt(effectiveFriction(a) * effectiveFriction(b));
          const maxFriction = Math.abs(j) * mu;
          jt = clamp(jt, -maxFriction, maxFriction);
          const frictionImpulse = { x: tangent.x * jt, y: tangent.y * jt };
          if (a && !a.static) {
            a.vx -= frictionImpulse.x * invMassA;
            a.vy -= frictionImpulse.y * invMassA;
            if (invInertiaA > 0) a.angularVelocity -= cross2D(rA, frictionImpulse) * invInertiaA;
          }
          if (b && !b.static) {
            b.vx += frictionImpulse.x * invMassB;
            b.vy += frictionImpulse.y * invMassB;
            if (invInertiaB > 0) b.angularVelocity += cross2D(rB, frictionImpulse) * invInertiaB;
          }
        }
      }

      registerCollisionXp(a, b, Math.abs(j));
    }

    function effectiveFriction(body){
      if (!body) return 0.5;
      let value = body.friction ?? 0.5;
      if (body.wetness > 3) value *= 1.2;
      if (body.freezeTimer > 0.5) value *= 0.7;
      if (body.vineGrip > 0.5) value *= 1.15;
      return clamp(value, 0, 1.2);
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
      const info3 = document.createElement('div');
      info3.className = 'phys-hud-line';
      info3.textContent = `Solver ${state.solverIterations} iter × ${state.substeps} sub`;
      const temps = state.bodies.map(b => b.temperature ?? state.ambientTemperature);
      const avgTemp = temps.length ? temps.reduce((sum, v) => sum + v, 0) / temps.length : state.ambientTemperature;
      const maxTemp = temps.length ? Math.max(...temps) : state.ambientTemperature;
      const info4 = document.createElement('div');
      info4.className = 'phys-hud-line';
      info4.textContent = `平均温度 ${avgTemp.toFixed(1)}°C / 周囲 ${state.ambientTemperature.toFixed(1)}°C / 最高 ${maxTemp.toFixed(1)}°C`;
      const phaseCounts = state.bodies.reduce((acc, body) => {
        const key = body.absoluteWall ? 'solid' : (body.phase || 'solid');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const info5 = document.createElement('div');
      info5.className = 'phys-hud-line';
      info5.textContent = `状態 固体${phaseCounts.solid || 0} / 液体${phaseCounts.liquid || 0} / 気体${phaseCounts.gas || 0}`;
      hud.append(info, info2, info3, info4, info5);
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
      const iterLabel = document.createElement('label');
      iterLabel.textContent = `反復回数 (${state.solverIterations})`;
      const iterInput = document.createElement('input');
      iterInput.type = 'range';
      iterInput.min = '1';
      iterInput.max = '6';
      iterInput.step = '1';
      iterInput.value = String(state.solverIterations);
      iterInput.addEventListener('input', () => {
        state.solverIterations = Math.round(Number(iterInput.value) || 1);
        iterLabel.textContent = `反復回数 (${state.solverIterations})`;
      });
      const subLabel = document.createElement('label');
      subLabel.textContent = `サブステップ (${state.substeps})`;
      const subInput = document.createElement('input');
      subInput.type = 'range';
      subInput.min = '1';
      subInput.max = '6';
      subInput.step = '1';
      subInput.value = String(state.substeps);
      subInput.addEventListener('input', () => {
        state.substeps = Math.max(1, Math.round(Number(subInput.value) || 1));
        subLabel.textContent = `サブステップ (${state.substeps})`;
      });
      const ambientLabel = document.createElement('label');
      ambientLabel.textContent = `周囲温度 (${state.ambientTemperature.toFixed(1)}°C)`;
      const ambientInput = document.createElement('input');
      ambientInput.type = 'range';
      ambientInput.min = '-80';
      ambientInput.max = '400';
      ambientInput.step = '1';
      ambientInput.value = String(state.ambientTemperature);
      ambientInput.addEventListener('input', () => {
        state.ambientTemperature = Math.round(Number(ambientInput.value) || 0);
        ambientLabel.textContent = `周囲温度 (${state.ambientTemperature.toFixed(1)}°C)`;
      });
      const boundaryLabel = document.createElement('label');
      boundaryLabel.textContent = '外周モード';
      const boundarySelect = document.createElement('select');
      [
        { value:'wall', text:'壁 (外周で反射)' },
        { value:'void', text:'奈落 (外に落下)' }
      ].forEach(optDef => {
        const opt = document.createElement('option');
        opt.value = optDef.value;
        opt.textContent = optDef.text;
        if (state.boundaryMode === optDef.value) opt.selected = true;
        boundarySelect.appendChild(opt);
      });
      boundarySelect.addEventListener('change', () => {
        state.boundaryMode = boundarySelect.value === 'void' ? 'void' : 'wall';
        renderInspector();
      });
      boundaryLabel.appendChild(boundarySelect);
      worldSection.append(gLabel, gInput, dragLabel, dragInput, iterLabel, iterInput, subLabel, subInput, ambientLabel, ambientInput, boundaryLabel);
      if (state.boundaryMode === 'void') {
        const voidHint = document.createElement('p');
        voidHint.className = 'phys-hint';
        voidHint.textContent = '奈落: 図形が外に出ると一定距離で消滅します。';
        worldSection.appendChild(voidHint);
      }
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
      const phaseInfo = document.createElement('p');
      phaseInfo.className = 'phys-hint';
      phaseInfo.textContent = `状態: ${phaseLabel(body.phase || 'solid')}`;
      section.append(h, phaseInfo);
      const chemical = body.chemical;
      if (chemical) {
        const formulaInfo = document.createElement('p');
        formulaInfo.className = 'phys-hint';
        formulaInfo.textContent = `化学式: ${chemical.formula || '不明'}`;
        section.appendChild(formulaInfo);
        if (chemical.components && chemical.components.length) {
          const compInfo = document.createElement('p');
          compInfo.className = 'phys-hint';
          compInfo.textContent = '構成元素: ' + chemical.components.map(c => `${c.name}(${c.symbol})×${c.count}`).join(' / ');
          section.appendChild(compInfo);
        }
        if (chemical.molarMass) {
          const massInfo = document.createElement('p');
          massInfo.className = 'phys-hint';
          massInfo.textContent = `モル質量: ${chemical.molarMass.toFixed(2)} g/mol`;
          section.appendChild(massInfo);
        }
        if (chemical.hazardLabels && chemical.hazardLabels.length) {
          const hazardInfo = document.createElement('p');
          hazardInfo.className = 'phys-hint';
          hazardInfo.textContent = `性質: ${chemical.hazardLabels.join(' / ')}`;
          section.appendChild(hazardInfo);
        }
      }
      const damageInfo = document.createElement('p');
      damageInfo.className = 'phys-hint';
      damageInfo.textContent = `損耗度: ${(Math.min(body.damage || 0, 1) * 100).toFixed(0)}%`;
      section.appendChild(damageInfo);
      if ((body.reactionCooldown || 0) > 0) {
        const cooldownInfo = document.createElement('p');
        cooldownInfo.className = 'phys-hint';
        cooldownInfo.textContent = `化学反応クールダウン: ${body.reactionCooldown.toFixed(2)}s`;
        section.appendChild(cooldownInfo);
      }
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
        body.baseRestitution = body.restitution;
        body.baseFriction = body.friction;
        renderInspector();
      });

      const massLabel = document.createElement('label');
      massLabel.textContent = `質量 (推定 ${body.mass.toFixed(2)})`;
      const angleInfo = document.createElement('p');
      angleInfo.className = 'phys-hint';
      angleInfo.textContent = `角度 ${(normalizeAngle(body.angle || 0) * 180 / Math.PI).toFixed(1)}° / 角速度 ${(body.angularVelocity || 0).toFixed(2)}rad/s`;
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
        body.baseRestitution = body.restitution;
      });
      const fricLabel = document.createElement('label'); fricLabel.textContent = `摩擦 (${body.friction.toFixed(2)})`;
      const fricInput = document.createElement('input');
      fricInput.type = 'range'; fricInput.min = '0'; fricInput.max = '1'; fricInput.step = '0.05'; fricInput.value = String(body.friction);
      fricInput.addEventListener('input', () => {
        body.friction = Number(fricInput.value);
        fricLabel.textContent = `摩擦 (${body.friction.toFixed(2)})`;
        body.baseFriction = body.friction;
      });

      if (body.absoluteWall) {
        matSelect.disabled = true;
        staticInput.disabled = true;
        restInput.disabled = true;
        fricInput.disabled = true;
      }

      section.append(matLabel, matSelect, massLabel, angleInfo, staticToggle, restLabel, restInput, fricLabel, fricInput);

      if (body.absoluteWall) {
        const wallNote = document.createElement('p');
        wallNote.className = 'phys-hint';
        wallNote.textContent = '絶対壁は素材と物性が固定されています。サイズと位置のみ変更できます。';
        section.appendChild(wallNote);
      }

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

      if (emitter.kind === 'wind') {
        const dirLabel = document.createElement('label');
        const current = Math.round(emitter.direction ?? 0);
        dirLabel.textContent = `向き (${current}°)`;
        const dirInput = document.createElement('input');
        dirInput.type = 'range';
        dirInput.min = '0';
        dirInput.max = '359';
        dirInput.value = String(current);
        dirInput.addEventListener('input', () => {
          emitter.direction = Math.round(Number(dirInput.value) || 0);
          dirLabel.textContent = `向き (${emitter.direction}°)`;
        });
        section.append(dirLabel, dirInput);
      }

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
      const steps = Math.max(1, Math.floor(state.substeps || 1));
      const stepDt = dt / steps;
      for (let i=0;i<steps;i++){
        updateBodies(stepDt);
        updateEmitters(stepDt);
        updateParticles(stepDt);
        updateThermodynamics(stepDt);
        updateChemistry(stepDt);
        updateVines(stepDt);
        propagateCircuit(stepDt);
      }
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
        if (body.absoluteWall) {
          fill = '#111827';
        } else {
          const tempDiff = (body.temperature ?? state.ambientTemperature) - state.ambientTemperature;
          if (tempDiff > 5) fill = mixColor(fill, '#f97316', clamp(tempDiff/300, 0, 0.6));
          if (tempDiff < -5) fill = mixColor(fill, '#38bdf8', clamp(Math.abs(tempDiff)/200, 0, 0.5));
          if (body.burnTimer > 0) fill = mixColor(fill, '#f97316', clamp(body.burnTimer/12, 0, 1));
          if (body.wetness > 0) fill = mixColor(fill, '#60a5fa', clamp(body.wetness/6, 0, 0.8));
          if (body.freezeTimer > 0) fill = mixColor(fill, '#bfdbfe', clamp(body.freezeTimer/10, 0, 0.6));
          if (body.corrosion > 0) fill = mixColor(fill, '#bef264', clamp(body.corrosion/18, 0, 0.5));
          if (body.chargeTimer > 0) fill = mixColor(fill, '#facc15', clamp(body.chargeTimer/5, 0, 0.6));
          if (body.damage > 0) fill = mixColor(fill, '#f87171', clamp(body.damage, 0, 0.65));
          if (body.phase === 'gas') fill = mixColor(fill, '#e2e8f0', 0.2);
          if (body.phase === 'liquid') fill = mixColor(fill, '#3b82f6', 0.2);
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = body.absoluteWall ? 'rgba(148,163,184,0.6)' : (state.selection === body.id ? '#facc15' : 'rgba(15,23,42,0.8)');
        ctx.lineWidth = state.selection === body.id ? 3 : (body.absoluteWall ? 2.2 : 1.5);
        ctx.save();
        ctx.translate(body.x, body.y);
        if (body.shape === 'box') ctx.rotate(body.angle || 0);
        if (body.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, body.radius, 0, Math.PI*2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.rect(-body.width/2, -body.height/2, body.width, body.height);
          ctx.fill();
          ctx.stroke();
        }
        if (!body.absoluteWall) {
          ctx.save();
          ctx.strokeStyle = 'rgba(15,23,42,0.35)';
          ctx.lineWidth = 2;
          if (body.shape === 'circle') {
            ctx.rotate(body.angle || 0);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.max(body.radius - 8, 12), 0);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.max(body.width, body.height) * 0.5, 0);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, Math.min(body.width, body.height) * 0.4);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.fillStyle = 'rgba(15,23,42,0.4)';
          ctx.arc(0, 0, 3, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
        if (!body.absoluteWall) {
          const symbol = phaseSymbol(body.phase);
          if (symbol) {
            const prevAlign = ctx.textAlign;
            const prevBaseline = ctx.textBaseline;
            ctx.font = '11px "Segoe UI",sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(248,250,252,0.9)';
            ctx.fillText(symbol, body.x, body.y);
            ctx.textAlign = prevAlign;
            ctx.textBaseline = prevBaseline;
          }
        }
      });

      if (state.godFinger && state.godFinger.pointerX != null) {
        ctx.strokeStyle = 'rgba(250,204,21,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(state.godFinger.pointerX, state.godFinger.pointerY, 20, 0, Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(state.godFinger.pointerX - 6, state.godFinger.pointerY + 10);
        ctx.lineTo(state.godFinger.pointerX, state.godFinger.pointerY - 12);
        ctx.lineTo(state.godFinger.pointerX + 6, state.godFinger.pointerY + 10);
        ctx.stroke();
      }

      // emitters
      state.emitters.forEach(emitter => {
        const radius = emitter.kind === 'circuit' ? 12 : 10;
        const colors = {
          fire:'#f97316',
          water:'#3b82f6',
          ice:'#bae6fd',
          wind:'#38bdf8',
          vine:'#22c55e',
          lightning:'#eab308',
          acid:'#facc15',
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
        let radius = p.radius || 4;
        switch(p.type){
          case 'fire':
            ctx.fillStyle = flameColor(p.temperature ?? FIRE_BASE_TEMPERATURE);
            radius = Math.max(3, p.radius || 4);
            break;
          case 'water':
            ctx.fillStyle = waterColor(p.temperature ?? state.ambientTemperature);
            radius = Math.max(3, p.radius || FLUID_RADIUS);
            break;
          case 'vine':
            ctx.fillStyle = 'rgba(34,197,94,0.6)';
            break;
          case 'lightning':
            ctx.fillStyle = 'rgba(234,179,8,0.8)';
            break;
          case 'spark':
            ctx.fillStyle = 'rgba(103,232,249,0.8)';
            break;
          case 'ice':
            ctx.fillStyle = 'rgba(191,219,254,0.7)';
            radius = Math.max(3, p.radius || 4);
            break;
          case 'wind':
            ctx.fillStyle = 'rgba(56,189,248,0.35)';
            break;
          case 'acid':
            ctx.fillStyle = acidColor(p.temperature ?? state.ambientTemperature);
            radius = Math.max(3, p.radius || FLUID_RADIUS);
            break;
          case 'steam': {
            const alpha = clamp((p.temperature ?? 100) / 180, 0.2, 0.6);
            ctx.fillStyle = `rgba(226,232,240,${alpha})`;
            break;
          }
          default:
            ctx.fillStyle = 'rgba(226,232,240,0.6)';
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI*2); ctx.fill();
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
        solverIterations: state.solverIterations,
        substeps: state.substeps,
        ambientTemperature: state.ambientTemperature,
        boundaryMode: state.boundaryMode,
        bodies: state.bodies.map(b => deepClone(b)),
        emitters: state.emitters.map(e => deepClone(e)),
        vines: state.vines.map(v => deepClone(v))
      };
    }

    function applySnapshot(snap){
      if (!snap) return;
      state.gravity = Object.assign({ x:0, y:600 }, snap.gravity || {});
      state.airDrag = snap.airDrag ?? state.airDrag;
      state.solverIterations = Math.max(1, Math.floor(snap.solverIterations || state.solverIterations || 1));
      state.substeps = Math.max(1, Math.floor(snap.substeps || state.substeps || 1));
      state.ambientTemperature = typeof snap.ambientTemperature === 'number' ? snap.ambientTemperature : state.ambientTemperature;
      state.boundaryMode = snap.boundaryMode === 'void' ? 'void' : 'wall';
      state.bodies = (snap.bodies || []).map(b => {
        const copy = Object.assign({}, b);
        if (typeof copy.temperature !== 'number') {
          const mat = MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL];
          copy.temperature = mat?.baseTemperature ?? state.ambientTemperature;
        }
        if (typeof copy.heatCapacity !== 'number') copy.heatCapacity = (MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL])?.heatCapacity ?? 1;
        if (typeof copy.thermalConductivity !== 'number') copy.thermalConductivity = (MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL])?.thermalConductivity ?? 0.2;
        if (typeof copy.ignitionPoint !== 'number') copy.ignitionPoint = (MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL])?.ignitionPoint ?? 320;
        if (typeof copy.meltingPoint !== 'number') copy.meltingPoint = (MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL])?.meltingPoint ?? 800;
        if (typeof copy.baseTemperature !== 'number') copy.baseTemperature = (MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL])?.baseTemperature ?? state.ambientTemperature;
        if (typeof copy.boilingPoint !== 'number') copy.boilingPoint = (MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL])?.boilingPoint ?? ((copy.meltingPoint ?? 800) + 400);
        if (typeof copy.freezePoint !== 'number') copy.freezePoint = (MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL])?.freezePoint ?? Math.max(-120, (copy.meltingPoint ?? 800) - 200);
        copy.phase = copy.phase || 'solid';
        copy.absoluteWall = !!copy.absoluteWall;
        copy.damage = Math.max(0, Math.min(1, copy.damage || 0));
        copy.reactionCooldown = Math.max(0, copy.reactionCooldown || 0);
        if (typeof copy.baseRestitution !== 'number') {
          const mat = MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL];
          copy.baseRestitution = mat?.restitution ?? copy.restitution ?? 0.3;
        }
        if (typeof copy.baseFriction !== 'number') {
          const mat = MATERIALS[copy.material] || MATERIALS[DEFAULT_MATERIAL];
          copy.baseFriction = mat?.friction ?? copy.friction ?? 0.4;
        }
        if (copy.absoluteWall) copy.static = true;
        return copy;
      });
      state.bodies.forEach(body => applyMaterial(body, body.material));
      state.emitters = (snap.emitters || []).map(e => {
        const copy = Object.assign({}, e);
        copy.connections = Array.isArray(copy.connections) ? Array.from(copy.connections) : [];
        if (typeof copy.direction !== 'number') copy.direction = 270;
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
