import json, os

SRC = 'blockdata.json'
BACKUP = 'blockdata.pre-rebalance.json'
OUT = 'blockdata.json'

LOW, HIGH = -5, 35

with open(SRC, 'r', encoding='utf-8') as f:
    data = json.load(f)

def spread_levels(arr):
    n = len(arr)
    if n < 2:
        for it in arr:
            it['level'] = max(LOW, min(HIGH, int(it.get('level', 0))))
        return arr
    for i, it in enumerate(arr):
        v = LOW + (HIGH - LOW) * (i / (n - 1))
        it['level'] = int(round(v))
    return arr

for key in ['blocks1', 'blocks2', 'blocks3']:
    if key in data:
        data[key] = spread_levels(data[key])

if os.path.exists(BACKUP):
    os.remove(BACKUP)
os.rename(SRC, BACKUP)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

def stats(arr):
    lv = [x.get('level') for x in arr]
    return min(lv), max(lv)

print('blocks1 range:', stats(data['blocks1']))
print('blocks2 range:', stats(data['blocks2']))
print('blocks3 range:', stats(data['blocks3']))

