# SPCX — SpaceX 株価アプリ

SpaceX（2026/6/12 Nasdaq上場・ティッカー **SPCX**）の株価を1画面で見るスマホ向けアプリ。
目的＝「値動きを知る」「買うべきか判断する材料を得る」。

## 構成（Vercel + サーバーレス関数でキーを隠す）
```
ブラウザ → /api/spcx（Vercel関数）→ Twelve Data API
                    ↑ ここでだけ環境変数のキーを使用
```
- `index.html` … フロント（キー無し。/api/spcx を叩くだけ）
- `api/spcx.js` … Vercelサーバーレス関数。`process.env.TWELVE_DATA_KEY` を使用。
- データ源：**Twelve Data**（無料800回/日・日足履歴が取れる）。
  - Finnhub無料枠は履歴(candle)が403で取れないため不採用。
- **キーはVercelの環境変数だけに置く** → コードにもブラウザにも出ない（デプロイしても F12 で見えない）。

## 機能
- [x] 価格 + 前日比（緑▲/赤▼・％）
- [x] 上場来の日足ラインチャート（SVG）
- [x] 判断材料：始値 / 高値 / 安値 / 出来高
- [x] 更新は「開いた時 + 手動ボタン + 久々(2分超)のタブ復帰」のみ（自動ポーリング無し＝API節約）
- [x] PWA対応（manifest.json + icon.svg）→ ホーム画面に追加でアプリ風起動
- [x] 無料枠の安全性：Twelve Data/Vercel ともクレカ未登録＝請求来ない（超過は429/一時停止のみ）
- [x] エラー処理（キー未設定 / 上流エラー / 通信失敗）
- [x] スマホ最適化・ダーク・星背景・免責表示

## デプロイ手順
1. https://twelvedata.com で無料登録 → APIキー取得
2. このフォルダを GitHub に push（キーは入っていない）
3. Vercel で Import → **Environment Variables** に `TWELVE_DATA_KEY = 取得したキー` を追加
4. Deploy
5. ローカル確認は `npm i -g vercel` → `vercel dev`（環境変数は `.env.local` に `TWELVE_DATA_KEY=...`）

## セキュリティの学び（この回の主題）
- 静的フロントに直書きしたキーはブラウザから丸見え → 漏れたら**必ず再発行**。
- `.gitignore` はGitHubのコードを隠すだけ。**デプロイ先までは隠せない**。
- 本当に隠すには**サーバー(関数)経由で環境変数**にする。← 今回これを採用。

## 未確認 / TODO
- [ ] Twelve Data無料枠で **SPCX** が取れるか実デプロイで検証。
- [ ] （任意）期間切替・52週高安（上場来浅いので将来）・出来高バー。
