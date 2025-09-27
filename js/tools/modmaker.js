(function (global) {
    'use strict';

    let modMakerRefs = null;
    let modMakerCopyTimer = null;
    let modMakerCopyLabel = 'クリップボードにコピー';

const MOD_MAKER_TEMPLATES = {
    blank: `function algorithm(ctx) {\n  const { width, height, map } = ctx;\n  for (let y = 1; y < height - 1; y++) {\n    for (let x = 1; x < width - 1; x++) {\n      map[y][x] = 0;\n    }\n  }\n  ctx.ensureConnectivity();\n}\n`,
    rooms: `function algorithm(ctx) {\n  const { width, height, map, random } = ctx;\n  const roomCount = Math.max(4, Math.floor((width + height) / 6));\n  const rooms = [];\n  for (let i = 0; i < roomCount; i++) {\n    const w = 4 + Math.floor(random() * 6);\n    const h = 4 + Math.floor(random() * 6);\n    const x = 2 + Math.floor(random() * Math.max(1, width - w - 4));\n    const y = 2 + Math.floor(random() * Math.max(1, height - h - 4));\n    rooms.push({ x, y, w, h });\n    for (let yy = y; yy < y + h; yy++) {\n      for (let xx = x; xx < x + w; xx++) map[yy][xx] = 0;\n    }\n  }\n  for (let i = 1; i < rooms.length; i++) {\n    const a = rooms[i - 1];\n    const b = rooms[i];\n    const ax = a.x + (a.w >> 1);\n    const ay = a.y + (a.h >> 1);\n    const bx = b.x + (b.w >> 1);\n    const by = b.y + (b.h >> 1);\n    for (let xx = Math.min(ax, bx); xx <= Math.max(ax, bx); xx++) map[ay][xx] = 0;\n    for (let yy = Math.min(ay, by); yy <= Math.max(ay, by); yy++) map[yy][bx] = 0;\n  }\n  ctx.ensureConnectivity();\n}\n`,
    structure: `function algorithm(ctx) {\n  const { width, height, map, random, structures } = ctx;\n  for (let y = 1; y < height - 1; y++) {\n    for (let x = 1; x < width - 1; x++) map[y][x] = 1;\n  }\n  const cx = Math.floor(width / 2);\n  const cy = Math.floor(height / 2);\n  if (structures && typeof structures.list === 'function') {\n    const pool = structures.list();\n    if (pool && pool.length) {\n      const rand = typeof random === 'function' ? random : Math.random;\n      const chosen = pool[Math.floor(rand() * pool.length) % pool.length];\n      if (chosen && chosen.id) {\n        const rot = Math.floor(rand() * 360) % 360;\n        structures.place(chosen.id, cx, cy, { rotation: rot });\n      }\n    }\n  }\n  ctx.ensureConnectivity();\n}\n`
};

MOD_MAKER_TEMPLATES.fixed = `function algorithm(ctx) {\n  const applied = ctx.fixedMaps?.applyCurrent?.();\n  if (!applied) {\n    for (let y = 1; y < ctx.height - 1; y++) {\n      for (let x = 1; x < ctx.width - 1; x++) ctx.map[y][x] = 0;\n    }\n    ctx.ensureConnectivity();\n  }\n}\n`;

const modMakerState = {
    metadata: {
        id: 'custom_pack',
        name: 'Custom Dungeon Pack',
        version: '1.0.0',
        author: '',
        description: ''
    },
    structures: [],
    generators: [],
    blocks: {
        blocks1: [],
        blocks2: [],
        blocks3: []
    },
    selectedStructure: 0,
    selectedGenerator: 0
};


// -------------- Tools Tab: Dungeon Mod Maker --------------
const MOD_MAKER_MAX_STRUCTURE_SIZE = 31;
const MOD_MAKER_DEFAULT_FIXED_WIDTH = 21;
const MOD_MAKER_DEFAULT_FIXED_HEIGHT = 15;
const MOD_MAKER_MIN_FIXED_SIZE = 5;
const MOD_MAKER_MAX_FIXED_SIZE = 75;
const MOD_MAKER_MAX_FLOOR_COUNT = 60;
const MOD_MAKER_GRID_CELL_SIZE = 24;

const STRUCTURE_CELL_COLORS = Object.freeze({
    empty: '#e2e8f0',
    floor: '#93c5fd',
    wall: '#1e293b',
    grid: 'rgba(148, 163, 184, 0.35)',
    anchor: '#f97316'
});

const FIXED_CELL_COLORS = Object.freeze({
    void: '#e2e8f0',
    floor: '#bbf7d0',
    wall: '#0f172a',
    grid: 'rgba(148, 163, 184, 0.35)'
});

const structurePaintState = { active: false, pointerId: null, lastKey: null, targetValue: null };
const fixedPaintState = { active: false, pointerId: null, lastKey: null, targetValue: null };

function initModMakerTool() {
    if (modMakerRefs) return;
    const scope = document.getElementById('tool-mod-maker') || document;

    modMakerRefs = {
        addonId: document.getElementById('modmaker-addon-id'),
        addonName: document.getElementById('modmaker-addon-name'),
        addonVersion: document.getElementById('modmaker-addon-version'),
        addonAuthor: document.getElementById('modmaker-addon-author'),
        addonDescription: document.getElementById('modmaker-addon-description'),
        structureList: document.getElementById('modmaker-structure-list'),
        addStructure: document.getElementById('modmaker-add-structure'),
        removeStructure: document.getElementById('modmaker-remove-structure'),
        structureId: document.getElementById('modmaker-structure-id'),
        structureName: document.getElementById('modmaker-structure-name'),
        structureAnchorX: document.getElementById('modmaker-structure-anchor-x'),
        structureAnchorY: document.getElementById('modmaker-structure-anchor-y'),
        structureTags: document.getElementById('modmaker-structure-tags'),
        structureAllowRotate: document.getElementById('modmaker-structure-allow-rotate'),
        structureAllowMirror: document.getElementById('modmaker-structure-allow-mirror'),
        structureWidth: document.getElementById('modmaker-structure-width'),
        structureHeight: document.getElementById('modmaker-structure-height'),
        grid: document.getElementById('modmaker-grid'),
        structureCanvas: document.getElementById('modmaker-grid-canvas'),
        structurePlaceholder: document.querySelector('#modmaker-grid .modmaker-grid-placeholder'),
        patternPreview: document.getElementById('modmaker-pattern-preview'),
        fillEmpty: document.getElementById('modmaker-fill-empty'),
        fillFloor: document.getElementById('modmaker-fill-floor'),
        fillWall: document.getElementById('modmaker-fill-wall'),
        fixedContainer: document.getElementById('modmaker-fixed-container'),
        fixedEnabled: document.getElementById('modmaker-fixed-enabled'),
        fixedFloorCount: document.getElementById('modmaker-fixed-floor-count'),
        fixedBossFloors: document.getElementById('modmaker-fixed-boss-floors'),
        fixedFloorList: document.getElementById('modmaker-fixed-floor-list'),
        fixedWidth: document.getElementById('modmaker-fixed-width'),
        fixedHeight: document.getElementById('modmaker-fixed-height'),
        fixedCopyPrev: document.getElementById('modmaker-fixed-copy-prev'),
        fixedFillWall: document.getElementById('modmaker-fixed-fill-wall'),
        fixedFillFloor: document.getElementById('modmaker-fixed-fill-floor'),
        fixedFillVoid: document.getElementById('modmaker-fixed-fill-void'),
        fixedGrid: document.getElementById('modmaker-fixed-grid'),
        fixedCanvas: document.getElementById('modmaker-fixed-grid-canvas'),
        fixedPlaceholder: document.querySelector('#modmaker-fixed-grid .modmaker-grid-placeholder'),
        generatorList: document.getElementById('modmaker-generator-list'),
        addGenerator: document.getElementById('modmaker-add-generator'),
        removeGenerator: document.getElementById('modmaker-remove-generator'),
        generatorId: document.getElementById('modmaker-generator-id'),
        generatorName: document.getElementById('modmaker-generator-name'),
        generatorDescription: document.getElementById('modmaker-generator-description'),
        generatorNormalMix: document.getElementById('modmaker-generator-normal-mix'),
        generatorBlockdimMix: document.getElementById('modmaker-generator-blockdim-mix'),
        generatorTags: document.getElementById('modmaker-generator-tags'),
        templateSelect: document.getElementById('modmaker-template-select'),
        templateApply: document.getElementById('modmaker-apply-template'),
        generatorCode: document.getElementById('modmaker-generator-code'),
        blocks: {
            blocks1: document.getElementById('modmaker-blocks1'),
            blocks2: document.getElementById('modmaker-blocks2'),
            blocks3: document.getElementById('modmaker-blocks3')
        },
        output: document.getElementById('modmaker-output'),
        copy: document.getElementById('modmaker-copy'),
        download: document.getElementById('modmaker-download'),
        errors: document.getElementById('modmaker-errors')
    };

    ensureModMakerDefaults();

    const bindInput = (el, handler, event = 'input') => {
        if (!el) return;
        el.addEventListener(event, handler);
    };

    bindInput(modMakerRefs.addonId, () => {
        modMakerState.metadata.id = modMakerRefs.addonId.value.trim();
        renderModMaker();
    });
    bindInput(modMakerRefs.addonName, () => {
        modMakerState.metadata.name = modMakerRefs.addonName.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.addonVersion, () => {
        modMakerState.metadata.version = modMakerRefs.addonVersion.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.addonAuthor, () => {
        modMakerState.metadata.author = modMakerRefs.addonAuthor.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.addonDescription, () => {
        modMakerState.metadata.description = modMakerRefs.addonDescription.value;
        renderModMaker();
    });

    if (modMakerRefs.addStructure) {
        modMakerRefs.addStructure.addEventListener('click', () => {
            modMakerState.structures.push(createNewStructure());
            modMakerState.selectedStructure = modMakerState.structures.length - 1;
            renderModMaker();
        });
    }
    if (modMakerRefs.removeStructure) {
        modMakerRefs.removeStructure.addEventListener('click', () => {
            if (modMakerState.structures.length <= 1) {
                const single = modMakerState.structures[0];
                if (single) single.matrix = modMakerCreateMatrix(single.width, single.height, null);
            } else {
                modMakerState.structures.splice(modMakerState.selectedStructure, 1);
                modMakerState.selectedStructure = Math.max(0, modMakerState.selectedStructure - 1);
            }
            ensureModMakerDefaults();
            renderModMaker();
        });
    }

    bindInput(modMakerRefs.structureId, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.id = modMakerRefs.structureId.value.trim();
        renderModMaker();
    });
    bindInput(modMakerRefs.structureName, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.name = modMakerRefs.structureName.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.structureAnchorX, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.anchorX = clampAnchor(modMakerRefs.structureAnchorX.value, structure.width - 1);
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureAnchorY, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.anchorY = clampAnchor(modMakerRefs.structureAnchorY.value, structure.height - 1);
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureTags, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.tagsText = modMakerRefs.structureTags.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.structureAllowRotate, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.allowRotation = !!modMakerRefs.structureAllowRotate.checked;
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureAllowMirror, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.allowMirror = !!modMakerRefs.structureAllowMirror.checked;
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureWidth, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        const width = clampStructureSize(modMakerRefs.structureWidth.value);
        resizeStructure(structure, width, structure.height);
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureHeight, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        const height = clampStructureSize(modMakerRefs.structureHeight.value);
        resizeStructure(structure, structure.width, height);
        renderModMaker();
    }, 'change');

    if (modMakerRefs.fillEmpty) {
        modMakerRefs.fillEmpty.addEventListener('click', () => fillStructureCells(null));
    }
    if (modMakerRefs.fillFloor) {
        modMakerRefs.fillFloor.addEventListener('click', () => fillStructureCells(0));
    }
    if (modMakerRefs.fillWall) {
        modMakerRefs.fillWall.addEventListener('click', () => fillStructureCells(1));
    }

    if (modMakerRefs.structureCanvas) {
        modMakerRefs.structureCanvas.addEventListener('pointerdown', handleStructurePointerDown);
        modMakerRefs.structureCanvas.addEventListener('pointermove', handleStructurePointerMove);
        modMakerRefs.structureCanvas.addEventListener('pointerup', handleStructurePointerUp);
        modMakerRefs.structureCanvas.addEventListener('pointercancel', handleStructurePointerUp);
    }
    if (modMakerRefs.fixedCanvas) {
        modMakerRefs.fixedCanvas.addEventListener('pointerdown', handleFixedPointerDown);
        modMakerRefs.fixedCanvas.addEventListener('pointermove', handleFixedPointerMove);
        modMakerRefs.fixedCanvas.addEventListener('pointerup', handleFixedPointerUp);
        modMakerRefs.fixedCanvas.addEventListener('pointercancel', handleFixedPointerUp);
    }
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    bindInput(modMakerRefs.fixedEnabled, () => {
        const fixed = getSelectedFixedState();
        if (!fixed) return;
        const generator = getSelectedGenerator();
        const enabled = !!modMakerRefs.fixedEnabled.checked;
        fixed.enabled = enabled;
        if (enabled && generator && !(generator.code || '').trim()) {
            generator.code = MOD_MAKER_TEMPLATES.fixed.trim();
        }
        renderModMaker();
    }, 'change');

    bindInput(modMakerRefs.fixedFloorCount, () => {
        const fixed = getSelectedFixedState();
        if (!fixed) return;
        fixed.floorCount = clampFixedFloorCount(modMakerRefs.fixedFloorCount.value);
        ensureGeneratorFixedState(getSelectedGenerator());
        renderModMaker();
    }, 'change');

    bindInput(modMakerRefs.fixedBossFloors, () => {
        const fixed = getSelectedFixedState();
        if (!fixed) return;
        fixed.bossFloorsText = modMakerRefs.fixedBossFloors.value;
        renderModMaker();
    });

    bindInput(modMakerRefs.fixedWidth, () => {
        const floor = getSelectedFixedFloor();
        if (!floor) return;
        resizeFixedFloor(floor, modMakerRefs.fixedWidth.value, floor.height);
        renderModMaker();
    }, 'change');

    bindInput(modMakerRefs.fixedHeight, () => {
        const floor = getSelectedFixedFloor();
        if (!floor) return;
        resizeFixedFloor(floor, floor.width, modMakerRefs.fixedHeight.value);
        renderModMaker();
    }, 'change');

    if (modMakerRefs.fixedCopyPrev) {
        modMakerRefs.fixedCopyPrev.addEventListener('click', () => copyFixedFloorFromPrev());
    }
    if (modMakerRefs.fixedFillWall) {
        modMakerRefs.fixedFillWall.addEventListener('click', () => fillFixedFloor(1));
    }
    if (modMakerRefs.fixedFillFloor) {
        modMakerRefs.fixedFillFloor.addEventListener('click', () => fillFixedFloor(0));
    }
    if (modMakerRefs.fixedFillVoid) {
        modMakerRefs.fixedFillVoid.addEventListener('click', () => fillFixedFloor(null));
    }

    if (modMakerRefs.addGenerator) {
        modMakerRefs.addGenerator.addEventListener('click', () => {
            modMakerState.generators.push(createNewGenerator());
            modMakerState.selectedGenerator = modMakerState.generators.length - 1;
            renderModMaker();
        });
    }
    if (modMakerRefs.removeGenerator) {
        modMakerRefs.removeGenerator.addEventListener('click', () => {
            if (modMakerState.generators.length <= 1) {
                const single = modMakerState.generators[0];
                if (single) single.code = MOD_MAKER_TEMPLATES.blank;
            } else {
                modMakerState.generators.splice(modMakerState.selectedGenerator, 1);
                modMakerState.selectedGenerator = Math.max(0, modMakerState.selectedGenerator - 1);
            }
            ensureModMakerDefaults();
            renderModMaker();
        });
    }

    bindInput(modMakerRefs.generatorId, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.id = modMakerRefs.generatorId.value.trim();
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorName, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.name = modMakerRefs.generatorName.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorDescription, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.description = modMakerRefs.generatorDescription.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorNormalMix, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        const value = Number(modMakerRefs.generatorNormalMix.value);
        generator.mixinNormal = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorBlockdimMix, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        const value = Number(modMakerRefs.generatorBlockdimMix.value);
        generator.mixinBlockDim = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorTags, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.tagsText = modMakerRefs.generatorTags.value;
        renderModMaker();
    });

    if (modMakerRefs.templateSelect) modMakerRefs.templateSelect.value = 'blank';
    if (modMakerRefs.templateApply) {
        modMakerRefs.templateApply.addEventListener('click', () => {
            const generator = getSelectedGenerator();
            if (!generator) return;
            const key = modMakerRefs.templateSelect ? modMakerRefs.templateSelect.value : 'blank';
            const template = MOD_MAKER_TEMPLATES[key] || MOD_MAKER_TEMPLATES.blank;
            generator.code = template;
            if (key === 'fixed') {
                const fixed = ensureGeneratorFixedState(generator);
                if (fixed) fixed.enabled = true;
            }
            renderModMaker();
        });
    }
    bindInput(modMakerRefs.generatorCode, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.code = modMakerRefs.generatorCode.value;
        refreshModMakerPreview();
    });

    const blockAddButtons = scope.querySelectorAll('.modmaker-add-block');
    blockAddButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tier = btn.dataset.tier;
            if (!tier || !modMakerState.blocks[tier]) return;
            modMakerState.blocks[tier].push(createNewBlockEntry(tier));
            renderModMaker();
        });
    });

    if (modMakerRefs.copy) modMakerRefs.copy.addEventListener('click', copyModMakerOutput);
    if (modMakerRefs.download) modMakerRefs.download.addEventListener('click', downloadModMakerOutput);

    renderModMaker();
}
function ensureModMakerDefaults() {
    if (!Array.isArray(modMakerState.structures)) modMakerState.structures = [];
    if (!modMakerState.structures.length) modMakerState.structures.push(createNewStructure());
    if (!Array.isArray(modMakerState.generators)) modMakerState.generators = [];
    if (!modMakerState.generators.length) modMakerState.generators.push(createNewGenerator());
    modMakerState.generators.forEach(gen => ensureGeneratorFixedState(gen));
    if (!modMakerState.blocks || typeof modMakerState.blocks !== 'object') {
        modMakerState.blocks = { blocks1: [], blocks2: [], blocks3: [] };
    }
    for (const tier of ['blocks1', 'blocks2', 'blocks3']) {
        if (!Array.isArray(modMakerState.blocks[tier])) modMakerState.blocks[tier] = [];
    }
    modMakerState.selectedStructure = Math.min(Math.max(0, modMakerState.selectedStructure || 0), modMakerState.structures.length - 1);
    modMakerState.selectedGenerator = Math.min(Math.max(0, modMakerState.selectedGenerator || 0), modMakerState.generators.length - 1);
}

