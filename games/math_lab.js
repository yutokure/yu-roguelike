(function(){
  /** MiniExp: Advanced Mathematics Lab */
  const MATHJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.2/math.min.js';
  let mathLoader = null;

  function ensureMathJs(){
    if (window.math && window.math.create) {
      return Promise.resolve(window.math);
    }
    if (mathLoader) return mathLoader;
    mathLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-mathjs="1"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.math));
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.src = MATHJS_URL;
      script.async = true;
      script.setAttribute('data-mathjs', '1');
      script.onload = () => {
        if (window.math && window.math.create) {
          resolve(window.math);
        } else {
          reject(new Error('math.js failed to load'));
        }
      };
      script.onerror = () => reject(new Error('math.js failed to load'));
      document.head.appendChild(script);
    });
    return mathLoader;
  }

  function create(root, awardXp){
    let active = false;
    let destroyed = false;
    let mathRef = null;
    let math = null;
    let scope = { ans: 0 };
    let totalComputations = 0;
    let totalGraphs = 0;

    const container = document.createElement('div');
    container.className = 'math-lab-root';
    Object.assign(container.style, {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), rgba(8,11,23,0.92))',
      color: '#e2e8f0',
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif"
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      width: 'min(960px, 96%)',
      height: 'min(640px, 94%)',
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: '16px',
      padding: '18px',
      background: 'linear-gradient(150deg,#0f172a,#111827)',
      borderRadius: '24px',
      border: '1px solid rgba(148,163,184,0.18)',
      boxShadow: '0 28px 60px rgba(8,12,24,0.55)',
      position: 'relative'
    });

    const loadingOverlay = document.createElement('div');
    Object.assign(loadingOverlay.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15,23,42,0.82)',
      zIndex: '4'
    });
    loadingOverlay.innerHTML = '<div style="text-align:center;font-size:15px;letter-spacing:0.4px;color:#cbd5f5">数学エンジンを読み込んでいます…</div>';

    const keypadPanel = document.createElement('div');
    Object.assign(keypadPanel.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      overflowY: 'auto',
      paddingRight: '4px'
    });

    const workspace = document.createElement('div');
    Object.assign(workspace.style, {
      display: 'grid',
      gridTemplateRows: 'auto auto 1fr auto',
      gap: '14px',
      minHeight: '0'
    });

    panel.appendChild(keypadPanel);
    panel.appendChild(workspace);
    panel.appendChild(loadingOverlay);
    container.appendChild(panel);

    root.appendChild(container);

    let expressionInput, expressionInputClassic, expressionInputPretty;
    let exactResultEl, approxResultEl, resultSubLabelExact, resultSubLabelApprox;
    let statusBar, variableList, historyBody;
    let angleToggleRad, angleToggleDeg;
    let resultToggleSymbolic, resultToggleNumeric;
    let expressionModeToggleClassic, expressionModeTogglePretty;
    let graphInput, graphXMin, graphXMax, graphCanvas, graphMessage;
    let plotButton, evalButton, clearButton;
    let unitSelect;
    let radianMode = true;
    let resultMode = 'symbolic';
    let expressionMode = 'classic';
    let history = [];
    let numericMath = null;
    let moreDigitsButton = null;
    let approxRawValue = null;
    let approxManualText = null;
    let approxDigitsShown = 10;
    let approxHasMoreDigits = false;
    let approxForceEllipsis = false;
    let latestHistoryEntry = null;

    const DEFAULT_DECIMAL_DIGITS = 10;
    const DECIMAL_DIGIT_STEP = 5;
    const MAX_DECIMAL_DIGITS = 120;
    const buttonGroups = [
      {
        title: '標準関数',
        color: '#38bdf8',
        buttons: [
          { label: '(', text: '(', },
          { label: ')', text: ')', },
          { label: '+', text: '+', },
          { label: '−', text: '-', },
          { label: '×', text: '*', },
          { label: '÷', text: '/', },
          { label: '^', text: '^', },
          { label: 'sqrt', text: 'sqrt(', },
          { label: 'nthRoot', text: 'nthRoot(', },
          { label: 'abs', text: 'abs(', },
          { label: 'exp', text: 'exp(', },
          { label: 'log', text: 'log(', },
          { label: 'ln', text: 'ln(', },
          { label: 'derivative', text: 'derivative(', },
          { label: 'integral', text: 'integral(', },
          { label: 'taylor', text: 'taylorSeries(', }
        ]
      },
      {
        title: '三角・双曲線',
        color: '#a855f7',
        buttons: [
          { label: 'sin', text: 'sin(', },
          { label: 'cos', text: 'cos(', },
          { label: 'tan', text: 'tan(', },
          { label: 'asin', text: 'asin(', },
          { label: 'acos', text: 'acos(', },
          { label: 'atan', text: 'atan(', },
          { label: 'atan2', text: 'atan2(', },
          { label: 'sinh', text: 'sinh(', },
          { label: 'cosh', text: 'cosh(', },
          { label: 'tanh', text: 'tanh(', }
        ]
      },
      {
        title: '複素数・行列',
        color: '#f97316',
        buttons: [
          { label: 'i', text: 'i', },
          { label: 'conj', text: 'conj(', },
          { label: 're', text: 're(', },
          { label: 'im', text: 'im(', },
          { label: 'arg', text: 'arg(', },
          { label: 'det', text: 'det(', },
          { label: 'trace', text: 'trace(', },
          { label: 'transpose', text: 'transpose(', },
          { label: 'solveLinear', text: 'solveLinear(', },
          { label: 'eigenvalues', text: 'eigs(', }
        ]
      },
      {
        title: '解析・特殊関数',
        color: '#34d399',
        buttons: [
          { label: 'factorial', text: 'factorial(', },
          { label: 'gamma', text: 'gamma(', },
          { label: 'digamma', text: 'digamma(', },
          { label: 'polygamma', text: 'polygamma(', },
          { label: 'beta', text: 'beta(', },
          { label: 'zeta', text: 'zeta(', },
          { label: 'harmonic', text: 'harmonic(', },
          { label: 'comb', text: 'combinations(', },
          { label: 'perm', text: 'permutations(', },
          { label: 'sum', text: 'sum(', },
          { label: 'product', text: 'prod(', },
          { label: 'Fourier', text: 'fft(', },
          { label: 'tetra', text: 'tetra(', },
          { label: 'slog', text: 'slog(', }
        ]
      },
      {
        title: '数値解法',
        color: '#fb7185',
        buttons: [
          { label: 'solveEq', text: 'solveEq(', },
          { label: 'solveSystem', text: 'solveSystem(', },
          { label: 'numericIntegrate', text: 'numericIntegrate(', },
          { label: 'minimize', text: 'minimize(', },
          { label: 'maximize', text: 'maximize(', }
        ]
      },
      {
        title: '定数・単位',
        color: '#facc15',
        buttons: [
          { label: 'π', text: 'pi', },
          { label: 'e', text: 'e', },
          { label: 'φ', text: '(1+sqrt(5))/2', },
          { label: 'c', text: 'c', },
          { label: 'G', text: 'G', },
          { label: 'ℏ', text: 'hbar', },
          { label: 'deg', text: 'deg', },
          { label: 'rad', text: 'rad', },
          { label: 'kg', text: 'kg', },
          { label: 'm', text: 'm', }
        ]
      }
    ];

    function cloneScope(source = scope){
      const target = Object.create(null);
      if (!source) return target;
      Object.keys(source).forEach(key => {
        target[key] = source[key];
      });
      return target;
    }

    function compileExpression(expr){
      if (expr && typeof expr.evaluate === 'function') return expr;
      if (typeof expr === 'string') {
        return math.parse(expr);
      }
      throw new Error('式を解釈できませんでした。文字列または math.js のノードを渡してください。');
    }

    function normalizeEquation(expr){
      if (typeof expr !== 'string') return expr;
      if (!expr.includes('=')) return expr;
      const [lhs, rhs] = expr.split('=').map(part => part.trim());
      if (lhs && rhs) {
        return `(${lhs}) - (${rhs})`;
      }
      return expr;
    }

    function ensureFiniteNumber(value){
      if (typeof value === 'number') {
        if (!Number.isFinite(value)) throw new Error('有限の数値ではありません。');
        return value;
      }
      if (mathRef && mathRef.isBigNumber && mathRef.isBigNumber(value)) {
        const num = value.toNumber();
        if (!Number.isFinite(num)) throw new Error('有限の数値ではありません。');
        return num;
      }
      if (mathRef && mathRef.isFraction && mathRef.isFraction(value)) {
        return value.valueOf();
      }
      if (mathRef && mathRef.isComplex && mathRef.isComplex(value)) {
        if (Math.abs(value.im) > 1e-10) {
          const err = new Error('複素数は実数部のみを使用できません。');
          err.code = 'COMPLEX';
          throw err;
        }
        return value.re;
      }
      if (mathRef && mathRef.isMatrix && mathRef.isMatrix(value)) {
        const err = new Error('行列はスカラーに変換できません。');
        err.code = 'MATRIX';
        throw err;
      }
      if (Array.isArray(value)) {
        const err = new Error('配列はスカラーに変換できません。');
        err.code = 'ARRAY';
        throw err;
      }
      const num = Number(value);
      if (!Number.isFinite(num)) throw new Error('数値へ変換できませんでした。');
      return num;
    }

    function buildKeypad(){
      buttonGroups.forEach(group => {
        const section = document.createElement('div');
        Object.assign(section.style, {
          background: 'linear-gradient(135deg, rgba(30,41,59,0.45), rgba(15,23,42,0.32))',
          borderRadius: '16px',
          border: '1px solid rgba(148,163,184,0.12)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        });

        const header = document.createElement('div');
        header.textContent = group.title;
        Object.assign(header.style, {
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '0.3px',
          color: group.color
        });

        const grid = document.createElement('div');
        Object.assign(grid.style, {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '8px'
        });

        group.buttons.forEach(btnDef => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = btnDef.label;
          Object.assign(btn.style, {
            padding: '11px 8px',
            borderRadius: '10px',
            border: '1px solid rgba(148,163,184,0.24)',
            background: 'linear-gradient(135deg, rgba(23,37,84,0.55), rgba(15,23,42,0.55))',
            color: '#f8fafc',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 12px 24px rgba(8,12,24,0.32)',
            transition: 'transform 0.12s ease, box-shadow 0.12s ease'
          });
          btn.addEventListener('pointerenter', () => {
            btn.style.transform = 'translateY(-2px) scale(1.02)';
            btn.style.boxShadow = '0 20px 36px rgba(8,12,24,0.45)';
          });
          btn.addEventListener('pointerleave', () => {
            btn.style.transform = 'translateY(0) scale(1)';
            btn.style.boxShadow = '0 12px 24px rgba(8,12,24,0.32)';
          });
          btn.addEventListener('click', () => insertText(btnDef.text));
          grid.appendChild(btn);
        });

        section.appendChild(header);
        section.appendChild(grid);
        keypadPanel.appendChild(section);
      });

      const favorites = document.createElement('div');
      Object.assign(favorites.style, {
        marginTop: 'auto',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(15,23,42,0.4))',
        borderRadius: '18px',
        border: '1px solid rgba(59,130,246,0.25)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      });
      const favTitle = document.createElement('div');
      favTitle.textContent = 'ユニット変換テンプレ';
      Object.assign(favTitle.style, {
        fontSize: '14px',
        letterSpacing: '0.4px',
        color: '#60a5fa',
        fontWeight: '600'
      });

      unitSelect = document.createElement('select');
      Object.assign(unitSelect.style, {
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(96,165,250,0.45)',
        background: 'rgba(15,23,42,0.6)',
        color: '#dbeafe',
        fontSize: '13px'
      });
      const unitTemplates = [
        { label: '長さ: 5 cm → inch', expr: '5 cm to inch' },
        { label: '重さ: 70 kg → lb', expr: '70 kg to pound' },
        { label: 'エネルギー: 1 kWh → J', expr: '1 kWh to J' },
        { label: '温度: 25 degC → degF', expr: '25 degC to degF' },
        { label: '速度: 100 km/h → m/s', expr: '100 km/h to m/s' }
      ];
      unitTemplates.forEach(t => {
        const option = document.createElement('option');
        option.value = t.expr;
        option.textContent = t.label;
        unitSelect.appendChild(option);
      });
      const unitBtn = document.createElement('button');
      unitBtn.type = 'button';
      unitBtn.textContent = '挿入';
      Object.assign(unitBtn.style, {
        padding: '10px 0',
        borderRadius: '10px',
        border: '1px solid rgba(59,130,246,0.5)',
        background: 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(14,116,144,0.5))',
        color: '#f8fafc',
        fontSize: '13px',
        cursor: 'pointer'
      });
      unitBtn.addEventListener('click', () => {
        insertText(unitSelect.value);
      });

      favorites.appendChild(favTitle);
      favorites.appendChild(unitSelect);
      favorites.appendChild(unitBtn);
      keypadPanel.appendChild(favorites);
    }

    function buildWorkspace(){
      const topBar = document.createElement('div');
      Object.assign(topBar.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'linear-gradient(135deg, rgba(30,41,59,0.5), rgba(15,23,42,0.45))',
        borderRadius: '16px',
        border: '1px solid rgba(148,163,184,0.18)'
      });

      const angleGroup = document.createElement('div');
      Object.assign(angleGroup.style, {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        fontSize: '13px'
      });

      angleToggleRad = buildToggle('Radians', true, () => setAngleMode(true));
      angleToggleDeg = buildToggle('Degrees', false, () => setAngleMode(false));

      angleGroup.appendChild(angleToggleRad.wrapper);
      angleGroup.appendChild(angleToggleDeg.wrapper);

      statusBar = document.createElement('div');
      Object.assign(statusBar.style, {
        fontSize: '12px',
        color: '#cbd5f5',
        letterSpacing: '0.3px'
      });
      statusBar.textContent = '準備中…';

      topBar.appendChild(angleGroup);
      topBar.appendChild(statusBar);

      const worksheet = document.createElement('div');
      Object.assign(worksheet.style, {
        background: 'linear-gradient(180deg, rgba(15,23,42,0.45), rgba(8,11,23,0.65))',
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.15)',
        padding: '18px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: '14px'
      });

      const worksheetHeader = document.createElement('div');
      worksheetHeader.textContent = 'ワークシート';
      Object.assign(worksheetHeader.style, {
        fontSize: '14px',
        color: '#93c5fd',
        letterSpacing: '0.4px',
        fontWeight: '600'
      });

      const inputModeSwitch = document.createElement('div');
      Object.assign(inputModeSwitch.style, {
        display: 'inline-flex',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid rgba(148,163,184,0.28)',
        alignSelf: 'flex-start'
      });

      expressionModeToggleClassic = buildSegmentToggle('関数表記', () => setExpressionMode('classic'));
      expressionModeTogglePretty = buildSegmentToggle('数学記号', () => setExpressionMode('pretty'));
      inputModeSwitch.appendChild(expressionModeToggleClassic.button);
      inputModeSwitch.appendChild(expressionModeTogglePretty.button);

      expressionInputClassic = document.createElement('textarea');
      expressionInputClassic.placeholder = '式やコマンドを入力 (例: integrate(sin(x), x), solveEq(sin(x)=0.5, x, 1), solveSystem(["x+y=3","x-y=1"],["x","y"]))';
      Object.assign(expressionInputClassic.style, {
        minHeight: '110px',
        resize: 'vertical',
        borderRadius: '14px',
        border: '1px solid rgba(148,163,184,0.22)',
        padding: '14px',
        fontSize: '15px',
        fontFamily: '"Fira Code", "Cascadia Code", monospace',
        background: 'rgba(15,23,42,0.65)',
        color: '#f8fafc'
      });

      expressionInputPretty = document.createElement('textarea');
      expressionInputPretty.placeholder = '例: √(2) + 1/3, 2π, (x+1)/(x−1) など数学記号で入力';
      Object.assign(expressionInputPretty.style, {
        minHeight: '110px',
        resize: 'vertical',
        borderRadius: '14px',
        border: '1px solid rgba(148,163,184,0.22)',
        padding: '14px',
        fontSize: '16px',
        fontFamily: '"Noto Sans JP", "Yu Gothic", sans-serif',
        background: 'rgba(15,23,42,0.65)',
        color: '#f8fafc',
        display: 'none'
      });

      expressionInput = expressionInputClassic;

      const worksheetButtons = document.createElement('div');
      Object.assign(worksheetButtons.style, {
        display: 'flex',
        gap: '12px'
      });

      evalButton = buildPrimaryButton('計算 (Shift+Enter)', '#4ade80');
      evalButton.addEventListener('click', evaluateExpression);

      clearButton = buildPrimaryButton('リセット', '#60a5fa');
      clearButton.addEventListener('click', clearWorksheet);

      const copyButton = buildPrimaryButton('結果をコピー', '#f97316');
      copyButton.addEventListener('click', () => {
        const result = resultMode === 'numeric'
          ? approxResultEl?.dataset.rawValue
          : exactResultEl?.dataset.rawValue;
        if (result) {
          navigator.clipboard?.writeText(result).then(() => notifyStatus('結果をクリップボードにコピーしました。')).catch(() => notifyStatus('コピーに失敗しました…'));
        }
      });

      worksheetButtons.appendChild(evalButton);
      worksheetButtons.appendChild(clearButton);
      worksheetButtons.appendChild(copyButton);

      const resultCard = document.createElement('div');
      Object.assign(resultCard.style, {
        borderRadius: '16px',
        border: '1px solid rgba(74,222,128,0.35)',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(15,118,110,0.12))',
        padding: '16px',
        display: 'grid',
        gap: '10px'
      });
      const resultTitle = document.createElement('div');
      resultTitle.textContent = '結果';
      Object.assign(resultTitle.style, {
        fontSize: '14px',
        color: '#bbf7d0',
        letterSpacing: '0.4px'
      });
      const resultModeSwitch = document.createElement('div');
      Object.assign(resultModeSwitch.style, {
        display: 'inline-flex',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid rgba(16,185,129,0.35)',
        alignSelf: 'flex-start'
      });
      resultToggleSymbolic = buildSegmentToggle('分数/記号', () => setResultMode('symbolic'), '#0f766e');
      resultToggleNumeric = buildSegmentToggle('小数', () => setResultMode('numeric'), '#0f766e');
      resultModeSwitch.appendChild(resultToggleSymbolic.button);
      resultModeSwitch.appendChild(resultToggleNumeric.button);
      exactResultEl = document.createElement('div');
      approxResultEl = document.createElement('div');
      [exactResultEl, approxResultEl].forEach(el => {
        Object.assign(el.style, {
          fontFamily: '"Fira Code", monospace',
          background: 'rgba(15,23,42,0.45)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '15px'
        });
        el.textContent = '—';
      });

      resultSubLabelExact = document.createElement('div');
      resultSubLabelExact.textContent = 'Exact / Symbolic';
      Object.assign(resultSubLabelExact.style, { fontSize: '12px', color: '#a7f3d0', letterSpacing: '0.3px' });
      resultSubLabelApprox = document.createElement('div');
      resultSubLabelApprox.textContent = 'Approximate (10進)';
      Object.assign(resultSubLabelApprox.style, { fontSize: '12px', color: '#a7f3d0', letterSpacing: '0.3px' });

      resultCard.appendChild(resultTitle);
      resultCard.appendChild(resultModeSwitch);
      resultCard.appendChild(resultSubLabelExact);
      resultCard.appendChild(exactResultEl);
      resultCard.appendChild(resultSubLabelApprox);
      resultCard.appendChild(approxResultEl);
      moreDigitsButton = document.createElement('button');
      moreDigitsButton.textContent = 'More Digits';
      moreDigitsButton.title = '小数表示を+5桁拡張';
      Object.assign(moreDigitsButton.style, {
        justifySelf: 'flex-end',
        padding: '6px 14px',
        borderRadius: '999px',
        border: '1px solid rgba(59,130,246,0.35)',
        background: 'rgba(15,23,42,0.6)',
        color: '#bfdbfe',
        cursor: 'pointer',
        fontSize: '12px',
        letterSpacing: '0.3px',
        display: 'none'
      });
      moreDigitsButton.addEventListener('click', () => {
        const nextDigits = Math.min(MAX_DECIMAL_DIGITS, approxDigitsShown + DECIMAL_DIGIT_STEP);
        if (nextDigits !== approxDigitsShown) {
          approxDigitsShown = nextDigits;
          updateApproxDisplay();
          if (latestHistoryEntry && approxResultEl?.dataset?.rawValue) {
            latestHistoryEntry.approx = approxResultEl.dataset.rawValue;
            updateHistory();
          }
        }
        if (!approxHasMoreDigits && moreDigitsButton) {
          moreDigitsButton.style.display = 'none';
        }
      });
      resultCard.appendChild(moreDigitsButton);

      worksheet.appendChild(worksheetHeader);
      worksheet.appendChild(inputModeSwitch);
      worksheet.appendChild(expressionInputClassic);
      worksheet.appendChild(expressionInputPretty);
      worksheet.appendChild(worksheetButtons);
      worksheet.appendChild(resultCard);

      const midPanel = document.createElement('div');
      Object.assign(midPanel.style, {
        display: 'grid',
        gridTemplateColumns: '1fr 240px',
        gap: '16px',
        minHeight: '0'
      });

      const historyCard = document.createElement('div');
      Object.assign(historyCard.style, {
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.14)',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.45), rgba(15,23,42,0.55))',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '0'
      });
      const historyTitle = document.createElement('div');
      historyTitle.textContent = '計算履歴';
      Object.assign(historyTitle.style, {
        fontSize: '14px',
        color: '#cbd5f5',
        marginBottom: '10px'
      });

      const historyTable = document.createElement('div');
      Object.assign(historyTable.style, {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        fontSize: '12px',
        color: '#e2e8f0',
        flex: '1 1 auto',
        overflowY: 'auto',
        paddingRight: '6px'
      });
      historyBody = historyTable;

      historyCard.appendChild(historyTitle);
      historyCard.appendChild(historyTable);

      const variableCard = document.createElement('div');
      Object.assign(variableCard.style, {
        borderRadius: '18px',
        border: '1px solid rgba(96,165,250,0.28)',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(17,24,39,0.55))',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      });
      const variableTitle = document.createElement('div');
      variableTitle.textContent = 'スコープ変数';
      Object.assign(variableTitle.style, {
        fontSize: '13px',
        color: '#bfdbfe',
        letterSpacing: '0.4px'
      });
      variableList = document.createElement('div');
      Object.assign(variableList.style, {
        fontFamily: '"Fira Code", monospace',
        fontSize: '12px',
        display: 'grid',
        gap: '6px',
        maxHeight: '220px',
        overflowY: 'auto'
      });

      const variableReset = buildPrimaryButton('変数をクリア', '#f87171');
      variableReset.addEventListener('click', () => {
        scope = { ans: 0 };
        updateVariables();
        notifyStatus('スコープを初期化しました。');
      });

      variableCard.appendChild(variableTitle);
      variableCard.appendChild(variableList);
      variableCard.appendChild(variableReset);

      midPanel.appendChild(historyCard);
      midPanel.appendChild(variableCard);

      const graphCard = document.createElement('div');
      Object.assign(graphCard.style, {
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.15)',
        background: 'linear-gradient(135deg, rgba(12,74,110,0.25), rgba(15,23,42,0.55))',
        padding: '18px',
        display: 'grid',
        gap: '12px'
      });
      const graphHeader = document.createElement('div');
      graphHeader.textContent = 'グラフ表示';
      Object.assign(graphHeader.style, {
        fontSize: '14px',
        color: '#bae6fd',
        letterSpacing: '0.4px'
      });

      graphInput = document.createElement('input');
      graphInput.placeholder = 'f(x) を入力 (例: sin(x) / x)';
      Object.assign(graphInput.style, {
        borderRadius: '12px',
        border: '1px solid rgba(148,163,184,0.22)',
        padding: '12px',
        background: 'rgba(15,23,42,0.6)',
        color: '#f8fafc',
        fontSize: '14px',
        fontFamily: '"Fira Code", monospace'
      });

      const graphControls = document.createElement('div');
      Object.assign(graphControls.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '10px'
      });

      graphXMin = document.createElement('input');
      graphXMin.type = 'number';
      graphXMin.value = '-10';
      graphXMax = document.createElement('input');
      graphXMax.type = 'number';
      graphXMax.value = '10';
      [graphXMin, graphXMax].forEach(inp => {
        Object.assign(inp.style, {
          borderRadius: '10px',
          border: '1px solid rgba(148,163,184,0.2)',
          padding: '10px',
          background: 'rgba(15,23,42,0.6)',
          color: '#e0f2fe',
          fontSize: '13px'
        });
      });

      plotButton = buildPrimaryButton('グラフ描画', '#38bdf8');
      plotButton.addEventListener('click', plotGraph);

      graphControls.appendChild(graphXMin);
      graphControls.appendChild(graphXMax);
      graphControls.appendChild(plotButton);

      graphCanvas = document.createElement('canvas');
      graphCanvas.width = 640;
      graphCanvas.height = 240;
      Object.assign(graphCanvas.style, {
        width: '100%',
        height: '240px',
        background: 'rgba(8,11,23,0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(148,163,184,0.2)'
      });

      graphMessage = document.createElement('div');
      Object.assign(graphMessage.style, {
        fontSize: '12px',
        color: '#bae6fd',
        letterSpacing: '0.3px'
      });
      graphMessage.textContent = 'x軸・y軸は自動スケール。単位付き値・ベクトル・複素数の虚部は除外されます。';

      graphCard.appendChild(graphHeader);
      graphCard.appendChild(graphInput);
      const rangeLabel = document.createElement('div');
      rangeLabel.textContent = '範囲 (xmin, xmax)';
      Object.assign(rangeLabel.style, { fontSize: '12px', color: '#cbd5f5' });
      graphCard.appendChild(rangeLabel);
      graphCard.appendChild(graphControls);
      graphCard.appendChild(graphCanvas);
      graphCard.appendChild(graphMessage);

      workspace.appendChild(topBar);
      workspace.appendChild(worksheet);
      workspace.appendChild(midPanel);
      workspace.appendChild(graphCard);

      attachShiftEnterListener(expressionInputClassic);
      attachShiftEnterListener(expressionInputPretty);
      expressionInputPretty.addEventListener('input', syncClassicFromPretty);
      expressionInputPretty.addEventListener('change', syncClassicFromPretty);
      setExpressionMode('classic', true);
      setResultMode('symbolic', true);
    }

    function buildPrimaryButton(label, accent){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      Object.assign(btn.style, {
        padding: '12px 16px',
        borderRadius: '12px',
        border: `1px solid ${accent}44`,
        background: `linear-gradient(135deg, ${accent}40, rgba(15,23,42,0.6))`,
        color: '#f8fafc',
        fontSize: '13px',
        letterSpacing: '0.3px',
        cursor: 'pointer',
        boxShadow: '0 12px 24px rgba(8,12,24,0.32)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease'
      });
      btn.addEventListener('pointerenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 18px 36px rgba(8,12,24,0.45)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 12px 24px rgba(8,12,24,0.32)';
      });
      return btn;
    }

    function buildSegmentToggle(label, onClick, accent = '#1d4ed8'){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      Object.assign(btn.style, {
        padding: '8px 16px',
        fontSize: '12px',
        border: 'none',
        background: 'rgba(15,23,42,0.65)',
        color: '#e2e8f0',
        cursor: 'pointer',
        transition: 'background 0.12s ease, color 0.12s ease'
      });
      btn.addEventListener('click', () => onClick());
      const setActive = (active) => {
        btn.style.background = active ? `linear-gradient(135deg, ${accent}66, rgba(15,23,42,0.6))` : 'rgba(15,23,42,0.65)';
        btn.style.color = active ? '#f0fdf4' : '#cbd5f5';
      };
      setActive(false);
      return { button: btn, setActive };
    }

    function attachShiftEnterListener(element){
      if (!element) return;
      element.addEventListener('keydown', evt => {
        if (evt.key === 'Enter' && evt.shiftKey) {
          evt.preventDefault();
          evaluateExpression();
        }
      });
    }

    function syncClassicFromPretty(){
      if (!expressionInputPretty || !expressionInputClassic) return;
      expressionInputClassic.value = convertPrettyToAscii(expressionInputPretty.value);
    }

    function syncPrettyFromClassic(){
      if (!expressionInputPretty || !expressionInputClassic) return;
      expressionInputPretty.value = convertAsciiToPretty(expressionInputClassic.value);
    }

    function setExpressionMode(mode, silent = false){
      if (!expressionInputClassic || !expressionInputPretty) return;
      if (expressionMode === mode && !silent) {
        if (expressionInput) expressionInput.focus();
        return;
      }
      expressionMode = mode;
      if (mode === 'classic') {
        expressionInputClassic.style.display = '';
        expressionInputPretty.style.display = 'none';
        expressionInput = expressionInputClassic;
        syncClassicFromPretty();
        if (!silent) notifyStatus('入力モード: 関数表記');
      } else {
        syncPrettyFromClassic();
        expressionInputClassic.style.display = 'none';
        expressionInputPretty.style.display = '';
        expressionInput = expressionInputPretty;
        if (!silent) notifyStatus('入力モード: 数学記号');
      }
      expressionModeToggleClassic?.setActive(mode === 'classic');
      expressionModeTogglePretty?.setActive(mode === 'pretty');
      try { expressionInput?.focus(); } catch {}
    }

    function setResultMode(mode, silent = false){
      if (resultMode === mode && !silent) {
        updateResultDisplay();
        return;
      }
      resultMode = mode;
      updateResultDisplay();
      if (!silent) {
        notifyStatus(mode === 'symbolic' ? '結果表示: 分数/記号モード' : '結果表示: 小数モード');
      }
    }

    function updateResultDisplay(){
      if (!exactResultEl || !approxResultEl) return;
      const showSymbolic = resultMode !== 'numeric';
      exactResultEl.style.display = showSymbolic ? 'block' : 'none';
      approxResultEl.style.display = showSymbolic ? 'none' : 'block';
      if (resultSubLabelExact) resultSubLabelExact.style.display = showSymbolic ? 'block' : 'none';
      if (resultSubLabelApprox) resultSubLabelApprox.style.display = showSymbolic ? 'none' : 'block';
      resultToggleSymbolic?.setActive(showSymbolic);
      resultToggleNumeric?.setActive(!showSymbolic);
      updateApproxDisplay();
      updateHistory();
    }

    function buildToggle(label, activeState, onClick){
      const wrapper = document.createElement('div');
      Object.assign(wrapper.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        borderRadius: '999px',
        border: '1px solid rgba(148,163,184,0.3)',
        cursor: 'pointer',
        background: activeState ? 'rgba(59,130,246,0.28)' : 'rgba(15,23,42,0.55)'
      });
      const dot = document.createElement('span');
      Object.assign(dot.style, {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: activeState ? '#38bdf8' : '#94a3b8',
        transition: 'background 0.12s ease'
      });
      const text = document.createElement('span');
      text.textContent = label;
      Object.assign(text.style, {
        fontSize: '12px'
      });
      wrapper.appendChild(dot);
      wrapper.appendChild(text);
      wrapper.addEventListener('click', () => {
        onClick();
      });
      return { wrapper, dot, setActive: (state) => {
        wrapper.style.background = state ? 'rgba(59,130,246,0.28)' : 'rgba(15,23,42,0.55)';
        dot.style.background = state ? '#38bdf8' : '#94a3b8';
      }};
    }

    function setAngleMode(rad){
      if (radianMode === rad) return;
      radianMode = rad;
      angleToggleRad.setActive(rad);
      angleToggleDeg.setActive(!rad);
      notifyStatus(rad ? '角度単位: ラジアン' : '角度単位: 度');
    }

    function insertText(text){
      if (!expressionInput) return;
      const target = expressionInput;
      const valueToInsert = expressionMode === 'pretty' ? beautifySymbols(text) : text;
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const before = target.value.slice(0, start);
      const after = target.value.slice(end);
      target.value = before + valueToInsert + after;
      const pos = start + valueToInsert.length;
      target.selectionStart = pos;
      target.selectionEnd = pos;
      target.focus();
      if (expressionMode === 'pretty') {
        syncClassicFromPretty();
      } else {
        syncPrettyFromClassic();
      }
    }

    function notifyStatus(message){
      if (!statusBar) return;
      const now = new Date();
      statusBar.textContent = `${now.toLocaleTimeString()} — ${message}`;
    }

    function updateVariables(){
      if (!variableList) return;
      variableList.innerHTML = '';
      Object.keys(scope)
        .filter(key => key !== 'ans')
        .forEach(key => {
          const row = document.createElement('div');
          row.textContent = `${key} = ${formatValue(scope[key])}`;
          variableList.appendChild(row);
        });
      if (variableList.childElementCount === 0) {
        const empty = document.createElement('div');
        empty.textContent = '（変数は未定義）';
        empty.style.color = '#94a3b8';
        variableList.appendChild(empty);
      }
    }

    function updateHistory(){
      if (!historyBody) return;
      historyBody.innerHTML = '';
      history.slice(-80).forEach(item => {
        const exprCell = document.createElement('div');
        exprCell.textContent = item.expr;
        exprCell.style.opacity = '0.85';
        const resultCell = document.createElement('div');
        resultCell.textContent = resultMode === 'numeric' ? item.approx : item.symbolic;
        resultCell.style.fontFamily = '"Fira Code", monospace';
        historyBody.appendChild(exprCell);
        historyBody.appendChild(resultCell);
      });
      if (historyBody.childElementCount === 0) {
        const placeholder = document.createElement('div');
        placeholder.textContent = 'ここに計算履歴が表示されます。';
        placeholder.style.color = '#94a3b8';
        historyBody.appendChild(placeholder);
      }
    }

    function clearWorksheet(){
      if (expressionInputClassic) expressionInputClassic.value = '';
      if (expressionInputPretty) expressionInputPretty.value = '';
      setResults(null, null);
      notifyStatus('ワークシートをクリアしました。');
    }

    function setResults(exact, approx){
      if (!exactResultEl || !approxResultEl) return;
      if (exact == null) {
        exactResultEl.textContent = '—';
        approxResultEl.textContent = '—';
        delete exactResultEl.dataset.rawValue;
        delete approxResultEl.dataset.rawValue;
        approxRawValue = null;
        approxManualText = null;
        approxDigitsShown = DEFAULT_DECIMAL_DIGITS;
        approxHasMoreDigits = false;
        approxForceEllipsis = false;
        latestHistoryEntry = null;
        if (moreDigitsButton) moreDigitsButton.style.display = 'none';
        updateResultDisplay();
        return;
      }
      const symbolicText = exact ?? '—';
      exactResultEl.textContent = symbolicText;
      exactResultEl.dataset.rawValue = symbolicText;
      approxDigitsShown = DEFAULT_DECIMAL_DIGITS;
      approxHasMoreDigits = false;
      approxForceEllipsis = false;
      if (typeof approx === 'string') {
        approxManualText = approx ?? '—';
        approxRawValue = null;
      } else if (canUseDynamicDigits(approx)) {
        approxManualText = null;
        approxRawValue = approx;
      } else {
        approxManualText = formatApproxValue(approx);
        approxRawValue = null;
      }
      updateResultDisplay();
    }

    function drawGraph(points, xRange, yRange){
      const ctx = graphCanvas.getContext('2d');
      ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
      const width = graphCanvas.width;
      const height = graphCanvas.height;
      ctx.fillStyle = 'rgba(8,11,23,0.9)';
      ctx.fillRect(0, 0, width, height);

      const xMin = xRange[0];
      const xMax = xRange[1];
      const yMin = yRange[0];
      const yMax = yRange[1];

      const xZero = (0 - xMin) / (xMax - xMin) * width;
      const yZero = height - ((0 - yMin) / (yMax - yMin) * height);

      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yZero);
      ctx.lineTo(width, yZero);
      ctx.moveTo(xZero, 0);
      ctx.lineTo(xZero, height);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((pt, idx) => {
        const px = (pt.x - xMin) / (xMax - xMin) * width;
        const py = height - ((pt.y - yMin) / (yMax - yMin) * height);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    const FRACTION_CHAR_MAP = {
      '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4',
      '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5',
      '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8'
    };

    const SUPERSCRIPT_DIGITS = {
      '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
      '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
      '⁺': '+', '⁻': '-'
    };

    function convertPrettyToAscii(input){
      if (input == null) return '';
      let expr = String(input);
      expr = expr.replace(/\r/g, '');
      Object.entries(FRACTION_CHAR_MAP).forEach(([char, value]) => {
        expr = expr.split(char).join(value);
      });
      expr = expr.replace(/([A-Za-z0-9_\)\]])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+)/g, (_, base, supers) => {
        const digits = supers.split('').map(ch => SUPERSCRIPT_DIGITS[ch] ?? '').join('');
        if (!digits) return base;
        return base + '^' + (digits.length > 1 ? `(${digits})` : digits);
      });
      expr = expr.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, ch => SUPERSCRIPT_DIGITS[ch] ?? '');
      expr = expr
        .replace(/[×∙·]/g, '*')
        .replace(/[÷∕]/g, '/')
        .replace(/[−–—]/g, '-')
        .replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)')
        .replace(/√\s*([A-Za-z0-9_πΠｅℯφΦ\.]+)/g, 'sqrt($1)')
        .replace(/∛\s*\(([^)]+)\)/g, 'nthRoot($1,3)')
        .replace(/∛\s*([A-Za-z0-9_πΠｅℯφΦ\.]+)/g, 'nthRoot($1,3)')
        .replace(/∜\s*\(([^)]+)\)/g, 'nthRoot($1,4)')
        .replace(/∜\s*([A-Za-z0-9_πΠｅℯφΦ\.]+)/g, 'nthRoot($1,4)');
      expr = expr.replace(/[πΠ]/g, 'pi');
      expr = expr.replace(/[ｅℯ]/g, 'e');
      expr = expr.replace(/[φΦ]/g, '(1+sqrt(5))/2');
      expr = expr.replace(/\u2044/g, '/');
      expr = expr.replace(/\s+/g, ' ');
      return expr.trim();
    }

    function beautifySymbols(value){
      if (value == null) return '';
      let output = String(value);
      output = output.replace(/nthRoot\(([^,]+),\s*2\)/g, '√($1)');
      output = output.replace(/nthRoot\(([^,]+),\s*3\)/g, '∛($1)');
      output = output.replace(/nthRoot\(([^,]+),\s*4\)/g, '∜($1)');
      output = output.replace(/\bpi\b/g, 'π');
      output = output.replace(/sqrt\(/g, '√(');
      output = output.replace(/\bphi\b/g, 'φ');
      output = output.replace(/\*/g, '·');
      output = output.replace(/\s*\/\s*/g, '/');
      return output;
    }

    function convertAsciiToPretty(input){
      if (input == null) return '';
      return beautifySymbols(input);
    }

    function convertForNumeric(value){
      if (value == null) return value;
      if (!mathRef) return value;
      if (mathRef.isFraction && mathRef.isFraction(value)) {
        try { return numericMath?.bignumber ? numericMath.bignumber(value.valueOf()) : value.valueOf(); }
        catch { return value.valueOf(); }
      }
      if (mathRef.isBigNumber && mathRef.isBigNumber(value)) {
        try { return numericMath?.bignumber ? numericMath.bignumber(value.toString()) : value.toNumber(); }
        catch { return value.toNumber(); }
      }
      if (mathRef.isComplex && mathRef.isComplex(value)) {
        const re = convertForNumeric(value.re);
        const im = convertForNumeric(value.im);
        if (numericMath && numericMath.complex) return numericMath.complex(re, im);
        return { re, im };
      }
      if (mathRef.isMatrix && mathRef.isMatrix(value)) {
        return value.toArray().map(item => convertForNumeric(item));
      }
      if (mathRef.isUnit && mathRef.isUnit(value)) {
        return typeof value.clone === 'function' ? value.clone() : value;
      }
      if (Array.isArray(value)) {
        return value.map(item => convertForNumeric(item));
      }
      if (typeof value === 'object') {
        return value;
      }
      if (numericMath?.bignumber && typeof value === 'number' && Number.isFinite(value)) {
        try { return numericMath.bignumber(value); } catch { return value; }
      }
      return value;
    }

    function buildNumericScope(source){
      const target = Object.create(null);
      if (!source) return target;
      Object.keys(source).forEach(key => {
        target[key] = convertForNumeric(source[key]);
      });
      return target;
    }

    function formatApproxValue(value){
      if (value == null) return 'null';
      if (!numericMath) return beautifySymbols(String(value));
      if (numericMath.isMatrix && numericMath.isMatrix(value)) {
        return value.toString();
      }
      if (numericMath.isUnit && numericMath.isUnit(value)) {
        return value.toString();
      }
      if (numericMath.isFraction && numericMath.isFraction(value)) {
        return numericMath.format(value.valueOf(), { precision: 14 });
      }
      if (numericMath.isBigNumber && numericMath.isBigNumber(value)) {
        return numericMath.format(value, { precision: 14 });
      }
      if (numericMath.isComplex && numericMath.isComplex(value)) {
        const reNum = typeof value.re === 'number' ? value.re : numericMath.number ? numericMath.number(value.re) : Number(value.re);
        const imNum = typeof value.im === 'number' ? value.im : numericMath.number ? numericMath.number(value.im) : Number(value.im);
        const reStr = numericMath.format(reNum, { precision: 12 });
        const imAbs = Math.abs(imNum);
        if (imAbs < 1e-14) {
          return reStr;
        }
        const imStr = numericMath.format(imAbs, { precision: 12 });
        const sign = imNum >= 0 ? '+' : '−';
        return `${reStr} ${sign} ${imStr}i`;
      }
      if (Array.isArray(value)) {
        return `[${value.map(formatApproxValue).join(', ')}]`;
      }
      if (typeof value === 'number') {
        return numericMath.format(value, { precision: 14 });
      }
      try {
        return numericMath.format(value, { precision: 14 });
      } catch {
        return beautifySymbols(String(value));
      }
    }

    function canUseDynamicDigits(value){
      if (value == null || !numericMath) return false;
      if (typeof value === 'number') return Number.isFinite(value);
      if (math?.isFraction?.(value)) return true;
      if (math?.isBigNumber?.(value)) return true;
      if (numericMath.isBigNumber?.(value)) return true;
      return false;
    }

    function coerceToBigNumber(value){
      if (!numericMath) return null;
      if (numericMath.isBigNumber?.(value)) return value;
      if (math?.isBigNumber?.(value)) {
        try { return numericMath.bignumber(value.toNumber()); } catch { return null; }
      }
      if (math?.isFraction?.(value)) {
        try { return numericMath.bignumber(value.valueOf()); } catch { return null; }
      }
      if (typeof value === 'number') {
        if (!Number.isFinite(value)) return null;
        try { return numericMath.bignumber(value); } catch { return null; }
      }
      return null;
    }

    function normalizeFixedDecimal(str){
      if (typeof str !== 'string') return str;
      if (!str.includes('.')) return str;
      let cleaned = str.replace(/(\.\d*?[1-9])0+$/, '$1');
      cleaned = cleaned.replace(/\.0+$/, '');
      return cleaned;
    }

    function formatDecimalWithDigits(value, digits){
      const bn = coerceToBigNumber(value);
      if (!bn) return null;
      const precision = Math.max(1, Math.min(MAX_DECIMAL_DIGITS, Math.max(digits | 0, 1)));
      const options = { notation: 'fixed', precision, lowerExp: -200, upperExp: 200 };
      try {
        return normalizeFixedDecimal(numericMath.format(bn, options));
      } catch (err) {
        try {
          return normalizeFixedDecimal(numericMath.format(bn, { precision }));
        } catch {
          return null;
        }
      }
    }

    function computeApproxDisplay(value, digits){
      const base = formatDecimalWithDigits(value, digits);
      if (!base) {
        return { baseText: formatApproxValue(value), hasMore: false, hasDecimal: false, fractionLength: 0 };
      }
      let hasMore = false;
      if (digits < MAX_DECIMAL_DIGITS) {
        const extended = formatDecimalWithDigits(value, Math.min(MAX_DECIMAL_DIGITS, digits + DECIMAL_DIGIT_STEP));
        hasMore = !!extended && extended !== base;
      }
      const hasDecimal = base.includes('.');
      return { baseText: base, hasMore, hasDecimal };
    }

    function updateApproxDisplay(){
      if (!approxResultEl) return;
      if (approxManualText != null) {
        approxResultEl.textContent = approxManualText;
        approxResultEl.dataset.rawValue = approxManualText;
        approxHasMoreDigits = false;
        if (moreDigitsButton) moreDigitsButton.style.display = 'none';
        return;
      }
      if (approxRawValue == null) {
        approxResultEl.textContent = '—';
        approxResultEl.dataset.rawValue = '—';
        approxHasMoreDigits = false;
        if (moreDigitsButton) moreDigitsButton.style.display = 'none';
        return;
      }
      const digits = Math.max(DEFAULT_DECIMAL_DIGITS, Math.min(MAX_DECIMAL_DIGITS, approxDigitsShown | 0));
      const { baseText, hasMore, hasDecimal } = computeApproxDisplay(approxRawValue, digits);
      if (hasMore) approxForceEllipsis = true;
      const showEllipsis = hasMore || (approxForceEllipsis && hasDecimal);
      const displayText = showEllipsis ? `${baseText}...` : baseText;
      approxResultEl.textContent = displayText;
      approxResultEl.dataset.rawValue = displayText;
      approxHasMoreDigits = hasMore;
      if (moreDigitsButton) {
        if (resultMode === 'numeric' && hasMore) {
          moreDigitsButton.style.display = 'inline-flex';
          moreDigitsButton.disabled = false;
        } else {
          moreDigitsButton.style.display = 'none';
        }
      }
    }

    function toNumber(value){
      if (mathRef && mathRef.isUnit && mathRef.isUnit(value)) {
        const json = typeof value.toJSON === 'function' ? value.toJSON() : null;
        if (json && json.unit) {
          try {
            return ensureFiniteNumber(value.toNumber(json.unit));
          } catch {}
        }
        if (typeof value.toSI === 'function') {
          const si = value.toSI();
          if (si && typeof si.valueOf === 'function') {
            return ensureFiniteNumber(si.valueOf());
          }
        }
        const err = new Error('単位付きの値はグラフ化できません。');
        err.code = 'UNIT';
        throw err;
      }
      return ensureFiniteNumber(value);
    }

    function formatValue(value){
      if (value == null) return 'null';
      if (!math) return String(value);
      if (math.isMatrix && math.isMatrix(value)) {
        return value.toString();
      }
      if (math.isUnit && math.isUnit(value)) {
        return value.toString();
      }
      if (math.isComplex && math.isComplex(value)) {
        return value.toString();
      }
      if (math.isBigNumber && math.isBigNumber(value)) {
        return value.toString();
      }
      if (math.isFraction && math.isFraction(value)) {
        return beautifySymbols(value.toFraction(false));
      }
      if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
        return beautifySymbols(String(value));
      }
      if (Array.isArray(value)) {
        return `[${value.map(formatValue).join(', ')}]`;
      }
      if (typeof value === 'object' && value !== null) {
        return beautifySymbols(JSON.stringify(value));
      }
      return beautifySymbols(String(value));
    }

    function computeTetration(base, height){
      const b = Number(math ? math.number(base) : Number(base));
      const h = Number(math ? math.number(height) : Number(height));
      if (!Number.isFinite(b) || !Number.isFinite(h)) {
        throw new Error('tetra は実数引数にのみ対応します。');
      }
      if (h === 0) return 1;
      if (h < 0) {
        return 1 / computeTetration(b, -h);
      }
      const integerPart = Math.floor(h);
      const fracPart = h - integerPart;
      let current;
      if (integerPart === 0) {
        current = 1;
      } else {
        current = b;
        for (let i = 1; i < integerPart; i++) {
          current = Math.pow(b, current);
          if (!Number.isFinite(current)) break;
        }
      }
      if (fracPart === 0 || !Number.isFinite(current)) return current;
      const next = Math.pow(b, current);
      if (!Number.isFinite(next) || current <= 0 || next <= 0) {
        return current + (next - current) * fracPart;
      }
      const logInterp = Math.exp(Math.log(current) * (1 - fracPart) + Math.log(next) * fracPart);
      return logInterp;
    }

    function computeSlog(base, value){
      const b = Number(math ? math.number(base) : Number(base));
      const v = Number(math ? math.number(value) : Number(value));
      if (!Number.isFinite(b) || !Number.isFinite(v) || b <= 0) {
        throw new Error('slog は正の底と実数値に対応します。');
      }
      if (Math.abs(b - 1) < 1e-8) {
        throw new Error('slog の底は 1 から十分に離れた値を指定してください。');
      }
      if (v <= 0) return NaN;
      if (v === 1) return 0;
      let height = 0;
      let current = v;
      const limit = 64;
      while (current > Math.E && height < limit) {
        current = Math.log(current) / Math.log(b);
        height += 1;
      }
      if (current <= 0) return height;
      const frac = Math.log(current) / Math.log(b);
      return height + frac;
    }

    function computeTaylorSeries(expr, variable = 'x', order = 5, center = 0){
      const varName = String(variable);
      const n = Math.max(0, Math.min(32, Math.floor(order)));
      const a = Number(center);
      const expression = compileExpression(expr);
      let derivative = expression;
      const baseScope = cloneScope(scope);
      baseScope[varName] = a;
      const terms = [];
      for (let k = 0; k <= n; k++) {
        const value = ensureFiniteNumber(derivative.evaluate(baseScope));
        const coeff = value / math.factorial(k);
        terms.push({ k, coeff });
        derivative = math.derivative(derivative, varName);
      }
      const formattedTerms = terms.map(term => {
        const coeffStr = math.format(term.coeff, { precision: 12 });
        if (term.k === 0) return coeffStr;
        const base = a === 0 ? varName : `(${varName} - (${math.format(a, { precision: 12 })}))`;
        const power = term.k === 1 ? '' : `^${term.k}`;
        return `${coeffStr} * ${base}${power}`;
      });
      return formattedTerms.join(' + ');
    }

    function adaptiveSimpson(fn, a, b, eps, maxDepth){
      const f = fn;
      function simpson(l, r){
        const m = (l + r) / 2;
        return (r - l) / 6 * (f(l) + 4 * f(m) + f(r));
      }
      function recurse(l, r, epsLocal, whole, depth){
        const m = (l + r) / 2;
        const left = simpson(l, m);
        const right = simpson(m, r);
        const delta = left + right - whole;
        if (depth <= 0 || Math.abs(delta) < 15 * epsLocal) {
          return left + right + delta / 15;
        }
        return recurse(l, m, epsLocal / 2, left, depth - 1) + recurse(m, r, epsLocal / 2, right, depth - 1);
      }
      const initial = simpson(a, b);
      return recurse(a, b, eps, initial, maxDepth);
    }

    function numericIntegrate(expr, variable, lower, upper, options = {}){
      const varName = variable ? String(variable) : 'x';
      const node = compileExpression(expr);
      const a = Number(lower);
      const b = Number(upper);
      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        throw new Error('積分範囲は有限の実数で指定してください。');
      }
      const tol = Number(options.tolerance ?? 1e-8);
      const depth = Number(options.maxDepth ?? 10);
      const baseScope = cloneScope(scope);
      const lowerBound = Math.min(a, b);
      const upperBound = Math.max(a, b);
      const direction = a <= b ? 1 : -1;
      const fn = (x) => {
        const localScope = cloneScope(baseScope);
        localScope[varName] = x;
        const value = node.evaluate(localScope);
        return ensureFiniteNumber(value);
      };
      if (lowerBound === upperBound) return 0;
      const integral = adaptiveSimpson(fn, lowerBound, upperBound, tol, depth);
      return integral * direction;
    }

    function newtonSolve(expr, variable = 'x', guess = 0, options = {}){
      const varName = String(variable);
      const normalized = normalizeEquation(expr);
      const node = compileExpression(normalized);
      const derivative = math.derivative(node, varName);
      let x = Number(guess);
      if (!Number.isFinite(x)) throw new Error('初期値には有限の数値を指定してください。');
      const maxIter = Number(options.maxIterations ?? 32);
      const tol = Number(options.tolerance ?? 1e-10);
      const snapshot = cloneScope(scope);
      for (let i = 0; i < maxIter; i++) {
        const local = cloneScope(snapshot);
        local[varName] = x;
        const fx = ensureFiniteNumber(node.evaluate(local));
        if (Math.abs(fx) < tol) return x;
        const dfx = ensureFiniteNumber(derivative.evaluate(local));
        if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-12) {
          throw new Error('導関数が 0 に近いためニュートン法が収束しません。');
        }
        const next = x - fx / dfx;
        if (!Number.isFinite(next)) throw new Error('反復計算が発散しました。');
        if (Math.abs(next - x) < tol) return next;
        x = next;
      }
      throw new Error('指定した反復回数内に収束しませんでした。');
    }

    function solveLinearSystem(matrix, vector){
      if (!math || typeof math.lusolve !== 'function') {
        throw new Error('線形方程式ソルバが利用できません。');
      }
      const solved = math.lusolve(matrix, vector);
      if (Array.isArray(solved) && solved.length && Array.isArray(solved[0])) {
        return solved.map(row => ensureFiniteNumber(row[0]));
      }
      return solved;
    }

    function jacobian(nodes, variables){
      return nodes.map(node => variables.map(v => math.derivative(node, v)));
    }

    function newtonSystem(equations, variables, initialGuess = [], options = {}){
      if (!Array.isArray(equations) || !equations.length) {
        throw new Error('方程式の配列を渡してください。');
      }
      if (!Array.isArray(variables) || variables.length !== equations.length) {
        throw new Error('変数リストは方程式の数と一致している必要があります。');
      }
      const varNames = variables.map(v => String(v));
      const nodes = equations.map(expr => compileExpression(normalizeEquation(expr)));
      const jacNodes = jacobian(nodes, varNames);
      const guess = initialGuess.length ? initialGuess.map(Number) : varNames.map(() => 0);
      const maxIter = Number(options.maxIterations ?? 24);
      const tol = Number(options.tolerance ?? 1e-9);
      const snapshot = cloneScope(scope);
      let current = guess.slice();
      const size = nodes.length;
      for (let iter = 0; iter < maxIter; iter++) {
        const local = cloneScope(snapshot);
        varNames.forEach((name, idx) => { local[name] = current[idx]; });
        const fValues = nodes.map(node => ensureFiniteNumber(node.evaluate(local)));
        if (fValues.every(val => Math.abs(val) < tol)) {
          const result = {};
          varNames.forEach((name, idx) => { result[name] = current[idx]; });
          return result;
        }
        const jacobianMatrix = jacNodes.map(row => row.map(cell => ensureFiniteNumber(cell.evaluate(local))));
        const delta = solveLinearSystem(jacobianMatrix, fValues.map(val => [val]));
        if (!Array.isArray(delta) || delta.length !== size) {
          throw new Error('ヤコビ行列の解が取得できませんでした。');
        }
        let diverged = false;
        for (let i = 0; i < size; i++) {
          const step = ensureFiniteNumber(delta[i][0]);
          const nextVal = current[i] - step;
          if (!Number.isFinite(nextVal)) {
            diverged = true;
            break;
          }
          current[i] = nextVal;
        }
        if (diverged) throw new Error('反復計算が発散しました。');
      }
      throw new Error('指定した反復回数内に収束しませんでした。');
    }

    function optimize(expr, variable = 'x', guess = 0, options = {}, maximize = false){
      const varName = String(variable);
      const node = compileExpression(expr);
      const first = math.derivative(node, varName);
      const second = math.derivative(first, varName);
      const root = newtonSolve(first, varName, guess, options);
      const local = cloneScope(scope);
      local[varName] = root;
      const curvature = ensureFiniteNumber(second.evaluate(local));
      const curvatureTol = Math.abs(Number(options.curvatureTolerance ?? 1e-7));
      if (maximize && curvature > curvatureTol) {
        throw new Error('指定の初期値付近では最大値ではなく最小値が見つかりました。');
      }
      if (!maximize && curvature < -curvatureTol) {
        throw new Error('指定の初期値付近では最小値ではなく最大値が見つかりました。');
      }
      return { point: root, value: ensureFiniteNumber(node.evaluate(local)) };
    }

    function digammaReal(x){
      const value = Number(x);
      if (!Number.isFinite(value)) throw new Error('digamma の引数は有限の実数で指定してください。');
      if (value <= 0) throw new Error('digamma は正の実数引数にのみ対応します。');
      let result = 0;
      let z = value;
      while (z < 8) {
        result -= 1 / z;
        z += 1;
      }
      const inv = 1 / z;
      const inv2 = inv * inv;
      result += Math.log(z) - 0.5 * inv - inv2 * (1 / 12 - inv2 * (1 / 120 - inv2 * (1 / 252)));
      return result;
    }

    function polygammaReal(order, x){
      const m = Math.floor(Number(order));
      if (!Number.isFinite(m) || m < 0) {
        throw new Error('polygamma の階数は 0 以上の整数を指定してください。');
      }
      if (m === 0) return digammaReal(x);
      const value = Number(x);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('polygamma は正の実数引数にのみ対応します。');
      }
      const factorial = math.factorial(m);
      const sign = m % 2 === 0 ? -1 : 1;
      let sum = 0;
      let z = value;
      for (let i = 0; i < 6400; i++) {
        const term = 1 / Math.pow(z, m + 1);
        sum += term;
        if (term < 1e-12) break;
        z += 1;
      }
      if (z > value) {
        sum += 1 / (m * Math.pow(z, m));
      }
      return sign * factorial * sum;
    }

    function harmonicNumber(n, r = 1){
      const count = Math.floor(Number(n));
      if (!Number.isFinite(count) || count <= 0) {
        throw new Error('harmonic の第1引数には 1 以上の整数を指定してください。');
      }
      const order = Number(r);
      if (!Number.isFinite(order) || order <= 0) {
        throw new Error('harmonic の第2引数には正の実数を指定してください。');
      }
      let sum = 0;
      for (let k = 1; k <= count; k++) {
        sum += 1 / Math.pow(k, order);
      }
      return sum;
    }

    function riemannZeta(s, terms = 256){
      const sigma = Number(s);
      if (!Number.isFinite(sigma)) {
        throw new Error('zeta の引数は有限の実数で指定してください。');
      }
      if (sigma === 1) {
        throw new Error('zeta(1) は発散します。');
      }
      if (sigma <= 0) {
        throw new Error('この簡易実装では実部が正の領域でのみ定義されています。');
      }
      const nTerms = Math.max(32, Math.min(8192, Math.floor(Number(terms)) || 0));
      let eta = 0;
      let sign = 1;
      for (let n = 1; n <= nTerms; n++) {
        eta += sign / Math.pow(n, sigma);
        sign *= -1;
      }
      const pow = Math.pow(2, 1 - sigma);
      const zeta = eta / (1 - pow);
      return zeta;
    }

    function bindMath(mathjs){
      mathRef = mathjs;
      math = mathjs.create(mathjs.all);
      math.config({ number: 'Fraction', precision: 64, matrix: 'Matrix' });
      numericMath = mathjs.create(mathjs.all);
      numericMath.config({ number: 'BigNumber', precision: 128, matrix: 'Matrix' });

      const fractionErrorPattern = /Cannot implicitly convert a number to a Fraction/;
      const convertForFallback = (value) => {
        if (math.isFraction?.(value)) return value.valueOf();
        if (math.isBigNumber?.(value)) return value.toNumber();
        if (math.isComplex?.(value)) {
          const re = convertForFallback(value.re);
          const im = convertForFallback(value.im);
          return math.complex(re, im);
        }
        if (Array.isArray(value)) return value.map(convertForFallback);
        if (math.isMatrix?.(value)) return value.map(convertForFallback);
        return value;
      };
      ['add', 'subtract', 'multiply', 'divide', 'pow'].forEach(name => {
        const original = math[name];
        if (typeof original !== 'function') return;
        math[name] = function(...args){
          try {
            return original.apply(math, args);
          } catch (err) {
            if (fractionErrorPattern.test(err?.message || '')) {
              const converted = args.map(convertForFallback);
              return original.apply(math, converted);
            }
            throw err;
          }
        };
      });

      const trigNames = [
        ['sin', true, false], ['cos', true, false], ['tan', true, false],
        ['asin', false, true], ['acos', false, true], ['atan', false, true],
        ['sinh', true, false], ['cosh', true, false], ['tanh', true, false],
        ['asinh', false, true], ['acosh', false, true], ['atanh', false, true],
        ['csc', true, false], ['sec', true, false], ['cot', true, false],
        ['acsc', false, true], ['asec', false, true], ['acot', false, true]
      ];

      const toRadians = value => math.multiply(value, math.divide(math.pi, 180));
      const fromRadians = value => math.multiply(value, math.divide(180, math.pi));

      const overrides = {};
      trigNames.forEach(([name, convertIn, convertOut]) => {
        const baseFn = math[name].bind(math);
        overrides[name] = function(...args){
          let processed = args;
          if (!radianMode && convertIn) {
            processed = args.map(arg => {
              if (math.typeOf(arg) === 'Matrix' || Array.isArray(arg)) {
                return math.map(arg, item => toRadians(item));
              }
              return toRadians(arg);
            });
          }
          let result = baseFn(...processed);
          if (!radianMode && convertOut) {
            if (math.typeOf(result) === 'Matrix' || Array.isArray(result)) {
              return math.map(result, item => fromRadians(item));
            }
            result = fromRadians(result);
          }
          return result;
        };
      });

      overrides.tetra = function(base, height){
        const result = computeTetration(base, height);
        return result;
      };
      overrides.slog = function(base, value){
        return computeSlog(base, value);
      };
      overrides.taylorSeries = function(expr, variable, order, center){
        return computeTaylorSeries(expr, variable, order, center);
      };
      overrides.numericIntegrate = function(expr, variable, lower, upper, options){
        return numericIntegrate(expr, variable, lower, upper, options);
      };
      overrides.solveEq = function(expr, variable, guess, options){
        return newtonSolve(expr, variable, guess, options);
      };
      overrides.solveSystem = function(equations, variables, initialGuess, options){
        return newtonSystem(equations, variables, initialGuess, options);
      };
      overrides.solveLinear = function(matrix, vector){
        return solveLinearSystem(matrix, vector);
      };
      overrides.minimize = function(expr, variable, guess, options){
        return optimize(expr, variable, guess, options, false);
      };
      overrides.maximize = function(expr, variable, guess, options){
        return optimize(expr, variable, guess, options, true);
      };
      overrides.digamma = function(x){
        return digammaReal(x);
      };
      overrides.polygamma = function(order, x){
        return polygammaReal(order, x);
      };
      overrides.harmonic = function(n, r){
        return harmonicNumber(n, r);
      };
      overrides.zeta = function(s, terms){
        return riemannZeta(s, terms);
      };

      math.import(overrides, { override: true });
      numericMath.import(overrides, { override: true });
      updateVariables();
    }

    function evaluateExpression(){
      if (!math) {
        notifyStatus('数学エンジンの初期化を待っています…');
        return;
      }
      const rawExpr = expressionMode === 'pretty'
        ? (expressionInputPretty?.value || '')
        : (expressionInputClassic?.value || '');
      const displayExpr = (rawExpr || '').trim();
      const expr = convertPrettyToAscii(rawExpr).trim();
      if (expressionMode === 'pretty' && expressionInputClassic) {
        expressionInputClassic.value = expr;
      }
      if (!expr) {
        notifyStatus('式を入力してください。');
        return;
      }
      try {
        const node = math.parse(expr);
        const result = node.evaluate(scope);
        scope.ans = result;
        let symbolic = formatValue(result);
        try {
          const simplified = math.simplify(node, scope, { exactFractions: true });
          const simplifiedText = beautifySymbols(simplified.toString({ parenthesis: 'auto' }));
          if (simplifiedText) {
            symbolic = simplifiedText;
          }
        } catch {}
        let approxValue;
        try {
          const approxScope = buildNumericScope(scope);
          approxValue = numericMath ? numericMath.evaluate(expr, approxScope) : result;
        } catch {
          approxValue = result;
        }
        setResults(symbolic, approxValue);
        const historyExpr = expressionMode === 'pretty'
          ? (displayExpr || expr)
          : convertAsciiToPretty(displayExpr || expr);
        const approxDisplay = approxResultEl?.dataset?.rawValue ?? formatApproxValue(approxValue);
        const entry = { expr: historyExpr, symbolic, approx: approxDisplay };
        history.push(entry);
        latestHistoryEntry = entry;
        updateHistory();
        updateVariables();
        totalComputations += 1;
        try { awardXp && awardXp(12, { type: 'compute', expression: expr }); } catch {}
        notifyStatus('計算が完了しました。');
      } catch (err) {
        latestHistoryEntry = null;
        setResults('Error', err.message || String(err));
        notifyStatus('エラー: ' + (err.message || err));
      }
    }

    function plotGraph(){
      if (!math) {
        notifyStatus('数学エンジンの初期化を待っています…');
        return;
      }
      const exprRaw = graphInput.value.trim();
      const expr = convertPrettyToAscii(exprRaw);
      if (!expr) {
        notifyStatus('グラフ式を入力してください。');
        return;
      }
      let compiled;
      try {
        compiled = math.parse(expr);
      } catch (err) {
        graphMessage.textContent = '式の解析に失敗しました: ' + err.message;
        return;
      }
      const xmin = Number(graphXMin.value);
      const xmax = Number(graphXMax.value);
      if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || xmin >= xmax) {
        graphMessage.textContent = '範囲は有限で xmin < xmax となるように設定してください。';
        return;
      }
      const baseScope = cloneScope(scope);
      const points = [];
      const total = 320;
      let ymin = Infinity;
      let ymax = -Infinity;
      let rejectedUnits = 0;
      let rejectedComposite = 0;
      let rejectedComplex = 0;
      for (let i = 0; i <= total; i++) {
        const x = xmin + (xmax - xmin) * (i / total);
        const localScope = cloneScope(baseScope);
        localScope.x = x;
        try {
          const yVal = compiled.evaluate(localScope);
          const y = toNumber(yVal);
          if (!Number.isFinite(y)) continue;
          if (y < ymin) ymin = y;
          if (y > ymax) ymax = y;
          points.push({ x, y });
        } catch (err) {
          if (err && err.code === 'UNIT') rejectedUnits += 1;
          else if (err && (err.code === 'MATRIX' || err.code === 'ARRAY')) rejectedComposite += 1;
          else if (err && err.code === 'COMPLEX') rejectedComplex += 1;
          continue;
        }
      }
      if (!points.length) {
        const reasons = [];
        if (rejectedUnits) reasons.push(`単位付き ${rejectedUnits}`);
        if (rejectedComposite) reasons.push(`ベクトル/行列 ${rejectedComposite}`);
        if (rejectedComplex) reasons.push(`複素数 ${rejectedComplex}`);
        const extra = reasons.length ? ` (除外: ${reasons.join(', ')})` : '';
        graphMessage.textContent = `描画できる点がありません${extra}。`;
        return;
      }
      if (ymax === ymin) {
        ymax += 1;
        ymin -= 1;
      }
      drawGraph(points, [xmin, xmax], [ymin, ymax]);
      graphMessage.textContent = `描画ポイント: ${points.length} / ${total + 1}`;
      const extras = [];
      if (rejectedUnits) extras.push(`単位付き: ${rejectedUnits}`);
      if (rejectedComposite) extras.push(`ベクトル/行列: ${rejectedComposite}`);
      if (rejectedComplex) extras.push(`複素数: ${rejectedComplex}`);
      if (extras.length) {
        graphMessage.textContent += ` / 除外 ${extras.join(', ')}`;
      }
      totalGraphs += 1;
      try { awardXp && awardXp(8, { type: 'graph', expression: expr }); } catch {}
    }

    function start(){
      if (active) return;
      active = true;
      expressionInput?.focus();
      notifyStatus('数学ラボの準備が整いました。');
    }

    function stop(){
      if (!active) return;
      active = false;
    }

    function destroy(){
      if (destroyed) return;
      destroyed = true;
      stop();
      try { root && root.contains(container) && root.removeChild(container); } catch {}
    }

    function getScore(){
      return totalComputations * 2 + totalGraphs * 3;
    }

    buildKeypad();
    buildWorkspace();
    updateHistory();
    setResults(null, null);

    ensureMathJs()
      .then(mathjs => {
        if (destroyed) return;
        bindMath(mathjs);
        loadingOverlay.remove();
        notifyStatus('数学エンジンを初期化しました。');
      })
      .catch(err => {
        if (destroyed) return;
        loadingOverlay.innerHTML = `<div style="color:#fca5a5;font-size:14px;text-align:center;max-width:320px;line-height:1.6">数学エンジンの読み込みに失敗しました。インターネット接続を確認してください。<br>${err?.message || err}</div>`;
      });

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'math_lab',
    name: '数学ラボ',
    description: 'Mathematica風ワークシートで関数・単位・グラフ・テトレーションまで扱える超高機能電卓',
    category: 'ユーティリティ',
    create
  });
})();
