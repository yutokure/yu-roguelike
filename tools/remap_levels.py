import json
from math import inf

P = 'blockdata.json'

with open(P, 'r', encoding='utf-8') as f:
    data = json.load(f)

changed = False

def strip_auto(arr):
    global changed
    before = len(arr)
    arr[:] = [e for e in arr if not str(e.get('key','')).startswith(('auto1_','auto2_','auto3_','auto_'))]
    if len(arr) != before:
        changed = True

for name in ('blocks1','blocks2','blocks3'):
    arr = data.get(name, [])
    # remove auto entries we previously added
    strip_auto(arr)
    # ensure coverage -5..35 by reassigning levels of existing entries (no additions)
    have = {}
    for i, e in enumerate(arr):
        try:
            lv = int(e.get('level', 0))
        except Exception:
            lv = 0
        have.setdefault(lv, []).append(i)
    target_levels = list(range(-5, 36))
    used = set()
    # build list of candidate indices (prefer entries with minimal constraints)
    candidates = list(range(len(arr)))
    # For stability, sort by (abs(level), index)
    candidates.sort(key=lambda i: (abs(int(arr[i].get('level',0))), i))
    for lv in target_levels:
        if lv in have and have[lv]:
            continue
        # find best candidate to retag to lv
        best_i = None
        best_dist = inf
        for i in candidates:
            if i in used:
                continue
            cur = int(arr[i].get('level', 0)) if isinstance(arr[i].get('level',0), int) else 0
            dist = abs(cur - lv)
            if dist < best_dist:
                best_dist = dist
                best_i = i
            if best_dist == 0:
                break
        if best_i is None:
            continue
        if int(arr[best_i].get('level', 0)) != lv:
            arr[best_i]['level'] = lv
            changed = True
        used.add(best_i)
        have.setdefault(lv, []).append(best_i)
    data[name] = arr

if changed:
    with open(P, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('Remapped levels without adding blocks.')
else:
    print('No changes needed.')

