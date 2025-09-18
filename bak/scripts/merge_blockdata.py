import json, os, glob

SRC = 'blockdata.json'
BACKUP = 'blockdata.backup.json'
OUT = 'blockdata.json'

with open(SRC, 'r', encoding='utf-8') as f:
    data = json.load(f)

result = {'version': data.get('version', 1)}


def renumber_existing(arr, series_digit):
    out = []
    for idx, item in enumerate(arr, start=1):
        new = dict(item)
        new['key'] = f"b{series_digit}{idx:03d}"
        out.append(new)
    return out


def load_chunks(series):
    files = sorted(glob.glob(f'data/blockchunks/{series}/chunk-*.json'))
    out = []
    for fp in files:
        with open(fp, 'r', encoding='utf-8') as f:
            out.extend(json.load(f))
    return out


# blocks1
b1_existing = data['blocks1']
b1 = renumber_existing(b1_existing, '1')
b1.extend(load_chunks('1st'))
assert len(b1) == 100, f"blocks1 length {len(b1)} != 100"
result['blocks1'] = b1

# blocks2
b2_existing = data['blocks2']
b2 = renumber_existing(b2_existing, '2')
b2.extend(load_chunks('2nd'))
assert len(b2) == 100, f"blocks2 length {len(b2)} != 100"
result['blocks2'] = b2

# blocks3
b3_existing = data['blocks3']
b3 = renumber_existing(b3_existing, '3')
b3.extend(load_chunks('3rd'))
assert len(b3) == 100, f"blocks3 length {len(b3)} != 100"
result['blocks3'] = b3

# Backup then write
if os.path.exists(BACKUP):
    os.remove(BACKUP)
os.rename(SRC, BACKUP)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print('merged: blocks1/2/3 =', len(b1), len(b2), len(b3))
print('backup at', BACKUP)

