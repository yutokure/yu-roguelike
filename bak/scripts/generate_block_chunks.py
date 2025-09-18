import json, os, math
# Missing counts based on existing file
missing = {
  '1st': 100-23,  # 77
  '2nd': 100-23,  # 77
  '3rd': 100-24,  # 76
}
start_key_index = {
  '1st': 23+1,  # new start at 24 -> b1024
  '2nd': 23+1,  # b2024
  '3rd': 24+1,  # b3025
}
# Name pools from prior proposal (A..E, F..J, K..O)
names_1st_A = [
"こもれびの径","翠雨Meadow","朧の里","ひなたの丘","ブリーズ渓谷","朝霧ハイランド","風花の岬","みずいろ野","Mossの苔庭","そよ風パセオ","青葉テラス","やまなみロード","フォレスト小径","しずくの森","霞む谷戸","Verdant原","さざなみ平原","鎌倉Green","奈良の野辺","上野の風景"
]
names_1st_B = [
"ネオン薄光","朽都ルインズ","錆色アベニュー","すきまの横丁","グレイ灰街","雨宿りアーケード","廃線メモリー","ナイトTokyo","新宿Backstreet","渋谷の残響","ほこりのビル群","Rustドック","煙る湾岸","チルな雑居","失われた広場","さみだれ交差点","Ruinの屋上","下北沢Alley","沈む工場港","港区の影"
]
names_1st_C = [
"星明りプラットフォーム","天穹ドーム","ほしなみ回廊","セレスティア京","夜風オービタ","Eclipseの庭","銀河バルコニー","しじまの宙","Nebula小町","蒼星テラス","オーロラ橋","つきかげ広場","Stardust路","大気ステップ","ほのぼの星屑","Gravity坂","宙港うらら","ひかりアトリウム","ミルキー峡","時雨Constellation"
]
names_1st_D = [
"水鏡ラグーン","うすもや水路","霜夜バレー","アイスの洞","さざ波ガーデン","氷雨テラス","ミスト渓谷","雪白プロムナード","こおりの巣","フロスト街","凍土ひだまり","しぶきの汀","Glacial横町","露光の池","みぞれ街道","霧笛の埠頭","ひょうの路地","クレバス京都","水泡パサージュ","ホワイトアウト里"
]
names_1st_E = [
"灰燼キャニオン","ほのお坑道","ブラスト峠","砂塵Kyoto","かげろう平原","Ember広間","焦土アーケード","ひだまり熔岩窟","マグマの縁","砂丘のさと","スコリア街道","くらがり炉心","赤熱テラス","さびた採掘場","フレア庭先","ほてり谷戸","Cinder回廊","焔のたまり","Dune岬","黄昏Ore港"
]

names_2nd_F = [
"慟哭の祠","さびしさの路","怒りの砦","憂鬱カタコンベ","悲嘆の地下室","ときめきの小径","狂喜の広間","哀歌の回廊","Lonely塔","Melancholy坂","儚いネクロポリス","呪縛の蔵","やすらぎの縁","ざわめく霊園","祈りのクレプス","しじまの墓域","Furyの洞","Calmの庭","怨念アトリウム","希望のランタン街"
]
names_2nd_G = [
"鉄屑ヤード","スプロケット通り","きしむ工廠","Rustベイ","歯車アベニュー","油膜の床","錆鉄プラットホーム","ギアの祠","ボルトの迷路","蒸気の小路","クランク横丁","溶接アーケード","ワイヤー橋","こてさび通路","スモッグファクトリ","マシナリ京都","Sparkの坑","ピストン広場","鋼の肺","ガス灯の棟"
]
names_2nd_H = [
"風鳴りデューン","ささやきの砂原","音叉の谷","シロッコ坂","Mirageの浜","すなじの街路","旋風パサージュ","わずかな足跡群","笛吹く峡","うたかたのオアシス","ハマダーン路","Dustの双丘","からっ風の岡","こだまの盆地","ドラムサンド","カスバ小径","奈良Sirocco","風紋ギャラリー","さらさら峡谷","Whisper砂丘"
]
names_2nd_I = [
"蔦絡む巣","けものみち","朽ち葉ガーデン","毒霧の沼","クローの洞","みどりの巣穴","猛獣の檻庭","かげる樹海","Venom谷","さびし森","ひそやかな巣窟","スパイク窪地","暗獣の巣","霞むバイオーム","ポイズンの泉","熊笹の径","狼煙の丘","Ivyの回廊","かげろう林","咆哮の森都"
]
names_2nd_J = [
"海鳴り埠頭","さみだれ港","潮騒のターミナル","塩の地下湾","Abyssの沖","しぶきの甲板","船幽霊ドック","うねりの礁","錨の広間","マリーナ横丁","海霧の街区","ディープの海溝","波間アトリウム","さざ波の弓浜","ノルド湾岸","EnoshimaCove","湘南ブルー","凪の水路","Tideの階","潜水士の通り"
]

