import json
import random
import re
import time
from pathlib import Path
import subprocess

import requests

ROOT = Path(__file__).resolve().parents[1]

def load_en_locale():
    script = """
const root = global;
root.self = root;
root.__i18nLocales = {};
require('./js/i18n/locales/en.json.js');
const data = root.__i18nLocales.en || {};
process.stdout.write(JSON.stringify(data));
"""
    result = subprocess.run(
        ['node', '-e', script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)

data = load_en_locale()

PLACEHOLDER_PATTERN = re.compile(r"\{[^{}]+\}")

def collect_strings(value, bag):
    if value is None:
        return
    if isinstance(value, str):
        bag.add(value)
    elif isinstance(value, list):
        for item in value:
            collect_strings(item, bag)
    elif isinstance(value, dict):
        for item in value.values():
            collect_strings(item, bag)

unique_strings = set()
collect_strings(data, unique_strings)
print(f'unique strings: {len(unique_strings)}')

cache_dir = ROOT / 'tools' / '.cache'
cache_dir.mkdir(parents=True, exist_ok=True)
cache_path = cache_dir / 'zh-translations.json'
if cache_path.exists():
    translation_map = json.loads(cache_path.read_text(encoding='utf-8'))
else:
    translation_map = {}

strings_list = list(unique_strings)
SEPARATOR = '\uE000'
BATCH_SIZE = 25

def protect_placeholders(text):
    placeholders = PLACEHOLDER_PATTERN.findall(text)
    if not placeholders:
        return text, {}
    mapping = {}
    protected = text
    for index, placeholder in enumerate(placeholders):
        token = f'__PH_{index}__'
        mapping[token] = placeholder
        protected = protected.replace(placeholder, token)
    return protected, mapping

def restore_placeholders(text, mapping):
    restored = text
    for token, placeholder in mapping.items():
        restored = restored.replace(token, placeholder)
    return restored

session = requests.Session()

def translate_once(text):
    attempt = 0
    while True:
        try:
            response = session.get(
                'https://translate.googleapis.com/translate_a/single',
                params={
                    'client': 'gtx',
                    'sl': 'en',
                    'tl': 'zh-CN',
                    'dt': 't',
                    'q': text,
                },
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            parts = data[0]
            translated = ''.join(segment[0] for segment in parts if segment and segment[0])
            if translated is None:
                raise ValueError('empty translation result')
            return translated
        except Exception as error:  # noqa: BLE001
            attempt += 1
            if attempt >= 5:
                raise
            delay = min(5, 0.5 * (2 ** attempt)) + random.random()
            print(f'translation failed (attempt {attempt}): {error}. retrying in {delay:.2f}s')
            time.sleep(delay)

missing_strings = [s for s in strings_list if s not in translation_map]
if missing_strings:
    print(f'missing translations: {len(missing_strings)} / {len(strings_list)}')
else:
    print('No missing translations; using cached results.')

for start in range(0, len(strings_list), BATCH_SIZE):
    chunk = strings_list[start:start + BATCH_SIZE]
    protected = []
    mappings = []
    for original in chunk:
        p, m = protect_placeholders(original)
        protected.append(p)
        mappings.append(m)
    missing_indices = [index for index, original in enumerate(chunk) if original not in translation_map]
    if missing_indices:
        to_translate = [protected[i] for i in missing_indices]
        joined = SEPARATOR.join(to_translate)
        translated_joined = translate_once(joined)
        parts = translated_joined.split(SEPARATOR)
        if len(parts) != len(to_translate):
            print('separator mismatch, falling back to single translations')
            parts = []
            for text in to_translate:
                parts.append(translate_once(text))
        for idx, translated in zip(missing_indices, parts):
            original = chunk[idx]
            mapping = mappings[idx]
            translation_map[original] = restore_placeholders(translated, mapping)
        cache_path.write_text(json.dumps(translation_map, ensure_ascii=False, indent=2), encoding='utf-8')
    progress = min(len(strings_list), start + len(chunk))
    print(f'translated {progress} / {len(strings_list)}')

# ensure every string translated
missing = [s for s in strings_list if s not in translation_map]
if missing:
    raise SystemExit(f'missing translations for {len(missing)} strings')

# rebuild structure

def transform(value):
    if value is None:
        return None
    if isinstance(value, str):
        return translation_map.get(value, value)
    if isinstance(value, list):
        return [transform(item) for item in value]
    if isinstance(value, dict):
        return {key: transform(item) for key, item in value.items()}
    return value

translated_data = transform(data)

output_json = json.dumps(translated_data, ensure_ascii=False, indent=2)
indented = '\n'.join(f'  {line}' for line in output_json.split('\n'))
content = (
    '(function (root) {\n'
    '  if (!root) return;\n'
    "  var store = root.__i18nLocales = root.__i18nLocales || {};\n"
    '  var locale =\n'
    f'{indented};\n\n'
    "  store['zh'] = locale;\n"
    "})(typeof self !== 'undefined' ? self : this);\n"
)
output_path = ROOT / 'js/i18n/locales/zh.json.js'
output_path.write_text(content, encoding='utf-8')
print(f'Wrote {output_path}')