function modMakerCreateMatrix(width, height, fill = null) {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    const rows = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) row.push(fill);
        rows.push(row);
    }
    return rows;
}

function createNewStructure() {
    const width = 7;
    const height = 7;
    return {
        id: `structure_${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        width,
        height,
        anchorX: Math.floor(width / 2),
        anchorY: Math.floor(height / 2),
        allowRotation: true,
        allowMirror: true,
        tagsText: '',
        matrix: modMakerCreateMatrix(width, height, null)
    };
}

function createNewGenerator() {
    return {
        id: `custom_${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        description: '',
        mixinNormal: 0,
        mixinBlockDim: 0,
        tagsText: '',
        code: MOD_MAKER_TEMPLATES.blank,
        fixed: createDefaultFixedState()
    };
}

function createDefaultFixedState() {
    return {
        enabled: false,
        floorCount: 1,
        bossFloorsText: '',
        selected: 0,
        floors: [createFixedFloor()]
    };
}

function createFixedFloor(width = MOD_MAKER_DEFAULT_FIXED_WIDTH, height = MOD_MAKER_DEFAULT_FIXED_HEIGHT, sourceMatrix = null) {
    const w = clampFixedMapSize(width, MOD_MAKER_DEFAULT_FIXED_WIDTH);
    const h = clampFixedMapSize(height, MOD_MAKER_DEFAULT_FIXED_HEIGHT);
    const matrix = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            const base = sourceMatrix?.[y]?.[x];
            if (base === 0) row.push(0);
            else if (base === 1) row.push(1);
            else row.push(null);
        }
        matrix.push(row);
    }
    return { width: w, height: h, matrix };
}

