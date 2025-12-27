(function (global) {
    'use strict';

    const TOOL_ID = 'power-diff';
    const i18n = global.I18n || null;
    const BASE_I18N_KEY = 'tools.powerDiff';

    const BASE_POWER_LOG10 = Math.log10(100);
    const LOG10_TWO = Math.log10(2);
    const LOG2_10 = Math.LOG2_10 || (Math.log(10) / Math.log(2));

    const KMBT_SUFFIXES = Object.freeze(['', 'k']);
    const ILLION_BASES = Object.freeze(['', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No']);
    const ILLION_UNIT_PREFIXES = Object.freeze(['', 'U', 'D', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No']);
    const ILLION_TENS_PREFIXES = Object.freeze(['', 'd', 'vg', 'tg', 'qag', 'qig', 'sxg', 'spg', 'ocg', 'nog']);
    const ILLION_HUNDREDS_PREFIXES = Object.freeze(['', 'Ce', 'DuCe', 'TrCe', 'QaCe', 'QiCe', 'SxCe', 'SpCe', 'OcCe', 'NoCe']);

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
        if (log10Value >= 10000) {
            return formatCopyNotation(log10Value);
        }
        if (log10Value < 0) {
            return formatSmallNumber(Math.pow(10, log10Value), { maximumFractionDigits: 12 });
        }
        if (log10Value < 15) {
            return formatSmallNumber(Math.pow(10, log10Value), { maximumFractionDigits: 4 });
        }
        return addCommas(buildIntegerString(log10Value));
    }

    function formatCopyNotation(log10Value) {
        const exponent = Math.floor(log10Value);
        const mantissa = Math.pow(10, log10Value - exponent);
        const digits = exponent + 1;
        const repeatCount = Math.max(1, digits - 1);
        return `${formatMantissa(mantissa, 2)}×9[${repeatCount}]`;
    }

    function formatScientific(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        const exponent = Math.floor(log10Value);
        const mantissa = Math.pow(10, log10Value - exponent);
        return `${formatMantissa(mantissa, 2)}×10^${exponent}`;
    }

    function formatLogarithm(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        return `e${formatMantissa(log10Value, 3)}`;
    }

    function formatArrow(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        return `10↑${formatMantissa(log10Value, 2)}`;
    }

    function capitalizeFirst(value) {
        if (!value) return value;
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function buildIllionPrefix(index) {
        const value = Math.floor(index);
        if (!Number.isFinite(value) || value <= 0) return null;
        if (value < 10) {
            return ILLION_UNIT_PREFIXES[value] || null;
        }
        if (value < 20) {
            if (value === 10) return 'd';
            const unitPrefix = ILLION_UNIT_PREFIXES[value - 10];
            return unitPrefix ? `${unitPrefix}d` : null;
        }
        if (value < 100) {
            const units = value % 10;
            const tens = Math.floor(value / 10);
            const unitPrefix = units ? ILLION_UNIT_PREFIXES[units] : '';
            let tensPrefix = ILLION_TENS_PREFIXES[tens] || '';
            if (!unitPrefix && tensPrefix) {
                tensPrefix = capitalizeFirst(tensPrefix);
            }
            return unitPrefix || tensPrefix ? `${unitPrefix}${tensPrefix}` : null;
        }
        if (value < 1000) {
            const units = value % 10;
            const tens = Math.floor(value / 10) % 10;
            const hundreds = Math.floor(value / 100) % 10;
            const hundredPrefix = ILLION_HUNDREDS_PREFIXES[hundreds] || '';
            const tensPrefix = tens ? ILLION_TENS_PREFIXES[tens] : '';
            const unitPrefix = units ? ILLION_UNIT_PREFIXES[units] : '';
            const combined = `${hundredPrefix}${tensPrefix}${unitPrefix}`;
            return combined || null;
        }
        return null;
    }

    function buildMilliaAbbrev(value) {
        const groups = [];
        let remaining = value;
        while (remaining > 0) {
            groups.push(remaining % 1000);
            remaining = Math.floor(remaining / 1000);
        }
        let result = '';
        for (let i = groups.length - 1; i >= 1; i -= 1) {
            const groupValue = groups[i];
            const prefix = groupValue === 0 ? '' : (groupValue === 1 ? '' : buildIllionPrefix(groupValue));
            if (prefix === null) return null;
            result += `${prefix}m`;
        }
        const remainder = groups[0] || 0;
        if (remainder > 0) {
            const remainderPrefix = buildIllionPrefix(remainder);
            if (remainderPrefix === null) return null;
            result += remainderPrefix;
        }
        return result || null;
    }

    function buildMyriaAbbrev(value) {
        if (value < 10000 || value >= 100000) return null;
        const tensOfThousands = Math.floor(value / 10000);
        const myPrefix = tensOfThousands === 1 ? '' : (ILLION_UNIT_PREFIXES[tensOfThousands] || null);
        if (myPrefix === null) return null;
        const base = `${myPrefix}my`;
        const remainder = value % 10000;
        if (remainder === 0) return base;
        const remainderSuffix = buildMilliaAbbrev(remainder);
        if (!remainderSuffix) return null;
        return `${base}${remainderSuffix}`;
    }

    function buildIllionAbbrev(index) {
        const value = Math.floor(index);
        if (!Number.isFinite(value) || value <= 0) return null;
        if (value < ILLION_BASES.length) {
            return ILLION_BASES[value];
        }
        if (value === 10) return 'Dc';
        if (value < 1000) {
            return buildIllionPrefix(value);
        }
        if (value < 10000) {
            return buildMilliaAbbrev(value);
        }
        if (value < 100000) {
            return buildMyriaAbbrev(value);
        }
        return buildMilliaAbbrev(value);
    }

    function resolveKmbtSuffix(group) {
        if (group <= 1) {
            return KMBT_SUFFIXES[group] || null;
        }
        const illionIndex = group - 1;
        return buildIllionAbbrev(illionIndex);
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

    function calculateSuperLog2(log2Value) {
        if (!Number.isFinite(log2Value)) return null;
        if (log2Value <= 1) {
            return Math.pow(2, log2Value) - 1;
        }
        let height = 0;
        let current = log2Value;
        let guard = 0;
        while (current > 1 && guard < 10000) {
            current = Math.log2(current);
            height += 1;
            guard += 1;
        }
        if (guard >= 10000) return null;
        const remainder = Math.pow(2, current) - 1;
        return height + remainder;
    }

    function formatTetrational(log10Value) {
        if (!Number.isFinite(log10Value)) return '-';
        const log2Value = log10Value * LOG2_10;
        if (!Number.isFinite(log2Value)) return '-';
        const height = calculateSuperLog2(log2Value);
        if (!Number.isFinite(height)) return '-';
        return `2↑↑${formatMantissa(height, 4)}`;
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
        let log10Multiplier;
        if (abs <= 10) {
            const progress = (abs - 5) / 5;
            log10Multiplier = LOG10_TWO + (1 - LOG10_TWO) * progress;
        } else if (abs <= 20) {
            log10Multiplier = 1 + (abs - 10) / 10;
        } else {
            log10Multiplier = 2 + (abs - 20) / 10;
        }
        return levelDiff > 0 ? log10Multiplier : -log10Multiplier;
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
            case 'log':
                return formatLogarithm(log10Value);
            case 'arrow':
                return formatArrow(log10Value);
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
