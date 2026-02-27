import os
import re
import json

# --- 1. 設定の読み込み ---
if os.path.exists('faces.json'):
    with open('faces.json', 'r', encoding='utf-8') as f:
        face_list = json.load(f)
else:
    face_list = {}

# フォルダのパス設定
# フォルダ名になるタイトル入れる↓　例： PROJECT_NAME = "sampleAAA"
PROJECT_NAME = "Stella-Board_V1_summer"
MAIN_TITLE = "Stella Board V1.0 -summer-"
PREFIX = "steb_1s" # ★ 作品固有のプレフィックス（英数字）

INPUT_DIR = './novel_raw'
OUTPUT_DIR = f"./src/novel/{PROJECT_NAME}"  # 11tyのソースフォルダ内へ

# フォルダ生成
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

index_data = []

# --- 2. 変換ロジック ---
def convert_line(line):
    line = line.strip()
    if not line:
        # 空行は単純な改行として扱う（お好みで高さを調整可）
        return "<br>"
    
    match = re.match(r'^\[(.+?)/(\d+)\](.*)', line)
    if match:
        name, num, message = match.groups()
        img_url = face_list.get(name, {}).get(num, "")
        if img_url:
            return (
                f'<div class="chat-row">'
                f'<div class="icon-container"><img src="{img_url}" alt="{name}"></div>'
                f'<div class="chat-content">'
                f'<span class="name-label">{name}</span>'
                f'<div class="bubble">{message}</div>'
                f'</div>'
                f'</div>'
            )
        else:
            return f'<p><strong>{name}:</strong> {message}</p>'
    
    # 地の文：ツールAに合わせて、一応 <br> をつけておく
    return f'{line}<br>'

# --- 3. メイン処理（一括変換） ---
files = sorted([f for f in os.listdir(INPUT_DIR) if f.endswith('.txt')])

for filename in files:
    # URL用のベースID（001など）(ファイル名から拡張子を取る)
    raw_id = os.path.splitext(filename)[0]
    # ★ プレフィックスを付けた固有ID（stella-001 など）
    full_page_id = f"{PREFIX}-{raw_id}"
    # 変数定義：output_filename
    output_filename = f"{full_page_id}.html"

    with open(os.path.join(INPUT_DIR, filename), 'r', encoding='utf-8') as f:
        all_lines = f.readlines()

    if not all_lines:
        continue


    # ★ 1行目をタイトルとして取得し、本文からは取り除く
    # 例：テキストの1行目に「第一話 渚の出会い」と書いておく
    page_title = all_lines[0].strip()
    content_lines = all_lines[1:] # 2行目以降が本文

    # 変数定義：full_html (本文を生成)
    html_body = [convert_line(line) for line in content_lines]
    full_html = '\n'.join(html_body)

    # 書き出し (11ty用のFront Matterを付与)
    with open(os.path.join(OUTPUT_DIR, output_filename), 'w', encoding='utf-8') as f:
        f.write("---\n")
        f.write("layout: layouts/novel-page.njk\n")
        f.write(f'title: "{page_title}"\n')
        # 作品ごとのタグ
        f.write(f"tags: {PROJECT_NAME}\n") 
        f.write(f"pageCSS: \"novel-detail.css\"\n")
        # ★ URLもプレフィックス付きに（例: /novel/project/stella-001/）
        f.write(f'permalink: "/novel/{PROJECT_NAME}/{full_page_id}.html"\n')
        # もし「あらすじ」や「話数」をPython側で持っているなら、ここに追加できます
        # f.write(f"episode_number: {ep_num}\n") 
        f.write("---\n\n")
        f.write(full_html)
    
    index_data.append({
        "id": raw_id,
        "title": page_title, 
        "url": f"/novel/{PROJECT_NAME}/{full_page_id}.html"})
    print(f"変換完了: [{full_page_id}] {page_title}")

# --- 4. 目次ファイル（src/index.html）の生成 ---
index_items = ""
for item in index_data:
    # CSSと紐付け
    # ★ IDを表示に含める（例: stella-001: 第一話 渚の出会い）
    index_items += (
        f'<li class="episode-item">\n'
        f'  <a href="{item["url"]}" class="episode-link">\n'
        f'    <span class="episode-id">{item["id"]}</span>' # ID表示用
        f'    <span class="episode-title">{item["title"]}</span>\n'
        f'  </a>\n'
        f'</li>\n'
    )


# 作品フォルダの中に index.html を作る
with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
    f.write("---\n")
    f.write("layout: layouts/novel-eplist.njk\n")
    f.write(f'title: {MAIN_TITLE}\n')
    f.write(f"pageCSS: \"novel-list.css\"\n")
    f.write(f"permalink: '/novel/Stella-Board_V1_summer/index.html'\n")
    f.write("---\n\n")
    f.write(f'<ul class="episode-list">\n{index_items}</ul>')

print("\n11ty用ファイルの生成がすべて完了しました！")