names_3rd_K = [
"王都アーケイディア","いにしえの柱廊","レリクス石庭","祭壇の間","聖塔の回廊","奈良神苑","祠宮の庭","Temple小径","礎のドーム","祈祷のテラス","古代のオベリスク","きよき大路","アーカイブの庫","朱雀門プラザ","Ruinsの中庭","伽藍の回向","石畳プロムナード","正殿の階","古城の翼廊","聖都Galleria"
]
names_3rd_L = [
"雪灯の野","白氷の窪地","こごえる街路","オーロラの丘","霜星の峡","Frost京","氷霞の路","ミルク色の平原","吹雪の回廊","しずかな氷穴","北極光テラス","アイシクルの庭","霧氷ハーバー","セイバン雪脈","Gelidの湾","ツンドラ横町","寒月の辻","ふぶきの峰","しらゆきの里","Aurora橋上"
]
names_3rd_M = [
"まぼろしの街","夢見のプロムナード","フェイブル回廊","フィクションの庭","ねむり雲","幻想パサージュ","Illusion丘","白昼夢テラス","うつつの割れ目","虚実の塔","Dreamの階","ふわりの小町","影絵の館","さざめく世界端","きらめく泡沫","うつろいの路","異邦アーケード","イマジナリ京都","Mirageの街角","まどろみの凹室"
]
names_3rd_N = [
"地下の鼓動","きのこカタコンベ","胞子の回廊","マイセリア庭","脈打つ洞","ひそみの坑","Rootの迷路","暗渠の川辺","朽ち縄の井戸","菌糸の広間","ツタの横穴","じわりの堆","コロニーの隙","Sporeの街","地下街アンダー","ざらつく床","静脈の通路","しみる礫地","ひだまりの地底","Grotto奥座"
]
names_3rd_O = [
"彩りの通り","浅草バザール","きらきら広場","フェスタ横町","ローズの路","翠のアトリウム","くちなしの庭","仙台Amberテラス","しゃぼんの街道","ほの香の坂","紅の回廊","Carnival橋","すみれの丘","彩雲の路地","ほのぼの市場","神戸マンダリン港","もえぎの小径","ハニーの巷","うたげの階","Chromatic中庭"
]

# Theme presets: each returns dict of fields given index i
from typing import Dict, Any

CHESTS = ['normal','more','less']

def preset_1st(theme: str, i: int) -> Dict[str, Any]:
    if theme=='A':
        return {
            'level': 4 + (i%5),
            'size': 0,
            'depth': 0 if i%3 else 1,
            'chest': 'more' if i%4==0 else 'normal',
            'type': 'field',
            'bossFloors': [10] if i%10==0 else []
        }
    if theme=='B':
        return {
            'level': (i%7) - 2,  # -2..+4
            'size': -1 if i%4==0 else 0,
            'depth': 0,
            'chest': 'less' if i%3==0 else 'normal',
            'type': 'rooms' if i%2 else 'narrow-maze',
            'bossFloors': []
        }
    if theme=='C':
        return {
            'level': 10 + (i%9),
            'size': 1 if i%3==0 else 0,
            'depth': 1,
            'chest': 'more' if i%2==0 else 'normal',
            'type': 'circle' if i%2==0 else 'wide-maze',
            'bossFloors': [10] if i%5==0 else []
        }
    if theme=='D':
        return {
            'level': 6 + (i%5),
            'size': 0,
            'depth': 1 if i%2 else 2 if i%7==0 else 0,
            'chest': 'normal',
            'type': 'cave',
            'bossFloors': []
        }
    if theme=='E':
        return {
            'level': 9 + (i%8),
            'size': 1 if i%3==0 else 0,
            'depth': 1 if i%4==0 else 0,
            'chest': 'less' if i%2 else 'normal',
            'type': 'snake' if i%5==0 else 'cave',
            'bossFloors': [5,10] if i%10==0 else []
        }
    raise ValueError('unknown theme')


