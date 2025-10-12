(function (global) {
    'use strict';

    const registry = new Map();
    const listeners = new Set();

    function toArray(value) {
        return Array.isArray(value) ? value.slice() : [];
    }

    function notify() {
        if (!listeners.size) return;
        const callbacks = toArray(listeners);
        callbacks.forEach((listener) => {
            try {
                listener();
            } catch (err) {
                console.error('[ToolStateRegistry] Listener failed:', err);
            }
        });
    }

    function register(toolId, descriptor) {
        if (!toolId || typeof descriptor !== 'object' || descriptor === null) return;
        const normalized = {
            id: String(toolId),
            getState: typeof descriptor.getState === 'function' ? descriptor.getState : null,
            setState: typeof descriptor.setState === 'function' ? descriptor.setState : null,
            labelKey: typeof descriptor.labelKey === 'string' ? descriptor.labelKey : null,
            labelFallback: descriptor.labelFallback !== undefined ? descriptor.labelFallback : null
        };
        if (!normalized.getState && !normalized.setState) return;
        registry.set(normalized.id, normalized);
        notify();
    }

    function unregister(toolId) {
        if (!toolId || !registry.delete(toolId)) return;
        notify();
    }

    function get(toolId) {
        if (!toolId) return null;
        return registry.get(toolId) || null;
    }

    function list() {
        return Array.from(registry.values());
    }

    function subscribe(listener) {
        if (typeof listener !== 'function') return () => {};
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }

    global.ToolStateRegistry = {
        register,
        unregister,
        get,
        list,
        subscribe
    };
})(window);