function cloneFixedFloor(floor) {
    if (!floor) return createFixedFloor();
    return createFixedFloor(floor.width, floor.height, floor.matrix);
}

function clampFixedFloorCount(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, Math.min(MOD_MAKER_MAX_FLOOR_COUNT, Math.floor(n)));
}

function clampFixedMapSize(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback != null ? fallback : MOD_MAKER_DEFAULT_FIXED_WIDTH;
    return Math.max(MOD_MAKER_MIN_FIXED_SIZE, Math.min(MOD_MAKER_MAX_FIXED_SIZE, Math.floor(n)));
}

function ensureGeneratorFixedState(generator) {
    if (!generator) return null;
    if (!generator.fixed || typeof generator.fixed !== 'object') {
        generator.fixed = createDefaultFixedState();
    }
    const fixed = generator.fixed;
    fixed.floorCount = clampFixedFloorCount(fixed.floorCount);
    if (!Array.isArray(fixed.floors) || !fixed.floors.length) {
        fixed.floors = [createFixedFloor()];
    }
    while (fixed.floors.length < fixed.floorCount) {
        const prev = fixed.floors[fixed.floors.length - 1];
        fixed.floors.push(cloneFixedFloor(prev));
    }
    if (fixed.floors.length > fixed.floorCount) {
        fixed.floors.length = fixed.floorCount;
    }
    if (!Number.isFinite(fixed.selected)) fixed.selected = 0;
    fixed.selected = Math.min(Math.max(0, Math.floor(fixed.selected)), Math.max(0, fixed.floors.length - 1));
    return fixed;
}

function getSelectedFixedState() {
    const generator = getSelectedGenerator();
    return ensureGeneratorFixedState(generator);
}

function getSelectedFixedFloor() {
    const fixed = getSelectedFixedState();
    if (!fixed) return null;
    return fixed.floors[fixed.selected] || null;
}

function createNewBlockEntry(tier) {
    const current = Array.isArray(modMakerState.blocks?.[tier]) ? modMakerState.blocks[tier].length + 1 : 1;
    const suffix = String(current).padStart(2, '0');
    const prefix = tier === 'blocks1' ? 'block1_' : tier === 'blocks2' ? 'block2_' : 'block3_';
    return {
        key: `${prefix}${suffix}`,
        name: '',
        level: '0',
        size: '0',
        depth: '0',
        chest: 'normal',
        type: '',
        bossFloors: '',
        description: ''
    };
}

function getSelectedStructure() {
    return modMakerState.structures[modMakerState.selectedStructure] || null;
}

function getSelectedGenerator() {
    return modMakerState.generators[modMakerState.selectedGenerator] || null;
}

function clampStructureSize(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.min(MOD_MAKER_MAX_STRUCTURE_SIZE, Math.max(1, Math.floor(n)));
}

function clampAnchor(value, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.min(Math.max(0, Math.floor(n)), Math.max(0, max));
}

function resizeStructure(structure, width, height) {
    const w = clampStructureSize(width);
    const h = clampStructureSize(height);
    const next = modMakerCreateMatrix(w, h, null);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            next[y][x] = structure.matrix?.[y]?.[x] ?? null;
        }
    }
    structure.width = w;
    structure.height = h;
    structure.matrix = next;
    structure.anchorX = clampAnchor(structure.anchorX, w - 1);
    structure.anchorY = clampAnchor(structure.anchorY, h - 1);
}

function cycleStructureCell(value) {
    if (value === null || typeof value === 'undefined') return 0;
    if (value === 0) return 1;
    return null;
}

function fillStructureCells(fill) {
    const structure = getSelectedStructure();
    if (!structure) return;
    for (let y = 0; y < structure.height; y++) {
        for (let x = 0; x < structure.width; x++) {
            structure.matrix[y][x] = fill;
        }
    }
    renderModMaker();
}

function clearModMakerCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setGridPlaceholder(container, placeholderEl, message, disabled) {
    if (!container) return;
    container.classList.toggle('placeholder', !!disabled);
    container.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (placeholderEl) {
        placeholderEl.textContent = message || '';
    }
}

function prepareModMakerCanvas(canvas, width, height) {
    if (!canvas) return null;
    const cols = Math.max(1, Number(width) || 1);
    const rows = Math.max(1, Number(height) || 1);
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = cols * MOD_MAKER_GRID_CELL_SIZE;
    const displayHeight = rows * MOD_MAKER_GRID_CELL_SIZE;
    const pixelWidth = Math.round(displayWidth * dpr);
    const pixelHeight = Math.round(displayHeight * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
    }
    if (canvas.style.width !== `${displayWidth}px`) {
        canvas.style.width = `${displayWidth}px`;
    }
    if (canvas.style.height !== `${displayHeight}px`) {
        canvas.style.height = `${displayHeight}px`;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return { ctx, cols, rows, cellSize: MOD_MAKER_GRID_CELL_SIZE, displayWidth, displayHeight };
}

function drawGridLines(ctx, cols, rows, cellSize, color) {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= cols; x++) {
        const px = x * cellSize + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, rows * cellSize);
    }
    for (let y = 0; y <= rows; y++) {
        const py = y * cellSize + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(cols * cellSize, py);
    }
    ctx.stroke();
    ctx.restore();
}

function renderStructureGrid(structure) {
    const container = modMakerRefs?.grid;
    const canvas = modMakerRefs?.structureCanvas;
    const placeholder = modMakerRefs?.structurePlaceholder;
    if (!container || !canvas) return;
    if (!structure) {
        clearModMakerCanvas(canvas);
        setGridPlaceholder(container, placeholder, '構造を追加するとここにプレビューが表示されます。', true);
        return;
    }
    setGridPlaceholder(container, placeholder, '', false);
    const prepared = prepareModMakerCanvas(canvas, structure.width, structure.height);
    if (!prepared) return;
    const { ctx, cols, rows, cellSize } = prepared;
    ctx.clearRect(0, 0, cols * cellSize, rows * cellSize);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, cols * cellSize, rows * cellSize);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = structure.matrix?.[y]?.[x];
            if (cell === 1) ctx.fillStyle = STRUCTURE_CELL_COLORS.wall;
            else if (cell === 0) ctx.fillStyle = STRUCTURE_CELL_COLORS.floor;
            else ctx.fillStyle = STRUCTURE_CELL_COLORS.empty;
            ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
        }
    }
    drawGridLines(ctx, cols, rows, cellSize, STRUCTURE_CELL_COLORS.grid);
    const ax = structure.anchorX;
    const ay = structure.anchorY;
    if (Number.isFinite(ax) && Number.isFinite(ay) && ax >= 0 && ay >= 0 && ax < cols && ay < rows) {
        const startX = ax * cellSize;
        const startY = ay * cellSize;
        ctx.save();
        ctx.strokeStyle = STRUCTURE_CELL_COLORS.anchor;
        ctx.lineWidth = 2;
        ctx.strokeRect(startX + 2, startY + 2, cellSize - 4, cellSize - 4);
        const cx = startX + cellSize / 2;
        const cy = startY + cellSize / 2;
        const mark = cellSize * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - mark, cy);
        ctx.lineTo(cx + mark, cy);
        ctx.moveTo(cx, cy - mark);
        ctx.lineTo(cx, cy + mark);
        ctx.stroke();
        ctx.restore();
    }
}

function resizeFixedFloor(floor, width, height) {
    if (!floor) return;
    const w = clampFixedMapSize(width, floor.width || MOD_MAKER_DEFAULT_FIXED_WIDTH);
    const h = clampFixedMapSize(height, floor.height || MOD_MAKER_DEFAULT_FIXED_HEIGHT);
    const next = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            const val = floor.matrix?.[y]?.[x];
            if (val === 0) row.push(0);
            else if (val === 1) row.push(1);
            else row.push(null);
        }
        next.push(row);
    }
    floor.width = w;
    floor.height = h;
    floor.matrix = next;
}

function cycleFixedCell(value) {
    if (value === 1) return 0;
    if (value === 0) return null;
    return 1;
}

function fillFixedFloor(fill) {
    const floor = getSelectedFixedFloor();
    if (!floor) return;
    for (let y = 0; y < floor.height; y++) {
        for (let x = 0; x < floor.width; x++) {
            floor.matrix[y][x] = fill;
        }
    }
    renderModMaker();
}

function copyFixedFloorFromPrev() {
    const fixed = getSelectedFixedState();
    if (!fixed) return;
    const idx = fixed.selected;
    if (idx <= 0) return;
    const prev = fixed.floors[idx - 1];
    const current = fixed.floors[idx];
    if (!prev || !current) return;
    const cloned = cloneFixedFloor(prev);
    current.width = cloned.width;
    current.height = cloned.height;
    current.matrix = cloned.matrix;
    renderModMaker();
}

function renderFixedMapGrid(fixed) {
    const container = modMakerRefs?.fixedGrid;
    const canvas = modMakerRefs?.fixedCanvas;
    const placeholder = modMakerRefs?.fixedPlaceholder;
    if (!container || !canvas) return;
    container.setAttribute('aria-live', 'polite');
    if (!fixed || !fixed.enabled) {
        clearModMakerCanvas(canvas);
        setGridPlaceholder(container, placeholder, '固定マップを有効にすると編集できます。', true);
        return;
    }
    const floor = fixed.floors[fixed.selected];
    if (!floor) {
        clearModMakerCanvas(canvas);
        setGridPlaceholder(container, placeholder, '階層を追加してください。', true);
        return;
    }
    setGridPlaceholder(container, placeholder, '', false);
    const prepared = prepareModMakerCanvas(canvas, floor.width, floor.height);
    if (!prepared) return;
    const { ctx, cols, rows, cellSize } = prepared;
    ctx.clearRect(0, 0, cols * cellSize, rows * cellSize);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, cols * cellSize, rows * cellSize);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = floor.matrix?.[y]?.[x];
            if (cell === 1) ctx.fillStyle = FIXED_CELL_COLORS.wall;
            else if (cell === 0) ctx.fillStyle = FIXED_CELL_COLORS.floor;
            else ctx.fillStyle = FIXED_CELL_COLORS.void;
            ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
        }
    }
    drawGridLines(ctx, cols, rows, cellSize, FIXED_CELL_COLORS.grid);
}

function locateCanvasCell(event, cols, rows) {
    if (!event || cols <= 0 || rows <= 0) return null;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    if (offsetX < 0 || offsetY < 0 || offsetX > rect.width || offsetY > rect.height) return null;
    const x = Math.floor((offsetX / rect.width) * cols);
    const y = Math.floor((offsetY / rect.height) * rows);
    if (x < 0 || y < 0 || x >= cols || y >= rows) return null;
    return { x, y };
}

function endStructurePaint(pointerId) {
    if (!structurePaintState.active || structurePaintState.pointerId !== pointerId) return;
    structurePaintState.active = false;
    structurePaintState.pointerId = null;
    structurePaintState.lastKey = null;
    structurePaintState.targetValue = null;
    modMakerRefs?.structureCanvas?.releasePointerCapture?.(pointerId);
}

function handleStructurePointerDown(event) {
    if (event.button !== 0) return;
    const structure = getSelectedStructure();
    if (!structure) return;
    const cell = locateCanvasCell(event, structure.width, structure.height);
    if (!cell) return;
    event.preventDefault();
    const current = structure.matrix?.[cell.y]?.[cell.x];
    const next = cycleStructureCell(current);
    structure.matrix[cell.y][cell.x] = next;
    structurePaintState.active = true;
    structurePaintState.pointerId = event.pointerId;
    structurePaintState.lastKey = `${cell.x},${cell.y}`;
    structurePaintState.targetValue = next;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    renderModMaker();
}

