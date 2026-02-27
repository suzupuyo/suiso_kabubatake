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
# 作品名入れる↓　例： PROJECT_NAME = "sampleAAA"
PROJECT_NAME = "Stella-Board_V1_summer"

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
    # 変数定義：page_title (ファイル名から拡張子を取る)
    page_title = os.path.splitext(filename)[0]
    # 変数定義：output_filename
    output_filename = filename.replace('.txt', '.html')

    with open(os.path.join(INPUT_DIR, filename), 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 変数定義：full_html (本文を生成)
    html_body = [convert_line(line) for line in lines]
    full_html = '\n'.join(html_body)

    # 書き出し (11ty用のFront Matterを付与)
    with open(os.path.join(OUTPUT_DIR, output_filename), 'w', encoding='utf-8') as f:
        f.write("---\n")
        f.write("layout: layouts/novel-page.njk\n")
        f.write(f"title: \"{page_title}\"\n")
        # 作品ごとのタグ
        f.write(f"tags: {PROJECT_NAME}\n") 
        f.write(f"pageCSS: \"novel-detail.css\"\n")
        # もし「あらすじ」や「話数」をPython側で持っているなら、ここに追加できます
        # f.write(f"episode_number: {ep_num}\n") 
        f.write("---\n\n")
        f.write(full_html)
    
    index_data.append({"title": page_title, "url": f"/suiso_kabubatake/novel/{PROJECT_NAME}/{output_filename.replace('.html', '/')}"})
    print(f"変換完了: {page_title}")

# --- 4. 目次ファイル（src/index.html）の生成 ---
index_items = ""
for item in index_data:
    # CSSと紐付け
    index_items += (
        f'<li class="episode-item">\n'
        f'  <a href="{item["url"]}" class="episode-link">\n'
        f'    <span class="episode-title">{item["title"]}</span>\n'
        f'  </a>\n'
        f'</li>\n'
    )


# 作品フォルダの中に index.html を作る
with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
    f.write("---\n")
    f.write("layout: layouts/novel-eplist.njk\n")
    f.write(f'title: {PROJECT_NAME} 各話リスト\n')
    f.write(f"pageCSS: \"novel-list.css\"\n")
    f.write("---\n\n")
    f.write(f'<ul class="episode-list">\n{index_items}</ul>')

print("\n11ty用ファイルの生成がすべて完了しました！")