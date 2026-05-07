# Admin Setup Guide

Shopify 管理画面（admin）でのみ完結する設定をまとめたガイド。テーマ側コードでは扱えない／扱わない部分です。

## 1. 商品にサイズ（ホールサイズ）バリアントを追加する

Phase 3b の `tab-size-guide` で表示している「3号〜7号」の目安と整合させるための設定。

### 手順

1. Shopify admin → **商品管理 / Products**
2. 対象商品（例：`strawberry-shortcake`）を開く
3. **バリエーション / Variants** セクションで「**オプションを追加 / Add an option**」
4. 以下のオプションを設定：

   | 項目 | 値 |
   |---|---|
   | オプション名 / Option name | `サイズ` |
   | オプション値 / Option values | `3号`, `4号`, `5号`, `6号`（カンマ区切りで入力） |

5. 各バリアントごとに価格・在庫を設定

### 推奨価格設定（Sweet Atelier ベース）

| サイズ | 直径 | 目安人数 | 推奨価格（税込）|
|---|---|---|---|
| 3号 | 9cm | 2〜3名 | ¥3,800 |
| 4号 | 12cm | 3〜4名 | ¥4,800 |
| 5号 | 15cm | 5〜6名 | ¥5,800 |
| 6号 | 18cm | 7〜8名 | ¥6,800 |

> 7号・8号は記念日商品（アニバーサリーコレクション）にのみ用意するのが運用上シンプル。

### 注意事項

- **在庫管理を有効にしている場合**：各バリアントごとに在庫数を設定（手作りケーキは「在庫を追跡しない / Don't track quantity」推奨）
- **重さ / Weight**：冷凍便の送料計算に影響するため正確に入力
- **SKU**：在庫管理する場合のみ（例：`SA-STRAWBERRY-04` = Sweet Atelier / イチゴ / 4号）
- **商品画像とバリアントの関連付け**：サイズ違いで写真が同じなら未関連でOK

### バリアントが追加できない商品

- ロールケーキ（`matcha-roll`）
- 焼き菓子ギフト（`baked-goods-gift`）
- カットケーキ・季節限定の単品商品

これらは `tab-size-guide` の補足文「※ ロールケーキ・焼き菓子・カットケーキ等は形状が異なるため『商品仕様』をご確認ください」で案内されます。

---

## 2. variant_picker の表示制御

テーマ側 (`templates/product.json`) で：

```json
"variant-picker": {
  "type": "variant_picker",
  "settings": {
    "picker_type": "button",  // "dropdown" or "button"
    "swatch_shape": "circle"
  }
}
```

- `picker_type: "button"` → サイズ選択は「3号 / 4号 / 5号 / 6号」のボタン横並び
- `picker_type: "dropdown"` → セレクトボックス
- ホールサイズはボタン推奨（タップ領域大きく、選択肢可視性高い）

main の `settings.hide_variants: true` でデフォルト Variant（バリアントなし商品）の picker を自動非表示にする挙動はそのまま。

---

## 3. コレクションへの商品追加

Phase 1 で作成済みのコレクション（signature / seasonal / anniversary / gifts / baked-goods）に新商品を追加する場合：

1. 商品ページ → **商品の整理 / Organization** → **コレクション / Collections** に追加
2. コレクションページで並び順を調整（手動 / アルファベット / 価格 / 新着等）
3. 公開状態 / Publication を **オンラインストア / Online Store** で公開に

---

## 4. お届け日設定（Phase 3d で実装予定）

Phase 3d ではテーマ側で line item property としてお届け日入力 UI を実装予定。それと連動する admin 側設定は別途追記。

---

## 更新ルール

- 新しい admin タスクが発生したら**末尾**に追加（番号は連番）
- 各セクションに「**手順 / 注意事項**」を必ず書く
- 推奨値はあくまで Sweet Atelier 想定。本番運用時は店舗運営に合わせて調整
