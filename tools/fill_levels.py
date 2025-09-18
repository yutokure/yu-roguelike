import json
from collections import OrderedDict

P = 'blockdata.json'

with open(P,'r',encoding='utf-8') as f:
    data=json.load(f)

changed=False

for arr_name, auto_id in [('blocks1',1),('blocks2',2),('blocks3',3)]:
    arr=data.get(arr_name,[])
    have=set()
    for e in arr:
        try:
            have.add(int(e.get('level',0)))
        except Exception:
            pass
    missing=[lv for lv in range(-5,36) if lv not in have]
    for lv in missing:
        code=('n'+str(abs(lv))) if lv<0 else (('p'+str(lv)) if lv>0 else '0')
        key=f"auto{auto_id}_{code}"
        name=f"Auto Lv{lv:+d}"
        entry=OrderedDict([
            ('key', key),
            ('name', name),
            ('level', lv),
            ('size', 0),
            ('depth', 0),
            ('chest', 'normal'),
            ('type', None),
            ('bossFloors', [])
        ])
        arr.append(entry)
        changed=True
    data[arr_name]=arr

if changed:
    # sort by level then key for readability
    for arr_name in ('blocks1','blocks2','blocks3'):
        data[arr_name]=sorted(data[arr_name], key=lambda e:(e.get('level',0), e.get('key','')))
    with open(P,'w',encoding='utf-8') as f:
        json.dump(data,f,ensure_ascii=False,indent=2)
    print('Updated', P)
else:
    print('No changes required')

