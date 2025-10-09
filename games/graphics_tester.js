(function(){
  /**
   * MiniExp MOD: 3Dグラフィックテスター (v0.1.0)
   * - WebGL ベースの 3D デモコレクション
   * - オブジェクト配置、レイトレーシング風レンダリング、各種技術サンプル
   * - ベンチマーク計測と GPU 情報表示
   * - file:// でも動作するよう外部依存を避けた実装
   */

  const STYLE_ID = 'mini-exp-3d-style';
  const STYLE_RULES = `
    .gfx3d-root { display:flex; flex-direction:column; gap:16px; font-family:'Segoe UI',system-ui,sans-serif; color:#0f172a; }
    .gfx3d-header { display:flex; flex-wrap:wrap; gap:12px; padding:12px 16px; background:linear-gradient(135deg,#1e293b,#0f172a);
      color:#e2e8f0; border-radius:14px; box-shadow:0 6px 20px rgba(15,23,42,0.25); }
    .gfx3d-header h2 { margin:0; font-size:20px; letter-spacing:0.02em; }
    .gfx3d-header .gfx3d-gpuinfo { display:flex; flex-direction:column; gap:4px; font-size:12px; opacity:0.95; }
    .gfx3d-header .gfx3d-badges { display:flex; gap:8px; flex-wrap:wrap; }
    .gfx3d-badge { padding:4px 10px; border-radius:999px; background:rgba(226,232,240,0.1); border:1px solid rgba(226,232,240,0.2);
      font-size:11px; letter-spacing:0.03em; text-transform:uppercase; }
    .gfx3d-main { display:grid; grid-template-columns:minmax(260px,1fr) minmax(320px,2fr); gap:16px; }
    .gfx3d-controls { display:flex; flex-direction:column; gap:12px; background:rgba(15,23,42,0.03); padding:14px; border-radius:12px;
      border:1px solid rgba(148,163,184,0.35); box-shadow:0 4px 16px rgba(15,23,42,0.08); }
    .gfx3d-section { display:flex; flex-direction:column; gap:8px; }
    .gfx3d-section h3 { margin:0; font-size:15px; color:#0f172a; }
    .gfx3d-section select, .gfx3d-section button, .gfx3d-section input, .gfx3d-section textarea {
      border-radius:10px; border:1px solid rgba(100,116,139,0.35); padding:8px 10px; font-size:13px; background:#f8fafc; color:#0f172a;
      box-shadow:0 2px 4px rgba(148,163,184,0.15) inset; }
    .gfx3d-section button { background:linear-gradient(135deg,#38bdf8,#2563eb); color:white; border:none; cursor:pointer;
      box-shadow:0 6px 12px rgba(37,99,235,0.25); transition:transform 0.18s ease, box-shadow 0.18s ease; }
    .gfx3d-section button:hover { transform:translateY(-1px); box-shadow:0 8px 16px rgba(37,99,235,0.35); }
    .gfx3d-section button.secondary { background:linear-gradient(135deg,#a855f7,#7c3aed); }
    .gfx3d-section button.danger { background:linear-gradient(135deg,#f97316,#ea580c); }
    .gfx3d-section label { font-size:12px; color:#1e293b; display:flex; flex-direction:column; gap:6px; }
    .gfx3d-note { font-size:12px; color:#334155; background:#e2e8f0; border-radius:10px; padding:8px 10px; line-height:1.5; }
    .gfx3d-canvas-wrap { position:relative; border-radius:16px; overflow:hidden; border:1px solid rgba(15,23,42,0.12);
      box-shadow:0 12px 32px rgba(15,23,42,0.18); background:#0f172a; }
    .gfx3d-canvas { width:100%; height:100%; display:block; }
    .gfx3d-overlay { position:absolute; top:12px; right:12px; display:flex; flex-direction:column; gap:6px; }
    .gfx3d-pill { background:rgba(15,23,42,0.6); color:#e2e8f0; padding:6px 12px; border-radius:999px; font-size:12px;
      box-shadow:0 6px 14px rgba(15,23,42,0.3); backdrop-filter:blur(6px); }
    .gfx3d-log { background:#f8fafc; border-radius:14px; border:1px solid rgba(148,163,184,0.35); padding:12px;
      font-size:12px; line-height:1.6; max-height:220px; overflow:auto; }
    .gfx3d-log pre { margin:0; white-space:pre-wrap; word-break:break-word; font-family:'Fira Code',monospace; }
    .gfx3d-slider { appearance:none; width:100%; height:4px; border-radius:999px; background:rgba(148,163,184,0.35); outline:none; }
    .gfx3d-slider::-webkit-slider-thumb { appearance:none; width:14px; height:14px; border-radius:50%; background:#1d4ed8; cursor:pointer; }
    .gfx3d-slider::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:#1d4ed8; cursor:pointer; }
    .gfx3d-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:8px; }
    .gfx3d-mini-btn { padding:6px 10px; font-size:12px; border-radius:999px; border:none; cursor:pointer; background:#e2e8f0; color:#0f172a;
      transition:all 0.16s ease; }
    .gfx3d-mini-btn:hover { background:#cbd5f5; }
    .gfx3d-chip { padding:4px 8px; border-radius:8px; background:rgba(37,99,235,0.12); color:#1d4ed8; font-size:11px; }
    .gfx3d-flex { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
    @media (max-width:860px){ .gfx3d-main { grid-template-columns:1fr; } }
  `;

  const I18N_NAMESPACE = 'selection.miniexp.games.graphicsTester';
  const i18n = typeof window !== 'undefined' ? window.I18n : null;

  function translateWithFallback(fullKey, fallbackText, params){
    const computeFallback = () => {
      if (typeof fallbackText === 'function') {
        try {
          const result = fallbackText();
          return typeof result === 'string' ? result : (result ?? '');
        } catch (error) {
          console.warn('[graphicsTester:i18n] Failed to evaluate fallback text:', error);
          return '';
        }
      }
      return fallbackText ?? '';
    };

    if (!i18n || typeof i18n.t !== 'function') {
      return computeFallback();
    }

    try {
      const translated = i18n.t(fullKey, params);
      if (typeof translated === 'string' && translated !== fullKey) {
        return translated;
      }
    } catch (error) {
      console.warn('[graphicsTester:i18n] Failed to translate key:', fullKey, error);
    }

    return computeFallback();
  }

  function t(key, fallbackText, params){
    return translateWithFallback(`${I18N_NAMESPACE}.${key}`, fallbackText, params);
  }

  const DEMO_OPTION_DEFS = Object.freeze([
    { value: 'objectLab', labelKey: 'controls.demoSelect.options.objectLab', fallback: 'オブジェクトラボ (配置デモ)' },
    { value: 'ray', labelKey: 'controls.demoSelect.options.ray', fallback: 'レイトレーシング風デモ' },
    { value: 'gallery', labelKey: 'controls.demoSelect.options.gallery', fallback: '技術ギャラリー' }
  ]);

  function getDemoLabel(id){
    const def = DEMO_OPTION_DEFS.find((option) => option.value === id);
    if (!def) return id;
    return t(def.labelKey, def.fallback);
  }

  function ensureStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLE_RULES;
    document.head.appendChild(style);
  }

  function createEl(tag, className, parent){
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (parent) parent.appendChild(el);
    return el;
  }

  function logLine(log, text){
    const time = new Date().toLocaleTimeString();
    log.textContent += `[${time}] ${text}\n`;
    log.scrollTop = log.scrollHeight;
  }

  function clamp(v, min, max){ return v < min ? min : (v > max ? max : v); }
  // --- Linear algebra helpers ------------------------------------------------
  function mat4(){ return new Float32Array(16); }
  function mat4Identity(out){
    out[0]=1;out[1]=0;out[2]=0;out[3]=0;
    out[4]=0;out[5]=1;out[6]=0;out[7]=0;
    out[8]=0;out[9]=0;out[10]=1;out[11]=0;
    out[12]=0;out[13]=0;out[14]=0;out[15]=1;
    return out;
  }
  function mat4Multiply(out,a,b){
    const a00=a[0],a01=a[1],a02=a[2],a03=a[3];
    const a10=a[4],a11=a[5],a12=a[6],a13=a[7];
    const a20=a[8],a21=a[9],a22=a[10],a23=a[11];
    const a30=a[12],a31=a[13],a32=a[14],a33=a[15];
    const b00=b[0],b01=b[1],b02=b[2],b03=b[3];
    const b10=b[4],b11=b[5],b12=b[6],b13=b[7];
    const b20=b[8],b21=b[9],b22=b[10],b23=b[11];
    const b30=b[12],b31=b[13],b32=b[14],b33=b[15];
    out[0]=a00*b00+a01*b10+a02*b20+a03*b30;
    out[1]=a00*b01+a01*b11+a02*b21+a03*b31;
    out[2]=a00*b02+a01*b12+a02*b22+a03*b32;
    out[3]=a00*b03+a01*b13+a02*b23+a03*b33;
    out[4]=a10*b00+a11*b10+a12*b20+a13*b30;
    out[5]=a10*b01+a11*b11+a12*b21+a13*b31;
    out[6]=a10*b02+a11*b12+a12*b22+a13*b32;
    out[7]=a10*b03+a11*b13+a12*b23+a13*b33;
    out[8]=a20*b00+a21*b10+a22*b20+a23*b30;
    out[9]=a20*b01+a21*b11+a22*b21+a23*b31;
    out[10]=a20*b02+a21*b12+a22*b22+a23*b32;
    out[11]=a20*b03+a21*b13+a22*b23+a23*b33;
    out[12]=a30*b00+a31*b10+a32*b20+a33*b30;
    out[13]=a30*b01+a31*b11+a32*b21+a33*b31;
    out[14]=a30*b02+a31*b12+a32*b22+a33*b32;
    out[15]=a30*b03+a31*b13+a32*b23+a33*b33;
    return out;
  }
  function mat4Perspective(out, fovy, aspect, near, far){
    const f = 1.0 / Math.tan(fovy / 2);
    out[0]=f/aspect; out[1]=0; out[2]=0; out[3]=0;
    out[4]=0; out[5]=f; out[6]=0; out[7]=0;
    out[8]=0; out[9]=0; out[10]=(far+near)/(near-far); out[11]=-1;
    out[12]=0; out[13]=0; out[14]=(2*far*near)/(near-far); out[15]=0;
    return out;
  }
  function mat4LookAt(out, eye, center, up){
    const ex=eye[0], ey=eye[1], ez=eye[2];
    let zx=ex-center[0], zy=ey-center[1], zz=ez-center[2];
    let len = Math.hypot(zx,zy,zz) || 1;
    zx/=len; zy/=len; zz/=len;
    let xx = up[1]*zz - up[2]*zy;
    let xy = up[2]*zx - up[0]*zz;
    let xz = up[0]*zy - up[1]*zx;
    len = Math.hypot(xx,xy,xz) || 1;
    xx/=len; xy/=len; xz/=len;
    const yx = zy*xz - zz*xy;
    const yy = zz*xx - zx*xz;
    const yz = zx*xy - zy*xx;
    out[0]=xx; out[1]=yx; out[2]=zx; out[3]=0;
    out[4]=xy; out[5]=yy; out[6]=zy; out[7]=0;
    out[8]=xz; out[9]=yz; out[10]=zz; out[11]=0;
    out[12]=-(xx*ex + xy*ey + xz*ez);
    out[13]=-(yx*ex + yy*ey + yz*ez);
    out[14]=-(zx*ex + zy*ey + zz*ez);
    out[15]=1;
    return out;
  }
  function mat4Translate(out, x, y, z){
    out[12]+=out[0]*x + out[4]*y + out[8]*z;
    out[13]+=out[1]*x + out[5]*y + out[9]*z;
    out[14]+=out[2]*x + out[6]*y + out[10]*z;
    out[15]+=out[3]*x + out[7]*y + out[11]*z;
    return out;
  }
  function mat4Scale(out, x, y, z){
    out[0]*=x; out[1]*=x; out[2]*=x; out[3]*=x;
    out[4]*=y; out[5]*=y; out[6]*=y; out[7]*=y;
    out[8]*=z; out[9]*=z; out[10]*=z; out[11]*=z;
    return out;
  }
  function mat4RotateY(out, rad){
    const s=Math.sin(rad), c=Math.cos(rad);
    const a00=out[0], a01=out[1], a02=out[2], a03=out[3];
    const a20=out[8], a21=out[9], a22=out[10], a23=out[11];
    out[0]=a00*c-a20*s; out[1]=a01*c-a21*s; out[2]=a02*c-a22*s; out[3]=a03*c-a23*s;
    out[8]=a00*s+a20*c; out[9]=a01*s+a21*c; out[10]=a02*s+a22*c; out[11]=a03*s+a23*c;
    return out;
  }
  function mat4RotateX(out, rad){
    const s=Math.sin(rad), c=Math.cos(rad);
    const a10=out[4], a11=out[5], a12=out[6], a13=out[7];
    const a20=out[8], a21=out[9], a22=out[10], a23=out[11];
    out[4]=a10*c+a20*s; out[5]=a11*c+a21*s; out[6]=a12*c+a22*s; out[7]=a13*c+a23*s;
    out[8]=a20*c-a10*s; out[9]=a21*c-a11*s; out[10]=a22*c-a12*s; out[11]=a23*c-a13*s;
    return out;
  }
  function mat4RotateZ(out, rad){
    const s=Math.sin(rad), c=Math.cos(rad);
    const a00=out[0], a01=out[1], a02=out[2], a03=out[3];
    const a10=out[4], a11=out[5], a12=out[6], a13=out[7];
    out[0]=a00*c+a10*s; out[1]=a01*c+a11*s; out[2]=a02*c+a12*s; out[3]=a03*c+a13*s;
    out[4]=a10*c-a00*s; out[5]=a11*c-a01*s; out[6]=a12*c-a02*s; out[7]=a13*c-a03*s;
    return out;
  }
  function mat3(){ return new Float32Array(9); }
  function mat3FromMat4(out, mat){
    out[0]=mat[0]; out[1]=mat[1]; out[2]=mat[2];
    out[3]=mat[4]; out[4]=mat[5]; out[5]=mat[6];
    out[6]=mat[8]; out[7]=mat[9]; out[8]=mat[10];
    return out;
  }
  function mat3InvertTranspose(out, mat){
    const a00=mat[0], a01=mat[1], a02=mat[2];
    const a10=mat[3], a11=mat[4], a12=mat[5];
    const a20=mat[6], a21=mat[7], a22=mat[8];
    const b01=a22*a11 - a12*a21;
    const b11=-a22*a10 + a12*a20;
    const b21=a21*a10 - a11*a20;
    let det=a00*b01 + a01*b11 + a02*b21;
    if (!det) return mat3Identity(out);
    det=1/det;
    out[0]=b01*det;
    out[1]=(-a22*a01 + a02*a21)*det;
    out[2]=(a12*a01 - a02*a11)*det;
    out[3]=b11*det;
    out[4]=(a22*a00 - a02*a20)*det;
    out[5]=(-a12*a00 + a02*a10)*det;
    out[6]=b21*det;
    out[7]=(-a21*a00 + a01*a20)*det;
    out[8]=(a11*a00 - a01*a10)*det;
    return out;
  }
  function mat3Identity(out){ out[0]=1;out[1]=0;out[2]=0;out[3]=0;out[4]=1;out[5]=0;out[6]=0;out[7]=0;out[8]=1; return out; }
  // --- Geometry helpers ------------------------------------------------------
  function createCube(){
    const positions = new Float32Array([
      -1,-1, 1,  0,0,1,
       1,-1, 1,  0,0,1,
       1, 1, 1,  0,0,1,
      -1, 1, 1,  0,0,1,
      -1,-1,-1,  0,0,-1,
      -1, 1,-1,  0,0,-1,
       1, 1,-1,  0,0,-1,
       1,-1,-1,  0,0,-1,
      -1, 1,-1,  0,1,0,
      -1, 1, 1,  0,1,0,
       1, 1, 1,  0,1,0,
       1, 1,-1,  0,1,0,
      -1,-1,-1,  0,-1,0,
       1,-1,-1,  0,-1,0,
       1,-1, 1,  0,-1,0,
      -1,-1, 1,  0,-1,0,
       1,-1,-1,  1,0,0,
       1, 1,-1,  1,0,0,
       1, 1, 1,  1,0,0,
       1,-1, 1,  1,0,0,
      -1,-1,-1, -1,0,0,
      -1,-1, 1, -1,0,0,
      -1, 1, 1, -1,0,0,
      -1, 1,-1, -1,0,0,
    ]);
    const indices = new Uint16Array([
      0,1,2, 2,3,0,
      4,5,6, 6,7,4,
      8,9,10, 10,11,8,
      12,13,14, 14,15,12,
      16,17,18, 18,19,16,
      20,21,22, 22,23,20
    ]);
    return { positions, indices, stride:6 };
  }

  function createUVSphere(latBands=18, lonBands=24){
    const verts=[]; const inds=[];
    for(let lat=0; lat<=latBands; lat++){
      const theta = lat * Math.PI / latBands;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      for(let lon=0; lon<=lonBands; lon++){
        const phi = lon * 2 * Math.PI / lonBands;
        const sinP = Math.sin(phi);
        const cosP = Math.cos(phi);
        const x = cosP * sinT;
        const y = cosT;
        const z = sinP * sinT;
        verts.push(x,y,z, x,y,z);
      }
    }
    for(let lat=0; lat<latBands; lat++){
      for(let lon=0; lon<lonBands; lon++){
        const first = lat * (lonBands + 1) + lon;
        const second = first + lonBands + 1;
        inds.push(first, second, first + 1);
        inds.push(second, second + 1, first + 1);
      }
    }
    return { positions:new Float32Array(verts), indices:new Uint16Array(inds), stride:6 };
  }

  function createCylinder(segments=24){
    const verts=[]; const inds=[];
    for(let i=0;i<=segments;i++){
      const angle= i/segments * Math.PI*2;
      const cos=Math.cos(angle); const sin=Math.sin(angle);
      verts.push(cos,1,sin, cos,0,sin);
      verts.push(cos,-1,sin, cos,0,sin);
    }
    const topCenterIndex = verts.length/6;
    verts.push(0,1,0, 0,1,0);
    const bottomCenterIndex = verts.length/6;
    verts.push(0,-1,0, 0,-1,0);
    for(let i=0;i<segments;i++){
      const top1 = i*2;
      const top2 = ((i+1)%segments)*2;
      const bottom1 = top1+1;
      const bottom2 = top2+1;
      inds.push(top1, bottom1, top2);
      inds.push(bottom1, bottom2, top2);
      inds.push(topCenterIndex, top2, top1);
      inds.push(bottomCenterIndex, bottom1, bottom2);
    }
    return { positions:new Float32Array(verts), indices:new Uint16Array(inds), stride:6 };
  }
  // --- WebGL helpers ---------------------------------------------------------
  function createShader(gl, type, source){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
  }

  function createProgram(gl, vsSource, fsSource){
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program link error: ${info}`);
    }
    return program;
  }

  function createGeometryBuffers(gl, geom){
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, geom.positions, gl.STATIC_DRAW);
    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geom.indices, gl.STATIC_DRAW);
    const stride = geom.stride * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0,3,gl.FLOAT,false,stride,0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1,3,gl.FLOAT,false,stride,12);
    gl.bindVertexArray(null);
    return { vao, count: geom.indices.length };
  }

  function createFullScreenQuad(gl){
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1, 1,-1, -1,1,
      -1,1, 1,-1, 1,1
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,8,0);
    gl.bindVertexArray(null);
    return { vao, count:6 };
  }

  function createRandomColor(){
    const h = Math.random();
    const s = 0.55 + Math.random()*0.35;
    const l = 0.45 + Math.random()*0.25;
    return hslToRgb(h,s,l);
  }

  function hslToRgb(h,s,l){
    const hue2rgb = (p,q,t) => {
      if(t<0) t+=1;
      if(t>1) t-=1;
      if(t<1/6) return p + (q-p)*6*t;
      if(t<1/2) return q;
      if(t<2/3) return p + (q-p)*(2/3 - t)*6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p,q,h + 1/3);
    const g = hue2rgb(p,q,h);
    const b = hue2rgb(p,q,h - 1/3);
    return [r,g,b];
  }
  // Orbit camera controller ---------------------------------------------------
  class OrbitController {
    constructor(){
      this.distance = 14;
      this.theta = Math.PI/4;
      this.phi = Math.PI/4;
      this.target = [0,1.2,0];
      this.dragging = false;
      this._pointerId = null;
    }
    attach(canvas){
      canvas.addEventListener('pointerdown', (e)=>{
        this.dragging = true;
        this._pointerId = e.pointerId;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startTheta = this.theta;
        this.startPhi = this.phi;
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener('pointermove', (e)=>{
        if(!this.dragging || e.pointerId !== this._pointerId) return;
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        this.theta = this.startTheta + dx * 0.005;
        this.phi = clamp(this.startPhi + dy * 0.005, 0.1, Math.PI-0.1);
      });
      canvas.addEventListener('pointerup', (e)=>{
        if(e.pointerId === this._pointerId){
          this.dragging = false;
          this._pointerId = null;
          if (canvas.hasPointerCapture(e.pointerId)){
            canvas.releasePointerCapture(e.pointerId);
          }
        }
      });
      canvas.addEventListener('pointerleave', ()=>{ this.dragging=false; this._pointerId = null; });
      canvas.addEventListener('wheel', (e)=>{
        e.preventDefault();
        this.distance = clamp(this.distance + e.deltaY * 0.01, 4, 40);
      }, { passive:false });
    }
    computeEye(){
      const x = this.target[0] + this.distance * Math.sin(this.phi) * Math.sin(this.theta);
      const y = this.target[1] + this.distance * Math.cos(this.phi);
      const z = this.target[2] + this.distance * Math.sin(this.phi) * Math.cos(this.theta);
      return [x,y,z];
    }
  }
  // --- Demo implementations --------------------------------------------------
  class ObjectLabDemo {
    constructor(gl, shared){
      this.gl = gl;
      this.shared = shared;
      this.objects = [];
      this.rotationSpeed = 0.2;
      this.autoRotate = true;
      this.program = createProgram(gl, shared.litVS, shared.litFS);
      this.uniforms = {
        uProjection: gl.getUniformLocation(this.program, 'uProjection'),
        uView: gl.getUniformLocation(this.program, 'uView'),
        uModel: gl.getUniformLocation(this.program, 'uModel'),
        uNormalMatrix: gl.getUniformLocation(this.program, 'uNormalMatrix'),
        uLightDir: gl.getUniformLocation(this.program, 'uLightDir'),
        uColor: gl.getUniformLocation(this.program, 'uColor'),
        uAmbient: gl.getUniformLocation(this.program, 'uAmbient'),
        uSpecularPower: gl.getUniformLocation(this.program, 'uSpecularPower')
      };
      this.geometries = {
        cube: createGeometryBuffers(gl, createCube()),
        sphere: createGeometryBuffers(gl, createUVSphere()),
        cylinder: createGeometryBuffers(gl, createCylinder())
      };
      this.controller = new OrbitController();
      this.modelMatrix = mat4();
      this.viewMatrix = mat4();
      this.projMatrix = mat4();
      this.normalMatrix = mat3();
      this.benchmarking = false;
      this.benchmarkTimer = 0;
      this.benchmarkFrames = 0;
      this.onBenchmarkFinished = null;
      this.seedDefaultScene();
    }
    attachCanvas(canvas){
      this.controller.attach(canvas);
    }
    addObject(type='cube'){
      const geom = this.geometries[type] || this.geometries.cube;
      this.objects.push({
        type,
        geom,
        position:[(Math.random()-0.5)*6, Math.random()*2 + 0.5, (Math.random()-0.5)*6],
        rotation:[Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI],
        scale:0.6 + Math.random()*1.3,
        color:createRandomColor(),
      });
    }
    clearObjects(){ this.objects = []; }
    seedDefaultScene(){
      this.clearObjects();
      const types = ['cube','sphere','cylinder'];
      for(let i=0;i<6;i++){
        this.addObject(types[i % types.length]);
      }
    }
    update(dt, time){
      if(this.autoRotate){
        for(const obj of this.objects){
          obj.rotation[1] += this.rotationSpeed * dt;
          obj.rotation[0] += 0.1 * dt;
        }
      }
      if(this.benchmarking){
        this.benchmarkTimer += dt;
        this.benchmarkFrames++;
        if (this.objects.length < 400) {
          for(let i=0;i<8;i++) this.addObject('cube');
        }
        if(this.benchmarkTimer >= 6){
          const fps = this.benchmarkFrames / this.benchmarkTimer;
          if(this.onBenchmarkFinished){
            this.onBenchmarkFinished({ fps:fps.toFixed(1), count:this.objects.length });
          }
          this.benchmarking=false;
          this.seedDefaultScene();
        }
      }
    }
    render(width, height){
      const gl = this.gl;
      gl.useProgram(this.program);
      const eye = this.controller.computeEye();
      mat4Perspective(this.projMatrix, Math.PI/3, width/height, 0.1, 100);
      mat4LookAt(this.viewMatrix, eye, this.controller.target, [0,1,0]);
      gl.uniformMatrix4fv(this.uniforms.uProjection, false, this.projMatrix);
      gl.uniformMatrix4fv(this.uniforms.uView, false, this.viewMatrix);
      gl.uniform3f(this.uniforms.uLightDir, 0.4, 0.8, 0.6);
      gl.uniform1f(this.uniforms.uAmbient, 0.22);
      gl.uniform1f(this.uniforms.uSpecularPower, 32);
      for(const obj of this.objects){
        const modelMatrix = mat4Identity(this.modelMatrix);
        mat4Translate(modelMatrix, obj.position[0], obj.position[1], obj.position[2]);
        mat4RotateY(modelMatrix, obj.rotation[1]);
        mat4RotateX(modelMatrix, obj.rotation[0]);
        mat4RotateZ(modelMatrix, obj.rotation[2]);
        mat4Scale(modelMatrix, obj.scale, obj.scale, obj.scale);
        gl.uniformMatrix4fv(this.uniforms.uModel, false, modelMatrix);
        const normalMat = mat3FromMat4(this.normalMatrix, modelMatrix);
        mat3InvertTranspose(normalMat, normalMat);
        gl.uniformMatrix3fv(this.uniforms.uNormalMatrix, false, normalMat);
        gl.uniform3f(this.uniforms.uColor, obj.color[0], obj.color[1], obj.color[2]);
        const geom = obj.geom;
        gl.bindVertexArray(geom.vao);
        gl.drawElements(gl.TRIANGLES, geom.count, gl.UNSIGNED_SHORT, 0);
      }
    }
    startBenchmark(callback){
      this.onBenchmarkFinished = callback;
      this.benchmarking = true;
      this.benchmarkTimer = 0;
      this.benchmarkFrames = 0;
      this.clearObjects();
      for(let i=0;i<32;i++) this.addObject('cube');
    }
    getStats(){
      return { objects:this.objects.length };
    }
  }
  class RayMarchDemo {
    constructor(gl, shared){
      this.gl = gl;
      this.shared = shared;
      this.program = createProgram(gl, shared.rayVS, shared.rayFS);
      this.quad = createFullScreenQuad(gl);
      this.uniforms = {
        uTime: gl.getUniformLocation(this.program, 'uTime'),
        uResolution: gl.getUniformLocation(this.program, 'uResolution'),
        uBounces: gl.getUniformLocation(this.program, 'uBounces'),
        uExposure: gl.getUniformLocation(this.program, 'uExposure')
      };
      this.time = 0;
      this.bounces = 3;
      this.exposure = 1.0;
    }
    update(dt, time){ this.time = time; }
    render(width, height){
      const gl = this.gl;
      gl.useProgram(this.program);
      gl.uniform1f(this.uniforms.uTime, this.time);
      gl.uniform2f(this.uniforms.uResolution, width, height);
      gl.uniform1i(this.uniforms.uBounces, this.bounces);
      gl.uniform1f(this.uniforms.uExposure, this.exposure);
      gl.bindVertexArray(this.quad.vao);
      gl.drawArrays(gl.TRIANGLES, 0, this.quad.count);
    }
  }

  class TechniqueGallery {
    constructor(gl, shared){
      this.gl = gl;
      this.shared = shared;
      this.program = createProgram(gl, shared.litVS, shared.litFS);
      this.uniforms = {
        uProjection: gl.getUniformLocation(this.program, 'uProjection'),
        uView: gl.getUniformLocation(this.program, 'uView'),
        uModel: gl.getUniformLocation(this.program, 'uModel'),
        uNormalMatrix: gl.getUniformLocation(this.program, 'uNormalMatrix'),
        uLightDir: gl.getUniformLocation(this.program, 'uLightDir'),
        uColor: gl.getUniformLocation(this.program, 'uColor'),
        uAmbient: gl.getUniformLocation(this.program, 'uAmbient'),
        uSpecularPower: gl.getUniformLocation(this.program, 'uSpecularPower')
      };
      this.geoms = {
        cube: createGeometryBuffers(gl, createCube()),
        sphere: createGeometryBuffers(gl, createUVSphere(12,18)),
        cylinder: createGeometryBuffers(gl, createCylinder(36))
      };
      this.controller = new OrbitController();
      this.viewMatrix = mat4();
      this.projMatrix = mat4();
      this.modelMatrix = mat4();
      this.normalMatrix = mat3();
      this.time = 0;
      this.motionTrail = Array.from({length:24},()=>({pos:[0,0,0], life:0}));
    }
    attachCanvas(canvas){ this.controller.attach(canvas); }
    update(dt, time){
      this.time = time;
      const t = time * 0.6;
      const idx = Math.floor(time*12)%this.motionTrail.length;
      const pos = [Math.sin(t)*3.5, 1.2 + Math.cos(t*0.9)*0.8, Math.cos(t)*3.5];
      this.motionTrail[idx] = { pos, life:1.0 };
      for(const node of this.motionTrail){ node.life = Math.max(0, node.life - dt*0.5); }
    }
    render(width, height){
      const gl = this.gl;
      gl.useProgram(this.program);
      const eye = this.controller.computeEye();
      mat4Perspective(this.projMatrix, Math.PI/3, width/height, 0.1, 120);
      mat4LookAt(this.viewMatrix, eye, this.controller.target, [0,1,0]);
      gl.uniformMatrix4fv(this.uniforms.uProjection, false, this.projMatrix);
      gl.uniformMatrix4fv(this.uniforms.uView, false, this.viewMatrix);
      gl.uniform3f(this.uniforms.uLightDir, -0.2, 0.9, -0.2);
      gl.uniform1f(this.uniforms.uAmbient, 0.18);
      gl.uniform1f(this.uniforms.uSpecularPower, 48);

      const drawGeom = (geom, color, modelMatrixBuilder) => {
        const model = mat4Identity(this.modelMatrix);
        modelMatrixBuilder(model);
        gl.uniformMatrix4fv(this.uniforms.uModel, false, model);
        const normalMat = mat3FromMat4(this.normalMatrix, model);
        mat3InvertTranspose(normalMat, normalMat);
        gl.uniformMatrix3fv(this.uniforms.uNormalMatrix, false, normalMat);
        gl.uniform3f(this.uniforms.uColor, color[0], color[1], color[2]);
        gl.bindVertexArray(geom.vao);
        gl.drawElements(gl.TRIANGLES, geom.count, gl.UNSIGNED_SHORT, 0);
      };

      drawGeom(this.geoms.cube, [0.2,0.6,0.9], (m)=>{
        mat4Translate(m,0,1.5,0);
        mat4RotateY(m, this.time*0.8);
        mat4RotateX(m, Math.sin(this.time*0.5));
        mat4Scale(m,1.4,1.4,1.4);
      });

      const ringCount = 18;
      for(let i=0;i<ringCount;i++){
        const angle = i / ringCount * Math.PI*2 + this.time*0.3;
        const radius = 6;
        const y = 1 + Math.sin(angle*3 + this.time)*0.6;
        drawGeom(this.geoms.sphere, [0.9,0.7,0.2], (m)=>{
          mat4Translate(m, Math.cos(angle)*radius, y, Math.sin(angle)*radius);
          mat4Scale(m,0.8,0.8,0.8);
        });
      }

      for(let i=-2;i<=2;i++){
        drawGeom(this.geoms.cylinder, [0.6,0.4,0.9], (m)=>{
          mat4Translate(m, i*2.8, 1, -5);
          mat4Scale(m,0.5,2.2,0.5);
          mat4RotateY(m, this.time*0.4 + i);
        });
      }

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      for(const node of this.motionTrail){
        if(node.life <= 0) continue;
        drawGeom(this.geoms.cube, [0.2,0.9,0.75], (m)=>{
          mat4Translate(m, node.pos[0], node.pos[1], node.pos[2]);
          mat4Scale(m, 0.4*node.life, 0.4*node.life, 0.4*node.life);
        });
        gl.uniform3f(this.uniforms.uColor, 0.2,0.9,0.75);
      }
      gl.disable(gl.BLEND);
    }
  }
  // --- Shared shaders -------------------------------------------------------
  const sharedShaders = {
    litVS: `#version 300 es\nprecision highp float;\nlayout(location=0) in vec3 aPosition;\nlayout(location=1) in vec3 aNormal;\nuniform mat4 uProjection;\nuniform mat4 uView;\nuniform mat4 uModel;\nuniform mat3 uNormalMatrix;\nout vec3 vNormal;\nout vec3 vPosition;\nvoid main(){\n  vec4 worldPos = uModel * vec4(aPosition,1.0);\n  vPosition = worldPos.xyz;\n  vNormal = normalize(uNormalMatrix * aNormal);\n  gl_Position = uProjection * uView * worldPos;\n}`,
    litFS: `#version 300 es\nprecision highp float;\nin vec3 vNormal;\nin vec3 vPosition;\nuniform vec3 uLightDir;\nuniform vec3 uColor;\nuniform float uAmbient;\nuniform float uSpecularPower;\nout vec4 fragColor;\nvoid main(){\n  vec3 N = normalize(vNormal);\n  vec3 L = normalize(uLightDir);\n  float diff = max(dot(N,L), 0.0);\n  vec3 viewDir = normalize(vec3(0.0,4.0,8.0) - vPosition);\n  vec3 halfVec = normalize(L + viewDir);\n  float spec = pow(max(dot(N, halfVec), 0.0), uSpecularPower);\n  vec3 color = (uAmbient + diff) * uColor + spec * vec3(0.9,0.95,1.0);\n  fragColor = vec4(color,1.0);\n}`,
    rayVS: `#version 300 es\nprecision highp float;\nlayout(location=0) in vec2 aPosition;\nout vec2 vUv;\nvoid main(){\n  vUv = aPosition * 0.5 + 0.5;\n  gl_Position = vec4(aPosition,0.0,1.0);\n}`,
    rayFS: `#version 300 es\nprecision highp float;\nout vec4 fragColor;\nin vec2 vUv;\nuniform float uTime;\nuniform vec2 uResolution;\nuniform int uBounces;\nuniform float uExposure;\n#define MAX_STEPS 96\n#define MAX_DIST 40.0\n#define SURF_DIST 0.0015\nstruct Material { vec3 color; float reflectivity; };\nfloat sdSphere(vec3 p, float r){ return length(p)-r; }\nfloat sdPlane(vec3 p, vec3 n, float h){ return dot(p,n)+h; }\nfloat sdTorus(vec3 p, vec2 t){ vec2 q = vec2(length(p.xz)-t.x, p.y); return length(q)-t.y; }\nvec2 scene(vec3 p, out Material mat){\n  float t = uTime * 0.6;\n  float minDist = 1e9;\n  vec2 res = vec2(0.0,0.0);\n  Material sphereMat;\n  sphereMat.color = vec3(0.5 + 0.5*sin(t+vec3(0.0,2.0,4.0)));\n  sphereMat.reflectivity = 0.4;\n  float d = sdSphere(p - vec3(sin(t)*1.5, 0.8 + sin(t*1.2)*0.2, cos(t)*1.5), 0.9);\n  if(d < minDist){ minDist = d; res = vec2(d,1.0); mat = sphereMat; }\n  Material torusMat; torusMat.color = vec3(0.9,0.6,0.2); torusMat.reflectivity=0.2;\n  float td = sdTorus(p - vec3(0.0, 0.5, 0.0), vec2(1.4,0.25));\n  if(td < minDist){ minDist = td; res = vec2(td,2.0); mat = torusMat; }\n  Material floorMat; floorMat.color = vec3(0.25,0.35,0.4); floorMat.reflectivity=0.05;\n  float pd = sdPlane(p, vec3(0.0,1.0,0.0), 0.8);\n  if(pd < minDist){ minDist = pd; res = vec2(pd,3.0); mat = floorMat; }\n  return res;\n}\nvec3 calcNormal(vec3 p){\n  vec3 e = vec3(0.001,0.0,0.0);\n  Material tmp;\n  float dx = scene(p+e.xyy, tmp).x - scene(p-e.xyy,tmp).x;\n  float dy = scene(p+e.yxy, tmp).x - scene(p-e.yxy,tmp).x;\n  float dz = scene(p+e.yyx, tmp).x - scene(p-e.yyx,tmp).x;\n  return normalize(vec3(dx,dy,dz));\n}\nvec3 shade(vec3 ro, vec3 rd){\n  vec3 accum = vec3(0.0);\n  vec3 throughput = vec3(1.0);\n  vec3 origin = ro;\n  vec3 direction = rd;\n  for(int bounce=0; bounce<6; ++bounce){\n    if(bounce >= uBounces) break;\n    float dist = 0.0;\n    bool hit = false;\n    Material mat;\n    for(int i=0;i<MAX_STEPS;i++){\n      vec2 h = scene(origin + direction * dist, mat);\n      dist += h.x;\n      if(abs(h.x) < SURF_DIST){ hit = true; break; }\n      if(dist > MAX_DIST) break;\n    }\n    vec3 p = origin + direction * dist;\n    if(!hit || dist > MAX_DIST){\n      float star = pow(max(0.0, 1.0 - abs(direction.y)), 8.0);\n      vec3 sky = vec3(0.05,0.09,0.12) + vec3(0.4,0.5,0.8)*star;\n      accum += throughput * sky;\n      break;\n    }\n    vec3 normal = calcNormal(p);\n    vec3 lightPos = vec3(3.0*sin(uTime*0.7), 2.5, 3.0*cos(uTime*0.5));\n    vec3 lightDir = normalize(lightPos - p);\n    float diff = max(dot(normal, lightDir), 0.0);\n    float fresnel = pow(1.0 - max(dot(normal, -direction), 0.0), 3.0);\n    float spec = pow(max(dot(normal, normalize(lightDir - direction)), 0.0), 64.0);\n    float shadow = 1.0;\n    float maxT = length(lightPos - p);\n    float t = 0.02;\n    for(int i=0;i<32;i++){\n      Material temp;\n      float h = scene(p + lightDir * t, temp).x;\n      if(h < 0.001){ shadow = 0.2; break; }\n      t += h;\n      if(t >= maxT) break;\n    }\n    vec3 baseColor = mat.color * (0.25 + diff * 1.2) + spec * vec3(0.8,0.9,1.0);\n    vec3 local = baseColor * shadow + fresnel * 0.4;\n    accum += throughput * local;\n    if(mat.reflectivity < 0.05){\n      break;\n    }\n    throughput *= mat.reflectivity;\n    if(length(throughput) < 0.02){\n      break;\n    }\n    origin = p + normal * 0.02;\n    direction = normalize(reflect(direction, normal));\n  }\n  return accum;\n}\nvoid main(){\n  vec2 uv = (vUv * 2.0 - 1.0);\n  uv.x *= uResolution.x / uResolution.y;\n  vec3 ro = vec3(0.0, 1.3, 4.5);\n  vec3 rd = normalize(vec3(uv.x, uv.y, -1.5));\n  vec3 col = shade(ro, rd);\n  col = vec3(1.0) - exp(-col * uExposure);\n  fragColor = vec4(pow(col, vec3(0.9)), 1.0);\n}`
  };
  // --- Renderer --------------------------------------------------------------
  class GraphicsRenderer {
    constructor(canvas, log, existingGL){
      this.canvas = canvas;
      this.gl = existingGL || canvas.getContext('webgl2', { antialias:true, preserveDrawingBuffer:true });
      if(!this.gl) throw new Error(t('errors.webgl2Unavailable', 'WebGL2 が利用できません'));
      this.log = log;
      this.width = 640;
      this.height = 480;
      this.lastTime = 0;
      this.fps = 0;
      this.frameCount = 0;
      this.frameTimer = 0;
      this._raf = null;
      this._running = false;
      this.shared = sharedShaders;
      this.gl.enable(this.gl.DEPTH_TEST);
      this.demos = {
        objectLab: new ObjectLabDemo(this.gl, this.shared),
        ray: new RayMarchDemo(this.gl, this.shared),
        gallery: new TechniqueGallery(this.gl, this.shared)
      };
      this.active = this.demos.objectLab;
      this.activeName = 'objectLab';
      if (typeof ResizeObserver !== 'undefined'){
        this.resizeObserver = new ResizeObserver(()=>this.resize());
        this.resizeObserver.observe(canvas.parentElement || canvas);
      } else {
        this._resizeHandler = () => this.resize();
        window.addEventListener('resize', this._resizeHandler);
      }
      this.resize();
      this.loop = this.loop.bind(this);
    }
    resize(){
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(320, rect.width);
      const height = Math.max(240, rect.height);
      const displayWidth = Math.round(width * dpr);
      const displayHeight = Math.round(height * dpr);
      if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight){
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
      }
      this.width = displayWidth;
      this.height = displayHeight;
      this.gl.viewport(0,0,displayWidth,displayHeight);
    }
    setActive(name){
      this.activeName = name;
      this.active = this.demos[name];
      if(this.log){
        const label = getDemoLabel(name);
        logLine(
          this.log,
          t('log.demoSwitch', () => `デモ切り替え: ${label}`, { label, id: name })
        );
      }
    }
    loop(time){
      if(!this._running) return;
      const gl = this.gl;
      const dt = (time - this.lastTime) * 0.001 || 0.016;
      this.lastTime = time;
      this.frameTimer += dt;
      this.frameCount++;
      if(this.frameTimer >= 1){
        this.fps = this.frameCount / this.frameTimer;
        this.frameTimer = 0;
        this.frameCount = 0;
      }
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.clearColor(0.05,0.07,0.11,1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if(this.active){
        this.active.update(dt, time*0.001);
        this.active.render(this.width, this.height);
      }
      if(!this._running) return;
      this._raf = requestAnimationFrame(this.loop);
    }
    start(){
      if(this._running) return;
      this._running = true;
      this.lastTime = performance.now();
      this._raf = requestAnimationFrame(this.loop);
    }
    stop(){
      if(!this._running) return;
      this._running = false;
      if(this._raf !== null){
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
    }
    dispose(){
      this.stop();
      if(this.resizeObserver){
        try { this.resizeObserver.disconnect(); } catch {}
        this.resizeObserver = null;
      }
      if(this._resizeHandler){
        window.removeEventListener('resize', this._resizeHandler);
        this._resizeHandler = null;
      }
    }
  }
  function gatherGPUInfo(gl){
    if(!gl) return {};
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const version = gl.getParameter(gl.VERSION);
    const shading = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    const antialias = !!(gl.getContextAttributes()?.antialias);
    return {
      vendor,
      renderer,
      version,
      shading,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxCubeMap: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxTextureUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
      antialias
    };
  }

  function setupUI(root, awardXp){
    ensureStyle();
    if(!root) return null;
    root.innerHTML = '';
    root.classList.add('gfx3d-root');
    const header = createEl('div','gfx3d-header', root);
    const headingBox = createEl('div', '', header);
    const title = createEl('h2','', headingBox);
    title.textContent = t('title', '3Dグラフィックテスター');
    const badges = createEl('div','gfx3d-badges', headingBox);
    [
      { key: 'badges.webgl2', fallback: 'WebGL2' },
      { key: 'badges.rayMarching', fallback: 'Ray Marching' },
      { key: 'badges.benchmark', fallback: 'Benchmark' }
    ].forEach(({ key, fallback }) => {
      const badge = createEl('span','gfx3d-badge', badges);
      badge.textContent = t(key, fallback);
    });
    const gpuInfoBox = createEl('div','gfx3d-gpuinfo', header);

    const main = createEl('div','gfx3d-main', root);
    const controls = createEl('div','gfx3d-controls', main);
    const canvasWrap = createEl('div','gfx3d-canvas-wrap', main);
    const canvas = createEl('canvas','gfx3d-canvas', canvasWrap);
    const overlay = createEl('div','gfx3d-overlay', canvasWrap);
    const fpsPill = createEl('div','gfx3d-pill', overlay);
    const statPill = createEl('div','gfx3d-pill', overlay);

    const logContainer = createEl('div','gfx3d-log', root);
    const logPre = createEl('pre','', logContainer);

    const gl = canvas.getContext('webgl2', { antialias:true, preserveDrawingBuffer:true });
    if(!gl){
      gpuInfoBox.innerHTML = '';
      const gpuTitle = createEl('strong','', gpuInfoBox);
      gpuTitle.textContent = t('gpuInfo.title', 'GPU情報');
      const unsupported = createEl('span','', gpuInfoBox);
      unsupported.textContent = t('gpuInfo.unsupported.message', 'WebGL2非対応または無効化されています');
      const warn = createEl('div','gfx3d-note', controls);
      warn.textContent = t(
        'gpuInfo.unsupported.description',
        'このモジュールは WebGL2 対応デバイス／ブラウザが必要です。設定で WebGL2 を有効化するか、対応ブラウザで再度お試しください。'
      );
      logLine(logPre, t('errors.webglInitFailed', 'WebGL2 コンテキストの初期化に失敗しました。'));
      return {
        start(){},
        stop(){},
        destroy(){
          try { root.innerHTML = ''; root.classList.remove('gfx3d-root'); } catch {}
        },
        getScore(){ return 0; }
      };
    }

    const renderer = new GraphicsRenderer(canvas, logPre, gl);
    renderer.demos.objectLab.attachCanvas(canvas);
    renderer.demos.gallery.attachCanvas(canvas);

    const gpu = gatherGPUInfo(gl);
    gpuInfoBox.innerHTML = '';
    const gpuTitle = createEl('strong','', gpuInfoBox);
    gpuTitle.textContent = t('gpuInfo.title', 'GPU情報');
    const unknownText = t('gpuInfo.unknown', 'Unknown');
    const antialiasValue = gpu.antialias
      ? t('gpuInfo.antialias.enabled', 'ON')
      : t('gpuInfo.antialias.disabled', 'OFF');
    const fallbackLabels = {
      vendor: 'Vendor',
      renderer: 'Renderer',
      version: 'WebGL',
      shading: 'GLSL',
      maxTextureSize: 'MaxTextureSize',
      maxCubeMap: 'MaxCubeMap',
      maxTextureUnits: 'TextureUnits',
      antialias: 'Antialias'
    };
    const entries = [
      { key: 'vendor', value: gpu.vendor || unknownText },
      { key: 'renderer', value: gpu.renderer || unknownText },
      { key: 'version', value: gpu.version || unknownText },
      { key: 'shading', value: gpu.shading || unknownText },
      { key: 'maxTextureSize', value: gpu.maxTextureSize != null ? String(gpu.maxTextureSize) : unknownText },
      { key: 'maxCubeMap', value: gpu.maxCubeMap != null ? String(gpu.maxCubeMap) : unknownText },
      { key: 'maxTextureUnits', value: gpu.maxTextureUnits != null ? String(gpu.maxTextureUnits) : unknownText },
      { key: 'antialias', value: antialiasValue }
    ];
    entries.forEach(({ key, value }) => {
      const span = createEl('span','', gpuInfoBox);
      span.textContent = t(
        `gpuInfo.entries.${key}`,
        () => `${fallbackLabels[key] || key}: ${value}`,
        { value }
      );
    });

    const demoSection = createEl('div','gfx3d-section', controls);
    const demoLabel = createEl('label','', demoSection);
    const demoLabelSpan = createEl('span','', demoLabel);
    demoLabelSpan.textContent = t('controls.demoSelect.label', 'デモ選択');
    const demoSelect = createEl('select','', demoLabel);
    DEMO_OPTION_DEFS.forEach(opt=>{
      const o = createEl('option','', demoSelect);
      o.value = opt.value; o.textContent = t(opt.labelKey, opt.fallback);
    });

    const dynamicArea = createEl('div','gfx3d-section', controls);
    const note = createEl('div','gfx3d-note', controls);
    note.textContent = t(
      'controls.demoSelect.note',
      'マウスドラッグで視点操作、ホイールでズーム。レイトレーシング風デモは GPU 負荷が高いためベンチマーク時は他タブを閉じてください。'
    );

    function refreshDynamicControls(){
      dynamicArea.innerHTML = '';
      const name = demoSelect.value;
      if(name === 'objectLab'){
        const title = createEl('h3','', dynamicArea);
        title.textContent = t('controls.objectLab.title', 'オブジェクト配置');
        const buttons = createEl('div','gfx3d-grid', dynamicArea);
        const addBtn = createEl('button','gfx3d-mini-btn', buttons);
        addBtn.textContent = t('controls.objectLab.actions.addCube', 'キューブ追加');
        addBtn.addEventListener('click', ()=>{
          renderer.demos.objectLab.addObject('cube');
          logLine(logPre, t('controls.objectLab.logs.addCube', 'キューブを追加しました'));
        });
        const sphereBtn = createEl('button','gfx3d-mini-btn', buttons);
        sphereBtn.textContent = t('controls.objectLab.actions.addSphere', 'スフィア追加');
        sphereBtn.addEventListener('click', ()=>{
          renderer.demos.objectLab.addObject('sphere');
          logLine(logPre, t('controls.objectLab.logs.addSphere', 'スフィアを追加しました'));
        });
        const cylBtn = createEl('button','gfx3d-mini-btn', buttons);
        cylBtn.textContent = t('controls.objectLab.actions.addCylinder', 'シリンダー追加');
        cylBtn.addEventListener('click', ()=>{
          renderer.demos.objectLab.addObject('cylinder');
          logLine(logPre, t('controls.objectLab.logs.addCylinder', 'シリンダーを追加しました'));
        });
        const clearBtn = createEl('button','gfx3d-mini-btn', buttons);
        clearBtn.textContent = t('controls.objectLab.actions.clear', '全削除');
        clearBtn.addEventListener('click', ()=>{
          renderer.demos.objectLab.clearObjects();
          logLine(logPre, t('controls.objectLab.logs.cleared', '配置をリセットしました'));
        });
        const chkWrap = createEl('label','gfx3d-flex', dynamicArea);
        const autoLabel = createEl('span','gfx3d-chip', chkWrap);
        autoLabel.textContent = t('controls.objectLab.actions.autoRotate', 'オート回転');
        const autoChk = createEl('input','', chkWrap);
        autoChk.type = 'checkbox';
        autoChk.checked = renderer.demos.objectLab.autoRotate;
        autoChk.addEventListener('change', ()=>{
          renderer.demos.objectLab.autoRotate = autoChk.checked;
          const state = autoChk.checked
            ? t('controls.objectLab.autoRotateState.on', 'ON')
            : t('controls.objectLab.autoRotateState.off', 'OFF');
          logLine(
            logPre,
            t('controls.objectLab.logs.autoRotate', () => `オート回転: ${state}`, { state })
          );
        });
      } else if(name === 'ray'){
        const title = createEl('h3','', dynamicArea);
        title.textContent = t('controls.ray.title', 'レイトレーシング風設定');
        const bounceLabel = createEl('label','', dynamicArea);
        const bounceSpan = createEl('span','', bounceLabel);
        bounceSpan.textContent = t('controls.ray.bounces', '反射回数');
        const bounceSlider = createEl('input','gfx3d-slider', bounceLabel);
        bounceSlider.type = 'range';
        bounceSlider.min = '1'; bounceSlider.max = '6';
        bounceSlider.value = renderer.demos.ray.bounces;
        bounceSlider.addEventListener('input', ()=>{
          renderer.demos.ray.bounces = parseInt(bounceSlider.value,10);
        });
        const exposureLabel = createEl('label','', dynamicArea);
        const exposureSpan = createEl('span','', exposureLabel);
        exposureSpan.textContent = t('controls.ray.exposure', '露光');
        const exposureSlider = createEl('input','gfx3d-slider', exposureLabel);
        exposureSlider.type = 'range';
        exposureSlider.min = '0.4'; exposureSlider.max = '2.2'; exposureSlider.step = '0.1';
        exposureSlider.value = renderer.demos.ray.exposure;
        exposureSlider.addEventListener('input', ()=>{
          renderer.demos.ray.exposure = parseFloat(exposureSlider.value);
        });
      } else {
        const title = createEl('h3','', dynamicArea);
        title.textContent = t('controls.gallery.title', '技術ギャラリー操作');
        const info = createEl('div','gfx3d-note', dynamicArea);
        info.textContent = t(
          'controls.gallery.description',
          'リング状インスタンシング・動的モーションブラー・マテリアル演出を観察できます。'
        );
      }
    }
    refreshDynamicControls();

    demoSelect.addEventListener('change', ()=>{
      renderer.setActive(demoSelect.value);
      refreshDynamicControls();
    });

    const benchSection = createEl('div','gfx3d-section', controls);
    const benchTitle = createEl('h3','', benchSection);
    benchTitle.textContent = t('controls.benchmark.title', 'ベンチマーク');
    const benchBtn = createEl('button','', benchSection);
    benchBtn.textContent = t('controls.benchmark.start', '6秒間ベンチマーク開始');
    benchBtn.addEventListener('click', ()=>{
      renderer.setActive('objectLab');
      demoSelect.value = 'objectLab';
      refreshDynamicControls();
      logLine(logPre, t('log.benchmarkStart', 'ベンチマークを開始します (高負荷)'));
      renderer.demos.objectLab.startBenchmark((result)=>{
        logLine(
          logPre,
          t(
            'log.benchmarkResult',
            () => `平均FPS: ${result.fps} / 描画オブジェクト: ${result.count}`,
            { fps: result.fps, count: result.count }
          )
        );
        if(typeof awardXp === 'function'){
          const bonus = Math.min(200, Math.max(0, Math.round(result.fps)));
          if(bonus > 0) awardXp(bonus);
        }
      });
    });

    let overlayRunning = false;
    let overlayRaf = null;
    const overlayFrame = () => {
      if(!overlayRunning) return;
      const fpsValue = renderer.fps.toFixed(1);
      fpsPill.textContent = t('overlay.fps', () => `FPS: ${fpsValue}`, { value: fpsValue });
      if(renderer.activeName === 'objectLab'){
        const stats = renderer.demos.objectLab.getStats();
        const count = stats.objects;
        statPill.textContent = t('overlay.objects', () => `Objects: ${count}`, { count });
      } else if(renderer.activeName === 'ray'){
        const bounces = renderer.demos.ray.bounces;
        statPill.textContent = t('overlay.bounces', () => `Bounces: ${bounces}`, { count: bounces });
      } else {
        statPill.textContent = t('overlay.gallery', 'Gallery Demo');
      }
      overlayRaf = requestAnimationFrame(overlayFrame);
    };
    const startOverlay = () => {
      if(overlayRunning) return;
      overlayRunning = true;
      overlayFrame();
    };
    const stopOverlay = () => {
      if(!overlayRunning) return;
      overlayRunning = false;
      if(overlayRaf !== null){
        cancelAnimationFrame(overlayRaf);
        overlayRaf = null;
      }
    };

    return {
      start(){
        renderer.start();
        startOverlay();
      },
      stop(){
        stopOverlay();
        renderer.stop();
      },
      destroy(){
        stopOverlay();
        renderer.dispose();
        try { root.innerHTML = ''; root.classList.remove('gfx3d-root'); } catch {}
      },
      getScore(){
        if(renderer.activeName === 'objectLab'){
          const stats = renderer.demos.objectLab.getStats();
          return Number(stats.objects) || 0;
        }
        return Math.round(Math.max(0, renderer.fps || 0));
      }
    };
  }

  function create(root, awardXp){
    const runtime = setupUI(root, awardXp) || {};
    return {
      start(){ try { runtime.start && runtime.start(); } catch {} },
      stop(){ try { runtime.stop && runtime.stop(); } catch {} },
      destroy(){ try { runtime.destroy && runtime.destroy(); } catch {} },
      getScore(){
        try { return runtime.getScore ? runtime.getScore() : 0; }
        catch { return 0; }
      }
    };
  }

  const definition = {
    id: 'graphics_tester',
    name: '3Dグラフィックテスター',
    nameKey: 'selection.miniexp.games.graphics_tester.name',
    description: '3D技術デモとレイトレーシング風レンダリング・ベンチマーク搭載のトイ系テスター',
    descriptionKey: 'selection.miniexp.games.graphics_tester.description',
    category: 'トイ',
    categories: ['トイ'],
    categoryIds: ['toy'],
    create
  };

  if (typeof window.registerMiniGame === 'function') {
    window.registerMiniGame(definition);
  } else {
    window.MiniExpMods = window.MiniExpMods || {};
    window.MiniExpMods['graphics_tester'] = {
      id: definition.id,
      name: definition.name,
      mount(target){
        const runtime = setupUI(target, null);
        try { runtime && runtime.start && runtime.start(); } catch {}
        return runtime;
      }
    };
  }
})();