function handleStructurePointerMove(event) {
    if (!structurePaintState.active || structurePaintState.pointerId !== event.pointerId) return;
    const structure = getSelectedStructure();
    if (!structure) return;
    const cell = locateCanvasCell(event, structure.width, structure.height);
    if (!cell) return;
    const key = `${cell.x},${cell.y}`;
    if (key === structurePaintState.lastKey) return;
    structurePaintState.lastKey = key;
    structure.matrix[cell.y][cell.x] = structurePaintState.targetValue;
    renderModMaker();
}

function handleStructurePointerUp(event) {
    endStructurePaint(event.pointerId);
}

function endFixedPaint(pointerId) {
    if (!fixedPaintState.active || fixedPaintState.pointerId !== pointerId) return;
    fixedPaintState.active = false;
    fixedPaintState.pointerId = null;
    fixedPaintState.lastKey = null;
    fixedPaintState.targetValue = null;
    modMakerRefs?.fixedCanvas?.releasePointerCapture?.(pointerId);
}

function handleFixedPointerDown(event) {
    if (event.button !== 0) return;
    const fixed = getSelectedFixedState();
    if (!fixed || !fixed.enabled) return;
    const floor = fixed.floors?.[fixed.selected];
    if (!floor) return;
    const cell = locateCanvasCell(event, floor.width, floor.height);
    if (!cell) return;
    event.preventDefault();
    const current = floor.matrix?.[cell.y]?.[cell.x];
    const next = cycleFixedCell(current);
    floor.matrix[cell.y][cell.x] = next;
    fixedPaintState.active = true;
    fixedPaintState.pointerId = event.pointerId;
    fixedPaintState.lastKey = `${cell.x},${cell.y}`;
    fixedPaintState.targetValue = next;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    renderModMaker();
}

function handleFixedPointerMove(event) {
    if (!fixedPaintState.active || fixedPaintState.pointerId !== event.pointerId) return;
    const fixed = getSelectedFixedState();
    if (!fixed || !fixed.enabled) return;
    const floor = fixed.floors?.[fixed.selected];
    if (!floor) return;
    const cell = locateCanvasCell(event, floor.width, floor.height);
    if (!cell) return;
    const key = `${cell.x},${cell.y}`;
    if (key === fixedPaintState.lastKey) return;
    fixedPaintState.lastKey = key;
    floor.matrix[cell.y][cell.x] = fixedPaintState.targetValue;
    renderModMaker();
}

function handleFixedPointerUp(event) {
    endFixedPaint(event.pointerId);
}

function handleGlobalPointerUp(event) {
    endStructurePaint(event.pointerId);
    endFixedPaint(event.pointerId);
}

function renderModMakerFixed(fixed) {
    if (!modMakerRefs) return;
    const container = modMakerRefs.fixedContainer;
    if (container) {
        const disabled = !fixed || !fixed.enabled;
        container.classList.toggle('disabled', disabled);
        container.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    }
    if (modMakerRefs.fixedEnabled) {
        modMakerRefs.fixedEnabled.checked = !!fixed?.enabled;
    }
    if (modMakerRefs.fixedFloorCount) {
        modMakerRefs.fixedFloorCount.disabled = !fixed;
        modMakerRefs.fixedFloorCount.value = fixed ? fixed.floorCount : 1;
    }
    if (modMakerRefs.fixedBossFloors) {
        modMakerRefs.fixedBossFloors.disabled = !fixed || !fixed.enabled;
        modMakerRefs.fixedBossFloors.value = fixed?.bossFloorsText || '';
    }
    if (modMakerRefs.fixedFloorList) {
        modMakerRefs.fixedFloorList.innerHTML = '';
        if (fixed) {
            fixed.floors.forEach((floor, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = `${idx + 1}F`;
                btn.classList.toggle('active', idx === fixed.selected);
                btn.disabled = !fixed.enabled;
                btn.addEventListener('click', () => {
                    fixed.selected = idx;
                    renderModMaker();
                });
                modMakerRefs.fixedFloorList.appendChild(btn);
            });
        }
    }
    const selectedFloor = fixed?.floors?.[fixed.selected] || null;
    if (modMakerRefs.fixedWidth) {
        modMakerRefs.fixedWidth.disabled = !fixed || !fixed.enabled || !selectedFloor;
        modMakerRefs.fixedWidth.value = selectedFloor ? selectedFloor.width : MOD_MAKER_DEFAULT_FIXED_WIDTH;
    }
    if (modMakerRefs.fixedHeight) {
        modMakerRefs.fixedHeight.disabled = !fixed || !fixed.enabled || !selectedFloor;
        modMakerRefs.fixedHeight.value = selectedFloor ? selectedFloor.height : MOD_MAKER_DEFAULT_FIXED_HEIGHT;
    }
    if (modMakerRefs.fixedCopyPrev) {
        modMakerRefs.fixedCopyPrev.disabled = !fixed || !fixed.enabled || !selectedFloor || fixed.selected === 0;
    }
    if (modMakerRefs.fixedFillWall) modMakerRefs.fixedFillWall.disabled = !fixed || !fixed.enabled;
    if (modMakerRefs.fixedFillFloor) modMakerRefs.fixedFillFloor.disabled = !fixed || !fixed.enabled;
    if (modMakerRefs.fixedFillVoid) modMakerRefs.fixedFillVoid.disabled = !fixed || !fixed.enabled;
    renderFixedMapGrid(fixed);
}

function modMakerPatternFromMatrix(matrix) {
    const rows = [];
    for (const row of matrix || []) {
        const line = row.map(cell => {
            if (cell === 1) return '#';
            if (cell === 0) return '.';
            return ' ';
        }).join('');
        rows.push(line);
    }
    return rows;
}

function modMakerPatternFromFixedMatrix(matrix, width, height) {
    const rows = [];
    for (let y = 0; y < height; y++) {
        const line = [];
        for (let x = 0; x < width; x++) {
            const cell = matrix?.[y]?.[x];
            if (cell === 0) line.push('.');
            else if (cell === 1) line.push('#');
            else line.push(' ');
        }
        rows.push(line.join(''));
    }
    return rows;
}

function normalizeGeneratorFixed(generator, index, errors) {
    const fixed = ensureGeneratorFixedState(generator);
    if (!fixed || !fixed.enabled) return null;
    const floorCount = clampFixedFloorCount(fixed.floorCount);
    if (!fixed.floors.length) {
        errors.push(`生成タイプ${index + 1}の固定マップが未設定です。`);
        return null;
    }
    const maps = [];
    for (let i = 0; i < floorCount; i++) {
        const floor = fixed.floors[i];
        if (!floor) {
            errors.push(`生成タイプ${index + 1}の${i + 1}F固定マップが不足しています。`);
            continue;
        }
        const width = clampFixedMapSize(floor.width, MOD_MAKER_DEFAULT_FIXED_WIDTH);
        const height = clampFixedMapSize(floor.height, MOD_MAKER_DEFAULT_FIXED_HEIGHT);
        const pattern = modMakerPatternFromFixedMatrix(floor.matrix, width, height);
        if (!pattern.some(row => row.includes('.'))) {
            errors.push(`生成タイプ${index + 1}の${i + 1}F固定マップに床がありません。`);
        }
        maps.push({ floor: i + 1, layout: pattern });
    }
    if (!maps.length) return null;
    const parsedBoss = Array.isArray(fixed.bossFloors)
        ? fixed.bossFloors
        : parseBossFloors(fixed.bossFloorsText || '');
    const bossFloors = Array.from(new Set((parsedBoss || []).map(n => Number(n)).filter(n => Number.isFinite(n)))).sort((a, b) => a - b);
    const result = { max: floorCount, maps };
    if (bossFloors.length) {
        result.bossFloors = bossFloors;
    }
    return result;
}

