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
             formula:'Fe', composition:{ Fe:1 }, hazards:['conductive'],
             reactivity:{
               acid:{ type:'acid-dissolution', energy:900, heat:90, spawnSteam:true, spawnIons:true, spawnDebris:true, structural:0.28, corrosion:0.8, cooldown:0.45 },
               spark:{ type:'thermite', energy:720, heat:360, spawnFire:true, spawnDebris:true, spawnIons:true, structural:0.4, cooldown:0.5 },
               lightning:{ type:'arc-melt', energy:1120, heat:640, spawnFire:true, spawnIons:true, spawnShockwave:true, structural:0.55, cooldown:0.8 }
             } },
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
             reactivity:{ water:{ type:'exothermic', energy:2200, heat:420, spawnSteam:true, spawnFire:true, spawnHydrogen:true, structural:0.45, consumeParticle:true, cooldown:0.35 } } },
    copper:{ id:'copper',label:'銅',      density:2.3, restitution:0.22, friction:0.45, color:'#b87333', flammability:0.0, conductivity:0.96,
             thermalConductivity:0.92, heatCapacity:0.39, ignitionPoint:1085, meltingPoint:1085, boilingPoint:2562, freezePoint:-120, baseTemperature:20,
             formula:'Cu', composition:{ Cu:1 }, hazards:['conductive'],
             reactivity:{
               acid:{ type:'acid-dissolution', energy:520, heat:70, spawnSteam:true, spawnIons:true, structural:0.18, corrosion:0.5, cooldown:0.6 },
               spark:{ type:'arc-splash', energy:460, heat:220, spawnFire:true, spawnDebris:true, spawnIons:true, structural:0.22, cooldown:0.55 }
             } },
    aluminum:{ id:'aluminum', label:'アルミ', density:1.4, restitution:0.3, friction:0.35, color:'#d4d4d8', flammability:0.0, conductivity:0.6,
               thermalConductivity:0.91, heatCapacity:0.9, ignitionPoint:660, meltingPoint:660, boilingPoint:2470, freezePoint:-120, baseTemperature:20,
               formula:'Al', composition:{ Al:1 }, hazards:['conductive'],
               reactivity:{
                 acid:{ type:'acid-dissolution', energy:780, heat:130, spawnSteam:true, spawnIons:true, structural:0.32, corrosion:0.7, cooldown:0.5 },
                 spark:{ type:'thermite', energy:980, heat:520, spawnFire:true, spawnDebris:true, spawnIons:true, structural:0.48, cooldown:0.65 }
               } },
    titanium:{ id:'titanium', label:'チタン', density:2.1, restitution:0.28, friction:0.42, color:'#9ba6b2', flammability:0.05, conductivity:0.35,
               thermalConductivity:0.22, heatCapacity:0.52, ignitionPoint:1668, meltingPoint:1668, boilingPoint:3287, freezePoint:-150, baseTemperature:20,
               formula:'Ti', composition:{ Ti:1 }, hazards:['conductive'],
               reactivity:{
                 acid:{ type:'acid-dissolution', energy:640, heat:120, spawnSteam:true, spawnIons:true, structural:0.32, corrosion:0.6, cooldown:0.65 },
                 fire:{ type:'surface-oxidation', energy:1400, heat:520, spawnFire:true, spawnDebris:true, spawnIons:true, structural:0.58, cooldown:0.7 },
                 lightning:{ type:'arc-melt', energy:1680, heat:700, spawnFire:true, spawnIons:true, spawnShockwave:true, structural:0.7, cooldown:0.9 }
               } },
    carbon:{ id:'carbon', label:'炭素素材', density:1.6, restitution:0.32, friction:0.55, color:'#334155', flammability:0.45, conductivity:0.4,
             thermalConductivity:0.6, heatCapacity:0.71, ignitionPoint:670, meltingPoint:3500, boilingPoint:4827, freezePoint:-180, baseTemperature:20,
             formula:'C', composition:{ C:1 }, hazards:['flammable'],
             reactivity:{
               fire:{ type:'combustion', energy:1100, heat:500, spawnFire:true, spawnDebris:true, spawnEmbers:true, structural:0.55, cooldown:0.6 },
               lightning:{ type:'plasma-arc', energy:820, heat:450, spawnFire:true, spawnIons:true, structural:0.45, cooldown:0.75 }
             } },
    quartz:{ id:'quartz', label:'石英',   density:1.3, restitution:0.22, friction:0.58, color:'#d1d5db', flammability:0.0, conductivity:0.08,
             thermalConductivity:0.35, heatCapacity:0.75, ignitionPoint:900, meltingPoint:1650, boilingPoint:2950, freezePoint:-150, baseTemperature:20,
             formula:'SiO2', composition:{ Si:1, O:2 }, hazards:['insulator'] },
    salt:  { id:'salt',  label:'岩塩',    density:1.15, restitution:0.18, friction:0.65, color:'#f1f5f9', flammability:0.0, conductivity:0.35,
             thermalConductivity:0.6, heatCapacity:0.86, ignitionPoint:801, meltingPoint:801, boilingPoint:1413, freezePoint:-120, baseTemperature:20,
             formula:'NaCl', composition:{ Na:1, Cl:1 }, hazards:['conductive'],
             reactivity:{
               water:{ type:'dissolution', energy:240, heat:15, spawnSteam:false, spawnIons:true, soak:0.6, structural:0.12, consumeParticle:false, cooldown:0.35 }
             } },
    acid:  { id:'acid',  label:'硫酸',    density:1.45, restitution:0.12, friction:0.4, color:'#fde68a', flammability:0.0, conductivity:0.55,
             thermalConductivity:0.39, heatCapacity:1.4, ignitionPoint:340, meltingPoint:10, boilingPoint:337, freezePoint:-30, baseTemperature:20,
             formula:'H2SO4', composition:{ H:2, S:1, O:4 }, hazards:['acidic','corrosive','aqueous'] },
    polymer:{ id:'polymer', label:'高分子', density:0.95, restitution:0.6, friction:0.55, color:'#0ea5e9', flammability:0.35, conductivity:0.08,
              thermalConductivity:0.24, heatCapacity:1.6, ignitionPoint:420, meltingPoint:260, boilingPoint:540, freezePoint:-60, baseTemperature:20,
              formula:'C2H4', composition:{ C:2, H:4 }, hazards:['elastic','flammable'] },
    graphene:{ id:'graphene', label:'グラフェン', density:0.22, restitution:0.65, friction:0.35, color:'#1e293b', flammability:0.6, conductivity:0.85,
               thermalConductivity:4.5, heatCapacity:0.72, ignitionPoint:480, meltingPoint:3650, boilingPoint:4200, freezePoint:-200, baseTemperature:20,
               formula:'C', composition:{ C:1 }, hazards:['conductive','flammable'],
               reactivity:{
                 fire:{ type:'rapid-combustion', energy:1350, heat:680, spawnFire:true, spawnDebris:true, spawnEmbers:true, spawnIons:true, structural:0.62, cooldown:0.7 },
                 acid:{ type:'oxidative-etch', energy:520, heat:110, spawnSteam:true, spawnIons:true, structural:0.3, corrosion:0.85, cooldown:0.6 },
                 lightning:{ type:'graphitic-arc', energy:940, heat:580, spawnFire:true, spawnIons:true, spawnShockwave:true, structural:0.68, cooldown:0.85 }
               } },
    ceramic:{ id:'ceramic', label:'耐火セラミック', density:1.8, restitution:0.16, friction:0.72, color:'#e2e8f0', flammability:0.0, conductivity:0.04,
              thermalConductivity:0.19, heatCapacity:0.88, ignitionPoint:1500, meltingPoint:1800, boilingPoint:3200, freezePoint:-160, baseTemperature:20,
              formula:'Al2O3', composition:{ Al:2, O:3 }, hazards:['refractory','insulator'],
              reactivity:{
                acid:{ type:'etching', energy:380, heat:40, spawnSteam:true, spawnIons:true, structural:0.18, corrosion:0.55, cooldown:0.6 },
                fire:{ type:'heat-soak', energy:280, heat:220, spawnFire:false, spawnDebris:false, structural:0.08, cooldown:0.4 }
              } },
    'liquid-nitrogen':{ id:'liquid-nitrogen', label:'液体窒素', density:0.8, restitution:0.02, friction:0.05, color:'#67e8f9', flammability:0.0, conductivity:0.12,
                        thermalConductivity:0.1, heatCapacity:1.04, ignitionPoint:-196, meltingPoint:-210, boilingPoint:-196, freezePoint:-210, baseTemperature:-196,
                        formula:'N2(l)', composition:{ N:2 }, hazards:['cryogenic','inert'],
                        reactivity:{
                          fire:{ type:'cryogenic-quench', energy:420, heat:-260, spawnSteam:true, spawnFrost:true, freeze:0.6, soak:0.3, structural:0.18, cooldown:0.5 },
                          lightning:{ type:'ion-quench', energy:520, heat:-180, spawnFrost:true, spawnIons:true, structural:0.22, cooldown:0.6 }
                        } },
    nitroglycerin:{ id:'nitroglycerin', label:'ニトログリセリン', density:1.6, restitution:0.05, friction:0.4, color:'#f87171', flammability:1.0, conductivity:0.02,
                    thermalConductivity:0.18, heatCapacity:1.2, ignitionPoint:210, meltingPoint:13, boilingPoint:200, freezePoint:-10, baseTemperature:18,
                    formula:'C3H5N3O9', composition:{ C:3, H:5, N:3, O:9 }, hazards:['explosive','flammable'],
                    reactivity:{
                      fire:{ type:'detonation', energy:6800, heat:1600, spawnFire:true, spawnShockwave:true, spawnDebris:true, spawnIons:true, structural:1.3, cooldown:1.2 },
                      spark:{ type:'detonation', energy:6200, heat:1400, spawnFire:true, spawnShockwave:true, spawnDebris:true, spawnIons:true, structural:1.25, cooldown:1.0 },
                      lightning:{ type:'detonation', energy:7500, heat:1800, spawnFire:true, spawnShockwave:true, spawnDebris:true, spawnIons:true, structural:1.4, cooldown:1.4 }
                    } },
  };
  const PERIODIC_TABLE = {
    H:  { symbol:'H',  name:'水素',    atomicNumber:1,  atomicMass:1.008,  category:'非金属',        standardState:'gas',   density:0.000089, color:'#facc15', flammability:1.0, electricalConductivity:0.0, thermalConductivity:0.18, heatCapacity:14.3, meltingPoint:-259, boilingPoint:-253, freezePoint:-259, ignitionPoint:500, hazards:['flammable'] },
    He: { symbol:'He', name:'ヘリウム', atomicNumber:2,  atomicMass:4.0026, category:'希ガス',        standardState:'gas',   density:0.00018, color:'#a5b4fc', flammability:0, electricalConductivity:0, thermalConductivity:0.15, heatCapacity:5.19, meltingPoint:-272, boilingPoint:-269, freezePoint:-272, ignitionPoint:Infinity, hazards:['inert'] },
    C:  { symbol:'C',  name:'炭素',    atomicNumber:6,  atomicMass:12.011, category:'非金属',        standardState:'solid', density:2.2,     color:'#1f2937', flammability:0.4, electricalConductivity:0.4, thermalConductivity:1.2, heatCapacity:0.71, meltingPoint:3550, boilingPoint:4827, freezePoint:-190, ignitionPoint:670, hazards:['flammable'] },
    N:  { symbol:'N',  name:'窒素',    atomicNumber:7,  atomicMass:14.007, category:'非金属',        standardState:'gas',   density:0.00125, color:'#60a5fa', flammability:0, electricalConductivity:0, thermalConductivity:0.026, heatCapacity:1.04, meltingPoint:-210, boilingPoint:-196, freezePoint:-210, ignitionPoint:Infinity, hazards:['inert'] },
    O:  { symbol:'O',  name:'酸素',    atomicNumber:8,  atomicMass:15.999, category:'非金属',        standardState:'gas',   density:0.00143, color:'#93c5fd', flammability:0, electricalConductivity:0, thermalConductivity:0.026, heatCapacity:0.92, meltingPoint:-219, boilingPoint:-183, freezePoint:-219, ignitionPoint:Infinity, hazards:['oxidizer'] },
    F:  { symbol:'F',  name:'フッ素',  atomicNumber:9,  atomicMass:18.998, category:'ハロゲン',      standardState:'gas',   density:0.0017,  color:'#bef264', flammability:0, electricalConductivity:0, thermalConductivity:0.027, heatCapacity:0.824, meltingPoint:-220, boilingPoint:-188, freezePoint:-220, ignitionPoint:0, hazards:['toxic','corrosive'] },
    Na: { symbol:'Na', name:'ナトリウム', atomicNumber:11, atomicMass:22.99,  category:'アルカリ金属',  standardState:'solid', density:0.97,    color:'#f4f4f5', flammability:0.95, electricalConductivity:0.8, thermalConductivity:1.4, heatCapacity:1.23, meltingPoint:98, boilingPoint:883, freezePoint:0, ignitionPoint:90, hazards:['alkali-metal','water-reactive','conductive'] },
    Mg: { symbol:'Mg', name:'マグネシウム', atomicNumber:12, atomicMass:24.305, category:'アルカリ土類', standardState:'solid', density:1.74, color:'#cbd5f5', flammability:0.9, electricalConductivity:0.39, thermalConductivity:1.56, heatCapacity:1.02, meltingPoint:650, boilingPoint:1091, freezePoint:-120, ignitionPoint:473, hazards:['flammable','conductive'] },
    Al: { symbol:'Al', name:'アルミニウム', atomicNumber:13, atomicMass:26.982, category:'遷移前金属',    standardState:'solid', density:2.7,  color:'#d4d4d8', flammability:0.1, electricalConductivity:0.61, thermalConductivity:2.37, heatCapacity:0.9, meltingPoint:660, boilingPoint:2470, freezePoint:-120, ignitionPoint:600, hazards:['conductive'] },
    Si: { symbol:'Si', name:'ケイ素',  atomicNumber:14, atomicMass:28.085, category:'半金属',        standardState:'solid', density:2.33, color:'#cbd5f5', flammability:0, electricalConductivity:0.02, thermalConductivity:1.48, heatCapacity:0.71, meltingPoint:1414, boilingPoint:3265, freezePoint:-160, ignitionPoint:900, hazards:['insulator'] },
    P:  { symbol:'P',  name:'リン',    atomicNumber:15, atomicMass:30.974, category:'非金属',        standardState:'solid', density:1.82, color:'#fef08a', flammability:0.9, electricalConductivity:0, thermalConductivity:0.235, heatCapacity:0.77, meltingPoint:44, boilingPoint:280, freezePoint:-20, ignitionPoint:30, hazards:['flammable','toxic'] },
    S:  { symbol:'S',  name:'硫黄',    atomicNumber:16, atomicMass:32.06,  category:'非金属',        standardState:'solid', density:2.07, color:'#facc15', flammability:0.6, electricalConductivity:0, thermalConductivity:0.205, heatCapacity:0.71, meltingPoint:115, boilingPoint:445, freezePoint:-30, ignitionPoint:232, hazards:['flammable'] },
    Cl: { symbol:'Cl', name:'塩素',    atomicNumber:17, atomicMass:35.45,  category:'ハロゲン',      standardState:'gas',   density:0.0032, color:'#fcd34d', flammability:0, electricalConductivity:0, thermalConductivity:0.009, heatCapacity:0.48, meltingPoint:-101, boilingPoint:-34, freezePoint:-101, ignitionPoint:0, hazards:['toxic','corrosive','oxidizer'] },
    K:  { symbol:'K',  name:'カリウム', atomicNumber:19, atomicMass:39.098, category:'アルカリ金属',  standardState:'solid', density:0.86, color:'#fbbf24', flammability:0.95, electricalConductivity:0.72, thermalConductivity:1.02, heatCapacity:0.75, meltingPoint:64, boilingPoint:759, freezePoint:-20, ignitionPoint:60, hazards:['alkali-metal','water-reactive','conductive'] },
    Ca: { symbol:'Ca', name:'カルシウム', atomicNumber:20, atomicMass:40.078, category:'アルカリ土類', standardState:'solid', density:1.55, color:'#e2e8f0', flammability:0.4, electricalConductivity:0.29, thermalConductivity:2.01, heatCapacity:0.65, meltingPoint:842, boilingPoint:1484, freezePoint:-40, ignitionPoint:550, hazards:['water-reactive','conductive'] },
    Ti: { symbol:'Ti', name:'チタン',  atomicNumber:22, atomicMass:47.867, category:'遷移金属',      standardState:'solid', density:4.51, color:'#9ba6b2', flammability:0.05, electricalConductivity:0.33, thermalConductivity:0.22, heatCapacity:0.52, meltingPoint:1668, boilingPoint:3287, freezePoint:-150, ignitionPoint:760, hazards:['conductive'] },
    Fe: { symbol:'Fe', name:'鉄',      atomicNumber:26, atomicMass:55.845, category:'遷移金属',      standardState:'solid', density:7.87, color:'#9aa0a6', flammability:0.05, electricalConductivity:1.0, thermalConductivity:0.8, heatCapacity:0.45, meltingPoint:1538, boilingPoint:2861, freezePoint:-120, ignitionPoint:700, hazards:['conductive'] },
    Cu: { symbol:'Cu', name:'銅',      atomicNumber:29, atomicMass:63.546, category:'遷移金属',      standardState:'solid', density:8.96, color:'#b87333', flammability:0, electricalConductivity:1.0, thermalConductivity:4.01, heatCapacity:0.38, meltingPoint:1085, boilingPoint:2562, freezePoint:-180, ignitionPoint:1085, hazards:['conductive'] },
    Zn: { symbol:'Zn', name:'亜鉛',    atomicNumber:30, atomicMass:65.38,  category:'遷移金属',      standardState:'solid', density:7.14, color:'#d1d5db', flammability:0.05, electricalConductivity:0.29, thermalConductivity:1.16, heatCapacity:0.39, meltingPoint:420, boilingPoint:907, freezePoint:-120, ignitionPoint:450, hazards:['conductive'] },
    Ag: { symbol:'Ag', name:'銀',      atomicNumber:47, atomicMass:107.868, category:'遷移金属',     standardState:'solid', density:10.49, color:'#f8fafc', flammability:0, electricalConductivity:1.0, thermalConductivity:4.29, heatCapacity:0.24, meltingPoint:962, boilingPoint:2162, freezePoint:-200, ignitionPoint:962, hazards:['conductive'] },
    Au: { symbol:'Au', name:'金',      atomicNumber:79, atomicMass:196.967, category:'遷移金属',     standardState:'solid', density:19.3, color:'#fbbf24', flammability:0, electricalConductivity:0.73, thermalConductivity:3.17, heatCapacity:0.13, meltingPoint:1064, boilingPoint:2700, freezePoint:-200, ignitionPoint:1064, hazards:['conductive'] },
    Pb: { symbol:'Pb', name:'鉛',      atomicNumber:82, atomicMass:207.2,  category:'後遷移金属',    standardState:'solid', density:11.34, color:'#9ca3af', flammability:0, electricalConductivity:0.48, thermalConductivity:0.35, heatCapacity:0.13, meltingPoint:327, boilingPoint:1749, freezePoint:-120, ignitionPoint:600, hazards:['toxic','conductive'] }
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
    'water-reactive':'水と激しく反応',
    acidic:'酸性',
    corrosive:'腐食性',
    toxic:'有毒',
    inert:'不活性',
    oxidizer:'助燃性',
    explosive:'爆発性',
    cryogenic:'超低温',
    refractory:'耐火性',
    catalytic:'触媒性'
  };
  const DEFAULT_MATERIAL = 'wood';
  const WIND_FIELD_RANGE = 320;
  const WIND_FIELD_DECAY = 0.0028;
  const CLOTH_SOLVER_ITERATIONS = 4;
  const CLOTH_NODE_MASS = 0.4;
  const CLOTH_DEFAULT_SPACING = 18;
  const DAMAGE_RECOVERY_RATE = 3.5;
  const WIND_GUST_INTERVAL = { min:0.9, max:2.6 };
  const WIND_GUST_BASE_STRENGTH = 180;
  const WIND_GUST_TURBULENCE = 0.32;
  const STRESS_RELAX_RATE = 42;
  const STRAIN_RELAX_RATE = 0.22;
  const HEAT_FLUX_RELAX_RATE = 18;

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
    { id:'add-cloth', label:'布', title:'布のソフトボディを追加' },
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

  function seededRandom(seed, step){
    const x = Math.sin((seed + step * 9973.9281) * 43758.5453);
    return x - Math.floor(x);
  }

  function tintToRgba(hex, alpha){
    if (!hex) return `rgba(103,232,249,${clamp(alpha,0,1)})`;
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r},${g},${b},${clamp(alpha,0,1)})`;
  }

  function sortedPeriodicElements(){
    return Object.values(PERIODIC_TABLE).slice().sort((a, b) => {
      if (a.atomicNumber === b.atomicNumber) return a.symbol.localeCompare(b.symbol);
      return a.atomicNumber - b.atomicNumber;
    });
  }

  function sanitizeComponentList(list){
    if (!Array.isArray(list)) return [];
    return list
      .map(entry => ({
        symbol: entry.symbol,
        count: clamp(Math.round(entry.count || 0), 1, 256)
      }))
      .filter(entry => !!PERIODIC_TABLE[entry.symbol])
      .map(entry => Object.assign({ atomicNumber: PERIODIC_TABLE[entry.symbol]?.atomicNumber || 999 }, entry))
      .sort((a, b) => {
        if (a.atomicNumber === b.atomicNumber) return a.symbol.localeCompare(b.symbol);
        return a.atomicNumber - b.atomicNumber;
      });
  }

  function compositionFromComponents(components){
    const composition = {};
    for (const comp of components){
      composition[comp.symbol] = (composition[comp.symbol] || 0) + comp.count;
    }
    return composition;
  }

  function chemicalFormulaFromComponents(components){
    if (!components || !components.length) return '';
    return components.map(comp => `${comp.symbol}${comp.count > 1 ? comp.count : ''}`).join('');
  }

  function molarMassFromComponents(components){
    let total = 0;
    for (const comp of components){
      const element = PERIODIC_TABLE[comp.symbol];
      if (!element) continue;
      total += element.atomicMass * (comp.count || 0);
    }
    return total;
  }

  function averageElementProperty(components, key, fallback){
    let total = 0;
    let weight = 0;
    for (const comp of components){
      const element = PERIODIC_TABLE[comp.symbol];
      if (!element) continue;
      const value = element[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        total += value * (comp.count || 0);
        weight += (comp.count || 0);
      }
    }
    if (weight <= 0) return fallback;
    return total / weight;
  }

  function inferHazardsFromComponents(components){
    const result = new Set();
    for (const comp of components){
      const element = PERIODIC_TABLE[comp.symbol];
      if (!element) continue;
      if (Array.isArray(element.hazards)) {
        element.hazards.forEach(id => result.add(id));
      }
      if (typeof element.flammability === 'number' && element.flammability > 0.6) result.add('flammable');
      if ((element.electricalConductivity || 0) > 0.4) result.add('conductive');
    }
    return result;
  }

  function finiteOr(value, fallback){
    return Number.isFinite(value) ? value : fallback;
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
    const prevTemp = body.temperature ?? state.ambientTemperature;
    const maxTemp = (body.meltingPoint ?? 1200) + 600;
    const nextTemp = clamp(prevTemp + delta, -200, maxTemp);
    body.temperature = nextTemp;
    const applied = nextTemp - prevTemp;
    body.heatFlux = Math.max(Math.abs(applied) * 8, body.heatFlux || 0);
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
      windGusts:[],
      windGustTimer:0,
      cloths:[],
      vines:[],
      fractureQueue:[],
      customMaterials:new Map(),
      chemicalDrafts:new Map(),
      selection:null,
      selectionKind:null,
      selectionNodeIndex:null,
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
        integrity:1,
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
        chemical:null,
        customMaterial:null,
        baseWidth: params?.width ?? 80,
        baseHeight: params?.height ?? 80,
        baseRadius: params?.radius ?? 40,
        deformScaleX:1,
        deformScaleY:1,
        deformScaleR:1,
        deformTimer:0,
        fractureThreshold: params?.fractureThreshold ?? 140,
        fragmentCount:0,
        stress:0,
        strain:0,
        heatFlux:0,
        crackSeed: Math.random()
      });
      if (kind === 'circle') {
        body.radius = clamp(body.radius, 8, 160);
        body.baseRadius = body.radius;
      } else {
        body.width = clamp(body.width, 20, 240);
        body.height = clamp(body.height, 20, 240);
        body.baseWidth = body.width;
        body.baseHeight = body.height;
      }
      const matForThreshold = MATERIALS[body.material] || MATERIALS[DEFAULT_MATERIAL];
      const densityFactor = matForThreshold?.density ?? 1;
      const elasticityFactor = 1.5 - (matForThreshold?.restitution ?? 0.3);
      body.fractureThreshold = Math.max(60, (120 + densityFactor * 180) * elasticityFactor);
      applyMaterial(body, body.material);
      state.bodies.push(body);
      selectObject(body, 'body');
      renderInspector();
      gainXp(10, { reason:'add-body' });
      return body;
    }

    function createFragmentBody(shape, params, source){
      const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;
      const body = {
        id,
        kind:'body',
        shape,
        x: params?.x ?? source?.x ?? state.bounds.width/2,
        y: params?.y ?? source?.y ?? state.bounds.height/2,
        vx: params?.vx ?? source?.vx ?? 0,
        vy: params?.vy ?? source?.vy ?? 0,
        width: shape === 'box' ? clamp(params?.width ?? (source?.width ?? 80), 12, 220) : undefined,
        height: shape === 'box' ? clamp(params?.height ?? (source?.height ?? 80), 12, 220) : undefined,
        radius: shape === 'circle' ? clamp(params?.radius ?? (source?.radius ?? 40), 8, 160) : undefined,
        static:false,
        absoluteWall:false,
        phase: source?.phase || 'solid',
        material: params?.material || source?.material || DEFAULT_MATERIAL,
        mass:1,
        invMass:1,
        inertia:1,
        invInertia:1,
        boundingRadius: params?.radius ?? source?.boundingRadius ?? 40,
        angle: params?.angle ?? (source?.angle || 0),
        angularVelocity: params?.angularVelocity ?? (source?.angularVelocity || 0),
        torque:0,
        restitution: clamp(params?.restitution ?? source?.restitution ?? 0.3, 0, 1),
        friction: clamp(params?.friction ?? source?.friction ?? 0.4, 0, 1),
        color: params?.color || source?.color || '#94a3b8',
        burnTimer: Math.max(0, (source?.burnTimer || 0) * 0.6),
        wetness: Math.max(0, (source?.wetness || 0) * 0.6),
        vineGrip:0,
        chargeTimer:0,
        damage: clamp((source?.damage || 0) * 0.4, 0, 1),
        integrity: clamp((source?.integrity ?? 1) + 0.25, 0, 1),
        reactionCooldown:0,
        freezeTimer: Math.max(0, (source?.freezeTimer || 0) * 0.5),
        corrosion: Math.max(0, (source?.corrosion || 0) * 0.4),
        temperature: source?.temperature ?? state.ambientTemperature,
        heatCapacity: source?.heatCapacity ?? 1,
        thermalConductivity: source?.thermalConductivity ?? 0.2,
        ignitionPoint: source?.ignitionPoint ?? 320,
        meltingPoint: source?.meltingPoint ?? 800,
        boilingPoint: source?.boilingPoint,
        freezePoint: source?.freezePoint,
        baseTemperature: source?.baseTemperature ?? state.ambientTemperature,
        baseRestitution: clamp(params?.restitution ?? source?.baseRestitution ?? 0.3, 0, 1),
        baseFriction: clamp(params?.friction ?? source?.baseFriction ?? 0.4, 0, 1),
        chemical:null,
        customMaterial: source?.customMaterial ? deepClone(source.customMaterial) : null,
        baseWidth: shape === 'box' ? clamp(params?.width ?? (source?.width ?? 80), 12, 220) : undefined,
        baseHeight: shape === 'box' ? clamp(params?.height ?? (source?.height ?? 80), 12, 220) : undefined,
        baseRadius: shape === 'circle' ? clamp(params?.radius ?? (source?.radius ?? 40), 8, 160) : undefined,
        deformScaleX:1,
        deformScaleY:1,
        deformScaleR:1,
        deformTimer:0,
        fractureThreshold: source?.fractureThreshold ?? 140,
        fragmentCount: Math.min((source?.fragmentCount || 0) + 1, 6),
        pendingFracture:false,
        stress: Math.max(0, (source?.stress || 0) * 0.6),
        strain: Math.max(0, (source?.strain || 0) * 0.5),
        heatFlux: Math.max(0, (source?.heatFlux || 0) * 0.6),
        crackSeed: Math.random()
      };
      applyMaterial(body, body.material);
      body.baseRestitution = body.restitution;
      body.baseFriction = body.friction;
      commitBodyDimensions(body);
      state.bodies.push(body);
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

    function createClothConstraint(a, b, restLength, stiffness, type){
      return { a, b, restLength, stiffness, type, broken:false };
    }

    function spawnCloth(params){
      const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
      const cols = clamp(Math.round(params?.cols ?? 14), 3, 40);
      const rows = clamp(Math.round(params?.rows ?? 10), 3, 40);
      const spacing = clamp(params?.spacing ?? CLOTH_DEFAULT_SPACING, 10, 48);
      const baseX = (params?.x ?? state.bounds.width/2) - (cols - 1) * spacing / 2;
      const baseY = params?.y ?? Math.max(40, state.bounds.height * 0.15);
      const structuralStiffness = clamp(params?.structuralStiffness ?? 0.72, 0.2, 1.5);
      const shearStiffness = clamp(params?.shearStiffness ?? 0.65, 0.1, 1.2);
      const bendStiffness = clamp(params?.bendStiffness ?? 0.4, 0.05, 1);
      const damping = clamp(params?.damping ?? 0.92, 0.6, 0.999);
      const tearFactor = clamp(params?.tearFactor ?? 1.8, 1.05, 3.5);
      const windInfluence = clamp(params?.windInfluence ?? 0.85, 0, 3);
      const color = params?.color || '#cbd5f5';

      const cloth = {
        id,
        cols,
        rows,
        spacing,
        structuralStiffness,
        shearStiffness,
        bendStiffness,
        damping,
        tearFactor,
        windInfluence,
        color,
        nodes:[],
        constraints:[],
        integrity:1,
        heat:0,
        fatigue:0,
        avgStrain:0,
        maxStrain:0,
        pinned:'top'
      };

      for (let r=0;r<rows;r++){
        for (let c=0;c<cols;c++){
          const x = baseX + c * spacing;
          const y = baseY + r * spacing;
          cloth.nodes.push({
            x,
            y,
            prevX:x,
            prevY:y,
            vx:0,
            vy:0,
            mass:CLOTH_NODE_MASS,
            pinned: r === 0,
            temperature: state.ambientTemperature,
            damage:0
          });
        }
      }

      buildClothConstraints(cloth);

      state.cloths.push(cloth);
      selectObject(cloth, 'cloth');
      renderInspector();
      gainXp(12, { reason:'add-cloth' });
      return cloth;
    }

    function buildClothConstraints(cloth){
      cloth.constraints = cloth.constraints || [];
      cloth.constraints.length = 0;
      const index = (c,r) => r * cloth.cols + c;
      for (let r=0;r<cloth.rows;r++){
        for (let c=0;c<cloth.cols;c++){
          if (c < cloth.cols-1) cloth.constraints.push(createClothConstraint(index(c,r), index(c+1,r), cloth.spacing, cloth.structuralStiffness, 'structural'));
          if (r < cloth.rows-1) cloth.constraints.push(createClothConstraint(index(c,r), index(c,r+1), cloth.spacing, cloth.structuralStiffness, 'structural'));
          if (c < cloth.cols-1 && r < cloth.rows-1) {
            const diag = Math.sqrt(2) * cloth.spacing;
            cloth.constraints.push(createClothConstraint(index(c,r), index(c+1,r+1), diag, cloth.shearStiffness, 'shear'));
            cloth.constraints.push(createClothConstraint(index(c+1,r), index(c,r+1), diag, cloth.shearStiffness, 'shear'));
          }
          if (c < cloth.cols-2) cloth.constraints.push(createClothConstraint(index(c,r), index(c+2,r), cloth.spacing*2, cloth.bendStiffness, 'bend'));
          if (r < cloth.rows-2) cloth.constraints.push(createClothConstraint(index(c,r), index(c,r+2), cloth.spacing*2, cloth.bendStiffness, 'bend'));
        }
      }
    }

    function hydrateCloth(data){
      if (!data) return null;
      const cols = clamp(Math.round(data.cols || 10), 3, 40);
      const rows = clamp(Math.round(data.rows || 8), 3, 40);
      const spacing = clamp(data.spacing ?? CLOTH_DEFAULT_SPACING, 10, 48);
      const cloth = {
        id: data.id || `c${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`,
        cols,
        rows,
        spacing,
        structuralStiffness: clamp(data.structuralStiffness ?? 0.72, 0.2, 1.8),
        shearStiffness: clamp(data.shearStiffness ?? 0.65, 0.1, 1.5),
        bendStiffness: clamp(data.bendStiffness ?? 0.4, 0.05, 1.2),
        damping: clamp(data.damping ?? 0.92, 0.6, 0.999),
        tearFactor: clamp(data.tearFactor ?? 1.8, 1.05, 4),
        windInfluence: clamp(data.windInfluence ?? 0.85, 0, 3),
        color: data.color || '#cbd5f5',
        nodes:[],
        constraints:[],
        integrity: clamp(data.integrity ?? 1, 0, 1),
        heat: data.heat ?? 0,
        fatigue: clamp(data.fatigue ?? 0, 0, 12),
        avgStrain: clamp(data.avgStrain ?? 0, 0, 4),
        maxStrain: clamp(data.maxStrain ?? 0, 0, 4),
        pinned:data.pinned || 'custom'
      };
      const nodeCount = cols * rows;
      const savedNodes = Array.isArray(data.nodes) && data.nodes.length === nodeCount ? data.nodes : null;
      if (savedNodes) {
        savedNodes.forEach(n => {
          const x = Number(n.x) || state.bounds.width/2;
          const y = Number(n.y) || state.bounds.height/3;
          cloth.nodes.push({
            x,
            y,
            prevX: Number.isFinite(n.prevX) ? n.prevX : x,
            prevY: Number.isFinite(n.prevY) ? n.prevY : y,
            vx: Number(n.vx) || 0,
            vy: Number(n.vy) || 0,
            mass: CLOTH_NODE_MASS,
            pinned: !!n.pinned,
            temperature: typeof n.temperature === 'number' ? n.temperature : state.ambientTemperature,
            damage: clamp(n.damage ?? 0, 0, 1)
          });
        });
      } else {
        const baseX = (data.origin?.x ?? state.bounds.width/2) - (cols - 1) * spacing / 2;
        const baseY = data.origin?.y ?? Math.max(40, state.bounds.height * 0.2);
        for (let r=0;r<rows;r++){
          for (let c=0;c<cols;c++){
            const x = baseX + c * spacing;
            const y = baseY + r * spacing;
            cloth.nodes.push({
              x,
              y,
              prevX:x,
              prevY:y,
              vx:0,
              vy:0,
              mass:CLOTH_NODE_MASS,
              pinned: r === 0,
              temperature: state.ambientTemperature,
              damage:0
            });
          }
        }
      }
      buildClothConstraints(cloth);
      if (Array.isArray(data.constraints) && data.constraints.length === cloth.constraints.length) {
        cloth.constraints.forEach((c, idx) => {
          const src = data.constraints[idx];
          if (!src) return;
          c.restLength = Number(src.restLength) || c.restLength;
          c.stiffness = Number(src.stiffness) || c.stiffness;
          c.type = src.type || c.type;
          c.broken = !!src.broken;
        });
      }
      return cloth;
    }

    function commitBodyDimensions(body){
      if (!body) return;
      if (body.shape === 'circle') {
        body.baseRadius = Math.max(6, body.radius || body.baseRadius || 20);
      } else {
        body.baseWidth = Math.max(12, body.width || body.baseWidth || 20);
        body.baseHeight = Math.max(12, body.height || body.baseHeight || 20);
      }
      updateBodyMassProperties(body);
    }

    function spawnWindGust(options){
      const gust = {
        id: `w${Math.random().toString(36).slice(2,7)}`,
        x: clamp(options?.x ?? (state.bounds.width * (0.2 + Math.random() * 0.6)), 0, state.bounds.width),
        y: clamp(options?.y ?? (state.bounds.height * (0.2 + Math.random() * 0.6)), 0, state.bounds.height),
        direction: options?.direction ?? 270,
        strength: options?.strength ?? (WIND_GUST_BASE_STRENGTH * (0.6 + Math.random() * 0.9)),
        radius: clamp(options?.radius ?? (140 + Math.random() * 160), 80, 420),
        life: options?.life ?? (1.2 + Math.random() * 1.4),
        maxLife: options?.life ?? (1.2 + Math.random() * 1.4),
        turbulence: options?.turbulence ?? (0.18 + Math.random() * WIND_GUST_TURBULENCE),
        phase: Math.random() * Math.PI * 2,
        age:0,
        trailTimer:0
      };
      state.windGusts.push(gust);
      return gust;
    }

    function updateWindGusts(dt){
      for (let i=state.windGusts.length-1;i>=0;i--){
        const gust = state.windGusts[i];
        gust.age += dt;
        gust.life -= dt;
        const dirRad = (gust.direction * Math.PI) / 180;
        const drift = gust.strength * 0.04;
        gust.x += Math.cos(dirRad) * drift * dt;
        gust.y += Math.sin(dirRad) * drift * dt;
        gust.radius = clamp(gust.radius * (1 + 0.12 * dt), 60, 480);
        gust.trailTimer = (gust.trailTimer || 0) - dt;
        if (gust.trailTimer <= 0) {
          spawnParticle('wind', gust.x, gust.y, {
            power: clamp(gust.strength / WIND_GUST_BASE_STRENGTH, 0.4, 1.8),
            direction: gust.direction + Math.sin(gust.phase + gust.age * 6) * 16,
            life: 0.7
          });
          gust.trailTimer = 0.18 + Math.random() * 0.12;
        }
        if (gust.life <= 0 || gust.x < -120 || gust.x > state.bounds.width + 120 || gust.y < -120 || gust.y > state.bounds.height + 120) {
          state.windGusts.splice(i,1);
        }
      }
      const windEmitters = state.emitters.filter(e => e.kind === 'wind' && e.enabled);
      const hasWindParticles = state.particles.some(p => p.type === 'wind');
      if (windEmitters.length || hasWindParticles) {
        state.windGustTimer -= dt;
        if (state.windGustTimer <= 0) {
          const source = windEmitters.length ? windEmitters[Math.floor(Math.random() * windEmitters.length)] : null;
          spawnWindGust({
            x: source ? source.x + (Math.random()-0.5) * 60 : undefined,
            y: source ? source.y + (Math.random()-0.5) * 40 : undefined,
            direction: source ? (source.direction ?? 270) : (hasWindParticles ? 270 : Math.random()*360),
            strength: (source ? (source.power || 1) : 1) * WIND_GUST_BASE_STRENGTH * (0.7 + Math.random() * 0.9),
            radius: 150 + Math.random() * 160,
            life: 1.1 + Math.random() * 1.4
          });
          state.windGustTimer = WIND_GUST_INTERVAL.min + Math.random() * (WIND_GUST_INTERVAL.max - WIND_GUST_INTERVAL.min);
        }
      } else {
        state.windGustTimer = Math.max(state.windGustTimer, WIND_GUST_INTERVAL.min * 0.5);
      }
    }

    function sampleWindField(x, y){
      let vx = 0;
      let vy = 0;
      for (const emitter of state.emitters){
        if (emitter.kind !== 'wind' || !emitter.enabled) continue;
        const dx = x - emitter.x;
        const dy = y - emitter.y;
        const range = WIND_FIELD_RANGE * (0.6 + (emitter.power || 1) * 0.4);
        const distSq = dx*dx + dy*dy;
        if (distSq > range * range) continue;
        const dist = Math.sqrt(distSq) || 1;
        const falloff = Math.exp(-dist * WIND_FIELD_DECAY);
        const ang = ((emitter.direction ?? 0) * Math.PI) / 180;
        vx += Math.cos(ang) * 220 * (emitter.power || 1) * falloff;
        vy += Math.sin(ang) * 220 * (emitter.power || 1) * falloff;
      }
      for (const gust of state.windGusts){
        const dx = x - gust.x;
        const dy = y - gust.y;
        const distSq = dx*dx + dy*dy;
        const radius = gust.radius || 160;
        if (distSq > radius * radius) continue;
        const dist = Math.sqrt(distSq) || 1;
        const falloff = Math.max(0, 1 - dist / radius);
        const dirRad = (gust.direction * Math.PI) / 180;
        const base = gust.strength * falloff;
        const swirl = Math.sin(gust.phase + gust.age * 6 + dist * 0.08) * gust.turbulence;
        vx += Math.cos(dirRad) * base;
        vy += Math.sin(dirRad) * base;
        vx += -Math.sin(dirRad) * base * swirl;
        vy += Math.cos(dirRad) * base * swirl;
      }
      for (const p of state.particles){
        if (p.type !== 'wind') continue;
        const dx = x - p.x;
        const dy = y - p.y;
        const distSq = dx*dx + dy*dy;
        if (distSq > (WIND_FIELD_RANGE * 0.35) ** 2) continue;
        const dist = Math.sqrt(distSq) || 1;
        const falloff = Math.exp(-dist * (WIND_FIELD_DECAY * 4));
        vx += p.vx * falloff;
        vy += p.vy * falloff;
      }
      return { vx, vy };
    }

    function clothNodeBodyCollision(node, body, dt){
      if (!body || body.absoluteWall) return false;
      let collided = false;
      const padding = 6;
      if (body.shape === 'circle') {
        const dx = node.x - body.x;
        const dy = node.y - body.y;
        const dist = Math.hypot(dx, dy);
        const radius = (body.radius || 0) + padding;
        if (dist < radius && dist > 1e-4) {
          const nx = dx / dist;
          const ny = dy / dist;
          const target = radius + 0.5;
          node.x = body.x + nx * target;
          node.y = body.y + ny * target;
          const relVx = node.vx - (body.vx || 0);
          const relVy = node.vy - (body.vy || 0);
          const vn = relVx * nx + relVy * ny;
          const bounce = clamp((body.restitution || 0.2) + 0.2, 0.05, 0.9);
          if (vn < 0) {
            node.vx -= (1 + bounce) * vn * nx;
            node.vy -= (1 + bounce) * vn * ny;
          }
          node.vx += (body.vx || 0) * 0.1;
          node.vy += (body.vy || 0) * 0.1;
          applyImpactDamage(body, Math.abs(vn) * (body.mass === Infinity ? 0.5 : 1), { x: node.x, y: node.y }, { x: nx, y: ny });
          collided = true;
        }
      } else {
        const local = worldToLocal(body, node.x, node.y);
        const halfW = (body.width || 0) / 2 + padding;
        const halfH = (body.height || 0) / 2 + padding;
        if (Math.abs(local.x) <= halfW && Math.abs(local.y) <= halfH) {
          const penX = halfW - Math.abs(local.x);
          const penY = halfH - Math.abs(local.y);
          let nx = 0;
          let ny = 0;
          if (penX < penY) {
            nx = local.x > 0 ? 1 : -1;
            ny = 0;
          } else {
            nx = 0;
            ny = local.y > 0 ? 1 : -1;
          }
          const worldNormal = localToWorld(body, nx, ny);
          const len = Math.hypot(worldNormal.x - body.x, worldNormal.y - body.y) || 1;
          const normal = { x: (worldNormal.x - body.x) / len, y: (worldNormal.y - body.y) / len };
          node.x += normal.x * (penX < penY ? penX : 0);
          node.y += normal.y * (penX < penY ? 0 : penY);
          const relVx = node.vx - (body.vx || 0);
          const relVy = node.vy - (body.vy || 0);
          const vn = relVx * normal.x + relVy * normal.y;
          const bounce = clamp((body.restitution || 0.2) + 0.2, 0.05, 0.9);
          if (vn < 0) {
            node.vx -= (1 + bounce) * vn * normal.x;
            node.vy -= (1 + bounce) * vn * normal.y;
          }
          node.vx += (body.vx || 0) * 0.1;
          node.vy += (body.vy || 0) * 0.1;
          applyImpactDamage(body, Math.abs(vn), { x: node.x, y: node.y }, normal);
          collided = true;
        }
      }
      if (collided) {
        node.x = clamp(node.x, padding, state.bounds.width - padding);
        node.y = clamp(node.y, padding, state.bounds.height - padding);
      }
      return collided;
    }

    function resolveMaterialDefinition(body, materialId){
      const id = materialId || body?.material;
      if (!id) return MATERIALS[DEFAULT_MATERIAL];
      if (MATERIALS[id]) return MATERIALS[id];
      if (state.customMaterials && state.customMaterials.has(id)) return state.customMaterials.get(id);
      if (body?.customMaterial && body.customMaterial.id === id) return body.customMaterial;
      return MATERIALS[DEFAULT_MATERIAL];
    }

    function updateBodyMassProperties(body){
      if (!body) return;
      const mat = resolveMaterialDefinition(body, body.material) || MATERIALS[DEFAULT_MATERIAL];
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
      if (!body) return;
      let mat = resolveMaterialDefinition(body, materialId);
      if (!mat) mat = MATERIALS[DEFAULT_MATERIAL];
      const matId = mat?.id || materialId || DEFAULT_MATERIAL;
      const isCustom = matId && !MATERIALS[matId];
      if (isCustom) {
        body.customMaterial = deepClone(mat);
        if (state.customMaterials) {
          state.customMaterials.set(matId, deepClone(mat));
        }
        body.material = matId;
      } else {
        body.customMaterial = null;
        body.material = matId || DEFAULT_MATERIAL;
      }
      if (!MATERIALS[body.material] && !state.customMaterials.has(body.material)) {
        body.material = DEFAULT_MATERIAL;
        body.customMaterial = null;
        mat = MATERIALS[DEFAULT_MATERIAL];
      } else if (!MATERIALS[body.material]) {
        mat = resolveMaterialDefinition(body, body.material) || mat;
      }
      const resolvedId = mat?.id || body.material || DEFAULT_MATERIAL;
      const hadTemp = typeof body.temperature === 'number' && Number.isFinite(body.temperature);
      const prevTemp = hadTemp ? body.temperature : (mat.baseTemperature ?? state.ambientTemperature);
      body.material = resolvedId;
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
      const densityFactor = mat?.density ?? 1;
      const elasticityFactor = 1.5 - (mat?.restitution ?? body.restitution ?? 0.3);
      body.fractureThreshold = Math.max(60, (120 + densityFactor * 180) * elasticityFactor);
    }

    function selectObject(obj, kind){
      state.selection = obj ? obj.id : null;
      state.selectionKind = obj ? kind : null;
      if (kind !== 'cloth') state.selectionNodeIndex = null;
      renderInspector();
    }

    function getSelected(){
      if (!state.selection) return null;
      if (state.selectionKind === 'body') return state.bodies.find(b => b.id === state.selection) || null;
      if (state.selectionKind === 'emitter') return state.emitters.find(e => e.id === state.selection) || null;
      if (state.selectionKind === 'vine') return state.vines.find(v => v.id === state.selection) || null;
      if (state.selectionKind === 'cloth') return state.cloths.find(c => c.id === state.selection) || null;
      return null;
    }

    function removeSelected(){
      if (!state.selection) return;
      if (state.selectionKind === 'body') {
        const idx = state.bodies.findIndex(b => b.id === state.selection);
        if (idx >= 0) {
          const removed = state.bodies.splice(idx,1)[0];
          cleanupCustomMaterialReference(removed);
          gainXp(5, { reason:'remove-body' });
        }
      } else if (state.selectionKind === 'emitter') {
        const idx = state.emitters.findIndex(e => e.id === state.selection);
        if (idx >= 0) { state.emitters.splice(idx,1); gainXp(4, { reason:'remove-emitter' }); }
    } else if (state.selectionKind === 'vine') {
      const idx = state.vines.findIndex(v => v.id === state.selection);
      if (idx >= 0) state.vines.splice(idx,1);
    } else if (state.selectionKind === 'cloth') {
      const idx = state.cloths.findIndex(c => c.id === state.selection);
      if (idx >= 0) state.cloths.splice(idx,1);
    }
      state.selection = null;
      state.selectionKind = null;
      state.selectionNodeIndex = null;
      renderInspector();
    }

    function cleanupCustomMaterialReference(body){
      if (!body) return;
      if (state.chemicalDrafts) state.chemicalDrafts.delete(body.id);
      const id = body.material;
      if (!id || MATERIALS[id]) return;
      const stillUsed = state.bodies.some(b => b.material === id);
      if (!stillUsed) state.customMaterials.delete(id);
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
      for (let i = state.cloths.length - 1; i >= 0; i--) {
        const cloth = state.cloths[i];
        for (let n = 0; n < cloth.nodes.length; n++){
          const node = cloth.nodes[n];
          const dist = Math.hypot(x - node.x, y - node.y);
          if (dist <= Math.max(12, cloth.spacing * 0.45)) {
            return { obj: cloth, kind:'cloth', nodeIndex:n };
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
          state.selectionNodeIndex = hit.kind === 'cloth' ? hit.nodeIndex : null;
          if (hit.kind === 'body') {
            dragInfo = { id: hit.obj.id, kind:'body', mode:'select', offsetX: pos.x - hit.obj.x, offsetY: pos.y - hit.obj.y };
          } else if (hit.kind === 'emitter') {
            dragInfo = { id: hit.obj.id, kind:'emitter', mode:'select', offsetX: pos.x - hit.obj.x, offsetY: pos.y - hit.obj.y };
          } else if (hit.kind === 'cloth') {
            dragInfo = { id: hit.obj.id, kind:'cloth', mode:'node', nodeIndex: hit.nodeIndex };
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
      } else if (state.tool === 'add-cloth') {
        spawnCloth({ x: pos.x, y: pos.y });
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
        } else if (dragInfo.kind === 'cloth') {
          const cloth = state.cloths.find(c => c.id === dragInfo.id);
          if (cloth) {
            const node = cloth.nodes[dragInfo.nodeIndex];
            if (node) {
              node.x = pos.x;
              node.y = pos.y;
              node.vx = 0;
              node.vy = 0;
              node.pinned = true;
              state.selectionNodeIndex = dragInfo.nodeIndex;
            }
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
      if (reaction.corrosion) corrodeBody(body, reaction.corrosion);
      if (reaction.freeze) freezeBody(body, reaction.freeze);
      if (reaction.soak) soakBody(body, reaction.soak);
      if (reaction.structural) body.strain = clamp((body.strain || 0) + reaction.structural * 0.6, 0, 3);
      body.stress = Math.min((body.stress || 0) + (reaction.energy || 0) * 0.05, 900);
      body.heatFlux = Math.max(body.heatFlux || 0, Math.abs(reaction.heat || 0) * 6);
      spawnReactionEffect(body, reaction, reagent, particle);
      if (particle && reaction.consumeParticle !== false) {
        particle.type = 'steam';
        particle.temperature = Math.max(particle.temperature || state.ambientTemperature, Math.max(120, (reaction.heat ?? 0) + 80));
        particle.vx *= 0.4;
        particle.vy = Math.min(particle.vy, -90);
        particle.life = Math.max(particle.life, 1.2);
        particle.maxLife = Math.max(particle.maxLife || 0, 18);
      } else if (particle && reaction.consumeParticle === false) {
        particle.temperature = Math.max(particle.temperature || state.ambientTemperature, state.ambientTemperature + (reaction.heat ?? 0) * 0.2);
      }
      gainXp(9, { reason:'chemical-reaction', reagent, material: body.material });
    }

    function spawnReactionEffect(body, reaction, reagent, sourceParticle){
      if (!body || !reaction) return;
      const x = sourceParticle?.x ?? body.x;
      const y = sourceParticle?.y ?? body.y;
      const baseRadius = body.boundingRadius || body.radius || Math.max(body.width || 0, body.height || 0) / 2 || 20;
      const intensity = clamp((reaction.energy || 300) / 600, 0.3, 6);
      const reagentColors = {
        fire:'#f97316',
        water:'#38bdf8',
        ice:'#a5f3fc',
        acid:'#facc15',
        lightning:'#fef08a',
        spark:'#fde047',
        wind:'#67e8f9'
      };
      const tint = reagentColors[reagent] || body.color || '#f8fafc';
      if (reaction.spawnShockwave) {
        spawnParticle('shockwave', x, y, {
          radius: baseRadius * 0.6,
          maxRadius: baseRadius * (1.8 + intensity * 0.4),
          life: 0.45 + intensity * 0.08,
          tint
        });
      }
      if (reaction.spawnDebris) {
        const debrisCount = Math.min(14, Math.ceil(6 * intensity));
        for (let i=0;i<debrisCount;i++){
          const ang = Math.random() * Math.PI * 2;
          const speed = 80 + Math.random() * 120;
          spawnParticle('debris', x + Math.cos(ang) * (baseRadius * 0.2), y + Math.sin(ang) * (baseRadius * 0.2), {
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            tint: body.color,
            life: 1 + Math.random() * 0.6
          });
        }
      }
      if (reaction.spawnIons) {
        const ionCount = Math.min(18, Math.ceil(5 * intensity));
        for (let i=0;i<ionCount;i++){
          const ang = Math.random() * Math.PI * 2;
          const dist = baseRadius * (0.2 + Math.random() * 0.6);
          spawnParticle('ion', x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, {
            tint,
            life: 0.8 + Math.random() * 0.6
          });
        }
      }
      if (reaction.spawnEmbers) {
        const emberCount = Math.min(18, Math.ceil(7 * intensity));
        for (let i=0;i<emberCount;i++){
          const ang = Math.random() * Math.PI * 2;
          const dist = baseRadius * (0.2 + Math.random() * 0.5);
          spawnParticle('ember', x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, {
            tint,
            life: 1.2 + Math.random() * 0.9
          });
        }
      }
      if (reaction.spawnFrost) {
        const frostCount = Math.min(16, Math.ceil(5 * intensity));
        for (let i=0;i<frostCount;i++){
          const ang = Math.random() * Math.PI * 2;
          const dist = baseRadius * (0.1 + Math.random() * 0.5);
          spawnParticle('frost', x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, {
            tint:'#bae6fd',
            life: 1.4 + Math.random() * 0.6
          });
        }
      }
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
        age:0,
        tint:null,
        maxRadius:null
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
        case 'ember':
          particle.vx = (Math.random()-0.5)*80;
          particle.vy = -70 - Math.random()*40;
          particle.life = 1.2 + Math.random()*0.8;
          particle.maxLife = particle.life;
          particle.radius = 3 + Math.random()*1.2;
          break;
        case 'ion':
          particle.vx = (Math.random()-0.5)*60;
          particle.vy = -120 - Math.random()*60;
          particle.life = 1 + Math.random()*0.5;
          particle.maxLife = particle.life;
          particle.radius = 3;
          break;
        case 'frost':
          particle.vx = (Math.random()-0.5)*40;
          particle.vy = -40 - Math.random()*30;
          particle.life = 1.2 + Math.random()*0.8;
          particle.maxLife = particle.life;
          particle.radius = 3 + Math.random()*1;
          break;
        case 'debris':
          particle.vx = (Math.random()-0.5)*160;
          particle.vy = -20 - Math.random()*40;
          particle.life = 1 + Math.random()*0.8;
          particle.radius = 2.5 + Math.random()*1.5;
          break;
        case 'shockwave':
          particle.vx = 0;
          particle.vy = 0;
          particle.life = particle.life || (0.4 + Math.random()*0.2);
          particle.maxLife = particle.life;
          particle.radius = particle.radius || (extras?.radius ?? 60);
          particle.maxRadius = extras?.maxRadius || particle.maxRadius || particle.radius * 1.8;
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
          case 'ember':
            p.vx *= (1 - clamp(0.8 * dt, 0, 0.4));
            p.vy -= 50 * dt;
            break;
          case 'ion':
            p.vy -= 90 * dt;
            p.vx += Math.sin((p.seed || 0) * 12 + p.age * 20) * 40 * dt;
            break;
          case 'frost':
            p.vy -= 35 * dt;
            p.vx *= (1 - clamp(0.6 * dt, 0, 0.3));
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
          case 'debris':
            p.vy += state.gravity.y * 0.9 * dt;
            p.vx *= (1 - clamp(1.2 * dt, 0, 0.6));
            break;
          case 'shockwave':
            p.vx = 0;
            p.vy = 0;
            if (p.maxRadius) {
              const target = p.maxRadius;
              p.radius = lerp(p.radius || target, target, clamp(4*dt, 0, 1));
            }
            break;
        }
        if (p.type === 'shockwave') {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < -32 || p.x > state.bounds.width + 32 || p.y < -64 || p.y > state.bounds.height + 64) {
            remove.push(i);
          }
          continue;
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
        if (p.type === 'lightning' || p.type === 'spark' || p.type === 'ion') {
          const radius = p.type === 'lightning' ? 40 : p.type === 'ion' ? 32 : 28;
          const node = nearestCircuitNode(p.x, p.y, radius);
          if (node) powerCircuitNode(node, p.type === 'lightning' ? 3 : p.type === 'ion' ? 2.8 : 2.5);
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
      if (p.type === 'shockwave') return;
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
        case 'ember':
          igniteBody(body, 0.2 * dt * 60);
          adjustBodyTemperature(body, 40 * dt);
          break;
        case 'ion':
          chargeBody(body, 0.35 * (p.power || 1));
          break;
        case 'frost':
          freezeBody(body, 0.25 * (p.power || 1));
          adjustBodyTemperature(body, -80 * dt);
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

    function updateCloths(dt){
      if (!state.cloths.length) return;
      const gravity = state.gravity;
      const bodies = state.bodies;
      const particles = state.particles;
      const removal = [];
      const removalIds = [];
      state.cloths.forEach((cloth, clothIndex) => {
        const damping = Math.pow(cloth.damping, clamp(dt * 60, 0, 6));
        const tearFactor = cloth.tearFactor || 1.8;
        cloth.fatigue = Math.max(0, (cloth.fatigue || 0) - dt * 0.4);
        let totalStrain = 0;
        let maxStrain = 0;
        let constraintCount = 0;
        for (let i=0;i<cloth.nodes.length;i++){
          const node = cloth.nodes[i];
          node.prevX = node.x;
          node.prevY = node.y;
          if (!node.pinned) {
            node.vx += gravity.x * dt;
            node.vy += gravity.y * dt;
            const wind = sampleWindField(node.x, node.y);
            node.vx += wind.vx * dt * cloth.windInfluence;
            node.vy += wind.vy * dt * cloth.windInfluence;
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx * dt;
            node.y += node.vy * dt;
          }
          node.x = clamp(node.x, 4, state.bounds.width - 4);
          node.y = clamp(node.y, 4, state.bounds.height - 4);
        }

        for (let iter=0; iter<CLOTH_SOLVER_ITERATIONS; iter++){
          for (const constraint of cloth.constraints){
            if (constraint.broken) continue;
            const a = cloth.nodes[constraint.a];
            const b = cloth.nodes[constraint.b];
            if (!a || !b) { constraint.broken = true; continue; }
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            let dist = Math.hypot(dx, dy);
            const rest = constraint.restLength || cloth.spacing;
            if (dist <= 1e-5) continue;
            const strain = Math.abs(dist - rest) / rest;
            if (Number.isFinite(strain)) {
              totalStrain += strain;
              if (strain > maxStrain) maxStrain = strain;
              constraintCount++;
              cloth.fatigue = clamp((cloth.fatigue || 0) + strain * 0.045, 0, 12);
            }
            if (dist > rest * tearFactor) {
              constraint.broken = true;
              cloth.integrity = clamp(cloth.integrity - 0.02, 0, 1);
              continue;
            }
            const diff = (dist - rest) / dist;
            const stiffness = (constraint.stiffness ?? cloth.structuralStiffness) * (constraint.type === 'bend' ? 0.6 : 1);
            const scalar = diff * stiffness * 0.5;
            if (!a.pinned) {
              a.x += dx * scalar;
              a.y += dy * scalar;
            }
            if (!b.pinned) {
              b.x -= dx * scalar;
              b.y -= dy * scalar;
            }
          }
        }

        cloth.avgStrain = constraintCount ? totalStrain / constraintCount : 0;
        cloth.maxStrain = maxStrain;
        if (Number.isNaN(cloth.avgStrain)) cloth.avgStrain = 0;
        if (Number.isNaN(cloth.maxStrain)) cloth.maxStrain = 0;
        if (cloth.avgStrain > 0.015) cloth.integrity = clamp(cloth.integrity - cloth.avgStrain * dt * 0.6, 0, 1);
        if (cloth.fatigue > 8 && Math.random() < dt * cloth.fatigue * 0.05) {
          const candidates = cloth.constraints.filter(c => !c.broken && c.type !== 'bend');
          if (candidates.length) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            pick.broken = true;
            cloth.integrity = clamp(cloth.integrity - 0.01, 0, 1);
          }
        }

        let tempIntegrity = 0;
        for (const node of cloth.nodes){
          for (const body of bodies){
            clothNodeBodyCollision(node, body, dt);
          }
          for (const p of particles){
            const dist = Math.hypot(node.x - p.x, node.y - p.y);
            if (dist > cloth.spacing * 2) continue;
            const influence = clamp(1 - dist / (cloth.spacing * 2), 0, 1);
            switch(p.type){
              case 'fire':
                node.temperature += (p.temperature || FIRE_BASE_TEMPERATURE) * 0.002 * influence * dt * 60;
                cloth.integrity = clamp(cloth.integrity - 0.003 * influence * dt * 60, 0, 1);
                break;
              case 'water':
                node.temperature -= 40 * influence * dt;
                break;
              case 'ice':
                node.temperature -= 65 * influence * dt;
                break;
              case 'acid':
                cloth.integrity = clamp(cloth.integrity - 0.004 * influence * dt * 60, 0, 1);
                break;
            }
          }
          node.temperature = clamp(node.temperature + ((state.ambientTemperature - node.temperature) * 0.08 * dt), -120, 620);
          if (!node.pinned) {
            node.vx = (node.x - node.prevX) / dt;
            node.vy = (node.y - node.prevY) / dt;
          } else {
            node.vx = 0;
            node.vy = 0;
          }
          tempIntegrity += clamp(1 - Math.abs(node.temperature - state.ambientTemperature) / 420, 0.2, 1);
        }
        const constraintHealth = cloth.constraints.length ? cloth.constraints.filter(c => !c.broken).length / cloth.constraints.length : 0;
        const thermalHealth = tempIntegrity / Math.max(1, cloth.nodes.length);
        cloth.integrity = clamp((cloth.integrity * 0.4) + (constraintHealth * 0.35) + (thermalHealth * 0.25), 0, 1);

        if (cloth.integrity < 0.08 || !cloth.constraints.some(c => !c.broken)) {
          removal.push(clothIndex);
        }
      });
      if (removal.length) {
        removal.sort((a,b) => b - a);
        for (const idx of removal){
          const cloth = state.cloths[idx];
          if (cloth) {
            cloth.nodes.forEach(node => {
              if (Math.random() < 0.4) {
                spawnParticle('spark', node.x, node.y, { power:0.5 });
              }
            });
            removalIds.push(cloth.id);
            state.cloths.splice(idx,1);
          }
        }
        if (state.selectionKind === 'cloth' && removalIds.includes(state.selection)) {
          state.selection = null;
          state.selectionKind = null;
          state.selectionNodeIndex = null;
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
        body.deformTimer = Math.max(0, (body.deformTimer || 0) - dt);
        const relaxRate = body.deformTimer > 0 ? clamp(dt * 1.2, 0, 0.35) : clamp(DAMAGE_RECOVERY_RATE * dt, 0, 0.6);
        body.stress = Math.max(0, (body.stress || 0) - STRESS_RELAX_RATE * dt);
        body.strain = Math.max(0, (body.strain || 0) - STRAIN_RELAX_RATE * dt);
        body.heatFlux = Math.max(0, (body.heatFlux || 0) - HEAT_FLUX_RELAX_RATE * dt);
        if (!body.absoluteWall && body.stress > 0 && body.integrity != null) {
          body.integrity = clamp(body.integrity - body.stress * 0.00012 * dt, 0, 1);
        }
        if (body.shape === 'circle') {
          body.deformScaleR = lerp(body.deformScaleR, 1, relaxRate);
          const targetRadius = clamp((body.baseRadius || body.radius || 20) * body.deformScaleR, 6, 280);
          if (Math.abs(targetRadius - body.radius) > 0.01) {
            body.radius = targetRadius;
            updateBodyMassProperties(body);
          }
        } else {
          body.deformScaleX = lerp(body.deformScaleX, 1, relaxRate);
          body.deformScaleY = lerp(body.deformScaleY, 1, relaxRate);
          const targetWidth = clamp((body.baseWidth || body.width || 40) * body.deformScaleX, 12, 320);
          const targetHeight = clamp((body.baseHeight || body.height || 40) * body.deformScaleY, 12, 320);
          if (Math.abs(targetWidth - body.width) > 0.01 || Math.abs(targetHeight - body.height) > 0.01) {
            body.width = targetWidth;
            body.height = targetHeight;
            updateBodyMassProperties(body);
          }
        }
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
          commitBodyDimensions(body);
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
            commitBodyDimensions(body);
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
      processFractureQueue();
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

    function processFractureQueue(){
      if (!state.fractureQueue.length) return;
      const queue = state.fractureQueue.splice(0);
      for (const entry of queue){
        const index = state.bodies.findIndex(b => b.id === entry.id);
        if (index < 0) continue;
        const body = state.bodies[index];
        const prevSelection = state.selection;
        const prevKind = state.selectionKind;
        const fragments = [];
        const normal = entry.normal || { x:0, y:-1 };
        const magnitude = Math.hypot(normal.x, normal.y) || 1;
        const dir = { x: normal.x / magnitude, y: normal.y / magnitude };
        if (body.shape === 'circle') {
          const baseRadius = Math.max(6, (body.radius || 30) * 0.6);
          const offset = (body.radius || baseRadius) * 0.5;
          fragments.push(createFragmentBody('circle', {
            x: body.x + dir.x * offset,
            y: body.y + dir.y * offset,
            radius: baseRadius,
            vx: body.vx + dir.x * 40,
            vy: body.vy + dir.y * 40,
            material: body.material
          }, body));
          fragments.push(createFragmentBody('circle', {
            x: body.x - dir.x * offset,
            y: body.y - dir.y * offset,
            radius: Math.max(6, baseRadius * 0.85),
            vx: body.vx - dir.x * 36,
            vy: body.vy - dir.y * 36,
            material: body.material
          }, body));
        } else {
          const width = body.width || 60;
          const height = body.height || 60;
          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            const newW = Math.max(12, width * 0.55);
            fragments.push(createFragmentBody('box', {
              x: body.x + dir.x * (newW * 0.5),
              y: body.y,
              width: newW,
              height,
              vx: body.vx + dir.x * 30,
              vy: body.vy,
              angle: body.angle,
              material: body.material
            }, body));
            fragments.push(createFragmentBody('box', {
              x: body.x - dir.x * (newW * 0.5),
              y: body.y,
              width: Math.max(12, width * 0.45),
              height,
              vx: body.vx - dir.x * 30,
              vy: body.vy,
              angle: body.angle,
              material: body.material
            }, body));
          } else {
            const newH = Math.max(12, height * 0.55);
            fragments.push(createFragmentBody('box', {
              x: body.x,
              y: body.y + dir.y * (newH * 0.5),
              width,
              height: newH,
              vx: body.vx,
              vy: body.vy + dir.y * 30,
              angle: body.angle,
              material: body.material
            }, body));
            fragments.push(createFragmentBody('box', {
              x: body.x,
              y: body.y - dir.y * (newH * 0.5),
              width,
              height: Math.max(12, height * 0.45),
              vx: body.vx,
              vy: body.vy - dir.y * 30,
              angle: body.angle,
              material: body.material
            }, body));
          }
        }
        for (let i=0;i<4;i++){
          const angle = Math.random() * Math.PI * 2;
          spawnParticle('spark', entry.x + Math.cos(angle) * 8, entry.y + Math.sin(angle) * 8, { power:0.6 });
        }
        const baseRadius = body.boundingRadius || body.radius || Math.max(body.width || 0, body.height || 0) * 0.5 || 30;
        spawnParticle('shockwave', entry.x, entry.y, {
          radius: baseRadius * 0.8,
          maxRadius: baseRadius * 1.8,
          life: 0.55,
          tint: body.color
        });
        for (let i=0;i<6;i++){
          const ang = Math.random() * Math.PI * 2;
          const dist = baseRadius * (0.3 + Math.random() * 0.6);
          spawnParticle('debris', entry.x + Math.cos(ang) * dist, entry.y + Math.sin(ang) * dist, {
            vx: body.vx + Math.cos(ang) * (80 + Math.random()*80),
            vy: body.vy + Math.sin(ang) * (80 + Math.random()*80),
            tint: body.color,
            life: 1 + Math.random()
          });
        }
        state.bodies.splice(index,1);
        if (prevSelection === body.id) {
          const first = fragments[0] || null;
          if (first) selectObject(first, 'body');
          else {
            state.selection = null;
            state.selectionKind = null;
          }
        } else {
          state.selection = prevSelection;
          state.selectionKind = prevKind;
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
      if (a && !a.static) applyImpactDamage(a, Math.abs(j), contactPoint, { x: normal.x, y: normal.y });
      if (b && !b.static) applyImpactDamage(b, Math.abs(j), contactPoint, { x: -normal.x, y: -normal.y });
    }

    function applyImpactDamage(body, impulse, contactPoint, normal){
      if (!body || body.static || body.absoluteWall) return;
      const threshold = Math.max(40, body.fractureThreshold || 140);
      const severity = clamp(impulse / threshold, 0, 2);
      if (severity <= 0.001) return;
      const corrosionPenalty = 1 + (body.corrosion || 0) * 0.03;
      const heatPenalty = body.temperature > (body.meltingPoint || 600) ? 1.4 : 1;
      const wetnessRelief = 1 - clamp(body.wetness * 0.05, 0, 0.5);
      const integrityLoss = severity * corrosionPenalty * heatPenalty * wetnessRelief * 0.4;
      body.integrity = clamp((body.integrity ?? 1) - integrityLoss, 0, 1);
      body.damage = clamp((body.damage || 0) + integrityLoss * 0.5, 0, 1.5);
      body.deformTimer = Math.min((body.deformTimer || 0) + 0.2 + severity * 0.4, 2);
      body.stress = Math.min((body.stress || 0) + impulse * 0.4, 900);
      body.strain = clamp((body.strain || 0) + integrityLoss, 0, 3);
      body.heatFlux = Math.max(body.heatFlux || 0, severity * 260);
      if (body.shape === 'circle') {
        body.deformScaleR = clamp(body.deformScaleR - integrityLoss * 0.3, 0.55, 1.2);
      } else {
        const axisImpact = Math.abs(normal?.x || 0) > Math.abs(normal?.y || 0) ? 'x' : 'y';
        const amount = integrityLoss * 0.4;
        if (axisImpact === 'x') body.deformScaleX = clamp(body.deformScaleX - amount, 0.55, 1.25);
        else body.deformScaleY = clamp(body.deformScaleY - amount, 0.55, 1.25);
      }
      if ((body.integrity ?? 1) <= 0.22) {
        fractureBody(body, contactPoint, normal);
      }
    }

    function fractureBody(body, contactPoint, normal){
      if (!body || body.absoluteWall || body.pendingFracture) return;
      if ((body.fragmentCount || 0) >= 5) return;
      body.pendingFracture = true;
      state.fractureQueue.push({
        id: body.id,
        x: contactPoint?.x ?? body.x,
        y: contactPoint?.y ?? body.y,
        normal: normal ? { x: normal.x, y: normal.y } : { x:0, y:-1 }
      });
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
      info.textContent = `図形 ${state.bodies.length} / エミッタ ${state.emitters.length} / 布 ${state.cloths.length} / 粒子 ${state.particles.length}`;
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
      const windEmitters = state.emitters.filter(e => e.kind === 'wind').length;
      const info6 = document.createElement('div');
      info6.className = 'phys-hud-line';
      info6.textContent = `風ガスト ${state.windGusts.length} / 風エミッタ ${windEmitters}`;
      hud.append(info, info2, info3, info4, info5, info6);
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
      } else if (state.selectionKind === 'cloth') {
        renderClothInspector(selected);
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

    function getChemicalDraft(body){
      if (!body) return null;
      if (!state.chemicalDrafts.has(body.id)) {
        const mat = resolveMaterialDefinition(body, body.material);
        const components = sanitizeComponentList(
          body.customMaterial?.components ||
          body.chemical?.components ||
          (mat?.composition ? Object.entries(mat.composition).map(([symbol, count]) => ({ symbol, count })) : [])
        );
        const hazards = new Set(body.customMaterial?.hazards || body.chemical?.hazards || inferHazardsFromComponents(components));
        const draft = {
          label: body.customMaterial?.label || body.chemical?.label || mat?.label || 'カスタム素材',
          components,
          density: finiteOr(body.customMaterial?.density ?? mat?.density, 1),
          color: body.customMaterial?.color || body.color || mat?.color || '#94a3b8',
          restitution: finiteOr(body.customMaterial?.restitution ?? body.restitution ?? mat?.restitution, 0.3),
          friction: finiteOr(body.customMaterial?.friction ?? body.friction ?? mat?.friction, 0.4),
          thermalConductivity: finiteOr(body.customMaterial?.thermalConductivity ?? body.thermalConductivity ?? mat?.thermalConductivity, 0.2),
          heatCapacity: finiteOr(body.customMaterial?.heatCapacity ?? body.heatCapacity ?? mat?.heatCapacity, 1),
          baseTemperature: finiteOr(body.customMaterial?.baseTemperature ?? body.baseTemperature ?? state.ambientTemperature, state.ambientTemperature),
          meltingPoint: finiteOr(body.customMaterial?.meltingPoint ?? body.meltingPoint ?? mat?.meltingPoint, 800),
          boilingPoint: finiteOr(body.customMaterial?.boilingPoint ?? body.boilingPoint ?? mat?.boilingPoint, 1200),
          ignitionPoint: finiteOr(body.customMaterial?.ignitionPoint ?? body.ignitionPoint ?? mat?.ignitionPoint, 320),
          freezePoint: finiteOr(body.customMaterial?.freezePoint ?? body.freezePoint ?? mat?.freezePoint, Math.max(-120, (body.meltingPoint ?? 800) - 200)),
          hazards
        };
        state.chemicalDrafts.set(body.id, draft);
      }
      const draft = state.chemicalDrafts.get(body.id);
      draft.components = sanitizeComponentList(draft.components);
      if (!(draft.hazards instanceof Set)) draft.hazards = new Set(draft.hazards || []);
      return draft;
    }

    function buildCustomMaterialFromDraft(body, draft){
      if (!body || !draft) return null;
      draft.components = sanitizeComponentList(draft.components);
      if (!draft.components.length) return null;
      const composition = compositionFromComponents(draft.components);
      const formula = chemicalFormulaFromComponents(draft.components);
      const molarMass = molarMassFromComponents(draft.components);
      const avgDensity = averageElementProperty(draft.components, 'density', draft.density);
      const density = Math.max(0.05, Number.isFinite(Number(draft.density)) ? Number(draft.density) : avgDensity || 1);
      const baseTemperature = Number.isFinite(Number(draft.baseTemperature)) ? Number(draft.baseTemperature) : state.ambientTemperature;
      const meltingPoint = Number.isFinite(Number(draft.meltingPoint)) ? Number(draft.meltingPoint) : averageElementProperty(draft.components, 'meltingPoint', body.meltingPoint);
      const boilingPoint = Number.isFinite(Number(draft.boilingPoint)) ? Number(draft.boilingPoint) : averageElementProperty(draft.components, 'boilingPoint', body.boilingPoint);
      const freezePoint = Number.isFinite(Number(draft.freezePoint)) ? Number(draft.freezePoint) : averageElementProperty(draft.components, 'freezePoint', body.freezePoint);
      const ignitionPoint = Number.isFinite(Number(draft.ignitionPoint)) ? Number(draft.ignitionPoint) : averageElementProperty(draft.components, 'ignitionPoint', body.ignitionPoint);
      const thermalConductivity = Number.isFinite(Number(draft.thermalConductivity)) ? Number(draft.thermalConductivity) : averageElementProperty(draft.components, 'thermalConductivity', body.thermalConductivity);
      const heatCapacity = Number.isFinite(Number(draft.heatCapacity)) ? Number(draft.heatCapacity) : averageElementProperty(draft.components, 'heatCapacity', body.heatCapacity);
      const restitution = clamp(Number.isFinite(Number(draft.restitution)) ? Number(draft.restitution) : body.restitution, 0, 1);
      const friction = clamp(Number.isFinite(Number(draft.friction)) ? Number(draft.friction) : body.friction, 0, 1);
      const hazardSet = inferHazardsFromComponents(draft.components);
      if (draft.hazards instanceof Set) {
        draft.hazards.forEach(id => hazardSet.add(id));
      }
      const hazards = Array.from(hazardSet).filter(id => HAZARD_LABELS[id]);
      const customId = (!MATERIALS[body.material] && body.material) ? body.material : `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
      const label = (draft.label || '').trim() || formula || 'カスタム素材';
      draft.hazards = new Set(hazards);
      return {
        id: customId,
        label,
        density,
        restitution,
        friction,
        color: draft.color || body.color,
        baseTemperature,
        thermalConductivity,
        heatCapacity,
        ignitionPoint,
        meltingPoint,
        boilingPoint,
        freezePoint,
        formula,
        composition,
        components: draft.components.map(comp => ({
          symbol: comp.symbol,
          count: comp.count,
          name: PERIODIC_TABLE[comp.symbol]?.name || comp.symbol,
          atomicNumber: PERIODIC_TABLE[comp.symbol]?.atomicNumber || null
        })),
        molarMass,
        hazards,
        hazardLabels: hazards.map(id => HAZARD_LABELS[id] || id)
      };
    }

    function applyCustomMaterialFromDraft(body, draft){
      const material = buildCustomMaterialFromDraft(body, draft);
      if (!material) {
        window.alert('元素を1種類以上追加してください。');
        return;
      }
      state.customMaterials.set(material.id, deepClone(material));
      body.customMaterial = deepClone(material);
      applyMaterial(body, material.id);
      body.baseRestitution = body.restitution;
      body.baseFriction = body.friction;
      renderInspector();
    }

    function syncCustomMaterialFromBody(body){
      if (!body || MATERIALS[body.material]) return;
      const custom = state.customMaterials.get(body.material);
      if (!custom) return;
      custom.restitution = body.baseRestitution;
      custom.friction = body.baseFriction;
      custom.color = body.color;
      state.customMaterials.set(body.material, custom);
      body.customMaterial = deepClone(custom);
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
      damageInfo.dataset.role = 'body-damage';
      damageInfo.textContent = `損耗度: ${(Math.min(body.damage || 0, 1) * 100).toFixed(0)}%`;
      section.appendChild(damageInfo);

      if (!body.absoluteWall) {
        const integrityInfo = document.createElement('p');
        integrityInfo.className = 'phys-hint';
        integrityInfo.dataset.role = 'body-integrity';
        integrityInfo.textContent = `健全度: ${((body.integrity ?? (1 - (body.damage || 0))) * 100).toFixed(1)}%`;
        section.appendChild(integrityInfo);

        const stressInfo = document.createElement('p');
        stressInfo.className = 'phys-hint';
        stressInfo.dataset.role = 'body-stress';
        stressInfo.textContent = `応力指標: ${(body.stress || 0).toFixed(0)} kPa相当`;
        section.appendChild(stressInfo);

        const strainInfo = document.createElement('p');
        strainInfo.className = 'phys-hint';
        strainInfo.dataset.role = 'body-strain';
        strainInfo.textContent = `ひずみ: ${((body.strain || 0) * 100).toFixed(1)}%`;
        section.appendChild(strainInfo);

        const heatFluxInfo = document.createElement('p');
        heatFluxInfo.className = 'phys-hint';
        heatFluxInfo.dataset.role = 'body-heatflux';
        heatFluxInfo.textContent = `熱流指標: ${(body.heatFlux || 0).toFixed(1)}`;
        section.appendChild(heatFluxInfo);

        const fractureInfo = document.createElement('p');
        fractureInfo.className = 'phys-hint';
        fractureInfo.dataset.role = 'body-fracture';
        const threshold = body.fractureThreshold ? body.fractureThreshold.toFixed(0) : '---';
        const fragments = body.fragmentCount || 0;
        fractureInfo.textContent = `破断閾値: ${threshold} / 破片生成 ${fragments}回`;
        section.appendChild(fractureInfo);
      }
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
        const previousMaterial = body.material;
        applyMaterial(body, matSelect.value);
        body.baseRestitution = body.restitution;
        body.baseFriction = body.friction;
        if (previousMaterial && !MATERIALS[previousMaterial] && previousMaterial !== body.material) {
          const stillUsed = state.bodies.some(b => b.material === previousMaterial);
          if (!stillUsed) state.customMaterials.delete(previousMaterial);
        }
        state.chemicalDrafts.delete(body.id);
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
        const draft = getChemicalDraft(body);
        if (draft) draft.restitution = body.restitution;
        syncCustomMaterialFromBody(body);
      });
      const fricLabel = document.createElement('label'); fricLabel.textContent = `摩擦 (${body.friction.toFixed(2)})`;
      const fricInput = document.createElement('input');
      fricInput.type = 'range'; fricInput.min = '0'; fricInput.max = '1'; fricInput.step = '0.05'; fricInput.value = String(body.friction);
      fricInput.addEventListener('input', () => {
        body.friction = Number(fricInput.value);
        fricLabel.textContent = `摩擦 (${body.friction.toFixed(2)})`;
        body.baseFriction = body.friction;
        const draft = getChemicalDraft(body);
        if (draft) draft.friction = body.friction;
        syncCustomMaterialFromBody(body);
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
      colorInput.addEventListener('input', () => {
        body.color = colorInput.value;
        const draft = getChemicalDraft(body);
        if (draft) draft.color = colorInput.value;
        syncCustomMaterialFromBody(body);
      });
      section.append(colorLabel, colorInput);
      inspector.appendChild(section);

      const chemDraft = getChemicalDraft(body);
      if (chemDraft) {
        const chemSection = document.createElement('div');
        chemSection.className = 'phys-section';
        const chemTitle = document.createElement('h4');
        chemTitle.textContent = '化学式カスタマイザ';
        chemSection.appendChild(chemTitle);

        const formula = chemicalFormulaFromComponents(chemDraft.components);
        const compInfo = document.createElement('p');
        compInfo.className = 'phys-hint';
        compInfo.textContent = chemDraft.components.length
          ? '構成: ' + chemDraft.components.map(c => `${c.symbol}×${c.count}`).join(' / ')
          : '構成: 追加された元素はありません';
        chemSection.appendChild(compInfo);

        const formulaInfo = document.createElement('p');
        formulaInfo.className = 'phys-hint';
        formulaInfo.textContent = `化学式プレビュー: ${formula || '---'}`;
        chemSection.appendChild(formulaInfo);

        const molarMass = molarMassFromComponents(chemDraft.components);
        const molarInfo = document.createElement('p');
        molarInfo.className = 'phys-hint';
        molarInfo.textContent = `推定モル質量: ${molarMass ? molarMass.toFixed(2) : '---'} g/mol`;
        chemSection.appendChild(molarInfo);

        const suggestedDensity = averageElementProperty(chemDraft.components, 'density');
        if (typeof suggestedDensity === 'number') {
          const densityHint = document.createElement('p');
          densityHint.className = 'phys-hint';
          densityHint.textContent = `元素平均密度: ${suggestedDensity.toFixed(2)} (現在 ${chemDraft.density.toFixed(2)})`;
          chemSection.appendChild(densityHint);
        }

        const compList = document.createElement('ul');
        compList.className = 'phys-conn-list';
        chemDraft.components.forEach((comp, index) => {
          const li = document.createElement('li');
          const label = document.createElement('span');
          label.textContent = `${comp.symbol} × ${comp.count}`;
          const controls = document.createElement('div');
          controls.className = 'phys-tool-group';
          const incBtn = document.createElement('button'); incBtn.type = 'button'; incBtn.textContent = '＋';
          incBtn.addEventListener('click', () => {
            chemDraft.components[index].count = clamp(comp.count + 1, 1, 256);
            renderInspector();
          });
          const decBtn = document.createElement('button'); decBtn.type = 'button'; decBtn.textContent = '－';
          decBtn.addEventListener('click', () => {
            if (chemDraft.components[index].count <= 1) {
              chemDraft.components.splice(index,1);
            } else {
              chemDraft.components[index].count = clamp(comp.count - 1, 1, 256);
            }
            renderInspector();
          });
          const removeBtn = document.createElement('button'); removeBtn.type = 'button'; removeBtn.textContent = '削除';
          removeBtn.addEventListener('click', () => {
            chemDraft.components.splice(index,1);
            renderInspector();
          });
          controls.append(incBtn, decBtn, removeBtn);
          li.append(label, controls);
          compList.appendChild(li);
        });
        if (chemDraft.components.length) chemSection.appendChild(compList);

        const addRow = document.createElement('div');
        addRow.className = 'phys-tool-group';
        const elementSelect = document.createElement('select');
        sortedPeriodicElements().forEach(el => {
          const opt = document.createElement('option');
          opt.value = el.symbol;
          opt.textContent = `${el.symbol} (${el.name})`;
          elementSelect.appendChild(opt);
        });
        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.min = '1';
        countInput.max = '256';
        countInput.step = '1';
        countInput.value = '1';
        const addBtn = document.createElement('button'); addBtn.type = 'button'; addBtn.textContent = '元素追加';
        addBtn.addEventListener('click', () => {
          const symbol = elementSelect.value;
          const count = clamp(Math.round(Number(countInput.value) || 1), 1, 256);
          const existing = chemDraft.components.find(c => c.symbol === symbol);
          if (existing) existing.count = clamp(existing.count + count, 1, 256);
          else chemDraft.components.push({ symbol, count });
          renderInspector();
        });
        addRow.append(elementSelect, countInput, addBtn);
        chemSection.appendChild(addRow);

        const labelWrap = document.createElement('label');
        labelWrap.textContent = '素材名';
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = chemDraft.label || '';
        labelInput.placeholder = 'カスタム素材名';
        labelInput.addEventListener('input', () => {
          chemDraft.label = labelInput.value.slice(0, 40);
        });
        labelWrap.appendChild(labelInput);
        chemSection.appendChild(labelWrap);

        const densityLabel = document.createElement('label');
        densityLabel.textContent = `密度 (${chemDraft.density.toFixed(2)})`;
        const densityInput = document.createElement('input');
        densityInput.type = 'number';
        densityInput.min = '0.05';
        densityInput.max = '25';
        densityInput.step = '0.05';
        densityInput.value = String(chemDraft.density);
        densityInput.addEventListener('input', () => {
          chemDraft.density = clamp(Number(densityInput.value) || chemDraft.density, 0.05, 25);
          densityLabel.textContent = `密度 (${chemDraft.density.toFixed(2)})`;
        });
        densityLabel.appendChild(densityInput);
        chemSection.appendChild(densityLabel);

        const tempLabel = document.createElement('label');
        tempLabel.textContent = `基準温度 (${chemDraft.baseTemperature.toFixed(1)}°C)`;
        const tempInput = document.createElement('input');
        tempInput.type = 'number';
        tempInput.step = '1';
        tempInput.value = String(Math.round(chemDraft.baseTemperature));
        tempInput.addEventListener('input', () => {
          chemDraft.baseTemperature = clamp(Number(tempInput.value) || chemDraft.baseTemperature, -200, 800);
          tempLabel.textContent = `基準温度 (${chemDraft.baseTemperature.toFixed(1)}°C)`;
        });
        tempLabel.appendChild(tempInput);
        chemSection.appendChild(tempLabel);

        const meltLabel = document.createElement('label');
        meltLabel.textContent = `融点 (${chemDraft.meltingPoint.toFixed(0)}°C)`;
        const meltInput = document.createElement('input');
        meltInput.type = 'number';
        meltInput.step = '10';
        meltInput.value = String(Math.round(chemDraft.meltingPoint));
        meltInput.addEventListener('input', () => {
          chemDraft.meltingPoint = Number(meltInput.value) || chemDraft.meltingPoint;
          meltLabel.textContent = `融点 (${chemDraft.meltingPoint.toFixed(0)}°C)`;
        });
        meltLabel.appendChild(meltInput);
        chemSection.appendChild(meltLabel);

        const boilLabel = document.createElement('label');
        boilLabel.textContent = `沸点 (${chemDraft.boilingPoint.toFixed(0)}°C)`;
        const boilInput = document.createElement('input');
        boilInput.type = 'number';
        boilInput.step = '10';
        boilInput.value = String(Math.round(chemDraft.boilingPoint));
        boilInput.addEventListener('input', () => {
          chemDraft.boilingPoint = Number(boilInput.value) || chemDraft.boilingPoint;
          boilLabel.textContent = `沸点 (${chemDraft.boilingPoint.toFixed(0)}°C)`;
        });
        boilLabel.appendChild(boilInput);
        chemSection.appendChild(boilLabel);

        const ignitionLabel = document.createElement('label');
        ignitionLabel.textContent = `発火点 (${chemDraft.ignitionPoint.toFixed(0)}°C)`;
        const ignitionInput = document.createElement('input');
        ignitionInput.type = 'number';
        ignitionInput.step = '10';
        ignitionInput.value = String(Math.round(chemDraft.ignitionPoint));
        ignitionInput.addEventListener('input', () => {
          chemDraft.ignitionPoint = Number(ignitionInput.value) || chemDraft.ignitionPoint;
          ignitionLabel.textContent = `発火点 (${chemDraft.ignitionPoint.toFixed(0)}°C)`;
        });
        ignitionLabel.appendChild(ignitionInput);
        chemSection.appendChild(ignitionLabel);

        const hazardTitle = document.createElement('h5');
        hazardTitle.textContent = '性質タグ';
        chemSection.appendChild(hazardTitle);

        const hazardWrap = document.createElement('div');
        hazardWrap.className = 'phys-tool-group';
        Object.entries(HAZARD_LABELS).forEach(([id, label]) => {
          const hazardLabel = document.createElement('label');
          hazardLabel.className = 'phys-checkbox';
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = chemDraft.hazards.has(id);
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) chemDraft.hazards.add(id);
            else chemDraft.hazards.delete(id);
            renderInspector();
          });
          hazardLabel.append(checkbox, document.createTextNode(label));
          hazardWrap.appendChild(hazardLabel);
        });
        chemSection.appendChild(hazardWrap);

        if (chemDraft.hazards.size) {
          const hazardInfo = document.createElement('p');
          hazardInfo.className = 'phys-hint';
          hazardInfo.textContent = '適用タグ: ' + Array.from(chemDraft.hazards).map(id => HAZARD_LABELS[id] || id).join(' / ');
          chemSection.appendChild(hazardInfo);
        }

        const buttonRow = document.createElement('div');
        buttonRow.className = 'phys-tool-group';
        const applyBtn = document.createElement('button'); applyBtn.type = 'button'; applyBtn.textContent = 'カスタム素材を適用';
        applyBtn.addEventListener('click', () => applyCustomMaterialFromDraft(body, chemDraft));
        const resetBtn = document.createElement('button'); resetBtn.type = 'button'; resetBtn.textContent = '構成クリア';
        resetBtn.addEventListener('click', () => {
          chemDraft.components = [];
          chemDraft.hazards = new Set();
          renderInspector();
        });
        buttonRow.append(applyBtn, resetBtn);
        chemSection.appendChild(buttonRow);

        inspector.appendChild(chemSection);
      }
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

    function renderClothInspector(cloth){
      const section = document.createElement('div');
      section.className = 'phys-section';
      const h = document.createElement('h4'); h.textContent = '布プロパティ';
      section.appendChild(h);
      const integrity = document.createElement('p');
      integrity.className = 'phys-hint';
      integrity.dataset.role = 'cloth-integrity';
      integrity.textContent = `健全度 ${(cloth.integrity * 100).toFixed(1)}%`;
      section.appendChild(integrity);
      const info = document.createElement('p');
      info.className = 'phys-hint';
      info.dataset.role = 'cloth-links';
      const intact = cloth.constraints.filter(c => !c.broken).length;
      info.textContent = `節点 ${cloth.cols}×${cloth.rows} / 結合 ${intact}/${cloth.constraints.length}`;
      section.appendChild(info);

      const strainInfo = document.createElement('p');
      strainInfo.className = 'phys-hint';
      strainInfo.dataset.role = 'cloth-strain';
      strainInfo.textContent = `平均伸長 ${(cloth.avgStrain * 100).toFixed(2)}% / 最大 ${(cloth.maxStrain * 100).toFixed(2)}%`;
      section.appendChild(strainInfo);

      const fatigueInfo = document.createElement('p');
      fatigueInfo.className = 'phys-hint';
      fatigueInfo.dataset.role = 'cloth-fatigue';
      fatigueInfo.textContent = `疲労蓄積 ${ (cloth.fatigue || 0).toFixed(2) }`;
      section.appendChild(fatigueInfo);

      const stiffLabel = document.createElement('label'); stiffLabel.textContent = `張力 (${cloth.structuralStiffness.toFixed(2)})`;
      const stiffInput = document.createElement('input');
      stiffInput.type = 'range'; stiffInput.min = '0.2'; stiffInput.max = '1.5'; stiffInput.step = '0.01';
      stiffInput.value = String(cloth.structuralStiffness);
      stiffInput.addEventListener('input', () => {
        cloth.structuralStiffness = Number(stiffInput.value);
        stiffLabel.textContent = `張力 (${cloth.structuralStiffness.toFixed(2)})`;
        cloth.constraints.forEach(c => { if (c.type === 'structural') c.stiffness = cloth.structuralStiffness; });
      });

      const shearLabel = document.createElement('label'); shearLabel.textContent = `せん断 (${cloth.shearStiffness.toFixed(2)})`;
      const shearInput = document.createElement('input');
      shearInput.type = 'range'; shearInput.min = '0.1'; shearInput.max = '1.2'; shearInput.step = '0.01';
      shearInput.value = String(cloth.shearStiffness);
      shearInput.addEventListener('input', () => {
        cloth.shearStiffness = Number(shearInput.value);
        shearLabel.textContent = `せん断 (${cloth.shearStiffness.toFixed(2)})`;
        cloth.constraints.forEach(c => { if (c.type === 'shear') c.stiffness = cloth.shearStiffness; });
      });

      const bendLabel = document.createElement('label'); bendLabel.textContent = `しなり (${cloth.bendStiffness.toFixed(2)})`;
      const bendInput = document.createElement('input');
      bendInput.type = 'range'; bendInput.min = '0.05'; bendInput.max = '1'; bendInput.step = '0.01';
      bendInput.value = String(cloth.bendStiffness);
      bendInput.addEventListener('input', () => {
        cloth.bendStiffness = Number(bendInput.value);
        bendLabel.textContent = `しなり (${cloth.bendStiffness.toFixed(2)})`;
        cloth.constraints.forEach(c => { if (c.type === 'bend') c.stiffness = cloth.bendStiffness; });
      });

      const dampLabel = document.createElement('label'); dampLabel.textContent = `減衰 (${cloth.damping.toFixed(3)})`;
      const dampInput = document.createElement('input');
      dampInput.type = 'range'; dampInput.min = '0.6'; dampInput.max = '0.999'; dampInput.step = '0.001';
      dampInput.value = String(cloth.damping);
      dampInput.addEventListener('input', () => {
        cloth.damping = Number(dampInput.value);
        dampLabel.textContent = `減衰 (${cloth.damping.toFixed(3)})`;
      });

      const tearLabel = document.createElement('label'); tearLabel.textContent = `破断倍率 (${cloth.tearFactor.toFixed(2)})`;
      const tearInput = document.createElement('input');
      tearInput.type = 'range'; tearInput.min = '1.1'; tearInput.max = '3.5'; tearInput.step = '0.05';
      tearInput.value = String(cloth.tearFactor);
      tearInput.addEventListener('input', () => {
        cloth.tearFactor = Number(tearInput.value);
        tearLabel.textContent = `破断倍率 (${cloth.tearFactor.toFixed(2)})`;
      });

      const windLabel = document.createElement('label'); windLabel.textContent = `風反応 (${cloth.windInfluence.toFixed(2)})`;
      const windInput = document.createElement('input');
      windInput.type = 'range'; windInput.min = '0'; windInput.max = '2.5'; windInput.step = '0.05';
      windInput.value = String(cloth.windInfluence);
      windInput.addEventListener('input', () => {
        cloth.windInfluence = Number(windInput.value);
        windLabel.textContent = `風反応 (${cloth.windInfluence.toFixed(2)})`;
      });

      const colorLabel = document.createElement('label'); colorLabel.textContent = '色';
      const colorInput = document.createElement('input'); colorInput.type = 'color'; colorInput.value = cloth.color || '#cbd5f5';
      colorInput.addEventListener('input', () => { cloth.color = colorInput.value; });

      const pinButtons = document.createElement('div');
      pinButtons.className = 'phys-tool-group';
      const repinTop = document.createElement('button'); repinTop.textContent = '上辺を固定';
      repinTop.type = 'button';
      repinTop.addEventListener('click', () => {
        for (let c=0;c<cloth.cols;c++){
          const node = cloth.nodes[c];
          if (node) node.pinned = true;
        }
      });
      const unpinAll = document.createElement('button'); unpinAll.textContent = '固定解除';
      unpinAll.type = 'button';
      unpinAll.addEventListener('click', () => {
        cloth.nodes.forEach(node => { node.pinned = false; });
      });
      pinButtons.append(repinTop, unpinAll);

      section.append(
        stiffLabel, stiffInput,
        shearLabel, shearInput,
        bendLabel, bendInput,
        dampLabel, dampInput,
        tearLabel, tearInput,
        windLabel, windInput,
        colorLabel, colorInput,
        pinButtons
      );
      inspector.appendChild(section);
    }

    function updateHudInspector(){
      updateHud();
      if (state.selectionKind === 'cloth') {
        const cloth = getSelected();
        if (cloth) {
          const integrityEl = inspector.querySelector('[data-role="cloth-integrity"]');
          const linksEl = inspector.querySelector('[data-role="cloth-links"]');
          if (integrityEl) integrityEl.textContent = `健全度 ${(cloth.integrity * 100).toFixed(1)}%`;
          if (linksEl) {
            const intact = cloth.constraints.filter(c => !c.broken).length;
            linksEl.textContent = `節点 ${cloth.cols}×${cloth.rows} / 結合 ${intact}/${cloth.constraints.length}`;
          }
          const strainEl = inspector.querySelector('[data-role="cloth-strain"]');
          if (strainEl) strainEl.textContent = `平均伸長 ${(cloth.avgStrain * 100).toFixed(2)}% / 最大 ${(cloth.maxStrain * 100).toFixed(2)}%`;
          const fatigueEl = inspector.querySelector('[data-role="cloth-fatigue"]');
          if (fatigueEl) fatigueEl.textContent = `疲労蓄積 ${(cloth.fatigue || 0).toFixed(2)}`;
        }
      } else if (state.selectionKind === 'body') {
        const body = getSelected();
        if (body) {
          const damageEl = inspector.querySelector('[data-role="body-damage"]');
          if (damageEl) damageEl.textContent = `損耗度: ${(Math.min(body.damage || 0, 1) * 100).toFixed(0)}%`;
          const integrityEl = inspector.querySelector('[data-role="body-integrity"]');
          if (integrityEl) integrityEl.textContent = `健全度: ${((body.integrity ?? (1 - (body.damage || 0))) * 100).toFixed(1)}%`;
          const fractureEl = inspector.querySelector('[data-role="body-fracture"]');
          if (fractureEl) {
            const threshold = body.fractureThreshold ? body.fractureThreshold.toFixed(0) : '---';
            const fragments = body.fragmentCount || 0;
            fractureEl.textContent = `破断閾値: ${threshold} / 破片生成 ${fragments}回`;
          }
          const stressEl = inspector.querySelector('[data-role="body-stress"]');
          if (stressEl) stressEl.textContent = `応力指標: ${(body.stress || 0).toFixed(0)} kPa相当`;
          const strainEl = inspector.querySelector('[data-role="body-strain"]');
          if (strainEl) strainEl.textContent = `ひずみ: ${((body.strain || 0) * 100).toFixed(1)}%`;
          const heatFluxEl = inspector.querySelector('[data-role="body-heatflux"]');
          if (heatFluxEl) heatFluxEl.textContent = `熱流指標: ${(body.heatFlux || 0).toFixed(1)}`;
        }
      }
    }

    function updateWorld(dt){
      const steps = Math.max(1, Math.floor(state.substeps || 1));
      const stepDt = dt / steps;
      for (let i=0;i<steps;i++){
        updateBodies(stepDt);
        updateEmitters(stepDt);
        updateParticles(stepDt);
        updateWindGusts(stepDt);
        updateCloths(stepDt);
        updateThermodynamics(stepDt);
        updateChemistry(stepDt);
        updateVines(stepDt);
        propagateCircuit(stepDt);
      }
    }

  function renderBodyCracks(ctx, body, severity){
    if (!body) return;
    const radiusX = body.shape === 'circle' ? (body.radius || 0) : (body.width || 0) / 2;
    const radiusY = body.shape === 'circle' ? (body.radius || 0) : (body.height || 0) / 2;
    const maxRadius = Math.max(radiusX, radiusY);
    if (!maxRadius) return;
    const branchCount = Math.max(2, Math.round(2 + severity * 6));
    const segments = Math.max(3, Math.round(3 + severity * 4));
    const baseSeed = typeof body.crackSeed === 'number' ? body.crackSeed : Math.random();
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(15,23,42,${clamp(0.35 + severity * 0.45, 0.25, 0.82)})`;
    ctx.globalAlpha = clamp(0.28 + severity * 0.45, 0.2, 0.85);
    ctx.lineWidth = clamp(0.7 + severity * 1.5, 0.7, 2.8);
    for (let i=0;i<branchCount;i++){
      const seed = baseSeed + i * 19.173;
      let px = (seededRandom(seed, 0) - 0.5) * radiusX * 1.1;
      let py = (seededRandom(seed, 1) - 0.5) * radiusY * 1.1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let s=0;s<segments;s++){
        const jitter = (seededRandom(seed, 2 + s) - 0.5) * Math.PI * 1.4;
        const span = 0.5 + seededRandom(seed, 20 + s) * 0.9;
        px += Math.cos(jitter) * radiusX * span / segments;
        py += Math.sin(jitter) * radiusY * span / segments;
        if (body.shape === 'circle') {
          const limit = maxRadius * 0.92;
          const dist = Math.hypot(px, py) || 0.0001;
          if (dist > limit) {
            const t = limit / dist;
            px *= t;
            py *= t;
          }
        } else {
          px = clamp(px, -radiusX * 0.95, radiusX * 0.95);
          py = clamp(py, -radiusY * 0.95, radiusY * 0.95);
        }
        ctx.lineTo(px, py);
        if (severity > 0.55 && seededRandom(seed, 120 + s) > 0.68) {
          const branchAngle = jitter + (seededRandom(seed, 200 + s) - 0.5) * Math.PI * 0.6;
          const branchLen = maxRadius * 0.22 * severity;
          const bx = px + Math.cos(branchAngle) * branchLen;
          const by = py + Math.sin(branchAngle) * branchLen;
          ctx.lineTo(bx, by);
          ctx.moveTo(px, py);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
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

      ctx.save();
      ctx.lineWidth = 2;
      state.windGusts.forEach(gust => {
        const remaining = gust.maxLife ? clamp(gust.life / gust.maxLife, 0, 1) : 0.5;
        const alpha = clamp(0.15 + remaining * 0.35, 0.1, 0.45);
        const radius = gust.radius * (0.9 + Math.sin(gust.phase + gust.age * 5) * 0.05);
        ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
        ctx.beginPath();
        ctx.arc(gust.x, gust.y, radius, 0, Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        const dirRad = (gust.direction * Math.PI) / 180;
        ctx.moveTo(gust.x, gust.y);
        ctx.lineTo(gust.x + Math.cos(dirRad) * radius * 0.6, gust.y + Math.sin(dirRad) * radius * 0.6);
        ctx.stroke();
      });
      ctx.restore();

      // bodies
      state.bodies.forEach(body => {
        let fill = body.color;
        const crackSeverity = body.absoluteWall ? 0 : clamp(
          (body.damage || 0) * 0.65 +
          (body.strain || 0) * 0.6 +
          Math.max((body.stress || 0) - 40, 0) / 360 +
          (body.corrosion || 0) / 28,
          0,
          1
        );
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
          if ((body.strain || 0) > 0) fill = mixColor(fill, '#fbbf24', clamp((body.strain || 0) / 1.2, 0, 0.45));
          if ((body.stress || 0) > 30) fill = mixColor(fill, '#ef4444', clamp((body.stress || 0) / 400, 0, 0.55));
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
          if (crackSeverity > 0.05) {
            renderBodyCracks(ctx, body, crackSeverity);
          }
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

      // cloths
      state.cloths.forEach(cloth => {
        const integrity = clamp(cloth.integrity ?? 1, 0, 1);
        const base = cloth.color || '#cbd5f5';
        const strainFactor = clamp((cloth.avgStrain || 0) * 18, 0, 1);
        const peakStrain = clamp((cloth.maxStrain || 0) * 10, 0, 1);
        const fatigueFactor = clamp((cloth.fatigue || 0) / 12, 0, 1);
        const heat = cloth.heat || 0;
        let strokeBase = mixColor(base, '#ef4444', clamp(1 - integrity, 0, 0.8));
        strokeBase = mixColor(strokeBase, '#f97316', peakStrain * 0.6);
        strokeBase = mixColor(strokeBase, '#dc2626', fatigueFactor * 0.55);
        if (heat > 12) strokeBase = mixColor(strokeBase, '#fb923c', clamp((heat - 12) / 180, 0, 0.5));
        if (heat < -8) strokeBase = mixColor(strokeBase, '#38bdf8', clamp(Math.abs(heat + 8) / 160, 0, 0.45));
        const strokeColor = state.selection === cloth.id && state.selectionKind === 'cloth'
          ? '#facc15'
          : strokeBase;
        ctx.lineWidth = state.selection === cloth.id ? 2.2 : 1.2;
        ctx.strokeStyle = strokeColor;
        let fillColor = mixColor(base, '#94a3b8', 0.3);
        fillColor = mixColor(fillColor, '#fde68a', strainFactor * 0.5);
        fillColor = mixColor(fillColor, '#f87171', fatigueFactor * 0.4);
        if (heat > 12) fillColor = mixColor(fillColor, '#f97316', clamp((heat - 12) / 180, 0, 0.5));
        if (heat < -8) fillColor = mixColor(fillColor, '#93c5fd', clamp(Math.abs(heat + 8) / 140, 0, 0.45));
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = clamp(0.55 + integrity * 0.35, 0.4, 0.95);
        for (let r=0;r<cloth.rows;r++){
          ctx.beginPath();
          for (let c=0;c<cloth.cols;c++){
            const node = cloth.nodes[r * cloth.cols + c];
            if (!node) continue;
            if (c === 0) ctx.moveTo(node.x, node.y);
            else ctx.lineTo(node.x, node.y);
          }
          ctx.stroke();
        }
        for (let c=0;c<cloth.cols;c++){
          ctx.beginPath();
          for (let r=0;r<cloth.rows;r++){
            const node = cloth.nodes[r * cloth.cols + c];
            if (!node) continue;
            if (r === 0) ctx.moveTo(node.x, node.y);
            else ctx.lineTo(node.x, node.y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        const selectedNode = state.selection === cloth.id && state.selectionKind === 'cloth' ? state.selectionNodeIndex : null;
        cloth.nodes.forEach((node, idx) => {
          const radius = Math.max(2.5, cloth.spacing * 0.08);
          ctx.beginPath();
          if (node.pinned) {
            ctx.fillStyle = 'rgba(248,250,252,0.85)';
          } else {
            const nodeDamage = clamp(node.damage || 0, 0, 1);
            const stressMix = clamp(nodeDamage * 0.7 + fatigueFactor * 0.4 + strainFactor * 0.3, 0, 1);
            let nodeColor = mixColor(base, '#0f172a', clamp(0.45 + stressMix * 0.4, 0, 0.9));
            nodeColor = mixColor(nodeColor, '#f97316', stressMix * 0.35);
            ctx.fillStyle = nodeColor;
          }
          ctx.arc(node.x, node.y, radius, 0, Math.PI*2);
          ctx.fill();
          if (selectedNode === idx) {
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });
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
        ctx.save();
        let radius = p.radius || 4;
        let strokeOnly = false;
        let strokeWidth = 1.4;
        const lifeRatio = p.maxLife > 0 ? clamp(p.life / p.maxLife, 0, 1) : 1;
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
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(250,204,21,0.6)';
            break;
          case 'spark':
            ctx.fillStyle = 'rgba(103,232,249,0.8)';
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(103,232,249,0.6)';
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
          case 'ember': {
            const alpha = clamp(0.35 + lifeRatio * 0.5, 0.25, 0.85);
            ctx.fillStyle = p.tint ? tintToRgba(p.tint, alpha) : `rgba(249,115,22,${alpha})`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = p.tint ? tintToRgba(p.tint, alpha) : 'rgba(249,115,22,0.7)';
            radius = Math.max(2.2, p.radius || 3);
            break;
          }
          case 'ion': {
            const alpha = clamp(0.3 + lifeRatio * 0.45, 0.22, 0.78);
            ctx.fillStyle = p.tint ? tintToRgba(p.tint, alpha) : `rgba(165,243,252,${alpha})`;
            ctx.shadowBlur = 14;
            ctx.shadowColor = p.tint ? tintToRgba(p.tint, alpha * 0.9) : 'rgba(103,232,249,0.8)';
            radius = Math.max(2.6, p.radius || 3);
            break;
          }
          case 'frost': {
            const alpha = clamp(0.35 + lifeRatio * 0.4, 0.25, 0.75);
            ctx.fillStyle = p.tint ? tintToRgba(p.tint, alpha) : `rgba(191,219,254,${alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(191,219,254,0.6)';
            radius = Math.max(2.4, p.radius || 3);
            break;
          }
          case 'debris': {
            const alpha = clamp(0.4 + lifeRatio * 0.3, 0.3, 0.7);
            ctx.fillStyle = p.tint ? tintToRgba(p.tint, alpha) : `rgba(148,163,184,${alpha})`;
            radius = Math.max(2.2, p.radius || 3);
            break;
          }
          case 'shockwave': {
            const alpha = clamp(0.15 + lifeRatio * 0.35, 0.12, 0.6);
            ctx.strokeStyle = tintToRgba(p.tint || '#f1f5f9', alpha);
            ctx.shadowBlur = 18 * lifeRatio;
            ctx.shadowColor = tintToRgba(p.tint || '#f1f5f9', alpha * 0.8);
            strokeOnly = true;
            strokeWidth = clamp((p.radius || radius) * 0.12, 1.5, 6);
            radius = Math.max(p.radius || radius, 6);
            break;
          }
          default:
            ctx.fillStyle = 'rgba(226,232,240,0.6)';
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI*2);
        if (strokeOnly) {
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        } else {
          ctx.fill();
        }
        ctx.restore();
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
        vines: state.vines.map(v => deepClone(v)),
        cloths: state.cloths.map(cloth => ({
          id: cloth.id,
          cols: cloth.cols,
          rows: cloth.rows,
          spacing: cloth.spacing,
          structuralStiffness: cloth.structuralStiffness,
          shearStiffness: cloth.shearStiffness,
          bendStiffness: cloth.bendStiffness,
          damping: cloth.damping,
          tearFactor: cloth.tearFactor,
          windInfluence: cloth.windInfluence,
          color: cloth.color,
          integrity: cloth.integrity,
          heat: cloth.heat,
          fatigue: cloth.fatigue,
          avgStrain: cloth.avgStrain,
          maxStrain: cloth.maxStrain,
          nodes: cloth.nodes.map(n => ({
            x: n.x,
            y: n.y,
            prevX: n.prevX,
            prevY: n.prevY,
            vx: n.vx,
            vy: n.vy,
            pinned: n.pinned,
            temperature: n.temperature,
            damage: n.damage
          })),
          constraints: cloth.constraints.map(c => ({
            a: c.a,
            b: c.b,
            restLength: c.restLength,
            stiffness: c.stiffness,
            type: c.type,
            broken: c.broken
          }))
        }))
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
      state.customMaterials = new Map();
      state.chemicalDrafts = new Map();
      state.bodies = (snap.bodies || []).map(b => {
        const copy = Object.assign({}, b);
        if (copy.customMaterial) {
          const customId = copy.customMaterial.id || `custom-${copy.id || Math.random().toString(36).slice(2,8)}`;
          copy.customMaterial.id = customId;
          state.customMaterials.set(customId, deepClone(copy.customMaterial));
          copy.material = customId;
        }
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
        copy.integrity = clamp(copy.integrity ?? (1 - copy.damage), 0, 1);
        copy.deformScaleX = typeof copy.deformScaleX === 'number' ? copy.deformScaleX : 1;
        copy.deformScaleY = typeof copy.deformScaleY === 'number' ? copy.deformScaleY : 1;
        copy.deformScaleR = typeof copy.deformScaleR === 'number' ? copy.deformScaleR : 1;
        copy.deformTimer = Math.max(0, copy.deformTimer || 0);
        copy.fragmentCount = copy.fragmentCount || 0;
        copy.pendingFracture = false;
        copy.stress = Math.max(0, Number(copy.stress) || 0);
        copy.strain = Math.max(0, Number(copy.strain) || 0);
        copy.heatFlux = Math.max(0, Number(copy.heatFlux) || 0);
        copy.crackSeed = typeof copy.crackSeed === 'number' && Number.isFinite(copy.crackSeed) ? copy.crackSeed : Math.random();
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
      state.cloths = (snap.cloths || []).map(data => hydrateCloth(data)).filter(Boolean);
      state.cloths.forEach(cloth => {
        cloth.nodes.forEach(node => {
          node.prevX = node.prevX ?? node.x;
          node.prevY = node.prevY ?? node.y;
        });
      });
      state.particles = [];
      state.windGusts = [];
      state.windGustTimer = 0;
      state.selection = null;
      state.selectionKind = null;
      state.selectionNodeIndex = null;
      state.fractureQueue = [];
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
