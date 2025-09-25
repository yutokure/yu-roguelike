(function (global) {
    'use strict';

    const toolInitializers = new Map();
    const moduleState = {
        tabRoot: null,
        menuButtons: [],
        panels: new Map(),
        currentTool: null,
        activateTool: null
    };

    function activateInitializer(toolId) {
        const entry = toolInitializers.get(toolId);
        if (!entry || entry.initialized) return;
        const panel = moduleState.panels.get(toolId) || null;
        try {
            entry.initializer({
                panel,
                tabRoot: moduleState.tabRoot,
                toolId
            });
        } catch (err) {
            console.error(`[ToolsTab] Failed to initialize tool "${toolId}":`, err);
            return;
        }
        entry.initialized = true;
    }

    function handleMenuClick(toolId) {
        if (!moduleState.activateTool) return;
        moduleState.activateTool(toolId);
    }

    function init(tabRoot, options = {}) {
        if (!tabRoot) return;
        if (moduleState.tabRoot) {
            // Already initialized, just ensure activation happens.
            if (typeof options.defaultTool === 'string') {
                handleMenuClick(options.defaultTool);
            }
            return;
        }

        moduleState.tabRoot = tabRoot;

        const menuButtons = Array.from(tabRoot.querySelectorAll('[data-tool-target]'));
        const panels = Array.from(tabRoot.querySelectorAll('[data-tool-panel]'));

        moduleState.menuButtons = menuButtons;
        moduleState.panels = new Map();
        panels.forEach(panel => {
            const id = panel.dataset.toolPanel;
            if (id) moduleState.panels.set(id, panel);
        });

        moduleState.activateTool = (toolId) => {
            if (!toolId) return;
            menuButtons.forEach(btn => {
                const active = btn.dataset.toolTarget === toolId;
                btn.classList.toggle('active', active);
                btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            panels.forEach(panel => {
                const active = panel.dataset.toolPanel === toolId;
                panel.classList.toggle('active', active);
            });
            moduleState.currentTool = toolId;
            activateInitializer(toolId);
        };

        menuButtons.forEach(btn => {
            const toolId = btn.dataset.toolTarget;
            if (!toolId) return;
            btn.addEventListener('click', () => handleMenuClick(toolId));
        });

        const defaultTool = typeof options.defaultTool === 'string'
            ? options.defaultTool
            : (menuButtons[0]?.dataset.toolTarget || null);
        if (defaultTool) {
            moduleState.activateTool(defaultTool);
        }
    }

    function registerTool(toolId, initializer) {
        if (!toolId || typeof initializer !== 'function') return;
        const existing = toolInitializers.get(toolId) || { initializer: null, initialized: false };
        existing.initializer = initializer;
        toolInitializers.set(toolId, existing);
        if (moduleState.currentTool === toolId) {
            activateInitializer(toolId);
        }
    }

    function show(toolId) {
        if (!toolId || !moduleState.activateTool) return;
        moduleState.activateTool(toolId);
    }

    global.ToolsTab = {
        init,
        registerTool,
        show
    };
})(window);