function renderModMakerBlocks() {
    if (!modMakerRefs?.blocks) return;
    const tiers = ['blocks1', 'blocks2', 'blocks3'];
    for (const tier of tiers) {
        const container = modMakerRefs.blocks[tier];
        if (!container) continue;
        container.innerHTML = '';
        const entries = modMakerState.blocks[tier] || [];
        if (!entries.length) {
            const empty = document.createElement('p');
            empty.textContent = '未定義です。右上の追加ボタンで作成できます。';
            empty.style.fontSize = '12px';
            empty.style.color = '#6b7280';
            container.appendChild(empty);
            continue;
        }
        entries.forEach((entry, index) => {
            const card = document.createElement('div');
            card.className = 'modmaker-block-card';
            const header = document.createElement('header');
            const title = document.createElement('div');
            title.textContent = entry.name || entry.key || `${tier.toUpperCase()} #${index + 1}`;
            header.appendChild(title);
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '削除';
            removeBtn.addEventListener('click', () => {
                modMakerState.blocks[tier].splice(index, 1);
                renderModMaker();
            });
            header.appendChild(removeBtn);
            card.appendChild(header);

            card.appendChild(createBlockField('キー', entry.key, (val) => { entry.key = val.trim(); }));
            card.appendChild(createBlockField('名前', entry.name, (val) => { entry.name = val; }));
            card.appendChild(createBlockField('レベル補正', entry.level, (val) => { entry.level = val; }, { placeholder: '例: +0' }));
            card.appendChild(createBlockField('サイズ補正', entry.size, (val) => { entry.size = val; }, { placeholder: '例: +1' }));
            card.appendChild(createBlockField('深さ補正', entry.depth, (val) => { entry.depth = val; }, { placeholder: '例: +1' }));
            card.appendChild(createBlockField('宝箱タイプ', entry.chest, (val) => { entry.chest = val; }, { placeholder: 'normal/more/less' }));
            card.appendChild(createBlockField('タイプID', entry.type, (val) => { entry.type = val; }, { placeholder: '例: custom-dungeon' }));
            card.appendChild(createBlockField('ボス階層', entry.bossFloors, (val) => { entry.bossFloors = val; }, { placeholder: '例: 5,10,15' }));
            card.appendChild(createBlockField('説明・メモ', entry.description, (val) => { entry.description = val; }, { multiline: true, rows: 2 }));

            container.appendChild(card);
        });
    }
}

function createBlockField(labelText, value, onChange, options = {}) {
    const label = document.createElement('label');
    label.textContent = labelText;
    const control = options.multiline ? document.createElement('textarea') : document.createElement('input');
    if (!options.multiline) control.type = options.type || 'text';
    if (options.placeholder) control.placeholder = options.placeholder;
    if (options.rows && options.multiline) control.rows = options.rows;
    control.value = value ?? '';
    control.spellcheck = false;
    control.addEventListener(options.event || 'input', () => {
        onChange(control.value);
        if (!options.deferRender) renderModMaker();
    });
    label.appendChild(control);
    return label;
}

function renderModMaker() {
    ensureModMakerDefaults();
    const structure = getSelectedStructure();
    const generator = getSelectedGenerator();
    const fixed = generator ? ensureGeneratorFixedState(generator) : null;

    if (modMakerRefs.addonId) modMakerRefs.addonId.value = modMakerState.metadata.id || '';
    if (modMakerRefs.addonName) modMakerRefs.addonName.value = modMakerState.metadata.name || '';
    if (modMakerRefs.addonVersion) modMakerRefs.addonVersion.value = modMakerState.metadata.version || '';
    if (modMakerRefs.addonAuthor) modMakerRefs.addonAuthor.value = modMakerState.metadata.author || '';
    if (modMakerRefs.addonDescription) modMakerRefs.addonDescription.value = modMakerState.metadata.description || '';

    if (modMakerRefs.structureList) {
        modMakerRefs.structureList.innerHTML = '';
        modMakerState.structures.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = item.name || item.id || `構造${idx + 1}`;
            btn.classList.toggle('active', idx === modMakerState.selectedStructure);
            btn.addEventListener('click', () => {
                modMakerState.selectedStructure = idx;
                renderModMaker();
            });
            modMakerRefs.structureList.appendChild(btn);
        });
    }

    if (modMakerRefs.structureId) {
        modMakerRefs.structureId.disabled = !structure;
        modMakerRefs.structureId.value = structure?.id || '';
    }
    if (modMakerRefs.structureName) {
        modMakerRefs.structureName.disabled = !structure;
        modMakerRefs.structureName.value = structure?.name || '';
    }
    if (modMakerRefs.structureAnchorX) {
        modMakerRefs.structureAnchorX.disabled = !structure;
        modMakerRefs.structureAnchorX.max = structure ? Math.max(0, structure.width - 1) : 0;
        modMakerRefs.structureAnchorX.value = structure ? structure.anchorX : 0;
    }
    if (modMakerRefs.structureAnchorY) {
        modMakerRefs.structureAnchorY.disabled = !structure;
        modMakerRefs.structureAnchorY.max = structure ? Math.max(0, structure.height - 1) : 0;
        modMakerRefs.structureAnchorY.value = structure ? structure.anchorY : 0;
    }
    if (modMakerRefs.structureTags) {
        modMakerRefs.structureTags.disabled = !structure;
        modMakerRefs.structureTags.value = structure?.tagsText || '';
    }
    if (modMakerRefs.structureAllowRotate) {
        modMakerRefs.structureAllowRotate.disabled = !structure;
        modMakerRefs.structureAllowRotate.checked = !!structure?.allowRotation;
    }
    if (modMakerRefs.structureAllowMirror) {
        modMakerRefs.structureAllowMirror.disabled = !structure;
        modMakerRefs.structureAllowMirror.checked = !!structure?.allowMirror;
    }
    if (modMakerRefs.structureWidth) {
        modMakerRefs.structureWidth.disabled = !structure;
        modMakerRefs.structureWidth.value = structure ? structure.width : 1;
    }
    if (modMakerRefs.structureHeight) {
        modMakerRefs.structureHeight.disabled = !structure;
        modMakerRefs.structureHeight.value = structure ? structure.height : 1;
    }
    if (structure) renderStructureGrid(structure);
    if (modMakerRefs.patternPreview) {
        modMakerRefs.patternPreview.value = structure ? modMakerPatternFromMatrix(structure.matrix).join('\n') : '';
    }

    if (modMakerRefs.generatorList) {
        modMakerRefs.generatorList.innerHTML = '';
        modMakerState.generators.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = item.name || item.id || `生成タイプ${idx + 1}`;
            btn.classList.toggle('active', idx === modMakerState.selectedGenerator);
            btn.addEventListener('click', () => {
                modMakerState.selectedGenerator = idx;
                renderModMaker();
            });
            modMakerRefs.generatorList.appendChild(btn);
        });
    }

    if (modMakerRefs.generatorId) {
        modMakerRefs.generatorId.disabled = !generator;
        modMakerRefs.generatorId.value = generator?.id || '';
    }
    if (modMakerRefs.generatorName) {
        modMakerRefs.generatorName.disabled = !generator;
        modMakerRefs.generatorName.value = generator?.name || '';
    }
    if (modMakerRefs.generatorDescription) {
        modMakerRefs.generatorDescription.disabled = !generator;
        modMakerRefs.generatorDescription.value = generator?.description || '';
    }
    if (modMakerRefs.generatorNormalMix) {
        modMakerRefs.generatorNormalMix.disabled = !generator;
        modMakerRefs.generatorNormalMix.value = generator ? generator.mixinNormal : 0;
    }
    if (modMakerRefs.generatorBlockdimMix) {
        modMakerRefs.generatorBlockdimMix.disabled = !generator;
        modMakerRefs.generatorBlockdimMix.value = generator ? generator.mixinBlockDim : 0;
    }
    if (modMakerRefs.generatorTags) {
        modMakerRefs.generatorTags.disabled = !generator;
        modMakerRefs.generatorTags.value = generator?.tagsText || '';
    }
    if (modMakerRefs.generatorCode) {
        modMakerRefs.generatorCode.disabled = !generator;
        modMakerRefs.generatorCode.value = generator?.code || '';
    }

    renderModMakerFixed(fixed);

    renderModMakerBlocks();

    const result = buildModMakerOutput();
    updateModMakerOutputView(result);
}

