import json
with open('blockdata.json','r',encoding='utf-8') as f:
    d=json.load(f)
print(len(d['blocks1']), len(d['blocks2']), len(d['blocks3']))
print(d['blocks1'][0]['key'], d['blocks1'][-1]['key'])
print(d['blocks2'][0]['key'], d['blocks2'][-1]['key'])
print(d['blocks3'][0]['key'], d['blocks3'][-1]['key'])

