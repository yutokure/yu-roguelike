(function (global) {
    'use strict';

    const TOOL_ID = 'power-diff';
    const i18n = global.I18n || null;
    const BASE_I18N_KEY = 'tools.powerDiff';

    const BASE_POWER_LOG10 = Math.log10(100);
    const LOG10_TWO = Math.log10(2);
    const LOG10_HALF = Math.log10(0.5);
    const LOG10_1_6 = Math.log10(1.6);
    const LOG10_0_625 = Math.log10(0.625);
    const LOG10_1_26 = Math.log10(1.26);
    const LOG10_0_794 = Math.log10(0.794);

    const KMBT_SUFFIXES = Object.freeze([
        '', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
        'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd',
        'Nod', 'Vg', 'Uvg', 'Dvg', 'Tvg', 'Qavg', 'Qivg', 'Sxvg',
        'Spvg', 'Ocvg', 'Novg', 'Tg'
    ]);

    const JAPANESE_UNITS = Object.freeze([
        '', '万', '億', '兆', '京', '垓', '秭', '穣', '溝', '澗',
        '正', '載', '極', '恒河沙', '阿僧祇', '那由他', '不可思議', '無量大数'
    ]);

    function translate(key, params, fallback) {
        if (key && i18n && typeof i18n.t === 'function') {
            const value = i18n.t(key, params);
            if (value !== undefined && value !== null && value !== key) {
                return value;
            }
        }
        if (typeof fallback === 'function') {
            return fallback(params || {});
        }
        if (fallback !== undefined && fallback !== null) {
            return fallback;
        }
        if (typeof key === 'string') {
            return key;
        }
        return '';
    }

    function trimTrailingZeros(value) {
        return value.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
    }

    function formatMantissa(value, digits) {
        const fixed = Number.isFinite(value) ? value.toFixed(digits) : '0';
        return trimTrailingZeros(fixed);
    }

    function formatSmallNumber(value, options = {}) {
        if (!Number.isFinite(value)) return '-';
        const localeOptions = {
            maximumFractionDigits: options.maximumFractionDigits ?? 6,
            minimumFractionDigits: options.minimumFractionDigits ?? 0
        };
        if (i18n && typeof i18n.formatNumber === 'function') {
            try {
                return i18n.formatNumber(value, localeOptions);
            } catch (err) {
                // Fall back below.
            }
        }
        try {
            return value.toLocaleString(undefined, localeOptions);
        } catch (err) {
            return String(value);
        }
    }

    function addCommas(value) {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function buildIntegerString(log10Value, significantDigits = 15) {
        const exponent = Math.floor(log10Value);
        const mantissa = Math.pow(10, log10Value - exponent);
        const scaled = Math.round(mantissa * Math.pow(10, significantDigits - 1));
        const digits = String(scaled).padStart(significantDigits, '0');
        const decimalIndex = exponent + 1;
        if (decimalIndex >= significantDigits) {
            return digits + '0'.repeat(decimalIndex - significantDigits);
        }
        if (decimalIndex <= 0) {
            return '0';
        }
        return digits.slice(0, decimalIndex);
    }

    function formatComma(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        if (log10Value < 0) {
            return formatSmallNumber(Math.pow(10, log10Value), { maximumFractionDigits: 12 });
        }
        if (log10Value < 15) {
            return formatSmallNumber(Math.pow(10, log10Value), { maximumFractionDigits: 4 });
        }
        return addCommas(buildIntegerString(log10Value));
    }

    function formatScientific(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        const exponent = Math.floor(log10Value);
        const mantissa = Math.pow(10, log10Value - exponent);
        return `${formatMantissa(mantissa, 2)}×10^${exponent}`;
    }

    function resolveKmbtSuffix(group) {
        return KMBT_SUFFIXES[group] || null;
    }

    function alphabetSuffix(index, minLength = 2) {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        let n = Math.max(0, Math.floor(index));
        let result = '';
        do {
            result = letters[n % 26] + result;
            n = Math.floor(n / 26);
        } while (n > 0);
        while (result.length < minLength) {
            result = `a${result}`;
        }
        return result;
    }

    function formatKmbt(log10Value, suffixResolver) {
        if (!Number.isFinite(log10Value)) return '-';
        if (log10Value < 3) {
            return formatSmallNumber(Math.pow(10, log10Value), { maximumFractionDigits: 4 });
        }
        const group = Math.floor(log10Value / 3);
        const suffix = suffixResolver(group);
        if (!suffix) {
            return formatScientific(log10Value);
        }
        const mantissa = Math.pow(10, log10Value - (group * 3));
        return `${formatMantissa(mantissa, 2)}${suffix}`;
    }

    function formatSmartphone(log10Value) {
        return formatKmbt(log10Value, (group) => {
            if (group <= 4) {
                return resolveKmbtSuffix(group);
            }
            return alphabetSuffix(group - 5, 2);
        });
    }

    function formatTetrational(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        let log2Value = log10Value * Math.LOG2_10;
        if (!Number.isFinite(log2Value)) return '-';
        let steps = 0;
        while (log2Value > 2 && steps < 10000) {
            log2Value = Math.log2(log2Value);
            steps += 1;
        }
        const height = steps + Math.max(0, log2Value - 1);
        return `2↑↑${formatMantissa(height, 2)}`;
    }

    function formatJapaneseGroup(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        if (log10Value < 0) {
            return formatSmallNumber(Math.pow(10, log10Value), { maximumFractionDigits: 6 });
        }
        const group = Math.floor(log10Value / 4);
        const unit = JAPANESE_UNITS[group] || null;
        if (!unit) {
            return formatScientific(log10Value);
        }
        const mantissa = Math.pow(10, log10Value - (group * 4));
        return `${formatMantissa(mantissa, 2)}${unit}`;
    }

    function formatManOkuCho(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        if (log10Value < 4) {
            return formatSmallNumber(Math.pow(10, log10Value), { maximumFractionDigits: 4 });
        }
        if (log10Value >= 100) {
            const extraLog10 = log10Value - 100;
            return `${formatJapaneseGroup(extraLog10)}グーゴル`;
        }
        if (log10Value >= 68) {
            const extraLog10 = log10Value - 68;
            return `${formatJapaneseGroup(extraLog10)}無量大数`;
        }
        return formatJapaneseGroup(log10Value);
    }

    function log10MultiplierByLevelDiff(levelDiff) {
        const abs = Math.abs(levelDiff);
        if (abs === 0) return 0;
        if (abs <= 4) {
            const multiplier = levelDiff > 0 ? 1 + (abs * 0.25) : 1 - (abs * 0.125);
            return Math.log10(multiplier);
        }
        if (abs === 5) return levelDiff > 0 ? LOG10_TWO : LOG10_HALF;
        if (abs <= 9) {
            return levelDiff > 0
                ? LOG10_TWO + (abs - 5) * LOG10_1_6
                : LOG10_HALF + (abs - 5) * LOG10_0_625;
        }
        if (abs === 10) return levelDiff > 0 ? 1 : -1;
        if (abs <= 19) {
            return levelDiff > 0
                ? 1 + (abs - 10) * LOG10_1_26
                : -1 + (abs - 10) * LOG10_0_794;
        }
        if (abs === 20) return levelDiff > 0 ? 2 : -2;
        const groups = Math.floor((abs - 20) / 10);
        return levelDiff > 0 ? 2 + groups : -(2 + groups);
    }

    function calculateLog10Power(level) {
        const numeric = Number(level);
        if (!Number.isFinite(numeric)) return null;
        const diff = numeric - 1;
        return {
            log10: BASE_POWER_LOG10 + log10MultiplierByLevelDiff(diff),
            diff
        };
    }

    function formatPower(log10Value, format) {
        switch (format) {
            case 'scientific':
                return formatScientific(log10Value);
            case 'kmbt':
                return formatKmbt(log10Value, resolveKmbtSuffix);
            case 'smartphone':
                return formatSmartphone(log10Value);
            case 'tetrational':
                return formatTetrational(log10Value);
            case 'manoku':
                return formatManOkuCho(log10Value);
            case 'comma':
            default:
                return formatComma(log10Value);
        }
    }

    function updateOutput(refs) {
        if (!refs) return;
        const levelValue = refs.level?.value ?? '';
        const result = calculateLog10Power(levelValue);
        if (!result) {
            refs.value.textContent = '-';
            refs.meta.textContent = '';
            return;
        }
        const formatted = formatPower(result.log10, refs.format?.value || 'comma');
        refs.value.textContent = formatted;
        const metaText = translate(
            `${BASE_I18N_KEY}.output.meta`,
            { diff: result.diff, log10: formatMantissa(result.log10, 4) },
            () => `レベル差: ${result.diff} / log10(戦力): ${formatMantissa(result.log10, 4)}`
        );
        refs.meta.textContent = metaText;
    }

    function init(context) {
        const panel = context?.panel || document;
        const refs = {
            level: panel.querySelector('#power-diff-level'),
            format: panel.querySelector('#power-diff-format'),
            value: panel.querySelector('#power-diff-value'),
            meta: panel.querySelector('#power-diff-meta')
        };
        if (!refs.level || !refs.format || !refs.value || !refs.meta) return;

        const handleInput = () => updateOutput(refs);
        refs.level.addEventListener('input', handleInput);
        refs.format.addEventListener('change', handleInput);

        document.addEventListener('i18n:locale-changed', () => updateOutput(refs));
        updateOutput(refs);
    }

    if (global.ToolsTab?.registerTool) {
        global.ToolsTab.registerTool(TOOL_ID, init);
    }
})(window);