function buildModMakerOutput() {
    ensureModMakerDefaults();
    const errors = [];
    const metaId = (modMakerState.metadata.id || '').trim();
    const metaName = (modMakerState.metadata.name || '').trim();
    const metaVersion = (modMakerState.metadata.version || '').trim() || '1.0.0';
    const metaAuthor = (modMakerState.metadata.author || '').trim();
    const metaDescription = (modMakerState.metadata.description || '').trim();

    if (!metaId) errors.push('アドオンIDを入力してください。');
    if (metaId && !/^[a-zA-Z0-9_\-]+$/.test(metaId)) errors.push('アドオンIDは英数字・ハイフン・アンダースコアのみ使用できます。');

    const normalizedStructures = [];
    const structureIds = new Set();
    modMakerState.structures.forEach((structure, idx) => {
        const id = (structure.id || '').trim();
        if (!id) errors.push(`構造${idx + 1}のIDを入力してください。`);
        else if (structureIds.has(id)) errors.push(`構造ID「${id}」が重複しています。`);
        else structureIds.add(id);
        const width = clampStructureSize(structure.width);
        const height = clampStructureSize(structure.height);
        if (structure.anchorX < 0 || structure.anchorX >= width || structure.anchorY < 0 || structure.anchorY >= height) {
            errors.push(`構造${idx + 1}のアンカー位置が範囲外です。`);
        }
        normalizedStructures.push({
            id,
            name: (structure.name || '').trim(),
            anchorX: clampAnchor(structure.anchorX, width - 1),
            anchorY: clampAnchor(structure.anchorY, height - 1),
            allowRotation: structure.allowRotation !== false,
            allowMirror: structure.allowMirror !== false,
            tags: parseTags(structure.tagsText || ''),
            pattern: modMakerPatternFromMatrix(structure.matrix || modMakerCreateMatrix(width, height, null))
        });
    });

    const normalizedGenerators = [];
    const generatorIds = new Set();
    if (!modMakerState.generators.length) errors.push('生成タイプを最低1つ追加してください。');
    modMakerState.generators.forEach((generator, idx) => {
        const id = (generator.id || '').trim();
        if (!id) errors.push(`生成タイプ${idx + 1}のIDを入力してください。`);
        else if (generatorIds.has(id)) errors.push(`生成タイプID「${id}」が重複しています。`);
        else generatorIds.add(id);
        let code = (generator.code || '').trim();
        const mixNormal = Number(generator.mixinNormal);
        const mixBlock = Number(generator.mixinBlockDim);
        if (Number.isFinite(mixNormal) && (mixNormal < 0 || mixNormal > 1)) errors.push(`生成タイプ${idx + 1}のNormal混合参加率は0〜1で指定してください。`);
        if (Number.isFinite(mixBlock) && (mixBlock < 0 || mixBlock > 1)) errors.push(`生成タイプ${idx + 1}のBlock次元混合参加率は0〜1で指定してください。`);
        const floors = normalizeGeneratorFixed(generator, idx, errors);
        if (!code) {
            if (floors) {
                code = MOD_MAKER_TEMPLATES.fixed.trim();
            } else {
                errors.push(`生成タイプ${idx + 1}のアルゴリズムコードを入力してください。`);
            }
        }
        normalizedGenerators.push({
            id,
            name: (generator.name || '').trim(),
            description: (generator.description || '').trim(),
            mixinNormal: Number.isFinite(mixNormal) ? Math.max(0, Math.min(1, mixNormal)) : 0,
            mixinBlockDim: Number.isFinite(mixBlock) ? Math.max(0, Math.min(1, mixBlock)) : 0,
            tags: parseTags(generator.tagsText || ''),
            code,
            floors
        });
    });

    const normalizedBlocks = { blocks1: [], blocks2: [], blocks3: [] };
    const blockKeys = new Set();
    for (const tier of ['blocks1', 'blocks2', 'blocks3']) {
        const entries = modMakerState.blocks[tier] || [];
        entries.forEach((entry, idx) => {
            const key = (entry.key || '').trim();
            if (!key) {
                errors.push(`${tier.toUpperCase()} ブロック${idx + 1}のキーを入力してください。`);
                return;
            }
            if (blockKeys.has(key)) {
                errors.push(`ブロックキー「${key}」が重複しています。`);
                return;
            }
            blockKeys.add(key);
            const level = parseNumber(entry.level);
            const size = parseNumber(entry.size);
            const depth = parseNumber(entry.depth);
            const bossFloors = parseBossFloors(entry.bossFloors || '');
            const record = { key };
            if ((entry.name || '').trim()) record.name = entry.name.trim();
            if (Number.isFinite(level)) record.level = level;
            if (Number.isFinite(size)) record.size = size;
            if (Number.isFinite(depth)) record.depth = depth;
            if ((entry.chest || '').trim()) record.chest = entry.chest.trim();
            if ((entry.type || '').trim()) record.type = entry.type.trim();
            if (bossFloors.length) record.bossFloors = bossFloors;
            if ((entry.description || '').trim()) record.description = entry.description.trim();
            normalizedBlocks[tier].push(record);
        });
    }

    const addonProps = [];
    addonProps.push([`id: ${jsString(metaId)}`]);
    if (metaName) addonProps.push([`name: ${jsString(metaName)}`]);
    addonProps.push([`version: ${jsString(metaVersion)}`]);
    if (metaAuthor) addonProps.push([`author: ${jsString(metaAuthor)}`]);
    if (metaDescription) addonProps.push([`description: ${jsString(metaDescription)}`]);

    if (normalizedStructures.length) {
        const structBlock = ['structures: ['];
        normalizedStructures.forEach((structure, idx) => {
            const lines = buildStructureLines(structure);
            if (idx < normalizedStructures.length - 1) {
                lines[lines.length - 1] += ',';
            }
            structBlock.push(...lines);
        });
        structBlock.push(']');
        addonProps.push(structBlock);
    }

    if (normalizedGenerators.length) {
        const genBlock = ['generators: ['];
        normalizedGenerators.forEach((generator, idx) => {
            const lines = buildGeneratorLines(generator);
            if (idx < normalizedGenerators.length - 1) {
                lines[lines.length - 1] += ',';
            }
            genBlock.push(...lines);
        });
        genBlock.push(']');
        addonProps.push(genBlock);
    }

    const blockEntries = Object.fromEntries(Object.entries(normalizedBlocks).filter(([, arr]) => arr.length));
    if (Object.keys(blockEntries).length) {
        const blockLines = ['blocks: {'];
        const tiers = Object.keys(blockEntries);
        tiers.forEach((tier, idx) => {
            blockLines.push(`${indent(3)}${tier}: [`);
            blockEntries[tier].forEach((entry, entryIdx) => {
                const lines = buildBlockEntryLines(entry, 4);
                if (entryIdx < blockEntries[tier].length - 1) {
                    lines[lines.length - 1] += ',';
                }
                blockLines.push(...lines);
            });
            blockLines.push(`${indent(3)}]${idx < tiers.length - 1 ? ',' : ''}`);
        });
        blockLines.push('}');
        addonProps.push(blockLines);
    }

    const lines = [];
    lines.push('// Generated by Tools - Dungeon Type Mod Maker');
    lines.push('(function(){');
    lines.push(`${indent(1)}const addon = {`);
    addonProps.forEach((propLines, idx) => {
        const linesForProp = Array.isArray(propLines) ? propLines : [propLines];
        const isLast = idx === addonProps.length - 1;
        linesForProp.forEach((line, lineIdx) => {
            const needsComma = !isLast && lineIdx === linesForProp.length - 1;
            lines.push(`${indent(2)}${line}${needsComma ? ',' : ''}`);
        });
    });
    lines.push(`${indent(1)}};`);
    lines.push(`${indent(1)}window.registerDungeonAddon(addon);`);
    lines.push('})();');

    return { code: lines.join('\n'), errors };
}

function updateModMakerOutputView(result) {
    if (!modMakerRefs) return;
    const { code, errors } = result || { code: '', errors: [] };
    if (modMakerRefs.output) modMakerRefs.output.value = code || '';
    if (modMakerRefs.copy) {
        modMakerRefs.copy.disabled = !code || errors.length > 0;
        modMakerRefs.copy.textContent = modMakerCopyLabel;
    }
    if (modMakerRefs.download) modMakerRefs.download.disabled = !code || errors.length > 0;
    if (modMakerRefs.errors) {
        modMakerRefs.errors.innerHTML = '';
        if (errors.length) {
            modMakerRefs.errors.style.color = '#dc2626';
            const heading = document.createElement('div');
            heading.textContent = `⚠️ ${errors.length} 件の確認事項があります`;
            const list = document.createElement('ul');
            errors.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg;
                list.appendChild(li);
            });
            modMakerRefs.errors.appendChild(heading);
            modMakerRefs.errors.appendChild(list);
        } else {
            modMakerRefs.errors.style.color = '#15803d';
            modMakerRefs.errors.textContent = '✅ 出力できます';
        }
    }
}

