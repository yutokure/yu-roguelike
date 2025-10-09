(function(){
  const STORAGE_KEY = 'mini_todo_tasks_v1';
  const MAX_NAME = 32;
  const MAX_MEMO = 256;
  const MAX_XP = 9999;

  function clampXp(value){
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return 0;
    return Math.min(MAX_XP, Math.floor(num));
  }

  function sanitizeColor(value){
    if (typeof value !== 'string') return '#f97316';
    const hex = value.trim();
    if (/^#([0-9a-fA-F]{3}){1,2}$/.test(hex)) return hex;
    return '#f97316';
  }

  function sanitizeString(value, fallback = ''){
    if (typeof value !== 'string') return fallback;
    return value.slice(0, MAX_MEMO);
  }

  function loadPersistentState(defaultName = '名称未設定'){
    const fallbackName = typeof defaultName === 'string' && defaultName.trim() ? defaultName : '名称未設定';
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => {
        if (!item || typeof item !== 'object') return null;
        const id = typeof item.id === 'string' && item.id ? item.id : `todo_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
        const name = sanitizeString(item.name || '', '').slice(0, MAX_NAME).trim() || fallbackName;
        const memo = sanitizeString(item.memo || '', '');
        const xp = clampXp(item.xp);
        const color = sanitizeColor(item.color);
        const createdAt = Number.isFinite(item.createdAt) ? item.createdAt : Date.now();
        const completedAt = Number.isFinite(item.completedAt) ? item.completedAt : null;
        const status = item.status === 'completed' || item.status === 'failed' ? item.status : 'pending';
        return { id, name, memo, xp, color, createdAt, completedAt, status };
      }).filter(Boolean);
    } catch {
      return [];
    }
  }

  function writePersistentState(tasks){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }

  function formatDate(ts, i18n, options){
    if (ts === null || ts === undefined) return '-';
    try {
      const date = ts instanceof Date ? ts : new Date(ts);
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '-';
      if (i18n && typeof i18n.formatDate === 'function'){
        try {
          return i18n.formatDate(date, options);
        } catch {}
      }
      if (options && typeof date.toLocaleString === 'function'){
        return date.toLocaleString(undefined, options);
      }
      return date.toLocaleString();
    } catch {
      try {
        return new Date(ts).toISOString();
      } catch {
        return '-';
      }
    }
  }

  function create(root, awardXp){
    if (!root) throw new Error('MiniExp ToDo requires a container');

    const i18n = typeof window !== 'undefined' ? window.I18n : null;

    const applyParams = (value, params) => {
      if (!params || typeof value !== 'string') return value;
      return value.replace(/\{([^{}]+)\}/g, (match, token) => {
        const key = token.trim();
        if (!key) return match;
        const paramValue = params[key];
        return paramValue === undefined || paramValue === null ? match : String(paramValue);
      });
    };

    const translate = (key, fallback, params) => {
      if (key && typeof i18n?.t === 'function') {
        try {
          const value = i18n.t(key, params);
          if (typeof value === 'string' && value !== key) return value;
          if (value !== undefined && value !== null && value !== key) return value;
        } catch {}
      }
      let result = fallback;
      if (typeof fallback === 'function') {
        try {
          result = fallback();
        } catch {
          result = '';
        }
      }
      if (result === undefined || result === null) {
        if (typeof key === 'string') return key;
        return '';
      }
      if (typeof result === 'string') {
        return applyParams(result, params);
      }
      return result;
    };

    const formatNumber = (value, options) => {
      if (typeof i18n?.formatNumber === 'function') {
        try {
          return i18n.formatNumber(value, options);
        } catch {}
      }
      try {
        return new Intl.NumberFormat(undefined, options).format(value);
      } catch {}
      return String(value);
    };

    const defaultTaskName = translate('games.todoList.defaults.untitled', '名称未設定');
    const dateTimeOptions = { dateStyle: 'medium', timeStyle: 'short' };
    const headerDateOptions = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };

    const state = {
      tasks: loadPersistentState(defaultTaskName),
      editingTaskId: null,
      sessionXp: 0
    };
    const collapseState = {
      pending: false,
      completed: false
    };

    let isRunning = false;

    let localeUnsubscribe = null;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.padding = '24px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.background = '#ffffff';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '16px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.flexWrap = 'wrap';
    header.style.gap = '12px';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.flexDirection = 'column';
    titleWrap.style.gap = '4px';

    const title = document.createElement('h2');
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.color = '#111827';

    const subtitle = document.createElement('div');
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#6b7280';

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const stats = document.createElement('div');
    stats.style.fontSize = '14px';
    stats.style.color = '#374151';

    header.appendChild(titleWrap);
    header.appendChild(stats);

    const formCard = document.createElement('form');
    formCard.className = 'todo-form';
    formCard.style.display = 'grid';
    formCard.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    formCard.style.gap = '12px';
    formCard.style.background = '#f9fafb';
    formCard.style.padding = '16px';
    formCard.style.borderRadius = '12px';
    formCard.style.border = '1px solid #e5e7eb';
    formCard.style.boxShadow = '0 8px 24px rgba(15,23,42,0.08)';

    const formTitle = document.createElement('h3');
    formTitle.style.gridColumn = '1 / -1';
    formTitle.style.margin = '0';
    formTitle.style.fontSize = '18px';
    formTitle.style.color = '#1f2937';

    const nameLabel = document.createElement('label');
    nameLabel.style.display = 'flex';
    nameLabel.style.flexDirection = 'column';
    nameLabel.style.fontSize = '14px';
    nameLabel.style.color = '#374151';

    const nameLabelText = document.createElement('span');
    nameLabelText.style.fontWeight = '600';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.required = true;
    nameInput.maxLength = MAX_NAME;
    nameInput.style.marginTop = '4px';
    nameInput.style.padding = '10px 12px';
    nameInput.style.borderRadius = '8px';
    nameInput.style.border = '1px solid #cbd5f5';
    nameInput.style.fontSize = '14px';
    nameLabel.appendChild(nameLabelText);
    nameLabel.appendChild(nameInput);

    const xpLabel = document.createElement('label');
    xpLabel.style.display = 'flex';
    xpLabel.style.flexDirection = 'column';
    xpLabel.style.fontSize = '14px';
    xpLabel.style.color = '#374151';

    const xpLabelText = document.createElement('span');
    xpLabelText.style.fontWeight = '600';

    const xpInput = document.createElement('input');
    xpInput.type = 'number';
    xpInput.min = '0';
    xpInput.max = String(MAX_XP);
    xpInput.step = '1';
    xpInput.required = true;
    xpInput.value = '25';
    xpInput.style.marginTop = '4px';
    xpInput.style.padding = '10px 12px';
    xpInput.style.borderRadius = '8px';
    xpInput.style.border = '1px solid #cbd5f5';
    xpInput.style.fontSize = '14px';
    xpLabel.appendChild(xpLabelText);
    xpLabel.appendChild(xpInput);

    const colorLabel = document.createElement('label');
    colorLabel.style.display = 'flex';
    colorLabel.style.flexDirection = 'column';
    colorLabel.style.fontSize = '14px';
    colorLabel.style.color = '#374151';

    const colorLabelText = document.createElement('span');
    colorLabelText.style.fontWeight = '600';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#f97316';
    colorInput.style.marginTop = '4px';
    colorInput.style.height = '42px';
    colorInput.style.border = '1px solid #cbd5f5';
    colorInput.style.borderRadius = '8px';
    colorLabel.appendChild(colorLabelText);
    colorLabel.appendChild(colorInput);

    const memoLabel = document.createElement('label');
    memoLabel.style.display = 'flex';
    memoLabel.style.flexDirection = 'column';
    memoLabel.style.fontSize = '14px';
    memoLabel.style.color = '#374151';
    memoLabel.style.gridColumn = '1 / -1';

    const memoLabelText = document.createElement('span');
    memoLabelText.style.fontWeight = '600';

    const memoInput = document.createElement('textarea');
    memoInput.maxLength = MAX_MEMO;
    memoInput.rows = 3;
    memoInput.style.marginTop = '4px';
    memoInput.style.padding = '10px 12px';
    memoInput.style.borderRadius = '8px';
    memoInput.style.border = '1px solid #cbd5f5';
    memoInput.style.fontSize = '14px';
    memoInput.style.resize = 'vertical';
    memoLabel.appendChild(memoLabelText);
    memoLabel.appendChild(memoInput);

    const buttonRow = document.createElement('div');
    buttonRow.style.gridColumn = '1 / -1';
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '12px';
    buttonRow.style.justifyContent = 'flex-end';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.style.padding = '10px 18px';
    submitBtn.style.borderRadius = '999px';
    submitBtn.style.border = 'none';
    submitBtn.style.background = '#2563eb';
    submitBtn.style.color = '#ffffff';
    submitBtn.style.fontWeight = '600';
    submitBtn.style.cursor = 'pointer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.style.padding = '10px 18px';
    cancelBtn.style.borderRadius = '999px';
    cancelBtn.style.border = '1px solid #cbd5f5';
    cancelBtn.style.background = '#ffffff';
    cancelBtn.style.color = '#1f2937';
    cancelBtn.style.cursor = 'pointer';

    buttonRow.appendChild(cancelBtn);
    buttonRow.appendChild(submitBtn);

    formCard.appendChild(formTitle);
    formCard.appendChild(nameLabel);
    formCard.appendChild(xpLabel);
    formCard.appendChild(colorLabel);
    formCard.appendChild(memoLabel);
    formCard.appendChild(buttonRow);

    const listsWrap = document.createElement('div');
    listsWrap.style.display = 'grid';
    listsWrap.style.gridTemplateColumns = '1fr';
    listsWrap.style.gap = '20px';
    listsWrap.style.flex = '1';
    listsWrap.style.minHeight = '0';

    const pendingSection = document.createElement('section');
    const pendingTitle = document.createElement('h3');
    pendingTitle.style.margin = '0';
    pendingTitle.style.fontSize = '18px';
    pendingTitle.style.color = '#b91c1c';
    const pendingList = document.createElement('div');
    pendingList.id = 'todo_pending_list';
    pendingList.style.display = 'flex';
    pendingList.style.flexDirection = 'column';
    pendingList.style.gap = '12px';

    pendingSection.appendChild(pendingTitle);
    pendingSection.appendChild(pendingList);

    const completedSection = document.createElement('section');
    const completedTitle = document.createElement('h3');
    completedTitle.style.margin = '0';
    completedTitle.style.fontSize = '18px';
    completedTitle.style.color = '#6b7280';
    const completedList = document.createElement('div');
    completedList.id = 'todo_completed_list';
    completedList.style.display = 'flex';
    completedList.style.flexDirection = 'column';
    completedList.style.gap = '12px';

    completedSection.appendChild(completedTitle);
    completedSection.appendChild(completedList);

    const pendingSectionControls = makeCollapsibleSection(pendingTitle, pendingList, 'pending');
    const completedSectionControls = makeCollapsibleSection(completedTitle, completedList, 'completed');

    listsWrap.appendChild(pendingSection);
    listsWrap.appendChild(completedSection);

    wrapper.appendChild(header);
    wrapper.appendChild(formCard);
    wrapper.appendChild(listsWrap);

    root.appendChild(wrapper);

    function setFormMode(mode){
      if (mode === 'edit'){
        formTitle.textContent = translate('games.todoList.form.titleEdit', 'ToDoを編集');
        submitBtn.textContent = translate('games.todoList.form.submitUpdate', '更新');
      } else {
        formTitle.textContent = translate('games.todoList.form.titleCreate', '新規ToDoを登録');
        submitBtn.textContent = translate('games.todoList.form.submitCreate', '追加');
      }
    }

    function resetForm(){
      state.editingTaskId = null;
      setFormMode('create');
      nameInput.value = '';
      xpInput.value = '25';
      colorInput.value = '#f97316';
      memoInput.value = '';
    }

    function fillForm(task){
      state.editingTaskId = task.id;
      setFormMode('edit');
      nameInput.value = task.name;
      xpInput.value = String(task.xp);
      colorInput.value = task.color;
      memoInput.value = task.memo;
    }

    function persist(){
      writePersistentState(state.tasks);
    }

    function updateStats(){
      const pendingCount = state.tasks.filter(t => t.status === 'pending').length;
      const completedCount = state.tasks.filter(t => t.status !== 'pending').length;
      stats.textContent = translate('games.todoList.header.stats', '未完了: {pending}件 / 完了: {completed}件', {
        pending: formatNumber(pendingCount, { maximumFractionDigits: 0 }),
        completed: formatNumber(completedCount, { maximumFractionDigits: 0 })
      });
    }

    function renderLists(){
      pendingList.innerHTML = '';
      completedList.innerHTML = '';
      const pending = state.tasks.filter(t => t.status === 'pending').sort((a, b) => a.createdAt - b.createdAt);
      const done = state.tasks.filter(t => t.status !== 'pending').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

      if (pending.length === 0){
        const empty = document.createElement('div');
        empty.textContent = translate('games.todoList.sections.emptyPending', '未完了のToDoはありません。');
        empty.style.color = '#9ca3af';
        empty.style.fontSize = '14px';
        pendingList.appendChild(empty);
      } else {
        pending.forEach(task => pendingList.appendChild(renderTaskCard(task)));
      }

      if (done.length === 0){
        const empty = document.createElement('div');
        empty.textContent = translate('games.todoList.sections.emptyCompleted', '完了したToDoはまだありません。');
        empty.style.color = '#9ca3af';
        empty.style.fontSize = '14px';
        completedList.appendChild(empty);
      } else {
        done.forEach(task => completedList.appendChild(renderTaskCard(task)));
      }

      pendingSectionControls.update();
      completedSectionControls.update();
    }

    function applyTranslations(includeDynamic = false){
      title.textContent = translate('games.todoList.header.title', 'ToDoリスト');
      const headerDateText = (() => {
        const now = Date.now();
        const formatted = formatDate(now, i18n, headerDateOptions);
        if (formatted && formatted !== '-') return formatted;
        try {
          return new Date(now).toLocaleDateString(undefined, headerDateOptions);
        } catch {
          return new Date(now).toDateString();
        }
      })();
      subtitle.textContent = translate('games.todoList.header.today', () => headerDateText, { date: headerDateText });

      nameLabelText.textContent = translate('games.todoList.form.name', '名前');
      nameInput.placeholder = translate('games.todoList.form.namePlaceholder', '例: 日次レポートを送信');

      xpLabelText.textContent = translate('games.todoList.form.xp', '獲得EXP');
      colorLabelText.textContent = translate('games.todoList.form.color', 'カラー');
      memoLabelText.textContent = translate('games.todoList.form.memo', 'メモ');
      memoInput.placeholder = translate('games.todoList.form.memoPlaceholder', '補足情報やチェックポイントなどを入力');

      cancelBtn.textContent = translate('games.todoList.form.cancel', 'キャンセル');

      pendingSectionControls.setLabel(translate('games.todoList.sections.pending', '未完了タスク'));
      completedSectionControls.setLabel(translate('games.todoList.sections.completed', '完了済みタスク'));

      setFormMode(state.editingTaskId ? 'edit' : 'create');

      if (includeDynamic){
        updateStats();
        renderLists();
      }
    }

    function makeCollapsibleSection(titleEl, listEl, key){
      const icon = document.createElement('span');
      icon.textContent = '▼';
      icon.style.display = 'inline-flex';
      icon.style.alignItems = 'center';
      icon.style.justifyContent = 'center';
      icon.style.width = '18px';
      icon.style.fontSize = '12px';
      icon.style.color = titleEl.style.color || '#111827';

      const label = document.createElement('span');
      label.textContent = '';

      titleEl.textContent = '';
      titleEl.appendChild(icon);
      titleEl.appendChild(label);
      titleEl.style.display = 'flex';
      titleEl.style.alignItems = 'center';
      titleEl.style.gap = '6px';
      titleEl.style.cursor = 'pointer';
      titleEl.style.userSelect = 'none';
      titleEl.tabIndex = 0;
      titleEl.setAttribute('role', 'button');
      if (!listEl.id){
        listEl.id = `todo_section_${key}`;
      }
      titleEl.setAttribute('aria-controls', listEl.id);

      const setLabel = (text) => {
        const safe = text ?? '';
        label.textContent = safe;
        titleEl.setAttribute('aria-label', safe);
      };

      function update(){
        const collapsed = !!collapseState[key];
        icon.textContent = collapsed ? '▶' : '▼';
        listEl.style.display = collapsed ? 'none' : 'flex';
        titleEl.setAttribute('aria-expanded', String(!collapsed));
      }

      function toggle(){
        collapseState[key] = !collapseState[key];
        update();
      }

      titleEl.addEventListener('click', toggle);
      titleEl.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          toggle();
        }
      });

      update();
      return {
        update,
        setLabel
      };
    }

    function renderTaskCard(task){
      const card = document.createElement('div');
      card.style.display = 'flex';
      card.style.gap = '16px';
      card.style.alignItems = 'stretch';
      card.style.padding = '16px';
      card.style.borderRadius = '12px';
      card.style.border = '2px solid';
      card.style.background = '#ffffff';
      card.style.boxShadow = '0 6px 20px rgba(15,23,42,0.08)';

      const colorBar = document.createElement('div');
      colorBar.style.width = '6px';
      colorBar.style.borderRadius = '4px';
      colorBar.style.background = task.color;

      const body = document.createElement('div');
      body.style.flex = '1';
      body.style.display = 'flex';
      body.style.flexDirection = 'column';
      body.style.gap = '6px';

      const titleRow = document.createElement('div');
      titleRow.style.display = 'flex';
      titleRow.style.alignItems = 'center';
      titleRow.style.gap = '8px';

      const name = document.createElement('div');
      name.textContent = task.name;
      name.style.fontSize = '16px';
      name.style.fontWeight = '600';

      const xpChip = document.createElement('span');
      const xpText = translate('games.todoList.task.xpChip', '{xp} EXP', {
        xp: formatNumber(task.xp, { maximumFractionDigits: 0 })
      });
      xpChip.textContent = xpText;
      xpChip.style.padding = '2px 8px';
      xpChip.style.borderRadius = '999px';
      xpChip.style.background = '#fee2e2';
      xpChip.style.color = '#991b1b';
      xpChip.style.fontSize = '12px';
      xpChip.style.fontWeight = '600';

      const colorChip = document.createElement('span');
      colorChip.textContent = '●';
      colorChip.style.color = task.color;
      colorChip.style.fontSize = '14px';

      titleRow.appendChild(name);
      titleRow.appendChild(xpChip);
      titleRow.appendChild(colorChip);

      const memo = document.createElement('div');
      memo.textContent = task.memo || translate('games.todoList.task.memoEmpty', 'メモなし');
      memo.style.fontSize = '14px';
      memo.style.color = '#4b5563';

      const meta = document.createElement('div');
      meta.style.display = 'flex';
      meta.style.flexWrap = 'wrap';
      meta.style.gap = '12px';
      meta.style.fontSize = '12px';
      meta.style.color = '#6b7280';
      const createdLabel = document.createElement('span');
      createdLabel.textContent = translate('games.todoList.task.createdAt', '登録: {date}', {
        date: formatDate(task.createdAt, i18n, dateTimeOptions)
      });
      meta.appendChild(createdLabel);
      if (task.completedAt){
        const completedLabel = document.createElement('span');
        completedLabel.textContent = translate('games.todoList.task.completedAt', '完了: {date}', {
          date: formatDate(task.completedAt, i18n, dateTimeOptions)
        });
        meta.appendChild(completedLabel);
      }

      const statusWrap = document.createElement('div');
      statusWrap.style.display = 'flex';
      statusWrap.style.gap = '8px';
      statusWrap.style.alignItems = 'center';

      if (task.status === 'completed' || task.status === 'failed'){
        const statusBadge = document.createElement('span');
        statusBadge.style.padding = '2px 8px';
        statusBadge.style.borderRadius = '999px';
        statusBadge.style.fontSize = '12px';
        statusBadge.style.fontWeight = '600';
        if (task.status === 'completed'){
          statusBadge.textContent = translate('games.todoList.task.statusCompleted', '成功');
          statusBadge.style.background = '#dcfce7';
          statusBadge.style.color = '#166534';
        } else {
          statusBadge.textContent = translate('games.todoList.task.statusFailed', '失敗');
          statusBadge.style.background = '#fee2e2';
          statusBadge.style.color = '#b91c1c';
        }
        statusWrap.appendChild(statusBadge);
      }

      body.appendChild(titleRow);
      body.appendChild(memo);
      body.appendChild(meta);
      body.appendChild(statusWrap);

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.flexDirection = 'column';
      actions.style.justifyContent = 'center';
      actions.style.gap = '8px';

      function makeButton(label, color, handler){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.padding = '6px 10px';
        btn.style.borderRadius = '8px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '13px';
        btn.style.fontWeight = '600';
        btn.style.background = color.background;
        btn.style.color = color.text;
        btn.addEventListener('click', handler);
        btn.addEventListener('pointerenter', () => { btn.style.filter = 'brightness(0.9)'; });
        btn.addEventListener('pointerleave', () => { btn.style.filter = 'none'; });
        return btn;
      }

      if (task.status === 'pending'){
        card.style.borderColor = '#ef4444';
        const completeBtn = makeButton(translate('games.todoList.task.actions.complete', '完了'), { background: '#22c55e', text: '#064e3b' }, () => markTask(task.id, 'completed'));
        const failBtn = makeButton(translate('games.todoList.task.actions.fail', '失敗'), { background: '#f97316', text: '#7c2d12' }, () => markTask(task.id, 'failed'));
        const editBtn = makeButton(translate('games.todoList.task.actions.edit', '編集'), { background: '#93c5fd', text: '#1d4ed8' }, () => { fillForm(task); nameInput.focus(); });
        const deleteBtn = makeButton(translate('games.todoList.task.actions.delete', '削除'), { background: '#e5e7eb', text: '#374151' }, () => deleteTask(task.id));
        actions.appendChild(completeBtn);
        actions.appendChild(failBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
      } else {
        card.style.borderColor = '#d1d5db';
        card.style.color = '#6b7280';
        name.style.color = '#4b5563';
        memo.style.color = '#6b7280';
        const editBtn = makeButton(translate('games.todoList.task.actions.edit', '編集'), { background: '#bfdbfe', text: '#1d4ed8' }, () => { fillForm(task); nameInput.focus(); });
        const deleteBtn = makeButton(translate('games.todoList.task.actions.delete', '削除'), { background: '#e5e7eb', text: '#4b5563' }, () => deleteTask(task.id));
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
      }

      card.appendChild(colorBar);
      card.appendChild(body);
      card.appendChild(actions);
      return card;
    }

    function deleteTask(id){
      const idx = state.tasks.findIndex(t => t.id === id);
      if (idx === -1) return;
      if (!confirm(translate('games.todoList.dialogs.confirmDelete', 'このToDoを削除しますか？'))) return;
      state.tasks.splice(idx, 1);
      if (state.editingTaskId === id){
        resetForm();
      }
      persist();
      updateStats();
      renderLists();
    }

    function markTask(id, status){
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;
      if (task.status !== 'pending') return;
      task.status = status === 'completed' ? 'completed' : 'failed';
      task.completedAt = Date.now();
      persist();
      if (task.status === 'completed' && task.xp > 0){
        try {
          awardXp(task.xp, { type: 'todo-complete', todoId: task.id, name: task.name });
        } catch {}
        state.sessionXp += task.xp;
      }
      updateStats();
      renderLists();
    }

    formCard.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      if (!name){
        alert(translate('games.todoList.dialogs.requireName', '名前を入力してください。'));
        nameInput.focus();
        return;
      }
      const xp = clampXp(xpInput.value);
      const color = sanitizeColor(colorInput.value);
      const memo = memoInput.value.slice(0, MAX_MEMO);
      if (state.editingTaskId){
        const task = state.tasks.find(t => t.id === state.editingTaskId);
        if (!task){
          resetForm();
        } else {
          task.name = name;
          task.xp = xp;
          task.color = color;
          task.memo = memo;
          persist();
        }
      } else {
        const now = Date.now();
        const id = `todo_${now}_${Math.random().toString(36).slice(2, 8)}`;
        state.tasks.push({
          id,
          name,
          memo,
          xp,
          color,
          createdAt: now,
          completedAt: null,
          status: 'pending'
        });
        persist();
      }
      resetForm();
      updateStats();
      renderLists();
    });

    cancelBtn.addEventListener('click', () => {
      resetForm();
    });

    formCard.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
        e.preventDefault();
        submitBtn.click();
      }
    });

    function start(){
      if (isRunning) return;
      isRunning = true;
      updateStats();
      renderLists();
      nameInput.focus();
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      persist();
    }

    function destroy(){
      stop();
      if (typeof localeUnsubscribe === 'function'){
        localeUnsubscribe();
        localeUnsubscribe = null;
      }
      root.removeChild(wrapper);
    }

    const runtime = {
      start,
      stop,
      destroy,
      getScore(){ return state.sessionXp; }
    };

    applyTranslations(false);

    if (typeof i18n?.onLocaleChanged === 'function'){
      localeUnsubscribe = i18n.onLocaleChanged(() => {
        applyTranslations(true);
      });
    }

    start();
    return runtime;
  }

  window.registerMiniGame({
    id: 'todo_list',
    name: 'ToDoリスト', nameKey: 'selection.miniexp.games.todo_list.name',
    description: '完了で設定EXPを獲得 / 失敗は獲得なし', descriptionKey: 'selection.miniexp.games.todo_list.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();