def preset_2nd(theme: str, i: int) -> Dict[str, Any]:
    if theme=='F':
        return {
            'level': 1 + (i%6),
            'size': 0,
            'depth': 1,
            'chest': 'normal' if i%3 else 'more',
            'type': 'rooms',
            'bossFloors': [10] if i%10==0 else []
        }
    if theme=='G':
        return {
            'level': (i%5),
            'size': 1 if i%4==0 else 0,
            'depth': 0,
            'chest': 'less',
            'type': 'rooms' if i%2 else 'narrow-maze',
            'bossFloors': []
        }
    if theme=='H':
        return {
            'level': 3 + (i%5),
            'size': 0,
            'depth': 0,
            'chest': 'less' if i%3==0 else 'normal',
            'type': 'field' if i%2==0 else 'wide-maze',
            'bossFloors': []
        }
    if theme=='I':
        return {
            'level': 4 + (i%5),
            'size': 0,
            'depth': 1,
            'chest': 'normal',
            'type': 'cave',
            'bossFloors': [5] if i%10==5 else []
        }
    if theme=='J':
        return {
            'level': 6 + (i%6),
            'size': 0,
            'depth': 1,
            'chest': 'more' if i%2==0 else 'normal',
            'type': 'field' if i%3==0 else 'rooms',
            'bossFloors': [10] if i%10==0 else []
        }
    raise ValueError('unknown theme')


def preset_3rd(theme: str, i: int) -> Dict[str, Any]:
    if theme=='K':
        return {
            'level': 9 + (i%7),
            'size': 0,
            'depth': 1,
            'chest': 'more' if i%3==0 else 'normal',
            'type': 'circle-rooms' if i%2 else 'rooms',
            'bossFloors': [10] if i%5==0 else []
        }
    if theme=='L':
        return {
            'level': 8 + (i%5),
            'size': 0,
            'depth': 2,
            'chest': 'normal' if i%2 else 'less',
            'type': 'cave' if i%3 else 'wide-maze',
            'bossFloors': []
        }
    if theme=='M':
        return {
            'level': 7 + (i%5),
            'size': 1 if i%4==0 else 0,
            'depth': 2,
            'chest': 'more' if i%4==0 else 'normal',
            'type': 'narrow-maze' if i%2 else 'mixed',
            'bossFloors': [5,10,15] if i%10==0 else []
        }
    if theme=='N':
        return {
            'level': 6 + (i%5),
            'size': 0,
            'depth': 2,
            'chest': 'less' if i%2==0 else 'normal',
            'type': 'cave' if i%2 else 'rooms',
            'bossFloors': []
        }
    if theme=='O':
        return {
            'level': 5 + (i%5),
            'size': 1 if i%3==0 else 0,
            'depth': 1,
            'chest': 'more' if i%2==0 else 'normal',
            'type': 'rooms',
            'bossFloors': [10] if i%10==0 else []
        }
    raise ValueError('unknown theme')

# Build per-series plan: chunk themes and name lists
series_plan = {
  '1st': [
    ('A', names_1st_A, preset_1st),
    ('B', names_1st_B, preset_1st),
    ('C', names_1st_C, preset_1st),
    ('D', names_1st_D, preset_1st),
    ('E', names_1st_E, preset_1st),
  ],
  '2nd': [
    ('F', names_2nd_F, preset_2nd),
    ('G', names_2nd_G, preset_2nd),
    ('H', names_2nd_H, preset_2nd),
    ('I', names_2nd_I, preset_2nd),
    ('J', names_2nd_J, preset_2nd),
  ],
  '3rd': [
    ('K', names_3rd_K, preset_3rd),
    ('L', names_3rd_L, preset_3rd),
    ('M', names_3rd_M, preset_3rd),
    ('N', names_3rd_N, preset_3rd),
    ('O', names_3rd_O, preset_3rd),
  ],
}

# Generate chunks of new entries only, with final numbering starting after existing
for series in ['1st','2nd','3rd']:
    need = missing[series]
    start_idx = start_key_index[series]
    series_digit = {'1st':'1','2nd':'2','3rd':'3'}[series]
    outdir = f'data/blockchunks/{series}'
    os.makedirs(outdir, exist_ok=True)
    produced = 0
    chunk_no = 1
    name_cursor = 0
    for theme_code, name_list, preset_fn in series_plan[series]:
        if produced >= need:
            break
        # consume up to 20 from this theme or remaining need
        take = min(20, need - produced)
        # ensure enough names for take
        avail = name_list
        # If remaining names in this theme less than needed, take what we can
        # But our plan is to move theme-by-theme; for the final theme, we may take less than 20
        names_to_use = avail[:take]
        entries = []
        for i, nm in enumerate(names_to_use):
            seq = start_idx + produced + i
            key = f"b{series_digit}{seq:03d}"
            p = preset_fn(theme_code, i)
            entries.append({
                'key': key,
                'name': nm,
                'level': p['level'],
                'size': p['size'],
                'depth': p['depth'],
                'chest': p['chest'],
                'type': p['type'],
                'bossFloors': p['bossFloors'],
            })
        # write chunk file
        with open(os.path.join(outdir, f'chunk-{chunk_no:02d}.json'), 'w', encoding='utf-8') as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
        produced += take
        chunk_no += 1
    # Trim any extra chunk files if zero produced in last loop, no-op
    print(series, 'produced', produced, 'needed', need)