function refreshModMakerPreview() {
    updateModMakerOutputView(buildModMakerOutput());
}

function formatAlgorithmLines(code) {
    const normalized = (code || '').replace(/\r\n/g, '\n').trim();
    if (!normalized) {
        return [
            'function(ctx) {',
            '  // TODO: ctx.map などを編集してダンジョンを生成してください。',
            '}'
        ];
    }
    const lines = normalized.split('\n');
    if (normalized.startsWith('function')) return lines;
    const body = lines.map(line => `  ${line}`);
    return ['function(ctx) {', ...body, '}'];
}

function buildStructureLines(structure) {
    const lines = [];
    lines.push(`${indent(3)}{`);
    lines.push(`${indent(4)}id: ${jsString(structure.id)},`);
    if (structure.name) lines.push(`${indent(4)}name: ${jsString(structure.name)},`);
    lines.push(`${indent(4)}anchor: { x: ${structure.anchorX}, y: ${structure.anchorY} },`);
    lines.push(`${indent(4)}allowRotation: ${structure.allowRotation ? 'true' : 'false'},`);
    lines.push(`${indent(4)}allowMirror: ${structure.allowMirror ? 'true' : 'false'},`);
    if (structure.tags.length) lines.push(`${indent(4)}tags: ${JSON.stringify(structure.tags)},`);
    lines.push(`${indent(4)}pattern: [`);
    structure.pattern.forEach(row => {
        lines.push(`${indent(5)}${jsString(row)},`);
    });
    lines.push(`${indent(4)}]`);
    lines.push(`${indent(3)}}`);
    return lines;
}

function buildGeneratorLines(generator) {
    const lines = [`${indent(3)}{`];
    const props = [];
    props.push([`id: ${jsString(generator.id)}`]);
    if (generator.name) props.push([`name: ${jsString(generator.name)}`]);
    if (generator.description) props.push([`description: ${jsString(generator.description)}`]);
    const mixParts = [];
    if (generator.mixinNormal > 0) mixParts.push(`normalMixed: ${generator.mixinNormal}`);
    if (generator.mixinBlockDim > 0) mixParts.push(`blockDimMixed: ${generator.mixinBlockDim}`);
    if (generator.tags.length) mixParts.push(`tags: ${JSON.stringify(generator.tags)}`);
    if (mixParts.length) props.push([`mixin: { ${mixParts.join(', ')} }`]);
    if (generator.floors) {
        const floorsLines = buildGeneratorFloorsLines(generator.floors);
        if (floorsLines.length) props.push(floorsLines);
    }
    const algoLines = formatAlgorithmLines(generator.code);
    if (algoLines.length) {
        const prop = [`algorithm: ${algoLines[0]}`, ...algoLines.slice(1)];
        props.push(prop);
    }
    props.forEach((propLines, idx) => {
        const isLast = idx === props.length - 1;
        propLines.forEach((line, lineIdx) => {
            const needsComma = !isLast && lineIdx === propLines.length - 1;
            lines.push(`${indent(4)}${line}${needsComma ? ',' : ''}`);
        });
    });
    lines.push(`${indent(3)}}`);
    return lines;
}

function buildGeneratorFloorsLines(floors) {
    if (!floors || !Array.isArray(floors.maps) || !floors.maps.length) return [];
    const maxFloor = Number.isFinite(floors.max) ? floors.max : floors.maps.length;
    const lines = ['floors: {'];
    lines.push(`  max: ${maxFloor},`);
    const boss = Array.isArray(floors.bossFloors) ? floors.bossFloors.filter(n => Number.isFinite(n)).map(n => Math.floor(n)) : [];
    if (boss.length) {
        lines.push(`  bossFloors: [${boss.join(', ')}],`);
    }
    lines.push('  maps: [');
    floors.maps.forEach((map, idx) => {
        const layout = Array.isArray(map.layout) ? map.layout : [];
        lines.push('    {');
        lines.push(`      floor: ${Number.isFinite(map.floor) ? Math.floor(map.floor) : idx + 1},`);
        lines.push('      layout: [');
        layout.forEach((row, rowIdx) => {
            const comma = rowIdx < layout.length - 1 ? ',' : '';
            lines.push(`        ${jsString(row)}${comma}`);
        });
        lines.push('      ]');
        lines.push(`    }${idx < floors.maps.length - 1 ? ',' : ''}`);
    });
    lines.push('  ]');
    lines.push('}');
    return lines;
}

function buildBlockEntryLines(entry, baseIndent = 4) {
    const props = [];
    props.push([`key: ${jsString(entry.key)}`]);
    if (entry.name) props.push([`name: ${jsString(entry.name)}`]);
    if (Object.prototype.hasOwnProperty.call(entry, 'level')) props.push([`level: ${entry.level}`]);
    if (Object.prototype.hasOwnProperty.call(entry, 'size')) props.push([`size: ${entry.size}`]);
    if (Object.prototype.hasOwnProperty.call(entry, 'depth')) props.push([`depth: ${entry.depth}`]);
    if (entry.chest) props.push([`chest: ${jsString(entry.chest)}`]);
    if (entry.type) props.push([`type: ${jsString(entry.type)}`]);
    if (Array.isArray(entry.bossFloors) && entry.bossFloors.length) props.push([`bossFloors: [${entry.bossFloors.join(', ')}]`]);
    if (entry.description) props.push([`description: ${jsString(entry.description)}`]);
    const lines = [`${indent(baseIndent)}{`];
    props.forEach((propLines, idx) => {
        const isLast = idx === props.length - 1;
        propLines.forEach((line, lineIdx) => {
            const needsComma = !isLast && lineIdx === propLines.length - 1;
            lines.push(`${indent(baseIndent + 1)}${line}${needsComma ? ',' : ''}`);
        });
    });
    lines.push(`${indent(baseIndent)}}`);
    return lines;
}

function parseTags(text) {
    if (!text) return [];
    return text.split(',').map(t => t.trim()).filter(Boolean);
}

function parseBossFloors(text) {
    if (!text) return [];
    return text.split(/[\s,]+/).map(v => parseInt(v, 10)).filter(n => Number.isFinite(n));
}

function parseNumber(value) {
    if (value == null || value === '') return NaN;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
}

function indent(level) {
    return '  '.repeat(level);
}

function jsString(value) {
    return JSON.stringify(value ?? '');
}

async function copyModMakerOutput() {
    if (!modMakerRefs?.output) return;
    const text = modMakerRefs.output.value;
    if (!text) return;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            showModMakerCopyFeedback('コピーしました');
            return;
        }
    } catch {}
    try {
        const textarea = modMakerRefs.output;
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        showModMakerCopyFeedback(ok ? 'コピーしました' : 'コピーできませんでした');
    } catch {
        showModMakerCopyFeedback('コピーできませんでした');
    }
}

function showModMakerCopyFeedback(message) {
    modMakerCopyLabel = message;
    if (modMakerRefs?.copy) modMakerRefs.copy.textContent = modMakerCopyLabel;
    if (modMakerCopyTimer) clearTimeout(modMakerCopyTimer);
    modMakerCopyTimer = setTimeout(() => {
        modMakerCopyLabel = 'クリップボードにコピー';
        if (modMakerRefs?.copy) modMakerRefs.copy.textContent = modMakerCopyLabel;
    }, 2000);
}

function downloadModMakerOutput() {
    if (!modMakerRefs?.output) return;
    const code = modMakerRefs.output.value;
    if (!code) return;
    const base = (modMakerState.metadata.id || 'dungeon_addon').replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}





    const api = {
        init: initModMakerTool,
        refreshOutput: refreshModMakerPreview,
        state: modMakerState
    };

    global.ModMakerTool = api;
    if (global.ToolsTab?.registerTool) {
        global.ToolsTab.registerTool('mod-maker', () => api.init());
    }
})(window);
